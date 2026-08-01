-- 99999999999999_schema_guard_consolidated.sql
-- FASE 5 · "Unit test" de base de datos. Corre AL FINAL del despliegue (timestamp máximo).
-- NO crea objetos: valida invariantes estructurales y de seguridad. Aborta con RAISE
-- EXCEPTION si algo falta, dejando el deploy en estado conocido-bueno o conocido-malo.
--
-- Cubre: (1) tablas core BD Maestra, (2) esquema gym y tablas de dominio, (3) tablas de
--   innovación, (4) helper de tenant, (5) RLS habilitado en gym, (6) políticas de
--   aislamiento activas, (7) deny-all en huérfanas no mapeables, (8) cierre anon de códigos.

DO $$
DECLARE
  v_missing   text := '';
  v_norls     text := '';
  v_t         text;
  v_n         int;
  -- Tablas core externas (baseline S1)
  core_tables text[] := ARRAY['tenants','profiles','roles','role_permissions','cat_permissions'];
  -- Tablas de dominio gym (operativas)
  gym_core    text[] := ARRAY['gimnasios','usuarios','planes','membresias','pagos',
                              'espacios','maquinas','entrenadores','clases',
                              'inscripciones','asistencias','accesos','promociones','codigos_acceso'];
  -- Tablas de innovación (movidas a gym por 009)
  gym_innov   text[] := ARRAY['churn_predictions','churn_interventions','gamification_xp',
                              'gamification_levels','digital_twin','ai_recommendations',
                              'wearable_sync','health_alerts'];
  -- Huérfanas deny-all en public
  denyall     text[] := ARRAY['marketplace_vendors','corporate_clients','corporate_leaderboards'];
BEGIN
  -- ── 1) Tablas core (baseline) ───────────────────────────────────────────────────────
  FOREACH v_t IN ARRAY core_tables LOOP
    IF to_regclass('public.'||v_t) IS NULL THEN v_missing := v_missing || ' public.'||v_t; END IF;
  END LOOP;

  -- ── 2) Esquema gym presente ─────────────────────────────────────────────────────────
  IF to_regnamespace('gym') IS NULL THEN
    RAISE EXCEPTION 'SCHEMA GUARD: el esquema "gym" no existe. Deploy inválido.';
  END IF;

  -- ── 2b) Tablas de dominio + 3) innovación ──────────────────────────────────────────
  FOREACH v_t IN ARRAY (gym_core || gym_innov) LOOP
    IF to_regclass('gym.'||v_t) IS NULL THEN v_missing := v_missing || ' gym.'||v_t; END IF;
  END LOOP;

  -- ── 4) Helper de tenant (ancla RLS) ─────────────────────────────────────────────────
  IF to_regprocedure('public.fn_current_tenant_id()') IS NULL THEN
    v_missing := v_missing || ' fn_current_tenant_id()';
  END IF;

  IF length(v_missing) > 0 THEN
    RAISE EXCEPTION 'SCHEMA GUARD (objetos faltantes):%', v_missing;
  END IF;

  -- ── 5) RLS habilitado en TODAS las tablas gym (core + innovación) ───────────────────
  FOREACH v_t IN ARRAY (gym_core || gym_innov) LOOP
    IF NOT (SELECT relrowsecurity FROM pg_class
             WHERE oid = ('gym.'||v_t)::regclass) THEN
      v_norls := v_norls || ' gym.'||v_t;
    END IF;
  END LOOP;
  IF length(v_norls) > 0 THEN
    RAISE EXCEPTION 'SCHEMA GUARD: RLS deshabilitado en:%', v_norls;
  END IF;

  -- ── 6) Políticas de aislamiento por tenant presentes en gym ─────────────────────────
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'gym' AND policyname LIKE '%_tenant_isolation';
  IF v_n < array_length(gym_core || gym_innov, 1) THEN
    RAISE EXCEPTION 'SCHEMA GUARD: faltan políticas *_tenant_isolation en gym (esperadas>=%, halladas=%).',
      array_length(gym_core || gym_innov, 1), v_n;
  END IF;

  -- ── 7) Deny-all: RLS on y CERO políticas en las 3 huérfanas no mapeables ────────────
  FOREACH v_t IN ARRAY denyall LOOP
    IF to_regclass('public.'||v_t) IS NOT NULL THEN
      IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid=('public.'||v_t)::regclass) THEN
        RAISE EXCEPTION 'SCHEMA GUARD: % debe tener RLS habilitado (deny-all).', v_t;
      END IF;
      SELECT count(*) INTO v_n FROM pg_policies WHERE schemaname='public' AND tablename=v_t;
      IF v_n <> 0 THEN
        RAISE EXCEPTION 'SCHEMA GUARD: % es deny-all y NO debe tener políticas (halladas=%).', v_t, v_n;
      END IF;
    END IF;
  END LOOP;

  -- ── 8) Cierre anon de códigos (anti-enumeración) ────────────────────────────────────
  IF EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
     WHERE grantee='anon' AND privilege_type='SELECT'
       AND ((table_schema='public' AND table_name='codes')
         OR (table_schema='gym'    AND table_name='codigos_acceso'))
  ) THEN
    RAISE EXCEPTION 'SCHEMA GUARD: anon aún tiene SELECT sobre códigos (P7 no cerrado).';
  END IF;

  RAISE NOTICE '✅ SCHEMA GUARD: despliegue válido — core, gym, innovación, RLS, políticas y cierre anon OK.';
END $$;
