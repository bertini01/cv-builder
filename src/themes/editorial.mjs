// Editorial: a magazine spread. An oversized serif name over newspaper rules,
// an italic lede with a drop cap, and dates set in a left margin column.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections, splitSections } from "./shared.mjs";

export default {
   id: "editorial",
   name: "Editorial",
   description: "A magazine spread: oversized serif name, drop-cap lede, dates in the margin.",
   accent: "#a4161a",
   fonts: "family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Inter:wght@400;500;600",

   render: (ctx) => {
      const { basics } = ctx.resume;
      const { story, details } = splitSections(ctx.order);
      const opts = { skills: { style: "inline" }, languages: { style: "text" }, projects: { layout: "grid" } };
      return `<main class="page">
   <header class="masthead">
      <div class="identity">
         <h1>${esc(basics.name)}</h1>
         ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      </div>
      <div class="colophon">
         ${photo(ctx)}
         ${contactList(ctx, { icons: false })}
      </div>
   </header>
   ${sections(ctx, story, opts)}
   ${details.length ? `<div class="details">${sections(ctx, details, opts)}</div>` : ""}
</main>`;
   },

   css: () => `
:root { --ink: #141414; --text: #2a2a2a; --muted: #6f6a63; --line: #e6e0d6; --paper: #fffdf8; --margin-col: 30mm; }
body { font-family: Newsreader, Georgia, "Times New Roman", serif; color: var(--text); font-size: ${s(10.2, "pt")}; line-height: 1.48; }
h1, h2, h3 { color: var(--ink); font-weight: 500; }
.page { padding: ${s(14, "mm")} ${s(17, "mm")} ${s(13, "mm")}; background: var(--paper); }

.masthead { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: end; padding: ${s(4, "mm")} 0 ${s(5, "mm")};
   border-top: 1.4mm solid var(--ink); border-bottom: 0.3mm solid var(--ink); box-shadow: 0 1.2mm 0 -0.95mm var(--paper), 0 1.25mm 0 -0.95mm var(--ink); }
h1 { font-size: ${s(42, "pt")}; font-weight: 500; letter-spacing: -0.035em; line-height: 0.95; }
.headline { margin-top: ${s(2.6, "mm")}; font-size: ${s(14, "pt")}; font-style: italic; color: var(--accent); }
.colophon { display: flex; gap: 4mm; align-items: flex-end; }
.photo { width: ${s(22, "mm")}; height: ${s(27, "mm")}; object-fit: cover; filter: grayscale(0.2); }
.contact { font-family: Inter, sans-serif; font-size: ${s(7.8, "pt")}; line-height: 1.75; color: var(--text); text-align: right; letter-spacing: 0.01em; }
.contact a:hover { color: var(--accent); }

.section { margin-top: ${s(6, "mm")}; }
.section-title { font-family: Inter, sans-serif; font-size: ${s(7.6, "pt")}; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: var(--accent);
   display: flex; align-items: center; gap: 3mm; margin-bottom: ${s(3.4, "mm")}; }
.section-title::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); }

.section--summary .section-title { display: none; }
.summary { font-size: ${s(12.4, "pt")}; line-height: 1.5; font-style: italic; color: var(--ink); padding-left: calc(var(--margin-col) + 6mm); }
.summary::first-letter { float: left; font-style: normal; font-weight: 500; font-size: 3.2em; line-height: 0.82; padding: 0.05em 0.07em 0 0; color: var(--accent); }

/* Dates sit in the margin column; the rest of each entry flows to the right. */
.entry, .project-head { display: grid; grid-template-columns: var(--margin-col) 1fr; column-gap: 6mm; }
.entry-head, .entry-heading { display: contents; }
.entry-date { grid-column: 1; grid-row: 1 / span 2; font-family: Inter, sans-serif; font-size: ${s(7.8, "pt")}; letter-spacing: 0.04em; color: var(--muted); padding-top: 0.9mm; }
.entry-title, .entry-org, .entry-summary, .entry .bullets { grid-column: 2; }
.entry + .entry { margin-top: ${s(4.6, "mm")}; }
.entry-title { font-size: ${s(12.2, "pt")}; font-weight: 500; letter-spacing: -0.01em; line-height: 1.25; }
.entry-org { font-style: italic; color: var(--accent); font-size: ${s(10.4, "pt")}; }
.entry-org a { color: var(--accent); }
.entry-location, .keywords { font-family: Inter, sans-serif; font-style: normal; font-size: ${s(7.8, "pt")}; color: var(--muted); letter-spacing: 0.02em; }
.entry-location::before, .keywords::before { content: "—"; margin: 0 1.8mm; color: var(--line); }
.entry-summary { margin-top: ${s(1, "mm")}; }
.bullets { margin-top: ${s(1.4, "mm")}; }
.bullets li { position: relative; padding-left: 4.4mm; }
.bullets li + li { margin-top: ${s(0.6, "mm")}; }
.bullets li::before { content: "•"; position: absolute; left: 0.6mm; color: var(--accent); }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(4, "mm")} ${s(9, "mm")}; padding-left: calc(var(--margin-col) + 6mm); }
.project-head { display: block; }
.project-title { font-size: ${s(12, "pt")}; font-weight: 500; font-style: italic; }
.project-links a { font-family: Inter, sans-serif; font-style: normal; font-size: ${s(7.4, "pt")}; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-left: 2.2mm; }
.project-tagline { font-family: Inter, sans-serif; font-size: ${s(7.8, "pt")}; letter-spacing: 0.04em; color: var(--muted); }
.project-desc { margin-top: ${s(1, "mm")}; }
.project-keywords { margin-top: ${s(1, "mm")}; font-family: Inter, sans-serif; font-size: ${s(7.6, "pt")}; color: var(--muted); }

.details { columns: 2; column-gap: ${s(9, "mm")}; margin: ${s(6, "mm")} 0 0 calc(var(--margin-col) + 6mm); }
.details .section { break-inside: avoid; margin: 0 0 ${s(5, "mm")}; }
.details .section { margin-top: 0; }
.skills--inline { columns: 1; }
.skill-line { break-inside: avoid; margin-bottom: ${s(1.4, "mm")}; }
.skill-line strong { display: block; font-family: Inter, sans-serif; font-size: ${s(7.6, "pt")}; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink); font-weight: 600; }
.edu + .edu { margin-top: ${s(3, "mm")}; }
.edu-title { font-size: ${s(11.6, "pt")}; }
.edu-degree { font-style: italic; color: var(--accent); }
.edu-meta, .edu-courses { font-family: Inter, sans-serif; font-size: ${s(7.8, "pt")}; color: var(--muted); }
.languages { display: grid; gap: ${s(0.6, "mm")}; }
.lang-name { font-weight: 500; color: var(--ink); }
.lang-fluency { color: var(--muted); }
.simple li + li { margin-top: ${s(1.3, "mm")}; }
.simple strong { color: var(--ink); font-weight: 500; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-family: Inter, sans-serif; font-size: 0.8em; color: var(--ink); }
`,
};
