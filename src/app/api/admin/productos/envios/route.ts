import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shippingBatchSchema } from "@/lib/product-publication";
import { revalidateCatalog } from "@/lib/catalog-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return NextResponse.json({ ok: false }, { status: 403, headers });
  if (req.headers.get("origin") && req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403, headers });
  if (!req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ ok: false, error: "Se requiere JSON." }, { status: 415, headers });
  const raw = await req.text();
  if (Buffer.byteLength(raw) > 65536) return NextResponse.json({ ok: false, error: "Lote demasiado grande." }, { status: 413, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "Archivo no válido." }, { status: 400, headers }); }
  const parsed = shippingBatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "El archivo debe contener tarifas y países válidos, sin campos adicionales." }, { status: 400, headers });
  try {
    const result = await prisma.$transaction(async tx => {
      const products = await tx.product.findMany({ where: { id: { in: parsed.data.products.map(p => p.id) } }, select: { id: true, active: true, shippingCost: true } });
      const byId = new Map(products.map(p => [p.id, p]));
      const invalid = parsed.data.products.filter(p => {
        const current = byId.get(p.id);
        if (!current) return true;
        if (/^imp20261106_v\d+$/.test(p.id)) return current.active || p.shippingCost < 5;
        return !current.active || p.motorPower !== undefined || !p.shippingCountries || Math.round((current.shippingCost ?? 0) * 100) !== Math.round(p.shippingCost * 100);
      }).map(p => p.id);
      if (invalid.length) return { updated: 0, invalid };
      for (const product of parsed.data.products) {
        const imported = /^imp20261106_v\d+$/.test(product.id);
        const data = {
          ...(imported ? { shippingCost: product.shippingCost, ...(product.motorPower === undefined ? {} : { motorPower: product.motorPower }) } : {}),
          ...(product.shippingCountries ? { shippingCountries: JSON.stringify(product.shippingCountries) } : {}),
        };
        const changed = await tx.product.updateMany({ where: { id: product.id, active: !imported }, data });
        if (changed.count !== 1) throw new Error("Catalogue changed during shipping update");
      }
      return { updated: parsed.data.products.length, invalid: [] };
    }, { maxWait: 10000, timeout: 45000 });
    if (result.invalid.length) return NextResponse.json({ ok: false, error: "Los importados deben seguir ocultos y tener envío mínimo de 5 €. En productos antiguos sólo se añaden países, conservando su tarifa y potencia. No se ha guardado este lote.", ...result }, { status: 409, headers });
    if (result.updated) revalidateCatalog();
    return NextResponse.json({ ok: true, ...result }, { headers });
  } catch {
    return NextResponse.json({ ok: false, error: "No se han guardado las tarifas de este lote. Puedes reintentarlo." }, { status: 500, headers });
  }
}
