import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2),
  shortDesc: z.string().min(2),
  description: z.string().min(2),
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
  featured: z.boolean(),
  active: z.boolean(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional().nullable() })).default([]),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  try {
    const body = await req.json();
    const data = productSchema.parse(body);
    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let i = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }
    const created = await prisma.product.create({
      data: {
        slug,
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
        featured: data.featured,
        active: data.active,
        images: {
          create: data.images.map((img, idx) => ({ url: img.url, alt: img.alt || data.name, order: idx })),
        },
      },
    });
    return NextResponse.json(created);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ ok: false, errors: err.errors }, { status: 400 });
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
