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
 * Mensaje de reserva pre-rellenado con el producto concreto (nombre, potencia
 * y precio): el cliente no tiene que escribir nada y la tienda sabe al instante
 * qué producto debe apartar. Los clics se registran como `whatsapp_click`
 * (ver ClickTracker), con la ruta de la ficha como dimensión.
 */
export function productWhatsAppUrl(p: ProductForWhatsApp): string {
  const nombre = p.name.replace(/\s+/g, " ").trim();
  const potencia = p.motorPower ? ` (${p.motorPower} W)` : "";
  return whatsAppUrl(
    `Hola, quiero comprar en tienda y reservar este producto: ${nombre}${potencia}. Lo he visto en la web por ${formatPrice(p.price)} €. ¿Podéis guardármelo?`
  );
}
