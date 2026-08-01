-- gymsos-frontend/migrations/021_security_hardening_rls.sql
/*
  ─────────────────────────────────────────────────────────────────────────────
  FASE 3 · ENDURECIMIENTO DE SEGURIDAD, AISLAMIENTO DE TENANTS Y BLINDAJE RLS
  ─────────────────────────────────────────────────────────────────────────────
  DESCRIPCIÓN: BD compartida horizontal (Sistema 1 ONG + Sistema 2 Gimnasio).
               Aplica mínimo privilegio y aislamiento multi-tenant estricto:
                 1) Revoca los GRANT masivos de la migración 009 y reasigna por tabla.
                 2) Deny-all para 3 tablas huérfanas no mapeables a tenant.
                 3) RLS multi-tenant vía EXISTS anclado en gym.gimnasios.tenant_id.
                 4) Cierra el acceso anónimo a códigos (fuerza fn_validate_code).
                 5) Índices de cruce para que las subconsultas EXISTS del RLS no escaneen.

  APROBACIÓN:  Arquitecto (Fase 3). Aun así, ejecutar bajo el flujo de CLAUDE.md.

  ROLLBACK:    Ver §10 (comentado).

  DEPENDENCIAS:
    - public.fn_current_tenant_id()  [016]  — ancla de tenant (SECURITY DEFINER, lee profiles).
    - gym.gimnasios(id_gimnasio, tenant_id)  — tenant_id desde 015b.
    - gym.usuarios(id_usuario, id_gimnasio), gym.espacios(id_espacio, id_gimnasio).
    - public.fn_validate_code(...)   [010]  — validación de códigos para clientes anónimos.

  IDEMPOTENCIA: ENABLE RLS repetible; CREATE INDEX IF NOT EXISTS; DROP POLICY IF EXISTS +
                CREATE POLICY; SQL dinámico en bloques DO; to_regclass() para huérfanas.

  NOTA (GRANT vs RLS): en PostgreSQL ambas capas deben aprobar (privilegio de tabla + política
                de fila). Por eso se revoca el grant MASIVO y se RE-OTORGA por tabla; RLS filtra
                filas. Revocar TODO sin re-otorgar dejaría las tablas inaccesibles incluso con RLS.
*/

BEGIN;

-- =====================================================================================
-- 0. PRECONDICIÓN — el ancla de tenant debe existir
-- =====================================================================================
DO $$
BEGIN
  IF to_regprocedure('public.fn_current_tenant_id()') IS NULL THEN
    RAISE EXCEPTION 'Falta public.fn_current_tenant_id() (migración 016). Aplicarla antes de la Fase 3.';
  END IF;
END $$;


-- =====================================================================================
-- 1. ÍNDICES DE CRUCE PARA EL RLS (rendimiento de las subconsultas EXISTS)
--    Las políticas evalúan EXISTS por fila; sin estos índices habría seq scans.
-- =====================================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_gimnasio  ON gym.usuarios(id_gimnasio);   -- existe desde schema base
CREATE INDEX IF NOT EXISTS idx_espacios_gimnasio  ON gym.espacios(id_gimnasio);   -- NUEVO (faltaba)
CREATE INDEX IF NOT EXISTS idx_gimnasios_tenant   ON gym.gimnasios(tenant_id);    -- existe desde 015b


-- =====================================================================================
-- 2. REVOCACIÓN DE PRIVILEGIOS MASIVOS (009) + DEFAULT PRIVILEGES
--    Se conserva USAGE del schema (vital para evaluar RLS).
-- =====================================================================================
-- 2.a Retirar TODO privilegio de tabla existente en el schema gym.
REVOKE ALL ON ALL TABLES IN SCHEMA gym FROM authenticated, anon;

-- 2.b Cerrar las DEFAULT PRIVILEGES abiertas (009:30/32) → tablas futuras no nacen abiertas.
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  REVOKE SELECT ON TABLES FROM anon;

-- 2.c USAGE del schema: imprescindible para que authenticated pueda "ver" las tablas y
--     que RLS entre a filtrar. (Ya otorgado por 009:26; se reafirma de forma idempotente.)
GRANT USAGE ON SCHEMA gym TO authenticated;


-- =====================================================================================
-- 3. RLS 'gym' — TABLA ANCLA gym.gimnasios (tenant_id directo)
-- =====================================================================================
ALTER TABLE gym.gimnasios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gimnasios_tenant_isolation ON gym.gimnasios;
CREATE POLICY gimnasios_tenant_isolation ON gym.gimnasios
  FOR ALL
  USING      (tenant_id = public.fn_current_tenant_id())
  WITH CHECK (tenant_id = public.fn_current_tenant_id());


-- =====================================================================================
-- 4. RLS 'gym' — TABLAS CON id_gimnasio (EXISTS vía gimnasios)
--    Se retiran políticas permisivas legacy (009/013) para que la unificada no quede
--    debilitada por OR con reglas antiguas.
-- =====================================================================================
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'usuarios','planes','espacios','clases','accesos','promociones','codigos_acceso'
  ];
  legacy TEXT[] := ARRAY[
    'usuarios_select_own','usuarios_select_gym','usuarios_update_own','usuarios_update_staff',
    'usuarios_insert_staff','usuarios_delete_admin',
    'planes_select_gym','planes_write_staff','espacios_select_gym','espacios_write_staff',
    'clases_select','accesos_select','promociones_select_gym','promociones_write_staff',
    'codigos_select_public','codigos_write_gerente'
  ];
  p TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE gym.%I ENABLE ROW LEVEL SECURITY;', t);
    FOREACH p IN ARRAY legacy LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON gym.%I;', p, t);
    END LOOP;
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
-- 5. RLS 'gym' — TABLAS CON id_usuario (EXISTS vía usuarios→gimnasios)
--    Operativas + tablas de innovación movidas a gym por 009.
-- =====================================================================================
DO $$
DECLARE
  t TEXT;
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
-- 6. RLS 'gym' — gym.maquinas (EXISTS vía espacios→gimnasios)
-- =====================================================================================
ALTER TABLE gym.maquinas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS maquinas_select_gym       ON gym.maquinas;  -- legacy (009)
DROP POLICY IF EXISTS maquinas_write_staff      ON gym.maquinas;  -- legacy (009)
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
-- 7. RE-GRANT MÍNIMO POR TABLA (RLS ya filtra filas)
--    7.a Operativas → DML completo.  7.b Innovación sin UI → SOLO SELECT (sin escritura).
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
-- 8. CIERRE DEL ACCESO ANÓNIMO A CÓDIGOS (anti-enumeración)
--    La validación anónima debe pasar SOLO por fn_validate_code (SECURITY DEFINER).
-- =====================================================================================
-- 8.a gym.codigos_acceso: quitar lectura pública (la policy legacy ya se elimina en §4).
DROP POLICY IF EXISTS "codigos_select_public" ON gym.codigos_acceso;
REVOKE SELECT ON gym.codigos_acceso FROM anon;

-- 8.b public.codes (tabla compartida): quitar la política de lookup anónimo y el grant a anon.
--     Se conservan las políticas de tenant (codes_tenant_select/write) y el RLS existente.
DROP POLICY IF EXISTS "codes_public_lookup" ON public.codes;
REVOKE SELECT ON public.codes FROM anon;
-- fn_validate_code mantiene GRANT EXECUTE a anon (010) → el signup por código sigue operativo.


-- =====================================================================================
-- 9. BLINDAJE DE 9 TABLAS HUÉRFANAS DE INNOVACIÓN EN 'public'
--    Guardadas con to_regclass (su presencia depende de 000_ROLLBACK).
-- =====================================================================================

-- 9.A — Mapeables por tenant ------------------------------------------------------------
-- 9.A.1 vía id_gimnasio: clanes, torneos_semanales, dynamic_pricing_log
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

-- 9.A.2 vía id_usuario: battle_pass_progression, marketplace_transactions
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

-- 9.A.3 clan_miembros: vía id_clan → public.clanes → id_gimnasio → gym.gimnasios
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

-- 9.B — DENY-ALL: sin columna de enlace a tenant.
--       RLS on + REVOKE + SIN política permisiva ⇒ invisibles para anon/authenticated;
--       accesibles solo para service_role (bypass RLS). Estado óptimo para código muerto.
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY['marketplace_vendors','corporate_clients','corporate_leaderboards'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated, anon;', t);
      -- Intencionalmente SIN CREATE POLICY (deny-all por defecto bajo RLS).
    END IF;
  END LOOP;
END $$;


COMMIT;

-- =====================================================================================
-- 10. VALIDACIÓN Y ROLLBACK (referencia — solo lectura / no ejecutar salvo reversión)
-- =====================================================================================
-- -- RLS habilitado en gym:
-- SELECT relname, relrowsecurity FROM pg_class
--  WHERE relnamespace='gym'::regnamespace AND relkind='r' ORDER BY relname;
-- -- Políticas de aislamiento creadas:
-- SELECT schemaname, tablename, policyname FROM pg_policies
--  WHERE policyname LIKE '%_tenant_isolation' ORDER BY 1,2;
-- -- Deny-all (RLS on y 0 políticas):
-- SELECT c.relname, c.relrowsecurity,
--        (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) n_pol
--   FROM pg_class c
--  WHERE c.relname IN ('marketplace_vendors','corporate_clients','corporate_leaderboards');
-- -- Sin grants a anon en códigos:
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants
--  WHERE table_name IN ('codes','codigos_acceso') AND grantee='anon';
--
-- ROLLBACK controlado:
-- BEGIN;
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym TO authenticated;
--   GRANT SELECT ON ALL TABLES IN SCHEMA gym TO anon;
--   ALTER DEFAULT PRIVILEGES IN SCHEMA gym
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
--   -- Recrear codes_public_lookup / codigos_select_public desde 010/009 si se requiere anon.
--   -- DROP POLICY %_tenant_isolation por tabla; DISABLE RLS donde no existía antes.
-- COMMIT;
