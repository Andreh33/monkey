import { BadgePercent, MessageCircle } from "lucide-react";
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
    <aside aria-label={`${text.question} ${text.promise}`} className="border-y border-accent-red/30 bg-bg-secondary">
      <div className="container-custom flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <span aria-hidden="true" className="mt-0.5 rounded-xl border border-accent-red/30 bg-accent-red/10 p-2.5 text-accent-orange"><BadgePercent className="h-6 w-6" /></span>
          <div>
            <p className="font-heading text-lg font-bold leading-snug text-white sm:text-xl">{text.question} <span className="text-accent-orange">{text.promise}</span></p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{text.detail}</p>
          </div>
        </div>
        <a href={`https://wa.me/34616686593?text=${encodeURIComponent(text.message)}`} target="_blank" rel="noopener noreferrer" aria-label={`${text.button} — WhatsApp`} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-[#40e27e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]">
          <MessageCircle aria-hidden="true" className="h-5 w-5" />{text.button}
        </a>
      </div>
    </aside>
  );
}
