import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteRegistrationDocuments,
  RegistrationStorageNotConfiguredError,
} from "@/lib/registration-storage";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(
    session?.user && (session.user as { role?: string }).role === "ADMIN"
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const registration = await prisma.scooterRegistrationRequest.findUnique({
    where: { id: params.id },
    select: { documents: { select: { pathname: true } } },
  });

  if (!registration) {
    return NextResponse.json(
      { ok: false, error: "Solicitud no encontrada" },
      { status: 404 }
    );
  }

  try {
    await deleteRegistrationDocuments(
      registration.documents.map((document) => document.pathname)
    );
  } catch (error) {
    const message =
      error instanceof RegistrationStorageNotConfiguredError
        ? "El almacenamiento privado no está configurado"
        : "No se han podido eliminar los documentos privados";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }

  await prisma.scooterRegistrationRequest.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ ok: true });
}
