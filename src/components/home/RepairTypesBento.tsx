"use client";

import { Battery, CircleDot, Disc, Zap, Cpu, Wrench } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const types = [
  {
    icon: Battery,
    title: "Baterías",
    desc: "No carga, autonomía baja, no enciende. Cambiamos celdas, BMS y conectores.",
    big: true,
  },
  { icon: CircleDot, title: "Ruedas", desc: "Pinchazos, cámaras, sustitución completa." },
  { icon: Disc, title: "Frenos", desc: "Discos, pastillas, frenos eléctricos y regenerativos." },
  { icon: Zap, title: "Motor", desc: "Ruidos, pérdida de potencia, no responde." },
  { icon: Cpu, title: "Electrónica", desc: "Controladores, displays, cableado y firmware." },
  { icon: Wrench, title: "Otros", desc: "Mantenimiento general, ajustes, revisión." },
];

export function RepairTypesBento() {
  return (
    <section className="section-pad container-custom">
      <ScrollReveal>
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">★ QUÉ REPARAMOS ★</p>
          <h2 className="display-lg">Todo lo que falla</h2>
          <p className="mt-3 text-text-secondary max-w-xl mx-auto">Si tu patinete tiene un problema, nosotros lo arreglamos.</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
        {types.map((t, i) => {
          const Icon = t.icon;
          return (
            <ScrollReveal
              key={t.title}
              delay={i * 0.06}
              className={t.big ? "col-span-2 row-span-2" : ""}
            >
              <div className="card-base h-full p-6 flex flex-col justify-between group cursor-pointer">
                <Icon
                  className={`text-accent-orange ${t.big ? "w-12 h-12" : "w-8 h-8"}`}
                  strokeWidth={1.4}
                />
                <div>
                  <h3 className={`font-display tracking-wider ${t.big ? "text-4xl" : "text-2xl"}`}>{t.title}</h3>
                  <p className={`mt-2 text-text-secondary ${t.big ? "text-base" : "text-xs"} leading-relaxed`}>
                    {t.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
