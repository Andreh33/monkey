// Public catalog data only. Checkout, customer details and admin reads stay live.
export const CATALOG_CACHE_TAG = "monkey-public-catalog-v1";
export const catalogCacheOptions = { tags: [CATALOG_CACHE_TAG], revalidate: 300 };
