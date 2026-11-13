import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { importApolloCatalog } from './import-apollo-20261113.mjs';

const drift = JSON.parse(await readFile(new URL('./data/drift-category-20261113.json', import.meta.url), 'utf8'));

export async function migrateDriftCategory(client) {
  const tx = await client.transaction('write');
  try {
    await tx.execute('CREATE TABLE IF NOT EXISTS "_app_migrations" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    if ((await tx.execute({ sql: 'SELECT name FROM "_app_migrations" WHERE name = ?', args: [drift.migration] })).rows.length) {
      await tx.commit(); return { status: 'already-applied', moved: 0 };
    }
    const rows = (await tx.execute({ sql: `SELECT id, category, subcategory FROM "Product" WHERE id IN (${drift.products.map(() => '?').join(',')})`, args: drift.products.map(p => p.id) })).rows;
    if (rows.length !== drift.products.length || rows.some(p => {
      const original = drift.products.find(x => x.id === p.id);
      return p.category !== original.category || p.subcategory !== original.subcategory;
    })) throw new Error('Reviewed drift product assignments changed; migration stopped.');
    await tx.execute('CREATE TABLE IF NOT EXISTS "_drift_categories_before_20261113" (id TEXT PRIMARY KEY, category TEXT NOT NULL, subcategory TEXT)');
    await tx.execute({ sql: 'INSERT INTO "Category" (id,slug,name,"order","updatedAt") VALUES (?,?,?,10,CURRENT_TIMESTAMP) ON CONFLICT(slug) DO NOTHING', args: ['cat-drift-20261113','drift','Drift'] });
    await tx.batch(rows.flatMap(p => [
      { sql: 'INSERT INTO "_drift_categories_before_20261113" (id,category,subcategory) VALUES (?,?,?)', args: [p.id,p.category,p.subcategory] },
      { sql: 'UPDATE "Product" SET category = ?, subcategory = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?', args: ['drift',p.id] },
    ]));
    await tx.execute({ sql: 'INSERT INTO "_app_migrations" (name) VALUES (?)', args: [drift.migration] });
    await tx.commit(); return { status: 'applied', moved: rows.length };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  } finally { tx.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) console.log('[bicycles-drift] No production database configured; skipped.');
  else {
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try {
      const manifest = JSON.parse(await readFile(new URL('./data/apollo-bicycles-20261113.json', import.meta.url), 'utf8'));
      console.log('[bicycles-import]', await importApolloCatalog(client, manifest, { bicycleStockOverride: true }));
      const specialBicycle = JSON.parse(await readFile(new URL('./data/apollo-special-bicycle-20261113.json', import.meta.url), 'utf8'));
      console.log('[special-bicycle-import]', await importApolloCatalog(client, specialBicycle, { bicycleStockOverride: true, bicycleImportGroup: 'specialbicycle' }));
      const includingExisting = JSON.parse(await readFile(new URL('./data/apollo-bicycles-including-existing-20261113.json', import.meta.url), 'utf8'));
      console.log('[all-bicycles-import]', await importApolloCatalog(client, includingExisting, { bicycleStockOverride: true, bicycleImportGroup: 'allbicycles', allowExistingBicycleNames: true }));
      console.log('[drift-category]', await migrateDriftCategory(client));
    } catch (error) { console.error('[bicycles-drift] Failed; deployment stopped.', error.message); process.exitCode = 1; }
    finally { client.close(); }
  }
}
