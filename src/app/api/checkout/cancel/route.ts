import { NextResponse } from "next/server";
import { z } from "zod";
import { checkoutTokenSchema } from "@/lib/checkout";
import { getCheckoutService } from "@/lib/checkout-server";
import { checkoutErrorResponse, checkoutHeaders, limitCheckoutRequests, readCheckoutJson } from "@/lib/checkout-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const input = z.object({ checkoutToken: checkoutTokenSchema }).strict().parse(await readCheckoutJson(req));
    limitCheckoutRequests(req, "cancel", 12);
    return NextResponse.json(await getCheckoutService().cancel(input.checkoutToken), { headers: checkoutHeaders });
  } catch (error) { return checkoutErrorResponse(error); }
}
