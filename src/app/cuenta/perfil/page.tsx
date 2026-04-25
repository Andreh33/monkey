"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/usuario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil actualizado");
      await update();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="display-md mb-2">Perfil</h1>
      <p className="text-text-secondary mb-8">Tus datos personales</p>

      <form onSubmit={onSave} className="card-base p-6 max-w-2xl space-y-4">
        <div>
          <label className="label-base">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
        </div>
        <div>
          <label className="label-base">Email</label>
          <input value={session?.user?.email || ""} readOnly className="input-base opacity-60 cursor-not-allowed" />
          <p className="text-[11px] text-text-muted mt-1">El email no se puede modificar</p>
        </div>
        <div>
          <label className="label-base">Teléfono</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base" placeholder="+34 600 000 000" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>) : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
