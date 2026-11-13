import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { catalogCacheOptions } from "./catalog-cache-policy";
import { isVehicleCategory } from "./vehicle-categories";

export type SubcategoryNode = {
  id: string;
  slug: string;
  name: string;
  order: number;
};

export type CategoryNode = {
  id: string;
  slug: string;
  name: string;
  order: number;
  subcategories: SubcategoryNode[];
};

/**
 * Devuelve el árbol de categorías con sus subcategorías, ordenado por el campo
 * `order` y luego alfabéticamente. Se usa en la navbar (megamenú), la tienda
 * (filtros), el formulario de productos y el panel de admin.
 */
async function readCategoryTree(onlyWithActiveProducts: boolean): Promise<CategoryNode[]> {
  const cats = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      subcategories: { orderBy: [{ order: "asc" }, { name: "asc" }] },
    },
  });

  const activeProducts = onlyWithActiveProducts ? await prisma.product.groupBy({
    by: ["category", "subcategory"],
    where: { active: true },
  }) : null;
  const visibleCategories = activeProducts ? new Set(activeProducts.map(p => p.category)) : null;
  const visibleSubcategories = activeProducts ? new Set(activeProducts.map(p => `${p.category}\u0000${p.subcategory}`)) : null;

  const visible = cats.filter(c => !visibleCategories || visibleCategories.has(c.slug));
  if (onlyWithActiveProducts) visible.sort((a, b) => Number(isVehicleCategory(b.slug)) - Number(isVehicleCategory(a.slug)));
  return visible.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    order: c.order,
    subcategories: c.subcategories.filter(s => !visibleSubcategories || visibleSubcategories.has(`${c.slug}\u0000${s.slug}`)).map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      order: s.order,
    })),
  }));
}

const publicCategoryTree = unstable_cache(() => readCategoryTree(true), ["public-category-tree-v5"], catalogCacheOptions);
export function getCategoryTree(options: { onlyWithActiveProducts?: boolean } = {}): Promise<CategoryNode[]> {
  return options.onlyWithActiveProducts ? publicCategoryTree() : readCategoryTree(false);
}
