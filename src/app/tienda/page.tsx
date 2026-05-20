import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Filters } from "@/components/shop/Filters";
import { getCategoryTree } from "@/lib/categories";

export const metadata = { title: "Tienda" };

type SearchParams = { [k: string]: string | undefined };

export default async function TiendaPage({ searchParams }: { searchParams: SearchParams }) {
  const cat = searchParams.cat;
  const sub = searchParams.sub;
  const brand = searchParams.brand;
  const price = searchParams.price;
  const range = searchParams.range;
  const sort = searchParams.sort ?? "recent";

  const where: Record<string, unknown> = { active: true };
  if (cat && cat !== "all") where.category = cat;
  if (sub && sub !== "all") where.subcategory = sub;
  if (brand && brand !== "all") where.brand = brand;

  if (price && price !== "all") {
    if (price === "0-500") where.price = { lte: 500 };
    else if (price === "500-1000") where.price = { gte: 500, lte: 1000 };
    else if (price === "1000+") where.price = { gte: 1000 };
  }
  if (range && range !== "all") where.range = { gte: Number(range) };

  const orderBy: Record<string, "asc" | "desc"> =
    sort === "price-asc" ? { price: "asc" }
      : sort === "price-desc" ? { price: "desc" }
      : sort === "name" ? { name: "asc" }
      : { createdAt: "desc" };

  const [products, allBrands, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" } } },
      orderBy,
    }),
    prisma.product.findMany({
      where: { active: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    }),
    getCategoryTree(),
  ]);

  const brandList = Array.from(new Set(allBrands.map((b) => b.brand!).filter(Boolean))).sort();

  return (
    <>
      <section className="container-custom pt-12 pb-8">
        <p className="eyebrow mb-3">★ NUESTRA SELECCIÓN ★</p>
        <h1 className="display-xl">Tienda</h1>
        <p className="mt-3 text-text-secondary max-w-xl">
          Patinetes eléctricos de las mejores marcas, montados, configurados y entregados por el equipo del taller.
        </p>
      </section>

      <Filters brands={brandList} categories={categories} />

      <section className="container-custom py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="display-md text-text-muted">No hay productos</p>
            <p className="mt-3 text-text-secondary">Cambia los filtros para ver más resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
