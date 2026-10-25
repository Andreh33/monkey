"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { localePath, locales, type Locale } from "@/lib/storefront-routes";
import { copy } from "@/lib/storefront-copy";
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const path = usePathname();
  const params = useSearchParams();
  // Editorial and account routes have no translated counterpart.
  const supported =
    /^\/(?:fr\/|it\/|pt\/)?(?:tienda(?:\/|$)|contacto$|nosotros$|reparaciones$|matriculaciones$|aviso-legal$|privacidad$|cookies$|condiciones-compra$|carrito$|checkout$)/.test(
      path,
    ) || /^\/(fr|it|pt)?$/.test(path);
  const target = supported
    ? path + (params.size ? "?" + params.toString() : "")
    : "/";
  return (
    <nav
      aria-label={copy[locale].language}
      className="flex flex-wrap items-center gap-3 text-xs font-mono"
    >
      <span>{copy[locale].language}:</span>
      {locales.map((l) => (
        <Link
          key={l}
          href={localePath(l, target)}
          hrefLang={l}
          aria-current={locale === l ? "page" : undefined}
          className={
            locale === l
              ? "text-accent-orange font-bold underline"
              : "hover:text-accent-orange"
          }
        >
          {
            { es: "Español", fr: "Français", it: "Italiano", pt: "Português" }[
              l
            ]
          }
        </Link>
      ))}
    </nav>
  );
}
