"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, ExternalLink } from "lucide-react";
import { useCart } from "@/lib/cart-store";
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
  const [qty, setQty] = useState(1);
  const { addItem, setOpen } = useCart();

  const handleBuy = () => {
    if (product.stripeLink) {
      window.open(product.stripeLink, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Link de pago no disponible. Contáctanos directamente.");
    }
  };

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0]?.url,
        stripeLink: product.stripeLink,
      },
      qty
    );
    toast.success(`${product.name} añadido al carrito`);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="label-base mb-0">Cantidad</span>
        <div className="inline-flex items-center border border-border rounded-md">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-bg-tertiary"><Minus className="w-4 h-4" /></button>
          <span className="px-5 font-mono font-semibold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="p-2.5 hover:bg-bg-tertiary"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      <button onClick={handleBuy} className="btn-primary w-full text-base py-4">
        Comprar ahora
        <ExternalLink className="w-4 h-4" />
      </button>
      <button onClick={handleAdd} className="btn-outline w-full text-base py-4">
        <ShoppingCart className="w-4 h-4" />
        Añadir al carrito
      </button>
    </div>
  );
}
