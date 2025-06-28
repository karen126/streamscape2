-- Alternativa: Función con Security Definer para crear perfiles
-- Esta función ejecuta con permisos elevados para evitar problemas de RLS

-- 1. Crear una función que permita insertar perfiles durante el signup
CREATE OR REPLACE FUNCTION create_profile_for_user(
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos del propietario de la función
SET search_path = public
AS $$
DECLARE
  new_profile profiles;
BEGIN
  -- Verificar que el usuario existe en auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado en auth.users';
  END IF;

  -- Verificar que no existe ya un perfil
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RAISE EXCEPTION 'El perfil ya existe para este usuario';
  END IF;

  -- Insertar el nuevo perfil
  INSERT INTO profiles (id, first_name, last_name, full_name, email, created_at, updated_at)
  VALUES (user_id, first_name, last_name, full_name, email, NOW(), NOW())
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creando perfil: %', SQLERRM;
END;
$$;

-- 2. Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_profile_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_for_user TO anon;

-- 3. Crear función para obtener perfil (también con security definer)
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile profiles;
BEGIN
  SELECT * INTO user_profile FROM profiles WHERE id = user_id;
  RETURN user_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile TO anon;

-- Verificar que las funciones se crearon
DO $$
BEGIN
    RAISE NOTICE 'Funciones de perfil creadas exitosamente.';
    RAISE NOTICE 'create_profile_for_user: OK';
    RAISE NOTICE 'get_user_profile: OK';
END $$;
