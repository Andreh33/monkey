import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const ext = "webp";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const fullPath = path.join(uploadDir, filename);

  try {
    const optimized = await sharp(buffer)
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    await writeFile(fullPath, optimized);
  } catch {
    // Fallback: write original bytes if sharp fails
    await writeFile(fullPath, buffer);
  }

  return NextResponse.json({ ok: true, url: `/uploads/products/${filename}` });
}
