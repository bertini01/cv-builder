// CVForge web app: everything runs in the browser. The resume, options and
// photo are kept in localStorage only; nothing is sent to any server.
import { fitDocument } from "./lib/fit.mjs";
import { normalizeResume, validateResume } from "./lib/normalize.mjs";
import { mergeOptions } from "./lib/options.mjs";
import { renderDocument } from "./lib/render.mjs";
import { THEMES } from "./lib/themes/index.mjs";

const $ = (sel) => document.querySelector(sel);
const PAGE = { a4: { w: 794, h: 1123 }, letter: { w: 816, h: 1056 } };
const ACCENTS = ["#2563eb", "#4f46e5", "#7c3aed", "#db2777", "#a4161a", "#ea580c", "#a17f52", "#059669", "#0d9488", "#0f172a"];
const STORE = { resume: "cvforge.resume", options: "cvforge.options", photo: "cvforge.photo" };
const OPTION_KEYS = ["theme", "accent", "paper", "maxPages", "fit", "density", "photo", "dateFormat", "locale"];

const store = {
   get(key) {
      try {
         return localStorage.getItem(key);
      } catch {
         return null;
      }
   },
   set(key, value) {
      try {
         if (value === null) localStorage.removeItem(key);
         else localStorage.setItem(key, value);
      } catch {
         // Storage can be full or blocked; the app keeps working without it.
      }
   },
};

let options = mergeOptions(safeParse(store.get(STORE.options)) ?? {});
let photo = store.get(STORE.photo);
let zoom = null;
let lastHeight = 0;
let lastFit = null;
let renderTimer;

function safeParse(text) {
   try {
      return text ? JSON.parse(text) : null;
   } catch {
      return null;
   }
}

const toast = (text, ms = 4500) => {
   const el = $("#toast");
   el.textContent = text;
   el.classList.add("show");
   clearTimeout(toast.t);
   toast.t = setTimeout(() => el.classList.remove("show"), ms);
};

const saveOptions = () =>
   store.set(STORE.options, JSON.stringify(Object.fromEntries(OPTION_KEYS.map((k) => [k, options[k]]))));

// ---- Resume parsing with friendly errors -----------------------------------
const lineColumn = (text, position) => {
   const before = text.slice(0, position);
   return { line: before.split("\n").length, column: position - before.lastIndexOf("\n") };
};

const parseResume = () => {
   const text = $("#editor").value;
   let data;
   try {
      data = JSON.parse(text);
   } catch (error) {
      const position = Number(error.message.match(/position (\d+)/)?.[1]);
      const where = Number.isFinite(position) ? (({ line, column }) => ` (line ${line}, column ${column})`)(lineColumn(text, position)) : "";
      return { errors: [`Invalid JSON${where}: ${error.message.replace(/ in JSON.*$/, "")}`], warnings: [] };
   }
   const { errors, warnings } = validateResume(data);
   if (photo && data?.basics) data = { ...data, basics: { ...data.basics, image: photo } };
   return { data, errors, warnings };
};

const showMessages = (errors, warnings) => {
   const items = [
      ...errors.map((m) => ["error", m]),
      ...warnings.map((m) => ["warning", m]),
   ];
   const list = $("#messages");
   list.replaceChildren(
      ...(items.length ? items : [["ok", "Looks good. Valid JSON Resume."]]).map(([kind, text]) => {
         const li = document.createElement("li");
         li.className = kind;
         li.textContent = text;
         return li;
      })
   );
};

// ---- Rendering --------------------------------------------------------------
const render = () => {
   const { data, errors, warnings } = parseResume();
   showMessages(errors, warnings);
   store.set(STORE.resume, $("#editor").value);
   if (errors.length) {
      setStatus("error", "Fix the errors in Content");
      $("#densityPill").hidden = true;
      return;
   }
   const resume = normalizeResume(data, options);
   setStatus("", "Rendering…");
   $("#preview").srcdoc = renderDocument(resume, options);
   render.resume = resume;
};

const scheduleRender = (delay = 250) => {
   clearTimeout(renderTimer);
   renderTimer = setTimeout(render, delay);
};

const setStatus = (kind, text) => {
   const pill = $("#status");
   pill.className = `pill${kind ? ` ${kind}` : ""}`;
   pill.lastElementChild.textContent = text;
};

$("#preview").addEventListener("load", async () => {
   const doc = $("#preview").contentDocument;
   if (!doc?.querySelector(".page")) return;
   doc.body.style.cssText = "background:#fff;padding:0";
   doc.querySelector(".page").style.boxShadow = "none";
   try {
      await Promise.race([doc.fonts.ready, new Promise((r) => setTimeout(r, 4000))]);
   } catch {
      // Fonts failing to load just means fallback fonts.
   }
   lastFit = fitDocument(doc, options);
   const page = doc.querySelector(".page");
   lastHeight = page.scrollHeight;
   setStatus(lastFit.fits ? "" : "warn", lastFit.fits ? `Fits on ${lastFit.pages} page${lastFit.pages === 1 ? "" : "s"}` : `${lastFit.pages} pages · over the limit`);
   const pill = $("#densityPill");
   pill.hidden = !lastFit.adjusted;
   pill.textContent = `Auto-fit · density ${lastFit.density.toFixed(2)}`;
   layout();
});

const layout = () => {
   const page = PAGE[options.paper] || PAGE.a4;
   const height = Math.max(page.h, lastHeight || page.h);
   const available = $("#canvas").clientWidth - 48;
   const scale = zoom ?? Math.min(1.2, Math.max(0.3, available / page.w));
   const sheet = $("#sheet");
   sheet.style.width = `${page.w}px`;
   sheet.style.height = `${height}px`;
   sheet.style.transform = `scale(${scale})`;
   sheet.style.marginBottom = `${(scale - 1) * height}px`;
   $("#zoomFit").textContent = `${Math.round(scale * 100)}%`;
};

// ---- Controls ---------------------------------------------------------------
const update = (patch) => {
   options = mergeOptions(options, patch);
   saveOptions();
   paintControls();
   scheduleRender(120);
};

const pressed = (el, on) => el.setAttribute("aria-pressed", String(on));

const buildThemeCards = () => {
   const container = $("#themes");
   container.replaceChildren(
      ...THEMES.map((theme) => {
         const button = document.createElement("button");
         button.className = "theme";
         button.dataset.theme = theme.id;
         const img = document.createElement("img");
         img.src = `/previews/${theme.id}.png`;
         img.alt = "";
         img.loading = "lazy";
         const name = document.createElement("b");
         name.textContent = theme.name;
         const description = document.createElement("small");
         description.textContent = theme.description;
         button.append(img, name, description);
         button.addEventListener("click", () => update({ theme: theme.id }));
         return button;
      })
   );
};

const buildSwatches = () => {
   const container = $("#swatches");
   const make = (accent) => {
      const b = document.createElement("button");
      b.className = `swatch${accent ? "" : " default"}`;
      b.dataset.accent = accent ?? "";
      b.title = accent ?? "Theme default";
      if (accent) b.style.setProperty("--c", accent);
      b.addEventListener("click", () => update({ accent }));
      return b;
   };
   const custom = document.createElement("label");
   custom.className = "custom";
   custom.title = "Custom colour";
   const input = document.createElement("input");
   input.type = "color";
   input.id = "customAccent";
   input.addEventListener("input", () => update({ accent: input.value }));
   custom.append(input);
   container.replaceChildren(make(null), ...ACCENTS.map(make), custom);
};

const paintControls = () => {
   document.querySelectorAll(".theme").forEach((b) => pressed(b, b.dataset.theme === options.theme));
   document.querySelectorAll(".swatch").forEach((b) => pressed(b, (b.dataset.accent || null) === (options.accent || null)));
   $("#customAccent").value = options.accent || "#2563eb";
   document.querySelectorAll(".segmented").forEach((group) =>
      group.querySelectorAll("button").forEach((b) => pressed(b, String(options[group.dataset.key]) === b.dataset.value))
   );
   document.querySelectorAll(".switch").forEach((s) => s.setAttribute("aria-checked", String(Boolean(options[s.dataset.key]))));
   $("#density").value = options.density;
   $("#densityOut").textContent = Number(options.density).toFixed(2);
   $("#dateFormat").value = options.dateFormat;
   $("#locale").value = options.locale;
   $("#photoStatus").textContent = photo ? "Photo added ✓" : "No photo uploaded";
   $("#removePhoto").hidden = !photo;
   layout();
};

document.querySelectorAll(".segmented").forEach((group) =>
   group.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const key = group.dataset.key;
      update({ [key]: key === "maxPages" ? Number(b.dataset.value) : b.dataset.value });
   })
);
document.querySelectorAll(".switch").forEach((s) => s.addEventListener("click", () => update({ [s.dataset.key]: !options[s.dataset.key] })));
$("#density").addEventListener("input", (e) => update({ density: Number(e.target.value) }));
$("#dateFormat").addEventListener("change", (e) => update({ dateFormat: e.target.value }));
$("#locale").addEventListener("change", (e) => update({ locale: e.target.value }));

// Tabs
const selectTab = (name) => {
   for (const tab of ["design", "content"]) {
      $(`#tab-${tab}`).setAttribute("aria-selected", String(tab === name));
      $(`#pane-${tab}`).hidden = tab !== name;
   }
};
$("#tab-design").addEventListener("click", () => selectTab("design"));
$("#tab-content").addEventListener("click", () => selectTab("content"));

// ---- Content actions --------------------------------------------------------
$("#editor").addEventListener("input", () => scheduleRender());
$("#editor").addEventListener("keydown", (e) => {
   if (e.key !== "Tab") return;
   e.preventDefault();
   const el = e.target;
   const { selectionStart: start, selectionEnd: end } = el;
   el.setRangeText("  ", start, end, "end");
   scheduleRender();
});

const readFileAs = (file, method) =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader[method](file);
   });

$("#importFile").addEventListener("change", async (e) => {
   const file = e.target.files[0];
   if (!file) return;
   if (file.size > 2e6) return toast("That file is over 2 MB; a resume JSON should be much smaller.");
   $("#editor").value = await readFileAs(file, "readAsText");
   e.target.value = "";
   render();
   toast(`Imported ${file.name}`);
});

$("#photoFile").addEventListener("change", async (e) => {
   const file = e.target.files[0];
   if (!file) return;
   if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast("Use a PNG, JPEG or WebP photo.");
   if (file.size > 3e6) return toast("Please use a photo under 3 MB.");
   photo = await readFileAs(file, "readAsDataURL");
   store.set(STORE.photo, photo);
   e.target.value = "";
   update({ photo: true });
});
$("#removePhoto").addEventListener("click", () => {
   photo = null;
   store.set(STORE.photo, null);
   paintControls();
   scheduleRender(0);
});

const loadExample = async () => {
   const [json, avatar] = await Promise.all([
      fetch("/examples/resume.json").then((r) => r.json()),
      fetch("/examples/avatar.svg").then((r) => r.text()),
   ]);
   // The example's avatar becomes the uploaded photo, keeping the JSON readable.
   delete json.basics.image;
   photo = `data:image/svg+xml;base64,${btoa(avatar)}`;
   store.set(STORE.photo, photo);
   $("#editor").value = JSON.stringify(json, null, 2);
   paintControls();
   render();
};
$("#loadExample").addEventListener("click", async () => {
   if ($("#editor").value.trim() && !confirm("Replace your current content with the example?")) return;
   await loadExample();
   toast("Example loaded. Make it yours in the Content tab.");
});

$("#formatJson").addEventListener("click", () => {
   const parsed = safeParse($("#editor").value);
   if (!parsed) return toast("Fix the JSON errors first.");
   $("#editor").value = JSON.stringify(parsed, null, 2);
   scheduleRender(0);
});

const download = (name, content, type) => {
   const url = URL.createObjectURL(new Blob([content], { type }));
   const a = Object.assign(document.createElement("a"), { href: url, download: name });
   document.body.append(a);
   a.click();
   a.remove();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const fileBase = () =>
   (render.resume?.basics.name || "cv").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "cv";

$("#downloadJson").addEventListener("click", () => download(`${fileBase()}-resume.json`, $("#editor").value, "application/json"));
$("#downloadHtml").addEventListener("click", () => {
   if (!render.resume) return toast("Fix the errors first.");
   const html = renderDocument(render.resume, { ...options, density: lastFit?.density ?? options.density });
   download(`${fileBase()}-CV.html`, html, "text/html");
});

// ---- PDF export via the browser's print engine -------------------------------
const printCv = () => {
   if (!render.resume) return toast("Fix the errors first.");
   $("#preview").contentWindow.focus();
   $("#preview").contentWindow.print();
};
$("#exportPdf").addEventListener("click", () => {
   if (store.get("cvforge.printHelpSeen")) return printCv();
   $("#printHelp").showModal();
});
$("#printHelp").addEventListener("close", () => {
   if ($("#printHelp").returnValue !== "print") return;
   store.set("cvforge.printHelpSeen", "1");
   printCv();
});
window.addEventListener("keydown", (e) => {
   if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      $("#exportPdf").click();
   }
});

// ---- Zoom ---------------------------------------------------------------------
const currentScale = () => parseFloat($("#zoomFit").textContent) / 100;
$("#zoomIn").addEventListener("click", () => {
   zoom = Math.min(2, (zoom ?? currentScale()) + 0.1);
   layout();
});
$("#zoomOut").addEventListener("click", () => {
   zoom = Math.max(0.3, (zoom ?? currentScale()) - 0.1);
   layout();
});
$("#zoomFit").addEventListener("click", () => {
   zoom = null;
   layout();
});
window.addEventListener("resize", layout);

// ---- Start ------------------------------------------------------------------
buildThemeCards();
buildSwatches();
paintControls();
const saved = store.get(STORE.resume);
if (saved) {
   $("#editor").value = saved;
   render();
} else {
   loadExample().catch(() => toast("Couldn't load the example. Paste your resume JSON in Content."));
}
