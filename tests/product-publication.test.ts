import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const valid = { id: "imp20261106_v1", name: "Test product", price: 110, stock: 5, active: false, shippingCost: 5, images: [{ url: "https://monopatinmonkey.com/product.png" }] };
function load(kind: "publicar" | "envios", initial = [valid], role = "ADMIN") {
  const rows = structuredClone(initial);
  const invalidations: string[] = [];
  const matches = (p: any, where: any) => (!where.id || (typeof where.id === "string" ? p.id === where.id : where.id.in.includes(p.id))) && (where.active === undefined || where.active === p.active) && (!where.stock || p.stock > where.stock.gt) && (!where.price || p.price > where.price.gt);
  const db = { product: {
    findMany: async ({ where = {} }: any = {}) => rows.filter(p => matches(p, where)),
    updateMany: async ({ where, data }: any) => { const selected = rows.filter(p => matches(p, where)); for (const p of selected) Object.assign(p, data); return { count: selected.length }; },
  } };
  const prisma = { ...db, $transaction: async (fn: any) => {
    const snapshot = structuredClone(rows);
    try { return await fn(db); } catch (e) { rows.splice(0, rows.length, ...snapshot); throw e; }
  } };
  const dependencies: Record<string, unknown> = {
    "next-auth": { getServerSession: async () => role ? { user: { role } } : null },
    "@/lib/auth": { authOptions: {} }, "@/lib/prisma": { prisma },
    "@/lib/catalog-cache": { revalidateCatalog: () => invalidations.push("catalog") },
  };
  const run = (path: string): any => {
    const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} as any };
    new Function("require", "module", "exports", code)((name: string) => dependencies[name] ?? (name === "@/lib/product-publication" ? run("src/lib/product-publication.ts") : name === "./checkout-types" ? run("src/lib/checkout-types.ts") : require(name)), module, module.exports);
    return module.exports;
  };
  return { route: run(`src/app/api/admin/productos/${kind}/route.ts`), rows, invalidations };
}
const req = (kind: string, body: unknown, origin = "https://monkey.test") => new Request(`https://monkey.test/api/admin/productos/${kind}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
const withStripe = async (run: () => Promise<void>) => {
  const old = [process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET];
  process.env.STRIPE_SECRET_KEY = "configured-test-key"; process.env.STRIPE_WEBHOOK_SECRET = "configured-test-signature";
  try { await run(); } finally {
    for (const [key, value] of [["STRIPE_SECRET_KEY", old[0]], ["STRIPE_WEBHOOK_SECRET", old[1]]]) value === undefined ? delete process.env[key!] : process.env[key!] = value;
  }
};

test("publication requires admin and a configured payment backend", async () => {
  assert.equal((await load("publicar", [valid], "CLIENT").route.POST(req("publicar", { ids: [valid.id] }))).status, 403);
  const old = process.env.STRIPE_SECRET_KEY; delete process.env.STRIPE_SECRET_KEY;
  try { assert.equal((await load("publicar").route.POST(req("publicar", { ids: [valid.id] }))).status, 503); }
  finally { if (old !== undefined) process.env.STRIPE_SECRET_KEY = old; }
});
test("publication changes visibility only and retries do not duplicate or reprice", async () => withStripe(async () => {
  const { route, rows, invalidations } = load("publicar");
  assert.equal((await route.POST(req("publicar", { ids: [valid.id] }))).status, 200);
  assert.deepEqual(rows, [{ ...valid, active: true }]);
  assert.equal(invalidations.length, 1);
  const again = await route.POST(req("publicar", { ids: [valid.id] }));
  assert.equal(again.status, 200); assert.equal((await again.json()).published, 0);
  assert.equal(invalidations.length, 1);
}));
test("stock, price, image and imported shipping are validated before publication", async () => withStripe(async () => {
  for (const bad of [{ ...valid, stock: 0 }, { ...valid, price: 0 }, { ...valid, price: 1000000 }, { ...valid, images: [] }, { ...valid, images: [{ url: "javascript:alert(1)" }] }, { ...valid, shippingCost: 0 }, { ...valid, shippingCountries: '["ZZ"]' }, { ...valid, shippingCountries: '[]' }, { ...valid, shippingCountries: 'bad-json' }]) {
    const { route, rows } = load("publicar", [bad]);
    assert.equal((await route.POST(req("publicar", { ids: [valid.id] }))).status, 409);
    assert.equal(rows[0].active, false);
  }
}));
test("shipping import only changes tariffs on hidden imported products", async () => {
  const { route, rows, invalidations } = load("envios");
  assert.equal((await route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 25 }] }))).status, 200);
  assert.deepEqual(rows, [{ ...valid, shippingCost: 25 }]);
  assert.equal(invalidations.length, 1);
  assert.equal((await load("envios", [{ ...valid, active: true }]).route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 25 }] }))).status, 409);
  assert.equal((await route.POST(req("envios", { products: [{ id: "existing-product", shippingCost: 25 }] }))).status, 409);
  assert.equal(invalidations.length, 1);
});

test("shipping destinations must be supported by checkout", async () => {
  for (const code of ["ZZ", "US"]) {
    const { route, rows } = load("envios");
    assert.equal((await route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 25, shippingCountries: [code] }] }))).status, 400);
    assert.deepEqual(rows, [valid]);
  }
});
test("shipping preparation can correct an explicit motor power without editing price or stock", async () => {
  const { route, rows } = load("envios");
  assert.equal((await route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 25, motorPower: 1000 }] }))).status, 200);
  assert.deepEqual(rows, [{ ...valid, shippingCost: 25, motorPower: 1000 }]);
  assert.equal((await route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 25, motorPower: 1.5 }] }))).status, 400);
});
test("foreign origins, mixed update fields and negative tariffs cannot mutate catalog", async () => withStripe(async () => {
  assert.equal((await load("publicar").route.POST(req("publicar", { ids: [valid.id] }, "https://foreign.test"))).status, 403);
  assert.equal((await load("envios").route.POST(req("envios", { products: [{ id: valid.id, shippingCost: -1 }] }))).status, 400);
  assert.equal((await load("envios").route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 5, price: 1 }] }))).status, 400);
  assert.equal((await load("envios", [valid], "").route.POST(req("envios", { products: [{ id: valid.id, shippingCost: 5 }] }))).status, 403);
}));
test("legacy country migration preserves the exact original tariff, price and stock", async () => {
  const legacy = { ...valid, id: "legacy-1", active: true, shippingCost: 60 };
  const { route, rows } = load("envios", [legacy]);
  assert.equal((await route.POST(req("envios", { products: [{ id: legacy.id, shippingCost: 60, shippingCountries: ["ES", "FR"] }] }))).status, 200);
  assert.deepEqual(rows, [{ ...legacy, shippingCountries: '["ES","FR"]' }]);
  assert.equal((await route.POST(req("envios", { products: [{ id: legacy.id, shippingCost: 1, shippingCountries: ["ES"] }] }))).status, 409);
  assert.equal((await route.POST(req("envios", { products: [{ id: legacy.id, shippingCost: 60, shippingCountries: ["ES"], motorPower: 1000 }] }))).status, 409);
});
