import { Plus } from "lucide-react";
import type { BlogFaq } from "@/lib/blog";

/**
 * Bloque de preguntas frecuentes con <details> nativo (sin JS, siempre indexable).
 * El JSON-LD FAQPage se inyecta aparte desde la página del post.
 */
export function FaqAccordion({ faqs }: { faqs?: BlogFaq[] }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="mt-14" aria-labelledby="faq-title">
      <h2 id="faq-title" className="font-display text-3xl sm:text-4xl tracking-wide text-white mb-6">
        Preguntas frecuentes
      </h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="group card-base overflow-hidden">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 text-text-primary font-semibold">
              <span>{f.q}</span>
              <Plus className="w-5 h-5 text-accent-orange shrink-0 transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <div className="px-5 pb-5 -mt-1 text-text-secondary leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
