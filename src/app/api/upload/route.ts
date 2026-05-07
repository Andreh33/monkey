import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "Sin archivo" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  let optimized: Buffer;
  try {
    optimized = await sharp(buffer)
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    optimized = buffer;
  }

  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  try {
    const blob = await put(filename, optimized, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error subiendo a Blob";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
