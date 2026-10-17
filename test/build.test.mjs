// End-to-end builds through a real headless browser. Skipped automatically
// when no Chrome, Edge, Chromium or Brave is installed.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { build } from "../src/build.mjs";
import { findBrowser } from "../src/chrome.mjs";
import { mergeOptions } from "../src/config.mjs";

const example = fileURLToPath(new URL("../examples/resume.json", import.meta.url));
let skip = false;
try {
   findBrowser();
} catch {
   skip = "no Chromium-based browser installed";
}

test("builds a one-page PDF, HTML and PNG", { skip, timeout: 120_000 }, async () => {
   const dir = mkdtempSync(join(tmpdir(), "cvb-build-"));
   const result = await build(example, mergeOptions({ theme: "executive", output: { dir, formats: ["pdf", "html", "png"] } }));
   assert.equal(result.pages, 1);
   assert.equal(result.fits, true);
   const pdf = result.files.find((f) => f.format === "pdf");
   assert.equal(readFileSync(pdf.path).subarray(0, 5).toString(), "%PDF-");
   const png = result.files.find((f) => f.format === "png");
   assert.deepEqual([...readFileSync(png.path).subarray(1, 4)], [0x50, 0x4e, 0x47]);
   const html = readFileSync(result.files.find((f) => f.format === "html").path, "utf8");
   assert.ok(html.includes(`--d: ${result.density}`));
});

test("auto-fit only ever tightens, and can be turned off", { skip, timeout: 120_000 }, async () => {
   const dir = mkdtempSync(join(tmpdir(), "cvb-fit-"));
   const fitted = await build(example, mergeOptions({ theme: "minimal", output: { dir } }));
   assert.ok(fitted.density < 1 && fitted.pages === 1);
   const free = await build(example, mergeOptions({ theme: "minimal", fit: false, output: { dir } }));
   assert.equal(free.density, 1);
   assert.ok(free.pages > 1);
});
