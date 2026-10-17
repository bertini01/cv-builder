// Auto-fit: find the largest density (spacing and type scale, --d) at which
// the CV fits within `maxPages`. Runs inside the page, so the CLI (through
// headless Chrome) and the studio preview share exactly this algorithm.
// The build then verifies the real PDF page count and nudges further if a
// rounding difference between layout and print pushes it over (see build.mjs).
export const MIN_DENSITY = 0.78;

// Pixels of headroom so a CV that only just fits on screen also fits in print.
const SAFETY_PX = 4;

export const fitScript = ({ maxPages = 1, density = 1, fit = true, minDensity = MIN_DENSITY } = {}) => `(() => {
   const root = document.documentElement;
   const page = document.querySelector(".page");
   const probe = document.createElement("div");
   probe.style.cssText = "position:absolute;visibility:hidden;height:var(--page-h)";
   document.body.append(probe);
   const pageHeight = probe.getBoundingClientRect().height;
   probe.remove();
   const pagesAt = (d) => {
      root.style.setProperty("--d", String(d));
      // Measure the content itself, not the page box and its minimum height.
      const minHeight = page.style.minHeight;
      page.style.minHeight = "0px";
      const height = page.scrollHeight;
      page.style.minHeight = minHeight;
      return Math.max(1, Math.ceil((height + ${SAFETY_PX}) / pageHeight));
   };
   const max = ${Number(maxPages) || 0};
   const start = ${Number(density) || 1};
   let best = start;
   let pages = pagesAt(start);
   if (${fit ? "true" : "false"} && max > 0 && pages > max && pagesAt(${minDensity}) <= max) {
      let lo = ${minDensity}, hi = start;
      for (let i = 0; i < 14; i++) {
         const mid = (lo + hi) / 2;
         if (pagesAt(mid) <= max) lo = mid; else hi = mid;
      }
      best = Math.floor(lo * 1000) / 1000;
   }
   pages = pagesAt(best);
   return { density: best, pages, fits: max === 0 || pages <= max, adjusted: best !== start };
})()`;
