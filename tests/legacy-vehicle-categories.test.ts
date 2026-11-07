import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { legacyVehicleCategoryPath } from "../src/lib/legacy-vehicle-categories";
import { catalogQuery, locales } from "../src/lib/storefront-routes";

test("old vehicle subcategories redirect to their new groups in every language", () => {
  for (const locale of locales) {
    const prefix = locale === "es" ? "" : `/${locale}`;
    for (const [sub, cat, retainSub] of [
      ["pit-bikes-de-gasolina", "pit-bikes", true],
      ["pit-bikes-electricas", "pit-bikes", true],
      ["minimotos-gasolina", "minimotos", true],
      ["minimotos-electricas", "minimotos", true],
      ["mini-quads-gasolina", "quads", true],
      ["mini-quads-electricos", "quads", true],
      ["buggies", "buggies", false],
      ["coches-electricos-infantiles", "coches-electricos-infantiles", false],
      ["motos-matriculables", "motos-matriculables", false],
      ["hoverboard", "hoverboard", false],
    ] as const) {
      assert.equal(
        legacyVehicleCategoryPath({ cat: "vehiculos", sub, page: "3" }, locale),
        `${prefix}/tienda?cat=${cat}${retainSub ? `&sub=${sub}` : ""}`,
      );
    }
    for (const sub of [undefined, "unknown", "constructor", "__proto__"])
      assert.equal(
        legacyVehicleCategoryPath({ cat: "vehiculos", sub, page: "3" }, locale),
        `${prefix}/tienda`,
      );
  }
});

test("redirects preserve filters and safe attribution while resetting pagination", () => {
  const result = legacyVehicleCategoryPath({
    cat: "vehiculos", sub: "buggies", page: "4", q: "niño & eléctrico",
    brand: "Ecoxtrem", price: "0-500", range: "20", sort: "price-asc",
    utm_source: "email", utm_campaign: "otoño", gclid: "abc?x=1&y=2",
    fbclid: ["ambiguous", "value"], msclkid: "bad\r\nheader",
    ttclid: "x".repeat(2049),
  }, "pt");
  const url = new URL(result!, "https://monopatinmonkey.com");
  assert.equal(url.pathname, "/pt/tienda");
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    cat: "buggies", brand: "Ecoxtrem", price: "0-500", range: "20",
    q: "niño & eléctrico", sort: "price-asc", utm_source: "email",
    utm_campaign: "otoño", gclid: "abc?x=1&y=2",
  });
});

test("unrelated or malformed queries do not gain a legacy redirect", () => {
  for (const input of [
    {}, { cat: "patinete" }, { cat: "quads", sub: "mini-quads-gasolina" },
    { cat: ["vehiculos", "patinete"] }, { cat: "vehiculos", page: "0" },
    { cat: "vehiculos", sub: ["buggies", "hoverboard"] },
    { cat: "vehiculos", redirect: "https://example.com" },
  ]) assert.equal(legacyVehicleCategoryPath(input, "es"), null);
  const localOnly = legacyVehicleCategoryPath({
    cat: "vehiculos", sub: "//example.com", q: "https://example.com?x=1",
  }, "es");
  assert.equal(new URL(localOnly!, "https://monopatinmonkey.com").origin,
    "https://monopatinmonkey.com");
});

test("catalogue redirects legacy queries before reading the category tree or database", async () => {
  const code = ts.transpileModule(readFileSync("src/lib/catalog.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} as any };
  const requireMock = (name: string) => {
    if (name === "react") return { cache: (fn: unknown) => fn };
    if (name === "next/navigation") return {
      permanentRedirect: (path: string) => { throw new Error(`308:${path}`); },
      notFound: () => { throw new Error("404"); },
    };
    if (name === "./storefront") return { catalogQuery };
    if (name === "./legacy-vehicle-categories") return { legacyVehicleCategoryPath };
    if (name === "./categories") return {
      getCategoryTree: () => { assert.fail("Legacy redirect must precede database reads"); },
    };
    return {};
  };
  new Function("require", "module", "exports", code)(requireMock, module, module.exports);
  await assert.rejects(
    module.exports.loadCatalog({ cat: "vehiculos", sub: "buggies" }, "fr"),
    /^Error: 308:\/fr\/tienda\?cat=buggies$/,
  );
  await assert.rejects(
    module.exports.loadCatalog({ cat: "vehiculos", page: "0" }, "fr"),
    /^Error: 404$/,
  );
});
