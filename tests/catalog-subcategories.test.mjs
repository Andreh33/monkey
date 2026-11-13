import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';
import { completeCatalogSubcategories } from '../scripts/complete-catalog-subcategories-20261113.mjs';

const manifest=JSON.parse(readFileSync('scripts/data/catalog-subcategories-20261113.json','utf8'));
async function database() {
  const client=createClient({url:pathToFileURL(path.join(mkdtempSync(path.join(tmpdir(),'catalog-subcategories-')),'test.db')).href});
  for (const folder of readdirSync('prisma/migrations').sort()) {
    const file=`prisma/migrations/${folder}/migration.sql`;
    if(existsSync(file)) await client.executeMultiple(readFileSync(file,'utf8'));
  }
  for (const p of manifest.products) {
    await client.execute({sql:'INSERT OR IGNORE INTO Category(id,slug,name,updatedAt) VALUES(?,?,?,CURRENT_TIMESTAMP)',args:[p.targetCategory,p.targetCategory,p.targetCategory]});
    await client.execute({sql:'INSERT OR IGNORE INTO Subcategory(id,categoryId,slug,name,updatedAt) VALUES(?,?,?,?,CURRENT_TIMESTAMP)',args:[p.targetSubcategory,p.targetCategory,p.targetSubcategory,p.targetSubcategory]});
  }
  for (const p of [...manifest.products,{id:'unrelated',name:'Keep',category:'bicicleta',subcategory:null}]) {
    await client.execute({sql:'INSERT INTO Product(id,slug,name,description,shortDesc,price,stock,category,subcategory,stripeLink,updatedAt) VALUES(?,?,?,\'Description\',\'Summary\',123.45,5,?,?,\'\',CURRENT_TIMESTAMP)',args:[p.id,p.id,p.name,p.category,p.subcategory]});
  }
  return client;
}
test('all reviewed products join their proper filters without changing commercial data, timestamps or unrelated products',async()=>{
  const client=await database();
  try {
    const before=(await client.execute('SELECT * FROM Product ORDER BY id')).rows;
    assert.deepEqual(await completeCatalogSubcategories(client),{status:'applied',updated:211});
    for (const old of before) {
      const p=manifest.products.find(p=>p.id===old.id);
      const expected=p?{...old,category:p.targetCategory,subcategory:p.targetSubcategory}:old;
      assert.deepEqual((await client.execute({sql:'SELECT * FROM Product WHERE id=?',args:[old.id]})).rows[0],expected);
    }
    assert.equal((await client.execute('SELECT COUNT(*) n FROM _catalog_subcategories_before_20261113')).rows[0].n,211);
    await client.execute({sql:'UPDATE Product SET stock=3,price=99 WHERE id=?',args:[manifest.products[0].id]});
    assert.equal((await completeCatalogSubcategories(client)).status,'already-applied');
    assert.deepEqual((await client.execute({sql:'SELECT price,stock FROM Product WHERE id=?',args:[manifest.products[0].id]})).rows[0],{price:99,stock:3});
  } finally {client.close();}
});
test('changed source assignments or missing target subcategories abort atomically',async()=>{
  for(const scenario of ['source','target']) {
    const client=await database();
    try {
      if(scenario==='source') await client.execute({sql:"UPDATE Product SET subcategory='manual-edit' WHERE id=?",args:[manifest.products.at(-1).id]});
      else await client.execute({sql:'DELETE FROM Subcategory WHERE slug=?',args:[manifest.products.at(-1).targetSubcategory]});
      const before=(await client.execute('SELECT * FROM Product ORDER BY id')).rows;
      await assert.rejects(completeCatalogSubcategories(client),/changed|missing/);
      assert.deepEqual((await client.execute('SELECT * FROM Product ORDER BY id')).rows,before);
    } finally {client.close();}
  }
});
