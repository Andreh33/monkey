import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isLocale, localePath, type Locale } from "@/lib/storefront-routes";
import { copy, countryName } from "@/lib/storefront-copy";
import { legalEntry, legalSlugs, staticMetadata } from "@/lib/storefront-legal";
import Aviso from "@/app/(es)/aviso-legal/page";
import Privacy from "@/app/(es)/privacidad/page";
import Cookies from "@/app/(es)/cookies/page";
import Conditions from "@/app/(es)/condiciones-compra/page";
import { LocalContactForm } from "@/components/storefront/ContactForm";
import { isNotFound, missingMetadata } from "@/lib/not-found-metadata";
type Props = { params: { locale: string; page: string } };
const supported = [
  "contacto",
  "nosotros",
  "reparaciones",
  "matriculaciones",
  "carrito",
  "checkout",
  ...legalSlugs,
];
function context(params: Props["params"]) {
  if (
    !isLocale(params.locale) ||
    params.locale === "es" ||
    !supported.includes(params.page)
  )
    notFound();
  return {
    locale: params.locale as Locale,
    slug: params.page,
    d: copy[params.locale],
  };
}
function titleFor(locale: Locale, slug: string) {
  const d = copy[locale];
  return (
    {
      contacto: d.contact,
      nosotros: d.about,
      reparaciones: d.repairs,
      matriculaciones: d.registration,
      carrito: d.purchase,
      checkout: d.purchase,
      "aviso-legal": d.legal,
      privacidad: d.privacy,
      cookies: d.cookies,
      "condiciones-compra": d.conditions,
    }[slug] ?? d.shop
  );
}
export function generateMetadata(props: Props): Metadata {
  try {
    return pageMetadata(props);
  } catch (error) {
    if (isNotFound(error)) return missingMetadata;
    throw error;
  }
}
function pageMetadata({ params }: Props): Metadata {
  const { locale, slug, d } = context(params);
  const entry = legalEntry(locale, slug);
  const missing = legalSlugs.includes(slug) && !entry;
  const privatePage = ["carrito", "checkout"].includes(slug);
  return {
    ...staticMetadata(
      locale,
      "/" + slug,
      entry?.title ?? titleFor(locale, slug),
      legalSlugs.includes(slug) ? undefined : d.intro,
    ),
    ...(missing || privatePage
      ? { alternates: { canonical: localePath(locale, "/" + slug) } }
      : {}),
    robots: { index: !missing && !privatePage, follow: true },
  };
}
export default function Page({ params }: Props) {
  const { locale, slug, d } = context(params);
  const title = titleFor(locale, slug);
  if (legalSlugs.includes(slug)) {
    const entry = legalEntry(locale, slug);
    if (entry)
      return (
        <article className="container-custom py-16 max-w-4xl">
          <h1 className="display-lg mb-10">{entry.title}</h1>
          <div className="prose prose-invert max-w-none leading-relaxed overflow-x-auto [&_h2]:font-display [&_h2]:text-3xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:my-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-accent-orange [&_table]:w-full [&_table]:mb-6 [&_th]:p-3 [&_td]:p-3 [&_td]:border [&_td]:border-border [&_th]:border [&_th]:border-border">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <Link
                    href={
                      href?.startsWith("/")
                        ? localePath(locale, href)
                        : (href ?? "#")
                    }
                  >
                    {children}
                  </Link>
                ),
              }}
            >
              {entry.markdown}
            </ReactMarkdown>
          </div>
        </article>
      );
    const Original = {
      "aviso-legal": Aviso,
      privacidad: Privacy,
      cookies: Cookies,
      "condiciones-compra": Conditions,
    }[slug]!;
    return (
      <>
        <div className="container-custom pt-10">
          <p
            role="status"
            className="border border-accent-orange rounded-lg p-4"
          >
            {d.legalSource}
          </p>
        </div>
        <div lang="es">
          <Original />
        </div>
      </>
    );
  }
  if (["carrito", "checkout"].includes(slug))
    return (
      <section className="container-custom py-16 max-w-3xl">
        <h1 className="display-lg mb-8">{title}</h1>
        <p className="text-lg text-text-secondary leading-relaxed">{d.guide}</p>
        <p className="text-text-secondary leading-relaxed mt-5">{d.delivery}</p>
        <Link href={localePath(locale, "/tienda")} className="btn-primary mt-8">
          {d.back}
        </Link>
      </section>
    );
  if (slug === "contacto")
    return (
      <section className="container-custom py-16">
        <h1 className="display-xl mb-12">{d.contact}</h1>
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="card-base p-6 sm:p-8">
            <h2 className="font-display text-3xl mb-6">{d.write}</h2>
            <LocalContactForm
              labels={{
                name: d.name,
                email: d.email,
                phone: d.phone,
                message: d.message,
                send: d.send,
                sending: d.sending,
                sent: d.sent,
                error: d.error,
              }}
            />
            <Link
              href={localePath(locale, "/privacidad")}
              className="text-accent-orange underline text-sm"
            >
              {d.privacy}
            </Link>
          </div>
          <div className="card-base p-8 space-y-6 text-text-secondary">
            <h2 className="font-display text-3xl text-white">{d.visit}</h2>
            <p>
              C/ Jaume I, 5<br />
              43005 Tarragona · {countryName(locale)}
            </p>
            <p>{d.hours}</p>
            <p>
              <a className="text-accent-orange" href="tel:+34643274756">
                +34 643 27 47 56
              </a>
              <br />
              <a className="text-accent-orange" href="tel:+34616686593">
                +34 616 686 593
              </a>
            </p>
            <a
              className="text-accent-orange break-all block"
              href="mailto:monkeymotionoficial@gmail.com"
            >
              monkeymotionoficial@gmail.com
            </a>
            <a href="https://wa.me/34616686593" className="btn-outline">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  return (
    <>
      <section className="container-custom py-16">
        <p className="eyebrow mb-4">{d.local}</p>
        <h1 className="display-xl mb-10">{title}</h1>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
            <p>
              {slug === "nosotros"
                ? d.aboutText
                : slug === "reparaciones"
                  ? d.repairText
                  : d.registrationText}
            </p>
            {slug === "nosotros" && <p>{d.aboutMore}</p>}
            <p>C/ Jaume I, 5 · 43005 Tarragona · {countryName(locale)}</p>
            <Link
              className="btn-primary"
              href={localePath(locale, "/contacto")}
            >
              {d.contact}
            </Link>
            {slug !== "nosotros" && (
              <div>
                <Link className="btn-outline" href={"/" + slug} hrefLang="es">
                  {d.spanishForm} ↗
                </Link>
              </div>
            )}
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              fill
              src={
                slug === "nosotros"
                  ? "/imagenes/local-17.jpeg"
                  : "/imagenes/local-13.jpeg"
              }
              alt={d.support}
              sizes="(max-width:1024px) 100vw,50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
