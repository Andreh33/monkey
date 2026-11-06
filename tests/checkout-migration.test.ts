import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";

test("checkout migration preserves legacy orders and products and defaults destination to null", async () => {
  const client = createClient({ url: "file::memory:" });
  try {
    const root = path.resolve("prisma/migrations");
    const migrations = (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    for (const name of migrations.filter(name => name < "20261107000000_add_checkout_orders")) await client.executeMultiple(await readFile(path.join(root, name, "migration.sql"), "utf8"));
    await client.execute(`INSERT INTO "Product" ("id","slug","name","description","shortDesc","price","stock","category","stripeLink","updatedAt") VALUES ('legacy-product','legacy-product','Legacy','Description','Summary',199.99,7,'patinetes','https://buy.stripe.com/legacy',CURRENT_TIMESTAMP)`);
    await client.execute(`INSERT INTO "Order" ("id","email","status","total","items","stripeRef") VALUES ('legacy-order','legacy@example.test','SHIPPED',199.99,'[]','legacy-reference')`);
    await client.executeMultiple(await readFile(path.join(root, "20261107000000_add_checkout_orders/migration.sql"), "utf8"));
    const product = (await client.execute(`SELECT * FROM "Product" WHERE id='legacy-product'`)).rows[0];
    const order = (await client.execute(`SELECT * FROM "Order" WHERE id='legacy-order'`)).rows[0];
    assert.equal(product.price, 199.99); assert.equal(product.stock, 7); assert.equal(product.shippingCountries, null);
    assert.equal(order.status, "SHIPPED"); assert.equal(order.total, 199.99); assert.equal(order.stripeRef, "legacy-reference");
    assert.equal(order.totalCents, null); assert.equal(order.firstName, null); assert.equal(order.fulfillmentStatus, "UNFULFILLED");
    assert.equal((await client.execute(`SELECT count(*) AS n FROM "CheckoutEvent"`)).rows[0].n, 0);
  } finally { client.close(); }
});
