"use client";

import { motion } from "framer-motion";
import { MessageSquare, Search, FileText, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const steps = [
  { n: "01", icon: MessageSquare, title: "Tráenoslo o escríbenos", text: "Pásate por el taller o cuéntanos lo que pasa por WhatsApp. Diagnóstico gratis si reparas con nosotros." },
  { n: "02", icon: Search, title: "Diagnóstico", text: "Revisamos el patinete a fondo y te decimos exactamente qué tiene." },
  { n: "03", icon: FileText, title: "Presupuesto", text: "Claro, transparente y sin sorpresas. Tú decides si seguimos adelante." },
  { n: "04", icon: CheckCircle2, title: "Reparado", text: "Tu patinete listo, probado y como nuevo. Garantía sobre la reparación." },
];

export function RepairProcess() {
  return (
    <section className="section-pad bg-bg-secondary border-y border-border relative overflow-hidden">
      <div className="container-custom relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">★ CÓMO TRABAJAMOS ★</p>
            <h2 className="display-lg">Reparación en 4 pasos</h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">Sin rodeos. Sin tecnicismos. Sin sorpresas en la factura.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute top-12 left-12 right-12 h-[2px] origin-left"
            style={{ background: "linear-gradient(90deg, #FF2A2A 0%, #FF003C 100%)" }}
          />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={s.n} delay={i * 0.12}>
                <div className="relative bg-bg-primary border border-border rounded-2xl p-6 hover:border-accent-red/50 transition-all duration-300 h-full">
                  <div className="absolute -top-4 left-6 px-3 py-1 rounded-full text-xs font-bold font-mono" style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF003C 100%)", color: "#0A0A0C" }}>
                    {s.n}
                  </div>
                  <Icon className="w-9 h-9 text-accent-orange mb-4 mt-2" strokeWidth={1.4} />
                  <h3 className="font-display text-2xl tracking-wider mb-2">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.text}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
