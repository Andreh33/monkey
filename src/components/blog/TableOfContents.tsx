import { List } from "lucide-react";
import type { BlogHeading } from "@/lib/blog";

/** Índice de contenidos con anclas (#id) generadas por rehype-slug. */
export function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  if (headings.length < 3) return null;
  return (
    <nav aria-label="Índice del artículo" className="card-base p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-primary mb-3">
        <List className="w-4 h-4 text-accent-orange" />
        En este artículo
      </p>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3.5" : ""}>
            <a
              href={`#${h.id}`}
              className="text-text-secondary hover:text-accent-orange transition-colors block leading-snug"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
