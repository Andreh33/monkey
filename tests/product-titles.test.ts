import test from 'node:test';
import assert from 'node:assert/strict';
import { productPageTitle } from '../src/lib/product-title';
import titles from '../src/content/product-titles.json';

test('editorial SEO titles remain concise without shortening visible product names', () => {
  for (const [id, entry] of Object.entries(titles)) {
    const product = { id, name: entry.sourceName };
    for (const locale of ['es', 'fr', 'it', 'pt'] as const) {
      const result = productPageTitle(product, entry.sourceName, locale);
      assert.ok(result.length <= 70, `${locale}: ${result}`);
      assert.equal(product.name, entry.sourceName);
    }
  }
});

test('a renamed product uses its current model instead of an obsolete SEO title', () => {
  const [id, entry] = Object.entries(titles)[0];
  const name = entry.sourceName + ' NUEVO MODELO 72V';
  assert.equal(productPageTitle({ id, name }, name, 'es'), name);
  assert.equal(productPageTitle({ id: 'new-id', name: 'Modelo X 1000W' }, 'Modèle X 1000W', 'fr'), 'Modèle X 1000W · Monkey');
});
