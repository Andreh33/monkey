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
    <aside aria-label={`${text.question} ${text.promise}`} className="flex flex-col overflow-hidden rounded-xl border-2 border-accent-red bg-brand-gradient lg:flex-row">
      <div className="min-w-0 flex-1 p-6 sm:p-8">
        <p className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
          <span className="block">{text.question}</span>
          <span className="mt-1 block">{text.promise}</span>
        </p>
        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-black">{text.detail}</p>
      </div>
      <div className="flex shrink-0 items-center bg-black p-5 sm:p-7">
        <a href={`https://wa.me/34616686593?text=${encodeURIComponent(text.message)}`} target="_blank" rel="noopener noreferrer" aria-label={`${text.button} — WhatsApp`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-[#0047FF] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#0035C8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto">
          <MessageCircle aria-hidden="true" className="h-5 w-5" />{text.button}
        </a>
      </div>
    </aside>
  );
}
