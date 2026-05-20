import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getCategoryTree } from "@/lib/categories";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const tree = await getCategoryTree();
  return NextResponse.json(tree);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { name } = await req.json().catch(() => ({}));
  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ ok: false, error: "Nombre demasiado corto" }, { status: 400 });

  const slug = slugify(name);
  if (!slug) return NextResponse.json({ ok: false, error: "Nombre inválido" }, { status: 400 });

  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ ok: false, error: "Ya existe una categoría con ese nombre" }, { status: 409 });

  const count = await prisma.category.count();
  const created = await prisma.category.create({
    data: { name: name.trim(), slug, order: count },
  });
  return NextResponse.json(created);
}
