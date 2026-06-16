"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Share2 } from "lucide-react";
// Carrito desactivado: compras directas via Stripe
// import { Minus, Plus, ShoppingCart } from "lucide-react";
// import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    brand?: string | null;
    price: number;
    stripeLink: string;
    images: { url: string }[];
  };
};

export function ProductActions({ product }: Props) {
  // Carrito desactivado
  // const [qty, setQty] = useState(1);
  // const { addItem, setOpen } = useCart();
  const [accepted, setAccepted] = useState(false);

  const handleBuy = () => {
    if (!accepted) {
      toast.error("Debes aceptar las condiciones de compra para continuar.");
      return;
    }
    if (product.stripeLink) {
      window.open(product.stripeLink, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Link de pago no disponible. Contáctanos directamente.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    // Móvil: hoja de compartir nativa. Escritorio: copiar enlace.
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira el ${product.name} en MonkeyMotion`,
          url,
        });
        return;
      } catch (err) {
        // El usuario canceló la hoja de compartir: no mostramos error.
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  // Carrito desactivado: compras directas via Stripe
  // const handleAdd = () => {
  //   addItem(
  //     {
  //       id: product.id,
  //       slug: product.slug,
  //       name: product.name,
  //       brand: product.brand,
  //       price: product.price,
  //       image: product.images[0]?.url,
  //       stripeLink: product.stripeLink,
  //     },
  //     qty
  //   );
  //   toast.success(`${product.name} añadido al carrito`);
  //   setOpen(true);
  // };

  return (
    <div className="space-y-4">
      {/* Cantidad/carrito desactivado: cada compra va directa a Stripe
      <div className="flex items-center gap-3">
        <span className="label-base mb-0">Cantidad</span>
        <div className="inline-flex items-center border border-border rounded-md">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-bg-tertiary"><Minus className="w-4 h-4" /></button>
          <span className="px-5 font-mono font-semibold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="p-2.5 hover:bg-bg-tertiary"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      */}
      <label className="flex items-start gap-2.5 text-sm text-text-secondary cursor-pointer select-none">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent-red cursor-pointer"
        />
        <span>
          He leído y acepto las{" "}
          <Link href="/condiciones-compra" target="_blank" className="text-accent-orange underline underline-offset-2 hover:text-white">
            Condiciones de compra
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" className="text-accent-orange underline underline-offset-2 hover:text-white">
            Política de privacidad
          </Link>.
        </span>
      </label>
      <button
        onClick={handleBuy}
        disabled={!accepted}
        className="btn-primary w-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        Comprar ahora
        <ExternalLink className="w-4 h-4" />
      </button>
      <button onClick={handleShare} className="btn-outline w-full text-base py-4">
        <Share2 className="w-4 h-4" />
        Compartir
      </button>
      {/* Carrito desactivado: compras directas via Stripe
      <button onClick={handleAdd} className="btn-outline w-full text-base py-4">
        <ShoppingCart className="w-4 h-4" />
        Añadir al carrito
      </button>
      */}
    </div>
  );
}
