import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importBatchSchema, importPriceCents, IMPORT_MAX_REQUEST_BYTES } from "@/lib/product-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Acceso de administrador requerido." }, { status: 403, headers });
  }
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ ok: false, error: "Origen de solicitud no permitido." }, { status: 403, headers });
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Se requiere un archivo JSON." }, { status: 415, headers });
  }
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > IMPORT_MAX_REQUEST_BYTES) {
    return NextResponse.json({ ok: false, error: "El lote supera el límite de 2 MB." }, { status: 413, headers });
  }
  let body: unknown;
  try { body = JSON.parse(raw); } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido." }, { status: 400, headers });
  }
  const parsed = importBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Revisa los datos del lote.", issues: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })).slice(0, 30) }, { status: 400, headers });
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const insertedIds: string[] = [];
      const skippedIds: string[] = [];
      for (const product of parsed.data.products) {
        const existing = await tx.product.findFirst({ where: { OR: [{ id: product.id }, { sku: product.sku }] }, select: { id: true } });
        if (existing) { skippedIds.push(product.id); continue; }
        const category = await tx.category.upsert({ where: { slug: product.category }, update: {}, create: { slug: product.category, name: product.categoryName } });
        if (product.subcategory && product.subcategoryName) {
          await tx.subcategory.upsert({
            where: { categoryId_slug: { categoryId: category.id, slug: product.subcategory } }, update: {},
            create: { categoryId: category.id, slug: product.subcategory, name: product.subcategoryName },
          });
        }
        const nameSlug = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 150);
        await tx.product.create({ data: {
          id: product.id, sku: product.sku, slug: `${nameSlug || "producto"}-${product.id}`,
          name: product.name, shortDesc: product.shortDesc, description: product.description,
          price: importPriceCents(product.sourcePriceCents) / 100, currency: "EUR",
          category: product.category, subcategory: product.subcategory ?? null, brand: product.brand ?? null,
          maxSpeed: product.maxSpeed ?? null, range: product.range ?? null, motorPower: product.motorPower ?? null,
          battery: product.battery ?? null, weight: product.weight ?? null, maxLoad: product.maxLoad ?? null,
          active: false, featured: false, stock: 5, compareAt: null, stripeLink: "", shippingCost: null, youtubeUrl: null,
          images: { create: product.images.map((image, order) => ({ url: image.url, alt: image.alt, order })) },
        } });
        insertedIds.push(product.id);
      }
      return { insertedIds, skippedIds, inserted: insertedIds.length, skipped: skippedIds.length };
    }, { maxWait: 10000, timeout: 45000 });
    return NextResponse.json({ ok: true, ...result }, { headers });
  } catch {
    return NextResponse.json({ ok: false, error: "No se ha guardado este lote. Puedes reintentarlo; las fichas existentes no se sobrescriben." }, { status: 500, headers });
  }
}
