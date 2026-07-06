import type { Metadata } from "next";

// Panel de administración: nunca en buscadores (noindex + Disallow en robots.txt).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
