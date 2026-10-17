// Text, date and URL helpers shared by every theme.

export const escapeHtml = (value = "") =>
   String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

const SAFE_URL = /^(https?:|mailto:|tel:)/i;

// Escapes text, then applies a small, safe subset of Markdown:
// **bold**, *italic*, `code` and [label](https://link).
export const inline = (value = "") =>
   escapeHtml(value)
      // URLs may contain one level of balanced parentheses, e.g. Wikipedia links.
      .replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (match, label, href) =>
         SAFE_URL.test(href) ? `<a href="${href}">${label}</a>` : label
      )
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

export const shortUrl = (url = "") =>
   String(url)
      .replace(/^(https?:\/\/)?(www\.)?/i, "")
      .replace(/^mailto:/i, "")
      .replace(/\/$/, "");

// Parses JSON Resume dates: "2024", "2024-05" or "2024-05-17".
export const parseDate = (value) => {
   if (!value) return null;
   const match = String(value).trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
   if (!match) return null;
   const [, year, month, day] = match;
   return {
      year: Number(year),
      month: month ? Number(month) : null,
      day: day ? Number(day) : null,
   };
};

// dateFormat: "short" (May 2024), "long" (May 2024 → full month name),
// "numeric" (05/2024) or "year" (2024).
export const formatDate = (value, { locale = "en", dateFormat = "short" } = {}) => {
   const date = parseDate(value);
   if (!date) return value ? String(value) : "";
   if (dateFormat === "year" || !date.month) return String(date.year);
   if (dateFormat === "numeric") return `${String(date.month).padStart(2, "0")}/${date.year}`;
   const formatter = new Intl.DateTimeFormat(locale, {
      month: dateFormat === "long" ? "long" : "short",
      year: "numeric",
      timeZone: "UTC",
   });
   return formatter.format(new Date(Date.UTC(date.year, date.month - 1, 1)));
};

export const formatRange = (start, end, options = {}) => {
   const { presentLabel = "Present" } = options;
   const from = formatDate(start, options);
   const to = end ? formatDate(end, options) : start ? presentLabel : "";
   if (from && to && from !== to) return `${from} – ${to}`;
   return from || to;
};

const FLUENCY = [
   [/native|mother|bilingual/i, 5],
   [/fluent|full professional|proficient|c2|c1/i, 5],
   [/professional|advanced|b2/i, 4],
   [/intermediate|conversational|working|b1/i, 3],
   [/elementary|limited|a2/i, 2],
   [/basic|beginner|a1/i, 2],
];

// Maps a fluency label (or a numeric level 0-5 / 0-100) to a 1-5 scale.
export const fluencyLevel = (fluency, level) => {
   if (typeof level === "number") return Math.max(1, Math.min(5, level > 5 ? Math.round(level / 20) : level));
   for (const [pattern, value] of FLUENCY) if (pattern.test(fluency ?? "")) return value;
   return 3;
};

export const slugify = (value = "") =>
   String(value)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
