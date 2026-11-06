import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function loadTree() {
  const categories = [
    { id: "vehicles", slug: "vehiculos", name: "Vehículos", order: 0, subcategories: [
      { id: "s1", slug: "shared", name: "Public models", order: 0 },
      { id: "s2", slug: "draft-models", name: "Draft models", order: 1 },
    ] },
    { id: "parts", slug: "recambios-nuevos", name: "Recambios nuevos", order: 1, subcategories: [
      { id: "s3", slug: "shared", name: "Draft parts", order: 0 },
    ] },
  ];
  const products = [
    { category: "vehiculos", subcategory: "shared", active: true, stock: 0 },
    { category: "vehiculos", subcategory: "draft-models", active: false, stock: 5 },
    { category: "recambios-nuevos", subcategory: "shared", active: false, stock: 5 },
  ];
  const prisma = {
    category: { findMany: async () => categories },
    product: { findMany: async ({ where }: any) => products.filter(p => !where?.active || p.active) },
  };
  const code = ts.transpileModule(readFileSync("src/lib/categories.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as any };
  new Function("require", "module", "exports", code)(() => ({ prisma }), module, module.exports);
  return module.exports.getCategoryTree;
}

test("public categories omit draft-only groups and subgroups while retaining sold-out active products", async () => {
  const tree = await loadTree()({ onlyWithActiveProducts: true });
  assert.deepEqual(tree.map((c: any) => c.slug), ["vehiculos"]);
  assert.deepEqual(tree[0].subcategories.map((s: any) => s.slug), ["shared"]);
});

test("administrators retain the complete category tree for editing drafts", async () => {
  const tree = await loadTree()();
  assert.equal(tree.length, 2);
  assert.equal(tree[0].subcategories.length, 2);
  assert.equal(tree[1].subcategories.length, 1);
});
