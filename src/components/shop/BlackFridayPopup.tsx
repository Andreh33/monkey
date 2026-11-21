"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { BlackFridayRibbon } from './BlackFridayRibbon';

const dismissalKey = 'monkey-black-friday-2026-popup-dismissed';

export function BlackFridayPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try { setVisible(sessionStorage.getItem(dismissalKey) !== '1'); }
    catch { setVisible(true); }
  }, []);

  function dismiss() {
    setVisible(false);
    try { sessionStorage.setItem(dismissalKey, '1'); } catch { /* Closing still works without storage. */ }
  }

  if (!visible) return null;

  return (
    <aside aria-label="Oferta Black Friday" className="fixed bottom-24 left-4 z-40 w-[calc(100%-2rem)] max-w-[340px] overflow-hidden rounded-lg border border-white/15 bg-accent-red text-white shadow-2xl sm:bottom-6 sm:left-6 sm:max-w-sm">
      <BlackFridayRibbon />
      <button type="button" onClick={dismiss} aria-label="Cerrar oferta Black Friday" className="absolute right-0 top-4 flex h-11 w-11 items-center justify-center rounded hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:top-6"><X size={20}/></button>
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <p className="pr-8 text-[11px] font-semibold sm:text-xs">Ya está aquí tu día más esperado.</p>
        <p className="mt-1 pr-7 font-display text-2xl leading-none tracking-wide sm:text-3xl">Los precios más monos. BLACK FRIDAY</p>
        <p className="mt-2 text-xs font-bold">12 € de descuento con <strong className="font-mono">monkeymotion</strong></p>
        <p className="mt-1 text-[11px] leading-snug">En compras superiores a 200 € en productos, envío aparte. Aplica el código al pagar.</p>
        <Link href="/tienda" onClick={dismiss} className="mt-3 inline-block rounded bg-black px-4 py-2 text-xs font-bold uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Ver ofertas</Link>
      </div>
      <BlackFridayRibbon reverse />
    </aside>
  );
}
