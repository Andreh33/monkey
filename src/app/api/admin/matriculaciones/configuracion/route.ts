import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scooterRegistrationPaymentUrlSchema } from "@/lib/registration";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(
    session?.user && (session.user as { role?: string }).role === "ADMIN"
  );
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud no válida" },
      { status: 400 }
    );
  }

  const rawUrl =
    typeof body === "object" &&
    body !== null &&
    "stripePaymentUrl" in body &&
    typeof body.stripePaymentUrl === "string"
      ? body.stripePaymentUrl
      : "";
  const parsed = scooterRegistrationPaymentUrlSchema.safeParse(rawUrl);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const stripePaymentUrl = parsed.data || null;
  const settings = await prisma.scooterRegistrationSettings.upsert({
    where: { id: "default" },
    create: { id: "default", stripePaymentUrl },
    update: { stripePaymentUrl },
    select: { stripePaymentUrl: true },
  });

  revalidatePath("/admin/matriculaciones");
  return NextResponse.json({ ok: true, ...settings });
}
