export type OrderAlert = { id: string; totalCents: number; currency: string; paidAt: string };

/** Baseline and overlapping feed pages must never ring for the same payment twice. */
export function collectNewOrderAlerts(seen: Set<string>, orders: OrderAlert[], baseline: boolean) {
  const fresh: OrderAlert[] = [];
  for (const order of orders) {
    if (seen.has(order.id)) continue;
    seen.add(order.id);
    if (!baseline) fresh.push(order);
  }
  return fresh;
}
