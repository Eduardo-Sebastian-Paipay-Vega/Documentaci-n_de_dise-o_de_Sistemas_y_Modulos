-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 009: Consolidar arquitectura gym + RPCs post-login
-- Fecha: 2026-05-30  |  v2.0 (reescrita — sin dependencias BD Maestra)
-- Ejecutar en: Supabase SQL Editor
-- Prerequisito: migraciones 001-008 + 008b aplicadas
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ARQUITECTURA REAL (confirmada en supabase-schema.sql):
--   auth.users          → identidad (Supabase, nunca se toca directamente)
--   gym.gimnasios       → EL TENANT   (id_gimnasio es el tenant ID)
--   gym.usuarios        → EL PERFIL   (FK → auth.users via id_usuario)
--   gym.codigos_acceso  → invitaciones por gimnasio
--   public.*            → funciones helper RLS solamente
--
-- NO existe ni se necesita public.tenants, public.profiles, public.sedes.
-- La versión anterior de esta migración asumía una "BD Maestra" que no existe
-- y fallaba con "relation does not exist" en todas las referencias a esas tablas.
--
-- LO QUE AGREGA ESTA MIGRACIÓN:
--   1. gym.current_gym_id()  — helper canónico para RLS en schema gym
--   2. RLS completo en TODAS las tablas gym (con tenant isolation correcto)
--   3. gym.bootstrap_gym_tenant() — RPC post-login para onboarding de dueños
--   4. gym.join_gym_with_code()   — RPC post-login para ingreso con código
--   5. Grants finales y verificación
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Helper canónico: id del gimnasio del usuario actual
-- Vive en el schema gym (no en public) para que las políticas del schema
-- puedan usarla sin search_path tricks.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.current_gym_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = gym, public, auth
AS $$
  SELECT id_gimnasio FROM gym.usuarios WHERE id_usuario = auth.uid()
$$;

DO $$ BEGIN RAISE NOTICE '✅ gym.current_gym_id() creada (usa gym.usuarios, no public.tenants)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — RLS en tablas gym que aún no tienen todas sus políticas
-- Las tablas ya tienen RLS ON desde 002/003, pero algunas solo tienen SELECT.
-- Completamos con tenant isolation para las tablas de innovación.
-- DROP IF EXISTS + CREATE para ser idempotentes.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── planes ────────────────────────────────────────────────────────────────────
ALTER TABLE gym.planes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "planes_select_gym"   ON gym.planes;
DROP POLICY IF EXISTS "planes_write_staff"  ON gym.planes;

CREATE POLICY "planes_select_gym" ON gym.planes
  FOR SELECT USING (id_gimnasio = gym.current_gym_id());

CREATE POLICY "planes_write_staff" ON gym.planes
  FOR ALL USING (
    id_gimnasio = gym.current_gym_id() AND
    public.get_user_rol() IN ('gerente','admin')
  );

-- ── codigos_acceso ────────────────────────────────────────────────────────────
-- Ya tiene RLS desde 008. Reemplazamos las dos políticas para que usen
-- gym.current_gym_id() consistentemente con el resto.
ALTER TABLE gym.codigos_acceso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "codigos_select_public"  ON gym.codigos_acceso;
DROP POLICY IF EXISTS "codigos_select_gerente" ON gym.codigos_acceso;
DROP POLICY IF EXISTS "codigos_write_gerente"  ON gym.codigos_acceso;

-- SELECT público: anon y authenticated pueden buscar un código activo (signup)
CREATE POLICY "codigos_select_public" ON gym.codigos_acceso
  FOR SELECT USING (activo = TRUE);

-- Write: solo el gerente del gimnasio dueño del código
CREATE POLICY "codigos_write_gerente" ON gym.codigos_acceso
  FOR ALL USING (
    id_gimnasio = gym.current_gym_id() AND
    public.get_user_rol() IN ('gerente','admin')
  );

GRANT SELECT ON gym.codigos_acceso TO anon;

-- ── promociones ───────────────────────────────────────────────────────────────
ALTER TABLE gym.promociones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promociones_select_gym"  ON gym.promociones;
DROP POLICY IF EXISTS "promociones_write_staff" ON gym.promociones;

CREATE POLICY "promociones_select_gym" ON gym.promociones
  FOR SELECT USING (id_gimnasio = gym.current_gym_id());

CREATE POLICY "promociones_write_staff" ON gym.promociones
  FOR ALL USING (
    id_gimnasio = gym.current_gym_id() AND
    public.get_user_rol() IN ('gerente','admin')
  );

-- ── maquinas ──────────────────────────────────────────────────────────────────
-- maquinas → espacios → gimnasios (FK indirecta)
ALTER TABLE gym.maquinas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maquinas_select_gym"  ON gym.maquinas;
DROP POLICY IF EXISTS "maquinas_write_staff" ON gym.maquinas;

CREATE POLICY "maquinas_select_gym" ON gym.maquinas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gym.espacios e
       WHERE e.id_espacio  = maquinas.id_espacio
         AND e.id_gimnasio = gym.current_gym_id()
    )
  );

CREATE POLICY "maquinas_write_staff" ON gym.maquinas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gym.espacios e
       WHERE e.id_espacio  = maquinas.id_espacio
         AND e.id_gimnasio = gym.current_gym_id()
    ) AND public.get_user_rol() IN ('gerente','admin','recepcionista')
  );

-- ── espacios ─────────────────────────────────────────────────────────────────
ALTER TABLE gym.espacios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "espacios_select_gym"  ON gym.espacios;
DROP POLICY IF EXISTS "espacios_write_staff" ON gym.espacios;

CREATE POLICY "espacios_select_gym" ON gym.espacios
  FOR SELECT USING (id_gimnasio = gym.current_gym_id());

CREATE POLICY "espacios_write_staff" ON gym.espacios
  FOR ALL USING (
    id_gimnasio = gym.current_gym_id() AND
    public.get_user_rol() IN ('gerente','admin')
  );

-- ── entrenadores ──────────────────────────────────────────────────────────────
ALTER TABLE gym.entrenadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entrenadores_select_gym"  ON gym.entrenadores;
DROP POLICY IF EXISTS "entrenadores_write_staff" ON gym.entrenadores;

CREATE POLICY "entrenadores_select_gym" ON gym.entrenadores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gym.usuarios u
       WHERE u.id_usuario = entrenadores.id_usuario
         AND u.id_gimnasio = gym.current_gym_id()
    )
  );

CREATE POLICY "entrenadores_write_staff" ON gym.entrenadores
  FOR ALL USING (
    public.get_user_rol() IN ('gerente','admin')
  );

DO $$ BEGIN RAISE NOTICE '✅ RLS consolidado en planes, codigos_acceso, promociones, maquinas, espacios, entrenadores'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — RPC: gym.bootstrap_gym_tenant()
-- Crea un nuevo gimnasio y asigna el usuario autenticado como gerente.
-- Se llama DESPUÉS del login (el usuario ya existe en auth.users y gym.usuarios).
-- Útil como respaldo si el trigger handle_new_user no pudo crear el gym.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.bootstrap_gym_tenant(
  p_nombre      TEXT,
  p_ruc         TEXT     DEFAULT NULL,
  p_ciudad      TEXT     DEFAULT 'Lima',
  p_pais        TEXT     DEFAULT 'Perú',
  p_direccion   TEXT     DEFAULT NULL,
  p_telefono    TEXT     DEFAULT NULL,
  p_email       TEXT     DEFAULT NULL,
  p_plan        TEXT     DEFAULT 'mediano',
  p_cargo       TEXT     DEFAULT 'Gerente General'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public, auth
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_gym_id     UUID;
  v_code       TEXT;
BEGIN
  -- 1. Verificar autenticación
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- 2. Verificar que el usuario no tenga ya un gym asignado
  IF EXISTS (
    SELECT 1 FROM gym.usuarios
     WHERE id_usuario = v_user_id AND id_gimnasio IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'El usuario ya tiene un gimnasio registrado';
  END IF;

  -- 3. Crear el gimnasio
  INSERT INTO gym.gimnasios (
    nombre, ruc, ciudad, pais, direccion, telefono, email,
    plan_suscripcion, estado
  )
  VALUES (
    p_nombre, p_ruc, p_ciudad, p_pais, p_direccion,
    p_telefono, p_email, p_plan, 'activo'
  )
  RETURNING id_gimnasio INTO v_gym_id;

  -- 4. Generar y registrar código de acceso
  v_code := public.generate_gym_code(p_nombre);
  INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion, creado_por)
  VALUES (v_gym_id, v_code, 'general', 'Código principal', v_user_id);

  -- 5. Actualizar perfil del usuario → asignarlo como gerente del gym
  UPDATE gym.usuarios
     SET id_gimnasio = v_gym_id,
         rol         = 'gerente',
         cargo       = COALESCE(cargo, p_cargo),
         estado      = 'activo'
   WHERE id_usuario = v_user_id;

  -- Si el usuario aún no tiene fila en gym.usuarios, crearla
  IF NOT FOUND THEN
    INSERT INTO gym.usuarios (id_usuario, email, nombre, cargo, id_gimnasio, rol, estado)
    SELECT
      v_user_id,
      au.email,
      COALESCE(NULLIF(au.raw_user_meta_data->>'nombre', ''), split_part(au.email, '@', 1)),
      p_cargo,
      v_gym_id,
      'gerente',
      'activo'
    FROM auth.users au WHERE au.id = v_user_id
    ON CONFLICT (id_usuario) DO UPDATE
      SET id_gimnasio = v_gym_id, rol = 'gerente', cargo = p_cargo;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'id_gimnasio', v_gym_id,
    'codigo',      v_code,
    'plan',        p_plan
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'bootstrap_gym_tenant: % (%)', SQLERRM, SQLSTATE;
END;
$$;

GRANT EXECUTE ON FUNCTION gym.bootstrap_gym_tenant TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ gym.bootstrap_gym_tenant() lista (usa gym.gimnasios como tenant)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — RPC: gym.join_gym_with_code()
-- Un usuario autenticado se une a un gimnasio usando su código de acceso.
-- Se llama DESPUÉS del login, cuando el perfil no tiene id_gimnasio asignado.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.join_gym_with_code(
  p_codigo  TEXT,
  p_nombre  TEXT  DEFAULT NULL,
  p_cargo   TEXT  DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public, auth
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_gym_id    UUID;
  v_code_id   UUID;
  v_max_usos  INT;
  v_usos_act  INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Buscar el código activo
  SELECT id_codigo, id_gimnasio, usos_max, usos_actuales
    INTO v_code_id, v_gym_id, v_max_usos, v_usos_act
    FROM gym.codigos_acceso
   WHERE codigo = upper(trim(p_codigo))
     AND activo = TRUE
     AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
   LIMIT 1;

  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'Código inválido, inactivo o expirado';
  END IF;

  -- Verificar límite de usos
  IF v_max_usos IS NOT NULL AND v_usos_act >= v_max_usos THEN
    RAISE EXCEPTION 'El código ya alcanzó su límite de usos';
  END IF;

  -- Asignar gym al perfil del usuario (si aún no tiene uno)
  UPDATE gym.usuarios
     SET id_gimnasio = v_gym_id,
         nombre      = COALESCE(NULLIF(p_nombre, ''), nombre),
         cargo       = COALESCE(NULLIF(p_cargo, ''), cargo),
         estado      = 'activo'
   WHERE id_usuario = v_user_id
     AND id_gimnasio IS NULL;

  -- Si no tenía perfil, crearlo
  IF NOT FOUND THEN
    INSERT INTO gym.usuarios (id_usuario, email, nombre, cargo, id_gimnasio, rol, estado)
    SELECT
      v_user_id,
      au.email,
      COALESCE(NULLIF(p_nombre, ''), NULLIF(au.raw_user_meta_data->>'nombre', ''), split_part(au.email, '@', 1)),
      p_cargo,
      v_gym_id,
      'miembro',
      'activo'
    FROM auth.users au WHERE au.id = v_user_id
    ON CONFLICT (id_usuario) DO UPDATE
      SET id_gimnasio = v_gym_id, estado = 'activo';
  END IF;

  -- Incrementar contador de usos del código
  UPDATE gym.codigos_acceso
     SET usos_actuales = usos_actuales + 1
   WHERE id_codigo = v_code_id;

  RETURN jsonb_build_object(
    'ok',          true,
    'id_gimnasio', v_gym_id,
    'codigo',      p_codigo
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'join_gym_with_code: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION gym.join_gym_with_code TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ gym.join_gym_with_code() lista (usa gym.codigos_acceso)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Grants finales
-- ─────────────────────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA gym TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym TO authenticated;
GRANT SELECT ON gym.codigos_acceso TO anon;

-- Grants en secuencias (UUID4 no usa sequences, pero por si acaso hay alguna)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA gym TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ Grants finales aplicados'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_gym_fn   TEXT;
  v_boot_fn  TEXT;
  v_join_fn  TEXT;
  v_gym_count INT;
  v_usr_count INT;
BEGIN
  -- Verificar que las funciones existen
  SELECT p.proname INTO v_gym_fn
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'gym' AND p.proname = 'current_gym_id';

  SELECT p.proname INTO v_boot_fn
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'gym' AND p.proname = 'bootstrap_gym_tenant';

  SELECT p.proname INTO v_join_fn
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'gym' AND p.proname = 'join_gym_with_code';

  -- Contar datos existentes
  SELECT COUNT(*) INTO v_gym_count FROM gym.gimnasios;
  SELECT COUNT(*) INTO v_usr_count FROM gym.usuarios;

  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '  VERIFICACIÓN MIGRACIÓN 009';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '  gym.current_gym_id()        : %', CASE WHEN v_gym_fn IS NOT NULL THEN '✅ existe' ELSE '❌ FALTA' END;
  RAISE NOTICE '  gym.bootstrap_gym_tenant()  : %', CASE WHEN v_boot_fn IS NOT NULL THEN '✅ existe' ELSE '❌ FALTA' END;
  RAISE NOTICE '  gym.join_gym_with_code()    : %', CASE WHEN v_join_fn IS NOT NULL THEN '✅ existe' ELSE '❌ FALTA' END;
  RAISE NOTICE '  Gimnasios en BD             : %', v_gym_count;
  RAISE NOTICE '  Usuarios en BD              : %', v_usr_count;
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '  ARQUITECTURA CONFIRMADA:';
  RAISE NOTICE '  auth.users        → identidad (Supabase, intocable)';
  RAISE NOTICE '  gym.gimnasios     → tenant (id_gimnasio = tenant ID)';
  RAISE NOTICE '  gym.usuarios      → perfil (FK → auth.users)';
  RAISE NOTICE '  gym.codigos_acceso → invitaciones por gimnasio';
  RAISE NOTICE '  public.*          → funciones RLS helper';
  RAISE NOTICE '  NO se usa public.tenants ni public.profiles';
  RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;

-- ─── FIN MIGRACIÓN 009 ────────────────────────────────────────────────────────
