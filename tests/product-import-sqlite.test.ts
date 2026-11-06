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

test("real SQLite import preserves live products, skips retries and rolls back a failed batch", async () => {
  const tempRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(path.join(tempRoot, "monkey-import-test-"));
  const url = "file:" + path.join(directory, "test.db").replaceAll("\\", "/");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const schema = path.join(directory, "schema.prisma");
    writeFileSync(path.join(directory, "test.db"), "");
    copyFileSync("prisma/schema.prisma", schema);
    execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "db", "push", "--schema", schema, "--skip-generate"], {
      env: { ...process.env, DATABASE_URL: url }, stdio: "pipe", timeout: 30000,
    });
    const baseline = await prisma.product.create({ data: {
      id: "live-original", slug: "live-original", sku: "LIVE-1", name: "Existing live product", shortDesc: "Original summary", description: "Original description",
      price: 89, stock: 5, category: "vehiculos", stripeLink: "https://buy.stripe.com/test_original", active: true,
      images: { create: { url: "/imagenes/original.webp", alt: "Original image", order: 0 } },
    }, include: { images: true } });
    await prisma.category.create({ data: { slug: "vehiculos", name: "Nombre existente" } });
    const code = ts.transpileModule(readFileSync("src/app/api/admin/productos/importar/route.ts", "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const dependencies: Record<string, unknown> = {
      "next-auth": { getServerSession: async () => ({ user: { role: "ADMIN" } }) },
      "@/lib/auth": { authOptions: {} }, "@/lib/prisma": { prisma },
    };
    const module = { exports: {} as any };
    new Function("require", "module", "exports", code)((name: string) => dependencies[name] ?? require(name.startsWith("@/") ? "../src/" + name.slice(2) : name), module, module.exports);
    const sample = {
      id: "imp20261106_v123", sku: "MM-123", name: "Miniquad rojo", shortDesc: "Miniquad eléctrico rojo.",
      description: "Miniquad eléctrico rojo con motor de 800 W y batería de 36 V.", price: 110, sourcePriceCents: 10000,
      category: "vehiculos", categoryName: "Vehículos", subcategory: "mini-quads-electricos", subcategoryName: "Mini quads eléctricos",
      images: [{ url: "/imagenes/import.webp", alt: "Miniquad rojo" }],
    };
    const post = (products: unknown[]) => module.exports.POST(new Request("https://example.test/api/admin/productos/importar", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.test" }, body: JSON.stringify({ products }),
    }));
    assert.equal((await post([sample])).status, 200);
    const imported = await prisma.product.findUniqueOrThrow({ where: { id: sample.id }, include: { images: true } });
    assert.equal(imported.active, false); assert.equal(imported.price, 110); assert.equal(imported.stripeLink, "");
    assert.equal(imported.stock, 5); assert.equal(imported.images.length, 1);
    assert.equal((await prisma.category.findUniqueOrThrow({ where: { slug: "vehiculos" } })).name, "Nombre existente");
    assert.equal(await prisma.subcategory.count(), 1);
    const repeated = await (await post([sample])).json();
    assert.equal(repeated.inserted, 0); assert.equal(repeated.skipped, 1);
    assert.equal(await prisma.product.count(), 2);
    assert.deepEqual(await prisma.product.findUnique({ where: { id: baseline.id }, include: { images: true } }), baseline);

    // A real unique constraint failure on the second insert must roll back the first.
    await prisma.product.create({ data: { name: "Protected collision", slug: "miniquad-rojo-imp20261106_v457", shortDesc: "Original", description: "Original", price: 5, stock: 1, category: "vehiculos", stripeLink: "https://buy.stripe.com/test", active: true } });
    const failed = await post([
      { ...sample, id: "imp20261106_v456", sku: "MM-456", category: "new-category", categoryName: "Nueva categoría" },
      { ...sample, id: "imp20261106_v457", sku: "MM-457" },
    ]);
    assert.equal(failed.status, 500);
    assert.equal(await prisma.product.findUnique({ where: { id: "imp20261106_v456" } }), null);
    assert.equal(await prisma.category.findUnique({ where: { slug: "new-category" } }), null);
    assert.deepEqual(await prisma.product.findUnique({ where: { id: baseline.id }, include: { images: true } }), baseline);
  } finally {
    await prisma.$disconnect();
    const resolved = realpathSync(directory);
    if (path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("monkey-import-test-")) rmSync(resolved, { recursive: true, force: true });
  }
});
