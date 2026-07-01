import { ProductCard, type ProductCardData } from "@/components/shop/ProductCard";

/** Rejilla de productos reales (por slug) enlazados desde el artículo. */
export function RelatedProducts({
  products,
  title = "Patinetes que te pueden interesar",
}: {
  products: ProductCardData[];
  title?: string;
}) {
  if (!products || products.length === 0) return null;
  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-6 gap-4">
        <h2 className="font-display text-3xl sm:text-4xl tracking-wide text-white leading-none">{title}</h2>
        <a href="/tienda" className="text-xs uppercase tracking-wider font-semibold text-accent-orange hover:underline shrink-0">
          Ver toda la tienda →
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
