-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Seed: Cuenta de Eduardo (Gerente)
-- Ejecutar DESPUÉS de supabase-schema.sql en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════════════

-- Este script toma automáticamente el UUID de auth.users por email,
-- sin necesidad de conocerlo de antemano.

-- 1. Crear tu perfil de Gerente en la tabla usuarios
INSERT INTO usuarios (
  id_usuario,
  email,
  nombre,
  id_gimnasio,
  rol,
  estado
)
SELECT
  au.id,
  'paipayvegabastian@gmail.com',
  'Eduardo Sebastian Paipay Vega',
  '00000000-0000-0000-0000-000000000001',  -- GymFit Lima (creado por supabase-schema.sql)
  'gerente',
  'activo'
FROM auth.users au
WHERE LOWER(au.email) = 'paipayvegabastian@gmail.com'
ON CONFLICT (id_usuario) DO UPDATE SET
  rol    = 'gerente',
  estado = 'activo';

-- 2. Agregar policy RLS para gimnasios (faltaba en el schema)
--    Sin esta policy Supabase bloquea silenciosamente el SELECT y cuelga el login
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'gimnasios' AND policyname = 'users_see_own_gym'
  ) THEN
    EXECUTE 'CREATE POLICY "users_see_own_gym" ON gimnasios
      FOR SELECT USING (id_gimnasio = get_user_gym())';
  END IF;
END $$;

-- 3. Verificar que se insertó correctamente
SELECT
  u.id_usuario,
  u.email,
  u.nombre,
  u.rol,
  u.estado,
  g.nombre AS gimnasio
FROM usuarios u
JOIN gimnasios g ON g.id_gimnasio = u.id_gimnasio
WHERE LOWER(u.email) = 'paipayvegabastian@gmail.com';
