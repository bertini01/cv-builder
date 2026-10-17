import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { ResumeError, loadResume, normalizeResume, readResume, validateResume } from "../src/resume.mjs";

const example = fileURLToPath(new URL("../examples/resume.json", import.meta.url));
const temp = (name, content) => {
   const path = join(mkdtempSync(join(tmpdir(), "cvb-test-")), name);
   writeFileSync(path, content);
   return path;
};

test("the bundled example is valid and loads", async () => {
   const { resume, warnings } = await loadResume(example);
   assert.equal(resume.basics.name, "Alex Morgan");
   assert.equal(resume.basics.location, "Lisbon, PT");
   assert.match(resume.basics.image, /^data:image\/svg\+xml;base64,/);
   assert.equal(resume.work[0].period, "Mar 2022 – Present");
   assert.deepEqual(resume.work[0].keywords, ["Next.js", "NestJS", "PostgreSQL", "AWS"]);
   assert.deepEqual(warnings, []);
});

test("validation reports precise paths", () => {
   const { errors, warnings } = validateResume({
      basics: { email: "nope" },
      work: [{ highlights: "not a list", startDate: "March 2020" }],
      skills: "nope",
      extra: true,
   });
   assert.ok(errors.includes("basics.name: required."));
   assert.ok(errors.includes("work[0].highlights: must be a list of strings."));
   assert.ok(errors.includes("skills: must be an array."));
   assert.ok(warnings.some((w) => w.startsWith("basics.email")));
   assert.ok(warnings.some((w) => w.startsWith("work[0].startDate")));
   assert.ok(warnings.includes("extra: not a JSON Resume section, ignored."));
});

test("invalid JSON reports the line and column", async () => {
   const path = temp("broken.json", '{\n  "basics": {\n    "name": "A",\n  }\n}');
   await assert.rejects(readResume(path), (error) => error instanceof ResumeError && /line 4, column 3/.test(error.message));
});

test("loadResume throws with details when the resume is invalid", async () => {
   const path = temp("invalid.json", JSON.stringify({ basics: {} }));
   await assert.rejects(loadResume(path), (error) => error.details.includes("basics.name: required."));
});

test("JS resumes are supported", async () => {
   const path = temp("resume.mjs", 'export default { basics: { name: "Js Person" } };');
   const { resume } = await loadResume(path);
   assert.equal(resume.basics.name, "Js Person");
});

test("normalisation tolerates sparse data", () => {
   const resume = normalizeResume({ basics: { name: "Solo" }, projects: [{ name: "P", roles: ["Lead"] }] });
   assert.equal(resume.work.length, 0);
   assert.equal(resume.projects[0].tagline, "Lead");
   assert.equal(resume.projects[0].period, "");
});
