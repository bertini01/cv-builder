import assert from "node:assert/strict";
import { test } from "node:test";

import { escapeHtml, fluencyLevel, formatDate, formatRange, inline, shortUrl, slugify } from "../src/format.mjs";

test("escapeHtml neutralises markup", () => {
   assert.equal(escapeHtml(`<script>"x" & 'y'</script>`), "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;");
});

test("inline supports a safe Markdown subset", () => {
   assert.equal(inline("**bold** and *italic* and `code`"), "<strong>bold</strong> and <em>italic</em> and <code>code</code>");
   assert.equal(inline("[site](https://example.com)"), '<a href="https://example.com">site</a>');
   assert.equal(inline("[wiki](https://en.wikipedia.org/wiki/Node_(software))"), '<a href="https://en.wikipedia.org/wiki/Node_(software)">wiki</a>');
});

test("inline never emits unsafe links or raw HTML", () => {
   assert.equal(inline("[x](javascript:alert(1))"), "x");
   assert.equal(inline("<img src=x onerror=alert(1)>"), "&lt;img src=x onerror=alert(1)&gt;");
});

test("formatDate handles JSON Resume date shapes and formats", () => {
   assert.equal(formatDate("2024-05"), "May 2024");
   assert.equal(formatDate("2024-05-17"), "May 2024");
   assert.equal(formatDate("2024"), "2024");
   assert.equal(formatDate("2024-05", { dateFormat: "numeric" }), "05/2024");
   assert.equal(formatDate("2024-05", { dateFormat: "year" }), "2024");
   assert.equal(formatDate("2024-05", { dateFormat: "long" }), "May 2024");
   assert.equal(formatDate("2024-02", { locale: "fr" }), "févr. 2024");
   assert.equal(formatDate("Summer 2020"), "Summer 2020");
   assert.equal(formatDate(""), "");
});

test("formatRange fills in the present and collapses equal ends", () => {
   assert.equal(formatRange("2022-03"), "Mar 2022 – Present");
   assert.equal(formatRange("2022-03", undefined, { presentLabel: "Aujourd'hui" }), "Mar 2022 – Aujourd'hui");
   assert.equal(formatRange("2019-06", "2022-02"), "Jun 2019 – Feb 2022");
   assert.equal(formatRange("2020", "2020"), "2020");
   assert.equal(formatRange(undefined, undefined), "");
});

test("fluencyLevel maps labels and numbers to 1-5", () => {
   assert.equal(fluencyLevel("Native speaker"), 5);
   assert.equal(fluencyLevel("Professional working proficiency"), 4);
   assert.equal(fluencyLevel("Intermediate"), 3);
   assert.equal(fluencyLevel("Basic"), 2);
   assert.equal(fluencyLevel("Something else"), 3);
   assert.equal(fluencyLevel("", 80), 4);
   assert.equal(fluencyLevel("", 2), 2);
});

test("shortUrl and slugify", () => {
   assert.equal(shortUrl("https://www.example.com/"), "example.com");
   assert.equal(shortUrl("mailto:a@b.co"), "a@b.co");
   assert.equal(slugify("Zoë Müller CV"), "Zoe-Muller-CV");
});
