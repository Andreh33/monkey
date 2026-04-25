"use client";

import { useCart } from "@/lib/cart-store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem, totalPrice } = useCart();
  const total = totalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-bg-primary border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="eyebrow">Tu carrito</p>
                <h3 className="font-display text-2xl mt-1">{items.length} {items.length === 1 ? "producto" : "productos"}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-bg-tertiary" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-14 h-14 text-text-muted mb-4" />
                  <p className="text-text-secondary mb-6">Tu carrito está vacío</p>
                  <Link href="/tienda" onClick={() => setOpen(false)} className="btn-primary">Ver tienda</Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 p-3 rounded-lg bg-bg-secondary border border-border">
                      <div className="relative w-20 h-24 rounded-md overflow-hidden bg-bg-tertiary shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.brand && <p className="text-[10px] uppercase tracking-widest text-text-muted">{item.brand}</p>}
                        <p className="text-sm font-semibold leading-tight line-clamp-2">{item.name}</p>
                        <p className="price-mono text-sm mt-1">{formatPrice(item.price)}<span className="currency">€</span></p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center border border-border rounded-md">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-bg-tertiary"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="px-3 text-sm font-mono">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-bg-tertiary"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-2 text-text-muted hover:text-accent-red"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary uppercase tracking-wider">Total</span>
                  <span className="price-mono text-2xl">{formatPrice(total)}<span className="currency">€</span></span>
                </div>
                <Link href="/carrito" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Ver carrito
                </Link>
                <button onClick={() => setOpen(false)} className="btn-outline w-full">Seguir comprando</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
