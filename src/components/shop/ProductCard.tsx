"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Battery, Zap, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  price: number;
  compareAt?: number | null;
  maxSpeed?: number | null;
  range?: number | null;
  motorPower?: number | null;
  featured?: boolean;
  images: { url: string; alt?: string | null }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cover = product.images[0]?.url ?? "/imagenes/local-01.jpeg";
  const second = product.images[1]?.url ?? cover;

  return (
    <motion.article
      whileHover={{ rotate: -1, y: -4 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="card-base group relative overflow-hidden"
    >
      <Link href={`/tienda/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bg-tertiary">
          <Image
            src={cover}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-all duration-500 group-hover:opacity-0"
          />
          <Image
            src={second}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-0 scale-105 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
          />
          {product.featured && (
            <span
              className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF003C 100%)" }}
            >
              Destacado
            </span>
          )}
          {product.compareAt && product.compareAt > product.price && (
            <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-bg-primary/80 backdrop-blur text-accent-orange border border-accent-orange/40">
              -{Math.round((1 - product.price / product.compareAt) * 100)}%
            </span>
          )}
        </div>

        <div className="p-5">
          {product.brand && (
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-1">{product.brand}</p>
          )}
          <h3 className="font-display text-2xl tracking-wider leading-none">{product.name}</h3>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-text-secondary">
            {product.maxSpeed != null && (
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-accent-orange" />
                <span className="font-mono">{product.maxSpeed}<span className="text-text-muted ml-0.5">km/h</span></span>
              </div>
            )}
            {product.range != null && (
              <div className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-accent-orange" />
                <span className="font-mono">{product.range}<span className="text-text-muted ml-0.5">km</span></span>
              </div>
            )}
            {product.motorPower != null && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent-orange" />
                <span className="font-mono">{product.motorPower}<span className="text-text-muted ml-0.5">W</span></span>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              {product.compareAt && product.compareAt > product.price && (
                <p className="price-mono text-xs text-text-muted line-through">{formatPrice(product.compareAt)}<span>€</span></p>
              )}
              <p className="price-mono text-2xl">
                {formatPrice(product.price)}<span className="currency">€</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent-orange group-hover:text-white transition-colors">
              Ver más <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
