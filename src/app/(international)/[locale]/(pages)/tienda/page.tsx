import { notFound } from "next/navigation";
import { Catalog, catalogMetadata } from "@/components/storefront/Catalog";
import { isLocale, type QueryInput } from "@/lib/storefront-routes";
import { missingMetadata } from "@/lib/not-found-metadata";
export const revalidate = 300;
type Props = { params: { locale: string }; searchParams: QueryInput };
export async function generateMetadata({ params, searchParams }: Props) {
  if (!isLocale(params.locale) || params.locale === "es")
    return missingMetadata;
  return catalogMetadata(params.locale, searchParams);
}
export default function Page({ params, searchParams }: Props) {
  if (!isLocale(params.locale) || params.locale === "es") notFound();
  return <Catalog locale={params.locale} input={searchParams} />;
}
