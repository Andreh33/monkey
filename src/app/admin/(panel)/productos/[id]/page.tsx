import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProducto({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!product) notFound();

  return (
    <div>
      <h1 className="display-md mb-2">Editar producto</h1>
      <p className="text-text-secondary mb-8">{product.name}</p>
      <ProductForm product={product} />
    </div>
  );
}
