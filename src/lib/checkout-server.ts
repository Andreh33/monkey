import { prisma } from "./prisma";
import { createCheckoutService } from "./checkout-service";
import { createStripeGateway } from "./stripe";
import { CheckoutError } from "./checkout";

export function getCheckoutService() {
  const rawOrigin = process.env.CHECKOUT_ORIGIN || process.env.NEXTAUTH_URL || "https://monopatinmonkey.com";
  const url = new URL(rawOrigin);
  const encryptionSecret = process.env.CHECKOUT_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!encryptionSecret) throw new CheckoutError("PAYMENT_NOT_CONFIGURED", "El pago no está disponible temporalmente.", 503);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") throw new CheckoutError("PAYMENT_NOT_CONFIGURED", "El pago no está disponible temporalmente.", 503);
  return createCheckoutService({ db: prisma, gateway: createStripeGateway(), origin: url.origin, encryptionSecret });
}
