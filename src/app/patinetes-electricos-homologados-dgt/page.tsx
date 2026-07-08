import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, FileText, CalendarClock, Wrench, MessageCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Breadcrumbs } from "@/components/blog/Breadcrumbs";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, faqPageSchema, isDgtCertified } from "@/lib/schema";
import { whatsAppUrl } from "@/lib/whatsapp";

const PATH = "/patinetes-electricos-homologados-dgt";

export const metadata: Metadata = {
  title: "Patinetes Eléctricos Homologados DGT · Certificado VMP · Envío 24-48h",
  description:
    "Patinetes eléctricos homologados por la DGT con certificado VMP, listos para la normativa 2026-2027. Montados y probados en Tarragona, envío 24-48h a toda España y garantía 3 años.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Patinetes eléctricos homologados DGT · Certificado VMP",
    description:
      "Solo modelos con certificado VMP listos para circular con la normativa 2026-2027. Montados y probados en nuestro taller de Tarragona.",
    url: PATH,
    type: "website",
  },
};

// Preguntas answer-first (respuesta directa en 40-60 palabras): ganan el snippet
// y alimentan la extracción por IA. El markup FAQPage ya no da rich result de
// SERP (retirado 05-2026) pero sigue siendo válido y útil para los motores de IA.
const FAQS = [
  {
    q: "¿Qué es un patinete homologado por la DGT?",
    a: "Es un patinete eléctrico (VMP) con certificado de circulación de la DGT: el fabricante ha acreditado que cumple el manual de características (velocidad limitada a 25 km/h, frenos, luces, timbre). Ese certificado VMP es lo que permitirá circular legalmente con la normativa que entra en 2026-2027.",
  },
  {
    q: "¿Desde cuándo es obligatorio el certificado VMP?",
    a: "Los patinetes nuevos ya deben comercializarse con certificado VMP y, según el calendario de la DGT, a partir del 22 de enero de 2027 solo podrán circular los modelos homologados. Confirma las fechas exactas en dgt.es antes de comprar o circular.",
  },
  {
    q: "¿Todos vuestros patinetes están homologados?",
    a: "En esta página listamos únicamente los modelos de nuestra tienda cuyo fabricante declara certificado VMP. Cada patinete sale del taller de Tarragona montado, ajustado a tu peso y probado. Si tienes dudas sobre un modelo concreto, pregúntanos por WhatsApp y te lo confirmamos.",
  },
  {
    q: "¿Puedo homologar un patinete antiguo que ya tengo?",
    a: "En la práctica, no. El certificado VMP lo tramita el fabricante para cada modelo antes de venderlo; no es un trámite posterior tipo ITV. Si tu patinete no salió de fábrica homologado y limitado a 25 km/h, lo habitual es que no pueda certificarse. Lo revisamos contigo en el taller.",
  },
];

export default async function HomologadosDgtPage() {
  // Solo patinetes cuyo fabricante declara homologación (según los datos del
  // propio producto: nombre, sku o descripción). No se marca nada que la ficha
  // no afirme.
  let homologados: Awaited<ReturnType<typeof loadProducts>> = [];
  try {
    homologados = await loadProducts();
  } catch (err) {
    console.error("[homologados-dgt] no se pudieron cargar productos:", err);
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Tienda", path: "/tienda" },
            { name: "Homologados DGT", path: PATH },
          ]),
          collectionPageSchema({
            path: PATH,
            name: "Patinetes eléctricos homologados DGT",
            description:
              "Catálogo de patinetes eléctricos con certificado VMP de la DGT, listos para la normativa 2026-2027.",
            items: homologados.map((p) => ({ slug: p.slug, name: p.name })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <section className="container-custom pt-10 pb-8">
        <Breadcrumbs
          items={[
            { name: "Inicio", href: "/" },
            { name: "Tienda", href: "/tienda" },
            { name: "Homologados DGT" },
          ]}
        />
        <ScrollReveal>
          <p className="eyebrow mt-6 mb-3">★ CERTIFICADO VMP ★</p>
          <h1 className="display-xl max-w-5xl">
            Patinetes eléctricos <span className="text-gradient">homologados DGT</span>
          </h1>
          {/* Respuesta directa (answer-first) para snippet y cita de IA. */}
          <p className="mt-6 text-lg text-text-secondary max-w-3xl leading-relaxed">
            Un patinete homologado por la DGT es un VMP con certificado de circulación: el
            fabricante acredita que cumple la normativa (25 km/h, frenos, luces y timbre). Aquí
            reunimos los modelos de nuestra tienda con certificado VMP, listos para la normativa
            2026-2027. Todos salen <strong className="text-white">montados y probados en nuestro
            taller de Tarragona</strong>, con envío 24-48h a toda España y garantía de 3 años.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#catalogo" className="btn-primary text-base py-3.5">
              Ver patinetes homologados <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={whatsAppUrl("Hola, busco un patinete homologado DGT. ¿Me asesoráis?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md font-semibold text-white"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" /> Pregúntanos por WhatsApp
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* Ola de demanda DGT: qué cambia, con enlaces a las guías que ya rankean. */}
      <section className="bg-bg-secondary border-y border-border section-pad-sm">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="display-md mb-3">Qué exige la normativa DGT 2026-2027</h2>
            <p className="text-text-secondary max-w-3xl leading-relaxed mb-10">
              La DGT ha ordenado la circulación de los patinetes (VMP): certificado de circulación,
              registro con identificador, seguro de responsabilidad civil y casco. Comprar ya un
              modelo homologado te evita tener que cambiarlo cuando el calendario termine de
              aplicarse. Estas son las claves y las guías donde lo explicamos a fondo:
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <InfoCard
              icon={BadgeCheck}
              title="Certificado VMP"
              text="El fabricante certifica el modelo antes de venderlo. Sin él, un patinete no cuenta como homologado."
              href="/blog/patinetes-homologados-dgt-certificado-vmp"
              linkText="Qué es el certificado VMP"
            />
            <InfoCard
              icon={FileText}
              title="Registro e identificador"
              text="La DGT prevé un registro del vehículo con una etiqueta/identificador para poder circular."
              href="/blog/como-matricular-patinete-electrico-dgt"
              linkText="Cómo matricular tu patinete"
            />
            <InfoCard
              icon={ShieldCheck}
              title="Seguro obligatorio"
              text="Seguro de responsabilidad civil para cubrir daños a terceros, con primas orientativas de 20-100 €/año."
              href="/blog/seguro-patinete-electrico-obligatorio-2026"
              linkText="Seguro obligatorio 2026"
            />
            <InfoCard
              icon={CalendarClock}
              title="Calendario 2027"
              text="Según la DGT, desde el 22-ene-2027 solo podrán circular los patinetes homologados. Confirma fechas en dgt.es."
              href="/blog/normativa-patinetes-electricos-2026"
              linkText="Normativa completa 2026"
            />
          </div>
        </div>
      </section>

      {/* Catálogo de homologados */}
      <section id="catalogo" className="container-custom section-pad-sm scroll-mt-24">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="eyebrow mb-2">★ NUESTRA SELECCIÓN HOMOLOGADA ★</p>
              <h2 className="display-md">Patinetes con certificado VMP</h2>
            </div>
            <Link
              href="/tienda?cat=patinete"
              className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-accent-orange hover:text-white transition-colors"
            >
              Ver toda la tienda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        {homologados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homologados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="card-base p-8 text-center">
            <p className="text-text-secondary">
              Estamos actualizando el catálogo de homologados.{" "}
              <a
                href={whatsAppUrl("Hola, ¿qué patinetes homologados DGT tenéis disponibles?")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-orange hover:underline"
              >
                Escríbenos por WhatsApp
              </a>{" "}
              y te decimos qué modelos homologados tenemos ahora mismo.
            </p>
          </div>
        )}
      </section>

      {/* Cómo saber si está homologado: tabla citable de 3 columnas */}
      <section className="container-custom pb-4">
        <ScrollReveal>
          <h2 className="display-md mb-6">Cómo saber si un patinete está homologado</h2>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-bg-tertiary text-left">
                  <th className="px-4 py-3 font-mono uppercase text-xs tracking-widest text-text-muted">Señal</th>
                  <th className="px-4 py-3 font-mono uppercase text-xs tracking-widest text-text-muted">Homologado (VMP)</th>
                  <th className="px-4 py-3 font-mono uppercase text-xs tracking-widest text-text-muted">Sin homologar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Certificado de circulación", "Sí, emitido por el fabricante", "No lo tiene"],
                  ["Velocidad máxima", "Limitada a 25 km/h", "A menudo supera 25 km/h"],
                  ["Etiqueta / identificador", "Placa o número de certificado", "Ninguna"],
                  ["Circular desde 2027", "Permitido", "No permitido en vía pública"],
                  ["Seguro y registro", "Se puede tramitar", "Problemas para asegurarlo"],
                ].map(([k, ok, no], i) => (
                  <tr key={k} className={i % 2 === 0 ? "bg-bg-secondary" : "bg-bg-primary"}>
                    <td className="px-4 py-3 font-medium text-white">{k}</td>
                    <td className="px-4 py-3 text-success">{ok}</td>
                    <td className="px-4 py-3 text-text-secondary">{no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-text-secondary max-w-3xl leading-relaxed">
            Consulta el listado oficial de VMP certificados en{" "}
            <a href="https://www.dgt.es" target="_blank" rel="noopener noreferrer" className="text-accent-orange hover:underline">
              dgt.es
            </a>
            . Si compraste el patinete antes de 2024 o no encuentras el certificado, lo más probable
            es que no esté homologado: tráelo a nuestro{" "}
            <Link href="/reparaciones" className="text-accent-orange hover:underline">
              taller de Tarragona
            </Link>{" "}
            y lo revisamos contigo.
          </p>
        </ScrollReveal>
      </section>

      {/* FAQ answer-first */}
      <section className="container-custom section-pad-sm">
        <ScrollReveal>
          <h2 className="display-md mb-8">Preguntas frecuentes</h2>
        </ScrollReveal>
        <div className="max-w-3xl space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="card-base p-6">
              <h3 className="font-display text-xl tracking-wide mb-2">{f.q}</h3>
              <p className="text-text-secondary leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-bg-secondary border-t border-border section-pad-sm">
        <div className="container-custom text-center">
          <Wrench className="w-10 h-10 text-accent-orange mx-auto mb-4" strokeWidth={1.4} />
          <h2 className="display-md mb-3">¿Dudas con la homologación?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-7 leading-relaxed">
            Te asesoramos según tu uso, peso y presupuesto, y te confirmamos qué modelos están
            homologados por la DGT. Sin compromiso, desde nuestra tienda-taller de Tarragona.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsAppUrl("Hola, busco un patinete homologado DGT. ¿Me asesoráis?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md font-semibold text-white"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
            </a>
            <a href="tel:+34643274756" className="btn-outline text-base py-3.5">
              643 27 47 56
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
  href,
  linkText,
}: {
  icon: typeof BadgeCheck;
  title: string;
  text: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="card-base p-6 h-full flex flex-col">
      <Icon className="w-9 h-9 text-accent-orange mb-4" strokeWidth={1.4} />
      <h3 className="font-display text-2xl tracking-wider mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed flex-1">{text}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent-orange hover:text-white transition-colors"
      >
        {linkText} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

async function loadProducts() {
  const products = await prisma.product.findMany({
    where: { active: true, category: "patinete" },
    include: { images: { orderBy: { order: "asc" }, take: 2 } },
    orderBy: [{ featured: "desc" }, { price: "asc" }],
  });
  return products
    .filter((p) => isDgtCertified(p))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      compareAt: p.compareAt,
      maxSpeed: p.maxSpeed,
      range: p.range,
      motorPower: p.motorPower,
      featured: p.featured,
      images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    }));
}
