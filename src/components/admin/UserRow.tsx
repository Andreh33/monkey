"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserRow({ user }: {
  user: { id: string; email: string; name: string | null; role: string; createdAt: Date | string };
}) {
  const [role, setRole] = useState(user.role);
  const router = useRouter();

  async function changeRole(value: string) {
    setRole(value);
    const res = await fetch(`/api/admin/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: value }),
    });
    if (res.ok) toast.success("Rol actualizado");
    else toast.error("Error");
  }

  async function remove() {
    if (!confirm(`¿Eliminar usuario "${user.email}"?`)) return;
    const res = await fetch(`/api/admin/usuarios/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Usuario eliminado");
      router.refresh();
    } else {
      const j = await res.json();
      toast.error(j.error || "Error");
    }
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 text-sm">{user.name ?? "—"}</td>
      <td className="px-4 py-3 text-sm font-mono">{user.email}</td>
      <td className="px-4 py-3 text-xs text-text-muted">{new Date(user.createdAt).toLocaleDateString("es-ES")}</td>
      <td className="px-4 py-3">
        <select value={role} onChange={(e) => changeRole(e.target.value)} className="bg-bg-tertiary border border-border rounded-md px-2 py-1 text-xs uppercase tracking-wider font-mono cursor-pointer">
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={remove} className="p-2 rounded hover:bg-bg-tertiary text-text-secondary hover:text-accent-red">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
