import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cardSelect, localizeCards } from "@/lib/catalog";
import { getCategoryTree } from "@/lib/categories";
import { isLocale, localePath } from "@/lib/storefront-routes";
import { copy, categoryLabel } from "@/lib/storefront-copy";
import { staticMetadata } from "@/lib/storefront-legal";
import { ProductTile } from "@/components/storefront/Catalog";
import { missingMetadata } from "@/lib/not-found-metadata";
export const revalidate = 300;
export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale) || params.locale === "es")
    return missingMetadata;
  return staticMetadata(
    params.locale,
    "/",
    {
      fr: "Trottinettes électriques à Tarragone",
      it: "Monopattini elettrici a Tarragona",
      pt: "Trotinetes elétricas em Tarragona",
    }[params.locale],
    copy[params.locale].intro,
  );
}
export default async function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale) || params.locale === "es") notFound();
  const locale = params.locale,
    d = copy[locale];
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      select: cardSelect,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: 6,
    }),
    getCategoryTree(),
  ]);
  const cards = await localizeCards(products, locale);
  return (
    <>
      <section className="relative min-h-[500px] flex items-center overflow-hidden">
        <Image
          priority
          fill
          src="/imagenes/local-13.jpeg"
          alt={d.support}
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="container-custom relative py-24">
          <p className="eyebrow mb-5">
            ★ TARRAGONA ·{" "}
            {{ fr: "ESPAGNE", it: "SPAGNA", pt: "ESPANHA" }[locale]} ★
          </p>
          <h1 className="display-xl max-w-4xl">{d.hero}</h1>
          <p className="text-lg text-text-secondary mt-6 max-w-xl">{d.intro}</p>
          <Link
            className="btn-primary mt-8"
            href={localePath(locale, "/tienda")}
          >
            {d.discover} →
          </Link>
        </div>
      </section>
      <section className="container-custom py-12">
        <nav className="flex flex-wrap gap-3" aria-label={d.category}>
          {categories.map((c) => (
            <Link
              key={c.id}
              className="btn-outline text-sm"
              href={localePath(
                locale,
                "/tienda?cat=" + encodeURIComponent(c.slug),
              )}
            >
              {categoryLabel(c.slug, c.name, locale)}
            </Link>
          ))}
        </nav>
      </section>
      {cards.length > 0 && (
        <section className="container-custom pb-16">
          <h2 className="display-md mb-8">{d.selection}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((p) => (
              <ProductTile key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
      <section className="border-y border-border bg-bg-secondary">
        <div className="container-custom py-16 grid md:grid-cols-2 gap-12">
          <div>
            <p className="eyebrow mb-3">{d.local}</p>
            <h2 className="display-md mb-5">{d.support}</h2>
            <p className="text-text-secondary leading-relaxed">
              {d.repairText}
            </p>
            <Link
              className="btn-outline mt-6"
              href={localePath(locale, "/reparaciones")}
            >
              {d.repairs}
            </Link>
          </div>
          <div>
            <h2 className="display-md mb-5">{d.purchase}</h2>
            <p className="text-text-secondary leading-relaxed">{d.guide}</p>
            <p className="text-text-secondary leading-relaxed mt-4">
              {d.delivery}
            </p>
            <Link
              className="btn-outline mt-6"
              href={localePath(locale, "/condiciones-compra")}
            >
              {d.conditions}
            </Link>
          </div>
        </div>
      </section>
      <section className="container-custom py-16">
        <h2 className="display-md mb-5">{d.visit}</h2>
        <p className="text-text-secondary">C/ Jaume I, 5 · 43005 Tarragona</p>
        <Link
          className="btn-primary mt-6"
          href={localePath(locale, "/contacto")}
        >
          {d.contact}
        </Link>
      </section>
    </>
  );
}
