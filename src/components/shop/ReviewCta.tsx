import { Youtube, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/34643274756?text=Hola%2C%20me%20gustar%C3%ADa%20una%20review%20de%20este%20producto";

export function ReviewCta({ youtubeUrl }: { youtubeUrl?: string | null }) {
  if (youtubeUrl) {
    return (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-accent-red/50 bg-accent-red/10 px-5 py-4 hover:bg-accent-red/15 transition-colors group"
      >
        <span className="w-10 h-10 rounded-md bg-accent-red flex items-center justify-center shrink-0">
          <Youtube className="w-5 h-5 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-mono text-accent-red">★ Review en YouTube ★</p>
          <p className="font-display text-lg tracking-wider text-white group-hover:text-accent-red transition-colors">
            Mira nuestra review en YouTube
          </p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary px-5 py-4 hover:border-accent-orange hover:bg-bg-tertiary transition-colors group"
    >
      <span className="w-10 h-10 rounded-md bg-bg-tertiary border border-border flex items-center justify-center shrink-0">
        <MessageCircle className="w-5 h-5 text-accent-orange" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-text-muted">★ Review ★</p>
        <p className="font-display text-lg tracking-wider text-white group-hover:text-accent-orange transition-colors">
          Aún no tenemos review, ¡pídenosla!
        </p>
      </div>
    </a>
  );
}
