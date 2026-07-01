import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts, BLOG_CATEGORIES, type BlogCategoryKey } from "@/lib/blog";

const SITE_URL = "https://monopatinmonkey.com";

// Refresca el sitemap cada hora para recoger altas/bajas de productos.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tienda`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/reparaciones`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/nosotros`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/condiciones-compra`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Fichas de producto desde Prisma. Envuelto en try/catch por si la BD no está
  // disponible en build (no debe romper la generación del sitemap).
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/tienda/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] no se pudieron cargar los productos:", err);
  }

  // Blog: índice, categorías y posts (desde los ficheros Markdown).
  const posts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...(Object.keys(BLOG_CATEGORIES) as BlogCategoryKey[]).map((c) => ({
      url: `${SITE_URL}/blog/categoria/${c}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updated ? new Date(p.updated) : new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...blogRoutes, ...productRoutes];
}
