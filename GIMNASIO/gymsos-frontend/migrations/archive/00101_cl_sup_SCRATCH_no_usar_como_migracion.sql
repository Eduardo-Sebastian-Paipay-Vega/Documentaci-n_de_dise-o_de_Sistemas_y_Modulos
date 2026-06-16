##Paso 1 — Crear seed_gym_roles (resuelve el error 4)
###sql

CREATE OR REPLACE FUNCTION public.seed_gym_roles(
  p_target_tenant   uuid,
  p_template_tenant uuid DEFAULT '2fbedbdb-a4af-4e27-9a1c-2d0eb555f4b6'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inserted integer := 0;
BEGIN
  -- 1) Clonar los 7 roles de sistema desde la plantilla.
  --    tenant_id EXPLÍCITO → nunca cae en fn_current_tenant_id()=NULL.
  --    Idempotente vía NOT EXISTS por (tenant_id, name).
  INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
  SELECT p_target_tenant, r.name, r.hierarchy_level, true
  FROM public.roles r
  WHERE r.tenant_id = p_template_tenant
    AND r.is_system_role = true
    AND NOT EXISTS (
      SELECT 1 FROM public.roles x
      WHERE x.tenant_id = p_target_tenant AND x.name = r.name
    );
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  -- 2) Clonar role_permissions emparejando por NOMBRE de rol entre tenants.
  --    Idempotente vía NOT EXISTS por (role_id, permission).
  INSERT INTO public.role_permissions (role_id, permission)
  SELECT tgt.id, rp.permission
  FROM public.roles tpl
  JOIN public.role_permissions rp ON rp.role_id = tpl.id
  JOIN public.roles tgt
        ON tgt.tenant_id = p_target_tenant
       AND tgt.name      = tpl.name
  WHERE tpl.tenant_id = p_template_tenant
    AND NOT EXISTS (
      SELECT 1 FROM public.role_permissions e
      WHERE e.role_id = tgt.id AND e.permission = rp.permission
    );

  RETURN v_inserted;
END;
$$;
Cambié el ON CONFLICT DO NOTHING por NOT EXISTS a propósito: role_permissions no tiene PK/UNIQUE declarada en R7, así que ON CONFLICT no tendría índice donde apoyarse y fallaría. NOT EXISTS es idempotente sin depender de constraints.
Paso 2 — Probar sobre el tenant de prueba (datos desechables)
sql-- Sembrar los 7 roles + sus permisos en el tenant huérfano de la Prueba 2
SELECT public.seed_gym_roles('1caa18c6-62e2-4191-b7b0-cb1af59e9b76') AS roles_creados;

-- Asignar 'Administrador General' al dueño de ese tenant
INSERT INTO public.user_roles (tenant_id, user_id, role_id)
SELECT '1caa18c6-62e2-4191-b7b0-cb1af59e9b76',
       '4abc8f2e-68fa-4fde-828c-26904bc91bbc',
       r.id
FROM public.roles r
WHERE r.tenant_id = '1caa18c6-62e2-4191-b7b0-cb1af59e9b76'
  AND r.name = 'Administrador General'
ON CONFLICT DO NOTHING;
Paso 3 — Verificar (criterio de aceptación)
sqlSELECT 'roles(tenant)'      AS t, count(*) AS n FROM public.roles
  WHERE tenant_id='1caa18c6-62e2-4191-b7b0-cb1af59e9b76'
UNION ALL
SELECT 'role_permissions',  count(*) FROM public.role_permissions rp
  JOIN public.roles r ON r.id=rp.role_id
  WHERE r.tenant_id='1caa18c6-62e2-4191-b7b0-cb1af59e9b76'
UNION ALL
SELECT 'user_roles(dueño)', count(*) FROM public.user_roles
  WHERE user_id='4abc8f2e-68fa-4fde-828c-26904bc91bbc';



------
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'gym', 'public'
AS $function$
DECLARE
  v_nombre        TEXT;
  v_telefono      TEXT;
  v_documento     TEXT;
  v_fecha_nac     DATE;
  v_genero        TEXT;
  v_cargo         TEXT;
  v_foto_url      TEXT;
  v_rol           TEXT;
  v_gym_nombre    TEXT;
  v_gym_ruc       TEXT;
  v_gym_ciudad    TEXT;
  v_gym_pais      TEXT;
  v_gym_direccion TEXT;
  v_gym_telefono  TEXT;
  v_gym_email     TEXT;
  v_gym_plan      TEXT;
  v_id_gimnasio   UUID;
  v_tenant_id     UUID;
  v_codigo        TEXT;
  v_staff_code    TEXT;
  v_code_id       UUID;
  v_role_id       UUID;
  v_gym_tenant    UUID;  -- [017] elevado desde bloque interno — necesario para filtro V1
BEGIN
  -- Extraer metadata
  v_nombre     := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'),    ''), split_part(NEW.email, '@', 1));
  v_telefono   := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'),  '');
  v_documento  := NULLIF(TRIM(NEW.raw_user_meta_data->>'documento'), '');
  v_genero     := NULLIF(NEW.raw_user_meta_data->>'genero',          '');
  v_cargo      := NULLIF(TRIM(NEW.raw_user_meta_data->>'cargo'),     '');
  v_foto_url   := NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_url'),  '');
  v_rol        := COALESCE(NULLIF(NEW.raw_user_meta_data->>'rol',    ''), 'miembro');
  v_staff_code := NULLIF(UPPER(TRIM(NEW.raw_user_meta_data->>'staff_code')), '');

  BEGIN
    v_fecha_nac := (NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE;
  EXCEPTION WHEN OTHERS THEN v_fecha_nac := NULL; END;

  IF v_genero NOT IN ('M', 'F', 'Otro') THEN v_genero := NULL; END IF;

  -- ── SIEMPRE: perfil universal BD Maestra ─────────────────────────────────
  INSERT INTO public.profiles (id, full_name, tipo_documento, numero_documento, genero)
  VALUES (
    NEW.id, v_nombre,
    CASE WHEN v_documento IS NOT NULL THEN 'DNI' ELSE NULL END,
    v_documento, v_genero
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name        = EXCLUDED.full_name,
        tipo_documento   = COALESCE(EXCLUDED.tipo_documento,   profiles.tipo_documento),
        numero_documento = COALESCE(EXCLUDED.numero_documento, profiles.numero_documento),
        genero           = COALESCE(EXCLUDED.genero,           profiles.genero);

  v_gym_nombre := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_nombre'), '');

  -- ── CASO A: Onboarding — dueño registra su gimnasio ──────────────────────
  IF v_gym_nombre IS NOT NULL THEN
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Perú');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

    -- 1. Registrar como organización en BD Maestra
    INSERT INTO public.tenants (
      name, tax_id, industry_type_id, plan_id, status_financial_id, max_licenses
    )
    VALUES (
      v_gym_nombre,
      COALESCE(v_gym_ruc, 'PENDIENTE-' || gen_random_uuid()::text),
      'gym',
      public._gym_plan_to_bd(v_gym_plan),
      'FIN-PENDING',
      public._gym_plan_to_licenses(v_gym_plan)
    )
    RETURNING id INTO v_tenant_id;

    -- [018] Sembrar los 7 roles de sistema del nuevo tenant gym
    PERFORM public.seed_gym_roles(v_tenant_id);

    -- 2. Crear gym
    v_codigo := public.generate_gym_code(v_gym_nombre);
    INSERT INTO gym.gimnasios (
      nombre, ruc, ciudad, pais, direccion, telefono, email,
      plan_suscripcion, estado, tenant_id
    )
    VALUES (
      v_gym_nombre, v_gym_ruc, v_gym_ciudad, v_gym_pais, v_gym_direccion,
      v_gym_telefono, v_gym_email, v_gym_plan, 'activo', v_tenant_id
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    -- 3. Código de acceso (miembros)
    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_id_gimnasio, v_codigo, 'general', 'Codigo principal del gimnasio');

    -- 4. Perfil gym del dueño
    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, cargo, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, COALESCE(v_cargo, 'Gerente General'),
      v_id_gimnasio, 'gerente', 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

    -- 5. Vincular profile al tenant
    UPDATE public.profiles SET tenant_id = v_tenant_id WHERE id = NEW.id;

    -- 6. Asignar rol 'Administrador General' al dueño
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE tenant_id = v_tenant_id AND name = 'Administrador General';

    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (tenant_id, user_id, role_id)
      VALUES (v_tenant_id, NEW.id, v_role_id)
      ON CONFLICT DO NOTHING;
    END IF;

  -- ── CASO B: Signup con código (miembro o staff) ───────────────────────────
  ELSIF NEW.raw_user_meta_data->>'id_gimnasio' IS NOT NULL THEN
    v_id_gimnasio := (NEW.raw_user_meta_data->>'id_gimnasio')::uuid;

    -- Perfil gym
    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, v_id_gimnasio, v_rol, 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

    -- Vincular al tenant
    UPDATE public.profiles p
       SET tenant_id = g.tenant_id
      FROM gym.gimnasios g
     WHERE g.id_gimnasio = v_id_gimnasio
       AND p.id = NEW.id
       AND g.tenant_id IS NOT NULL;

    -- Si hay staff_code → asignar rol del code_grants
    IF v_staff_code IS NOT NULL THEN

      -- [017] V1: resolver tenant del gym ANTES del SELECT del código
      SELECT g.tenant_id INTO v_gym_tenant
      FROM gym.gimnasios g WHERE g.id_gimnasio = v_id_gimnasio;

      -- [017] V1 + V3 + V4: SELECT con aislamiento tenant, tipo restringido y lock de fila
      SELECT c.id, cg.role_id
      INTO   v_code_id, v_role_id
      FROM   public.codes c
      JOIN   public.code_grants cg ON cg.code_id = c.id
      WHERE  c.code      = v_staff_code
        AND  c.status    = 'active'
        AND  c.tenant_id = v_gym_tenant
        AND  c.type_id   = 'USER_INVITE'
        AND  (c.expires_at IS NULL OR c.expires_at > now())
        AND  (c.max_uses IS NULL OR c.current_uses < c.max_uses)
      LIMIT  1
      FOR UPDATE OF c;

      IF v_code_id IS NOT NULL THEN
        INSERT INTO public.user_roles (tenant_id, user_id, role_id)
        VALUES (v_gym_tenant, NEW.id, v_role_id)
        ON CONFLICT DO NOTHING;

        -- Consumir el código
        UPDATE public.codes
           SET current_uses = current_uses + 1,
               status = CASE
                 WHEN max_uses IS NOT NULL AND (current_uses + 1) >= max_uses THEN 'used'
                 ELSE 'active'
               END
         WHERE id = v_code_id;

        -- Registrar uso
        INSERT INTO public.code_usages (code_id, tenant_id, used_by, module_name)
        VALUES (v_code_id, v_gym_tenant, NEW.id, 'gym');
      END IF;

    ELSE
      -- Sin staff_code → asignar rol 'Miembro' por defecto
      SELECT g.tenant_id INTO v_tenant_id
      FROM gym.gimnasios g WHERE g.id_gimnasio = v_id_gimnasio;

      IF v_tenant_id IS NOT NULL THEN
        SELECT id INTO v_role_id
        FROM public.roles
        WHERE tenant_id = v_tenant_id AND name = 'Miembro';

        IF v_role_id IS NOT NULL THEN
          INSERT INTO public.user_roles (tenant_id, user_id, role_id)
          VALUES (v_tenant_id, NEW.id, v_role_id)
          ON CONFLICT DO NOTHING;
        END IF;
      END IF;
    END IF;

  -- ── CASO C: Otro sistema ──────────────────────────────────────────────────
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user FALLÓ para % (%) — Error: % [%]',
    NEW.email, NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$function$;



--------------------------------
CREATE OR REPLACE FUNCTION public.fn_create_staff_code(
  p_tenant_id uuid, p_role_id uuid, p_description text DEFAULT NULL::text,
  p_max_uses integer DEFAULT 1, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone,
  p_custom_code text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
  v_code_id UUID;
  v_code    TEXT;
BEGIN
  -- [019] cast explícito a text → desambigua entre los 2 overloads de fn_has_permission
  IF NOT public.fn_has_permission('gym.codigos.crear'::text) THEN
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
    'ok', true, 'code_id', v_code_id, 'code', v_code,
    'role_id', p_role_id, 'max_uses', p_max_uses, 'expires_at', p_expires_at
  );
END;
$function$;




CREATE TABLE public.user_permission_overrides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  permission  text NOT NULL REFERENCES public.cat_permissions(id),
  effect      text NOT NULL CHECK (effect IN ('grant','deny')),  -- añadir / quitar
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES auth.users(id),
  UNIQUE (tenant_id, user_id, permission)   -- un solo override por permiso por persona
);



Bloque 1 — Crear la tabla de overrides
sqlCREATE TABLE public.user_permission_overrides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  permission  text NOT NULL REFERENCES public.cat_permissions(id),
  effect      text NOT NULL CHECK (effect IN ('grant','deny')),
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES auth.users(id),
  UNIQUE (tenant_id, user_id, permission)
);

CREATE INDEX idx_upo_user_tenant ON public.user_permission_overrides (user_id, tenant_id);
Bloque 2 — fn_my_permissions v2 (rol + grants − denies)
sqlCREATE OR REPLACE FUNCTION public.fn_my_permissions()
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
Bloque 3 — fn_has_permission v2 (1 arg, misma lógica)
sqlCREATE OR REPLACE FUNCTION public.fn_has_permission(p_permission text)
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
Verificación inmediata (que entró sin romper nada)
sql-- Las 2 funciones existen y la tabla está creada
SELECT 'tabla' AS obj,
       (SELECT count(*) FROM information_schema.tables
        WHERE table_schema='public' AND table_name='user_permission_overrides')::text AS ok
UNION ALL
SELECT 'fn_my_permissions tiene override',
       CASE WHEN pg_get_functiondef('public.fn_my_permissions'::regproc) ILIKE '%user_permission_overrides%'
            THEN 'sí' ELSE 'NO' END;

ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- SELECT: ver overrides de tu tenant si tienes ace.perms.manage (condición directa, sin fn_has_permission → evita overload ambiguo)
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

-- INSERT
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

-- UPDATE
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

-- DELETE
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


-- Dar ace.perms.manage y ace.perms.read al Admin General de TODOS los tenants gym
-- (incluye la plantilla 2fbedbdb → propaga a gyms futuros vía seed_gym_roles;
--  e idempotente → no duplica en el de Elizabeth que ya los tiene)
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


  BEGIN;

-- Suspender auditoría (lección audit_logs)
ALTER TABLE public.profiles DISABLE TRIGGER tr_audit_profiles;
ALTER TABLE public.roles    DISABLE TRIGGER tr_audit_roles;
ALTER TABLE public.tenants  DISABLE TRIGGER tr_audit_tenants;

-- 0. overrides del tenant (explícito, aunque cascada lo haría)
DELETE FROM public.user_permission_overrides WHERE tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';

-- 1. códigos de staff
DELETE FROM public.code_usages WHERE tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';
DELETE FROM public.code_grants cg USING public.codes c
 WHERE cg.code_id = c.id AND c.tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';
DELETE FROM public.codes WHERE tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';

-- 2. user_roles
DELETE FROM public.user_roles WHERE tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';

-- 3. gym.*
DELETE FROM gym.usuarios u USING gym.gimnasios g
 WHERE u.id_gimnasio = g.id_gimnasio AND g.tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';
DELETE FROM gym.codigos_acceso ca USING gym.gimnasios g
 WHERE ca.id_gimnasio = g.id_gimnasio AND g.tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';
DELETE FROM gym.gimnasios WHERE tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';

-- 4. role_permissions + roles
DELETE FROM public.role_permissions rp USING public.roles r
 WHERE rp.role_id = r.id AND r.tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';
DELETE FROM public.roles WHERE tenant_id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';

-- 5. profiles + tenant
DELETE FROM public.profiles WHERE id IN (
  '92785009-e39b-4a80-b8cd-0f36c8dc0267',
  '47fcad4a-e857-4d77-aaac-a1e6eac80788'
);
DELETE FROM public.tenants WHERE id = '2ddcf4b6-7274-4a29-9e18-b38b53b68dc8';

-- Reactivar auditoría
ALTER TABLE public.profiles ENABLE TRIGGER tr_audit_profiles;
ALTER TABLE public.roles    ENABLE TRIGGER tr_audit_roles;
ALTER TABLE public.tenants  ENABLE TRIGGER tr_audit_tenants;

COMMIT;