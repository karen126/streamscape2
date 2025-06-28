-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- 2. Política para SELECT: permitir al usuario ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 3. Política para INSERT: permitir insertar durante el registro
-- Esta política permite insertar si el ID coincide con el usuario autenticado
-- O si es un usuario recién creado (durante el proceso de signup)
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    -- Permitir inserción durante el proceso de signup
    (auth.uid() IS NOT NULL AND id = auth.uid())
  );

-- 4. Política alternativa más permisiva para INSERT (usar solo una de las dos)
-- Esta permite a cualquier usuario autenticado insertar su propio perfil
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Política para UPDATE: permitir actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Política para DELETE: permitir eliminar su propio perfil
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 7. Verificar las políticas creadas
DO $$
BEGIN
    RAISE NOTICE 'Políticas RLS actualizadas exitosamente.';
END $$;

-- 8. Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
