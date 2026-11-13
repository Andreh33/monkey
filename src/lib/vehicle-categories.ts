/** Complete vehicles have priority in the default shop view. */
export const VEHICLE_CATEGORIES = [
  "patinete", "bicicleta", "drift", "pit-bikes", "quads", "minimotos", "buggies",
  "coches-electricos-infantiles", "motos-matriculables", "movilidad-reducida", "hoverboard",
] as const;

export const isVehicleCategory = (slug: string) =>
  (VEHICLE_CATEGORIES as readonly string[]).includes(slug);
