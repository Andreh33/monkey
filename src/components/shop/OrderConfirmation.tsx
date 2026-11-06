"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, CircleAlert } from "lucide-react";
import { useCart, useCartHydration } from "@/lib/cart-store";
import { checkoutCopy, checkoutMoney } from "@/lib/checkout-copy";
import type { CheckoutStatusResult } from "@/lib/checkout-types";
import { localePath, type Locale } from "@/lib/storefront-routes";
import { CheckoutSteps } from "./CartPage";
import { CheckoutSummary } from "./CheckoutSummary";
export function OrderConfirmation({ locale = "es", token }: { locale?: Locale; token: string }) {
  const d = checkoutCopy[locale];
  const hydrated = useCartHydration();
  const consumeOrder = useCart(s => s.consumeOrder);
  const [orderState, setOrderState] = useState<{ token: string; data: CheckoutStatusResult } | null>(null);
  const data = orderState?.token === token ? orderState.data : null;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!/^[a-f0-9]{64}$/.test(token)) { setError(d.confirmationError); setLoading(false); return; }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    setLoading(true); setError("");
    async function load() {
      try {
        const response = await fetch(`/api/checkout/status?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error();
        const result: CheckoutStatusResult = await response.json();
        if (controller.signal.aborted) return;
        setOrderState({ token, data: result }); setError(""); setLoading(false);
        attempts++;
        if (!result.paid && result.status === "PENDING" && attempts < 20) timer = setTimeout(load, 3000);
      } catch {
        if (!controller.signal.aborted) { setError(d.confirmationError); setLoading(false); }
      }
    }
    void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [token, revision, d.confirmationError]);
  useEffect(() => {
    if (hydrated && data?.paid && data.status === "PAID") consumeOrder(data.orderId, data.items);
  }, [data, hydrated, consumeOrder]);
  const paid = Boolean(data?.paid && data.status === "PAID");
  const pending = data?.status === "PENDING";
  const title = paid ? d.paidTitle : pending ? d.pendingTitle : data?.status === "EXPIRED" ? d.expiredTitle : data?.status === "FAILED" ? d.failedTitle : d.checking;
  const body = paid ? d.paidBody : pending ? d.pendingBody : data?.status === "EXPIRED" ? d.expiredBody : data?.status === "FAILED" ? d.failedBody : "";
  return <section className="container-custom py-10 sm:py-16">
    <CheckoutSteps locale={locale} step={3} />
    <div className="max-w-3xl mb-10" role="status" aria-live="polite">
      {paid ? <CheckCircle2 size={48} className="text-success mb-6" /> : pending || loading ? <Clock3 size={48} className="text-accent-orange mb-6" /> : <CircleAlert size={48} className="text-text-muted mb-6" />}
      <h1 className="display-lg leading-tight mb-5">{error && !data ? d.confirmationError : title}</h1>
      {body && <p className="text-text-secondary leading-relaxed">{body}</p>}
      {data && <p className="mt-5 text-sm text-text-secondary">{d.orderNumber}: <strong className="text-white font-mono break-all">{data.orderId}</strong></p>}
      {error && data && <p className="mt-4 text-red-300" role="alert">{error}</p>}
    </div>
    {data && <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)] gap-8">
      <div className="card-base p-5 sm:p-8"><ul className="divide-y divide-border">{data.items.map(item => <li key={item.productId} className="py-4 first:pt-0 flex items-start justify-between gap-5"><div className="min-w-0"><p className="font-semibold break-words">{item.name}</p><p className="text-sm text-text-secondary mt-2">{d.quantity}: {item.quantity} · {checkoutMoney(item.unitPriceCents, locale)} / {d.perUnit}</p></div><p className="font-mono shrink-0">{checkoutMoney(item.lineTotalCents, locale)}</p></li>)}</ul></div>
      <CheckoutSummary locale={locale} quote={data} showPaymentNote={false} />
    </div>}
    <div className="flex flex-wrap gap-4 mt-8">
      {!paid && <button type="button" onClick={() => setRevision(n => n + 1)} disabled={loading} className="btn-outline disabled:opacity-50">{d.refreshStatus}</button>}
      <Link href={localePath(locale, paid ? "/tienda" : "/carrito")} className="btn-primary">{paid ? d.keepShopping : d.backCart}</Link>
      <Link href={localePath(locale, "/contacto")} className="btn-outline">{d.contact}</Link>
    </div>
  </section>;
}
