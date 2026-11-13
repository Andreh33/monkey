import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';

const { ids } = JSON.parse(readFileSync('scripts/data/bicycle-subcategory-20261113.json', 'utf8'));
async function database() {
  const client = createClient({ url: pathToFileURL(path.join(mkdtempSync(path.join(tmpdir(), 'bike-subcategory-')), 'test.db')).href });
  for (const folder of readdirSync('prisma/migrations').sort()) {
    const file = `prisma/migrations/${folder}/migration.sql`;
    if (existsSync(file)) await client.executeMultiple(readFileSync(file, 'utf8'));
  }
  await client.executeMultiple(`INSERT INTO Category(id,slug,name,updatedAt) VALUES('bike','bicicleta','Bicicletas',CURRENT_TIMESTAMP),('parts','recambio','Recambios',CURRENT_TIMESTAMP);
    INSERT INTO Subcategory(id,categoryId,slug,name,updatedAt) VALUES('old','bike','bicicletas-electricas','Bicicletas eléctricas',CURRENT_TIMESTAMP),('keep','parts','bicicletas-electricas','Recambios bicicleta',CURRENT_TIMESTAMP);`);
  for (const [id,cat,sub] of [...ids.map(id => [id,'bicicleta','bicicletas-electricas']), ['manual','bicicleta',null], ['apollo','bicicleta',null], ['part','recambio','bicicletas-electricas']]) {
    await client.execute({sql:'INSERT INTO Product(id,slug,name,description,shortDesc,price,stock,category,subcategory,stripeLink,updatedAt) VALUES(?,?,?,\'Description\',\'Summary\',456.78,5,?,?,\'\',CURRENT_TIMESTAMP)', args:[id,id,id,cat,sub]});
  }
  return client;
}
test('flattening removes only the redundant bicycle filter and preserves all products and commercial data', async () => {
  const { flattenBicycleSubcategory } = await import('../scripts/flatten-bicycle-subcategory-20261113.mjs');
  const client = await database();
  try {
    const before = (await client.execute('SELECT * FROM Product ORDER BY id')).rows;
    assert.deepEqual(await flattenBicycleSubcategory(client), {status:'applied', moved:29});
    for (const old of before) {
      const now = (await client.execute({sql:'SELECT * FROM Product WHERE id=?',args:[old.id]})).rows[0];
      assert.deepEqual(now, {...old, subcategory: ids.includes(old.id) ? null : old.subcategory});
    }
    assert.deepEqual((await client.execute('SELECT id FROM Subcategory ORDER BY id')).rows,[{id:'keep'}]);
    assert.equal((await client.execute('SELECT COUNT(*) n FROM _bicycle_subcategory_products_before_20261113')).rows[0].n,29);
    assert.equal((await flattenBicycleSubcategory(client)).status,'already-applied');
  } finally {client.close();}
});
test('changed assignments stop migration without partial updates', async () => {
  const { flattenBicycleSubcategory } = await import('../scripts/flatten-bicycle-subcategory-20261113.mjs');
  const client = await database();
  try {
    await client.execute({sql:'UPDATE Product SET subcategory=NULL WHERE id=?',args:[ids[0]]});
    const before = (await client.execute('SELECT * FROM Product ORDER BY id')).rows;
    await assert.rejects(flattenBicycleSubcategory(client), /assignments changed/);
    assert.deepEqual((await client.execute('SELECT * FROM Product ORDER BY id')).rows,before);
    assert.equal((await client.execute('SELECT COUNT(*) n FROM Subcategory')).rows[0].n,2);
  } finally {client.close();}
});
