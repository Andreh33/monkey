import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCheckoutQuote, checkoutQuoteSchema } from '../src/lib/checkout';

const product = {id:'p',slug:'p',name:'Product',price:200.01,currency:'EUR',shippingCost:50,active:true,stock:5,images:[{url:'/p.jpg'}]};
test('monkeymotion subtracts 12 euros once above 200 euros of products, without discounting shipping',()=>{
  const q=buildCheckoutQuote([{productId:'p',quantity:1}],[product],'ES',undefined,' MONKEYMOTION ');
  assert.equal(q.subtotalCents,20001);assert.equal(q.shippingCents,5000);
  assert.equal(q.discountCents,1200);assert.equal(q.promoCode,'monkeymotion');assert.equal(q.totalCents,23801);
  const multiple=buildCheckoutQuote([{productId:'p',quantity:3}],[{...product,price:100}],'ES',undefined,'monkeymotion');
  assert.equal(multiple.discountCents,1200);assert.equal(multiple.totalCents,43800);
});
test('threshold is strictly above 200 before shipping; invalid codes cannot change the amount',()=>{
  for(const price of [199.99,200]) assert.throws(()=>buildCheckoutQuote([{productId:'p',quantity:1}],[{...product,price}],'ES',undefined,'monkeymotion'),(e:any)=>e.code==='PROMO_MINIMUM');
  assert.throws(()=>buildCheckoutQuote([{productId:'p',quantity:1}],[product],'ES',undefined,'fake'),(e:any)=>e.code==='INVALID_PROMO_CODE');
  assert.equal(buildCheckoutQuote([{productId:'p',quantity:1}],[product],'ES').totalCents,25001);
  assert.equal(checkoutQuoteSchema.safeParse({items:[{productId:'p',quantity:1}],country:'ES',promoCode:'monkeymotion'}).success,true);
  assert.equal(checkoutQuoteSchema.safeParse({items:[{productId:'p',quantity:1}],country:'ES',discountCents:5000}).success,false);
});
