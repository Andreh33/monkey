import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createClient } from '@libsql/client';
import Stripe from 'stripe';

const pricing = JSON.parse(await readFile(new URL('../src/config/registration-pricing.json', import.meta.url), 'utf8'));
const expectedUrl = 'https://buy.stripe.com/dRmaEQglcaWccx0fdffw41A';
const migration = '20261126000000_registration_shipping';

export async function ensureRegistrationShipping(stripe, paymentUrl) {
  if (paymentUrl !== expectedUrl) throw new Error('Registration payment link changed; refusing to modify a different link.');
  let link;
  for await (const candidate of stripe.paymentLinks.list({ limit: 100 })) {
    if (candidate.url === paymentUrl) { link = candidate; break; }
  }
  if (!link?.active || !link.livemode) throw new Error('Active live registration payment link not found.');
  const items = await stripe.paymentLinks.listLineItems(link.id, { limit: 100 });
  if (items.has_more || items.data.length !== 1 || items.data[0].quantity !== 1 ||
      items.data[0].price?.unit_amount !== pricing.serviceCents ||
      items.data[0].price?.currency !== pricing.currency || items.data[0].price?.recurring ||
      items.data[0].amount_total !== pricing.serviceCents) {
    throw new Error('Registration service amount does not match the reviewed 19.50 EUR price.');
  }
  let rate;
  for (const option of link.shipping_options) {
    const candidate = typeof option.shipping_rate === 'string'
      ? await stripe.shippingRates.retrieve(option.shipping_rate) : option.shipping_rate;
    if (candidate.active && candidate.fixed_amount?.amount === pricing.shippingCents &&
        candidate.fixed_amount.currency === pricing.currency && candidate.tax_behavior === 'inclusive') {
      rate = candidate; break;
    }
  }
  rate ??= await stripe.shippingRates.create({
    display_name: 'Gastos de envío · Matriculación', type: 'fixed_amount',
    fixed_amount: { amount: pricing.shippingCents, currency: pricing.currency },
    tax_behavior: 'inclusive', metadata: { purpose: 'registration-shipping-20261126' },
  }, { idempotencyKey: 'monkey-registration-shipping-495-20261126' });
  const countries = link.shipping_address_collection?.allowed_countries?.length
    ? link.shipping_address_collection.allowed_countries : ['ES'];
  const updated = await stripe.paymentLinks.update(link.id, {
    shipping_options: [{ shipping_rate: rate.id }],
    shipping_address_collection: { allowed_countries: countries },
  });
  if (updated.shipping_options.length !== 1 || updated.shipping_options[0].shipping_amount !== pricing.shippingCents) {
    throw new Error('Registration shipping verification failed.');
  }
  return { linkId: link.id, serviceCents: pricing.serviceCents, shippingCents: pricing.shippingCents, totalCents: pricing.serviceCents + pricing.shippingCents, countries };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.VERCEL_ENV !== 'production') console.log('[registration-shipping] Skipped outside production.');
  else {
    const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    try {
      const applied = await client.execute({ sql: 'SELECT name FROM _app_migrations WHERE name=?', args: [migration] });
      if (applied.rows.length) console.log('[registration-shipping] Already applied.');
      else {
        const settings = await client.execute("SELECT stripePaymentUrl FROM ScooterRegistrationSettings WHERE id='default'");
        if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe is required to configure registration shipping.');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-10-28.endive', maxNetworkRetries: 2, timeout: 12000 });
        console.log('[registration-shipping]', await ensureRegistrationShipping(stripe, settings.rows[0]?.stripePaymentUrl));
        await client.execute({ sql: 'INSERT OR IGNORE INTO _app_migrations(name) VALUES(?)', args: [migration] });
      }
    } catch (error) { console.error('[registration-shipping] Setup failed:', error.message); process.exitCode = 1; }
    finally { client.close(); }
  }
}
