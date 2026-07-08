import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicProductSlug } from "@/lib/slug-aliases";

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

  // Devolvemos el slug público (los slugs heredados se corrigen para que el
  // buscador navegue directo a la URL canónica, sin pasar por el 308).
  return NextResponse.json(
    products.map((p) => ({ ...p, slug: publicProductSlug(p.slug) }))
  );
}
