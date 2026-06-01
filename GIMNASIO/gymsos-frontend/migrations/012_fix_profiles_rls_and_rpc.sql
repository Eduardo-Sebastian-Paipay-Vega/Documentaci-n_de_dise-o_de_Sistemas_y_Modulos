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
