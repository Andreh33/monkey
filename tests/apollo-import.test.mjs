import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';
import { importApolloCatalog, validateApolloManifest } from '../scripts/import-apollo-20261113.mjs';

const product = n => ({
  id: `imp20261113_ap${n}_v0`, sku: `MA-${n}-0`, slug: `apollo-test-${n}`,
  name: `Recambio de prueba ${n}`, shortDesc: 'Recambio de prueba',
  description: 'Pieza de recambio con medidas verificadas para esta prueba.',
  price: 14.82, currency: 'EUR', stock: 5, active: true, featured: false,
  category: 'recambio', categoryName: 'Recambios', subcategory: 'frenos', subcategoryName: 'Frenos',
  shippingCost: 5, shippingCountries: '["ES","FR","IT","PT"]', stripeLink: '',
  source: { productId: n, variantId: 0, priceCents: 1235, quantity: 1, availableForOrder: true },
  images: [{ url: 'https://19e3cavvu8vlpeyt.public.blob.vercel-storage.com/products/import-apollo-20261113/test.jpg', alt: 'Pieza' }],
});
async function database() {
  const client = createClient({ url: pathToFileURL(path.join(mkdtempSync(path.join(tmpdir(), 'apollo-import-')), 'test.db')).href });
  for (const name of readdirSync('prisma/migrations').sort()) {
    const file = `prisma/migrations/${name}/migration.sql`;
    if (existsSync(file)) await client.executeMultiple(readFileSync(file, 'utf8'));
  }
  return client;
}

test('import preserves existing commercial data and orders, skips duplicates, and runs once', async () => {
  const client = await database();
  try {
    await client.execute(`INSERT INTO Product(id,slug,name,description,shortDesc,price,stock,category,stripeLink,sku,updatedAt) VALUES('old','old','Recambio de prueba 1','Old description','Old summary',99,2,'recambio','old-link','old-sku',CURRENT_TIMESTAMP)`);
    await client.execute(`INSERT INTO "Order"(id,email,status,total,items) VALUES('paid','local@example.test','PAID',99,'[]')`);
    const old = (await client.execute('SELECT * FROM Product WHERE id=\'old\'')).rows;
    const orders = (await client.execute('SELECT * FROM "Order"')).rows;
    const manifest = { version: 1, products: [product(1), product(2), product(3)] };
    assert.deepEqual(await importApolloCatalog(client, manifest), { status: 'applied', inserted: 2, skipped: 1 });
    // A later stock or admin price change must survive another deployment.
    await client.execute(`UPDATE Product SET stock=4, price=21 WHERE id='imp20261113_ap2_v0'`);
    assert.equal((await importApolloCatalog(client, manifest)).status, 'already-applied');
    assert.deepEqual((await client.execute('SELECT * FROM Product WHERE id=\'old\'')).rows, old);
    assert.deepEqual((await client.execute('SELECT * FROM "Order"')).rows, orders);
    assert.deepEqual((await client.execute(`SELECT stock,price FROM Product WHERE id='imp20261113_ap2_v0'`)).rows, [{ stock: 4, price: 21 }]);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM ProductImage')).rows[0].n, 2);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM Subcategory')).rows[0].n, 1);
    await assert.rejects(importApolloCatalog(client, { version: 1, products: [product(4)] }), /different manifest/);
  } finally { client.close(); }
});

test('failed chunk rolls back and retry resumes without resetting previously imported stock', async () => {
  const client = await database();
  try {
    const manifest = { version: 1, products: [product(10), product(11), product(12), product(13)] };
    await client.execute(`CREATE TRIGGER fail_image BEFORE INSERT ON ProductImage WHEN NEW.productId='imp20261113_ap13_v0' BEGIN SELECT RAISE(ABORT,'simulated image failure'); END`);
    await assert.rejects(importApolloCatalog(client, manifest, { batchSize: 2 }), /simulated image failure/);
    assert.deepEqual((await client.execute('SELECT id FROM Product ORDER BY id')).rows.map(r => r.id), ['imp20261113_ap10_v0', 'imp20261113_ap11_v0']);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM _app_migrations')).rows[0].n, 0);
    await client.execute(`UPDATE Product SET stock=3 WHERE id='imp20261113_ap10_v0'`);
    await client.execute('DROP TRIGGER fail_image');
    assert.deepEqual(await importApolloCatalog(client, manifest, { batchSize: 2 }), { status: 'applied', inserted: 2, skipped: 2 });
    assert.equal((await client.execute(`SELECT stock FROM Product WHERE id='imp20261113_ap10_v0'`)).rows[0].stock, 3);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM ProductImage')).rows[0].n, 4);
  } finally { client.close(); }
});

test('unsafe source stock, wrong markup, external images and duplicate variants fail before writes', async () => {
  const client = await database();
  try {
    for (const change of [p => p.source.quantity = 0, p => p.source.availableForOrder = false, p => p.price = 12.35, p => p.images[0].url = 'https://example.com/image.jpg']) {
      const invalid = product(21); change(invalid);
      await assert.rejects(importApolloCatalog(client, { version: 1, products: [product(20), invalid] }));
    }
    assert.throws(() => validateApolloManifest({ version: 1, products: [product(20), product(20)] }), /duplicate/);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM Product')).rows[0].n, 0);
  } finally { client.close(); }
});

test('reviewed production manifest imports fully with prices, images and categories intact', async () => {
  const manifest = JSON.parse(readFileSync('scripts/data/apollo-catalog-20261113.json', 'utf8'));
  const client = await database();
  try {
    const result = await importApolloCatalog(client, manifest);
    assert.equal(result.inserted, manifest.products.length);
    assert.equal(result.skipped, 0);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM ProductImage')).rows[0].n, manifest.products.reduce((sum, p) => sum + p.images.length, 0));
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM Product WHERE stock <> 5 OR active <> 1 OR shippingCost < 5')).rows[0].n, 0);
    const prices = new Map((await client.execute('SELECT id,price FROM Product')).rows.map(p => [p.id, p.price]));
    for (const p of manifest.products) assert.equal(prices.get(p.id), p.price);
    assert.equal((await client.execute('PRAGMA foreign_key_check')).rows.length, 0);
  } finally { client.close(); }
});
