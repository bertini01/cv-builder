// Building blocks shared by the themes. Every helper returns an HTML string
// with stable class names; themes decide how those classes look.
import { escapeHtml as esc, inline, shortUrl } from "../format.mjs";

// `s(9, "pt")` -> a size that scales with the density variable --d.
export const s = (value, unit) => `calc(${value}${unit} * var(--d))`;

const svg = (body, { fill = false } = {}) =>
   `<svg class="icon" viewBox="0 0 24 24" ${
      fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
   } aria-hidden="true">${body}</svg>`;

export const ICONS = {
   email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
   phone: svg(
      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'
   ),
   location: svg('<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
   url: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
   github: svg(
      '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'
   ),
   linkedin: svg('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>'),
   x: svg('<path d="M4 4l16 16M20 4 4 20"/>'),
   gitlab: svg('<path d="m12 21 9-7-3-10-2.5 6h-7L6 4 3 14z"/>'),
   dribbble: svg('<circle cx="12" cy="12" r="9"/><path d="M8.6 3.7c3.2 4 5.3 9.3 6.3 16.6M3.1 10.8c5.4.1 10.2-.8 14.6-3.8M5.3 18.6c3.4-4 8.2-5.5 15.5-4"/>'),
   behance: svg('<path d="M3 7h5.5a2.5 2.5 0 0 1 0 5H3zM3 12h6a3 3 0 0 1 0 6H3zM14 13h7a3.5 3.5 0 0 0-7 0zm0 0a3.5 3.5 0 0 0 6.4 2M15 7.5h5"/>'),
   medium: svg('<ellipse cx="7" cy="12" rx="5" ry="5.5"/><ellipse cx="16" cy="12" rx="2.4" ry="5.3"/><path d="M21 7v10"/>'),
   stackoverflow: svg('<path d="M4 15v5h14v-5M8 16.5h6M8.4 13.4l5.9 1.2M9.6 9.8l5.4 2.6M11.7 6.4l4.6 3.8M14.8 3.5l3.4 4.9"/>'),
   youtube: svg('<rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="m10 9.5 5 2.5-5 2.5z"/>'),
   link: svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
};

const PROFILE_PREFIX = {
   github: "github.com/",
   linkedin: "linkedin.com/in/",
   x: "x.com/",
   twitter: "x.com/",
   gitlab: "gitlab.com/",
   dribbble: "dribbble.com/",
   behance: "behance.net/",
   medium: "medium.com/@",
   stackoverflow: "stackoverflow.com/users/",
   youtube: "youtube.com/@",
};

const networkKey = (network = "") => {
   const key = network.toLowerCase().replace(/[^a-z]/g, "");
   return key === "twitter" ? "x" : key;
};

// Contact items: email, phone, location, website and every profile.
export const contactItems = ({ resume }) => {
   const { basics } = resume;
   const items = [];
   if (basics.email) items.push({ key: "email", label: basics.email, href: `mailto:${basics.email}` });
   if (basics.phone) items.push({ key: "phone", label: basics.phone, href: `tel:${basics.phone.replace(/[^\d+]/g, "")}` });
   if (basics.location) items.push({ key: "location", label: basics.location });
   if (basics.url) items.push({ key: "url", label: shortUrl(basics.url), href: basics.url });
   for (const profile of basics.profiles) {
      const key = networkKey(profile.network);
      const prefix = PROFILE_PREFIX[key];
      const label = profile.username && prefix ? `${prefix}${profile.username}` : shortUrl(profile.url) || profile.username;
      items.push({ key: ICONS[key] ? key : "link", label, href: profile.url || "" });
   }
   return items;
};

export const contactList = (ctx, { icons = true, className = "contact" } = {}) =>
   `<ul class="${className}">${contactItems(ctx)
      .map(
         (item) =>
            `<li class="contact-item contact-item--${item.key}">${icons ? ICONS[item.key] ?? ICONS.link : ""}${
               item.href ? `<a href="${esc(item.href)}">${esc(item.label)}</a>` : `<span>${esc(item.label)}</span>`
            }</li>`
      )
      .join("")}</ul>`;

export const photo = (ctx, className = "photo") =>
   ctx.photo ? `<img class="${className}" src="${esc(ctx.resume.basics.image)}" alt="${esc(ctx.resume.basics.name)}">` : "";

const bullets = (items) =>
   items.length ? `<ul class="bullets">${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>` : "";

const keywordsText = (keywords, className = "keywords") =>
   keywords.length ? `<span class="${className}">${keywords.map(esc).join(" · ")}</span>` : "";

const keywordChips = (keywords) =>
   keywords.length ? `<ul class="chips">${keywords.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>` : "";

const maybeLink = (label, href) => (href ? `<a href="${esc(href)}">${esc(label)}</a>` : esc(label));

// Experience-like entries (work and volunteering).
// keywords: "inline" (beside the organisation), "chips" (below) or false.
const experienceEntries = (items, { keywords = "inline", summary = true } = {}) =>
   items
      .map(
         (item) => `<article class="entry">
   <header class="entry-head">
      <div class="entry-heading">
         <h3 class="entry-title">${esc(item.position || item.name)}</h3>
         <p class="entry-org">${item.position ? maybeLink(item.name, item.url) : ""}${
            item.location ? `<span class="entry-location">${esc(item.location)}</span>` : ""
         }${keywords === "inline" ? keywordsText(item.keywords ?? []) : ""}</p>
      </div>
      ${item.period ? `<span class="entry-date">${esc(item.period)}</span>` : ""}
   </header>
   ${summary && item.summary ? `<p class="entry-summary">${inline(item.summary)}</p>` : ""}
   ${bullets(item.highlights)}
   ${keywords === "chips" ? keywordChips(item.keywords ?? []) : ""}
</article>`
      )
      .join("");

const projectEntries = ({ resume, labels }, { layout = "list" } = {}) =>
   `<div class="projects projects--${layout}">${resume.projects
      .map(
         (p) => `<article class="project">
   <header class="project-head">
      <h3 class="project-title">${esc(p.name)}${
         p.url || p.source
            ? `<span class="project-links">${p.url ? `<a href="${esc(p.url)}">${esc(labels.live ?? "Live")} ↗</a>` : ""}${
                 p.source ? `<a href="${esc(p.source)}">${esc(labels.source ?? "Code")} ↗</a>` : ""
              }</span>`
            : ""
      }</h3>
      ${p.period ? `<span class="entry-date">${esc(p.period)}</span>` : ""}
   </header>
   ${p.tagline ? `<p class="project-tagline">${esc(p.tagline)}</p>` : ""}
   ${p.description ? `<p class="project-desc">${inline(p.description)}</p>` : ""}
   ${bullets(p.highlights)}
   ${p.keywords.length ? `<p class="project-keywords">${p.keywords.map(esc).join(" · ")}</p>` : ""}
</article>`
      )
      .join("")}</div>`;

const educationEntries = ({ resume }) =>
   resume.education
      .map(
         (e) => `<article class="edu">
   <h3 class="edu-title">${maybeLink(e.institution, e.url)}</h3>
   ${e.studyType || e.area ? `<p class="edu-degree">${esc([e.studyType, e.area].filter(Boolean).join(", "))}</p>` : ""}
   <p class="edu-meta">${[e.period, e.score].filter(Boolean).map(esc).join(" · ")}</p>
   ${e.courses.length ? `<p class="edu-courses">${e.courses.map(esc).join(" · ")}</p>` : ""}
</article>`
      )
      .join("");

// style: "chips" | "inline" (Group: a, b, c) | "list"
const skillGroups = ({ resume }, { style = "chips" } = {}) =>
   `<div class="skills skills--${style}">${resume.skills
      .map((group) => {
         if (style === "inline")
            return `<p class="skill-line"><strong>${esc(group.name)}</strong>${
               group.keywords.length ? ` ${esc(group.keywords.join(", "))}` : group.level ? ` ${esc(group.level)}` : ""
            }</p>`;
         return `<div class="skill-group">
   <h3 class="skill-name">${esc(group.name)}${group.level ? `<span class="skill-level">${esc(group.level)}</span>` : ""}</h3>
   ${keywordChips(group.keywords)}
</div>`;
      })
      .join("")}</div>`;

const dots = (level) =>
   `<span class="dots" aria-label="${level} out of 5">${Array.from(
      { length: 5 },
      (_, i) => `<i class="${i < level ? "on" : ""}"></i>`
   ).join("")}</span>`;

// style: "dots" | "bars" | "text"
const languageList = ({ resume }, { style = "dots" } = {}) =>
   `<ul class="languages languages--${style}">${resume.languages
      .map(
         (l) => `<li><span class="lang-name">${esc(l.language)}${
            l.fluency ? ` <em class="lang-fluency">${esc(l.fluency)}</em>` : ""
         }</span>${
            style === "dots" ? dots(l.level) : style === "bars" ? `<span class="bar"><i style="width:${l.level * 20}%"></i></span>` : ""
         }</li>`
      )
      .join("")}</ul>`;

const simpleList = (items, render) => (items.length ? `<ul class="simple">${items.map((i) => `<li>${render(i)}</li>`).join("")}</ul>` : "");

const SECTION_RENDERERS = {
   summary: (ctx) => (ctx.resume.basics.summary ? `<p class="summary">${inline(ctx.resume.basics.summary)}</p>` : ""),
   work: (ctx, opts) => experienceEntries(ctx.resume.work, opts),
   volunteer: (ctx, opts) => experienceEntries(ctx.resume.volunteer, opts),
   projects: (ctx, opts) => projectEntries(ctx, opts),
   education: (ctx) => educationEntries(ctx),
   skills: (ctx, opts) => skillGroups(ctx, opts),
   languages: (ctx, opts) => languageList(ctx, opts),
   certificates: ({ resume }) =>
      simpleList(
         resume.certificates,
         (c) => `<strong>${maybeLink(c.name, c.url)}</strong>${c.issuer ? ` · ${esc(c.issuer)}` : ""}${
            c.date ? ` <span class="muted">${esc(c.date)}</span>` : ""
         }`
      ),
   awards: ({ resume }) =>
      simpleList(
         resume.awards,
         (a) => `<strong>${esc(a.title)}</strong>${a.awarder ? ` · ${esc(a.awarder)}` : ""}${
            a.date ? ` <span class="muted">${esc(a.date)}</span>` : ""
         }${a.summary ? `<br><span class="muted">${inline(a.summary)}</span>` : ""}`
      ),
   publications: ({ resume }) =>
      simpleList(
         resume.publications,
         (p) => `<strong>${maybeLink(p.name, p.url)}</strong>${p.publisher ? ` · ${esc(p.publisher)}` : ""}${
            p.date ? ` <span class="muted">${esc(p.date)}</span>` : ""
         }`
      ),
   interests: ({ resume }) =>
      simpleList(resume.interests, (i) => `<strong>${esc(i.name)}</strong>${i.keywords.length ? ` · ${esc(i.keywords.join(", "))}` : ""}`),
   references: ({ resume }) =>
      simpleList(resume.references, (r) => `<blockquote>“${inline(r.reference)}”</blockquote><cite>${esc(r.name)}</cite>`),
};

// Renders one section with its title, or "" when it has no content.
export const section = (ctx, id, opts = {}) => {
   const body = SECTION_RENDERERS[id]?.(ctx, opts[id] ?? {}) ?? "";
   if (!body || /^<(div|ul) class="[^"]*">\s*<\/(div|ul)>$/.test(body)) return "";
   const title = opts.titles === false ? "" : `<h2 class="section-title">${esc(ctx.labels[id])}</h2>`;
   return `<section class="section section--${id}">${title}<div class="section-body">${body}</div></section>`;
};

export const sections = (ctx, ids, opts) => ids.map((id) => section(ctx, id, opts)).join("");
