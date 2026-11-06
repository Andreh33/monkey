// A first request rejected before reservation may safely use a fresh token.
// A retry may already have a reservation from an earlier ambiguous response.
const rejectedBeforeReservation = new Set([
  "INVALID_REQUEST", "INVALID_ORIGIN", "INVALID_CONTENT_TYPE", "REQUEST_TOO_LARGE",
  "INVALID_QUANTITY", "INVALID_CART", "UNSUPPORTED_DESTINATION", "INSUFFICIENT_STOCK",
  "PRODUCT_UNAVAILABLE", "INVALID_CATALOG_PRICE", "INVALID_SHIPPING_CONFIGURATION",
  "AMOUNT_TOO_LARGE", "MINIMUM_AMOUNT", "TOO_MANY_REQUESTS", "TOO_MANY_CHECKOUTS",
  "PAYMENT_NOT_CONFIGURED",
]);
export function checkoutAttemptCanReset(code: unknown, hasPreviousAttempt: boolean): boolean {
  if (code === "CHECKOUT_CHANGED" || code === "CHECKOUT_EXPIRED") return true;
  return !hasPreviousAttempt && typeof code === "string" && rejectedBeforeReservation.has(code);
}
