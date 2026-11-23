import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export default async function AdminProductos() {
  const products = await prisma.product.findMany({
    select: {
      id: true, slug: true, name: true, sku: true, brand: true, category: true,
      price: true, stock: true, featured: true, active: true, createdAt: true,
      // Prisma 5 needs ordering/relation fields when batching large lists.
      images: { orderBy: { order: "asc" }, take: 1, select: { id: true, productId: true, order: true, url: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="display-md mb-2">Productos</h1>
          <p className="text-text-secondary">{products.length} productos en catálogo</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/productos/publicar" className="btn-outline">Publicar ocultos</Link>
          <Link href="/admin/productos/importar" className="btn-outline">Importar borradores</Link>
          <Link href="/admin/productos/nuevo" className="btn-primary">
            <Plus className="w-4 h-4" /> Nuevo producto
          </Link>
        </div>
      </div>

      <AdminProductsTable products={products} />
    </div>
  );
}
