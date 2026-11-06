"use client";
import { AddToCart, type BuyableProduct } from "@/components/shop/AddToCart";
import type { Locale } from "@/lib/storefront-routes";
import type { StoreCopy } from "@/lib/storefront-copy";
export function Purchase({ product, locale, labels }: { product: BuyableProduct; locale: Locale; labels: Pick<StoreCopy, "delivery"> }) {
  return <div className="space-y-5" id="comprar"><p className="text-sm text-text-secondary leading-relaxed">{labels.delivery}</p><AddToCart product={product} locale={locale} /></div>;
}
