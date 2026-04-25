import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ ok: false }, { status: 403 });
  const { role } = await req.json();
  if (!["ADMIN", "CLIENT"].includes(role)) return NextResponse.json({ ok: false }, { status: 400 });
  const updated = await prisma.user.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN")
    return NextResponse.json({ ok: false }, { status: 403 });
  if ((session.user as { id: string }).id === params.id) {
    return NextResponse.json({ ok: false, error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
