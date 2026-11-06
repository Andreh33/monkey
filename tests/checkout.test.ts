import assert from "node:assert/strict";
import test from "node:test";
import { buildCheckoutQuote, checkoutCreateSchema, checkoutQuoteSchema } from "../src/lib/checkout";

const product = { id: "p1", slug: "pieza", name: "Pieza", price: 19.99, shippingCost: 5, shippingCountries: '["ES","FR","DE"]', currency: "EUR", active: true, stock: 5, images: [{ url: "/pieza.jpg" }] };
const customer = { firstName: "Ana", lastName: "Prueba", email: "ana@example.test", phone: "+34600111222", addressLine1: "Calle Prueba 1", city: "Tarragona", region: "Tarragona", postalCode: "43005", country: "ES" };

test("quote uses catalog cents and sums per-unit shipping across duplicate cart lines", () => {
  const quote = buildCheckoutQuote([{ productId: "p1", quantity: 1 }, { productId: "p1", quantity: 2 }, { productId: "p2", quantity: 3 }], [product, { ...product, id: "p2", price: 0.1, shippingCost: null }], "FR", "75001");
  assert.equal(quote.items.length, 2);
  assert.equal(quote.subtotalCents, 6027);
  assert.equal(quote.shippingCents, 1500);
  assert.equal(quote.totalCents, 7527);
  assert.equal(quote.items[0].quantity, 3);
});

test("quote rejects unavailable products, invalid stock and non-EUR or zero-priced catalog data", () => {
  for (const bad of [{ ...product, active: false }, { ...product, stock: 0 }, { ...product, price: 0 }, { ...product, currency: "USD" }]) {
    assert.throws(() => buildCheckoutQuote([{ productId: "p1", quantity: 1 }], [bad], "ES", "43005"));
  }
  assert.throws(() => buildCheckoutQuote([{ productId: "missing", quantity: 1 }], [product], "ES", "43005"));
  assert.throws(() => buildCheckoutQuote([{ productId: "p1", quantity: 3 }, { productId: "p1", quantity: 3 }], [product], "ES", "43005"));
});

test("input validation rejects client prices, invalid quantities, empty addresses and missing consent", () => {
  const good = { items: [{ productId: "p1", quantity: 1 }], customer, checkoutToken: "a".repeat(64), termsAccepted: true, locale: "es" };
  assert.equal(checkoutCreateSchema.safeParse(good).success, true);
  for (const quantity of [0, -1, 0.5, 100, Number.NaN]) assert.equal(checkoutQuoteSchema.safeParse({ items: [{ productId: "p1", quantity }], country: "ES" }).success, false);
  assert.equal(checkoutCreateSchema.safeParse({ ...good, totalCents: 1 }).success, false);
  assert.equal(checkoutCreateSchema.safeParse({ ...good, items: [{ productId: "p1", quantity: 1, price: 1 }] }).success, false);
  assert.equal(checkoutCreateSchema.safeParse({ ...good, termsAccepted: false }).success, false);
  assert.equal(checkoutCreateSchema.safeParse({ ...good, customer: { ...customer, addressLine1: "" } }).success, false);
  assert.equal(checkoutCreateSchema.safeParse({ ...good, customer: { ...customer, country: "US" } }).success, false);
  assert.equal(checkoutCreateSchema.safeParse({ ...good, customer: { ...customer, country: "IS", postalCode: "101" } }).success, true);
});

test("cart shipping countries are the intersection of product conditions, and legacy null stays Spain-only", () => {
  assert.deepEqual(buildCheckoutQuote([{ productId: "p1", quantity: 1 }], [product], "DE" as any, "10115").allowedCountries.sort(), ["DE", "ES", "FR"]);
  const legacy = { ...product, id: "p2", shippingCountries: null };
  assert.deepEqual(buildCheckoutQuote([{ productId: "p1", quantity: 1 }, { productId: "p2", quantity: 1 }], [product, legacy], "ES", "43005").allowedCountries, ["ES"]);
  assert.throws(() => buildCheckoutQuote([{ productId: "p1", quantity: 1 }, { productId: "p2", quantity: 1 }], [product, legacy], "FR", "75001"), (error: any) => error.code === "UNSUPPORTED_DESTINATION");
});
