// Loads, validates and normalises a resume in JSON Resume format
// (https://jsonresume.org/schema), with a few optional extensions:
//   work[].keywords      tech stack shown next to the company
//   projects[].tagline   one-line subtitle
//   projects[].source    repository URL, shown beside the live link
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { resolveLabels } from "./config.mjs";
import { fluencyLevel, formatDate, formatRange } from "./format.mjs";

export class ResumeError extends Error {
   constructor(message, details = []) {
      super(message);
      this.name = "ResumeError";
      this.details = details;
   }
}

const SECTIONS = [
   "work",
   "volunteer",
   "education",
   "awards",
   "certificates",
   "publications",
   "skills",
   "languages",
   "interests",
   "references",
   "projects",
];
const KNOWN_TOP_LEVEL = new Set(["$schema", "basics", "meta", ...SECTIONS]);

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

const isString = (value) => typeof value === "string";
const isArrayOfStrings = (value) => Array.isArray(value) && value.every(isString);

// Returns { errors, warnings }, each a list of "path: message" strings.
export const validateResume = (data) => {
   const errors = [];
   const warnings = [];

   if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { errors: ["The resume must be a JSON object."], warnings };
   }
   if (!data.basics || typeof data.basics !== "object") errors.push("basics: missing (it holds your name and contact details).");
   else if (!isString(data.basics.name) || !data.basics.name.trim()) errors.push("basics.name: required.");

   if (data.basics?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.basics.email))
      warnings.push(`basics.email: "${data.basics.email}" doesn't look like an email address.`);
   if (data.basics?.profiles && !Array.isArray(data.basics.profiles)) errors.push("basics.profiles: must be an array.");

   for (const key of Object.keys(data)) {
      if (!KNOWN_TOP_LEVEL.has(key)) warnings.push(`${key}: not a JSON Resume section, ignored.`);
   }

   for (const section of SECTIONS) {
      const items = data[section];
      if (items === undefined) continue;
      if (!Array.isArray(items)) {
         errors.push(`${section}: must be an array.`);
         continue;
      }
      items.forEach((item, i) => {
         const at = `${section}[${i}]`;
         if (!item || typeof item !== "object") return errors.push(`${at}: must be an object.`);
         for (const field of ["highlights", "keywords", "courses", "roles"]) {
            if (item[field] !== undefined && !isArrayOfStrings(item[field]))
               errors.push(`${at}.${field}: must be a list of strings.`);
         }
         for (const field of ["startDate", "endDate", "date", "releaseDate"]) {
            if (item[field] && !/^\d{4}(-\d{1,2}(-\d{1,2})?)?$/.test(String(item[field]).trim()))
               warnings.push(`${at}.${field}: "${item[field]}" is not YYYY, YYYY-MM or YYYY-MM-DD; shown as written.`);
         }
      });
   }
   return { errors, warnings };
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

const locationText = (location) => {
   if (!location) return "";
   if (isString(location)) return location;
   return [location.city, location.region, location.countryCode].filter(Boolean).join(", ");
};

const list = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

// Normalises raw JSON Resume data into the model every theme renders.
export const normalizeResume = (data, options = {}, baseDir = process.cwd()) => {
   const dates = {
      locale: options.locale,
      dateFormat: options.dateFormat,
      presentLabel: resolveLabels(options).present,
   };
   const range = (item) => formatRange(item.startDate, item.endDate, dates);
   const basics = data.basics ?? {};

   return {
      basics: {
         name: basics.name ?? "",
         label: basics.label ?? "",
         image: resolveImage(basics.image, baseDir),
         email: basics.email ?? "",
         phone: basics.phone ?? "",
         url: basics.url ?? basics.website ?? "",
         summary: basics.summary ?? "",
         location: locationText(basics.location),
         profiles: list(basics.profiles).filter((p) => p.url || p.username),
      },
      work: list(data.work).map((w) => ({
         position: w.position ?? "",
         name: w.name ?? w.company ?? "",
         url: w.url ?? w.website ?? "",
         location: w.location ?? "",
         period: range(w),
         summary: w.summary ?? w.description ?? "",
         highlights: list(w.highlights),
         keywords: list(w.keywords),
      })),
      volunteer: list(data.volunteer).map((v) => ({
         position: v.position ?? "",
         name: v.organization ?? "",
         url: v.url ?? "",
         period: range(v),
         summary: v.summary ?? "",
         highlights: list(v.highlights),
      })),
      education: list(data.education).map((e) => ({
         institution: e.institution ?? "",
         url: e.url ?? "",
         area: e.area ?? "",
         studyType: e.studyType ?? "",
         score: e.score ?? "",
         period: range(e),
         courses: list(e.courses),
      })),
      projects: list(data.projects).map((p) => ({
         name: p.name ?? "",
         tagline: p.tagline ?? (p.type || list(p.roles).join(", ")),
         description: p.description ?? "",
         highlights: list(p.highlights),
         keywords: list(p.keywords),
         url: p.url ?? "",
         source: p.source ?? p.repository ?? "",
         period: p.startDate || p.endDate ? range(p) : "",
      })),
      skills: list(data.skills).map((s) => ({ name: s.name ?? "", level: s.level ?? "", keywords: list(s.keywords) })),
      languages: list(data.languages).map((l) => ({
         language: l.language ?? "",
         fluency: l.fluency ?? "",
         level: fluencyLevel(l.fluency, l.level),
      })),
      certificates: list(data.certificates).map((c) => ({
         name: c.name ?? "",
         issuer: c.issuer ?? "",
         date: formatDate(c.date, dates),
         url: c.url ?? "",
      })),
      awards: list(data.awards).map((a) => ({
         title: a.title ?? "",
         awarder: a.awarder ?? "",
         date: formatDate(a.date, dates),
         summary: a.summary ?? "",
      })),
      publications: list(data.publications).map((p) => ({
         name: p.name ?? "",
         publisher: p.publisher ?? "",
         date: formatDate(p.releaseDate, dates),
         url: p.url ?? "",
         summary: p.summary ?? "",
      })),
      interests: list(data.interests).map((i) => ({ name: i.name ?? "", keywords: list(i.keywords) })),
      references: list(data.references).map((r) => ({ name: r.name ?? "", reference: r.reference ?? "" })),
   };
};

// Read + validate + normalise in one step. Throws ResumeError on errors.
export const loadResume = async (file, options = {}) => {
   const { data, path } = await readResume(file);
   const { errors, warnings } = validateResume(data);
   if (errors.length) throw new ResumeError(`${path} has ${errors.length} problem(s)`, errors);
   return { resume: normalizeResume(data, options, dirname(path)), raw: data, warnings, path };
};
