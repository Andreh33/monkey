"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Img = { url: string; alt?: string | null };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: "/imagenes/local-01.jpeg", alt: name }];

  return (
    <div className="grid grid-cols-[80px_1fr] gap-4">
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto no-scrollbar">
        {list.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
              active === i ? "border-accent-red" : "border-border opacity-70 hover:opacity-100"
            }`}
            aria-label={`Imagen ${i + 1}`}
          >
            <Image src={img.url} alt={img.alt ?? name} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-bg-secondary border border-border">
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
