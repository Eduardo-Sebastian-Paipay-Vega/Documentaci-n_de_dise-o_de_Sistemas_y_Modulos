-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 018b: Revertir migración 018
-- Fecha: 2026-06-03
-- Schema: public
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROPÓSITO:
--   Revertir COMPLETAMENTE los cambios realizados por la migración 018.
--   Al finalizar, la base de datos queda en el estado estructural y funcional
--   equivalente a tener ejecutadas únicamente las migraciones 001–017.
--
-- CAMBIOS QUE REVIERTE:
--   018 hizo exactamente UN cambio persistente:
--     CREATE OR REPLACE FUNCTION public.fn_get_my_profile()
--       → Añadió variable v_indtype TEXT
--       → Añadió SELECT de industry_type_id desde public.tenants
--       → Añadió campo 'industry_type' en el RETURN jsonb
--
--   Los bloques DO $$ ... $$ de verificación y smoke test de 018
--   son de ejecución inmediata y no crean objetos persistentes.
--   No requieren revert.
--
-- ESTADO OBJETIVO:
--   fn_get_my_profile() == versión definida en migración 014 (PASO 3).
--   Campos retornados: found, id, full_name, avatar_url, genero,
--                      numero_documento, tenant_id
--   Campo NO retornado: industry_type (solo existe en versión 018)
--
-- OBJETOS AFECTADOS:
--   - public.fn_get_my_profile()  ← único objeto modificado por 018
--
-- OBJETOS NO AFECTADOS (018 no los tocó):
--   - public.handle_new_user()
--   - public.user_roles
--   - public.cat_permissions
--   - public.role_permissions
--   - public.codes, public.code_grants, public.code_usages
--   - public.audit_logs
--   - public.profiles
--   - gym.* (todos los objetos del schema gym)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Restaurar fn_get_my_profile() a la versión de migración 014
-- Cuerpo idéntico al definido en 014_universal_avatar.sql PASO 3 (líneas 76-106).
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

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: fn_get_my_profile() restaurada a versión migración 014'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Verificación post-revert
-- Confirma que la función NO contiene industry_type
-- y SÍ contiene avatar_url (campo de migración 014).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_fn_body       TEXT;
  v_has_indtype   BOOLEAN;
  v_has_avatar    BOOLEAN;
  v_has_tenant_id BOOLEAN;
BEGIN
  SELECT pg_get_functiondef(oid) INTO v_fn_body
  FROM   pg_proc
  WHERE  proname = 'fn_get_my_profile'
    AND  pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  IF v_fn_body IS NULL THEN
    RAISE EXCEPTION '❌ fn_get_my_profile() no encontrada en pg_proc';
  END IF;

  v_has_indtype   := v_fn_body LIKE '%industry_type%';
  v_has_avatar    := v_fn_body LIKE '%avatar_url%';
  v_has_tenant_id := v_fn_body LIKE '%tenant_id%';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 018b — VERIFICACIÓN POST-REVERT';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  industry_type presente (debe ser NO) : %',
    CASE WHEN v_has_indtype  THEN '❌ REVERT INCOMPLETO' ELSE '✅ NO presente' END;
  RAISE NOTICE '  avatar_url presente    (debe ser SÍ) : %',
    CASE WHEN v_has_avatar   THEN '✅ SÍ presente' ELSE '❌ FALTA — revisión necesaria' END;
  RAISE NOTICE '  tenant_id presente     (debe ser SÍ) : %',
    CASE WHEN v_has_tenant_id THEN '✅ SÍ presente' ELSE '❌ FALTA — revisión necesaria' END;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';

  IF v_has_indtype THEN
    RAISE EXCEPTION '❌ El campo industry_type sigue presente — revert fallido';
  END IF;

  IF NOT v_has_avatar THEN
    RAISE EXCEPTION '❌ El campo avatar_url no está presente — función incorrecta';
  END IF;

  IF NOT v_has_tenant_id THEN
    RAISE EXCEPTION '❌ El campo tenant_id no está presente — función incorrecta';
  END IF;

  RAISE NOTICE '  ✅ Revert correcto: fn_get_my_profile() == versión migración 014';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Smoke test: invocar la función sin sesión
-- Verifica que la estructura básica de respuesta es correcta.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_result JSONB;
BEGIN
  v_result := public.fn_get_my_profile();

  IF NOT (v_result ? 'found' AND v_result ? 'reason') THEN
    RAISE EXCEPTION '❌ Smoke test fallido — estructura de respuesta incorrecta';
  END IF;

  IF (v_result->>'found')::BOOLEAN IS NOT FALSE THEN
    RAISE EXCEPTION '❌ Smoke test fallido — sin sesión debe retornar found=false';
  END IF;

  IF v_result ? 'industry_type' THEN
    RAISE EXCEPTION '❌ Smoke test fallido — industry_type no debe estar presente';
  END IF;

  RAISE NOTICE '  ✅ Smoke test OK — estructura correcta, sin industry_type';
END $$;
