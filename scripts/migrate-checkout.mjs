import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@libsql/client";

const migrationName = "20261107000000_add_checkout_orders";

// This deployment upgrades an existing shop. Older migrations are deliberately
// left alone: some production installations applied them before migration tracking.
export async function migrateCheckout(client) {
  const sql = await readFile(new URL(`../prisma/migrations/${migrationName}/migration.sql`, import.meta.url), "utf8");
  const tx = await client.transaction("write");
  try {
    await tx.execute(`CREATE TABLE IF NOT EXISTS "_app_migrations" ("name" TEXT PRIMARY KEY, "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    const applied = await tx.execute({ sql: `SELECT name FROM "_app_migrations" WHERE name = ?`, args: [migrationName] });
    if (applied.rows.length) {
      await tx.commit();
      return "already-applied";
    }
    const tables = await tx.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('Product','Order')`);
    if (tables.rows.length !== 2) throw new Error("Checkout migration requires the existing shop schema.");
    await tx.executeMultiple(sql);
    await tx.execute({ sql: `INSERT INTO "_app_migrations" ("name") VALUES (?)`, args: [migrationName] });
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
    console.log("[migrate-checkout] No Turso database configured; local schema is managed separately.");
  } else {
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try {
      console.log(`[migrate-checkout] ${await migrateCheckout(client)}`);
    } catch (error) {
      console.error("[migrate-checkout] Failed; checkout deployment stopped.", error);
      process.exitCode = 1;
    } finally {
      client.close();
    }
  }
}
