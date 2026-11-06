import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { fulfillmentLabels, fulfillmentValue, orderReference, paymentLabel } from "@/lib/order-display";

export const dynamic = "force-dynamic";
export default async function CustomerOrder({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;
  if (!userId) redirect("/login");
  const order = await prisma.order.findFirst({ where: { id: params.id, userId } });
  if (!order) notFound();
  return <div className="space-y-6">
    <Link href="/cuenta/pedidos" className="text-sm text-accent-orange hover:underline">← Mis pedidos</Link>
    <div><h1 className="display-md mb-2">Pedido {orderReference(order.id)}</h1><p className="text-sm text-text-muted">{order.createdAt.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" })}</p></div>
    <p className="text-text-secondary">{paymentLabel(order.status)} · {fulfillmentLabels[fulfillmentValue(order)]}</p>
    <OrderDetails order={order} />
  </div>;
}
