import { notFound } from "next/navigation";
import { OrderConfirmation } from "@/components/shop/OrderConfirmation";
import { checkoutCopy } from "@/lib/checkout-copy";
import { isLocale } from "@/lib/storefront-routes";
export function generateMetadata({ params }: { params: { locale: string } }) { const locale = isLocale(params.locale) ? params.locale : "es"; return { title: checkoutCopy[locale].orderNumber, robots: { index: false, follow: false }, referrer: "no-referrer" as const }; }
export default function Page({ params, searchParams }: { params: { locale: string }; searchParams: { token?: string | string[] } }) {
  if (!isLocale(params.locale) || params.locale === "es") notFound();
  return <OrderConfirmation locale={params.locale} token={typeof searchParams.token === "string" ? searchParams.token : ""} />;
}
