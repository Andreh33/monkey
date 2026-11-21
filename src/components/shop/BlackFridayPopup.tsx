"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { BlackFridayRibbon } from './BlackFridayRibbon';

const dismissalKey = 'monkey-black-friday-2026-popup-dismissed';

export function BlackFridayPopup() {
  const [visible, setVisible] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');

  useEffect(() => {
    try { setVisible(sessionStorage.getItem(dismissalKey) !== '1'); }
    catch { setVisible(true); }
  }, []);

  function dismiss() {
    setVisible(false);
    try { sessionStorage.setItem(dismissalKey, '1'); } catch { /* Closing still works without storage. */ }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText('monkeymotion');
      setCopyStatus('copied');
    } catch { setCopyStatus('manual'); }
  }

  if (!visible) return null;

  return (
    <aside aria-label="Oferta Black Friday" className="fixed bottom-24 left-4 z-40 w-[calc(100%-2rem)] max-w-[340px] overflow-hidden rounded-lg border-2 border-black bg-accent-red text-white shadow-2xl sm:bottom-6 sm:left-6 sm:max-w-[300px]">
      <button type="button" onClick={dismiss} aria-label="Cerrar oferta Black Friday" className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={20}/></button>
      <div className="px-4 py-3">
        <p className="pr-8 text-[11px] font-semibold sm:text-xs">Ya está aquí tu día más esperado.</p>
        <p className="mt-1 pr-7 font-display text-2xl leading-none tracking-wide">Los precios más monos. BLACK FRIDAY</p>
        <p className="mt-2 text-xs font-bold">12 € de descuento con <strong className="font-mono">monkeymotion</strong></p>
        <p className="mt-1 text-[11px] leading-snug">En compras superiores a 200 € en productos, envío aparte. Aplica el código al pagar.</p>
        <button type="button" onClick={copyCode} className="mt-3 w-full rounded bg-black px-3 py-2.5 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{copyStatus === 'copied' ? 'Código copiado ✓' : 'Copiar código: monkeymotion'}</button>
        <p role="status" className="sr-only">{copyStatus === 'copied' ? 'Código monkeymotion copiado.' : ''}</p>
        {copyStatus === 'manual' && <p className="mt-1 select-text text-xs">Copia este código: <strong>monkeymotion</strong></p>}
        <Link href="/tienda" onClick={dismiss} className="mt-2 inline-block text-xs font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Ver ofertas</Link>
      </div>
      <div aria-hidden="true" className="pointer-events-none relative h-12 overflow-hidden sm:h-16">
        <div className="absolute -left-4 -right-4 top-2 -rotate-6 sm:top-3"><BlackFridayRibbon /></div>
        <div className="absolute -left-4 -right-4 top-4 rotate-6 sm:top-6"><BlackFridayRibbon reverse /></div>
      </div>
    </aside>
  );
}
