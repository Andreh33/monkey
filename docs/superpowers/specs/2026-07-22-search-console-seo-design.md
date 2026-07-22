# SEO de crecimiento basado en Search Console — diseño

**Fecha:** 2026-07-22  
**Sitio:** https://monopatinmonkey.com  
**Rama:** `codex/seo-2026-07-22-monopatin`

## Situación observada

En la comparación de Google Search Console del 7–20 de julio frente al 23 de junio–6 de julio, el sitio pasó de 64 a 141 clics y de 2.960 a 11.800 impresiones. El CTR bajó de 2,2 % a 1,2 % y la posición media pasó de 6,5 a 10,5 porque Google amplió el número de consultas en las que prueba el dominio.

El rastreo en producción devolvió 140 de 140 URLs con HTTP 200, un H1 por URL y 427 bloques JSON-LD válidos. Search Console muestra 108 URLs indexadas, 41 descubiertas sin indexar y 5 rastreadas sin indexar. El sitemap está correcto y contiene 140 URLs.

Las mayores oportunidades con demanda demostrada son las guías sobre edad mínima y lugares de circulación, además de las búsquedas comerciales y locales de Tarragona. Las cuatro páginas legales responden correctamente, pero no emiten canonical propio.

## Objetivo

Conservar las posiciones ganadoras y aumentar clics no branded mediante mejores fragmentos de resultado, canonicals completos y enlazado contextual hacia páginas comerciales, sin crear artículos que compitan con los existentes.

## Diseño aprobado

1. Añadir canonical autorreferente a aviso legal, privacidad, cookies y condiciones de compra.
2. Reescribir título SEO, descripción y extracto de las dos guías con más impresiones y CTR bajo; mantener el contenido útil y la URL.
3. Actualizar la fecha solo en esas dos guías y reforzar enlaces hacia normativa DGT, catálogo homologado y taller cuando sean contextualmente pertinentes.
4. Añadir pruebas SEO con el runner `tsx --test` para canonicals, longitudes de fragmento, fechas e integridad de las guías.
5. No añadir nuevos artículos en esta entrega: los datos favorecen mejorar URLs que ya reciben impresiones.
6. Tras publicar por GitHub, validar HTML, canonical, H1, JSON-LD y sitemap; enviar el sitemap y las URLs cambiadas mediante IndexNow.

## Restricciones

- Trabajo exclusivo en Linux remoto por SSH.
- No tocar Vercel ni publicar mediante Vercel CLI o API.
- No mezclar los cambios sin confirmar del directorio principal.
- No ejecutar `npm run build`, porque actualmente incluye una migración de Turso; usar `prisma generate` y `npx next build` para una compilación segura.
- No cambiar afirmaciones legales sin fuente oficial.
- No prometer una posición concreta: medir el resultado en Search Console.

## Verificación y publicación

Las pruebas SEO deben demostrar primero el fallo y después pasar. Se ejecutarán Prisma generate, pruebas SEO, TypeScript y una compilación segura. El diff se revisará por archivo; solo la rama aislada se enviará a `origin/main`.
