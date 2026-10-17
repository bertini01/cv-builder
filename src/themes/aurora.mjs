// Aurora: modern and confident. Sora headings, a gradient accent rule and a
// soft tinted sidebar for skills, education and languages.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, section, sections } from "./shared.mjs";

export default {
   id: "aurora",
   name: "Aurora",
   description: "Modern two-column layout with a gradient accent and a soft sidebar.",
   accent: "#2563eb",
   fonts: "family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700",
   side: ["skills", "education", "certificates", "awards", "languages", "interests"],

   render: (ctx) => {
      const { basics } = ctx.resume;
      const main = ctx.main.filter((id) => id !== "summary");
      return `<main class="page">
   <header class="masthead">
      ${photo(ctx)}
      <div class="identity">
         <h1>${esc(basics.name)}</h1>
         ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      </div>
      ${contactList(ctx)}
   </header>
   <div class="rule"></div>
   ${section(ctx, "summary", { titles: false })}
   <div class="columns${ctx.side.length ? "" : " columns--single"}">
      <div class="main">${sections(ctx, main, { projects: { layout: "grid" } })}</div>
      ${ctx.side.length ? `<aside class="side">${sections(ctx, ctx.side, { skills: { style: "chips" }, languages: { style: "dots" } })}</aside>` : ""}
   </div>
</main>`;
   },

   css: () => `
:root { --ink: #0b1220; --text: #273449; --muted: #5b6b84; --line: #e3e9f3; --accent-2: color-mix(in srgb, var(--accent) 45%, #06b6d4); }
body { font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--text); font-size: ${s(8.7, "pt")}; line-height: 1.45; }
h1, h2, h3 { font-family: Sora, Inter, sans-serif; color: var(--ink); }
.page { padding: ${s(11, "mm")} ${s(13, "mm")} ${s(9, "mm")}; background: #fff; }

.masthead { display: flex; align-items: flex-start; gap: ${s(6, "mm")}; }
.photo { width: ${s(22, "mm")}; height: ${s(22, "mm")}; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 0.6mm #fff, 0 0 0 1mm var(--accent-line); }
.identity { flex: 1; }
h1 { font-size: ${s(24, "pt")}; font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; }
.headline { margin-top: ${s(2, "mm")}; font-family: Sora, sans-serif; font-weight: 600; font-size: ${s(11, "pt")};
   background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.contact { display: grid; grid-template-columns: auto auto; gap: ${s(1.3, "mm")} ${s(6, "mm")}; font-size: ${s(8, "pt")}; color: var(--muted); padding-top: 1mm; }
.contact-item { display: flex; align-items: center; gap: 1.6mm; white-space: nowrap; }
.contact-item .icon { width: 3.2mm; height: 3.2mm; color: var(--accent); }

.rule { height: 0.8mm; border-radius: 1mm; margin: ${s(4, "mm")} 0 ${s(3.6, "mm")}; background: linear-gradient(90deg, var(--accent), var(--accent-2) 55%, transparent); }
.summary { font-size: ${s(9, "pt")}; line-height: 1.55; }

.columns { margin-top: ${s(4, "mm")}; display: grid; grid-template-columns: 1fr 56mm; gap: ${s(6, "mm")}; }
.columns--single { grid-template-columns: 1fr; }
.section + .section { margin-top: ${s(3.8, "mm")}; }
.section-title { font-size: ${s(7.8, "pt")}; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent);
   display: flex; align-items: center; gap: 2.5mm; margin-bottom: ${s(2.8, "mm")}; }
.section-title::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); }

.entry + .entry { margin-top: ${s(3, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.entry-title, .project-title { font-size: ${s(9.6, "pt")}; font-weight: 600; letter-spacing: -0.01em; }
.entry-org { font-weight: 600; color: var(--accent); font-size: ${s(8.6, "pt")}; margin-top: 0.2mm; }
.entry-location, .keywords { font-weight: 500; color: var(--muted); font-size: ${s(7.8, "pt")}; margin-left: 2mm; padding-left: 2mm; border-left: 0.25mm solid var(--line); }
.entry-date { font-size: ${s(7.8, "pt")}; font-weight: 500; color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.entry-summary { margin-top: ${s(1, "mm")}; color: var(--muted); }
.bullets { list-style: disc; margin-top: ${s(1, "mm")}; padding-left: 3.4mm; }
.bullets li { margin-top: ${s(0.25, "mm")}; }
.bullets li::marker { color: var(--accent); font-size: 0.8em; }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(2.8, "mm")} ${s(5, "mm")}; }
.projects--list .project + .project { margin-top: ${s(2.8, "mm")}; }
.project { border-left: 0.5mm solid var(--accent-line); padding-left: 2.6mm; }
.project-links a { font-family: Inter, sans-serif; font-size: ${s(7.3, "pt")}; font-weight: 500; color: var(--accent); margin-left: 1.4mm; }
.project-tagline { font-weight: 500; font-size: ${s(7.9, "pt")}; color: var(--accent-2); margin-top: 0.2mm; }
.project-desc { margin-top: ${s(0.8, "mm")}; }
.project-keywords { margin-top: ${s(0.8, "mm")}; font-size: ${s(7.6, "pt")}; color: var(--muted); font-weight: 500; }

.side { background: var(--accent-soft); border-radius: 3mm; padding: ${s(4.6, "mm")} ${s(4.2, "mm")}; align-self: start; }
.side .section-title::after { background: var(--accent-line); }
.skill-group + .skill-group { margin-top: ${s(2.3, "mm")}; }
.skill-name { font-size: ${s(8.4, "pt")}; }
.skill-level { font-family: Inter, sans-serif; font-weight: 500; font-size: 0.85em; color: var(--muted); margin-left: 1.5mm; }
.chips { display: flex; flex-wrap: wrap; gap: 1mm; margin-top: ${s(1.1, "mm")}; }
.chips li { font-size: ${s(7.4, "pt")}; font-weight: 500; padding: 0.3mm 1.8mm; border-radius: 10mm; background: #fff; border: 0.25mm solid var(--accent-line); color: var(--ink); }
.edu + .edu { margin-top: ${s(2.4, "mm")}; }
.edu-title { font-size: ${s(8.6, "pt")}; }
.edu-degree, .edu-courses { font-size: ${s(7.9, "pt")}; color: var(--muted); }
.edu-meta { font-size: ${s(7.8, "pt")}; color: var(--accent); margin-top: 0.3mm; font-weight: 500; }
.languages li { display: flex; justify-content: space-between; align-items: center; gap: 2mm; font-size: ${s(8.2, "pt")}; }
.languages li + li { margin-top: ${s(1.3, "mm")}; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { font-style: normal; font-weight: 400; color: var(--muted); font-size: 0.92em; margin-left: 0.6mm; }
.dots { display: inline-flex; gap: 0.8mm; }
.dots i { width: 1.8mm; height: 1.8mm; border-radius: 50%; background: var(--accent-line); }
.dots i.on { background: var(--accent); }
.simple li { font-size: ${s(8.2, "pt")}; }
.simple li + li { margin-top: ${s(1.2, "mm")}; }
.simple strong { color: var(--ink); font-weight: 600; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); margin-top: 0.6mm; }
`,
};
