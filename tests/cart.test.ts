import assert from "node:assert/strict";
import test from "node:test";
import { addCartItem, setCartQuantity, consumePurchasedItems, sanitizeCartItems, type CartItem } from "../src/lib/cart-logic";
import { purchaseEligible } from "../src/lib/purchase";
import { useCart } from "../src/lib/cart-store";
import { checkoutAttemptCanReset } from "../src/lib/checkout-client";

const item: CartItem = { id: "part", slug: "part", name: "Recambio", price: 12.5, quantity: 1, stock: 5 };
test("all active stocked products can enter checkout without a legacy payment link", () => {
  assert.equal(purchaseEligible({ active: true, stock: 5 }, true), true);
  assert.equal(purchaseEligible({ active: false, stock: 5 }, true), false);
  assert.equal(purchaseEligible({ active: true, stock: 0 }, true), false);
  assert.equal(purchaseEligible({ active: true, stock: 5 }, false), false);
});
test("cart merges quantities within stock and rejects invalid quantities", () => {
  assert.equal(addCartItem([item], item, 8)[0].quantity, 5);
  assert.equal(addCartItem([], item, Number.NaN).length, 0);
  assert.equal(addCartItem([], item, -1).length, 0);
  assert.equal(setCartQuantity([item], "part", 99)[0].quantity, 5);
  assert.equal(setCartQuantity([item], "part", 0).length, 0);
  const full = Array.from({ length: 50 }, (_, i) => ({ ...item, id: String(i) }));
  assert.equal(addCartItem(full, item).length, 50);
});
test("cart remains usable when browser storage is unavailable", () => {
  useCart.getState().clear();
  useCart.getState().addItem(item, 2);
  assert.equal(useCart.getState().items[0].quantity, 2);
  useCart.getState().clear();
});
test("old persisted cart lines are migrated without trusting unsafe values or payment links", () => {
  const lines = sanitizeCartItems([{ ...item, stripeLink: "https://old.example/pay", quantity: 3 }, { ...item, id: "bad", quantity: Infinity }]);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 3);
  assert.equal("stripeLink" in lines[0], false);
});
test("paid order removes only purchased quantities and can only be consumed once", () => {
  const first = consumePurchasedItems([{ ...item, quantity: 4 }, { ...item, id: "other", quantity: 2 }], [], "order-one", [{ productId: "part", quantity: 2 }]);
  assert.deepEqual(first.items.map(i => [i.id, i.quantity]), [["part", 2], ["other", 2]]);
  const second = consumePurchasedItems(first.items, first.completedOrders, "order-one", [{ productId: "part", quantity: 2 }]);
  assert.deepEqual(second, first);
});

test("checkout permits correcting rejected form data while keeping ambiguous payment retries idempotent", () => {
  for (const code of ["INVALID_REQUEST", "UNSUPPORTED_DESTINATION", "INSUFFICIENT_STOCK", "TOO_MANY_REQUESTS", "TOO_MANY_CHECKOUTS", "PAYMENT_NOT_CONFIGURED"]) {
    assert.equal(checkoutAttemptCanReset(code, false), true, "a rejected first request permits editing without cancelling a nonexistent order");
    assert.equal(checkoutAttemptCanReset(code, true), false, "a retry after an ambiguous response must retain its existing token");
  }
  for (const code of ["PAYMENT_UNAVAILABLE", "CHECKOUT_UNAVAILABLE", undefined]) assert.equal(checkoutAttemptCanReset(code, false), false);
  assert.equal(checkoutAttemptCanReset("CHECKOUT_EXPIRED", true), true);
});
