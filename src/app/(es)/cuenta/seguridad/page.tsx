"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SeguridadPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("newPassword"));
    const confirm = String(fd.get("confirm"));
    const currentPassword = String(fd.get("currentPassword"));
    if (newPassword !== confirm) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/usuario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Error");
      }
      toast.success("Contraseña actualizada");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;
    await fetch("/api/usuario", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="display-md mb-2">Seguridad</h1>
        <p className="text-text-secondary">Gestiona tu contraseña y sesiones</p>
      </div>

      <form onSubmit={onChangePassword} className="card-base p-6 space-y-4">
        <h2 className="font-display text-2xl tracking-wider">Cambiar contraseña</h2>
        <div><label className="label-base">Contraseña actual</label><input type="password" name="currentPassword" required className="input-base" /></div>
        <div><label className="label-base">Nueva contraseña</label><input type="password" name="newPassword" required minLength={6} className="input-base" /></div>
        <div><label className="label-base">Confirmar nueva contraseña</label><input type="password" name="confirm" required minLength={6} className="input-base" /></div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>) : "Actualizar contraseña"}
        </button>
      </form>

      <div className="card-base p-6 space-y-4">
        <h2 className="font-display text-2xl tracking-wider">Sesión</h2>
        <p className="text-sm text-text-secondary">Cerrar sesión en este dispositivo</p>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-outline">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>

      <div className="rounded-2xl border border-accent-red/40 p-6 space-y-4 bg-accent-red/5">
        <h2 className="font-display text-2xl tracking-wider text-accent-red">Zona de peligro</h2>
        <p className="text-sm text-text-secondary">Eliminar tu cuenta es permanente. Se borrará todo tu historial.</p>
        <button onClick={onDelete} className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-semibold border border-accent-red text-accent-red hover:bg-accent-red hover:text-white transition-all">
          <Trash2 className="w-4 h-4" /> Eliminar cuenta
        </button>
      </div>
    </div>
  );
}
