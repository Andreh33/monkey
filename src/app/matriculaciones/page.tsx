import type { Metadata } from "next";
import {
  BadgeCheck,
  CreditCard,
  FileCheck2,
  Headphones,
  LockKeyhole,
} from "lucide-react";
import { ScooterRegistrationForm } from "@/components/registration/ScooterRegistrationForm";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export const metadata: Metadata = {
  title: "Matriculación de patinetes eléctricos",
  description:
    "Solicita online la gestión de la matrícula de tu patinete eléctrico por 19,50 €. Adjunta el certificado o te ayudamos a conseguirlo.",
  alternates: { canonical: "/matriculaciones" },
};

const steps = [
  {
    icon: FileCheck2,
    number: "01",
    title: "Rellena tus datos",
    text: "Indica el nombre del titular, DNI o NIE, email y teléfono.",
  },
  {
    icon: BadgeCheck,
    number: "02",
    title: "Añade el certificado",
    text: "Sube una copia. Si no lo tienes, marca la casilla y te orientamos.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Abona 19,50 €",
    text: "Tras enviar la solicitud verás el enlace de pago seguro en Stripe.",
  },
];

export default function MatriculacionesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-bg-secondary">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 78% 22%, rgba(255,42,42,0.25), transparent 34%)",
          }}
        />
        <div className="container-custom relative py-16 sm:py-20 lg:py-24">
          <ScrollReveal>
            <div className="max-w-4xl">
              <p className="eyebrow mb-3">★ GESTIÓN DE MATRÍCULAS VMP ★</p>
              <h1 className="display-xl text-[2.9rem] sm:text-[clamp(3.5rem,9vw,9rem)]">
                Matricula tu patinete{" "}
                <span className="text-gradient">sin complicaciones</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
                Envíanos la documentación y gestionamos la solicitud contigo. Si
                aún no tienes el certificado, te contactamos para explicarte el
                siguiente paso.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-accent-red/40 bg-accent-red/10 px-4 py-2 text-sm font-semibold text-white">
                  Precio de gestión: 19,50 €
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                  <LockKeyhole className="h-4 w-4 text-success" />
                  Certificados con acceso privado
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="container-custom section-pad-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} delay={index * 0.08}>
                <div className="card-base h-full p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="h-8 w-8 text-accent-orange" strokeWidth={1.5} />
                    <span className="font-mono text-xs tracking-widest text-text-muted">
                      {step.number}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl tracking-wider">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {step.text}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="container-custom pb-20 sm:pb-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <ScrollReveal>
            <ScooterRegistrationForm />
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="card-base p-6">
                <Headphones className="mb-4 h-8 w-8 text-accent-orange" />
                <h2 className="font-display text-3xl tracking-wider">
                  ¿No tienes certificado?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  No pasa nada. Marca la casilla del formulario y nos pondremos
                  en contacto contigo para explicarte qué necesitas y cómo
                  obtenerlo.
                </p>
              </div>

              <div className="rounded-2xl border border-success/30 bg-success/10 p-6">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-6 w-6 text-success" />
                  <h2 className="font-heading font-semibold">
                    Documentación protegida
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  La copia del certificado no es pública. Solo el equipo
                  administrador puede descargarla desde el panel privado.
                </p>
              </div>

              <div className="card-base p-6">
                <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
                  Importante
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  El envío del formulario no confirma por sí solo la
                  matriculación. Revisaremos la documentación y el pago antes de
                  continuar la gestión.
                </p>
              </div>
            </aside>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
