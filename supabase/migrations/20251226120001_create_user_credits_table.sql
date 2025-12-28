-- User Credits System
-- Tracks daily credits (3 for all users, resets at 12 AM PST)
-- and monthly credits (pro=40, premium=80, free=0)

create table if not exists public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  
  -- Daily credits: everyone gets 3, resets at 12 AM PST
  daily_credits_remaining integer not null default 3,
  daily_credits_last_reset date not null default current_date,
  
  -- Monthly credits: based on subscription plan
  -- free=0, pro=40, premium=80
  monthly_credits_remaining integer not null default 0,
  monthly_credits_total integer not null default 0, -- max for display: "12/40 remaining"
  monthly_credits_reset_at timestamptz, -- tied to subscription billing cycle
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_user_credits_user_id on public.user_credits(user_id);

-- Enable RLS
alter table public.user_credits enable row level security;

-- RLS Policies
-- Users can view their own credits
create policy "Users can view own credits"
  on public.user_credits for select
  using (auth.uid() = user_id);

-- Trigger for updated_at
drop trigger if exists set_user_credits_updated_at on public.user_credits;
create trigger set_user_credits_updated_at
  before update on public.user_credits
  for each row
  execute function public.handle_updated_at();

-- Function to initialize user credits on signup
-- This creates a credits row for new users automatically
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.user_credits (user_id, daily_credits_remaining, daily_credits_last_reset)
  values (new.id, 3, current_date)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create credits row when a new user is created
drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row
  execute function public.handle_new_user_credits();

-- Function to check and reset daily credits (PST timezone)
-- Returns the current credits after potential reset
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
    values (p_user_id, 3, v_current_pst_date);
  -- If last reset is before today (PST), reset daily credits to 3
  elsif v_last_reset < v_current_pst_date then
    update public.user_credits
    set daily_credits_remaining = 3,
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

-- Function to use a credit
-- Tries daily first, then monthly
-- Returns success status and remaining credits
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
    values (p_user_id, 3, v_current_pst_date);
    v_daily_credits := 3;
    v_monthly_credits := 0;
    v_monthly_total := 0;
  end if;
  
  -- Check if daily reset is needed
  if (select daily_credits_last_reset from public.user_credits where user_id = p_user_id) < v_current_pst_date then
    update public.user_credits
    set daily_credits_remaining = 3,
        daily_credits_last_reset = v_current_pst_date,
        updated_at = now()
    where user_id = p_user_id;
    v_daily_credits := 3;
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

-- Function to reset monthly credits (called by webhook on invoice.paid)
create or replace function public.reset_monthly_credits(p_user_id uuid, p_plan_name text)
returns void as $$
declare
  v_monthly_credits integer;
begin
  -- Determine credits based on plan
  case p_plan_name
    when 'pro' then v_monthly_credits := 40;
    when 'premium' then v_monthly_credits := 80;
    else v_monthly_credits := 0;
  end case;
  
  -- Update or insert credits
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

