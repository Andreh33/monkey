import { Marquee } from "@/components/layout/Marquee";

const brands = ["XIAOMI", "SEGWAY", "NINEBOT", "CECOTEC", "SMARTGYRO", "DUALTRON", "INOKIM", "KUGOO", "BONGO", "HIBOY", "PURE", "VSETT", "ZERO", "KAABO"];

export function BrandsTicker() {
  return (
    <section className="py-14 border-y border-border bg-bg-secondary/40">
      <div className="text-center mb-6">
        <p className="eyebrow">★ TODAS LAS MARCAS ★</p>
      </div>
      <Marquee
        items={brands}
        speed={30}
        separator="✦"
        itemClassName="font-display text-3xl sm:text-5xl tracking-wider text-text-muted hover:text-white transition-colors"
      />
    </section>
  );
}
