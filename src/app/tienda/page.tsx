import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Filters } from "@/components/shop/Filters";
import { getCategoryTree, type CategoryNode } from "@/lib/categories";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/schema";

type SearchParams = { [k: string]: string | undefined };

/**
 * Copy SEO por categoría. Clave = slug de la categoría en la BD; si una
 * categoría no está aquí se genera un texto correcto a partir de su nombre.
 * Keyword principal del mercado español: "patinete eléctrico" (ver auditoría:
 * los top de la SERP —MediaMarkt, Electyum, iMoveBlue… — usan solo ese término).
 */
const CATEGORY_COPY: Record<string, { title: string; description: string; intro: string }> = {
  patinete: {
    title: "Comprar Patinete Eléctrico · Homologados DGT · Envío 24-48h",
    description:
      "Patinetes eléctricos al mejor precio: homologados DGT, para adulto, plegables y de alta potencia. Montados y probados por nuestro taller. Envío 24-48h a toda España y garantía 3 años.",
    intro:
      "Patinetes eléctricos homologados DGT, urbanos y de alta potencia, seleccionados y probados por nuestro taller de Tarragona. Cada patinete se entrega montado, ajustado y con garantía de 3 años.",
  },
  bicicleta: {
    title: "Comprar Bicicleta Eléctrica · Envío 24-48h y Garantía 3 Años",
    description:
      "Bicicletas eléctricas urbanas y de montaña, montadas y revisadas por nuestro taller antes del envío. Envío 24-48h a toda España, garantía de 3 años y servicio técnico propio.",
    intro:
      "Bicicletas eléctricas urbanas y de montaña, revisadas y ajustadas en el taller antes de la entrega. Envío 24-48h a toda España y garantía de 3 años.",
  },
  vehiculos: {
    title: "Pit Bikes, Mini Quads y Minimotos · Gasolina y Eléctricas",
    description:
      "Pit bikes, mini quads, minimotos y buggies de gasolina y eléctricos para niños y adultos. Preparados y probados por el taller, con envío a toda España y garantía.",
    intro:
      "Pit bikes, mini quads, minimotos y buggies de gasolina y eléctricos, preparados y probados por el taller antes de la entrega.",
  },
  "movilidad-reducida": {
    title: "Triciclos Eléctricos para Movilidad Reducida · Envío a Toda España",
    description:
      "Triciclos y vehículos eléctricos para personas con movilidad reducida: cómodos, estables y fáciles de usar. Preparados por nuestro taller, con envío a toda España y garantía de 3 años.",
    intro:
      "Vehículos eléctricos pensados para moverse con comodidad y seguridad: estables, sencillos de manejar y preparados por nuestro taller.",
  },
  accesorio: {
    title: "Accesorios para Patinete Eléctrico: Cascos, Guantes y Más",
    description:
      "Accesorios para patinete eléctrico y motos: cascos integrales, guantes, equipación y protecciones. Compra online con envío rápido a toda España.",
    intro:
      "Cascos, guantes, equipación y protecciones para rodar seguro, seleccionados por el equipo del taller.",
  },
};

function catFromParams(searchParams: SearchParams, categories: CategoryNode[]) {
  const cat = searchParams.cat;
  if (!cat || cat === "all") return null;
  return categories.find((c) => c.slug === cat) ?? null;
}

/** ¿La URL es una página de categoría "limpia" (/tienda?cat=X sin más filtros)? */
function isCleanCategoryUrl(searchParams: SearchParams) {
  const rest = ["sub", "brand", "price", "range", "sort"].some(
    (k) => searchParams[k] && searchParams[k] !== "all"
  );
  return Boolean(searchParams.cat && searchParams.cat !== "all" && !rest);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const base: Metadata = {
    title: "Comprar Patinete Eléctrico Online · Homologados DGT y Envío 24-48h",
    description:
      "Compra tu patinete eléctrico al mejor precio: homologados DGT, Xiaomi, Segway, Dualtron y más. Montados, configurados y probados por el taller. Envío 24-48h a toda España y garantía 3 años.",
    alternates: { canonical: "/tienda" },
  };

  const cat = searchParams.cat;
  if (!cat || cat === "all") return base;

  let node: CategoryNode | null = null;
  try {
    node = catFromParams(searchParams, await getCategoryTree());
  } catch {
    node = null;
  }
  if (!node) return base;

  const copy = CATEGORY_COPY[node.slug];
  return {
    title: copy?.title ?? `Comprar ${node.name} · Envío 24-48h y Garantía 3 Años`,
    description:
      copy?.description ??
      `${node.name} al mejor precio en nuestra tienda online: preparados y probados por el taller. Envío 24-48h a toda España, garantía de 3 años y soporte técnico propio.`,
    // Las categorías "limpias" (?cat=X) son páginas de aterrizaje indexables:
    // canonical autorreferente. Cualquier combinación con más filtros
    // canonicaliza a su categoría para no generar duplicados.
    alternates: { canonical: `/tienda?cat=${encodeURIComponent(node.slug)}` },
  };
}

export default async function TiendaPage({ searchParams }: { searchParams: SearchParams }) {
  const cat = searchParams.cat;
  const sub = searchParams.sub;
  const brand = searchParams.brand;
  const price = searchParams.price;
  const range = searchParams.range;
  const sort = searchParams.sort ?? "recent";

  const where: Record<string, unknown> = { active: true };
  if (cat && cat !== "all") where.category = cat;
  if (sub && sub !== "all") where.subcategory = sub;
  if (brand && brand !== "all") where.brand = brand;

  if (price && price !== "all") {
    if (price === "0-500") where.price = { lte: 500 };
    else if (price === "500-1000") where.price = { gte: 500, lte: 1000 };
    else if (price === "1000+") where.price = { gte: 1000 };
  }
  if (range && range !== "all") where.range = { gte: Number(range) };

  const orderBy: Record<string, "asc" | "desc"> =
    sort === "price-asc" ? { price: "asc" }
      : sort === "price-desc" ? { price: "desc" }
      : sort === "name" ? { name: "asc" }
      : { createdAt: "desc" };

  const [products, allBrands, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" } } },
      orderBy,
    }),
    prisma.product.findMany({
      where: { active: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    }),
    getCategoryTree(),
  ]);

  const brandList = Array.from(new Set(allBrands.map((b) => b.brand!).filter(Boolean))).sort();

  const catNode = catFromParams(searchParams, categories);
  const copy = catNode ? CATEGORY_COPY[catNode.slug] : undefined;
  const h1 = catNode ? catNode.name : "Tienda de Patinetes Eléctricos";
  const intro = catNode
    ? copy?.intro ??
      `${catNode.name} preparados y probados por el equipo del taller antes de la entrega. Envío 24-48h a toda España y garantía de 3 años.`
    : "Patinetes eléctricos homologados DGT y vehículos de movilidad eléctrica de las mejores marcas, montados, configurados y entregados por el equipo del taller.";

  // ItemList del listado visible (hasta 24) para reforzar el rastreo de fichas.
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.slice(0, 24).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/tienda/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <JsonLd data={[itemList]} />
      <section className="container-custom pt-12 pb-8">
        <p className="eyebrow mb-3">★ NUESTRA SELECCIÓN ★</p>
        <h1 className="display-xl">{h1}</h1>
        <p className="mt-3 text-text-secondary max-w-xl">{intro}</p>
      </section>

      <Filters brands={brandList} categories={categories} />

      <section className="container-custom py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="display-md text-text-muted">No hay productos</p>
            <p className="mt-3 text-text-secondary">Cambia los filtros para ver más resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Bloque editorial SEO: solo en /tienda y en categorías limpias, nunca
          en combinaciones de filtros (evita repetir el texto en URLs canonicalizadas). */}
      {(!catNode || isCleanCategoryUrl(searchParams)) && (
        <section className="container-custom pb-16">
          <div className="max-w-3xl border-t border-border pt-10 space-y-6 text-text-secondary leading-relaxed text-sm">
            {catNode ? (
              <>
                <h2 className="font-display text-2xl tracking-wider text-white">
                  {catNode.name} con la tranquilidad del taller
                </h2>
                <p>
                  Todos los vehículos de esta categoría pasan por nuestro taller de Tarragona antes del
                  envío: se montan, se revisan y se prueban. Compra online con envío en 24-48 horas a toda
                  España peninsular, paga de forma segura y, si algo falla, respondemos con{" "}
                  <Link href="/reparaciones" className="text-accent-orange hover:underline">
                    servicio técnico propio
                  </Link>{" "}
                  y garantía de 3 años.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl tracking-wider text-white">
                  Comprar un patinete eléctrico con la tranquilidad de un taller detrás
                </h2>
                <p>
                  En nuestra tienda de patinetes eléctricos no vendemos cajas: cada patinete se monta, se
                  configura y se prueba en el taller de Tarragona antes de salir hacia tu casa. Trabajamos
                  con marcas de referencia como Xiaomi, Segway, SmartGyro, Dualtron o Ecoxtrem, con envío
                  en 24-48 horas a toda España peninsular y garantía de 3 años con servicio técnico propio.
                </p>
                <h3 className="font-semibold text-white">¿Buscas un patinete eléctrico homologado DGT?</h3>
                <p>
                  Desde enero de 2024 los patinetes nuevos deben contar con certificado VMP para
                  comercializarse, y a partir de 2027 será imprescindible para circular. En el catálogo
                  encontrarás modelos homologados listos para cumplir la normativa; si tienes dudas,
                  nuestra guía de{" "}
                  <Link href="/blog/patinetes-homologados-dgt-certificado-vmp" className="text-accent-orange hover:underline">
                    patinetes homologados DGT
                  </Link>{" "}
                  y la{" "}
                  <Link href="/blog/normativa-patinetes-electricos-2026" className="text-accent-orange hover:underline">
                    normativa de patinetes eléctricos 2026
                  </Link>{" "}
                  te lo explican sin rodeos.
                </p>
                <h3 className="font-semibold text-white">¿Qué patinete eléctrico comprar?</h3>
                <p>
                  Depende de tu uso: para ciudad, un modelo ligero y plegable de 350-500 W es suficiente;
                  para trayectos largos o cuestas, busca 800-1000 W y una batería de más autonomía. Si no
                  lo tienes claro, empieza por la guía{" "}
                  <Link href="/blog/que-patinete-electrico-comprar-2026" className="text-accent-orange hover:underline">
                    qué patinete eléctrico comprar en 2026
                  </Link>{" "}
                  o pregúntanos por WhatsApp: asesoramos según tu peso, recorrido y presupuesto, no según
                  el stock que haya que sacar.
                </p>
                <p>
                  Además de patinetes eléctricos también preparamos bicicletas eléctricas, pit bikes,
                  quads infantiles y motos eléctricas, siempre con el mismo criterio de taller: revisado,
                  ajustado y probado antes de entregar.
                </p>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
