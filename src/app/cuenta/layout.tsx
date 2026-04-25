import Link from "next/link";
import { User, MapPin, Package, ShieldCheck, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/cuenta", label: "Inicio", icon: LayoutDashboard },
  { href: "/cuenta/perfil", label: "Perfil", icon: User },
  { href: "/cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/cuenta/pedidos", label: "Pedidos", icon: Package },
  { href: "/cuenta/seguridad", label: "Seguridad", icon: ShieldCheck },
];

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-custom py-12 grid lg:grid-cols-[240px_1fr] gap-8">
      <aside className="lg:sticky lg:top-24 self-start">
        <p className="eyebrow mb-3">★ MI CUENTA ★</p>
        <h2 className="font-display text-2xl tracking-wider mb-5">Panel</h2>
        <nav className="flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary hover:bg-bg-tertiary hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </section>
  );
}
