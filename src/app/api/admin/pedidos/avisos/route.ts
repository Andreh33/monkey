import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderAlertCursorError, readOrderAlertFeed } from "@/lib/order-alert-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso no permitido." }, { status: 403, headers });
  }
  try {
    return NextResponse.json(await readOrderAlertFeed(prisma, new URL(req.url).searchParams), { headers });
  } catch (error) {
    if (error instanceof OrderAlertCursorError) {
      return NextResponse.json({ error: "Consulta de pedidos no válida." }, { status: 400, headers });
    }
    return NextResponse.json({ error: "No se pueden comprobar los pedidos temporalmente." }, { status: 503, headers });
  }
}
