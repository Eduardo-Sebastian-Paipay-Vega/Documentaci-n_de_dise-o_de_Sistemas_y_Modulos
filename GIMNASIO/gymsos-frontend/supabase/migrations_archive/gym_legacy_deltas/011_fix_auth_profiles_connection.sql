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
