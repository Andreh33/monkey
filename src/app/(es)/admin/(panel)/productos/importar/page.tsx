import { ProductImport } from "@/components/admin/ProductImport";

export const metadata = { title: "Importar borradores", robots: { index: false, follow: false } };

export default function ImportProductsPage() {
  return <ProductImport />;
}
