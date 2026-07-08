import { EMPRESA } from "@/config/empresa";
import { formatPrice } from "@/lib/utils";

/** Enlace de chat de WhatsApp con mensaje pre-rellenado. */
export function whatsAppUrl(text: string): string {
  return `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(text)}`;
}

type ProductForWhatsApp = {
  name: string;
  price: number;
  motorPower?: number | null;
};

/**
 * Mensaje pre-rellenado con el producto concreto (nombre, potencia y precio):
 * el cliente no tiene que escribir nada y el taller sabe al instante de qué
 * ficha viene la consulta. Los clics se registran como `whatsapp_click`
 * (ver ClickTracker), con la ruta de la ficha como dimensión.
 */
export function productWhatsAppUrl(p: ProductForWhatsApp): string {
  const potencia = p.motorPower ? ` (${p.motorPower} W)` : "";
  return whatsAppUrl(
    `Hola, me interesa el ${p.name}${potencia} por ${formatPrice(p.price)} €. ¿Lo tenéis disponible?`
  );
}
