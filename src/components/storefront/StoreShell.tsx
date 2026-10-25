import Link from "next/link";
import { Suspense } from "react";
import { copy, countryName } from "@/lib/storefront-copy";
import { localePath, type Locale } from "@/lib/storefront-routes";
import { LanguageSwitcher } from "./LanguageSwitcher";
export function StoreHeader({ locale }: { locale: Locale }) {
  const d = copy[locale];
  return (
    <header className="border-b border-border bg-bg-primary sticky top-0 z-40">
      <div className="container-custom py-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={localePath(locale)}
            className="font-display text-3xl tracking-wider"
          >
            MONOPATÍN <span className="text-accent-orange">MONKEY</span>
          </Link>
          <span className="text-xs font-mono text-text-muted">TARRAGONA</span>
        </div>
        <nav
          aria-label={d.shop}
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm"
        >
          {[
            ["/tienda", d.shop],
            ["/reparaciones", d.repairs],
            ["/matriculaciones", d.registration],
            ["/nosotros", d.about],
            ["/contacto", d.contact],
          ].map(([url, label]) => (
            <Link
              className="hover:text-accent-orange"
              key={url}
              href={localePath(locale, url)}
            >
              {label}
            </Link>
          ))}
          <Link href="/blog" hrefLang="es">
            {d.blog}
          </Link>
        </nav>
        <Suspense>
          <LanguageSwitcher locale={locale} />
        </Suspense>
      </div>
    </header>
  );
}
export function StoreFooter({ locale }: { locale: Locale }) {
  const d = copy[locale];
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="container-custom py-12 space-y-6">
        <p className="font-display text-3xl">MONOPATÍN MONKEY</p>
        <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
          {d.delivery}
        </p>
        <nav className="flex flex-wrap gap-5 text-sm" aria-label={d.legal}>
          {[
            ["/condiciones-compra", d.conditions],
            ["/privacidad", d.privacy],
            ["/aviso-legal", d.legal],
            ["/cookies", d.cookies],
            ["/carrito", d.purchase],
            ["/contacto", d.contact],
          ].map(([url, label]) => (
            <Link
              key={url}
              href={localePath(locale, url)}
              className="hover:text-accent-orange"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-text-muted">
          C/ Jaume I, 5 · 43005 Tarragona · {countryName(locale)}
        </p>
      </div>
    </footer>
  );
}
