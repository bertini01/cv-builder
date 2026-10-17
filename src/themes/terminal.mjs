// Terminal: for developers. Window chrome, a `$ whoami` prompt, `##` section
// titles and code-token skills, yet light enough to print cleanly.
import { escapeHtml as esc } from "../format.mjs";
import { contactItems, photo, s, sections } from "./shared.mjs";

const contactTable = (ctx) =>
   `<dl class="contact">${contactItems(ctx)
      .map(
         (item) =>
            `<div><dt>${esc(item.key === "url" ? "web" : item.key)}</dt><dd>${
               item.href ? `<a href="${esc(item.href)}">${esc(item.label)}</a>` : esc(item.label)
            }</dd></div>`
      )
      .join("")}</dl>`;

export default {
   id: "terminal",
   name: "Terminal",
   description: "Developer flavour: monospace headings, prompt-style header, code-token skills.",
   accent: "#059669",
   fonts: "family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700",
   labels: { live: "demo", source: "repo" },

   render: (ctx) => {
      const { basics } = ctx.resume;
      const slug = basics.name.toLowerCase().split(/\s+/)[0] || "me";
      return `<main class="page">
   <div class="window">
      <span></span><span></span><span></span>
      <p>~/${esc(slug)}/cv — zsh</p>
   </div>
   <header class="masthead">
      <div class="identity">
         <p class="prompt"><b>$</b> whoami</p>
         <h1>${esc(basics.name)}<i class="caret"></i></h1>
         ${basics.label ? `<p class="headline">// ${esc(basics.label)}</p>` : ""}
      </div>
      ${photo(ctx)}
   </header>
   ${contactTable(ctx)}
   ${sections(ctx, ctx.order, { skills: { style: "chips" }, languages: { style: "bars" }, projects: { layout: "grid" } })}
</main>`;
   },

   css: () => `
:root { --ink: #0f1712; --text: #2f3b35; --muted: #6a7770; --line: #e3e9e5; --code-bg: color-mix(in srgb, var(--accent) 7%, white); }
body { font-family: "IBM Plex Sans", "Segoe UI", Arial, sans-serif; color: var(--text); font-size: ${s(8.5, "pt")}; line-height: 1.45; }
h1, h2, h3, .mono { font-family: "JetBrains Mono", ui-monospace, Consolas, monospace; color: var(--ink); }
.page { padding: ${s(10, "mm")} ${s(13, "mm")} ${s(10, "mm")}; background: #fff; }

.window { display: flex; align-items: center; gap: 1.6mm; padding: 2mm 3mm; border-radius: 2mm 2mm 0 0; background: #f3f5f4; border: 0.25mm solid var(--line); }
.window span { width: 2.6mm; height: 2.6mm; border-radius: 50%; background: #f87171; }
.window span:nth-child(2) { background: #fbbf24; }
.window span:nth-child(3) { background: #34d399; }
.window p { flex: 1; text-align: center; font-family: "JetBrains Mono", monospace; font-size: 7.2pt; color: var(--muted); margin-right: 9mm; }

.masthead { display: flex; justify-content: space-between; align-items: center; gap: 6mm; padding: ${s(4, "mm")} ${s(5, "mm")} ${s(3, "mm")};
   border: 0.25mm solid var(--line); border-top: 0; }
.prompt { font-family: "JetBrains Mono", monospace; font-size: ${s(8.4, "pt")}; color: var(--muted); }
.prompt b { color: var(--accent); }
h1 { font-size: ${s(21, "pt")}; font-weight: 700; letter-spacing: -0.03em; margin-top: ${s(1, "mm")}; line-height: 1.1; }
.caret { display: inline-block; width: 0.5em; height: 0.85em; margin-left: 1.4mm; background: var(--accent); vertical-align: -0.08em; }
.headline { font-family: "JetBrains Mono", monospace; color: var(--accent); font-size: ${s(9.4, "pt")}; margin-top: ${s(1.2, "mm")}; }
.photo { width: ${s(19, "mm")}; height: ${s(19, "mm")}; border-radius: 2mm; object-fit: cover; border: 0.4mm solid var(--line); }

.contact { display: grid; grid-template-columns: repeat(3, 1fr); padding: ${s(2.4, "mm")} ${s(5, "mm")}; border: 0.25mm solid var(--line); border-top: 0;
   border-radius: 0 0 2mm 2mm; background: #fafbfa; font-size: ${s(7.9, "pt")}; gap: ${s(1, "mm")} 4mm; }
.contact div { display: flex; gap: 2mm; min-width: 0; }
.contact dt { font-family: "JetBrains Mono", monospace; color: var(--accent); flex: none; }
.contact dt::after { content: ":"; color: var(--muted); }
.contact dd { overflow-wrap: anywhere; }

.section { margin-top: ${s(3.8, "mm")}; }
.section-title { font-size: ${s(10.4, "pt")}; font-weight: 700; margin-bottom: ${s(2.4, "mm")}; display: flex; align-items: center; gap: 2.5mm; }
.section-title::before { content: "##"; color: var(--accent); }
.section-title::after { content: ""; flex: 1; border-bottom: 0.3mm dashed var(--line); }
.summary { font-size: ${s(9.2, "pt")}; }

.entry + .entry { margin-top: ${s(2.6, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.entry-title, .project-title { font-size: ${s(9.6, "pt")}; font-weight: 700; }
.entry-org { font-family: "JetBrains Mono", monospace; font-size: ${s(8.2, "pt")}; color: var(--accent); }
.entry-org::before { content: "@ "; color: var(--muted); }
.entry-location, .keywords { color: var(--muted); }
.entry-location::before, .keywords::before { content: "  // "; white-space: pre; }
.entry-date { font-family: "JetBrains Mono", monospace; font-size: ${s(7.6, "pt")}; color: var(--muted); white-space: nowrap; }
.entry-date::before { content: "["; }
.entry-date::after { content: "]"; }
.entry-summary { margin-top: ${s(0.9, "mm")}; color: var(--muted); }
.bullets { margin-top: ${s(1, "mm")}; }
.bullets li { position: relative; padding-left: 4mm; margin-top: ${s(0.4, "mm")}; }
.bullets li::before { content: ">"; position: absolute; left: 0.3mm; font-family: "JetBrains Mono", monospace; font-weight: 700; color: var(--accent); }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(2.8, "mm")} ${s(5, "mm")}; }
.project { padding: ${s(2.4, "mm")} ${s(3, "mm")}; border: 0.25mm solid var(--line); border-radius: 1.6mm; background: #fcfdfc; }
.project-title::before { content: "./"; color: var(--accent); }
.project-links a { font-family: "JetBrains Mono", monospace; font-size: ${s(7, "pt")}; font-weight: 500; color: var(--accent); margin-left: 1.6mm; }
.project-tagline { font-family: "JetBrains Mono", monospace; font-size: ${s(7.6, "pt")}; color: var(--muted); }
.project-desc { margin-top: ${s(0.7, "mm")}; }
.project-keywords { margin-top: ${s(0.8, "mm")}; font-family: "JetBrains Mono", monospace; font-size: ${s(7.2, "pt")}; color: var(--accent); }

.skills--chips { display: grid; grid-template-columns: repeat(2, 1fr); gap: ${s(2, "mm")} ${s(6, "mm")}; }
.skill-name { font-size: ${s(8.4, "pt")}; font-weight: 700; }
.skill-name::before { content: "const "; color: var(--muted); font-weight: 400; }
.skill-level { color: var(--muted); font-weight: 400; margin-left: 1.5mm; }
.chips { display: flex; flex-wrap: wrap; gap: 1.1mm; margin-top: ${s(1, "mm")}; }
.chips li { font-family: "JetBrains Mono", monospace; font-size: ${s(7.2, "pt")}; padding: 0.3mm 1.6mm; border-radius: 1mm; background: var(--code-bg); color: var(--accent-ink); border: 0.25mm solid var(--accent-line); }
.edu + .edu { margin-top: ${s(2.4, "mm")}; }
.edu-title { font-size: ${s(9, "pt")}; }
.edu-degree { color: var(--text); }
.edu-meta, .edu-courses { font-family: "JetBrains Mono", monospace; font-size: ${s(7.6, "pt")}; color: var(--muted); }
.languages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm 5mm; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { display: block; font-style: normal; color: var(--muted); font-size: 0.9em; }
.bar { display: block; height: 1.1mm; border-radius: 1mm; background: var(--line); margin-top: 1mm; overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--accent); }
.simple li + li { margin-top: ${s(1, "mm")}; }
.simple strong { color: var(--ink); }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); }
`,
};
