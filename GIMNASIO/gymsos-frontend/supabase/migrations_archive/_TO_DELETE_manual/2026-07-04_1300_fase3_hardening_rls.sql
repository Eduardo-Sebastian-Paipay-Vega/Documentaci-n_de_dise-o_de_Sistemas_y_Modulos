-- gymsos-frontend/migrations/2026-07-04_1300_fase3_hardening_rls.sql
/*
  DESCRIPCIÓN: FASE 3 — Endurecimiento de seguridad y blindaje RLS de la BD compartida
               (Sistema 1 ONG + Sistema 2 Gimnasio). Revoca los GRANT masivos de la
               migración 009, activa y unifica RLS multi-tenant en el esquema 'gym', y
               blinda las 9 tablas de innovación huérfanas del esquema 'public'.

  IMPACTO:     - REVOKE de privilegios amplios de 'authenticated' en 'gym' (009).
               - ENABLE RLS + política unificada FOR ALL por tenant en tablas operativas 'gym'.
               - Re-GRANT mínimo por tabla (RLS pasa a ser el filtro real de filas).
               - Blindaje de 9 tablas huérfanas 'public' (6 con aislamiento por tenant, 3 deny-all).

  ROLLBACK:    Ver bloque §9 (comentado). En esencia: DROP POLICY de las creadas aquí,
               DISABLE RLS donde no existía, y re-GRANT del grant masivo original de 009.

  DEPENDENCIAS:
               - public.fn_current_tenant_id()  [016] — ancla de aislamiento (lee public.profiles).
               - gym.gimnasios(id_gimnasio, tenant_id)  [tenant_id desde 015b] — ancla de tenant.
               - gym.usuarios(id_usuario, id_gimnasio), gym.espacios(id_espacio, id_gimnasio).

  CORRECCIONES DE DISEÑO (vs. enunciado, basadas en el esquema real):
    (a) GRANT ≠ RLS: revocar TODOS los privilegios de tabla bloquea el acceso aunque la
        política RLS lo permita (ambas capas deben aprobar). Por eso se revoca el grant
        MASIVO/ON ALL TABLES y se RE-OTORGA por tabla; RLS queda como filtro de filas.
    (b) 3 de las 9 huérfanas NO tienen columna de enlace a tenant/usuario/gimnasio
        (marketplace_vendors, corporate_clients, corporate_leaderboards). No admiten
        política "por tenant"; se blindan con DENY-ALL (RLS on, sin policy permisiva =
        invisibles para authenticated). Es el estado más seguro para código muerto.
    (c) gym.usuarios NO tiene tenant_id; el aislamiento se hace vía id_gimnasio→gimnasios.

  IDEMPOTENCIA: ENABLE RLS es idempotente; toda política usa DROP POLICY IF EXISTS + CREATE;
                las tablas de existencia incierta se guardan con to_regclass().

  ⚠ CAMBIOS DE COMPORTAMIENTO A APROBAR:
    - Se elimina la lectura pública (anon) de gym.codigos_acceso (P7: enumeración de códigos).
      La validación de códigos debe hacerse vía RPC SECURITY DEFINER (fn_validate_code).
    - Las tablas de innovación sin UI reciben solo SELECT a 'authenticated' (sin escritura).
*/

BEGIN;

-- =====================================================================================
-- 0. PRECONDICIÓN — el ancla de tenant debe existir (resuelve dependencia P2)
-- =====================================================================================
DO $$
BEGIN
  IF to_regprocedure('public.fn_current_tenant_id()') IS NULL THEN
    RAISE EXCEPTION 'Falta public.fn_current_tenant_id() (migración 016). Aplíquela antes de la Fase 3.';
  END IF;
END $$;


-- =====================================================================================
-- 1. REVOCACIÓN DE PRIVILEGIOS AMPLIOS (originados en 009)
--    Se conserva USAGE sobre el schema (necesario para que RLS pueda evaluarse);
--    se retira la escritura masiva y las default privileges abiertas.
-- =====================================================================================

-- 1.a Default privileges abiertas (009:30) — evita que tablas futuras nazcan abiertas.
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  REVOKE SELECT ON TABLES FROM anon;

-- 1.b Grant masivo ON ALL TABLES (009:69 y 009:611) — se retira TODO a authenticated/anon.
--     El acceso se re-otorgará por tabla en §6 (solo tablas operativas), con RLS activo.
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym FROM authenticated;
REVOKE SELECT ON ALL TABLES IN SCHEMA gym FROM anon;

-- (USAGE del schema se mantiene; sin él, authenticated no podría ni evaluar RLS.)
-- GRANT USAGE ON SCHEMA gym TO authenticated;  -- ya otorgado por 009:26


-- =====================================================================================
-- 2. RLS ESQUEMA 'gym' — TABLA ANCLA (tenant_id directo)
-- =====================================================================================
ALTER TABLE gym.gimnasios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gimnasios_tenant_isolation ON gym.gimnasios;
CREATE POLICY gimnasios_tenant_isolation ON gym.gimnasios
  FOR ALL
  USING       (tenant_id = public.fn_current_tenant_id())
  WITH CHECK  (tenant_id = public.fn_current_tenant_id());


-- =====================================================================================
-- 3. RLS ESQUEMA 'gym' — TABLAS CON id_gimnasio (aislamiento vía gimnasios)
--    Patrón EXISTS: la fila pertenece al tenant si su gimnasio pertenece al tenant.
--    Se aplican en lote con SQL dinámico, retirando políticas permisivas legacy (009/013)
--    para que la política unificada NO quede debilitada por OR con reglas antiguas.
-- =====================================================================================
DO $$
DECLARE
  t   TEXT;
  tbls TEXT[] := ARRAY[
    'usuarios','planes','espacios','clases','accesos','promociones','codigos_acceso'
  ];
  -- Políticas legacy conocidas (master script §8.1) a eliminar si existen.
  legacy TEXT[] := ARRAY[
    'usuarios_select_own','usuarios_select_gym','usuarios_update_own','usuarios_update_staff',
    'usuarios_insert_staff','usuarios_delete_admin',
    'planes_select_gym','planes_write_staff','espacios_select_gym','espacios_write_staff',
    'clases_select','accesos_select','promociones_select_gym','promociones_write_staff',
    'codigos_select_public','codigos_write_gerente'
  ];
  p   TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE gym.%I ENABLE ROW LEVEL SECURITY;', t);
    -- Retirar políticas legacy (no-op si no existen)
    FOREACH p IN ARRAY legacy LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON gym.%I;', p, t);
    END LOOP;
    -- Política unificada por tenant vía id_gimnasio
    EXECUTE format('DROP POLICY IF EXISTS %I ON gym.%I;', t||'_tenant_isolation', t);
    EXECUTE format($p$
      CREATE POLICY %I ON gym.%I
        FOR ALL
        USING (EXISTS (
          SELECT 1 FROM gym.gimnasios g
           WHERE g.id_gimnasio = %I.id_gimnasio
             AND g.tenant_id = public.fn_current_tenant_id()))
        WITH CHECK (EXISTS (
          SELECT 1 FROM gym.gimnasios g
           WHERE g.id_gimnasio = %I.id_gimnasio
             AND g.tenant_id = public.fn_current_tenant_id()));
    $p$, t||'_tenant_isolation', t, t, t);
  END LOOP;
END $$;


-- =====================================================================================
-- 4. RLS ESQUEMA 'gym' — TABLAS CON id_usuario (aislamiento vía usuarios→gimnasios)
--    Incluye subtablas operativas y las tablas de innovación (movidas a gym por 009).
-- =====================================================================================
DO $$
DECLARE
  t    TEXT;
  tbls TEXT[] := ARRAY[
    'membresias','pagos','entrenadores','inscripciones','asistencias',
    'churn_predictions','churn_interventions','gamification_xp','gamification_levels',
    'digital_twin','ai_recommendations','wearable_sync','health_alerts'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE gym.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON gym.%I;', t||'_tenant_isolation', t);
    EXECUTE format($p$
      CREATE POLICY %I ON gym.%I
        FOR ALL
        USING (EXISTS (
          SELECT 1 FROM gym.usuarios u
            JOIN gym.gimnasios g ON g.id_gimnasio = u.id_gimnasio
           WHERE u.id_usuario = %I.id_usuario
             AND g.tenant_id = public.fn_current_tenant_id()))
        WITH CHECK (EXISTS (
          SELECT 1 FROM gym.usuarios u
            JOIN gym.gimnasios g ON g.id_gimnasio = u.id_gimnasio
           WHERE u.id_usuario = %I.id_usuario
             AND g.tenant_id = public.fn_current_tenant_id()));
    $p$, t||'_tenant_isolation', t, t, t);
  END LOOP;
END $$;


-- =====================================================================================
-- 5. RLS ESQUEMA 'gym' — gym.maquinas (aislamiento vía espacios→gimnasios)
-- =====================================================================================
ALTER TABLE gym.maquinas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS maquinas_select_gym  ON gym.maquinas;  -- legacy (009)
DROP POLICY IF EXISTS maquinas_write_staff ON gym.maquinas;  -- legacy (009)
DROP POLICY IF EXISTS maquinas_tenant_isolation ON gym.maquinas;
CREATE POLICY maquinas_tenant_isolation ON gym.maquinas
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM gym.espacios e
      JOIN gym.gimnasios g ON g.id_gimnasio = e.id_gimnasio
     WHERE e.id_espacio = maquinas.id_espacio
       AND g.tenant_id = public.fn_current_tenant_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM gym.espacios e
      JOIN gym.gimnasios g ON g.id_gimnasio = e.id_gimnasio
     WHERE e.id_espacio = maquinas.id_espacio
       AND g.tenant_id = public.fn_current_tenant_id()));


-- =====================================================================================
-- 6. RE-GRANT MÍNIMO POR TABLA (RLS ya activo → filtra filas)
--    Operativas: DML completo. Innovación sin UI: solo SELECT (sin escritura).
-- =====================================================================================
DO $$
DECLARE
  t TEXT;
  operativas TEXT[] := ARRAY[
    'gimnasios','usuarios','planes','membresias','pagos','espacios','maquinas',
    'entrenadores','clases','inscripciones','asistencias','accesos',
    'promociones','codigos_acceso'
  ];
  solo_lectura TEXT[] := ARRAY[
    'churn_predictions','churn_interventions','gamification_xp','gamification_levels',
    'digital_twin','ai_recommendations','wearable_sync','health_alerts'
  ];
BEGIN
  FOREACH t IN ARRAY operativas LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON gym.%I TO authenticated;', t);
  END LOOP;
  FOREACH t IN ARRAY solo_lectura LOOP
    EXECUTE format('GRANT SELECT ON gym.%I TO authenticated;', t);
  END LOOP;
END $$;


-- =====================================================================================
-- 7. BLINDAJE DE 9 TABLAS HUÉRFANAS DE INNOVACIÓN EN 'public'
--    Guardadas con to_regclass (pueden no existir según 000_ROLLBACK).
--    7.A — 6 tablas con enlace → aislamiento por tenant.
--    7.B — 3 tablas SIN enlace → DENY-ALL (RLS on, sin política permisiva).
-- =====================================================================================

-- 7.A.1 — vía id_gimnasio: clanes, torneos_semanales, dynamic_pricing_log
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY['clanes','torneos_semanales','dynamic_pricing_log'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated, anon;', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t||'_tenant_isolation', t);
      EXECUTE format($p$
        CREATE POLICY %I ON public.%I
          FOR ALL
          USING (EXISTS (
            SELECT 1 FROM gym.gimnasios g
             WHERE g.id_gimnasio = %I.id_gimnasio
               AND g.tenant_id = public.fn_current_tenant_id()))
          WITH CHECK (EXISTS (
            SELECT 1 FROM gym.gimnasios g
             WHERE g.id_gimnasio = %I.id_gimnasio
               AND g.tenant_id = public.fn_current_tenant_id()));
      $p$, t||'_tenant_isolation', t, t, t);
      EXECUTE format('GRANT SELECT ON public.%I TO authenticated;', t);
    END IF;
  END LOOP;
END $$;

-- 7.A.2 — vía id_usuario: battle_pass_progression, marketplace_transactions
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY['battle_pass_progression','marketplace_transactions'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated, anon;', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t||'_tenant_isolation', t);
      EXECUTE format($p$
        CREATE POLICY %I ON public.%I
          FOR ALL
          USING (EXISTS (
            SELECT 1 FROM gym.usuarios u
              JOIN gym.gimnasios g ON g.id_gimnasio = u.id_gimnasio
             WHERE u.id_usuario = %I.id_usuario
               AND g.tenant_id = public.fn_current_tenant_id()))
          WITH CHECK (EXISTS (
            SELECT 1 FROM gym.usuarios u
              JOIN gym.gimnasios g ON g.id_gimnasio = u.id_gimnasio
             WHERE u.id_usuario = %I.id_usuario
               AND g.tenant_id = public.fn_current_tenant_id()));
      $p$, t||'_tenant_isolation', t, t, t);
      EXECUTE format('GRANT SELECT ON public.%I TO authenticated;', t);
    END IF;
  END LOOP;
END $$;

-- 7.A.3 — clan_miembros: vía id_clan → public.clanes → id_gimnasio → gym.gimnasios
DO $$
BEGIN
  IF to_regclass('public.clan_miembros') IS NOT NULL THEN
    ALTER TABLE public.clan_miembros ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.clan_miembros FROM authenticated, anon;
    DROP POLICY IF EXISTS clan_miembros_tenant_isolation ON public.clan_miembros;
    CREATE POLICY clan_miembros_tenant_isolation ON public.clan_miembros
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.clanes c
          JOIN gym.gimnasios g ON g.id_gimnasio = c.id_gimnasio
         WHERE c.id_clan = clan_miembros.id_clan
           AND g.tenant_id = public.fn_current_tenant_id()))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.clanes c
          JOIN gym.gimnasios g ON g.id_gimnasio = c.id_gimnasio
         WHERE c.id_clan = clan_miembros.id_clan
           AND g.tenant_id = public.fn_current_tenant_id()));
    GRANT SELECT ON public.clan_miembros TO authenticated;
  END IF;
END $$;

-- 7.B — DENY-ALL: sin columna de enlace a tenant (marketplace_vendors, corporate_clients,
--       corporate_leaderboards). RLS activo + REVOKE + SIN política permisiva = 0 filas
--       para authenticated/anon. Solo service_role (bypass RLS) las ve. Estado óptimo
--       para código muerto: invisible al Sistema 1 (ONG) y a cualquier tenant.
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY['marketplace_vendors','corporate_clients','corporate_leaderboards'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated, anon;', t);
      -- Sin CREATE POLICY: deny-all por defecto bajo RLS.
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t||'_denyall', t);
    END IF;
  END LOOP;
END $$;


COMMIT;

-- =====================================================================================
-- 8. VALIDACIÓN (post-aplicación, solo lectura)
-- =====================================================================================
-- -- Tablas gym con RLS habilitado:
-- SELECT relname, relrowsecurity FROM pg_class
--  WHERE relnamespace = 'gym'::regnamespace AND relkind='r' ORDER BY relname;
--
-- -- Políticas creadas:
-- SELECT schemaname, tablename, policyname FROM pg_policies
--  WHERE policyname LIKE '%_tenant_isolation' ORDER BY schemaname, tablename;
--
-- -- Deny-all (RLS on, 0 políticas):
-- SELECT c.relname, c.relrowsecurity,
--        (SELECT count(*) FROM pg_policies p WHERE p.tablename=c.relname AND p.schemaname='public') AS n_pol
--   FROM pg_class c
--  WHERE c.relname IN ('marketplace_vendors','corporate_clients','corporate_leaderboards');
--
-- -- Confirmar que ya NO existe grant masivo a authenticated en gym:
-- SELECT grantee, privilege_type, table_name FROM information_schema.role_table_grants
--  WHERE table_schema='gym' AND grantee IN ('authenticated','anon') ORDER BY table_name;

-- =====================================================================================
-- 9. ROLLBACK (referencia — NO ejecutar salvo reversión controlada)
-- =====================================================================================
-- BEGIN;
--   -- Restaurar grant masivo original de 009:
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym TO authenticated;
--   GRANT SELECT ON gym.codigos_acceso TO anon;
--   ALTER DEFAULT PRIVILEGES IN SCHEMA gym
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
--   -- Eliminar políticas unificadas (repetir DROP POLICY IF EXISTS %_tenant_isolation por tabla)
--   -- y, si se desea, DISABLE ROW LEVEL SECURITY en las tablas que no tenían RLS antes.
--   -- (Las políticas legacy eliminadas en §3/§5 deberían recrearse desde 009/013 si se revierte.)
-- COMMIT;
