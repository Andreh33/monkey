import { Battery, CircleDot, Disc, Zap, Cpu, Wrench, Clock, MessageSquare, Search, FileText, CheckCircle2 } from "lucide-react";
import { RepairForm } from "@/components/repair/RepairForm";
import { Marquee } from "@/components/layout/Marquee";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { PhoneButtons } from "@/components/shared/PhoneButtons";

export const metadata = { title: "Reparaciones" };

const types = [
  { icon: Battery, title: "Baterías", problems: ["No carga", "Autonomía baja", "No enciende", "Sustitución de celdas y BMS"] },
  { icon: CircleDot, title: "Ruedas y neumáticos", problems: ["Pinchazos express", "Cambio de cámara", "Sustitución completa", "Cubiertas tubeless"] },
  { icon: Disc, title: "Frenos", problems: ["Discos y pastillas", "Frenos eléctricos", "Frenos regenerativos", "Ajuste de tacto"] },
  { icon: Zap, title: "Motor", problems: ["Ruidos extraños", "Pérdida de potencia", "No responde el acelerador", "Cojinetes y bobinados"] },
  { icon: Cpu, title: "Electrónica", problems: ["Controladores", "Displays y pantallas", "Cableado", "Actualización de firmware"] },
  { icon: Wrench, title: "Mantenimiento general", problems: ["Revisiones periódicas", "Limpieza profunda", "Apriete y ajustes", "Engrase y rodamientos"] },
];

const steps = [
  { n: "01", icon: MessageSquare, title: "Tráenoslo", time: "Mismo día", text: "Pasa por C/ Jaume I, 5 sin cita o escríbenos por WhatsApp. Recogida en taller o lo dejas en mostrador." },
  { n: "02", icon: Search, title: "Diagnóstico", time: "1-2 días", text: "Lo revisamos a fondo: batería, motor, controlador, frenos, ruedas. Te decimos exactamente qué falla." },
  { n: "03", icon: FileText, title: "Presupuesto", time: "Sin compromiso", text: "Te llamamos con el precio exacto. Tú decides. Si no sigues, te lo devolvemos sin coste." },
  { n: "04", icon: CheckCircle2, title: "Reparado", time: "1-5 días", text: "Reparación con piezas originales o equivalentes. Prueba en pista. Garantía sobre la reparación." },
];

const brands = ["XIAOMI", "SEGWAY", "NINEBOT", "CECOTEC", "SMARTGYRO", "DUALTRON", "INOKIM", "KUGOO", "BONGO", "HIBOY", "PURE", "VSETT", "ZERO", "KAABO"];

export default function ReparacionesPage() {
  return (
    <>
      <section className="container-custom pt-16 pb-10">
        <ScrollReveal>
          <p className="eyebrow mb-3">★ TALLER PROPIO EN TARRAGONA ★</p>
          <h1 className="display-xl max-w-5xl">Reparamos tu patinete <span className="text-gradient">como si fuera nuevo</span>.</h1>
          <p className="mt-6 text-lg text-text-secondary max-w-2xl leading-relaxed">
            Diagnóstico gratis si reparas con nosotros. Presupuesto sin compromiso. Todas las marcas. Reparaciones con piezas originales o equivalentes y garantía sobre el trabajo realizado.
          </p>
          <div className="mt-7"><PhoneButtons /></div>
        </ScrollReveal>
      </section>

      <section className="container-custom section-pad-sm">
        <ScrollReveal>
          <h2 className="display-md mb-10">Qué reparamos</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((t, i) => {
            const Icon = t.icon;
            return (
              <ScrollReveal key={t.title} delay={i * 0.06}>
                <div className="card-base p-6 h-full">
                  <Icon className="w-10 h-10 text-accent-orange mb-4" strokeWidth={1.4} />
                  <h3 className="font-display text-2xl tracking-wider mb-3">{t.title}</h3>
                  <ul className="space-y-1.5 text-sm text-text-secondary">
                    {t.problems.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-orange mt-2 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="bg-bg-secondary border-y border-border section-pad">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="eyebrow mb-3">★ EL PROCESO ★</p>
              <h2 className="display-md">Cómo funciona</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={s.n} delay={i * 0.1}>
                  <div className="relative bg-bg-primary border border-border rounded-2xl p-6 h-full">
                    <div className="absolute -top-3 left-5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono" style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF8800 100%)", color: "#0A0A0C" }}>{s.n}</div>
                    <Icon className="w-8 h-8 text-accent-orange mb-3 mt-2" strokeWidth={1.4} />
                    <h3 className="font-display text-2xl tracking-wider">{s.title}</h3>
                    <div className="inline-flex items-center gap-1.5 mt-1 text-xs font-mono text-accent-orange">
                      <Clock className="w-3 h-3" /> {s.time}
                    </div>
                    <p className="text-sm text-text-secondary mt-3 leading-relaxed">{s.text}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-custom section-pad">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <ScrollReveal>
            <RepairForm />
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="space-y-6 lg:sticky lg:top-24">
              <h3 className="display-md">¿Prefieres llamarnos?</h3>
              <p className="text-text-secondary leading-relaxed">
                Sin formularios. Marca y te atendemos al momento. También por WhatsApp, mándanos foto del problema y te respondemos.
              </p>
              <div className="flex flex-col gap-3">
                <a href="tel:+34643274756" className="btn-primary text-base py-4 justify-start">📞 643 27 47 56</a>
                <a href="tel:+34616686593" className="btn-outline text-base py-4 justify-start">📞 616 686 593</a>
                <a href="https://wa.me/34643274756" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-start gap-3 px-6 py-4 rounded-md font-semibold text-white" style={{ background: "#25D366" }}>
                  💬 Escríbenos por WhatsApp
                </a>
              </div>
              <div className="card-base p-5">
                <p className="font-display text-2xl tracking-wider mb-2">Horario</p>
                <p className="text-sm text-text-secondary leading-relaxed font-mono">
                  Lunes a Viernes · 10:00-20:00<br />
                  Sábados · 11:00-15:00<br />
                  Domingos · Cerrado
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-y border-border bg-bg-secondary/50 py-10">
        <div className="text-center mb-5">
          <p className="eyebrow">★ MARCAS QUE REPARAMOS ★</p>
          <p className="text-sm text-text-secondary mt-3">Si tu patinete no está aquí, llámanos: lo arreglamos igual.</p>
        </div>
        <Marquee
          items={brands}
          speed={28}
          separator="✦"
          itemClassName="font-display text-3xl sm:text-4xl tracking-wider text-text-muted hover:text-white transition-colors"
        />
      </section>
    </>
  );
}
