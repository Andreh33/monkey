import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const created = await prisma.contactMessage.create({ data });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, errors: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Error" }, { status: 500 });
  }
}
