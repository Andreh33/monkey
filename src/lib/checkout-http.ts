import { createHash, createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CheckoutError } from "./checkout";

export const checkoutHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
const requestCounts = new Map<string, { count: number; until: number }>();

export function checkoutVisitorHash(req: Request): string {
  const secret = process.env.CHECKOUT_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new CheckoutError("PAYMENT_NOT_CONFIGURED", "El pago no está disponible temporalmente.", 503);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHmac("sha256", secret).update("monkey-checkout-visitor\0").update(ip).digest("hex");
}

export function limitCheckoutRequests(req: Request, action: string, maximum: number) {
  const now = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = action + ":" + createHash("sha256").update(ip).digest("hex");
  const state = requestCounts.get(key);
  if (state && state.until > now) {
    if (state.count >= maximum) throw new CheckoutError("TOO_MANY_REQUESTS", "Hay demasiados intentos seguidos. Espera un minuto antes de reintentar.", 429);
    state.count++;
  } else requestCounts.set(key, { count: 1, until: now + 60000 });
  if (requestCounts.size > 1000) for (const [entry, value] of requestCounts) if (value.until <= now) requestCounts.delete(entry);
}

export async function readCheckoutJson(req: Request): Promise<unknown> {
  if (req.headers.get("origin") !== new URL(req.url).origin) throw new CheckoutError("INVALID_ORIGIN", "Origen de solicitud no permitido.", 403);
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new CheckoutError("INVALID_CONTENT_TYPE", "Se requiere una solicitud JSON.", 415);
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > 64000) throw new CheckoutError("REQUEST_TOO_LARGE", "La solicitud supera el tamaño permitido.", 413);
  try { return JSON.parse(raw); } catch { throw new CheckoutError("INVALID_REQUEST", "La solicitud no es válida."); }
}

export function checkoutErrorResponse(error: unknown) {
  if (error instanceof CheckoutError) return NextResponse.json({ error: error.message, code: error.code, ...(error.productId ? { productId: error.productId } : {}), ...(error.allowedCountries ? { allowedCountries: error.allowedCountries } : {}) }, { status: error.status, headers: checkoutHeaders });
  if (error instanceof ZodError) return NextResponse.json({ error: "Revisa las cantidades, los datos de entrega y la aceptación de las condiciones.", code: "INVALID_REQUEST" }, { status: 400, headers: checkoutHeaders });
  return NextResponse.json({ error: "No se ha podido procesar la solicitud. Puedes volver a intentarlo.", code: "CHECKOUT_UNAVAILABLE" }, { status: 503, headers: checkoutHeaders });
}
