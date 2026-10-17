// Minimal: Swiss-style single column. Section titles sit in a left gutter,
// typography does the work, and the plain structure parses cleanly in ATS.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections } from "./shared.mjs";

export default {
   id: "minimal",
   name: "Minimal",
   description: "Swiss single column with a title gutter. The most ATS-friendly theme.",
   accent: "#ea580c",
   fonts: "family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700;800",

   render: (ctx) => {
      const { basics } = ctx.resume;
      return `<main class="page">
   <header class="masthead">
      <div class="identity">
         <h1>${esc(basics.name)}</h1>
         ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
         ${contactList(ctx, { icons: false })}
      </div>
      ${photo(ctx)}
   </header>
   ${sections(ctx, ctx.order, { skills: { style: "inline" }, languages: { style: "text" }, projects: { layout: "list" } })}
</main>`;
   },

   css: () => `
:root { --ink: #111111; --text: #2b2b2b; --muted: #6b6b6b; --line: #e6e6e6; }
body { font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: var(--text); font-size: ${s(8.9, "pt")}; line-height: 1.5; }
h1, h2, h3 { color: var(--ink); }
.page { padding: ${s(15, "mm")} ${s(16, "mm")} ${s(12, "mm")}; background: #fff; }

.masthead { display: flex; justify-content: space-between; align-items: flex-start; gap: 8mm; padding-bottom: ${s(5, "mm")}; border-bottom: 0.35mm solid var(--ink); }
h1 { font-family: "Inter Tight", Inter, sans-serif; font-size: ${s(30, "pt")}; font-weight: 800; letter-spacing: -0.045em; line-height: 0.95; }
.headline { margin-top: ${s(2.4, "mm")}; font-size: ${s(11.5, "pt")}; font-weight: 500; color: var(--accent); letter-spacing: -0.01em; }
.contact { display: flex; flex-wrap: wrap; margin-top: ${s(3.4, "mm")}; font-size: ${s(8.3, "pt")}; color: var(--muted); }
.contact-item:not(:last-child)::after { content: "/"; margin: 0 2.2mm; color: var(--line); }
.contact a:hover { color: var(--accent); }
.photo { width: ${s(24, "mm")}; height: ${s(24, "mm")}; object-fit: cover; filter: grayscale(1); }

.section { display: grid; grid-template-columns: 34mm 1fr; gap: 6mm; padding-top: ${s(4.6, "mm")}; }
.section + .section { margin-top: ${s(4.6, "mm")}; border-top: 0.25mm solid var(--line); }
.section-title { font-family: "Inter Tight", Inter, sans-serif; font-size: ${s(8.4, "pt")}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink); padding-top: 0.6mm; }
.section-title::before { content: ""; display: block; width: 5mm; height: 0.8mm; background: var(--accent); margin-bottom: 2mm; }
.summary { font-size: ${s(9.6, "pt")}; line-height: 1.55; color: var(--ink); }

.entry + .entry, .projects--list .project + .project { margin-top: ${s(3.6, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 5mm; }
.entry-title, .project-title { font-size: ${s(10, "pt")}; font-weight: 600; letter-spacing: -0.01em; }
.entry-org { font-size: ${s(9, "pt")}; color: var(--muted); }
.entry-org a { color: var(--ink); font-weight: 500; }
.entry-location, .keywords { color: var(--muted); }
.entry-location::before, .keywords::before { content: " · "; }
.entry-date { font-size: ${s(8.3, "pt")}; color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.entry-summary { margin-top: ${s(1, "mm")}; }
.bullets { list-style: none; margin-top: ${s(1.2, "mm")}; }
.bullets li { position: relative; padding-left: 4mm; margin-top: ${s(0.5, "mm")}; }
.bullets li::before { content: "–"; position: absolute; left: 0; color: var(--accent); font-weight: 600; }

.project-links a { font-size: ${s(7.8, "pt")}; font-weight: 500; color: var(--accent); margin-left: 2mm; }
.project-tagline { color: var(--muted); font-size: ${s(8.6, "pt")}; }
.project-desc { margin-top: ${s(0.8, "mm")}; }
.project-keywords { margin-top: ${s(0.8, "mm")}; color: var(--muted); font-size: ${s(8.2, "pt")}; }

.skill-line + .skill-line { margin-top: ${s(0.9, "mm")}; }
.skill-line strong { display: inline-block; min-width: 34mm; color: var(--ink); font-weight: 600; }
.edu + .edu { margin-top: ${s(2.6, "mm")}; }
.edu-title { font-size: ${s(9.6, "pt")}; font-weight: 600; }
.edu-degree { color: var(--text); }
.edu-meta, .edu-courses { color: var(--muted); font-size: ${s(8.4, "pt")}; }
.languages { display: flex; flex-wrap: wrap; gap: 1mm 7mm; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { font-style: normal; font-weight: 400; color: var(--muted); }
.simple li + li { margin-top: ${s(1.1, "mm")}; }
.simple strong { color: var(--ink); font-weight: 600; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); }
`,
};
