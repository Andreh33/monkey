import { NextResponse } from "next/server";
import { getCheckoutService } from "@/lib/checkout-server";
import { checkoutErrorResponse, checkoutHeaders, limitCheckoutRequests } from "@/lib/checkout-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(req: Request) {
  try {
    limitCheckoutRequests(req, "status", 90);
    return NextResponse.json(await getCheckoutService().status(new URL(req.url).searchParams.get("token") ?? ""), { headers: checkoutHeaders });
  } catch (error) { return checkoutErrorResponse(error); }
}
