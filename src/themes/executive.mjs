// Executive: classic and composed. Centred serif masthead, gold double rules,
// small-caps section titles and navy ink. Made for senior and formal roles.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections } from "./shared.mjs";

export default {
   id: "executive",
   name: "Executive",
   description: "Classic serif elegance with a centred masthead and gold rules.",
   accent: "#1e3a5f",
   fonts: "family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600",

   render: (ctx) => {
      const { basics } = ctx.resume;
      return `<main class="page">
   <header class="masthead">
      ${photo(ctx)}
      <h1>${esc(basics.name)}</h1>
      ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      ${contactList(ctx, { icons: false })}
   </header>
   <div class="double-rule"></div>
   ${sections(ctx, ctx.order, { skills: { style: "inline" }, languages: { style: "text" }, projects: { layout: "grid" } })}
</main>`;
   },

   css: () => `
:root { --ink: #14202e; --text: #2e3540; --muted: #66707e; --gold: #b08d57; --line: #e7e1d6; }
body { font-family: "Source Serif 4", Georgia, "Times New Roman", serif; color: var(--text); font-size: ${s(8.8, "pt")}; line-height: 1.45; }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; color: var(--ink); font-weight: 600; }
.page { padding: ${s(12, "mm")} ${s(16, "mm")} ${s(10, "mm")}; background: #fffdf9; }

.masthead { text-align: center; }
.photo { width: ${s(20, "mm")}; height: ${s(20, "mm")}; border-radius: 50%; object-fit: cover; margin: 0 auto ${s(3.4, "mm")}; box-shadow: 0 0 0 0.6mm #fffdf9, 0 0 0 0.9mm var(--gold); }
h1 { font-size: ${s(26, "pt")}; font-weight: 600; letter-spacing: -0.01em; line-height: 1.05; color: var(--accent); }
.headline { margin-top: ${s(2, "mm")}; font-family: "Source Serif 4", serif; font-size: ${s(9, "pt")}; font-variant: small-caps; text-transform: lowercase;
   letter-spacing: 0.24em; color: var(--gold); font-weight: 600; }
.contact { display: flex; flex-wrap: wrap; justify-content: center; margin-top: ${s(3, "mm")}; font-size: ${s(8.4, "pt")}; color: var(--muted); }
.contact-item:not(:last-child)::after { content: "◆"; font-size: 0.55em; margin: 0 2.4mm; color: var(--gold); vertical-align: 0.25em; }

.double-rule { margin: ${s(3.8, "mm")} 0 ${s(0.6, "mm")}; height: 1.6mm; border-top: 0.45mm solid var(--gold); border-bottom: 0.2mm solid var(--gold); }

.section { margin-top: ${s(3.8, "mm")}; }
.section-title { display: flex; align-items: center; gap: 3mm; justify-content: center; font-size: ${s(9.4, "pt")};
   font-variant: small-caps; text-transform: lowercase; letter-spacing: 0.22em; color: var(--accent); margin-bottom: ${s(2.3, "mm")}; }
.section-title::before, .section-title::after { content: ""; flex: 1; height: 0.25mm; background: var(--line); }
.summary { text-align: center; font-size: ${s(9.4, "pt")}; font-style: italic; color: var(--ink); max-width: 158mm; margin: 0 auto; }

.entry + .entry { margin-top: ${s(2.9, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 5mm; }
.entry-title, .project-title { font-size: ${s(10.4, "pt")}; }
.entry-org { font-style: italic; color: var(--accent); font-size: ${s(9.4, "pt")}; }
.entry-location, .keywords { font-style: normal; color: var(--muted); font-size: ${s(8.4, "pt")}; }
.entry-location::before, .keywords::before { content: " · "; }
.entry-date { font-size: ${s(8.6, "pt")}; color: var(--muted); font-style: italic; white-space: nowrap; }
.entry-summary { margin-top: ${s(1, "mm")}; }
.bullets { margin-top: ${s(1.2, "mm")}; }
.bullets li { position: relative; padding-left: 4.4mm; margin-top: ${s(0.3, "mm")}; }
.bullets li::before { content: "◆"; position: absolute; left: 0.4mm; top: 0.15em; font-size: 0.6em; color: var(--gold); }

.projects--grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${s(3.4, "mm")} ${s(7, "mm")}; }
.project-links a { font-family: "Source Serif 4", serif; font-size: ${s(8, "pt")}; font-weight: 400; font-style: italic; color: var(--gold); margin-left: 2mm; }
.project-tagline { font-style: italic; color: var(--accent); }
.project-desc { margin-top: ${s(0.8, "mm")}; }
.project-keywords { margin-top: ${s(0.8, "mm")}; color: var(--muted); font-size: ${s(8.4, "pt")}; }

.skills--inline { columns: 2; column-gap: 9mm; }
.skill-line { break-inside: avoid; margin-bottom: ${s(1, "mm")}; }
.skill-line strong { color: var(--accent); font-weight: 600; }
.skill-line strong::after { content: " —"; color: var(--gold); }
.edu { text-align: center; }
.edu + .edu { margin-top: ${s(2.6, "mm")}; }
.edu-title { font-size: ${s(10, "pt")}; }
.edu-degree { font-style: italic; color: var(--accent); }
.edu-meta, .edu-courses { color: var(--muted); font-size: ${s(8.6, "pt")}; }
.languages { display: flex; flex-wrap: wrap; justify-content: center; gap: 1mm 8mm; }
.lang-name { font-weight: 600; color: var(--ink); }
.lang-fluency { color: var(--muted); }
.simple { text-align: center; }
.simple li + li { margin-top: ${s(1.1, "mm")}; }
.simple strong { color: var(--ink); font-weight: 600; }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--accent); }
`,
};
