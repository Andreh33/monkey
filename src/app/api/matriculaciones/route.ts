import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SCOOTER_REGISTRATION_MAX_FILES,
  SCOOTER_REGISTRATION_MAX_TOTAL_BYTES,
  scooterRegistrationFormSchema,
  scooterRegistrationPaymentUrlSchema,
} from "@/lib/registration";
import {
  deleteRegistrationDocuments,
  RegistrationStorageNotConfiguredError,
  uploadRegistrationDocument,
  validateRegistrationDocument,
  type ValidatedRegistrationDocument,
} from "@/lib/registration-storage";

export const runtime = "nodejs";

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function booleanFormValue(formData: FormData, key: string): boolean {
  return formValue(formData, key) === "true";
}

async function removeUploadedDocuments(pathnames: string[]) {
  try {
    await deleteRegistrationDocuments(pathnames);
  } catch {
    // La solicitud aún no existe en la BD. Un fallo de limpieza no debe ocultar
    // el error original ni exponer datos en la respuesta.
  }
}

export async function POST(request: Request) {
  let uploadedPathnames: string[] = [];

  try {
    const formData = await request.formData();

    // Honeypot: los usuarios no ven ni rellenan este campo.
    if (formValue(formData, "website")) {
      return NextResponse.json({ ok: true, reference: null, paymentUrl: null });
    }

    const parsed = scooterRegistrationFormSchema.safeParse({
      holderName: formValue(formData, "holderName"),
      email: formValue(formData, "email"),
      phone: formValue(formData, "phone"),
      dni: formValue(formData, "dni"),
      noCertificate: booleanFormValue(formData, "noCertificate"),
      privacyAccepted: booleanFormValue(formData, "privacyAccepted"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.errors[0]?.message ?? "Revisa los datos del formulario",
        },
        { status: 400 }
      );
    }

    const files = formData
      .getAll("certificateFiles")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (!parsed.data.noCertificate && files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Añade una copia del certificado o marca que no lo tienes" },
        { status: 400 }
      );
    }

    if (files.length > SCOOTER_REGISTRATION_MAX_FILES) {
      return NextResponse.json(
        {
          ok: false,
          error: `Puedes adjuntar un máximo de ${SCOOTER_REGISTRATION_MAX_FILES} archivos`,
        },
        { status: 400 }
      );
    }

    const filesToStore = parsed.data.noCertificate ? [] : files;
    if (
      filesToStore.reduce((total, file) => total + file.size, 0) >
      SCOOTER_REGISTRATION_MAX_TOTAL_BYTES
    ) {
      return NextResponse.json(
        { ok: false, error: "Los archivos no pueden superar 3 MB en total" },
        { status: 400 }
      );
    }

    const validatedDocuments: ValidatedRegistrationDocument[] = [];
    try {
      for (const file of filesToStore) {
        validatedDocuments.push(await validateRegistrationDocument(file));
      }
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Archivo no válido",
        },
        { status: 400 }
      );
    }

    const requestId = crypto.randomUUID();
    const documents: Array<
      ValidatedRegistrationDocument & { pathname: string }
    > = [];

    for (const document of validatedDocuments) {
      const pathname = await uploadRegistrationDocument(requestId, document);
      uploadedPathnames.push(pathname);
      documents.push({ ...document, pathname });
    }

    const created = await prisma.scooterRegistrationRequest.create({
      data: {
        id: requestId,
        holderName: parsed.data.holderName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        dni: parsed.data.dni,
        noCertificate: parsed.data.noCertificate,
        documents: {
          create: documents.map((document) => ({
            pathname: document.pathname,
            originalName: document.originalName,
            contentType: document.contentType,
            size: document.size,
          })),
        },
      },
      select: { id: true },
    });

    // Desde este punto los blobs pertenecen a una solicitud persistida.
    uploadedPathnames = [];

    let paymentUrl: string | null = null;
    try {
      const settings = await prisma.scooterRegistrationSettings.findUnique({
        where: { id: "default" },
        select: { stripePaymentUrl: true },
      });
      const safePaymentUrl = scooterRegistrationPaymentUrlSchema.safeParse(
        settings?.stripePaymentUrl ?? ""
      );
      paymentUrl =
        safePaymentUrl.success && safePaymentUrl.data
          ? safePaymentUrl.data
          : null;
    } catch {
      // La solicitud está guardada: la falta temporal del ajuste de pago no debe
      // convertirla en un error ni provocar un reenvío duplicado.
    }

    return NextResponse.json({
      ok: true,
      reference: created.id.slice(0, 8).toUpperCase(),
      paymentUrl,
    });
  } catch (error) {
    if (uploadedPathnames.length > 0) {
      await removeUploadedDocuments(uploadedPathnames);
    }

    if (error instanceof RegistrationStorageNotConfiguredError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La subida segura de certificados no está disponible ahora. Marca «No tengo certificado» o contacta con nosotros.",
        },
        { status: 503 }
      );
    }

    console.error(
      "[matriculaciones] error al guardar:",
      error instanceof Error ? error.name : "UnknownError"
    );
    return NextResponse.json(
      { ok: false, error: "No hemos podido guardar la solicitud. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
