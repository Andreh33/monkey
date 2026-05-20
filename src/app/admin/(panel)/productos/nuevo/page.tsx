import { ProductForm } from "@/components/admin/ProductForm";
import { getCategoryTree } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const categories = await getCategoryTree();
  return (
    <div>
      <h1 className="display-md mb-2">Nuevo producto</h1>
      <p className="text-text-secondary mb-8">Añade un patinete, accesorio o recambio al catálogo</p>
      <ProductForm categories={categories} />
    </div>
  );
}
