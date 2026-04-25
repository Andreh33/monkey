"use client";

import { toast } from "sonner";
import { useTransition } from "react";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [, startTransition] = useTransition();
  async function onChange(s: string) {
    startTransition(async () => {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (res.ok) toast.success("Estado actualizado");
      else toast.error("Error");
    });
  }
  return (
    <select
      defaultValue={status}
      onChange={(e) => onChange(e.target.value)}
      className="bg-bg-tertiary border border-border rounded-md px-2 py-1 text-xs uppercase tracking-wider font-mono cursor-pointer hover:border-accent-orange"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
