import { getCategoryTree } from "@/lib/categories";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const tree = await getCategoryTree();
  return (
    <div>
      <h1 className="display-md mb-2">Categorías</h1>
      <p className="text-text-secondary mb-8">
        Gestiona las categorías y subcategorías de la tienda. Aparecen en el megamenú de la web y en los filtros de la tienda.
      </p>
      <CategoryManager initialTree={tree} />
    </div>
  );
}
