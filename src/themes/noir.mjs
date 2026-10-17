// Noir: bold and contemporary. A full-height dark sidebar holds the photo,
// contact details and skills; the bright main column tells the story.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections } from "./shared.mjs";

export default {
   id: "noir",
   name: "Noir",
   description: "Bold dark sidebar with Space Grotesk headings. Great with a photo.",
   accent: "#38bdf8",
   fonts: "family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700",
   side: ["skills", "languages", "education", "certificates", "interests"],

   render: (ctx) => {
      const { basics } = ctx.resume;
      return `<main class="page">
   <aside class="side">
      ${photo(ctx)}
      <h1>${esc(basics.name)}</h1>
      ${basics.label ? `<p class="headline">${esc(basics.label)}</p>` : ""}
      ${contactList(ctx)}
      ${sections(ctx, ctx.side, { skills: { style: "chips" }, languages: { style: "bars" } })}
   </aside>
   <div class="main">
      ${sections(ctx, ctx.main, { projects: { layout: "list" } })}
   </div>
</main>`;
   },

   css: () => `
:root { --ink: #0b1120; --text: #334155; --muted: #64748b; --line: #e2e8f0; --night: #0f172a; --night-2: #1e293b; --on-night: #cbd5e1; }
body { font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--text); font-size: ${s(8.7, "pt")}; line-height: 1.48; }
h1, h2, h3 { font-family: "Space Grotesk", Inter, sans-serif; color: var(--ink); }
.page { display: grid; grid-template-columns: 66mm 1fr; background: #fff; }

.side { background: var(--night); color: var(--on-night); padding: ${s(13, "mm")} ${s(7, "mm")} ${s(10, "mm")}; }
.photo { width: ${s(30, "mm")}; height: ${s(30, "mm")}; border-radius: 50%; object-fit: cover; margin-bottom: ${s(5, "mm")};
   box-shadow: 0 0 0 1mm var(--night), 0 0 0 1.5mm var(--accent); }
.side h1 { color: #fff; font-size: ${s(21, "pt")}; font-weight: 700; line-height: 1.08; letter-spacing: -0.02em; }
.headline { margin-top: ${s(1.8, "mm")}; color: var(--accent); font-family: "Space Grotesk", sans-serif; font-weight: 600; font-size: ${s(10, "pt")}; }
.contact { margin-top: ${s(5, "mm")}; display: grid; gap: ${s(1.8, "mm")}; font-size: ${s(7.9, "pt")}; }
.contact-item { display: flex; align-items: center; gap: 2.2mm; word-break: break-word; }
.contact-item .icon { width: 3.4mm; height: 3.4mm; color: var(--accent); }
.side .section { margin-top: ${s(6, "mm")}; }
.side .section-title { color: #fff; font-size: ${s(8, "pt")}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: ${s(2.6, "mm")};
   display: flex; align-items: center; gap: 2mm; }
.side .section-title::before { content: ""; width: 3mm; height: 3mm; border-radius: 1mm; background: var(--accent); }
.side .skill-group + .skill-group { margin-top: ${s(2.6, "mm")}; }
.side .skill-name { color: #fff; font-size: ${s(8.4, "pt")}; font-weight: 600; }
.side .skill-level { font-family: Inter, sans-serif; color: var(--on-night); font-weight: 400; font-size: 0.85em; margin-left: 1.5mm; }
.side .chips { display: flex; flex-wrap: wrap; gap: 1.2mm; margin-top: ${s(1.3, "mm")}; }
.side .chips li { font-size: ${s(7.4, "pt")}; padding: 0.35mm 2mm; border-radius: 1.2mm; background: var(--night-2); color: #e2e8f0; border: 0.25mm solid #334155; }
.side .languages li + li { margin-top: ${s(2, "mm")}; }
.side .lang-name { color: #fff; font-weight: 600; }
.side .lang-fluency { font-style: normal; color: var(--on-night); font-weight: 400; margin-left: 1mm; }
.side .bar { display: block; height: 1.2mm; border-radius: 1mm; background: var(--night-2); margin-top: 1mm; overflow: hidden; }
.side .bar i { display: block; height: 100%; border-radius: 1mm; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 50%, white)); }
.side .edu + .edu { margin-top: ${s(2.6, "mm")}; }
.side .edu-title { color: #fff; font-size: ${s(8.6, "pt")}; }
.side .edu-degree, .side .edu-courses { font-size: ${s(7.9, "pt")}; }
.side .edu-meta { color: var(--accent); font-size: ${s(7.8, "pt")}; margin-top: 0.3mm; }
.side .simple li { font-size: ${s(8, "pt")}; }
.side .simple li + li { margin-top: ${s(1.2, "mm")}; }
.side strong { color: #fff; }

.main { padding: ${s(13, "mm")} ${s(12, "mm")} ${s(10, "mm")} ${s(10, "mm")}; }
.main .section + .section { margin-top: ${s(5, "mm")}; }
.main .section-title { font-size: ${s(12, "pt")}; font-weight: 700; letter-spacing: -0.01em; margin-bottom: ${s(2.8, "mm")};
   display: flex; align-items: center; gap: 3mm; }
.main .section-title::after { content: ""; flex: 1; height: 0.6mm; border-radius: 1mm; background: linear-gradient(90deg, var(--accent), transparent); }
.summary { font-size: ${s(9.2, "pt")}; line-height: 1.6; }

.entry { position: relative; padding-left: 4.5mm; border-left: 0.35mm solid var(--line); }
.entry::before { content: ""; position: absolute; left: -1.25mm; top: 1.4mm; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: #fff; border: 0.5mm solid var(--accent); }
.entry + .entry { margin-top: ${s(1, "mm")}; padding-top: ${s(2.6, "mm")}; }
.entry + .entry::before { top: calc(1.4mm + ${s(2.6, "mm")}); }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.entry-title, .project-title { font-size: ${s(10, "pt")}; font-weight: 600; }
.entry-org { font-weight: 600; color: var(--accent-ink); font-size: ${s(8.6, "pt")}; }
.entry-location, .keywords { font-weight: 500; color: var(--muted); font-size: ${s(7.8, "pt")}; }
.entry-location::before, .keywords::before { content: " · "; }
.entry-date { font-size: ${s(7.8, "pt")}; font-weight: 600; color: var(--night); background: var(--accent-soft); padding: 0.3mm 1.8mm; border-radius: 1mm; white-space: nowrap; }
.entry-summary { margin-top: ${s(1, "mm")}; color: var(--muted); }
.bullets { list-style: none; margin-top: ${s(1.1, "mm")}; }
.bullets li { position: relative; padding-left: 3.6mm; margin-top: ${s(0.4, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 0.4mm; top: 0.62em; width: 1.4mm; height: 0.35mm; background: var(--accent); }

.projects--list .project + .project { margin-top: ${s(3, "mm")}; }
.project-links a { font-family: Inter, sans-serif; font-size: ${s(7.4, "pt")}; font-weight: 600; color: var(--accent-ink); margin-left: 2mm; }
.project-tagline { color: var(--accent-ink); font-weight: 500; font-size: ${s(8.2, "pt")}; }
.project-desc { margin-top: ${s(0.7, "mm")}; }
.project-keywords { margin-top: ${s(0.8, "mm")}; color: var(--muted); font-size: ${s(7.8, "pt")}; font-weight: 500; }
.main .simple li + li { margin-top: ${s(1.2, "mm")}; }
.main .simple strong { color: var(--ink); }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); }
`,
};
