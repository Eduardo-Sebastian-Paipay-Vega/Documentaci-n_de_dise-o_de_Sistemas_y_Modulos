-- 20260701020000_rls_context_helpers.sql
-- Capa 2 · Helpers de contexto RLS — ADELANTADOS antes de cualquier CREATE POLICY.
--
-- ⭐ RESUELVE EL BLOQUEO P2 (orden de dependencias invertido):
--   En el historial original, public.fn_current_tenant_id() se USABA en la migración 010
--   (políticas codes_tenant_*) pero se CREABA recién en la 016. En un despliegue limpio,
--   aplicar 010 antes de 016 fallaba por función inexistente.
--   Aquí se define el helper ANTES del archivo de códigos (20260701030000), de modo que
--   toda política posterior que lo invoque lo encuentra ya creado.
--
-- Nota: la migración 016 (20260701060000_rbac_permissions_and_roles.sql) vuelve a declararla
--   con CREATE OR REPLACE idéntico; es inocuo (idempotente).
-- Los helpers de dominio get_user_gym()/get_user_rol()/gym.current_gym_id() ya se crean en
--   la Capa 1 (dentro de 009) y no se duplican aquí.

CREATE OR REPLACE FUNCTION public.fn_current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.fn_current_tenant_id() TO authenticated, anon;

DO $$ BEGIN RAISE NOTICE 'Capa 2: public.fn_current_tenant_id() disponible (P2 resuelto).'; END $$;
