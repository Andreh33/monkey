import { NextResponse } from "next/server";
import { getRegistrationPaymentUrl } from "@/lib/registration-payment";

export const dynamic = "force-dynamic";

export async function GET() {
  const paymentUrl = await getRegistrationPaymentUrl();

  return NextResponse.json(
    { ok: true, paymentUrl },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
