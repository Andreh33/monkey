"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { checkoutCopy, checkoutMoney } from "@/lib/checkout-copy";
import { localePath, type Locale } from "@/lib/storefront-routes";
import type { CheckoutCountry } from "@/lib/checkout-types";
import { useCheckoutQuote } from "./useCheckoutQuote";
import { CheckoutSummary } from "./CheckoutSummary";
export function CountrySelect({ locale, value, onChange, allowedCountries }: { locale: Locale; value: CheckoutCountry; onChange: (country: CheckoutCountry) => void; allowedCountries: CheckoutCountry[] }) {
  const countries = new Intl.DisplayNames([locale], { type: "region" });
  const options = allowedCountries.includes(value) ? allowedCountries : [value, ...allowedCountries];
  return <label className="block"><span className="label-base">{checkoutCopy[locale].country}</span><select name="country" value={value} onChange={e => onChange(e.target.value as CheckoutCountry)} autoComplete="shipping country" className="input-base" required>{options.map(c => <option key={c} value={c} disabled={!allowedCountries.includes(c)}>{countries.of(c)}</option>)}</select></label>;
}
export function CheckoutSteps({ locale, step }: { locale: Locale; step: 1 | 2 | 3 }) {
  const d = checkoutCopy[locale];
  return <ol className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm mb-10">{[d.cart, d.delivery, d.payment].map((label, i) => <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={`flex items-center gap-2 ${i + 1 <= step ? "text-white" : "text-text-muted"}`}><span className={`grid place-items-center rounded-full w-7 h-7 border font-mono ${step === i + 1 ? "border-accent-red bg-accent-red" : "border-border"}`}>{i + 1}</span>{label}</li>)}</ol>;
}
export function EmptyCart({ locale }: { locale: Locale }) { const d = checkoutCopy[locale]; return <div className="card-base p-12 text-center"><ShoppingBag size={48} className="mx-auto text-text-muted mb-6" /><h2 className="font-display text-3xl mb-6">{d.empty}</h2><Link href={localePath(locale, "/tienda")} className="btn-primary">{d.shop}</Link></div>; }
export function CartPage({ locale = "es" }: { locale?: Locale }) {
  const d = checkoutCopy[locale];
  const { items, updateQuantity, removeItem } = useCart();
  const [country, setCountry] = useState<CheckoutCountry>("ES");
  const { quote, allowedCountries, loading, error, refresh, hydrated } = useCheckoutQuote(locale, country, "");
  return <section className="container-custom py-10 sm:py-16">
    <CheckoutSteps locale={locale} step={1} /><h1 className="display-lg mb-8">{d.cart}</h1>
    {!hydrated ? <p role="status">{d.loading}</p> : !items.length ? <EmptyCart locale={locale} /> : <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)] gap-8 lg:gap-12">
      <div className="min-w-0 space-y-6"><ul className="space-y-4">{items.map(item => {
        const line = quote?.items.find(i => i.productId === item.id);
        return <li key={item.id} className="card-base p-4 sm:p-6 flex gap-4 sm:gap-6">
          <div className="relative bg-white w-20 h-24 sm:w-28 sm:h-32 rounded-lg overflow-hidden shrink-0">{item.image && <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain" />}</div>
          <div className="min-w-0 flex-1"><Link className="font-semibold hover:text-accent-orange break-words" href={localePath(locale, `/tienda/${item.slug}`)}>{item.name}</Link><p className="text-sm font-mono mt-2">{checkoutMoney(line?.unitPriceCents ?? Math.round(item.price * 100), locale)} <span className="text-text-muted">/ {d.perUnit}</span></p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center border border-border rounded-md"><button type="button" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`− ${d.quantity}: ${item.name}`} className="p-3 disabled:opacity-30"><Minus size={16} /></button><input aria-label={`${d.quantity}: ${item.name}`} type="number" min={1} max={Math.min(item.stock, 99)} value={item.quantity} onChange={e => { const quantity = Number(e.target.value); if (quantity >= 1) updateQuantity(item.id, quantity); }} className="w-12 bg-transparent text-center font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" /><button type="button" disabled={item.quantity >= Math.min(item.stock, 99)} onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`+ ${d.quantity}: ${item.name}`} className="p-3 disabled:opacity-30"><Plus size={16} /></button></div><button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-2 p-2 text-sm text-text-muted hover:text-accent-red"><Trash2 size={16} />{d.remove}</button></div>
          </div>
        </li>;
      })}</ul><div className="max-w-sm"><CountrySelect locale={locale} value={country} onChange={setCountry} allowedCountries={allowedCountries} /></div><Link href={localePath(locale, "/tienda")} className="inline-block text-sm text-accent-orange underline">{d.keepShopping}</Link></div>
      <CheckoutSummary locale={locale} quote={quote} loading={loading}>
        {error && <div role="alert" className="text-sm text-red-300"><p>{error}</p><button type="button" onClick={refresh} className="mt-3 underline">{d.refresh}</button></div>}
        {quote && !loading && !error ? <Link href={localePath(locale, `/checkout?country=${country}`)} className="btn-primary w-full">{d.continue}<ArrowRight size={16} /></Link> : <button disabled className="btn-primary w-full opacity-50">{d.continue}</button>}
      </CheckoutSummary>
    </div>}
  </section>;
}
