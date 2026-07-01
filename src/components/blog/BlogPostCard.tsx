import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { BLOG_CATEGORIES, formatBlogDate, type BlogPostMeta } from "@/lib/blog";

/** Tarjeta de post para el índice del blog y los listados por categoría. */
export function BlogPostCard({ post }: { post: BlogPostMeta }) {
  const cat = BLOG_CATEGORIES[post.category];
  return (
    <article className="card-base group relative overflow-hidden h-full">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-accent-orange/40 text-accent-orange">
            {cat.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-mono">
            <Clock className="w-3 h-3" />
            {post.readingTime} min
          </span>
        </div>
        <h3 className="font-display text-2xl sm:text-[1.7rem] leading-[0.95] tracking-wide text-text-primary group-hover:text-white transition-colors">
          {post.title}
        </h3>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3 flex-1">
          {post.excerpt ?? post.description}
        </p>
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-border">
          <span className="text-[11px] text-text-muted font-mono">{formatBlogDate(post.date)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent-orange">
            Leer <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
