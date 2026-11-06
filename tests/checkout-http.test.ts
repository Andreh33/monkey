import assert from "node:assert/strict";
import test from "node:test";
import Stripe from "stripe";
import { readCheckoutJson } from "../src/lib/checkout-http";
import { verifyStripeEvent } from "../src/lib/stripe";
import { decryptStripeRequest, encryptStripeRequest } from "../src/lib/checkout-crypto";

test("checkout rejects cross-origin, missing-origin and oversized JSON requests", async () => {
  const request = (origin?: string, body = "{}") => new Request("https://shop.example.test/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body });
  await assert.rejects(readCheckoutJson(request("https://attacker.example")), (error: any) => error.status === 403);
  await assert.rejects(readCheckoutJson(request()), (error: any) => error.status === 403);
  await assert.rejects(readCheckoutJson(request("https://shop.example.test", "x".repeat(65000))), (error: any) => error.status === 413);
  assert.deepEqual(await readCheckoutJson(request("https://shop.example.test", '{"items":[]}')), { items: [] });
});

test("webhook signature verification rejects tampering, missing signature and stale timestamps", () => {
  const secret = "signature-test-only";
  const payload = JSON.stringify({ id: "evt_signature_test", object: "event", type: "checkout.session.completed", data: { object: { id: "cs_test_signature" } } });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(verifyStripeEvent(payload, header, secret).id, "evt_signature_test");
  assert.throws(() => verifyStripeEvent(payload.replace("cs_test_signature", "cs_tampered"), header, secret));
  assert.throws(() => verifyStripeEvent(payload, "", secret));
  const stale = Stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: Math.floor(Date.now() / 1000) - 600 });
  assert.throws(() => verifyStripeEvent(payload, stale, secret));
});

test("persisted recovery parameters encrypt the bearer token and reject a different key or altered ciphertext", () => {
  const params = { mode: "payment" as const, success_url: "https://shop.example.test/checkout/confirmacion?token=" + "e".repeat(64) };
  const encrypted = encryptStripeRequest(params, "fixture-encryption-key");
  assert.equal(encrypted.includes("e".repeat(64)), false);
  assert.deepEqual(decryptStripeRequest(encrypted, "fixture-encryption-key"), params);
  assert.throws(() => decryptStripeRequest(encrypted, "wrong-key"));
  const pieces = encrypted.split("."); pieces[3] = (pieces[3][0] === "A" ? "B" : "A") + pieces[3].slice(1);
  assert.throws(() => decryptStripeRequest(pieces.join("."), "fixture-encryption-key"));
});
