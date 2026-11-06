"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { shippingBatchSchema } from "@/lib/product-publication";
import { formatPrice } from "@/lib/utils";

type Candidate = { id: string; name: string; price: number; stock: number; shippingCost: number | null; issue: string | null };
type Preview = { stripeConfigured: boolean; candidates: Candidate[]; excluded: Candidate[] };
type ShippingRow = { id: string; shippingCost: number; shippingCountries?: string[]; motorPower?: number };
const BATCH_SIZE = 50;

export function ProductPublication() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tariffs, setTariffs] = useState<ShippingRow[]>([]);
  const [filename, setFilename] = useState("");
  const [shippingDone, setShippingDone] = useState(0);
  const [publicationIds, setPublicationIds] = useState<string[]>([]);
  const [publicationDone, setPublicationDone] = useState(0);
  const [published, setPublished] = useState(0);
  async function refresh() {
    const response = await fetch("/api/admin/productos/publicar", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "No se pudo revisar el catálogo.");
    setPreview(data);
  }
  useEffect(() => { refresh().catch(e => setError(e.message)); }, []);
  async function readFile(file?: File) {
    setError(""); setTariffs([]); setShippingDone(0); setFilename("");
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("El archivo supera 10 MB.");
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.products) || data.products.length < 1 || data.products.length > 50000 || Object.keys(data).some(key => key !== "products")) throw new Error("Usa un archivo con una lista products de tarifas.");
      const validated: ShippingRow[] = [];
      for (let index = 0; index < data.products.length; index += BATCH_SIZE) {
        const result = shippingBatchSchema.safeParse({ products: data.products.slice(index, index + BATCH_SIZE) });
        if (!result.success) throw new Error(`Tarifas no válidas a partir de la fila ${index + 1}. Revisa identificadores, importes, países y correcciones de potencia.`);
        validated.push(...result.data.products);
      }
      if (new Set(validated.map(row => row.id)).size !== validated.length) throw new Error("El archivo contiene productos repetidos.");
      setTariffs(validated); setFilename(file.name);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo leer el archivo."); }
  }
  async function applyShipping() {
    setBusy(true); setError("");
    try {
      for (let index = shippingDone; index < tariffs.length; index += BATCH_SIZE) {
        const batch = tariffs.slice(index, index + BATCH_SIZE);
        const response = await fetch("/api/admin/productos/envios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products: batch }) });
        const data = await response.json();
        if (!response.ok) throw new Error(`${data.error ?? "No se guardó el lote."}${data.invalid?.length ? ` Productos afectados: ${data.invalid.join(", ")}` : ""}`);
        setShippingDone(index + batch.length);
      }
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudieron guardar las tarifas."); }
    finally { setBusy(false); }
  }
  async function publish() {
    const ids = publicationIds.length ? publicationIds : (preview?.candidates.map(p => p.id) ?? []);
    if (!ids.length) return;
    setPublicationIds(ids); setBusy(true); setError("");
    try {
      for (let index = publicationDone; index < ids.length; index += BATCH_SIZE) {
        const batch = ids.slice(index, index + BATCH_SIZE);
        const response = await fetch("/api/admin/productos/publicar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: batch }) });
        const data = await response.json();
        if (!response.ok) throw new Error(`${data.error ?? "No se publicó el lote."}${data.invalid?.length ? ` ${data.invalid.map((p: { id: string; reason: string }) => `${p.id}: ${p.reason}`).join("; ")}` : ""}`);
        setPublished(value => value + data.published);
        setPublicationDone(index + batch.length);
      }
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudieron publicar los productos."); }
    finally { setBusy(false); }
  }
  const remaining = publicationIds.length ? publicationIds.length - publicationDone : preview?.candidates.length ?? 0;
  return <div className="space-y-6">
    <div><h1 className="display-md mb-2">Publicar productos</h1><p className="text-text-secondary">Prepara los envíos y revisa los productos ocultos con stock antes de ponerlos a la venta.</p></div>
    {error && <div role="alert" className="card-base border-accent-red p-4 text-accent-red break-words">{error}</div>}
    <section className="card-base p-6 space-y-4">
      <h2 className="font-display text-2xl">Tarifas y destinos de envío</h2>
      <p className="text-sm text-text-secondary">Cada unidad suma su tarifa. El archivo permite preparar los productos importados y conservar los destinos de los antiguos. Las tarifas de los productos antiguos no se cambian.</p>
      <label className="block"><span className="label-base">Archivo JSON de tarifas</span><input type="file" accept=".json,application/json" disabled={busy} onChange={e => readFile(e.target.files?.[0])} className="input-base" /></label>
      {!!tariffs.length && <p className="text-sm">{filename} · {tariffs.length} productos · {tariffs.filter(t => t.motorPower !== undefined).length} correcciones de potencia · {tariffs.filter(t => t.shippingCountries).length} listas de destinos</p>}
      <button type="button" onClick={applyShipping} disabled={busy || !tariffs.length || shippingDone === tariffs.length} className="btn-outline disabled:opacity-50">{shippingDone && shippingDone < tariffs.length ? "Continuar aplicación de tarifas" : "Aplicar tarifas de envío"}</button>
      {!!tariffs.length && <p role="status" className="text-sm text-text-secondary">{shippingDone} de {tariffs.length} tarifas guardadas</p>}
    </section>
    <section className="card-base p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap"><h2 className="font-display text-2xl">Productos listos para publicar</h2><button type="button" disabled={busy} onClick={() => { setError(""); refresh().then(() => { setPublicationIds([]); setPublicationDone(0); setPublished(0); }).catch(e => setError(e.message)); }} className="text-sm text-accent-orange hover:underline disabled:opacity-50">Actualizar revisión</button></div>
      {!preview ? <p>Cargando catálogo…</p> : <>
        <p>{preview.candidates.length} productos cumplen los requisitos. {preview.excluded.length} requieren revisión.</p>
        {!preview.stripeConfigured && <p className="text-warning">Falta configurar Stripe o el webhook. La publicación estará disponible cuando el pago esté preparado.</p>}
        <p className="text-sm text-text-secondary">Se conservan los precios y el stock actuales. Se comprueban las fotografías y las tarifas antes de cambiar la visibilidad.</p>
        <button type="button" disabled={busy || !preview.stripeConfigured || !remaining} onClick={publish} className="btn-primary disabled:opacity-50">{busy ? "Procesando…" : publicationDone && remaining ? "Continuar publicación" : `Publicar ${remaining} productos`}</button>
        {!!publicationIds.length && <p role="status" className="text-sm">{publicationDone} de {publicationIds.length} procesados · {published} productos publicados</p>}
        <Link href="/admin/productos" className="inline-block text-sm text-accent-orange hover:underline ml-4">Ver catálogo</Link>
        {!!preview.candidates.length && <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="text-left text-xs text-text-muted py-2">Vista previa de los primeros {Math.min(15, preview.candidates.length)} productos.</caption><thead><tr><th className="text-left p-2">Producto</th><th className="text-right p-2">Precio</th><th className="text-right p-2">Envío/unidad</th><th className="text-right p-2">Stock</th></tr></thead><tbody>{preview.candidates.slice(0, 15).map(p => <tr key={p.id} className="border-t border-border"><td className="p-2">{p.name}</td><td className="p-2 text-right font-mono">{formatPrice(p.price)} €</td><td className="p-2 text-right font-mono">{formatPrice(p.shippingCost ?? 0)} €</td><td className="p-2 text-right font-mono">{p.stock}</td></tr>)}</tbody></table></div>}
        {!!preview.excluded.length && <details><summary className="cursor-pointer text-sm text-text-secondary">Ver motivos de los productos pendientes</summary><ul className="mt-3 space-y-2 text-sm">{preview.excluded.map(p => <li key={p.id}><Link className="text-accent-orange hover:underline" href={`/admin/productos/${p.id}`}>{p.name}</Link>: {p.issue}</li>)}</ul></details>}
      </>}
    </section>
  </div>;
}
