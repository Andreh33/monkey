import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2),
  shortDesc: z.string(),
  description: z.string(),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().nullable().optional(),
  sku: z.string().optional().nullable(),
  stock: z.coerce.number().int().nonnegative(),
  category: z.string(),
  brand: z.string().optional().nullable(),
  maxSpeed: z.coerce.number().int().optional().nullable(),
  range: z.coerce.number().int().optional().nullable(),
  motorPower: z.coerce.number().int().optional().nullable(),
  battery: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  maxLoad: z.coerce.number().int().optional().nullable(),
  stripeLink: z.string().url(),
  shippingCost: z.coerce.number().nonnegative().nullable().optional(),
  youtubeUrl: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  featured: z.boolean(),
  active: z.boolean(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional().nullable() })).default([]),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!product) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    await prisma.productImage.deleteMany({ where: { productId: params.id } });

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        shortDesc: data.shortDesc,
        description: data.description,
        price: data.price,
        compareAt: data.compareAt ?? null,
        sku: data.sku || null,
        stock: data.stock,
        category: data.category,
        brand: data.brand || null,
        maxSpeed: data.maxSpeed ?? null,
        range: data.range ?? null,
        motorPower: data.motorPower ?? null,
        battery: data.battery || null,
        weight: data.weight ?? null,
        maxLoad: data.maxLoad ?? null,
        stripeLink: data.stripeLink,
        shippingCost: data.shippingCost ?? null,
        youtubeUrl: data.youtubeUrl ?? null,
        featured: data.featured,
        active: data.active,
        images: {
          create: data.images.map((img, idx) => ({ url: img.url, alt: img.alt || data.name, order: idx })),
        },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ ok: false, errors: err.errors }, { status: 400 });
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
