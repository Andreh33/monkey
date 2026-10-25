import { Catalog,catalogMetadata } from '@/components/storefront/Catalog';
import type { QueryInput } from '@/lib/storefront-routes';
export const revalidate=300;
export function generateMetadata({searchParams}:{searchParams:QueryInput}){return catalogMetadata('es',searchParams);}
export default function Page({searchParams}:{searchParams:QueryInput}){return <Catalog locale="es" input={searchParams}/>;}
