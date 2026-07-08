import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
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
import { siteGraphSchema } from "@/lib/schema";

const SITE_URL = "https://monopatinmonkey.com";

/**
 * Fuentes con next/font (self-hosted, preload y `font-display: swap`).
 * Sustituye al `@import` de Google Fonts en globals.css, que era CSS
 * bloqueante del render (~1,6 s de ahorro estimado en móvil según Lighthouse).
 */
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-bebas" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space-grotesk" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Keyword principal en España: "patinete eléctrico" (los top de la SERP —
  // MediaMarkt, Electyum, SmartGyro, iMoveBlue…— solo usan ese término;
  // "monopatín eléctrico" lo interpreta Google como skate eléctrico/LatAm).
  // "Monopatín" se conserva únicamente como parte de la marca y el dominio.
  title: {
    default: "Patinetes Eléctricos: Venta, Reparación y Envío 24-48h · MonopatinShop Tarragona",
    template: "%s · MonopatinShop Tarragona",
  },
  description:
    "Tienda y taller de patinetes eléctricos en Tarragona con envío 24-48h a toda España. Homologados DGT, todas las marcas, diagnóstico gratis y garantía de 3 años.",
  keywords: [
    "patinete eléctrico",
    "comprar patinete eléctrico",
    "patinetes eléctricos Tarragona",
    "patinete eléctrico homologado DGT",
    "tienda patinetes eléctricos",
    "reparación patinetes eléctricos Tarragona",
    "taller patinetes eléctricos Tarragona",
    "monopatín eléctrico",
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
    title: "Patinetes Eléctricos · Venta y Reparación · MonopatinShop Tarragona",
    description: "Patinetes eléctricos homologados DGT con envío 24-48h a toda España. Taller propio, diagnóstico gratis y garantía 3 años.",
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
    title: "Patinetes Eléctricos · Venta y Reparación · MonopatinShop Tarragona",
    description: "Patinetes eléctricos homologados DGT con envío 24-48h a toda España. Taller propio y garantía 3 años.",
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
    <html
      lang="es"
      className={`dark ${bebas.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Las imágenes de producto (LCP en fichas y tienda) viven en Vercel Blob. */}
        <link rel="preconnect" href="https://19e3cavvu8vlpeyt.public.blob.vercel-storage.com" />
      </head>
      <body>
        {/* Grafo único de entidad (Store/OnlineStore ↔ WebSite por @id). */}
        <JsonLd data={siteGraphSchema()} />
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
