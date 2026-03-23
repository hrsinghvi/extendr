-- Seed the prices table with actual Stripe price IDs
-- This is required for the webhook to correctly map price IDs to plan names

INSERT INTO public.prices (stripe_price_id, plan_name, interval, unit_amount, active) VALUES
('price_1TDvATFPrM3OVVmjgZqptmsj', 'pro', 'month', 1200, true),
('price_1TDvVcFPrM3OVVmjTUxO8A7U', 'pro', 'year', 12000, true),
('price_1TDvDIFPrM3OVVmjaDh3Jcxc', 'premium', 'month', 2400, true),
('price_1TDvVFFPrM3OVVmjgO0UxQtr', 'premium', 'year', 24000, true),
('price_1TDvEQFPrM3OVVmj4eQ6ty24', 'ultra', 'month', 4000, true),
('price_1TDvUMFPrM3OVVmjNOx4suqd', 'ultra', 'year', 39600, true)
ON CONFLICT (stripe_price_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  interval = EXCLUDED.interval,
  unit_amount = EXCLUDED.unit_amount,
  active = EXCLUDED.active;
