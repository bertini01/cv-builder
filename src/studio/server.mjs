// CV Studio: a local web app to preview, style and export a CV live.
// Listens on 127.0.0.1 only and rejects cross-site requests.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync, watch } from "node:fs";
import { createServer } from "node:http";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "../build.mjs";
import { DEFAULTS, SECTION_IDS, mergeOptions, validateOptions, writeConfigFile } from "../config.mjs";
import { escapeHtml as esc } from "../format.mjs";
import { fitScript } from "../fit.mjs";
import { renderDocument } from "../render.mjs";
import { loadResume } from "../resume.mjs";
import { THEMES, themeIds } from "../themes/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const MIME = { ".pdf": "application/pdf", ".html": "text/html; charset=utf-8", ".png": "image/png" };

const errorPage = (title, details = []) => `<!doctype html><meta charset="utf-8">
<style>body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#1f2937;padding:48px;margin:0}
h1{font-size:20px;color:#b91c1c;margin:0 0 12px}li{margin:6px 0;font-family:ui-monospace,Consolas,monospace;font-size:13px}
p{color:#6b7280}</style>
<h1>⚠ ${esc(title)}</h1><ul>${details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
<p>Fix the file and save; the preview reloads automatically.</p>
<script>parent.postMessage({ type: "cv-error", message: ${JSON.stringify(title)} }, "*");</script>`;

// Preview-only additions: flat page, fit the layout, report back to the studio.
const previewExtras = (options) => `
<style>body{background:#fff!important;padding:0!important}.page{box-shadow:none!important;margin:0!important}</style>
<script>
document.fonts.ready.then(() => {
   const result = ${fitScript(options)};
   parent.postMessage({ type: "cv-fit", ...result, height: document.querySelector(".page").scrollHeight }, "*");
});
</script>`;

// Options from the UI are untrusted input: keep known keys only, then validate.
const sanitize = (input = {}) => {
   const pick = (key, check) => (check(input[key]) ? input[key] : undefined);
   const ids = (value) => Array.isArray(value) && value.every((id) => SECTION_IDS.includes(id));
   return {
      theme: pick("theme", (v) => themeIds.includes(v)),
      accent: pick("accent", (v) => v === null || /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v ?? "")),
      paper: pick("paper", (v) => ["a4", "letter"].includes(v)),
      maxPages: pick("maxPages", (v) => Number.isInteger(v) && v >= 0 && v <= 10),
      fit: pick("fit", (v) => typeof v === "boolean"),
      density: pick("density", (v) => typeof v === "number" && v >= 0.7 && v <= 1.3),
      photo: pick("photo", (v) => typeof v === "boolean"),
      dateFormat: pick("dateFormat", (v) => ["short", "long", "numeric", "year"].includes(v)),
      sections: pick("sections", (v) => v === null || ids(v)),
      hide: pick("hide", ids),
   };
};

const readBody = (req) =>
   new Promise((resolveBody, reject) => {
      let body = "";
      req.on("data", (chunk) => {
         body += chunk;
         if (body.length > 1e6) reject(new Error("Request too large"));
      });
      req.on("end", () => {
         try {
            resolveBody(body ? JSON.parse(body) : {});
         } catch {
            reject(new Error("Invalid JSON body"));
         }
      });
   });

const openInBrowser = (url) => {
   const [cmd, args] =
      process.platform === "win32"
         ? ["cmd", ["/c", "start", "", url]]
         : [process.platform === "darwin" ? "open" : "xdg-open", [url]];
   spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
};

export const startStudio = async ({ resumePath, configPath, options: initial, port = 4321, open = true }) => {
   if (!existsSync(resumePath)) throw new Error(`Resume not found: ${resumePath}. Create one with "cv-builder init".`);

   let current = initial;
   const outDir = resolve(initial.output?.dir ?? "dist");
   const clients = new Set();
   const ui = readFileSync(join(HERE, "ui.html"), "utf8");
   let origin = "";
   let allowedOrigins = new Set();

   // Reload the preview when the resume, its folder (photos) or the config change.
   let timer;
   const notify = () => {
      clearTimeout(timer);
      timer = setTimeout(() => clients.forEach((res) => res.write("data: reload\n\n")), 150);
   };
   watch(dirname(resumePath), (_, file) => {
      if (!file || file.startsWith(".") || file.endsWith(".html")) return;
      notify();
   });

   const send = (res, status, body, type = "application/json") => {
      res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      res.end(type === "application/json" ? JSON.stringify(body) : body);
   };

   const server = createServer(async (req, res) => {
      const url = new URL(req.url, origin);
      // Block DNS rebinding and cross-site requests to this local server.
      const host = (req.headers.host ?? "").split(":")[0];
      if (!["localhost", "127.0.0.1"].includes(host)) return send(res, 403, { error: "Forbidden" });
      if (req.method !== "GET" && req.headers.origin && !allowedOrigins.has(req.headers.origin))
         return send(res, 403, { error: "Cross-origin request blocked" });

      try {
         if (req.method === "GET" && url.pathname === "/") return send(res, 200, ui, "text/html; charset=utf-8");

         if (req.method === "GET" && url.pathname === "/api/state") {
            return send(res, 200, {
               options: current,
               defaults: DEFAULTS,
               sectionIds: SECTION_IDS,
               themes: THEMES.map(({ id, name, description, accent, side }) => ({ id, name, description, accent, sidebar: Boolean(side) })),
               resume: basename(resumePath),
               config: basename(configPath),
            });
         }

         if (req.method === "GET" && url.pathname === "/preview") {
            let options = current;
            try {
               options = mergeOptions(current, sanitize(JSON.parse(url.searchParams.get("o") || "{}")));
            } catch {
               // Fall back to the current options.
            }
            try {
               const { resume } = await loadResume(resumePath, options);
               const html = renderDocument(resume, options).replace("</body>", `${previewExtras(options)}</body>`);
               return send(res, 200, html, "text/html; charset=utf-8");
            } catch (error) {
               return send(res, 200, errorPage(error.message, error.details), "text/html; charset=utf-8");
            }
         }

         if (req.method === "POST" && url.pathname === "/api/options") {
            current = mergeOptions(current, sanitize(await readBody(req)));
            return send(res, 200, { options: current });
         }

         if (req.method === "POST" && url.pathname === "/api/save") {
            const next = mergeOptions(current, sanitize(await readBody(req)));
            const errors = validateOptions(next, themeIds);
            if (errors.length) return send(res, 400, { error: errors.join(" ") });
            current = next;
            const { theme, accent, paper, maxPages, fit, density, photo, sections, hide, labels, locale, dateFormat, output } = next;
            const path = writeConfigFile(
               { theme, accent, paper, maxPages, fit, density, photo, sections, hide, labels, locale, dateFormat, output },
               configPath
            );
            return send(res, 200, { path: basename(path) });
         }

         if (req.method === "POST" && url.pathname === "/api/export") {
            const body = await readBody(req);
            const formats = (body.formats ?? ["pdf"]).filter((f) => ["pdf", "html", "png"].includes(f));
            const options = mergeOptions(current, sanitize(body.options), { output: { dir: outDir, formats } });
            const result = await build(resumePath, options);
            return send(res, 200, {
               ...result,
               files: result.files.map((f) => ({ ...f, name: basename(f.path), url: `/files/${encodeURIComponent(basename(f.path))}` })),
            });
         }

         if (req.method === "GET" && url.pathname.startsWith("/files/")) {
            const name = basename(decodeURIComponent(url.pathname.slice(7)));
            const path = join(outDir, name);
            if (!MIME[extname(name)] || !existsSync(path) || !statSync(path).isFile()) return send(res, 404, { error: "Not found" });
            return send(res, 200, readFileSync(path), MIME[extname(name)]);
         }

         if (req.method === "GET" && url.pathname === "/events") {
            res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
            res.write("retry: 1000\n\n");
            clients.add(res);
            return req.on("close", () => clients.delete(res));
         }

         send(res, 404, { error: "Not found" });
      } catch (error) {
         send(res, 500, { error: error.message, details: error.details });
      }
   });

   // Use the next free port if the preferred one is taken.
   const listen = (p) =>
      new Promise((resolveListen, reject) => {
         server.once("error", reject);
         server.listen(p, "127.0.0.1", () => resolveListen(p));
      });
   let actual;
   for (let p = port; p < port + 15 && !actual; p++) {
      try {
         actual = await listen(p);
      } catch (error) {
         if (error.code !== "EADDRINUSE") throw error;
      }
   }
   if (!actual) throw new Error(`No free port between ${port} and ${port + 14}.`);

   origin = `http://localhost:${actual}`;
   allowedOrigins = new Set([origin, `http://127.0.0.1:${actual}`]);
   console.log(`\n  CV Studio  ${origin}\n  Editing    ${resumePath}\n  Exports to ${outDir}\n\n  Press Ctrl+C to stop.\n`);
   if (open) openInBrowser(origin);
   return { server, url: origin };
};
