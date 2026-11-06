import { LockKeyhole } from "lucide-react";
import { checkoutCopy, checkoutMoney } from "@/lib/checkout-copy";
import type { CheckoutQuote } from "@/lib/checkout-types";
import type { Locale } from "@/lib/storefront-routes";
export function CheckoutSummary({ locale, quote, loading, children, showItems = false, showPaymentNote = true }: { locale: Locale; quote: (Pick<CheckoutQuote, "subtotalCents" | "shippingCents" | "totalCents"> & Partial<Pick<CheckoutQuote, "items">>) | null; loading?: boolean; children?: React.ReactNode; showItems?: boolean; showPaymentNote?: boolean }) {
  const d = checkoutCopy[locale];
  return <aside className="card-base p-6 sm:p-8 self-start lg:sticky lg:top-36">
    <h2 className="font-display text-3xl mb-6">{d.summary}</h2>
    {showItems && quote?.items && <ul className="space-y-3 border-b border-border pb-5 mb-5">{quote.items.map(item => <li key={item.productId} className="flex gap-3 justify-between text-sm"><span className="text-text-secondary break-words min-w-0">{item.quantity} × {item.name}</span><span className="font-mono shrink-0">{checkoutMoney(item.lineTotalCents, locale)}</span></li>)}</ul>}
    {loading ? <p className="text-text-secondary py-6" role="status">{d.loading}</p> : quote && <dl className="space-y-4">
      <div className="flex justify-between gap-4"><dt className="text-text-secondary">{d.subtotal}</dt><dd className="font-mono">{checkoutMoney(quote.subtotalCents, locale)}</dd></div>
      <div className="flex justify-between gap-4"><dt className="text-text-secondary">{d.shipping}</dt><dd className="font-mono">{checkoutMoney(quote.shippingCents, locale)}</dd></div>
      <div className="flex justify-between gap-4 border-t border-border pt-5"><dt className="font-semibold">{d.total}</dt><dd className="font-mono text-2xl text-accent-orange">{checkoutMoney(quote.totalCents, locale)}</dd></div>
    </dl>}
    <p className="text-xs text-text-muted mt-4">{d.included}. {d.shippingNotice}</p>
    <div className="mt-6 space-y-4">{children}</div>
    {showPaymentNote && <p className="flex gap-2 text-xs leading-relaxed text-text-secondary mt-6"><LockKeyhole size={16} className="shrink-0 mt-0.5" aria-hidden="true" />{d.secure}</p>}
  </aside>;
}
