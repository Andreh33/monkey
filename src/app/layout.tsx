import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CartDrawer } from "@/components/shop/CartDrawer";
import MonkeyWalkerLoader from "@/components/layout/MonkeyWalkerLoader";

export const metadata: Metadata = {
  title: {
    default: "MonopatinShop · Venta y Reparación de Patinetes Eléctricos · Tarragona",
    template: "%s · MonopatinShop Tarragona",
  },
  description:
    "Tienda especializada en venta y reparación de patinetes eléctricos en Tarragona. Todas las marcas. Diagnóstico gratuito. Garantía 2 años.",
  keywords: ["patinetes eléctricos", "Tarragona", "reparación", "Xiaomi", "Segway", "Dualtron"],
  openGraph: {
    title: "MonopatinShop · Patinetes Eléctricos Tarragona",
    description: "Venta y reparación de patinetes eléctricos en Tarragona.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <Providers>
          <MonkeyWalkerLoader />
          <TopBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
