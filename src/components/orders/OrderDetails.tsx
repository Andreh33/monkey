import type { Order } from "@prisma/client";
import { formatOrderMoney, orderItems, orderTotalCents } from "@/lib/order-display";

export function OrderDetails({ order }: { order: Order }) {
  const items = orderItems(order.items);
  return <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-4">
      <section className="card-base p-5">
        <h2 className="font-display text-2xl mb-3">Datos de contacto</h2>
        <p className="font-semibold">{[order.firstName, order.lastName].filter(Boolean).join(" ") || "Sin nombre registrado"}</p>
        <p className="break-all">{order.email}</p><p>{order.phone || "Sin teléfono registrado"}</p>
      </section>
      <section className="card-base p-5">
        <h2 className="font-display text-2xl mb-3">Dirección de entrega</h2>
        <address className="not-italic text-text-secondary">
          <p>{order.addressLine1 || "Sin dirección registrada"}</p>
          {order.addressLine2 && <p>{order.addressLine2}</p>}
          <p>{[order.postalCode, order.city].filter(Boolean).join(" ")}</p>
          <p>{[order.region, order.country].filter(Boolean).join(" · ")}</p>
        </address>
      </section>
    </div>
    <section className="card-base overflow-hidden">
      <div className="p-5 border-b border-border"><h2 className="font-display text-2xl">Productos del pedido</h2><p className="text-xs text-text-muted mt-1">Importes guardados al hacer el pedido.</p></div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-bg-tertiary"><tr><th className="text-left p-4">Producto</th><th className="text-right p-4">Precio</th><th className="text-center p-4">Cantidad</th><th className="text-right p-4">Importe</th></tr></thead>
        <tbody>{items.map((item, index) => <tr key={`${item.productId}-${index}`} className="border-t border-border"><td className="p-4">{item.name}</td><td className="p-4 text-right font-mono">{formatOrderMoney(item.unitPriceCents)}</td><td className="p-4 text-center font-mono">{item.quantity}</td><td className="p-4 text-right font-mono">{formatOrderMoney(item.lineTotalCents)}</td></tr>)}
          {!items.length && <tr><td colSpan={4} className="p-5 text-text-muted">El pedido histórico no tiene un desglose disponible.</td></tr>}
        </tbody>
      </table></div>
      <dl className="border-t border-border p-5 ml-auto max-w-sm space-y-2">
        {order.subtotalCents !== null && <div className="flex justify-between gap-4"><dt>Productos</dt><dd className="font-mono">{formatOrderMoney(order.subtotalCents)}</dd></div>}
        {order.shippingCents !== null && <div className="flex justify-between gap-4"><dt>Envío</dt><dd className="font-mono">{formatOrderMoney(order.shippingCents)}</dd></div>}
        <div className="flex justify-between gap-4 font-semibold text-lg"><dt>Total</dt><dd className="font-mono">{formatOrderMoney(orderTotalCents(order))}</dd></div>
        <p className="text-xs text-text-muted">IVA incluido.</p>
      </dl>
    </section>
  </div>;
}
