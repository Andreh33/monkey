import { NextResponse } from "next/server";
import { getCheckoutService } from "@/lib/checkout-server";
import { checkoutHeaders } from "@/lib/checkout-http";
import { verifyStripeEvent } from "@/lib/stripe";
import type { PaymentSession } from "@/lib/checkout-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const handledEvents = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"]);
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook no configurado." }, { status: 503, headers: checkoutHeaders });
  const payload = await req.text();
  if (Buffer.byteLength(payload, "utf8") > 1000000) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413, headers: checkoutHeaders });
  let event;
  try { event = verifyStripeEvent(payload, req.headers.get("stripe-signature") ?? "", secret); }
  catch { return NextResponse.json({ error: "Firma no válida." }, { status: 400, headers: checkoutHeaders }); }
  if (!handledEvents.has(event.type)) return NextResponse.json({ received: true }, { headers: checkoutHeaders });
  try {
    await getCheckoutService().processEvent({ id: event.id, type: event.type, session: event.data.object as PaymentSession });
    return NextResponse.json({ received: true }, { headers: checkoutHeaders });
  } catch {
    // Stripe retries this response. Never acknowledge a payment whose transaction failed.
    return NextResponse.json({ error: "No se ha podido procesar el evento." }, { status: 500, headers: checkoutHeaders });
  }
}
