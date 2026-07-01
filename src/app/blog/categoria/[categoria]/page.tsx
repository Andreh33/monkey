import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByCategory, BLOG_CATEGORIES, type BlogCategoryKey } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogCategoryPills } from "@/components/blog/BlogCategoryPills";
import { CtaBanner } from "@/components/blog/CtaBanner";
import { Breadcrumbs } from "@/components/blog/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

const KEYS = Object.keys(BLOG_CATEGORIES) as BlogCategoryKey[];

export function generateStaticParams() {
  return KEYS.map((categoria) => ({ categoria }));
}

export function generateMetadata({ params }: { params: { categoria: string } }): Metadata {
  const cat = BLOG_CATEGORIES[params.categoria as BlogCategoryKey];
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: `${cat.title} · Blog de patinetes eléctricos`,
    description: cat.description,
    alternates: { canonical: `/blog/categoria/${params.categoria}` },
    openGraph: {
      title: `${cat.title} · Blog MonopatinShop`,
      description: cat.description,
      url: `/blog/categoria/${params.categoria}`,
      type: "website",
    },
  };
}

export default function BlogCategoryPage({ params }: { params: { categoria: string } }) {
  const key = params.categoria as BlogCategoryKey;
  const cat = BLOG_CATEGORIES[key];
  if (!cat) notFound();

  const posts = getPostsByCategory(key);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: cat.label, path: `/blog/categoria/${key}` },
        ])}
      />

      <section className="container-custom pt-14 pb-10">
        <Breadcrumbs
          items={[
            { name: "Inicio", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: cat.label },
          ]}
        />
        <p className="eyebrow mb-3 mt-6">★ {cat.label.toUpperCase()} ★</p>
        <h1 className="display-xl">{cat.title}</h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl leading-relaxed">{cat.description}</p>
        <div className="mt-8">
          <BlogCategoryPills active={key} />
        </div>
      </section>

      <section className="container-custom section-pad-sm">
        {posts.length === 0 ? (
          <p className="text-text-muted">Pronto publicaremos artículos en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogPostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </section>

      <section className="container-custom pb-24">
        <CtaBanner variant="reparacion" />
      </section>
    </>
  );
}
