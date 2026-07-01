import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { getAllPosts, formatBlogDate, BLOG_CATEGORIES, type BlogPostMeta } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogCategoryPills } from "@/components/blog/BlogCategoryPills";
import { CtaBanner } from "@/components/blog/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Blog · Guías, normativa y reparación de patinetes eléctricos",
  description:
    "Guías de compra, normativa DGT 2026, reparación y mantenimiento de patinetes eléctricos. Consejos del taller de MonopatinShop en Tarragona.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog · MonopatinShop Tarragona",
    description:
      "Normativa DGT 2026, guías de compra, reparación y mantenimiento de patinetes eléctricos.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <JsonLd
        data={[
          blogSchema(),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />

      <section className="container-custom pt-16 pb-10">
        <p className="eyebrow mb-3">★ BLOG · MONOPATINSHOP ★</p>
        <h1 className="display-xl max-w-5xl">
          El blog del <span className="text-gradient">patinete eléctrico</span>
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl leading-relaxed">
          Normativa DGT 2026, guías de compra, reparación y mantenimiento. Todo lo que necesitas
          saber, explicado sin rodeos por el taller de MonopatinShop en Tarragona.
        </p>
        <div className="mt-8">
          <BlogCategoryPills active="all" />
        </div>
      </section>

      {featured && (
        <section className="container-custom pb-4">
          <FeaturedPost post={featured} />
        </section>
      )}

      {rest.length > 0 && (
        <section className="container-custom section-pad-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((p) => (
              <BlogPostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-custom pb-24 pt-4">
        <CtaBanner variant="reparacion" />
      </section>
    </>
  );
}

function FeaturedPost({ post }: { post: BlogPostMeta }) {
  const cat = BLOG_CATEGORIES[post.category];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block card-base p-8 sm:p-10 relative overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-accent-orange/40 text-accent-orange">
          {cat.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-mono">
          <Clock className="w-3 h-3" />
          {post.readingTime} min
        </span>
        <span className="text-[11px] text-text-muted font-mono">· {formatBlogDate(post.date)}</span>
      </div>
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-wide max-w-4xl group-hover:text-white transition-colors">
        {post.title}
      </h2>
      <p className="mt-5 text-text-secondary text-lg max-w-2xl leading-relaxed">
        {post.excerpt ?? post.description}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-accent-orange">
        Leer artículo
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
