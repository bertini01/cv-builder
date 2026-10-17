// Loads resumes from disk (Node). Validation and normalisation are browser-safe
// and live in normalize.mjs; they are re-exported here.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { ResumeError, normalizeResume as normalizeData, validateResume } from "./normalize.mjs";

export { ResumeError, validateResume };

const lineAndColumn = (text, position) => {
   const before = text.slice(0, position);
   const line = before.split("\n").length;
   const column = position - before.lastIndexOf("\n");
   return { line, column };
};

// Reads a .json or .js/.mjs resume. JS files export the resume as default.
export const readResume = async (file) => {
   const path = resolve(file);
   if (!existsSync(path)) throw new ResumeError(`Resume not found: ${path}`);

   const ext = extname(path).toLowerCase();
   if (ext === ".js" || ext === ".mjs") {
      const module = await import(`${pathToFileURL(path).href}?t=${Date.now()}`);
      return { data: module.default ?? module.resume, path };
   }

   const text = readFileSync(path, "utf8").replace(/^﻿/, "");
   try {
      return { data: JSON.parse(text), path };
   } catch (error) {
      const position = Number(error.message.match(/position (\d+)/)?.[1]);
      const where = Number.isFinite(position)
         ? (({ line, column }) => ` (line ${line}, column ${column})`)(lineAndColumn(text, position))
         : "";
      throw new ResumeError(`Invalid JSON in ${path}${where}: ${error.message.replace(/ in JSON.*$/, "")}`);
   }
};

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };

// Local photos are inlined so the HTML output is self-contained.
const resolveImage = (image, baseDir) => {
   if (!image || /^(https?:|data:)/i.test(image)) return image || "";
   const path = isAbsolute(image) ? image : resolve(baseDir, image);
   const mime = MIME[extname(path).toLowerCase()];
   if (!mime || !existsSync(path)) return "";
   return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
};

// Node flavour of normalizeResume: also inlines photos from local paths.
export const normalizeResume = (data, options = {}, baseDir = process.cwd()) =>
   normalizeData(data, options, { resolveImage: (image) => resolveImage(image, baseDir) });

// Read + validate + normalise in one step. Throws ResumeError on errors.
export const loadResume = async (file, options = {}) => {
   const { data, path } = await readResume(file);
   const { errors, warnings } = validateResume(data);
   if (errors.length) throw new ResumeError(`${path} has ${errors.length} problem(s)`, errors);
   return { resume: normalizeResume(data, options, dirname(path)), raw: data, warnings, path };
};
