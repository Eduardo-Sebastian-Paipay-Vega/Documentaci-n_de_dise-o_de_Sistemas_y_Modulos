-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 006: Mover todas las tablas al schema `gym`
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- Prerequisito: migraciones 001-005 aplicadas
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ¿Por qué un schema propio?
--   `public` queda reservado para Supabase (auth helpers, extensiones, etc.).
--   `gym` es el namespace exclusivo de GYMsos — más limpio, más seguro, y
--   evita colisiones con futuras tablas internas de Supabase.
--
-- ANTES DE EJECUTAR — configurar PostgREST en Supabase Dashboard:
--   Settings → API → "Extra schemas to expose via API" → agregar "gym"
--   (sin esto el cliente JS no podrá hacer queries al schema gym)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Crear el schema gym + permisos base
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS gym;

-- Supabase necesita estos grants para que PostgREST pueda acceder al schema
GRANT USAGE ON SCHEMA gym TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  GRANT SELECT ON TABLES TO anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Mover tablas de public → gym
-- Orden respeta dependencias FK (padres primero)
-- ALTER TABLE ... SET SCHEMA preserva datos, índices, constraints y políticas RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- Nivel 0: tablas raíz (sin FK a otras tablas GYMsos)
ALTER TABLE IF EXISTS public.gimnasios              SET SCHEMA gym;
ALTER TABLE IF EXISTS public.marketplace_vendors    SET SCHEMA gym;
ALTER TABLE IF EXISTS public.corporate_clients      SET SCHEMA gym;

-- Nivel 1: dependen de gimnasios
ALTER TABLE IF EXISTS public.usuarios               SET SCHEMA gym;
ALTER TABLE IF EXISTS public.planes                 SET SCHEMA gym;
ALTER TABLE IF EXISTS public.espacios               SET SCHEMA gym;
ALTER TABLE IF EXISTS public.promociones            SET SCHEMA gym;
ALTER TABLE IF EXISTS public.torneos_semanales      SET SCHEMA gym;
ALTER TABLE IF EXISTS public.clanes                 SET SCHEMA gym;
ALTER TABLE IF EXISTS public.dynamic_pricing_log    SET SCHEMA gym;

-- Nivel 2: dependen de usuarios / espacios
ALTER TABLE IF EXISTS public.membresias             SET SCHEMA gym;
ALTER TABLE IF EXISTS public.pagos                  SET SCHEMA gym;
ALTER TABLE IF EXISTS public.accesos                SET SCHEMA gym;
ALTER TABLE IF EXISTS public.asistencias            SET SCHEMA gym;
ALTER TABLE IF EXISTS public.gamification_xp        SET SCHEMA gym;
ALTER TABLE IF EXISTS public.gamification_levels    SET SCHEMA gym;
ALTER TABLE IF EXISTS public.battle_pass_progression SET SCHEMA gym;
ALTER TABLE IF EXISTS public.digital_twin           SET SCHEMA gym;
ALTER TABLE IF EXISTS public.ai_recommendations     SET SCHEMA gym;
ALTER TABLE IF EXISTS public.churn_predictions      SET SCHEMA gym;
ALTER TABLE IF EXISTS public.wearable_sync          SET SCHEMA gym;
ALTER TABLE IF EXISTS public.health_alerts          SET SCHEMA gym;
ALTER TABLE IF EXISTS public.maquinas               SET SCHEMA gym;
ALTER TABLE IF EXISTS public.entrenadores           SET SCHEMA gym;
ALTER TABLE IF EXISTS public.clan_miembros          SET SCHEMA gym;
ALTER TABLE IF EXISTS public.corporate_leaderboards SET SCHEMA gym;
ALTER TABLE IF EXISTS public.marketplace_transactions SET SCHEMA gym;

-- Nivel 3: dependen de entrenadores / espacios
ALTER TABLE IF EXISTS public.clases                 SET SCHEMA gym;

-- Nivel 4: dependen de clases / churn_predictions
ALTER TABLE IF EXISTS public.inscripciones          SET SCHEMA gym;
ALTER TABLE IF EXISTS public.churn_interventions    SET SCHEMA gym;

-- Grants explícitos en las tablas ya movidas
GRANT ALL ON ALL TABLES IN SCHEMA gym TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA gym TO anon;

DO $$ BEGIN RAISE NOTICE '✅ 30 tablas movidas a schema gym'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Actualizar funciones helper RLS
-- Las funciones se quedan en public (donde Supabase las resuelve por defecto),
-- pero ahora consultan gym.usuarios en lugar de public.usuarios.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_gym()
RETURNS UUID AS $$
  SELECT id_gimnasio FROM gym.usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM gym.usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DO $$ BEGIN RAISE NOTICE '✅ get_user_gym() y get_user_rol() apuntan a gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Actualizar trigger handle_new_user
-- Ahora inserta en gym.usuarios en lugar de public.usuarios
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_id_gimnasio UUID;
  v_nombre      TEXT;
  v_rol         TEXT;
  v_telefono    TEXT;
BEGIN
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

  IF v_id_gimnasio IS NOT NULL THEN
    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_id_gimnasio, v_rol, 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ handle_new_user() apunta a gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────────────

-- Tablas en el schema gym
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_activo
FROM pg_tables
WHERE schemaname = 'gym'
ORDER BY tablename;

-- Funciones RLS en public
SELECT
  routine_schema,
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_gym', 'get_user_rol', 'handle_new_user');

DO $$
BEGIN
  RAISE NOTICE '✅ Migración 006 completada.';
  RAISE NOTICE '   Todas las tablas GYMsos están en schema: gym';
  RAISE NOTICE '   Funciones RLS siguen en schema: public (resueltas automáticamente)';
  RAISE NOTICE '';
  RAISE NOTICE '   SIGUIENTE PASO OBLIGATORIO:';
  RAISE NOTICE '   Supabase Dashboard → Settings → API';
  RAISE NOTICE '   → Extra schemas to expose via API → agregar "gym"';
END $$;

-- ─── FIN MIGRACIÓN 006 ────────────────────────────────────────────────────────
