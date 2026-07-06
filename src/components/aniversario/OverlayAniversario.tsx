"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ANIVERSARIO } from "@/config/aniversario";
import { SESSION_KEY_OVERLAY as SESSION_KEY, EVENTO_OVERLAY_CERRADO } from "./eventos";

/**
 * Celebración del aniversario como TARJETA no bloqueante (antes era un overlay
 * a pantalla completa con scroll bloqueado). Google trata los interstitials
 * que cubren el contenido nada más aterrizar desde la SERP como señal negativa
 * de Page Experience (sobre todo en móvil), así que la fiesta ahora ocupa una
 * esquina: mismo mensaje, mismos colores, cero penalización y menos JS inicial
 * (ya no carga el canvas de confeti en el primer render).
 */
export function OverlayAniversario() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Solo home, una vez por sesión, tras el primer render (no toca el LCP).
  useEffect(() => {
    if (!ANIVERSARIO.activo || pathname !== "/") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {}
    const t = setTimeout(() => setAbierto(true), 1200);
    return () => clearTimeout(t);
  }, [pathname]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    // Avisar al mono para que entre a bailar después de la celebración.
    try {
      window.dispatchEvent(new Event(EVENTO_OVERLAY_CERRADO));
    } catch {}
  }, []);

  if (!ANIVERSARIO.activo || !abierto) return null;

  return (
    <div
      role="status"
      aria-label="Celebración de aniversario"
      className="ani-toast fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[90] rounded-2xl border p-5 shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #17130a 0%, #0A0A0C 70%)",
        borderColor: "rgba(255, 214, 10, 0.45)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.55), 0 0 24px rgba(255,214,10,0.12)",
      }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={cerrar}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <p
        className="font-display leading-none"
        style={{
          fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
          color: "#FFD60A",
          textShadow: "0 0 18px rgba(255,42,42,0.45)",
        }}
      >
        🎉 ¡FELICES {ANIVERSARIO.anios} AÑOS!
      </p>
      <p className="mt-2 text-sm text-white/85 leading-relaxed">
        Gracias a toda España por estos {ANIVERSARIO.anios} años rodando juntos desde {ANIVERSARIO.desde}.
      </p>

      <button
        type="button"
        onClick={cerrar}
        className="mt-4 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
        style={{
          background: "linear-gradient(180deg, #FFD60A, #FF8A00)",
          boxShadow: "0 8px 22px rgba(255, 138, 0, 0.4)",
        }}
      >
        ¡Vamos a celebrarlo!
      </button>
    </div>
  );
}
