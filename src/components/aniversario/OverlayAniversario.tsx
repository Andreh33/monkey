"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ANIVERSARIO } from "@/config/aniversario";
import { Confeti } from "./Confeti";
import { SESSION_KEY_OVERLAY as SESSION_KEY, EVENTO_OVERLAY_CERRADO } from "./eventos";

export function OverlayAniversario() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [fase, setFase] = useState<"sorpresa" | "mensaje">("sorpresa");

  // Decide si mostrar: solo home, una vez por sesión, tras el primer render.
  useEffect(() => {
    if (!ANIVERSARIO.activo || pathname !== "/") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {}
    // Montar tras el primer render para no penalizar el LCP.
    const t = setTimeout(() => setAbierto(true), 350);
    return () => clearTimeout(t);
  }, [pathname]);

  // Secuencia SORPRESA -> textos.
  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(() => setFase("mensaje"), 1500);
    return () => clearTimeout(t);
  }, [abierto]);

  // Bloqueo de scroll mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    // Avisar al mono para que entre a bailar después del overlay.
    try {
      window.dispatchEvent(new Event(EVENTO_OVERLAY_CERRADO));
    } catch {}
  }, []);

  if (!ANIVERSARIO.activo || !abierto) return null;

  return (
    <div
      className="ani-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Celebración de aniversario"
      onClick={cerrar}
    >
      <Confeti />

      <button
        type="button"
        className="ani-overlay__cerrar"
        aria-label="Cerrar"
        onClick={cerrar}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Detiene el cierre al pulsar sobre el contenido (no sobre el fondo). */}
      <div className="ani-overlay__contenido" onClick={(e) => e.stopPropagation()}>
        {fase === "sorpresa" ? (
          <h2
            className="ani-sorpresa font-display leading-none"
            style={{
              fontSize: "clamp(3rem, 14vw, 8rem)",
              color: "#FFD60A",
              textShadow: "0 0 30px rgba(255,42,42,0.55), 0 6px 0 rgba(198,21,21,0.6)",
            }}
          >
            ¡¡SORPRESA!!
          </h2>
        ) : (
          <div className="ani-mensaje">
            <h2
              className="font-display leading-[0.92]"
              style={{
                fontSize: "clamp(2.75rem, 11vw, 6.5rem)",
                color: "#FFD60A",
                textShadow: "0 0 28px rgba(255,42,42,0.5)",
              }}
            >
              <span className="block sm:inline">¡FELICES</span>{" "}
              <span className="block sm:inline">{ANIVERSARIO.anios} AÑOS!</span>
            </h2>

            <p className="mt-5 text-lg font-semibold text-white sm:text-xl">
              Gracias a toda España por estos {ANIVERSARIO.anios} años rodando juntos.
            </p>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Felices de seguir creciendo con vosotros desde {ANIVERSARIO.desde}.
            </p>

            <button
              type="button"
              onClick={cerrar}
              className="mt-7 rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(180deg, #FFD60A, #FF8A00)",
                boxShadow: "0 10px 30px rgba(255, 138, 0, 0.45)",
              }}
            >
              ¡Vamos a celebrarlo!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
