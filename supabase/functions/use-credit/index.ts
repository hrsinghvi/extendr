/**
 * Use Credit Edge Function
 *
 * Checks and deducts a credit from the user's monthly allowance.
 * Monthly credits reset on billing cycle (handled by webhook for paid plans).
 * Free plan users get 2 credits/month with no rollover, reset handled here.
 */
import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromToken } from '../_shared/supabase.ts';
import { PLAN_CREDITS } from '../_shared/stripe.ts';

interface CreditResponse {
  allowed: boolean;
  message: string;
  monthlyRemaining: number;
  monthlyTotal: number;
  planName: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from token
    const user = await getUserFromToken(authHeader);

    // Get user's subscription plan
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_name, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single();

    const planName = subscription?.plan_name ?? 'free';
    const isFree = planName === 'free';

    // Get current credits
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('monthly_credits_remaining, monthly_credits_total, monthly_credits_reset_at')
      .eq('user_id', user.id)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      throw creditsError;
    }

    // No credits record
    if (!credits) {
      if (isFree) {
        // Auto-provision 2 credits for free plan users
        const resetAt = new Date();
        resetAt.setMonth(resetAt.getMonth() + 1);
        const { error: insertError } = await supabaseAdmin
          .from('user_credits')
          .insert({
            user_id: user.id,
            monthly_credits_remaining: PLAN_CREDITS.free - 1, // deduct 1 for this request
            monthly_credits_total: PLAN_CREDITS.free,
            monthly_credits_reset_at: resetAt.toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        const response: CreditResponse = {
          allowed: true,
          message: 'Credit used',
          monthlyRemaining: PLAN_CREDITS.free - 1,
          monthlyTotal: PLAN_CREDITS.free,
          planName,
        };
        return new Response(
          JSON.stringify(response),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Non-free user with no credits record
      const response: CreditResponse = {
        allowed: false,
        message: 'No credits available. Please subscribe to a plan.',
        monthlyRemaining: 0,
        monthlyTotal: 0,
        planName,
      };
      return new Response(
        JSON.stringify(response),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For free plan: handle monthly reset with no rollover
    if (isFree && credits.monthly_credits_reset_at) {
      const resetAt = new Date(credits.monthly_credits_reset_at);
      const now = new Date();
      if (now >= resetAt) {
        // Reset due — set back to 2 (no rollover)
        const nextResetAt = new Date(now);
        nextResetAt.setMonth(nextResetAt.getMonth() + 1);
        await supabaseAdmin
          .from('user_credits')
          .update({
            monthly_credits_remaining: PLAN_CREDITS.free,
            monthly_credits_total: PLAN_CREDITS.free,
            monthly_credits_reset_at: nextResetAt.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('user_id', user.id);

        // Re-fetch updated credits
        credits.monthly_credits_remaining = PLAN_CREDITS.free;
        credits.monthly_credits_total = PLAN_CREDITS.free;
      }
    }

    // Check if user has monthly credits remaining
    if (credits.monthly_credits_remaining <= 0) {
      const response: CreditResponse = {
        allowed: false,
        message: 'No credits remaining. Credits reset at the start of your next billing cycle.',
        monthlyRemaining: 0,
        monthlyTotal: credits.monthly_credits_total,
        planName,
      };
      return new Response(
        JSON.stringify(response),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct one monthly credit
    const newRemaining = credits.monthly_credits_remaining - 1;
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        monthly_credits_remaining: newRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    const response: CreditResponse = {
      allowed: true,
      message: 'Credit used',
      monthlyRemaining: newRemaining,
      monthlyTotal: credits.monthly_credits_total,
      planName,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Use credit error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? 'Failed to use credit' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
