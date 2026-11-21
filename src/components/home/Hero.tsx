"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, Wrench, ShoppingBag } from "lucide-react";
import { PhoneButtons } from "@/components/shared/PhoneButtons";
import promotion from "@/config/black-friday.json";
import { BlackFridayRibbon } from "@/components/shop/BlackFridayRibbon";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <Image
          src="/imagenes/local-15.jpeg"
          alt="MonopatinShop taller en Tarragona"
          fill
          priority
          className="object-cover"
          style={{ filter: "saturate(1.1) contrast(1.05) brightness(0.55)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/85 to-bg-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
      </div>

      <div className="container-custom relative z-10 min-w-0 w-full py-24">
        {promotion.active && (
          <motion.div
            data-mobile-arrival=""
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 max-w-xl overflow-hidden rounded-lg bg-accent-red text-white text-sm font-bold"
          >
            <BlackFridayRibbon />
            <div className="flex flex-col items-start gap-2 px-5 py-4">
              <span>Ya está aquí tu día más esperado.</span>
              <span className="font-display text-3xl leading-none tracking-wide sm:text-4xl">Los precios más monos. BLACK FRIDAY</span>
              <span>12 € de descuento con <strong className="font-mono">monkeymotion</strong> en compras superiores a 200 € en productos.</span>
              <span className="text-xs font-normal">Envío no incluido en el mínimo. Introduce el código al finalizar la compra.</span>
            </div>
            <BlackFridayRibbon reverse />
          </motion.div>
        )}

        <motion.p
          data-mobile-arrival=""
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-5"
        >
          ★ TARRAGONA · DESDE 2017 ★
        </motion.p>

        <motion.h1
          data-mobile-arrival=""
            initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="display-xl max-w-5xl"
        >
          TU PATINETE FALLA.<br />
          NOSOTROS LO DEJAMOS<br />
          <span className="text-gradient">NUEVO.</span>
        </motion.h1>

        <motion.p
          data-mobile-arrival=""
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-7 max-w-xl text-lg text-text-secondary leading-relaxed"
        >
          Venta y reparación de patinetes eléctricos de todas las marcas en Tarragona,
          con envío 24-48h a toda España.
          <br />
          <span className="text-white font-semibold">Calidad. Rapidez. Confianza.</span>
        </motion.p>

        <motion.div
          data-mobile-arrival=""
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link href="/reparaciones" className="btn-primary text-base px-8 py-4">
            <Wrench className="w-4 h-4" />
            Pedir reparación
          </Link>
          <Link href="/tienda" className="btn-outline text-base px-8 py-4">
            <ShoppingBag className="w-4 h-4" />
            Ver patinetes
          </Link>
        </motion.div>

        <motion.div
          data-mobile-arrival=""
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-10"
        >
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3 font-mono">Llámanos directo</p>
          <PhoneButtons />
        </motion.div>
      </div>

      <motion.div
        data-mobile-arrival-cue="" initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.2, duration: 1 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
      >
        <span className="text-[10px] uppercase tracking-widest font-mono">Scroll</span>
        <ArrowDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
