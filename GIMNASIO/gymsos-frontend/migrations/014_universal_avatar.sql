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
