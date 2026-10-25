"use client";
import { createContext, useContext } from "react";
import Link from "next/link";
import { copy } from "@/lib/storefront-copy";
import { localePath, type Locale } from "@/lib/storefront-routes";
const LocaleContext = createContext<Locale>("es");
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
export function NotFoundMessage() {
  const locale = useContext(LocaleContext),
    d = copy[locale];
  return (
    <section className="container-custom py-20">
      <p className="eyebrow">404</p>
      <h1 className="display-lg my-6">{d.notFound}</h1>
      <Link className="btn-primary" href={localePath(locale, "/tienda")}>
        {d.back}
      </Link>
    </section>
  );
}
