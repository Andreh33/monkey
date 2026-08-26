import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const HOME_FEATURED_PRODUCT_SLUGS = [
  "patinete-electrico-bison-homologado-dgt",
  "patinete-electrico-adasmart-tank-dual-48v-23-4ah",
  "patinete-electrico-joyor-t-pro-dgt-motor-dual-1000w-hasta-90km-de-autonomia",
] as const;

export async function FeaturedScooters() {
  const preferredProductsUnordered = await prisma.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      category: "patinete",
      slug: { in: [...HOME_FEATURED_PRODUCT_SLUGS] },
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  const productsBySlug = new Map(
    preferredProductsUnordered.map((product) => [product.slug, product])
  );
  const preferredProducts = HOME_FEATURED_PRODUCT_SLUGS.flatMap((slug) => {
    const product = productsBySlug.get(slug);
    return product ? [product] : [];
  });
  const fallbackProducts =
    preferredProducts.length < 3
      ? await prisma.product.findMany({
          where: {
            active: true,
            stock: { gt: 0 },
            category: "patinete",
            slug: { notIn: [...HOME_FEATURED_PRODUCT_SLUGS] },
          },
          include: { images: { orderBy: { order: "asc" } } },
          orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
          take: 3 - preferredProducts.length,
        })
      : [];
  const featuredProducts = [...preferredProducts, ...fallbackProducts];

  return (
    <section className="section-pad container-custom">
      <ScrollReveal>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <p className="eyebrow mb-3">★ EN STOCK ★</p>
            <h2 className="display-lg">Patinetes destacados</h2>
            <p className="mt-3 text-text-secondary max-w-md">Lo mejor que tenemos ahora mismo en el escaparate.</p>
          </div>
          <Link href="/tienda" className="btn-outline">
            Ver toda la tienda
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 0.1}>
            <ProductCard product={{ ...p, featured: true }} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
