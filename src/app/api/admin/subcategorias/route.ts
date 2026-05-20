import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { categoryId, name } = await req.json().catch(() => ({}));

  if (typeof categoryId !== "string" || !categoryId)
    return NextResponse.json({ ok: false, error: "Categoría no indicada" }, { status: 400 });
  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ ok: false, error: "Nombre demasiado corto" }, { status: 400 });

  const slug = slugify(name);
  if (!slug) return NextResponse.json({ ok: false, error: "Nombre inválido" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return NextResponse.json({ ok: false, error: "Categoría no encontrada" }, { status: 404 });

  const dup = await prisma.subcategory.findUnique({
    where: { categoryId_slug: { categoryId, slug } },
  });
  if (dup) return NextResponse.json({ ok: false, error: "Ya existe esa subcategoría" }, { status: 409 });

  const count = await prisma.subcategory.count({ where: { categoryId } });
  const created = await prisma.subcategory.create({
    data: { categoryId, name: name.trim(), slug, order: count },
  });
  return NextResponse.json(created);
}
