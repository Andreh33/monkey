import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ ok: false }, { status: 403 });
  const { status } = await req.json();
  const updated = await prisma.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(updated);
}
