-- Fix monthly credit amounts: pro=15, premium=30, ultra=55
-- Credits reset monthly with NO carry-over

-- Update reset_monthly_credits function with correct amounts
create or replace function public.reset_monthly_credits(p_user_id uuid, p_plan_name text)
returns void as $$
declare
  v_monthly_credits integer;
begin
  -- Determine credits based on plan
  case p_plan_name
    when 'pro' then v_monthly_credits := 15;
    when 'premium' then v_monthly_credits := 30;
    when 'ultra' then v_monthly_credits := 55;
    else v_monthly_credits := 0;
  end case;

  -- Update or insert credits (no carry-over, hard reset)
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
