export type CartItem = {
  id: string; slug: string; name: string; brand?: string | null;
  price: number; image?: string; quantity: number; stock: number;
};
const quantityLimit = (stock: number) => Math.min(99, Math.max(0, Math.floor(stock)));
export function addCartItem(items: CartItem[], item: Omit<CartItem, "quantity">, quantity = 1): CartItem[] {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || item.stock <= 0) return items;
  const existing = items.find(i => i.id === item.id);
  if (!existing && items.length >= 50) return items;
  const updated = { ...item, quantity: Math.min(quantityLimit(item.stock), (existing?.quantity ?? 0) + quantity) };
  return existing ? items.map(i => i.id === item.id ? updated : i) : [...items, updated];
}
export function setCartQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (!Number.isSafeInteger(quantity) || quantity < 0) return items;
  if (quantity === 0) return items.filter(i => i.id !== id);
  return items.map(i => i.id === id ? { ...i, quantity: Math.min(quantityLimit(i.stock), quantity) } : i).filter(i => i.quantity > 0);
}
export function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap((i): CartItem[] => {
    if (!i || typeof i !== "object" || typeof i.id !== "string" || typeof i.name !== "string" || typeof i.slug !== "string" || !Number.isSafeInteger(i.quantity) || i.quantity < 1 || !Number.isFinite(i.price) || i.price < 0) return [];
    const stock = Number.isSafeInteger(i.stock) && i.stock >= 0 ? i.stock : 99;
    return [{ id: i.id.slice(0, 150), name: i.name.slice(0, 240), slug: i.slug.slice(0, 240), brand: typeof i.brand === "string" ? i.brand.slice(0, 120) : null, price: i.price, quantity: Math.min(99, i.quantity), stock, ...(typeof i.image === "string" && /^(https:\/\/|\/(?!\/))/.test(i.image) ? { image: i.image } : {}) }];
  });
}
export function consumePurchasedItems(items: CartItem[], completedOrders: string[], orderId: string, purchased: { productId: string; quantity: number }[]) {
  if (completedOrders.includes(orderId)) return { items, completedOrders };
  const quantities = new Map(purchased.map(i => [i.productId, i.quantity]));
  return { items: items.map(i => ({ ...i, quantity: Math.max(0, i.quantity - (quantities.get(i.id) ?? 0)) })).filter(i => i.quantity > 0), completedOrders: [...completedOrders, orderId].slice(-100) };
}
