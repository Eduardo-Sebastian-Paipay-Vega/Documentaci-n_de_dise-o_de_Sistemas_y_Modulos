-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 005: Soporte para registro de nuevos usuarios (Sign Up)
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- Prerequisito: migraciones 001-004 aplicadas
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Esta migración habilita el flujo de registro propio (self-service signup):
--   1. Agrega `codigo_acceso` a gimnasios (ej: "GYMFIT") para identificar el tenant
--   2. Política SELECT anónima en gimnasios (lookup del código en la página de signup)
--   3. Política INSERT en usuarios para que el recién registrado cree su perfil
--   4. Trigger handle_new_user funcional: crea la fila en usuarios desde los metadatos
--      que el frontend pasa en supabase.auth.signUp({ options: { data: {...} } })
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Agregar codigo_acceso a gimnasios
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE gimnasios
  ADD COLUMN IF NOT EXISTS codigo_acceso VARCHAR(20) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_gimnasios_codigo ON gimnasios(codigo_acceso);

-- Asignar código al gimnasio demo
UPDATE gimnasios
   SET codigo_acceso = 'GYMFIT'
 WHERE id_gimnasio = '00000000-0000-0000-0000-000000000001'
   AND codigo_acceso IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Política SELECT pública en gimnasios (solo para signup/lookup)
-- Permite que un usuario NO autenticado vea nombre + código del gimnasio activo
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE tablename = 'gimnasios' AND policyname = 'gimnasios_public_select'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY gimnasios_public_select ON gimnasios
        FOR SELECT
        USING (estado = 'activo')
    $pol$;
    RAISE NOTICE '✅ Política gimnasios_public_select creada';
  ELSE
    RAISE NOTICE 'ℹ️  gimnasios_public_select ya existía';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Política INSERT en usuarios para el propio usuario
-- Permite que el usuario recién creado inserte su propia fila de perfil.
-- El trigger (paso 4) se encarga de esto automáticamente, pero esta política
-- es necesaria como respaldo si el trigger falla o se usa desde el cliente.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE tablename = 'usuarios' AND policyname = 'users_insert_own'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY users_insert_own ON usuarios
        FOR INSERT
        WITH CHECK (id_usuario = auth.uid())
    $pol$;
    RAISE NOTICE '✅ Política users_insert_own creada';
  ELSE
    RAISE NOTICE 'ℹ️  users_insert_own ya existía';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Trigger handle_new_user funcional
-- Crea automáticamente la fila en `usuarios` cuando alguien se registra.
-- Los datos vienen de raw_user_meta_data que el frontend envía en signUp().
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id_gimnasio UUID;
  v_nombre      TEXT;
  v_rol         TEXT;
  v_telefono    TEXT;
BEGIN
  -- Extraer metadatos pasados desde el frontend
  v_id_gimnasio := (NEW.raw_user_meta_data->>'id_gimnasio')::uuid;
  v_nombre      := COALESCE(
                     NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'), ''),
                     split_part(NEW.email, '@', 1)
                   );
  v_rol         := COALESCE(
                     NULLIF(NEW.raw_user_meta_data->>'rol', ''),
                     'miembro'
                   );
  v_telefono    := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'), '');

  -- Solo crear perfil si se proporcionó id_gimnasio (signup desde la app)
  -- Los usuarios creados manualmente en el Dashboard de Supabase no tendrán
  -- este metadato y se ignoran aquí (se crean manualmente o con seed).
  IF v_id_gimnasio IS NOT NULL THEN
    INSERT INTO public.usuarios (
      id_usuario,
      email,
      nombre,
      telefono,
      id_gimnasio,
      rol,
      estado
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_nombre,
      v_telefono,
      v_id_gimnasio,
      v_rol,
      'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

    RAISE LOG 'handle_new_user: perfil creado para % (gym: %, rol: %)',
              NEW.email, v_id_gimnasio, v_rol;
  ELSE
    RAISE LOG 'handle_new_user: % sin id_gimnasio en metadata — perfil omitido', NEW.email;
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Nunca bloquear el signup por un error en el trigger
  RAISE WARNING 'handle_new_user error para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Crear el trigger si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
     WHERE tgname = 'on_auth_user_created'
       AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE '✅ Trigger on_auth_user_created creado';
  ELSE
    RAISE NOTICE 'ℹ️  Trigger on_auth_user_created ya existía — función actualizada';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────────────

-- Ver gimnasios con sus códigos de acceso
SELECT
  id_gimnasio,
  nombre,
  ciudad,
  codigo_acceso,
  estado
FROM gimnasios
ORDER BY nombre;

-- Ver políticas activas en tablas clave
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('gimnasios', 'usuarios')
ORDER BY tablename, policyname;

DO $$
BEGIN
  RAISE NOTICE '✅ Migración 005 completada.';
  RAISE NOTICE '   Código de acceso del gimnasio demo: GYMFIT';
  RAISE NOTICE '   Los nuevos usuarios que usen /signup con código GYMFIT';
  RAISE NOTICE '   quedarán asociados al gym GymFit Lima con rol=miembro.';
END $$;

-- ─── FIN MIGRACIÓN 005 ────────────────────────────────────────────────────────
