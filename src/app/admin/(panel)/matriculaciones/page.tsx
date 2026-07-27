import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { RegistrationPaymentSettings } from "@/components/admin/RegistrationPaymentSettings";
import { RegistrationRequestRow } from "@/components/admin/RegistrationRequestRow";

export const dynamic = "force-dynamic";

export default async function AdminMatriculacionesPage() {
  noStore();

  const [settings, registrations] = await Promise.all([
    prisma.scooterRegistrationSettings.findUnique({
      where: { id: "default" },
      select: { stripePaymentUrl: true },
    }),
    prisma.scooterRegistrationRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          select: {
            id: true,
            originalName: true,
            contentType: true,
            size: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="display-md mb-2">Matriculaciones</h1>
      <p className="mb-7 text-text-secondary">
        Configura el cobro y revisa los formularios recibidos.
      </p>

      <RegistrationPaymentSettings
        initialUrl={settings?.stripePaymentUrl ?? ""}
      />

      <section className="mt-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl tracking-wider">
              Solicitudes recibidas
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {registrations.length} solicitud
              {registrations.length === 1 ? "" : "es"} en total
            </p>
          </div>
          <p className="text-xs leading-relaxed text-text-muted">
            El estado del pago se comprueba manualmente en Stripe.
          </p>
        </div>

        {registrations.length === 0 ? (
          <div className="card-base p-12 text-center text-text-muted">
            Todavía no hay solicitudes de matriculación.
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <RegistrationRequestRow
                key={registration.id}
                registration={registration}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
