import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sample = {
  id: "imp20261106_v123", sku: "MM-123", name: "Miniquad rojo", shortDesc: "Miniquad eléctrico rojo.",
  description: "Miniquad eléctrico rojo con motor de 800 W y batería de 36 V.",
  price: 109.99, sourcePriceCents: 9999, category: "vehiculos", categoryName: "Vehículos",
  subcategory: "mini-quads-electricos", subcategoryName: "Mini quads eléctricos", brand: "ROAN",
  motorPower: 800, battery: "36 V", images: [{ url: "https://19e3cavvu8vlpeyt.public.blob.vercel-storage.com/products/photo.webp", alt: "Miniquad rojo" }],
};

function setup(role?: string, existing: any[] = [], failAt = "") {
  let products = [...existing];
  let categories: any[] = [];
  let subcategories: any[] = [];
  const tx = {
    product: {
      findFirst: async ({ where }: any) => products.find(p => where.OR.some((condition: any) => condition.id === p.id || condition.sku === p.sku)) ?? null,
      create: async ({ data }: any) => { if (data.id === failAt) throw new Error("database failure"); products.push(data); return data; },
    },
    category: { upsert: async ({ where, create }: any) => { const existing = categories.find(c => c.slug === where.slug); if (existing) return existing; const c = { id: "cat-" + create.slug, ...create }; categories.push(c); return c; } },
    subcategory: { upsert: async ({ where, create }: any) => { const existing = subcategories.find(s => s.categoryId === where.categoryId_slug.categoryId && s.slug === where.categoryId_slug.slug); if (existing) return existing; subcategories.push(create); return create; } },
  };
  const prisma = { $transaction: async (fn: any) => { const before = structuredClone({ products, categories, subcategories }); try { return await fn(tx); } catch (e) { ({ products, categories, subcategories } = before); throw e; } } };
  const path = "src/app/api/admin/productos/importar/route.ts";
  assert.ok(existsSync(path), "The authenticated import endpoint must exist before importing drafts");
  const dependencies: Record<string, unknown> = {
    "next-auth": { getServerSession: async () => role ? { user: { role } } : null },
    "@/lib/auth": { authOptions: {} }, "@/lib/prisma": { prisma },
  };
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)((name: string) => dependencies[name] ?? require(name.startsWith("@/") ? "../src/" + name.slice(2) : name), module, module.exports);
  const post = (body: unknown) => module.exports.POST(new Request("https://example.test/api/admin/productos/importar", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.test" }, body: JSON.stringify(body) }));
  return { post, state: () => ({ products, categories, subcategories }) };
}

test("import rejects anonymous and customer requests", async () => {
  for (const role of [undefined, "CLIENT"]) {
    const app = setup(role);
    assert.equal((await app.post({ products: [sample] })).status, 403);
    assert.equal(app.state().products.length, 0);
  }
});

test("import creates hidden unpaid drafts with images and categories", async () => {
  const app = setup("ADMIN");
  const response = await app.post({ products: [sample] });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).insertedIds, ["imp20261106_v123"]);
  const p = app.state().products[0];
  assert.equal(p.active, false); assert.equal(p.stock, 5); assert.equal(p.featured, false);
  assert.equal(p.stripeLink, ""); assert.equal(p.shippingCost, null); assert.equal(p.compareAt, null);
  assert.equal(p.youtubeUrl, null); assert.equal(p.price, 109.99); assert.equal(p.currency, "EUR");
  assert.deepEqual(p.images.create, [{ url: sample.images[0].url, alt: "Miniquad rojo", order: 0 }]);
  assert.equal(app.state().categories[0].slug, "vehiculos");
  assert.equal(app.state().subcategories[0].slug, "mini-quads-electricos");
});

test("repeated imports and existing SKU matches skip instead of modifying products", async () => {
  const original = { id: "original-live", sku: "MM-456", active: true, price: 90, name: "Original" };
  const app = setup("ADMIN", [original]);
  await app.post({ products: [sample] });
  const response = await app.post({ products: [sample, { ...sample, id: "imp20261106_v456", sku: "MM-456" }] });
  const result = await response.json();
  assert.equal(result.inserted, 0); assert.equal(result.skipped, 2);
  assert.deepEqual(app.state().products[0], original);
  assert.equal(app.state().products.length, 2);
});

test("import rejects wrong markup, wrong cents, missing price and forged IDs", async () => {
  for (const change of [{ price: 110 }, { price: 109.991 }, { sourcePriceCents: 0 }, { sourcePriceCents: 9999.5 }, { id: "old-live" }, { sku: "MM-other" }]) {
    const app = setup("ADMIN");
    assert.equal((await app.post({ products: [{ ...sample, ...change }] })).status, 400);
    assert.equal(app.state().products.length, 0);
  }
});

test("import rejects public-state overrides, retailer references, external links and images", async () => {
  for (const change of [
    { active: true }, { stripeLink: "https://buy.stripe.com/test" }, { stock: 99 },
    { name: "Casco MotosMH" }, { description: "Consulta https://example.com para comprar este producto." },
    { images: [{ url: "https://motosmh.com/photo.jpg", alt: "Moto" }] },
    { images: [{ url: "https://other-store.public.blob.vercel-storage.com/photo.jpg", alt: "Moto" }] },
    { images: [{ url: "https://store.public.blob.vercel-storage.com.evil.test/photo.jpg", alt: "Moto" }] },
    { images: [{ url: "//external.test/photo.jpg", alt: "Moto" }] },
    { images: [{ url: "/photo.jpg", alt: "Motos MH" }] },
  ]) {
    const app = setup("ADMIN");
    assert.equal((await app.post({ products: [{ ...sample, ...change }] })).status, 400);
    assert.equal(app.state().products.length, 0);
  }
});

test("markup rounds half-cent boundaries upward using the original price", async () => {
  for (const [sourcePriceCents, price] of [[5, 0.06], [15, 0.17], [565, 6.22], [1005, 11.06]]) {
    const app = setup("ADMIN");
    assert.equal((await app.post({ products: [{ ...sample, sourcePriceCents, price }] })).status, 200);
    assert.equal(app.state().products[0].price, price);
  }
});

test("import requires one to 25 distinct products and coherent subcategory fields", async () => {
  const app = setup("ADMIN");
  for (const products of [[], [sample, sample], Array.from({ length: 26 }, (_, i) => ({ ...sample, id: `imp20261106_v${i}`, sku: `MM-${i}` })), [{ ...sample, subcategoryName: undefined }]]) {
    assert.equal((await app.post({ products })).status, 400);
  }
  assert.equal(app.state().products.length, 0);
});

test("database failure rolls back the complete batch so retry is safe", async () => {
  const app = setup("ADMIN", [], "imp20261106_v456");
  const response = await app.post({ products: [sample, { ...sample, id: "imp20261106_v456", sku: "MM-456" }] });
  assert.equal(response.status, 500);
  assert.equal(app.state().products.length, 0);
  assert.equal(app.state().categories.length, 0);
});
