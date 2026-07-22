# Search Console SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mejorar CTR e integridad canónica de MonopatinShop sin crear canibalización ni ejecutar migraciones.

**Architecture:** Las páginas legales conservan su componente y reciben metadata canónica estática. Las dos guías prioritarias conservan URL y H1, incorporan un `seoTitle` absoluto para controlar el SERP y se validan con pruebas Node ejecutadas por `tsx`.

**Tech Stack:** Next.js 14, TypeScript, Markdown/gray-matter, node:test, tsx.

## Global Constraints

- Trabajar solo en `/home/andreh/.codex-worktrees/seo-2026-07-22/monopatin`.
- No tocar Vercel ni incluir cambios del checkout principal.
- No ejecutar `npm run build`; usar `npx next build`.
- Publicar solo por GitHub tras todas las verificaciones.

---

### Task 1: Pruebas SEO en rojo

**Files:**
- Create: `tests/seo-pages.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: exports `metadata`, `generateMetadata` y `getPostBySlug`.
- Produces: comando `npm run test:seo`.

- [ ] **Step 1: Añadir el script**

Añadir `"test:seo": "tsx --test tests/seo-pages.test.ts"` a `scripts`.

- [ ] **Step 2: Escribir las pruebas**

La prueba debe importar metadata de las cuatro páginas legales y exigir canonical `/aviso-legal`, `/privacidad`, `/cookies` y `/condiciones-compra`. También debe llamar a `generateMetadata` para los slugs `edad-minima-patinete-electrico` y `donde-circular-patinete-electrico`, exigir `title.absolute`, descripciones de 120–155 caracteres y comprobar `updated === "2026-07-22"`.

- [ ] **Step 3: Verificar RED**

Run: `npx prisma generate && npm run test:seo`
Expected: FAIL porque faltan canonicals, `seoTitle` y fecha 2026-07-22.

- [ ] **Step 4: Commit**

Run: `git add package.json tests/seo-pages.test.ts && git commit -m test-seo-opportunities`.

### Task 2: Canonicals legales

**Files:**
- Modify: `src/app/aviso-legal/page.tsx`
- Modify: `src/app/privacidad/page.tsx`
- Modify: `src/app/cookies/page.tsx`
- Modify: `src/app/condiciones-compra/page.tsx`

- [ ] **Step 1: Implementar metadata tipada**

Importar `Metadata` y añadir `alternates: { canonical: "/ruta" }` en cada objeto existente, sin cambiar el contenido legal.

- [ ] **Step 2: Ejecutar prueba focalizada**

Run: `npm run test:seo`
Expected: las aserciones legales pasan; las de guías siguen fallando.

- [ ] **Step 3: Commit**

Run: `git add src/app/aviso-legal/page.tsx src/app/privacidad/page.tsx src/app/cookies/page.tsx src/app/condiciones-compra/page.tsx && git commit -m fix-legal-canonicals`.

### Task 3: Fragmentos de las guías prioritarias

**Files:**
- Modify: `src/lib/blog.ts`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `content/blog/edad-minima-patinete-electrico.md`
- Modify: `content/blog/donde-circular-patinete-electrico.md`

- [ ] **Step 1: Añadir `seoTitle`**

Añadir `seoTitle?: string` a `BlogFrontmatter`. En `generateMetadata`, usar `title: post.seoTitle ? { absolute: post.seoTitle } : post.title`; Open Graph y Twitter usan `post.seoTitle ?? post.title`.

- [ ] **Step 2: Actualizar edad mínima**

Usar `seoTitle: "Edad mínima del patinete eléctrico 2026 | MonopatinShop"`, descripción clara de DGT/ayuntamiento/Tarragona, `updated: "2026-07-22"` y un enlace contextual a `/patinetes-electricos-homologados-dgt`.

- [ ] **Step 3: Actualizar circulación**

Usar `seoTitle: "Patinete eléctrico: dónde circular en 2026 | MonopatinShop"`, descripción centrada en acera/carril bici/calzada, `updated: "2026-07-22"` y enlace contextual al catálogo homologado.

- [ ] **Step 4: Verificar GREEN**

Run: `npm run test:seo`
Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/lib/blog.ts src/app/blog/[slug]/page.tsx content/blog/edad-minima-patinete-electrico.md content/blog/donde-circular-patinete-electrico.md && git commit -m improve-high-impression-guides`.

### Task 4: Verificación y publicación

- [ ] **Step 1:** Run `npm run test:seo`.
- [ ] **Step 2:** Run `npx tsc --noEmit`; registrar solo fallos previos si persisten.
- [ ] **Step 3:** Run `npx next build`; Expected: exit 0 sin migración.
- [ ] **Step 4:** revisar `git diff HEAD~3..HEAD` y `git status --short`.
- [ ] **Step 5:** empujar la rama a `origin/main` solo si el remoto sigue en el commit base.
- [ ] **Step 6:** verificar URLs públicas, sitemap, canonical, H1 y JSON-LD; ejecutar `npx tsx scripts/indexnow-submit.ts`.
