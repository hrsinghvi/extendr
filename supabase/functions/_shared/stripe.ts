/**
 * Stripe client singleton for Edge Functions
 */
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Plan name to monthly credits mapping
 */
export const PLAN_CREDITS: Record<string, number> = {
  free: 0,
  pro: 40,
  premium: 80,
};

/**
 * Get plan name from Stripe price ID
 * This should match your prices table in Supabase
 */
export function getPlanFromPriceId(priceId: string, prices: Array<{ stripe_price_id: string; plan_name: string }>): string {
  const price = prices.find(p => p.stripe_price_id === priceId);
  return price?.plan_name ?? 'free';
}

