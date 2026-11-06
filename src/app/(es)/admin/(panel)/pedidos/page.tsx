import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderWhatsAppLink } from "@/components/admin/OrderWhatsAppLink";
import { formatOrderMoney, fulfillmentValue, orderReference, orderTotalCents, paidOrderStates, paymentLabel } from "@/lib/order-display";

export const dynamic = "force-dynamic";
export default async function AdminPedidos() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") redirect("/admin/login");
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return <div>
    <h1 className="display-md mb-2">Pedidos</h1>
    <p className="text-text-secondary mb-8">{orders.length} pedidos · El pago se confirma automáticamente; aquí gestionas su preparación.</p>
    <div className="card-base overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-bg-tertiary"><tr className="text-left text-xs uppercase tracking-widest font-mono text-text-muted">
          {["Pedido", "Cliente", "Entrega", "Total", "Pago", "Preparación"].map(label => <th key={label} className="px-4 py-3">{label}</th>)}
        </tr></thead>
        <tbody>{orders.map(order => <tr key={order.id} className="border-t border-border align-top">
          <td className="px-4 py-4"><Link href={`/admin/pedidos/${order.id}`} className="font-mono text-accent-orange hover:underline">{orderReference(order.id)}</Link><p className="text-text-muted text-xs mt-1">{order.createdAt.toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p></td>
          <td className="px-4 py-4"><p className="font-semibold">{[order.firstName, order.lastName].filter(Boolean).join(" ") || "Cliente"}</p><p className="break-all">{order.email}</p>{order.phone && <p className="text-text-secondary">{order.phone}</p>}<div className="mt-2"><OrderWhatsAppLink order={order} /></div></td>
          <td className="px-4 py-4 text-text-secondary"><p>{order.addressLine1 || "Sin dirección registrada"}</p>{order.addressLine2 && <p>{order.addressLine2}</p>}<p>{[order.postalCode, order.city].filter(Boolean).join(" ")}</p><p>{[order.region, order.country].filter(Boolean).join(" · ")}</p></td>
          <td className="px-4 py-4 font-mono whitespace-nowrap">{formatOrderMoney(orderTotalCents(order))}</td>
          <td className="px-4 py-4"><span className={`inline-block rounded px-2 py-1 text-xs ${paidOrderStates.includes(order.status) ? "bg-success/15 text-success" : "bg-bg-tertiary text-text-secondary"}`}>{paymentLabel(order.status)}</span></td>
          <td className="px-4 py-4"><OrderStatusSelect id={order.id} status={fulfillmentValue(order)} paid={paidOrderStates.includes(order.status)} stockIssue={order.stockIssue} /></td>
        </tr>)}{!orders.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-text-muted">Aún no hay pedidos.</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}
