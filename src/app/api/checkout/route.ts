import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckoutError, checkoutCreateSchema } from "@/lib/checkout";
import { getCheckoutService } from "@/lib/checkout-server";
import { checkoutErrorResponse, checkoutHeaders, checkoutVisitorHash, limitCheckoutRequests, readCheckoutJson } from "@/lib/checkout-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const input = checkoutCreateSchema.parse(await readCheckoutJson(req));
    limitCheckoutRequests(req, "create", 12);
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new CheckoutError("PAYMENT_NOT_CONFIGURED", "El pago no está disponible temporalmente.", 503);
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    return NextResponse.json(await getCheckoutService().create(input, userId, checkoutVisitorHash(req)), { headers: checkoutHeaders });
  } catch (error) { return checkoutErrorResponse(error); }
}
