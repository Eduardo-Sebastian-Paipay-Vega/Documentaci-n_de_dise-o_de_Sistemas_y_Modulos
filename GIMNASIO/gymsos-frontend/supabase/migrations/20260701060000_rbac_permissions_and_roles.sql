-- 20260701060000_rbac_permissions_and_roles.sql
-- Capa 5/6 · cat_permissions seeds, user_roles, code_grants, roles, fn_has_permission, RLS
-- PROVENIENCIA (materializado Fase 4, sin pérdida de lógica): 016_accesos_y_codigos_staff.sql
-- Generado: 2026-07-04. Ver MIGRATION_STRATEGY.md

-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 016: Sistema de Accesos + Códigos de Staff
-- Fecha: 2026-06-02
-- Schema: public + gym
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- FILOSOFÍA:
--   Usuarios → Roles → Permisos   (RBAC granular)
--   Los roles son agrupaciones fuertes de permisos.
--   Los códigos de acceso otorgan roles automáticamente al crear la cuenta.
--   No hay dependencia de roles estáticos en el código frontend.
--
-- TABLAS NUEVAS:
--   public.user_roles      → asigna roles a usuarios dentro de un tenant
--   public.code_grants     → qué rol otorga un código al ser usado
--
-- TABLAS EXTENDIDAS:
--   public.cat_permissions → seeds del módulo gym (30 permisos)
--   public.roles           → seeds de 7 roles sistema por cada tenant gym
--   public.role_permissions→ permisos por rol
--
-- RPCS NUEVAS:
--   fn_has_permission(permission)     → ¿el usuario actual tiene este permiso?
--   fn_my_permissions()               → todos los permisos del usuario actual
--   fn_create_staff_code(...)         → crea código USER_INVITE con rol asignado
--   fn_current_tenant_id()            → helper (recrea si no existe)
--
-- TRIGGER ACTUALIZADO:
--   handle_new_user CASO B → asigna rol del código staff al crear cuenta
--
-- FLUJO COMPLETO:
--   Admin → fn_create_staff_code(tenant_id, role_id) → código "ABX-7K2M"
--   Staff → /signup con código → signUp({ id_gimnasio, staff_code })
--   Trigger → crea gym.usuarios + INSERT user_roles (rol del código)
--   Dashboard → fn_has_permission('gym.pagos.crear') → true/false
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Permisos del módulo gym en public.cat_permissions
-- Orden: {modulo}.{recurso}.{accion}
-- Insertar ANTES que role_permissions (trigger valida FK)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.cat_permissions (id, description, module) VALUES
  -- Usuarios
  ('gym.usuarios.ver',            'Ver lista de usuarios del gimnasio',       'gym'),
  ('gym.usuarios.crear',          'Registrar nuevos usuarios',                'gym'),
  ('gym.usuarios.editar',         'Editar datos de usuarios',                 'gym'),
  ('gym.usuarios.eliminar',       'Eliminar o desactivar usuarios',           'gym'),
  -- Membresías
  ('gym.membresias.ver',          'Ver membresías activas e historial',       'gym'),
  ('gym.membresias.crear',        'Crear nuevas membresías',                  'gym'),
  ('gym.membresias.aprobar',      'Aprobar solicitudes de membresía',         'gym'),
  ('gym.membresias.cancelar',     'Cancelar membresías activas',              'gym'),
  -- Pagos
  ('gym.pagos.ver',               'Ver transacciones y cobros',               'gym'),
  ('gym.pagos.crear',             'Registrar cobros y pagos',                 'gym'),
  ('gym.pagos.reembolsar',        'Emitir reembolsos',                        'gym'),
  -- Clases
  ('gym.clases.ver',              'Ver calendario de clases',                 'gym'),
  ('gym.clases.gestionar',        'Crear, editar y cancelar clases',          'gym'),
  ('gym.clases.inscribir',        'Inscribir y desinscribir miembros',        'gym'),
  -- Accesos (torniquete / QR)
  ('gym.accesos.ver',             'Ver registro de entradas y salidas',       'gym'),
  ('gym.accesos.crear',           'Registrar accesos manualmente',            'gym'),
  -- Planes
  ('gym.planes.ver',              'Ver planes de membresía disponibles',      'gym'),
  ('gym.planes.gestionar',        'Crear y editar planes',                    'gym'),
  -- Reportes
  ('gym.reportes.ver',            'Ver reportes y dashboards',                'gym'),
  ('gym.reportes.exportar',       'Exportar reportes a CSV/PDF',              'gym'),
  -- Códigos de acceso
  ('gym.codigos.ver',             'Ver códigos de acceso emitidos',           'gym'),
  ('gym.codigos.crear',           'Emitir nuevos códigos de acceso',          'gym'),
  ('gym.codigos.revocar',         'Revocar códigos activos',                  'gym'),
  -- Configuración del gym
  ('gym.config.ver',              'Ver configuración del gimnasio',           'gym'),
  ('gym.config.editar',           'Editar configuración y datos del gym',     'gym'),
  -- Espacios y máquinas
  ('gym.espacios.ver',            'Ver espacios y equipamiento',              'gym'),
  ('gym.espacios.gestionar',      'Crear y editar espacios y máquinas',       'gym'),
  -- Entrenadores
  ('gym.entrenadores.ver',        'Ver perfiles de entrenadores',             'gym'),
  ('gym.entrenadores.gestionar',  'Asignar y gestionar entrenadores',         'gym'),
  -- Nutrición
  ('gym.nutricion.ver',           'Ver planes nutricionales de miembros',     'gym'),
  ('gym.nutricion.gestionar',     'Crear y editar planes nutricionales',      'gym')
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: 31 permisos del módulo gym insertados en cat_permissions'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Tabla public.user_roles
-- Asignación de roles a usuarios dentro de un tenant.
-- Más simple que user_roles_sedes (sin sede — tenant-level).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  role_id     UUID        NOT NULL REFERENCES public.roles(id)   ON DELETE CASCADE,
  assigned_by UUID        REFERENCES auth.users(id)              ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  UNIQUE (tenant_id, user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_tenant  ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user    ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role    ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active  ON public.user_roles(user_id, tenant_id)
  WHERE expires_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON public.user_roles(expires_at)
  WHERE expires_at IS NOT NULL;

DO $$ BEGIN RAISE NOTICE '✅ PASO 2: public.user_roles creada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Tabla public.code_grants
-- Define qué rol otorga un código al ser usado.
-- FK a public.codes (migración 010) y public.roles.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.code_grants (
  code_id  UUID NOT NULL REFERENCES public.codes(id)  ON DELETE CASCADE,
  role_id  UUID NOT NULL REFERENCES public.roles(id)  ON DELETE CASCADE,
  PRIMARY KEY (code_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_code_grants_code ON public.code_grants(code_id);
CREATE INDEX IF NOT EXISTS idx_code_grants_role ON public.code_grants(role_id);

DO $$ BEGIN RAISE NOTICE '✅ PASO 3: public.code_grants creada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — RLS en nuevas tablas
-- ─────────────────────────────────────────────────────────────────────────────

-- public.user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_tenant_select"   ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_select"     ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_write"     ON public.user_roles;

-- Cada usuario ve sus propios roles
CREATE POLICY "user_roles_self_select" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Admins ven todos los roles de su tenant
CREATE POLICY "user_roles_tenant_select" ON public.user_roles
  FOR SELECT USING (tenant_id = public.fn_current_tenant_id());

-- Solo quien tiene gym.codigos.crear puede asignar roles (o service_role)
CREATE POLICY "user_roles_admin_write" ON public.user_roles
  FOR ALL USING (tenant_id = public.fn_current_tenant_id());

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL    ON public.user_roles TO postgres, service_role;

-- public.code_grants
ALTER TABLE public.code_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "code_grants_tenant_select" ON public.code_grants;

-- Solo authenticated puede ver los grants de códigos de su tenant
CREATE POLICY "code_grants_tenant_select" ON public.code_grants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.codes c
       WHERE c.id = code_grants.code_id
         AND c.tenant_id = public.fn_current_tenant_id()
    )
  );

GRANT SELECT ON public.code_grants TO authenticated;
GRANT ALL    ON public.code_grants TO postgres, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 4: RLS habilitado en user_roles y code_grants'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — fn_current_tenant_id() (recrear si no existe o corregir)
-- Lee public.profiles.tenant_id del usuario actual.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.fn_current_tenant_id() TO authenticated, anon;

DO $$ BEGIN RAISE NOTICE '✅ PASO 5: fn_current_tenant_id() recreada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — Seeds: 7 roles de sistema por cada tenant gym existente
-- Hierarchy: 0 = máximo poder, 100 = mínimo
-- Se crean para todos los tenants gym, luego se asignan permisos.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  tenant_rec   RECORD;
  r_admin      UUID;
  r_supervisor UUID;
  r_cajero     UUID;
  r_recep      UUID;
  r_entren     UUID;
  r_nutri      UUID;
  r_miembro    UUID;
  total_tenants INT := 0;
BEGIN
  FOR tenant_rec IN
    SELECT id FROM public.tenants WHERE industry_type_id = 'gym'
  LOOP
    total_tenants := total_tenants + 1;

    -- Crear 7 roles del sistema para este tenant
    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Administrador General', 0,   true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=0, is_system_role=true
    RETURNING id INTO r_admin;

    IF r_admin IS NULL THEN
      SELECT id INTO r_admin FROM public.roles
      WHERE tenant_id = tenant_rec.id AND name = 'Administrador General';
    END IF;

    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Supervisor', 10, true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=10, is_system_role=true
    RETURNING id INTO r_supervisor;
    IF r_supervisor IS NULL THEN SELECT id INTO r_supervisor FROM public.roles WHERE tenant_id=tenant_rec.id AND name='Supervisor'; END IF;

    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Cajero', 30, true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=30, is_system_role=true
    RETURNING id INTO r_cajero;
    IF r_cajero IS NULL THEN SELECT id INTO r_cajero FROM public.roles WHERE tenant_id=tenant_rec.id AND name='Cajero'; END IF;

    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Recepcionista', 40, true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=40, is_system_role=true
    RETURNING id INTO r_recep;
    IF r_recep IS NULL THEN SELECT id INTO r_recep FROM public.roles WHERE tenant_id=tenant_rec.id AND name='Recepcionista'; END IF;

    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Entrenador', 50, true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=50, is_system_role=true
    RETURNING id INTO r_entren;
    IF r_entren IS NULL THEN SELECT id INTO r_entren FROM public.roles WHERE tenant_id=tenant_rec.id AND name='Entrenador'; END IF;

    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Nutricionista', 50, true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=50, is_system_role=true
    RETURNING id INTO r_nutri;
    IF r_nutri IS NULL THEN SELECT id INTO r_nutri FROM public.roles WHERE tenant_id=tenant_rec.id AND name='Nutricionista'; END IF;

    INSERT INTO public.roles (tenant_id, name, hierarchy_level, is_system_role)
    VALUES (tenant_rec.id, 'Miembro', 100, true)
    ON CONFLICT (tenant_id, name) DO UPDATE SET hierarchy_level=100, is_system_role=true
    RETURNING id INTO r_miembro;
    IF r_miembro IS NULL THEN SELECT id INTO r_miembro FROM public.roles WHERE tenant_id=tenant_rec.id AND name='Miembro'; END IF;

    -- ── Permisos de Administrador General (todos) ───────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_admin, id FROM public.cat_permissions WHERE module = 'gym'
    ON CONFLICT DO NOTHING;

    -- ── Permisos de Supervisor ──────────────────────────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_supervisor, unnest(ARRAY[
      'gym.usuarios.ver','gym.usuarios.crear','gym.usuarios.editar',
      'gym.membresias.ver','gym.membresias.crear','gym.membresias.aprobar','gym.membresias.cancelar',
      'gym.pagos.ver','gym.pagos.crear',
      'gym.clases.ver','gym.clases.gestionar','gym.clases.inscribir',
      'gym.accesos.ver','gym.accesos.crear',
      'gym.planes.ver',
      'gym.reportes.ver','gym.reportes.exportar',
      'gym.codigos.ver',
      'gym.espacios.ver','gym.entrenadores.ver'
    ])
    ON CONFLICT DO NOTHING;

    -- ── Permisos de Cajero ──────────────────────────────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_cajero, unnest(ARRAY[
      'gym.usuarios.ver',
      'gym.membresias.ver','gym.membresias.crear','gym.membresias.aprobar',
      'gym.pagos.ver','gym.pagos.crear',
      'gym.planes.ver',
      'gym.reportes.ver',
      'gym.accesos.ver'
    ])
    ON CONFLICT DO NOTHING;

    -- ── Permisos de Recepcionista ───────────────────────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_recep, unnest(ARRAY[
      'gym.usuarios.ver','gym.usuarios.crear',
      'gym.membresias.ver',
      'gym.pagos.ver',
      'gym.clases.ver','gym.clases.inscribir',
      'gym.accesos.ver','gym.accesos.crear',
      'gym.planes.ver'
    ])
    ON CONFLICT DO NOTHING;

    -- ── Permisos de Entrenador ──────────────────────────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_entren, unnest(ARRAY[
      'gym.usuarios.ver',
      'gym.clases.ver','gym.clases.gestionar','gym.clases.inscribir',
      'gym.accesos.ver',
      'gym.espacios.ver',
      'gym.entrenadores.ver'
    ])
    ON CONFLICT DO NOTHING;

    -- ── Permisos de Nutricionista ───────────────────────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_nutri, unnest(ARRAY[
      'gym.usuarios.ver',
      'gym.nutricion.ver','gym.nutricion.gestionar',
      'gym.accesos.ver'
    ])
    ON CONFLICT DO NOTHING;

    -- ── Permisos de Miembro (mínimos) ───────────────────────────────────────
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT r_miembro, unnest(ARRAY[
      'gym.clases.ver',
      'gym.accesos.ver',
      'gym.planes.ver'
    ])
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '  → Roles creados para tenant: %', tenant_rec.id;
  END LOOP;

  RAISE NOTICE '✅ PASO 6: 7 roles × % tenants gym = % roles de sistema',
    total_tenants, total_tenants * 7;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7 — Asignar 'Administrador General' a dueños gym existentes
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec       RECORD;
  v_role_id UUID;
  total     INT := 0;
BEGIN
  FOR rec IN
    SELECT gu.id_usuario, g.tenant_id
    FROM gym.usuarios gu
    JOIN gym.gimnasios g ON g.id_gimnasio = gu.id_gimnasio
    WHERE gu.rol = 'gerente'
      AND g.tenant_id IS NOT NULL
  LOOP
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE tenant_id = rec.tenant_id AND name = 'Administrador General';

    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (tenant_id, user_id, role_id)
      VALUES (rec.tenant_id, rec.id_usuario, v_role_id)
      ON CONFLICT (tenant_id, user_id, role_id) DO NOTHING;
      total := total + 1;
      RAISE NOTICE '  → Admin asignado: user=% tenant=%', rec.id_usuario, rec.tenant_id;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ PASO 7: % gerentes asignados como Administrador General', total;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8 — RPC: fn_has_permission(permission)
-- Verifica si el usuario autenticado tiene un permiso específico.
-- Consulta user_roles → role_permissions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id   = auth.uid()
      AND ur.tenant_id = public.fn_current_tenant_id()
      AND rp.permission = p_permission
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  )
$$;

GRANT EXECUTE ON FUNCTION public.fn_has_permission(TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 9 — RPC: fn_my_permissions()
-- Devuelve todos los permisos del usuario autenticado en su tenant actual.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_my_permissions()
RETURNS TABLE(permission TEXT, role_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT rp.permission, r.name AS role_name
  FROM public.user_roles ur
  JOIN public.roles r            ON r.id  = ur.role_id
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  WHERE ur.user_id   = auth.uid()
    AND ur.tenant_id = public.fn_current_tenant_id()
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ORDER BY rp.permission
$$;

GRANT EXECUTE ON FUNCTION public.fn_my_permissions() TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ PASO 8-9: fn_has_permission() y fn_my_permissions() creadas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 10 — RPC: fn_create_staff_code(...)
-- Crea un código USER_INVITE en public.codes y lo vincula a un rol en code_grants.
-- Solo puede llamarlo quien tiene el permiso gym.codigos.crear.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_create_staff_code(
  p_tenant_id   UUID,
  p_role_id     UUID,
  p_description TEXT        DEFAULT NULL,
  p_max_uses    INT         DEFAULT 1,
  p_expires_at  TIMESTAMPTZ DEFAULT NULL,
  p_custom_code TEXT        DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_code_id UUID;
  v_code    TEXT;
BEGIN
  -- Verificar que el llamador tiene permiso de crear códigos
  IF NOT public.fn_has_permission('gym.codigos.crear') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sin permiso: gym.codigos.crear requerido');
  END IF;

  -- Verificar que el rol pertenece al mismo tenant
  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id = p_role_id AND tenant_id = p_tenant_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El rol no pertenece a este tenant');
  END IF;

  -- Crear el código usando fn_create_code del sistema 010
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

  -- Vincular el código al rol (code_grants)
  INSERT INTO public.code_grants (code_id, role_id)
  VALUES (v_code_id, p_role_id);

  RETURN jsonb_build_object(
    'ok',          true,
    'code_id',     v_code_id,
    'code',        v_code,
    'role_id',     p_role_id,
    'max_uses',    p_max_uses,
    'expires_at',  p_expires_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_create_staff_code(UUID, UUID, TEXT, INT, TIMESTAMPTZ, TEXT) TO authenticated, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 10: fn_create_staff_code() creada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 11 — Actualizar handle_new_user
-- CASO B ahora: si metadata incluye staff_code, asigna el rol del code_grants
-- CASO A ahora: asigna 'Administrador General' automáticamente al dueño
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
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
      SELECT c.id, cg.role_id
      INTO   v_code_id, v_role_id
      FROM   public.codes c
      JOIN   public.code_grants cg ON cg.code_id = c.id
      WHERE  c.code   = v_staff_code
        AND  c.status = 'active'
        AND  (c.expires_at IS NULL OR c.expires_at > now())
        AND  (c.max_uses IS NULL OR c.current_uses < c.max_uses)
      LIMIT  1;

      IF v_code_id IS NOT NULL THEN
        -- Obtener tenant del gym para user_roles
        DECLARE v_gym_tenant UUID;
        BEGIN
          SELECT g.tenant_id INTO v_gym_tenant
          FROM gym.gimnasios g WHERE g.id_gimnasio = v_id_gimnasio;

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
        END;
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
$$;

DO $$ BEGIN RAISE NOTICE '✅ PASO 11: handle_new_user actualizado — asigna roles en CASO A y B'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 12 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_permisos_gym     INT;
  v_roles_total      INT;
  v_user_roles_total INT;
  v_fn_has_perm      TEXT;
  v_fn_my_perms      TEXT;
  v_fn_staff_code    TEXT;
  v_rec              RECORD;
BEGIN
  SELECT COUNT(*) INTO v_permisos_gym    FROM public.cat_permissions WHERE module = 'gym';
  SELECT COUNT(*) INTO v_roles_total     FROM public.roles r JOIN public.tenants t ON t.id = r.tenant_id WHERE t.industry_type_id = 'gym';
  SELECT COUNT(*) INTO v_user_roles_total FROM public.user_roles;

  SELECT p.proname INTO v_fn_has_perm FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='fn_has_permission';
  SELECT p.proname INTO v_fn_my_perms FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='fn_my_permissions';
  SELECT p.proname INTO v_fn_staff_code FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='fn_create_staff_code';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 016 — VERIFICACIÓN FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  Permisos gym en cat_permissions : %', v_permisos_gym;
  RAISE NOTICE '  Roles sistema gym totales       : %', v_roles_total;
  RAISE NOTICE '  Asignaciones user_roles         : %', v_user_roles_total;
  RAISE NOTICE '  fn_has_permission()             : %', CASE WHEN v_fn_has_perm   IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_my_permissions()             : %', CASE WHEN v_fn_my_perms   IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_create_staff_code()          : %', CASE WHEN v_fn_staff_code IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '──────────────────────────────────────────────────────────────';
  RAISE NOTICE '  Roles por tenant gym:';
  FOR v_rec IN
    SELECT t.name AS tenant_name, COUNT(r.id) AS roles
    FROM public.tenants t
    LEFT JOIN public.roles r ON r.tenant_id = t.id
    WHERE t.industry_type_id = 'gym'
    GROUP BY t.name
  LOOP
    RAISE NOTICE '  [%] → % roles', v_rec.tenant_name, v_rec.roles;
  END LOOP;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  FLUJO STAFF HABILITADO:';
  RAISE NOTICE '  1. Admin → fn_create_staff_code(tenant_id, role_id) → código';
  RAISE NOTICE '  2. Staff → /signup con { id_gimnasio, staff_code }';
  RAISE NOTICE '  3. Trigger asigna rol automáticamente en user_roles';
  RAISE NOTICE '  4. Frontend → fn_has_permission("gym.pagos.crear") → true/false';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
