import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import ts from "typescript";
import { OrderAlertCursorError, readOrderAlertFeed } from "../src/lib/order-alert-feed";

const require = createRequire(import.meta.url);
const now = new Date("2026-11-07T16:00:00.000Z");
const at = (seconds: number) => new Date(now.getTime() + seconds * 1000);
const params = (cursor: string) => new URLSearchParams({ cursor });
const encoded = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

test("cursor validation rejects ambiguous, malformed and out-of-range queries before database reads", async () => {
  const db = { order: { findMany: () => assert.fail("Invalid cursors must not query orders") } } as any;
  for (const query of [
    new URLSearchParams("other=x"), new URLSearchParams("cursor=a&cursor=b"), params(""), params("not-json"),
    params("x".repeat(1025)), params(encoded({ v: 2, since: now.toISOString() })),
    params(encoded({ v: 1, since: "invalid" })),
    params(encoded({ v: 1, since: "2010-01-01T00:00:00.000Z" })),
    params(encoded({ v: 1, since: at(301).toISOString() })),
    params(encoded({ v: 1, since: now.toISOString(), until: at(10).toISOString() })),
    params(encoded({ v: 1, since: now.toISOString(), baseline: true })),
    params(encoded({ v: 1, since: now.toISOString(), until: at(10).toISOString(), after: { paidAt: at(11).toISOString(), id: "one" } })),
  ]) await assert.rejects(readOrderAlertFeed(db, query, now), OrderAlertCursorError);
});

test("SQLite feed seeds history, catches newly paid and late equal-time orders, and paginates a fixed baseline", async () => {
  const tempRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(path.join(tempRoot, "monkey-order-alert-test-"));
  const url = "file:" + path.join(directory, "test.db").replaceAll("\\", "/");
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    const schema = path.join(directory, "schema.prisma");
    writeFileSync(path.join(directory, "test.db"), "");
    copyFileSync("prisma/schema.prisma", schema);
    execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "db", "push", "--schema", schema, "--skip-generate"], {
      env: { ...process.env, DATABASE_URL: url }, stdio: "pipe", timeout: 30000,
    });
    const record = (id: string, paidAt: Date | null, status = "PAID") => ({
      id, paidAt, status, email: "private@example.test", phone: "+33600000000", addressLine1: "Private fixture address",
      total: 985, totalCents: 98500, currency: "EUR", items: "[]", country: "FR", createdAt: at(-86400),
    });
    await db.order.createMany({ data: [record("old", at(-86400)), record("recent", at(-10)), record("waiting", null, "PENDING"), record("failed", at(-1), "FAILED")] });
    const before = await db.order.findMany({ orderBy: { id: "asc" } });
    const initial = await readOrderAlertFeed(db, new URLSearchParams(), now);
    assert.equal(initial.baseline, true);
    assert.deepEqual(initial.orders.map(order => order.id), ["recent"]);
    assert.deepEqual(Object.keys(initial.orders[0]).sort(), ["currency", "id", "paidAt", "totalCents"]);
    assert.deepEqual(await db.order.findMany({ orderBy: { id: "asc" } }), before);

    // The order was created yesterday; the payment's timestamp drives its alert.
    await db.order.update({ where: { id: "waiting" }, data: { status: "PAID", paidAt: at(5) } });
    const next = await readOrderAlertFeed(db, params(initial.cursor), at(10));
    assert.equal(next.baseline, false);
    assert.deepEqual(next.orders.filter(order => !initial.orders.some(old => old.id === order.id)).map(order => order.id), ["waiting"]);
    assert.equal(next.orders.find(order => order.id === "waiting")?.totalCents, 98500);

    // A late commit can have both the same timestamp and a lower ID than a seen row.
    await db.order.create({ data: record("a-late-commit", at(5)) });
    const repeatedWindow = await readOrderAlertFeed(db, params(next.cursor), at(11));
    assert.ok(repeatedWindow.orders.some(order => order.id === "a-late-commit"));
    assert.deepEqual(repeatedWindow.orders.filter(order => order.paidAt === at(5).toISOString()).map(order => order.id), ["a-late-commit", "waiting"]);

    await db.order.createMany({ data: Array.from({ length: 55 }, (_, i) => record(`batch-${String(i).padStart(3, "0")}`, at(20))) });
    const baselineOne = await readOrderAlertFeed(db, new URLSearchParams(), at(25));
    assert.equal(baselineOne.baseline, true); assert.equal(baselineOne.hasMore, true); assert.equal(baselineOne.orders.length, 50);
    await db.order.create({ data: record("new-after-opening", at(26)) });
    const baselineTwo = await readOrderAlertFeed(db, params(baselineOne.cursor), at(27));
    assert.equal(baselineTwo.baseline, true); assert.equal(baselineTwo.hasMore, false);
    const seeded = [...baselineOne.orders, ...baselineTwo.orders];
    assert.equal(seeded.length, 57); assert.equal(new Set(seeded.map(order => order.id)).size, 57);
    assert.equal(seeded.some(order => order.id === "new-after-opening"), false);
    const pollOne = await readOrderAlertFeed(db, params(baselineTwo.cursor), at(28));
    const pollTwo = await readOrderAlertFeed(db, params(pollOne.cursor), at(29));
    assert.equal(pollOne.baseline, false); assert.equal(pollTwo.baseline, false);
    assert.equal(pollOne.hasMore, true); assert.equal(pollTwo.hasMore, false);
    const seen = new Set(seeded.map(order => order.id));
    const unseen = [...pollOne.orders, ...pollTwo.orders].filter(order => !seen.has(order.id));
    assert.deepEqual(unseen.map(order => order.id), ["new-after-opening"]);
  } finally {
    await db.$disconnect();
    const resolved = realpathSync(directory);
    if (path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("monkey-order-alert-test-")) rmSync(resolved, { recursive: true, force: true });
  }
});

function routeWith(role: string, response: unknown | Error) {
  let reads = 0;
  const dependencies: Record<string, unknown> = {
    "next-auth": { getServerSession: async () => role ? { user: { role } } : null },
    "@/lib/auth": { authOptions: {} }, "@/lib/prisma": { prisma: {} },
    "@/lib/order-alert-feed": { OrderAlertCursorError, readOrderAlertFeed: async () => {
      reads++; if (response instanceof Error) throw response; return response;
    } },
  };
  const code = ts.transpileModule(readFileSync("src/app/api/admin/pedidos/avisos/route.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)((name: string) => dependencies[name] ?? require(name), module, module.exports);
  return { route: module.exports, reads: () => reads };
}

test("alert endpoint is admin only and never caches private feed responses", async () => {
  const request = new Request("https://monkey.test/api/admin/pedidos/avisos");
  for (const role of ["", "CLIENT"]) {
    const { route, reads } = routeWith(role, {});
    const response = await route.GET(request);
    assert.equal(response.status, 403); assert.equal(reads(), 0);
    assert.match(response.headers.get("Cache-Control") ?? "", /no-store/);
  }
  const payload = { orders: [], cursor: "opaque", baseline: true, hasMore: false };
  const success = await routeWith("ADMIN", payload).route.GET(request);
  assert.equal(success.status, 200); assert.deepEqual(await success.json(), payload);
  assert.match(success.headers.get("Cache-Control") ?? "", /private, no-store/);
  assert.equal(success.headers.get("Vary"), "Cookie");
  assert.equal((await routeWith("ADMIN", new OrderAlertCursorError()).route.GET(request)).status, 400);
  const failed = await routeWith("ADMIN", new Error("database credentials must stay private")).route.GET(request);
  assert.equal(failed.status, 503);
  assert.doesNotMatch(JSON.stringify(await failed.json()), /credentials/);
});
