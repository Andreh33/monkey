# Estudio SEO + Plan de Contenidos — MonopatinShop (Tarragona)

**Fecha:** 1 de julio de 2026
**Dominio:** https://monopatinmonkey.com
**Objetivo:** construir autoridad temática y capturar tráfico orgánico informacional/comercial para escalar posiciones (meta: top 1 en consultas locales y de nicho).

---

## 1. Auditoría técnica (estado de partida)

Base ya existente (correcta): `sitemap.ts` dinámico, `robots.ts` con permiso a bots de IA, JSON-LD `Store`/`LocalBusiness` + `Product` + `Breadcrumb`, metadata raíz, IndexNow y verificación de Search Console.

- **Indexación:** el sitio ya está indexado en Google (home, /tienda, /nosotros, /reparaciones y ~64 fichas de producto). Indexar **no** es el cuello de botella.
- **Descripciones "duplicadas" en SERP:** eran caché antigua de Google. En código, `/tienda`, `/nosotros`, `/reparaciones` ya tienen `title`+`description`+`canonical` únicos. Se resuelve al re-rastrear (IndexNow tras el deploy).
- **Hueco principal:** no había blog → 0 captación de búsquedas "cómo / por qué / cuál / normativa". Ahí está el grueso del volumen del nicho.

## 2. Competencia local (Tarragona)

Taller del Patinete, My Scooter Shop (Cambrils+Tarragona), Repair Mobility, patineteelectricotarragona.com, donderepararpatineteelectrico.com. Varios con blog y agrupados en Av. Ramón y Cajal. MonopatinShop está en C/ Jaume I, 5. Para ganar: **autoridad temática (blog)** + **señales locales** (Google Business Profile + reseñas — off-site, recomendado aparte).

## 3. Mapa de keywords (4 clusters)

- **Normativa DGT 2026** (caliente): matrícula, seguro obligatorio, casco, multas, certificado VMP.
- **Reparación / averías** (core del taller, intención local): no enciende, no carga, códigos de error, ruedas/pinchazos.
- **Mantenimiento / batería**: cuidar la batería, autonomía real, mantenimiento, vida útil.
- **Guías de compra** (comercial → tienda): qué comprar, mejores modelos, ciudad vs. larga distancia.

## 4. Estrategia

Modelo **pillar + cluster**. Cada artículo: ángulo local Tarragona + enlazado interno a `/tienda`, fichas de producto reales y `/reparaciones` + FAQ (schema `FAQPage`) + `BlogPosting`. Los pilares (normativa 2026 y guía de compra 2026) concentran enlaces internos. Palancas off-site recomendadas al cliente: Google Business Profile optimizado, reseñas, NAP consistente.

## 5. Implementación técnica (hecha en este proyecto)

- Contenido en **Markdown** (`content/blog/*.md`) + `gray-matter`; render con `react-markdown` (+`remark-gfm`, `rehype-slug`) y estilos `.article-prose`.
- Rutas: `/blog` (índice), `/blog/[slug]` (post, SSG), `/blog/categoria/[categoria]`.
- SEO: `generateMetadata` con canonical/OG por post; JSON-LD `BlogPosting`+`FAQPage`+`BreadcrumbList`; `Blog` schema en el índice; blog añadido a `sitemap.ts`; enlace "Blog" en navbar y footer.
- UX: índice de contenidos (anclas), FAQ `<details>`, productos relacionados reales (Prisma por slug), CTAs de conversión, compartir, "sigue leyendo".

---

## 6. GUÍA DE REDACCIÓN (obligatoria para cada artículo)

### Frontmatter YAML (claves exactas)

```yaml
---
title: "Titular H1 (50-65 car.), con la keyword principal y gancho. NO lo repitas como # en el cuerpo."
description: "Meta description 140-160 car., con la keyword y un CTA suave."
excerpt: "1-2 frases (160-220 car.) para la tarjeta y la cabecera del post."
category: normativa            # normativa | guias | reparacion | mantenimiento
date: "2026-06-XX"             # la que se indica en el brief del artículo
updated: "2026-07-01"
author: "Equipo MonopatinShop"
featured: false               # true solo si el brief lo indica
keywords: ["keyword principal", "secundaria 1", "secundaria 2", "..."]   # 5-8
relatedProducts: ["slug-real-1", "slug-real-2", "slug-real-3"]          # SOLO de la lista de slugs reales
faqs:
  - q: "Pregunta real de usuario"
    a: "Respuesta útil y directa de 40-90 palabras."
  # 5-6 FAQs en total
---
```

### Reglas del cuerpo (Markdown)

1. **≥ 3.500 palabras reales** de cuerpo (objetivo 3.600-4.300). Contenido con sustancia, cero relleno.
2. Empieza con **2-3 párrafos de introducción** (keyword principal en las primeras ~100 palabras) **antes** del primer `##`. **No** pongas `#` (H1) en el cuerpo.
3. Estructura con `##` (H2) y `###` (H3). **Encabezados en texto plano** (sin negrita, enlaces ni código dentro) para que funcionen las anclas del índice. 8-14 secciones H2.
4. Usa **listas**, **tablas comparativas** (GFM) y **negritas** para escaneo. Incluye al menos una tabla cuando aporte (normativa, guías, comparativas).
5. **Tono:** español de España, de "tú", cercano y experto, con criterio de taller real. Directo, sin paja.
6. **E-E-A-T:** escribe como el equipo técnico de un taller de Tarragona con experiencia. Detalle concreto y correcto (síntomas, pasos, cifras aproximadas). **No inventes** datos, precios ni estadísticas. En temas legales, cíñete a los HECHOS DGT de abajo y recomienda verificar en dgt.es y el ayuntamiento.
7. **Ángulo local:** menciona Tarragona y el servicio de MonopatinShop de forma natural 2-4 veces (no forzado).
8. **Enlaces internos (clave SEO):** integra de forma natural, con ancla descriptiva, los enlaces de "Enlaces obligatorios" del brief. Formato `[ancla descriptiva](/ruta)`. Enlaza a **fichas de producto reales solo con los slugs dados**. Añade 1-2 enlaces a **otros artículos** del blog (lista de slugs abajo). Nada de "haz clic aquí".
9. **CTA:** cierra con un párrafo que invite a la acción (taller o tienda). El banner visual lo pone la plantilla; en el texto basta una llamada natural.
10. **No** incluyas sección "Preguntas frecuentes" en el cuerpo (va en `faqs` del frontmatter). **No** uses imágenes, HTML crudo ni JSX. Solo Markdown + tablas GFM.
11. Devuelve **solo una línea de confirmación** (slug, nº de palabras, enlaces internos usados). **No** pegues el artículo en la respuesta.

### Datos de marca (para no inventar)

- **MonopatinShop** (Monkeymotion SL). Taller y tienda propios en **C/ Jaume I, 5, 43005 Tarragona**.
- Teléfonos **643 27 47 56** / **616 686 593**. WhatsApp **+34 616 686 593**. Horario **L-V 10-20h, S 11-15h**.
- Propuesta: venta + reparación de **todas las marcas**; **diagnóstico gratis** si reparas con ellos; presupuesto sin compromiso; piezas originales o equivalentes; **garantía** sobre la reparación; patinetes montados, configurados y probados; **envío 24-48h** península; **garantía 3 años** en producto.
- Marcas: Xiaomi, Segway/Ninebot, Dualtron, Cecotec, Smartgyro, Inokim, Kugoo, etc.

### HECHOS normativa DGT 2026 (base verificada; recuerda recomendar verificar en dgt.es)

- Desde 2026 los VMP deben: **inscribirse en el registro de la DGT**, llevar **identificador/"matrícula"** (etiqueta con código alfanumérico que empieza por "M", en la parte trasera) y **seguro de responsabilidad civil obligatorio**.
- **Casco:** la normativa lo establece como obligatorio para VMP.
- Para ser legal, el VMP debe estar **limitado de fábrica a 25 km/h** (no modificable) y tener **potencia nominal ≤ 1.000 W**, cumpliendo el **certificado VMP** de la DGT.
- Certificado VMP obligatorio en la venta desde **22/01/2024**; desde **22/01/2027** solo podrán circular los que lo tengan.
- Seguro: primas orientativas **~20-100 €/año**. Multas por incumplimiento: **~200-1.000 €** según la infracción.
- No se circula por acera; sí por carril bici/calzada urbana según ordenanza. Alcohol/móvil/auriculares sancionables. (Detalles de trámite y precios pueden variar → verificar en fuentes oficiales.)

### Slugs de producto REALES (usa solo estos en `relatedProducts` y enlaces a fichas)

Patinetes: `xiaomi-electric-scooter-4-pro`, `segway-ninebot-max-g2`, `cecotec-bongo-serie-a-advance`, `smartgyro-speedway-v3-max`, `patinete-electrico-smartgyro-crossover-dual-max-2-lr`, `dualtron-mini-limited`, `inokim-light-2`, `patinete-electrico-bison-gt-carbon-design-40km-autonomia`, `patinete-electrico-bison-homologado-dgt`, `patinete-electrico-etric-vortex`, `patinete-electrico-linear-350w`, `ecoxtrem-m41-tank-model-2025-homologado-dgt`, `ecoxtrem-m41-tank-dual-motor-model-2025-homologado-dgt`, `m41-armored-one-patinete-electrico-2026-model`, `m41-armored-patinete-electrico-2000w-peak-power-60v-20ah-frenos-nutt`.
Homologados DGT: `patinete-electrico-bison-homologado-dgt`, `ecoxtrem-m41-tank-model-2025-homologado-dgt`, `ecoxtrem-m41-tank-dual-motor-model-2025-homologado-dgt`.
Accesorios: `casco-integral-ecoxtreme-ideal-para-patinete-electrico-moto-o-enduro`, `camara-de-aire-9065-6-5-vc-90x90-black-cat`.
Movilidad reducida: `triciclo-electrico-500w-para-movilidad-reducida`, `triciclo-electrico-t3-para-movilidad-reducida`.

### Rutas internas fijas

`/` · `/tienda` · `/reparaciones` · `/contacto` · `/nosotros` · `/blog` · categorías `/blog/categoria/normativa|guias|reparacion|mantenimiento` · fichas `/tienda/<slug>`.

### Los 15 slugs del blog (para enlazar entre artículos)

`normativa-patinetes-electricos-2026`, `que-patinete-electrico-comprar-2026`, `seguro-patinete-electrico-obligatorio-2026`, `como-matricular-patinete-electrico-dgt`, `patinetes-homologados-dgt-certificado-vmp`, `mejores-patinetes-electricos-2026`, `patinete-electrico-no-enciende`, `patinete-electrico-no-carga`, `codigos-error-patinete-xiaomi`, `cambiar-rueda-patinete-electrico-pinchazo`, `patinete-electrico-ciudad-vs-larga-distancia`, `cuidar-bateria-patinete-electrico`, `autonomia-real-patinete-electrico`, `mantenimiento-patinete-electrico-guia`, `cuanto-dura-patinete-electrico-vida-util`.

---

## 7. Los 15 artículos (briefs)

| # | Slug | Categoría | Keyword principal | Fecha | Destacado | Fichas a enlazar |
|---|------|-----------|-------------------|-------|-----------|------------------|
| 1 | normativa-patinetes-electricos-2026 | normativa | normativa patinetes eléctricos 2026 | 2026-07-01 | ✅ | bison-homologado-dgt, ecoxtrem-m41-tank-model-2025-homologado-dgt, casco-integral-ecoxtreme… |
| 2 | que-patinete-electrico-comprar-2026 | guias | qué patinete eléctrico comprar 2026 | 2026-06-30 | ✅ | xiaomi-4-pro, segway-ninebot-max-g2, cecotec-bongo-serie-a-advance, bison-homologado-dgt |
| 3 | seguro-patinete-electrico-obligatorio-2026 | normativa | seguro patinete eléctrico obligatorio | 2026-06-28 | | bison-homologado-dgt, ecoxtrem-m41-tank-model-2025-homologado-dgt |
| 4 | como-matricular-patinete-electrico-dgt | normativa | matricular patinete eléctrico DGT | 2026-06-26 | | bison-homologado-dgt, ecoxtrem-m41-tank-dual-motor-model-2025-homologado-dgt |
| 5 | patinetes-homologados-dgt-certificado-vmp | normativa | patinetes homologados DGT / certificado VMP | 2026-06-24 | | bison-homologado-dgt, ecoxtrem-m41-tank-model-2025-homologado-dgt, m41-armored-one… |
| 6 | mejores-patinetes-electricos-2026 | guias | mejores patinetes eléctricos 2026 | 2026-06-23 | | segway-ninebot-max-g2, xiaomi-4-pro, dualtron-mini-limited, smartgyro-speedway-v3-max |
| 7 | patinete-electrico-no-enciende | reparacion | patinete eléctrico no enciende | 2026-06-21 | | xiaomi-4-pro (opcional) — CTA fuerte a /reparaciones |
| 8 | patinete-electrico-no-carga | reparacion | patinete eléctrico no carga | 2026-06-19 | | — CTA fuerte a /reparaciones |
| 9 | codigos-error-patinete-xiaomi | reparacion | error patinete Xiaomi | 2026-06-18 | | xiaomi-electric-scooter-4-pro |
| 10 | cambiar-rueda-patinete-electrico-pinchazo | reparacion | cambiar rueda patinete / pinchazo | 2026-06-16 | | camara-de-aire-9065-6-5-vc-90x90-black-cat, xiaomi-4-pro |
| 11 | patinete-electrico-ciudad-vs-larga-distancia | guias | patinete ciudad vs larga distancia | 2026-06-14 | | xiaomi-4-pro, dualtron-mini-limited, segway-ninebot-max-g2, smartgyro-crossover-dual-max-2-lr |
| 12 | cuidar-bateria-patinete-electrico | mantenimiento | cuidar batería patinete eléctrico | 2026-06-12 | | segway-ninebot-max-g2, xiaomi-4-pro |
| 13 | autonomia-real-patinete-electrico | mantenimiento | autonomía patinete eléctrico | 2026-06-10 | | segway-ninebot-max-g2, patinete-electrico-bison-gt-carbon-design-40km-autonomia, dualtron-mini-limited |
| 14 | mantenimiento-patinete-electrico-guia | mantenimiento | mantenimiento patinete eléctrico | 2026-06-09 | | xiaomi-4-pro — CTA a /reparaciones |
| 15 | cuanto-dura-patinete-electrico-vida-util | mantenimiento | cuánto dura un patinete eléctrico | 2026-06-07 | | segway-ninebot-max-g2, xiaomi-4-pro |

**Enlaces obligatorios por artículo:** cada uno enlaza a `/reparaciones` **o** `/tienda` (según intención), a sus fichas de producto (columna derecha), y a 1-2 artículos hermanos del blog. Los de normativa enlazan además entre sí y a la categoría `/blog/categoria/normativa`.

## 8. KPIs y hoja de ruta

- **Semana 1-2:** deploy + IndexNow + solicitar indexación de las URLs del blog en Search Console. Enlazar el pilar desde home/menú.
- **Mes 1-3:** medir impresiones/clics por artículo (Search Console). Ampliar clusters ganadores (2ª tanda de posts).
- **Off-site (cliente):** Google Business Profile al día, pedir reseñas, NAP consistente, alta en directorios locales.
- **Objetivo:** posicionar los pilares y las consultas locales ("patinete eléctrico Tarragona", "reparar patinete Tarragona") y de nicho informacional en top posiciones.
