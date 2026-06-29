import type { MetadataRoute } from "next";

const SITE_URL = "https://monopatinmonkey.com";

// Áreas privadas / no indexables.
const DISALLOW = ["/admin", "/api", "/carrito", "/cuenta", "/login", "/registro"];

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
