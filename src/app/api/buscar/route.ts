import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Búsqueda pública y ligera para el desplegable de la lupa.
 * Filtra productos activos cuyo nombre o marca contengan `q`.
 * Devuelve como máximo 6 resultados con los campos justos para el dropdown.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [{ name: { contains: q } }, { brand: { contains: q } }],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      images: { orderBy: { order: "asc" }, take: 1, select: { url: true, alt: true } },
    },
    orderBy: { name: "asc" },
    take: 6,
  });

  return NextResponse.json(products);
}
