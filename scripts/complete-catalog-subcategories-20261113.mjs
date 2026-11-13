import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';

const manifest=JSON.parse(await readFile(new URL('./data/catalog-subcategories-20261113.json',import.meta.url),'utf8'));

export async function completeCatalogSubcategories(client) {
  const tx=await client.transaction('write');
  try {
    await tx.execute('CREATE TABLE IF NOT EXISTS _app_migrations (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    if ((await tx.execute({sql:'SELECT name FROM _app_migrations WHERE name=?',args:[manifest.migration]})).rows.length) {
      await tx.commit();return {status:'already-applied',updated:0};
    }
    const products=manifest.products;
    const rows=(await tx.execute({sql:`SELECT id,category,subcategory FROM Product WHERE id IN (${products.map(()=>'?').join(',')})`,args:products.map(p=>p.id)})).rows;
    const byId=new Map(rows.map(p=>[p.id,p]));
    if(rows.length!==products.length || products.some(p=>byId.get(p.id)?.category!==p.category || byId.get(p.id)?.subcategory!==p.subcategory)) {
      throw new Error('Reviewed product assignments changed; migration stopped.');
    }
    const targets=(await tx.execute('SELECT c.slug category,s.slug subcategory FROM Subcategory s JOIN Category c ON c.id=s.categoryId')).rows;
    const validTargets=new Set(targets.map(p=>`${p.category}\0${p.subcategory}`));
    if(products.some(p=>!validTargets.has(`${p.targetCategory}\0${p.targetSubcategory}`))) throw new Error('A reviewed target subcategory is missing; migration stopped.');
    await tx.execute('CREATE TABLE _catalog_subcategories_before_20261113 (id TEXT PRIMARY KEY,category TEXT NOT NULL,subcategory TEXT)');
    await tx.batch(products.flatMap(p=>[
      {sql:'INSERT INTO _catalog_subcategories_before_20261113(id,category,subcategory) VALUES(?,?,?)',args:[p.id,p.category,p.subcategory]},
      {sql:'UPDATE Product SET category=?,subcategory=? WHERE id=?',args:[p.targetCategory,p.targetSubcategory,p.id]},
    ]));
    await tx.execute({sql:'INSERT INTO _app_migrations(name) VALUES(?)',args:[manifest.migration]});
    await tx.commit();return {status:'applied',updated:products.length};
  } catch(error) {
    if(!tx.closed) await tx.rollback();
    throw error;
  } finally {tx.close();}
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(!process.env.TURSO_DATABASE_URL) console.log('[catalog-subcategories] No production database configured; skipped.');
  else {
    const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
    try {console.log('[catalog-subcategories]',await completeCatalogSubcategories(client));}
    catch(error) {console.error('[catalog-subcategories] Failed; deployment stopped.',error.message);process.exitCode=1;}
    finally {client.close();}
  }
}
