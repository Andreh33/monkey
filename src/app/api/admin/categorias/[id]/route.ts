import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") return null;
  return session;
}

// Renombra una categoría o cambia su orden. El slug se mantiene fijo para no
// dejar huérfanos a los productos que lo referencian.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const data: { name?: string; order?: number } = {};

  if (typeof body.name === "string") {
    if (body.name.trim().length < 2)
      return NextResponse.json({ ok: false, error: "Nombre demasiado corto" }, { status: 400 });
    data.name = body.name.trim();
  }
  if (typeof body.order === "number") data.order = body.order;

  if (Object.keys(data).length === 0)
    return NextResponse.json({ ok: false, error: "Nada que actualizar" }, { status: 400 });

  const updated = await prisma.category.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
