import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';

const { ids } = JSON.parse(await readFile(new URL('./data/bicycle-subcategory-20261113.json', import.meta.url), 'utf8'));
const migration = '20261113_flatten_bicycle_subcategory';

export async function flattenBicycleSubcategory(client) {
  const tx = await client.transaction('write');
  try {
    await tx.execute('CREATE TABLE IF NOT EXISTS "_app_migrations" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    if ((await tx.execute({sql:'SELECT name FROM _app_migrations WHERE name=?',args:[migration]})).rows.length) {
      await tx.commit(); return {status:'already-applied',moved:0};
    }
    const rows = (await tx.execute("SELECT id FROM Product WHERE category='bicicleta' AND subcategory='bicicletas-electricas' ORDER BY id")).rows;
    if (JSON.stringify(rows.map(p => p.id)) !== JSON.stringify(ids)) throw new Error('Reviewed bicycle assignments changed; migration stopped.');
    const subcategories = (await tx.execute("SELECT s.* FROM Subcategory s JOIN Category c ON c.id=s.categoryId WHERE c.slug='bicicleta' AND s.slug='bicicletas-electricas'")).rows;
    if (subcategories.length !== 1) throw new Error('Expected one redundant bicycle subcategory; migration stopped.');
    await tx.execute("CREATE TABLE _bicycle_subcategory_products_before_20261113 AS SELECT id,category,subcategory FROM Product WHERE category='bicicleta' AND subcategory='bicicletas-electricas'");
    await tx.execute("CREATE TABLE _bicycle_subcategories_before_20261113 AS SELECT s.* FROM Subcategory s JOIN Category c ON c.id=s.categoryId WHERE c.slug='bicicleta' AND s.slug='bicicletas-electricas'");
    // Preserve updatedAt as well as all commercial fields and product ordering.
    await tx.execute("UPDATE Product SET subcategory=NULL WHERE category='bicicleta' AND subcategory='bicicletas-electricas'");
    await tx.execute({sql:'DELETE FROM Subcategory WHERE id=?',args:[subcategories[0].id]});
    await tx.execute({sql:'INSERT INTO _app_migrations(name) VALUES(?)',args:[migration]});
    await tx.commit(); return {status:'applied',moved:rows.length};
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  } finally {tx.close();}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) console.log('[bicycle-subcategory] No production database configured; skipped.');
  else {
    const client = createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
    try { console.log('[bicycle-subcategory]',await flattenBicycleSubcategory(client)); }
    catch (error) { console.error('[bicycle-subcategory] Failed; deployment stopped.',error.message); process.exitCode=1; }
    finally {client.close();}
  }
}
