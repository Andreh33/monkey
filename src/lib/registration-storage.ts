import "server-only";

import { del, get, put } from "@vercel/blob";
import {
  SCOOTER_REGISTRATION_ACCEPTED_TYPES,
  SCOOTER_REGISTRATION_MAX_FILE_BYTES,
} from "@/lib/registration";

const EXTENSIONS_BY_TYPE: Record<
  (typeof SCOOTER_REGISTRATION_ACCEPTED_TYPES)[number],
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export class RegistrationStorageNotConfiguredError extends Error {
  constructor() {
    super("El almacenamiento privado de certificados no está configurado");
    this.name = "RegistrationStorageNotConfiguredError";
  }
}

function getToken(): string {
  const token = process.env.REGISTRATION_BLOB_READ_WRITE_TOKEN;
  if (!token) throw new RegistrationStorageNotConfiguredError();
  return token;
}

function hasExpectedSignature(
  buffer: Buffer,
  type: (typeof SCOOTER_REGISTRATION_ACCEPTED_TYPES)[number]
): boolean {
  if (type === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (type === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    );
  }

  if (type === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

export type ValidatedRegistrationDocument = {
  buffer: Buffer;
  originalName: string;
  contentType: (typeof SCOOTER_REGISTRATION_ACCEPTED_TYPES)[number];
  size: number;
};

export async function validateRegistrationDocument(
  file: File
): Promise<ValidatedRegistrationDocument> {
  if (
    !SCOOTER_REGISTRATION_ACCEPTED_TYPES.includes(
      file.type as (typeof SCOOTER_REGISTRATION_ACCEPTED_TYPES)[number]
    )
  ) {
    throw new Error("Formato no admitido. Usa JPG, PNG, WEBP o PDF.");
  }

  if (file.size <= 0 || file.size > SCOOTER_REGISTRATION_MAX_FILE_BYTES) {
    throw new Error("Cada archivo debe pesar como máximo 3 MB.");
  }

  const contentType =
    file.type as (typeof SCOOTER_REGISTRATION_ACCEPTED_TYPES)[number];
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!hasExpectedSignature(buffer, contentType)) {
    throw new Error("El contenido del archivo no coincide con su formato.");
  }

  const originalName =
    file.name
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}._ -]/gu, "_")
      .replace(/\s+/g, " ")
      .slice(0, 120) || `certificado.${EXTENSIONS_BY_TYPE[contentType]}`;

  return {
    buffer,
    originalName,
    contentType,
    size: buffer.byteLength,
  };
}

export async function uploadRegistrationDocument(
  requestId: string,
  document: ValidatedRegistrationDocument
) {
  const extension = EXTENSIONS_BY_TYPE[document.contentType];
  const pathname = `scooter-registrations/${requestId}/${crypto.randomUUID()}.${extension}`;

  const blob = await put(pathname, document.buffer, {
    access: "private",
    token: getToken(),
    contentType: document.contentType,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    maximumSizeInBytes: SCOOTER_REGISTRATION_MAX_FILE_BYTES,
  });

  return blob.pathname;
}

export async function getRegistrationDocument(pathname: string) {
  return get(pathname, {
    access: "private",
    token: getToken(),
    useCache: false,
  });
}

export async function deleteRegistrationDocuments(pathnames: string[]) {
  if (pathnames.length === 0) return;
  await del(pathnames, { token: getToken() });
}
