// A small headless-Chrome driver over the DevTools protocol. It uses the
// browser already installed on the machine, so cv-builder needs no packages.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CANDIDATES = {
   win32: [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
   ],
   darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
   ],
   linux: [
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
      "/usr/bin/microsoft-edge",
   ],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const findBrowser = () => {
   const candidates = [process.env.CHROME_PATH, ...(CANDIDATES[process.platform] ?? CANDIDATES.linux)].filter(Boolean);
   const found = candidates.find((path) => existsSync(path));
   if (!found)
      throw new Error(
         "No Chrome, Edge, Chromium or Brave found. Install one, or set CHROME_PATH to the browser executable."
      );
   return found;
};

export const openBrowser = async () => {
   const workDir = mkdtempSync(join(tmpdir(), "cv-builder-"));
   const port = 9200 + Math.floor(Math.random() * 700);
   const child = spawn(
      findBrowser(),
      [
         "--headless=new",
         "--disable-gpu",
         "--no-first-run",
         "--no-default-browser-check",
         "--hide-scrollbars",
         `--remote-debugging-port=${port}`,
         `--user-data-dir=${join(workDir, "profile")}`,
         "about:blank",
      ],
      { stdio: "ignore" }
   );

   const close = async () => {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await Promise.race([exited, sleep(3000)]);
      try {
         // Windows may hold profile files briefly after exit; cleanup is best effort.
         rmSync(workDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch {
         // Left in the OS temp folder.
      }
   };

   try {
      let target;
      for (let i = 0; i < 80 && !target; i++) {
         try {
            const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
            target = targets.find((t) => t.type === "page");
         } catch {
            await sleep(125);
         }
      }
      if (!target) throw new Error("Could not connect to the headless browser.");

      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
         ws.addEventListener("open", resolve, { once: true });
         ws.addEventListener("error", () => reject(new Error("Browser connection failed.")), { once: true });
      });

      let nextId = 0;
      const pending = new Map();
      ws.addEventListener("message", (event) => {
         const message = JSON.parse(event.data);
         const handler = pending.get(message.id);
         if (!handler) return;
         pending.delete(message.id);
         if (message.error) handler.reject(new Error(message.error.message));
         else handler.resolve(message.result);
      });
      const send = (method, params = {}) =>
         new Promise((resolve, reject) => {
            const id = ++nextId;
            pending.set(id, { resolve, reject });
            ws.send(JSON.stringify({ id, method, params }));
         });

      const evaluate = async (expression) => {
         const { result, exceptionDetails } = await send("Runtime.evaluate", {
            expression,
            returnByValue: true,
            awaitPromise: true,
         });
         if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
         return result.value;
      };

      await send("Page.enable");
      await send("Runtime.enable");

      return {
         evaluate,
         send,

         // Loads an HTML string and waits for it and its web fonts (max ~8s).
         async load(html) {
            const file = join(workDir, "cv.html");
            writeFileSync(file, html);
            await send("Page.navigate", { url: pathToFileURL(file).href });
            for (let i = 0; i < 80; i++) {
               const ready = await evaluate(
                  "document.readyState === 'complete' && document.fonts.status === 'loaded'"
               ).catch(() => false);
               if (ready) break;
               await sleep(100);
            }
            await sleep(150);
         },

         media: (media) => send("Emulation.setEmulatedMedia", { media }),

         async pdf() {
            const { data } = await send("Page.printToPDF", {
               printBackground: true,
               preferCSSPageSize: true,
               displayHeaderFooter: false,
               generateDocumentOutline: true,
               generateTaggedPDF: true,
            });
            return Buffer.from(data, "base64");
         },

         // PNG of the first page (2x by default), for previews and social cards.
         async screenshot({ scale = 2 } = {}) {
            const box = await evaluate(
               "(() => { const r = document.querySelector('.page').getBoundingClientRect(); const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;height:var(--page-h)'; document.body.append(probe); const h = probe.getBoundingClientRect().height; probe.remove(); return { width: r.width, height: h }; })()"
            );
            await send("Emulation.setDeviceMetricsOverride", {
               width: Math.ceil(box.width),
               height: Math.ceil(box.height),
               deviceScaleFactor: scale,
               mobile: false,
            });
            const { data } = await send("Page.captureScreenshot", {
               format: "png",
               clip: { x: 0, y: 0, width: box.width, height: box.height, scale: 1 },
               captureBeyondViewport: true,
            });
            return Buffer.from(data, "base64");
         },

         close: async () => {
            ws.close();
            await close();
         },
      };
   } catch (error) {
      await close();
      throw error;
   }
};

export const countPdfPages = (pdf) => (pdf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
