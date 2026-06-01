-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 015: Gym como organización en public.tenants
-- Fecha: 2026-06-01
-- Schema: public + gym
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   Los gimnasios existían solo en gym.gimnasios pero eran invisibles para la
--   BD Maestra. public.profiles.tenant_id quedaba NULL para usuarios gym.
--   Un dueño de gimnasio debe registrar su negocio como ORGANIZACIÓN en la
--   plataforma, igual que una ONG — con su propio tenant en public.tenants.
--
-- CAMBIOS:
--   1. Agrega tenant_id a gym.gimnasios (link bidireccional)
--   2. Backfill: crea public.tenants para cada gym existente
--   3. Backfill: actualiza public.profiles.tenant_id para usuarios gym
--   4. Actualiza handle_new_user → CASO A crea tenant antes del gym
--
-- MAPEO DE PLANES:
--   gym.plan_suscripcion  →  public.cat_plan_types  →  max_licenses
--   pequeno               →  basic                  →  100
--   mediano               →  pro                    →  500
--   grande                →  pro                    →  2000
--   enterprise            →  enterprise             →  99999
--
-- ARQUITECTURA DESPUÉS:
--   public.tenants ← el gym como organización (name, tax_id, industry_type_id='gym')
--       ↑
--   gym.gimnasios.tenant_id (FK)
--       ↑
--   gym.usuarios → public.profiles.tenant_id → public.tenants
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPERS internos de esta migración
-- ─────────────────────────────────────────────────────────────────────────────

-- Función local para mapear plan gym → plan BD Maestra
CREATE OR REPLACE FUNCTION public._gym_plan_to_bd(p_plan TEXT)
RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  SELECT CASE p_plan
    WHEN 'pequeno'    THEN 'basic'
    WHEN 'mediano'    THEN 'pro'
    WHEN 'grande'     THEN 'pro'
    WHEN 'enterprise' THEN 'enterprise'
    ELSE 'basic'
  END;
$$;

CREATE OR REPLACE FUNCTION public._gym_plan_to_licenses(p_plan TEXT)
RETURNS INT LANGUAGE SQL IMMUTABLE AS $$
  SELECT CASE p_plan
    WHEN 'pequeno'    THEN 100
    WHEN 'mediano'    THEN 500
    WHEN 'grande'     THEN 2000
    WHEN 'enterprise' THEN 99999
    ELSE 100
  END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Agregar tenant_id a gym.gimnasios
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE gym.gimnasios
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gimnasios_tenant ON gym.gimnasios(tenant_id);

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: Columna tenant_id agregada a gym.gimnasios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Backfill: crear public.tenants para gyms existentes
-- tax_id: usa el RUC si existe, sino genera placeholder único
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec        RECORD;
  v_tenant_id UUID;
  total      INT := 0;
BEGIN
  FOR rec IN
    SELECT g.id_gimnasio, g.nombre, g.ruc, g.plan_suscripcion, g.estado
    FROM gym.gimnasios g
    WHERE g.tenant_id IS NULL
  LOOP
    -- Crear tenant para este gym
    INSERT INTO public.tenants (
      name,
      tax_id,
      industry_type_id,
      plan_id,
      status_financial_id,
      max_licenses
    )
    VALUES (
      rec.nombre,
      COALESCE(NULLIF(TRIM(rec.ruc), ''), 'PENDIENTE-' || rec.id_gimnasio::text),
      'gym',
      public._gym_plan_to_bd(rec.plan_suscripcion),
      CASE rec.estado
        WHEN 'activo'   THEN 'FIN-ACTIVE'
        WHEN 'pausado'  THEN 'FIN-GRACE'
        WHEN 'cancelado' THEN 'FIN-SUSPENDED'
        ELSE 'FIN-PENDING'
      END,
      public._gym_plan_to_licenses(rec.plan_suscripcion)
    )
    RETURNING id INTO v_tenant_id;

    -- Vincular gym.gimnasios al tenant recién creado
    UPDATE gym.gimnasios
       SET tenant_id = v_tenant_id
     WHERE id_gimnasio = rec.id_gimnasio;

    total := total + 1;
    RAISE NOTICE '  → Tenant creado para gym "%" (id=%): tenant_id=%',
      rec.nombre, rec.id_gimnasio, v_tenant_id;
  END LOOP;

  RAISE NOTICE '✅ PASO 2: % gyms registrados como tenants en BD Maestra', total;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Backfill: actualizar public.profiles.tenant_id para usuarios gym
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles p
   SET tenant_id = g.tenant_id
  FROM gym.usuarios gu
  JOIN gym.gimnasios g ON g.id_gimnasio = gu.id_gimnasio
 WHERE gu.id_usuario = p.id
   AND p.tenant_id IS NULL
   AND g.tenant_id IS NOT NULL;

DO $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.profiles WHERE tenant_id IS NOT NULL;
  RAISE NOTICE '✅ PASO 3: % perfiles de gym vinculados a su tenant', v_count;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Actualizar handle_new_user
-- CASO A ahora: crea public.tenants → gym.gimnasios → gym.codigos_acceso
--              → gym.usuarios → actualiza public.profiles.tenant_id
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
  v_tenant_id     UUID;
  v_codigo        TEXT;
BEGIN
  -- Extraer metadata
  v_nombre    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'),    ''), split_part(NEW.email, '@', 1));
  v_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'),  '');
  v_documento := NULLIF(TRIM(NEW.raw_user_meta_data->>'documento'), '');
  v_genero    := NULLIF(NEW.raw_user_meta_data->>'genero',          '');
  v_cargo     := NULLIF(TRIM(NEW.raw_user_meta_data->>'cargo'),     '');
  v_foto_url  := NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_url'),  '');
  v_rol       := COALESCE(NULLIF(NEW.raw_user_meta_data->>'rol',    ''), 'miembro');

  BEGIN
    v_fecha_nac := (NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE;
  EXCEPTION WHEN OTHERS THEN v_fecha_nac := NULL; END;

  IF v_genero NOT IN ('M', 'F', 'Otro') THEN v_genero := NULL; END IF;

  -- ── SIEMPRE: perfil universal BD Maestra ─────────────────────────────────
  INSERT INTO public.profiles (id, full_name, tipo_documento, numero_documento, genero)
  VALUES (
    NEW.id, v_nombre,
    CASE WHEN v_documento IS NOT NULL THEN 'DNI' ELSE NULL END,
    v_documento, v_genero
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name        = EXCLUDED.full_name,
        tipo_documento   = COALESCE(EXCLUDED.tipo_documento,   profiles.tipo_documento),
        numero_documento = COALESCE(EXCLUDED.numero_documento, profiles.numero_documento),
        genero           = COALESCE(EXCLUDED.genero,           profiles.genero);

  v_gym_nombre := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_nombre'), '');

  -- ── CASO A: Onboarding — dueño registra su gimnasio ──────────────────────
  IF v_gym_nombre IS NOT NULL THEN
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Perú');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

    -- 1. Registrar el gym como ORGANIZACIÓN en BD Maestra
    INSERT INTO public.tenants (
      name, tax_id, industry_type_id, plan_id, status_financial_id, max_licenses
    )
    VALUES (
      v_gym_nombre,
      COALESCE(v_gym_ruc, 'PENDIENTE-' || gen_random_uuid()::text),
      'gym',
      public._gym_plan_to_bd(v_gym_plan),
      'FIN-PENDING',
      public._gym_plan_to_licenses(v_gym_plan)
    )
    RETURNING id INTO v_tenant_id;

    -- 2. Crear el gym con link al tenant
    v_codigo := public.generate_gym_code(v_gym_nombre);

    INSERT INTO gym.gimnasios (
      nombre, ruc, ciudad, pais, direccion, telefono, email,
      plan_suscripcion, estado, tenant_id
    )
    VALUES (
      v_gym_nombre, v_gym_ruc, v_gym_ciudad, v_gym_pais, v_gym_direccion,
      v_gym_telefono, v_gym_email, v_gym_plan, 'activo', v_tenant_id
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    -- 3. Código de acceso
    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_id_gimnasio, v_codigo, 'general', 'Codigo principal del gimnasio');

    -- 4. Perfil operativo gym del dueño
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

    -- 5. Vincular perfil universal al tenant del gym
    UPDATE public.profiles
       SET tenant_id = v_tenant_id
     WHERE id = NEW.id;

  -- ── CASO B: Signup de miembro con código de acceso ────────────────────────
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

    -- Vincular al tenant del gym al que se une
    UPDATE public.profiles p
       SET tenant_id = g.tenant_id
      FROM gym.gimnasios g
     WHERE g.id_gimnasio = v_id_gimnasio
       AND p.id = NEW.id
       AND g.tenant_id IS NOT NULL;

  -- ── CASO C: Otro sistema (ONG, RRHH, etc.) ───────────────────────────────
  -- Su sistema correspondiente asigna tenant_id cuando corresponda
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user FALLÓ para % (%) — Error: % [%]',
    NEW.email, NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ PASO 4: handle_new_user actualizado — CASO A crea tenant primero'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Limpiar helpers temporales
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public._gym_plan_to_bd(TEXT);
DROP FUNCTION IF EXISTS public._gym_plan_to_licenses(TEXT);

DO $$ BEGIN RAISE NOTICE '✅ PASO 5: Helpers temporales eliminados'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_gyms_con_tenant    INT;
  v_gyms_sin_tenant    INT;
  v_profiles_con_tenant INT;
  v_profiles_sin_tenant INT;
  v_total_tenants_gym  INT;
  v_rec                RECORD;
BEGIN
  SELECT COUNT(*) INTO v_gyms_con_tenant FROM gym.gimnasios WHERE tenant_id IS NOT NULL;
  SELECT COUNT(*) INTO v_gyms_sin_tenant FROM gym.gimnasios WHERE tenant_id IS NULL;

  SELECT COUNT(*) INTO v_profiles_con_tenant
  FROM public.profiles p
  JOIN gym.usuarios gu ON gu.id_usuario = p.id
  WHERE p.tenant_id IS NOT NULL;

  SELECT COUNT(*) INTO v_profiles_sin_tenant
  FROM public.profiles p
  JOIN gym.usuarios gu ON gu.id_usuario = p.id
  WHERE p.tenant_id IS NULL;

  SELECT COUNT(*) INTO v_total_tenants_gym
  FROM public.tenants WHERE industry_type_id = 'gym';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 015 — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  public.tenants tipo gym        : %', v_total_tenants_gym;
  RAISE NOTICE '  gym.gimnasios con tenant_id    : %', v_gyms_con_tenant;
  RAISE NOTICE '  gym.gimnasios sin tenant_id    : % (debe ser 0)', v_gyms_sin_tenant;
  RAISE NOTICE '  profiles gym con tenant_id     : %', v_profiles_con_tenant;
  RAISE NOTICE '  profiles gym sin tenant_id     : % (debe ser 0)', v_profiles_sin_tenant;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE '  Tenants gym registrados:';

  FOR v_rec IN
    SELECT t.id, t.name, t.plan_id, t.status_financial_id, g.id_gimnasio
    FROM public.tenants t
    JOIN gym.gimnasios g ON g.tenant_id = t.id
    WHERE t.industry_type_id = 'gym'
    ORDER BY t.created_at
  LOOP
    RAISE NOTICE '  [%] % — plan=% estado=%',
      v_rec.id_gimnasio, v_rec.name, v_rec.plan_id, v_rec.status_financial_id;
  END LOOP;

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  FLUJO /onboarding DESPUÉS DE ESTA MIGRACIÓN:';
  RAISE NOTICE '  1. signUp() con metadata gym_nombre, gym_ruc, gym_plan...';
  RAISE NOTICE '  2. handle_new_user CASO A:';
  RAISE NOTICE '     a. INSERT public.tenants (gym como organización)';
  RAISE NOTICE '     b. INSERT gym.gimnasios  (linked al tenant)';
  RAISE NOTICE '     c. INSERT gym.codigos_acceso';
  RAISE NOTICE '     d. INSERT gym.usuarios   (gerente)';
  RAISE NOTICE '     e. UPDATE public.profiles.tenant_id';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
