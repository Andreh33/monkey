import { Marquee } from "./Marquee";

export function TopBar() {
  const items = [
    "⚡ VENTA Y REPARACIÓN",
    "TARRAGONA",
    "TODAS LAS MARCAS",
    "BATERÍAS",
    "RUEDAS",
    "FRENOS",
    "MOTOR",
    "ELECTRÓNICA",
    "DIAGNÓSTICO GRATUITO",
    "GARANTÍA 2 AÑOS",
  ];
  return (
    <div className="w-full text-black font-bold text-[11px] tracking-[0.25em] uppercase" style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF8800 100%)" }}>
      <div className="py-1.5">
        <Marquee items={items} speed={35} itemClassName="font-mono" separator="✦" />
      </div>
    </div>
  );
}
