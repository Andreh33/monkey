import { z } from "zod";

export const IMPORT_BATCH_SIZE = 25;
export const IMPORT_MAX_FILE_BYTES = 125 * 1024 * 1024;
export const IMPORT_MAX_REQUEST_BYTES = 2 * 1024 * 1024;
const retailer = /motos[\s._-]*mh/i;
const externalLink = /https?:\/\/|www\.|mailto:|\b[a-z0-9][a-z0-9-]*\.(?:com|es|net|org|eu|fr|it|pt|shop|store)\b/i;
const text = (min: number, max: number) => z.string().trim().min(min).max(max).refine(
  (value) => !retailer.test(value) && !externalLink.test(value),
  "El texto contiene una referencia al proveedor o un enlace externo.",
);
const slug = z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).refine(value => !retailer.test(value));

export function importPriceCents(sourcePriceCents: number) {
  // Integer arithmetic gives commercial rounding even at half-cent boundaries.
  return Math.floor((sourcePriceCents * 110 + 50) / 100);
}

export function ownImportImage(value: string) {
  if (retailer.test(value) || value.includes("\\")) return false;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return !value.includes("..") && !value.includes("?") && !value.includes("#");
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && !url.hash &&
      (url.hostname === "monopatinmonkey.com" || url.hostname === "19e3cavvu8vlpeyt.public.blob.vercel-storage.com");
  } catch { return false; }
}

const optionalInteger = z.number().int().nonnegative().max(1000000).nullable().optional();
const optionalNumber = z.number().nonnegative().max(1000000).nullable().optional();
export const importProductSchema = z.object({
  id: z.string().regex(/^imp20261106_v\d{1,30}$/),
  sku: z.string().regex(/^MM-\d{1,30}$/),
  name: text(2, 240), shortDesc: text(2, 160), description: text(20, 30000),
  price: z.number().positive().max(11000000), sourcePriceCents: z.number().int().positive().max(1000000000),
  category: slug, categoryName: text(2, 120),
  subcategory: slug.nullable().optional(), subcategoryName: text(2, 120).nullable().optional(),
  brand: text(1, 120).nullable().optional(),
  maxSpeed: optionalInteger, range: optionalInteger, motorPower: optionalInteger,
  battery: text(1, 200).nullable().optional(), weight: optionalNumber, maxLoad: optionalInteger,
  images: z.array(z.object({
    url: z.string().max(2048).refine(ownImportImage, "Usa una imagen alojada en la tienda o en Vercel Blob."),
    alt: text(1, 240),
  }).strict()).min(1).max(60),
}).strict().superRefine((product, ctx) => {
  if (product.sku !== `MM-${product.id.slice("imp20261106_v".length)}`) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sku"], message: "El SKU no coincide con el identificador de la variante." });
  }
  if (Math.abs(product.price * 100 - importPriceCents(product.sourcePriceCents)) > 0.0000001) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["price"], message: "El precio debe ser el precio de origen más un 10 %, redondeado a céntimos." });
  }
  if (Boolean(product.subcategory) !== Boolean(product.subcategoryName)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["subcategory"], message: "Indica el identificador y nombre de la subcategoría juntos." });
  }
});
export type ImportProduct = z.infer<typeof importProductSchema>;

function productsSchema(max: number) {
  return z.object({ products: z.array(importProductSchema).min(1).max(max) }).strict().superRefine(({ products }, ctx) => {
    const ids = new Set<string>();
    for (const [index, product] of products.entries()) {
      if (ids.has(product.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["products", index, "id"], message: "Variante repetida en el archivo." });
      ids.add(product.id);
    }
  });
}
export const importBatchSchema = productsSchema(IMPORT_BATCH_SIZE);
export const importFileSchema = productsSchema(50000);
