import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicationBatchSchema, publicationIssue } from "@/lib/product-publication";
import { revalidateCatalog } from "@/lib/catalog-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };
const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as { role?: string }).role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 403, headers });
  const products = await prisma.product.findMany({ where: { active: false }, include: { images: true }, orderBy: { name: "asc" } });
  const preview = products.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, shippingCost: p.shippingCost, issue: publicationIssue(p) }));
  return NextResponse.json({ ok: true, stripeConfigured: stripeConfigured(), candidates: preview.filter(p => !p.issue), excluded: preview.filter(p => p.issue) }, { headers });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 403, headers });
  if (req.headers.get("origin") && req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403, headers });
  if (!stripeConfigured()) return NextResponse.json({ ok: false, error: "Configura Stripe y el webhook antes de publicar los productos." }, { status: 503, headers });
  if (!req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ ok: false, error: "Se requiere JSON." }, { status: 415, headers });
  const raw = await req.text();
  if (Buffer.byteLength(raw) > 65536) return NextResponse.json({ ok: false, error: "Lote demasiado grande." }, { status: 413, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "Archivo no válido." }, { status: 400, headers }); }
  const parsed = publicationBatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Revisa los identificadores del lote." }, { status: 400, headers });
  try {
    const result = await prisma.$transaction(async tx => {
      const products = await tx.product.findMany({ where: { id: { in: parsed.data.ids } }, include: { images: true } });
      const byId = new Map(products.map(p => [p.id, p]));
      const invalid = parsed.data.ids.flatMap(id => {
        const p = byId.get(id);
        if (!p) return [{ id, reason: "Producto no encontrado" }];
        const reason = p.active ? null : publicationIssue(p);
        return reason ? [{ id, reason }] : [];
      });
      if (invalid.length) return { published: 0, skipped: 0, invalid };
      const ids = products.filter(p => !p.active).map(p => p.id);
      if (!ids.length) return { published: 0, skipped: products.length, invalid: [] };
      const updated = await tx.product.updateMany({ where: { id: { in: ids }, active: false, stock: { gt: 0 }, price: { gt: 0 } }, data: { active: true } });
      if (updated.count !== ids.length) throw new Error("Catalogue changed during publication");
      return { published: updated.count, skipped: products.length - updated.count, invalid: [] };
    }, { maxWait: 10000, timeout: 45000 });
    if (result.invalid.length) return NextResponse.json({ ok: false, error: "Algunos productos requieren revisión. No se ha publicado este lote.", ...result }, { status: 409, headers });
    if (result.published) revalidateCatalog();
    return NextResponse.json({ ok: true, ...result }, { headers });
  } catch {
    return NextResponse.json({ ok: false, error: "No se ha publicado este lote. Puedes reintentarlo sin duplicar fichas." }, { status: 500, headers });
  }
}
