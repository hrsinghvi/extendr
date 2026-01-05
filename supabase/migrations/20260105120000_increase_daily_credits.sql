-- Update default value for daily_credits_remaining
ALTER TABLE public.user_credits 
ALTER COLUMN daily_credits_remaining SET DEFAULT 100;

-- Update all existing users to have 100 credits immediately
UPDATE public.user_credits SET daily_credits_remaining = 100;

-- Update handle_new_user_credits function
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.user_credits (user_id, daily_credits_remaining, daily_credits_last_reset)
  values (new.id, 100, current_date)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Update check_and_reset_daily_credits function
create or replace function public.check_and_reset_daily_credits(p_user_id uuid)
returns table(daily_remaining integer, monthly_remaining integer, monthly_total integer) as $$
declare
  v_current_pst_date date;
  v_last_reset date;
begin
  -- Get current date in PST (America/Los_Angeles)
  v_current_pst_date := (now() at time zone 'America/Los_Angeles')::date;
  
  -- Get user's last reset date
  select daily_credits_last_reset into v_last_reset
  from public.user_credits
  where user_id = p_user_id;
  
  -- If no record exists, create one
  if not found then
    insert into public.user_credits (user_id, daily_credits_remaining, daily_credits_last_reset)
    values (p_user_id, 100, v_current_pst_date);
  -- If last reset is before today (PST), reset daily credits to 100
  elsif v_last_reset < v_current_pst_date then
    update public.user_credits
    set daily_credits_remaining = 100,
        daily_credits_last_reset = v_current_pst_date,
        updated_at = now()
    where user_id = p_user_id;
  end if;
  
  -- Return current credits
  return query
  select 
    uc.daily_credits_remaining,
    uc.monthly_credits_remaining,
    uc.monthly_credits_total
  from public.user_credits uc
  where uc.user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Update use_credit function
create or replace function public.use_credit(p_user_id uuid)
returns table(
  success boolean,
  message text,
  daily_remaining integer,
  monthly_remaining integer,
  monthly_total integer
) as $$
declare
  v_daily_credits integer;
  v_monthly_credits integer;
  v_monthly_total integer;
  v_current_pst_date date;
begin
  -- First, check and reset daily credits if needed
  v_current_pst_date := (now() at time zone 'America/Los_Angeles')::date;
  
  -- Lock the row for update to prevent race conditions
  select 
    uc.daily_credits_remaining,
    uc.monthly_credits_remaining,
    uc.monthly_credits_total
  into v_daily_credits, v_monthly_credits, v_monthly_total
  from public.user_credits uc
  where uc.user_id = p_user_id
  for update;
  
  -- If no record, create one
  if not found then
    insert into public.user_credits (user_id, daily_credits_remaining, daily_credits_last_reset)
    values (p_user_id, 100, v_current_pst_date);
    v_daily_credits := 100;
    v_monthly_credits := 0;
    v_monthly_total := 0;
  end if;
  
  -- Check if daily reset is needed
  if (select daily_credits_last_reset from public.user_credits where user_id = p_user_id) < v_current_pst_date then
    update public.user_credits
    set daily_credits_remaining = 100,
        daily_credits_last_reset = v_current_pst_date,
        updated_at = now()
    where user_id = p_user_id;
    v_daily_credits := 100;
  end if;
  
  -- Try to use daily credit first
  if v_daily_credits > 0 then
    update public.user_credits
    set daily_credits_remaining = daily_credits_remaining - 1,
        updated_at = now()
    where user_id = p_user_id;
    
    return query select 
      true,
      'Credit used from daily allowance'::text,
      v_daily_credits - 1,
      v_monthly_credits,
      v_monthly_total;
    return;
  end if;
  
  -- Try monthly credits if daily exhausted
  if v_monthly_credits > 0 then
    update public.user_credits
    set monthly_credits_remaining = monthly_credits_remaining - 1,
        updated_at = now()
    where user_id = p_user_id;
    
    return query select 
      true,
      'Credit used from monthly allowance'::text,
      v_daily_credits,
      v_monthly_credits - 1,
      v_monthly_total;
    return;
  end if;
  
  -- No credits available
  return query select 
    false,
    'No credits remaining'::text,
    v_daily_credits,
    v_monthly_credits,
    v_monthly_total;
end;
$$ language plpgsql security definer;
