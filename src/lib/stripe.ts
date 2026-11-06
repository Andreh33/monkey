import Stripe from "stripe";
import { CheckoutError } from "./checkout";
import { CHECKOUT_INTEGRATION, CheckoutGatewayError, type CheckoutGateway, type PaymentSession } from "./checkout-service";

export const STRIPE_API_VERSION = "2026-10-28.endive" as const;

export function createStripeGateway(): CheckoutGateway {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^(?:sk|rk)_(?:live|test)_/.test(key)) throw new CheckoutError("PAYMENT_NOT_CONFIGURED", "El pago no está disponible temporalmente.", 503);
  const stripe = new Stripe(key, { apiVersion: STRIPE_API_VERSION, maxNetworkRetries: 2, timeout: 12000 });
  const convert = (session: Stripe.Checkout.Session): PaymentSession => ({ id: session.id, url: session.url, status: session.status, payment_status: session.payment_status, currency: session.currency, amount_total: session.amount_total, client_reference_id: session.client_reference_id, metadata: session.metadata, payment_intent: session.payment_intent, livemode: session.livemode });
  return {
    liveMode: key.includes("_live_"),
    async createSession(params, idempotencyKey, recovery = false) {
      try { return convert(await stripe.checkout.sessions.create(params, { idempotencyKey, ...(recovery ? { timeout: 4000, maxNetworkRetries: 0 } : {}) })); }
      catch (error) {
        const stripeError = error as { type?: string; statusCode?: number };
        throw new CheckoutGatewayError(stripeError.type === "StripeInvalidRequestError" && stripeError.statusCode === 400);
      }
    },
    async retrieveSession(id) { return convert(await stripe.checkout.sessions.retrieve(id, {}, { timeout: 4000, maxNetworkRetries: 0 })); },
    async expireSession(id) { return convert(await stripe.checkout.sessions.expire(id)); },
    async findSession(orderId, createdAt, expiresAt) {
      let inspected = 0;
      const deadline = Date.now() + 8000;
      for await (const session of stripe.checkout.sessions.list({ limit: 100, created: { gte: Math.floor(createdAt.getTime() / 1000) - 60, lte: Math.ceil(expiresAt.getTime() / 1000) } }, { timeout: 4000, maxNetworkRetries: 0 })) {
        if (session.client_reference_id === orderId && session.metadata?.orderId === orderId && session.metadata?.integration === CHECKOUT_INTEGRATION) return convert(session);
        if (++inspected >= 2000 || Date.now() > deadline) throw new CheckoutGatewayError(false);
      }
      return null;
    },
  };
}

export function verifyStripeEvent(payload: string, signature: string, secret: string): Stripe.Event {
  return Stripe.webhooks.constructEvent(payload, signature, secret);
}
