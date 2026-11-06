import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const require = createRequire(import.meta.url);
test("real SQLite preserves product photographs on failed edits and safely migrates tariffs and visibility", async () => {
  const tempRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(path.join(tempRoot, "monkey-publication-test-"));
  const url = "file:" + path.join(directory, "test.db").replaceAll("\\", "/");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const stripeBefore = [process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET];
  process.env.STRIPE_SECRET_KEY = "configured-test-key"; process.env.STRIPE_WEBHOOK_SECRET = "configured-test-signature";
  try {
    const schema = path.join(directory, "schema.prisma");
    writeFileSync(path.join(directory, "test.db"), ""); copyFileSync("prisma/schema.prisma", schema);
    execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "db", "push", "--schema", schema, "--skip-generate"], { env: { ...process.env, DATABASE_URL: url }, stdio: "pipe", timeout: 30000 });
    const data = { name: "Existing product", shortDesc: "Original summary", description: "Original description", price: 89, stock: 5, category: "vehiculos", stripeLink: "", active: true, featured: false };
    const original = await prisma.product.create({ data: { ...data, id: "legacy-1", slug: "legacy-1", sku: "OLD", shippingCost: null, images: { create: { url: "/original.jpg", alt: "Original" } } }, include: { images: true } });
    await prisma.product.create({ data: { ...data, slug: "occupied", sku: "TAKEN" } });
    const invalidations: string[] = [];
    const load = (file: string) => {
      const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
      const dependencies: Record<string, unknown> = { "next-auth": { getServerSession: async () => ({ user: { role: "ADMIN" } }) }, "@/lib/auth": { authOptions: {} }, "@/lib/prisma": { prisma }, "@/lib/catalog-cache": { revalidateCatalog: () => invalidations.push("catalog") } };
      const module = { exports: {} as any };
      new Function("require", "module", "exports", code)((name: string) => dependencies[name] ?? require(name.startsWith("@/") ? "../src/" + name.slice(2) : name), module, module.exports);
      return module.exports;
    };
    const request = (route: string, body: unknown, method = "POST") => new Request(`https://monkey.test${route}`, { method, headers: { "Content-Type": "application/json", Origin: "https://monkey.test" }, body: JSON.stringify(body) });
    const edit = load("src/app/api/productos/[id]/route.ts");
    const failed = await edit.PATCH(request("/api/productos/legacy-1", { ...data, sku: "TAKEN", images: [{ url: "/replacement.jpg" }] }, "PATCH"), { params: { id: original.id } });
    assert.equal(failed.status, 500);
    assert.equal(invalidations.length, 0);
    assert.deepEqual(await prisma.product.findUnique({ where: { id: original.id }, include: { images: true } }), original);
    const shipping = load("src/app/api/admin/productos/envios/route.ts");
    assert.equal((await shipping.POST(request("/api/admin/productos/envios", { products: [{ id: original.id, shippingCost: 0, shippingCountries: ["ES", "FR"] }] }))).status, 200);
    const migrated = await prisma.product.findUniqueOrThrow({ where: { id: original.id }, include: { images: true } });
    assert.equal(migrated.shippingCost, null); assert.equal(migrated.price, 89); assert.equal(migrated.stock, 5); assert.deepEqual(migrated.images, original.images); assert.equal(migrated.shippingCountries, '["ES","FR"]');
    const imported = await prisma.product.create({ data: { ...data, id: "imp20261106_v9", slug: "imported", price: 110, active: false, shippingCost: 5, images: { create: { url: "/imported.jpg" } } } });
    assert.equal((await shipping.POST(request("/api/admin/productos/envios", { products: [{ id: imported.id, shippingCost: 25, motorPower: 1000, shippingCountries: ["ES"] }] }))).status, 200);
    const publication = load("src/app/api/admin/productos/publicar/route.ts");
    assert.equal((await publication.POST(request("/api/admin/productos/publicar", { ids: [imported.id] }))).status, 200);
    const live = await prisma.product.findUniqueOrThrow({ where: { id: imported.id } });
    assert.equal(live.active, true); assert.equal(live.price, 110); assert.equal(live.stock, 5); assert.equal(live.shippingCost, 25); assert.equal(live.motorPower, 1000);
    assert.equal(invalidations.length, 3);
  } finally {
    for (const [key, value] of [["STRIPE_SECRET_KEY", stripeBefore[0]], ["STRIPE_WEBHOOK_SECRET", stripeBefore[1]]]) value === undefined ? delete process.env[key!] : process.env[key!] = value;
    await prisma.$disconnect();
    const resolved = realpathSync(directory);
    if (path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("monkey-publication-test-")) rmSync(resolved, { recursive: true, force: true });
  }
});
