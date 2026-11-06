import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const code = ts.transpileModule(readFileSync("src/lib/order-whatsapp.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const module = { exports: {} as any };
new Function("require", "module", "exports", code)((name: string) => name === "server-only" ? {} : require(name), module, module.exports);
const { orderWhatsAppUrl } = module.exports;
const order = { id: "order-123", firstName: "Ana", phone: "612 345 678", country: "ES" };

test("WhatsApp uses validated national numbers for ES, PT and FR and legacy Spain", () => {
  for (const [phone, country, expected] of [
    ["612 345 678", "ES", "34612345678"],
    ["912 345 678", "PT", "351912345678"],
    ["06 12 34 56 78", "FR", "33612345678"],
    ["612345678", null, "34612345678"],
  ]) {
    const url = new URL(orderWhatsAppUrl({ ...order, phone, country }));
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, `/${expected}`);
    assert.equal(url.searchParams.get("text"), "Hola Ana, soy Angy de Monkey. Te escribo sobre tu pedido order-123.");
  }
});

test("explicit international prefixes override the delivery country without changing the recipient", () => {
  for (const phone of ["+351 912 345 678", "00351 912 345 678", "00 351 912-345-678"]) {
    assert.equal(new URL(orderWhatsAppUrl({ ...order, phone })).pathname, "/351912345678");
  }
  assert.equal(new URL(orderWhatsAppUrl({ ...order, phone: "+33 6 12 34 56 78", country: "PT" })).pathname, "/33612345678");
});

test("missing, invalid, extracted, extended and ambiguous phone values never create a chat link", () => {
  for (const phone of [null, "", "123", "000000000", "+000612345678", "34612345678", "Tel: 612345678", "612345678 ext 2", "612345678/698765432", "+34612345678 +351912345678", "+34612345678?text=unexpected", "++34612345678"]) {
    assert.equal(orderWhatsAppUrl({ ...order, phone }), null, String(phone));
  }
  assert.equal(orderWhatsAppUrl({ ...order, country: "ZZ" }), null);
  assert.equal(orderWhatsAppUrl({ ...order, phone: "0612345678", country: "PT" }), null);
});

test("the prepared message escapes customer text and handles historical orders without a name", () => {
  const name = "Ana & Luís #1";
  const url = new URL(orderWhatsAppUrl({ ...order, firstName: name }));
  assert.equal(url.searchParams.get("text"), `Hola ${name}, soy Angy de Monkey. Te escribo sobre tu pedido order-123.`);
  assert.equal(url.hash, "");
  assert.equal(new URL(orderWhatsAppUrl({ ...order, firstName: null })).searchParams.get("text"), "Hola, soy Angy de Monkey. Te escribo sobre tu pedido order-123.");
});

test("admin WhatsApp action opens a separate protected tab and disappears for invalid recipients", () => {
  const componentCode = ts.transpileModule(readFileSync("src/components/admin/OrderWhatsAppLink.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const component = { exports: {} as any };
  new Function("require", "module", "exports", componentCode)((name: string) => name === "@/lib/order-whatsapp" ? module.exports : require(name), component, component.exports);
  const link = component.exports.OrderWhatsAppLink({ order });
  assert.equal(link.type, "a");
  assert.equal(link.props.href, orderWhatsAppUrl(order));
  assert.equal(link.props.target, "_blank");
  assert.equal(link.props.rel, "noopener noreferrer");
  assert.equal(link.props.onClick, undefined);
  assert.equal(component.exports.OrderWhatsAppLink({ order: { ...order, phone: null } }), null);
});
