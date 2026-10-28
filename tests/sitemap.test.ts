import assert from "node:assert/strict";
import test from "node:test";
import { serializeSitemap } from "../src/lib/sitemap-xml";

test("sitemap escapes query separators in loc and alternate attributes", () => {
  const url = "https://monopatinmonkey.com/tienda?cat=patinete&page=2";
  const xml = serializeSitemap([{ url, alternates: { languages: { es: url } } }]);
  assert.ok(xml.includes("<loc>" + url.replaceAll("&", "&amp;") + "</loc>"));
  assert.ok(xml.includes('href="' + url.replaceAll("&", "&amp;") + '"'));
});

test("sitemap preserves metadata and escapes XML attribute delimiters once", () => {
  const xml = serializeSitemap([{
    url: 'https://example.com/a?<x>=1&name="test"',
    alternates: { languages: { "x-default": "https://example.com/a?x=1&b=2" } },
    lastModified: new Date("2026-10-25"), changeFrequency: "weekly", priority: 0,
  }]);
  assert.match(xml, /&lt;x&gt;=1&amp;name=&quot;test&quot;/);
  assert.match(xml, /<lastmod>2026-10-25T00:00:00.000Z<\/lastmod>/);
  assert.match(xml, /<priority>0<\/priority>/);
  assert.ok(!xml.includes("&amp;amp;"));
});
