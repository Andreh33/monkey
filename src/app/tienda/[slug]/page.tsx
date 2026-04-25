import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductActions } from "@/components/shop/ProductActions";
import { ProductCard } from "@/components/shop/ProductCard";
import { Gauge, Battery, Zap, BatteryCharging, Weight, Users, Shield, Truck, Headphones } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: "Producto" };
  return { title: p.name, description: p.shortDesc };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, slug: { not: product.slug } },
    include: { images: { orderBy: { order: "asc" } } },
    take: 3,
  });

  const specs = [
    { icon: Gauge, label: "Velocidad máx.", value: product.maxSpeed ? `${product.maxSpeed} km/h` : "—" },
    { icon: Battery, label: "Autonomía", value: product.range ? `${product.range} km` : "—" },
    { icon: Zap, label: "Motor", value: product.motorPower ? `${product.motorPower} W` : "—" },
    { icon: BatteryCharging, label: "Batería", value: product.battery ?? "—" },
    { icon: Weight, label: "Peso", value: product.weight ? `${product.weight} kg` : "—" },
    { icon: Users, label: "Carga máx.", value: product.maxLoad ? `${product.maxLoad} kg` : "—" },
  ];

  return (
    <>
      <section className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:sticky lg:top-24 self-start space-y-6">
            {product.brand && (
              <p className="text-xs uppercase tracking-widest font-mono text-accent-orange">{product.brand}</p>
            )}
            <h1 className="display-lg leading-[0.95]">{product.name}</h1>
            <p className="text-text-secondary text-lg leading-relaxed">{product.shortDesc}</p>
            <div className="flex items-end gap-3">
              <p className="price-mono text-5xl">{formatPrice(product.price)}<span className="currency">€</span></p>
              {product.compareAt && product.compareAt > product.price && (
                <p className="price-mono text-xl text-text-muted line-through mb-2">{formatPrice(product.compareAt)}<span>€</span></p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {specs.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary border border-border">
                    <Icon className="w-5 h-5 text-accent-orange shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-mono">{s.label}</p>
                      <p className="text-sm font-semibold font-mono">{s.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <ProductActions product={product} />

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <Trust icon={Shield} text="Garantía 2 años" />
              <Trust icon={Truck} text="Envío 24-48h" />
              <Trust icon={Headphones} text="Soporte técnico" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-3xl tracking-wider mb-4">Descripción</h2>
              <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                {product.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl tracking-wider mb-4">Especificaciones técnicas</h2>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={s.label} className={i % 2 === 0 ? "bg-bg-secondary" : "bg-bg-primary"}>
                        <td className="px-4 py-3 text-text-muted uppercase text-xs tracking-widest font-mono w-1/2">{s.label}</td>
                        <td className="px-4 py-3 font-mono">{s.value}</td>
                      </tr>
                    ))}
                    {product.brand && (
                      <tr className="bg-bg-secondary">
                        <td className="px-4 py-3 text-text-muted uppercase text-xs tracking-widest font-mono">Marca</td>
                        <td className="px-4 py-3 font-mono">{product.brand}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside>
            <h2 className="font-display text-3xl tracking-wider mb-4">Envío y garantía</h2>
            <div className="card-base p-5 space-y-4 text-sm text-text-secondary leading-relaxed">
              <div>
                <p className="font-semibold text-white mb-1">Envío rápido</p>
                <p>Enviamos en 24-48h a toda España peninsular. Recogida gratuita en nuestra tienda en Tarragona.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Garantía oficial</p>
                <p>2 años de garantía del fabricante. Servicio técnico autorizado en nuestro taller.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Configuración incluida</p>
                <p>Cada patinete sale del taller montado, ajustado a tu peso y probado en pista antes de la entrega.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-custom section-pad-sm border-t border-border">
          <h2 className="font-display text-3xl tracking-wider mb-8">También te puede gustar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Trust({ icon: Icon, text }: { icon: typeof Shield; text: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 py-2">
      <Icon className="w-5 h-5 text-accent-orange" />
      <span className="text-[11px] uppercase tracking-wider text-text-secondary font-medium">{text}</span>
    </div>
  );
}
