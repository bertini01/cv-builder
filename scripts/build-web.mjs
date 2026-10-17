// Builds the static web app into site/ (deployed by Vercel, see vercel.json).
// Only browser-safe engine modules are copied; the build fails if any of
// them imports a Node API, so the site can never ship server-side code.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const BROWSER_MODULES = ["render.mjs", "normalize.mjs", "options.mjs", "fit.mjs", "format.mjs", "themes"];

rmSync(site, { recursive: true, force: true });
mkdirSync(join(site, "lib"), { recursive: true });

cpSync(join(root, "web"), site, { recursive: true });
for (const entry of BROWSER_MODULES) cpSync(join(root, "src", entry), join(site, "lib", entry), { recursive: true });
cpSync(join(root, "examples/resume.json"), join(site, "examples/resume.json"));
cpSync(join(root, "examples/avatar.svg"), join(site, "examples/avatar.svg"));
cpSync(join(root, "docs/previews"), join(site, "previews"), { recursive: true });
cpSync(join(root, "docs/studio.jpg"), join(site, "og.jpg"));

// Guard: no Node built-ins, no bare package imports in anything we ship.
const files = (dir) =>
   readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]));
const offenders = files(site)
   .filter((f) => /\.(m?js)$/.test(f))
   .filter((f) => /from\s+["'](node:|[a-z@][^./"'][^"']*["'])/i.test(readFileSync(f, "utf8")));
if (offenders.length) {
   console.error("Refusing to build: these files import Node or npm modules:\n" + offenders.join("\n"));
   process.exit(1);
}
if (!existsSync(join(site, "index.html"))) throw new Error("web/index.html missing");
console.log(`✓ Built site/ (${files(site).length} files)`);
