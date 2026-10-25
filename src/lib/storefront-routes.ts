export const locales = ["es", "fr", "it", "pt"] as const;
export type Locale = (typeof locales)[number];
export const SITE = "https://monopatinmonkey.com";
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export function localePath(locale: Locale, path = "/") {
  const stripped = path.replace(/^\/(fr|it|pt)(?=\/|\?|$)/, "") || "/";
  const clean = stripped.startsWith("?") ? "/" + stripped : stripped;
  return locale === "es" ? clean : `/${locale}${clean === "/" ? "" : clean}`;
}
export function equivalentLanguages(
  path: string,
  eligible: readonly Locale[] = locales,
) {
  return Object.fromEntries([
    ...eligible.map((l) => [l, SITE + localePath(l, path)]),
    ["x-default", SITE + localePath("es", path)],
  ]);
}
export type QueryInput = Record<string, string | string[] | undefined>;
export type CatalogQuery = {
  valid: boolean;
  page: number;
  skip: number;
  take: 24;
  filtered: boolean;
  cat: string;
  sub: string;
  brand: string;
  price: string;
  range: string;
  sort: string;
  q: string;
};
export function catalogIndexable(query: CatalogQuery, total: number) {
  return query.valid && !query.filtered && (!query.cat || total > 0);
}
export function catalogQuery(input: QueryInput): CatalogQuery {
  let valid = true;
  const read = (key: string, max = 100) => {
    const value = input[key];
    if (Array.isArray(value) || (value && value.length > max)) {
      valid = false;
      return "";
    }
    return value?.trim() ?? "";
  };
  const token = (key: string) => {
    const s = read(key);
    if (s && !/^[\p{L}\p{N} ._+&()/-]+$/u.test(s)) valid = false;
    return s === "all" ? "" : s;
  };
  const cat = token("cat"),
    sub = token("sub"),
    brand = token("brand");
  const price = read("price"),
    range = read("range"),
    sort = read("sort") || "recent",
    q = read("q", 120);
  const pageText = read("page", 5) || "1";
  if (!/^[1-9]\d*$/.test(pageText) || Number(pageText) > 10000) valid = false;
  if (price && !["all", "0-500", "500-1000", "1000+"].includes(price))
    valid = false;
  if (range && !["all", "20", "40", "60", "80", "100"].includes(range))
    valid = false;
  if (!["recent", "price-asc", "price-desc", "name"].includes(sort))
    valid = false;
  if (
    Object.keys(input).some(
      (k) =>
        ![
          "cat",
          "sub",
          "brand",
          "price",
          "range",
          "sort",
          "q",
          "page",
        ].includes(k) &&
        !/^utm_[a-z0-9_]+$/.test(k) &&
        !["gclid", "dclid", "fbclid", "msclkid", "ttclid"].includes(k),
    )
  )
    valid = false;
  const page = valid ? Number(pageText) : 1;
  return {
    valid,
    page,
    skip: (page - 1) * 24,
    take: 24,
    cat,
    sub,
    brand,
    price: price === "all" ? "" : price,
    range: range === "all" ? "" : range,
    sort,
    q,
    filtered: Boolean(
      sub ||
        brand ||
        (price && price !== "all") ||
        (range && range !== "all") ||
        q ||
        sort !== "recent",
    ),
  };
}
export function catalogPath(
  locale: Locale,
  query: CatalogQuery,
  page = query.page,
) {
  const params = new URLSearchParams();
  for (const key of ["cat", "sub", "brand", "price", "range", "q"] as const)
    if (query[key]) params.set(key, query[key]);
  if (query.sort !== "recent") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));
  return (
    localePath(locale, "/tienda") + (params.size ? "?" + params.toString() : "")
  );
}
