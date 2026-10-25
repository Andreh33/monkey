import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
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
const load = cache(async (key: string) => {
  const { input, locale } = JSON.parse(key) as {
    input: QueryInput;
    locale: Locale;
  };
  const query = catalogQuery(input);
  if (!query.valid) notFound();
  const categories = await getCategoryTree();
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
  const [products, total, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy,
      take: 24,
      skip: query.skip,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { active: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
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
export const findPublicProduct = cache(async (slug: string) => {
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
});
/** Only the current page's source text is read to validate editorial hashes.
 * These server-only strings never cross a client component boundary. */
export async function localizeCards<T extends { id: string; name: string }>(
  products: T[],
  locale: Locale,
) {
  if (locale === "es" || !products.length)
    return products.map((p) => ({ ...p, translated: true }));
  const sources = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.id) }, active: true },
    select: { id: true, name: true, shortDesc: true, description: true },
  });
  const names = new Map(
    sources.map((p) => [p.id, translatedProduct(p, locale)]),
  );
  return products.map((p) => ({
    ...p,
    name: names.get(p.id)?.name ?? p.name,
    translated: names.get(p.id)?.translated ?? false,
  }));
}
