export const fulfillmentLabels: Record<string, string> = {
  UNFULFILLED: "Sin preparar", PREPARING: "En preparación", SHIPPED: "Enviado", DELIVERED: "Entregado",
};
export const paidOrderStates = ["PAID", "SHIPPED", "DELIVERED"];
export function paymentLabel(status: string) {
  if (paidOrderStates.includes(status)) return "Pagado";
  return ({ PENDING: "Pendiente de pago", FAILED: "Pago fallido", EXPIRED: "Pago caducado", CANCELLED: "Cancelado", REFUNDED: "Reembolsado" } as Record<string, string>)[status] ?? status;
}
export function fulfillmentValue(order: { status: string; fulfillmentStatus?: string | null }) {
  if (["SHIPPED", "DELIVERED"].includes(order.status) && (!order.fulfillmentStatus || order.fulfillmentStatus === "UNFULFILLED")) return order.status;
  return order.fulfillmentStatus ?? "UNFULFILLED";
}
export function orderTotalCents(order: { totalCents?: number | null; total: number }) {
  return order.totalCents !== null && order.totalCents !== undefined ? order.totalCents : Math.round(order.total * 100);
}
export const formatOrderMoney = (cents: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
export const orderReference = (id: string) => `#${id.slice(-8).toUpperCase()}`;
export type DisplayOrderItem = { productId: string; name: string; quantity: number; unitPriceCents: number; lineTotalCents: number };
export function orderItems(raw: string): DisplayOrderItem[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.flatMap(value => {
      if (!value || typeof value !== "object") return [];
      const item = value as Record<string, unknown>;
      const quantity = Number(item.quantity);
      const unitPriceCents = item.unitPriceCents === undefined ? Math.round(Number(item.price) * 100) : Number(item.unitPriceCents);
      if (typeof item.name !== "string" || !Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0) return [];
      const lineTotalCents = Number.isSafeInteger(item.lineTotalCents) && Number(item.lineTotalCents) >= 0 ? Number(item.lineTotalCents) : quantity * unitPriceCents;
      return [{ productId: String(item.productId ?? item.id ?? ""), name: item.name, quantity, unitPriceCents, lineTotalCents }];
    });
  } catch { return []; }
}
