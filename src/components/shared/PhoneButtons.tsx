import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhoneButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href="tel:+34643274756"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-bg-secondary hover:border-accent-orange hover:bg-bg-tertiary transition-all text-sm font-mono"
      >
        <Phone className="w-4 h-4 text-accent-orange" />
        <span>643 27 47 56</span>
      </a>
      <a
        href="tel:+34616686593"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-bg-secondary hover:border-accent-orange hover:bg-bg-tertiary transition-all text-sm font-mono"
      >
        <Phone className="w-4 h-4 text-accent-orange" />
        <span>616 686 593</span>
      </a>
    </div>
  );
}
