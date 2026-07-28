"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import {
  Check,
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  LockKeyhole,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { GradientBorder } from "@/components/shared/GradientBorder";
import {
  formatFileSize,
  SCOOTER_REGISTRATION_ACCEPT_ATTRIBUTE,
  SCOOTER_REGISTRATION_ACCEPTED_TYPES,
  SCOOTER_REGISTRATION_MAX_FILES,
  SCOOTER_REGISTRATION_MAX_TOTAL_BYTES,
  SCOOTER_REGISTRATION_PRICE_EUR,
  scooterRegistrationFormSchema,
  type ScooterRegistrationFormValues,
} from "@/lib/registration";

const MAX_RAW_IMAGE_BYTES = 12 * 1024 * 1024;
const TARGET_IMAGE_BYTES = 900 * 1024;
const MAX_IMAGE_DIMENSION = 1800;

type SubmissionResult = {
  reference: string | null;
  paymentUrl: string | null;
  noCertificate: boolean;
};

type ApiResponse = {
  ok?: boolean;
  error?: string;
  reference?: string | null;
  paymentUrl?: string | null;
};

async function fetchConfiguredPaymentUrl(): Promise<string | null> {
  const response = await fetch(`/api/matriculaciones/pago?t=${Date.now()}`, {
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as ApiResponse;

  return response.ok && data.ok ? data.paymentUrl ?? null : null;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
}

async function prepareImage(file: File): Promise<File> {
  if (file.size <= TARGET_IMAGE_BYTES) return file;
  if (file.size > MAX_RAW_IMAGE_BYTES) {
    throw new Error(`${file.name}: la imagen original supera 12 MB`);
  }

  try {
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(width, height)
    );
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      throw new Error("No se ha podido preparar la imagen");
    }

    const qualities = [0.86, 0.76, 0.66, 0.56, 0.46];
    let output: Blob | null = null;

    for (const quality of qualities) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(bitmap, 0, 0, width, height);
      output = await canvasToBlob(canvas, quality);
      if (output && output.size <= TARGET_IMAGE_BYTES) break;
      width = Math.max(1, Math.round(width * 0.88));
      height = Math.max(1, Math.round(height * 0.88));
    }

    bitmap.close();
    if (!output || output.size > TARGET_IMAGE_BYTES) {
      throw new Error("No se ha podido comprimir lo suficiente");
    }

    return new File(
      [output],
      `${file.name.replace(/\.[^.]+$/, "") || "certificado"}.jpg`,
      { type: "image/jpeg" }
    );
  } catch {
    if (file.size <= SCOOTER_REGISTRATION_MAX_TOTAL_BYTES) return file;
    throw new Error(
      `${file.name}: no se ha podido reducir; prueba con otra foto`
    );
  }
}

async function prepareFile(file: File): Promise<File> {
  if (
    !SCOOTER_REGISTRATION_ACCEPTED_TYPES.includes(
      file.type as (typeof SCOOTER_REGISTRATION_ACCEPTED_TYPES)[number]
    )
  ) {
    throw new Error(`${file.name}: formato no admitido`);
  }

  if (file.type === "application/pdf") {
    if (file.size > SCOOTER_REGISTRATION_MAX_TOTAL_BYTES) {
      throw new Error(`${file.name}: el PDF supera 3 MB`);
    }
    return file;
  }

  return prepareImage(file);
}

export function ScooterRegistrationForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [preparingFiles, setPreparingFiles] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScooterRegistrationFormValues>({
    resolver: zodResolver(scooterRegistrationFormSchema),
    defaultValues: {
      holderName: "",
      email: "",
      phone: "",
      dni: "",
      noCertificate: false,
      privacyAccepted: false,
    },
  });

  const noCertificate = watch("noCertificate");

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setFileError("");

    const incoming = Array.from(fileList);
    if (files.length + incoming.length > SCOOTER_REGISTRATION_MAX_FILES) {
      setFileError(
        `Puedes adjuntar un máximo de ${SCOOTER_REGISTRATION_MAX_FILES} archivos`
      );
      return;
    }

    setPreparingFiles(true);
    try {
      const prepared: File[] = [];
      for (const file of incoming) {
        prepared.push(await prepareFile(file));
      }

      const nextFiles = [...files, ...prepared];
      const total = nextFiles.reduce((sum, file) => sum + file.size, 0);
      if (total > SCOOTER_REGISTRATION_MAX_TOTAL_BYTES) {
        throw new Error("Los archivos preparados superan 3 MB en total");
      }

      setFiles(nextFiles);
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "No se ha podido añadir el archivo"
      );
    } finally {
      setPreparingFiles(false);
    }
  }

  async function onSubmit(values: ScooterRegistrationFormValues) {
    setSubmitError("");
    setFileError("");

    if (!values.noCertificate && files.length === 0) {
      setFileError(
        "Añade una copia del certificado o marca que no lo tienes"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.set("holderName", values.holderName);
      formData.set("email", values.email);
      formData.set("phone", values.phone);
      formData.set("dni", values.dni);
      formData.set("noCertificate", String(values.noCertificate));
      formData.set("privacyAccepted", String(values.privacyAccepted));
      formData.set("website", "");
      if (!values.noCertificate) {
        for (const file of files) {
          formData.append("certificateFiles", file, file.name);
        }
      }

      const response = await fetch("/api/matriculaciones", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "No se ha podido enviar la solicitud");
      }

      const paymentUrl =
        data.paymentUrl ||
        (await fetchConfiguredPaymentUrl().catch(() => null));

      setResult({
        reference: data.reference ?? null,
        paymentUrl,
        noCertificate: values.noCertificate,
      });
      try {
        track("registration_submit", {
          site: "monopatin",
          certificate: values.noCertificate ? "missing" : "attached",
        });
      } catch {
        // Analytics no debe convertir un envío correcto en un error visible.
      }
      toast.success("Solicitud de matriculación recibida");
      reset();
      setFiles([]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se ha podido enviar la solicitud";
      setSubmitError(message);
      toast.error(message);
    }
  }

  if (result) {
    return (
      <GradientBorder>
        <div className="p-6 sm:p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-success/40 bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <p className="eyebrow mb-2">★ SOLICITUD RECIBIDA ★</p>
          <h2 className="font-display text-4xl tracking-wider sm:text-5xl">
            Ya tenemos tus datos
          </h2>
          {result.reference && (
            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-text-muted">
              Referencia {result.reference}
            </p>
          )}
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-text-secondary">
            {result.noCertificate
              ? "Como no tienes certificado, nos pondremos en contacto contigo para explicarte cómo conseguirlo."
              : "Revisaremos la documentación y nos pondremos en contacto contigo si necesitamos alguna aclaración."}
          </p>

          {result.paymentUrl ? (
            <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-border bg-bg-secondary p-5 sm:p-6">
              <p className="text-sm text-text-secondary">
                El siguiente paso es abonar la gestión:
              </p>
              <p className="price-mono my-3 text-4xl text-white">
                {SCOOTER_REGISTRATION_PRICE_EUR.toFixed(2).replace(".", ",")} €
              </p>
              <a
                href={result.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-4 text-base"
              >
                Ir al pago seguro
              </a>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                <LockKeyhole className="h-3.5 w-3.5" />
                Pago en Stripe. La tienda lo comprobará manualmente.
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-lg rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-text-secondary">
              El enlace de pago aún no está disponible. Tu solicitud está guardada
              correctamente y nos pondremos en contacto contigo.
            </div>
          )}

          <button
            type="button"
            onClick={() => setResult(null)}
            className="btn-outline mt-7"
          >
            Enviar otra solicitud
          </button>
        </div>
      </GradientBorder>
    );
  }

  const disabled = isSubmitting || preparingFiles;

  return (
    <GradientBorder>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-6 sm:p-8"
        noValidate
      >
        <div>
          <p className="eyebrow">★ DATOS PARA LA MATRÍCULA ★</p>
          <h2 className="mt-2 font-display text-4xl tracking-wider sm:text-5xl">
            Solicita la tramitación
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Completa los datos tal y como aparecen en el certificado del
            patinete.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="holderName"
            label="Nombre del titular del certificado *"
            error={errors.holderName?.message}
          >
            <input
              id="holderName"
              autoComplete="name"
              {...register("holderName")}
              className="input-base"
              placeholder="Nombre y apellidos"
              aria-invalid={Boolean(errors.holderName)}
            />
          </Field>

          <Field id="dni" label="DNI o NIE *" error={errors.dni?.message}>
            <input
              id="dni"
              autoComplete="off"
              inputMode="text"
              {...register("dni")}
              className="input-base uppercase"
              placeholder="12345678Z"
              aria-invalid={Boolean(errors.dni)}
            />
          </Field>

          <Field id="email" label="Email *" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="input-base"
              placeholder="tu@email.com"
              aria-invalid={Boolean(errors.email)}
            />
          </Field>

          <Field id="phone" label="Teléfono *" error={errors.phone?.message}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              {...register("phone")}
              className="input-base"
              placeholder="+34 600 000 000"
              aria-invalid={Boolean(errors.phone)}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-bg-secondary/70 p-5">
          <div>
            <p className="label-base mb-1">Copia del certificado *</p>
            <p className="text-xs leading-relaxed text-text-muted">
              Hasta {SCOOTER_REGISTRATION_MAX_FILES} archivos JPG, PNG, WEBP o
              PDF. Máximo 3 MB en total. Las imágenes grandes se reducen antes
              de enviarse.
            </p>
          </div>

          {!noCertificate && (
            <>
              <label
                htmlFor="certificateFiles"
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-5 py-7 text-center transition-colors hover:border-accent-orange hover:bg-bg-tertiary focus-within:border-accent-orange"
              >
                {preparingFiles ? (
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-accent-orange" />
                ) : (
                  <UploadCloud className="mb-3 h-8 w-8 text-accent-orange" />
                )}
                <span className="font-semibold text-white">
                  {preparingFiles
                    ? "Preparando imágenes…"
                    : "Añadir fotos o PDF del certificado"}
                </span>
                <span className="mt-1 text-xs text-text-muted">
                  Puedes seleccionar anverso y reverso
                </span>
                <input
                  id="certificateFiles"
                  type="file"
                  accept={SCOOTER_REGISTRATION_ACCEPT_ATTRIBUTE}
                  multiple
                  className="sr-only"
                  disabled={preparingFiles}
                  onChange={async (event) => {
                    const input = event.currentTarget;
                    await addFiles(input.files);
                    input.value = "";
                  }}
                />
              </label>

              {files.length > 0 && (
                <ul className="space-y-2" aria-label="Archivos seleccionados">
                  {files.map((file, index) => {
                    const Icon =
                      file.type === "application/pdf" ? FileText : FileImage;
                    return (
                      <li
                        key={`${file.name}-${file.size}-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-bg-primary px-3 py-2.5"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-accent-orange" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{file.name}</p>
                          <p className="text-xs text-text-muted">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((current) =>
                              current.filter((_, fileIndex) => fileIndex !== index)
                            )
                          }
                          className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-accent-red"
                          aria-label={`Quitar ${file.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg-primary p-4 transition-colors hover:border-accent-orange has-[:checked]:border-accent-orange has-[:checked]:bg-accent-orange/10">
            <input
              type="checkbox"
              {...register("noCertificate", {
                onChange: (event) => {
                  if (event.target.checked) {
                    setFiles([]);
                    setFileError("");
                  }
                },
              })}
              className="mt-0.5 h-4 w-4 accent-accent-red"
            />
            <span>
              <span className="block font-semibold text-white">
                No tengo certificado
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                Quiero que os pongáis en contacto conmigo para explicarme cómo
                conseguirlo.
              </span>
            </span>
          </label>

          {fileError && (
            <p className="text-sm text-accent-red" role="alert">
              {fileError}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            {...register("privacyAccepted")}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent-red"
          />
          <span>
            He leído y acepto la{" "}
            <Link href="/privacidad" className="text-white underline underline-offset-4">
              política de privacidad
            </Link>
            , incluido el tratamiento del DNI y del certificado para gestionar
            esta solicitud. *
          </span>
        </label>
        {errors.privacyAccepted && (
          <p className="-mt-4 text-xs text-accent-red" role="alert">
            {errors.privacyAccepted.message}
          </p>
        )}

        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Web</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {submitError && (
          <div
            className="rounded-lg border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-accent-red"
            role="alert"
            aria-live="polite"
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {preparingFiles ? "Preparando archivos…" : "Enviando…"}
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Enviar solicitud
            </>
          )}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-text-muted">
          Tras enviarla verás el enlace de pago de 19,50 €. No almacenamos datos
          de tarjeta; el pago se realiza directamente en Stripe.
        </p>
      </form>
    </GradientBorder>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-accent-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
