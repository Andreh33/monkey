import { MessageCircle } from "lucide-react";
import { orderWhatsAppUrl, type OrderWhatsAppContact } from "@/lib/order-whatsapp";

export function OrderWhatsAppLink({ order }: { order: OrderWhatsAppContact }) {
  const href = orderWhatsAppUrl(order);
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Escribir al comprador por WhatsApp" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-xs font-semibold text-[#072d17] hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] transition-colors">
    <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp
  </a>;
}
