import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Migas de pan visuales (el JSON-LD BreadcrumbList se inyecta aparte). */
export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Migas de pan" className="flex items-center flex-wrap gap-1.5 text-xs text-text-muted font-mono">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {it.href ? (
            <Link href={it.href} className="hover:text-accent-orange transition-colors">
              {it.name}
            </Link>
          ) : (
            <span className="text-text-secondary">{it.name}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="w-3 h-3 opacity-60" />}
        </span>
      ))}
    </nav>
  );
}
