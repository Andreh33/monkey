import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createClient} from '@libsql/client';
import {migrateOrderPromotion,ensureBlackFridayCoupon} from '../scripts/setup-black-friday-20261121.mjs';

test('promotion migration preserves historical orders and runs once',async()=>{
 const client=createClient({url:pathToFileURL(path.join(mkdtempSync(path.join(tmpdir(),'monkey-promo-')),'test.db')).href});
 try {
  for(const folder of readdirSync('prisma/migrations').sort()) {
   const file=`prisma/migrations/${folder}/migration.sql`;
   if(folder<'20261121000000_order_promotion'&&existsSync(file)) await client.executeMultiple(readFileSync(file,'utf8'));
  }
  await client.execute("INSERT INTO 'Order'(id,email,status,total,items) VALUES('old','test@example.test','PAID',299,'[]')");
  const old=(await client.execute('SELECT * FROM "Order"')).rows[0];
  assert.equal(await migrateOrderPromotion(client),'applied');assert.equal(await migrateOrderPromotion(client),'already-applied');
  assert.deepEqual((await client.execute('SELECT * FROM "Order"')).rows[0],{...old,discountCents:0,promoCode:null});
 } finally {client.close();}
});
test('Stripe coupon setup validates fixed EUR amount and rejects incompatible coupons',async()=>{
 const good={id:'monkey_black_friday_2026_12eur',amount_off:1200,currency:'eur',duration:'once',valid:true,percent_off:null};
 let created;
 const stripe={coupons:{retrieve:async()=>{throw {code:'resource_missing'};},create:async params=>{created=params;return good;}}};
 assert.equal((await ensureBlackFridayCoupon(stripe)).amountOff,1200);
 assert.equal(created.amount_off,1200);assert.equal(created.currency,'eur');assert.equal(created.duration,'once');
 for(const difference of [{amount_off:12},{currency:'usd'},{valid:false},{percent_off:12},{applies_to:{products:['limited-product']}}]) {
  await assert.rejects(ensureBlackFridayCoupon({coupons:{retrieve:async()=>({...good,...difference})}}),/does not match/);
 }
});
