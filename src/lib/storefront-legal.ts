import type { Metadata } from "next";
import fr from "@/content/legal.fr.json";
import it from "@/content/legal.it.json";
import pt from "@/content/legal.pt.json";
import {
  equivalentLanguages,
  localePath,
  locales,
  type Locale,
} from "./storefront-routes";
type LegalEntry = { title: string; markdown: string };
const legal: Record<string, Record<string, LegalEntry>> = { fr, it, pt };
export const legalSlugs = [
  "aviso-legal",
  "privacidad",
  "cookies",
  "condiciones-compra",
];
export function legalEntry(locale: Locale, slug: string) {
  const entry = legal[locale]?.[slug];
  return entry && entry.title?.trim() && entry.markdown?.trim() ? entry : null;
}
export function staticLanguages(path: string) {
  const slug = path.slice(1);
  return legalSlugs.includes(slug)
    ? locales.filter((l) => l === "es" || Boolean(legalEntry(l, slug)))
    : locales;
}
export function staticMetadata(
  locale: Locale,
  path: string,
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: equivalentLanguages(path, staticLanguages(path)),
    },
  };
}
