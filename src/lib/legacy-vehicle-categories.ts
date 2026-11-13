import {
  catalogPath,
  catalogQuery,
  type Locale,
  type QueryInput,
} from "./storefront-routes";

const destinations = new Map<string, { cat: string; sub: string }>([
  ["bicicletas-electricas", { cat: "bicicleta", sub: "" }],
  ["pit-bikes-de-gasolina", { cat: "pit-bikes", sub: "pit-bikes-de-gasolina" }],
  ["pit-bikes-electricas", { cat: "pit-bikes", sub: "pit-bikes-electricas" }],
  ["minimotos-gasolina", { cat: "minimotos", sub: "minimotos-gasolina" }],
  ["minimotos-electricas", { cat: "minimotos", sub: "minimotos-electricas" }],
  ["mini-quads-gasolina", { cat: "quads", sub: "mini-quads-gasolina" }],
  ["mini-quads-electricos", { cat: "quads", sub: "mini-quads-electricos" }],
  ["buggies", { cat: "buggies", sub: "" }],
  ["coches-electricos-infantiles", { cat: "coches-electricos-infantiles", sub: "" }],
  ["motos-matriculables", { cat: "motos-matriculables", sub: "" }],
  ["hoverboard", { cat: "hoverboard", sub: "" }],
]);

/** Keep old category bookmarks useful after removing the generic vehicle group. */
export function legacyVehicleCategoryPath(input: QueryInput, locale: Locale) {
  const query = catalogQuery(input);
  const redundantBicycleFilter = query.cat === "bicicleta" && query.sub === "bicicletas-electricas";
  if (!query.valid || (query.cat !== "vehiculos" && !redundantBicycleFilter)) return null;

  const destination = destinations.get(query.sub) ?? { cat: "", sub: "" };
  // Product regrouping changes page boundaries; an old page can now be empty.
  const path = catalogPath(locale, { ...query, ...destination }, 1);
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(input)) {
    if (
      (/^utm_[a-z0-9_]+$/.test(key) ||
        ["gclid", "dclid", "fbclid", "msclkid", "ttclid"].includes(key)) &&
      typeof value === "string" &&
      value.length <= 2048 &&
      !/[\u0000-\u001f\u007f]/.test(value)
    )
      params.set(key, value);
  }
  return pathname + (params.size ? "?" + params.toString() : "");
}
