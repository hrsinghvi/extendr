-- Seed the prices table with actual Stripe price IDs
-- This is required for the webhook to correctly map price IDs to plan names

INSERT INTO public.prices (stripe_price_id, plan_name, interval, unit_amount, active) VALUES
('price_1TFPwxFPrM3OVVmj9nI3Epma', 'pro', 'month', 1200, true),
('price_1TFPxCFPrM3OVVmj1q8vsLxA', 'pro', 'year', 12000, true),
('price_1TFPvjFPrM3OVVmjhA4jPtQ2', 'premium', 'month', 2400, true),
('price_1TFPwRFPrM3OVVmjWyPFB5qK', 'premium', 'year', 24000, true),
('price_1TFPucFPrM3OVVmj5JDiWmMm', 'ultra', 'month', 4000, true),
('price_1TFPv5FPrM3OVVmjYxve15cN', 'ultra', 'year', 39600, true)
ON CONFLICT (stripe_price_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  interval = EXCLUDED.interval,
  unit_amount = EXCLUDED.unit_amount,
  active = EXCLUDED.active;
