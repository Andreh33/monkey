/**
 * Configuración central de la celebración del 9.º aniversario.
 *
 * Para QUITAR toda la celebración y dejar la web como antes:
 *   pon `activo: false`  → desaparecen el banner y el overlay, sin rastro.
 *
 * (El estado previo al aniversario está además guardado en el tag git `pre-aniversario-9`.)
 */
export const ANIVERSARIO = {
  activo: true,
  desde: "2017",
  hasta: "2026",
  anios: 9,
} as const;
