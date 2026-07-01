import Link from "next/link";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES, type BlogCategoryKey } from "@/lib/blog";

const orderedKeys = (Object.keys(BLOG_CATEGORIES) as BlogCategoryKey[]).sort(
  (a, b) => BLOG_CATEGORIES[a].order - BLOG_CATEGORIES[b].order,
);

/** Filtros de categoría del blog (índice y páginas de categoría). */
export function BlogCategoryPills({ active }: { active?: BlogCategoryKey | "all" }) {
  const base =
    "px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-colors";
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={cn(
          base,
          !active || active === "all"
            ? "border-accent-orange text-accent-orange bg-accent-orange/10"
            : "text-text-secondary border-border hover:text-white hover:bg-bg-tertiary",
        )}
      >
        Todo
      </Link>
      {orderedKeys.map((c) => (
        <Link
          key={c}
          href={`/blog/categoria/${c}`}
          className={cn(
            base,
            active === c
              ? "border-accent-orange text-accent-orange bg-accent-orange/10"
              : "text-text-secondary border-border hover:text-white hover:bg-bg-tertiary",
          )}
        >
          {BLOG_CATEGORIES[c].label}
        </Link>
      ))}
    </div>
  );
}
