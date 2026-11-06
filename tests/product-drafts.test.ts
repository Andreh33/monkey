import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const active = { id: "live", active: true, name: "Live product", images: [] };
const draft = { id: "draft", active: false, name: "Draft product", images: [] };

// Execute the actual route handlers, replacing only external auth/database I/O.
function route(single: boolean, role?: string, invalidations: string[] = []) {
  const path = single ? "src/app/api/productos/[id]/route.ts" : "src/app/api/productos/route.ts";
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const prisma = {
    product: {
      findMany: async ({ where }: any) => [active, draft].filter(p => !where?.active || p.active),
      findUnique: async ({ where }: any) => [active, draft].find(p => p.id === where.id) ?? null,
      create: async ({ data }: any) => ({ id: "created", ...data }),
      update: async ({ data }: any) => ({ id: "draft", ...data }),
      delete: async () => draft,
    },
    productImage: { deleteMany: async () => ({ count: 0 }) },
  };
  const dependencies: Record<string, unknown> = {
    "next-auth": { getServerSession: async () => role ? { user: { role } } : null },
    "@/lib/auth": { authOptions: {} },
    "@/lib/prisma": { prisma },
    "@/lib/catalog-cache": { revalidateCatalog: () => invalidations.push("catalog") },
    "@/lib/utils": { slugify: (s: string) => s.toLowerCase().replaceAll(" ", "-") },
  };
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)(
    (name: string) => dependencies[name] ?? require(name), module, module.exports,
  );
  return module.exports;
}

const payload = {
  name: "Draft product", shortDesc: "Draft summary", description: "Draft description",
  price: 110, stock: 0, category: "recambio", stripeLink: "", active: false, featured: false, images: [],
};
const request = (data: unknown, method = "POST") => new Request("https://example.test/api/productos", {
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
});

test("anonymous and customer product lists exclude drafts", async () => {
  for (const role of [undefined, "CLIENT"]) {
    const response = await route(false, role).GET();
    assert.deepEqual((await response.json()).map((p: any) => p.id), ["live"]);
  }
});

test("anonymous and customer requests cannot retrieve a draft by ID", async () => {
  for (const role of [undefined, "CLIENT"]) {
    const response = await route(true, role).GET(new Request("https://example.test"), { params: { id: "draft" } });
    assert.equal(response.status, 404);
  }
});

test("administrators can read drafts without shareable response caching", async () => {
  const list = await route(false, "ADMIN").GET();
  assert.deepEqual((await list.json()).map((p: any) => p.id), ["live", "draft"]);
  assert.match(list.headers.get("Cache-Control") ?? "", /no-store/);
  const one = await route(true, "ADMIN").GET(new Request("https://example.test"), { params: { id: "draft" } });
  assert.equal((await one.json()).id, "draft");
  assert.match(one.headers.get("Cache-Control") ?? "", /no-store/);
});

test("public active products remain available by ID", async () => {
  const response = await route(true).GET(new Request("https://example.test"), { params: { id: "live" } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, "live");
});

test("administrators can create and edit drafts before a payment link exists", async () => {
  const created = await route(false, "ADMIN").POST(request(payload));
  assert.equal(created.status, 200);
  assert.equal((await created.json()).stripeLink, "");
  const edited = await route(true, "ADMIN").PATCH(request(payload, "PATCH"), { params: { id: "draft" } });
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).active, false);
});

test("creating or activating a product uses the admin price without requiring a payment URL", async () => {
  const created = await route(false, "ADMIN").POST(request({ ...payload, active: true }));
  assert.equal(created.status, 200);
  assert.equal((await created.json()).price, 110);
  const edited = await route(true, "ADMIN").PATCH(request({ ...payload, active: true }, "PATCH"), { params: { id: "draft" } });
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).stripeLink, "");
});

test("drafts reject malformed nonempty payment URLs and unauthorized writes", async () => {
  assert.equal((await route(false, "ADMIN").POST(request({ ...payload, stripeLink: "not-a-url" }))).status, 400);
  assert.equal((await route(false).POST(request(payload))).status, 403);
  assert.equal((await route(true, "CLIENT").PATCH(request(payload, "PATCH"), { params: { id: "draft" } })).status, 403);
});

test("product mutations invalidate public catalog only after an authorized successful write", async () => {
  const invalidations: string[] = [];
  const create = route(false, "ADMIN", invalidations);
  const edit = route(true, "ADMIN", invalidations);
  assert.equal((await create.POST(request({ ...payload, price: -1 }))).status, 400);
  assert.equal((await route(false, undefined, invalidations).POST(request(payload))).status, 403);
  assert.deepEqual(invalidations, []);
  assert.equal((await create.POST(request(payload))).status, 200);
  assert.equal((await edit.PATCH(request({ ...payload, price: 125 }, "PATCH"), { params: { id: "draft" } })).status, 200);
  assert.equal((await edit.DELETE(new Request("https://example.test/api/productos/draft", { method: "DELETE" }), { params: { id: "draft" } })).status, 200);
  assert.equal(invalidations.length, 3);
});

test("catalog invalidation matches Next 14 route-group tags in every locale without purging admin layouts", () => {
  const paths: [string, string | undefined][] = [];
  const code = ts.transpileModule(readFileSync("src/lib/catalog-cache.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)((name: string) => name === "next/cache" ? { revalidatePath: (path: string, type?: string) => paths.push([path, type]) } : require("../src/lib/storefront-routes"), module, module.exports);
  module.exports.revalidateCatalog();
  const { addImplicitTags } = require("next/dist/server/lib/patch-fetch");
  const invalidated = paths.map(([path, type]) => "_N_T_" + path + (type ? "/" + type : ""));
  for (const locale of ["es", "fr", "it", "pt"]) {
    const prefix = locale === "es" ? "" : "/" + locale;
    const group = locale === "es" ? "/(es)" : "/(international)/[locale]/(pages)";
    for (const suffix of ["/tienda/page", "/tienda/[slug]/page", "/page"]) {
      const urlPathname = suffix === "/page" ? prefix || "/" : prefix + (suffix.includes("[slug]") ? "/tienda/producto" : "/tienda");
      const tags: string[] = addImplicitTags({ pagePath: group + suffix, urlPathname });
      assert.ok(tags.some(tag => invalidated.includes(tag)), `${locale} ${suffix} must refresh`);
    }
  }
  const adminTags: string[] = addImplicitTags({ pagePath: "/(es)/admin/(panel)/productos/page", urlPathname: "/admin/productos" });
  assert.equal(adminTags.some(tag => invalidated.includes(tag)), false);
  assert.ok(paths.some(([path]) => path === "/sitemap.xml"));
});
