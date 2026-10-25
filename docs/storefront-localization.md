# Storefront localization

Spanish URLs remain unchanged. French, Italian and European Portuguese use
`/fr`, `/it` and `/pt`, preserving product slugs and catalogue query parameters.
Each locale reads the same live products, prices, stock, images and Stripe links.
Translation files contain presentation text only.

## Updating product translations

`src/content/products.{fr,it,pt}.json` maps product IDs to `name`, `shortDesc`,
`description` and `sourceHash`. The hash is the UTF-8 SHA-256 of
`JSON.stringify([product.name, product.shortDesc, product.description])` using
the current Spanish source, without normalizing whitespace or punctuation.

After changing those source fields in the administration panel, review and
translate the complete text in each language, preserving specifications,
model references, warnings, compatibility and product-specific conditions.
Recompute the hash only after reviewing the translation. Never copy stock,
prices, payment links or order records into the translation files.

A missing, incomplete or stale translation displays the Spanish source with
an explicit notice and `lang="es"`. That product's translated URL becomes
`noindex` and is excluded from hreflang and the sitemap until refreshed.
Changes to prices or stock do not invalidate editorial translations.

`src/content/product-titles.json` contains concise search titles for unusually
long product names. The visible name and complete description are preserved.
An exact `sourceName` check invalidates a title after a product is renamed;
review all four titles before updating that source name. Never shorten a title
by cutting a model number in half.

## Legal and service content

`src/content/legal.{fr,it,pt}.json` contains the complete translated legal
documents as Markdown. Internal links are mapped to the selected locale.
Translations preserve the source documents dated 16 June 2026; translating
them is not a new legal review. Existing inconsistencies in return, warranty
and dispute-resolution wording require review of the original policy first.

The blog remains in Spanish. Workshop and registration pages clearly describe
services in Tarragona/Spain and link to the existing Spanish service forms.
Vehicle certification for Spain must not be presented as approval elsewhere.

## Checkout and deployment

Each available product opens its original Stripe Payment Link after acceptance
of purchase/privacy conditions. Destinations, shipping options, shipping cost
and the final total are determined by that payment page. Do not invent an
international tariff or promise a delivery time. The cart/checkout routes are
noindex guides to individual purchases, not a multi-item payment integration.
This release does not add automatic order or inventory synchronization.

Normal builds run `prisma generate && next build` in both package.json and
vercel.json. Database migration remains an explicit, separate operation through
`npm run db:migrate:turso`; it is unnecessary for localization.

Before a release, run the storefront, SEO and registration tests and TypeScript
checks, then build a Vercel preview. Verify mobile/desktop routes, full editorial
coverage, canonical/hreflang/sitemap agreement and stock/consent gating without
real payments or contact submissions. Publish the reviewed commit and verify
the production SHA before submitting eligible URLs to IndexNow. Submission
acceptance is not evidence that a search engine has indexed a URL.
