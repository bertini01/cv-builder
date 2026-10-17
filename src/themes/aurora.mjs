// Aurora: modern and confident. A clean masthead with a single line of
// contacts, a hairline gradient rule, and a quiet right-hand column.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, section, sections } from "./shared.mjs";

export default {
   id: "aurora",
   name: "Aurora",
   description: "Modern two-column layout with a hairline gradient and a quiet sidebar.",
   accent: "#2563eb",
   fonts: "family=Inter:wght@400;500;600&family=Sora:wght@500;600",
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
   </header>
   ${contactList(ctx)}
   <div class="rule"></div>
   ${section(ctx, "summary", { titles: false })}
   <div class="columns${ctx.side.length ? "" : " columns--single"}">
      <div class="main">${sections(ctx, main, { projects: { layout: "grid" } })}</div>
      ${ctx.side.length ? `<aside class="side">${sections(ctx, ctx.side, { skills: { style: "chips" }, languages: { style: "dots" } })}</aside>` : ""}
   </div>
</main>`;
   },

   css: () => `
:root { --ink: #0d1424; --text: #2a3346; --muted: #657088; --line: #e6eaf2; --accent-2: color-mix(in srgb, var(--accent) 40%, #06b6d4); }
body { font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--text); font-size: ${s(9.5, "pt")}; line-height: 1.5; }
h1, h2, h3 { font-family: Sora, Inter, sans-serif; color: var(--ink); }
.page { padding: ${s(15, "mm")} ${s(16, "mm")} ${s(13, "mm")}; background: #fff; }

.masthead { display: flex; align-items: center; gap: ${s(6, "mm")}; }
.photo { width: ${s(21, "mm")}; height: ${s(21, "mm")}; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 0.7mm #fff, 0 0 0 1mm var(--accent-line); }
h1 { font-size: ${s(28, "pt")}; font-weight: 600; letter-spacing: -0.035em; line-height: 1.02; }
.headline { margin-top: ${s(1.8, "mm")}; font-family: Sora, sans-serif; font-weight: 500; font-size: ${s(11.5, "pt")}; letter-spacing: -0.01em;
   background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.contact { display: flex; flex-wrap: wrap; gap: ${s(1.2, "mm")} 0; margin-top: ${s(4.5, "mm")}; font-size: ${s(8.4, "pt")}; color: var(--muted); }
.contact-item { display: flex; align-items: center; gap: 1.5mm; white-space: nowrap; }
.contact-item:not(:last-child) { margin-right: 3mm; padding-right: 3mm; border-right: 0.25mm solid var(--line); }
.contact-item .icon { width: 3.1mm; height: 3.1mm; color: var(--accent); }
.contact a:hover { color: var(--accent); }

.rule { height: 0.4mm; margin: ${s(4.2, "mm")} 0 ${s(4.6, "mm")}; background: linear-gradient(90deg, var(--accent), var(--accent-2) 45%, transparent); }
.summary { font-size: ${s(10, "pt")}; line-height: 1.6; color: var(--ink); max-width: 168mm; }

.columns { margin-top: ${s(6, "mm")}; display: grid; grid-template-columns: 1fr 55mm; gap: ${s(9, "mm")}; }
.columns--single { grid-template-columns: 1fr; }
.section + .section { margin-top: ${s(6, "mm")}; }
.section-title { font-family: Inter, sans-serif; font-size: ${s(7.8, "pt")}; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent);
   display: flex; align-items: center; gap: 3mm; margin-bottom: ${s(3.4, "mm")}; }
.main .section-title::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); }

.entry + .entry { margin-top: ${s(4.2, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 5mm; }
.entry-title, .project-title { font-size: ${s(10.6, "pt")}; font-weight: 600; letter-spacing: -0.015em; }
.entry-org { margin-top: 0.4mm; font-weight: 500; color: var(--accent); font-size: ${s(9.2, "pt")}; }
.entry-location, .keywords { font-weight: 400; color: var(--muted); font-size: ${s(8.4, "pt")}; }
.entry-location::before, .keywords::before { content: "·"; margin: 0 1.8mm; color: var(--line); }
.entry-date { font-size: ${s(8.4, "pt")}; color: var(--muted); white-space: nowrap; }
.entry-summary { margin-top: ${s(1.2, "mm")}; color: var(--muted); }
.bullets { margin-top: ${s(1.6, "mm")}; }
.bullets li { position: relative; padding-left: 4mm; }
.bullets li + li { margin-top: ${s(0.8, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 0.6mm; top: 0.62em; width: 1.2mm; height: 1.2mm; border-radius: 50%; background: var(--accent); opacity: 0.85; }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(3.5, "mm")}; }
.projects--list .project + .project { margin-top: ${s(3.5, "mm")}; }
.project { padding: ${s(3.2, "mm")} ${s(3.6, "mm")}; border-radius: 2.5mm; background: var(--accent-soft); }
.project-title { font-size: ${s(10, "pt")}; }
.project-links a { font-family: Inter, sans-serif; font-size: ${s(7.6, "pt")}; font-weight: 500; color: var(--accent); margin-left: 1.6mm; }
.project-tagline { font-size: ${s(8.4, "pt")}; color: var(--accent-ink); margin-top: 0.4mm; font-weight: 500; }
.project-desc { margin-top: ${s(1.2, "mm")}; font-size: ${s(9, "pt")}; }
.project-keywords { margin-top: ${s(1.2, "mm")}; font-size: ${s(8, "pt")}; color: var(--muted); }

.side { border-left: 0.25mm solid var(--line); padding-left: ${s(6, "mm")}; }
.skill-group + .skill-group { margin-top: ${s(3, "mm")}; }
.skill-name { font-family: Inter, sans-serif; font-size: ${s(8.8, "pt")}; font-weight: 600; }
.skill-level { font-weight: 400; color: var(--muted); margin-left: 1.5mm; }
.chips { display: flex; flex-wrap: wrap; gap: 1.2mm; margin-top: ${s(1.5, "mm")}; }
.chips li { font-size: ${s(8, "pt")}; padding: 0.5mm 2.1mm; border-radius: 10mm; background: var(--accent-soft); color: var(--accent-ink); }
.edu + .edu { margin-top: ${s(3, "mm")}; }
.edu-title { font-family: Inter, sans-serif; font-size: ${s(9.2, "pt")}; font-weight: 600; }
.edu-degree, .edu-courses { font-size: ${s(8.6, "pt")}; }
.edu-meta { font-size: ${s(8.2, "pt")}; color: var(--muted); margin-top: 0.4mm; }
.languages li { display: flex; justify-content: space-between; align-items: center; gap: 2mm; font-size: ${s(8.8, "pt")}; }
.languages li + li { margin-top: ${s(1.6, "mm")}; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { display: block; font-style: normal; color: var(--muted); font-size: 0.9em; }
.dots { display: inline-flex; gap: 0.9mm; }
.dots i { width: 1.7mm; height: 1.7mm; border-radius: 50%; background: var(--line); }
.dots i.on { background: var(--accent); }
.simple li { font-size: ${s(8.8, "pt")}; }
.simple li + li { margin-top: ${s(1.6, "mm")}; }
.simple strong { color: var(--ink); font-weight: 600; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); margin-top: 0.6mm; }
`,
};
