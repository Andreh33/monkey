import Link from "next/link";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function CtaBanner() {
  return (
    <section className="relative">
      <ScrollReveal>
        <div
          className="container-custom py-20 lg:py-28 my-16 rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF003C 100%)" }}
        >
          <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
          <div className="relative z-10 text-center">
            <p className="text-black/70 text-xs font-mono uppercase tracking-[0.3em] mb-4">★ VEN A VERNOS ★</p>
            <h2 className="display-xl text-black flex items-center justify-center gap-3 flex-wrap">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={2.4} />
              C/ Jaume I, 5
            </h2>
            <p className="display-md text-black/80 mt-2">Tarragona</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/34616686593"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-md font-bold uppercase tracking-wider text-sm bg-black text-white hover:bg-bg-secondary transition-all"
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <Link
                href="tel:+34643274756"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-md font-bold uppercase tracking-wider text-sm border-2 border-black text-black hover:bg-black hover:text-white transition-all"
              >
                <Phone className="w-5 h-5" />
                Llamar ahora
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
