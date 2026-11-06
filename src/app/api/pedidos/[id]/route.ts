import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCheckoutService } from "@/lib/checkout-server";
import { z } from "zod";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const updateSchema = z.union([z.object({
  fulfillmentStatus: z.enum(["UNFULFILLED", "PREPARING", "SHIPPED", "DELIVERED"]),
}).strict(), z.object({ retryStock: z.literal(true) }).strict()]);
const paidStates = ["PAID", "SHIPPED", "DELIVERED"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ ok: false, error: "Acceso de administrador requerido." }, { status: 403, headers });
  if (req.headers.get("origin") && req.headers.get("origin") !== new URL(req.url).origin)
    return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403, headers });
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Selecciona un estado de preparación válido. El pago se actualiza automáticamente." }, { status: 400, headers });
  const order = await prisma.order.findUnique({ where: { id: params.id }, select: { id: true, status: true, stockIssue: true } });
  if (!order) return NextResponse.json({ ok: false, error: "Pedido no encontrado." }, { status: 404, headers });
  if (!paidStates.includes(order.status)) return NextResponse.json({ ok: false, error: "El pedido debe estar pagado antes de prepararlo o enviarlo." }, { status: 409, headers });
  if ("retryStock" in parsed.data) {
    try {
      const result = await getCheckoutService().reconcileOrderStock(params.id);
      if (!result.resolved) return NextResponse.json({ ok: false, error: "Sigue faltando stock para completar el pedido. Repón los productos y vuelve a intentarlo." }, { status: 409, headers });
      return NextResponse.json({ ok: true, stockIssue: false }, { headers });
    } catch {
      return NextResponse.json({ ok: false, error: "No se pudo comprobar el stock. Actualiza la página y vuelve a intentarlo." }, { status: 503, headers });
    }
  }
  if (order.stockIssue) return NextResponse.json({ ok: false, error: "Revisa y asigna el stock del pedido antes de prepararlo o enviarlo." }, { status: 409, headers });
  const updated = await prisma.order.updateMany({
    where: { id: params.id, status: { in: paidStates }, stockIssue: false },
    // SHIPPED/DELIVERED are historical paid states; normalize them when logistics is explicitly edited.
    data: { fulfillmentStatus: parsed.data.fulfillmentStatus, ...(order.status !== "PAID" ? { status: "PAID" } : {}) },
  });
  if (!updated.count) return NextResponse.json({ ok: false, error: "El estado del pago ha cambiado. Actualiza la página." }, { status: 409, headers });
  return NextResponse.json({ ok: true, fulfillmentStatus: parsed.data.fulfillmentStatus }, { headers });
}
