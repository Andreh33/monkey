"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppButton() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const hide = pathname?.startsWith("/admin");

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (hide) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="https://wa.me/34616686593?text=Hola,%20me%20gustaría%20consultar%20sobre%20mi%20patinete..."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chatea con nosotros por WhatsApp"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group"
        >
          <span className="hidden sm:flex bg-bg-secondary border border-border text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            ¿Hablamos?
          </span>
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
            style={{ background: "#25D366", boxShadow: "0 8px 30px rgba(37, 211, 102, 0.5)" }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
