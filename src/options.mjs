// Options: defaults, labels and merging/validation. Browser-safe (no Node APIs);
// reading and writing cv.config.json lives in config.mjs.

export const SECTION_IDS = [
   "summary",
   "work",
   "projects",
   "education",
   "skills",
   "languages",
   "certificates",
   "awards",
   "volunteer",
   "publications",
   "interests",
   "references",
];

export const DEFAULT_LABELS = {
   summary: "Profile",
   work: "Experience",
   projects: "Projects",
   education: "Education",
   skills: "Skills",
   languages: "Languages",
   certificates: "Certifications",
   awards: "Awards",
   volunteer: "Volunteering",
   publications: "Publications",
   interests: "Interests",
   references: "References",
   present: "Present",
};

// Built-in translations, picked from `locale` ("fr", "fr-CA", ...).
export const LOCALE_LABELS = {
   fr: {
      summary: "Profil", work: "Expérience", projects: "Projets", education: "Formation", skills: "Compétences",
      languages: "Langues", certificates: "Certifications", awards: "Distinctions", volunteer: "Bénévolat",
      publications: "Publications", interests: "Centres d'intérêt", references: "Références", present: "Aujourd'hui",
      live: "Démo", source: "Code",
   },
   de: {
      summary: "Profil", work: "Berufserfahrung", projects: "Projekte", education: "Ausbildung", skills: "Kenntnisse",
      languages: "Sprachen", certificates: "Zertifikate", awards: "Auszeichnungen", volunteer: "Ehrenamt",
      publications: "Publikationen", interests: "Interessen", references: "Referenzen", present: "heute",
   },
   es: {
      summary: "Perfil", work: "Experiencia", projects: "Proyectos", education: "Formación", skills: "Habilidades",
      languages: "Idiomas", certificates: "Certificaciones", awards: "Premios", volunteer: "Voluntariado",
      publications: "Publicaciones", interests: "Intereses", references: "Referencias", present: "Actualidad", live: "Demo",
   },
   pt: {
      summary: "Perfil", work: "Experiência", projects: "Projetos", education: "Formação", skills: "Competências",
      languages: "Idiomas", certificates: "Certificações", awards: "Prémios", volunteer: "Voluntariado",
      publications: "Publicações", interests: "Interesses", references: "Referências", present: "Atual", live: "Demo",
   },
};

// Defaults < locale translations < theme labels < user labels.
export const resolveLabels = (options = {}, themeLabels = {}) => ({
   ...DEFAULT_LABELS,
   ...LOCALE_LABELS[String(options.locale ?? "en").toLowerCase().split("-")[0]],
   ...themeLabels,
   ...options.labels,
});

export const DEFAULTS = {
   theme: "aurora",
   accent: null, // null uses the theme's own accent
   paper: "a4", // "a4" or "letter"
   maxPages: 1, // 0 means no limit
   fit: true, // shrink spacing and type (gently) to respect maxPages
   density: 1, // 1 is the theme's natural spacing; 0.8 to 1.2
   photo: true,
   sections: null, // custom order; null uses the theme's order
   hide: [], // section ids to leave out
   labels: {},
   locale: "en",
   dateFormat: "short", // "short" | "long" | "numeric" | "year"
   output: { dir: "dist", name: "{name} CV", formats: ["pdf"], scale: 2 }, // scale: PNG pixel ratio
};

const defined = (object = {}) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

// Later sources win; `output` and `labels` merge key by key; undefined never overrides.
export const mergeOptions = (...sources) =>
   sources.filter(Boolean).reduce(
      (acc, source) => ({
         ...acc,
         ...defined(source),
         labels: { ...acc.labels, ...defined(source.labels) },
         output: { ...acc.output, ...defined(source.output) },
      }),
      structuredClone(DEFAULTS)
   );

export const validateOptions = (options, themeIds) => {
   const errors = [];
   if (!themeIds.includes(options.theme))
      errors.push(`theme: "${options.theme}" is unknown. Available: ${themeIds.join(", ")}.`);
   if (options.accent && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(options.accent))
      errors.push(`accent: "${options.accent}" must be a hex colour like #2563eb.`);
   if (!["a4", "letter"].includes(String(options.paper).toLowerCase()))
      errors.push(`paper: "${options.paper}" must be "a4" or "letter".`);
   if (!(options.density >= 0.7 && options.density <= 1.3)) errors.push("density: must be between 0.7 and 1.3.");
   if (!(Number.isInteger(options.maxPages) && options.maxPages >= 0)) errors.push("maxPages: must be a whole number (0 = no limit).");
   if (!["short", "long", "numeric", "year"].includes(options.dateFormat))
      errors.push(`dateFormat: "${options.dateFormat}" must be short, long, numeric or year.`);
   for (const id of [...(options.sections ?? []), ...(options.hide ?? [])]) {
      if (!SECTION_IDS.includes(id)) errors.push(`sections: "${id}" is not a section. Use: ${SECTION_IDS.join(", ")}.`);
   }
   const formats = options.output?.formats ?? [];
   for (const format of formats) {
      if (!["pdf", "html", "png"].includes(format)) errors.push(`output.formats: "${format}" must be pdf, html or png.`);
   }
   return errors;
};
