-- supabase/seed.sql — Sistema 2 (GYMsos)
-- Se ejecuta tras aplicar todas las migraciones (`supabase db reset` / `supabase start`).
--
-- ALCANCE: red de seguridad IDEMPOTENTE para los catálogos del Core (BD Maestra) que el
--   módulo gym necesita para funcionar: tipo de industria 'gym', planes y estados financieros.
--   El baseline provisto por el Sistema 1 (00000000000000_core_baseline.sql) es la fuente
--   autoritativa; este seed solo RELLENA si faltan (ON CONFLICT DO NOTHING) y es NO-OP si el
--   baseline ya los sembró o si el nombre de la tabla catálogo difiere (guardas to_regclass).
--
-- ⚠ VERIFICAR: los nombres de tablas catálogo (cat_industry_types / cat_plans /
--   cat_status_financial) son los convencionales del stack BD Maestra. Si el baseline usa
--   otros nombres, ajústalos aquí — las guardas evitan errores, pero el seed no tendría efecto.

-- ── Tipo de industria requerido por gym (tenants.industry_type_id = 'gym') ────────────
DO $$
BEGIN
  IF to_regclass('public.cat_industry_types') IS NOT NULL THEN
    INSERT INTO public.cat_industry_types (id, label)
    VALUES ('gym', 'Gimnasio / Fitness')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'seed: cat_industry_types <= gym';
  ELSE
    RAISE NOTICE 'seed: cat_industry_types ausente — omitido (lo provee el baseline).';
  END IF;
END $$;

-- ── Planes de suscripción del Core (destino de _gym_plan_to_bd) ───────────────────────
--    Valores usados por gym: basic, pro, enterprise (ver public._gym_plan_to_bd).
DO $$
BEGIN
  IF to_regclass('public.cat_plans') IS NOT NULL THEN
    INSERT INTO public.cat_plans (id, label) VALUES
      ('basic',      'Básico'),
      ('pro',        'Profesional'),
      ('enterprise', 'Enterprise')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'seed: cat_plans <= basic/pro/enterprise';
  ELSE
    RAISE NOTICE 'seed: cat_plans ausente — omitido (lo provee el baseline).';
  END IF;
END $$;

-- ── Estados financieros del Core (tenants.status_financial_id) ────────────────────────
--    gym crea tenants con 'FIN-PENDING'; el catálogo completo del stack incluye estos 4.
DO $$
BEGIN
  IF to_regclass('public.cat_status_financial') IS NOT NULL THEN
    INSERT INTO public.cat_status_financial (id, label) VALUES
      ('FIN-ACTIVE',    'Activo'),
      ('FIN-GRACE',     'Periodo de gracia'),
      ('FIN-SUSPENDED', 'Suspendido'),
      ('FIN-PENDING',   'Pendiente de pago')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'seed: cat_status_financial <= FIN-ACTIVE/GRACE/SUSPENDED/PENDING';
  ELSE
    RAISE NOTICE 'seed: cat_status_financial ausente — omitido (lo provee el baseline).';
  END IF;
END $$;

-- NOTA: los tipos de código del gimnasio (public.cat_code_types) se siembran en la migración
--   20260701030000_public_codes_system.sql (010), no aquí, para mantenerlos versionados.
