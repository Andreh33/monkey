import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { findPublicProduct } from "@/lib/catalog";
import { copy } from "@/lib/storefront-copy";
import {
  isLocale,
  localePath,
  equivalentLanguages,
  translatedProduct,
  productLanguages,
  SITE,
  type Locale,
} from "@/lib/storefront";
import { DB_TO_PUBLIC_SLUG } from "@/lib/slug-aliases";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { Purchase } from "@/components/storefront/Purchase";
import { money } from "@/components/storefront/Catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { isDgtCertified } from "@/lib/schema";
import { safeMetadata } from "@/lib/not-found-metadata";
import { productPageTitle } from "@/lib/product-title";
export const revalidate = 300;
type Props = { params: { locale: string; slug: string } };
async function productFor(params: Props["params"]) {
  if (!isLocale(params.locale) || params.locale === "es") notFound();
  if (DB_TO_PUBLIC_SLUG[params.slug])
    permanentRedirect(
      localePath(params.locale, "/tienda/" + DB_TO_PUBLIC_SLUG[params.slug]),
    );
  const p = await findPublicProduct(params.slug);
  if (!p) notFound();
  return { p, locale: params.locale as Locale };
}
export function generateMetadata(props: Props) {
  return safeMetadata(() => pageMetadata(props));
}
async function pageMetadata({ params }: Props): Promise<Metadata> {
  const { p, locale } = await productFor(params);
  const t = translatedProduct(p, locale);
  const path = "/tienda/" + params.slug;
  return {
    title: { absolute: productPageTitle(p, t.name, locale) },
    description: t.shortDesc.slice(0, 160),
    robots: { index: t.translated, follow: true },
    alternates: {
      canonical: localePath(locale, path),
      ...(t.translated
        ? { languages: equivalentLanguages(path, productLanguages(p)) }
        : {}),
    },
    openGraph: {
      title: t.name,
      description: t.shortDesc,
      locale: { fr: "fr_FR", it: "it_IT", pt: "pt_PT", es: "es_ES" }[locale],
      url: localePath(locale, path),
      images: p.images[0] ? [{ url: p.images[0].url, alt: t.name }] : [],
    },
  };
}
export default async function Page({ params }: Props) {
  const { p, locale } = await productFor(params);
  const t = translatedProduct(p, locale);
  const d = copy[locale];
  const url = SITE + localePath(locale, "/tienda/" + params.slug);
  const specs = [
    [d.speed, p.maxSpeed != null ? `${p.maxSpeed} km/h` : null],
    [d.range, p.range != null ? `${p.range} km` : null],
    [d.motor, p.motorPower != null ? `${p.motorPower} W` : null],
    [d.battery, p.battery],
    [d.weight, p.weight != null ? `${p.weight} kg` : null],
    [d.load, p.maxLoad != null ? `${p.maxLoad} kg` : null],
    [d.reference, p.sku],
  ].filter(([, v]) => v != null);
  return (
    <>
      <section className="container-custom py-12">
        <nav aria-label={d.shop} className="text-sm text-text-muted mb-8">
          <Link href={localePath(locale)}>{d.home}</Link> /{" "}
          <Link href={localePath(locale, "/tienda")}>{d.shop}</Link>
        </nav>
        {!t.translated && (
          <p
            role="status"
            className="border border-accent-orange p-4 rounded-lg mb-8 text-sm"
          >
            {d.source}
          </p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10 min-w-0">
          <ProductGallery
            images={p.images.map((i) => ({ url: i.url, alt: t.name }))}
            name={t.name}
            youtubeUrl={p.youtubeUrl}
            locale={locale}
          />
          <div className="min-w-0 space-y-6 lg:sticky lg:top-48 self-start [overflow-wrap:anywhere]">
            <p className="font-mono text-accent-orange text-sm">{p.brand}</p>
            <div lang={t.translated ? locale : "es"}>
              <h1 className="display-lg leading-tight">{t.name}</h1>
              <p className="text-lg text-text-secondary mt-4">{t.shortDesc}</p>
            </div>
            <p className="price-mono text-4xl">
              {money(p.price, locale, p.currency)}
            </p>
            {p.compareAt != null && p.compareAt > p.price && (
              <p className="font-mono text-text-muted line-through">
                {money(p.compareAt, locale, p.currency)}
              </p>
            )}
            <p className={p.stock > 0 ? "text-success" : "text-text-muted"}>
              {p.stock > 0 ? d.available : d.soldOut}
            </p>
            <Purchase
              locale={locale}
              product={{
                active: p.active,
                stock: p.stock,
                stripeLink: p.stripeLink,
              }}
              labels={{
                buy: d.buy,
                accept: d.accept,
                conditions: d.conditions,
                privacy: d.privacy,
                and: d.and,
                delivery: d.delivery,
                soldOut: d.soldOut,
                unavailable: d.unavailable,
                contact: d.contact,
              }}
            />
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 min-w-0 [overflow-wrap:anywhere]">
          <div>
            <h2 className="font-display text-3xl mb-6">{d.description}</h2>
            <div
              lang={t.translated ? locale : "es"}
              className="space-y-4 whitespace-pre-line text-text-secondary leading-relaxed"
            >
              {t.description}
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl mb-6">{d.specs}</h2>
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([label, value]) => (
                  <tr key={label} className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-text-muted font-normal">
                      {label}
                    </th>
                    <td className="font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isDgtCertified(p) && (
              <p className="mt-6 text-sm text-text-secondary">
                {d.certification}
              </p>
            )}
            <Link
              className="btn-outline mt-8"
              href={localePath(locale, "/contacto")}
            >
              {d.contact}
            </Link>
          </div>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": url + "#product",
          url,
          name: t.name,
          description: t.shortDesc,
          image: p.images.map((i) => i.url),
          ...(p.sku ? { sku: p.sku } : {}),
          ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
          offers: {
            "@type": "Offer",
            url,
            price: p.price,
            priceCurrency: p.currency,
            availability:
              p.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@id": SITE + "/#store" },
          },
        }}
      />
    </>
  );
}
