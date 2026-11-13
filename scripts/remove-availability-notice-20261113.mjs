import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';

const migration = '20261113_remove_product_availability_notice';
const notice = '*Consultar disponibilidad por WhatsApp al +34 616 686 593 antes de realizar el pedido*';

export async function removeAvailabilityNotice(client) {
  await client.execute('CREATE TABLE IF NOT EXISTS "_app_migrations" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const applied = await client.execute({ sql: 'SELECT name FROM "_app_migrations" WHERE name = ?', args: [migration] });
  if (applied.rows.length) return { status: 'already-applied', updated: 0 };
  const products = (await client.execute({ sql: 'SELECT id, name, description FROM "Product" WHERE "shortDesc" = ?', args: [notice] })).rows;
  const statements = [
    { sql: 'CREATE TABLE IF NOT EXISTS "_product_availability_notices_before_20261113" (id TEXT PRIMARY KEY, shortDesc TEXT NOT NULL)', args: [] },
    { sql: 'INSERT OR IGNORE INTO "_product_availability_notices_before_20261113" SELECT id, shortDesc FROM "Product" WHERE "shortDesc" = ?', args: [notice] },
  ];
  for (const product of products) {
    // Reuse the factual first sentence; keep the summary valid for the editor.
    const firstSentence = product.description.split(/(?<=[.!?])\s|\n/)[0].trim();
    const summary = firstSentence.length >= 2 && firstSentence.length <= 160 ? firstSentence : product.name.slice(0, 160);
    statements.push({ sql: 'UPDATE "Product" SET "shortDesc" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ? AND "shortDesc" = ?', args: [summary, product.id, notice] });
  }
  statements.push({ sql: 'INSERT INTO "_app_migrations" (name) VALUES (?)', args: [migration] });
  await client.batch(statements, 'write');
  return { status: 'applied', updated: products.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) console.log('[availability-notice] No production database configured; skipped.');
  else {
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try { console.log('[availability-notice]', await removeAvailabilityNotice(client)); }
    catch (error) { console.error('[availability-notice] Failed; deployment stopped.', error.message); process.exitCode = 1; }
    finally { client.close(); }
  }
}
