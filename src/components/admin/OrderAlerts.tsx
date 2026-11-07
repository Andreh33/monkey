"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BellRing, Volume2, VolumeX } from "lucide-react";
import { createOrderAlarm } from "@/lib/order-alarm-audio";
import { collectNewOrderAlerts, type OrderAlert } from "@/lib/order-alert-state";
import { formatOrderMoney, orderReference } from "@/lib/order-display";

const preferenceKey = "monkey-admin-order-sound";
type Feed = { orders: OrderAlert[]; cursor: string; hasMore: boolean; baseline: boolean };

export function OrderAlerts() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const alarm = useRef<ReturnType<typeof createOrderAlarm> | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [activating, setActivating] = useState(false);
  const [soundError, setSoundError] = useState("");
  const [connection, setConnection] = useState<"connecting" | "online" | "offline">("connecting");
  const [pending, setPending] = useState<OrderAlert[]>([]);

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
  useEffect(() => {
    alarm.current = createOrderAlarm();
    try { setEnabled(localStorage.getItem(preferenceKey) === "on"); } catch { /* Storage can be disabled. */ }
    return () => { alarm.current?.dispose(); alarm.current = null; };
  }, []);

  // Remember the preference, but still respect browser audio activation rules.
  useEffect(() => {
    if (!enabled || ready) return;
    const unlock = () => { void alarm.current?.unlock().then(ok => { if (ok) setReady(true); }); };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enabled, ready]);

  useEffect(() => {
    let disposed = false;
    let cursor = "";
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | null = null;
    const seen = new Set<string>();
    async function poll() {
      if (disposed || controller) return;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 12000);
      let delay = 10000;
      try {
        const response = await fetch(`/api/admin/pedidos/avisos${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, {
          cache: "no-store", credentials: "same-origin", signal: controller.signal,
        });
        if (!response.ok) throw new Error("Notification feed unavailable");
        const feed: Feed = await response.json();
        if (disposed) return;
        const fresh = collectNewOrderAlerts(seen, feed.orders, feed.baseline);
        cursor = feed.cursor;
        setConnection("online");
        if (fresh.length) {
          setPending(current => [...current, ...fresh]);
          // Refresh order lists, without disturbing an unrelated product edit form.
          if (pathnameRef.current === "/admin" || pathnameRef.current.startsWith("/admin/pedidos")) router.refresh();
        }
        if (feed.hasMore) delay = 100;
      } catch {
        if (!disposed) setConnection("offline");
      } finally {
        clearTimeout(timeout);
        controller = null;
        if (!disposed) timer = setTimeout(poll, delay);
      }
    }
    const wake = () => {
      if (document.visibilityState === "visible" && !controller) { clearTimeout(timer); void poll(); }
    };
    void poll();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
    };
  }, [router]);

  useEffect(() => {
    if (!enabled || !ready || !pending.length) return;
    const ring = () => {
      if (!alarm.current?.play()) {
        setReady(false);
        setSoundError("El navegador ha pausado el sonido. Pulsa Activar sonido.");
      }
    };
    ring();
    const timer = setInterval(ring, 8000);
    return () => { clearInterval(timer); alarm.current?.stop(); };
  }, [enabled, ready, pending.length]);

  async function activate() {
    setActivating(true);
    setSoundError("");
    setEnabled(true);
    try { localStorage.setItem(preferenceKey, "on"); } catch { /* Audio still works without storage. */ }
    const ok = await alarm.current?.unlock();
    setActivating(false);
    const playing = !!ok && !!alarm.current?.play();
    setReady(playing);
    if (!playing) setSoundError("No se pudo activar el sonido. Revisa el audio del navegador y vuelve a probar.");
  }
  function disable() {
    setEnabled(false);
    setReady(false);
    setSoundError("");
    alarm.current?.stop();
    try { localStorage.setItem(preferenceKey, "off"); } catch { /* Optional preference. */ }
  }
  function acknowledge() { alarm.current?.stop(); setPending([]); }
  const active = enabled && ready;
  return <section aria-label="Avisos de pedidos" className="mb-6 rounded-xl border border-border bg-bg-secondary p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 font-semibold">{active ? <Volume2 className="h-4 w-4 text-success" /> : <VolumeX className="h-4 w-4 text-accent-orange" />} Avisos de pedidos <span className={`text-xs ${active ? "text-success" : "text-accent-orange"}`}>{active ? "Sonido activado" : "Sonido pendiente de activar"}</span></p>
        <p className="mt-1 text-xs text-text-secondary">Suena al confirmarse un pago. Mantén este administrador abierto.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!active && <button type="button" onClick={() => void activate()} disabled={activating} className="rounded-md bg-accent-red px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{activating ? "Activando…" : "Activar sonido"}</button>}
        <button type="button" onClick={() => void activate()} disabled={activating} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-bg-tertiary disabled:opacity-50">Probar sonido</button>
        {enabled && <button type="button" onClick={disable} disabled={activating} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-bg-tertiary disabled:opacity-50">Desactivar</button>}
      </div>
    </div>
    <p role="status" className={`mt-2 text-xs ${connection === "offline" ? "text-accent-orange" : "text-text-muted"}`}>{connection === "connecting" ? "Conectando con los pedidos…" : connection === "offline" ? "Sin conexión con los pedidos. Reintentando automáticamente…" : "Conectado · Avisos de pagos nuevos"}</p>
    {soundError && <p role="alert" className="mt-2 text-sm text-accent-orange">{soundError}</p>}
    {!!pending.length && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-red bg-accent-red/10 p-4">
      <p className="flex items-center gap-2 font-semibold"><BellRing className="h-5 w-5 text-accent-red" />{pending.length === 1 ? `Nuevo pedido pagado ${orderReference(pending[0].id)} · ${formatOrderMoney(pending[0].totalCents)}` : `${pending.length} nuevos pedidos pagados`}</p>
      <div className="flex gap-3 items-center"><Link onClick={acknowledge} href={pending.length === 1 ? `/admin/pedidos/${encodeURIComponent(pending[0].id)}` : "/admin/pedidos"} className="font-semibold text-accent-orange underline">{pending.length === 1 ? "Ver pedido" : "Ver pedidos"}</Link><button type="button" onClick={acknowledge} className="rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm">Silenciar aviso</button></div>
    </div>}
  </section>;
}
