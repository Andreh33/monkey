import { createHash } from "node:crypto";
import type { Order, Prisma, PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { buildCheckoutQuote, CheckoutError, checkoutCreateSchema, checkoutQuoteSchema, checkoutTokenSchema, normalizedLines } from "./checkout";
import type { CheckoutCreateInput, CheckoutQuoteInput, CheckoutQuoteItem, CheckoutStatusResult } from "./checkout-types";
import { decryptStripeRequest, encryptStripeRequest } from "./checkout-crypto";

export const CHECKOUT_INTEGRATION = "monkey-checkout-v1";
export type PaymentSession = {
  id: string; url: string | null; status: string | null; payment_status: string;
  currency: string | null; amount_total: number | null; client_reference_id: string | null;
  metadata: Record<string, string> | null; payment_intent: string | { id: string } | null; livemode: boolean;
};
export interface CheckoutGateway {
  liveMode: boolean;
  createSession(params: Stripe.Checkout.SessionCreateParams, idempotencyKey: string, recovery?: boolean): Promise<PaymentSession>;
  retrieveSession(id: string): Promise<PaymentSession>;
  expireSession?(id: string): Promise<PaymentSession>;
  findSession?(orderId: string, createdAt: Date, expiresAt: Date): Promise<PaymentSession | null>;
}
export class CheckoutGatewayError extends Error {
  constructor(public definitive: boolean) { super("The payment provider could not complete this request."); this.name = "CheckoutGatewayError"; }
}
export type CheckoutEventInput = { id: string; type: string; session: PaymentSession };
const eventTypes = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"]);
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const orderItems = (order: Order): CheckoutQuoteItem[] => JSON.parse(order.items);

export function buildStripeSessionParams(order: Order, token: string, origin: string): Stripe.Checkout.SessionCreateParams {
  const prefix = order.locale === "es" ? "" : `/${order.locale}`;
  const items = orderItems(order);
  return {
    mode: "payment",
    adaptive_pricing: { enabled: false },
    automatic_tax: { enabled: false },
    client_reference_id: order.id,
    customer_email: order.email,
    locale: order.locale as "es" | "fr" | "it" | "pt",
    metadata: { orderId: order.id, integration: CHECKOUT_INTEGRATION },
    payment_intent_data: {
      metadata: { orderId: order.id, integration: CHECKOUT_INTEGRATION },
      shipping: {
        name: `${order.firstName ?? ""} ${order.lastName ?? ""}`.trim(), phone: order.phone ?? undefined,
        address: { line1: order.addressLine1!, line2: order.addressLine2 || undefined, city: order.city!, state: order.region!, postal_code: order.postalCode!, country: order.country! },
      },
    },
    line_items: items.map(item => ({
      quantity: item.quantity,
      price_data: { currency: "eur", unit_amount: item.unitPriceCents, product_data: { name: item.name, metadata: { productId: item.productId } } },
    })),
    shipping_options: [{ shipping_rate_data: { display_name: ({ es: "Envío", fr: "Livraison", it: "Spedizione", pt: "Envio" } as Record<string, string>)[order.locale] ?? "Envío", type: "fixed_amount", fixed_amount: { amount: order.shippingCents!, currency: "eur" } } }],
    success_url: `${origin}${prefix}/checkout/confirmacion?token=${token}`,
    cancel_url: `${origin}${prefix}/checkout?cancelled=1&token=${token}`,
    expires_at: Math.floor(order.expiresAt!.getTime() / 1000),
  };
}

export function createCheckoutService({ db, gateway, origin, encryptionSecret, now = () => new Date(), onStockChange }: { db: PrismaClient; gateway: CheckoutGateway; origin: string; encryptionSecret: string; now?: () => Date; onStockChange?: () => void }) {
  const stockChanges = new WeakSet<Prisma.TransactionClient>();
  async function transaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        let changed = false;
        const result = await db.$transaction(async tx => {
          const value = await work(tx);
          changed = stockChanges.has(tx);
          return value;
        }, { maxWait: 10000, timeout: 15000 });
        // Invalidate only committed stock changes, never ordinary order polls.
        // A cache outage must not turn a committed order into a failed payment.
        if (changed && onStockChange) {
          try { onStockChange(); }
          catch { console.error('[checkout] Public stock cache invalidation failed; TTL remains active.'); }
        }
        return result;
      }
      catch (error) {
        const code = (error as { code?: string }).code;
        if (attempt >= 2 || !["P2034", "P2028", "SQLITE_BUSY"].includes(code ?? "")) throw error;
        await new Promise(resolve => setTimeout(resolve, 30 * (attempt + 1)));
      }
    }
  }

  async function release(tx: Prisma.TransactionClient, order: Order, status: "EXPIRED" | "FAILED") {
    const updated = await tx.order.updateMany({ where: { id: order.id, status: "PENDING", stockReleased: false }, data: { status, stockReleased: true } });
    if (updated.count) {
      for (const item of orderItems(order)) await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      stockChanges.add(tx);
    }
  }

  async function allocateReleasedStock(tx: Prisma.TransactionClient, order: Order) {
    const items = orderItems(order);
    const available = await tx.product.findMany({ where: { id: { in: items.map(item => item.productId) } }, select: { id: true, stock: true } });
    if (items.some(item => (available.find(product => product.id === item.productId)?.stock ?? 0) < item.quantity)) return false;
    for (const item of items) {
      const reserved = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (reserved.count !== 1) throw Object.assign(new Error("Concurrent stock change"), { code: "P2034" });
      stockChanges.add(tx);
    }
    return true;
  }

  async function applySession(session: PaymentSession, event?: { id: string; type: string }) {
    if (session.metadata?.integration !== CHECKOUT_INTEGRATION) return;
    const orderId = session.metadata.orderId;
    if (!orderId || session.client_reference_id !== orderId || session.livemode !== gateway.liveMode) throw new CheckoutError("PAYMENT_MISMATCH", "No se ha podido verificar el pago.", 409);
    await transaction(async tx => {
      if (event && await tx.checkoutEvent.findUnique({ where: { id: event.id } })) return;
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order || !order.checkoutTokenHash) throw new CheckoutError("ORDER_NOT_FOUND", "Pedido no encontrado.", 404);
      if (order.stripeLiveMode !== gateway.liveMode) throw new CheckoutError("PAYMENT_MODE_MISMATCH", "El entorno de pago no coincide con el pedido.", 503);
      if (order.stripeSessionId && order.stripeSessionId !== session.id) throw new CheckoutError("PAYMENT_MISMATCH", "No se ha podido verificar el pago.", 409);
      if (session.currency?.toUpperCase() !== order.currency || session.amount_total !== order.totalCents) throw new CheckoutError("PAYMENT_MISMATCH", "El importe del pago no coincide con el pedido.", 409);
      if (session.payment_status === "paid" && (order.status !== "PAID" || order.stockIssue)) {
          const allocated = !order.stockReleased || await allocateReleasedStock(tx, order);
          // Payment truth is independent of inventory. A paid order needing stock stays
          // paid and is held for review, so the buyer cannot mistake it for a failed charge.
          await tx.order.update({ where: { id: order.id }, data: { status: "PAID", stockReleased: !allocated, stockIssue: !allocated, paidAt: order.paidAt ?? now(), stripeSessionId: session.id, stripeRef: session.id, stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null } });
      } else if (order.status !== "PAID") {
        if (session.status === "expired") {
          await release(tx, order, "EXPIRED");
        } else if (event?.type === "checkout.session.async_payment_failed" && session.status === "complete") {
          await release(tx, order, "FAILED");
        }
      }
      if (!order.stripeSessionId) await tx.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id, stripeRef: session.id } });
      if (event) await tx.checkoutEvent.create({ data: { id: event.id, type: event.type, orderId } });
    });
  }

  async function resolveSession(order: Order, recoverOrphan = false) {
    if (order.stripeLiveMode !== gateway.liveMode) throw new CheckoutError("PAYMENT_MODE_MISMATCH", "El entorno de pago no coincide con el pedido.", 503);
    if (order.stripeSessionId) return gateway.retrieveSession(order.stripeSessionId);
    if (recoverOrphan) {
      // Search before retrying: Stripe can prune an idempotency key after 24 hours.
      // A fully paginated authoritative lookup prevents releasing an old paid order.
      if (!gateway.findSession || !order.expiresAt) throw new CheckoutGatewayError(false);
      const recovered = await gateway.findSession(order.id, order.createdAt, order.expiresAt);
      if (recovered) return gateway.retrieveSession(recovered.id);
    }
    if (!order.stripeRequestEncrypted) throw new CheckoutGatewayError(false);
    const session = await gateway.createSession(decryptStripeRequest(order.stripeRequestEncrypted, encryptionSecret), `monkey-${order.id}`, recoverOrphan);
    // An idempotent POST can return its original cached response. Read current state.
    return gateway.retrieveSession(session.id);
  }

  async function reconcileExpiredReservations() {
    const expired = await db.order.findMany({ where: { status: "PENDING", stockReleased: false, checkoutTokenHash: { not: null }, expiresAt: { lte: now() } }, orderBy: [{ reconciliationCheckedAt: "asc" }, { expiresAt: "asc" }], take: 3 });
    const deadline = Date.now() + 12000;
    for (const order of expired) {
      if (Date.now() > deadline) break;
      // Rotate even on provider failures: a few delayed payment methods must not
      // prevent abandoned reservations later in the queue from being reconciled.
      await db.order.update({ where: { id: order.id }, data: { reconciliationCheckedAt: now() } });
      try { await applySession(await resolveSession(order, true)); }
      catch (error) {
        if (error instanceof CheckoutGatewayError && error.definitive) await transaction(async tx => { const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } }); await release(tx, current, "FAILED"); });
        // A provider outage or incomplete search must retain a potentially paid reservation.
      }
    }
  }

  async function quote(raw: CheckoutQuoteInput) {
    const input = checkoutQuoteSchema.parse(raw);
    await reconcileExpiredReservations();
    const products = await db.product.findMany({ where: { id: { in: input.items.map(item => item.productId) } }, include: { images: { orderBy: { order: "asc" }, take: 1 } } });
    return buildCheckoutQuote(input.items, products, input.country, input.postalCode);
  }

  async function create(raw: CheckoutCreateInput, userId?: string, reservationOwnerHash?: string) {
    const input = checkoutCreateSchema.parse(raw);
    const checkoutTokenHash = hash(input.checkoutToken);
    const requestHash = hash(JSON.stringify({ items: normalizedLines(input.items), customer: { ...input.customer, addressLine2: input.customer.addressLine2 || "" }, locale: input.locale, termsAccepted: true }));
    let order: Order;
    try {
      order = await transaction(async tx => {
        const existing = await tx.order.findUnique({ where: { checkoutTokenHash } });
        if (existing) return existing;
        if (reservationOwnerHash && await tx.order.count({ where: { reservationOwnerHash, status: "PENDING", stockReleased: false } }) >= 5) throw new CheckoutError("TOO_MANY_CHECKOUTS", "Hay varios pagos pendientes. Termina o cancela uno antes de iniciar otro.", 429);
        const products = await tx.product.findMany({ where: { id: { in: input.items.map(item => item.productId) } }, include: { images: { orderBy: { order: "asc" }, take: 1 } } });
        const priced = buildCheckoutQuote(input.items, products, input.customer.country, input.customer.postalCode);
        for (const item of priced.items) {
          const reserved = await tx.product.updateMany({ where: { id: item.productId, active: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
          if (reserved.count !== 1) throw new CheckoutError("INSUFFICIENT_STOCK", `No hay unidades suficientes de ${item.name}.`, 409, item.productId);
          stockChanges.add(tx);
        }
        const created = await tx.order.create({ data: {
          ...(userId ? { userId } : {}), ...input.customer, locale: input.locale, status: "PENDING", fulfillmentStatus: "UNFULFILLED",
          subtotalCents: priced.subtotalCents, shippingCents: priced.shippingCents, totalCents: priced.totalCents, currency: "EUR",
          total: priced.totalCents / 100, items: JSON.stringify(priced.items), checkoutTokenHash, requestHash, reservationOwnerHash, stripeLiveMode: gateway.liveMode,
          expiresAt: new Date(Math.floor(now().getTime() / 1000) * 1000 + 35 * 60 * 1000),
        } });
        return tx.order.update({ where: { id: created.id }, data: { stripeRequestEncrypted: encryptStripeRequest(buildStripeSessionParams(created, input.checkoutToken, origin), encryptionSecret) } });
      });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
      const existing = await db.order.findUnique({ where: { checkoutTokenHash } });
      if (!existing) throw error;
      order = existing;
    }
    if (order.requestHash !== requestHash) throw new CheckoutError("CHECKOUT_CHANGED", "Los datos han cambiado. Revisa el pedido e inicia un nuevo pago.", 409);
    if (order.status === "FAILED" || order.status === "EXPIRED") throw new CheckoutError("CHECKOUT_EXPIRED", "Este intento de pago ha terminado. Vuelve a revisar el carrito.", 409);
    if (order.status === "PAID") return { url: `${origin}${order.locale === "es" ? "" : `/${order.locale}`}/checkout/confirmacion?token=${input.checkoutToken}`, orderId: order.id };
    try {
      const session = await resolveSession(order, !!order.expiresAt && order.expiresAt <= now());
      await applySession(session);
      if (session.payment_status === "paid" || session.status === "complete") return { url: `${origin}${order.locale === "es" ? "" : `/${order.locale}`}/checkout/confirmacion?token=${input.checkoutToken}`, orderId: order.id };
      if (session.status === "expired" || !session.url) throw new CheckoutError("CHECKOUT_EXPIRED", "Este intento de pago ha caducado. Vuelve a revisar el carrito.", 409);
      return { url: session.url, orderId: order.id };
    } catch (error) {
      if (error instanceof CheckoutError) throw error;
      if (error instanceof CheckoutGatewayError && error.definitive) await transaction(async tx => { const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } }); await release(tx, current, "FAILED"); });
      throw new CheckoutError("PAYMENT_UNAVAILABLE", "No se ha podido abrir el pago. Puedes reintentarlo sin duplicar el pedido.", 503);
    }
  }

  async function findTokenOrder(token: string) {
    if (!checkoutTokenSchema.safeParse(token).success) throw new CheckoutError("ORDER_NOT_FOUND", "Pedido no encontrado.", 404);
    const order = await db.order.findUnique({ where: { checkoutTokenHash: hash(token) } });
    if (!order) throw new CheckoutError("ORDER_NOT_FOUND", "Pedido no encontrado.", 404);
    return order;
  }
  function publicStatus(order: Order): CheckoutStatusResult {
    return { orderId: order.id, status: order.status as CheckoutStatusResult["status"], paid: order.status === "PAID", createdAt: order.createdAt.toISOString(), items: orderItems(order), subtotalCents: order.subtotalCents!, shippingCents: order.shippingCents!, totalCents: order.totalCents!, currency: "EUR" };
  }
  async function status(token: string) {
    let order = await findTokenOrder(token);
    if (order.status === "PENDING" && order.stripeSessionId) {
      try { await applySession(await gateway.retrieveSession(order.stripeSessionId)); order = await db.order.findUniqueOrThrow({ where: { id: order.id } }); }
      catch { /* Remain pending rather than claim a payment failed during a transient outage. */ }
    }
    return publicStatus(order);
  }
  async function cancel(token: string) {
    const order = await findTokenOrder(token);
    if (order.status !== "PENDING") return publicStatus(order);
    let session: PaymentSession;
    try { session = await resolveSession(order, true); }
    catch (error) {
      if (!(error instanceof CheckoutGatewayError) || !error.definitive) throw error;
      await transaction(async tx => { const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } }); await release(tx, current, "FAILED"); });
      return publicStatus(await db.order.findUniqueOrThrow({ where: { id: order.id } }));
    }
    if (session.status === "open" && gateway.expireSession) session = await gateway.expireSession(session.id);
    await applySession(session);
    return publicStatus(await db.order.findUniqueOrThrow({ where: { id: order.id } }));
  }
  async function processEvent(event: CheckoutEventInput) {
    if (!eventTypes.has(event.type) || event.session.metadata?.integration !== CHECKOUT_INTEGRATION) return;
    if (await db.checkoutEvent.findUnique({ where: { id: event.id } })) return;
    await applySession(await gateway.retrieveSession(event.session.id), { id: event.id, type: event.type });
  }
  async function reconcileOrderStock(orderId: string) {
    return transaction(async tx => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new CheckoutError("ORDER_NOT_FOUND", "Pedido no encontrado.", 404);
      if (order.status !== "PAID") throw new CheckoutError("ORDER_NOT_PAID", "Sólo se puede asignar stock a un pedido pagado.", 409);
      if (!order.stockIssue) return { resolved: true };
      if (!await allocateReleasedStock(tx, order)) return { resolved: false };
      await tx.order.update({ where: { id: order.id }, data: { stockIssue: false, stockReleased: false } });
      return { resolved: true };
    });
  }
  return { quote, create, status, cancel, processEvent, reconcileExpiredReservations, reconcileOrderStock };
}
