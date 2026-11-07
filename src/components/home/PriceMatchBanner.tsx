import { MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/storefront-routes";

const messages = {
  es: {
    question: "¿Lo has visto más barato?",
    promise: "Te mejoramos la oferta.",
    detail: "Envíanos el enlace o una captura del mismo producto por WhatsApp.",
    button: "Enviar oferta",
    message: "Hola, he encontrado este producto más barato y me gustaría que me mejorarais la oferta. Os envío el enlace o la captura.",
  },
  fr: {
    question: "Vous l’avez trouvé moins cher ?",
    promise: "Nous vous proposons une meilleure offre.",
    detail: "Envoyez-nous le lien ou une capture d’écran du même produit sur WhatsApp.",
    button: "Envoyer l’offre",
    message: "Bonjour, j’ai trouvé ce produit moins cher. Pouvez-vous me proposer une meilleure offre ? Je vous envoie le lien ou la capture.",
  },
  it: {
    question: "L’hai trovato a meno?",
    promise: "Ti facciamo un’offerta migliore.",
    detail: "Inviaci su WhatsApp il link o uno screenshot dello stesso prodotto.",
    button: "Invia l’offerta",
    message: "Ciao, ho trovato questo prodotto a un prezzo più basso. Potete farmi un’offerta migliore? Vi invio il link o lo screenshot.",
  },
  pt: {
    question: "Encontrou mais barato?",
    promise: "Melhoramos a oferta.",
    detail: "Envie-nos por WhatsApp o link ou uma captura de ecrã do mesmo produto.",
    button: "Enviar oferta",
    message: "Olá, encontrei este produto mais barato. Podem fazer-me uma oferta melhor? Envio o link ou a captura de ecrã.",
  },
} satisfies Record<Locale, { question: string; promise: string; detail: string; button: string; message: string }>;

export function PriceMatchBanner({ locale = "es" }: { locale?: Locale }) {
  const text = messages[locale];
  return (
    <aside aria-label={`${text.question} ${text.promise}`} className="rounded-xl border border-border bg-bg-secondary">
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <p className="text-base font-semibold leading-snug text-white">{text.question} {text.promise}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.detail}</p>
        </div>
        <a href={`https://wa.me/34616686593?text=${encodeURIComponent(text.message)}`} target="_blank" rel="noopener noreferrer" aria-label={`${text.button} — WhatsApp`} className="inline-flex min-h-11 shrink-0 self-start items-center justify-center gap-2 rounded-lg border border-[#25D366]/40 px-4 py-2 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] lg:self-center">
          <MessageCircle aria-hidden="true" className="h-4 w-4" />{text.button}
        </a>
      </div>
    </aside>
  );
}
