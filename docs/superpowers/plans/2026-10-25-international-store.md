# International Store Implementation Plan

**Goal:** Publish complete French, Italian and Portuguese commerce flows backed by the existing Monkey catalogue and Payment Links.

**Architecture:** Keep Spanish routes and operations, introduce server-rendered locale routes with shared data access and localized presentation. Use separate root layouts or another SSR-safe mechanism for html lang without forcing all Spanish routes dynamic. Static translation dictionaries never replace live prices, stock or payment links.

**Tech Stack:** Existing Next.js 14 / React 18 / Prisma / TypeScript. No new runtime translation or commerce service.

**Spec:** ../specs/2026-10-25-international-store-design.md

## Global Constraints

- Preserve existing product records, stock, prices, references and original Payment Link identifiers; no Stripe mutation, real charges, messages, migrations or secrets in output.
- User confirmed: use existing conditions for each payment link; no invented international tariffs, delivery times, tax rules or guarantees.
- /fr, /it, /pt SSR text and html lang; preserve Spanish URL paths and existing editorial blog.
- Avoid heavy local builds. Use existing dependencies and public-only isolated catalogue fixture; cloud build must not migrate the live database.
- Preserve both historical working copies. Final publication requires successful tests, independent review and public verification.

## Review Focus

- A user switches language from a filtered category/product and remains on the corresponding route with useful state.
- Invalid locale, unknown/inactive product, negative/excessive page or malformed filter cannot produce an indexable false page or expensive unbounded query.
- Zero-stock, missing payment link and declined consent cannot initiate a purchase. No multi-product total is advertised when payment remains per item.
- Product translations preserve all technical numbers/warnings and never change commerce fields. Changed source text is recognized as requiring translation refresh.
- Sitemap, canonical and hreflang must agree for every eligible language group; search, cart and checkout remain noindex.

## Work streams

### 1. Storefront implementation

- [ ] Add failing behavioral tests for locale URLs/metadata, query validation/pagination and checkout eligibility.
- [ ] Implement locale dictionaries, SSR layouts, navigation/language switcher, localized home/catalogue/detail/contact/about/service/legal support.
- [ ] Share the existing Prisma catalogue with compact card queries and 24-item pagination; preserve active/stock behavior and direct purchase links.
- [ ] Replace obsolete cart exposure with truthful per-product purchase guidance, noindex.
- [ ] Integrate product translation maps described below, excluding stale/missing translations from indexing.
- [ ] Add reciprocal SEO/sitemap and shorten Spanish affected template titles; preserve existing tests and noindex rules.
- [ ] Make normal build code-only by removing automatic migration invocation; retain explicit migration script.
- [ ] Run focused tests and TypeScript, write implementation report and commit.

### 2. Editorial catalogue localization (independent data files)

- [ ] Translate the public snapshot's 120 active product short/full descriptions faithfully into fr, it, pt, preserving brand/model/SKU and numerical specifications.
- [ ] Files: src/content/products.fr.json, products.it.json, products.pt.json. Contract: object keyed by product id, value { sourceHash, name, shortDesc, description }. sourceHash = SHA256(JSON.stringify([product.name,product.shortDesc,product.description])) using UTF-8. Do not include price, stock, links or private data.
- [ ] Mark legal/technical source ambiguities in an external editorial report; do not silently rewrite supplied guarantees/specifications.
- [ ] Validate coverage, JSON shape, source hashes, no empty text and numbers/references preservation; do not repeat boilerplate in place of details.

### 3. Integrated verification and release

- [ ] Review the full diff against spec and address concrete defects.
- [ ] Cloud preview build, then browser mobile/desktop QA using public-only fixture or preview; verify no real writes/payments.
- [ ] Check catalogue prices/stock/links and translation coverage; all language groups, 404 and noindex behavior; compare /tienda HTML before/after.
- [ ] Publish to main, confirm GitHub SHA = production deployment SHA and live routes.
- [ ] Submit eligible URLs with the existing IndexNow mechanism and record exact receipt separately from indexation.
- [ ] Write concise outcome and operational/legal limits with evidence.
