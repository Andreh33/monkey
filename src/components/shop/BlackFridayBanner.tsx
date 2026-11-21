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
    <div className="mx-auto max-w-7xl px-3 py-2 text-center sm:px-5 sm:py-4">
      <p className="px-7 text-[10px] font-semibold sm:text-sm">{d.arrival}</p>
      <p className="mt-0.5 font-display text-xl leading-none tracking-wide sm:mt-1 sm:text-4xl">{d.headline} <span className="inline-block">BLACK FRIDAY</span></p>
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:mt-3 sm:gap-x-5 sm:gap-y-2">
        <p className="text-[11px] font-bold sm:text-sm">{d.offer}</p>
        <Link href={localePath(locale,'/tienda')} className="rounded bg-black px-2.5 py-2 text-[10px] font-bold uppercase sm:px-4 sm:text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{d.shop}</Link>
      </div>
      <p className="mx-auto mt-1 max-w-3xl text-[10px] leading-snug sm:mt-2 sm:text-xs sm:leading-relaxed"><span className="sm:hidden">{d.mobileTerms}</span><span className="hidden sm:inline">{d.terms}</span></p>
    </div>
    <BlackFridayRibbon reverse />
    <button type="button" onClick={()=>setClosed(true)} aria-label={d.close} className="absolute right-0 top-3 p-2 rounded sm:right-1 sm:top-7 sm:p-3 hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]"/></button>
  </aside>;
}
