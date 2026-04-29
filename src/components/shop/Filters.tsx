"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";

const sortOptions = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre A-Z" },
];

export function Filters({ brands }: { brands: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`/tienda?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="sticky top-[64px] z-30 bg-bg-primary/85 backdrop-blur-xl border-y border-border">
      <div className="container-custom py-4 flex flex-wrap items-center gap-3">
        <Select
          label="Categoría"
          value={params.get("cat") ?? "all"}
          onChange={(v) => update("cat", v)}
          options={[
            { value: "all", label: "Todas" },
            { value: "patinete", label: "Patinetes" },
            { value: "moto", label: "Motos" },
            { value: "movilidad-reducida", label: "Movilidad reducida" },
            { value: "vehiculo-electrico", label: "Vehículos eléctricos" },
            { value: "bicicleta", label: "Bicicletas" },
            { value: "accesorio", label: "Accesorios" },
            { value: "recambio", label: "Recambios" },
          ]}
        />
        <Select
          label="Marca"
          value={params.get("brand") ?? "all"}
          onChange={(v) => update("brand", v)}
          options={[
            { value: "all", label: "Todas" },
            ...brands.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          label="Precio"
          value={params.get("price") ?? "all"}
          onChange={(v) => update("price", v)}
          options={[
            { value: "all", label: "Cualquiera" },
            { value: "0-500", label: "Hasta 500€" },
            { value: "500-1000", label: "500 - 1.000€" },
            { value: "1000+", label: "Más de 1.000€" },
          ]}
        />
        <Select
          label="Autonomía mín."
          value={params.get("range") ?? "all"}
          onChange={(v) => update("range", v)}
          options={[
            { value: "all", label: "Cualquiera" },
            { value: "30", label: "30 km +" },
            { value: "50", label: "50 km +" },
            { value: "70", label: "70 km +" },
          ]}
        />
        <div className="ml-auto">
          <Select
            label="Ordenar"
            value={params.get("sort") ?? "recent"}
            onChange={(v) => update("sort", v)}
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative inline-flex items-center gap-2 group">
      <span className="text-[10px] uppercase tracking-widest font-mono text-text-muted">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-bg-secondary border border-border rounded-md px-3 py-2 pr-8 text-sm hover:border-accent-red/60 focus:border-accent-red focus:outline-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
      </span>
    </label>
  );
}
