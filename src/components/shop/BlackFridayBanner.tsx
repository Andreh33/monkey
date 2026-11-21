"use client";
import { usePathname } from 'next/navigation';
import promotion from '@/config/black-friday.json';
import { BlackFridayRibbon } from './BlackFridayRibbon';

export function BlackFridayBanner() {
  const pathname = usePathname();
  if (!promotion.active || pathname.includes('/admin')) return null;
  return <aside aria-label="Black Friday" className="overflow-hidden bg-black"><BlackFridayRibbon reverse /></aside>;
}
