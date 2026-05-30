-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 008: Tabla codigos_acceso + campos extra BD
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA:
--   - codigo_acceso estaba en gimnasios.codigo_acceso → no respeta tenant isolation
--   - El trigger handle_new_user no manejaba todos los campos de la BD
--   - Faltan columnas: ruc, logo_url en gimnasios; foto_url, cargo en usuarios
--
-- SOLUCIÓN:
--   1. Tabla gym.codigos_acceso — manejo correcto por tenant (id_gimnasio FK)
--   2. Columnas nuevas en gimnasios: ruc, logo_url
--   3. Columnas nuevas en usuarios: foto_url, cargo
--   4. Trigger actualizado: popula todos los campos nuevos desde metadata
--   5. Migrar códigos existentes de gimnasios.codigo_acceso → codigos_acceso
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Columnas nuevas en gym.gimnasios
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE gym.gimnasios ADD COLUMN IF NOT EXISTS ruc        VARCHAR(11)  UNIQUE;
ALTER TABLE gym.gimnasios ADD COLUMN IF NOT EXISTS logo_url   TEXT;
-- telefono, email, direccion, ciudad ya existen en el schema original

DO $$ BEGIN RAISE NOTICE '✅ Columnas ruc, logo_url agregadas a gym.gimnasios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Columnas nuevas en gym.usuarios
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE gym.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE gym.usuarios ADD COLUMN IF NOT EXISTS cargo    VARCHAR(100);
-- telefono, documento, fecha_nacimiento, genero ya existen en el schema original

DO $$ BEGIN RAISE NOTICE '✅ Columnas foto_url, cargo agregadas a gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Crear tabla gym.codigos_acceso (separada del gimnasio)
-- Cada gym puede tener múltiples códigos (para staff, para miembros, etc.)
-- El tenant se garantiza por la FK a id_gimnasio
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.codigos_acceso (
  id_codigo        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio      UUID         NOT NULL REFERENCES gym.gimnasios(id_gimnasio) ON DELETE CASCADE,
  codigo           VARCHAR(12)  UNIQUE NOT NULL,
  tipo             VARCHAR(20)  NOT NULL DEFAULT 'general'
                     CHECK (tipo IN ('general','staff','miembro','invitacion')),
  descripcion      VARCHAR(255),
  usos_actuales    INT          NOT NULL DEFAULT 0,
  usos_max         INT,                       -- NULL = ilimitado
  activo           BOOLEAN      NOT NULL DEFAULT TRUE,
  fecha_expiracion TIMESTAMPTZ,               -- NULL = sin expiración
  creado_por       UUID         REFERENCES gym.usuarios(id_usuario),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codigos_acceso_gimnasio
  ON gym.codigos_acceso(id_gimnasio);
CREATE INDEX IF NOT EXISTS idx_codigos_acceso_codigo
  ON gym.codigos_acceso(codigo) WHERE activo = TRUE;

-- RLS
ALTER TABLE gym.codigos_acceso ENABLE ROW LEVEL SECURITY;

-- SELECT público: cualquiera puede buscar un código (necesario para /signup)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='codigos_acceso' AND policyname='codigos_select_public') THEN
    EXECUTE $pol$
      CREATE POLICY codigos_select_public ON gym.codigos_acceso
        FOR SELECT USING (activo = TRUE)
    $pol$;
  END IF;
END $$;

-- SELECT por gimnasio: gerentes ven todos sus códigos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='codigos_acceso' AND policyname='codigos_select_gerente') THEN
    EXECUTE $pol$
      CREATE POLICY codigos_select_gerente ON gym.codigos_acceso
        FOR SELECT USING (id_gimnasio = public.get_user_gym())
    $pol$;
  END IF;
END $$;

-- Grants
GRANT ALL ON gym.codigos_acceso TO postgres, service_role;
GRANT SELECT ON gym.codigos_acceso TO anon;
GRANT SELECT, INSERT, UPDATE ON gym.codigos_acceso TO authenticated;
GRANT USAGE ON SEQUENCE gym.codigos_acceso_id_codigo_seq TO authenticated 2>/dev/null; -- puede fallar, es OK

DO $$ BEGIN RAISE NOTICE '✅ Tabla gym.codigos_acceso creada con RLS'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Migrar códigos existentes de gimnasios.codigo_acceso → codigos_acceso
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo)
SELECT id_gimnasio, codigo_acceso, 'general'
FROM gym.gimnasios
WHERE codigo_acceso IS NOT NULL
ON CONFLICT (codigo) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ Códigos migrados de gimnasios.codigo_acceso a codigos_acceso'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Actualizar generate_gym_code para verificar en codigos_acceso
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_gym_code(p_nombre TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base   TEXT;
  v_suffix TEXT;
  v_code   TEXT;
  v_exists BOOLEAN;
  v_tries  INT := 0;
BEGIN
  -- Base: primeras 4 letras del nombre (solo letras, mayúsculas)
  v_base := upper(regexp_replace(p_nombre, '[^a-zA-Z]', '', 'g'));
  v_base := left(v_base, 4);
  IF length(v_base) < 2 THEN v_base := 'GYM'; END IF;

  LOOP
    -- Sufijo: 4 caracteres hex aleatorios (16^4 = 65536 combinaciones)
    v_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    v_code   := v_base || v_suffix;

    -- Verificar unicidad en codigos_acceso
    SELECT EXISTS(
      SELECT 1 FROM gym.codigos_acceso WHERE codigo = v_code
    ) INTO v_exists;

    EXIT WHEN NOT v_exists OR v_tries >= 20;
    v_tries := v_tries + 1;
  END LOOP;

  RETURN v_code;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ generate_gym_code() actualizada — verifica unicidad en codigos_acceso'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — Trigger handle_new_user completo con todos los campos de la BD
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  -- Datos del usuario dueño
  v_nombre          TEXT;
  v_telefono        TEXT;
  v_documento       TEXT;
  v_fecha_nac       DATE;
  v_genero          TEXT;
  v_cargo           TEXT;
  v_foto_url        TEXT;
  v_rol             TEXT;

  -- Datos del gimnasio (solo en onboarding)
  v_gym_nombre      TEXT;
  v_gym_ruc         TEXT;
  v_gym_ciudad      TEXT;
  v_gym_pais        TEXT;
  v_gym_direccion   TEXT;
  v_gym_telefono    TEXT;
  v_gym_email       TEXT;
  v_gym_plan        TEXT;

  -- Resultados
  v_id_gimnasio     UUID;
  v_codigo          TEXT;
BEGIN
  -- ── Extraer metadatos comunes ──────────────────────────────────────────────
  v_nombre     := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'),     ''), split_part(NEW.email, '@', 1));
  v_telefono   := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'),   '');
  v_documento  := NULLIF(TRIM(NEW.raw_user_meta_data->>'documento'),  '');
  v_genero     := NULLIF(NEW.raw_user_meta_data->>'genero',   '');
  v_cargo      := NULLIF(TRIM(NEW.raw_user_meta_data->>'cargo'),      '');
  v_foto_url   := NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_url'),   '');
  v_rol        := COALESCE(NULLIF(NEW.raw_user_meta_data->>'rol', ''), 'miembro');

  -- Parsear fecha_nacimiento de forma segura
  BEGIN
    v_fecha_nac := (NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_fecha_nac := NULL;
  END;

  -- Validar genero
  IF v_genero NOT IN ('M', 'F', 'Otro') THEN v_genero := NULL; END IF;

  -- ── CASO A: Onboarding de dueño (tiene gym_nombre en metadata) ────────────
  v_gym_nombre := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_nombre'), '');

  IF v_gym_nombre IS NOT NULL THEN
    -- Datos del gimnasio
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Perú');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

    -- Generar código único
    v_codigo := public.generate_gym_code(v_gym_nombre);

    -- 1. Crear el gimnasio con todos sus campos
    INSERT INTO gym.gimnasios (
      nombre, ruc, ciudad, pais, direccion, telefono, email,
      plan_suscripcion, estado
    )
    VALUES (
      v_gym_nombre, v_gym_ruc, v_gym_ciudad, v_gym_pais, v_gym_direccion,
      v_gym_telefono, v_gym_email, v_gym_plan, 'activo'
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    -- 2. Insertar código en tabla codigos_acceso (tenant isolation via FK)
    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_id_gimnasio, v_codigo, 'general', 'Código principal del gimnasio');

    -- 3. Crear perfil del dueño como gerente con todos los campos
    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, documento, fecha_nacimiento,
      genero, foto_url, cargo, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_documento, v_fecha_nac,
      v_genero, v_foto_url, COALESCE(v_cargo, 'Gerente General'), v_id_gimnasio, 'gerente', 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

    RAISE LOG 'handle_new_user [ONBOARDING]: gym "%" (id=%, codigo=%) creado para %',
              v_gym_nombre, v_id_gimnasio, v_codigo, NEW.email;

  -- ── CASO B: Signup de miembro/staff con código de acceso existente ─────────
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

    RAISE LOG 'handle_new_user [SIGNUP]: % registrado en gym % como %',
              NEW.email, v_id_gimnasio, v_rol;

  ELSE
    RAISE LOG 'handle_new_user [MANUAL]: % sin metadata de gym — perfil omitido', NEW.email;
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error para %: % — %', NEW.email, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- Asegurar que el trigger existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
     WHERE tgname    = 'on_auth_user_created'
       AND tgrelid   = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE '✅ Trigger on_auth_user_created creado';
  ELSE
    RAISE NOTICE 'ℹ️  Trigger on_auth_user_created ya existe — función actualizada';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7 — Nota sobre Supabase Storage (avatars bucket)
-- ─────────────────────────────────────────────────────────────────────────────
-- Para habilitar la carga de fotos de perfil, crear el bucket manualmente:
--   Supabase Dashboard → Storage → New bucket
--   Nombre: "avatars"
--   Public bucket: SÍ (para URLs públicas)
--
-- Política de Storage (SQL Editor después de crear el bucket):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;
--
-- CREATE POLICY "avatars_upload_own" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "avatars_read_public" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8 — VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────────────

-- Ver columnas actuales de gimnasios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'gym' AND table_name = 'gimnasios'
ORDER BY ordinal_position;

-- Ver columnas actuales de usuarios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'gym' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Ver codigos migrados
SELECT ca.codigo, g.nombre AS gimnasio, ca.tipo, ca.activo
FROM gym.codigos_acceso ca
JOIN gym.gimnasios g ON g.id_gimnasio = ca.id_gimnasio;

DO $$
BEGIN
  RAISE NOTICE '✅ Migración 008 completada.';
  RAISE NOTICE '   gym.codigos_acceso lista con tenant isolation via id_gimnasio FK';
  RAISE NOTICE '   gym.gimnasios: +ruc, +logo_url';
  RAISE NOTICE '   gym.usuarios:  +foto_url, +cargo';
  RAISE NOTICE '   Trigger handle_new_user: ahora llena TODOS los campos de la BD';
  RAISE NOTICE '   ⚠️  Crear bucket "avatars" en Storage si quieres fotos de perfil';
END $$;

-- ─── FIN MIGRACIÓN 008 ───────────────────────────────────────────────────────
