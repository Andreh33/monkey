import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Wrench, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [productCount, orderCount, repairsPending, recentRepairs, recentOrders, monthIncome] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.repairRequest.count({ where: { status: "NEW" } }),
      prisma.repairRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.aggregate({
        where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { total: true },
      }),
    ]);

  const cards = [
    { label: "Productos", value: productCount, icon: Package, color: "text-accent-orange" },
    { label: "Pedidos", value: orderCount, icon: ShoppingCart, color: "text-accent-orange" },
    { label: "Reparaciones nuevas", value: repairsPending, icon: Wrench, color: "text-accent-red" },
    { label: "Ingresos mes", value: `${formatPrice(monthIncome._sum.total ?? 0)}€`, icon: TrendingUp, color: "text-success" },
  ];

  const statusColor: Record<string, string> = {
    NEW: "bg-accent-red/15 text-accent-red border-accent-red/40",
    CONTACTED: "bg-warning/15 text-warning border-warning/40",
    IN_PROGRESS: "bg-accent-orange/15 text-accent-orange border-accent-orange/40",
    DONE: "bg-success/15 text-success border-success/40",
    CANCELLED: "bg-text-muted/15 text-text-muted border-text-muted/40",
  };

  return (
    <div>
      <h1 className="display-md mb-2">Dashboard</h1>
      <p className="text-text-secondary mb-8">Resumen de actividad del taller</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card-base p-5">
              <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${c.color}`} />
              </div>
              <p className="price-mono text-3xl mt-3">{c.value}</p>
              <p className="text-xs uppercase tracking-widest text-text-muted font-mono mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl tracking-wider">Últimas reparaciones</h2>
            <Link href="/admin/reparaciones" className="text-xs text-accent-orange hover:underline uppercase tracking-wider">Ver todas</Link>
          </div>
          {recentRepairs.length === 0 ? (
            <p className="text-text-muted text-sm">Sin solicitudes aún</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentRepairs.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.name} · {r.scooterBrand}</p>
                    <p className="text-xs text-text-muted truncate">{r.problem}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded-full font-mono border ${statusColor[r.status] ?? statusColor.NEW}`}>
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl tracking-wider">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-xs text-accent-orange hover:underline uppercase tracking-wider">Ver todos</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-text-muted text-sm">Sin pedidos aún</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm">#{o.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-text-muted">{o.email}</p>
                  </div>
                  <p className="price-mono">{formatPrice(o.total)}€</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
