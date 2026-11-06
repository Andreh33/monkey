import { z } from "zod";
import { CHECKOUT_COUNTRIES } from "./checkout-types";

const countryListSchema = z.array(z.enum(CHECKOUT_COUNTRIES)).min(1).max(CHECKOUT_COUNTRIES.length).refine(codes => new Set(codes).size === codes.length, "Hay países repetidos.");

export const publicationBatchSchema = z.object({
  ids: z.array(z.string().min(1).max(150)).min(1).max(100),
}).strict().refine(data => new Set(data.ids).size === data.ids.length, "Hay identificadores repetidos.");

export const shippingBatchSchema = z.object({
  products: z.array(z.object({
    id: z.string().min(1).max(150).regex(/^[A-Za-z0-9_-]+$/),
    shippingCost: z.number().finite().nonnegative().max(100000).refine(value => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, "Usa como máximo dos decimales."),
    motorPower: z.number().int().min(1).max(200000).optional(),
    shippingCountries: countryListSchema.optional(),
  }).strict()).min(1).max(100),
}).strict().refine(data => new Set(data.products.map(p => p.id)).size === data.products.length, "Hay identificadores repetidos.");

type Candidate = { id: string; price: number; stock: number; shippingCost: number | null; shippingCountries?: string | null; images: { url: string }[] };
export function publicationIssue(product: Candidate): string | null {
  if (!Number.isInteger(product.stock) || product.stock <= 0) return "Sin stock disponible";
  if (!Number.isFinite(product.price) || product.price <= 0 || product.price > 999999.99 || Math.abs(product.price * 100 - Math.round(product.price * 100)) > 0.00001) return "Precio no válido";
  if (!product.images.some(image => {
    if (image.url.startsWith("/") && !image.url.startsWith("//")) return true;
    try { return ["https:", "http:"].includes(new URL(image.url).protocol); } catch { return false; }
  })) return "Falta una fotografía válida";
  if (product.id.startsWith("imp20261106_v") && (product.shippingCost === null || product.shippingCost < 5)) return "Falta la tarifa de envío del catálogo importado (mínimo 5 €)";
  if (product.shippingCountries != null) {
    try { if (!countryListSchema.safeParse(JSON.parse(product.shippingCountries)).success) return "Destinos de envío no válidos"; }
    catch { return "Destinos de envío no válidos"; }
  }
  return null;
}
