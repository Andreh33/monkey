"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Result = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  price: number;
  images: { url: string; alt?: string | null }[];
};

export function SearchBox({
  autoFocus = false,
  placeholder = "Buscar producto…",
  onNavigate,
}: {
  autoFocus?: boolean;
  placeholder?: string;
  /** Se llama tras elegir un resultado (p. ej. para cerrar el panel del Navbar). */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  // Debounce: esperamos 250ms tras dejar de escribir antes de llamar a la API.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as Result[];
        setResults(data);
        setActive(-1);
      } catch {
        // Petición cancelada o error de red: no mostramos resultados.
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQ("");
    setResults([]);
    onNavigate?.();
    router.push(`/tienda/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = active >= 0 ? results[active] : results[0];
      if (pick) go(pick.slug);
    }
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
        <input
          type="text"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Buscar producto"
          className="w-full bg-bg-secondary border border-border rounded-md pl-9 pr-9 py-2.5 text-sm placeholder:text-text-muted focus:border-accent-red focus:outline-none"
        />
        {loading && (
          <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border bg-[rgba(40,40,47,0.85)] backdrop-blur-xl shadow-2xl overflow-hidden">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-5 text-sm text-text-muted text-center">Sin resultados para “{q.trim()}”.</p>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto py-1">
              {results.map((p, i) => {
                const img = p.images[0]?.url ?? "/imagenes/local-01.jpeg";
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(p.slug)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        i === active ? "bg-bg-tertiary" : "hover:bg-bg-tertiary"
                      }`}
                    >
                      <span className="relative w-11 h-11 shrink-0 rounded-md overflow-hidden bg-bg-tertiary">
                        <Image src={img} alt={p.images[0]?.alt ?? p.name} fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        {p.brand && (
                          <span className="block text-[10px] uppercase tracking-widest text-text-muted font-mono">
                            {p.brand}
                          </span>
                        )}
                        <span className="block text-sm font-semibold truncate">{p.name}</span>
                      </span>
                      <span className="price-mono text-sm shrink-0">
                        {formatPrice(p.price)}
                        <span className="currency">€</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
