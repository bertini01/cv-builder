// Build pipeline: resume -> HTML -> fitted layout -> PDF / HTML / PNG files.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { countPdfPages, openBrowser } from "./chrome.mjs";
import { MIN_DENSITY, fitScript } from "./fit.mjs";
import { slugify } from "./format.mjs";
import { renderDocument } from "./render.mjs";
import { loadResume } from "./resume.mjs";

export const outputBaseName = (options, resume) =>
   slugify(
      (options.output?.name ?? "{name} CV")
         .replace(/\{name\}/g, resume.basics.name || "cv")
         .replace(/\{theme\}/g, options.theme)
   ) || "cv";

const loadAt = async (browser, resume, options, density) => {
   const html = renderDocument(resume, { ...options, density });
   await browser.load(html);
   await browser.media("print");
   return html;
};

export const build = async (resumePath, options, { log = () => {} } = {}) => {
   const { resume, warnings } = await loadResume(resumePath, options);
   const formats = options.output?.formats?.length ? options.output.formats : ["pdf"];
   const outDir = resolve(options.output?.dir ?? "dist");
   const base = outputBaseName(options, resume);
   const maxPages = Number(options.maxPages) || 0;
   mkdirSync(outDir, { recursive: true });

   const browser = await openBrowser();
   try {
      // 1. Measure and fit in the page.
      await loadAt(browser, resume, options, Number(options.density) || 1);
      const fit = await browser.evaluate(fitScript(options));
      let density = fit.density;
      let html = await loadAt(browser, resume, options, density);

      // 2. Print, then verify the real page count; nudge if print rounding pushed it over.
      let pdf;
      let pages = fit.pages;
      if (formats.includes("pdf")) {
         pdf = await browser.pdf();
         pages = countPdfPages(pdf);
         for (let attempt = 0; options.fit !== false && maxPages && pages > maxPages && attempt < 4 && density > MIN_DENSITY; attempt++) {
            density = Math.max(MIN_DENSITY, Math.round((density - 0.015) * 1000) / 1000);
            html = await loadAt(browser, resume, options, density);
            pdf = await browser.pdf();
            pages = countPdfPages(pdf);
         }
      }

      const files = [];
      const write = (format, data) => {
         const path = join(outDir, `${base}.${format}`);
         writeFileSync(path, data);
         files.push({ format, path, bytes: Buffer.byteLength(data) });
      };
      if (formats.includes("html")) write("html", html);
      if (pdf) write("pdf", pdf);
      if (formats.includes("png")) write("png", await browser.screenshot({ scale: Number(options.output?.scale) || 2 }));

      const adjusted = density !== (Number(options.density) || 1);
      log({ fit, pages, density });
      return { files, pages, density, adjusted, fits: !maxPages || pages <= maxPages, warnings };
   } finally {
      await browser.close();
   }
};
