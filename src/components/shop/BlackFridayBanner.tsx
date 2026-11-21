"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import promotion from '@/config/black-friday.json';
import { promotionCopy } from '@/lib/promotion-copy';
import { localePath, type Locale } from '@/lib/storefront-routes';
import { BlackFridayRibbon } from './BlackFridayRibbon';

export function BlackFridayBanner() {
  const pathname=usePathname();
  const [closed,setClosed]=useState(false);
  const segment=pathname.split('/')[1];
  const locale: Locale=segment==='fr'||segment==='it'||segment==='pt'?segment:'es';
  const d=promotionCopy[locale];
  if(!promotion.active||closed||pathname.includes('/admin')) return null;
  return <aside aria-label="Black Friday" className="relative overflow-hidden bg-accent-red text-white">
    <BlackFridayRibbon />
    <div className="mx-auto max-w-7xl px-5 py-4 text-center">
      <p className="px-7 text-xs font-semibold sm:text-sm">{d.arrival}</p>
      <p className="mt-1 font-display text-3xl leading-none tracking-wide sm:text-4xl">{d.headline} <span className="inline-block">BLACK FRIDAY</span></p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <p className="text-sm font-bold">{d.offer}</p>
        <Link href={localePath(locale,'/tienda')} className="rounded bg-black px-4 py-2 text-xs font-bold uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{d.shop}</Link>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-xs leading-relaxed">{d.terms}</p>
    </div>
    <BlackFridayRibbon reverse />
    <button type="button" onClick={()=>setClosed(true)} aria-label={d.close} className="absolute right-1 top-7 p-3 rounded hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={18}/></button>
  </aside>;
}
