import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { InstallPrompt } from "@/components/shared/InstallPrompt";
import { BannerAniversario } from "@/components/aniversario/BannerAniversario";
import { OverlayAniversario } from "@/components/aniversario/OverlayAniversario";
// import { CartDrawer } from "@/components/shop/CartDrawer"; // Carrito desactivado: compras directas via Stripe
import { Analytics } from "@vercel/analytics/next";
import { ClickTracker } from "@/components/shared/ClickTracker";
import { getCategoryTree } from "@/lib/categories";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema, webSiteSchema } from "@/lib/schema";

const SITE_URL = "https://monopatinmonkey.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MonopatinShop · Venta y Reparación de Patinetes Eléctricos · Tarragona",
    template: "%s · MonopatinShop Tarragona",
  },
  description:
    "Tienda especializada en venta y reparación de patinetes eléctricos en Tarragona. Todas las marcas. Diagnóstico gratis si reparas con nosotros. Garantía 3 años.",
  keywords: [
    "patinetes eléctricos Tarragona",
    "reparación patinetes Tarragona",
    "taller patinetes eléctricos Tarragona",
    "comprar patinete eléctrico Tarragona",
    "monopatín eléctrico Tarragona",
    "Xiaomi",
    "Segway",
    "Dualtron",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "MonopatinShop · Patinetes Eléctricos Tarragona",
    description: "Venta y reparación de patinetes eléctricos en Tarragona. Todas las marcas, diagnóstico gratis y garantía 3 años.",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MonopatinShop",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0C",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoryTree();
  return (
    <html lang="es" className="dark">
      <body>
        <JsonLd data={[localBusinessSchema(), webSiteSchema()]} />
        <Providers>
          <BannerAniversario />
          <TopBar />
          <Navbar categories={categories} />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
          <InstallPrompt />
          <OverlayAniversario />
          {/* <CartDrawer /> Carrito desactivado: compras directas via Stripe */}
        </Providers>
        <ClickTracker />
        <Analytics />
      </body>
    </html>
  );
}
