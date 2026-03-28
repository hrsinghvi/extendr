-- Fix free tier: new users should start with 2 monthly credits (no rollover)

-- 1. Update handle_new_user_credits to give free users 2 monthly credits on signup
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.user_credits (
    user_id,
    daily_credits_remaining,
    daily_credits_last_reset,
    monthly_credits_remaining,
    monthly_credits_total,
    monthly_credits_reset_at
  )
  values (new.id, 100, current_date, 2, 2, now())
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Update reset_monthly_credits to give free plan 2 credits (no rollover)
create or replace function public.reset_monthly_credits(p_user_id uuid, p_plan_name text)
returns void as $$
declare
  v_monthly_credits integer;
begin
  case p_plan_name
    when 'pro' then v_monthly_credits := 15;
    when 'premium' then v_monthly_credits := 30;
    when 'ultra' then v_monthly_credits := 55;
    when 'free' then v_monthly_credits := 2;
    else v_monthly_credits := 2;
  end case;

  insert into public.user_credits (
    user_id,
    monthly_credits_remaining,
    monthly_credits_total,
    monthly_credits_reset_at
  )
  values (p_user_id, v_monthly_credits, v_monthly_credits, now())
  on conflict (user_id) do update set
    monthly_credits_remaining = v_monthly_credits,
    monthly_credits_total = v_monthly_credits,
    monthly_credits_reset_at = now(),
    updated_at = now();
end;
$$ language plpgsql security definer;

-- 3. Fix existing free users who currently have 0 monthly credits
-- (users not on any paid plan, identified by having monthly_credits_total = 0)
UPDATE public.user_credits
SET
  monthly_credits_remaining = 2,
  monthly_credits_total = 2,
  monthly_credits_reset_at = now(),
  updated_at = now()
WHERE monthly_credits_total = 0
  AND user_id NOT IN (
    SELECT user_id FROM public.subscriptions
    WHERE status IN ('active', 'trialing')
  );
