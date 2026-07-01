import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, CalendarDays, User } from "lucide-react";
import {
  getPostBySlug,
  getAllPostSlugs,
  getRelatedPosts,
  getBlogRelatedProducts,
  formatBlogDate,
  BLOG_CATEGORIES,
} from "@/lib/blog";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { FaqAccordion } from "@/components/blog/FaqAccordion";
import { RelatedProducts } from "@/components/blog/RelatedProducts";
import { CtaBanner } from "@/components/blog/CtaBanner";
import { Breadcrumbs } from "@/components/blog/Breadcrumbs";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingSchema, faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { EMPRESA } from "@/config/empresa";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author || EMPRESA.marca],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 3);
  const products = await getBlogRelatedProducts(post.relatedProducts);
  const cat = BLOG_CATEGORIES[post.category];
  const url = `${EMPRESA.url}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: cat.label, path: `/blog/categoria/${post.category}` },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          ...(post.faqs?.length ? [faqPageSchema(post.faqs)] : []),
        ]}
      />

      {/* Cabecera */}
      <section className="container-custom pt-10 pb-8 border-b border-border">
        <Breadcrumbs
          items={[
            { name: "Inicio", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: cat.label, href: `/blog/categoria/${post.category}` },
            { name: post.title },
          ]}
        />
        <div className="mt-6">
          <Link
            href={`/blog/categoria/${post.category}`}
            className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-accent-orange/40 text-accent-orange"
          >
            {cat.label}
          </Link>
        </div>
        <h1 className="mt-4 font-display uppercase tracking-wide leading-[0.95] text-4xl sm:text-5xl lg:text-6xl max-w-4xl">
          {post.title}
        </h1>
        <p className="mt-5 text-lg text-text-secondary max-w-3xl leading-relaxed">
          {post.excerpt ?? post.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted font-mono">
          <span className="inline-flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent-orange" />
            {post.author ?? EMPRESA.marca}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-accent-orange" />
            {formatBlogDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent-orange" />
            {post.readingTime} min de lectura
          </span>
        </div>
      </section>

      {/* Cuerpo + índice */}
      <section className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <article className="min-w-0 max-w-3xl">
            <ArticleBody content={post.content} />

            <div className="mt-10 pt-6 border-t border-border">
              <ShareButtons url={url} title={post.title} />
            </div>

            <div className="mt-8">
              <CtaBanner variant={post.category === "guias" ? "tienda" : "reparacion"} />
            </div>

            <FaqAccordion faqs={post.faqs} />

            <RelatedProducts products={products} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents headings={post.headings} />
            </div>
          </aside>
        </div>
      </section>

      {/* Sigue leyendo */}
      {related.length > 0 && (
        <section className="container-custom section-pad-sm border-t border-border">
          <h2 className="font-display text-3xl tracking-wider mb-8">Sigue leyendo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <BlogPostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
