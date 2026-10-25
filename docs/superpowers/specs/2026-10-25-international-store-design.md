# Monopatín Monkey: French, Italian and Portuguese storefronts

## Authorized outcome

Andrés requested complete /fr, /it and /pt storefronts to sell the existing catalogue, SEO improvements, publication to GitHub and Vercel, and submission of eligible URLs through existing indexing mechanisms. He explicitly chose: **Usar las condiciones actuales de cada enlace de pago**. This document records that supplied scope; it does not request a new approval.

## Verified baseline

- Andreh33/monkey main and production monopatinmonkey.com both use 03e528aed427eea5f3a6144273c7747efe7636f2 (17 October 2026).
- The F: migrated checkout is de79e8b; the H: campaign checkout is a12d27a. Preserve both. Work happens in H:/Proyectos/monkey-i18n-20261025, branch codex/monkey-i18n-20261025.
- Next.js 14.2.15, React 18, Prisma/libSQL, existing Stripe Payment Links per product. No integrated multi-product checkout or verified automatic order/stock synchronization.
- Public catalogue snapshot: 120 active products, three with stock <= 0. Same underlying records, prices, stock, images, references and payment links must serve every language.
- One live Payment Link offers FR/IT/PT; its shipping time differs from marketing copy. This is not evidence about every product. Each existing payment link remains authoritative for its available destinations, methods, shipping costs and final total. No new countries, prices, tax rules, guarantees or Stripe settings.
- Bing 24 October: 180 crawled pages, zero Errors, 127 long titles, /tienda HTML 1,788,011 uncompressed bytes. This is not indexation or compressed transfer size.

## Experience and content

Preserve the established dark/orange visual identity. Provide localized home, catalogue/categories, product details, filters/search, navigation, contact/about, purchase conditions, legal/privacy/cookie information, and clear direct-payment checkout guidance. Spanish URLs remain stable. The Spanish editorial blog may remain Spanish with an explicit language label; do not mass-produce translated blog articles. Local workshop/registration services must remain described as Spanish/Tarragona services.

Product names keep brands and model/reference strings. Translate generic descriptors, short descriptions and full technical descriptions faithfully. Preserve measurements, warnings, compatibility and product-specific warranty wording; do not claim foreign road approval from DGT certification. Shared structured values retain their numerical value, currency and record identity. Translation files are presentation data, not replacement product/stock/order records.

The existing active purchase route is direct Payment Link, with prior consent to purchase/privacy conditions. Preserve it. Do not activate the obsolete cart which invents 9.95 EUR shipping and forwards only the first item. Localized cart/checkout routes should clearly guide users to individual product purchases and remain noindex. Zero-stock/inactive products must not offer an active purchase action. A missing or invalid payment link offers a localized error/contact path. Do not simulate an integrated checkout or change Stripe link identifiers.

User-approved delivery copy: available destinations, applicable delivery options, shipping cost and final total are shown in the existing payment page; check them before payment. Do not promise international delivery times. Faithfully translate existing legal documents, documenting existing contradictions/outdated provisions for later review instead of inventing new conditions.

## SEO and performance

- Real server-rendered localized text and html lang; no client-only text substitution.
- Own canonical and reciprocal es/fr/it/pt hreflang plus x-default for genuinely equivalent public pages.
- Per-language concise titles and descriptions; control the brand suffix so titles stay below Bing's 70-character threshold where identity permits, without corrupting model numbers.
- Sitemap contains only eligible public canonical pages and corresponding alternates. Exclude internal search/filter combinations, cart, checkout, auth/account/admin/API/private routes.
- Paginate the catalogue server-side (24 products per page) with crawlable links, stable ordering, valid filter state, bounded input and lean card projections. Do not serialize full product descriptions/images into list cards. Preserve navigability to every product.
- Search and filter combinations are noindex, follow; clean existing category pages remain eligible. Pagination uses its own canonical and preserves page/language/category.
- Products missing faithful localization after later source changes must not silently publish stale specifications as translated facts; document the maintenance path and use an explicit source-language fallback/noindex until refreshed.

## Validation and release

Use lightweight tests/TypeScript checks and an isolated local development database containing only public catalogue data. Do not run repository build scripts locally: build currently invokes a Turso migration. Remove automatic migration from the deployment build for this code-only release; keep the explicit migration command available. No schema change or database migration is needed.

Run a cloud preview build before production. Test mobile and desktop routing, menus, language switching, filters/pagination/search, unavailable products, conditions checkbox, and direct checkout handoff without real payment or contacting anyone. Compare prices/stock/references to Spanish and the snapshot. Test reciprocal hreflang, sitemap eligibility, noindex and unknown-route 404s. Preserve the existing nine baseline tests.

Publish the reviewed commit to main with no force push, verify GitHub and Vercel production agree, then verify public routes and HTML size. Submit only eligible verified URLs through the existing IndexNow key. Respect quotas and stop for any CAPTCHA. Receipt is not indexation. Report commercial limits and remaining legal/translation maintenance explicitly.
