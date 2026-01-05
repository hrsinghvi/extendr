/**
 * Stripe helper functions for calling Edge Functions
 * Handles checkout, portal, and credit operations
 */
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Price IDs for each plan
 * Update these with your actual Stripe price IDs after creating products
 */
export const STRIPE_PRICES = {
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID ?? '',
  },
  premium: {
    monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? '',
    yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID ?? '',
  },
} as const;

export type PlanName = 'free' | 'pro' | 'premium';
export type BillingInterval = 'monthly' | 'yearly';

interface CheckoutResponse {
  url: string;
  sessionId: string;
}

interface PortalResponse {
  url: string;
}

export interface CreditResponse {
  allowed: boolean;
  message: string;
  dailyRemaining: number;
  monthlyRemaining: number;
  monthlyTotal: number;
  planName: string;
}

/**
 * Get the authorization header for authenticated requests
 */
async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return `Bearer ${session.access_token}`;
}

/**
 * Create a Stripe Checkout session and redirect to payment
 */
export async function createCheckoutSession(
  priceId: string,
  successUrl: string = `${window.location.origin}/build?checkout=success`,
  cancelUrl: string = `${window.location.origin}/pricing?checkout=canceled`
): Promise<CheckoutResponse> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      priceId,
      successUrl,
      cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Stripe Customer Portal session for subscription management
 */
export async function createPortalSession(
  returnUrl: string = window.location.href
): Promise<PortalResponse> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({ returnUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to create portal session');
  }

  return response.json();
}

/**
 * Use one credit for an AI message
 * Returns whether the action was allowed and remaining credits
 */
export async function useCredit(): Promise<CreditResponse> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/use-credit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
  });

  const data = await response.json();

  // 402 means out of credits but still a valid response
  if (!response.ok && response.status !== 402) {
    throw new Error(data.error ?? 'Failed to use credit');
  }

  return data as CreditResponse;
}

/**
 * Redirect to Stripe Checkout for a plan
 */
export async function redirectToCheckout(
  plan: 'pro' | 'premium',
  interval: BillingInterval = 'monthly'
): Promise<void> {
  const priceId = STRIPE_PRICES[plan][interval];
  
  if (!priceId) {
    throw new Error(`No price ID configured for ${plan} ${interval}. Check environment variables.`);
  }

  const { url } = await createCheckoutSession(priceId);
  
  if (url) {
    window.location.href = url;
  } else {
    throw new Error('No checkout URL returned');
  }
}

/**
 * Redirect to Stripe Customer Portal
 */
export async function redirectToPortal(): Promise<void> {
  const { url } = await createPortalSession();
  
  if (url) {
    window.location.href = url;
  } else {
    throw new Error('No portal URL returned');
  }
}

/**
 * Get plan display info
 */
export function getPlanInfo(planName: PlanName): {
  name: string;
  dailyCredits: number;
  monthlyCredits: number;
  features: string[];
} {
  const plans = {
    free: {
      name: 'Free',
      dailyCredits: 100,
      monthlyCredits: 0,
      features: ['Up to 3 extensions', 'Basic templates', 'Community support'],
    },
    pro: {
      name: 'Pro',
      dailyCredits: 100,
      monthlyCredits: 40,
      features: ['Unlimited extensions', 'All templates', 'Priority AI generation'],
    },
    premium: {
      name: 'Premium',
      dailyCredits: 100,
      monthlyCredits: 80,
      features: ['Unlimited everything', 'Custom branding', 'Fastest AI generation'],
    },
  };

  return plans[planName] ?? plans.free;
}

