"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fulfillmentLabels } from "@/lib/order-display";

export function OrderStatusSelect({ id, status, paid, stockIssue = false }: { id: string; status: string; paid: boolean; stockIssue?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  async function retryStock() {
    setSaving(true);
    try {
      const response = await fetch(`/api/pedidos/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ retryStock: true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo comprobar el stock.");
      toast.success("Stock asignado al pedido"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo comprobar el stock."); }
    finally { setSaving(false); }
  }
  async function update(next: string) {
    const previous = value;
    setValue(next); setSaving(true);
    try {
      const response = await fetch(`/api/pedidos/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fulfillmentStatus: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo guardar el estado.");
      toast.success("Preparación actualizada"); router.refresh();
    } catch (error) { setValue(previous); toast.error(error instanceof Error ? error.message : "No se pudo guardar el estado."); }
    finally { setSaving(false); }
  }
  return <div>
    <select aria-label="Estado de preparación" value={value} disabled={!paid || saving || stockIssue} onChange={e => update(e.target.value)} className="bg-bg-tertiary border border-border rounded-md px-2 py-2 text-xs font-mono cursor-pointer disabled:opacity-50">
      {Object.entries(fulfillmentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </select>
    {!paid && <p className="text-xs text-text-muted mt-1">Disponible tras el pago</p>}
    {paid && stockIssue && <div className="mt-2 space-y-2 max-w-xs"><p className="text-xs text-accent-orange">Pedido pagado con stock pendiente de asignar. Repón los productos antes de prepararlo.</p><button type="button" onClick={retryStock} disabled={saving} className="text-xs font-semibold text-accent-orange underline disabled:opacity-50">{saving ? "Comprobando stock…" : "Revisar stock"}</button></div>}
  </div>;
}
