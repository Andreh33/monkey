import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogQuery,
  catalogPath,
  purchaseEligible,
  localePath,
  equivalentLanguages,
  sourceHash,
  translatedProduct,
  localizedSearchIds,
  catalogIndexable,
} from "../src/lib/storefront";
import { generateMetadata as supportMetadata } from "../src/app/(international)/[locale]/(pages)/[page]/page";
import { metadata as spanishHome } from "../src/app/(es)/page";

test("empty categories and searches are excluded from indexable groups", () => {
  assert.equal(catalogIndexable(catalogQuery({ cat: "recambio" }), 0), false);
  assert.equal(catalogIndexable(catalogQuery({ cat: "patinete" }), 24), true);
  assert.equal(catalogIndexable(catalogQuery({ q: "batterie" }), 24), false);
});

test("locale links retain useful category and pagination state", () => {
  assert.equal(
    localePath("fr", "/tienda?cat=patinete&page=2"),
    "/fr/tienda?cat=patinete&page=2",
  );
  assert.equal(localePath("es", "/pt/tienda/modelo"), "/tienda/modelo");
  assert.equal(
    equivalentLanguages("/tienda").fr,
    "https://monopatinmonkey.com/fr/tienda",
  );
  assert.equal(localePath("es", "/fr?campaign=one"), "/?campaign=one");
  assert.equal(localePath("pt", "/fr"), "/pt");
});

test("translated purchase guides remain noindex and use their own canonical", () => {
  for (const locale of ["fr", "it", "pt"]) {
    for (const page of ["carrito", "checkout"]) {
      const metadata = supportMetadata({ params: { locale, page } });
      assert.deepEqual(metadata.robots, { index: false, follow: true });
      assert.equal(metadata.alternates?.canonical, `/${locale}/${page}`);
    }
  }
});

test("public equivalent pages expose reciprocal language groups", () => {
  const es = (spanishHome.alternates?.languages ?? {}) as Record<
    string,
    string
  >;
  assert.equal(es["x-default"], "https://monopatinmonkey.com/");
  for (const locale of ["fr", "it", "pt"]) {
    const metadata = supportMetadata({ params: { locale, page: "contacto" } });
    assert.equal(metadata.alternates?.canonical, `/${locale}/contacto`);
    assert.deepEqual(
      metadata.alternates?.languages,
      equivalentLanguages("/contacto"),
    );
    assert.equal(es[locale], `https://monopatinmonkey.com/${locale}`);
  }
});
test("catalogue rejects malformed and excessive input, bounds each page to 24", () => {
  for (const page of ["-1", "0", "1e8", "10001", "1.5"])
    assert.equal(catalogQuery({ page }).valid, false);
  assert.equal(catalogQuery({ range: "oops" }).valid, false);
  assert.equal(catalogQuery({ sort: "unknown" }).valid, false);
  assert.equal(catalogQuery({ q: ["a", "b"] }).valid, false);
  const query = catalogQuery({ cat: "patinete", page: "2" });
  assert.equal(query.skip, 24);
  assert.equal(query.take, 24);
  assert.equal(query.filtered, false);
  assert.equal(catalogPath("it", query), "/it/tienda?cat=patinete&page=2");
  assert.equal(catalogQuery({ q: "Dualtron" }).filtered, true);
});

test("campaign attribution does not break the catalogue or pollute canonicals", () => {
  const query = catalogQuery({
    cat: "patinete",
    utm_source: "google",
    utm_campaign: "otoño",
    gclid: "123",
    fbclid: "456",
    msclkid: "789",
  });
  assert.equal(query.valid, true);
  assert.equal(query.filtered, false);
  assert.equal(catalogPath("fr", query), "/fr/tienda?cat=patinete");
});
test("purchase requires stock, active record, valid original Stripe link and consent", () => {
  const p = {
    active: true,
    stock: 1,
    stripeLink: "https://buy.stripe.com/test_abc",
  };
  assert.equal(purchaseEligible(p, true), true);
  for (const change of [
    { stock: 0 },
    { active: false },
    { stripeLink: "javascript:alert(1)" },
    { stripeLink: "https://buy.stripe.com.evil.example/x" },
  ])
    assert.equal(purchaseEligible({ ...p, ...change }, true), false);
  assert.equal(purchaseEligible(p, false), false);
});
test("translations require an exact current source hash and complete fields", () => {
  const p = {
    id: "one",
    name: "Modelo 500 W",
    shortDesc: "Motor 500 W",
    description: "Batería 48 V",
  };
  const entry = {
    sourceHash: sourceHash(p),
    name: "Modèle 500 W",
    shortDesc: "Moteur 500 W",
    description: "Batterie 48 V",
  };
  assert.equal(translatedProduct(p, "fr", { one: entry }).translated, true);
  assert.equal(
    translatedProduct({ ...p, description: "Batería 60 V" }, "fr", {
      one: entry,
    }).translated,
    false,
  );
  assert.equal(translatedProduct(p, "fr", {}).name, p.name);
  assert.equal(translatedProduct(p, "es", {}).translated, true);
});

test("localized search matches the presented name and summary", () => {
  const map = {
    one: {
      sourceHash: "hash",
      name: "Trottinette Dualtron 500 W",
      shortDesc: "Batterie 48 V",
      description: "Texte technique",
    },
  };
  assert.deepEqual(localizedSearchIds("fr", "batterie", map), ["one"]);
  assert.deepEqual(localizedSearchIds("fr", "TROTTINETTE", map), ["one"]);
  assert.deepEqual(localizedSearchIds("fr", "inconnu", map), []);
});
