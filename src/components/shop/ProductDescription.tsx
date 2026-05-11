"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const COLLAPSED_THRESHOLD = 280;

export function ProductDescription({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const paragraphs = description.split("\n\n").filter(Boolean);
  const isLong = description.length > COLLAPSED_THRESHOLD;

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wider mb-4">Descripción</h2>

      <div className="relative">
        <div
          className={`prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4 overflow-hidden transition-[max-height] duration-500 ease-in-out ${
            isLong && !open ? "max-h-[180px]" : "max-h-[6000px]"
          }`}
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {isLong && !open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-primary to-transparent" />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-accent-orange hover:text-white transition-colors"
        >
          {open ? "Leer menos" : "Leer descripción completa"}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
