/**
 * TypeScript types for Stripe integration tables
 * These extend the auto-generated Supabase types
 */

export interface Customer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_name: 'free' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Price {
  id: string;
  stripe_price_id: string;
  plan_name: string;
  interval: 'month' | 'year';
  unit_amount: number;
  active: boolean;
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  daily_credits_remaining: number;
  daily_credits_last_reset: string; // date string YYYY-MM-DD
  monthly_credits_remaining: number;
  monthly_credits_total: number;
  monthly_credits_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Response from use_credit RPC function
 */
export interface UseCreditResult {
  success: boolean;
  message: string;
  daily_remaining: number;
  monthly_remaining: number;
  monthly_total: number;
}

/**
 * Credit allocation by plan
 */
export const PLAN_CREDITS = {
  free: { daily: 100, monthly: 0 },
  pro: { daily: 100, monthly: 40 },
  premium: { daily: 100, monthly: 80 },
} as const;

