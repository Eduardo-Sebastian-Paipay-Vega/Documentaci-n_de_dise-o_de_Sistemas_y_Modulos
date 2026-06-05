-- Migración 019b: Fix fn_create_staff_code — llamada explícita con 2 args a fn_has_permission
--
-- PROBLEMA: fn_has_permission tiene 2 overloads que ambos aceptan una llamada de 1 arg:
--   oid 47643  fn_has_permission(text, uuid DEFAULT NULL)  ← usan ~20 políticas RLS en pg_policies
--   oid 100353 fn_has_permission(text)                    ← versión simplificada
-- fn_create_staff_code llamaba fn_has_permission('gym.codigos.crear'::text) con 1 arg
-- → PostgreSQL no puede resolver el overload → "is not unique".
--
-- NOTA CRÍTICA: NO dropear el overload (text, uuid). Verificado en pg_policies:
-- access_links, memberships, roles, profiles, user_roles_sedes y ~20 policies más
-- lo llaman con NULL::uuid explícito. Dropearlo cae todo el sistema de RLS.
--
-- FIX: pasar 2 args explícitos en fn_create_staff_code →
-- fn_has_permission('gym.codigos.crear'::text, NULL::uuid)
-- Esto resuelve inequívocamente al overload (text, uuid) sin ambigüedad, sin DROP.

DO $$ BEGIN RAISE NOTICE '019 [1/1] CREATE OR REPLACE fn_create_staff_code con llamada 2-args a fn_has_permission...'; END $$;

CREATE OR REPLACE FUNCTION public.fn_create_staff_code(
  p_tenant_id   uuid,
  p_role_id     uuid,
  p_description text                      DEFAULT NULL::text,
  p_max_uses    integer                   DEFAULT 1,
  p_expires_at  timestamp with time zone  DEFAULT NULL::timestamp with time zone,
  p_custom_code text                      DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result  JSONB;
  v_code_id UUID;
  v_code    TEXT;
BEGIN
  -- [019b] Dos argumentos explícitos → resuelve sin ambigüedad al overload (text, uuid).
  --        NO se dropea ningún overload: oid 47643 lo usan decenas de políticas RLS.
  IF NOT public.fn_has_permission('gym.codigos.crear'::text, NULL::uuid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sin permiso: gym.codigos.crear requerido');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = p_role_id AND tenant_id = p_tenant_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El rol no pertenece a este tenant');
  END IF;

  SELECT public.fn_create_code(
    p_tenant_id   => p_tenant_id,
    p_type_id     => 'USER_INVITE',
    p_code        => p_custom_code,
    p_description => COALESCE(p_description, 'Código de staff'),
    p_max_uses    => p_max_uses,
    p_expires_at  => p_expires_at,
    p_metadata    => jsonb_build_object('role_id', p_role_id)
  ) INTO v_result;

  IF NOT (v_result->>'ok')::boolean THEN
    RETURN v_result;
  END IF;

  v_code_id := (v_result->>'id')::uuid;
  v_code    := v_result->>'code';

  INSERT INTO public.code_grants (code_id, role_id)
  VALUES (v_code_id, p_role_id);

  RETURN jsonb_build_object(
    'ok',       true,
    'code_id',  v_code_id,
    'code',     v_code,
    'role_id',  p_role_id,
    'max_uses', p_max_uses,
    'expires_at', p_expires_at
  );
END;
$function$;

DO $$ BEGIN RAISE NOTICE '019 [1/1] OK — fn_create_staff_code actualizada. Ambigüedad resuelta sin DROP.'; END $$;
