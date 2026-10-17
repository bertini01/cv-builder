// Turns a normalised resume + options into a complete, standalone HTML page.
import { SECTION_IDS, resolveLabels } from "./options.mjs";
import { escapeHtml as esc } from "./format.mjs";
import { getTheme } from "./themes/index.mjs";

export const PAPER = {
   a4: { css: "A4", width: "210mm", height: "297mm" },
   letter: { css: "letter", width: "215.9mm", height: "279.4mm" },
};

const hasContent = (resume, id) => (id === "summary" ? Boolean(resume.basics.summary) : resume[id]?.length > 0);

export const createContext = (resume, options) => {
   const theme = getTheme(options.theme);
   const hidden = new Set(options.hide ?? []);
   const preferred = options.sections?.length ? options.sections : theme.order ?? SECTION_IDS;
   // Sections not named in a custom order are appended, so nothing is lost silently.
   const ordered = [...preferred, ...SECTION_IDS.filter((id) => !preferred.includes(id) && !options.sections?.length)];
   const order = ordered.filter((id, i) => ordered.indexOf(id) === i && !hidden.has(id) && hasContent(resume, id));
   const side = theme.side ?? [];

   return {
      resume,
      options,
      theme,
      accent: options.accent || theme.accent,
      labels: resolveLabels(options, theme.labels),
      photo: options.photo !== false && Boolean(resume.basics.image),
      order,
      main: order.filter((id) => !side.includes(id)),
      // Without a custom order, sidebar sections follow the theme's own ordering.
      side: options.sections?.length ? order.filter((id) => side.includes(id)) : side.filter((id) => order.includes(id)),
   };
};

const BASE_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; -webkit-text-size-adjust: 100%; }
body { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }
img { display: block; max-width: 100%; }
.icon { width: 1em; height: 1em; flex: none; }
.page { width: var(--page-w); min-height: var(--page-h); position: relative; font-variant-numeric: tabular-nums;
   /* Repeat the page padding on every printed page of a multi-page CV. */
   -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.entry, .project, .edu, .skill-group, .simple li { break-inside: avoid; }
.section-title { break-after: avoid; }
code { font-family: "JetBrains Mono", ui-monospace, Consolas, monospace; font-size: 0.92em; }
/* A page box of exactly one page height can round onto a blank page. */
@media print { .page { min-height: calc(var(--page-h) - 0.6mm); } }
@media screen {
   body { background: #dfe4ee; padding: 32px 0; }
   .page { margin: 0 auto; box-shadow: 0 30px 80px -30px rgba(15, 23, 42, 0.35); }
   /* Dashed guides where each printed page ends. */
   .page::after { content: ""; position: absolute; inset: 0 0 3px; pointer-events: none; z-index: 50;
      background: repeating-linear-gradient(to bottom, transparent 0 calc(var(--page-h) - 1px), rgba(239, 68, 68, 0.7) calc(var(--page-h) - 1px) var(--page-h)); }
}
`;

export const renderDocument = (resume, options) => {
   const ctx = createContext(resume, options);
   const { theme, accent } = ctx;
   const paper = PAPER[String(options.paper).toLowerCase()] ?? PAPER.a4;
   const density = Number(options.density) || 1;
   const fonts =
      options.webFonts === false || !theme.fonts
         ? ""
         : `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${theme.fonts}&display=block">`;
   const { name, label } = resume.basics;

   return `<!doctype html>
<html lang="${esc(options.locale || "en")}" data-theme="${esc(theme.id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)}${label ? ` | ${esc(label)}` : ""}</title>
<meta name="author" content="${esc(name)}">
<meta name="generator" content="cvforge">
${fonts}
<style>
@page { size: ${paper.css}; margin: 0; }
:root { --d: ${density}; --accent: ${esc(accent)}; --page-w: ${paper.width}; --page-h: ${paper.height};
   --accent-soft: color-mix(in srgb, var(--accent) 10%, white);
   --accent-line: color-mix(in srgb, var(--accent) 28%, white);
   --accent-ink: color-mix(in srgb, var(--accent) 82%, black); }
${BASE_CSS}
${theme.css(ctx)}
</style>
</head>
<body>
${theme.render(ctx)}
</body>
</html>`;
};
