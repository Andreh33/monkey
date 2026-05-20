"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User, Menu, X, ChevronDown } from "lucide-react";
// Carrito desactivado: compras directas via Stripe
// import { ShoppingCart } from "lucide-react";
// import { useCart } from "@/lib/cart-store";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/lib/categories";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/reparaciones", label: "Reparaciones" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar({ categories = [] }: { categories?: CategoryNode[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const pathname = usePathname();
  // Carrito desactivado
  // const { items, setOpen: openCart } = useCart();
  // const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const { data: session } = useSession();
  const hasMenu = categories.length > 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileShopOpen(false);
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
            MONOPATIN<span className="text-gradient">·SHOP</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            if (l.href === "/tienda" && hasMenu) {
              return <MegaMenu key={l.href} active={pathname.startsWith("/tienda")} categories={categories} />;
            }
            return (
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
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Carrito desactivado: compras directas via Stripe
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
          */}

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
            {links.map((l) => {
              if (l.href === "/tienda" && hasMenu) {
                return (
                  <MobileShop
                    key={l.href}
                    categories={categories}
                    active={pathname.startsWith("/tienda")}
                    open={mobileShopOpen}
                    onToggle={() => setMobileShopOpen((v) => !v)}
                  />
                );
              }
              return (
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
              );
            })}
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

/** Megamenú de escritorio: panel desplegable bajo "Tienda" al pasar el ratón / enfocar. */
function MegaMenu({ active, categories }: { active: boolean; categories: CategoryNode[] }) {
  return (
    <div className="relative group">
      <Link
        href="/tienda"
        className={cn(
          "flex items-center gap-1 px-4 py-2 text-[13px] font-semibold uppercase tracking-wider rounded-md transition-colors duration-200",
          active
            ? "text-white bg-bg-tertiary"
            : "text-text-secondary group-hover:text-white group-hover:bg-bg-tertiary"
        )}
      >
        Tienda
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
      </Link>

      {/* El pt-3 crea un puente invisible para que el hover no se corte. */}
      <div className="absolute left-0 top-full pt-3 z-50 hidden group-hover:block group-focus-within:block">
        <div className="w-[min(92vw,640px)] rounded-xl border border-border bg-[rgba(40,40,47,0.6)] backdrop-blur-xl shadow-2xl p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            {categories.map((c) => (
              <div key={c.id} className="min-w-0">
                <Link
                  href={`/tienda?cat=${c.slug}`}
                  className="block text-sm font-semibold text-white hover:text-accent-red transition-colors truncate"
                >
                  {c.name}
                </Link>
                {c.subcategories.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {c.subcategories.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/tienda?cat=${c.slug}&sub=${s.slug}`}
                          className="block text-[13px] text-text-secondary hover:text-white transition-colors truncate"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <Link
              href="/tienda"
              className="text-xs uppercase tracking-wider font-semibold text-accent-red hover:underline"
            >
              Ver toda la tienda →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Versión móvil: acordeón que despliega categorías y subcategorías. */
function MobileShop({
  categories,
  active,
  open,
  onToggle,
}: {
  categories: CategoryNode[];
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-md",
          active ? "text-white bg-bg-tertiary" : "text-text-secondary hover:text-white hover:bg-bg-tertiary"
        )}
      >
        <span>Tienda</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-1 mb-2 pl-3 space-y-3">
          <Link
            href="/tienda"
            className="block px-2 py-1.5 text-xs uppercase tracking-wider font-semibold text-accent-red"
          >
            Ver toda la tienda
          </Link>
          {categories.map((c) => (
            <div key={c.id}>
              <Link href={`/tienda?cat=${c.slug}`} className="block px-2 py-1.5 text-sm font-semibold text-white">
                {c.name}
              </Link>
              {c.subcategories.length > 0 && (
                <ul className="pl-3 mt-1 space-y-0.5 border-l border-border">
                  {c.subcategories.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/tienda?cat=${c.slug}&sub=${s.slug}`}
                        className="block px-2 py-1 text-[13px] text-text-secondary hover:text-white"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
