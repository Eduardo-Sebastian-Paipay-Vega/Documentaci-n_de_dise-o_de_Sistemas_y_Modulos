-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 015b: Crear public.audit_logs + completar 015
-- Fecha: 2026-06-01
-- Schema: public
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   La migración 015 falló porque public.tenants tiene un trigger
--   fn_trigger_audit_universal() que intenta insertar en public.audit_logs,
--   pero esa tabla no existe en este entorno.
--
-- ESTADO PREVIO (lo que SÍ se ejecutó en 015):
--   ✅ gym.gimnasios.tenant_id columna agregada (PASO 1)
--   ✅ Funciones helper _gym_plan_to_bd() y _gym_plan_to_licenses() creadas
--   ❌ Backfill de tenants fallido (PASO 2)
--   ❌ Backfill de profiles.tenant_id (PASO 3)
--   ❌ handle_new_user NO actualizado (PASO 4)
--
-- PASOS DE ESTE PARCHE:
--   1. Crear public.audit_logs (satisface el trigger existente)
--   2. Re-ejecutar backfill de tenants (PASO 2 de 015)
--   3. Re-ejecutar backfill de profiles (PASO 3 de 015)
--   4. Re-ejecutar handle_new_user (PASO 4 de 015)
--   5. Limpiar helpers (PASO 5 de 015)
--   6. Verificación final
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Crear public.audit_logs
-- Estructura derivada del trigger fn_trigger_audit_universal() existente.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        REFERENCES public.tenants(id) ON DELETE SET NULL,
  actor_id         UUID        REFERENCES auth.users(id)     ON DELETE SET NULL,
  event_type       TEXT        NOT NULL,   -- INSERT, UPDATE, DELETE
  resource_name    TEXT        NOT NULL,   -- nombre de la tabla auditada
  payload_before   JSONB,                  -- estado anterior (null en INSERT)
  payload_after    JSONB,                  -- estado nuevo    (null en DELETE)
  ip               INET,
  user_agent       TEXT,
  retention_until  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant    ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor     ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event     ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource  ON public.audit_logs(resource_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created   ON public.audit_logs(created_at DESC);

-- RLS: cada tenant solo ve sus propios logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_tenant_select" ON public.audit_logs;
CREATE POLICY "audit_logs_tenant_select" ON public.audit_logs
  FOR SELECT USING (tenant_id = public.fn_current_tenant_id());

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL    ON public.audit_logs TO postgres, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: public.audit_logs creada — trigger fn_trigger_audit_universal() ya puede funcionar'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Re-ejecutar backfill de tenants (de 015, idempotente)
-- Los helpers _gym_plan_to_bd/_gym_plan_to_licenses pueden seguir existiendo
-- de la 015 parcial o necesitar recreación — usamos CREATE OR REPLACE.
-- ─────────────────────────────────────────────────────────────────────────────

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

DO $$
DECLARE
  rec          RECORD;
  v_tenant_id  UUID;
  total        INT := 0;
BEGIN
  FOR rec IN
    SELECT g.id_gimnasio, g.nombre, g.ruc, g.plan_suscripcion, g.estado
    FROM gym.gimnasios g
    WHERE g.tenant_id IS NULL
  LOOP
    INSERT INTO public.tenants (
      name, tax_id, industry_type_id, plan_id, status_financial_id, max_licenses
    )
    VALUES (
      rec.nombre,
      COALESCE(NULLIF(TRIM(rec.ruc), ''), 'PENDIENTE-' || rec.id_gimnasio::text),
      'gym',
      public._gym_plan_to_bd(rec.plan_suscripcion),
      CASE rec.estado
        WHEN 'activo'    THEN 'FIN-ACTIVE'
        WHEN 'pausado'   THEN 'FIN-GRACE'
        WHEN 'cancelado' THEN 'FIN-SUSPENDED'
        ELSE 'FIN-PENDING'
      END,
      public._gym_plan_to_licenses(rec.plan_suscripcion)
    )
    RETURNING id INTO v_tenant_id;

    UPDATE gym.gimnasios
       SET tenant_id = v_tenant_id
     WHERE id_gimnasio = rec.id_gimnasio;

    total := total + 1;
    RAISE NOTICE '  → Tenant creado para gym "%" : tenant_id=%', rec.nombre, v_tenant_id;
  END LOOP;

  IF total = 0 THEN
    RAISE NOTICE 'ℹ️  Todos los gyms ya tienen tenant_id — backfill omitido';
  ELSE
    RAISE NOTICE '✅ PASO 2: % gyms registrados como tenants', total;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Re-ejecutar backfill de public.profiles.tenant_id
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
  SELECT COUNT(*) INTO v_count FROM public.profiles WHERE tenant_id IS NOT NULL;
  RAISE NOTICE '✅ PASO 3: % perfiles con tenant_id asignado', v_count;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — handle_new_user actualizado (idéntico al PASO 4 de 015)
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

  -- SIEMPRE: perfil universal
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

  -- CASO A: Onboarding
  IF v_gym_nombre IS NOT NULL THEN
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Perú');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

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

    UPDATE public.profiles SET tenant_id = v_tenant_id WHERE id = NEW.id;

  -- CASO B: Signup de miembro
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

    UPDATE public.profiles p
       SET tenant_id = g.tenant_id
      FROM gym.gimnasios g
     WHERE g.id_gimnasio = v_id_gimnasio
       AND p.id = NEW.id
       AND g.tenant_id IS NOT NULL;

  -- CASO C: Otro sistema
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user FALLÓ para % (%) — Error: % [%]',
    NEW.email, NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ PASO 4: handle_new_user actualizado'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Limpiar helpers (permanentes para handle_new_user los dejamos)
-- Los helpers _gym_plan_to_bd y _gym_plan_to_licenses los MANTIENE handle_new_user
-- Así que los dejamos como funciones permanentes con un nombre limpio.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN RAISE NOTICE '✅ PASO 5: Helpers mantenidos (los usa handle_new_user internamente)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_audit_exists       BOOLEAN;
  v_gyms_con_tenant    INT;
  v_gyms_sin_tenant    INT;
  v_profiles_con_tenant INT;
  v_total_tenants_gym  INT;
  v_rec                RECORD;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) INTO v_audit_exists;

  SELECT COUNT(*) INTO v_gyms_con_tenant  FROM gym.gimnasios WHERE tenant_id IS NOT NULL;
  SELECT COUNT(*) INTO v_gyms_sin_tenant  FROM gym.gimnasios WHERE tenant_id IS NULL;
  SELECT COUNT(*) INTO v_total_tenants_gym FROM public.tenants WHERE industry_type_id = 'gym';

  SELECT COUNT(*) INTO v_profiles_con_tenant
  FROM public.profiles p
  JOIN gym.usuarios gu ON gu.id_usuario = p.id
  WHERE p.tenant_id IS NOT NULL;

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 015b — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  public.audit_logs          : %', CASE WHEN v_audit_exists THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  public.tenants tipo gym    : %', v_total_tenants_gym;
  RAISE NOTICE '  gym.gimnasios con tenant   : %', v_gyms_con_tenant;
  RAISE NOTICE '  gym.gimnasios sin tenant   : % (debe ser 0)', v_gyms_sin_tenant;
  RAISE NOTICE '  profiles gym con tenant    : %', v_profiles_con_tenant;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';

  FOR v_rec IN
    SELECT t.name, t.plan_id, t.status_financial_id, g.id_gimnasio
    FROM public.tenants t
    JOIN gym.gimnasios g ON g.tenant_id = t.id
    WHERE t.industry_type_id = 'gym'
  LOOP
    RAISE NOTICE '  [gym] % — plan=% estado=%',
      v_rec.name, v_rec.plan_id, v_rec.status_financial_id;
  END LOOP;

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
