import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderWhatsAppLink } from "@/components/admin/OrderWhatsAppLink";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { fulfillmentValue, orderReference, paidOrderStates, paymentLabel } from "@/lib/order-display";

export const dynamic = "force-dynamic";
export default async function AdminPedido({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") redirect("/admin/login");
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) notFound();
  return <div className="space-y-6">
    <Link href="/admin/pedidos" className="text-sm text-accent-orange hover:underline">← Todos los pedidos</Link>
    <div><h1 className="display-md mb-2">Pedido {orderReference(order.id)}</h1><p className="text-sm text-text-muted">{order.createdAt.toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p><p className="font-mono text-xs text-text-muted mt-1 break-all">{order.id}</p></div>
    <section className="card-base p-5 flex flex-wrap justify-between gap-5 items-center">
      <div><p>Pago: <strong>{paymentLabel(order.status)}</strong></p>{order.paidAt && <p className="text-xs text-text-muted mt-1">Confirmado {order.paidAt.toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>}</div>
      <OrderStatusSelect id={order.id} status={fulfillmentValue(order)} paid={paidOrderStates.includes(order.status)} stockIssue={order.stockIssue} />
    </section>
    <OrderDetails order={order} />
    <OrderWhatsAppLink order={order} />
    {order.stripePaymentIntentId && <p className="text-xs font-mono text-text-muted break-all">Referencia del pago: {order.stripePaymentIntentId}</p>}
  </div>;
}
