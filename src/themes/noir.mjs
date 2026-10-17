// Noir: bold and contemporary. A deep-ink sidebar holds the photo, contact
// details and skills; the bright main column tells the story.
import { escapeHtml as esc } from "../format.mjs";
import { contactList, photo, s, sections } from "./shared.mjs";

export default {
   id: "noir",
   name: "Noir",
   description: "Deep-ink sidebar with Space Grotesk headings. Striking with a photo.",
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
:root { --ink: #0b1120; --text: #2d3748; --muted: #64748b; --line: #e5e9f0; --night: #0e1424; --night-2: #19223a; --on-night: #c3cad8; }
body { font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--text); font-size: ${s(9.5, "pt")}; line-height: 1.52; }
h1, h2, h3 { font-family: "Space Grotesk", Inter, sans-serif; color: var(--ink); }
.page { display: grid; grid-template-columns: 68mm 1fr; background: #fff; }

.side { background: radial-gradient(90mm 70mm at 30% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%), var(--night);
   color: var(--on-night); padding: ${s(15, "mm")} ${s(8, "mm")} ${s(12, "mm")}; }
.photo { width: ${s(32, "mm")}; height: ${s(32, "mm")}; border-radius: 50%; object-fit: cover; margin-bottom: ${s(6, "mm")};
   box-shadow: 0 0 0 1.1mm var(--night), 0 0 0 1.5mm var(--accent); }
.side h1 { color: #fff; font-size: ${s(23, "pt")}; font-weight: 700; line-height: 1.05; letter-spacing: -0.025em; }
.headline { margin-top: ${s(2.2, "mm")}; color: var(--accent); font-family: "Space Grotesk", sans-serif; font-weight: 500; font-size: ${s(10.5, "pt")}; }
.contact { margin-top: ${s(6, "mm")}; display: grid; gap: ${s(2.2, "mm")}; font-size: ${s(8.4, "pt")}; }
.contact-item { display: flex; align-items: center; gap: 2.4mm; overflow-wrap: anywhere; }
.contact-item .icon { width: 3.4mm; height: 3.4mm; color: var(--accent); }
.side .section { margin-top: ${s(7, "mm")}; }
.side .section-title { color: #fff; font-size: ${s(8.2, "pt")}; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: ${s(3, "mm")}; }
.side .section-title::after { content: ""; display: block; width: 7mm; height: 0.5mm; margin-top: 1.6mm; background: var(--accent); }
.side .skill-group + .skill-group { margin-top: ${s(3, "mm")}; }
.side .skill-name { color: #fff; font-size: ${s(8.8, "pt")}; font-weight: 500; }
.side .skill-level { font-family: Inter, sans-serif; color: var(--on-night); font-weight: 400; margin-left: 1.5mm; }
.side .chips { display: flex; flex-wrap: wrap; gap: 1.3mm; margin-top: ${s(1.6, "mm")}; }
.side .chips li { font-size: ${s(7.9, "pt")}; padding: 0.5mm 2.2mm; border-radius: 1.4mm; background: var(--night-2); color: #e2e8f0; border: 0.25mm solid #2a3553; }
.side .languages li + li { margin-top: ${s(2.4, "mm")}; }
.side .lang-name { color: #fff; font-weight: 500; font-size: ${s(9, "pt")}; }
.side .lang-fluency { font-style: normal; color: var(--on-night); margin-left: 1.2mm; font-size: 0.9em; }
.side .bar { display: block; height: 1mm; border-radius: 1mm; background: var(--night-2); margin-top: 1.4mm; overflow: hidden; }
.side .bar i { display: block; height: 100%; border-radius: 1mm; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 45%, white)); }
.side .edu + .edu { margin-top: ${s(3, "mm")}; }
.side .edu-title { color: #fff; font-size: ${s(9, "pt")}; font-weight: 500; }
.side .edu-degree, .side .edu-courses { font-size: ${s(8.4, "pt")}; }
.side .edu-meta { color: var(--accent); font-size: ${s(8.2, "pt")}; margin-top: 0.4mm; }
.side .simple li { font-size: ${s(8.6, "pt")}; }
.side .simple li + li { margin-top: ${s(1.6, "mm")}; }
.side strong { color: #fff; font-weight: 500; }

.main { padding: ${s(15, "mm")} ${s(14, "mm")} ${s(12, "mm")} ${s(11, "mm")}; }
.main .section + .section { margin-top: ${s(6.5, "mm")}; }
.main .section-title { font-size: ${s(13.5, "pt")}; font-weight: 600; letter-spacing: -0.015em; margin-bottom: ${s(3.6, "mm")}; }
.main .section-title::after { content: ""; display: block; width: 9mm; height: 0.7mm; border-radius: 1mm; margin-top: 1.6mm; background: var(--accent); }
.summary { font-size: ${s(10, "pt")}; line-height: 1.65; color: var(--ink); }

.entry { position: relative; padding-left: 5mm; }
.entry::before { content: ""; position: absolute; left: 0.2mm; top: 0; bottom: -4.5mm; width: 0.3mm; background: var(--line); }
.entry:last-child::before { bottom: 0; }
.entry::after { content: ""; position: absolute; left: -0.95mm; top: 1.6mm; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: #fff; border: 0.5mm solid var(--accent); }
.entry + .entry { margin-top: ${s(4.5, "mm")}; }
.entry-head, .project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.entry-title, .project-title { font-size: ${s(11, "pt")}; font-weight: 600; letter-spacing: -0.01em; }
.entry-org { margin-top: 0.4mm; font-weight: 500; color: var(--accent-ink); font-size: ${s(9.2, "pt")}; }
.entry-location, .keywords { font-weight: 400; color: var(--muted); font-size: ${s(8.4, "pt")}; }
.entry-location::before, .keywords::before { content: "·"; margin: 0 1.8mm; }
.entry-date { font-size: ${s(8.2, "pt")}; font-weight: 500; color: var(--ink); background: var(--accent-soft); padding: 0.4mm 2mm; border-radius: 1.2mm; white-space: nowrap; }
.entry-summary { margin-top: ${s(1.2, "mm")}; color: var(--muted); }
.bullets { margin-top: ${s(1.6, "mm")}; }
.bullets li { position: relative; padding-left: 4mm; }
.bullets li + li { margin-top: ${s(0.8, "mm")}; }
.bullets li::before { content: ""; position: absolute; left: 0.3mm; top: 0.7em; width: 1.6mm; height: 0.35mm; background: var(--accent); }

.projects--list .project + .project { margin-top: ${s(4, "mm")}; }
.project-links a { font-family: Inter, sans-serif; font-size: ${s(7.8, "pt")}; font-weight: 600; color: var(--accent-ink); margin-left: 2mm; }
.project-tagline { color: var(--accent-ink); font-weight: 500; font-size: ${s(8.8, "pt")}; }
.project-desc { margin-top: ${s(1, "mm")}; }
.project-keywords { margin-top: ${s(1, "mm")}; color: var(--muted); font-size: ${s(8.4, "pt")}; }
.main .simple li + li { margin-top: ${s(1.5, "mm")}; }
.main .simple strong { color: var(--ink); }
.muted { color: var(--muted); }
blockquote { font-style: italic; }
cite { display: block; font-style: normal; font-weight: 600; color: var(--ink); }
`,
};
