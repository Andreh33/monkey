import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminPedidos() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="display-md mb-2">Pedidos</h1>
      <p className="text-text-secondary mb-8">{orders.length} pedidos</p>

      <div className="card-base overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-tertiary">
            <tr className="text-left text-xs uppercase tracking-widest font-mono text-text-muted">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-sm">#{o.id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3 text-sm">{o.email}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{new Date(o.createdAt).toLocaleDateString("es-ES")}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPrice(o.total)}€</td>
                <td className="px-4 py-3 text-center"><OrderStatusSelect id={o.id} status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted">Aún no hay pedidos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
