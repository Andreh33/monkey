import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getRegistrationDocument,
  RegistrationStorageNotConfiguredError,
} from "@/lib/registration-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(
    session?.user && (session.user as { role?: string }).role === "ADMIN"
  );
}

export async function GET(
  _request: Request,
  {
    params,
  }: { params: { id: string; documentId: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const document = await prisma.scooterRegistrationDocument.findFirst({
    where: {
      id: params.documentId,
      requestId: params.id,
    },
  });

  if (!document) {
    return NextResponse.json(
      { ok: false, error: "Documento no encontrado" },
      { status: 404 }
    );
  }

  try {
    const blob = await getRegistrationDocument(document.pathname);
    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json(
        { ok: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const encodedName = encodeURIComponent(document.originalName);
    return new Response(blob.stream, {
      status: 200,
      headers: {
        "Content-Type": document.contentType,
        "Content-Length": String(document.size),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "private, no-store, max-age=0",
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    const message =
      error instanceof RegistrationStorageNotConfiguredError
        ? "El almacenamiento privado no está configurado"
        : "No se ha podido descargar el documento";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
