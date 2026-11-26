import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureRegistrationShipping } from '../scripts/setup-registration-shipping-20261126.mjs';

const url = 'https://buy.stripe.com/dRmaEQglcaWccx0fdffw41A';
function fixture({ amount = 1950, countries = ['ES', 'FR'], existingRate = false } = {}) {
  const calls = [];
  const rate = { id: 'shr_registration', active: true, fixed_amount: { amount: 495, currency: 'eur' }, tax_behavior: 'inclusive' };
  const stripe = {
    paymentLinks: {
      async *list() {
        yield { id: 'plink_other', url: 'https://buy.stripe.com/other' };
        yield { id: 'plink_registration', url, active: true, livemode: true,
          shipping_address_collection: countries ? { allowed_countries: countries } : null,
          shipping_options: existingRate ? [{ shipping_rate: rate.id }] : [] };
      },
      async listLineItems(id) {
        assert.equal(id, 'plink_registration');
        return { has_more: false, data: [{ quantity: 1, price: { unit_amount: amount, currency: 'eur' }, amount_total: amount }] };
      },
      async update(id, params) { calls.push({ id, params }); return { shipping_options: [{ shipping_amount: 495 }] }; },
    },
    shippingRates: {
      async retrieve() { return rate; },
      async create(params) { calls.push({ createRate: params }); return rate; },
    },
  };
  return { stripe, calls };
}

test('charges 495 cents only on the registration link and preserves destinations', async () => {
  const { stripe, calls } = fixture();
  assert.equal((await ensureRegistrationShipping(stripe, url)).totalCents, 2445);
  assert.equal(calls[0].createRate.fixed_amount.amount, 495);
  assert.equal(calls[0].createRate.tax_behavior, 'inclusive');
  assert.deepEqual(calls[1], { id: 'plink_registration', params: {
    shipping_options: [{ shipping_rate: 'shr_registration' }],
    shipping_address_collection: { allowed_countries: ['ES', 'FR'] },
  } });
});

test('reuses the shipping rate on retry and collects an address when none was configured', async () => {
  const { stripe, calls } = fixture({ existingRate: true, countries: null });
  await ensureRegistrationShipping(stripe, url);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].params.shipping_address_collection.allowed_countries, ['ES']);
});

test('does not modify Stripe if the payment link or service price differs', async () => {
  const { stripe, calls } = fixture({ amount: 2000 });
  await assert.rejects(ensureRegistrationShipping(stripe, 'https://buy.stripe.com/other'));
  await assert.rejects(ensureRegistrationShipping(stripe, url));
  assert.equal(calls.length, 0);
});
