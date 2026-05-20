"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, FolderTree, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import type { CategoryNode } from "@/lib/categories";

export function CategoryManager({ initialTree }: { initialTree: CategoryNode[] }) {
  const [tree, setTree] = useState<CategoryNode[]>(initialTree);
  const [newCat, setNewCat] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await fetch("/api/admin/categorias");
    if (res.ok) setTree(await res.json());
  }

  async function call(url: string, method: string, body?: unknown): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error en la operación");
      }
      await reload();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addCategory() {
    const name = newCat.trim();
    if (name.length < 2) return toast.error("Escribe un nombre de categoría");
    if (await call("/api/admin/categorias", "POST", { name })) {
      setNewCat("");
      toast.success("Categoría creada");
    }
  }

  async function deleteCategory(c: CategoryNode) {
    const extra = c.subcategories.length ? ` y sus ${c.subcategories.length} subcategoría(s)` : "";
    if (!confirm(`¿Borrar la categoría "${c.name}"${extra}? Los productos no se eliminan, solo dejan de mostrarse bajo esta categoría.`)) return;
    if (await call(`/api/admin/categorias/${c.id}`, "DELETE")) toast.success("Categoría borrada");
  }

  async function renameCategory(id: string, name: string, original: string) {
    if (name.trim() === original || name.trim().length < 2) return;
    if (await call(`/api/admin/categorias/${id}`, "PATCH", { name })) toast.success("Renombrada");
  }

  async function addSub(categoryId: string, name: string, reset: () => void) {
    if (name.trim().length < 2) return toast.error("Escribe un nombre de subcategoría");
    if (await call("/api/admin/subcategorias", "POST", { categoryId, name })) {
      reset();
      toast.success("Subcategoría creada");
    }
  }

  async function deleteSub(id: string, name: string) {
    if (!confirm(`¿Borrar la subcategoría "${name}"?`)) return;
    if (await call(`/api/admin/subcategorias/${id}`, "DELETE")) toast.success("Subcategoría borrada");
  }

  async function renameSub(id: string, name: string, original: string) {
    if (name.trim() === original || name.trim().length < 2) return;
    if (await call(`/api/admin/subcategorias/${id}`, "PATCH", { name })) toast.success("Renombrada");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Añadir categoría */}
      <div className="card-base p-5 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="label-base">Nueva categoría</label>
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="Ej: Patinetes"
            className="input-base"
          />
        </div>
        <button onClick={addCategory} disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Añadir categoría
        </button>
      </div>

      {tree.length === 0 ? (
        <div className="card-base p-10 text-center text-text-muted">
          <FolderTree className="w-8 h-8 mx-auto mb-3 opacity-50" />
          Aún no hay categorías. Crea la primera arriba.
        </div>
      ) : (
        tree.map((c) => (
          <div key={c.id} className="card-base p-5">
            <div className="flex items-center gap-3 mb-4">
              <FolderTree className="w-5 h-5 text-accent-red shrink-0" />
              <input
                defaultValue={c.name}
                onBlur={(e) => renameCategory(c.id, e.target.value, c.name)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="input-base flex-1 font-semibold"
                aria-label={`Nombre de ${c.name}`}
              />
              <code className="text-xs text-text-muted font-mono px-2 py-1 rounded bg-bg-tertiary shrink-0">/{c.slug}</code>
              <button
                onClick={() => deleteCategory(c)}
                disabled={busy}
                className="p-2 rounded-md text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors shrink-0"
                aria-label={`Borrar ${c.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Subcategorías */}
            <div className="pl-2 sm:pl-8 space-y-2">
              {c.subcategories.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-text-muted shrink-0" />
                  <input
                    defaultValue={s.name}
                    onBlur={(e) => renameSub(s.id, e.target.value, s.name)}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="input-base flex-1 py-1.5 text-sm"
                    aria-label={`Nombre de ${s.name}`}
                  />
                  <code className="text-[10px] text-text-muted font-mono shrink-0">/{s.slug}</code>
                  <button
                    onClick={() => deleteSub(s.id, s.name)}
                    disabled={busy}
                    className="p-1.5 rounded-md text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors shrink-0"
                    aria-label={`Borrar ${s.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <AddSubRow categoryId={c.id} busy={busy} onAdd={addSub} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AddSubRow({
  categoryId,
  busy,
  onAdd,
}: {
  categoryId: string;
  busy: boolean;
  onAdd: (categoryId: string, name: string, reset: () => void) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center gap-2 pt-1">
      <CornerDownRight className="w-4 h-4 text-text-muted/40 shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAdd(categoryId, value, () => setValue(""));
        }}
        placeholder="Nueva subcategoría…"
        className="input-base flex-1 py-1.5 text-sm"
      />
      <button
        onClick={() => onAdd(categoryId, value, () => setValue(""))}
        disabled={busy}
        className="btn-outline py-1.5 px-3 text-xs shrink-0"
      >
        <Plus className="w-3.5 h-3.5" /> Añadir
      </button>
    </div>
  );
}
