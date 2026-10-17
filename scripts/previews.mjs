// Regenerates the README theme gallery: docs/previews/<theme>.png
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { build } from "../src/build.mjs";
import { mergeOptions } from "../src/config.mjs";
import { THEMES } from "../src/themes/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const theme of THEMES) {
   const options = mergeOptions({
      theme: theme.id,
      output: { dir: join(root, "docs/previews"), name: "{theme}", formats: ["png"], scale: 1 },
   });
   const result = await build(join(root, "examples/resume.json"), options);
   console.log(`✓ ${theme.id.padEnd(10)} ${result.pages} page, density ${result.density}`);
}
