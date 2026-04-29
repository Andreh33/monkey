import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { ContactForm } from "@/components/shared/ContactForm";
import MapLoader from "@/components/shared/MapLoader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Marquee } from "@/components/layout/Marquee";

export const metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <>
      <section className="container-custom pt-16 pb-8">
        <ScrollReveal>
          <p className="eyebrow mb-3">★ HABLEMOS ★</p>
          <h1 className="display-xl">Ven a vernos</h1>
          <p className="mt-4 text-lg text-text-secondary max-w-xl">Estamos en pleno centro de Tarragona. Pasa cuando quieras o escríbenos por WhatsApp.</p>
        </ScrollReveal>
      </section>

      <section className="container-custom section-pad-sm">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <ScrollReveal>
            <div className="card-base p-6 sm:p-8">
              <h2 className="font-display text-3xl tracking-wider mb-6">Escríbenos</h2>
              <ContactForm />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="card-base p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="font-display text-3xl tracking-wider mb-1">Información</h2>
                <p className="text-text-muted text-sm">Toda la info de contacto</p>
              </div>

              <ContactRow icon={MapPin} title="Dirección">
                C/ Jaume I, 5
                <br />
                43003 Tarragona
              </ContactRow>

              <ContactRow icon={Phone} title="Teléfonos">
                <a href="tel:+34643274756" className="block hover:text-white transition-colors font-mono">+34 643 27 47 56</a>
                <a href="tel:+34616686593" className="block hover:text-white transition-colors font-mono">+34 616 686 593</a>
              </ContactRow>

              <ContactRow icon={Clock} title="Horario">
                <span className="font-mono text-xs leading-relaxed">
                  L-V · 10:00-20:00
                  <br />
                  S · 11:00-15:00
                  <br />
                  D · Cerrado
                </span>
              </ContactRow>

              <a
                href="https://wa.me/34643274756"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 w-full px-5 py-4 rounded-md font-semibold text-white"
                style={{ background: "#25D366" }}
              >
                <MessageCircle className="w-5 h-5" />
                Escríbenos por WhatsApp
              </a>

              <a
                href="https://www.tiktok.com/@monopatinshop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 w-full px-5 py-4 rounded-md font-semibold border border-border hover:border-accent-red hover:bg-bg-tertiary transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.84a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.27Z"/></svg>
                Síguenos en TikTok
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="container-custom pb-12">
        <ScrollReveal>
          <MapLoader />
        </ScrollReveal>
      </section>

      <section className="border-y border-border bg-bg-secondary/40 py-6">
        <Marquee
          items={["TARRAGONA", "C/ JAUME I, 5", "ABIERTOS", "TODAS LAS MARCAS", "DIAGNÓSTICO GRATUITO"]}
          speed={32}
          separator="✦"
          itemClassName="font-display text-2xl sm:text-3xl tracking-wider text-text-muted"
        />
      </section>
    </>
  );
}

function ContactRow({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-10 h-10 rounded-md bg-bg-tertiary flex items-center justify-center text-accent-orange shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-text-muted font-mono">{title}</p>
        <div className="text-text-secondary mt-0.5">{children}</div>
      </div>
    </div>
  );
}
