import { revalidatePath } from "next/cache";
import { locales, localePath } from "./storefront-routes";

// Next 14 tags layout subtrees with their filesystem route groups. Literal
// /tienda/layout alone would miss the product pages nested below those groups.
export function revalidateCatalog() {
  revalidatePath("/(es)/tienda", "layout");
  revalidatePath("/(international)/[locale]/(pages)/tienda", "layout");
  for (const locale of locales) {
    revalidatePath(localePath(locale, "/tienda"));
    // Page-only invalidation also covers products removed from the featured list.
    revalidatePath(localePath(locale));
  }
  revalidatePath("/patinetes-electricos-homologados-dgt");
  revalidatePath("/sitemap.xml");
}
