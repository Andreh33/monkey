import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';
import { importApolloCatalog, validateApolloManifest } from '../scripts/import-apollo-20261113.mjs';
import { migrateDriftCategory } from '../scripts/import-bicycles-and-drift-20261113.mjs';

const bicycles = JSON.parse(readFileSync('scripts/data/apollo-bicycles-20261113.json', 'utf8'));
const drift = JSON.parse(readFileSync('scripts/data/drift-category-20261113.json', 'utf8'));
async function database() {
  const client = createClient({ url: pathToFileURL(path.join(mkdtempSync(path.join(tmpdir(), 'bikes-drift-')), 'test.db')).href });
  for (const folder of readdirSync('prisma/migrations').sort()) {
    const file = `prisma/migrations/${folder}/migration.sql`;
    if (existsSync(file)) await client.executeMultiple(readFileSync(file, 'utf8'));
  }
  for (const p of [...drift.products, { id: 'mobility', name: 'Triciclo de movilidad reducida', category: 'movilidad-reducida', subcategory: null }, { id: 'spare', name: 'Rueda drift', category: 'recambio', subcategory: 'llantas-y-ruedas' }]) {
    await client.execute({ sql: 'INSERT INTO Product(id,slug,name,description,shortDesc,price,stock,category,subcategory,stripeLink,shippingCost,updatedAt) VALUES(?,?,?,?,?,123.45,3,?,?,?,15,CURRENT_TIMESTAMP)', args: [p.id,p.id,p.name,'Existing description','Existing summary',p.category,p.subcategory,''] });
  }
  return client;
}

test('authorized bicycle follow-up accepts unavailable source stock only for bicycles and preserves later edits', async () => {
  assert.throws(() => validateApolloManifest(bicycles), /source must have stock/);
  const wrongCategory = structuredClone(bicycles);
  wrongCategory.products[0].category = 'recambio';
  assert.throws(() => validateApolloManifest(wrongCategory, { bicycleStockOverride: true }), /limited to bicycles/);
  const client = await database();
  try {
    const before = (await client.execute('SELECT * FROM Product ORDER BY id')).rows;
    assert.deepEqual(await importApolloCatalog(client, bicycles, { bicycleStockOverride: true }), { status: 'applied', inserted: 24, skipped: 0 });
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM Product WHERE category=\'bicicleta\' AND id LIKE \'imp20261113_ap%\' AND stock=5 AND active=1')).rows[0].n, 24);
    for (const old of before) assert.deepEqual((await client.execute({ sql: 'SELECT * FROM Product WHERE id=?', args: [old.id] })).rows[0], old);
    await client.execute({ sql: 'UPDATE Product SET stock=4,price=999 WHERE id=?', args: [bicycles.products[0].id] });
    assert.equal((await importApolloCatalog(client, bicycles, { bicycleStockOverride: true })).status, 'already-applied');
    assert.deepEqual((await client.execute({ sql: 'SELECT stock,price FROM Product WHERE id=?', args: [bicycles.products[0].id] })).rows[0], { stock: 4, price: 999 });
    const specialBicycle = JSON.parse(readFileSync('scripts/data/apollo-special-bicycle-20261113.json', 'utf8'));
    assert.deepEqual(await importApolloCatalog(client, specialBicycle, { bicycleStockOverride: true, bicycleImportGroup: 'specialbicycle' }), { status: 'applied', inserted: 1, skipped: 0 });
    assert.equal((await importApolloCatalog(client, bicycles, { bicycleStockOverride: true })).status, 'already-applied');
    assert.equal((await importApolloCatalog(client, specialBicycle, { bicycleStockOverride: true, bicycleImportGroup: 'specialbicycle' })).status, 'already-applied');
    assert.deepEqual((await client.execute({ sql: 'SELECT stock,price FROM Product WHERE id=?', args: [specialBicycle.products[0].id] })).rows[0], { stock: 5, price: 742.81 });
    const includingExisting = JSON.parse(readFileSync('scripts/data/apollo-bicycles-including-existing-20261113.json', 'utf8'));
    await client.execute({ sql: 'INSERT INTO Product(id,slug,name,description,shortDesc,price,stock,category,stripeLink,updatedAt) VALUES(?,?,?,\'Original\',\'Original\',555,2,\'bicicleta\',\'\',CURRENT_TIMESTAMP)', args: ['original-bicycle','original-bicycle',includingExisting.products[0].name] });
    const options = { bicycleStockOverride: true, bicycleImportGroup: 'allbicycles', allowExistingBicycleNames: true };
    assert.deepEqual(await importApolloCatalog(client, includingExisting, options), { status: 'applied', inserted: 14, skipped: 0 });
    assert.equal((await importApolloCatalog(client, includingExisting, options)).status, 'already-applied');
    assert.equal((await importApolloCatalog(client, bicycles, { bicycleStockOverride: true })).status, 'already-applied');
    assert.deepEqual((await client.execute('SELECT price,stock FROM Product WHERE id=\'original-bicycle\'')).rows[0], { price: 555, stock: 2 });
  } finally { client.close(); }
});

test('drift migration moves only reviewed complete vehicles, keeps commercial data, and is idempotent', async () => {
  const client = await database();
  try {
    const before = (await client.execute('SELECT * FROM Product ORDER BY id')).rows;
    assert.deepEqual(await migrateDriftCategory(client), { status: 'applied', moved: 10 });
    assert.equal((await migrateDriftCategory(client)).status, 'already-applied');
    const moved = new Set(drift.products.map(p => p.id));
    for (const old of before) {
      const now = (await client.execute({ sql: 'SELECT * FROM Product WHERE id=?', args: [old.id] })).rows[0];
      for (const key of Object.keys(old).filter(k => !['category','subcategory','updatedAt'].includes(k))) assert.deepEqual(now[key], old[key]);
      assert.equal(now.category, moved.has(old.id) ? 'drift' : old.category);
      assert.equal(now.subcategory, moved.has(old.id) ? null : old.subcategory);
    }
    assert.equal((await client.execute('SELECT name FROM Category WHERE slug=\'drift\'')).rows[0].name, 'Drift');
  } finally { client.close(); }
});

test('drift migration rejects changed assignments without partial category changes', async () => {
  const client = await database();
  try {
    await client.execute({ sql: 'UPDATE Product SET category=\'edited\' WHERE id=?', args: [drift.products[0].id] });
    const before = (await client.execute('SELECT * FROM Product ORDER BY id')).rows;
    await assert.rejects(migrateDriftCategory(client), /assignments changed/);
    assert.deepEqual((await client.execute('SELECT * FROM Product ORDER BY id')).rows, before);
    assert.equal((await client.execute('SELECT COUNT(*) AS n FROM Category WHERE slug=\'drift\'')).rows[0].n, 0);
  } finally { client.close(); }
});
