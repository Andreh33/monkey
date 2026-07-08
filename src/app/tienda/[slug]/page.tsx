import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductActions } from "@/components/shop/ProductActions";
import { ProductDescription } from "@/components/shop/ProductDescription";
import { ReviewCta } from "@/components/shop/ReviewCta";
import { ProductCard } from "@/components/shop/ProductCard";
import { MobileBuyBar } from "@/components/shop/MobileBuyBar";
import Link from "next/link";
import { Gauge, Battery, Zap, BatteryCharging, Weight, Users, Shield, Truck, Headphones, BookOpen, BadgeCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema, productVideoSchema, breadcrumbSchema, isDgtCertified } from "@/lib/schema";
import { DB_TO_PUBLIC_SLUG, PUBLIC_TO_DB_SLUG } from "@/lib/slug-aliases";
import { Breadcrumbs } from "@/components/blog/Breadcrumbs";

/**
 * Los slugs heredados de la semilla que sirven OTRO producto (p. ej.
 * `xiaomi-electric-scooter-4-pro` → InMotion CLIMBER DGT) redirigen 308 a su
 * slug público correcto sin tocar la BD; el slug público se resuelve aquí
 * contra el slug real de la BD. Ver src/lib/slug-aliases.ts.
 */
function redirectLegacySlug(slug: string): void {
  const publicSlug = DB_TO_PUBLIC_SLUG[slug];
  if (publicSlug) permanentRedirect(`/tienda/${publicSlug}`);
}

async function findProduct(slug: string) {
  const include = { images: { orderBy: { order: "asc" as const } } };
  // 1º el slug tal cual (si el admin corrige la BD, la BD gana);
  // 2º el alias público → slug real de la BD.
  const direct = await prisma.product.findUnique({ where: { slug }, include });
  if (direct) return direct;
  const dbSlug = PUBLIC_TO_DB_SLUG[slug];
  if (!dbSlug) return null;
  return prisma.product.findUnique({ where: { slug: dbSlug }, include });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  redirectLegacySlug(params.slug);
  const p = await findProduct(params.slug);
  if (!p) return { title: "Producto" };
  const img = p.images[0]?.url;
  // Title transaccional: nombre + precio (el precio en el title mejora el CTR
  // en búsquedas de compra y refuerza el rich result de Merchant listing).
  const title = `${p.name} — ${formatPrice(p.price)} €`;
  const envio =
    p.shippingCost && p.shippingCost > 0
      ? `envío 24-48h (${formatPrice(p.shippingCost)} €)`
      : "envío gratis 24-48h";
  const dgt = isDgtCertified(p) ? " Homologado DGT con certificado VMP." : "";
  const description =
    `Compra ${p.name} por ${formatPrice(p.price)} € con ${envio} a toda España.${dgt} Garantía 3 años, montado y probado en nuestro taller de Tarragona. ${p.shortDesc}`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/tienda/${params.slug}` },
    openGraph: {
      title,
      description: p.shortDesc,
      images: img ? [{ url: img, alt: p.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: p.shortDesc,
      images: img ? [img] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  redirectLegacySlug(params.slug);
  const product = await findProduct(params.slug);

  if (!product) notFound();

  // Recomendaciones: primero de la misma categoría/marca, completando con otros si faltan.
  const sameCategory = await prisma.product.findMany({
    where: {
      active: true,
      slug: { not: product.slug },
      category: product.category,
    },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  let related = sameCategory;
  if (related.length < 3) {
    const fillers = await prisma.product.findMany({
      where: {
        active: true,
        slug: { not: product.slug },
        id: { notIn: related.map((p) => p.id) },
      },
      include: { images: { orderBy: { order: "asc" } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 3 - related.length,
    });
    related = [...related, ...fillers];
  }

  // Las guías del blog son de patinetes: solo se enlazan cuando encajan con el producto.
  const esPatinete = /patinete/i.test(product.category) || /patinete/i.test(product.name);
  // Homologación declarada por los propios datos del producto (nombre/sku/descripción).
  const homologadoDgt = isDgtCertified(product);
  // URL pública de la ficha (params.slug ya es el slug canónico: los alias
  // antiguos redirigen 308 antes de llegar aquí).
  const fichaPath = `/tienda/${params.slug}`;
  const videoLd = productVideoSchema(product);

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
      <JsonLd
        data={[
          productSchema(product),
          // Review en vídeo como VideoObject aparte (antes iba colada en image[]).
          ...(videoLd ? [videoLd] : []),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Tienda", path: "/tienda" },
            { name: product.name, path: fichaPath },
          ]),
        ]}
      />
      <section className="container-custom py-12">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: "Inicio", href: "/" },
              { name: "Tienda", href: "/tienda" },
              { name: product.name },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} youtubeUrl={product.youtubeUrl} />

          <div className="lg:sticky lg:top-24 self-start space-y-6">
            {product.brand && (
              <p className="text-xs uppercase tracking-widest font-mono text-accent-orange">{product.brand}</p>
            )}
            <h1 className="display-lg leading-[0.95]">{product.name}</h1>
            {homologadoDgt && (
              <Link
                href="/patinetes-electricos-homologados-dgt"
                className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success hover:bg-success/20 transition-colors"
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                Homologado DGT · Certificado VMP
              </Link>
            )}
            <p className="text-text-secondary text-lg leading-relaxed">{product.shortDesc}</p>
            <div className="flex items-end gap-3">
              <p className="price-mono text-5xl">{formatPrice(product.price)}<span className="currency">€</span></p>
              {product.compareAt && product.compareAt > product.price && (
                <p className="price-mono text-xl text-text-muted line-through mb-2">{formatPrice(product.compareAt)}<span>€</span></p>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              <Truck className="inline w-4 h-4 mr-1.5 text-accent-orange align-[-2px]" />
              {product.shippingCost && product.shippingCost > 0
                ? <>Envío: <span className="font-mono font-semibold text-white">{formatPrice(product.shippingCost)}€</span></>
                : <span className="font-semibold text-success">Envío gratuito</span>}
            </p>

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

            <div id="comprar" className="scroll-mt-28">
              <ProductActions product={product} />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <Trust icon={Shield} text="Garantía 3 años" />
              <Trust icon={Truck} text="Envío 24-48h" />
              <Trust icon={Headphones} text="Soporte técnico" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ReviewCta youtubeUrl={product.youtubeUrl} />
            <ProductDescription description={product.description} />

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
                    {homologadoDgt && (
                      <tr className="bg-bg-primary">
                        <td className="px-4 py-3 text-text-muted uppercase text-xs tracking-widest font-mono">Homologado DGT</td>
                        <td className="px-4 py-3 font-mono text-success">Sí · certificado VMP</td>
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
                <p className="mt-2 font-mono text-xs">
                  {product.shippingCost && product.shippingCost > 0
                    ? <>Coste de envío: <span className="text-white">{formatPrice(product.shippingCost)}€</span></>
                    : <span className="text-success">Envío gratuito a península</span>}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Garantía oficial</p>
                <p>3 años de garantía del fabricante. Servicio técnico autorizado en nuestro taller.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Devolución en 14 días</p>
                <p>
                  Dispones de 14 días naturales para desistir de la compra.{" "}
                  <Link href="/condiciones-compra" className="text-accent-orange hover:underline">
                    Consulta las condiciones de envío y devoluciones
                  </Link>.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Configuración incluida</p>
                <p>
                  Cada patinete sale del taller montado, ajustado a tu peso y probado en pista antes de la entrega.
                  Y si algún día falla, lo arreglamos en nuestro{" "}
                  <Link href="/reparaciones" className="text-accent-orange hover:underline">
                    taller de reparación de patinetes eléctricos
                  </Link>{" "}
                  de Tarragona.
                </p>
              </div>
            </div>

            {esPatinete && (
              <div className="mt-8">
                <h2 className="font-display text-3xl tracking-wider mb-4">Guías del taller</h2>
                <ul className="card-base p-5 space-y-3 text-sm">
                  <li className="flex gap-2.5">
                    <BadgeCheck className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                    <Link href="/patinetes-electricos-homologados-dgt" className="text-text-secondary hover:text-white transition-colors">
                      Ver todos los patinetes eléctricos homologados DGT de la tienda
                    </Link>
                  </li>
                  <li className="flex gap-2.5">
                    <BookOpen className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                    <Link href="/blog/normativa-patinetes-electricos-2026" className="text-text-secondary hover:text-white transition-colors">
                      Normativa DGT de patinetes eléctricos 2026: lo que debes saber antes de circular
                    </Link>
                  </li>
                  <li className="flex gap-2.5">
                    <BookOpen className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                    <Link href="/blog/patinetes-homologados-dgt-certificado-vmp" className="text-text-secondary hover:text-white transition-colors">
                      Patinetes homologados DGT: qué es el certificado VMP y por qué importa
                    </Link>
                  </li>
                  <li className="flex gap-2.5">
                    <BookOpen className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                    <Link href="/blog/cuidar-bateria-patinete-electrico" className="text-text-secondary hover:text-white transition-colors">
                      Cómo cuidar la batería para que dure más años
                    </Link>
                  </li>
                </ul>
              </div>
            )}
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

      {/* Barra de compra fija en móvil (precio + comprar + WhatsApp pre-rellenado). */}
      <MobileBuyBar product={product} />
      <div className="h-20 lg:hidden" aria-hidden="true" />
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
