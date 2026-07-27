"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/registration";

type RegistrationDocument = {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
};

export type RegistrationAdminItem = {
  id: string;
  holderName: string;
  email: string;
  phone: string;
  dni: string;
  noCertificate: boolean;
  createdAt: Date | string;
  documents: RegistrationDocument[];
};

function whatsappPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9) digits = `34${digits}`;
  return digits;
}

const registrationDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

const registrationDateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

export function RegistrationRequestRow({
  registration,
}: {
  registration: RegistrationAdminItem;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const phoneForLinks = registration.phone.replace(/\s+/g, "");
  const whatsapp = whatsappPhone(registration.phone);

  async function remove() {
    if (
      !window.confirm(
        "¿Eliminar esta solicitud y todos sus certificados? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/matriculaciones/${registration.id}`,
        { method: "DELETE" }
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "No se ha podido eliminar");
      }
      toast.success("Solicitud y documentos eliminados");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se ha podido eliminar"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article
      className={`card-base overflow-hidden ${
        registration.noCertificate ? "border-warning/40" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-bg-tertiary/30"
        aria-expanded={open}
      >
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {registration.holderName}
            </p>
            <p className="mt-0.5 truncate text-xs text-text-muted sm:hidden">
              {registration.email}
            </p>
          </div>
          <p className="hidden truncate text-sm text-text-secondary sm:block">
            {registration.email}
          </p>
          <p className="hidden text-xs font-mono text-text-muted sm:block">
            {registrationDateFormatter.format(new Date(registration.createdAt))}
          </p>
          <span
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest ${
              registration.noCertificate
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-success/40 bg-success/10 text-success"
            }`}
          >
            {registration.noCertificate
              ? "Sin certificado"
              : `${registration.documents.length} archivo${
                  registration.documents.length === 1 ? "" : "s"
                }`}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border p-5">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Detail label="Titular" value={registration.holderName} />
              <Detail
                label="DNI / NIE"
                value={
                  <span className="font-mono text-white">
                    {registration.dni}
                  </span>
                }
              />
              <Detail
                label="Email"
                value={
                  <a
                    href={`mailto:${registration.email}`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Mail className="h-4 w-4" />
                    {registration.email}
                  </a>
                }
              />
              <Detail
                label="Teléfono"
                value={
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${phoneForLinks}`}
                      className="inline-flex items-center gap-2 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {registration.phone}
                    </a>
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-success hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                }
              />
              <Detail
                label="Recibida"
                value={registrationDateTimeFormatter.format(
                  new Date(registration.createdAt)
                )}
              />
              <Detail
                label="Referencia"
                value={
                  <span className="font-mono uppercase text-text-muted">
                    {registration.id.slice(0, 8)}
                  </span>
                }
              />
            </div>

            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">
                Certificado
              </p>
              {registration.noCertificate ? (
                <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <p className="font-semibold text-white">
                      No dispone de certificado
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      Hay que contactar con el titular y explicarle cómo
                      conseguirlo.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {registration.documents.map((document) => {
                    const Icon =
                      document.contentType === "application/pdf"
                        ? FileText
                        : FileImage;
                    return (
                      <li
                        key={document.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-bg-primary p-3"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-accent-orange" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">
                            {document.originalName}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatFileSize(document.size)}
                          </p>
                        </div>
                        <a
                          href={`/api/admin/matriculaciones/${registration.id}/documentos/${document.id}`}
                          className="btn-outline px-3 py-2 text-xs"
                        >
                          <Download className="h-4 w-4" />
                          Descargar
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="btn-outline border-accent-red/40 text-accent-red hover:bg-accent-red/10 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Eliminando…" : "Eliminar solicitud"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <div className="mt-1 text-sm text-text-secondary">{value}</div>
    </div>
  );
}
