import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Award, Zap, HandshakeIcon, MapPin } from "lucide-react";

export const metadata = { title: "Nosotros" };

const values = [
  { icon: Award, title: "Calidad", text: "Trabajamos con piezas originales o equivalentes certificadas. Nada de chapuzas. Cada reparación pasa control de calidad antes de salir." },
  { icon: Zap, title: "Rapidez", text: "Diagnóstico el mismo día, presupuesto en 24h. La mayoría de reparaciones se entregan en 48-72 horas." },
  { icon: HandshakeIcon, title: "Confianza", text: "Presupuestos claros sin sorpresas. Si no podemos arreglarlo, te lo decimos. Y siempre con garantía sobre nuestro trabajo." },
];

const gallery = [
  "/imagenes/local-04.jpeg",
  "/imagenes/local-09.jpeg",
  "/imagenes/local-14.jpeg",
  "/imagenes/local-18.jpeg",
  "/imagenes/local-22.jpeg",
  "/imagenes/local-27.jpeg",
];

export default function NosotrosPage() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        <Image
          src="/imagenes/local-13.jpeg"
          alt="Tienda MonopatinShop en Tarragona"
          fill
          priority
          className="object-cover"
          style={{ filter: "brightness(0.5) saturate(1.1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="container-custom relative z-10 pb-12">
          <p className="eyebrow mb-3">★ DESDE TARRAGONA ★</p>
          <h1 className="display-xl">Quiénes <span className="text-gradient">somos</span></h1>
        </div>
      </section>

      <section className="container-custom section-pad">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div>
              <p className="eyebrow mb-3">★ NUESTRA HISTORIA ★</p>
              <h2 className="display-md mb-6">De la pasión por la calle al taller</h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  MonopatinShop nace de la pasión por la movilidad eléctrica y la cultura urbana de Tarragona. Empezamos como un pequeño taller arreglando los patinetes de amigos y vecinos del barrio, y poco a poco se ha convertido en el referente de la ciudad para venta y reparación de patinetes eléctricos.
                </p>
                <p>
                  Detrás del shop hay un equipo que vive el patinete como medio de transporte, como deporte y como forma de vida. Conocemos cada modelo, cada problema típico y cada solución. Y lo más importante: tratamos cada patinete que entra como si fuera el nuestro.
                </p>
                <p>
                  Estamos en C/ Jaume I, 5, en pleno corazón de Tarragona, con un taller equipado para resolver cualquier avería: desde el simple pinchazo hasta la sustitución completa de batería con celdas de alta gama.
                </p>
                <p className="text-white font-semibold">
                  Cercanos. Honestos. Y muy, muy enrollados con el patinete.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border">
              <Image src="/imagenes/local-17.jpeg" alt="Equipo MonopatinShop" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-3xl tracking-wider text-white">Tarragona · 2026</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-bg-secondary border-y border-border section-pad">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="eyebrow mb-3">★ NUESTROS VALORES ★</p>
              <h2 className="display-md">3 cosas no negociables</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <ScrollReveal key={v.title} delay={i * 0.12}>
                  <div className="card-base p-8 h-full text-center">
                    <Icon className="w-12 h-12 text-accent-orange mx-auto mb-5" strokeWidth={1.4} />
                    <h3 className="display-md mb-3">{v.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{v.text}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-custom section-pad">
        <ScrollReveal>
          <div className="mb-10">
            <p className="eyebrow mb-3">★ EL TALLER ★</p>
            <h2 className="display-md">Por dentro</h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-[180px] sm:auto-rows-[260px]">
          {gallery.map((img, i) => (
            <ScrollReveal key={img} delay={i * 0.06} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border group">
                <Image src={img} alt={`Taller ${i + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="container-custom section-pad-sm">
        <ScrollReveal>
          <div
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF003C 100%)" }}
          >
            <div className="absolute inset-0 noise opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <MapPin className="w-12 h-12 text-black mx-auto mb-4" />
              <h2 className="display-md text-black">Ven a conocernos</h2>
              <p className="text-black/80 mt-3 text-lg">C/ Jaume I, 5 · Tarragona</p>
              <Link href="/contacto" className="inline-block mt-6 px-7 py-4 rounded-md font-bold uppercase tracking-wider text-sm bg-black text-white hover:bg-bg-secondary transition-all">
                Cómo llegar
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
