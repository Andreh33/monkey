"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader, UploadedImage } from "./ImageUploader";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id?: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number;
  compareAt?: number | null;
  sku?: string | null;
  stock: number;
  category: string;
  brand?: string | null;
  maxSpeed?: number | null;
  range?: number | null;
  motorPower?: number | null;
  battery?: string | null;
  weight?: number | null;
  maxLoad?: number | null;
  stripeLink: string;
  featured: boolean;
  active: boolean;
  images: { url: string; alt?: string | null }[];
};

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = !!product?.id;
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>(
    (product?.images ?? []).map((img, i) => ({ id: `existing-${i}`, url: img.url, alt: img.alt ?? undefined }))
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      name: String(fd.get("name") ?? ""),
      shortDesc: String(fd.get("shortDesc") ?? ""),
      description: String(fd.get("description") ?? ""),
      price: Number(fd.get("price") ?? 0),
      compareAt: fd.get("compareAt") ? Number(fd.get("compareAt")) : null,
      sku: String(fd.get("sku") ?? "") || null,
      stock: Number(fd.get("stock") ?? 0),
      category: String(fd.get("category") ?? "patinete"),
      brand: String(fd.get("brand") ?? "") || null,
      maxSpeed: fd.get("maxSpeed") ? Number(fd.get("maxSpeed")) : null,
      range: fd.get("range") ? Number(fd.get("range")) : null,
      motorPower: fd.get("motorPower") ? Number(fd.get("motorPower")) : null,
      battery: String(fd.get("battery") ?? "") || null,
      weight: fd.get("weight") ? Number(fd.get("weight")) : null,
      maxLoad: fd.get("maxLoad") ? Number(fd.get("maxLoad")) : null,
      stripeLink: String(fd.get("stripeLink") ?? ""),
      featured: fd.get("featured") === "on",
      active: fd.get("active") === "on",
      images: images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    };

    try {
      const url = isEdit ? `/api/productos/${product!.id}` : "/api/productos";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al guardar");
      }
      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-4xl">
      <Section title="Información básica">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Nombre *</Label><input name="name" required defaultValue={product?.name} className="input-base" /></div>
          <div className="sm:col-span-2"><Label>Descripción corta *</Label><input name="shortDesc" required defaultValue={product?.shortDesc} className="input-base" maxLength={160} /></div>
          <div className="sm:col-span-2"><Label>Descripción larga *</Label><textarea name="description" required defaultValue={product?.description} rows={6} className="input-base resize-y" /></div>
        </div>
      </Section>

      <Section title="Precio y stock">
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label>Precio (€) *</Label><input name="price" type="number" step="0.01" required defaultValue={product?.price} className="input-base" /></div>
          <div><Label>Precio anterior</Label><input name="compareAt" type="number" step="0.01" defaultValue={product?.compareAt ?? ""} className="input-base" /></div>
          <div><Label>Stock</Label><input name="stock" type="number" defaultValue={product?.stock ?? 0} className="input-base" /></div>
          <div><Label>SKU</Label><input name="sku" defaultValue={product?.sku ?? ""} className="input-base" /></div>
          <div>
            <Label>Categoría *</Label>
            <select name="category" defaultValue={product?.category ?? "patinete"} className="input-base">
              <option value="patinete">Patinete</option>
              <option value="moto">Moto</option>
              <option value="movilidad-reducida">Movilidad reducida</option>
              <option value="vehiculo-electrico">Vehículo eléctrico</option>
              <option value="bicicleta">Bicicleta</option>
              <option value="accesorio">Accesorio</option>
              <option value="recambio">Recambio</option>
            </select>
          </div>
          <div><Label>Marca</Label><input name="brand" defaultValue={product?.brand ?? ""} className="input-base" /></div>
        </div>
      </Section>

      <Section title="Specs técnicos">
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label>Velocidad máx. (km/h)</Label><input name="maxSpeed" type="number" defaultValue={product?.maxSpeed ?? ""} className="input-base" /></div>
          <div><Label>Autonomía (km)</Label><input name="range" type="number" defaultValue={product?.range ?? ""} className="input-base" /></div>
          <div><Label>Motor (W)</Label><input name="motorPower" type="number" defaultValue={product?.motorPower ?? ""} className="input-base" /></div>
          <div><Label>Batería</Label><input name="battery" defaultValue={product?.battery ?? ""} className="input-base" placeholder="48V 15Ah" /></div>
          <div><Label>Peso (kg)</Label><input name="weight" type="number" step="0.1" defaultValue={product?.weight ?? ""} className="input-base" /></div>
          <div><Label>Carga máx. (kg)</Label><input name="maxLoad" type="number" defaultValue={product?.maxLoad ?? ""} className="input-base" /></div>
        </div>
      </Section>

      <Section title="🔗 Link de Stripe" className="border-2 border-accent-orange/40 bg-accent-orange/5">
        <Label>URL de Payment Link de Stripe *</Label>
        <input name="stripeLink" required type="url" defaultValue={product?.stripeLink} className="input-base" placeholder="https://buy.stripe.com/..." />
        <p className="text-xs text-text-muted mt-2">El botón "Comprar ahora" del cliente redirigirá a este link en una nueva pestaña.</p>
      </Section>

      <Section title="Imágenes">
        <ImageUploader value={images} onChange={setImages} />
      </Section>

      <Section title="Visibilidad">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-accent-red w-4 h-4" />
            <span>Producto destacado</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="accent-accent-red w-4 h-4" />
            <span>Activo (visible en tienda)</span>
          </label>
        </div>
      </Section>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>) : (<><Save className="w-4 h-4" /> {isEdit ? "Actualizar producto" : "Crear producto"}</>)}
        </button>
        <button type="button" onClick={() => router.push("/admin/productos")} className="btn-outline">Cancelar</button>
      </div>
    </form>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`card-base p-6 ${className}`}>
      <h3 className="font-display text-2xl tracking-wider mb-5">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="label-base">{children}</label>;
}
