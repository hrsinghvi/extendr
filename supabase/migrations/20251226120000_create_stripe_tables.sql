-- Stripe Integration Tables
-- Customers: Links Supabase user_id to Stripe customer_id
-- Subscriptions: Tracks active subscription details
-- Prices: Maps Stripe price IDs to plan names

-- Customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text unique not null,
  created_at timestamptz default now()
);

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  plan_name text not null, -- 'free', 'pro', 'premium'
  status text not null, -- 'active', 'canceled', 'past_due', 'trialing', etc.
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prices table (to be seeded with Stripe price IDs)
create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  stripe_price_id text unique not null,
  plan_name text not null, -- 'pro', 'premium'
  interval text not null, -- 'month', 'year'
  unit_amount integer not null, -- in cents
  active boolean default true,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_customers_stripe_customer_id on public.customers(stripe_customer_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_subscription_id on public.subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_prices_plan_name on public.prices(plan_name);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.prices enable row level security;

-- RLS Policies
-- Customers: users can only view their own customer record
create policy "Users can view own customer record"
  on public.customers for select
  using (auth.uid() = user_id);

-- Subscriptions: users can only view their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Prices: anyone can view active prices (public for checkout)
create policy "Anyone can view active prices"
  on public.prices for select
  using (active = true);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for subscriptions updated_at
drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();

