export function purchaseEligible(
  product: { active: boolean; stock: number },
  consent = true,
) {
  return consent && product.active && Number.isFinite(product.stock) && product.stock > 0;
}
