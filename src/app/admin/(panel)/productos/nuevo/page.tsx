import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NuevoProducto() {
  const rows = await prisma.product.findMany({ select: { category: true }, distinct: ["category"] });
  const categories = rows.map((r) => r.category).filter(Boolean);
  return (
    <div>
      <h1 className="display-md mb-2">Nuevo producto</h1>
      <p className="text-text-secondary mb-8">Añade un patinete, accesorio o recambio al catálogo</p>
      <ProductForm categories={categories} />
    </div>
  );
}
