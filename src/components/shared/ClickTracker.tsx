"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Registra como eventos de Vercel Analytics los clics en enlaces de contacto
 * (WhatsApp, telefono y email) de todo el sitio. Escucha en fase de captura a
 * nivel de documento, asi cubre cualquier enlace sin tocar cada componente.
 * Se ven en Vercel -> Analytics -> Events.
 */
export function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const path = window.location.pathname;
      if (/wa\.me|api\.whatsapp\.com|wa\.link/i.test(href)) {
        track("whatsapp_click", { path });
      } else if (href.startsWith("tel:")) {
        track("phone_click", { path });
      } else if (href.startsWith("mailto:")) {
        track("email_click", { path });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
