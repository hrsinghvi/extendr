/**
 * Use Credit Edge Function
 * 
 * Checks and deducts a credit from the user's allowance.
 * Priority: Daily credits first, then monthly credits.
 * 
 * Daily credits reset at 12 AM PST for all users.
 * Monthly credits reset on billing cycle (handled by webhook).
 */
import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromToken } from '../_shared/supabase.ts';

interface CreditResponse {
  allowed: boolean;
  message: string;
  dailyRemaining: number;
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
      .eq('status', 'active')
      .single();

    const planName = subscription?.plan_name ?? 'free';

    // Call the use_credit database function
    // This handles daily reset logic and credit deduction atomically
    const { data, error } = await supabaseAdmin
      .rpc('use_credit', { p_user_id: user.id });

    if (error) {
      console.error('Error using credit:', error);
      throw error;
    }

    const result = data?.[0];
    
    if (!result) {
      // No credits record found - create one and allow (first use)
      await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: user.id,
          daily_credits_remaining: 99, // 100 - 1 for this use
          daily_credits_last_reset: getCurrentPSTDate(),
        });

      const response: CreditResponse = {
        allowed: true,
        message: 'Credit used from daily allowance',
        dailyRemaining: 99,
        monthlyRemaining: 0,
        monthlyTotal: 0,
        planName,
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: CreditResponse = {
      allowed: result.success,
      message: result.message,
      dailyRemaining: result.daily_remaining,
      monthlyRemaining: result.monthly_remaining,
      monthlyTotal: result.monthly_total,
      planName,
    };

    // Return 402 Payment Required if no credits
    const status = result.success ? 200 : 402;

    return new Response(
      JSON.stringify(response),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Use credit error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? 'Failed to use credit' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Get current date in PST timezone (America/Los_Angeles)
 */
function getCurrentPSTDate(): string {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return pstDate.toISOString().split('T')[0];
}

