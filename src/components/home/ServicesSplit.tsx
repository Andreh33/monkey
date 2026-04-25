"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

export function ServicesSplit() {
  const [hover, setHover] = useState<"sale" | "repair" | null>(null);
  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        <motion.div
          onHoverStart={() => setHover("sale")}
          onHoverEnd={() => setHover(null)}
          animate={{
            flexBasis: hover === "sale" ? "55%" : hover === "repair" ? "45%" : "50%",
          }}
          className="relative overflow-hidden group cursor-pointer min-h-[60vh]"
        >
          <Link href="/tienda" className="block absolute inset-0 z-20" aria-label="Ver tienda" />
          <Image
            src="/imagenes/local-20.jpeg"
            alt="Venta de patinetes eléctricos"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ filter: "brightness(0.45) saturate(1.1)" }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(255,42,42,0.85) 0%, rgba(198,21,21,0.6) 100%)",
              mixBlendMode: "multiply",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14 z-10">
            <p className="eyebrow text-white/80 mb-3">01 / VENTA</p>
            <h2 className="display-lg text-white">VENTA</h2>
            <p className="mt-4 max-w-md text-white/85 text-base md:text-lg leading-relaxed">
              Patinetes nuevos de las mejores marcas. Garantía completa, entrega configurada y soporte técnico de por vida.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-white font-semibold uppercase tracking-wider text-sm">
              Ver tienda
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
          </div>
        </motion.div>

        <motion.div
          onHoverStart={() => setHover("repair")}
          onHoverEnd={() => setHover(null)}
          animate={{
            flexBasis: hover === "repair" ? "55%" : hover === "sale" ? "45%" : "50%",
          }}
          className="relative overflow-hidden group cursor-pointer min-h-[60vh]"
        >
          <Link href="/reparaciones" className="block absolute inset-0 z-20" aria-label="Pedir reparación" />
          <Image
            src="/imagenes/local-25.jpeg"
            alt="Taller de reparación de patinetes"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ filter: "brightness(0.45) saturate(1.1)" }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(255,136,0,0.85) 0%, rgba(255,69,0,0.65) 100%)",
              mixBlendMode: "multiply",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14 z-10">
            <p className="eyebrow text-white/80 mb-3">02 / REPARACIÓN</p>
            <h2 className="display-lg text-white">REPARACIÓN</h2>
            <p className="mt-4 max-w-md text-white/85 text-base md:text-lg leading-relaxed">
              ¿Tu patinete no arranca? Diagnóstico gratuito y arreglo rápido. Todas las marcas, todos los problemas.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-white font-semibold uppercase tracking-wider text-sm">
              Pedir reparación
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
