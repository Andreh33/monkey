import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus, Edit3 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";

export default async function AdminProductos() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="display-md mb-2">Productos</h1>
          <p className="text-text-secondary">{products.length} productos en catálogo</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo producto
        </Link>
      </div>

      <div className="card-base overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-tertiary">
            <tr className="text-left text-xs uppercase tracking-widest font-mono text-text-muted">
              <th className="px-4 py-3 w-16"></th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-bg-tertiary/30">
                <td className="px-4 py-3">
                  <div className="relative w-12 h-14 rounded overflow-hidden bg-bg-tertiary">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-sm">{p.name}</p>
                  {p.brand && <p className="text-xs text-text-muted">{p.brand}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary capitalize">{p.category}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPrice(p.price)}€</td>
                <td className="px-4 py-3 text-center font-mono">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {p.featured && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded bg-accent-orange/20 text-accent-orange">Destacado</span>}
                    <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded ${p.active ? "bg-success/20 text-success" : "bg-text-muted/20 text-text-muted"}`}>
                      {p.active ? "Activo" : "Oculto"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Link href={`/admin/productos/${p.id}`} className="p-2 rounded hover:bg-bg-tertiary text-text-secondary hover:text-white" aria-label="Editar">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <ProductDeleteButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-text-muted">No hay productos. Añade el primero.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
