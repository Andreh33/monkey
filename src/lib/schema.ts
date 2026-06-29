/**
 * Constructores de JSON-LD (schema.org) para SEO y motores de IA.
 * Datos reales tomados de `src/config/empresa.ts` (fuente única de verdad) y de
 * las coordenadas usadas en el mapa de contacto (src/components/shared/Map.tsx).
 * No se inventa ningún dato.
 */
import { EMPRESA } from "@/config/empresa";

export const SITE_URL = EMPRESA.url; // https://monopatinmonkey.com

// Coordenadas reales del local (las mismas del marcador del mapa de contacto).
const GEO = { lat: 41.1175, lng: 1.253 };

// Perfiles sociales reales enlazados en el footer / contacto.
const SAME_AS = [
  "https://www.tiktok.com/@monopatinshop",
  "https://instagram.com/monkeymotion_oficial",
];

/** Convierte una URL de imagen a absoluta contra el dominio del sitio. */
export function absoluteUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Ficha LocalBusiness/Store con NAP real de Tarragona. */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#store`,
    name: EMPRESA.marca,
    legalName: EMPRESA.razonSocial,
    alternateName: "Monopatín Monkey",
    description:
      "Tienda y taller de venta y reparación de patinetes eléctricos en Tarragona. Todas las marcas, diagnóstico gratis y garantía.",
    url: SITE_URL,
    telephone: `+34 ${EMPRESA.telefonos[0]}`,
    email: EMPRESA.email,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Efectivo, Tarjeta",
    vatID: EMPRESA.cif,
    address: {
      "@type": "PostalAddress",
      streetAddress: EMPRESA.direccion,
      addressLocality: EMPRESA.ciudad,
      addressRegion: EMPRESA.provincia,
      postalCode: EMPRESA.cp,
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.lat,
      longitude: GEO.lng,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${GEO.lat},${GEO.lng}`,
    areaServed: { "@type": "City", name: "Tarragona" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "11:00",
        closes: "15:00",
      },
    ],
    sameAs: SAME_AS,
  };
}

/** Identidad del sitio web. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: EMPRESA.marca,
    url: SITE_URL,
    inLanguage: "es-ES",
    publisher: { "@id": `${SITE_URL}/#store` },
  };
}

type ProductForSchema = {
  slug: string;
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  currency?: string | null;
  sku?: string | null;
  brand?: string | null;
  stock: number;
  images: { url: string; alt?: string | null }[];
};

/** Ficha Product con precio y disponibilidad reales del producto. */
export function productSchema(product: ProductForSchema) {
  const url = `${SITE_URL}/tienda/${product.slug}`;
  const images = product.images.map((img) => absoluteUrl(img.url));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc || product.description,
    ...(images.length ? { image: images } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: product.currency || "EUR",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };
}

/** Migas de pan. `items` ya con URLs absolutas o rutas relativas. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
