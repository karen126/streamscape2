-- Insertar productos de Stripe (usando tus IDs reales)
INSERT INTO products (id, name, description, active, metadata)
VALUES
  ('prod_SQAXyKtB6S7YJW', 'Basic', 'Plan básico de $30.00', true, '{"features": ["unlimited_messages", "5_hours_video", "basic_profile"]}'),
  ('prod_SQAYlWIV71UrCr', 'Premium', 'Plan premium de $40.00', true, '{"features": ["unlimited_messages", "20_hours_video", "advanced_profile", "priority_matching"]}'),
  ('prod_SQAZwsYrmC7XE4', 'Ultimate', 'Plan ultimate de $45.00', true, '{"features": ["unlimited_messages", "unlimited_video", "premium_profile", "priority_matching", "exclusive_events"]}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  metadata = EXCLUDED.metadata;

-- Insertar precios de Stripe (usando tus IDs reales)
INSERT INTO prices (
  id, product_id, active, currency, description, type, unit_amount, interval, interval_count, trial_period_days, metadata
)
VALUES
  (
    'price_1RVKC6FK5Rts2m4Ofh0TN3Lb', 'prod_SQAXyKtB6S7YJW',
    true, 'usd', 'Precio mensual del plan Basic', 'recurring', 3000, 'month', 1, null, '{}'
  ),
  (
    'price_1RVKDMFK5Rts2m4OHP224JhH', 'prod_SQAYlWIV71UrCr',
    true, 'usd', 'Precio mensual del plan Premium', 'recurring', 4000, 'month', 1, null, '{}'
  ),
  (
    'price_1RVKEYFK5Rts2m4O5WYGP00F', 'prod_SQAZwsYrmC7XE4',
    true, 'usd', 'Precio mensual del plan Ultimate', 'recurring', 4500, 'month', 1, null, '{}'
  )
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  active = EXCLUDED.active,
  currency = EXCLUDED.currency,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  unit_amount = EXCLUDED.unit_amount,
  interval = EXCLUDED.interval,
  interval_count = EXCLUDED.interval_count,
  trial_period_days = EXCLUDED.trial_period_days,
  metadata = EXCLUDED.metadata;

-- Insertar planes internos que referencian los precios reales de Stripe
INSERT INTO plans (id, name, description, price, currency, interval, stripe_price_id, features)
VALUES
  (
    uuid_generate_v4(),
    'Basic',
    'Plan básico con funciones esenciales',
    30.00,
    'USD',
    'month',
    'price_1RVKC6FK5Rts2m4Ofh0TN3Lb',
    '["Unlimited text messaging", "5 hours of video calls per month", "Basic profile customization"]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'Premium',
    'Plan premium con funciones avanzadas',
    40.00,
    'USD',
    'month',
    'price_1RVKDMFK5Rts2m4OHP224JhH',
    '["Unlimited text messaging", "20 hours of video calls per month", "Advanced profile customization", "Priority matching"]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'Ultimate',
    'Plan ultimate con todas las funciones',
    45.00,
    'USD',
    'month',
    'price_1RVKEYFK5Rts2m4O5WYGP00F',
    '["Unlimited text messaging", "Unlimited video calls", "Premium profile customization", "Priority matching", "Exclusive events access"]'::jsonb
  ),
  (
    uuid_generate_v4(),
    'Free Trial',
    'Prueba gratuita de 3 días',
    0.00,
    'USD',
    'month',
    null,
    '["Unlimited text messaging", "5 hours of video calls", "Basic profile customization", "Valid for 3 days"]'::jsonb
  )
ON CONFLICT DO NOTHING;
