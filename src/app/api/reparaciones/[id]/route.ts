import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ ok: false }, { status: 403 });
  const body = await req.json();
  const updated = await prisma.repairRequest.update({
    where: { id: params.id },
    data: {
      status: body.status,
      notes: body.notes,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ ok: false }, { status: 403 });
  await prisma.repairRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
