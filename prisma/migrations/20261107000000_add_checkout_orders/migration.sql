ALTER TABLE "Product" ADD COLUMN "shippingCountries" TEXT;
ALTER TABLE "Order" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Order" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Order" ADD COLUMN "phone" TEXT;
ALTER TABLE "Order" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "Order" ADD COLUMN "addressLine2" TEXT;
ALTER TABLE "Order" ADD COLUMN "city" TEXT;
ALTER TABLE "Order" ADD COLUMN "region" TEXT;
ALTER TABLE "Order" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "country" TEXT;
ALTER TABLE "Order" ADD COLUMN "subtotalCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "shippingCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "totalCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EUR';
ALTER TABLE "Order" ADD COLUMN "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED';
ALTER TABLE "Order" ADD COLUMN "checkoutTokenHash" TEXT;
ALTER TABLE "Order" ADD COLUMN "requestHash" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripeRequestEncrypted" TEXT;
ALTER TABLE "Order" ADD COLUMN "reservationOwnerHash" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripeLiveMode" BOOLEAN;
ALTER TABLE "Order" ADD COLUMN "stripeSessionId" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "expiresAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "reconciliationCheckedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "stockReleased" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "stockIssue" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'es';
CREATE UNIQUE INDEX "Order_checkoutTokenHash_key" ON "Order"("checkoutTokenHash");
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE INDEX "Order_status_expiresAt_idx" ON "Order"("status", "expiresAt");
CREATE INDEX "Order_reservationOwnerHash_status_idx" ON "Order"("reservationOwnerHash", "status");
CREATE TABLE "CheckoutEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "CheckoutEvent_orderId_idx" ON "CheckoutEvent"("orderId");
