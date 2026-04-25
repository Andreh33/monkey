import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  label: z.string().min(1),
  fullName: z.string().min(2),
  street: z.string().min(2),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().default("España"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([], { status: 401 });
  const items = await prisma.address.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();
  const data = schema.parse(body);
  const userId = (session.user as { id: string }).id;
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const created = await prisma.address.create({ data: { ...data, userId } });
  return NextResponse.json(created);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await req.json();
  await prisma.address.deleteMany({ where: { id, userId: (session.user as { id: string }).id } });
  return NextResponse.json({ ok: true });
}
