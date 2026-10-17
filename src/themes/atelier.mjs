// Atelier: fashion-house luxury. A Bodoni name and monogram, wide-tracked
// champagne captions, hairline dividers and a great deal of air.
import { escapeHtml as esc } from "../format.mjs";
import { contactItems, contactList, photo, s, sections } from "./shared.mjs";

const initials = (name = "") =>
   name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .filter((_, i, all) => i === 0 || i === all.length - 1)
      .join("")
      .toUpperCase();

export default {
   id: "atelier",
   name: "Atelier",
   description: "Fashion-house luxury: Bodoni monogram, champagne accents and generous air.",
   accent: "#a17f52",
   fonts: "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500",
   side: ["skills", "languages", "education", "certificates", "awards", "interests"],

   render: (ctx) => {
      const { basics } = ctx.resume;
      return `<main class="page">
   <header class="masthead">
      ${ctx.photo ? photo(ctx) : `<div class="monogram" aria-hidden="true">${esc(initials(basics.name))}</div>`}
      <div>
         <h1>${esc(basics.name)}</h1>
         ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      </div>
   </header>
   <div class="columns">
      <aside class="side">
         ${contactItems(ctx).length ? `<section class="section section--contact"><h2 class="section-title">Contact</h2>${contactList(ctx, { icons: false })}</section>` : ""}
         ${sections(ctx, ctx.side, { skills: { style: "inline" }, languages: { style: "text" } })}
      </aside>
      <div class="main">${sections(ctx, ctx.main, { projects: { layout: "list" } })}</div>
   </div>
</main>`;
   },

   css: () => `
:root { --ink: #121212; --text: #2b2a28; --muted: #77726b; --line: #e8e1d7; }
body { font-family: Jost, "Segoe UI", Arial, sans-serif; font-weight: 400; color: var(--text); font-size: ${s(9.5, "pt")}; line-height: 1.6; }
h1, h2, h3 { color: var(--ink); font-weight: 400; }
.page { padding: ${s(17, "mm")} ${s(17, "mm")} ${s(14, "mm")}; background: #fff; counter-reset: section; }

.masthead { display: flex; align-items: center; gap: ${s(7, "mm")}; padding-bottom: ${s(7, "mm")}; border-bottom: 0.25mm solid var(--line); }
.monogram, .photo { width: ${s(22, "mm")}; height: ${s(22, "mm")}; border-radius: 50%; flex: none; }
.monogram { display: grid; place-items: center; border: 0.3mm solid var(--accent); font-family: "Bodoni Moda", Didot, serif; font-style: italic;
   font-size: ${s(17, "pt")}; letter-spacing: 0.02em; color: var(--accent); box-shadow: inset 0 0 0 1.2mm #fff, inset 0 0 0 1.45mm var(--line); }
.photo { object-fit: cover; box-shadow: 0 0 0 0.9mm #fff, 0 0 0 1.15mm var(--accent); }
h1 { font-family: "Bodoni Moda", Didot, "Times New Roman", serif; font-size: ${s(36, "pt")}; font-weight: 400; letter-spacing: -0.01em; line-height: 1; }
.headline { margin-top: ${s(2.8, "mm")}; font-size: ${s(8.4, "pt")}; font-weight: 500; text-transform: uppercase; letter-spacing: 0.34em; color: var(--accent); }

.columns { display: grid; grid-template-columns: 50mm 1fr; gap: ${s(10, "mm")}; margin-top: ${s(8, "mm")}; }
.side { border-right: 0.25mm solid var(--line); padding-right: ${s(7, "mm")}; }
.side .section + .section { margin-top: ${s(7, "mm")}; }
.side .section-title { font-family: Jost, sans-serif; font-size: ${s(7.4, "pt")}; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3em; color: var(--accent); margin-bottom: ${s(2.8, "mm")}; }
.contact { font-size: ${s(8.6, "pt")}; line-height: 1.8; overflow-wrap: anywhere; }
.contact a:hover { color: var(--accent); }
.skill-line + .skill-line { margin-top: ${s(2.4, "mm")}; }
.skill-line strong { display: block; font-family: "Bodoni Moda", serif; font-style: italic; font-weight: 400; font-size: ${s(10, "pt")}; color: var(--ink); }
.skill-line { font-size: ${s(8.6, "pt")}; color: var(--text); }
.languages li + li { margin-top: ${s(1.2, "mm")}; }
.lang-name { color: var(--ink); }
.lang-fluency { display: block; font-style: normal; font-size: 0.9em; color: var(--muted); }
.edu + .edu { margin-top: ${s(3, "mm")}; }
.edu-title { font-family: "Bodoni Moda", serif; font-size: ${s(10.4, "pt")}; }
.edu-degree, .edu-meta, .edu-courses { font-size: ${s(8.6, "pt")}; }
.edu-meta { color: var(--muted); }
.side .simple li { font-size: ${s(8.6, "pt")}; }
.side .simple li + li { margin-top: ${s(1.6, "mm")}; }
.side strong { font-weight: 500; color: var(--ink); }

.main .section + .section { margin-top: ${s(7.5, "mm")}; }
.main .section-title { font-family: "Bodoni Moda", serif; font-style: italic; font-size: ${s(16, "pt")}; letter-spacing: -0.005em; margin-bottom: ${s(3.6, "mm")};
   display: flex; align-items: baseline; gap: 3.5mm; }
.main .section-title::before { counter-increment: section; content: counter(section, decimal-leading-zero); font-family: Jost, sans-serif; font-style: normal;
   font-size: ${s(7.4, "pt")}; font-weight: 500; letter-spacing: 0.24em; color: var(--accent); }
.main .section-title::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); transform: translateY(-1mm); }
.summary { font-size: ${s(10.4, "pt")}; font-weight: 300; line-height: 1.75; color: var(--ink); }
.summary strong { font-weight: 500; }

.entry + .entry { margin-top: ${s(5, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
.entry-title, .project-title { font-family: "Bodoni Moda", serif; font-size: ${s(12.4, "pt")}; letter-spacing: -0.005em; }
.entry-org { margin-top: 0.4mm; font-size: ${s(8.2, "pt")}; font-weight: 500; text-transform: uppercase; letter-spacing: 0.18em; color: var(--accent); }
.entry-location, .keywords { text-transform: none; letter-spacing: 0.02em; font-weight: 400; color: var(--muted); }
.entry-location::before, .keywords::before { content: "/"; margin: 0 2mm; color: var(--line); }
.entry-date { font-size: ${s(8.4, "pt")}; letter-spacing: 0.06em; color: var(--muted); white-space: nowrap; }
.entry-summary { margin-top: ${s(1.4, "mm")}; }
.bullets { margin-top: ${s(1.8, "mm")}; }
.bullets li { position: relative; padding-left: 5mm; }
.bullets li + li { margin-top: ${s(0.9, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 0; top: 0.78em; width: 2.6mm; height: 0.25mm; background: var(--accent); }

.projects--list .project + .project { margin-top: ${s(4.5, "mm")}; }
.project-links a { font-family: Jost, sans-serif; font-size: ${s(7.6, "pt")}; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin-left: 2.5mm; }
.project-tagline { font-size: ${s(8.2, "pt")}; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-top: 0.4mm; }
.project-desc { margin-top: ${s(1.2, "mm")}; }
.project-keywords { margin-top: ${s(1.2, "mm")}; font-size: ${s(8.4, "pt")}; color: var(--muted); }
.main .simple li + li { margin-top: ${s(1.6, "mm")}; }
.main .simple strong { font-weight: 500; color: var(--ink); }
.muted { color: var(--muted); }
blockquote { font-family: "Bodoni Moda", serif; font-style: italic; }
cite { display: block; font-style: normal; font-size: 0.85em; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-top: 1mm; }
`,
};
