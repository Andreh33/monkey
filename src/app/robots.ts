import type { MetadataRoute } from "next";

const SITE_URL = "https://monopatinmonkey.com";

/**
 * Solo bloqueamos por robots.txt lo que NUNCA debe rastrearse (admin y API).
 *
 * Importante: /login, /registro, /carrito y /cuenta NO van aquí a propósito.
 * Estaban bloqueadas por robots.txt y aun así Google las indexó (sin contenido),
 * porque el bloqueo impide precisamente que Googlebot vea la meta `noindex`.
 * Ahora esas rutas se sirven con `robots: { index:false }` (ver sus layouts) y
 * deben ser rastreables para que Google procese el noindex y las retire del índice.
 */
const DISALLOW = ["/admin", "/api"];

// Crawlers de IA a los que PERMITIMOS explícitamente rastrear el sitio público
// (mejor descubrimiento en ChatGPT, Perplexity, Claude, Apple Intelligence, etc.).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Anthropic-AI",
  "ClaudeBot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
