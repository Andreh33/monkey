import assert from "node:assert/strict";
import test from "node:test";
import { orderItems, orderTotalCents, fulfillmentValue, paymentLabel } from "../src/lib/order-display";

test("order totals prefer the immutable cents snapshot and preserve historical euro totals", () => {
  assert.equal(orderTotalCents({ totalCents: 1299, total: 999 }), 1299);
  assert.equal(orderTotalCents({ totalCents: null, total: 19.98 }), 1998);
});
test("saved line items retain names and historic prices after catalog changes", () => {
  assert.deepEqual(orderItems(JSON.stringify([{ productId: "p1", name: "Item", quantity: 2, unitPriceCents: 1100, lineTotalCents: 2200 }])), [{ productId: "p1", name: "Item", quantity: 2, unitPriceCents: 1100, lineTotalCents: 2200 }]);
  assert.equal(orderItems(JSON.stringify([{ id: "old", name: "Legacy item", quantity: 2, price: 4.95 }]))[0].lineTotalCents, 990);
  assert.deepEqual(orderItems("not-json"), []);
});
test("legacy shipment states remain readable without exposing them as unpaid", () => {
  assert.equal(paymentLabel("SHIPPED"), "Pagado");
  assert.equal(fulfillmentValue({ status: "SHIPPED", fulfillmentStatus: "UNFULFILLED" }), "SHIPPED");
  assert.equal(fulfillmentValue({ status: "PAID", fulfillmentStatus: "PREPARING" }), "PREPARING");
});
