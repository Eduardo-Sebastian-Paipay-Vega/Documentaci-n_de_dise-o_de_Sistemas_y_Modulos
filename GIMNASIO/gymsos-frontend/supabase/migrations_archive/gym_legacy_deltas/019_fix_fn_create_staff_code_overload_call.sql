-- Migración 019c: Fix fn_create_staff_code — consulta directa a user_roles
--
-- HISTORIAL DE INTENTOS:
-- [019]  DROP fn_has_permission(text,uuid)  → DESCARTADO: ~20 políticas RLS dependen de ese overload.
-- [019b] fn_has_permission(text, NULL::uuid) → DESCARTADO: apunta a user_roles_sedes (stack incorrecto
--        para el rol gym del dueño, que vive en user_roles, no en user_roles_sedes).
-- [019c] Consulta directa a user_roles + role_permissions → CORRECTO y aplicado en producción.
--
-- POR QUÉ la consulta directa:
--   fn_has_permission(text, uuid) busca permisos en user_roles_sedes (multi-sede / stack ONG).
--   El dueño de gym tiene su rol en public.user_roles (asignado por handle_new_user CASO A).
--   Consultar user_roles directamente evita toda ambigüedad de overload y de stack.
--
-- APLICADO: ejecutado en Supabase SQL Editor y confirmado funcionando (fn_create_staff_code
-- devuelve ok:true para dueños con rol Administrador General en public.user_roles).

DO $$ BEGIN RAISE NOTICE '019c [1/1] CREATE OR REPLACE fn_create_staff_code con consulta directa a user_roles...'; END $$;

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
  -- [019c] Consulta directa a user_roles + role_permissions (stack gym).
  --        No llama a fn_has_permission para evitar ambigüedad de overload y stack incorrecto.
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id   = auth.uid()
      AND ur.tenant_id = p_tenant_id
      AND rp.permission = 'gym.codigos.crear'
  ) THEN
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
    'ok',         true,
    'code_id',    v_code_id,
    'code',       v_code,
    'role_id',    p_role_id,
    'max_uses',   p_max_uses,
    'expires_at', p_expires_at
  );
END;
$function$;

DO $$ BEGIN RAISE NOTICE '019c [1/1] OK — fn_create_staff_code actualizada. Consulta directa a user_roles activa.'; END $$;
