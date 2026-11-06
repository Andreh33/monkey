"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart, useCartHydration } from "@/lib/cart-store";
import { purchaseEligible } from "@/lib/purchase";
import { checkoutCopy } from "@/lib/checkout-copy";
import { localePath, type Locale } from "@/lib/storefront-routes";
import { copy } from "@/lib/storefront-copy";
export type BuyableProduct = { id: string; slug: string; name: string; brand?: string | null; price: number; active: boolean; stock: number; images: { url: string }[] };
export function AddToCart({ product, locale = "es" }: { product: BuyableProduct; locale?: Locale }) {
  const d = checkoutCopy[locale];
  const hydrated = useCartHydration();
  const current = useCart(s => s.items.find(i => i.id === product.id)?.quantity ?? 0);
  const addItem = useCart(s => s.addItem);
  const setOpen = useCart(s => s.setOpen);
  const [quantity, setQuantity] = useState(1);
  const remaining = Math.max(0, Math.min(product.stock, 99) - current);
  const available = purchaseEligible(product);
  useEffect(() => { setQuantity(q => Math.max(1, Math.min(q, remaining))); }, [remaining]);
  function add() {
    if (!available || !hydrated || remaining < 1) return;
    if (current === 0 && useCart.getState().items.length >= 50) { toast.error(d.cartLimit); return; }
    addItem({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: product.price, stock: product.stock, image: product.images[0]?.url }, quantity);
    toast.success(d.added);
    setOpen(true);
  }
  return <div className="space-y-4">
    {available && <div className="flex items-center gap-4">
      <span className="text-sm text-text-secondary">{d.quantity}</span>
      <div className="inline-flex items-center border border-border rounded-md">
        <button type="button" aria-label={`− ${d.quantity}`} disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)} className="p-3 disabled:opacity-30 hover:bg-bg-tertiary"><Minus size={16} /></button>
        <output className="min-w-10 text-center font-mono">{quantity}</output>
        <button type="button" aria-label={`+ ${d.quantity}`} disabled={quantity >= remaining} onClick={() => setQuantity(q => q + 1)} className="p-3 disabled:opacity-30 hover:bg-bg-tertiary"><Plus size={16} /></button>
      </div>
    </div>}
    <button type="button" onClick={add} disabled={!available || !hydrated || remaining < 1} className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
      <ShoppingCart size={18} aria-hidden="true" /> {available ? d.add : copy[locale].soldOut}
    </button>
    {available && hydrated && remaining === 0 && <p className="text-sm text-text-secondary" role="status">{d.full}</p>}
    {hydrated && current > 0 && <Link href={localePath(locale, "/carrito")} className="btn-outline w-full">{d.cart} ({current})</Link>}
    {!available && <Link href={localePath(locale, "/contacto")} className="text-sm text-accent-orange underline">{d.contact}</Link>}
  </div>;
}
