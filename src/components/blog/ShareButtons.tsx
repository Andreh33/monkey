"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

/** Botones de compartir (WhatsApp, X, Facebook, copiar enlace). */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard no disponible */
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-widest text-text-muted font-mono mr-1">Compartir</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-md border border-border text-xs font-semibold text-text-secondary hover:text-white hover:border-accent-red hover:bg-bg-tertiary transition-all"
        >
          {l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar enlace"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-semibold text-text-secondary hover:text-white hover:border-accent-red hover:bg-bg-tertiary transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
