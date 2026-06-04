-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 018: fn_get_my_profile devuelve industry_type
-- Fecha: 2026-06-03
-- Schema: public
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   El login de auth-provider.tsx detecta "wrong_system" con la lógica:
--     if (bdResult.tenant_id) → "Cuenta habilitada para otro módulo"
--   Pero el trigger (migr-017) setea public.profiles.tenant_id = gym_tenant_id
--   para CUALQUIER usuario gym (dueño en CASO A, miembro en CASO B).
--   Resultado: todo usuario gym con profiles.tenant_id ≠ null queda atrapado
--   como "wrong_system" cuando gym.usuarios no tiene su fila.
--
--   La lógica correcta es:
--     industry_type = 'gym' → usuario del módulo gym (usar choose_path si no tiene fila)
--     industry_type ≠ 'gym' → pertenece a ONG/RRHH/etc. (usar wrong_system)
--
-- CAMBIOS:
--   1. fn_get_my_profile() actualizada: devuelve campo 'industry_type' del tenant
--   2. El campo 'avatar_url' (agregado en migr-014) se mantiene en el RETURN
--
-- CONTEXTO SISTEMA:
--   public.tenants.industry_type_id → 'gym' | 'ong' | ... (cat_industry_types)
--   public.profiles.tenant_id       → FK a public.tenants.id (NULL = sin sistema)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Reemplazar fn_get_my_profile con campo industry_type
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_get_my_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid         UUID := auth.uid();
  v_row         public.profiles%ROWTYPE;
  v_indtype     TEXT;
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

  -- Resolver industry_type del tenant si existe.
  -- NULL = sin tenant asignado (cuenta recién creada antes del onboarding).
  -- 'gym' = usuario del módulo gym (dueño, miembro o staff).
  -- otro  = ONG, RRHH, u otro módulo del SaaS.
  IF v_row.tenant_id IS NOT NULL THEN
    SELECT t.industry_type_id INTO v_indtype
    FROM   public.tenants t
    WHERE  t.id = v_row.tenant_id;
  END IF;

  RETURN jsonb_build_object(
    'found',            true,
    'id',               v_row.id,
    'full_name',        v_row.full_name,
    'avatar_url',       v_row.avatar_url,        -- agregado en migr-014
    'genero',           v_row.genero,
    'numero_documento', v_row.numero_documento,
    'tenant_id',        v_row.tenant_id,
    'industry_type',    v_indtype                -- NUEVO: 'gym' | 'ong' | NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_my_profile TO authenticated, anon;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: fn_get_my_profile() actualizada con industry_type'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Verificación
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_fn_body      TEXT;
  v_has_indtype  BOOLEAN := FALSE;
  v_has_avatar   BOOLEAN := FALSE;
BEGIN
  SELECT pg_get_functiondef(oid) INTO v_fn_body
  FROM   pg_proc
  WHERE  proname = 'fn_get_my_profile'
    AND  pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  v_has_indtype := v_fn_body LIKE '%industry_type%';
  v_has_avatar  := v_fn_body LIKE '%avatar_url%';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 018 — VERIFICACIÓN';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  Campo industry_type presente : %',
    CASE WHEN v_has_indtype THEN '✅ SÍ' ELSE '❌ NO' END;
  RAISE NOTICE '  Campo avatar_url presente    : %',
    CASE WHEN v_has_avatar  THEN '✅ SÍ' ELSE '❌ NO' END;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  LÓGICA DE DETECCIÓN EN EL FRONTEND:';
  RAISE NOTICE '  industry_type = ''gym''  → usuario gym sin gym.usuarios → choose_path';
  RAISE NOTICE '  industry_type ≠ ''gym'' → pertenece a otro módulo      → wrong_system';
  RAISE NOTICE '  industry_type = NULL   → cuenta sin onboarding          → choose_path';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';

  IF NOT (v_has_indtype AND v_has_avatar) THEN
    RAISE EXCEPTION '❌ Verificación fallida — fn_get_my_profile incompleta';
  END IF;

  RAISE NOTICE '  ✅ Migración 018 correcta.';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Test de smoke: invocar la función como postgres para verificar
--          que devuelve los campos esperados (sin sesión de usuario activa,
--          auth.uid() = NULL → found: false, reason: not_authenticated)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_result JSONB;
BEGIN
  v_result := public.fn_get_my_profile();
  RAISE NOTICE '  Smoke test (sin sesión): %', v_result;

  -- Verificar que el resultado tiene los campos correctos cuando found=false
  IF NOT (v_result ? 'found' AND v_result ? 'reason') THEN
    RAISE EXCEPTION '❌ Smoke test fallido — estructura de respuesta incorrecta';
  END IF;

  RAISE NOTICE '  ✅ Smoke test OK — estructura de respuesta correcta';
END $$;
