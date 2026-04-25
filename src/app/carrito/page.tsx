"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ExternalLink } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice, clear } = useCart();
  const subtotal = totalPrice();
  const shipping = subtotal >= 100 ? 0 : 9.95;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (items.length > 1) {
      toast.message("Carrito con varios productos", {
        description: "Cada patinete se paga por separado. Te abrimos el primero. Para los demás, repite el proceso.",
        duration: 5000,
      });
    }
    const link = items[0].stripeLink;
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    else toast.error("Link de pago no disponible.");
  };

  return (
    <section className="container-custom py-16">
      <p className="eyebrow mb-3">★ TU PEDIDO ★</p>
      <h1 className="display-xl mb-10">Carrito</h1>

      {items.length === 0 ? (
        <div className="card-base p-16 text-center">
          <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-5" />
          <p className="font-display text-3xl mb-4">Tu carrito está vacío</p>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">Descubre nuestra selección de patinetes eléctricos.</p>
          <Link href="/tienda" className="btn-primary">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-bg-secondary border border-border">
                <div className="relative w-28 h-32 sm:w-32 sm:h-40 rounded-lg overflow-hidden bg-bg-tertiary shrink-0">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  {item.brand && <p className="text-[10px] uppercase tracking-widest text-text-muted font-mono">{item.brand}</p>}
                  <Link href={`/tienda/${item.slug}`} className="font-display text-xl tracking-wider hover:text-gradient transition-all">
                    {item.name}
                  </Link>
                  <p className="price-mono text-lg mt-2">{formatPrice(item.price)}<span className="currency">€</span></p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center border border-border rounded-md">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-bg-tertiary"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="px-4 font-mono text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-bg-tertiary"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-text-muted hover:text-accent-red" aria-label="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Subtotal</p>
                  <p className="price-mono text-xl mt-1">{formatPrice(item.price * item.quantity)}<span className="currency">€</span></p>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <button onClick={clear} className="btn-ghost">Vaciar carrito</button>
              <Link href="/tienda" className="btn-ghost">← Seguir comprando</Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="card-base p-6 space-y-5">
              <h3 className="font-display text-2xl tracking-wider">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-mono">{formatPrice(subtotal)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Envío</span>
                  <span className="font-mono">{shipping === 0 ? "Gratis" : `${formatPrice(shipping)}€`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-success font-mono">✓ Envío gratis a partir de 100€</p>
                )}
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-end">
                <span className="text-text-secondary uppercase tracking-wider text-xs">Total</span>
                <span className="price-mono text-3xl">{formatPrice(total)}<span className="currency">€</span></span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full text-base py-4">
                Finalizar compra
                <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                Pago seguro con Stripe. Aceptamos tarjeta, Bizum y transferencia.
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
