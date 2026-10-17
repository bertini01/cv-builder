#!/usr/bin/env node
// cv-builder command-line interface. Run `cv-builder --help` for usage.
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { build } from "../src/build.mjs";
import { mergeOptions, readConfigFile, validateOptions } from "../src/config.mjs";
import { ResumeError, readResume, validateResume } from "../src/resume.mjs";
import { THEMES, themeIds } from "../src/themes/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text));
const c = { bold: paint(1), dim: paint(2), red: paint(31), green: paint(32), yellow: paint(33), blue: paint(34), cyan: paint(36) };

const HELP = `
${c.bold("cv-builder")} ${c.dim(`v${version}`)}: write your CV as data, get a beautiful PDF.

${c.bold("Usage")}
  cv-builder build [resume.json]      Build the CV (PDF by default)
  cv-builder studio [resume.json]     Live preview with theme and style controls
  cv-builder themes                   List the available themes
  cv-builder init [resume.json]       Create a starter resume to edit
  cv-builder validate [resume.json]   Check a resume for problems

${c.bold("Style")}
  -t, --theme <id>        ${themeIds.join(" | ")}
  -a, --accent <hex>      Accent colour, e.g. "#e11d48"
  -p, --paper <size>      a4 | letter
      --max-pages <n>     Page limit to auto-fit to (default 1, 0 = none)
      --no-fit            Don't adjust spacing to respect --max-pages
      --density <n>       Spacing and type scale, 0.7 to 1.3 (default 1)
      --no-photo          Leave out basics.image
      --sections <list>   Sections to show, in order (comma separated)
      --hide <list>       Sections to leave out
      --locale <code>     Locale for dates, e.g. fr, de, pt-BR
      --date-format <f>   short | long | numeric | year

${c.bold("Output")}
  -f, --format <list>     pdf,html,png (default pdf)
  -o, --out <dir>         Output folder (default dist)
  -n, --name <pattern>    File name, {name} and {theme} supported
  -c, --config <file>     Options file (default cv.config.json if present)

${c.bold("Studio")}
      --port <n>          Port (default 4321)
      --no-open           Don't open the browser

  -h, --help              Show this help
  -v, --version           Show the version

${c.bold("Examples")}
  cv-builder init
  cv-builder build resume.json --theme executive --accent "#7c3aed"
  cv-builder build resume.json -f pdf,png --paper letter
  cv-builder studio resume.json
`;

const { values: flags, positionals } = parseArgs({
   allowPositionals: true,
   options: {
      theme: { type: "string", short: "t" },
      accent: { type: "string", short: "a" },
      paper: { type: "string", short: "p" },
      "max-pages": { type: "string" },
      "no-fit": { type: "boolean" },
      density: { type: "string" },
      "no-photo": { type: "boolean" },
      sections: { type: "string" },
      hide: { type: "string" },
      locale: { type: "string" },
      "date-format": { type: "string" },
      format: { type: "string", short: "f" },
      out: { type: "string", short: "o" },
      name: { type: "string", short: "n" },
      config: { type: "string", short: "c" },
      port: { type: "string" },
      "no-open": { type: "boolean" },
      force: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
   },
});

const list = (value) => value?.split(",").map((item) => item.trim()).filter(Boolean);
const number = (value) => (value === undefined ? undefined : Number(value));

// Flags -> option overrides (undefined entries are ignored when merging).
const flagOptions = () => ({
   theme: flags.theme,
   accent: flags.accent,
   paper: flags.paper?.toLowerCase(),
   maxPages: number(flags["max-pages"]),
   fit: flags["no-fit"] ? false : undefined,
   density: number(flags.density),
   photo: flags["no-photo"] ? false : undefined,
   sections: list(flags.sections),
   hide: list(flags.hide),
   locale: flags.locale,
   dateFormat: flags["date-format"],
   output: { formats: list(flags.format), dir: flags.out, name: flags.name },
   labels: {},
});

const resolveOptions = () => {
   const options = mergeOptions(readConfigFile(flags.config), flagOptions());
   const errors = validateOptions(options, themeIds);
   if (errors.length) throw new ResumeError("Invalid options", errors);
   return options;
};

const resumeArg = () => positionals[1] ?? "resume.json";
const kb = (bytes) => `${Math.max(1, Math.round(bytes / 1024))} KB`;
const printWarnings = (warnings = []) => warnings.forEach((w) => console.log(`${c.yellow("!")} ${w}`));

const commands = {
   async build() {
      const options = resolveOptions();
      const started = Date.now();
      console.log(`${c.cyan("◆")} Building ${c.bold(resumeArg())} with ${c.bold(options.theme)}…`);
      const result = await build(resumeArg(), options);
      printWarnings(result.warnings);
      for (const file of result.files) {
         console.log(`${c.green("✓")} ${relative(process.cwd(), file.path)} ${c.dim(`(${kb(file.bytes)})`)}`);
      }
      const fitNote = result.adjusted ? `, auto-fit to density ${result.density}` : "";
      console.log(
         c.dim(`  ${result.pages} page${result.pages === 1 ? "" : "s"}${fitNote} · ${((Date.now() - started) / 1000).toFixed(1)}s`)
      );
      if (!result.fits) {
         const why = options.fit === false
            ? "auto-fit is off (drop --no-fit to let it tighten spacing)"
            : "even at the smallest density; consider trimming content";
         console.log(`${c.yellow("!")} Over the ${options.maxPages}-page limit: ${why}.`);
      }
   },

   async studio() {
      const options = resolveOptions();
      const { startStudio } = await import("../src/studio/server.mjs");
      await startStudio({
         resumePath: resolve(resumeArg()),
         configPath: resolve(flags.config ?? "cv.config.json"),
         options,
         port: number(flags.port) || 4321,
         open: !flags["no-open"],
      });
   },

   themes() {
      console.log(`\n${c.bold("Themes")}\n`);
      for (const theme of THEMES) {
         console.log(`  ${c.bold(theme.id.padEnd(11))} ${theme.description}  ${c.dim(theme.accent)}`);
      }
      console.log(`\n  ${c.dim("Use with: cv-builder build resume.json --theme <id>")}\n`);
   },

   init() {
      const target = resolve(positionals[1] ?? "resume.json");
      if (existsSync(target) && !flags.force) {
         throw new ResumeError(`${basename(target)} already exists. Use --force to overwrite it.`);
      }
      copyFileSync(join(ROOT, "examples/resume.json"), target);
      const avatar = join(dirname(target), "avatar.svg");
      if (!existsSync(avatar)) copyFileSync(join(ROOT, "examples/avatar.svg"), avatar);
      console.log(`${c.green("✓")} Created ${relative(process.cwd(), target)}. Edit it, then run:`);
      console.log(`  ${c.cyan(`cv-builder studio ${relative(process.cwd(), target)}`)}`);
   },

   async validate() {
      const { data, path } = await readResume(resumeArg());
      const { errors, warnings } = validateResume(data);
      printWarnings(warnings);
      if (errors.length) throw new ResumeError(`${relative(process.cwd(), path)} has ${errors.length} problem(s)`, errors);
      console.log(`${c.green("✓")} ${relative(process.cwd(), path)} is valid${warnings.length ? " (with warnings)" : ""}.`);
   },
};

const main = async () => {
   if (flags.version) return console.log(version);
   // `cv-builder resume.json` is shorthand for `cv-builder build resume.json`.
   if (/.(json|m?js)$/i.test(positionals[0] ?? "")) positionals.unshift("build");
   const [command = "build"] = positionals;
   if (flags.help || command === "help") return console.log(HELP);
   const run = commands[command];
   if (!run) {
      console.error(`${c.red("✗")} Unknown command "${command}".\n${HELP}`);
      process.exit(1);
   }
   await run();
};

main().catch((error) => {
   console.error(`${c.red("✗")} ${error.message}`);
   for (const detail of error.details ?? []) console.error(`  ${c.red("•")} ${detail}`);
   if (!(error instanceof ResumeError) && process.env.DEBUG) console.error(error.stack);
   process.exit(1);
});
