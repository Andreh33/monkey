import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';

const PREFIX = '20261113_apollo_catalog_';
const IMAGE_HOST = '19e3cavvu8vlpeyt.public.blob.vercel-storage.com';
const assert = (ok, message) => { if (!ok) throw new Error(`Apollo import: ${message}`); };
export const normalizedName = name => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function validateApolloManifest(manifest, { bicycleStockOverride = false } = {}) {
  assert(manifest.version === 1 && Array.isArray(manifest.products) && manifest.products.length > 0, 'invalid manifest');
  const ids = new Set(), skus = new Set(), slugs = new Set(), names = new Set();
  for (const p of manifest.products) {
    assert(/^imp20261113_ap\d+_v\d+$/.test(p.id), 'invalid ID');
    assert(p.id === `imp20261113_ap${p.source.productId}_v${p.source.variantId}` && p.sku === `MA-${p.source.productId}-${p.source.variantId}`, 'source identity mismatch');
    assert(!ids.has(p.id) && !skus.has(p.sku) && !slugs.has(p.slug), 'duplicate identity');
    ids.add(p.id); skus.add(p.sku); slugs.add(p.slug);
    assert(!names.has(normalizedName(p.name)), 'duplicate product name');
    names.add(normalizedName(p.name));
    assert(Number.isInteger(p.source.priceCents) && p.source.priceCents > 0 && Number.isFinite(p.price), 'invalid price');
    const expected = Math.floor((p.source.priceCents * 120 + 50) / 100);
    assert(Math.abs(p.price * 100 - expected) < 0.000001, 'price must be exactly source plus 20 percent');
    assert(!bicycleStockOverride || p.category === 'bicicleta', 'stock override is limited to bicycles');
    assert(Number.isInteger(p.source.quantity) && (p.source.quantity > 0 || bicycleStockOverride) && p.source.availableForOrder === true, 'source must have stock and allow purchases');
    assert(p.stock === 5 && p.active === true && p.featured === false && p.currency === 'EUR' && p.stripeLink === '', 'invalid publication defaults');
    assert(Number.isFinite(p.shippingCost) && p.shippingCost >= 5 && p.shippingCost <= 75, 'invalid shipping');
    assert(p.shippingCountries === '["ES","FR","IT","PT"]', 'invalid destinations');
    assert(typeof p.slug === 'string' && /^[a-z0-9_-]+$/.test(p.slug), 'invalid slug');
    assert(p.name?.length > 2 && p.name.length <= 240 && p.shortDesc?.length <= 160 && p.description?.length > 30 && p.description.length <= 30000, 'invalid editorial content');
    assert(!/motos[\s._-]*apollo|motos[\s._-]*mh|https?:\/\/|www\./i.test([p.name, p.shortDesc, p.description, p.brand].join(' ')), 'retailer mention or external link');
    assert(p.category !== 'vehiculos' && /^[a-z0-9-]+$/.test(p.category) && p.categoryName, 'invalid category');
    assert(!p.subcategory || (/^[a-z0-9-]+$/.test(p.subcategory) && p.subcategoryName), 'invalid subcategory');
    assert(p.images.length > 0 && p.images.length <= 60, 'missing photos');
    for (const image of p.images) {
      const url = new URL(image.url);
      assert(url.protocol === 'https:' && url.hostname === IMAGE_HOST && url.pathname.startsWith('/products/import-apollo-20261113/'), 'image must be hosted in our import directory');
      assert(!/motos[\s._-]*apollo|motos[\s._-]*mh|https?:\/\/|www\./i.test(image.alt ?? ''), 'invalid image alt');
    }
  }
}

/** Additive, resumable batches. Never updates an existing product, price, stock or order. */
export async function importApolloCatalog(client, manifest, { batchSize = 25, onProgress = () => {}, bicycleStockOverride = false, bicycleImportGroup = 'bicycles', allowExistingBicycleNames = false } = {}) {
  validateApolloManifest(manifest, { bicycleStockOverride });
  // Separate, explicit follow-up authorized by the user; the original import stays strict.
  assert(/^[a-z]+$/.test(bicycleImportGroup) && bicycleImportGroup !== 'catalog', 'invalid bicycle import group');
  assert(!allowExistingBicycleNames || bicycleStockOverride, 'duplicate-name permission is limited to the authorized bicycle import');
  const prefix = bicycleStockOverride ? `20261113_apollo_${bicycleImportGroup}_` : PREFIX;
  assert(Number.isInteger(batchSize) && batchSize > 0 && batchSize <= 25, 'invalid batch size');
  const digest = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
  const marker = prefix + digest.slice(0, 20);
  await client.execute('CREATE TABLE IF NOT EXISTS "_app_migrations" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const applied = await client.execute({ sql: 'SELECT name FROM "_app_migrations" WHERE name LIKE ?', args: [prefix + '%'] });
  if (applied.rows.length) {
    assert(applied.rows.length === 1 && applied.rows[0].name === marker, 'a different manifest was already imported');
    return { status: 'already-applied', inserted: 0, skipped: manifest.products.length };
  }
  const existing = (await client.execute('SELECT id, sku, name FROM "Product"')).rows;
  const byId = new Map(existing.map(p => [p.id, p]));
  const skus = new Set(existing.map(p => p.sku));
  const names = new Set(existing.map(p => normalizedName(p.name)));
  let inserted = 0, skipped = 0;
  for (let offset = 0; offset < manifest.products.length; offset += batchSize) {
    const added = [], statements = [];
    for (const p of manifest.products.slice(offset, offset + batchSize)) {
      if (byId.has(p.id)) {
        assert(byId.get(p.id).sku === p.sku, 'existing ID belongs to a different SKU');
        skipped++; continue;
      }
      if (skus.has(p.sku) || (!allowExistingBicycleNames && names.has(normalizedName(p.name)))) { skipped++; continue; }
      statements.push({ sql: 'INSERT INTO "Category" (id, slug, name, "order", "updatedAt") VALUES (?, ?, ?, 100, CURRENT_TIMESTAMP) ON CONFLICT(slug) DO NOTHING', args: ['ap-cat-' + p.category, p.category, p.categoryName] });
      if (p.subcategory) {
        statements.push({ sql: 'INSERT INTO "Subcategory" (id, "categoryId", slug, name, "order", "updatedAt") SELECT ?, id, ?, ?, 100, CURRENT_TIMESTAMP FROM "Category" WHERE slug = ? ON CONFLICT("categoryId", slug) DO NOTHING', args: ['ap-sub-' + p.category + '-' + p.subcategory, p.subcategory, p.subcategoryName, p.category] });
      }
      const columns = ['id', 'slug', 'name', 'description', 'shortDesc', 'price', 'currency', 'sku', 'stock', 'category', 'brand', 'subcategory', 'stripeLink', 'shippingCost', 'shippingCountries', 'maxSpeed', 'range', 'motorPower', 'battery', 'weight', 'maxLoad'];
      const args = columns.map(k => p[k] ?? null);
      statements.push({ sql: `INSERT INTO "Product" (${columns.map(k => `"${k}"`).join(',')}, active, featured, "updatedAt") VALUES (${columns.map(() => '?').join(',')}, 1, 0, CURRENT_TIMESTAMP)`, args });
      statements.push(...p.images.map((image, order) => ({ sql: 'INSERT INTO "ProductImage" (id, "productId", url, alt, "order") VALUES (?, ?, ?, ?, ?)', args: [p.id + '-image-' + order, p.id, image.url, image.alt, order] })));
      added.push(p);
    }
    // A single atomic request per chunk avoids long interactive transactions.
    if (statements.length) await client.batch(statements, 'write');
    for (const p of added) { byId.set(p.id, p); skus.add(p.sku); names.add(normalizedName(p.name)); }
    inserted += added.length;
    onProgress({ processed: Math.min(offset + batchSize, manifest.products.length), inserted, skipped });
  }
  await client.execute({ sql: 'INSERT INTO "_app_migrations" (name) VALUES (?)', args: [marker] });
  return { status: 'applied', inserted, skipped };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.TURSO_DATABASE_URL) console.log('[apollo-import] No production database configured; skipped.');
  else {
    const manifest = JSON.parse(await readFile(new URL('./data/apollo-catalog-20261113.json', import.meta.url), 'utf8'));
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try { console.log('[apollo-import]', await importApolloCatalog(client, manifest, { onProgress: p => { if (p.processed % 250 === 0 || p.processed === manifest.products.length) console.log('[apollo-import]', p); } })); }
    catch (error) { console.error('[apollo-import] Failed; deployment stopped.', error.message); process.exitCode = 1; }
    finally { client.close(); }
  }
}
