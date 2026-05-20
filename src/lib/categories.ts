import { prisma } from "@/lib/prisma";

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
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const cats = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      subcategories: { orderBy: [{ order: "asc" }, { name: "asc" }] },
    },
  });

  return cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    order: c.order,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      order: s.order,
    })),
  }));
}
