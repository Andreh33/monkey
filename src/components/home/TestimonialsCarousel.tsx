"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GradientBorder } from "@/components/shared/GradientBorder";

const testimonials = [
  { name: "Marc S.", city: "Tarragona Centro", text: "Mi Xiaomi no arrancaba. Lo dejé el lunes, me lo entregaron el miércoles funcionando mejor que cuando lo compré. Y el presupuesto fue exactamente lo que me dijeron.", stars: 5 },
  { name: "Aitana M.", city: "El Serrallo", text: "Compré un Cecotec aquí y la atención fue brutal. Me explicaron todo, lo configuraron a mi peso y ya he hecho más de 1000 km sin un solo problema.", stars: 5 },
  { name: "David L.", city: "Bonavista", text: "Cambio de batería completo en mi Segway. Otros me pedían el doble. Aquí encima me pusieron mejores celdas y autonomía nueva. Top.", stars: 5 },
  { name: "Núria F.", city: "Tarragona", text: "Vine sin cita un sábado por un pinchazo. En 20 minutos cambiado y a rodar. Cercanos, profesionales y con muy buen rollo. 100% recomendado.", stars: 5 },
  { name: "Jordi P.", city: "Sant Pere i Sant Pau", text: "Me asesoraron muy bien para elegir mi primer patinete. Me llevé un Smartgyro y no podría estar más contento. Un trato familiar de los que ya no quedan.", stars: 5 },
];

export function TestimonialsCarousel() {
  return (
    <section className="section-pad bg-bg-secondary border-y border-border overflow-hidden">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">★ HABLAN DE NOSOTROS ★</p>
            <h2 className="display-lg">Clientes contentos</h2>
          </div>
        </ScrollReveal>

        <div className="relative">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 50, ease: "linear", repeat: Infinity }}
            className="flex gap-6 w-max"
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[340px] sm:w-[380px] shrink-0">
                <GradientBorder>
                  <div className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-accent-orange text-accent-orange" />
                      ))}
                    </div>
                    <p className="text-text-primary leading-relaxed">"{t.text}"</p>
                    <div className="mt-5 pt-4 border-t border-border">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-text-muted font-mono">{t.city}</p>
                    </div>
                  </div>
                </GradientBorder>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
