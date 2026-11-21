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
    <aside data-black-friday-popup="" aria-label="Oferta Black Friday" className="fixed left-1/2 top-1/2 z-40 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[344px] lg:max-w-[760px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overflow-x-hidden rounded-xl border-2 border-black bg-black/[0.72] text-white shadow-[0_16px_60px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <button type="button" onClick={dismiss} aria-label="Cerrar oferta Black Friday" className="absolute right-2 top-2 lg:right-4 lg:top-4 flex h-11 w-11 items-center justify-center rounded-full border border-black bg-black text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={20}/></button>
      <div className="px-5 pb-3 pt-5 lg:px-10 lg:pb-5 lg:pt-10">
        <p className="pr-12 text-[11px] lg:text-lg font-bold tracking-[0.18em] text-accent-red">BLACK FRIDAY</p>
        <p className="mt-3 pr-4 font-display text-[34px] lg:text-[64px] leading-[1.05] tracking-wide">Ya están aquí las ofertas más monas.</p>
        <p className="mt-4 text-sm lg:mt-6 lg:text-2xl font-bold"><span className="text-xl lg:text-[40px]">12 €</span> de descuento</p>
        <p className="mt-2 text-[13px] lg:text-lg leading-relaxed">En compras superiores a 200 € en productos, envío aparte. Aplica el código al pagar.</p>
        <button type="button" onClick={copyCode} className="mt-4 min-h-11 w-full rounded-md border border-black bg-accent-red px-3 py-2.5 text-[13px] lg:text-xl lg:min-h-16 lg:mt-6 font-bold text-white hover:bg-accent-red-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{copyStatus === 'copied' ? 'Código copiado ✓' : 'Copiar código: monkeymotion'}</button>
        <p role="status" className="sr-only">{copyStatus === 'copied' ? 'Código monkeymotion copiado.' : ''}</p>
        {copyStatus === 'manual' && <p className="mt-1 select-text text-xs">Copia este código: <strong>monkeymotion</strong></p>}
        <Link href="/tienda" onClick={dismiss} className="mt-1 flex min-h-11 items-center justify-center text-xs lg:text-base font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Ver ofertas</Link>
      </div>
      <div aria-hidden="true" className="pointer-events-none relative h-12 overflow-hidden sm:h-16">
        <div className="absolute -left-4 -right-4 top-2 -rotate-6 sm:top-3"><BlackFridayRibbon /></div>
        <div className="absolute -left-4 -right-4 top-4 rotate-6 sm:top-6"><BlackFridayRibbon reverse /></div>
      </div>
    </aside>
  );
}
