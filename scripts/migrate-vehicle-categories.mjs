import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@libsql/client";

const manifest = JSON.parse(await readFile(new URL("./data/vehicle-categories-20261107.json", import.meta.url), "utf8"));

function ensure(condition, message) {
  if (!condition) throw new Error(`Vehicle category migration: ${message}`);
}

function validateManifest() {
  ensure(manifest.products.length === 202, "expected the 202 reviewed products.");
  ensure(new Set(manifest.products.map(p => p.id)).size === 202, "duplicate product IDs.");
  const targets = new Set(manifest.existingTargets.map(t => `${t.category}\0${t.subcategory}`));
  for (const category of manifest.categories) {
    targets.add(`${category.slug}\0`);
    for (const sub of category.subcategories) targets.add(`${category.slug}\0${sub.slug}`);
  }
  for (const product of manifest.products) {
    ensure(product.from.category === manifest.source.slug, "unexpected source category.");
    ensure(manifest.source.subcategories.some(s => s.slug === product.from.subcategory), "unknown source subcategory.");
    ensure(targets.has(`${product.to.category}\0${product.to.subcategory ?? ""}`), "unknown destination.");
  }
}

// This is a reviewed, one-time data migration, not a rule for future products.
// Refuse a changed source catalog rather than guessing where extra products belong.
export async function migrateVehicleCategories(client) {
  validateManifest();
  const tx = await client.transaction("write");
  try {
    await tx.execute(`CREATE TABLE IF NOT EXISTS "_app_migrations" ("name" TEXT PRIMARY KEY, "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    const applied = await tx.execute({ sql: `SELECT name FROM "_app_migrations" WHERE name = ?`, args: [manifest.migration] });
    if (applied.rows.length) {
      await tx.commit();
      return "already-applied";
    }

    const source = await tx.execute({ sql: `SELECT id FROM "Category" WHERE slug = ?`, args: [manifest.source.slug] });
    ensure(source.rows.length === 1 && source.rows[0].id === manifest.source.id, "source category changed or missing.");
    const sourceSubs = await tx.execute({ sql: `SELECT id, slug FROM "Subcategory" WHERE "categoryId" = ?`, args: [manifest.source.id] });
    ensure(sourceSubs.rows.length === manifest.source.subcategories.length && sourceSubs.rows.every(row => manifest.source.subcategories.some(s => s.id === row.id && s.slug === row.slug)), "source subcategories changed.");
    // Includes unpublished products: never delete a category with overlooked drafts.
    const sourceProducts = await tx.execute({ sql: `SELECT id, category, subcategory FROM "Product" WHERE category = ?`, args: [manifest.source.slug] });
    const expectedProducts = new Map(manifest.products.map(p => [p.id, p]));
    ensure(sourceProducts.rows.length === expectedProducts.size && sourceProducts.rows.every(row => {
      const product = expectedProducts.get(row.id);
      return product && row.category === product.from.category && row.subcategory === product.from.subcategory;
    }), "source products changed, are missing, or include unreviewed products.");

    for (const target of manifest.existingTargets) {
      const found = await tx.execute({ sql: `SELECT c.id AS categoryId, s.id AS subcategoryId FROM "Category" c JOIN "Subcategory" s ON s."categoryId" = c.id WHERE c.slug = ? AND s.slug = ?`, args: [target.category, target.subcategory] });
      ensure(found.rows.length === 1 && found.rows[0].categoryId === target.categoryId && found.rows[0].subcategoryId === target.subcategoryId, "existing target changed or missing.");
    }
    const placeholders = manifest.categories.map(() => "?").join(",");
    const conflicts = await tx.execute({
      sql: `SELECT id, slug FROM "Category" WHERE slug IN (${placeholders}) OR id IN (${placeholders})`,
      args: [...manifest.categories.map(c => c.slug), ...manifest.categories.map(c => c.id)],
    });
    ensure(conflicts.rows.length === 0, `destination category ${conflicts.rows[0]?.slug} already exists.`);

    const categoryWrites = manifest.categories.flatMap(category => [
      { sql: `INSERT INTO "Category" (id, slug, name, "order", "updatedAt") VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`, args: [category.id, category.slug, category.name, category.order] },
      ...category.subcategories.map(sub => sub.moveExisting
        ? { sql: `UPDATE "Subcategory" SET "categoryId" = ?, name = ?, "order" = ? WHERE id = ? AND "categoryId" = ? AND slug = ?`, args: [category.id, sub.name, sub.order, sub.id, manifest.source.id, sub.slug] }
        : { sql: `INSERT INTO "Subcategory" (id, "categoryId", slug, name, "order", "updatedAt") VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, args: [sub.id, category.id, sub.slug, sub.name, sub.order] }),
    ]);
    for (const result of await tx.batch(categoryWrites)) ensure(result.rowsAffected === 1, "category or subcategory write did not affect exactly one row.");

    const productWrites = manifest.products.map(product => ({
      sql: `UPDATE "Product" SET category = ?, subcategory = ? WHERE id = ? AND category = ? AND subcategory IS ?`,
      args: [product.to.category, product.to.subcategory, product.id, product.from.category, product.from.subcategory],
    }));
    // Keep all commercial, image, text and timestamp fields exactly as they were.
    for (const result of await tx.batch(productWrites)) ensure(result.rowsAffected === 1, "product move did not affect exactly one row.");
    const moved = await tx.execute({ sql: `SELECT p.id, p.category, p.subcategory, c.id AS categoryId, s.id AS subcategoryId FROM "Product" p LEFT JOIN "Category" c ON c.slug = p.category LEFT JOIN "Subcategory" s ON s."categoryId" = c.id AND s.slug = p.subcategory WHERE p.id IN (${manifest.products.map(() => "?").join(",")})`, args: manifest.products.map(p => p.id) });
    ensure(moved.rows.length === 202 && moved.rows.every(row => {
      const target = expectedProducts.get(row.id)?.to;
      return target && target.category === row.category && target.subcategory === row.subcategory && row.categoryId && (row.subcategory === null || row.subcategoryId);
    }), "destination validation failed.");
    const remaining = await tx.execute({ sql: `SELECT id FROM "Product" WHERE category = ? LIMIT 1`, args: [manifest.source.slug] });
    ensure(remaining.rows.length === 0, "source category still contains products.");
    // Explicit child deletion also works with foreign-key enforcement disabled.
    await tx.execute({ sql: `DELETE FROM "Subcategory" WHERE "categoryId" = ?`, args: [manifest.source.id] });
    const removed = await tx.execute({ sql: `DELETE FROM "Category" WHERE id = ? AND slug = ?`, args: [manifest.source.id, manifest.source.slug] });
    ensure(removed.rowsAffected === 1, "source category was not removed.");
    await tx.execute({ sql: `INSERT INTO "_app_migrations" (name) VALUES (?)`, args: [manifest.migration] });
    await tx.commit();
    return "applied";
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) {
    console.log("[migrate-vehicle-categories] No Turso database configured; local catalog is managed separately.");
  } else {
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try {
      console.log(`[migrate-vehicle-categories] ${await migrateVehicleCategories(client)}`);
    } catch (error) {
      console.error("[migrate-vehicle-categories] Failed; deployment stopped.", error);
      process.exitCode = 1;
    } finally {
      client.close();
    }
  }
}
