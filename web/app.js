// CVForge web app: everything runs in the browser. The resume, options and
// photo are kept in localStorage only; nothing is sent to any server.
import { createForm } from "./form.js";
import { fitDocument } from "./lib/fit.mjs";
import { normalizeResume, validateResume } from "./lib/normalize.mjs";
import { mergeOptions } from "./lib/options.mjs";
import { renderDocument } from "./lib/render.mjs";
import { THEMES } from "./lib/themes/index.mjs";

const $ = (sel) => document.querySelector(sel);
const PAGE = { a4: { w: 794, h: 1123 }, letter: { w: 816, h: 1056 } };
const ACCENTS = ["#2563eb", "#4f46e5", "#7c3aed", "#db2777", "#a4161a", "#ea580c", "#a17f52", "#059669", "#0d9488", "#0f172a"];
const STORE = { resume: "cvforge.resume", options: "cvforge.options", photo: "cvforge.photo", welcome: "cvforge.welcomeDismissed", printHelp: "cvforge.printHelpSeen", stars: "cvforge.stars" };
const OPTION_KEYS = ["theme", "accent", "paper", "maxPages", "fit", "density", "photo", "dateFormat", "locale"];
const REPO = "bertini01/cv-builder";
const BLANK = () => ({ basics: { name: "", label: "", email: "", summary: "", location: {}, profiles: [] }, work: [], projects: [], education: [], skills: [], languages: [] });

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

function safeParse(text) {
   try {
      return text ? JSON.parse(text) : null;
   } catch {
      return null;
   }
}

let options = mergeOptions(safeParse(store.get(STORE.options)) ?? {});
let photo = store.get(STORE.photo);
let data = null;
let zoom = null;
let lastHeight = 0;
let lastFit = null;
let renderTimer;
let saveTimer;

const toast = (text, ms = 4500) => {
   const el = $("#toast");
   el.textContent = text;
   el.classList.add("show");
   clearTimeout(toast.t);
   toast.t = setTimeout(() => el.classList.remove("show"), ms);
};

const saveOptions = () => store.set(STORE.options, JSON.stringify(Object.fromEntries(OPTION_KEYS.map((k) => [k, options[k]]))));
const saveResume = () => {
   clearTimeout(saveTimer);
   saveTimer = setTimeout(() => store.set(STORE.resume, JSON.stringify(data, null, 2)), 300);
};

// ---- Form <-> JSON sync -------------------------------------------------------
const form = createForm($("#form"), {
   getData: () => data,
   onChange: () => {
      syncEditor();
      saveResume();
      scheduleRender();
   },
   basicsExtra: () => photoField(),
});

const syncEditor = () => {
   if (document.activeElement !== $("#editor")) $("#editor").value = JSON.stringify(data, null, 2);
};

const setData = (next, { rebuildForm = true } = {}) => {
   data = next;
   data.basics ??= {};
   syncEditor();
   saveResume();
   if (rebuildForm) form.render();
   render();
};

// ---- Photo (kept outside the JSON so the JSON stays readable) ------------------
const photoField = () => {
   const wrap = document.createElement("div");
   wrap.className = "photo-field";
   const preview = document.createElement("div");
   preview.className = "avatar";
   if (photo) preview.style.backgroundImage = `url("${photo}")`;
   else preview.textContent = "📷";
   const text = document.createElement("div");
   const title = document.createElement("b");
   title.textContent = "Photo";
   const small = document.createElement("small");
   small.textContent = photo ? (options.photo ? "Shown on themes that support it." : "Hidden. Turn it on in Design.") : "Optional. Many recruiters prefer none.";
   const actions = document.createElement("div");
   actions.className = "photo-actions";
   const upload = document.createElement("label");
   upload.className = "mini";
   upload.textContent = photo ? "Change" : "Upload";
   const input = document.createElement("input");
   input.type = "file";
   input.accept = "image/png,image/jpeg,image/webp";
   input.hidden = true;
   input.addEventListener("change", onPhoto);
   upload.append(input);
   actions.append(upload);
   if (photo) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "mini danger";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
         photo = null;
         store.set(STORE.photo, null);
         form.render();
         scheduleRender(0);
      });
      actions.append(remove);
   }
   text.append(title, small, actions);
   wrap.append(preview, text);
   return wrap;
};

const readFileAs = (file, method) =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader[method](file);
   });

async function onPhoto(e) {
   const file = e.target.files[0];
   if (!file) return;
   if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast("Use a PNG, JPEG or WebP photo.");
   if (file.size > 3e6) return toast("Please use a photo under 3 MB.");
   photo = await readFileAs(file, "readAsDataURL");
   store.set(STORE.photo, photo);
   update({ photo: true });
   form.render();
}

// ---- Rendering --------------------------------------------------------------
const lineColumn = (text, position) => {
   const before = text.slice(0, position);
   return { line: before.split("\n").length, column: position - before.lastIndexOf("\n") };
};

const showMessages = (errors, warnings) => {
   const items = [...errors.map((m) => ["error", m]), ...warnings.map((m) => ["warning", m])];
   $("#messages").replaceChildren(
      ...(items.length ? items : [["ok", "Looks good. Valid JSON Resume."]]).map(([kind, text]) => {
         const li = document.createElement("li");
         li.className = kind;
         li.textContent = text;
         return li;
      })
   );
};

const setStatus = (kind, text) => {
   const pill = $("#status");
   pill.className = `pill${kind ? ` ${kind}` : ""}`;
   pill.lastElementChild.textContent = text;
};

const render = () => {
   const { errors, warnings } = validateResume(data);
   const unnamed = errors.length === 1 && errors[0].startsWith("basics.name");
   showMessages(errors, warnings);
   if (errors.length && !unnamed) {
      setStatus("error", "Fix the errors in the JSON tab");
      $("#densityPill").hidden = true;
      return;
   }
   // A blank CV still previews, with a placeholder name, so the layout is visible while typing.
   const basics = { ...data.basics, name: data.basics.name?.trim() || "Your Name" };
   if (photo) basics.image = photo;
   const resume = normalizeResume({ ...data, basics }, options);
   render.resume = unnamed ? null : resume;
   render.unnamed = unnamed;
   setStatus("", "Rendering…");
   $("#preview").srcdoc = renderDocument(resume, options);
};

const scheduleRender = (delay = 250) => {
   clearTimeout(renderTimer);
   renderTimer = setTimeout(render, delay);
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
   lastHeight = doc.querySelector(".page").scrollHeight;
   if (render.unnamed) setStatus("warn", "Add your name to get started");
   else setStatus(lastFit.fits ? "" : "warn", lastFit.fits ? `Fits on ${lastFit.pages} page${lastFit.pages === 1 ? "" : "s"}` : `${lastFit.pages} pages · over the limit`);
   const pill = $("#densityPill");
   pill.hidden = !lastFit.adjusted;
   pill.textContent = `Auto-fit · density ${lastFit.density.toFixed(2)}`;
   layout();
});

const layout = () => {
   const page = PAGE[options.paper] || PAGE.a4;
   const height = Math.max(page.h, lastHeight || page.h);
   const canvas = $("#canvas");
   const style = getComputedStyle(canvas);
   const available = canvas.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
   const scale = zoom ?? Math.min(1.2, Math.max(0.3, available / page.w));
   const sheet = $("#sheet");
   sheet.style.width = `${page.w}px`;
   sheet.style.height = `${height}px`;
   sheet.style.transform = `scale(${scale})`;
   // Scaling doesn't change the layout box, so negative margins shrink it to the
   // visible size: the canvas then centres and scrolls by what you actually see.
   sheet.style.marginBottom = `${(scale - 1) * height}px`;
   sheet.style.marginRight = `${(scale - 1) * page.w}px`;
   sheet.style.marginLeft = `${Math.max(0, (available - page.w * scale) / 2)}px`;
   $("#zoomFit").textContent = `${Math.round(scale * 100)}%`;
};

// ---- Design controls ----------------------------------------------------------
const update = (patch) => {
   options = mergeOptions(options, patch);
   saveOptions();
   paintControls();
   scheduleRender(120);
};

const pressed = (el, on) => el.setAttribute("aria-pressed", String(on));

const buildThemeCards = () => {
   $("#themes").replaceChildren(
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
   const make = (accent) => {
      const b = document.createElement("button");
      b.className = `swatch${accent ? "" : " default"}`;
      b.dataset.accent = accent ?? "";
      b.title = accent ?? "Theme default";
      b.setAttribute("aria-label", accent ? `Accent ${accent}` : "Theme default accent");
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
   input.setAttribute("aria-label", "Custom accent colour");
   input.addEventListener("input", () => update({ accent: input.value }));
   custom.append(input);
   $("#swatches").replaceChildren(make(null), ...ACCENTS.map(make), custom);
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
document.querySelectorAll(".switch").forEach((s) =>
   s.addEventListener("click", () => {
      update({ [s.dataset.key]: !options[s.dataset.key] });
      if (s.dataset.key === "photo") form.render();
   })
);
$("#density").addEventListener("input", (e) => update({ density: Number(e.target.value) }));
$("#dateFormat").addEventListener("change", (e) => update({ dateFormat: e.target.value }));
$("#locale").addEventListener("change", (e) => update({ locale: e.target.value }));

// ---- Tabs ---------------------------------------------------------------------
const TABS = ["content", "design", "json"];
const selectTab = (name) => {
   for (const tab of TABS) {
      $(`#tab-${tab}`).setAttribute("aria-selected", String(tab === name));
      $(`#pane-${tab}`).hidden = tab !== name;
   }
   if (name === "json") $("#editor").value = JSON.stringify(data, null, 2);
};
for (const tab of TABS) $(`#tab-${tab}`).addEventListener("click", () => selectTab(tab));
$(".tabs").addEventListener("keydown", (e) => {
   if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
   const current = TABS.findIndex((t) => $(`#tab-${t}`).getAttribute("aria-selected") === "true");
   const next = TABS[(current + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
   selectTab(next);
   $(`#tab-${next}`).focus();
});

// ---- JSON editor ----------------------------------------------------------------
$("#editor").addEventListener("input", () => {
   clearTimeout(renderTimer);
   renderTimer = setTimeout(() => {
      const text = $("#editor").value;
      try {
         const parsed = JSON.parse(text);
         if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The resume must be a JSON object { … }");
         data = parsed;
         data.basics ??= {};
         saveResume();
         form.render();
         render();
      } catch (error) {
         const position = Number(error.message.match(/position (\d+)/)?.[1]);
         const where = Number.isFinite(position) ? (({ line, column }) => ` (line ${line}, column ${column})`)(lineColumn(text, position)) : "";
         showMessages([`Invalid JSON${where}: ${error.message.replace(/ in JSON.*$/, "")}`], []);
         setStatus("error", "Fix the errors in the JSON tab");
      }
   }, 350);
});
$("#editor").addEventListener("keydown", (e) => {
   if (e.key !== "Tab") return;
   e.preventDefault();
   e.target.setRangeText("  ", e.target.selectionStart, e.target.selectionEnd, "end");
   e.target.dispatchEvent(new Event("input"));
});
$("#formatJson").addEventListener("click", () => {
   const parsed = safeParse($("#editor").value);
   if (!parsed) return toast("Fix the JSON errors first.");
   $("#editor").value = JSON.stringify(parsed, null, 2);
});

// ---- Content actions --------------------------------------------------------------
$("#importFile").addEventListener("change", async (e) => {
   const file = e.target.files[0];
   e.target.value = "";
   if (!file) return;
   if (file.size > 2e6) return toast("That file is over 2 MB; a resume JSON should be much smaller.");
   const parsed = safeParse(await readFileAs(file, "readAsText"));
   if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return toast("That file isn't a valid resume JSON.");
   setData(parsed);
   toast(`Imported ${file.name}`);
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
   setData(json);
};
$("#loadExample").addEventListener("click", async () => {
   if (!confirm("Replace your current CV with the example?")) return;
   await loadExample();
   toast("Example loaded.");
});

const startFresh = () => {
   if (!confirm("Clear the form and start a blank CV? Download a JSON copy first if you want to keep this one.")) return;
   photo = null;
   store.set(STORE.photo, null);
   setData(BLANK());
   dismissWelcome();
   selectTab("content");
   $("#pane-content").scrollTop = 0;
   $('#form [data-path="basics.name"]')?.focus();
   toast("Blank CV ready. Start with your name.");
};
$("#startFresh").addEventListener("click", startFresh);
$("#startFresh2").addEventListener("click", startFresh);

const dismissWelcome = () => {
   $("#welcome").hidden = true;
   store.set(STORE.welcome, "1");
};
$("#dismissWelcome").addEventListener("click", dismissWelcome);

const download = (name, content, type) => {
   const url = URL.createObjectURL(new Blob([content], { type }));
   const a = Object.assign(document.createElement("a"), { href: url, download: name });
   document.body.append(a);
   a.click();
   a.remove();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const fileBase = () =>
   (data?.basics?.name || "cv").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "cv";

$("#downloadJson").addEventListener("click", () => download(`${fileBase()}-resume.json`, JSON.stringify(data, null, 2), "application/json"));
$("#downloadHtml").addEventListener("click", () => {
   if (!render.resume) return toast(render.unnamed ? "Add your name first." : "Fix the errors first.");
   const html = renderDocument(render.resume, { ...options, density: lastFit?.density ?? options.density });
   download(`${fileBase()}-CV.html`, html, "text/html");
});

// ---- PDF export via the browser's print engine -------------------------------
const printCv = () => {
   $("#preview").contentWindow.focus();
   $("#preview").contentWindow.print();
};
$("#exportPdf").addEventListener("click", () => {
   if (!render.resume) return toast(render.unnamed ? "Add your name first." : "Fix the errors first.");
   if (store.get(STORE.printHelp)) return printCv();
   $("#printHelp").showModal();
});
$("#printHelp").addEventListener("close", () => {
   if ($("#printHelp").returnValue !== "print") return;
   store.set(STORE.printHelp, "1");
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

// ---- GitHub stars (public, unauthenticated API; cached for a day) ---------------
const showStars = (count) => {
   if (!Number.isInteger(count) || count < 1) return;
   const el = $("#starCount");
   el.textContent = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
   el.hidden = false;
};
const loadStars = async () => {
   const cached = safeParse(store.get(STORE.stars));
   if (cached && Date.now() - cached.at < 864e5) return showStars(cached.count);
   try {
      const response = await fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: "application/vnd.github+json" }, credentials: "omit", referrerPolicy: "no-referrer" });
      if (!response.ok) return;
      const count = (await response.json()).stargazers_count;
      store.set(STORE.stars, JSON.stringify({ count, at: Date.now() }));
      showStars(count);
   } catch {
      // Offline or rate-limited: the Star button still works without a count.
   }
};

// ---- Start ------------------------------------------------------------------
buildThemeCards();
buildSwatches();
paintControls();
if (store.get(STORE.welcome)) $("#welcome").hidden = true;
const saved = safeParse(store.get(STORE.resume));
if (saved && typeof saved === "object" && !Array.isArray(saved)) setData(saved);
else loadExample().catch(() => setData(BLANK()));
loadStars();
