import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type Stripe from "stripe";

const context = Buffer.from("monkey-checkout-stripe-params-v1");
const keyFor = (secret: string) => createHash("sha256").update(context).update(secret).digest();

export function encryptStripeRequest(params: Stripe.Checkout.SessionCreateParams, secret: string): string {
  if (!secret) throw new Error("Checkout encryption is not configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFor(secret), iv);
  cipher.setAAD(context);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(params), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptStripeRequest(encrypted: string, secret: string): Stripe.Checkout.SessionCreateParams {
  const [version, iv, tag, body, extra] = encrypted.split(".");
  if (!secret || version !== "v1" || !iv || !tag || !body || extra) throw new Error("Invalid encrypted checkout request");
  const decipher = createDecipheriv("aes-256-gcm", keyFor(secret), Buffer.from(iv, "base64url"));
  decipher.setAAD(context); decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8"));
}
