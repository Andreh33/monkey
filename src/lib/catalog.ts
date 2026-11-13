import { cache } from "react";
import { unstable_cache } from "next/cache";
import { catalogCacheOptions } from "./catalog-cache-policy";
import type { Prisma } from "@prisma/client";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "./prisma";
import { getCategoryTree } from "./categories";
import {
  catalogQuery,
  type QueryInput,
  type Locale,
  translatedProduct,
  localizedSearchIds,
} from "./storefront";
import { PUBLIC_TO_DB_SLUG } from "./slug-aliases";
import { legacyVehicleCategoryPath } from "./legacy-vehicle-categories";
import { VEHICLE_CATEGORIES } from "./vehicle-categories";

export const cardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  price: true,
  compareAt: true,
  currency: true,
  stock: true,
  maxSpeed: true,
  range: true,
  motorPower: true,
  featured: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { order: "asc" as const },
    take: 2,
  },
} satisfies Prisma.ProductSelect;

// Cache only data, leaving redirects and validation outside the cache callback.
const readCatalogPage = unstable_cache(async (where: Prisma.ProductWhereInput, orderBy: Prisma.ProductOrderByWithRelationInput[], skip: number, vehiclesFirst: boolean) => {
  if (vehiclesFirst) {
    // Two indexed partitions preserve pagination without loading the whole catalog.
    const vehicles = { AND: [where, { category: { in: [...VEHICLE_CATEGORIES] } }] };
    const other = { AND: [where, { category: { notIn: [...VEHICLE_CATEGORIES] } }] };
    const [vehicleCount, otherCount] = await Promise.all([
      prisma.product.count({ where: vehicles }), prisma.product.count({ where: other }),
    ]);
    const takeVehicles = Math.min(24, Math.max(0, vehicleCount - skip));
    const [first, rest] = await Promise.all([
      takeVehicles ? prisma.product.findMany({ where: vehicles, select: cardSelect, orderBy, skip, take: takeVehicles }) : [],
      takeVehicles < 24 ? prisma.product.findMany({ where: other, select: cardSelect, orderBy, skip: Math.max(0, skip - vehicleCount), take: 24 - takeVehicles }) : [],
    ]);
    return { products: [...first, ...rest], total: vehicleCount + otherCount };
  }
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, select: cardSelect, orderBy, take: 24, skip }),
    prisma.product.count({ where }),
  ]);
  return { products, total };
}, ["public-catalog-page-v2"], catalogCacheOptions);

const readBrands = unstable_cache(() => prisma.product.groupBy({
  by: ["brand"], where: { active: true, brand: { not: null } }, orderBy: { brand: "asc" },
}), ["public-catalog-brands-v1"], catalogCacheOptions);

const load = cache(async (key: string) => {
  const { input, locale } = JSON.parse(key) as {
    input: QueryInput;
    locale: Locale;
  };
  const query = catalogQuery(input);
  if (!query.valid) notFound();
  const legacyPath = legacyVehicleCategoryPath(input, locale);
  if (legacyPath) permanentRedirect(legacyPath);
  const categories = await getCategoryTree({ onlyWithActiveProducts: true });
  const category = categories.find((c) => c.slug === query.cat);
  if (query.cat && !category) notFound();
  if (
    query.sub &&
    (!category || !category.subcategories.some((s) => s.slug === query.sub))
  )
    notFound();
  const where: Prisma.ProductWhereInput = { active: true };
  if (query.cat) where.category = query.cat;
  if (query.sub) where.subcategory = query.sub;
  if (query.brand) where.brand = query.brand;
  if (query.price === "0-500") where.price = { lte: 500 };
  if (query.price === "500-1000") where.price = { gte: 500, lte: 1000 };
  if (query.price === "1000+") where.price = { gte: 1000 };
  if (query.range) where.range = { gte: Number(query.range) };
  if (query.q) {
    where.OR = ["name", "shortDesc", "brand", "sku"].map((field) => ({
      [field]: { contains: query.q },
    }));
    const localizedIds = localizedSearchIds(locale, query.q);
    if (localizedIds.length) where.OR.push({ id: { in: localizedIds } });
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ price: "asc" }, { id: "asc" }]
      : query.sort === "price-desc"
        ? [{ price: "desc" }, { id: "asc" }]
        : query.sort === "name"
          ? [{ name: "asc" }, { id: "asc" }]
          : [{ createdAt: "desc" }, { id: "asc" }];
  const [{ products, total }, brands] = await Promise.all([
    readCatalogPage(where, orderBy, query.skip, !query.cat && !["price-asc", "price-desc", "name"].includes(query.sort)),
    readBrands(),
  ]);
  if (query.page > Math.max(1, Math.ceil(total / 24))) notFound();
  if (query.brand && !brands.some((b) => b.brand === query.brand)) notFound();
  return {
    query,
    products,
    total,
    categories,
    category,
    brands: brands.map((b) => b.brand!).filter(Boolean),
  };
});
export function loadCatalog(input: QueryInput, locale: Locale = "es") {
  return load(JSON.stringify({ input, locale }));
}
const readPublicProduct = unstable_cache(async (slug: string) => {
  const include = { images: { orderBy: { order: "asc" as const } } };
  const direct = await prisma.product.findUnique({ where: { slug }, include });
  const product =
    direct ??
    (PUBLIC_TO_DB_SLUG[slug]
      ? await prisma.product.findUnique({
          where: { slug: PUBLIC_TO_DB_SLUG[slug] },
          include,
        })
      : null);
  return product?.active ? product : null;
}, ["public-product-v1"], catalogCacheOptions);

export const findPublicProduct = cache(async (slug: string) => {
  const product = await readPublicProduct(slug);
  // The Next data cache serializes to JSON, including Date fields.
  return product ? { ...product, createdAt: new Date(product.createdAt), updatedAt: new Date(product.updatedAt) } : null;
});

export const relatedProductCards = unstable_cache(async (id: string, category: string) => {
  const related = await prisma.product.findMany({
    where: { active: true, id: { not: id }, category }, select: cardSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 3,
  });
  if (related.length < 3) related.push(...await prisma.product.findMany({
    where: { active: true, id: { notIn: [id, ...related.map(p => p.id)] } }, select: cardSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 3 - related.length,
  }));
  return related;
}, ["public-related-cards-v1"], catalogCacheOptions);

const readTranslationSources = unstable_cache((ids: string[]) => prisma.product.findMany({
  where: { id: { in: ids }, active: true },
  select: { id: true, name: true, shortDesc: true, description: true },
}), ["public-card-translations-v1"], catalogCacheOptions);
/** Only the current page's source text is read to validate editorial hashes.
 * These server-only strings never cross a client component boundary. */
export async function localizeCards<T extends { id: string; name: string }>(
  products: T[],
  locale: Locale,
) {
  if (locale === "es" || !products.length)
    return products.map((p) => ({ ...p, translated: true }));
  const sources = await readTranslationSources(products.map(p => p.id).sort());
  const names = new Map(
    sources.map((p) => [p.id, translatedProduct(p, locale)]),
  );
  return products.map((p) => ({
    ...p,
    name: names.get(p.id)?.name ?? p.name,
    translated: names.get(p.id)?.translated ?? false,
  }));
}
