import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, MapPin, Package, ShieldCheck } from "lucide-react";

export default async function CuentaInicio() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const [orders, addresses] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.address.count({ where: { userId } }),
  ]);

  const cards = [
    { href: "/cuenta/pedidos", title: "Pedidos", value: orders, icon: Package, desc: "Histórico de compras" },
    { href: "/cuenta/direcciones", title: "Direcciones", value: addresses, icon: MapPin, desc: "Direcciones de envío" },
    { href: "/cuenta/perfil", title: "Perfil", value: "—", icon: User, desc: "Datos personales" },
    { href: "/cuenta/seguridad", title: "Seguridad", value: "—", icon: ShieldCheck, desc: "Contraseña y sesiones" },
  ];

  return (
    <div>
      <h1 className="display-lg mb-2">Hola, {session.user.name?.split(" ")[0] || "amig@"}</h1>
      <p className="text-text-secondary mb-10">Bienvenido a tu panel personal de MonopatinShop.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="card-base p-5 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between">
                <Icon className="w-6 h-6 text-accent-orange" />
                <p className="price-mono text-2xl">{c.value}</p>
              </div>
              <p className="font-display text-2xl tracking-wider mt-3">{c.title}</p>
              <p className="text-xs text-text-muted mt-1">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
