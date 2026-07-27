import { z } from "zod";

export const SCOOTER_REGISTRATION_PRICE_EUR = 19.5;
export const SCOOTER_REGISTRATION_MAX_FILES = 3;
export const SCOOTER_REGISTRATION_MAX_FILE_BYTES = 3 * 1024 * 1024;
export const SCOOTER_REGISTRATION_MAX_TOTAL_BYTES = 3 * 1024 * 1024;

export const SCOOTER_REGISTRATION_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const SCOOTER_REGISTRATION_ACCEPT_ATTRIBUTE =
  SCOOTER_REGISTRATION_ACCEPTED_TYPES.join(",");

function normalizeIdentityDocument(value: string): string {
  return value.toUpperCase().replace(/[\s-]+/g, "");
}

function hasValidDniOrNieChecksum(value: string): boolean {
  const normalized = normalizeIdentityDocument(value);
  const match = normalized.match(/^([0-9]{8}|[XYZ][0-9]{7})([A-Z])$/);
  if (!match) return false;

  const numeric = match[1]
    .replace(/^X/, "0")
    .replace(/^Y/, "1")
    .replace(/^Z/, "2");
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";

  return letters[Number(numeric) % 23] === match[2];
}

const holderNameSchema = z
  .string()
  .trim()
  .min(2, "Escribe el nombre del titular")
  .max(100, "El nombre es demasiado largo");

const emailSchema = z
  .string()
  .trim()
  .email("Escribe un email válido")
  .max(160, "El email es demasiado largo")
  .transform((value) => value.toLowerCase());

const phoneSchema = z
  .string()
  .trim()
  .min(9, "Escribe un teléfono válido")
  .max(24, "El teléfono es demasiado largo")
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 15;
    },
    "Escribe un teléfono válido"
  );

const dniSchema = z
  .string()
  .trim()
  .transform(normalizeIdentityDocument)
  .refine(hasValidDniOrNieChecksum, "Escribe un DNI o NIE válido");

export const scooterRegistrationFormSchema = z.object({
  holderName: holderNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dni: dniSchema,
  noCertificate: z.boolean(),
  privacyAccepted: z
    .boolean()
    .refine((value) => value, "Debes aceptar la política de privacidad"),
});

export type ScooterRegistrationFormValues = z.input<
  typeof scooterRegistrationFormSchema
>;

export const scooterRegistrationPaymentUrlSchema = z
  .string()
  .trim()
  .max(500, "El enlace es demasiado largo")
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        url.hostname === "buy.stripe.com" &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Pega un Payment Link válido de https://buy.stripe.com");

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
