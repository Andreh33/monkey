import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { loadCatalog, localizeCards } from "@/lib/catalog";
import { copy, categoryLabel } from "@/lib/storefront-copy";
import {
  catalogPath,
  catalogIndexable,
  equivalentLanguages,
  localePath,
  type Locale,
  type QueryInput,
} from "@/lib/storefront";
import { publicProductSlug } from "@/lib/slug-aliases";
import { JsonLd } from "@/components/seo/JsonLd";
import { CategoryFields } from "./CategoryFields";
import { safeMetadata } from "@/lib/not-found-metadata";
export async function catalogMetadata(
  locale: Locale,
  input: QueryInput,
): Promise<Metadata> {
  return safeMetadata(() => resolveCatalogMetadata(locale, input));
}
async function resolveCatalogMetadata(
  locale: Locale,
  input: QueryInput,
): Promise<Metadata> {
  const { query, category, total } = await loadCatalog(input, locale);
  const indexable = catalogIndexable(query, total);
  const d = copy[locale];
  const clean = {
    ...query,
    sub: "",
    brand: "",
    price: "",
    range: "",
    q: "",
    sort: "recent",
  };
  const title =
    (category ? categoryLabel(category.slug, category.name, locale) : d.shop) +
    (query.page > 1 ? ` · ${d.page} ${query.page}` : "");
  return {
    title: { absolute: `${title} · Monkey` },
    description: d.intro,
    alternates: {
      canonical: catalogPath(locale, clean),
      ...(indexable
        ? { languages: equivalentLanguages(catalogPath("es", query)) }
        : {}),
    },
    robots: { index: indexable, follow: true },
  };
}
type TileData = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  compareAt: number | null;
  currency: string;
  stock: number;
  maxSpeed: number | null;
  range: number | null;
  motorPower: number | null;
  images: { url: string; alt: string | null }[];
  translated?: boolean;
};
export function ProductTile({
  product: p,
  locale,
}: {
  product: TileData;
  locale: Locale;
}) {
  const d = copy[locale];
  return (
    <article className="card-base group overflow-hidden transition-transform hover:-translate-y-1">
      <Link href={localePath(locale, `/tienda/${publicProductSlug(p.slug)}`)}>
        <div className="relative aspect-[4/5] bg-bg-tertiary overflow-hidden">
          <Image
            src={p.images[0]?.url ?? "/imagenes/local-01.jpeg"}
            alt={p.name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {p.stock <= 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-bg-primary/90 px-3 py-2 text-xs">
              {d.soldOut}
            </span>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-mono text-text-muted mb-2">{p.brand}</p>
          <h2
            lang={p.translated === false ? "es" : undefined}
            className="font-display text-2xl tracking-wider leading-tight"
          >
            {p.name}
          </h2>
          {p.translated === false && (
            <span className="text-xs text-text-muted">Español</span>
          )}
          <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-text-secondary">
            {p.maxSpeed != null && <span>{p.maxSpeed} km/h</span>}
            {p.range != null && <span>{p.range} km</span>}
            {p.motorPower != null && <span>{p.motorPower} W</span>}
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              {p.compareAt != null && p.compareAt > p.price && (
                <p className="font-mono text-sm line-through text-text-muted">
                  {money(p.compareAt, locale, p.currency)}
                </p>
              )}
              <p className="price-mono text-2xl">
                {money(p.price, locale, p.currency)}
              </p>
            </div>
            <span className="text-accent-orange text-xs">{d.details} →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
export function money(value: number, locale: Locale, currency = "EUR") {
  return new Intl.NumberFormat(
    { es: "es-ES", fr: "fr-FR", it: "it-IT", pt: "pt-PT" }[locale],
    { style: "currency", currency },
  ).format(value);
}
export async function Catalog({
  locale,
  input,
}: {
  locale: Locale;
  input: QueryInput;
}) {
  const { products, total, query, categories, category, brands } =
    await loadCatalog(input, locale);
  const d = copy[locale];
  const cards = await localizeCards(products, locale);
  const pages = Math.ceil(total / 24);
  return (
    <>
      <section className="container-custom pt-12 pb-8">
        <p className="eyebrow mb-3">★ {d.selection} ★</p>
        <h1 className="display-xl">
          {category
            ? categoryLabel(category.slug, category.name, locale)
            : d.shop}
        </h1>
        <p className="text-text-secondary mt-4 max-w-2xl">{d.intro}</p>
      </section>
      <form
        action={localePath(locale, "/tienda")}
        className="border-y border-border bg-bg-secondary"
      >
        <div className="container-custom py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="col-span-2">
            <span className="label-base">{d.search}</span>
            <input
              className="input-base"
              type="search"
              name="q"
              defaultValue={query.q}
              maxLength={120}
              placeholder={d.query}
            />
          </label>
          <CategoryFields
            categories={categories.map((c) => ({
              slug: c.slug,
              label: categoryLabel(c.slug, c.name, locale),
              subs: c.subcategories.map((s) => ({
                slug: s.slug,
                label: categoryLabel(s.slug, s.name, locale),
              })),
            }))}
            initialCategory={query.cat}
            initialSubcategory={query.sub}
            labels={{
              category: d.category,
              subcategory: d.subcategory,
              all: d.all,
            }}
          />
          <Filter
            label={d.brand}
            name="brand"
            value={query.brand}
            all={d.all}
            options={brands.map((b) => [b, b])}
          />
          <Filter
            label={d.price}
            name="price"
            value={query.price}
            all={d.all}
            options={["0-500", "500-1000", "1000+"].map((v) => [v, v + " €"])}
          />
          <Filter
            label={d.range}
            name="range"
            value={query.range}
            all={d.all}
            options={["20", "40", "60", "80", "100"].map((v) => [
              v,
              "≥ " + v + " km",
            ])}
          />
          <label>
            <span className="label-base">{d.sort}</span>
            <select
              className="input-base"
              name="sort"
              defaultValue={query.sort}
            >
              {[
                ["recent", d.recent],
                ["price-asc", d.asc],
                ["price-desc", d.desc],
                ["name", d.name],
              ].map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary">
            {d.apply}
          </button>
          <Link className="btn-outline" href={localePath(locale, "/tienda")}>
            {d.clear}
          </Link>
        </div>
      </form>
      <section className="container-custom py-12">
        <p className="text-sm font-mono text-text-muted mb-6">
          {total} {d.results} · {d.page} {query.page}
          {pages > 0 ? ` / ${pages}` : ""}
        </p>
        {cards.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((p) => (
              <ProductTile key={p.id} product={p} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-text-secondary">{d.empty}</p>
        )}
        {pages > 1 && (
          <nav
            aria-label={d.page}
            className="flex flex-wrap items-center justify-center gap-4 mt-12"
          >
            {query.page > 1 && (
              <Link
                rel="prev"
                className="btn-outline"
                href={catalogPath(locale, query, query.page - 1)}
              >
                ← {d.previous}
              </Link>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === pages || Math.abs(p - query.page) <= 2,
              )
              .map((p) => (
                <Link
                  aria-current={p === query.page ? "page" : undefined}
                  className={
                    p === query.page
                      ? "text-accent-orange font-bold"
                      : "hover:underline"
                  }
                  key={p}
                  href={catalogPath(locale, query, p)}
                >
                  {p}
                </Link>
              ))}
            {query.page < pages && (
              <Link
                rel="next"
                className="btn-outline"
                href={catalogPath(locale, query, query.page + 1)}
              >
                {d.next} →
              </Link>
            )}
          </nav>
        )}
      </section>
      <section className="container-custom pb-16">
        <div className="border-t border-border pt-8 text-sm text-text-secondary max-w-3xl space-y-4">
          <h2 className="font-display text-3xl text-white">{d.purchase}</h2>
          <p>{d.guide}</p>
          <p>{d.delivery}</p>
          <Link
            href={localePath(locale, "/condiciones-compra")}
            className="text-accent-orange underline"
          >
            {d.conditions}
          </Link>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: cards.map((p, i) => ({
            "@type": "ListItem",
            position: query.skip + i + 1,
            url:
              "https://monopatinmonkey.com" +
              localePath(locale, "/tienda/" + publicProductSlug(p.slug)),
            name: p.name,
          })),
        }}
      />
    </>
  );
}
function Filter({
  label,
  name,
  value,
  options,
  all,
}: {
  label: string;
  name: string;
  value: string;
  options: string[][];
  all: string;
}) {
  return (
    <label>
      <span className="label-base">{label}</span>
      <select name={name} defaultValue={value} className="input-base">
        <option value="">{all}</option>
        {options.map(([v, t]) => (
          <option value={v} key={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
