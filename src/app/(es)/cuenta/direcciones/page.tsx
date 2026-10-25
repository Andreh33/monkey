"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

type Address = {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

export default function DireccionesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/direcciones");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd) as Record<string, unknown>;
    payload.isDefault = fd.get("isDefault") === "on";
    const res = await fetch("/api/direcciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Error al guardar");
      return;
    }
    toast.success("Dirección guardada");
    setShowForm(false);
    load();
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await fetch("/api/direcciones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Dirección eliminada");
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="display-md mb-2">Direcciones</h1>
          <p className="text-text-secondary">Gestiona tus direcciones de envío</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {showForm ? "Cerrar" : "Nueva dirección"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="card-base p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label-base">Etiqueta *</label><input name="label" required className="input-base" placeholder="Casa, oficina..." /></div>
          <div className="sm:col-span-2"><label className="label-base">Nombre completo *</label><input name="fullName" required className="input-base" /></div>
          <div className="sm:col-span-2"><label className="label-base">Calle y número *</label><input name="street" required className="input-base" /></div>
          <div><label className="label-base">Ciudad *</label><input name="city" required className="input-base" /></div>
          <div><label className="label-base">Código postal *</label><input name="postalCode" required className="input-base" /></div>
          <div><label className="label-base">País</label><input name="country" defaultValue="España" className="input-base" /></div>
          <div><label className="label-base">Teléfono</label><input name="phone" className="input-base" /></div>
          <label className="sm:col-span-2 flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" name="isDefault" className="accent-accent-red" />
            <span>Marcar como predeterminada</span>
          </label>
          <button type="submit" className="btn-primary sm:col-span-2">Guardar dirección</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="card-base p-12 text-center">
          <MapPin className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Aún no has añadido direcciones</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((a) => (
            <div key={a.id} className="card-base p-5 relative">
              {a.isDefault && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono px-2 py-1 rounded-full bg-accent-orange/15 text-accent-orange">
                  <Star className="w-3 h-3 fill-accent-orange" /> Predeterminada
                </span>
              )}
              <p className="text-[10px] uppercase tracking-widest font-mono text-text-muted">{a.label}</p>
              <p className="font-display text-xl tracking-wider mt-1">{a.fullName}</p>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                {a.street}<br />
                {a.postalCode} {a.city}<br />
                {a.country}
                {a.phone && <><br />{a.phone}</>}
              </p>
              <button onClick={() => onDelete(a.id)} className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-red hover:text-white">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
