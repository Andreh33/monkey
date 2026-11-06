import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadRoute(role = "ADMIN", payment = "PAID", stockIssue = false, stockAvailable = false) {
  const record = { id: "order-1", status: payment, fulfillmentStatus: "UNFULFILLED", stockIssue, email: "private@example.test" };
  const prisma = { order: {
    findUnique: async () => ({ ...record }),
    update: async ({ data }: any) => Object.assign(record, data),
    updateMany: async ({ where, data }: any) => {
      const statuses = where.status?.in ?? [where.status];
      if (!statuses.includes(record.status) || (where.stockIssue !== undefined && where.stockIssue !== record.stockIssue)) return { count: 0 };
      Object.assign(record, data); return { count: 1 };
    },
  } };
  const deps: Record<string, unknown> = {
    "next-auth": { getServerSession: async () => role ? { user: { role } } : null },
    "@/lib/auth": { authOptions: {} }, "@/lib/prisma": { prisma },
    "@/lib/checkout-server": { getCheckoutService: () => ({ reconcileOrderStock: async () => {
      if (stockAvailable) record.stockIssue = false;
      return { resolved: !record.stockIssue };
    } }) },
  };
  const code = ts.transpileModule(readFileSync("src/app/api/pedidos/[id]/route.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)((name: string) => deps[name] ?? require(name), module, module.exports);
  return { route: module.exports, record };
}
const req = (body: unknown, origin = "https://monkey.test") => new Request("https://monkey.test/api/pedidos/order-1", { method: "PATCH", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
const context = { params: { id: "order-1" } };

test("only administrators can update order logistics", async () => {
  for (const role of ["", "CLIENT"]) assert.equal((await loadRoute(role).route.PATCH(req({ fulfillmentStatus: "SHIPPED" }), context)).status, 403);
});
test("payment cannot be marked paid manually or changed alongside fulfillment", async () => {
  for (const body of [{ status: "PAID" }, { status: "PAID", fulfillmentStatus: "SHIPPED" }]) {
    const { route, record } = loadRoute("ADMIN", "PENDING");
    assert.equal((await route.PATCH(req(body), context)).status, 400);
    assert.equal(record.status, "PENDING");
  }
});
test("unpaid and expired orders cannot be prepared or shipped", async () => {
  for (const state of ["PENDING", "FAILED", "EXPIRED"]) {
    const { route, record } = loadRoute("ADMIN", state);
    assert.equal((await route.PATCH(req({ fulfillmentStatus: "SHIPPED" }), context)).status, 409);
    assert.equal(record.fulfillmentStatus, "UNFULFILLED");
  }
});
test("paid logistics update keeps financial state and returns no private customer data", async () => {
  const { route, record } = loadRoute();
  const response = await route.PATCH(req({ fulfillmentStatus: "SHIPPED" }), context);
  assert.equal(response.status, 200);
  assert.equal(record.status, "PAID");
  assert.equal(record.fulfillmentStatus, "SHIPPED");
  assert.equal((await response.json()).email, undefined);
  assert.match(response.headers.get("Cache-Control") ?? "", /no-store/);
});
test("foreign origins and unknown logistics states are rejected", async () => {
  assert.equal((await loadRoute().route.PATCH(req({ fulfillmentStatus: "SHIPPED" }, "https://foreign.test"), context)).status, 403);
  assert.equal((await loadRoute().route.PATCH(req({ fulfillmentStatus: "REFUNDED" }), context)).status, 400);
});

test("paid orders with unresolved stock cannot be prepared until stock retry succeeds", async () => {
  const blocked = loadRoute("ADMIN", "PAID", true);
  assert.equal((await blocked.route.PATCH(req({ fulfillmentStatus: "SHIPPED" }), context)).status, 409);
  assert.equal((await blocked.route.PATCH(req({ retryStock: true }), context)).status, 409);
  assert.equal(blocked.record.status, "PAID");
  assert.equal(blocked.record.fulfillmentStatus, "UNFULFILLED");
  const replenished = loadRoute("ADMIN", "PAID", true, true);
  const resolved = await replenished.route.PATCH(req({ retryStock: true }), context);
  assert.equal(resolved.status, 200);
  assert.deepEqual(await resolved.json(), { ok: true, stockIssue: false });
  assert.equal((await replenished.route.PATCH(req({ fulfillmentStatus: "PREPARING" }), context)).status, 200);
  assert.equal(replenished.record.status, "PAID");
});

test("stock recovery remains admin only and cannot turn unpaid orders into paid orders", async () => {
  for (const role of ["", "CLIENT"]) assert.equal((await loadRoute(role).route.PATCH(req({ retryStock: true }), context)).status, 403);
  const unpaid = loadRoute("ADMIN", "PENDING", true, true);
  assert.equal((await unpaid.route.PATCH(req({ retryStock: true }), context)).status, 409);
  assert.equal(unpaid.record.status, "PENDING");
  assert.equal((await loadRoute().route.PATCH(req({ retryStock: true, fulfillmentStatus: "SHIPPED" }), context)).status, 400);
});

test("editing historical logistics normalizes the already paid financial state", async () => {
  for (const state of ["SHIPPED", "DELIVERED"]) {
    const { route, record } = loadRoute("ADMIN", state);
    assert.equal((await route.PATCH(req({ fulfillmentStatus: "UNFULFILLED" }), context)).status, 200);
    assert.equal(record.status, "PAID");
    assert.equal(record.fulfillmentStatus, "UNFULFILLED");
  }
});
