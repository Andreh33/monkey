import Link from "next/link";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  updated: string;
  children: React.ReactNode;
}

/**
 * Maquetación compartida para las páginas legales (aviso legal, privacidad,
 * cookies, condiciones). Mantiene la estética del sitio y aplica tipografía
 * legible para texto largo a través de la clase `.legal-prose` (globals.css).
 */
export function LegalPage({ eyebrow, title, titleAccent, updated, children }: LegalPageProps) {
  return (
    <>
      <section className="border-b border-border bg-bg-secondary">
        <div className="container-custom py-16 sm:py-20">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="display-xl">
            {title} {titleAccent && <span className="text-gradient">{titleAccent}</span>}
          </h1>
          <p className="mt-4 text-sm text-text-muted font-mono">
            Última actualización: {updated}
          </p>
        </div>
      </section>

      <article className="container-custom section-pad max-w-3xl legal-prose">
        {children}
      </article>

      <section className="container-custom section-pad-sm">
        <div className="card-base p-8 text-center">
          <h2 className="font-heading font-semibold text-lg mb-2">¿Dudas sobre estas condiciones?</h2>
          <p className="text-sm text-text-secondary mb-5">
            Escríbenos y te respondemos lo antes posible.
          </p>
          <Link
            href="/contacto"
            className="inline-block px-7 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm bg-accent-orange text-black hover:opacity-90 transition-opacity"
          >
            Contactar
          </Link>
        </div>
      </section>
    </>
  );
}
