import Link from "next/link";
import { Wrench, ShoppingBag, MessageCircle, ArrowRight, type LucideIcon } from "lucide-react";

type Variant = "reparacion" | "tienda" | "contacto";

const PRESETS: Record<
  Variant,
  { eyebrow: string; title: string; text: string; href: string; cta: string; icon: LucideIcon }
> = {
  reparacion: {
    eyebrow: "★ TALLER PROPIO EN TARRAGONA ★",
    title: "¿Tu patinete necesita una revisión?",
    text: "Diagnóstico gratis si reparas con nosotros. Todas las marcas, presupuesto sin compromiso y garantía sobre el trabajo.",
    href: "/reparaciones",
    cta: "Pedir diagnóstico",
    icon: Wrench,
  },
  tienda: {
    eyebrow: "★ PATINETES HOMOLOGADOS DGT ★",
    title: "Encuentra tu próximo patinete",
    text: "Modelos homologados y listos para la normativa 2026. Envío 24-48h y montaje en taller incluido.",
    href: "/tienda",
    cta: "Ver la tienda",
    icon: ShoppingBag,
  },
  contacto: {
    eyebrow: "★ ESTAMOS EN TARRAGONA ★",
    title: "¿Tienes dudas? Habla con nosotros",
    text: "C/ Jaume I, 5. Te asesoramos sin compromiso, en persona o por WhatsApp.",
    href: "/contacto",
    cta: "Contactar",
    icon: MessageCircle,
  },
};

/** Banner de conversión reutilizable dentro de los artículos. */
export function CtaBanner({
  variant = "reparacion",
  title,
  text,
  href,
  cta,
}: {
  variant?: Variant;
  title?: string;
  text?: string;
  href?: string;
  cta?: string;
}) {
  const preset = PRESETS[variant];
  const Icon = preset.icon;
  return (
    <aside
      className="relative overflow-hidden rounded-2xl border border-accent-red/30 p-8 my-8"
      style={{ background: "linear-gradient(135deg, rgba(255,42,42,0.10), rgba(255,0,60,0.035))" }}
    >
      <p className="eyebrow mb-3">{preset.eyebrow}</p>
      <h3 className="font-display text-3xl sm:text-4xl tracking-wide text-white leading-none">
        {title ?? preset.title}
      </h3>
      <p className="mt-3 text-text-secondary max-w-xl leading-relaxed">{text ?? preset.text}</p>
      <Link href={href ?? preset.href} className="btn-primary mt-6">
        <Icon className="w-4 h-4" />
        {cta ?? preset.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </aside>
  );
}
