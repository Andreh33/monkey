import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { createCheckoutService, CheckoutGatewayError, type CheckoutGateway, type PaymentSession } from "../src/lib/checkout-service";
import type { CheckoutCreateInput } from "../src/lib/checkout-types";
import { CheckoutError } from "../src/lib/checkout";

const require = createRequire(import.meta.url);
const customer = { firstName: "Ana", lastName: "Prueba", email: "ana@example.test", phone: "+34600111222", addressLine1: "Calle Prueba 1", city: "Tarragona", region: "Tarragona", postalCode: "43005", country: "ES" as const };
const input = (token: string, quantity = 2): CheckoutCreateInput => ({ items: [{ productId: "p1", quantity }], customer, checkoutToken: token.repeat(64), termsAccepted: true, locale: "es" });

class FakeStripe implements CheckoutGateway {
  liveMode = false;
  sessions = new Map<string, PaymentSession>();
  params: any[] = [];
  nextError: "timeout" | "definitive" | undefined;
  async createSession(params: any, key: string): Promise<PaymentSession> {
    if (this.nextError === "definitive") { this.nextError = undefined; throw new CheckoutGatewayError(true); }
    let session = this.sessions.get(key);
    if (!session) {
      this.params.push(params);
      session = { id: `cs_test_${key}`, url: `https://checkout.stripe.com/pay/${key}`, status: "open", payment_status: "unpaid", currency: "eur", amount_total: params.line_items.reduce((n: number, line: any) => n + line.price_data.unit_amount * line.quantity, 0) + (params.shipping_options?.[0]?.shipping_rate_data.fixed_amount.amount ?? 0), client_reference_id: params.client_reference_id, metadata: params.metadata, payment_intent: null, livemode: false };
      this.sessions.set(key, session);
    }
    if (this.nextError === "timeout") { this.nextError = undefined; throw new CheckoutGatewayError(false); }
    return session;
  }
  async retrieveSession(id: string) { const found = [...this.sessions.values()].find(value => value.id === id); if (!found) throw new Error("Unknown fake session"); return found; }
  async expireSession(id: string) { const session = await this.retrieveSession(id); if (session.status !== "open") throw new Error("Session is not open"); session.status = "expired"; return session; }
  async findSession(orderId: string) { return [...this.sessions.values()].find(session => session.client_reference_id === orderId) ?? null; }
}

async function fixture(run: (db: PrismaClient, gateway: FakeStripe, service: ReturnType<typeof createCheckoutService>) => Promise<void>) {
  const tempRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(path.join(tempRoot, "monkey-checkout-test-"));
  const url = "file:" + path.join(directory, "test.db").replaceAll("\\", "/");
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    const schema = path.join(directory, "schema.prisma");
    writeFileSync(path.join(directory, "test.db"), ""); copyFileSync("prisma/schema.prisma", schema);
    execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "db", "push", "--schema", schema, "--skip-generate"], { env: { ...process.env, DATABASE_URL: url }, stdio: "pipe", timeout: 30000 });
    await db.product.create({ data: { id: "p1", name: "Pieza", slug: "pieza", shortDesc: "Pieza", description: "Pieza de prueba", price: 19.99, shippingCost: 5, stock: 5, category: "recambio", stripeLink: "", images: { create: { url: "/pieza.jpg" } } } });
    const gateway = new FakeStripe();
    await run(db, gateway, createCheckoutService({ db, gateway, origin: "https://shop.example.test", encryptionSecret: "checkout-fixture-encryption-only" }));
  } finally {
    await db.$disconnect();
    const resolved = realpathSync(directory);
    if (path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("monkey-checkout-test-")) rmSync(resolved, { recursive: true, force: true });
  }
}

test("stock invalidation runs after committed reservations/releases and not read-only payment polls", () => fixture(async (db, gateway) => {
  let invalidations = 0;
  const service = createCheckoutService({ db, gateway, origin: 'https://shop.example.test', encryptionSecret: 'local-only', onStockChange: () => { invalidations++; } });
  const order = await service.create(input('1'));
  assert.equal(invalidations, 1, 'reserve invalidates public stock');
  await service.create(input('1'));
  await service.status(input('1').checkoutToken);
  assert.equal(invalidations, 1, 'idempotent create and pending status must not flush the catalog');
  await service.cancel(input('1').checkoutToken);
  assert.equal(invalidations, 2, 'release invalidates public stock');
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: 'p1' } })).stock, 5);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.orderId } })).status, 'EXPIRED');
}));

test("a new French order uses an edited price and preserves address, phone and immutable paid totals", () => fixture(async (db, gateway, service) => {
  await db.product.update({ where: { id: 'p1' }, data: { price: 29.95, shippingCountries: '["ES","FR","IT","PT"]' } });
  const french = { ...input('2'), locale: 'fr' as const, customer: { ...customer, country: 'FR' as const, phone: '+33612345678', postalCode: '75001', city: 'Paris', region: 'Paris', addressLine1: '1 Rue de Test' } };
  const created = await service.create(french);
  assert.equal(gateway.params[0].line_items[0].price_data.unit_amount, 2995);
  assert.equal(gateway.params[0].shipping_options[0].shipping_rate_data.fixed_amount.amount, 1000);
  const session = [...gateway.sessions.values()][0];
  session.status = 'complete'; session.payment_status = 'paid';
  await service.processEvent({ id: 'evt_price_fr', type: 'checkout.session.completed', session });
  const paid = await db.order.findUniqueOrThrow({ where: { id: created.orderId } });
  assert.equal(paid.status, 'PAID'); assert.equal(paid.totalCents, 6990);
  assert.equal(paid.addressLine1, french.customer.addressLine1); assert.equal(paid.phone, french.customer.phone);
  assert.equal(paid.email, french.customer.email); assert.equal(paid.country, 'FR');
  await db.product.update({ where: { id: 'p1' }, data: { price: 35 } });
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: created.orderId } })).totalCents, 6990);
  assert.equal((await service.quote({ items: [{ productId: 'p1', quantity: 1 }], country: 'FR', postalCode: '75001' })).totalCents, 4000);
}));

test("checkout reserves once, retries the same Stripe request and rejects a reused token with different delivery data", () => fixture(async (db, gateway, service) => {
  gateway.nextError = "timeout";
  await assert.rejects(service.create(input("a")), (error: any) => error.code === "PAYMENT_UNAVAILABLE");
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
  const first = await service.create(input("a"));
  const repeated = await service.create(input("a"));
  assert.deepEqual(first, repeated);
  assert.equal(await db.order.count(), 1);
  assert.equal(gateway.params.length, 1);
  assert.equal(gateway.params[0].line_items[0].price_data.unit_amount, 1999);
  assert.equal(gateway.params[0].shipping_options[0].shipping_rate_data.fixed_amount.amount, 1000);
  const order = await db.order.findFirstOrThrow();
  assert.equal(order.totalCents, 4998); assert.equal(order.phone, customer.phone); assert.equal(order.addressLine1, customer.addressLine1);
  assert.notEqual(order.checkoutTokenHash, input("a").checkoutToken);
  await assert.rejects(service.create({ ...input("a"), customer: { ...customer, city: "Reus" } }), (error: any) => error.code === "CHECKOUT_CHANGED");
  await assert.rejects(service.status("f".repeat(64)), (error: any) => error.status === 404);
  const status = await service.status(input("a").checkoutToken);
  assert.equal(status.paid, false); assert.equal("email" in status, false); assert.equal("customer" in status, false); assert.equal("addressLine1" in status, false);
}));

test("paid events are idempotent, verify amount and never release sold stock on late expiry", () => fixture(async (db, gateway, service) => {
  const result = await service.create(input("b"));
  const session = [...gateway.sessions.values()][0];
  session.status = "complete";
  await service.processEvent({ id: "evt_pending", type: "checkout.session.completed", session });
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: result.orderId } })).status, "PENDING");
  session.payment_status = "paid"; session.payment_intent = "pi_test_paid"; session.amount_total = 1;
  await assert.rejects(service.processEvent({ id: "evt_bad", type: "checkout.session.async_payment_succeeded", session }), CheckoutError);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: result.orderId } })).status, "PENDING");
  session.amount_total = 4998;
  await service.processEvent({ id: "evt_paid", type: "checkout.session.async_payment_succeeded", session });
  await service.processEvent({ id: "evt_paid", type: "checkout.session.async_payment_succeeded", session });
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: result.orderId } })).status, "PAID");
  session.status = "expired"; session.payment_status = "unpaid";
  await service.processEvent({ id: "evt_late_expiry", type: "checkout.session.expired", session });
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: result.orderId } })).status, "PAID");
}));

test("expired and definitively failed sessions release their reservations once", () => fixture(async (db, gateway, service) => {
  await service.create(input("c")); const session = [...gateway.sessions.values()][0]; session.status = "expired";
  await service.processEvent({ id: "evt_expired", type: "checkout.session.expired", session });
  await service.processEvent({ id: "evt_expired_again", type: "checkout.session.expired", session });
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 5);
  gateway.nextError = "definitive";
  await assert.rejects(service.create(input("d")), (error: any) => error.code === "PAYMENT_UNAVAILABLE");
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 5);
  assert.equal((await db.order.findFirstOrThrow({ where: { status: "FAILED" } })).stockReleased, true);
}));

test("concurrent last-unit purchases cannot oversell and a rejected multi-item cart changes nothing", () => fixture(async (db, _gateway, service) => {
  await db.product.update({ where: { id: "p1" }, data: { stock: 1 } });
  const results = await Promise.allSettled([service.create(input("e", 1)), service.create(input("f", 1))]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 0);
  assert.equal(await db.order.count(), 1);
  await db.product.update({ where: { id: "p1" }, data: { stock: 3 } });
  await assert.rejects(service.create({ ...input("1", 2), items: [{ productId: "p1", quantity: 2 }, { productId: "missing", quantity: 1 }] }));
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
  assert.equal(await db.order.count(), 1);
}));

test("cancellation releases an open checkout, but cannot release a paid checkout", () => fixture(async (db, gateway, service) => {
  await service.create(input("2"));
  assert.equal((await service.cancel(input("2").checkoutToken)).status, "EXPIRED");
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 5);
  await service.cancel(input("2").checkoutToken);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 5);
  await service.create(input("3"));
  const session = [...gateway.sessions.values()][1]; session.status = "complete"; session.payment_status = "paid";
  assert.equal((await service.cancel(input("3").checkoutToken)).paid, true);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
}));

test("clock expiry alone never releases stock, while an authoritative expired session is recovered by quote", () => fixture(async (db, gateway, service) => {
  const result = await service.create(input("4"));
  await db.order.update({ where: { id: result.orderId }, data: { expiresAt: new Date(Date.now() - 1000) } });
  await service.quote({ items: [{ productId: "p1", quantity: 1 }], country: "ES" });
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
  [...gateway.sessions.values()][0].status = "expired";
  const quote = await service.quote({ items: [{ productId: "p1", quantity: 5 }], country: "ES" });
  assert.equal(quote.items[0].stock, 5);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: result.orderId } })).status, "EXPIRED");
}));

test("an abandoned timeout with no saved session ID recovers a paid checkout even after the idempotency retention window", () => fixture(async (db, gateway) => {
  let clock = new Date();
  const service = createCheckoutService({ db, gateway, origin: "https://shop.example.test", encryptionSecret: "checkout-fixture-encryption-only", now: () => clock });
  gateway.nextError = "timeout";
  await assert.rejects(service.create(input("5")));
  const before = await db.order.findFirstOrThrow();
  assert.equal(before.stripeSessionId, null);
  assert.ok(before.stripeRequestEncrypted);
  assert.equal(before.stripeRequestEncrypted!.includes(input("5").checkoutToken), false);
  const session = [...gateway.sessions.values()][0]; session.status = "complete"; session.payment_status = "paid";
  clock = new Date(clock.getTime() + 26 * 60 * 60 * 1000);
  await service.quote({ items: [{ productId: "p1", quantity: 1 }], country: "ES" });
  const after = await db.order.findFirstOrThrow();
  assert.equal(after.status, "PAID"); assert.equal(after.stripeSessionId, session.id);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
}));

test("persistent reservation quota blocks stock hoarding and allows another checkout after cancellation", () => fixture(async (db, _gateway, service) => {
  await db.product.update({ where: { id: "p1" }, data: { stock: 20 } });
  for (const digit of ["6", "7", "8", "9", "a"]) await service.create(input(digit, 1), undefined, "same-visitor-hash");
  await assert.rejects(service.create(input("b", 1), undefined, "same-visitor-hash"), (error: any) => error.code === "TOO_MANY_CHECKOUTS");
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 15);
  await service.cancel(input("6", 1).checkoutToken);
  await service.create(input("b", 1), undefined, "same-visitor-hash");
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 15);
}));

test("late paid checkout remains financially paid if released stock is unavailable, and can be allocated after replenishment", () => fixture(async (db, gateway, service) => {
  const result = await service.create(input("c"));
  const session = [...gateway.sessions.values()][0]; session.status = "expired";
  await service.processEvent({ id: "evt_release", type: "checkout.session.expired", session });
  await db.product.update({ where: { id: "p1" }, data: { stock: 1 } });
  session.status = "complete"; session.payment_status = "paid";
  await service.processEvent({ id: "evt_late_paid", type: "checkout.session.async_payment_succeeded", session });
  const held = await db.order.findUniqueOrThrow({ where: { id: result.orderId } });
  assert.equal(held.status, "PAID"); assert.equal(held.stockIssue, true); assert.equal(held.stockReleased, true);
  assert.equal((await service.status(input("c").checkoutToken)).paid, true);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 1);
  assert.deepEqual(await service.reconcileOrderStock(result.orderId), { resolved: false });
  await db.product.update({ where: { id: "p1" }, data: { stock: 3 } });
  assert.deepEqual(await service.reconcileOrderStock(result.orderId), { resolved: true });
  assert.deepEqual(await service.reconcileOrderStock(result.orderId), { resolved: true });
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 1);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: result.orderId } })).stockIssue, false);
}));

test("cancellation releases a missing-session reservation only after a definitive provider rejection", () => fixture(async (db, gateway, service) => {
  const originalCreate = gateway.createSession.bind(gateway);
  gateway.createSession = async () => { throw new CheckoutGatewayError(false); };
  await assert.rejects(service.create(input("d")));
  assert.equal(gateway.sessions.size, 0);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 3);
  gateway.createSession = originalCreate;
  gateway.nextError = "definitive";
  assert.equal((await service.cancel(input("d").checkoutToken)).status, "FAILED");
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 5);
}));

test("pending asynchronous payments cannot starve recovery of later expired reservations", () => fixture(async (db, gateway) => {
  let clock = new Date();
  const service = createCheckoutService({ db, gateway, origin: "https://shop.example.test", encryptionSecret: "checkout-fixture-encryption-only", now: () => clock });
  await db.product.update({ where: { id: "p1" }, data: { stock: 20 } });
  for (const digit of ["1", "2", "3", "4"]) {
    await service.create(input(digit, 1));
    clock = new Date(clock.getTime() + 1000);
  }
  [...gateway.sessions.values()].forEach((session, index) => { session.status = index < 3 ? "complete" : "expired"; });
  clock = new Date(clock.getTime() + 60 * 60 * 1000);
  await service.reconcileExpiredReservations();
  await service.reconcileExpiredReservations();
  assert.equal(await db.order.count({ where: { status: "EXPIRED" } }), 1);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: "p1" } })).stock, 17);
  assert.equal(await db.order.count({ where: { status: "PENDING" } }), 3);
}));
