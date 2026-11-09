import { createClient } from "@libsql/client";
import { fileURLToPath } from "node:url";
import path from "node:path";

const migration = "20261109_all_product_prices_plus_10_percent";
const backup = "_product_prices_before_20261109";
const increased = value => value === null ? null : Math.round(Math.round(value * 100) * 110 / 100) / 100;

// One authorized price change. The marker prevents increases on subsequent builds.
export async function increasePrices(client) {
  const tx = await client.transaction("write");
  try {
    await tx.execute(`CREATE TABLE IF NOT EXISTS "_app_migrations" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    const applied = await tx.execute({sql: `SELECT name FROM "_app_migrations" WHERE name = ?`, args: [migration]});
    if (applied.rows.length) {
      await tx.commit();
      return {status: "already-applied"};
    }
    const before = (await tx.execute(`SELECT * FROM "Product" ORDER BY id`)).rows;
    if (!before.length || before.some(p => !Number.isFinite(p.price) || p.price < 0 || (p.compareAt !== null && (!Number.isFinite(p.compareAt) || p.compareAt < 0)))) throw new Error("Invalid or empty catalog; no price changes applied.");
    // Complete product snapshot, committed atomically with the price adjustment.
    await tx.execute(`CREATE TABLE "${backup}" AS SELECT * FROM "Product"`);
    const changed = await tx.execute(`UPDATE "Product" SET price = ROUND(ROUND(price * 100) * 110 / 100.0) / 100.0, "compareAt" = CASE WHEN "compareAt" IS NULL THEN NULL ELSE ROUND(ROUND("compareAt" * 100) * 110 / 100.0) / 100.0 END`);
    const after = (await tx.execute(`SELECT * FROM "Product" ORDER BY id`)).rows;
    if (changed.rowsAffected !== before.length || after.length !== before.length) throw new Error("Unexpected product count.");
    for (let i = 0; i < before.length; i++) {
      for (const key of Object.keys(before[i])) {
        const expected = key === "price" || key === "compareAt" ? increased(before[i][key]) : before[i][key];
        if (after[i][key] !== expected) throw new Error(`Verification failed for product ${before[i].id}, field ${key}.`);
      }
    }
    await tx.execute({sql: `INSERT INTO "_app_migrations" (name) VALUES (?)`, args: [migration]});
    await tx.commit();
    return {status: "applied", products: before.length, active: before.filter(p => p.active === 1).length, backup};
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  } finally { tx.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) {
    console.log("[increase-prices-20261109] No Turso configured; skipped.");
  } else {
    const client = createClient({url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN});
    try { console.log("[increase-prices-20261109]", JSON.stringify(await increasePrices(client))); }
    catch (error) { console.error("[increase-prices-20261109]", error.message); process.exitCode = 1; }
    finally { client.close(); }
  }
}
