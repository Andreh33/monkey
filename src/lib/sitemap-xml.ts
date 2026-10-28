import type { MetadataRoute } from "next";

function escapeXml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char]!);
}

// Next 14's metadata serializer inserts URLs without XML escaping. Keep URLs
// raw in the route data and escape only at the final XML boundary.
export function serializeSitemap(routes: MetadataRoute.Sitemap): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    routes.map((route) => {
      const fields = [`<loc>${escapeXml(route.url)}</loc>`];
      for (const [lang, href] of Object.entries(route.alternates?.languages ?? {})) {
        if (href) fields.push(`<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`);
      }
      if (route.lastModified) fields.push(`<lastmod>${escapeXml(route.lastModified instanceof Date ? route.lastModified.toISOString() : route.lastModified)}</lastmod>`);
      if (route.changeFrequency) fields.push(`<changefreq>${escapeXml(route.changeFrequency)}</changefreq>`);
      if (route.priority !== undefined) fields.push(`<priority>${route.priority}</priority>`);
      return `<url>\n${fields.join("\n")}\n</url>`;
    }).join("\n") + '\n</urlset>\n';
}
