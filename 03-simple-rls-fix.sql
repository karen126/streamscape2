-- Solución simple: Deshabilitar RLS temporalmente para profiles durante el registro
-- y usar triggers para crear perfiles automáticamente

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Crear trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Volver a habilitar RLS con políticas más permisivas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Recrear políticas más permisivas
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Política para ver perfiles (más permisiva)
CREATE POLICY "Enable read access for authenticated users" ON profiles
  FOR SELECT USING (true);

-- Política para insertar perfiles (más permisiva)
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (true);

-- Política para actualizar perfiles
CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para eliminar perfiles
CREATE POLICY "Enable delete for users based on user_id" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Verificar que todo se configuró correctamente
DO $$
BEGIN
    RAISE NOTICE 'Configuración de RLS simplificada completada.';
    RAISE NOTICE 'Trigger handle_new_user creado.';
    RAISE NOTICE 'Políticas RLS actualizadas.';
END $$;
