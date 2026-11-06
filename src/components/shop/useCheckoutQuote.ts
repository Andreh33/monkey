"use client";
import { useEffect, useState } from "react";
import { useCart, useCartHydration } from "@/lib/cart-store";
import { CHECKOUT_COUNTRIES, type CheckoutCountry, type CheckoutQuote } from "@/lib/checkout-types";
import { checkoutError } from "@/lib/checkout-copy";
import type { Locale } from "@/lib/storefront-routes";
export function useCheckoutQuote(locale: Locale, country: CheckoutCountry, postalCode: string, enabled = true) {
  const hydrated = useCartHydration();
  const items = useCart(s => s.items);
  const syncQuote = useCart(s => s.syncQuote);
  const [revision, setRevision] = useState(0);
  const [allowedCountries, setAllowedCountries] = useState<CheckoutCountry[]>(["ES"]);
  const requestKey = JSON.stringify({ items: items.map(i => ({ productId: i.id, quantity: i.quantity })), country, ...(postalCode.trim() ? { postalCode: postalCode.trim() } : {}) });
  const [state, setState] = useState<{ key: string; quote: CheckoutQuote | null; error: string; loading: boolean }>({ key: "", quote: null, error: "", loading: true });
  useEffect(() => {
    if (!hydrated || !enabled) return;
    if (!items.length) { setState({ key: requestKey, quote: null, error: "", loading: false }); return; }
    const controller = new AbortController();
    setState({ key: requestKey, quote: null, error: "", loading: true });
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: requestKey, signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!controller.signal.aborted) {
          if (Array.isArray(data.allowedCountries)) setAllowedCountries(data.allowedCountries.filter((c: CheckoutCountry) => CHECKOUT_COUNTRIES.includes(c)));
          if (!response.ok) { setState({ key: requestKey, quote: null, error: checkoutError(data.code, locale), loading: false }); return; }
          setState({ key: requestKey, quote: data, error: "", loading: false });
          syncQuote(data.items);
        }
      } catch (error) {
        if (!controller.signal.aborted) setState({ key: requestKey, quote: null, error: checkoutError(undefined, locale), loading: false });
      }
    }, 250);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [requestKey, hydrated, enabled, revision, locale, syncQuote, items.length]);
  const current = enabled && hydrated && state.key === requestKey;
  return { quote: current ? state.quote : null, allowedCountries, error: current ? state.error : "", loading: !current || state.loading, refresh: () => setRevision(n => n + 1), hydrated };
}
