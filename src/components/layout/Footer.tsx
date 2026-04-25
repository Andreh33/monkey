import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="font-display text-3xl tracking-wider">
              MONKEY<span className="text-gradient">·MOTION</span>
            </Link>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed">
              Venta y reparación de patinetes eléctricos en Tarragona. Calidad. Rapidez. Confianza.
            </p>
            <div className="mt-5 flex items-start gap-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 mt-0.5 text-accent-orange shrink-0" />
              <span>C/ Jaume I, 5<br />43003 Tarragona</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-widest mb-4 text-text-primary">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-text-secondary hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/tienda" className="text-text-secondary hover:text-white transition-colors">Tienda</Link></li>
              <li><Link href="/reparaciones" className="text-text-secondary hover:text-white transition-colors">Reparaciones</Link></li>
              <li><Link href="/nosotros" className="text-text-secondary hover:text-white transition-colors">Nosotros</Link></li>
              <li><Link href="/contacto" className="text-text-secondary hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-widest mb-4 text-text-primary">Cliente</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-text-secondary hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/registro" className="text-text-secondary hover:text-white transition-colors">Crear cuenta</Link></li>
              <li><Link href="/cuenta/pedidos" className="text-text-secondary hover:text-white transition-colors">Mis pedidos</Link></li>
              <li><Link href="/carrito" className="text-text-secondary hover:text-white transition-colors">Carrito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-widest mb-4 text-text-primary">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-text-secondary">
                <Phone className="w-4 h-4 text-accent-orange" />
                <a href="tel:+34643274756" className="hover:text-white transition-colors font-mono">643 27 47 56</a>
              </li>
              <li className="flex items-center gap-2 text-text-secondary">
                <Phone className="w-4 h-4 text-accent-orange" />
                <a href="tel:+34616686593" className="hover:text-white transition-colors font-mono">616 686 593</a>
              </li>
              <li className="flex items-center gap-2 text-text-secondary">
                <Mail className="w-4 h-4 text-accent-orange" />
                <a href="mailto:hola@monkeymotion.es" className="hover:text-white transition-colors">hola@monkeymotion.es</a>
              </li>
              <li className="flex items-start gap-2 text-text-secondary">
                <Clock className="w-4 h-4 text-accent-orange mt-0.5" />
                <span>L-V 10:00-14:00 / 17:00-20:00<br />S 10:00-14:00</span>
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.tiktok.com/@monopatinshop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover:border-accent-red hover:bg-bg-tertiary transition-all"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.84a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.27Z"/></svg>
              </a>
              <a
                href="https://wa.me/34643274756"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover:border-success hover:bg-bg-tertiary transition-all"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
              <a
                href="https://instagram.com/monopatinshop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover:border-accent-orange hover:bg-bg-tertiary transition-all"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted font-mono">© 2026 MONKEYMOTION · TARRAGONA · Todos los derechos reservados</p>
          <p className="text-xs text-text-muted">Hecho en Tarragona con energía urbana ⚡</p>
        </div>
      </div>
    </footer>
  );
}
