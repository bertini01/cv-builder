// Auto-fit: find the largest density (spacing and type scale, --d) at which
// the CV fits within `maxPages`. `fitDocument` runs on a rendered document:
// the web app calls it directly, and headless Chrome / the local studio run
// the very same function through `fitScript`. The build then verifies the
// real PDF page count and nudges further if print rounding tips it over.
export const MIN_DENSITY = 0.78;

export function fitDocument(doc, { maxPages = 1, density = 1, fit = true, minDensity = 0.78 } = {}) {
   // Pixels of headroom so a CV that only just fits on screen also fits in print.
   const SAFETY_PX = 4;
   const root = doc.documentElement;
   const page = doc.querySelector(".page");
   const probe = doc.createElement("div");
   probe.style.cssText = "position:absolute;visibility:hidden;height:var(--page-h)";
   doc.body.append(probe);
   const pageHeight = probe.getBoundingClientRect().height;
   probe.remove();

   const pagesAt = (d) => {
      root.style.setProperty("--d", String(d));
      // Measure the content itself, not the page box and its minimum height.
      const minHeight = page.style.minHeight;
      page.style.minHeight = "0px";
      const height = page.scrollHeight;
      page.style.minHeight = minHeight;
      return Math.max(1, Math.ceil((height + SAFETY_PX) / pageHeight));
   };

   const max = Number(maxPages) || 0;
   const start = Number(density) || 1;
   let best = start;
   if (fit && max > 0 && pagesAt(start) > max && pagesAt(minDensity) <= max) {
      let lo = minDensity;
      let hi = start;
      for (let i = 0; i < 14; i++) {
         const mid = (lo + hi) / 2;
         if (pagesAt(mid) <= max) lo = mid;
         else hi = mid;
      }
      best = Math.floor(lo * 1000) / 1000;
   }
   const pages = pagesAt(best);
   return { density: best, pages, fits: max === 0 || pages <= max, adjusted: best !== start };
}

// The same function as a self-contained expression for Runtime.evaluate.
export const fitScript = (options = {}) =>
   `(${fitDocument.toString()})(document, ${JSON.stringify({
      maxPages: options.maxPages ?? 1,
      density: options.density ?? 1,
      fit: options.fit !== false,
      minDensity: options.minDensity ?? MIN_DENSITY,
   })})`;
