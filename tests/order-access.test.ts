import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function page(kind: "admin" | "customer" | "customer-list" | "account", user: { id?: string; role?: string } | null) {
  const order = { id: "private-order", userId: "owner", status: "PAID", fulfillmentStatus: "UNFULFILLED", createdAt: new Date(), paidAt: null, stripePaymentIntentId: null };
  const dependencies: Record<string, unknown> = {
    "next-auth": { getServerSession: async () => user ? { user } : null },
    "next/navigation": { redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); }, notFound: () => { throw new Error("NOT_FOUND"); } },
    "@/lib/auth": { authOptions: {} },
    "@/lib/prisma": { prisma: { order: {
      findUnique: async () => order,
      findFirst: async ({ where }: any) => where.id === order.id && where.userId === order.userId ? order : null,
      findMany: async ({ where }: any) => { assert.equal(where.userId, "owner", "Orders must always be scoped to a known authenticated user"); return []; },
      count: async ({ where }: any) => { assert.equal(where.userId, "owner"); return 0; },
    }, address: { count: async ({ where }: any) => { assert.equal(where.userId, "owner"); return 0; } } } },
    "@/lib/order-display": require("../src/lib/order-display"),
    "@/components/admin/OrderStatusSelect": { OrderStatusSelect: () => null },
    "@/components/admin/OrderWhatsAppLink": { OrderWhatsAppLink: () => null },
    "@/components/orders/OrderDetails": { OrderDetails: () => null },
    "next/link": { __esModule: true, default: () => null },
  };
  const path = kind === "admin" ? "src/app/(es)/admin/(panel)/pedidos/[id]/page.tsx" : kind === "customer-list" ? "src/app/(es)/cuenta/pedidos/page.tsx" : kind === "account" ? "src/app/(es)/cuenta/page.tsx" : "src/app/(es)/cuenta/pedidos/[id]/page.tsx";
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)((name: string) => dependencies[name] ?? require(name), module, module.exports);
  return module.exports.default;
}
const params = { params: { id: "private-order" } };
test("admin order detail redirects anonymous users and customer accounts before rendering private data", async () => {
  for (const user of [null, { id: "customer", role: "CLIENT" }]) await assert.rejects(page("admin", user)(params), /REDIRECT:\/admin\/login/);
});

test("customer order lists and counters reject incomplete sessions before database queries", async () => {
  for (const kind of ["customer-list", "account"] as const) {
    for (const user of [null, { role: "CLIENT" }]) await assert.rejects(page(kind, user)(), /REDIRECT:\/login/);
    assert.ok(await page(kind, { id: "owner", role: "CLIENT" })());
  }
});
test("customer order detail cannot be opened by another account or an incomplete session", async () => {
  await assert.rejects(page("customer", null)(params), /REDIRECT:\/login/);
  await assert.rejects(page("customer", { role: "CLIENT" })(params), /REDIRECT:\/login/);
  await assert.rejects(page("customer", { id: "someone-else", role: "CLIENT" })(params), /NOT_FOUND/);
  assert.ok(await page("customer", { id: "owner", role: "CLIENT" })(params));
});
