import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  scooterBrand: z.string().min(2),
  scooterModel: z.string().optional().nullable(),
  problemType: z.enum(["bateria", "ruedas", "frenos", "motor", "electronica", "otro"]),
  problem: z.string().min(10),
  preferred: z.enum(["morning", "afternoon"]).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const created = await prisma.repairRequest.create({
      data: {
        ...parsed,
        scooterModel: parsed.scooterModel ?? null,
        preferred: parsed.preferred ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, errors: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Error al guardar" }, { status: 500 });
  }
}
