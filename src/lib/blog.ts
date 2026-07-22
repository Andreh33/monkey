/**
 * Motor del blog (contenido en Markdown dentro de `content/blog`).
 *
 * Cada post es un fichero `.md`/`.mdx` con frontmatter (ver BlogFrontmatter).
 * El cuerpo es Markdown estándar que se renderiza con react-markdown.
 * Los elementos ricos (FAQ, productos relacionados) viven en el frontmatter
 * para que el render sea robusto y controlado por nuestras plantillas.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/shop/ProductCard";

export type BlogCategoryKey = "normativa" | "guias" | "reparacion" | "mantenimiento";

export const BLOG_CATEGORIES: Record<
  BlogCategoryKey,
  { label: string; title: string; description: string; order: number }
> = {
  normativa: {
    label: "Normativa",
    title: "Normativa y legal",
    description:
      "Todo sobre la normativa DGT de patinetes eléctricos en 2026: matrícula, seguro obligatorio, casco y multas. Guías claras y actualizadas.",
    order: 1,
  },
  guias: {
    label: "Guías de compra",
    title: "Guías de compra",
    description:
      "Guías para acertar con tu patinete eléctrico: modelos homologados DGT, relación calidad-precio y recomendaciones según tu uso.",
    order: 2,
  },
  reparacion: {
    label: "Reparación",
    title: "Reparación y averías",
    description:
      "Las averías más frecuentes de los patinetes eléctricos y cómo solucionarlas. Diagnóstico y reparación en nuestro taller de Tarragona.",
    order: 3,
  },
  mantenimiento: {
    label: "Mantenimiento",
    title: "Mantenimiento y batería",
    description:
      "Consejos de mantenimiento y cuidado de la batería para que tu patinete eléctrico dure más años y rinda como el primer día.",
    order: 4,
  },
};

export type BlogFaq = { q: string; a: string };

export type BlogFrontmatter = {
  title: string;
  seoTitle?: string;
  description: string;
  excerpt?: string;
  category: BlogCategoryKey;
  date: string; // ISO (YYYY-MM-DD)
  updated?: string;
  author?: string;
  keywords?: string[];
  featured?: boolean;
  relatedProducts?: string[];
  faqs?: BlogFaq[];
};

export type BlogHeading = { id: string; text: string; level: number };

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingTime: number;
  categoryLabel: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
  headings: BlogHeading[];
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function listFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function readingTimeFor(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Extrae encabezados H2/H3 para el índice (mismos ids que rehype-slug). */
function extractHeadings(markdown: string): BlogHeading[] {
  const slugger = new GithubSlugger();
  const headings: BlogHeading[] = [];
  let inCode = false;
  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    if (/^\s*```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/[*_`~]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
    headings.push({ id: slugger.slug(text), text, level });
  }
  return headings;
}

function toMeta(slug: string, fm: BlogFrontmatter, content: string): BlogPostMeta {
  const category = (BLOG_CATEGORIES[fm.category] ? fm.category : "guias") as BlogCategoryKey;
  return {
    ...fm,
    category,
    slug,
    readingTime: readingTimeFor(content),
    categoryLabel: BLOG_CATEGORIES[category].label,
  };
}

export function getAllPostSlugs(): string[] {
  return listFiles().map((f) => f.replace(/\.mdx?$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = listFiles().find((f) => f.replace(/\.mdx?$/, "") === slug);
  if (!file) return null;
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  if (!fm?.title) return null;
  return {
    ...toMeta(slug, fm, content),
    content,
    headings: extractHeadings(content),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return listFiles()
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      const fm = data as BlogFrontmatter;
      if (!fm?.title) return null;
      return toMeta(slug, fm, content);
    })
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPostsByCategory(category: BlogCategoryKey): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getFeaturedPosts(limit = 3): BlogPostMeta[] {
  const all = getAllPosts();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Posts relacionados: misma categoría primero, se completa con los más recientes. */
export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return all.slice(0, limit);
  const sameCat = all.filter((p) => p.slug !== slug && p.category === current.category);
  const rest = all.filter((p) => p.slug !== slug && p.category !== current.category);
  return [...sameCat, ...rest].slice(0, limit);
}

export function formatBlogDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Productos reales (por slug) para las tarjetas de "productos relacionados".
 * Read-only sobre Prisma; si la BD no está disponible en build, devuelve [].
 */
export async function getBlogRelatedProducts(slugs?: string[]): Promise<ProductCardData[]> {
  if (!slugs || slugs.length === 0) return [];
  try {
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs }, active: true },
      include: { images: { orderBy: { order: "asc" }, take: 2 } },
    });
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return slugs
      .map((s) => bySlug.get(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        price: p.price,
        compareAt: p.compareAt,
        maxSpeed: p.maxSpeed,
        range: p.range,
        motorPower: p.motorPower,
        featured: p.featured,
        images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
      }));
  } catch (err) {
    console.error("[blog] no se pudieron cargar productos relacionados:", err);
    return [];
  }
}
