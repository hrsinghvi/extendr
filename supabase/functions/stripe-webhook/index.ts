/**
 * Stripe Webhook Handler Edge Function
 * 
 * Handles Stripe webhook events:
 * - checkout.session.completed: Create subscription record
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Mark subscription as canceled
 * - invoice.paid: Reset monthly credits for the billing period
 */
import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe, PLAN_CREDITS } from '../_shared/stripe.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? 'Webhook handler failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle checkout.session.completed event
 * Creates the subscription record in our database
 */
async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    console.error('No supabase_user_id in session metadata');
    return;
  }

  // Get the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const priceId = subscription.items.data[0]?.price.id;

  // Get plan name from our prices table
  const { data: priceData } = await supabaseAdmin
    .from('prices')
    .select('plan_name')
    .eq('stripe_price_id', priceId)
    .single();

  const planName = priceData?.plan_name ?? subscription.metadata?.plan_name ?? 'pro';

  // Insert or update subscription record
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_name: planName,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (subError) {
    console.error('Error creating subscription:', subError);
    throw subError;
  }

  // Initialize monthly credits for the new subscription
  await resetMonthlyCredits(userId, planName);

  console.log(`Subscription created for user ${userId}, plan: ${planName}`);
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription status/details
 */
async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.supabase_user_id;
  
  // If no user ID in metadata, try to find it via customer
  let targetUserId = userId;
  if (!targetUserId) {
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer)
      .single();
    targetUserId = customer?.user_id;
  }

  if (!targetUserId) {
    console.error('Could not find user for subscription:', subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  
  // Get plan name
  const { data: priceData } = await supabaseAdmin
    .from('prices')
    .select('plan_name')
    .eq('stripe_price_id', priceId)
    .single();

  const planName = priceData?.plan_name ?? subscription.metadata?.plan_name ?? 'pro';

  // Update subscription record
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan_name: planName,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  // If plan changed, update credits
  if (subscription.status === 'active') {
    await resetMonthlyCredits(targetUserId, planName);
  }

  console.log(`Subscription updated for user ${targetUserId}, status: ${subscription.status}`);
}

/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled and resets credits
 */
async function handleSubscriptionDeleted(subscription: any) {
  // Update subscription status to canceled
  const { data: subData, error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('user_id')
    .single();

  if (error) {
    console.error('Error deleting subscription:', error);
    return;
  }

  // Reset monthly credits to 0 (free tier)
  if (subData?.user_id) {
    await resetMonthlyCredits(subData.user_id, 'free');
  }

  console.log(`Subscription canceled: ${subscription.id}`);
}

/**
 * Handle invoice.paid event
 * Resets monthly credits on successful billing
 */
async function handleInvoicePaid(invoice: any) {
  // Only handle subscription invoices
  if (!invoice.subscription) return;

  // Get subscription to find user and plan
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  let userId = subscription.metadata?.supabase_user_id;
  
  // Fallback to customer lookup
  if (!userId) {
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('user_id')
      .eq('stripe_customer_id', invoice.customer)
      .single();
    userId = customer?.user_id;
  }

  if (!userId) {
    console.error('Could not find user for invoice:', invoice.id);
    return;
  }

  // Get plan from subscription
  const priceId = subscription.items.data[0]?.price.id;
  const { data: priceData } = await supabaseAdmin
    .from('prices')
    .select('plan_name')
    .eq('stripe_price_id', priceId)
    .single();

  const planName = priceData?.plan_name ?? 'pro';

  // Reset monthly credits
  await resetMonthlyCredits(userId, planName);

  console.log(`Monthly credits reset for user ${userId} on invoice payment`);
}

/**
 * Reset monthly credits based on plan
 */
async function resetMonthlyCredits(userId: string, planName: string) {
  const monthlyCredits = PLAN_CREDITS[planName] ?? 0;

  const { error } = await supabaseAdmin
    .from('user_credits')
    .upsert({
      user_id: userId,
      monthly_credits_remaining: monthlyCredits,
      monthly_credits_total: monthlyCredits,
      monthly_credits_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error resetting monthly credits:', error);
    throw error;
  }
}

