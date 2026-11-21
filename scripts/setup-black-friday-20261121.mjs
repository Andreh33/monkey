import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';
import Stripe from 'stripe';

const promotion=JSON.parse(await readFile(new URL('../src/config/black-friday.json',import.meta.url),'utf8'));
const migration='20261121000000_order_promotion';
export async function migrateOrderPromotion(client) {
  const tx=await client.transaction('write');
  try {
    await tx.execute('CREATE TABLE IF NOT EXISTS _app_migrations (name TEXT PRIMARY KEY,applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    if((await tx.execute({sql:'SELECT name FROM _app_migrations WHERE name=?',args:[migration]})).rows.length) {await tx.commit();return 'already-applied';}
    await tx.executeMultiple(await readFile(new URL(`../prisma/migrations/${migration}/migration.sql`,import.meta.url),'utf8'));
    await tx.execute({sql:'INSERT INTO _app_migrations(name) VALUES(?)',args:[migration]});
    await tx.commit();return 'applied';
  } catch(error) {if(!tx.closed) await tx.rollback();throw error;}
  finally {tx.close();}
}
export async function ensureBlackFridayCoupon(stripe) {
  let coupon;
  try {coupon=await stripe.coupons.retrieve(promotion.stripeCouponId);}
  catch(error) {
    if(error.code!=='resource_missing') throw error;
    coupon=await stripe.coupons.create({id:promotion.stripeCouponId,name:'Black Friday · monkeymotion · 12 €',amount_off:promotion.discountCents,currency:'eur',duration:'once',metadata:{campaign:'monkey-black-friday-2026'}},{idempotencyKey:'monkey-black-friday-20261121-coupon'});
  }
  if(coupon.deleted||!coupon.valid||coupon.amount_off!==promotion.discountCents||coupon.currency!=='eur'||coupon.percent_off!=null||coupon.applies_to?.products?.length||coupon.duration!=='once') throw new Error('The Black Friday coupon does not match the reviewed offer.');
  return {id:coupon.id,amountOff:coupon.amount_off,currency:coupon.currency,valid:coupon.valid};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(!process.env.TURSO_DATABASE_URL) console.log('[black-friday] No production database configured; skipped.');
  else {
    const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
    try {
      if(promotion.active) {
        if(!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe is required for the advertised promotion.');
        console.log('[black-friday] coupon',await ensureBlackFridayCoupon(new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2026-10-28.endive',maxNetworkRetries:2,timeout:12000})));
      }
      console.log('[black-friday] orders',await migrateOrderPromotion(client));
    } catch(error) {console.error('[black-friday] Setup failed; deployment stopped.',error.message);process.exitCode=1;}
    finally {client.close();}
  }
}
