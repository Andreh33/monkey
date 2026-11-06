import { NextResponse } from "next/server";
import { checkoutQuoteSchema } from "@/lib/checkout";
import { getCheckoutService } from "@/lib/checkout-server";
import { checkoutErrorResponse, checkoutHeaders, limitCheckoutRequests, readCheckoutJson } from "@/lib/checkout-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const input = checkoutQuoteSchema.parse(await readCheckoutJson(req));
    limitCheckoutRequests(req, "quote", 60);
    return NextResponse.json(await getCheckoutService().quote(input), { headers: checkoutHeaders });
  } catch (error) { return checkoutErrorResponse(error); }
}
