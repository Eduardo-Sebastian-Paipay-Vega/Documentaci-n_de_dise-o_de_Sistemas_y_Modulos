-- Migración 019: Drop overload antiguo de fn_has_permission(text, uuid)
-- Contexto: fn_has_permission tiene dos firmas que ambas aceptan (text):
--   oid 47643  fn_has_permission(p_permission text, p_sede_id uuid DEFAULT NULL)  ← ANTIGUO
--   oid 100353 fn_has_permission(p_permission text)                               ← ACTUAL
-- Cuando fn_create_staff_code llama fn_has_permission('gym.codigos.crear'::text),
-- PostgreSQL no puede resolver el overload y lanza "is not unique".
-- La firma con sede_id pertenece a la arquitectura multi-sede anterior (pre-009).
-- Ningún caller activo pasa 2 argumentos — verificado antes de aplicar.
--
-- Verificación previa (ejecutar antes del DROP):
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_definition ILIKE '%fn_has_permission(%,%)'
-- ORDER BY routine_name;
-- → debe devolver 0 filas

DO $$ BEGIN RAISE NOTICE '019 [1/2] Verificando que nadie llame fn_has_permission con 2 args...'; END $$;

DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_definition ILIKE '%fn_has_permission(%,%)'
    AND routine_name <> 'fn_has_permission';

  IF v_count > 0 THEN
    RAISE EXCEPTION '019 ABORTADO: hay % caller(s) con 2 argumentos — revisar antes de dropear', v_count;
  END IF;

  RAISE NOTICE '019 [1/2] OK — 0 callers con 2 args';
END $$;

DO $$ BEGIN RAISE NOTICE '019 [2/2] Dropping overload antiguo fn_has_permission(text, uuid)...'; END $$;

DROP FUNCTION IF EXISTS public.fn_has_permission(text, uuid);

DO $$ BEGIN RAISE NOTICE '019 [2/2] OK — fn_has_permission(text) queda como única firma. Ambigüedad resuelta.'; END $$;
