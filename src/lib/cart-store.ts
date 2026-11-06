"use client";
import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addCartItem, setCartQuantity, consumePurchasedItems, sanitizeCartItems, type CartItem } from "./cart-logic";
import type { CheckoutQuoteItem } from "./checkout-types";
export type { CartItem } from "./cart-logic";
type CartState = {
  items: CartItem[];
  completedOrders: string[];
  hydrated: boolean;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  syncQuote: (items: CheckoutQuoteItem[]) => void;
  consumeOrder: (orderId: string, items: { productId: string; quantity: number }[]) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
};
// Shopping still works in memory when browser storage is blocked or full.
const storage = createJSONStorage(() => ({
  getItem: (key: string) => { try { return window.localStorage.getItem(key); } catch { return null; } },
  setItem: (key: string, value: string) => { try { window.localStorage.setItem(key, value); } catch { /* Use the current in-memory cart. */ } },
  removeItem: (key: string) => { try { window.localStorage.removeItem(key); } catch { /* No stored cart is available. */ } },
}));
export const useCart = create<CartState>()(persist((set, get) => ({
  items: [], completedOrders: [], hydrated: false, isOpen: false,
  addItem: (item, quantity = 1) => set(s => ({ items: addCartItem(s.items, item, quantity) })),
  removeItem: id => set(s => ({ items: s.items.filter(i => i.id !== id) })),
  updateQuantity: (id, quantity) => set(s => ({ items: setCartQuantity(s.items, id, quantity) })),
  syncQuote: quoted => set(s => ({ items: s.items.map(i => {
    const q = quoted.find(q => q.productId === i.id);
    return q ? { ...i, name: q.name, slug: q.slug, price: q.unitPriceCents / 100, stock: q.stock, image: q.image } : i;
  }) })),
  consumeOrder: (orderId, purchased) => set(s => consumePurchasedItems(s.items, s.completedOrders, orderId, purchased)),
  clear: () => set({ items: [] }),
  setOpen: isOpen => set({ isOpen }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100,
}), {
  name: "monopatin-cart", version: 2, skipHydration: true, storage,
  partialize: s => ({ items: s.items, completedOrders: s.completedOrders }),
  migrate: value => {
    const old = value as Partial<CartState> | undefined;
    return { items: sanitizeCartItems(old?.items), completedOrders: [] };
  },
  merge: (persisted, current) => {
    const p = persisted as Partial<CartState> | undefined;
    return { ...current, items: sanitizeCartItems(p?.items), completedOrders: Array.isArray(p?.completedOrders) ? p.completedOrders.filter(x => typeof x === "string").slice(-100) : [] };
  },
}));
let hydration: Promise<void> | undefined;
export function useCartHydration() {
  const hydrated = useCart(s => s.hydrated);
  useEffect(() => {
    hydration ??= Promise.resolve(useCart.persist.rehydrate()).then(() => { useCart.setState({ hydrated: true }); }, () => { useCart.setState({ hydrated: true }); });
  }, []);
  return hydrated;
}
