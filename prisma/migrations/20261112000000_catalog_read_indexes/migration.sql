CREATE INDEX IF NOT EXISTS "ProductImage_productId_order_idx" ON "ProductImage"("productId", "order");
CREATE INDEX IF NOT EXISTS "Product_active_createdAt_id_idx" ON "Product"("active", "createdAt" DESC, "id");
CREATE INDEX IF NOT EXISTS "Product_active_category_createdAt_id_idx" ON "Product"("active", "category", "createdAt" DESC, "id");
CREATE INDEX IF NOT EXISTS "Product_active_category_featured_createdAt_idx" ON "Product"("active", "category", "featured" DESC, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Product_active_category_subcategory_idx" ON "Product"("active", "category", "subcategory");
CREATE INDEX IF NOT EXISTS "Product_active_brand_idx" ON "Product"("active", "brand");
CREATE INDEX IF NOT EXISTS "Product_active_price_id_idx" ON "Product"("active", "price", "id");
CREATE INDEX IF NOT EXISTS "Product_active_name_id_idx" ON "Product"("active", "name", "id");
CREATE INDEX IF NOT EXISTS "Order_status_paidAt_id_idx" ON "Order"("status", "paidAt", "id");
