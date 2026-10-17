// Horizon: bold and optimistic. A full-bleed colour band for the masthead,
// a vertical timeline for experience and a two-column footer of details.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections } from "./shared.mjs";

const FULL_WIDTH = ["summary", "work", "projects", "volunteer", "publications", "references"];

export default {
   id: "horizon",
   name: "Horizon",
   description: "Bold colour band, experience timeline and a two-column details grid.",
   accent: "#4f46e5",
   fonts: "family=Manrope:wght@400;500;600;700;800",

   render: (ctx) => {
      const { basics } = ctx.resume;
      const full = ctx.order.filter((id) => FULL_WIDTH.includes(id));
      const details = ctx.order.filter((id) => !FULL_WIDTH.includes(id));
      return `<main class="page">
   <header class="band">
      <div class="identity">
         <h1>${esc(basics.name)}</h1>
         ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
         ${contactList(ctx)}
      </div>
      ${photo(ctx)}
   </header>
   <div class="body">
      ${sections(ctx, full, { projects: { layout: "grid" } })}
      ${details.length ? `<div class="details">${sections(ctx, details, { skills: { style: "chips" }, languages: { style: "bars" } })}</div>` : ""}
   </div>
</main>`;
   },

   css: () => `
:root { --ink: #111827; --text: #303846; --muted: #6b7280; --line: #e7e9f0; --band-2: color-mix(in srgb, var(--accent) 55%, #0b1026); --date-col: 27mm; }
body { font-family: Manrope, "Segoe UI", Arial, sans-serif; color: var(--text); font-size: ${s(9.4, "pt")}; line-height: 1.52; }
h1, h2, h3 { color: var(--ink); }
.page { background: #fff; }

.band { display: flex; justify-content: space-between; align-items: center; gap: 8mm; padding: ${s(11, "mm")} ${s(16, "mm")} ${s(9, "mm")}; color: #fff;
   background: radial-gradient(70mm 50mm at 92% 0%, rgba(255, 255, 255, 0.16), transparent 70%), radial-gradient(60mm 40mm at 8% 120%, rgba(255, 255, 255, 0.1), transparent 70%),
      linear-gradient(120deg, var(--accent), var(--band-2)); }
.band h1 { color: #fff; font-size: ${s(31, "pt")}; font-weight: 800; letter-spacing: -0.035em; line-height: 1; }
.headline { margin-top: ${s(2, "mm")}; font-size: ${s(12, "pt")}; font-weight: 500; color: rgba(255, 255, 255, 0.85); }
.contact { display: flex; flex-wrap: wrap; gap: ${s(1.6, "mm")}; margin-top: ${s(4.2, "mm")}; font-size: ${s(8.2, "pt")}; }
.contact-item { display: inline-flex; align-items: center; gap: 1.5mm; padding: 0.8mm 2.6mm; border-radius: 10mm; background: rgba(255, 255, 255, 0.14);
   border: 0.25mm solid rgba(255, 255, 255, 0.22); color: #fff; }
.contact-item .icon { width: 3mm; height: 3mm; opacity: 0.9; }
.photo { width: ${s(30, "mm")}; height: ${s(30, "mm")}; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 0 0 1.2mm rgba(255, 255, 255, 0.9), 0 6mm 12mm -6mm rgba(0, 0, 0, 0.5); }

.body { padding: ${s(7, "mm")} ${s(16, "mm")} ${s(10, "mm")}; }
.section + .section { margin-top: ${s(5.4, "mm")}; }
.section-title { font-size: ${s(8.2, "pt")}; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin-bottom: ${s(3.6, "mm")};
   display: flex; align-items: center; gap: 2.5mm; }
.section-title::before { content: ""; width: 2.4mm; height: 2.4mm; border-radius: 0.8mm; background: var(--accent); }
.section--summary .section-title { display: none; }
.summary { font-size: ${s(10.2, "pt")}; line-height: 1.58; color: var(--ink); font-weight: 500; }

/* Experience timeline: dates in a column, a line with a dot per role. */
.section--work .section-body, .section--volunteer .section-body { position: relative; }
.section--work .section-body::before, .section--volunteer .section-body::before { content: ""; position: absolute; top: 1.5mm; bottom: 1.5mm;
   left: calc(var(--date-col) + 3mm); width: 0.4mm; background: linear-gradient(var(--accent), var(--accent-line)); }
.entry { display: grid; grid-template-columns: var(--date-col) 1fr; column-gap: 9mm; position: relative; }
.entry::after { content: ""; position: absolute; left: calc(var(--date-col) + 1.85mm); top: 1.3mm; width: 2.7mm; height: 2.7mm; border-radius: 50%;
   background: #fff; border: 0.7mm solid var(--accent); }
.entry-head, .entry-heading { display: contents; }
.entry-date { grid-column: 1; grid-row: 1 / span 2; text-align: right; font-size: ${s(8.2, "pt")}; font-weight: 700; color: var(--ink); line-height: 1.35; padding-top: 0.5mm; }
.entry-title, .entry-org, .entry-summary, .entry .bullets, .entry .chips { grid-column: 2; }
.entry + .entry { margin-top: ${s(3.8, "mm")}; }
.entry-title { font-size: ${s(11, "pt")}; font-weight: 700; letter-spacing: -0.015em; }
.entry-org { font-weight: 600; color: var(--accent); font-size: ${s(9.2, "pt")}; }
.entry-location, .keywords { font-weight: 500; color: var(--muted); font-size: ${s(8.4, "pt")}; }
.entry-location::before, .keywords::before { content: "·"; margin: 0 1.8mm; }
.entry-summary { margin-top: ${s(1, "mm")}; color: var(--muted); }
.bullets { margin-top: ${s(1.4, "mm")}; }
.bullets li { position: relative; padding-left: 4mm; }
.bullets li + li { margin-top: ${s(0.7, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 0.4mm; top: 0.62em; width: 1.3mm; height: 1.3mm; border-radius: 0.4mm; background: var(--accent-line); }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(3.5, "mm")}; }
.project { padding: ${s(3.6, "mm")} ${s(4, "mm")}; border-radius: 3mm; border: 0.25mm solid var(--line); background: linear-gradient(180deg, var(--accent-soft), #fff 70%); }
.project-head { display: flex; justify-content: space-between; gap: 3mm; }
.project-title { font-size: ${s(10.4, "pt")}; font-weight: 700; }
.project-links a { font-size: ${s(7.6, "pt")}; font-weight: 700; color: var(--accent); margin-left: 1.6mm; }
.project-tagline { font-size: ${s(8.4, "pt")}; font-weight: 600; color: var(--accent); }
.project-desc { margin-top: ${s(1, "mm")}; font-size: ${s(9, "pt")}; }
.project-keywords { margin-top: ${s(1.2, "mm")}; font-size: ${s(7.9, "pt")}; font-weight: 600; color: var(--muted); }

.details { columns: 2; column-gap: ${s(10, "mm")}; margin-top: ${s(5.4, "mm")}; padding-top: ${s(5, "mm")}; border-top: 0.25mm solid var(--line); }
.details .section { break-inside: avoid; margin: 0 0 ${s(5, "mm")}; }

.skill-group + .skill-group { margin-top: ${s(2.4, "mm")}; }
.skill-name { font-size: ${s(8.8, "pt")}; font-weight: 700; }
.skill-level { font-weight: 500; color: var(--muted); margin-left: 1.5mm; }
.chips { display: flex; flex-wrap: wrap; gap: 1.2mm; margin-top: ${s(1.3, "mm")}; }
.chips li { font-size: ${s(7.9, "pt")}; font-weight: 600; padding: 0.5mm 2.2mm; border-radius: 10mm; background: var(--accent-soft); color: var(--accent-ink); }
.languages li + li { margin-top: ${s(2, "mm")}; }
.lang-name { font-weight: 700; color: var(--ink); }
.lang-fluency { font-style: normal; font-weight: 500; color: var(--muted); margin-left: 1.2mm; }
.bar { display: block; height: 1.3mm; border-radius: 1mm; background: var(--line); margin-top: 1.1mm; overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 1mm; background: linear-gradient(90deg, var(--accent), var(--band-2)); }
.edu + .edu { margin-top: ${s(3, "mm")}; }
.edu-title { font-size: ${s(9.8, "pt")}; font-weight: 700; }
.edu-meta, .edu-courses { color: var(--muted); font-size: ${s(8.6, "pt")}; }
.simple li + li { margin-top: ${s(1.4, "mm")}; }
.simple strong { color: var(--ink); font-weight: 700; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 700; color: var(--ink); }
`,
};
