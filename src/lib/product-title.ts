import editorial from '@/content/product-titles.json';
import type { Locale } from './storefront-routes';

type EditorialTitle = { sourceName: string; titles: Record<Locale, string> };
const titles: Record<string, EditorialTitle> = editorial;

/** Metadata may omit secondary sales copy, but never truncate a model number.
 * An admin rename invalidates its editorial title until reviewed. */
export function productPageTitle(
  product: { id: string; name: string },
  displayedName: string,
  locale: Locale,
) {
  const entry = titles[product.id];
  const name = (entry?.sourceName === product.name
    ? entry.titles[locale]
    : displayedName).trim().replace(/\s+/g, ' ');
  return name.length <= 60 ? `${name} · Monkey` : name;
}
