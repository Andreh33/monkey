import { notFound } from "next/navigation";
import { CheckoutPage } from "@/components/shop/CheckoutPage";
import { checkoutCopy } from "@/lib/checkout-copy";
import { isLocale, localePath } from "@/lib/storefront-routes";
import { CHECKOUT_COUNTRIES, type CheckoutCountry } from "@/lib/checkout-types";
export function generateMetadata({ params }: { params: { locale: string } }) { const locale = isLocale(params.locale) ? params.locale : "es"; return { title: checkoutCopy[locale].checkout, robots: { index: false, follow: false }, referrer: "no-referrer" as const, alternates: { canonical: localePath(locale, "/checkout") } }; }
export default function Page({ params, searchParams }: { params: { locale: string }; searchParams: Record<string, string | string[] | undefined> }) {
  if (!isLocale(params.locale) || params.locale === "es") notFound();
  const country = typeof searchParams.country === "string" && CHECKOUT_COUNTRIES.includes(searchParams.country as CheckoutCountry) ? searchParams.country as CheckoutCountry : "ES";
  return <CheckoutPage locale={params.locale} initialCountry={country} cancelled={searchParams.cancelled === "1"} cancelToken={typeof searchParams.token === "string" ? searchParams.token : ""} />;
}
