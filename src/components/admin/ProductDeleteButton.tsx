"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProductDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  async function onDelete() {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Producto eliminado");
      router.refresh();
    } else {
      toast.error("Error al eliminar");
    }
  }
  return (
    <button onClick={onDelete} className="p-2 rounded hover:bg-bg-tertiary text-text-secondary hover:text-accent-red" aria-label="Eliminar">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
