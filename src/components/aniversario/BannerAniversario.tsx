"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ANIVERSARIO } from "@/config/aniversario";

const STORAGE_KEY = "mm_banner_aniversario_cerrado";

/** Devuelve la fecha de hoy como YYYY-MM-DD en horario local. */
function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function BannerAniversario() {
  // Arranca oculto: solo se muestra tras comprobar localStorage en el cliente (SSR-safe).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ANIVERSARIO.activo) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === hoyISO()) return; // ya cerrado hoy
    } catch {}
    setVisible(true);
  }, []);

  const cerrar = () => {
    try {
      localStorage.setItem(STORAGE_KEY, hoyISO());
    } catch {}
    setVisible(false);
  };

  if (!ANIVERSARIO.activo || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Aniversario"
      className="ani-banner relative isolate w-full overflow-hidden"
      style={{ background: "#FFD60A", color: "#0A0A0C" }}
    >
      {/* Brillo sutil que cruza el banner */}
      <span aria-hidden="true" className="ani-banner__sheen" />

      <div className="relative z-10 mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:py-2.5">
        <p className="flex-1 text-center font-display leading-none tracking-wide">
          {/* Versión completa (escritorio) */}
          <span className="hidden text-lg sm:inline sm:text-xl">
            🎉 ¡CUMPLIMOS {ANIVERSARIO.anios} AÑOS!{" "}
            <span className="font-sans text-sm font-semibold tracking-normal">
              Gracias por rodar con nosotros desde {ANIVERSARIO.desde}.
            </span>
          </span>
          {/* Versión corta (móvil) */}
          <span className="text-base sm:hidden">
            🎉 ¡{ANIVERSARIO.anios} años!{" "}
            <span className="font-sans text-sm font-semibold">Gracias</span>
          </span>
        </p>

        <Link
          href="/nosotros"
          className="hidden shrink-0 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 sm:inline-block"
          style={{ background: "#0A0A0C", color: "#FFD60A" }}
        >
          Ver más
        </Link>

        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar aviso"
          className="shrink-0 rounded-md p-1 text-black/70 transition-colors hover:bg-black/10 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
