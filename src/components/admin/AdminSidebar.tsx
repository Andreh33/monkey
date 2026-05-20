"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Wrench,
  // ShoppingCart, // Pedidos desactivado
  FolderTree,
  Users,
  ExternalLink,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  // { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart }, // Pedidos desactivado
  { href: "/admin/reparaciones", label: "Reparaciones", icon: Wrench },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-bg-secondary border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="font-display text-xl tracking-wider">
          MONKEY<span className="text-gradient">·ADMIN</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-bg-tertiary text-white"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary hover:bg-bg-tertiary hover:text-white">
          <ExternalLink className="w-4 h-4" /> Ver web
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary hover:bg-bg-tertiary hover:text-white">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>
    </aside>
  );
}
