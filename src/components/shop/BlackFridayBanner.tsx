"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import promotion from '@/config/black-friday.json';
import { promotionCopy } from '@/lib/promotion-copy';
import { localePath, type Locale } from '@/lib/storefront-routes';

export function BlackFridayBanner() {
  const pathname=usePathname();
  const [closed,setClosed]=useState(false);
  const segment=pathname.split('/')[1];
  const locale: Locale=segment==='fr'||segment==='it'||segment==='pt'?segment:'es';
  const d=promotionCopy[locale];
  if(!promotion.active||closed||pathname.includes('/admin')) return null;
  return <aside aria-label="Black Friday" className="relative bg-accent-red text-white px-4 py-3">
    <div className="mx-auto max-w-7xl pr-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
      <p><strong className="font-display text-2xl tracking-wide">BLACK FRIDAY</strong><span className="block sm:inline sm:ml-3 font-bold text-sm">{d.offer}</span></p>
      <Link href={localePath(locale,'/tienda')} className="rounded bg-black px-4 py-2 text-xs font-bold uppercase">{d.shop}</Link>
      <p className="w-full text-xs leading-relaxed">{d.terms}</p>
    </div>
    <button type="button" onClick={()=>setClosed(true)} aria-label={d.close} className="absolute right-2 top-3 p-2 rounded hover:bg-black/20"><X size={18}/></button>
  </aside>;
}
