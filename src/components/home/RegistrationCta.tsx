import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function RegistrationCta() {
  return (
    <section className="container-custom section-pad-sm">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-bg-secondary">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 85% 20%, rgba(255,42,42,0.28), transparent 36%), linear-gradient(135deg, rgba(255,255,255,0.03), transparent 55%)",
            }}
          />
          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-red/40 bg-accent-red/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent-orange">
                  <BadgeCheck className="h-4 w-4" />
                  Nuevo servicio
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                  Gestión · 19,50 €
                </span>
              </div>
              <h2 className="display-lg max-w-3xl">
                Matriculamos tu{" "}
                <span className="text-gradient">patinete eléctrico</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
                Envíanos los datos del titular y una copia del certificado. Si
                todavía no lo tienes, te explicamos cómo conseguirlo.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-accent-orange" />
                  Solicitud online
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Documentación protegida
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end">
              <div className="mb-4 rounded-xl border-4 border-white/80 bg-white px-6 py-3 text-center text-black shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/60">
                  Servicio VMP
                </p>
                <p className="font-mono text-2xl font-black tracking-[0.16em] sm:text-3xl">
                  MATRÍCULA
                </p>
              </div>
              <Link
                href="/matriculaciones"
                className="btn-primary w-full py-4 text-base sm:w-auto"
              >
                Solicitar matriculación
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
