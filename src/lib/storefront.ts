import { createHash } from "node:crypto";
import fr from "@/content/products.fr.json";
import it from "@/content/products.it.json";
import pt from "@/content/products.pt.json";
import type { Locale } from "./storefront-routes";
export * from "./storefront-routes";
export { purchaseEligible } from "./purchase";
export type ProductSource = {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
};
export type Translation = {
  sourceHash: string;
  name: string;
  shortDesc: string;
  description: string;
};
export type TranslationMap = Record<string, Translation>;
const translations: Record<string, TranslationMap> = { fr, it, pt };
export function sourceHash(product: Omit<ProductSource, "id">) {
  return createHash("sha256")
    .update(
      JSON.stringify([product.name, product.shortDesc, product.description]),
    )
    .digest("hex");
}
export function translatedProduct<T extends ProductSource>(
  product: T,
  locale: Locale,
  map = translations[locale] ?? {},
) {
  if (locale === "es") return { ...product, translated: true };
  const entry = map[product.id];
  if (
    !entry ||
    entry.sourceHash !== sourceHash(product) ||
    ![entry.name, entry.shortDesc, entry.description].every(
      (s) => typeof s === "string" && s.trim(),
    )
  )
    return { ...product, translated: false };
  return {
    ...product,
    name: entry.name,
    shortDesc: entry.shortDesc,
    description: entry.description,
    translated: true,
  };
}
export function productLanguages(product: ProductSource): Locale[] {
  return (["es", "fr", "it", "pt"] as const).filter(
    (l) => translatedProduct(product, l).translated,
  );
}

/** Search is noindex. Matching editorial IDs is combined with live SKU/brand
 * search; rendering still checks each result's current source hash. */
export function localizedSearchIds(
  locale: Locale,
  term: string,
  map = translations[locale] ?? {},
) {
  const normalize = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  const query = normalize(term.trim());
  return query
    ? Object.entries(map)
        .filter(([, t]) =>
          normalize(t.name + " " + t.shortDesc).includes(query),
        )
        .map(([id]) => id)
    : [];
}
