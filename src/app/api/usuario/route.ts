import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) {
      return NextResponse.json({ ok: false, error: "Ese email ya está registrado" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashed,
        role: "CLIENT",
      },
    });
    return NextResponse.json({ ok: true, id: user.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, errors: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Error al registrar" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();
  const data = updateSchema.parse(body);

  const update: Record<string, unknown> = {};
  if (data.name) update.name = data.name;
  if (data.phone !== undefined) update.phone = data.phone;

  if (data.newPassword) {
    const u = await prisma.user.findUnique({ where: { id: (session.user as { id: string }).id } });
    if (!u) return NextResponse.json({ ok: false }, { status: 404 });
    const ok = await bcrypt.compare(data.currentPassword || "", u.password);
    if (!ok) return NextResponse.json({ ok: false, error: "Contraseña actual incorrecta" }, { status: 400 });
    update.password = await bcrypt.hash(data.newPassword, 10);
  }

  await prisma.user.update({
    where: { id: (session.user as { id: string }).id },
    data: update,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  await prisma.user.delete({ where: { id: (session.user as { id: string }).id } });
  return NextResponse.json({ ok: true });
}
