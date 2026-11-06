import { z } from "zod";
import type { CheckoutCountry, CheckoutLineInput, CheckoutQuote } from "./checkout-types";
import { CHECKOUT_COUNTRIES } from "./checkout-types";
export { CHECKOUT_COUNTRIES } from "./checkout-types";

export const checkoutTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
const countrySchema = z.enum(CHECKOUT_COUNTRIES);
const lineSchema = z.object({ productId: z.string().min(1).max(160), quantity: z.number().int().min(1).max(99) }).strict();
export const checkoutQuoteSchema = z.object({ items: z.array(lineSchema).min(1).max(50), country: countrySchema, postalCode: z.string().trim().max(20).optional() }).strict();
export const checkoutCustomerSchema = z.object({
  firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30).regex(/^[+\d\s().-]+$/).refine(value => value.replace(/\D/g, "").length >= 7),
  addressLine1: z.string().trim().min(3).max(200), addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100), region: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20), country: countrySchema,
}).strict().superRefine((customer, context) => {
  const valid = customer.country === "PT" ? /^\d{4}-?\d{3}$/.test(customer.postalCode) : ["ES", "FR", "IT"].includes(customer.country) ? /^\d{5}$/.test(customer.postalCode) : true;
  if (!valid) context.addIssue({ code: z.ZodIssueCode.custom, path: ["postalCode"], message: "Revisa el código postal del país seleccionado." });
});
export const checkoutCreateSchema = z.object({
  items: z.array(lineSchema).min(1).max(50), customer: checkoutCustomerSchema,
  checkoutToken: checkoutTokenSchema, termsAccepted: z.literal(true), locale: z.enum(["es", "fr", "it", "pt"]),
}).strict();

export class CheckoutError extends Error {
  allowedCountries?: CheckoutCountry[];
  constructor(public code: string, message: string, public status = 400, public productId?: string) { super(message); this.name = "CheckoutError"; }
}

export type CheckoutCatalogProduct = {
  id: string; slug: string; name: string; price: number; currency: string; shippingCost: number | null;
  active: boolean; stock: number; images: { url: string }[]; shippingCountries?: string | null;
};

export function normalizedLines(items: CheckoutLineInput[]): CheckoutLineInput[] {
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  return [...quantities].sort(([a], [b]) => a.localeCompare(b)).map(([productId, quantity]) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new CheckoutError("INVALID_QUANTITY", "Revisa la cantidad de cada producto.", 400, productId);
    return { productId, quantity };
  });
}

export function moneyToCents(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 999999.99) throw new CheckoutError("INVALID_CATALOG_PRICE", "El precio de un producto necesita revisión.", 409);
  return Math.round((value + Number.EPSILON) * 100);
}

export function buildCheckoutQuote(items: CheckoutLineInput[], products: CheckoutCatalogProduct[], country: CheckoutCountry, _postalCode?: string): CheckoutQuote {
  if (!CHECKOUT_COUNTRIES.includes(country)) throw new CheckoutError("UNSUPPORTED_DESTINATION", "No está disponible el envío al país seleccionado.");
  if (!items.length || items.length > 50) throw new CheckoutError("INVALID_CART", "El carrito debe contener entre 1 y 50 productos.");
  const byId = new Map(products.map(product => [product.id, product]));
  let allowedCountries: CheckoutCountry[] = [...CHECKOUT_COUNTRIES];
  const lines = normalizedLines(items).map(({ productId, quantity }) => {
    const product = byId.get(productId);
    if (!product || !product.active || product.currency.toUpperCase() !== "EUR" || !product.images.length) throw new CheckoutError("PRODUCT_UNAVAILABLE", "Uno de los productos ya no está disponible.", 409, productId);
    let destinations: CheckoutCountry[] = ["ES"];
    if (product.shippingCountries) {
      try { destinations = z.array(countrySchema).min(1).parse(JSON.parse(product.shippingCountries)); }
      catch { throw new CheckoutError("INVALID_SHIPPING_CONFIGURATION", "Las condiciones de envío de un producto necesitan revisión.", 409, productId); }
    }
    allowedCountries = allowedCountries.filter(value => destinations.includes(value));
    if (product.stock < quantity) throw new CheckoutError("INSUFFICIENT_STOCK", `No hay unidades suficientes de ${product.name}.`, 409, productId);
    const unitPriceCents = moneyToCents(product.price);
    if (unitPriceCents <= 0) throw new CheckoutError("INVALID_CATALOG_PRICE", "El precio de un producto necesita revisión.", 409, productId);
    return { productId, name: product.name, slug: product.slug, quantity, unitPriceCents, lineTotalCents: unitPriceCents * quantity, shippingUnitCents: moneyToCents(product.shippingCost ?? 0), stock: product.stock, image: product.images[0]?.url };
  });
  if (!allowedCountries.includes(country)) {
    const error = new CheckoutError("UNSUPPORTED_DESTINATION", "No todos los productos del carrito admiten envío al país seleccionado.");
    error.allowedCountries = allowedCountries;
    throw error;
  }
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const shippingCents = lines.reduce((sum, line) => sum + line.shippingUnitCents * line.quantity, 0);
  const totalCents = subtotalCents + shippingCents;
  if (!Number.isSafeInteger(totalCents) || totalCents > 99999999) throw new CheckoutError("AMOUNT_TOO_LARGE", "El total supera el importe permitido para una compra.");
  if (totalCents < 50) throw new CheckoutError("MINIMUM_AMOUNT", "El importe mínimo de compra es 0,50 €.");
  return { items: lines, subtotalCents, shippingCents, totalCents, currency: "EUR", allowedCountries };
}
