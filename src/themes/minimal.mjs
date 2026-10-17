// Minimal: Swiss-style single column. Section titles sit in a left gutter,
// typography does the work, and the plain structure parses cleanly in ATS.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections, splitSections } from "./shared.mjs";

export default {
   id: "minimal",
   name: "Minimal",
   description: "Swiss single column with a title gutter. The most ATS-friendly theme.",
   accent: "#e4572e",
   fonts: "family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700",

   render: (ctx) => {
      const { basics } = ctx.resume;
      const { story, details } = splitSections(ctx.order, ["languages", "certificates", "awards", "interests"]);
      const opts = { skills: { style: "inline" }, languages: { style: "text" }, projects: { layout: "list" } };
      return `<main class="page">
   <header class="masthead">
      <div class="identity">
         <h1>${esc(basics.name)}</h1>
         ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      </div>
      ${photo(ctx)}
   </header>
   ${contactList(ctx, { icons: false })}
   ${sections(ctx, story, opts)}
   ${details.length ? `<div class="details">${sections(ctx, details, opts)}</div>` : ""}
</main>`;
   },

   css: () => `
:root { --ink: #0f0f10; --text: #26272b; --muted: #6b6d74; --line: #e4e4e7; --gutter: 33mm; }
body { font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: var(--text); font-size: ${s(9.6, "pt")}; line-height: 1.5; }
h1, h2, h3 { color: var(--ink); }
.page { padding: ${s(17, "mm")} ${s(17, "mm")} ${s(14, "mm")}; background: #fff; }

.masthead { display: flex; justify-content: space-between; align-items: flex-end; gap: 8mm; }
h1 { font-family: "Inter Tight", Inter, sans-serif; font-size: ${s(34, "pt")}; font-weight: 700; letter-spacing: -0.045em; line-height: 0.95; }
.headline { margin-top: ${s(2.6, "mm")}; font-size: ${s(12, "pt")}; font-weight: 500; color: var(--muted); letter-spacing: -0.01em; }
.photo { width: ${s(22, "mm")}; height: ${s(26, "mm")}; object-fit: cover; filter: grayscale(1) contrast(1.05); }
.contact { display: flex; flex-wrap: wrap; gap: 1mm 0; margin-top: ${s(5, "mm")}; padding: ${s(2.6, "mm")} 0; border-top: 0.6mm solid var(--ink);
   border-bottom: 0.25mm solid var(--line); font-size: ${s(8.4, "pt")}; color: var(--text); }
.contact-item:not(:last-child)::after { content: ""; display: inline-block; width: 1mm; height: 1mm; background: var(--accent); margin: 0 2.8mm; vertical-align: 0.2em; }
.contact a:hover { color: var(--accent); }

.section { display: grid; grid-template-columns: var(--gutter) 1fr; gap: 6mm; padding-top: ${s(4.4, "mm")}; }
.section + .section { margin-top: ${s(4.4, "mm")}; border-top: 0.25mm solid var(--line); }
.section-title { font-family: "Inter Tight", Inter, sans-serif; font-size: ${s(8.6, "pt")}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink); line-height: 1.3; }
.section-title::before { content: ""; display: block; width: 2mm; height: 2mm; background: var(--accent); margin-bottom: 2.2mm; }
.details { display: grid; grid-template-columns: repeat(auto-fit, minmax(38mm, 1fr)); gap: 0 6mm; margin-top: ${s(5, "mm")}; border-top: 0.25mm solid var(--line); margin-left: calc(var(--gutter) + 6mm); }
.details .section { display: block; padding-top: ${s(4, "mm")}; margin-top: 0; border-top: 0; }
.details .section-title { margin-bottom: ${s(1.8, "mm")}; }
.details .section-title::before { display: inline-block; width: 1.6mm; height: 1.6mm; margin: 0 2mm 0.3mm 0; vertical-align: middle; }
.details .languages { display: grid; gap: ${s(0.6, "mm")}; }
.summary { font-size: ${s(10.4, "pt")}; line-height: 1.6; color: var(--ink); }

.entry + .entry, .projects--list .project + .project { margin-top: ${s(4.2, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 5mm; }
.entry-title, .project-title { font-family: "Inter Tight", Inter, sans-serif; font-size: ${s(10.8, "pt")}; font-weight: 600; letter-spacing: -0.015em; }
.entry-org { margin-top: 0.3mm; font-size: ${s(9.4, "pt")}; color: var(--text); }
.entry-org a { color: var(--ink); font-weight: 500; }
.entry-location, .keywords { color: var(--muted); }
.entry-location::before, .keywords::before { content: " · "; }
.entry-date { font-size: ${s(8.8, "pt")}; color: var(--muted); white-space: nowrap; }
.entry-summary { margin-top: ${s(1.2, "mm")}; }
.bullets { margin-top: ${s(1.6, "mm")}; }
.bullets li { position: relative; padding-left: 4.4mm; }
.bullets li + li { margin-top: ${s(0.8, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 0.4mm; top: 0.7em; width: 2mm; height: 0.3mm; background: var(--accent); }

.project-links a { font-size: ${s(8.2, "pt")}; font-weight: 500; color: var(--accent); margin-left: 2mm; }
.project-tagline { color: var(--muted); font-size: ${s(9.2, "pt")}; }
.project-desc { margin-top: ${s(1, "mm")}; }
.project-keywords { margin-top: ${s(1, "mm")}; color: var(--muted); font-size: ${s(8.6, "pt")}; }

.skill-line + .skill-line { margin-top: ${s(1.2, "mm")}; }
.skill-line { display: grid; grid-template-columns: 34mm 1fr; gap: 3mm; }
.skill-line strong { color: var(--ink); font-weight: 600; }
.edu + .edu { margin-top: ${s(3, "mm")}; }
.edu-title { font-family: "Inter Tight", Inter, sans-serif; font-size: ${s(10.4, "pt")}; font-weight: 600; }
.edu-meta, .edu-courses { color: var(--muted); font-size: ${s(8.8, "pt")}; }
.languages { display: flex; flex-wrap: wrap; gap: 1.2mm 8mm; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { font-style: normal; font-weight: 400; color: var(--muted); margin-left: 0.6mm; }
.simple li + li { margin-top: ${s(1.3, "mm")}; }
.simple strong { color: var(--ink); font-weight: 600; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); }
`,
};
