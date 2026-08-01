-- 20260701040000_core_fixes_profiles_avatar.sql
-- Capa 4 · Fixes auth/profiles, RLS profiles y gym.usuarios, avatar universal
-- PROVENIENCIA (materializado Fase 4, sin pérdida de lógica): 011 + 012 + 013 + 014
-- Generado: 2026-07-04. Ver MIGRATION_STRATEGY.md

-- ===== [FUENTE] 011_fix_auth_profiles_connection.sql =====
-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 011: Conexión auth ↔ public.profiles ↔ gym.usuarios
-- Fecha: 2026-06-01
-- Schema: public + gym
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   El trigger handle_new_user nunca insertaba en public.profiles.
--   Los usuarios creados por el módulo gym eran invisibles para la BD Maestra:
--     auth.users → gym.usuarios   ✅ (existía)
--     auth.users → public.profiles ❌ (nunca se creaba desde gym)
--
--   Consecuencia: login fallaba con 406 cuando el trigger fallaba silenciosamente
--   porque gym.usuarios tampoco se creaba (EXCEPTION WHEN OTHERS tragaba el error).
--
-- CAMBIOS:
--   1. Reparación manual de usuarios huérfanos (sedbasnews@gmail.com + backfill)
--   2. handle_new_user actualizado — conecta SIEMPRE con public.profiles
--   3. Backfill — gym.usuarios existentes sin public.profiles
--
-- ARQUITECTURA DESPUÉS DE ESTA MIGRACIÓN:
--   auth.users
--     └── handle_new_user trigger
--           ├── SIEMPRE → INSERT public.profiles      (BD Maestra universal)
--           ├── CASO A  → INSERT gym.gimnasios         (onboarding dueño)
--           │             INSERT gym.codigos_acceso
--           │             INSERT gym.usuarios (rol=gerente)
--           ├── CASO B  → INSERT gym.usuarios (rol=miembro/staff)
--           └── CASO C  → solo public.profiles (ONG, RRHH, etc.)
--
-- USUARIOS REPARADOS:
--   sedbasnews@gmail.com  → gym "BOTI FIT" creado + gym.usuarios + public.profiles
--   Todos los gym.usuarios sin public.profiles → backfill en PASO 3
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Reparación manual: sedbasnews@gmail.com
-- Contexto: hizo onboarding de "BOTI FIT" el 2026-05-30 pero el trigger
-- falló silenciosamente (EXCEPTION) → ni gym ni usuario fueron creados.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_user_id UUID := '6fd0f1ba-bba6-4e9d-ad27-99680ef8c7ed';
  v_gym_id  UUID;
  v_codigo  TEXT;
BEGIN
  -- Idempotente: solo ejecuta si el gym no existe ya
  SELECT id_gimnasio INTO v_gym_id
  FROM gym.gimnasios
  WHERE nombre = 'BOTI FIT'
  LIMIT 1;

  IF v_gym_id IS NULL THEN
    INSERT INTO gym.gimnasios (nombre, ciudad, pais, plan_suscripcion, estado)
    VALUES ('BOTI FIT', 'Lima', 'Perú', 'mediano', 'activo')
    RETURNING id_gimnasio INTO v_gym_id;

    v_codigo := public.generate_gym_code('BOTI FIT');

    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_gym_id, v_codigo, 'general', 'Código principal del gimnasio');

    RAISE NOTICE '✅ Gym BOTI FIT creado: id=% código=%', v_gym_id, v_codigo;
  ELSE
    RAISE NOTICE 'ℹ️  Gym BOTI FIT ya existía: id=%', v_gym_id;
  END IF;

  -- gym.usuarios
  INSERT INTO gym.usuarios (id_usuario, email, nombre, id_gimnasio, rol, estado, cargo)
  VALUES (v_user_id, 'sedbasnews@gmail.com', 'Botas', v_gym_id, 'gerente', 'activo', 'Gerente General')
  ON CONFLICT (id_usuario) DO NOTHING;

  -- public.profiles (BD Maestra)
  INSERT INTO public.profiles (id, full_name)
  VALUES (v_user_id, 'Botas')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✅ PASO 1: sedbasnews@gmail.com reparado — puede hacer login';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Reemplazar handle_new_user
-- Cambio principal: UPSERT en public.profiles ANTES de cualquier lógica gym.
-- El EXCEPTION ahora loguea el error real en lugar de silenciarlo.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_nombre        TEXT;
  v_telefono      TEXT;
  v_documento     TEXT;
  v_fecha_nac     DATE;
  v_genero        TEXT;
  v_cargo         TEXT;
  v_foto_url      TEXT;
  v_rol           TEXT;
  v_gym_nombre    TEXT;
  v_gym_ruc       TEXT;
  v_gym_ciudad    TEXT;
  v_gym_pais      TEXT;
  v_gym_direccion TEXT;
  v_gym_telefono  TEXT;
  v_gym_email     TEXT;
  v_gym_plan      TEXT;
  v_id_gimnasio   UUID;
  v_codigo        TEXT;
BEGIN
  -- Extraer metadata enviada desde el frontend
  v_nombre    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'),    ''), split_part(NEW.email, '@', 1));
  v_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'),  '');
  v_documento := NULLIF(TRIM(NEW.raw_user_meta_data->>'documento'), '');
  v_genero    := NULLIF(NEW.raw_user_meta_data->>'genero',          '');
  v_cargo     := NULLIF(TRIM(NEW.raw_user_meta_data->>'cargo'),     '');
  v_foto_url  := NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_url'),  '');
  v_rol       := COALESCE(NULLIF(NEW.raw_user_meta_data->>'rol',    ''), 'miembro');

  BEGIN
    v_fecha_nac := (NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_fecha_nac := NULL;
  END;

  IF v_genero NOT IN ('M', 'F', 'Otro') THEN v_genero := NULL; END IF;

  -- ── SIEMPRE — perfil universal BD Maestra ──────────────────────────────────
  -- Cualquier usuario de cualquier sistema (gym, ONG, RRHH, etc.)
  -- debe existir en public.profiles como fuente de verdad de identidad.
  INSERT INTO public.profiles (id, full_name, tipo_documento, numero_documento, genero)
  VALUES (
    NEW.id,
    v_nombre,
    CASE WHEN v_documento IS NOT NULL THEN 'DNI' ELSE NULL END,
    v_documento,
    v_genero
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name        = EXCLUDED.full_name,
        tipo_documento   = COALESCE(EXCLUDED.tipo_documento,   profiles.tipo_documento),
        numero_documento = COALESCE(EXCLUDED.numero_documento, profiles.numero_documento),
        genero           = COALESCE(EXCLUDED.genero,           profiles.genero);

  v_gym_nombre := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_nombre'), '');

  -- ── CASO A — Onboarding: dueño registra su gimnasio ───────────────────────
  IF v_gym_nombre IS NOT NULL THEN
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Perú');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

    v_codigo := public.generate_gym_code(v_gym_nombre);

    INSERT INTO gym.gimnasios (
      nombre, ruc, ciudad, pais, direccion, telefono, email, plan_suscripcion, estado
    )
    VALUES (
      v_gym_nombre, v_gym_ruc, v_gym_ciudad, v_gym_pais, v_gym_direccion,
      v_gym_telefono, v_gym_email, v_gym_plan, 'activo'
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_id_gimnasio, v_codigo, 'general', 'Codigo principal del gimnasio');

    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, cargo, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, COALESCE(v_cargo, 'Gerente General'),
      v_id_gimnasio, 'gerente', 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

  -- ── CASO B — Signup de miembro/staff con código de gimnasio ───────────────
  ELSIF NEW.raw_user_meta_data->>'id_gimnasio' IS NOT NULL THEN
    v_id_gimnasio := (NEW.raw_user_meta_data->>'id_gimnasio')::uuid;

    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, v_id_gimnasio, v_rol, 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

  -- ── CASO C — Otro sistema (ONG, RRHH, etc.) ───────────────────────────────
  -- Solo se creó public.profiles arriba. El sistema correspondiente
  -- (trigger ONG, RPC de RRHH, etc.) crea su propio registro operativo.
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Ya no falla silenciosamente: loguea el error real con contexto completo.
  -- El RETURN NEW garantiza que auth.users siempre se crea aunque el trigger falle.
  RAISE WARNING 'handle_new_user FALLÓ para usuario % (%) — Error: % [SQLSTATE: %]',
    NEW.email, NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ PASO 2: handle_new_user actualizado — conecta con public.profiles'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Backfill: conectar gym.usuarios existentes a public.profiles
-- Todos los usuarios gym creados ANTES de esta migración no tienen
-- public.profiles. Este backfill cierra la brecha retroactivamente.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.profiles (id, full_name)
SELECT
  gu.id_usuario,
  gu.nombre
FROM gym.usuarios gu
LEFT JOIN public.profiles p ON p.id = gu.id_usuario
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM gym.usuarios gu
  LEFT JOIN public.profiles p ON p.id = gu.id_usuario
  WHERE p.id IS NULL;

  IF v_count = 0 THEN
    RAISE NOTICE '✅ PASO 3: Backfill completo — todos los gym.usuarios tienen public.profiles';
  ELSE
    RAISE WARNING '⚠️  PASO 3: Quedan % usuarios de gym sin public.profiles', v_count;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_total_auth        INT;
  v_total_profiles    INT;
  v_total_gym         INT;
  v_huerfanos_gym     INT;  -- gym.usuarios sin public.profiles
  v_huerfanos_auth    INT;  -- auth.users sin public.profiles
  v_sedba_gym         INT;
  v_sedba_profile     INT;
BEGIN
  SELECT COUNT(*) INTO v_total_auth     FROM auth.users;
  SELECT COUNT(*) INTO v_total_profiles FROM public.profiles;
  SELECT COUNT(*) INTO v_total_gym      FROM gym.usuarios;

  SELECT COUNT(*) INTO v_huerfanos_gym
  FROM gym.usuarios gu
  LEFT JOIN public.profiles p ON p.id = gu.id_usuario
  WHERE p.id IS NULL;

  SELECT COUNT(*) INTO v_huerfanos_auth
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.id IS NULL
    AND u.email NOT LIKE '%@gymsos.demo';  -- ignorar usuarios demo

  SELECT COUNT(*) INTO v_sedba_gym
  FROM gym.usuarios WHERE id_usuario = '6fd0f1ba-bba6-4e9d-ad27-99680ef8c7ed';

  SELECT COUNT(*) INTO v_sedba_profile
  FROM public.profiles WHERE id = '6fd0f1ba-bba6-4e9d-ad27-99680ef8c7ed';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 011 — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  auth.users total        : %', v_total_auth;
  RAISE NOTICE '  public.profiles total   : %', v_total_profiles;
  RAISE NOTICE '  gym.usuarios total      : %', v_total_gym;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE '  gym sin profiles        : % (debe ser 0)', v_huerfanos_gym;
  RAISE NOTICE '  auth sin profiles*      : % (*excluye demo)', v_huerfanos_auth;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE '  sedbasnews gym.usuarios : %', CASE WHEN v_sedba_gym > 0     THEN '✅ OK' ELSE '❌ FALTA' END;
  RAISE NOTICE '  sedbasnews profiles     : %', CASE WHEN v_sedba_profile > 0 THEN '✅ OK' ELSE '❌ FALTA' END;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ESTADO DESPUÉS DE LA MIGRACIÓN:';
  RAISE NOTICE '  auth.users';
  RAISE NOTICE '    └── handle_new_user trigger';
  RAISE NOTICE '          ├── SIEMPRE → public.profiles (BD Maestra universal)';
  RAISE NOTICE '          ├── CASO A  → gym.gimnasios + gym.codigos_acceso + gym.usuarios';
  RAISE NOTICE '          ├── CASO B  → gym.usuarios (miembro/staff con código)';
  RAISE NOTICE '          └── CASO C  → solo public.profiles (ONG, RRHH, etc.)';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

-- ===== [FUENTE] 012_fix_profiles_rls_and_rpc.sql =====
-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 012: RLS public.profiles + RPC fn_get_my_profile
-- Fecha: 2026-06-01
-- Schema: public
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   El cliente supabasePublic (schema=public) es una instancia JS separada del
--   cliente supabase (schema=gym). Aunque comparten localStorage, en el momento
--   exacto del login el JWT puede no estar propagado aún al segundo cliente.
--   Resultado: public.profiles devuelve 406 aunque el usuario esté autenticado.
--
--   Solución: RPC fn_get_my_profile() con SECURITY DEFINER — corre como postgres,
--   ignora RLS, y siempre tiene acceso al auth.uid() del JWT actual.
--
-- CAMBIOS:
--   1. RLS correcto en public.profiles (policies para authenticated)
--   2. RPC fn_get_my_profile() — lectura segura del propio perfil
--   3. Backfill re-ejecutado con logging por usuario
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — RLS en public.profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_select"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_all"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self"  ON public.profiles;

-- Cada usuario solo ve su propio perfil
CREATE POLICY "profiles_self_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- El trigger handle_new_user corre como SECURITY DEFINER (postgres), no necesita policy.
-- service_role y postgres tienen bypass de RLS por defecto en Supabase.

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL            ON public.profiles TO postgres, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: RLS configurado en public.profiles'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — RPC fn_get_my_profile()
-- SECURITY DEFINER → corre como postgres, ignora RLS.
-- Devuelve el perfil BD Maestra del usuario autenticado.
-- Incluye tenant_id para detectar si pertenece a otro sistema (ONG, RRHH, etc.)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_get_my_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.profiles%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'found',  false,
      'reason', 'not_authenticated'
    );
  END IF;

  SELECT * INTO v_row FROM public.profiles WHERE id = v_uid;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object(
      'found',  false,
      'reason', 'no_profile'
    );
  END IF;

  RETURN jsonb_build_object(
    'found',            true,
    'id',               v_row.id,
    'full_name',        v_row.full_name,
    'genero',           v_row.genero,
    'numero_documento', v_row.numero_documento,
    'tenant_id',        v_row.tenant_id    -- NULL = sin sistema asignado
                                           -- NOT NULL = pertenece a ONG/RRHH/etc.
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_my_profile TO authenticated, anon;

DO $$ BEGIN RAISE NOTICE '✅ PASO 2: fn_get_my_profile() creada (SECURITY DEFINER)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Backfill robusto con logging individual
-- Re-ejecuta el backfill e imprime cada usuario insertado.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec   RECORD;
  total INT := 0;
BEGIN
  FOR rec IN
    SELECT gu.id_usuario, gu.nombre, gu.email
    FROM gym.usuarios gu
    LEFT JOIN public.profiles p ON p.id = gu.id_usuario
    WHERE p.id IS NULL
  LOOP
    INSERT INTO public.profiles (id, full_name)
    VALUES (rec.id_usuario, rec.nombre)
    ON CONFLICT (id) DO NOTHING;

    total := total + 1;
    RAISE NOTICE '  → profiles creado para: % (%)', rec.email, rec.id_usuario;
  END LOOP;

  RAISE NOTICE '✅ PASO 3: Backfill completo — % usuarios insertados en public.profiles', total;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_profiles_count  INT;
  v_huerfanos_gym   INT;
  v_fn_exists       TEXT;
  v_rls_enabled     BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO v_profiles_count FROM public.profiles;

  SELECT COUNT(*) INTO v_huerfanos_gym
  FROM gym.usuarios gu
  LEFT JOIN public.profiles p ON p.id = gu.id_usuario
  WHERE p.id IS NULL;

  SELECT p.proname INTO v_fn_exists
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'fn_get_my_profile';

  SELECT relrowsecurity INTO v_rls_enabled
  FROM pg_class
  WHERE relname = 'profiles' AND relnamespace = 'public'::regnamespace;

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 012 — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  public.profiles total      : %', v_profiles_count;
  RAISE NOTICE '  gym sin profiles (debe=0)  : %', v_huerfanos_gym;
  RAISE NOTICE '  RLS habilitado             : %', CASE WHEN v_rls_enabled THEN '✅ SÍ' ELSE '❌ NO' END;
  RAISE NOTICE '  fn_get_my_profile()        : %', CASE WHEN v_fn_exists IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  FLUJO DE LOGIN DESPUÉS DE ESTA MIGRACIÓN:';
  RAISE NOTICE '  1. signInWithPassword()   → auth.users ✓';
  RAISE NOTICE '  2. fn_get_my_profile()    → public.profiles (SECURITY DEFINER)';
  RAISE NOTICE '     found=false            → "Cuenta no configurada"';
  RAISE NOTICE '     found=true, tenant_id≠null, sin gym → "Otro sistema (ONG)"';
  RAISE NOTICE '     found=true, tenant_id=null, sin gym → modal: dueño / miembro';
  RAISE NOTICE '     found=true + gym.usuarios → login OK → dashboard';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

-- ===== [FUENTE] 013_fix_gym_usuarios_rls.sql =====
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

-- ===== [FUENTE] 014_universal_avatar.sql =====
-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 014: Avatar universal en public.profiles
-- Fecha: 2026-06-01
-- Schema: public + gym
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   foto_url solo existía en gym.usuarios — un usuario de ONG u otro sistema
--   no tenía dónde guardar su avatar. El avatar debe ser universal (BD Maestra).
--
-- CAMBIOS:
--   1. Agrega avatar_url a public.profiles
--   2. RPC fn_update_my_avatar() — actualiza ambas tablas atómicamente
--   3. Actualiza fn_get_my_profile() — devuelve avatar_url
--   4. Backfill: copia gym.usuarios.foto_url → public.profiles.avatar_url
--
-- ARQUITECTURA DESPUÉS:
--   public.profiles.avatar_url  → fuente de verdad universal (todos los sistemas)
--   gym.usuarios.foto_url       → copia sincronizada para el módulo gym
--   Supabase Storage / avatars  → archivo físico ({userId}/avatar.{ext})
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Agregar avatar_url a public.profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: Columna avatar_url agregada a public.profiles'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — RPC fn_update_my_avatar()
-- Actualiza el avatar en ambas tablas de forma atómica.
-- SECURITY DEFINER garantiza que el UPDATE en gym.usuarios funcione
-- incluso si el cliente secundario (supabasePublic) aún no propagó el JWT.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_update_my_avatar(p_url TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, gym
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Actualizar fuente de verdad universal
  UPDATE public.profiles
     SET avatar_url = p_url,
         updated_at = now()
   WHERE id = v_uid;

  -- Sincronizar en gym.usuarios (si el usuario tiene perfil gym)
  UPDATE gym.usuarios
     SET foto_url   = p_url,
         updated_at = now()
   WHERE id_usuario = v_uid;

  RETURN jsonb_build_object('ok', true, 'avatar_url', p_url);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_update_my_avatar TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ PASO 2: fn_update_my_avatar() creada (actualiza profiles + gym.usuarios)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Actualizar fn_get_my_profile() para incluir avatar_url
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_get_my_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.profiles%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'not_authenticated');
  END IF;

  SELECT * INTO v_row FROM public.profiles WHERE id = v_uid;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_profile');
  END IF;

  RETURN jsonb_build_object(
    'found',            true,
    'id',               v_row.id,
    'full_name',        v_row.full_name,
    'avatar_url',       v_row.avatar_url,
    'genero',           v_row.genero,
    'numero_documento', v_row.numero_documento,
    'tenant_id',        v_row.tenant_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_my_profile TO authenticated, anon;

DO $$ BEGIN RAISE NOTICE '✅ PASO 3: fn_get_my_profile() actualizada — incluye avatar_url'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Backfill: copiar foto_url existente de gym.usuarios → public.profiles
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles p
   SET avatar_url = gu.foto_url
  FROM gym.usuarios gu
 WHERE gu.id_usuario = p.id
   AND gu.foto_url IS NOT NULL
   AND p.avatar_url IS NULL;

DO $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.profiles WHERE avatar_url IS NOT NULL;
  RAISE NOTICE '✅ PASO 4: Backfill completo — % perfiles con avatar_url', v_count;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_col_exists   BOOLEAN;
  v_fn_avatar    TEXT;
  v_fn_profile   TEXT;
  v_con_avatar   INT;
  v_sin_avatar   INT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) INTO v_col_exists;

  SELECT p.proname INTO v_fn_avatar
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'fn_update_my_avatar';

  SELECT p.proname INTO v_fn_profile
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'fn_get_my_profile';

  SELECT COUNT(*) INTO v_con_avatar FROM public.profiles WHERE avatar_url IS NOT NULL;
  SELECT COUNT(*) INTO v_sin_avatar FROM public.profiles WHERE avatar_url IS NULL;

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 014 — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  profiles.avatar_url columna : %', CASE WHEN v_col_exists  THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_update_my_avatar()        : %', CASE WHEN v_fn_avatar  IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_get_my_profile() (v2)     : %', CASE WHEN v_fn_profile IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE '  Perfiles con avatar          : %', v_con_avatar;
  RAISE NOTICE '  Perfiles sin avatar          : %', v_sin_avatar;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  FLUJO DE AVATAR DESPUÉS:';
  RAISE NOTICE '  1. Usuario sube foto → Supabase Storage (avatars/{userId}/avatar.ext)';
  RAISE NOTICE '  2. Frontend llama fn_update_my_avatar(url)';
  RAISE NOTICE '     → UPDATE public.profiles.avatar_url  (universal)';
  RAISE NOTICE '     → UPDATE gym.usuarios.foto_url        (gym sync)';
  RAISE NOTICE '  3. fn_get_my_profile() devuelve avatar_url en el login';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

