import type { Metadata } from "next";
import {
  Bebas_Neue,
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "../../globals.css";
import { Providers } from "@/components/providers";
import { StoreHeader, StoreFooter } from "@/components/storefront/StoreShell";
import { isLocale, SITE } from "@/lib/storefront-routes";
import { copy } from "@/lib/storefront-copy";
import { Analytics } from "@vercel/analytics/next";
import { LocaleProvider } from "@/components/storefront/NotFound";
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
});
const space = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});
export const revalidate = 300;
export function generateStaticParams() {
  return ["fr", "it", "pt"].map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "es";
  return {
    metadataBase: new URL(SITE),
    title: {
      default: `${copy[locale].shop} · Monopatín Monkey`,
      template: "%s · Monkey",
    },
    description: copy[locale].intro,
  };
}
export default function InternationalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // A root layout must always supply one complete document, including for an
  // unsupported locale. The page's notFound() is caught inside this shell.
  const locale = isLocale(params.locale) ? params.locale : "es";
  return (
    <html
      lang={locale}
      className={`dark ${bebas.variable} ${space.variable} ${inter.variable} ${mono.variable}`}
    >
      <body>
        <Providers>
          <LocaleProvider locale={locale}>
            <StoreHeader locale={locale} />
            <main className="min-h-screen">{children}</main>
            <StoreFooter locale={locale} />
          </LocaleProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
