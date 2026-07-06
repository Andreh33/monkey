import type { Metadata } from "next";

// Página utilitaria sin valor de búsqueda: noindex rastreable.
// (Estaba indexada en Google por estar bloqueada en robots.txt sin noindex;
// ahora Googlebot puede rastrearla, ver el noindex y retirarla del índice.)
export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
