export type CheckoutLocale = "es" | "fr" | "it" | "pt";
export const CHECKOUT_COUNTRIES = ["ES", "AL", "DE", "AD", "AT", "BE", "BY", "BA", "BG", "VA", "HR", "DK", "SK", "SI", "EE", "FI", "FR", "GI", "GR", "GG", "HU", "IE", "IM", "IS", "AX", "FO", "IT", "JE", "XK", "LV", "LI", "LT", "LU", "MK", "MT", "MD", "MC", "ME", "NO", "NL", "PL", "PT", "GB", "CZ", "RO", "RU", "SM", "RS", "SE", "CH", "SJ", "UA"] as const;
export type CheckoutCountry = (typeof CHECKOUT_COUNTRIES)[number];
export type CheckoutPaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
export type CheckoutFulfillmentStatus = "UNFULFILLED" | "PREPARING" | "SHIPPED" | "DELIVERED";

export type CheckoutLineInput = { productId: string; quantity: number };
export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: CheckoutCountry;
};
export type CheckoutQuoteInput = {
  items: CheckoutLineInput[];
  country: CheckoutCountry;
  postalCode?: string;
};
export type CheckoutCreateInput = {
  items: CheckoutLineInput[];
  customer: CheckoutCustomer;
  checkoutToken: string;
  termsAccepted: true;
  locale: CheckoutLocale;
};
export type CheckoutQuoteItem = {
  productId: string;
  name: string;
  slug: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  shippingUnitCents: number;
  stock: number;
  image?: string;
};
export type CheckoutQuote = {
  items: CheckoutQuoteItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: "EUR";
  allowedCountries: CheckoutCountry[];
};
export type CheckoutCreateResult = { url: string; orderId: string };
export type CheckoutStatusResult = Omit<CheckoutQuote, "allowedCountries"> & {
  orderId: string;
  status: CheckoutPaymentStatus;
  paid: boolean;
  createdAt: string;
};
export type CheckoutErrorResult = { error: string; code: string; productId?: string; allowedCountries?: CheckoutCountry[] };
