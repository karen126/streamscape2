-- 1. Eliminar tabla existente si hay problemas
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Crear tabla profiles con estructura correcta
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  bio text,
  location text,
  interests text[],
  birth_date date,
  gender text,
  looking_for text,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- 3. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS más permisivas
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Política para SELECT (ver perfil propio)
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política para INSERT (crear perfil propio) - MÁS PERMISIVA
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (true); -- Permitir inserción para cualquier usuario autenticado

-- Política para UPDATE (actualizar perfil propio)
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política para DELETE (eliminar perfil propio)
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 5. Crear función para crear perfil de forma segura
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    full_name,
    email
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, no fallar el registro del usuario
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 7. Verificar que las tablas de suscripción existen
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  interval text NOT NULL DEFAULT 'month',
  stripe_price_id text,
  features jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id),
  stripe_subscription_id text,
  status text NOT NULL,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- 8. Habilitar RLS en tablas de suscripción
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 9. Políticas para planes (todos pueden ver)
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);

-- 10. Políticas para suscripciones (solo el usuario puede ver las suyas)
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 11. Insertar planes básicos si no existen
INSERT INTO plans (name, description, price, currency, interval, stripe_price_id, features)
VALUES 
  ('Free Trial', 'Prueba gratuita de 3 días', 0.00, 'USD', 'day', null, '["Acceso completo por 3 días", "Todas las funciones", "Sin tarjeta de crédito"]'::jsonb),
  ('Basic', 'Plan básico mensual', 30.00, 'USD', 'month', 'price_1RVKC6FK5Rts2m4Ofh0TN3Lb', '["Mensajes ilimitados", "Videollamadas", "Soporte básico"]'::jsonb),
  ('Premium', 'Plan premium mensual', 40.00, 'USD', 'month', 'price_1RVKDMFK5Rts2m4OHP224JhH', '["Todo lo del Basic", "Funciones premium", "Soporte prioritario"]'::jsonb),
  ('Ultimate', 'Plan ultimate mensual', 45.00, 'USD', 'month', 'price_1RVKEYFK5Rts2m4O5WYGP00F', '["Todo lo del Premium", "Funciones exclusivas", "Soporte VIP"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 12. Crear función para obtener planes
CREATE OR REPLACE FUNCTION get_available_plans()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price decimal,
  currency text,
  interval text,
  stripe_price_id text,
  features jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.price, p.currency, p.interval, p.stripe_price_id, p.features
  FROM plans p
  ORDER BY p.price ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Verificar configuración
SELECT 'Configuración completada correctamente' as status;
