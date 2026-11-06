import { CheckoutPage } from "@/components/shop/CheckoutPage";
import { CHECKOUT_COUNTRIES, type CheckoutCountry } from "@/lib/checkout-types";
export const metadata = { title: "Finalizar compra", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const country = typeof searchParams.country === "string" && CHECKOUT_COUNTRIES.includes(searchParams.country as CheckoutCountry) ? searchParams.country as CheckoutCountry : "ES";
  return <CheckoutPage initialCountry={country} cancelled={searchParams.cancelled === "1"} cancelToken={typeof searchParams.token === "string" ? searchParams.token : ""} />;
}
