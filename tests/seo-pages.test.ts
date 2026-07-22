import assert from "node:assert/strict";
import test from "node:test";
import { metadata as aviso } from "../src/app/aviso-legal/page";
import { metadata as privacidad } from "../src/app/privacidad/page";
import { metadata as cookies } from "../src/app/cookies/page";
import { metadata as condiciones } from "../src/app/condiciones-compra/page";
import { generateMetadata } from "../src/app/blog/[slug]/page";
import { getPostBySlug } from "../src/lib/blog";

const legalCases = [
  [aviso, "/aviso-legal"],
  [privacidad, "/privacidad"],
  [cookies, "/cookies"],
  [condiciones, "/condiciones-compra"],
] as const;

test("las páginas legales emiten canonical autorreferente", () => {
  for (const [metadata, canonical] of legalCases) {
    assert.equal(metadata.alternates?.canonical, canonical);
  }
});

for (const slug of [
  "edad-minima-patinete-electrico",
  "donde-circular-patinete-electrico",
]) {
  test(`la guía prioritaria ${slug} controla su fragmento SEO`, () => {
    const post = getPostBySlug(slug);
    assert.ok(post);
    assert.equal(post.updated, "2026-07-22");
    assert.ok(post.description.length >= 120);
    assert.ok(post.description.length <= 155);

    const metadata = generateMetadata({ params: { slug } });
    const title = metadata.title;
    assert.ok(title && typeof title === "object" && "absolute" in title);
    assert.ok(title.absolute);
    assert.ok(title.absolute.length <= 60);
    assert.equal(metadata.description, post.description);
  });
}
