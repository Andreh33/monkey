import { ProductForm } from "@/components/admin/ProductForm";

export default function NuevoProducto() {
  return (
    <div>
      <h1 className="display-md mb-2">Nuevo producto</h1>
      <p className="text-text-secondary mb-8">Añade un patinete, accesorio o recambio al catálogo</p>
      <ProductForm />
    </div>
  );
}
