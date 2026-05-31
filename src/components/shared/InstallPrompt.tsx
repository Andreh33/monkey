"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

export function InstallPrompt() {
  const pathname = usePathname();
  const hide = pathname?.startsWith("/admin");

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Registrar el service worker (necesario para que sea instalable).
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Si ya está instalada (modo standalone), no mostrar nada.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // No insistir si el usuario ya lo descartó.
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    // Detección de iOS (Safari no dispara beforeinstallprompt).
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    if (iOS) {
      setIsIOS(true);
      const t = setTimeout(() => setShow(true), 3500);
      return () => clearTimeout(t);
    }

    // Chrome / Edge / Android: capturar el evento de instalación.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3500);
    };
    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferred(null);
  };

  if (hide || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed bottom-24 sm:bottom-4 left-4 right-4 sm:right-auto z-[60] w-auto sm:w-[360px] max-w-[calc(100vw-2rem)]"
          role="dialog"
          aria-label="Instalar la aplicación"
        >
          <div
            className="relative flex items-center gap-3 rounded-xl border border-border bg-bg-secondary p-3 pr-10 shadow-2xl"
            style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,42,42,0.15)" }}
          >
            <button
              onClick={dismiss}
              aria-label="Cerrar"
              className="absolute right-2 top-2 text-text-primary/50 hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(180deg, #FF2A2A, #FF003C)",
                boxShadow: "0 6px 20px rgba(255, 23, 68, 0.5)",
              }}
            >
              <Download className="h-5 w-5 text-white" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight text-text-primary">
                Descarga la app
              </p>
              {isIOS ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-primary/70">
                  Pulsa <Share className="inline h-3.5 w-3.5" /> y &ldquo;Añadir a inicio&rdquo;
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-text-primary/70">
                  Instálala y accede más rápido desde tu móvil
                </p>
              )}
            </div>

            {!isIOS && (
              <button
                onClick={install}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
                style={{
                  background: "linear-gradient(180deg, #FF2A2A, #C61515)",
                  boxShadow: "0 6px 20px rgba(255, 42, 42, 0.45)",
                }}
              >
                Instalar
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
