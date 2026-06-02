-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 017: Fix handle_new_user — staff_code validation
-- Fecha: 2026-06-02
-- Schema: public
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- CONTEXTO (auditoría de seguridad — ver 016):
--   El trigger handle_new_user procesaba staff_code sin tres garantías críticas.
--   Esta migración las agrega sin cambiar el comportamiento funcional existente.
--
-- VULNERABILIDADES CORREGIDAS:
--
--   V1 [ALTA]  Cross-tenant role injection
--              El SELECT del código no filtraba por tenant del gimnasio.
--              Un código de Tenant A podía usarse en el signup de Tenant B,
--              inyectando un rol foráneo en user_roles del Tenant B.
--              FIX: AND c.tenant_id = v_gym_tenant
--
--   V3 [MEDIA] Race condition en consumo del código
--              SELECT sin FOR UPDATE permitía que dos signups concurrentes
--              pasaran el check max_uses antes de que el primero incrementara
--              current_uses.
--              FIX: FOR UPDATE OF c en el SELECT del código
--
--   V4 [BAJA]  Sin filtro de type_id
--              Cualquier tipo de código (COUPON, GYM_PROMO, etc.) con una
--              entrada en code_grants podía funcionar como staff_code.
--              FIX: AND c.type_id = 'USER_INVITE'
--
-- RESTRICCIONES DE IMPLEMENTACIÓN:
--   - fn_use_code() NO se llama (auth.uid() = NULL en contexto de trigger signup)
--   - Estructura de code_usages: sin cambios
--   - Estructura de user_roles: sin cambios
--   - Semántica de handle_new_user: sin cambios
--   - CASO A (onboarding dueño): sin cambios
--   - CASO B ELSE (miembro sin código): sin cambios
--   - Sin nuevas RPCs, tablas, ni refactors
--
-- CAMBIOS EN EL TRIGGER:
--   1. v_gym_tenant UUID agregado al DECLARE principal (era DECLARE anidado)
--   2. SELECT g.tenant_id INTO v_gym_tenant elevado antes del lookup del código
--   3. Tres condiciones añadidas al SELECT del staff_code (V1, V3, V4)
--   4. Bloque DECLARE/BEGIN/END interno eliminado (variable ahora en scope exterior)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Reemplazar handle_new_user con las correcciones de seguridad
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
  -- Sin cambios en esta migración.
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

      -- [017] V1: resolver tenant del gym ANTES del SELECT del código
      --           para poder usarlo como condición de filtro.
      --           Fuente: gym.gimnasios.tenant_id (FK a public.tenants.id,
      --           confirmada y poblada en migración 015b).
      SELECT g.tenant_id INTO v_gym_tenant
      FROM gym.gimnasios g WHERE g.id_gimnasio = v_id_gimnasio;

      -- [017] V1 + V3 + V4: SELECT con aislamiento tenant, tipo restringido y lock de fila
      SELECT c.id, cg.role_id
      INTO   v_code_id, v_role_id
      FROM   public.codes c
      JOIN   public.code_grants cg ON cg.code_id = c.id
      WHERE  c.code      = v_staff_code
        AND  c.status    = 'active'
        AND  c.tenant_id = v_gym_tenant       -- V1: el código debe pertenecer al tenant del gym
        AND  c.type_id   = 'USER_INVITE'      -- V4: solo códigos de invitación de staff
        AND  (c.expires_at IS NULL OR c.expires_at > now())
        AND  (c.max_uses IS NULL OR c.current_uses < c.max_uses)
      LIMIT  1
      FOR UPDATE OF c;                        -- V3: serializa consumos concurrentes del mismo código

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
      -- Sin cambios en esta migración.
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

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: handle_new_user actualizado con fixes V1, V3, V4'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Verificación
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_fn_body TEXT;
  v_has_tenant_filter  BOOLEAN := FALSE;
  v_has_type_filter    BOOLEAN := FALSE;
  v_has_for_update     BOOLEAN := FALSE;
BEGIN
  SELECT pg_get_functiondef(oid) INTO v_fn_body
  FROM pg_proc
  WHERE proname = 'handle_new_user'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  v_has_tenant_filter := v_fn_body LIKE '%c.tenant_id = v_gym_tenant%';
  v_has_type_filter   := v_fn_body LIKE '%USER_INVITE%';
  v_has_for_update    := v_fn_body LIKE '%FOR UPDATE OF c%';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  MIGRACIÓN 017 — VERIFICACIÓN';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  V1  c.tenant_id = v_gym_tenant  : %',
    CASE WHEN v_has_tenant_filter THEN '✅ presente' ELSE '❌ FALTA' END;
  RAISE NOTICE '  V4  c.type_id = USER_INVITE     : %',
    CASE WHEN v_has_type_filter   THEN '✅ presente' ELSE '❌ FALTA' END;
  RAISE NOTICE '  V3  FOR UPDATE OF c             : %',
    CASE WHEN v_has_for_update    THEN '✅ presente' ELSE '❌ FALTA' END;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';

  IF NOT (v_has_tenant_filter AND v_has_type_filter AND v_has_for_update) THEN
    RAISE EXCEPTION '❌ La verificación falló — revisar handle_new_user()';
  END IF;

  RAISE NOTICE '  ✅ Los tres fixes están presentes. Migración 017 correcta.';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
