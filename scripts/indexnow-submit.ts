/**
 * IndexNow — notifica a Bing / IndexNow (y por extensión a buscadores y motores
 * que lo soportan) las URLs del sitio para acelerar su (re)indexación.
 *
 * Uso (TRAS desplegar, manualmente — NO se ejecuta en el build):
 *   npx tsx scripts/indexnow-submit.ts
 *
 * La clave está publicada en https://monopatinmonkey.com/<KEY>.txt
 */

const HOST = "monopatinmonkey.com";
const SITE_URL = `https://${HOST}`;
const KEY = "a07d64593cbc48b278d62f152c127758";
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

// Páginas fijas de respaldo (por si no se puede leer el sitemap en vivo).
const STATIC_PATHS = [
  "/",
  "/tienda",
  "/reparaciones",
  "/contacto",
  "/nosotros",
  "/aviso-legal",
  "/privacidad",
  "/cookies",
  "/condiciones-compra",
];

/** Obtiene la lista de URLs: intenta el sitemap.xml en vivo y completa con las fijas. */
async function getUrls(): Promise<string[]> {
  const urls = new Set<string>(STATIC_PATHS.map((p) => `${SITE_URL}${p}`));
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`, {
      headers: { "User-Agent": "indexnow-submit (monopatinmonkey.com)" },
    });
    if (res.ok) {
      const xml = await res.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        urls.add(m[1].trim());
      }
    } else {
      console.warn(`[indexnow] sitemap.xml respondió ${res.status}; uso lista estática.`);
    }
  } catch (err) {
    console.warn("[indexnow] no se pudo leer sitemap.xml; uso lista estática:", err);
  }
  return [...urls];
}

async function main() {
  const urlList = await getUrls();
  console.log(`[indexnow] enviando ${urlList.length} URLs a ${ENDPOINT}...`);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });

  const body = await res.text().catch(() => "");
  console.log(`[indexnow] respuesta: ${res.status} ${res.statusText}`);
  if (body) console.log(body);

  // 200 y 202 son éxito en IndexNow.
  if (res.status !== 200 && res.status !== 202) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[indexnow] error:", err);
  process.exit(1);
});
