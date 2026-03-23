/**
 * Admin: Sync All Subscriptions
 *
 * One-off admin function to sync all Stripe customers who have
 * active subscriptions but no matching record in Supabase.
 * Requires service role key authorization.
 */
import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe, PLAN_CREDITS } from '../_shared/stripe.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all customers from Supabase
    const { data: customers, error: custError } = await supabaseAdmin
      .from('customers')
      .select('user_id, stripe_customer_id');

    if (custError) throw custError;
    if (!customers || customers.length === 0) {
      return new Response(JSON.stringify({ message: 'No customers found', synced: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results: any[] = [];

    for (const customer of customers) {
      try {
        // List active subscriptions from Stripe
        const subs = await stripe.subscriptions.list({
          customer: customer.stripe_customer_id,
          status: 'active',
          limit: 1,
        });

        if (subs.data.length === 0) {
          results.push({ user_id: customer.user_id, status: 'no_active_sub' });
          continue;
        }

        const stripeSub = subs.data[0];
        const priceId = stripeSub.items.data[0]?.price.id;

        // Look up plan name
        const { data: priceData } = await supabaseAdmin
          .from('prices')
          .select('plan_name')
          .eq('stripe_price_id', priceId)
          .single();

        const planName = priceData?.plan_name ?? 'pro';

        // Check existing subscription
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id, stripe_subscription_id')
          .eq('user_id', customer.user_id)
          .single();

        if (existingSub) {
          // Update
          await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_subscription_id: stripeSub.id,
              stripe_price_id: priceId,
              plan_name: planName,
              status: stripeSub.status,
              current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id);
        } else {
          // Insert
          await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: customer.user_id,
              stripe_subscription_id: stripeSub.id,
              stripe_price_id: priceId,
              plan_name: planName,
              status: stripeSub.status,
              current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSub.cancel_at_period_end,
            });
        }

        // Set credits
        const monthlyCredits = PLAN_CREDITS[planName] ?? 0;
        await supabaseAdmin
          .from('user_credits')
          .upsert({
            user_id: customer.user_id,
            monthly_credits_remaining: monthlyCredits,
            monthly_credits_total: monthlyCredits,
            monthly_credits_reset_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        results.push({ user_id: customer.user_id, plan: planName, credits: monthlyCredits, status: 'synced' });
      } catch (err) {
        results.push({ user_id: customer.user_id, status: 'error', error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ synced: results.filter(r => r.status === 'synced').length, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
