-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 009: Schema gym + RLS completo + RPCs
-- Fecha: 2026-05-31  |  v3.0 (auto-contenida — funciona desde estado rollback)
-- Ejecutar en: Supabase SQL Editor
-- Prerequisito: supabase-schema.sql aplicado (tablas gym en schema public)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ARQUITECTURA:
--   auth.users          → identidad (Supabase, nunca se toca)
--   gym.gimnasios       → el tenant  (id_gimnasio = tenant ID)
--   gym.usuarios        → el perfil  (FK → auth.users via id_usuario)
--   gym.codigos_acceso  → invitaciones por gimnasio
--   public.*            → funciones helper RLS solamente
--
-- ESTA MIGRACIÓN ES AUTO-CONTENIDA:
--   Funciona si las tablas están en public (estado post-rollback) o en gym.
--   Paso 0 crea el schema gym y mueve las tablas si hace falta.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 0 — Crear schema gym y mover tablas desde public (si no están ya en gym)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS gym;

GRANT USAGE ON SCHEMA gym TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym
  GRANT SELECT ON TABLES TO anon;

-- Mover tablas de public → gym (IF EXISTS evita error si ya están en gym)
-- Orden: padres antes que hijos para no romper FKs durante el movimiento
-- Nivel 0 — raíz
ALTER TABLE IF EXISTS public.gimnasios              SET SCHEMA gym;

-- Nivel 1 — dependen de gimnasios
ALTER TABLE IF EXISTS public.usuarios               SET SCHEMA gym;
ALTER TABLE IF EXISTS public.planes                 SET SCHEMA gym;
ALTER TABLE IF EXISTS public.espacios               SET SCHEMA gym;
ALTER TABLE IF EXISTS public.promociones            SET SCHEMA gym;

-- Nivel 2 — dependen de usuarios / espacios
ALTER TABLE IF EXISTS public.membresias             SET SCHEMA gym;
ALTER TABLE IF EXISTS public.pagos                  SET SCHEMA gym;
ALTER TABLE IF EXISTS public.accesos                SET SCHEMA gym;
ALTER TABLE IF EXISTS public.asistencias            SET SCHEMA gym;
ALTER TABLE IF EXISTS public.gamification_xp        SET SCHEMA gym;
ALTER TABLE IF EXISTS public.gamification_levels    SET SCHEMA gym;
ALTER TABLE IF EXISTS public.digital_twin           SET SCHEMA gym;
ALTER TABLE IF EXISTS public.ai_recommendations     SET SCHEMA gym;
ALTER TABLE IF EXISTS public.churn_predictions      SET SCHEMA gym;
ALTER TABLE IF EXISTS public.wearable_sync          SET SCHEMA gym;
ALTER TABLE IF EXISTS public.health_alerts          SET SCHEMA gym;
ALTER TABLE IF EXISTS public.maquinas               SET SCHEMA gym;
ALTER TABLE IF EXISTS public.entrenadores           SET SCHEMA gym;
ALTER TABLE IF EXISTS public.churn_interventions    SET SCHEMA gym;

-- Nivel 3 — dependen de entrenadores / espacios
ALTER TABLE IF EXISTS public.clases                 SET SCHEMA gym;

-- Nivel 4 — dependen de clases
ALTER TABLE IF EXISTS public.inscripciones          SET SCHEMA gym;

-- Grants explícitos en las tablas ya movidas
GRANT ALL ON ALL TABLES IN SCHEMA gym TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA gym TO anon;

DO $$ BEGIN RAISE NOTICE '✅ PASO 0: schema gym creado y tablas movidas desde public'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 0b — Agregar columnas nuevas (si no existen ya de migraciones previas)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE gym.gimnasios ADD COLUMN IF NOT EXISTS ruc      VARCHAR(11) UNIQUE;
ALTER TABLE gym.gimnasios ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE gym.usuarios  ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE gym.usuarios  ADD COLUMN IF NOT EXISTS cargo    VARCHAR(100);
ALTER TABLE gym.gimnasios ADD COLUMN IF NOT EXISTS codigo_acceso VARCHAR(20) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_gimnasios_codigo ON gym.gimnasios(codigo_acceso);

-- Asignar código al gimnasio demo si no tiene uno
UPDATE gym.gimnasios
   SET codigo_acceso = 'GYMFIT'
 WHERE id_gimnasio = '00000000-0000-0000-0000-000000000001'
   AND codigo_acceso IS NULL;

DO $$ BEGIN RAISE NOTICE '✅ PASO 0b: columnas y codigo_acceso agregados'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 0c — Tabla gym.codigos_acceso (si no existe)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gym.codigos_acceso (
  id_codigo        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio      UUID         NOT NULL REFERENCES gym.gimnasios(id_gimnasio) ON DELETE CASCADE,
  codigo           VARCHAR(12)  UNIQUE NOT NULL,
  tipo             VARCHAR(20)  NOT NULL DEFAULT 'general'
                     CHECK (tipo IN ('general','staff','miembro','invitacion')),
  descripcion      VARCHAR(255),
  usos_actuales    INT          NOT NULL DEFAULT 0,
  usos_max         INT,
  activo           BOOLEAN      NOT NULL DEFAULT TRUE,
  fecha_expiracion TIMESTAMPTZ,
  creado_por       UUID         REFERENCES gym.usuarios(id_usuario),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codigos_acceso_gimnasio ON gym.codigos_acceso(id_gimnasio);
CREATE INDEX IF NOT EXISTS idx_codigos_acceso_codigo   ON gym.codigos_acceso(codigo) WHERE activo = TRUE;

-- Migrar códigos existentes de gimnasios.codigo_acceso → codigos_acceso
INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo)
SELECT id_gimnasio, codigo_acceso, 'general'
FROM gym.gimnasios
WHERE codigo_acceso IS NOT NULL
ON CONFLICT (codigo) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ PASO 0c: gym.codigos_acceso lista'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 0d — Función generate_gym_code + handle_new_user actualizado
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_gym_code(p_nombre TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base   TEXT;
  v_code   TEXT;
  v_exists BOOLEAN;
  v_tries  INT := 0;
BEGIN
  v_base := upper(regexp_replace(p_nombre, '[^a-zA-Z]', '', 'g'));
  v_base := left(v_base, 4);
  IF length(v_base) < 2 THEN v_base := 'GYM'; END IF;
  LOOP
    v_code := v_base || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM gym.codigos_acceso WHERE codigo = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists OR v_tries >= 20;
    v_tries := v_tries + 1;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Actualizar funciones helper para usar gym schema
CREATE OR REPLACE FUNCTION public.get_user_gym()
RETURNS UUID AS $$
  SELECT id_gimnasio FROM gym.usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM gym.usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- handle_new_user completo con soporte onboarding y signup
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
  v_codigo        TEXT;
BEGIN
  v_nombre     := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'),    ''), split_part(NEW.email, '@', 1));
  v_telefono   := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'),  '');
  v_documento  := NULLIF(TRIM(NEW.raw_user_meta_data->>'documento'), '');
  v_genero     := NULLIF(NEW.raw_user_meta_data->>'genero',  '');
  v_cargo      := NULLIF(TRIM(NEW.raw_user_meta_data->>'cargo'),     '');
  v_foto_url   := NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_url'),  '');
  v_rol        := COALESCE(NULLIF(NEW.raw_user_meta_data->>'rol', ''), 'miembro');

  BEGIN
    v_fecha_nac := (NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_fecha_nac := NULL;
  END;

  IF v_genero NOT IN ('M', 'F', 'Otro') THEN v_genero := NULL; END IF;

  v_gym_nombre := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_nombre'), '');

  -- CASO A: Onboarding — el dueño registra su propio gym
  IF v_gym_nombre IS NOT NULL THEN
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Peru');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

    v_codigo := public.generate_gym_code(v_gym_nombre);

    INSERT INTO gym.gimnasios (
      nombre, ruc, ciudad, pais, direccion, telefono, email, plan_suscripcion, estado
    )
    VALUES (
      v_gym_nombre, v_gym_ruc, v_gym_ciudad, v_gym_pais, v_gym_direccion,
      v_gym_telefono, v_gym_email, v_gym_plan, 'activo'
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_id_gimnasio, v_codigo, 'general', 'Codigo principal del gimnasio');

    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, cargo, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, COALESCE(v_cargo, 'Gerente General'), v_id_gimnasio, 'gerente', 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

  -- CASO B: Signup de miembro/staff con codigo de acceso
  ELSIF NEW.raw_user_meta_data->>'id_gimnasio' IS NOT NULL THEN
    v_id_gimnasio := (NEW.raw_user_meta_data->>'id_gimnasio')::uuid;

    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, v_id_gimnasio, v_rol, 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

  -- CASO C: Usuario manual desde Dashboard (sin metadata)
  ELSE
    NULL;
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: % — %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- Asegurar que el trigger existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
     WHERE tgname  = 'on_auth_user_created'
       AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE '✅ Trigger on_auth_user_created creado';
  ELSE
    RAISE NOTICE 'ℹ️  Trigger on_auth_user_created ya existe — funcion actualizada';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ PASO 0d: generate_gym_code, get_user_gym, get_user_rol, handle_new_user actualizados'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Helper canónico: id del gimnasio del usuario actual
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
