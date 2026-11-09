import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { increasePrices } from "../scripts/increase-prices-20261109.mjs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const fixture = () => createClient({url: pathToFileURL(join(mkdtempSync(join(tmpdir(), 'monkey-price-test-')), 'catalog.db')).href});

test("raises all prices once, rounds cents, backs up and preserves other fields", async () => {
  const client = fixture();
  try {
    await client.execute(`CREATE TABLE Product (id TEXT PRIMARY KEY, price REAL, compareAt REAL, active INTEGER, stock INTEGER, shippingCost REAL)`);
    await client.execute(`INSERT INTO Product VALUES ('published', 649, 845, 1, 5, 60), ('draft', 0.05, NULL, 0, 3, 5), ('soldout', 12.95, 15.99, 1, 0, 7)`);
    const before = (await client.execute("SELECT * FROM Product ORDER BY id")).rows;
    const result = await increasePrices(client);
    assert.equal(result.products, 3);
    const after = (await client.execute("SELECT * FROM Product ORDER BY id")).rows;
    assert.deepEqual(after.map(p => [p.price, p.compareAt]), [[0.06, null], [713.9, 929.5], [14.25, 17.59]]);
    for (let i = 0; i < before.length; i++) for (const key of ['id', 'active', 'stock', 'shippingCost']) assert.equal(after[i][key], before[i][key]);
    assert.deepEqual((await client.execute('SELECT * FROM _product_prices_before_20261109 ORDER BY id')).rows, before);
    assert.equal((await increasePrices(client)).status, 'already-applied');
    assert.deepEqual((await client.execute('SELECT * FROM Product ORDER BY id')).rows, after);
  } finally { client.close(); }
});

test("invalid prices roll back without modifying the catalog", async () => {
  const client = fixture();
  try {
    await client.execute('CREATE TABLE Product (id TEXT, price REAL, compareAt REAL)');
    await client.execute("INSERT INTO Product VALUES ('invalid', -1, NULL)");
    await assert.rejects(increasePrices(client), /Invalid/);
    assert.equal((await client.execute('SELECT price FROM Product')).rows[0].price, -1);
    assert.equal((await client.execute("SELECT name FROM sqlite_master WHERE name = '_product_prices_before_20261109'")).rows.length, 0);
  } finally { client.close(); }
});
