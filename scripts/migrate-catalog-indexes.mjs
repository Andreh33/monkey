import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';

const migration = '20261112000000_catalog_read_indexes';
export async function migrateCatalogIndexes(client) {
  const sql = await readFile(new URL(`../prisma/migrations/${migration}/migration.sql`, import.meta.url), 'utf8');
  const names = [...sql.matchAll(/CREATE INDEX IF NOT EXISTS "([^"]+)"/g)].map(match => match[1]);
  const tx = await client.transaction('write');
  try {
    await tx.execute('CREATE TABLE IF NOT EXISTS "_app_migrations" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    const applied = (await tx.execute({ sql: 'SELECT name FROM "_app_migrations" WHERE name=?', args: [migration] })).rows.length > 0;
    if (!applied) {
      // Additive DDL only: never rewrites prices, stock, orders or existing tables.
      await tx.executeMultiple(sql);
      await tx.execute({ sql: 'INSERT INTO "_app_migrations" (name) VALUES (?)', args: [migration] });
    }
    const present = new Set((await tx.execute("SELECT name FROM sqlite_master WHERE type='index'")).rows.map(row => row.name));
    if (names.some(name => !present.has(name))) throw new Error('Catalog index verification failed.');
    const imagePlan = (await tx.execute("EXPLAIN QUERY PLAN SELECT id FROM ProductImage WHERE productId='index-check' ORDER BY \"order\"")).rows.map(row => row.detail);
    const catalogPlan = (await tx.execute('EXPLAIN QUERY PLAN SELECT id FROM Product WHERE active=1 ORDER BY createdAt DESC,id ASC LIMIT 24')).rows.map(row => row.detail);
    if ([...imagePlan, ...catalogPlan].some(detail => /SCAN (?:main\.)?(ProductImage|Product)\b/.test(String(detail)))) throw new Error('Catalog still uses a full table scan.');
    await tx.commit();
    return { status: applied ? 'already-applied' : 'applied', indexes: names.length, imagePlan, catalogPlan };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  } finally { tx.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) console.log('[catalog-indexes] No Turso configured; skipped.');
  else {
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try { console.log('[catalog-indexes]', JSON.stringify(await migrateCatalogIndexes(client))); }
    catch (error) { console.error('[catalog-indexes] Deployment stopped:', error.message); process.exitCode = 1; }
    finally { client.close(); }
  }
}
