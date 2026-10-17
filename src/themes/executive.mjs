// Executive: quiet luxury. Letterspaced Cormorant capitals, a readable serif
// body on warm ivory, gold hairlines and navy ink. For senior and formal roles.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections, splitSections } from "./shared.mjs";

export default {
   id: "executive",
   name: "Executive",
   description: "Quiet luxury: letterspaced serif capitals, ivory paper and gold hairlines.",
   accent: "#1f3550",
   fonts: "family=Cormorant+Garamond:wght@500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400",

   render: (ctx) => {
      const { basics } = ctx.resume;
      const { story, details } = splitSections(ctx.order);
      const opts = { skills: { style: "inline" }, languages: { style: "text" }, projects: { layout: "grid" } };
      return `<main class="page">
   <header class="masthead">
      ${photo(ctx)}
      <h1>${esc(basics.name)}</h1>
      ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      ${contactList(ctx, { icons: false })}
   </header>
   ${sections(ctx, story, opts)}
   ${details.length ? `<div class="details">${sections(ctx, details, opts)}</div>` : ""}
</main>`;
   },

   css: () => `
:root { --ink: #16202c; --text: #2c333c; --muted: #6b717a; --gold: #b08a4e; --gold-soft: #e6d6b8; --line: #e9e2d4; --paper: #fdfbf6; }
body { font-family: "Source Serif 4", Georgia, "Times New Roman", serif; color: var(--text); font-size: ${s(9.7, "pt")}; line-height: 1.5; }
h1, h2, h3 { color: var(--ink); font-weight: 600; }
.page { padding: ${s(13, "mm")} ${s(18, "mm")} ${s(11, "mm")}; background: var(--paper); }

.masthead { text-align: center; padding-bottom: ${s(4.2, "mm")}; position: relative; }
.masthead::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1.4mm; border-top: 0.35mm solid var(--gold); border-bottom: 0.2mm solid var(--gold); }
.photo { width: ${s(19, "mm")}; height: ${s(19, "mm")}; border-radius: 50%; object-fit: cover; margin: 0 auto ${s(3, "mm")}; box-shadow: 0 0 0 0.7mm var(--paper), 0 0 0 1mm var(--gold); }
h1 { font-family: "Cormorant Garamond", Garamond, Georgia, serif; font-size: ${s(30, "pt")}; font-weight: 500; text-transform: uppercase;
   letter-spacing: 0.14em; line-height: 1.05; color: var(--accent); margin-right: -0.14em; }
.headline { margin-top: ${s(2.2, "mm")}; font-size: ${s(9.2, "pt")}; text-transform: uppercase; letter-spacing: 0.32em; color: var(--gold); font-weight: 600; margin-right: -0.32em; }
.contact { display: flex; flex-wrap: wrap; justify-content: center; margin-top: ${s(3.6, "mm")}; font-size: ${s(8.8, "pt")}; color: var(--muted); }
.contact-item:not(:last-child)::after { content: ""; display: inline-block; width: 1mm; height: 1mm; transform: rotate(45deg); background: var(--gold); margin: 0 3mm; vertical-align: 0.25em; }

.section { margin-top: ${s(5, "mm")}; }
.section-title { display: flex; align-items: center; gap: 4mm; justify-content: center; font-family: "Cormorant Garamond", Georgia, serif;
   font-size: ${s(12.5, "pt")}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.24em; color: var(--accent); margin-bottom: ${s(2.8, "mm")}; }
.section-title::before, .section-title::after { content: ""; flex: 1; height: 0.25mm; background: linear-gradient(90deg, transparent, var(--gold-soft)); }
.section-title::after { background: linear-gradient(90deg, var(--gold-soft), transparent); }
.summary { text-align: center; font-size: ${s(10.3, "pt")}; font-style: italic; line-height: 1.6; color: var(--ink); max-width: 150mm; margin: 0 auto; }

.entry + .entry { margin-top: ${s(3.5, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
.entry-title, .project-title { font-size: ${s(11, "pt")}; letter-spacing: -0.005em; }
.entry-org { font-style: italic; color: var(--accent); font-size: ${s(10, "pt")}; }
.entry-location, .keywords { font-style: normal; color: var(--muted); font-size: ${s(8.8, "pt")}; }
.entry-location::before, .keywords::before { content: "·"; margin: 0 2mm; color: var(--gold); }
.entry-date { font-size: ${s(9, "pt")}; color: var(--muted); font-style: italic; white-space: nowrap; }
.entry-summary { margin-top: ${s(1.2, "mm")}; }
.bullets { margin-top: ${s(1.6, "mm")}; }
.bullets li { position: relative; padding-left: 5mm; }
.bullets li + li { margin-top: ${s(0.8, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 1mm; top: 0.62em; width: 1.1mm; height: 1.1mm; transform: rotate(45deg); background: var(--gold); }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(4, "mm")} ${s(9, "mm")}; }
.project-title { font-size: ${s(10.6, "pt")}; }
.project-links a { font-size: ${s(8.4, "pt")}; font-weight: 400; font-style: italic; color: var(--gold); margin-left: 2mm; }
.project-tagline { font-style: italic; color: var(--accent); }
.project-desc { margin-top: ${s(1, "mm")}; }
.project-keywords { margin-top: ${s(1, "mm")}; color: var(--muted); font-size: ${s(8.8, "pt")}; }

.details { columns: 2; column-gap: ${s(10, "mm")}; margin-top: ${s(5, "mm")}; }
.details .section { break-inside: avoid; margin: 0 0 ${s(4, "mm")}; }
.details .section { margin-top: 0; }
.details .section-title { font-size: ${s(11, "pt")}; }
.skills--inline { columns: 1; }
.skill-line { break-inside: avoid; margin-bottom: ${s(1.3, "mm")}; }
.skill-line strong { display: block; color: var(--accent); font-weight: 600; font-size: ${s(9.4, "pt")}; }
.edu { text-align: left; }
.edu + .edu { margin-top: ${s(3, "mm")}; }
.edu-title { font-size: ${s(10.8, "pt")}; }
.edu-degree { font-style: italic; color: var(--accent); }
.edu-meta, .edu-courses { color: var(--muted); font-size: ${s(9, "pt")}; }
.languages { display: grid; gap: ${s(0.8, "mm")}; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { color: var(--muted); }
.simple li + li { margin-top: ${s(1.3, "mm")}; }
.simple strong { color: var(--ink); font-weight: 600; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--accent); }
`,
};
