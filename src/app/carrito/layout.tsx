import type { Metadata } from "next";

// Carrito: página utilitaria sin valor de búsqueda, noindex rastreable.
export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
