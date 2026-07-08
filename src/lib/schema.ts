/**
 * Constructores de JSON-LD (schema.org) para SEO y motores de IA.
 * Datos reales tomados de `src/config/empresa.ts` (fuente única de verdad) y de
 * las coordenadas usadas en el mapa de contacto (src/components/shared/Map.tsx).
 * No se inventa ningún dato.
 */
import { EMPRESA } from "@/config/empresa";
import { getYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";
import { publicProductSlug } from "@/lib/slug-aliases";

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

/** Nodo Store/OnlineStore (sin @context; se emite dentro del @graph). */
function storeNode() {
  return {
    // Tienda física en Tarragona + e-commerce con envío a toda España.
    "@type": ["Store", "OnlineStore"],
    "@id": `${SITE_URL}/#store`,
    name: EMPRESA.marca,
    legalName: EMPRESA.razonSocial,
    // Variantes reales de la marca (dominio, razón social y redes) unificadas
    // en una sola entidad para Google: MonopatinShop = Monopatín Monkey = Monkey Motion.
    alternateName: ["Monopatín Monkey", "Monkey Motion", "MonkeyMotion"],
    description:
      "Tienda y taller de venta y reparación de patinetes eléctricos en Tarragona. Envío 24-48h a toda España, todas las marcas, diagnóstico gratis y garantía.",
    url: SITE_URL,
    telephone: `+34 ${EMPRESA.telefonos[0]}`,
    email: EMPRESA.email,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    foundingDate: "2017",
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
    // Taller local en Tarragona; la tienda online envía a toda España.
    areaServed: [
      { "@type": "City", name: "Tarragona" },
      { "@type": "Country", name: "España" },
    ],
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

/** Nodo WebSite (sin @context; se emite dentro del @graph). */
function webSiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: EMPRESA.marca,
    alternateName: ["Monopatín Monkey", "Monkey Motion"],
    url: SITE_URL,
    inLanguage: "es-ES",
    publisher: { "@id": `${SITE_URL}/#store` },
  };
}

/**
 * Grafo único de entidad del sitio: Store/OnlineStore ↔ WebSite enlazados por
 * @id en un solo bloque @graph. Los Product (seller) y BlogPosting (publisher)
 * de cada página referencian `#store`, de modo que Google y los motores de IA
 * resuelven UNA sola entidad (MonopatinShop = Monopatín Monkey = MonkeyMotion).
 */
export function siteGraphSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [storeNode(), webSiteNode()],
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
  shippingCost?: number | null;
  subcategory?: string | null;
  motorPower?: number | null;
  range?: number | null;
  maxSpeed?: number | null;
  battery?: string | null;
  weight?: number | null;
  maxLoad?: number | null;
  youtubeUrl?: string | null;
  images: { url: string; alt?: string | null }[];
};

/** Detecta URLs de vídeo coladas en la galería (datos antiguos) para no
 *  emitirlas como `image` en el JSON-LD (Google las marca como inválidas). */
function isVideoUrl(url: string): boolean {
  return /youtu\.be|youtube\.com|vimeo\.com|\.(mp4|webm|mov)(\?|$)/i.test(url);
}

/**
 * ¿El producto está homologado DGT (certificado VMP) según SUS PROPIOS datos?
 * Solo se afirma cuando el nombre, SKU, subcategoría o descripción del
 * producto lo declaran (p. ej. "Homologado DGT", "Certificado", "VMP").
 * No se inventa: si la ficha no lo dice, no se marca.
 */
export function isDgtCertified(p: {
  name: string;
  sku?: string | null;
  subcategory?: string | null;
  description?: string | null;
}): boolean {
  const hay = [p.name, p.sku, p.subcategory, p.description].filter(Boolean).join(" ");
  if (/\b(?:no|sin)\s+(?:est[aá]\s+)?homologa/i.test(hay)) return false;
  return /homologad|certificad|\bDGT\b|\bVMP\b/i.test(hay);
}

/** URL del vídeo del producto: campo dedicado o URL de vídeo colada en la galería. */
function productVideoUrl(p: ProductForSchema): string | null {
  return p.youtubeUrl || p.images.map((i) => i.url).find(isVideoUrl) || null;
}

/**
 * VideoObject de la review del producto (antes esas URLs de YouTube iban
 * coladas en `image[]`, donde invalidaban las imágenes). Emitirlo aparte da
 * opción al rich result de vídeo y es señal para AI Mode/Shopping.
 * `uploadDate` se omite a propósito: no consta la fecha real de subida.
 */
export function productVideoSchema(product: ProductForSchema): object | null {
  const raw = productVideoUrl(product);
  const videoId = raw ? getYoutubeId(raw) : null;
  if (!videoId) return null;
  const url = `${SITE_URL}/tienda/${publicProductSlug(product.slug)}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: `${product.name} · review en vídeo`,
    description: product.shortDesc || product.description,
    thumbnailUrl: [getYoutubeThumbnail(videoId)],
    contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    publisher: { "@id": `${SITE_URL}/#store` },
  };
}

/**
 * Specs máquina-legibles para Shopping/IA. Solo datos reales de la ficha;
 * "Homologado DGT" únicamente cuando el propio producto lo declara.
 */
function productProperties(p: ProductForSchema) {
  const props: { "@type": "PropertyValue"; name: string; value: string | number; unitText?: string }[] = [];
  if (isDgtCertified(p)) {
    props.push({ "@type": "PropertyValue", name: "Homologado DGT (certificado VMP)", value: "Sí" });
  }
  if (p.motorPower) props.push({ "@type": "PropertyValue", name: "Potencia del motor", value: p.motorPower, unitText: "W" });
  if (p.range) props.push({ "@type": "PropertyValue", name: "Autonomía", value: p.range, unitText: "km" });
  if (p.maxSpeed) props.push({ "@type": "PropertyValue", name: "Velocidad máxima", value: p.maxSpeed, unitText: "km/h" });
  if (p.battery) props.push({ "@type": "PropertyValue", name: "Batería", value: p.battery });
  if (p.weight) props.push({ "@type": "PropertyValue", name: "Peso", value: p.weight, unitText: "kg" });
  if (p.maxLoad) props.push({ "@type": "PropertyValue", name: "Carga máxima", value: p.maxLoad, unitText: "kg" });
  return props;
}

/**
 * Ficha Product con precio y disponibilidad reales del producto.
 * Incluye envío (coste real + plazo 24-48h anunciado en la web) y la política
 * de devoluciones de /condiciones-compra (14 días naturales, coste de
 * devolución a cargo del cliente): son los dos campos que Google exige para
 * los resultados enriquecidos completos de "listado de comerciante".
 */
export function productSchema(product: ProductForSchema) {
  const url = `${SITE_URL}/tienda/${publicProductSlug(product.slug)}`;
  const currency = product.currency || "EUR";
  const images = product.images
    .map((img) => img.url)
    .filter((u) => u && !isVideoUrl(u))
    .map(absoluteUrl);
  const additionalProperty = productProperties(product);
  const hasVideo = Boolean(productVideoUrl(product) && getYoutubeId(productVideoUrl(product)!));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.shortDesc || product.description,
    ...(images.length ? { image: images } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    // GTIN: no consta en los datos actuales (el sku es el nombre del producto),
    // por eso no se emite. Cuando el admin cargue GTIN reales, añadirlos aquí.
    ...(additionalProperty.length ? { additionalProperty } : {}),
    // Vínculo con la review en vídeo (VideoObject aparte en la misma página).
    ...(hasVideo ? { subjectOf: { "@id": `${url}#video` } } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: currency,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#store` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.shippingCost ?? 0,
          currency,
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "ES" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "ES",
        // Obligatorio para Merchant listings desde 2026: país al que se devuelve.
        returnPolicyCountry: "ES",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
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

type BlogPostForSchema = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author?: string;
  keywords?: string[];
  category: string;
};

/** Ficha BlogPosting/Article para los posts del blog. */
export function blogPostingSchema(post: BlogPostForSchema) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    inLanguage: "es-ES",
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { "@type": "Organization", name: post.author || EMPRESA.marca, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#store` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE_URL}/og-image.jpg`,
    articleSection: post.category,
    ...(post.keywords?.length ? { keywords: post.keywords.join(", ") } : {}),
    url,
  };
}

/** FAQPage a partir de las preguntas del post (resultados enriquecidos). */
export function faqPageSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Identidad del propio blog (colección de artículos). */
export function blogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: `Blog · ${EMPRESA.marca}`,
    description:
      "Guías, normativa DGT, reparación y mantenimiento de patinetes eléctricos por el taller de MonopatinShop en Tarragona.",
    url: `${SITE_URL}/blog`,
    inLanguage: "es-ES",
    publisher: { "@id": `${SITE_URL}/#store` },
  };
}
