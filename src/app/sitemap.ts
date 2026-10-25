import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts, BLOG_CATEGORIES, type BlogCategoryKey } from "@/lib/blog";
import { getCategoryTree } from "@/lib/categories";
import { publicProductSlug } from "@/lib/slug-aliases";
import {
  equivalentLanguages,
  localePath,
  productLanguages,
  type Locale,
} from "@/lib/storefront";
import { staticLanguages } from "@/lib/storefront-legal";

const SITE_URL = "https://monopatinmonkey.com";

// Refresca el sitemap cada hora para recoger altas/bajas de productos.
export const revalidate = 3600;

/**
 * lastmod ESTABLE para las páginas estáticas (legales, home, servicios): una
 * fecha fija que solo se sube A MANO cuando el contenido de esas páginas cambia
 * de verdad. Evita la "frescura artificial" de emitir la fecha de build en cada
 * regeneración, que hace que Google deje de fiarse del lastmod y de reprogramar
 * el recrawl. Las páginas dinámicas (productos, catálogo, blog) usan su fecha
 * REAL de cambio (updatedAt del producto, date/updated del post).
 */
const STATIC_LASTMOD = new Date("2026-07-08");
const REGISTRATION_LASTMOD = new Date("2026-07-27");
// Fixed editorial publication date; never replace this with the build clock.
const TRANSLATION_LASTMOD = new Date("2026-10-25");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fichas de producto desde Prisma. Envuelto en try/catch por si la BD no está
  // disponible en build (no debe romper la generación del sitemap).
  let productRoutes: MetadataRoute.Sitemap = [];
  let catalogLastmod = STATIC_LASTMOD;
  const categoryCounts = new Map<string, number>();
  let productCount = 0;
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDesc: true,
        description: true,
        category: true,
        updatedAt: true,
      },
    });
    productCount = products.length;
    for (const p of products)
      categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
    productRoutes = products.flatMap((p) =>
      productLanguages(p).map((locale) => ({
        // Slug público canónico (los slugs heredados que sirven otro producto
        // se emiten ya corregidos; su URL antigua redirige 308).
        url: `${SITE_URL}${localePath(locale, "/tienda/" + publicProductSlug(p.slug))}`,
        alternates: {
          languages: equivalentLanguages(
            "/tienda/" + publicProductSlug(p.slug),
            productLanguages(p),
          ),
        },
        lastModified:
          locale === "es"
            ? (p.updatedAt ?? STATIC_LASTMOD)
            : new Date(
                Math.max(
                  p.updatedAt?.getTime() ?? 0,
                  TRANSLATION_LASTMOD.getTime(),
                ),
              ),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );
    // Frescura REAL del catálogo = fecha del producto modificado más reciente.
    // Se usa en las páginas que listan catálogo (/tienda, homologados, categorías).
    for (const p of products) {
      if (p.updatedAt && p.updatedAt > catalogLastmod)
        catalogLastmod = p.updatedAt;
    }
  } catch (err) {
    console.error("[sitemap] no se pudieron cargar los productos:", err);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: REGISTRATION_LASTMOD,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tienda`,
      lastModified: catalogLastmod,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // Landing de la ola DGT (RD 52/2026): catálogo de homologados + cluster normativa.
    {
      url: `${SITE_URL}/patinetes-electricos-homologados-dgt`,
      lastModified: catalogLastmod,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/reparaciones`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/matriculaciones`,
      lastModified: REGISTRATION_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/nosotros`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/aviso-legal`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: REGISTRATION_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/condiciones-compra`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Páginas de categoría de la tienda (/tienda?cat=X): aterrizajes indexables
  // con canonical autorreferente, title/H1 propios y enlazadas desde el megamenú.
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategoryTree();
    categoryRoutes = categories
      .filter((c) => (categoryCounts.get(c.slug) ?? 0) > 0)
      .map((c) => ({
        url: `${SITE_URL}/tienda?cat=${encodeURIComponent(c.slug)}`,
        lastModified: catalogLastmod,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (err) {
    console.error("[sitemap] no se pudieron cargar las categorías:", err);
  }

  // Blog: índice, categorías y posts (desde los ficheros Markdown).
  const posts = getAllPosts();
  // Frescura REAL del blog = post más reciente (no la fecha de build).
  const blogLastmod = posts.reduce<Date>((acc, p) => {
    const d = new Date(p.updated ?? p.date);
    return d > acc ? d : acc;
  }, STATIC_LASTMOD);
  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: blogLastmod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...(Object.keys(BLOG_CATEGORIES) as BlogCategoryKey[]).map((c) => ({
      url: `${SITE_URL}/blog/categoria/${c}`,
      lastModified: blogLastmod,
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

  const expand = (routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap =>
    routes.flatMap((route) => {
      const path = route.url.replace(SITE_URL, "");
      const eligible: readonly Locale[] =
        path === "/patinetes-electricos-homologados-dgt"
          ? ["es"]
          : staticLanguages(path);
      return eligible.map((locale) => ({
        ...route,
        ...(locale !== "es"
          ? {
              lastModified: new Date(
                Math.max(
                  new Date(route.lastModified ?? 0).getTime(),
                  TRANSLATION_LASTMOD.getTime(),
                ),
              ),
            }
          : {}),
        url: SITE_URL + localePath(locale, path),
        alternates: { languages: equivalentLanguages(path, eligible) },
      }));
    });
  const pagination: MetadataRoute.Sitemap = [];
  for (const [category, count] of [["", productCount], ...categoryCounts] as [
    string,
    number,
  ][]) {
    for (let page = 2; page <= Math.ceil(count / 24); page++) {
      const params = new URLSearchParams();
      if (category) params.set("cat", category);
      params.set("page", String(page));
      pagination.push({
        url: SITE_URL + "/tienda?" + params.toString(),
        lastModified: catalogLastmod,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }
  return [
    ...expand(staticRoutes),
    ...expand(categoryRoutes),
    ...expand(pagination),
    ...blogRoutes,
    ...productRoutes,
  ];
}
