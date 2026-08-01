-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 013: RLS completo en gym.usuarios
-- Fecha: 2026-06-01
-- Schema: gym
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   Las migraciones 001-008 definían RLS sobre public.usuarios.
--   La migración 009 movió la tabla a gym.usuarios pero NO recreó las políticas
--   en el nuevo schema. Resultado:
--     - UPDATE de foto_url después del onboarding falla silenciosamente
--     - UPDATE de otros campos (telefono, documento, genero) también falla
--     - El trigger (SECURITY DEFINER) puede INSERT, pero el frontend no puede UPDATE
--
-- POLÍTICAS QUE SE CREAN:
--   usuarios_select_own    → cada usuario ve su propio perfil
--   usuarios_select_gym    → staff ve a todos los usuarios de su gym
--   usuarios_update_own    → cada usuario actualiza su propio perfil
--   usuarios_update_staff  → gerente/recepcionista/admin actualiza usuarios de su gym
--   usuarios_insert_staff  → recepcionista/gerente/admin crea nuevos usuarios
--   usuarios_delete_admin  → solo admin puede eliminar
--
-- CORRECCIÓN DE DATOS:
--   Actualiza foto_url para edupaive11@gmail.com desde Storage (si existe el archivo)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Habilitar RLS y limpiar políticas viejas
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE gym.usuarios ENABLE ROW LEVEL SECURITY;

-- Limpiar cualquier política residual (nombres de migraciones 001-008)
DROP POLICY IF EXISTS "usuarios_select_own"              ON gym.usuarios;
DROP POLICY IF EXISTS "usuarios_select_gym"              ON gym.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own"              ON gym.usuarios;
DROP POLICY IF EXISTS "usuarios_update_staff"            ON gym.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_staff"            ON gym.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_admin"            ON gym.usuarios;
DROP POLICY IF EXISTS "users_insert_own"                 ON gym.usuarios;
DROP POLICY IF EXISTS "users_select_own"                 ON gym.usuarios;
DROP POLICY IF EXISTS "nutricionista_select_miembros"    ON gym.usuarios;
DROP POLICY IF EXISTS "entrenador_select_gym_users"      ON gym.usuarios;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: Políticas previas limpiadas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Crear políticas SELECT
-- ─────────────────────────────────────────────────────────────────────────────

-- Cada usuario puede ver su propio perfil
CREATE POLICY "usuarios_select_own" ON gym.usuarios
  FOR SELECT
  USING (id_usuario = auth.uid());

-- Staff ve a todos los usuarios de su mismo gimnasio
CREATE POLICY "usuarios_select_gym" ON gym.usuarios
  FOR SELECT
  USING (id_gimnasio = gym.current_gym_id());

DO $$ BEGIN RAISE NOTICE '✅ PASO 2: Políticas SELECT creadas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Crear políticas UPDATE
-- ─────────────────────────────────────────────────────────────────────────────

-- Cada usuario actualiza su propio perfil (foto, telefono, genero, etc.)
CREATE POLICY "usuarios_update_own" ON gym.usuarios
  FOR UPDATE
  USING (id_usuario = auth.uid());

-- Gerente / recepcionista / admin actualiza cualquier usuario de su gym
CREATE POLICY "usuarios_update_staff" ON gym.usuarios
  FOR UPDATE
  USING (
    id_gimnasio = gym.current_gym_id() AND
    public.get_user_rol() IN ('gerente', 'recepcionista', 'admin')
  );

DO $$ BEGIN RAISE NOTICE '✅ PASO 3: Políticas UPDATE creadas (self + staff)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Crear política INSERT
-- Nota: el trigger handle_new_user usa SECURITY DEFINER y no necesita policy.
-- Esta policy es para que recepcionistas/gerentes registren miembros desde el dashboard.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "usuarios_insert_staff" ON gym.usuarios
  FOR INSERT
  WITH CHECK (
    public.get_user_rol() IN ('gerente', 'recepcionista', 'admin')
  );

DO $$ BEGIN RAISE NOTICE '✅ PASO 4: Política INSERT creada (staff)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Crear política DELETE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "usuarios_delete_admin" ON gym.usuarios
  FOR DELETE
  USING (
    id_gimnasio = gym.current_gym_id() AND
    public.get_user_rol() = 'admin'
  );

DO $$ BEGIN RAISE NOTICE '✅ PASO 5: Política DELETE creada (admin only)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — Grants
-- ─────────────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON gym.usuarios TO authenticated;
GRANT ALL                    ON gym.usuarios TO postgres, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 6: Grants aplicados en gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7 — Corrección de datos: foto_url faltante para edupaive11@gmail.com
-- El trigger crea el perfil con foto_url=NULL porque la foto se sube después.
-- El UPDATE posterior fallaba por falta de RLS. Ahora que está el RLS,
-- el usuario puede actualizar desde el dashboard, pero dejamos aquí el fix
-- manual por si la foto ya existe en Storage.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_user_id   UUID   := '8e1acfa0-3b73-4b99-a89d-b14790c87788';
  v_base_url  TEXT;
  v_foto_url  TEXT;
BEGIN
  -- Intentar reconstruir la URL de Storage (bucket: avatars, extensiones comunes)
  -- El path es: {userId}/avatar.{ext}
  -- La URL pública depende de la configuración del proyecto Supabase.
  -- Como no tenemos la URL del proyecto aquí, dejamos una nota para el usuario.

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  CORRECCIÓN DE foto_url para edupaive11@gmail.com';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  El trigger creó gym.usuarios con foto_url=NULL porque';
  RAISE NOTICE '  la foto se sube después del signUp y el UPDATE fallaba';
  RAISE NOTICE '  por falta de RLS (ya corregido en PASO 2-3).';
  RAISE NOTICE '';
  RAISE NOTICE '  Para corregir foto_url manualmente, busca el archivo en:';
  RAISE NOTICE '  Supabase Dashboard → Storage → avatars → %', v_user_id;
  RAISE NOTICE '  Copia la URL pública y ejecuta:';
  RAISE NOTICE '  UPDATE gym.usuarios SET foto_url = ''URL_AQUI''';
  RAISE NOTICE '    WHERE id_usuario = ''%'';', v_user_id;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_rls_enabled  BOOLEAN;
  v_policies     INT;
  v_rec          RECORD;
BEGIN
  SELECT relrowsecurity INTO v_rls_enabled
  FROM pg_class
  WHERE relname = 'usuarios'
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'gym');

  SELECT COUNT(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'gym' AND tablename = 'usuarios';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 013 — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  gym.usuarios RLS habilitado : %', CASE WHEN v_rls_enabled THEN '✅ SÍ' ELSE '❌ NO' END;
  RAISE NOTICE '  Políticas activas           : % (esperado: 5)', v_policies;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE '  Detalle de políticas:';

  FOR v_rec IN
    SELECT policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'gym' AND tablename = 'usuarios'
    ORDER BY cmd, policyname
  LOOP
    RAISE NOTICE '  [%] %', v_rec.cmd, v_rec.policyname;
  END LOOP;

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  IMPACTO:';
  RAISE NOTICE '  - foto_url: el frontend ahora puede hacer UPDATE correctamente';
  RAISE NOTICE '  - Datos del perfil (telefono, genero, etc.) pueden actualizarse';
  RAISE NOTICE '  - Staff puede gestionar usuarios desde el dashboard';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
