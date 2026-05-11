"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Img = { url: string; alt?: string | null };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: "/imagenes/local-01.jpeg", alt: name }];

  return (
    <div className="flex flex-col-reverse gap-4 md:grid md:grid-cols-[80px_1fr]">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar px-1 md:px-0 md:flex-col md:gap-3 md:max-h-[600px] md:overflow-x-visible md:overflow-y-auto md:snap-none">
        {list.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative w-16 h-16 shrink-0 snap-start md:w-auto md:h-auto md:aspect-square rounded-md overflow-hidden border-2 transition-all ${
              active === i ? "border-accent-red ring-2 ring-accent-red/40" : "border-border opacity-70 hover:opacity-100"
            }`}
            aria-label={`Imagen ${i + 1}`}
          >
            <Image src={img.url} alt={img.alt ?? name} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square sm:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-bg-secondary border border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image
              src={list[active].url}
              alt={list[active].alt ?? name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              style={{ filter: "saturate(1.1) contrast(1.05)" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
