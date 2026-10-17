// Schema-driven form for JSON Resume data, so nobody needs to write JSON.
// Built with DOM APIs only (no innerHTML), so typed text is never parsed as HTML.

const NETWORKS = ["LinkedIn", "GitHub", "X", "GitLab", "Dribbble", "Behance", "Medium", "Stack Overflow", "YouTube", "Website"];
const FLUENCY = ["Native", "Fluent", "Professional", "Intermediate", "Basic"];

const BASICS = [
   { path: "name", label: "Full name", placeholder: "Alex Morgan", required: true },
   { path: "label", label: "Job title", placeholder: "Senior Full-Stack Engineer" },
   { cols: [{ path: "email", label: "Email", type: "email", placeholder: "you@example.com" }, { path: "phone", label: "Phone", type: "tel", placeholder: "+1 555 123 4567", optional: true }] },
   { cols: [{ path: "location.city", label: "City", placeholder: "Lisbon", optional: true }, { path: "location.countryCode", label: "Country", placeholder: "Portugal", optional: true }] },
   { path: "url", label: "Website or portfolio", type: "url", placeholder: "https://…", optional: true },
   { path: "summary", label: "About you", type: "textarea", optional: true, hint: "Two or three sentences: who you are, your strengths and what you want next. **bold** works." },
];

export const SECTIONS = [
   {
      key: "basics.profiles",
      title: "Links",
      icon: "🔗",
      item: "link",
      empty: () => ({ network: "LinkedIn", url: "" }),
      heading: (p) => p.network || "Link",
      fields: [{ cols: [{ path: "network", label: "Site", type: "select", options: NETWORKS }, { path: "url", label: "URL", type: "url", placeholder: "https://…" }] }],
   },
   {
      key: "work",
      title: "Experience",
      icon: "💼",
      item: "experience",
      empty: () => ({ position: "", name: "", startDate: "", highlights: [] }),
      heading: (w) => [w.position, w.name].filter(Boolean).join(" · ") || "New experience",
      fields: [
         { cols: [{ path: "position", label: "Job title", placeholder: "Product Designer" }, { path: "name", label: "Company", placeholder: "Acme Inc." }] },
         { cols: [{ path: "startDate", label: "Start", type: "month" }, { path: "endDate", label: "End", type: "month", current: "I work here now" }] },
         { path: "location", label: "Location", placeholder: "Remote", optional: true },
         { path: "highlights", label: "Achievements", type: "lines", hint: "One per line. Start with a strong verb and add numbers where you can." },
      ],
   },
   {
      key: "projects",
      title: "Projects",
      icon: "🚀",
      item: "project",
      empty: () => ({ name: "", description: "" }),
      heading: (p) => p.name || "New project",
      fields: [
         { cols: [{ path: "name", label: "Name", placeholder: "My App" }, { path: "tagline", label: "Tagline", placeholder: "One short line", optional: true }] },
         { path: "description", label: "Description", type: "textarea" },
         { cols: [{ path: "url", label: "Live link", type: "url", optional: true }, { path: "source", label: "Code link", type: "url", optional: true }] },
         { path: "keywords", label: "Built with", type: "csv", optional: true, hint: "Comma separated" },
      ],
   },
   {
      key: "education",
      title: "Education",
      icon: "🎓",
      item: "school",
      empty: () => ({ institution: "", studyType: "", area: "" }),
      heading: (e) => e.institution || "New school",
      fields: [
         { path: "institution", label: "School or university", placeholder: "University of Lisbon" },
         { cols: [{ path: "studyType", label: "Degree", placeholder: "BSc", optional: true }, { path: "area", label: "Field of study", placeholder: "Computer Science", optional: true }] },
         { cols: [{ path: "startDate", label: "From (year)", placeholder: "2019", optional: true }, { path: "endDate", label: "To (year)", placeholder: "2023", optional: true }] },
         { path: "score", label: "Grade or honours", optional: true },
      ],
   },
   {
      key: "skills",
      title: "Skills",
      icon: "⚡",
      item: "skill group",
      empty: () => ({ name: "", keywords: [] }),
      heading: (s) => s.name || "New skill group",
      fields: [
         { path: "name", label: "Group", placeholder: "Frontend" },
         { path: "keywords", label: "Skills", type: "csv", placeholder: "React, TypeScript, Figma", hint: "Comma separated" },
      ],
   },
   {
      key: "languages",
      title: "Languages",
      icon: "🌍",
      item: "language",
      empty: () => ({ language: "", fluency: "Fluent" }),
      heading: (l) => l.language || "New language",
      fields: [{ cols: [{ path: "language", label: "Language", placeholder: "English" }, { path: "fluency", label: "Level", type: "select", options: FLUENCY }] }],
   },
   {
      key: "certificates",
      title: "Certifications",
      icon: "🏅",
      item: "certification",
      empty: () => ({ name: "", issuer: "" }),
      heading: (c) => c.name || "New certification",
      fields: [
         { path: "name", label: "Name", placeholder: "AWS Certified Developer" },
         { cols: [{ path: "issuer", label: "Issuer", optional: true }, { path: "date", label: "Date", type: "month", optional: true }] },
      ],
   },
];

// ---- data helpers -------------------------------------------------------------
const getAt = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
const setAt = (obj, path, value) => {
   const keys = path.split(".");
   let o = obj;
   keys.slice(0, -1).forEach((k, i) => {
      if (o[k] == null) o[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      o = o[k];
   });
   const last = keys.at(-1);
   if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) delete o[last];
   else o[last] = value;
};
const toMonth = (v = "") => (/^\d{4}-\d{2}/.test(v) ? v.slice(0, 7) : "");

// ---- DOM helpers --------------------------------------------------------------
const el = (tag, props = {}, ...children) => {
   const node = document.createElement(tag);
   for (const [k, v] of Object.entries(props)) {
      if (k === "dataset") Object.assign(node.dataset, v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
   }
   node.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
   return node;
};

const fieldNode = (field, base, item) => {
   const path = base ? `${base}.${field.path}` : field.path;
   const value = getAt(item, field.path);
   const labelText = el("span", {}, field.label, field.optional ? el("em", {}, " (optional)") : null);
   let input;
   if (field.type === "textarea" || field.type === "lines") {
      input = el("textarea", { rows: field.type === "lines" ? 4 : 3, value: field.type === "lines" ? (value ?? []).join("\n") : value ?? "" });
   } else if (field.type === "select") {
      input = el("select", {}, field.options.map((o) => el("option", { value: o, textContent: o })));
      input.value = field.options.includes(value) ? value : field.options[0];
   } else {
      input = el("input", {
         type: field.type === "csv" ? "text" : field.type ?? "text",
         value: field.type === "csv" ? (value ?? []).join(", ") : field.type === "month" ? toMonth(value) : value ?? "",
         placeholder: field.placeholder ?? "",
      });
      if (field.type === "month" && value && !toMonth(value)) input.title = `Currently "${value}"`;
   }
   input.dataset.path = path;
   input.dataset.kind = field.type ?? "text";
   if (field.required) input.required = true;
   if (field.placeholder && input.tagName !== "SELECT") input.placeholder = field.placeholder;

   const wrap = el("label", { className: "field" }, labelText, input, field.hint ? el("small", {}, field.hint) : null);
   if (!field.current) return wrap;

   const isCurrent = !getAt(item, field.path) && Boolean(getAt(item, "startDate"));
   input.disabled = isCurrent;
   const box = el("input", { type: "checkbox", checked: isCurrent });
   box.dataset.current = path;
   return el("div", { className: "field" }, wrap, el("label", { className: "check" }, box, field.current));
};

const fieldsNode = (fields, base, item) =>
   fields.map((f) => (f.cols ? el("div", { className: "cols" }, f.cols.map((c) => fieldNode(c, base, item))) : fieldNode(f, base, item)));

export function createForm(container, { getData, onChange, basicsExtra }) {
   const open = new Set(["basics", "work"]);

   const section = (key, title, icon, count, body) => {
      const details = el(
         "details",
         { className: "fsec", open: open.has(key) },
         el("summary", {}, el("span", { className: "ico" }, icon), title, el("span", { className: "count" }, count === null ? "" : String(count))),
         el("div", { className: "fsec-body" }, body)
      );
      details.addEventListener("toggle", () => (details.open ? open.add(key) : open.delete(key)));
      return details;
   };

   const render = () => {
      const data = getData();
      const basics = data.basics ?? {};
      const nodes = [section("basics", "Personal details", "👤", null, [basicsExtra?.(), ...fieldsNode(BASICS, "basics", basics)])];
      for (const s of SECTIONS) {
         const items = getAt(data, s.key) ?? [];
         const entries = items.map((item, i) =>
            el(
               "div",
               { className: "entry" },
               el(
                  "div",
                  { className: "entry-bar" },
                  el("b", {}, s.heading(item)),
                  el("button", { className: "mini", type: "button", title: "Move up", disabled: i === 0, dataset: { move: `${s.key}|${i}|-1` } }, "↑"),
                  el("button", { className: "mini", type: "button", title: "Move down", disabled: i === items.length - 1, dataset: { move: `${s.key}|${i}|1` } }, "↓"),
                  el("button", { className: "mini danger", type: "button", title: `Remove ${s.item}`, dataset: { remove: `${s.key}|${i}` } }, "✕")
               ),
               fieldsNode(s.fields, `${s.key}.${i}`, item)
            )
         );
         const add = el("button", { className: "add", type: "button", dataset: { add: s.key } }, `+ Add ${s.item}`);
         nodes.push(section(s.key, s.title, s.icon, items.length, [...entries, add]));
      }
      container.replaceChildren(...nodes);
   };

   const commit = (structural) => onChange({ structural });

   container.addEventListener("input", (e) => {
      const { path, kind } = e.target.dataset;
      if (!path) return;
      const data = getData();
      const raw = e.target.value;
      const value =
         kind === "lines"
            ? raw.split("\n").map((l) => l.trim()).filter(Boolean)
            : kind === "csv"
              ? raw.split(",").map((s) => s.trim()).filter(Boolean)
              : raw;
      setAt(data, path, value);
      // Keep the entry's heading in sync without rebuilding the form.
      const entry = e.target.closest(".entry");
      if (entry) {
         const [key, index] = path.split(/\.(\d+)\./);
         const s = SECTIONS.find((x) => x.key === key);
         if (s) entry.querySelector(".entry-bar b").textContent = s.heading(getAt(data, `${key}.${index}`));
      }
      commit(false);
   });

   container.addEventListener("change", (e) => {
      const path = e.target.dataset.current;
      if (!path) return;
      const data = getData();
      const input = e.target.closest(".field").querySelector(`[data-path="${CSS.escape(path)}"]`);
      input.disabled = e.target.checked;
      if (e.target.checked) {
         setAt(data, path, undefined);
         input.value = "";
      }
      commit(false);
   });

   container.addEventListener("click", (e) => {
      const button = e.target.closest("button[data-add], button[data-remove], button[data-move]");
      if (!button) return;
      const data = getData();
      if (button.dataset.add) {
         const s = SECTIONS.find((x) => x.key === button.dataset.add);
         const list = getAt(data, s.key) ?? [];
         setAt(data, s.key, [...list, s.empty()]);
         open.add(s.key);
      } else if (button.dataset.remove) {
         const [key, index] = button.dataset.remove.split("|");
         const list = [...(getAt(data, key) ?? [])];
         list.splice(Number(index), 1);
         setAt(data, key, list);
      } else {
         const [key, index, dir] = button.dataset.move.split("|");
         const list = [...(getAt(data, key) ?? [])];
         const i = Number(index);
         const j = i + Number(dir);
         [list[i], list[j]] = [list[j], list[i]];
         setAt(data, key, list);
      }
      render();
      commit(true);
      if (button.dataset.add) {
         const added = container.querySelectorAll(`[data-path^="${CSS.escape(button.dataset.add)}."]`);
         added[added.length - 1]?.closest(".entry")?.querySelector("input, textarea")?.focus();
      }
   });

   return { render };
}
