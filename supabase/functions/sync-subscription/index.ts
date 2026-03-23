/**
 * Sync Subscription Edge Function
 *
 * Called after a user returns from Stripe Checkout.
 * Looks up the user's Stripe customer, finds their active subscription,
 * and syncs the subscription record + credits in Supabase.
 *
 * This is a safety net — the webhook should handle this, but if it
 * fails (misconfigured URL, signature mismatch, timeout), this ensures
 * the user still gets their plan.
 */
import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe, PLAN_CREDITS } from '../_shared/stripe.ts';
import { supabaseAdmin, getUserFromToken } from '../_shared/supabase.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = await getUserFromToken(authHeader);
    console.log(`[sync-subscription] Syncing for user ${user.id}`);

    // 1. Get user's Stripe customer ID
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ synced: false, message: 'No Stripe customer found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-subscription] Found Stripe customer ${customer.stripe_customer_id}`);

    // 2. List active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Also check for trialing
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customer.stripe_customer_id,
        status: 'trialing',
        limit: 1,
      });

      if (trialingSubscriptions.data.length === 0) {
        console.log(`[sync-subscription] No active subscription found in Stripe`);
        return new Response(
          JSON.stringify({ synced: false, message: 'No active subscription in Stripe' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      subscriptions.data = trialingSubscriptions.data;
    }

    const stripeSub = subscriptions.data[0];
    const priceId = stripeSub.items.data[0]?.price.id;

    console.log(`[sync-subscription] Found Stripe subscription ${stripeSub.id}, price ${priceId}`);

    // 3. Look up plan name from prices table
    const { data: priceData } = await supabaseAdmin
      .from('prices')
      .select('plan_name')
      .eq('stripe_price_id', priceId)
      .single();

    const planName = priceData?.plan_name ?? 'pro';
    console.log(`[sync-subscription] Plan: ${planName}`);

    // 4. Upsert subscription record
    // First check if a subscription with this stripe_subscription_id exists
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeSub.id)
      .single();

    if (existingSub) {
      // Update existing
      await supabaseAdmin
        .from('subscriptions')
        .update({
          user_id: user.id,
          stripe_price_id: priceId,
          plan_name: planName,
          status: stripeSub.status,
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSub.id);
    } else {
      // Check if user has an old placeholder subscription (e.g. "pending_sync")
      const { data: oldSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (oldSub) {
        // Update the existing row with the real Stripe data
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
          .eq('user_id', user.id);
      } else {
        // Insert new
        const { error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: user.id,
            stripe_subscription_id: stripeSub.id,
            stripe_price_id: priceId,
            plan_name: planName,
            status: stripeSub.status,
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSub.cancel_at_period_end,
          });

        if (insertError) {
          console.error('[sync-subscription] Error inserting subscription:', insertError);
          throw insertError;
        }
      }
    }

    // 5. Set credits based on plan
    const monthlyCredits = PLAN_CREDITS[planName] ?? 0;

    const { error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .upsert({
        user_id: user.id,
        monthly_credits_remaining: monthlyCredits,
        monthly_credits_total: monthlyCredits,
        monthly_credits_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (creditsError) {
      console.error('[sync-subscription] Error setting credits:', creditsError);
      throw creditsError;
    }

    console.log(`[sync-subscription] Synced: ${planName} plan, ${monthlyCredits} credits`);

    return new Response(
      JSON.stringify({
        synced: true,
        planName,
        monthlyCredits,
        status: stripeSub.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-subscription] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? 'Failed to sync subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
