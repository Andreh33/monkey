import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';

test('catalog indexes avoid full scans, preserve rows and migrate idempotently', async () => {
  assert.ok(existsSync('scripts/migrate-catalog-indexes.mjs'), 'index migration must exist');
  const { migrateCatalogIndexes } = await import('../scripts/migrate-catalog-indexes.mjs');
  const client = createClient({ url: pathToFileURL(path.join(mkdtempSync(path.join(tmpdir(), 'monkey-index-test-')), 'test.db')).href });
  try {
    await client.execute('PRAGMA journal_mode=WAL');
    for (const migration of readdirSync('prisma/migrations').filter(name => name < '20261112000000' && existsSync(`prisma/migrations/${name}/migration.sql`)).sort()) {
      await client.executeMultiple(readFileSync(`prisma/migrations/${migration}/migration.sql`, 'utf8'));
    }
    await client.execute(`INSERT INTO Product(id,slug,name,description,shortDesc,price,stock,category,stripeLink,updatedAt) VALUES('p1','p1','Name','Description','Summary',713.90,5,'patinete','',CURRENT_TIMESTAMP)`);
    await client.execute(`INSERT INTO ProductImage(id,productId,url,"order") VALUES('im1','p1','/image.jpg',0)`);
    await client.execute(`INSERT INTO "Order"(id,email,status,total,items,stripeRef) VALUES('o1','local@example.test','PAID',713.90,'[]','existing-payment')`);
    const before = await Promise.all(['Product', 'ProductImage', 'Order'].map(table => client.execute(`SELECT * FROM "${table}" ORDER BY id`)));
    assert.equal((await migrateCatalogIndexes(client)).status, 'applied');
    assert.equal((await migrateCatalogIndexes(client)).status, 'already-applied');
    for (const [i, table] of ['Product', 'ProductImage', 'Order'].entries()) assert.deepEqual((await client.execute(`SELECT * FROM "${table}" ORDER BY id`)).rows, before[i].rows);
    for (const sql of [
      `SELECT * FROM ProductImage WHERE productId='p1' ORDER BY "order"`,
      `SELECT id FROM Product WHERE active=1 ORDER BY createdAt DESC,id ASC LIMIT 24`,
      `SELECT id FROM Product WHERE active=1 AND category='patinete' ORDER BY createdAt DESC,id ASC LIMIT 24`,
      `SELECT id FROM Product WHERE active=1 AND category='patinete' ORDER BY featured DESC,createdAt DESC LIMIT 3`,
      `SELECT id FROM "Order" WHERE status='PAID' AND paidAt>=1 ORDER BY paidAt,id LIMIT 51`,
    ]) {
      const plan = (await client.execute('EXPLAIN QUERY PLAN ' + sql)).rows.map(r => r.detail).join('\n');
      assert.match(plan, /SEARCH .*USING .*INDEX/);
      assert.doesNotMatch(plan, /SCAN (Product|ProductImage|Order)\b|USE TEMP B-TREE/);
    }
  } finally { client.close(); }
});
