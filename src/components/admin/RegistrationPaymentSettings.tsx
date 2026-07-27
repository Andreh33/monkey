"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { scooterRegistrationPaymentUrlSchema } from "@/lib/registration";

export function RegistrationPaymentSettings({
  initialUrl,
}: {
  initialUrl: string;
}) {
  const [stripePaymentUrl, setStripePaymentUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const parsedTestUrl =
    scooterRegistrationPaymentUrlSchema.safeParse(stripePaymentUrl);
  const testUrl =
    parsedTestUrl.success && parsedTestUrl.data ? parsedTestUrl.data : null;

  async function save() {
    setSaving(true);
    try {
      const response = await fetch(
        "/api/admin/matriculaciones/configuracion",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stripePaymentUrl }),
        }
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        stripePaymentUrl?: string | null;
      };
      if (!response.ok) {
        throw new Error(data.error || "No se ha podido guardar");
      }

      setStripePaymentUrl(data.stripePaymentUrl ?? "");
      toast.success(
        data.stripePaymentUrl
          ? "Enlace de pago guardado"
          : "Enlace de pago desactivado"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se ha podido guardar"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card-base p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent-orange" />
            <h2 className="font-display text-2xl tracking-wider">
              Enlace de pago · 19,50 €
            </h2>
          </div>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-text-secondary">
            Pega aquí el Payment Link que hayas creado en Stripe por 19,50 €.
            Se mostrará únicamente después de enviar una solicitud. La web no
            consulta ni cambia nada en Stripe.
          </p>
          <label htmlFor="stripePaymentUrl" className="label-base">
            Payment Link de Stripe
          </label>
          <input
            id="stripePaymentUrl"
            type="url"
            value={stripePaymentUrl}
            onChange={(event) => setStripePaymentUrl(event.target.value)}
            className="input-base"
            placeholder="https://buy.stripe.com/..."
            autoComplete="off"
          />
          <p className="mt-2 text-xs text-text-muted">
            Déjalo vacío para ocultar temporalmente el botón de pago.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {testUrl && (
            <a
              href={testUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <ExternalLink className="h-4 w-4" />
              Probar enlace
            </a>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </section>
  );
}
