"use client";

import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const thumbs = [
  { img: "/imagenes/local-30.jpeg", title: "Reparando una batería Xiaomi" },
  { img: "/imagenes/local-31.jpeg", title: "Test de un Dualtron Mini" },
  { img: "/imagenes/local-32.jpeg", title: "Cambio de neumático en directo" },
  { img: "/imagenes/local-33.jpeg", title: "Ruta nocturna por Tarragona" },
];

export function TikTokSection() {
  return (
    <section className="section-pad container-custom">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <ScrollReveal>
          <div>
            <p className="eyebrow mb-3">★ NUESTRA COMUNIDAD ★</p>
            <h2 className="display-lg">Síguenos en<br /><span className="text-gradient">TikTok</span></h2>
            <p className="mt-5 text-text-secondary text-lg leading-relaxed max-w-md">
              Reparaciones reales, trucos para alargar la vida de tu patinete, novedades del taller y la vida del shop. Todo en directo.
            </p>
            <p className="mt-3 font-mono text-text-muted">@monopatinshop</p>
            <a
              href="https://www.tiktok.com/@monopatinshop"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-7 inline-flex"
            >
              Ver en TikTok
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 gap-3">
            {thumbs.map((t, i) => (
              <motion.a
                key={i}
                href="https://www.tiktok.com/@monopatinshop"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -6, rotate: i % 2 === 0 ? -1 : 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-border group"
              >
                <Image src={t.img} alt={t.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </span>
                </div>
                <p className="absolute bottom-3 left-3 right-3 text-xs text-white font-semibold">{t.title}</p>
              </motion.a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
