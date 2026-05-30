-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 009: Reestructurar gym como módulo lego de la BD Maestra
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA ARQUITECTURAL:
--   gym.gimnasios duplicaba public.tenants
--   gym.usuarios   duplicaba public.profiles
--   Las FKs apuntaban a tablas gym propias en vez de la infraestructura public
--   Las funciones RLS duplicaban fn_current_tenant_id() de public
--
-- SOLUCIÓN:
--   GYMsos vive como módulo lego en la BD Maestra, igual que ONG.
--   - public.tenants  → el gimnasio ES un tenant (industry_type_id='gym')
--   - public.profiles → los usuarios SON profiles (referenciados por auth.users)
--   - public.sedes    → las sucursales del gym
--   - gym.*           → SOLO tablas de dominio GYMsos (no infraestructura)
--
-- PREREQUISITO:
--   La BD Maestra debe estar desplegada (public.tenants, public.profiles, etc.)
--   Las migraciones 001-008 de gymsos pueden ignorarse o ejecutarse antes.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Registrar GYMsos en los catálogos globales de la BD Maestra
-- ─────────────────────────────────────────────────────────────────────────────

-- Tipo de industria para gymnios (cat_industry_types vive en public)
INSERT INTO public.cat_industry_types (id, description)
VALUES ('gym', 'Gimnasio / Centro Fitness')
ON CONFLICT (id) DO NOTHING;

-- Planes SaaS de GYMsos (cat_plan_types vive en public)
INSERT INTO public.cat_plan_types (id, description)
VALUES
  ('gym_starter',    'GYMsos Starter — hasta 100 miembros'),
  ('gym_pro',        'GYMsos Pro — hasta 500 miembros'),
  ('gym_business',   'GYMsos Business — hasta 2,000 miembros'),
  ('gym_enterprise', 'GYMsos Enterprise — ilimitado, multi-sede')
ON CONFLICT (id) DO NOTHING;

-- Políticas de plan (max_sedes, max_licenses) en public.plan_policies si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='plan_policies') THEN
    INSERT INTO public.plan_policies (plan_id, max_sedes, max_licenses, can_use_terminals)
    VALUES
      ('gym_starter',    1,    100,  false),
      ('gym_pro',        3,    500,  true),
      ('gym_business',   10,   2000, true),
      ('gym_enterprise', 999,  99999,true)
    ON CONFLICT (plan_id) DO NOTHING;
    RAISE NOTICE '✅ Políticas de plan gym insertadas en public.plan_policies';
  ELSE
    RAISE NOTICE 'ℹ️  public.plan_policies no existe aún — omitido';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ GYMsos registrado en catálogos globales de la BD Maestra'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Extender public.profiles con campos propios de GYMsos
--           (en vez de duplicar en gym.usuarios)
-- ─────────────────────────────────────────────────────────────────────────────
-- Los campos comunes (nombre, documento, genero) ya están en public.profiles.
-- Solo agregamos los específicos de GYMsos si no existen.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foto_url  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo     VARCHAR(100);

DO $$ BEGIN RAISE NOTICE '✅ public.profiles extendido con foto_url, cargo'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Crear schema gym limpio como módulo de dominio
-- ─────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS gym;

GRANT USAGE ON SCHEMA gym TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gym GRANT SELECT ON TABLES TO anon;

DO $$ BEGIN RAISE NOTICE '✅ Schema gym preparado'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — Helper: tenant actual para RLS en gym.*
--           Usa fn_current_tenant_id() de public si existe, sino fallback.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  -- Intentar usar fn_current_tenant_id() de la BD Maestra
  -- Si no existe, buscar desde public.profiles como fallback
  SELECT COALESCE(
    (SELECT public.fn_current_tenant_id()),
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  )
$$ ;

-- Versión simple sin depender de fn_current_tenant_id (por si la BD Maestra
-- no está desplegada aún y se usa GYMsos de forma autónoma)
CREATE OR REPLACE FUNCTION gym.current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, gym
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$ ;

DO $$ BEGIN RAISE NOTICE '✅ gym.current_tenant_id() creada'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Tablas de dominio GYMsos
--           FKs correctas: tenant_id → public.tenants, profile_id → public.profiles
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 5.1 Códigos de acceso del gimnasio (invitaciones) ────────────────────────
CREATE TABLE IF NOT EXISTS gym.access_codes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code             VARCHAR(12) UNIQUE NOT NULL,
  tipo             VARCHAR(20) NOT NULL DEFAULT 'general'
                     CHECK (tipo IN ('general','staff','miembro','invitacion')),
  descripcion      VARCHAR(255),
  usos_actuales    INT         NOT NULL DEFAULT 0,
  usos_max         INT,                       -- NULL = ilimitado
  activo           BOOLEAN     NOT NULL DEFAULT TRUE,
  fecha_expiracion TIMESTAMPTZ,
  created_by       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_access_codes_tenant ON gym.access_codes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_access_codes_code   ON gym.access_codes(code) WHERE activo;

-- ── 5.2 Planes de membresía del gym (para sus clientes) ──────────────────────
--        ≠ plan SaaS de public.cat_plan_types
CREATE TABLE IF NOT EXISTS gym.planes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     TEXT,
  precio_mensual  DECIMAL(10,2) NOT NULL CHECK (precio_mensual >= 0),
  precio_trimestral DECIMAL(10,2) CHECK (precio_trimestral >= 0),
  precio_anual    DECIMAL(10,2) CHECK (precio_anual >= 0),
  duracion_dias   INT         NOT NULL DEFAULT 30,
  clases_incluidas INT        DEFAULT -1,     -- -1 = ilimitadas
  horarios_acceso VARCHAR(100) DEFAULT '6-22',
  todas_las_sedes BOOLEAN     NOT NULL DEFAULT FALSE,
  activo          BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_planes_tenant ON gym.planes(tenant_id);

-- ── 5.3 Membresías de miembros al gym ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.membresias (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id          UUID        NOT NULL REFERENCES gym.planes(id),
  fecha_inicio     DATE        NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE       NOT NULL,
  estado           VARCHAR(20) NOT NULL DEFAULT 'activa'
                     CHECK (estado IN ('activa','vencida','cancelada','suspendida')),
  motivo_cancelacion VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_fechas CHECK (fecha_vencimiento > fecha_inicio),
  UNIQUE (tenant_id, profile_id, plan_id, fecha_inicio)
);
CREATE INDEX IF NOT EXISTS idx_gym_membresias_tenant  ON gym.membresias(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_membresias_profile ON gym.membresias(profile_id, estado);

-- ── 5.4 Pagos internos del gym (cash, yape, etc.) ────────────────────────────
CREATE TABLE IF NOT EXISTS gym.pagos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  membresia_id     UUID        REFERENCES gym.membresias(id),
  monto            DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  moneda           VARCHAR(3)  NOT NULL DEFAULT 'PEN',
  metodo_pago      VARCHAR(20) NOT NULL DEFAULT 'efectivo'
                     CHECK (metodo_pago IN ('tarjeta','transferencia','efectivo','yape','plin')),
  estado           VARCHAR(20) NOT NULL DEFAULT 'completado'
                     CHECK (estado IN ('pendiente','completado','fallido','reembolsado')),
  descripcion      VARCHAR(255),
  fecha_pago       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_pagos_tenant  ON gym.pagos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_pagos_profile ON gym.pagos(profile_id);

-- ── 5.5 Espacios físicos ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.espacios (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sede_id          UUID        REFERENCES public.sedes(id) ON DELETE CASCADE,
  nombre           VARCHAR(100) NOT NULL,
  tipo             VARCHAR(30) NOT NULL DEFAULT 'salon'
                     CHECK (tipo IN ('salon','area_pesas','cardio','yoga','funcional','otros')),
  capacidad_maxima INT         NOT NULL DEFAULT 20,
  estado           VARCHAR(30) NOT NULL DEFAULT 'disponible'
                     CHECK (estado IN ('disponible','en_uso','en_mantenimiento')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_espacios_tenant ON gym.espacios(tenant_id);

-- ── 5.6 Máquinas y equipamiento ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.maquinas (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  espacio_id       UUID        REFERENCES gym.espacios(id),
  nombre           VARCHAR(100) NOT NULL,
  codigo_qr        VARCHAR(100) UNIQUE,
  marca            VARCHAR(100),
  modelo           VARCHAR(100),
  estado           VARCHAR(30) NOT NULL DEFAULT 'operativa'
                     CHECK (estado IN ('operativa','en_mantenimiento','dañada','fuera_de_servicio')),
  fecha_mantenimiento_proximo DATE,
  url_video_tutorial VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_maquinas_tenant ON gym.maquinas(tenant_id);

-- ── 5.7 Perfil extendido de entrenador ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.entrenadores (
  profile_id       UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  especialidades   VARCHAR(255),
  certificaciones  TEXT,
  biografia        TEXT,
  rating_promedio  DECIMAL(3,2) DEFAULT 0.00,
  total_clases_dictadas INT    DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_entrenadores_tenant ON gym.entrenadores(tenant_id);

-- ── 5.8 Clases ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.clases (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sede_id          UUID        REFERENCES public.sedes(id),
  entrenador_id    UUID        REFERENCES gym.entrenadores(profile_id),
  espacio_id       UUID        REFERENCES gym.espacios(id),
  nombre           VARCHAR(100) NOT NULL,
  descripcion      TEXT,
  nivel            VARCHAR(20) CHECK (nivel IN ('principiante','intermedio','avanzado')),
  capacidad_maxima INT         NOT NULL DEFAULT 15,
  fecha_hora_inicio TIMESTAMPTZ NOT NULL,
  duracion_minutos INT         NOT NULL DEFAULT 60,
  recurrencia      VARCHAR(20) CHECK (recurrencia IN ('unica','diaria','semanal','mensual')),
  estado           VARCHAR(20) NOT NULL DEFAULT 'programada'
                     CHECK (estado IN ('programada','en_curso','finalizada','cancelada')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_clases_tenant ON gym.clases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_clases_fecha  ON gym.clases(fecha_hora_inicio);

-- ── 5.9 Inscripciones a clases ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.inscripciones (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  clase_id         UUID        NOT NULL REFERENCES gym.clases(id),
  estado           VARCHAR(20) NOT NULL DEFAULT 'inscrito'
                     CHECK (estado IN ('inscrito','asistio','ausente','cancelado')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, profile_id, clase_id)
);
CREATE INDEX IF NOT EXISTS idx_gym_inscripciones_tenant ON gym.inscripciones(tenant_id);

-- ── 5.10 Accesos QR ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.accesos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sede_id          UUID        REFERENCES public.sedes(id),
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  fecha_entrada    TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_salida     TIMESTAMPTZ,
  tipo_acceso      VARCHAR(20) NOT NULL DEFAULT 'qr'
                     CHECK (tipo_acceso IN ('qr','biometria','manual')),
  estado_acceso    VARCHAR(20) NOT NULL DEFAULT 'permitido'
                     CHECK (estado_acceso IN ('permitido','denegado')),
  razon_denegacion VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_accesos_tenant  ON gym.accesos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_accesos_profile ON gym.accesos(profile_id);
CREATE INDEX IF NOT EXISTS idx_gym_accesos_fecha   ON gym.accesos(fecha_entrada DESC);

-- ── 5.11 Gamificación ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.gamification_xp (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  tipo_evento      VARCHAR(50) NOT NULL,
  cantidad_xp      INT         NOT NULL CHECK (cantidad_xp > 0),
  descripcion      VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gym.gamification_levels (
  profile_id       UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  xp_total         INT         NOT NULL DEFAULT 0,
  nivel_actual     INT         NOT NULL DEFAULT 1,
  xp_proximo_nivel INT         NOT NULL DEFAULT 500,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5.12 Churn predictions (IA) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.churn_predictions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  probability_churn DECIMAL(5,4) NOT NULL,
  score_riesgo     INT         NOT NULL CHECK (score_riesgo BETWEEN 0 AND 100),
  razon_principal  VARCHAR(255),
  ultima_sesion    DATE,
  accion_ejecutada VARCHAR(255),
  resultado        VARCHAR(20) CHECK (resultado IN ('abandono','retenido','desconocido')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_churn_tenant  ON gym.churn_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_churn_profile ON gym.churn_predictions(profile_id, created_at DESC);

-- ── 5.13 Digital Twin ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.digital_twin (
  profile_id        UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id         UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  altura_cm         INT,
  peso_kg           DECIMAL(5,2),
  peso_kg_inicial   DECIMAL(5,2),
  porcentaje_grasa  DECIMAL(5,2),
  configuracion_avatar JSONB   DEFAULT '{"color":"#00D084","estilo":"athletic"}',
  prediccion_12w    TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5.14 AI Recommendations ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.ai_recommendations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  tipo             VARCHAR(50) NOT NULL,
  contenido_json   JSONB       NOT NULL DEFAULT '{}',
  score_relevancia DECIMAL(3,2) DEFAULT 0.80,
  mostrada         BOOLEAN     DEFAULT FALSE,
  aceptada         BOOLEAN,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5.15 Wearable Sync ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.wearable_sync (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id),
  tipo_wearable    VARCHAR(50) NOT NULL,
  ultima_sincronizacion TIMESTAMPTZ,
  datos_salud_json JSONB       DEFAULT '{}',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5.16 Promociones ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym.promociones (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  codigo           VARCHAR(50) UNIQUE NOT NULL,
  tipo_descuento   VARCHAR(20) NOT NULL CHECK (tipo_descuento IN ('porcentaje','monto_fijo')),
  valor_descuento  DECIMAL(10,2) NOT NULL CHECK (valor_descuento > 0),
  descripcion      VARCHAR(255),
  fecha_inicio     DATE        NOT NULL,
  fecha_fin        DATE        NOT NULL,
  limite_uso       INT,
  usos_realizados  INT         DEFAULT 0,
  estado           VARCHAR(20) NOT NULL DEFAULT 'activa'
                     CHECK (estado IN ('activa','pausada','finalizada'))
);
CREATE INDEX IF NOT EXISTS idx_gym_promociones_tenant ON gym.promociones(tenant_id);

DO $$ BEGIN RAISE NOTICE '✅ 16 tablas de dominio GYMsos creadas con FKs correctas'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — RLS en tablas gym (usa gym.current_tenant_id())
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'access_codes','planes','membresias','pagos','espacios','maquinas',
    'entrenadores','clases','inscripciones','accesos',
    'gamification_xp','gamification_levels','churn_predictions',
    'digital_twin','ai_recommendations','wearable_sync','promociones'
  ]) LOOP
    EXECUTE format('ALTER TABLE gym.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "tenant_isolation" ON gym.%I
         USING (tenant_id = gym.current_tenant_id())', t
    );
  END LOOP;
  -- access_codes: también visible para anon (necesario para lookup en signup)
  ALTER POLICY "tenant_isolation" ON gym.access_codes USING (activo = TRUE);
  RAISE NOTICE '✅ RLS habilitado en todas las tablas de gym (tenant isolation)';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7 — Función para generar código de acceso único
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.generate_access_code(p_tenant_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base  TEXT;
  v_code  TEXT;
  v_exists BOOLEAN;
  v_tries INT := 0;
BEGIN
  v_base := upper(regexp_replace(p_tenant_name, '[^a-zA-Z]', '', 'g'));
  v_base := left(v_base, 4);
  IF length(v_base) < 2 THEN v_base := 'GYM'; END IF;
  LOOP
    v_code   := v_base || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM gym.access_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists OR v_tries >= 20;
    v_tries := v_tries + 1;
  END LOOP;
  RETURN v_code;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8 — RPC para onboarding: crea tenant gym + profile + access_code
--           Usa la infraestructura de public (fn_bootstrap_tenant si existe)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.bootstrap_gym_tenant(
  p_tenant_name    TEXT,
  p_tax_id         TEXT,         -- RUC
  p_plan_id        TEXT DEFAULT 'gym_starter',
  p_city           TEXT DEFAULT 'Lima',
  p_country        TEXT DEFAULT 'PE',
  p_profile_nombre TEXT DEFAULT NULL,
  p_cargo          TEXT DEFAULT 'Gerente General'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, gym
AS $$
DECLARE
  v_tenant_id  UUID;
  v_sede_id    UUID;
  v_code       TEXT;
  v_profile_id UUID := auth.uid();
BEGIN
  -- Verificar que el usuario está autenticado
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Verificar que el usuario no tenga ya un tenant
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_profile_id AND tenant_id IS NOT NULL) THEN
    RAISE EXCEPTION 'El usuario ya tiene un gimnasio registrado';
  END IF;

  -- 1. Crear el tenant en public.tenants
  INSERT INTO public.tenants (name, tax_id, industry_type_id, plan_id, status_financial_id, max_licenses)
  VALUES (
    p_tenant_name,
    p_tax_id,
    'gym',
    p_plan_id,
    'FIN-PENDING',
    CASE p_plan_id
      WHEN 'gym_starter'    THEN 100
      WHEN 'gym_pro'        THEN 500
      WHEN 'gym_business'   THEN 2000
      WHEN 'gym_enterprise' THEN 99999
      ELSE 100
    END
  )
  RETURNING id INTO v_tenant_id;

  -- 2. Crear sede principal en public.sedes
  INSERT INTO public.sedes (tenant_id, name, is_active)
  VALUES (v_tenant_id, p_tenant_name || ' — Sede Principal', TRUE)
  RETURNING id INTO v_sede_id;

  -- 3. Asignar tenant al profile del dueño
  UPDATE public.profiles
     SET tenant_id = v_tenant_id,
         full_name = COALESCE(p_profile_nombre, full_name),
         cargo     = p_cargo
   WHERE id = v_profile_id;

  -- 4. Generar código de acceso
  v_code := gym.generate_access_code(p_tenant_name);
  INSERT INTO gym.access_codes (tenant_id, code, tipo, descripcion, created_by)
  VALUES (v_tenant_id, v_code, 'general', 'Código principal del gimnasio', v_profile_id);

  -- 5. Retornar resultado
  RETURN jsonb_build_object(
    'tenant_id',  v_tenant_id,
    'sede_id',    v_sede_id,
    'access_code', v_code,
    'plan_id',    p_plan_id
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error en bootstrap_gym_tenant: % (%)', SQLERRM, SQLSTATE;
END;
$$;

-- Permiso para que usuarios autenticados llamen la función
GRANT EXECUTE ON FUNCTION gym.bootstrap_gym_tenant TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ gym.bootstrap_gym_tenant() lista'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 9 — RPC para signup de miembros/staff: usa access_code para encontrar tenant
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gym.join_gym_with_code(
  p_code    TEXT,
  p_nombre  TEXT  DEFAULT NULL,
  p_cargo   TEXT  DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, gym
AS $$
DECLARE
  v_profile_id UUID := auth.uid();
  v_tenant_id  UUID;
  v_code_row   gym.access_codes;
BEGIN
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Buscar código activo
  SELECT * INTO v_code_row
  FROM gym.access_codes
  WHERE code = upper(p_code) AND activo = TRUE
  LIMIT 1;

  IF v_code_row.id IS NULL THEN
    RAISE EXCEPTION 'Código de acceso inválido o inactivo';
  END IF;

  v_tenant_id := v_code_row.tenant_id;

  -- Asignar tenant al profile si no tiene uno
  UPDATE public.profiles
     SET tenant_id = v_tenant_id,
         full_name = COALESCE(p_nombre, full_name),
         cargo     = COALESCE(p_cargo, cargo)
   WHERE id = v_profile_id AND tenant_id IS NULL;

  -- Incrementar usos del código
  UPDATE gym.access_codes
     SET usos_actuales = usos_actuales + 1
   WHERE id = v_code_row.id;

  RETURN jsonb_build_object(
    'tenant_id', v_tenant_id,
    'code',      p_code
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error en join_gym_with_code: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION gym.join_gym_with_code TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ gym.join_gym_with_code() lista'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 10 — Grants finales
-- ─────────────────────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA gym TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gym TO authenticated;
GRANT SELECT ON gym.access_codes TO anon;

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migración 009 completada.';
  RAISE NOTICE '   gym vive como módulo lego en la BD Maestra.';
  RAISE NOTICE '';
  RAISE NOTICE '   public.tenants  → el gym ES un tenant (industry=gym)';
  RAISE NOTICE '   public.profiles → los usuarios son profiles';
  RAISE NOTICE '   public.sedes    → las sucursales del gym';
  RAISE NOTICE '   gym.*           → dominio GYMsos únicamente';
  RAISE NOTICE '';
  RAISE NOTICE '   FLUJOS:';
  RAISE NOTICE '   Onboarding → supabase.auth.signUp → login → gym.bootstrap_gym_tenant()';
  RAISE NOTICE '   Signup     → supabase.auth.signUp → login → gym.join_gym_with_code()';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- ─── FIN MIGRACIÓN 009 ───────────────────────────────────────────────────────
