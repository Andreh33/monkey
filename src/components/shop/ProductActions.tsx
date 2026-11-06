"use client";
import { MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import { AddToCart, type BuyableProduct } from "./AddToCart";
export function ProductActions({ product }: { product: BuyableProduct }) {
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url: window.location.href }); return; }
      catch (error) { if (error instanceof Error && error.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(window.location.href); toast.success("Enlace copiado al portapapeles"); }
    catch { toast.error("No se pudo copiar el enlace"); }
  }
  return <div className="space-y-4">
    <AddToCart product={product} />
    <a href={productWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-3 rounded-md border border-[#20a95a] bg-[#08783e] px-5 py-3.5 text-white hover:bg-[#096b39]">
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 text-left leading-tight"><span className="block text-sm font-bold">¿Quieres comprarlo en tienda?</span><span className="mt-1 block text-xs text-white/90">Escríbenos por WhatsApp y te lo reservamos</span></span>
    </a>
    <button type="button" onClick={share} className="btn-outline w-full py-4"><Share2 size={16} />Compartir</button>
  </div>;
}
