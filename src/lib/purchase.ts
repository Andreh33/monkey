export function purchaseEligible(
  product: { active: boolean; stock: number; stripeLink: string },
  consent: boolean,
) {
  if (!consent || !product.active || product.stock <= 0) return false;
  try {
    const url = new URL(product.stripeLink);
    return (
      url.protocol === "https:" &&
      url.hostname === "buy.stripe.com" &&
      url.pathname.length > 1 &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
