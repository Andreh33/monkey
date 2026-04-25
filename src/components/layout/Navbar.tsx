"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/reparaciones", label: "Reparaciones" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { items, setOpen: openCart } = useCart();
  const { data: session } = useSession();

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300 ease-snappy",
        scrolled
          ? "bg-bg-primary/85 backdrop-blur-xl border-border py-2"
          : "bg-bg-primary/55 backdrop-blur-md border-transparent py-3"
      )}
    >
      <div className="container-custom flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl sm:text-3xl tracking-wider">
            MONKEY<span className="text-gradient">·MOTION</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-4 py-2 text-[13px] font-semibold uppercase tracking-wider rounded-md transition-colors duration-200",
                pathname === l.href
                  ? "text-white bg-bg-tertiary"
                  : "text-text-secondary hover:text-white hover:bg-bg-tertiary"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCart(true)}
            className="relative p-2.5 rounded-md hover:bg-bg-tertiary transition-colors"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-accent-red text-white">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            href={session ? "/cuenta" : "/login"}
            className="p-2.5 rounded-md hover:bg-bg-tertiary transition-colors hidden sm:inline-flex"
            aria-label="Cuenta"
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2.5 rounded-md hover:bg-bg-tertiary transition-colors"
            aria-label="Menú"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="lg:hidden border-t border-border bg-bg-primary/95 backdrop-blur-xl">
          <div className="container-custom py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-md",
                  pathname === l.href
                    ? "text-white bg-bg-tertiary"
                    : "text-text-secondary hover:text-white hover:bg-bg-tertiary"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={session ? "/cuenta" : "/login"}
              className="px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-md text-text-secondary hover:text-white hover:bg-bg-tertiary"
            >
              {session ? "Mi cuenta" : "Iniciar sesión"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
