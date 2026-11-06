import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import Link from "next/link";
import { formatOrderMoney, fulfillmentLabels, fulfillmentValue, orderReference, orderTotalCents, paymentLabel } from "@/lib/order-display";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="display-md mb-2">Pedidos</h1>
      <p className="text-text-secondary mb-8">Histórico de tus compras</p>

      {orders.length === 0 ? (
        <div className="card-base p-12 text-center">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Aún no tienes pedidos</p>
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-tertiary">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs uppercase tracking-widest font-mono text-text-muted">ID</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest font-mono text-text-muted">Fecha</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest font-mono text-text-muted">Estado</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest font-mono text-text-muted text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono"><Link className="text-accent-orange hover:underline" href={`/cuenta/pedidos/${o.id}`}>{orderReference(o.id)}</Link></td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(o.createdAt).toLocaleDateString("es-ES")}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-bg-tertiary text-text-secondary font-mono">{paymentLabel(o.status)}</span><p className="text-xs text-text-muted mt-2">{fulfillmentLabels[fulfillmentValue(o)]}</p></td>
                  <td className="px-4 py-3 font-mono text-right">{formatOrderMoney(orderTotalCents(o))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
