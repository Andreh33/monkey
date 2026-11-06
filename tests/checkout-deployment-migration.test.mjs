import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { migrateCheckout } from "../scripts/migrate-checkout.mjs";

async function fixture(run) {
  const tempRoot = await realpath(tmpdir());
  const directory = await mkdtemp(path.join(tempRoot, "monkey-migration-test-"));
  const client = createClient({ url: "file:" + path.join(directory, "test.db").replaceAll("\\", "/") });
  try { await run(client); }
  finally {
    client.close();
    const resolved = await realpath(directory);
    if (path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("monkey-migration-test-")) {
      try { await rm(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
      catch (error) { if (error.code !== "EBUSY") throw error; } // libSQL on Windows may retain a file handle until process exit.
    }
  }
}

test("deployment migration upgrades an untracked legacy database exactly once", () => fixture(async client => {
    const root = path.resolve("prisma/migrations");
    for (const name of (await readdir(root)).filter(name => name < "20261107000000" && /^\d/.test(name)).sort()) {
      await client.executeMultiple(await readFile(path.join(root, name, "migration.sql"), "utf8"));
    }
    assert.equal(await migrateCheckout(client), "applied");
    assert.equal(await migrateCheckout(client), "already-applied");
    assert.equal((await client.execute(`SELECT count(*) AS n FROM "_app_migrations"`)).rows[0].n, 1);
    assert.ok((await client.execute(`PRAGMA table_info("Order")`)).rows.some(row => row.name === "stripeSessionId"));
}));

test("failed deployment migration rolls back every schema change", () => fixture(async client => {
    // Product alteration would succeed; malformed legacy Order fails later.
    await client.executeMultiple(`CREATE TABLE "Product" (id TEXT PRIMARY KEY); CREATE TABLE "Order" (id TEXT PRIMARY KEY, firstName TEXT);`);
    await assert.rejects(migrateCheckout(client));
    assert.equal((await client.execute(`PRAGMA table_info("Product")`)).rows.some(row => row.name === "shippingCountries"), false);
    assert.equal((await client.execute(`SELECT name FROM sqlite_master WHERE name='_app_migrations'`)).rows.length, 0);
}));
