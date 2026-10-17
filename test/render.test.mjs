import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { mergeOptions, validateOptions } from "../src/config.mjs";
import { createContext, renderDocument } from "../src/render.mjs";
import { loadResume } from "../src/resume.mjs";
import { THEMES, themeIds } from "../src/themes/index.mjs";

const example = fileURLToPath(new URL("../examples/resume.json", import.meta.url));
const { resume } = await loadResume(example);

for (const theme of THEMES) {
   test(`${theme.id} renders every populated section`, () => {
      const html = renderDocument(resume, mergeOptions({ theme: theme.id }));
      assert.match(html, /^<!doctype html>/);
      assert.ok(html.includes("Alex Morgan"));
      for (const id of ["work", "projects", "education", "skills", "languages", "certificates", "interests"]) {
         assert.ok(html.includes(`section--${id}`), `${theme.id} is missing ${id}`);
      }
      assert.ok(html.includes(`--accent: ${theme.accent}`));
   });
}

test("options override accent, paper and density", () => {
   const html = renderDocument(resume, mergeOptions({ accent: "#e11d48", paper: "letter", density: 0.9 }));
   assert.ok(html.includes("--accent: #e11d48"));
   assert.ok(html.includes("@page { size: letter"));
   assert.ok(html.includes("--d: 0.9"));
});

test("custom section order and hidden sections", () => {
   const options = mergeOptions({ theme: "minimal", sections: ["skills", "work"], hide: ["work"] });
   const ctx = createContext(resume, options);
   assert.deepEqual(ctx.order, ["skills"]);
});

test("sidebar themes split sections between main and side", () => {
   const ctx = createContext(resume, mergeOptions({ theme: "aurora" }));
   assert.deepEqual(ctx.side, ["skills", "education", "certificates", "languages", "interests"]);
   assert.ok(ctx.main.includes("work") && !ctx.main.includes("skills"));
});

test("labels can be translated", () => {
   const html = renderDocument(resume, mergeOptions({ theme: "minimal", labels: { work: "Expérience" } }));
   assert.ok(html.includes(">Expérience</h2>"));
});

test("the photo can be turned off", () => {
   const html = renderDocument(resume, mergeOptions({ photo: false }));
   assert.ok(!html.includes('class="photo"'));
});

test("user content is escaped", () => {
   const evil = { ...resume, basics: { ...resume.basics, name: "<script>alert(1)</script>" } };
   const html = renderDocument(evil, mergeOptions());
   assert.ok(!html.includes("<script>alert(1)</script>"));
});

test("option validation catches mistakes", () => {
   const errors = validateOptions(mergeOptions({ theme: "nope", accent: "blue", paper: "a5", density: 3, sections: ["bogus"] }), themeIds);
   assert.equal(errors.length, 5);
});

test("undefined CLI values never override defaults", () => {
   const options = mergeOptions({ output: { dir: undefined, formats: undefined } });
   assert.equal(options.output.dir, "dist");
   assert.deepEqual(options.output.formats, ["pdf"]);
});

test("a locale translates titles and 'Present'; user labels still win", async () => {
   const { resume: fr } = await loadResume(example, { locale: "fr" });
   const html = renderDocument(fr, mergeOptions({ theme: "minimal", locale: "fr", labels: { skills: "Savoir-faire" } }));
   assert.ok(html.includes(">Expérience</h2>"));
   assert.ok(html.includes(">Savoir-faire</h2>"));
   assert.ok(html.includes("mars 2022 – Aujourd&#39;hui"));
});
