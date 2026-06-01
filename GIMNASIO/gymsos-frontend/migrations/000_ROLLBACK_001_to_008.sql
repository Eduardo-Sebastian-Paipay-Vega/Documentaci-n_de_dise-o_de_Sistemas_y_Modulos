-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — ROLLBACK COMPLETO: Migraciones 001 → 008
-- Fecha: 2026-05-31
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROPÓSITO:
--   Revierte TODO lo que hicieron las migraciones 001-008, dejando la BD
--   exactamente igual al estado después de ejecutar supabase-schema.sql.
--
-- ESTADO OBJETIVO:
--   - Todas las tablas GYMsos en schema PUBLIC (no gym)
--   - Solo las políticas RLS del supabase-schema.sql original
--   - handle_new_user() vacío (solo RETURN NEW)
--   - get_user_gym() y get_user_rol() apuntan a public.usuarios
--   - Sin funciones RPC extra (rpc_registrar_nuevo_miembro, etc.)
--   - Sin schema gym
--   - Las 9 tablas eliminadas en 003 restauradas
--
-- ⚠️  ADVERTENCIAS:
--   1. Este script ELIMINA todos los datos de cuentas seed (gerente@gymsos.io, etc.)
--   2. La eliminación de auth.users debe hacerse manualmente en Supabase Dashboard
--   3. Si hay datos reales de usuarios en gym.usuarios, se perderán
--   4. El script detecta si audit_logs es de gym o de BD Maestra antes de eliminarlo
--
-- NO afecta:
--   - public.tenants, public.profiles, public.sedes (BD Maestra — intocables)
--   - Tablas del módulo ONG
--   - Tablas de infraestructura de la BD Maestra
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '  GYMSOS ROLLBACK 001-008 — INICIANDO';
  RAISE NOTICE '  Estado objetivo: igual a supabase-schema.sql';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — ROLLBACK 008: Eliminar gym.codigos_acceso y columnas extra
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS gym.codigos_acceso CASCADE;

ALTER TABLE IF EXISTS gym.gimnasios DROP COLUMN IF EXISTS ruc;
ALTER TABLE IF EXISTS gym.gimnasios DROP COLUMN IF EXISTS logo_url;
ALTER TABLE IF EXISTS gym.usuarios   DROP COLUMN IF EXISTS foto_url;
ALTER TABLE IF EXISTS gym.usuarios   DROP COLUMN IF EXISTS cargo;

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 008: gym.codigos_acceso eliminada, columnas extra removidas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — ROLLBACK 007: Eliminar generate_gym_code
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.generate_gym_code(TEXT);

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 007: generate_gym_code() eliminada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — ROLLBACK 006: Mover TODAS las tablas de gym → public
-- Orden respeta dependencias (hojas primero, padres al final)
-- ─────────────────────────────────────────────────────────────────────────────

-- Nivel 4 (dependen de clases / churn)
ALTER TABLE IF EXISTS gym.inscripciones          SET SCHEMA public;
ALTER TABLE IF EXISTS gym.churn_interventions    SET SCHEMA public;

-- Nivel 3 (dependen de entrenadores / clases / usuario)
ALTER TABLE IF EXISTS gym.clases                 SET SCHEMA public;
ALTER TABLE IF EXISTS gym.asistencias            SET SCHEMA public;

-- Nivel 2 (dependen de usuarios / espacios / planes)
ALTER TABLE IF EXISTS gym.membresias             SET SCHEMA public;
ALTER TABLE IF EXISTS gym.pagos                  SET SCHEMA public;
ALTER TABLE IF EXISTS gym.accesos                SET SCHEMA public;
ALTER TABLE IF EXISTS gym.gamification_xp        SET SCHEMA public;
ALTER TABLE IF EXISTS gym.gamification_levels    SET SCHEMA public;
ALTER TABLE IF EXISTS gym.digital_twin           SET SCHEMA public;
ALTER TABLE IF EXISTS gym.ai_recommendations     SET SCHEMA public;
ALTER TABLE IF EXISTS gym.churn_predictions      SET SCHEMA public;
ALTER TABLE IF EXISTS gym.wearable_sync          SET SCHEMA public;
ALTER TABLE IF EXISTS gym.health_alerts          SET SCHEMA public;
ALTER TABLE IF EXISTS gym.maquinas               SET SCHEMA public;
ALTER TABLE IF EXISTS gym.entrenadores           SET SCHEMA public;

-- Nivel 1 (dependen de gimnasios)
ALTER TABLE IF EXISTS gym.usuarios               SET SCHEMA public;
ALTER TABLE IF EXISTS gym.planes                 SET SCHEMA public;
ALTER TABLE IF EXISTS gym.espacios               SET SCHEMA public;
ALTER TABLE IF EXISTS gym.promociones            SET SCHEMA public;

-- Nivel 0 (raíz)
ALTER TABLE IF EXISTS gym.gimnasios              SET SCHEMA public;

-- Restaurar funciones helper a versión PUBLIC (sin gym schema)
CREATE OR REPLACE FUNCTION public.get_user_gym()
RETURNS UUID AS $$
  SELECT id_gimnasio FROM public.usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM public.usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Eliminar el schema gym (ya debe estar vacío)
DROP SCHEMA IF EXISTS gym CASCADE;

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 006: todas las tablas movidas a public, schema gym eliminado'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — ROLLBACK 005: Eliminar codigo_acceso y policies nuevas
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "gimnasios_public_select" ON public.gimnasios;
DROP POLICY IF EXISTS "users_insert_own"         ON public.usuarios;

DROP INDEX IF EXISTS public.idx_gimnasios_codigo;
ALTER TABLE IF EXISTS public.gimnasios DROP COLUMN IF EXISTS codigo_acceso;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NEW;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 005: codigo_acceso eliminada, handle_new_user restaurado'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — ROLLBACK 004: Eliminar datos seed creados por la migración
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM public.usuarios
 WHERE id_usuario = '00000000-0000-0000-0000-000000000006'
    OR email = 'gerente@gymsos.io';

DO $$
BEGIN
  RAISE NOTICE '✅ ROLLBACK 004: registro gerente@gymsos.io eliminado de public.usuarios';
  RAISE NOTICE '⚠️  ACCION MANUAL: eliminar gerente@gymsos.io de auth.users en Supabase Dashboard';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — ROLLBACK 003: Restaurar tablas eliminadas + limpiar RLS
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "xp_select_own"              ON public.gamification_xp;
DROP POLICY IF EXISTS "xp_select_staff"             ON public.gamification_xp;
DROP POLICY IF EXISTS "xp_insert_system"            ON public.gamification_xp;
DROP POLICY IF EXISTS "levels_select_own"           ON public.gamification_levels;
DROP POLICY IF EXISTS "levels_select_staff"         ON public.gamification_levels;
DROP POLICY IF EXISTS "levels_upsert_system"        ON public.gamification_levels;
DROP POLICY IF EXISTS "alerts_select_own"           ON public.health_alerts;
DROP POLICY IF EXISTS "alerts_select_staff"         ON public.health_alerts;
DROP POLICY IF EXISTS "alerts_insert_staff"         ON public.health_alerts;
DROP POLICY IF EXISTS "alerts_update_own"           ON public.health_alerts;
DROP POLICY IF EXISTS "wearable_select_own"         ON public.wearable_sync;
DROP POLICY IF EXISTS "wearable_upsert_own"         ON public.wearable_sync;
DROP POLICY IF EXISTS "ai_rec_select_own"           ON public.ai_recommendations;
DROP POLICY IF EXISTS "ai_rec_select_staff"         ON public.ai_recommendations;
DROP POLICY IF EXISTS "ai_rec_insert_system"        ON public.ai_recommendations;
DROP POLICY IF EXISTS "intervention_select_gerente" ON public.churn_interventions;
DROP POLICY IF EXISTS "intervention_insert_gerente" ON public.churn_interventions;
DROP POLICY IF EXISTS "twin_select_own"             ON public.digital_twin;
DROP POLICY IF EXISTS "twin_update_own"             ON public.digital_twin;

ALTER TABLE IF EXISTS public.gamification_xp      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gamification_levels  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_alerts        DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wearable_sync        DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_recommendations   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.churn_interventions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.digital_twin         DISABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS public.idx_xp_usuario_fecha;
DROP INDEX IF EXISTS public.idx_alerts_usuario_leida;
DROP INDEX IF EXISTS public.idx_ai_rec_usuario;

-- Recrear las 9 tablas que 003 eliminó (tomadas de supabase-schema.sql)
CREATE TABLE IF NOT EXISTS public.marketplace_vendors (
  id_vendor           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo                VARCHAR(30)   NOT NULL
                        CHECK (tipo IN ('trainer','nutritionist','supplement_brand','wearable','merchandise')),
  nombre              VARCHAR(255)  NOT NULL,
  email               VARCHAR(255)  UNIQUE,
  descripcion         TEXT,
  certificaciones     TEXT,
  tarifa              DECIMAL(10,2),
  rating_promedio     DECIMAL(3,2)  DEFAULT 0.00,
  total_clientes      INT           DEFAULT 0,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activo'
                        CHECK (estado IN ('activo','pausado','inactivo')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.corporate_clients (
  id_corporativo      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_empresa      VARCHAR(255)  NOT NULL,
  contacto_hr         VARCHAR(100)  NOT NULL,
  email_hr            VARCHAR(255),
  cantidad_empleados  INT           NOT NULL DEFAULT 0,
  cantidad_membresias INT           NOT NULL DEFAULT 0,
  precio_por_empleado DECIMAL(5,2)  NOT NULL DEFAULT 0,
  fecha_inicio_contrato DATE        NOT NULL DEFAULT CURRENT_DATE,
  fecha_renovacion    DATE,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa','pausada','cancelada'))
);

CREATE TABLE IF NOT EXISTS public.torneos_semanales (
  id_torneo           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES public.gimnasios(id_gimnasio),
  nombre              VARCHAR(100)  NOT NULL,
  tipo_metrica        VARCHAR(50)   NOT NULL,
  descripcion         TEXT,
  fecha_inicio        TIMESTAMPTZ   NOT NULL,
  fecha_fin           TIMESTAMPTZ   NOT NULL,
  premios_texto       VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.clanes (
  id_clan             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES public.gimnasios(id_gimnasio),
  nombre              VARCHAR(100)  NOT NULL,
  id_lider            UUID          REFERENCES public.usuarios(id_usuario),
  descripcion         TEXT,
  capacidad_maxima    INT           NOT NULL DEFAULT 20,
  xp_clan             INT           NOT NULL DEFAULT 0,
  ranking             INT,
  fecha_creacion      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clan_miembros (
  id_clan             UUID          NOT NULL REFERENCES public.clanes(id_clan),
  id_usuario          UUID          NOT NULL REFERENCES public.usuarios(id_usuario),
  rol_clan            VARCHAR(20)   DEFAULT 'miembro' CHECK (rol_clan IN ('lider','oficial','miembro')),
  fecha_union         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  contribucion_xp     INT           DEFAULT 0,
  PRIMARY KEY (id_clan, id_usuario)
);

CREATE TABLE IF NOT EXISTS public.battle_pass_progression (
  id_progression      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES public.usuarios(id_usuario),
  temporada           VARCHAR(20)   NOT NULL DEFAULT 'S1',
  tipo                VARCHAR(10)   NOT NULL DEFAULT 'free' CHECK (tipo IN ('free','premium')),
  progreso_porcentaje INT           NOT NULL DEFAULT 0,
  tier_actual         INT           NOT NULL DEFAULT 1,
  recompensas_desbloqueadas INT     NOT NULL DEFAULT 0,
  fecha_inicio        DATE          NOT NULL,
  fecha_fin           DATE          NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id_transaccion      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          REFERENCES public.usuarios(id_usuario),
  id_vendor           UUID          REFERENCES public.marketplace_vendors(id_vendor),
  tipo                VARCHAR(50)   NOT NULL,
  monto               DECIMAL(10,2) NOT NULL,
  comision_gymsos     DECIMAL(10,2) NOT NULL,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','completada','cancelada')),
  fecha_transaccion   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.corporate_leaderboards (
  id_leaderboard      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_corporativo      UUID          REFERENCES public.corporate_clients(id_corporativo),
  departamento        VARCHAR(100)  NOT NULL,
  xp_acumulado        INT           NOT NULL DEFAULT 0,
  ranking             INT,
  fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dynamic_pricing_log (
  id_pricing          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES public.gimnasios(id_gimnasio),
  zona_geografica     VARCHAR(100),
  precio_anterior     DECIMAL(10,2),
  precio_nuevo        DECIMAL(10,2),
  razon               VARCHAR(255),
  fecha_cambio        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actividad           VARCHAR(20)   CHECK (actividad IN ('aplicada','revertida'))
);

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 003: 9 tablas restauradas, RLS adicional removida'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7 — ROLLBACK 002: Eliminar audit_logs gym-específica + policies
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'audit_logs'
       AND column_name  = 'id_gimnasio'
  ) THEN
    EXECUTE 'DROP TABLE IF EXISTS public.audit_logs CASCADE';
    RAISE NOTICE '✅ public.audit_logs (version gym) eliminada';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    RAISE NOTICE 'ℹ️  public.audit_logs NO es version gym (BD Maestra) — NO eliminada';
  ELSE
    RAISE NOTICE 'ℹ️  public.audit_logs no existe — omitido';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB);

DROP INDEX IF EXISTS public.idx_audit_logs_gimnasio;
DROP INDEX IF EXISTS public.idx_audit_logs_actor;
DROP INDEX IF EXISTS public.idx_audit_logs_entidad;

DROP POLICY IF EXISTS "inscripciones_select_own"     ON public.inscripciones;
DROP POLICY IF EXISTS "inscripciones_select_staff"   ON public.inscripciones;
DROP POLICY IF EXISTS "inscripciones_insert_miembro" ON public.inscripciones;
DROP POLICY IF EXISTS "inscripciones_update_staff"   ON public.inscripciones;
DROP POLICY IF EXISTS "inscripciones_delete_own"     ON public.inscripciones;
DROP POLICY IF EXISTS "asistencias_select_own"       ON public.asistencias;
DROP POLICY IF EXISTS "asistencias_select_staff"     ON public.asistencias;
DROP POLICY IF EXISTS "asistencias_insert_staff"     ON public.asistencias;
DROP POLICY IF EXISTS "asistencias_update_staff"     ON public.asistencias;
DROP POLICY IF EXISTS "usuarios_insert_staff"        ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own"          ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_staff"        ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_admin"        ON public.usuarios;
DROP POLICY IF EXISTS "membresias_insert_staff"      ON public.membresias;
DROP POLICY IF EXISTS "membresias_update_staff"      ON public.membresias;
DROP POLICY IF EXISTS "membresias_delete_admin"      ON public.membresias;
DROP POLICY IF EXISTS "pagos_insert_staff"           ON public.pagos;
DROP POLICY IF EXISTS "pagos_update_gerente"         ON public.pagos;
DROP POLICY IF EXISTS "pagos_delete_admin"           ON public.pagos;
DROP POLICY IF EXISTS "clases_insert_staff"          ON public.clases;
DROP POLICY IF EXISTS "clases_update_staff"          ON public.clases;
DROP POLICY IF EXISTS "clases_delete_gerente"        ON public.clases;
DROP POLICY IF EXISTS "accesos_insert_staff"         ON public.accesos;
DROP POLICY IF EXISTS "accesos_update_salida"        ON public.accesos;
DROP POLICY IF EXISTS "churn_insert_admin"           ON public.churn_predictions;

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 002: audit_logs gym eliminada, policies 002 removidas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8 — ROLLBACK 001: Eliminar policies y funciones
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "gimnasios_select_propio"        ON public.gimnasios;
DROP POLICY IF EXISTS "admin_select_all_gimnasios"     ON public.gimnasios;
DROP POLICY IF EXISTS "nutricionista_select_miembros"  ON public.usuarios;
DROP POLICY IF EXISTS "entrenador_select_gym_users"    ON public.usuarios;

DROP FUNCTION IF EXISTS public.rpc_registrar_nuevo_miembro(
  UUID, TEXT, TEXT, UUID, UUID, DECIMAL, TEXT, TEXT, TEXT, INT, TEXT
);
DROP FUNCTION IF EXISTS public.rpc_verificar_y_registrar_acceso(UUID, UUID, TEXT);

DROP INDEX IF EXISTS public.idx_membresias_vencimiento;

DO $$ BEGIN RAISE NOTICE '✅ ROLLBACK 001: policies y funciones RPC eliminadas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_gym_schema_exists BOOLEAN;
  v_table_gimnasios   TEXT;
  v_codigos_exists    BOOLEAN;
  v_audit_schema      TEXT;
  v_cnt_policies      INT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'gym'
  ) INTO v_gym_schema_exists;

  SELECT table_schema INTO v_table_gimnasios
  FROM information_schema.tables WHERE table_name = 'gimnasios' LIMIT 1;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'codigos_acceso'
  ) INTO v_codigos_exists;

  SELECT table_schema INTO v_audit_schema
  FROM information_schema.tables WHERE table_name = 'audit_logs' LIMIT 1;

  SELECT COUNT(*) INTO v_cnt_policies
  FROM pg_policies
  WHERE policyname IN (
    'gimnasios_select_propio','admin_select_all_gimnasios',
    'nutricionista_select_miembros','entrenador_select_gym_users',
    'inscripciones_select_own','usuarios_insert_staff'
  );

  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '  VERIFICACION FINAL ROLLBACK';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '  Schema gym eliminado     : %', CASE WHEN NOT v_gym_schema_exists THEN '✅ SI' ELSE '❌ NO (revisar)' END;
  RAISE NOTICE '  gimnasios en public      : %', CASE WHEN v_table_gimnasios = 'public' THEN '✅ SI' ELSE '❌ NO — schema: ' || COALESCE(v_table_gimnasios,'NULL') END;
  RAISE NOTICE '  codigos_acceso eliminada : %', CASE WHEN NOT v_codigos_exists THEN '✅ SI' ELSE '❌ AUN EXISTE' END;
  RAISE NOTICE '  audit_logs schema        : %', COALESCE(v_audit_schema, 'no existe (OK)');
  RAISE NOTICE '  Policies 001-002 activas : % (esperado: 0)', v_cnt_policies;
  RAISE NOTICE '';
  RAISE NOTICE '  ACCION MANUAL REQUERIDA:';
  RAISE NOTICE '  Eliminar gerente@gymsos.io de auth.users en Supabase Dashboard';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '  BD restaurada al estado supabase-schema.sql ✅';
  RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;
