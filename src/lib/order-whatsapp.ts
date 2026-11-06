import "server-only";
import { isSupportedCountry, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/core";
import metadata from "libphonenumber-js/metadata.max.json";

export type OrderWhatsAppContact = { id: string; firstName?: string | null; phone?: string | null; country?: string | null };

/** Only create a chat for a complete, unambiguous number; never extract a number from free text. */
export function orderWhatsAppUrl(order: OrderWhatsAppContact): string | null {
  const raw = order.phone?.trim();
  if (!raw || raw.length > 80 || !/^[+\d\s().-]+$/.test(raw)) return null;
  let digits = raw.replace(/[\s().-]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  if (!/^\+?\d+$/.test(digits)) return null;
  const international = digits.startsWith("+");
  const country = order.country?.trim().toUpperCase() || "ES";
  if (!international && !isSupportedCountry(country as CountryCode, metadata)) return null;
  const phone = parsePhoneNumberFromString(digits, { defaultCountry: international ? undefined : country as CountryCode, extract: false }, metadata);
  if (!phone?.isValid() || !phone.country || phone.ext) return null;
  // Some parsers infer a calling code even without +/00. Require a genuine national
  // format for local input so an ambiguous prefix cannot select another recipient.
  if (!international && (phone.country !== country || (digits !== phone.nationalNumber && digits !== phone.formatNational().replace(/\D/g, "")))) return null;
  const name = order.firstName?.replace(/\s+/g, " ").trim();
  const text = `Hola${name ? ` ${name}` : ""}, soy Angy de Monkey. Te escribo sobre tu pedido ${order.id}.`;
  return `https://wa.me/${phone.number.slice(1)}?text=${encodeURIComponent(text)}`;
}
