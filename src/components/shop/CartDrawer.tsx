"use client";
import Link from "next/link";
import { useRef } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, useCartHydration } from "@/lib/cart-store";
import { checkoutCopy, checkoutMoney } from "@/lib/checkout-copy";
import { localePath, type Locale } from "@/lib/storefront-routes";
export function CartDrawer({ locale = "es" }: { locale?: Locale }) {
  const hydrated = useCartHydration();
  const { items, isOpen, setOpen, updateQuantity, removeItem } = useCart();
  const d = checkoutCopy[locale];
  const previousFocus = useRef<HTMLElement | null>(null);
  const total = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
  return <Dialog.Root open={isOpen} onOpenChange={setOpen}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
      <Dialog.Content onOpenAutoFocus={() => { previousFocus.current = document.activeElement as HTMLElement | null; }} onCloseAutoFocus={event => { event.preventDefault(); const target = previousFocus.current?.isConnected ? previousFocus.current : document.querySelector<HTMLElement>("[data-cart-trigger]"); target?.focus(); }} className="fixed top-0 right-0 z-[61] h-[100dvh] w-full max-w-md bg-bg-primary border-l border-border flex flex-col shadow-2xl focus:outline-none" aria-describedby={undefined}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Dialog.Title className="font-display text-3xl">{d.cart}</Dialog.Title>
          <Dialog.Close className="p-3 rounded-md hover:bg-bg-tertiary" aria-label={d.close}><X size={20} /></Dialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!hydrated ? <p role="status">{d.loading}</p> : items.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-14 h-14 text-text-muted mb-4" /><p className="text-text-secondary mb-6">{d.empty}</p><Link href={localePath(locale, "/tienda")} onClick={() => setOpen(false)} className="btn-primary">{d.shop}</Link>
          </div> : <ul className="space-y-4">{items.map(item => <li key={item.id} className="flex gap-3 p-3 rounded-lg bg-bg-secondary border border-border">
            <div className="relative w-16 h-20 rounded-md overflow-hidden bg-white shrink-0">{item.image && <Image src={item.image} alt={item.name} fill className="object-contain" sizes="64px" />}</div>
            <div className="flex-1 min-w-0">
              <Link href={localePath(locale, `/tienda/${item.slug}`)} onClick={() => setOpen(false)} className="text-sm font-semibold leading-tight line-clamp-2 hover:text-accent-orange">{item.name}</Link>
              <p className="font-mono text-sm mt-2">{checkoutMoney(Math.round(item.price * 100) * item.quantity, locale)}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center border border-border rounded-md">
                  <button type="button" aria-label={`− ${d.quantity}: ${item.name}`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2.5 disabled:opacity-30"><Minus size={14} /></button><span className="px-2 text-sm font-mono">{item.quantity}</span>
                  <button type="button" aria-label={`+ ${d.quantity}: ${item.name}`} disabled={item.quantity >= Math.min(item.stock, 99)} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2.5 disabled:opacity-30"><Plus size={14} /></button>
                </div><button type="button" onClick={() => removeItem(item.id)} aria-label={`${d.remove}: ${item.name}`} className="p-2.5 text-text-muted hover:text-accent-red"><Trash2 size={17} /></button>
              </div>
            </div>
          </li>)}</ul>}
        </div>
        {items.length > 0 && <div className="border-t border-border px-6 py-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">{d.subtotal}</span><span className="font-mono text-xl">{checkoutMoney(total, locale)}</span></div>
          <p className="text-xs text-text-muted">{d.included}. {d.shippingNotice}</p>
          <Link href={localePath(locale, "/carrito")} onClick={() => setOpen(false)} className="btn-primary w-full">{d.cart}</Link>
          <button type="button" onClick={() => setOpen(false)} className="btn-outline w-full">{d.keepShopping}</button>
        </div>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
