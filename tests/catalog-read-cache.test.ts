import assert from 'node:assert/strict';
import test from 'node:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { PrismaClient } from '@prisma/client';
import ts from 'typescript';
import { createCheckoutService } from '../src/lib/checkout-service';

const require = createRequire(import.meta.url);
Object.assign(globalThis, { AsyncLocalStorage });
const nextCache = require('next/cache');
const { staticGenerationAsyncStorage } = require('next/dist/client/components/static-generation-async-storage.external');

test('public reads reuse Next data cache; admin edits invalidate prices and checkout always reads live data', async () => {
  const dir = mkdtempSync(path.join(realpathSync(tmpdir()), 'monkey-cache-test-'));
  const url = 'file:' + path.join(dir, 'catalog.db').replaceAll('\\', '/');
  writeFileSync(path.join(dir, 'catalog.db'), '');
  copyFileSync('prisma/schema.prisma', path.join(dir, 'schema.prisma'));
  execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--schema', path.join(dir, 'schema.prisma'), '--skip-generate'], { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
  const db = new PrismaClient({ datasources: { db: { url } }, log: [{ emit: 'event', level: 'query' }] });
  let queries = 0;
  db.$on('query', () => queries++);
  // Exercise the real Next 14 unstable_cache/revalidateTag with an isolated storage backend.
  const entries = new Map<string, any>();
  const backend = {
    fetchCacheKey: async (key: string) => createHash('sha256').update(key).digest('hex'),
    get: async (key: string) => entries.has(key) ? { value: entries.get(key).value, isStale: false } : null,
    set: async (key: string, value: any, context: any) => { entries.set(key, { value, tags: context.tags }); },
    revalidateTag: async (tags: string[]) => { for (const [key, entry] of entries) if (entry.tags.some((tag: string) => tags.includes(tag))) entries.delete(key); },
  };
  const previous = (globalThis as any).__incrementalCache;
  (globalThis as any).__incrementalCache = backend;
  const modules = new Map<string, any>();
  function load(file: string): any {
    const resolved = path.resolve(file);
    if (modules.has(resolved)) return modules.get(resolved);
    const module = { exports: {} as any };
    modules.set(resolved, module.exports);
    const code = ts.transpileModule(readFileSync(resolved, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function('require', 'module', 'exports', code)((name: string) => {
      if (name === '@/lib/prisma' || name === './prisma') return { prisma: db };
      if (name === 'next/cache') return nextCache;
      if (name === 'react') return { cache: (fn: any) => fn }; // independent render requests
      if (name === 'next-auth') return { getServerSession: async () => ({ user: { role: 'ADMIN' } }) };
      if (name === '@/lib/auth') return { authOptions: {} };
      const target = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(resolved), name) : null;
      return target && ['catalog', 'categories', 'catalog-cache', 'catalog-cache-policy'].includes(path.basename(target)) ? load(target + '.ts') : require(target ?? name);
    }, module, module.exports);
    modules.set(resolved, module.exports);
    return module.exports;
  }
  async function request<T>(fn: () => Promise<T> | T): Promise<T> {
    const store: any = { incrementalCache: backend, urlPathname: '/tienda', pagePath: '/tienda/page', isStaticGeneration: false, revalidatedTags: [] };
    const result = await staticGenerationAsyncStorage.run(store, fn);
    await backend.revalidateTag(store.revalidatedTags);
    return result;
  }
  try {
    const original = { id: 'p1', slug: 'pieza', name: 'Pieza', shortDesc: 'Resumen', description: 'Descripción', price: 20, stock: 5, category: 'recambio', brand: 'Marca', stripeLink: '', shippingCost: 5, shippingCountries: '["ES","FR","IT","PT"]', active: true, featured: false };
    await db.product.create({ data: { ...original, images: { create: { url: '/pieza.jpg' } } } });
    await db.category.create({ data: { name: 'Recambios', slug: 'recambio' } });
    const catalog = load('src/lib/catalog.ts');
    const categories = load('src/lib/categories.ts');
    await request(() => catalog.findPublicProduct('pieza'));
    const afterFirst = queries;
    const second: any = await request(() => catalog.findPublicProduct('pieza'));
    assert.equal(queries, afterFirst, 'a second request for the product must not hit SQL');
    assert.equal(second.updatedAt instanceof Date, true, 'cached dates preserve the product contract');
    await request(() => catalog.loadCatalog({}, 'es'));
    const afterCatalog = queries;
    await request(() => catalog.loadCatalog({ utm_source: 'different-visitor' }, 'es'));
    assert.equal(queries, afterCatalog, 'tracking parameters must reuse the same catalog entries');
    await request(() => categories.getCategoryTree({ onlyWithActiveProducts: true }));
    const beforeAdmin = queries;
    await categories.getCategoryTree();
    assert.ok(queries > beforeAdmin, 'admin category reads remain live');

    await db.product.update({ where: { id: 'p1' }, data: { price: 25 } });
    assert.equal((await request(() => catalog.findPublicProduct('pieza')) as any).price, 20, 'fixture has genuinely warmed stale public data');
    const service = createCheckoutService({ db, gateway: { liveMode: false } as any, origin: 'https://shop.test', encryptionSecret: 'local-test-only' });
    const live = await service.quote({ items: [{ productId: 'p1', quantity: 2 }], country: 'FR', postalCode: '75001' });
    assert.equal(live.totalCents, 6000, 'checkout uses live price plus each unit shipping, even with stale public cache');

    const edit = load('src/app/api/productos/[id]/route.ts');
    const response: any = await request(() => edit.PATCH(new Request('https://shop.test/api/productos/p1', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...original, price: 30, images: [{ url: '/pieza.jpg' }] }) }), { params: { id: 'p1' } }));
    assert.equal(response.status, 200);
    assert.equal((await request(() => catalog.findPublicProduct('pieza')) as any).price, 30);
    assert.equal((await request(() => catalog.loadCatalog({}, 'es')) as any).products[0].price, 30);
    assert.equal((await service.quote({ items: [{ productId: 'p1', quantity: 2 }], country: 'FR', postalCode: '75001' })).totalCents, 7000);
    const category = await db.category.findFirstOrThrow();
    const editCategory = load('src/app/api/admin/categorias/[id]/route.ts');
    const categoryResponse: any = await request(() => editCategory.PATCH(new Request('https://shop.test/api/admin/categorias/' + category.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Recambios actualizados' }) }), { params: { id: category.id } }));
    assert.equal(categoryResponse.status, 200);
    assert.equal((await request(() => categories.getCategoryTree({ onlyWithActiveProducts: true })) as any[])[0].name, 'Recambios actualizados');
    await db.product.update({ where: { id: 'p1' }, data: { active: false } });
    await request(() => load('src/lib/catalog-cache.ts').revalidateCatalog());
    assert.equal(await request(() => catalog.findPublicProduct('pieza')), null, 'unpublished products disappear after invalidation');
    assert.equal((await request(() => categories.getCategoryTree({ onlyWithActiveProducts: true })) as any[]).length, 0);
    await db.category.create({ data: { name: 'Quads', slug: 'quads', order: 99 } });
    for (let i = 0; i < 55; i++) await db.product.create({ data: {
      ...original, id: `priority-${i}`, slug: `priority-${i}`, name: `Producto ${i}`,
      category: i < 26 ? 'quads' : 'recambio', price: i < 26 ? 200 : 10,
      createdAt: new Date(i < 26 ? '2025-01-01' : '2026-01-01'),
    } });
    await request(() => load('src/lib/catalog-cache.ts').revalidateCatalog());
    const pages: any[] = [];
    for (const page of ['1', '2', '3']) pages.push(await request(() => catalog.loadCatalog({ page }, 'es')));
    const ids = pages.flatMap(p => p.products.map((product: any) => product.id));
    assert.equal(ids.length, 55);
    assert.equal(new Set(ids).size, 55, 'partition boundary must neither repeat nor omit products');
    assert.ok(ids.slice(0, 26).every(id => Number(id.split('-')[1]) < 26), 'older vehicles precede newer parts across pages');
    assert.equal(pages[0].categories[0].slug, 'quads', 'public navigation prioritizes vehicles over the stored category order');
    const cheapest: any = await request(() => catalog.loadCatalog({ sort: 'price-asc' }, 'es'));
    assert.equal(cheapest.products[0].price, 10, 'explicit price sorting remains global');
    const parts: any = await request(() => catalog.loadCatalog({ cat: 'recambio' }, 'es'));
    assert.equal(parts.total, 29, 'category filters retain their own pagination');
  } finally {
    (globalThis as any).__incrementalCache = previous;
    await db.$disconnect();
  }
});
