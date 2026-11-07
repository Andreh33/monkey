import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { migrateVehicleCategories } from "../scripts/migrate-vehicle-categories.mjs";

const manifest = JSON.parse(await readFile(new URL("../scripts/data/vehicle-categories-20261107.json", import.meta.url), "utf8"));

async function fixture(run) {
  // A disk database survives the separate transaction connection used by libSQL.
  const tempRoot = await realpath(tmpdir());
  const directory = await mkdtemp(path.join(tempRoot, "monkey-category-migration-test-"));
  const client = createClient({ url: "file:" + path.join(directory, "test.db").replaceAll("\\", "/") });
  try {
    const root = new URL("../prisma/migrations/", import.meta.url);
    for (const name of (await readdir(root)).filter(name => /^\d/.test(name)).sort()) {
      await client.executeMultiple(await readFile(new URL(`${name}/migration.sql`, root), "utf8"));
    }
    await client.batch([
      { sql: `INSERT INTO "Category" (id, slug, name, "order", "updatedAt") VALUES (?, ?, 'Vehículos', 6, '2026-01-01')`, args: [manifest.source.id, manifest.source.slug] },
      ...manifest.source.subcategories.map((s, index) => ({ sql: `INSERT INTO "Subcategory" (id, "categoryId", slug, name, "order", "updatedAt") VALUES (?, ?, ?, ?, ?, '2026-01-01')`, args: [s.id, manifest.source.id, s.slug, s.slug, index] })),
      ...manifest.existingTargets.flatMap(t => [
        { sql: `INSERT INTO "Category" (id, slug, name, "order", "updatedAt") VALUES (?, ?, 'Patinetes', 0, '2026-01-01')`, args: [t.categoryId, t.category] },
        { sql: `INSERT INTO "Subcategory" (id, "categoryId", slug, name, "order", "updatedAt") VALUES (?, ?, ?, 'ECOXTREM', 0, '2026-01-01')`, args: [t.subcategoryId, t.categoryId, t.subcategory] },
      ]),
      { sql: `INSERT INTO "Category" (id, slug, name, "order", "updatedAt") VALUES ('unrelated', 'recambio', 'Recambios', 6, '2026-01-01')`, args: [] },
      ...manifest.products.map((p, index) => ({
        sql: `INSERT INTO "Product" (id, slug, name, description, "shortDesc", price, "compareAt", currency, sku, stock, category, subcategory, brand, "maxSpeed", range, "motorPower", battery, weight, "maxLoad", "stripeLink", "shippingCost", "shippingCountries", "youtubeUrl", featured, active, "createdAt", "updatedAt") VALUES (?, ?, ?, 'Original description', 'Original summary', ?, ?, 'EUR', ?, ?, ?, ?, 'Original brand', 50, 90, 2000, '60V', 25.5, 100, 'https://buy.stripe.com/retained', 25, '["ES","FR"]', 'https://youtube.com/watch?v=retained', ?, ?, '2026-01-01', '2026-11-07')`,
        args: [p.id, `product-${index}`, `Original product ${index}`, 200.5 + index, 300.5 + index, `SKU-${index}`, index % 8, p.from.category, p.from.subcategory, index % 2, index % 3 === 0 ? 0 : 1],
      })),
      { sql: `INSERT INTO "Product" (id, slug, name, description, "shortDesc", price, stock, category, "stripeLink", "updatedAt") VALUES ('unrelated-product','unrelated-product','Untouched','Description','Summary',49.99,3,'recambio','','2026-11-07')`, args: [] },
      { sql: `INSERT INTO "ProductImage" (id, "productId", url, alt, "order") VALUES ('retained-image', ?, 'https://example.test/retained.jpg', 'Original image', 1)`, args: [manifest.products[0].id] },
      { sql: `INSERT INTO "Order" (id, email, status, total, items) VALUES ('retained-order','fixture@example.test','PAID',500,'[]')`, args: [] },
    ]);
    await run(client);
  } finally {
    client.close();
    const resolved = await realpath(directory);
    if (path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("monkey-category-migration-test-")) {
      try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
      catch (error) { if (error.code !== "EBUSY") throw error; }
    }
  }
}

async function snapshot(client) {
  const output = {};
  for (const table of ["Product", "Category", "Subcategory", "ProductImage", "Order"]) {
    output[table] = (await client.execute(`SELECT * FROM "${table}" ORDER BY id`)).rows.map(row => ({ ...row }));
  }
  return output;
}

test("moves all 202 reviewed products, preserves commercial data and unrelated categories, and runs once", () => fixture(async client => {
  const before = await snapshot(client);
  assert.equal(await migrateVehicleCategories(client), "applied");
  const after = await snapshot(client);
  const destinations = new Map(manifest.products.map(p => [p.id, p.to]));
  assert.deepEqual(after.Product, before.Product.map(p => ({ ...p, ...destinations.get(p.id) })));
  assert.deepEqual(after.ProductImage, before.ProductImage);
  assert.deepEqual(after.Order, before.Order);
  assert.deepEqual(after.Category.filter(c => !manifest.categories.some(newCategory => newCategory.id === c.id)), before.Category.filter(c => c.id !== manifest.source.id));
  assert.deepEqual(after.Subcategory.find(s => s.id === manifest.existingTargets[0].subcategoryId), before.Subcategory.find(s => s.id === manifest.existingTargets[0].subcategoryId));
  assert.equal(after.Category.some(c => c.slug === "vehiculos"), false);
  assert.equal(after.Subcategory.some(s => s.categoryId === manifest.source.id), false);
  const counts = Object.fromEntries((await client.execute(`SELECT category, COUNT(*) AS n FROM "Product" WHERE category != 'recambio' GROUP BY category ORDER BY category`)).rows.map(row => [row.category, row.n]));
  assert.deepEqual(counts, { buggies: 15, "coches-electricos-infantiles": 6, hoverboard: 1, minimotos: 41, "motos-matriculables": 5, patinete: 2, "pit-bikes": 78, quads: 54 });
  assert.equal((await client.execute(`SELECT p.id FROM "Product" p LEFT JOIN "Category" c ON c.slug=p.category LEFT JOIN "Subcategory" s ON s."categoryId"=c.id AND s.slug=p.subcategory WHERE c.id IS NULL OR (p.subcategory IS NOT NULL AND s.id IS NULL)`)).rows.length, 0);
  assert.equal(after.Category.length, before.Category.length + 6);
  assert.equal(await migrateVehicleCategories(client), "already-applied");
  assert.deepEqual(await snapshot(client), after);
  assert.equal((await client.execute({ sql: `SELECT COUNT(*) AS n FROM "_app_migrations" WHERE name=?`, args: [manifest.migration] })).rows[0].n, 1);
}));

test("an unreviewed hidden vehicle aborts without moving or deleting anything", () => fixture(async client => {
  await client.execute(`INSERT INTO "Product" (id, slug, name, description, "shortDesc", price, stock, category, "stripeLink", active, "updatedAt") VALUES ('unreviewed','unreviewed','Draft','Draft','Draft',99,5,'vehiculos','',0,'2026-11-07')`);
  const before = await snapshot(client);
  await assert.rejects(migrateVehicleCategories(client), /source products changed/);
  assert.deepEqual(await snapshot(client), before);
  assert.equal((await client.execute(`SELECT name FROM sqlite_master WHERE name='_app_migrations'`)).rows.length, 0);
}));

test("a changed product assignment aborts instead of overwriting a manual change", () => fixture(async client => {
  await client.execute({ sql: `UPDATE "Product" SET subcategory='manual-category' WHERE id=?`, args: [manifest.products[0].id] });
  const before = await snapshot(client);
  await assert.rejects(migrateVehicleCategories(client), /source products changed/);
  assert.deepEqual(await snapshot(client), before);
}));

test("an existing destination category causes a safe conflict", () => fixture(async client => {
  await client.execute(`INSERT INTO "Category" (id, slug, name, "updatedAt") VALUES ('manual-pit-bikes','pit-bikes','Manual category','2026-11-07')`);
  const before = await snapshot(client);
  await assert.rejects(migrateVehicleCategories(client), /destination category pit-bikes already exists/);
  assert.deepEqual(await snapshot(client), before);
}));

test("a failure after category writes rolls back parents, moved subcategories and product changes", () => fixture(async client => {
  await client.execute(`CREATE TRIGGER reject_vehicle_moves BEFORE UPDATE OF category ON "Product" WHEN NEW.category='patinete' BEGIN SELECT RAISE(ABORT, 'simulated product write failure'); END`);
  const before = await snapshot(client);
  await assert.rejects(migrateVehicleCategories(client), /simulated product write failure/);
  assert.deepEqual(await snapshot(client), before);
  assert.equal((await client.execute(`SELECT name FROM sqlite_master WHERE name='_app_migrations'`)).rows.length, 0);
}));
