import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
// import { CartDrawer } from "@/components/shop/CartDrawer"; // Carrito desactivado: compras directas via Stripe
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://monopatinmonkey.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MonopatinShop · Venta y Reparación de Patinetes Eléctricos · Tarragona",
    template: "%s · MonopatinShop Tarragona",
  },
  description:
    "Tienda especializada en venta y reparación de patinetes eléctricos en Tarragona. Todas las marcas. Diagnóstico gratis si reparas con nosotros. Garantía 2 años.",
  keywords: ["patinetes eléctricos", "Tarragona", "reparación", "Xiaomi", "Segway", "Dualtron"],
  openGraph: {
    title: "MonopatinShop · Patinetes Eléctricos Tarragona",
    description: "Venta y reparación de patinetes eléctricos en Tarragona. Todas las marcas, diagnóstico gratis y garantía 2 años.",
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "MonopatinShop",
    images: [
      {
        url: "/og-image.jpg",
        width: 1417,
        height: 2047,
        alt: "MonopatinShop · Tarragona",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MonopatinShop · Patinetes Eléctricos Tarragona",
    description: "Venta y reparación de patinetes eléctricos en Tarragona.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <Providers>
          <TopBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
          {/* <CartDrawer /> Carrito desactivado: compras directas via Stripe */}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
