/**
 * Alias públicos para slugs de producto heredados de la semilla inicial.
 *
 * Problema: varios productos se dieron de alta reutilizando fichas de la
 * semilla (p. ej. el slug `xiaomi-electric-scooter-4-pro` sirve en realidad un
 * InMotion CLIMBER DGT). Un slug que promete un producto distinto del que se
 * sirve daña el CTR, confunde a Google y desaprobaría el feed de Merchant
 * Center por incoherencia URL/título.
 *
 * Solución SIN tocar la base de datos (los slugs de la BD no se modifican):
 *  - La URL pública correcta se define aquí (`DB_TO_PUBLIC_SLUG`).
 *  - La ficha redirige 308 (permanente) del slug antiguo al público y resuelve
 *    el público contra el slug real de la BD (ver /tienda/[slug]/page.tsx).
 *  - Sitemap, tarjetas, buscador y JSON-LD enlazan siempre el slug público.
 *
 * Si algún día se corrige el slug en la BD (admin), la resolución directa por
 * BD tiene prioridad y estas entradas quedan inertes: se pueden borrar.
 */
export const DB_TO_PUBLIC_SLUG: Record<string, string> = {
  // InMotion CLIMBER DGT 14.7Ah - Waterproof and Dual motor
  "xiaomi-electric-scooter-4-pro": "patinete-electrico-inmotion-climber-dgt",
  // ROVORON S7 DGT - 84V 37Ah Samsung
  "segway-ninebot-max-g2": "patinete-electrico-rovoron-s7-dgt",
  // ROVORON R7 PRO DGT - 60V 42Ah Samsung - Red
  "cecotec-bongo-serie-a-advance": "patinete-electrico-rovoron-r7-pro-dgt-rojo",
  // ROVORON R7 PRO DGT - 60V 42Ah Samsung - Black
  "smartgyro-speedway-v3-max": "patinete-electrico-rovoron-r7-pro-dgt-negro",
  // Dualtron Togo Pro (Homologado DGT)
  "dualtron-mini-limited": "patinete-electrico-dualtron-togo-pro-dgt",
  // Dualtron Mini Special DUAL Long Body Certificado
  "inokim-light-2": "patinete-electrico-dualtron-mini-special-dual",
};

/** Mapa inverso: slug público → slug real en la BD. */
export const PUBLIC_TO_DB_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(DB_TO_PUBLIC_SLUG).map(([db, pub]) => [pub, db])
);

/** Slug con el que se debe ENLAZAR un producto (el de la BD si no tiene alias). */
export function publicProductSlug(dbSlug: string): string {
  return DB_TO_PUBLIC_SLUG[dbSlug] ?? dbSlug;
}
