// Public API.
//
//   import { build, renderDocument, loadResume, mergeOptions } from "cvforge";
//   const options = mergeOptions({ theme: "noir", accent: "#e11d48" });
//   const result = await build("resume.json", options);
export { build, outputBaseName } from "./build.mjs";
export { countPdfPages, findBrowser, openBrowser } from "./chrome.mjs";
export { CONFIG_FILE, DEFAULTS, DEFAULT_LABELS, LOCALE_LABELS, SECTION_IDS, resolveLabels, mergeOptions, readConfigFile, validateOptions, writeConfigFile } from "./config.mjs";
export { MIN_DENSITY, fitDocument, fitScript } from "./fit.mjs";
export { escapeHtml, formatDate, formatRange, inline } from "./format.mjs";
export { PAPER, createContext, renderDocument } from "./render.mjs";
export { ResumeError, loadResume, normalizeResume, readResume, validateResume } from "./resume.mjs";
export { normalizeResume as normalizeResumeData } from "./normalize.mjs";
export { THEMES, getTheme, themeIds } from "./themes/index.mjs";
