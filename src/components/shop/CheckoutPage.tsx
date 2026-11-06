"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { checkoutCopy, checkoutError } from "@/lib/checkout-copy";
import { checkoutAttemptCanReset } from "@/lib/checkout-client";
import { localePath, type Locale } from "@/lib/storefront-routes";
import type { CheckoutCountry, CheckoutCustomer, CheckoutCreateInput, CheckoutCreateResult, CheckoutStatusResult } from "@/lib/checkout-types";
import { useCheckoutQuote } from "./useCheckoutQuote";
import { CheckoutSummary } from "./CheckoutSummary";
import { CheckoutSteps, CountrySelect, EmptyCart } from "./CartPage";

const tokenIsValid = (value: string) => /^[a-f0-9]{64}$/.test(value);
function newToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join(""); }
export function CheckoutPage({ locale = "es", initialCountry = "ES", cancelled = false, cancelToken = "" }: { locale?: Locale; initialCountry?: CheckoutCountry; cancelled?: boolean; cancelToken?: string }) {
  const d = checkoutCopy[locale];
  const items = useCart(s => s.items);
  const [customer, setCustomer] = useState<CheckoutCustomer>({ firstName: "", lastName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", region: "", postalCode: "", country: initialCountry });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cancelReady, setCancelReady] = useState(!cancelled || !tokenIsValid(cancelToken));
  const [cancelRevision, retryCancel] = useState(0);
  const [cancelError, setCancelError] = useState("");
  const attempt = useRef<{ fingerprint: string; token: string }>();
  const { quote, allowedCountries, loading, error: quoteError, refresh, hydrated } = useCheckoutQuote(locale, customer.country, customer.postalCode, cancelReady);
  const confirmationUrl = (token: string) => localePath(locale, `/checkout/confirmacion?token=${encodeURIComponent(token)}`);
  useEffect(() => {
    if (!cancelled || !tokenIsValid(cancelToken)) return;
    let current = true;
    setCancelReady(false); setCancelError("");
    fetch("/api/checkout/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkoutToken: cancelToken }) })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(checkoutError(data.code, locale));
        if (!current) return;
        if (data.paid || data.status === "PENDING") window.location.replace(localePath(locale, `/checkout/confirmacion?token=${cancelToken}`));
        else setCancelReady(true);
      }).catch(() => { if (current) setCancelError(d.error); });
    return () => { current = false; };
  }, [cancelled, cancelToken, cancelRevision, locale, d.error]);

  function field(name: keyof CheckoutCustomer, value: string) { setCustomer(c => ({ ...c, [name]: value })); setError(""); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !terms || !items.length || !cancelReady) return;
    const base = { items: items.map(i => ({ productId: i.id, quantity: i.quantity })), customer, termsAccepted: true as const, locale };
    const fingerprint = JSON.stringify(base);
    const previous = attempt.current;
    setError("");
    // An uncertain response may already have reserved this stock. Keep the same
    // token and payload on retry, without asking for a quote against that reserve.
    if (previous && previous.fingerprint !== fingerprint) {
      setSubmitting(true);
      try {
        const response = await fetch("/api/checkout/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkoutToken: previous.token }) });
        const result: Partial<CheckoutStatusResult> = await response.json();
        if (!response.ok) throw new Error();
        if (result.paid || result.status === "PENDING") { window.location.assign(confirmationUrl(previous.token)); return; }
        attempt.current = undefined; refresh(); setError(d.changedError);
      } catch { setError(d.error); }
      finally { setSubmitting(false); }
      return;
    }
    if (!previous && (loading || !quote || quoteError)) { setError(quoteError || d.loading); refresh(); return; }
    const current = previous ?? { fingerprint, token: newToken() };
    attempt.current = current;
    const payload: CheckoutCreateInput = { ...base, checkoutToken: current.token };
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        if (checkoutAttemptCanReset(data.code, Boolean(previous))) { attempt.current = undefined; refresh(); }
        setError(checkoutError(data.code, locale)); setSubmitting(false); return;
      }
      const result = data as CheckoutCreateResult;
      const target = new URL(result.url, window.location.origin);
      const stripeDestination = target.protocol === "https:" && target.hostname === "checkout.stripe.com";
      const orderDestination = target.origin === window.location.origin && /\/checkout\/confirmacion$/.test(target.pathname);
      if (!stripeDestination && !orderDestination) throw new Error(d.error);
      window.location.assign(target.href);
    } catch { setError(d.error); setSubmitting(false); }
  }

  const fields: { name: keyof CheckoutCustomer; auto: string; type?: string; max: number; min?: number; wide?: boolean; optional?: boolean }[] = [
    { name: "firstName", auto: "given-name", max: 100 }, { name: "lastName", auto: "family-name", max: 100 },
    { name: "email", auto: "email", type: "email", max: 254 }, { name: "phone", auto: "tel", type: "tel", max: 30, min: 7 },
    { name: "addressLine1", auto: "shipping address-line1", max: 200, min: 3, wide: true }, { name: "addressLine2", auto: "shipping address-line2", max: 200, wide: true, optional: true },
    { name: "postalCode", auto: "shipping postal-code", max: 20, min: 3 }, { name: "city", auto: "shipping address-level2", max: 100, min: 2 },
    { name: "region", auto: "shipping address-level1", max: 100, min: 2 },
  ];
  return <section className="container-custom py-10 sm:py-16">
    <CheckoutSteps locale={locale} step={2} /><h1 className="display-lg mb-8">{d.checkout}</h1>
    {cancelled && <p role="status" className="rounded-lg border border-border p-4 text-text-secondary mb-6">{d.cancelled}</p>}
    {!cancelReady ? <div className="card-base p-8"><p role="status">{cancelError || d.loading}</p>{cancelError && <button className="btn-outline mt-5" onClick={() => retryCancel(n => n + 1)}>{d.refresh}</button>}</div> : !hydrated ? <p role="status">{d.loading}</p> : !items.length ? <EmptyCart locale={locale} /> : <form onSubmit={submit} className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)] gap-8 lg:gap-12">
      <div className="min-w-0"><div className="card-base p-5 sm:p-8"><h2 className="font-display text-3xl mb-6">{d.customer}</h2><fieldset disabled={submitting} className="grid sm:grid-cols-2 gap-5 disabled:opacity-70">
        {fields.map(f => <label key={f.name} className={`block ${f.wide ? "sm:col-span-2" : ""}`}><span className="label-base">{d[f.name as keyof Pick<typeof d, "firstName" | "lastName" | "email" | "phone" | "addressLine1" | "addressLine2" | "postalCode" | "city" | "region">]}</span><input name={f.name} type={f.type ?? "text"} autoComplete={f.auto} maxLength={f.max} minLength={f.min} pattern={f.name === "postalCode" ? customer.country === "PT" ? "[0-9]{4}-?[0-9]{3}" : ["ES", "FR", "IT"].includes(customer.country) ? "[0-9]{5}" : undefined : undefined} required={!f.optional} value={customer[f.name] ?? ""} onChange={e => field(f.name, e.target.value)} className="input-base" /></label>)}
        <CountrySelect locale={locale} value={customer.country} onChange={value => field("country", value)} allowedCountries={allowedCountries} />
      </fieldset></div><Link href={localePath(locale, "/carrito")} className="inline-block mt-6 text-sm text-accent-orange underline">{d.backCart}</Link></div>
      <CheckoutSummary locale={locale} quote={quote} loading={loading} showItems>
        <label className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed"><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required className="h-4 w-4 mt-1 shrink-0 accent-accent-red" /><span>{d.accept} <Link href={localePath(locale, "/condiciones-compra")} target="_blank" className="text-accent-orange underline">{d.conditions}</Link> {d.and} <Link href={localePath(locale, "/privacidad")} target="_blank" className="text-accent-orange underline">{d.privacy}</Link>.</span></label>
        {(error || quoteError) && <p role="alert" className="text-sm text-red-300">{error || quoteError}</p>}
        <button type="submit" disabled={submitting || !terms || ((!quote || loading) && !attempt.current)} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? d.redirect : d.pay}</button>
        {quoteError && <button type="button" onClick={refresh} className="text-sm text-accent-orange underline">{d.refresh}</button>}
      </CheckoutSummary>
    </form>}
  </section>;
}
