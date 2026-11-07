import assert from "node:assert/strict";
import test from "node:test";
import { collectNewOrderAlerts } from "../src/lib/order-alert-state";

const order = (id: string) => ({ id, totalCents: 98500, currency: "EUR", paidAt: "2026-11-07T16:00:00.000Z" });
test("historical baseline is silent, but a newly confirmed order alerts once across overlapping pages", () => {
  const seen = new Set<string>();
  assert.deepEqual(collectNewOrderAlerts(seen, [order("old")], true), []);
  assert.deepEqual(collectNewOrderAlerts(seen, [order("old"), order("new")], false), [order("new")]);
  assert.deepEqual(collectNewOrderAlerts(seen, [order("new"), order("new")], false), []);
  assert.deepEqual(collectNewOrderAlerts(seen, [order("new"), order("second")], false), [order("second")]);
});
test("baseline pages do not prevent later new payments with identical timestamps from alerting", () => {
  const seen = new Set<string>();
  collectNewOrderAlerts(seen, [order("z-existing")], true);
  collectNewOrderAlerts(seen, [order("y-existing")], true);
  assert.deepEqual(collectNewOrderAlerts(seen, [order("a-new"), order("y-existing")], false), [order("a-new")]);
});
