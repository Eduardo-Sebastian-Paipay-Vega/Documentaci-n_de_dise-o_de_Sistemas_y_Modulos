-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 020: Elizabeth Capa 1 — Overrides de permisos por persona
-- Fecha: 2026-06-16
-- Schema: public
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
--
-- DEUDA TÉCNICA RETROACTIVA: este SQL ya fue ejecutado manualmente en el SQL
-- Editor durante la sesión de validación E2E (ver scripts en
-- C:\Users\HP\AppData\Local\Temp\gymsos-e2e\elizabeth-v2.mjs y
-- fn-check-permission.mjs, ambos con resultado ✅). Este archivo lo documenta
-- formalmente según la regla de "Documentación obligatoria de cambios en BD".
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- FILOSOFÍA:
--   Capa 1 del modelo "Elizabeth": permisos = rol base ∪ grants − denies.
--   Un dueño/admin con 'ace.perms.manage' puede ajustar permisos de una persona
--   específica SIN tocar su rol — útil para excepciones puntuales (ej: un
--   Recepcionista que también puede crear pagos, o que se le restrinja un
--   permiso que su rol normalmente otorga).
--
-- TABLA NUEVA:
--   public.user_permission_overrides → 1 fila por (tenant, usuario, permiso)
--                                       effect IN ('grant','deny')
--
-- RPCS:
--   fn_my_permissions()         → ACTUALIZADA: ahora calcula rol ∪ grants − denies
--   fn_check_permission(text)   → NUEVA: verificación booleana sin ambigüedad de
--                                   overload (a diferencia de fn_has_permission,
--                                   que NO se toca en esta migración — tiene un
--                                   overload de 2 argumentos usado por ~20 RLS
--                                   policies del stack ONG/multi-sede; ver 019).
--
-- NO SE TOCA fn_has_permission EN ESTA MIGRACIÓN.
--   Motivo: ambigüedad de overload conocida (oid 47643 vs 100353) que rompe
--   ~20 políticas RLS si se altera. El frontend debe usar fn_check_permission.
--
-- FLUJO:
--   Dueño (ace.perms.manage) → INSERT/DELETE user_permission_overrides
--   Staff → fn_my_permissions() / fn_check_permission(p) refleja el override
--   Staff NO puede auto-asignarse overrides (bloqueado por RLS upo_insert)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Tabla de overrides
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  permission  text NOT NULL REFERENCES public.cat_permissions(id),
  effect      text NOT NULL CHECK (effect IN ('grant','deny')),
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES auth.users(id),
  UNIQUE (tenant_id, user_id, permission)  -- un solo override por permiso por persona
);

CREATE INDEX IF NOT EXISTS idx_upo_user_tenant
  ON public.user_permission_overrides (user_id, tenant_id);

DO $$ BEGIN RAISE NOTICE '020 [1/5] PASO 1: tabla user_permission_overrides creada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — RLS: solo quien tiene ace.perms.manage administra overrides de su tenant
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS upo_select ON public.user_permission_overrides;
CREATE POLICY upo_select ON public.user_permission_overrides
FOR SELECT TO authenticated
USING (
  tenant_id = public.fn_current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = public.fn_current_tenant_id()
      AND rp.permission = 'ace.perms.manage'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  )
);

DROP POLICY IF EXISTS upo_insert ON public.user_permission_overrides;
CREATE POLICY upo_insert ON public.user_permission_overrides
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = public.fn_current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = public.fn_current_tenant_id()
      AND rp.permission = 'ace.perms.manage'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  )
);

DROP POLICY IF EXISTS upo_update ON public.user_permission_overrides;
CREATE POLICY upo_update ON public.user_permission_overrides
FOR UPDATE TO authenticated
USING (
  tenant_id = public.fn_current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = public.fn_current_tenant_id()
      AND rp.permission = 'ace.perms.manage'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  )
)
WITH CHECK ( tenant_id = public.fn_current_tenant_id() );

DROP POLICY IF EXISTS upo_delete ON public.user_permission_overrides;
CREATE POLICY upo_delete ON public.user_permission_overrides
FOR DELETE TO authenticated
USING (
  tenant_id = public.fn_current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = public.fn_current_tenant_id()
      AND rp.permission = 'ace.perms.manage'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  )
);

DO $$ BEGIN RAISE NOTICE '020 [2/5] PASO 2: RLS habilitado — 4 políticas (select/insert/update/delete) sobre ace.perms.manage'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — fn_my_permissions() v2: rol ∪ grants − denies
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_my_permissions()
RETURNS TABLE(permission text, role_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT DISTINCT rp.permission, r.name AS role_name
    FROM public.user_roles ur
    JOIN public.roles r             ON r.id = ur.role_id
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id   = auth.uid()
      AND ur.tenant_id = public.fn_current_tenant_id()
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ),
  grants AS (
    SELECT o.permission, 'override:grant'::text AS role_name
    FROM public.user_permission_overrides o
    WHERE o.user_id = auth.uid()
      AND o.tenant_id = public.fn_current_tenant_id()
      AND o.effect = 'grant'
      AND (o.expires_at IS NULL OR o.expires_at > now())
  ),
  denies AS (
    SELECT o.permission
    FROM public.user_permission_overrides o
    WHERE o.user_id = auth.uid()
      AND o.tenant_id = public.fn_current_tenant_id()
      AND o.effect = 'deny'
      AND (o.expires_at IS NULL OR o.expires_at > now())
  )
  SELECT permission, role_name
  FROM ( SELECT * FROM base UNION SELECT * FROM grants ) u
  WHERE permission NOT IN (SELECT permission FROM denies)
  ORDER BY permission
$function$;

GRANT EXECUTE ON FUNCTION public.fn_my_permissions() TO authenticated;

DO $$ BEGIN RAISE NOTICE '020 [3/5] PASO 3: fn_my_permissions() actualizada con grants/denies'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — fn_check_permission(text): verificación sin ambigüedad de overload
--          (NO reemplaza ni toca fn_has_permission — ver advertencia arriba)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_check_permission(p_permission text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    ( EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role_id = ur.role_id
        WHERE ur.user_id=auth.uid() AND ur.tenant_id=public.fn_current_tenant_id()
          AND rp.permission=p_permission
          AND (ur.expires_at IS NULL OR ur.expires_at > now())
      )
      OR EXISTS (
        SELECT 1 FROM public.user_permission_overrides o
        WHERE o.user_id=auth.uid() AND o.tenant_id=public.fn_current_tenant_id()
          AND o.permission=p_permission AND o.effect='grant'
          AND (o.expires_at IS NULL OR o.expires_at > now())
      )
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.user_permission_overrides o
        WHERE o.user_id=auth.uid() AND o.tenant_id=public.fn_current_tenant_id()
          AND o.permission=p_permission AND o.effect='deny'
          AND (o.expires_at IS NULL OR o.expires_at > now())
    )
$function$;

GRANT EXECUTE ON FUNCTION public.fn_check_permission(text) TO authenticated;

DO $$ BEGIN RAISE NOTICE '020 [4/5] PASO 4: fn_check_permission(text) creada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Conceder ace.perms.manage / ace.perms.read al rol Administrador
--          General de TODOS los tenants gym (incluye la plantilla, que propaga
--          a gyms futuros vía seed_gym_roles). Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.perm
FROM public.roles r
CROSS JOIN (VALUES ('ace.perms.manage'), ('ace.perms.read')) AS p(perm)
WHERE r.name = 'Administrador General'
  AND r.is_system_role = true
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions e
    WHERE e.role_id = r.id AND e.permission = p.perm
  );

DO $$ BEGIN RAISE NOTICE '020 [5/5] PASO 5: ace.perms.manage/read otorgados a Administrador General en todos los tenants'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'tabla user_permission_overrides' AS objeto,
       (SELECT count(*)::text FROM information_schema.tables
        WHERE table_schema='public' AND table_name='user_permission_overrides') AS resultado
UNION ALL
SELECT 'fn_my_permissions usa overrides',
       CASE WHEN pg_get_functiondef('public.fn_my_permissions'::regproc) ILIKE '%user_permission_overrides%'
            THEN 'sí' ELSE 'NO — revisar' END
UNION ALL
SELECT 'fn_check_permission existe',
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_proc WHERE proname = 'fn_check_permission'
       ) THEN 'sí' ELSE 'NO — revisar' END
UNION ALL
SELECT 'Administrador General con ace.perms.manage',
       (SELECT count(*)::text FROM public.role_permissions rp
        JOIN public.roles r ON r.id = rp.role_id
        WHERE r.name = 'Administrador General' AND rp.permission = 'ace.perms.manage');

-- Resultado esperado (confirmado en validación E2E previa):
--   tabla user_permission_overrides            → 1
--   fn_my_permissions usa overrides             → sí
--   fn_check_permission existe                  → sí
--   Administrador General con ace.perms.manage  → N (uno por tenant gym existente)
