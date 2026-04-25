import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export async function FeaturedScooters() {
  const products = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { images: { orderBy: { order: "asc" } } },
    take: 3,
  });

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
        {products.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 0.1}>
            <ProductCard product={p} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
