-- 20260704140000_fn_lookup_gym_access.sql
-- FASE 5.1 · RPC SECURITY DEFINER para validar el código de acceso del gimnasio (signup anon).
--
-- CONTEXTO: la Fase 3 (021) revocó el SELECT de `anon` sobre `gym.codigos_acceso` (cierre P7).
--   El signup (cliente NO autenticado) necesitaba leer esa tabla para validar el código del
--   gimnasio y mostrar su metadata. Como `gym.codigos_acceso` es un sistema de códigos distinto
--   de `public.codes`, `fn_validate_code` NO aplica. Este RPC provee la validación con
--   privilegios DEFINER (bypassa RLS de forma controlada) y expone SOLO metadata pública.
--
-- ANTI-ENUMERACIÓN: recibe un código exacto y devuelve una única fila (o {found:false}).
--   No lista códigos ni permite recorrer la tabla. Rate-limit recomendado a nivel API/Auth.
--
-- IMPACTO: + public.fn_lookup_gym_access(TEXT). No modifica tablas ni datos.
-- ROLLBACK: DROP FUNCTION IF EXISTS public.fn_lookup_gym_access(TEXT);
-- DEPENDENCIAS: gym.codigos_acceso, gym.gimnasios (ambas de este repo).

CREATE OR REPLACE FUNCTION public.fn_lookup_gym_access(p_codigo TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v RECORD;
BEGIN
  SELECT c.id_gimnasio, g.nombre, g.ciudad, g.estado, g.tenant_id
    INTO v
    FROM gym.codigos_acceso c
    JOIN gym.gimnasios g ON g.id_gimnasio = c.id_gimnasio
   WHERE c.codigo = p_codigo
     AND c.activo = true
     AND (c.fecha_expiracion IS NULL OR c.fecha_expiracion > now())
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found',       true,
    'id_gimnasio', v.id_gimnasio,
    'nombre',      v.nombre,
    'ciudad',      v.ciudad,
    'estado',      v.estado,
    'tenant_id',   v.tenant_id
  );
END $$;

-- Validación anónima (signup) + autenticada. La función expone solo metadata pública del gym.
GRANT EXECUTE ON FUNCTION public.fn_lookup_gym_access(TEXT) TO anon, authenticated, service_role;

DO $$ BEGIN RAISE NOTICE '✅ FASE 5.1: public.fn_lookup_gym_access() lista (anon + authenticated).'; END $$;
