"use client";
import { ShoppingCart } from "lucide-react";
import { useCart, useCartHydration } from "@/lib/cart-store";
import { checkoutCopy } from "@/lib/checkout-copy";
import type { Locale } from "@/lib/storefront-routes";
export function CartButton({ locale = "es" }: { locale?: Locale }) {
  const hydrated = useCartHydration();
  const count = useCart(s => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const open = useCart(s => s.setOpen);
  return <button data-cart-trigger type="button" onClick={() => open(true)} className="relative p-2.5 rounded-md hover:bg-bg-tertiary transition-colors" aria-label={`${checkoutCopy[locale].cart}${hydrated && count ? ` (${count})` : ""}`}>
    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
    {hydrated && count > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-accent-red text-white">{count}</span>}
  </button>;
}
