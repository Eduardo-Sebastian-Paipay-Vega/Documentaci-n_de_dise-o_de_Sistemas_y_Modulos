-- 00000000000100_core_baseline_contract.sql
-- Fase 1 · Contrato/guard del Baseline del Core (BD Maestra provista por el Sistema 1)
-- Falla temprano y con mensaje claro si el baseline externo no fue inyectado antes.
-- NO crea objetos del Core; solo valida su existencia. Resuelve P1 (dependencias externas).

DO $$
DECLARE
  faltantes text := '';
BEGIN
  -- Tablas núcleo de la BD Maestra
  IF to_regclass('public.tenants')            IS NULL THEN faltantes := faltantes || ' public.tenants'; END IF;
  IF to_regclass('public.profiles')           IS NULL THEN faltantes := faltantes || ' public.profiles'; END IF;
  IF to_regclass('public.roles')              IS NULL THEN faltantes := faltantes || ' public.roles'; END IF;
  IF to_regclass('public.role_permissions')   IS NULL THEN faltantes := faltantes || ' public.role_permissions'; END IF;
  IF to_regclass('public.cat_permissions')    IS NULL THEN faltantes := faltantes || ' public.cat_permissions'; END IF;

  -- Funciones/overloads externos de los que depende el stack RLS
  IF to_regprocedure('public.fn_has_permission(text, uuid)') IS NULL
     THEN faltantes := faltantes || ' fn_has_permission(text,uuid)'; END IF;

  IF length(faltantes) > 0 THEN
    RAISE EXCEPTION 'Baseline del Core ausente. Inyecte 00000000000000_core_baseline.sql antes de continuar. Faltan:%', faltantes;
  END IF;

  RAISE NOTICE 'Contrato del Core verificado: baseline presente.';
END $$;
