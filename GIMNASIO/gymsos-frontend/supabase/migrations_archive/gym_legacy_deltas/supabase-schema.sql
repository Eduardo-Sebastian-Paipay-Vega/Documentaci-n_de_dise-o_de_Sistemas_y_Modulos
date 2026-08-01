-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Esquema completo de Base de Datos
-- Versión: 2.0  |  Fecha: 2026-05-21
-- Basado en: Fase 5 — BD (29 tablas + 13 innovaciones)
-- Ejecutar en: Supabase SQL Editor (Settings > SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── EXTENSIONES ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. GIMNASIOS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gimnasios (
  id_gimnasio         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre              VARCHAR(150)  NOT NULL,
  direccion           VARCHAR(255),
  ciudad              VARCHAR(100),
  pais                VARCHAR(100)  DEFAULT 'Perú',
  telefono            VARCHAR(20),
  email               VARCHAR(255),
  plan_suscripcion    VARCHAR(20)   NOT NULL DEFAULT 'mediano'
                        CHECK (plan_suscripcion IN ('pequeno','mediano','grande','enterprise')),
  fecha_inicio_suscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_renovacion    DATE,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activo'
                        CHECK (estado IN ('activo','pausado','cancelado')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 2. USUARIOS (extiende auth.users de Supabase) ────────────────────────────
-- id_usuario = auth.users.id para integración con Supabase Auth
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               VARCHAR(255)  UNIQUE NOT NULL,
  nombre              VARCHAR(100)  NOT NULL,
  telefono            VARCHAR(20),
  fecha_nacimiento    DATE,
  documento           VARCHAR(20)   UNIQUE,
  genero              VARCHAR(10)   CHECK (genero IN ('M','F','Otro')),
  id_gimnasio         UUID          NOT NULL REFERENCES gimnasios(id_gimnasio),
  rol                 VARCHAR(20)   NOT NULL DEFAULT 'miembro'
                        CHECK (rol IN ('miembro','cliente','entrenador','recepcionista','gerente','nutricionista','admin')),
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activo'
                        CHECK (estado IN ('activo','inactivo','suspendido')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ
);

-- ─── 3. PLANES DE MEMBRESÍA ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planes (
  id_plan             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES gimnasios(id_gimnasio),
  nombre              VARCHAR(100)  NOT NULL,
  precio_mensual      DECIMAL(10,2) NOT NULL CHECK (precio_mensual >= 0),
  precio_trimestral   DECIMAL(10,2) CHECK (precio_trimestral >= 0),
  precio_anual        DECIMAL(10,2) CHECK (precio_anual >= 0),
  duracion_dias       INT           NOT NULL DEFAULT 30,
  clases_incluidas    INT           DEFAULT -1, -- -1 = ilimitadas
  horarios_acceso     VARCHAR(100)  DEFAULT '6-22',
  sucursales_incluidas VARCHAR(10)  NOT NULL DEFAULT 'una'
                        CHECK (sucursales_incluidas IN ('una','todas')),
  descripcion         TEXT,
  activo              BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 4. MEMBRESÍAS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membresias (
  id_membresia        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  id_plan             UUID          NOT NULL REFERENCES planes(id_plan),
  fecha_inicio        DATE          NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento   DATE          NOT NULL,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa','vencida','cancelada','suspendida')),
  motivo_cancelacion  VARCHAR(255),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_fecha_membresia CHECK (fecha_vencimiento > fecha_inicio)
);

-- ─── 5. PAGOS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id_pago             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  id_membresia        UUID          REFERENCES membresias(id_membresia),
  monto               DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  moneda              VARCHAR(3)    NOT NULL DEFAULT 'PEN',
  metodo_pago         VARCHAR(20)   NOT NULL DEFAULT 'efectivo'
                        CHECK (metodo_pago IN ('tarjeta','transferencia','efectivo','yape','plin')),
  id_transaccion_stripe VARCHAR(100),
  estado              VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','completado','fallido','reembolsado')),
  fecha_pago          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  proxima_renovacion  DATE,
  descripcion         VARCHAR(255),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 6. ESPACIOS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS espacios (
  id_espacio          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          NOT NULL REFERENCES gimnasios(id_gimnasio),
  nombre              VARCHAR(100)  NOT NULL,
  tipo                VARCHAR(30)   NOT NULL DEFAULT 'salon'
                        CHECK (tipo IN ('salon','area_pesas','cardio','yoga','funcional','otros')),
  capacidad_maxima    INT           NOT NULL DEFAULT 20,
  tiene_aire_acondicionado BOOLEAN  DEFAULT FALSE,
  horario_disponibilidad VARCHAR(100) DEFAULT '6-22',
  estado              VARCHAR(30)   NOT NULL DEFAULT 'disponible'
                        CHECK (estado IN ('disponible','en_uso','en_mantenimiento'))
);

-- ─── 7. MÁQUINAS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maquinas (
  id_maquina          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_espacio          UUID          NOT NULL REFERENCES espacios(id_espacio),
  codigo_qr           VARCHAR(100)  UNIQUE,
  nombre              VARCHAR(100)  NOT NULL,
  marca               VARCHAR(100),
  modelo              VARCHAR(100),
  fecha_compra        DATE,
  fecha_mantenimiento_ultimo  DATE,
  fecha_mantenimiento_proximo DATE,
  estado              VARCHAR(30)   NOT NULL DEFAULT 'operativa'
                        CHECK (estado IN ('operativa','en_mantenimiento','dañada','fuera_de_servicio')),
  url_video_tutorial  VARCHAR(255),
  notas_seguridad     TEXT
);

-- ─── 8. ENTRENADORES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entrenadores (
  id_entrenador       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          UNIQUE REFERENCES usuarios(id_usuario),
  especialidades      VARCHAR(255),
  certificaciones     TEXT,
  biografia           TEXT,
  rating_promedio     DECIMAL(3,2)  DEFAULT 0.00,
  total_clientes_activos INT        DEFAULT 0,
  total_clases_dictadas  INT        DEFAULT 0
);

-- ─── 9. CLASES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clases (
  id_clase            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          NOT NULL REFERENCES gimnasios(id_gimnasio),
  id_entrenador       UUID          REFERENCES entrenadores(id_entrenador),
  id_espacio          UUID          REFERENCES espacios(id_espacio),
  nombre              VARCHAR(100)  NOT NULL,
  descripcion         TEXT,
  capacidad_maxima    INT           NOT NULL DEFAULT 15,
  nivel               VARCHAR(20)   CHECK (nivel IN ('principiante','intermedio','avanzado')),
  fecha_hora_inicio   TIMESTAMPTZ   NOT NULL,
  duracion_minutos    INT           NOT NULL DEFAULT 60,
  recurrencia         VARCHAR(20)   CHECK (recurrencia IN ('unica','diaria','semanal','mensual')),
  dias_semana         VARCHAR(50),
  estado              VARCHAR(20)   NOT NULL DEFAULT 'programada'
                        CHECK (estado IN ('programada','en_curso','finalizada','cancelada')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 10. INSCRIPCIONES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inscripciones (
  id_inscripcion      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  id_clase            UUID          NOT NULL REFERENCES clases(id_clase),
  fecha_inscripcion   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  estado              VARCHAR(20)   NOT NULL DEFAULT 'inscrito'
                        CHECK (estado IN ('inscrito','asistio','ausente','cancelado')),
  notificacion_enviada BOOLEAN      DEFAULT FALSE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (id_usuario, id_clase)
);

-- ─── 11. ASISTENCIAS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asistencias (
  id_asistencia       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  id_clase            UUID          REFERENCES clases(id_clase),
  fecha_asistencia    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  estado_asistencia   VARCHAR(20)   NOT NULL DEFAULT 'presente'
                        CHECK (estado_asistencia IN ('presente','ausente','llegada_tarde')),
  minutos_asistidos   INT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 12. ACCESOS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accesos (
  id_acceso           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  id_gimnasio         UUID          NOT NULL REFERENCES gimnasios(id_gimnasio),
  fecha_hora_entrada  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  fecha_hora_salida   TIMESTAMPTZ,
  tipo_acceso         VARCHAR(20)   NOT NULL DEFAULT 'qr'
                        CHECK (tipo_acceso IN ('qr','biometria','manual')),
  estado_acceso       VARCHAR(20)   NOT NULL DEFAULT 'permitido'
                        CHECK (estado_acceso IN ('permitido','denegado')),
  razon_denegacion    VARCHAR(255),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 13. PROMOCIONES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promociones (
  id_promocion        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          NOT NULL REFERENCES gimnasios(id_gimnasio),
  codigo              VARCHAR(50)   UNIQUE NOT NULL,
  tipo_descuento      VARCHAR(20)   NOT NULL CHECK (tipo_descuento IN ('porcentaje','monto_fijo')),
  valor_descuento     DECIMAL(10,2) NOT NULL CHECK (valor_descuento > 0),
  descripcion         VARCHAR(255),
  fecha_inicio        DATE          NOT NULL,
  fecha_fin           DATE          NOT NULL,
  limite_uso          INT,
  usos_realizados     INT           DEFAULT 0,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa','pausada','finalizada'))
);

-- ══════════════════════════════════════════════════════════════════════════════
-- TABLAS DE INNOVACIONES (13 disruptivas)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 14. CHURN PREDICTIONS (RF-019) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS churn_predictions (
  id_prediction       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  probability_churn   DECIMAL(5,4)  NOT NULL,
  score_riesgo        INT           NOT NULL CHECK (score_riesgo BETWEEN 0 AND 100),
  dias_para_abandono  INT,
  razon_principal     VARCHAR(255),
  ultima_sesion       DATE,
  fecha_prediccion    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  accion_ejecutada    VARCHAR(255),
  resultado           VARCHAR(20)   CHECK (resultado IN ('abandono','retenido','desconocido'))
);

-- ─── 15. CHURN INTERVENTIONS (RF-020) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS churn_interventions (
  id_intervencion     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  id_prediction       UUID          REFERENCES churn_predictions(id_prediction),
  tipo_intervencion   VARCHAR(50)   NOT NULL,
  oferta_valor        VARCHAR(255),
  fecha_oferta        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  resultado           VARCHAR(20)   CHECK (resultado IN ('aceptada','rechazada','sin_respuesta')),
  fecha_respuesta     TIMESTAMPTZ
);

-- ─── 16. GAMIFICATION XP (RF-021) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification_xp (
  id_xp               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  tipo_evento         VARCHAR(50)   NOT NULL,
  cantidad_xp         INT           NOT NULL CHECK (cantidad_xp > 0),
  descripcion         VARCHAR(255),
  id_referencia       UUID,
  fecha_evento        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 17. GAMIFICATION LEVELS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification_levels (
  id_usuario          UUID PRIMARY KEY REFERENCES usuarios(id_usuario),
  xp_total            INT           NOT NULL DEFAULT 0,
  nivel_actual        INT           NOT NULL DEFAULT 1,
  xp_proximo_nivel    INT           NOT NULL DEFAULT 500,
  fecha_ultimo_nivel  TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 18. BATTLE PASS (RF-022) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS battle_pass_progression (
  id_progression      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  temporada           VARCHAR(20)   NOT NULL DEFAULT 'S1',
  tipo                VARCHAR(10)   NOT NULL DEFAULT 'free' CHECK (tipo IN ('free','premium')),
  progreso_porcentaje INT           NOT NULL DEFAULT 0,
  tier_actual         INT           NOT NULL DEFAULT 1,
  recompensas_desbloqueadas INT     NOT NULL DEFAULT 0,
  fecha_inicio        DATE          NOT NULL,
  fecha_fin           DATE          NOT NULL
);

-- ─── 19. CLANES (RF-023) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clanes (
  id_clan             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES gimnasios(id_gimnasio),
  nombre              VARCHAR(100)  NOT NULL,
  id_lider            UUID          REFERENCES usuarios(id_usuario),
  descripcion         TEXT,
  capacidad_maxima    INT           NOT NULL DEFAULT 20,
  xp_clan             INT           NOT NULL DEFAULT 0,
  ranking             INT,
  fecha_creacion      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 20. CLAN MIEMBROS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clan_miembros (
  id_clan             UUID          NOT NULL REFERENCES clanes(id_clan),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  rol_clan            VARCHAR(20)   DEFAULT 'miembro' CHECK (rol_clan IN ('lider','oficial','miembro')),
  fecha_union         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  contribucion_xp     INT           DEFAULT 0,
  PRIMARY KEY (id_clan, id_usuario)
);

-- ─── 21. TORNEOS SEMANALES (RF-024) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS torneos_semanales (
  id_torneo           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES gimnasios(id_gimnasio),
  nombre              VARCHAR(100)  NOT NULL,
  tipo_metrica        VARCHAR(50)   NOT NULL,
  descripcion         TEXT,
  fecha_inicio        TIMESTAMPTZ   NOT NULL,
  fecha_fin           TIMESTAMPTZ   NOT NULL,
  premios_texto       VARCHAR(255)
);

-- ─── 22. DIGITAL TWIN (RF-025) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS digital_twin (
  id_usuario          UUID PRIMARY KEY REFERENCES usuarios(id_usuario),
  altura_cm           INT,
  peso_kg             DECIMAL(5,2),
  peso_kg_inicial     DECIMAL(5,2),
  porcentaje_grasa    DECIMAL(5,2),
  configuracion_avatar JSONB        DEFAULT '{"color":"#00D084","estilo":"athletic"}',
  prediccion_12w      TEXT,
  fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 23. AI RECOMMENDATIONS (RF-026, RF-027) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id_recomendacion    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  tipo                VARCHAR(50)   NOT NULL,
  contenido_json      JSONB         NOT NULL DEFAULT '{}',
  score_relevancia    DECIMAL(3,2)  DEFAULT 0.80,
  mostrada            BOOLEAN       DEFAULT FALSE,
  aceptada            BOOLEAN,
  fecha_generacion    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 24. MARKETPLACE VENDORS (RF-031 a RF-034) ───────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_vendors (
  id_vendor           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo                VARCHAR(30)   NOT NULL
                        CHECK (tipo IN ('trainer','nutritionist','supplement_brand','wearable','merchandise')),
  nombre              VARCHAR(255)  NOT NULL,
  email               VARCHAR(255)  UNIQUE,
  descripcion         TEXT,
  certificaciones     TEXT,
  tarifa              DECIMAL(10,2),
  rating_promedio     DECIMAL(3,2)  DEFAULT 0.00,
  total_clientes      INT           DEFAULT 0,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activo'
                        CHECK (estado IN ('activo','pausado','inactivo')),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 25. MARKETPLACE TRANSACTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id_transaccion      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          REFERENCES usuarios(id_usuario),
  id_vendor           UUID          REFERENCES marketplace_vendors(id_vendor),
  tipo                VARCHAR(50)   NOT NULL,
  monto               DECIMAL(10,2) NOT NULL,
  comision_gymsos     DECIMAL(10,2) NOT NULL,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','completada','cancelada')),
  fecha_transaccion   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 26. CORPORATE CLIENTS (RF-035) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS corporate_clients (
  id_corporativo      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_empresa      VARCHAR(255)  NOT NULL,
  contacto_hr         VARCHAR(100)  NOT NULL,
  email_hr            VARCHAR(255),
  cantidad_empleados  INT           NOT NULL DEFAULT 0,
  cantidad_membresias INT           NOT NULL DEFAULT 0,
  precio_por_empleado DECIMAL(5,2)  NOT NULL DEFAULT 0,
  fecha_inicio_contrato DATE        NOT NULL DEFAULT CURRENT_DATE,
  fecha_renovacion    DATE,
  estado              VARCHAR(20)   NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa','pausada','cancelada'))
);

-- ─── 27. CORPORATE LEADERBOARDS (RF-036) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS corporate_leaderboards (
  id_leaderboard      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_corporativo      UUID          REFERENCES corporate_clients(id_corporativo),
  departamento        VARCHAR(100)  NOT NULL,
  xp_acumulado        INT           NOT NULL DEFAULT 0,
  ranking             INT,
  fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 28. WEARABLE SYNC (RF-030, RF-037) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS wearable_sync (
  id_sync             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  tipo_wearable       VARCHAR(50)   NOT NULL,
  token_autenticacion TEXT,
  ultima_sincronizacion TIMESTAMPTZ,
  datos_salud_json    JSONB         DEFAULT '{}',
  fecha_actualizacion TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 29. HEALTH ALERTS (RF-038) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_alerts (
  id_alerta           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario          UUID          NOT NULL REFERENCES usuarios(id_usuario),
  tipo_alerta         VARCHAR(50)   NOT NULL,
  descripcion         VARCHAR(255)  NOT NULL,
  severidad           VARCHAR(10)   NOT NULL CHECK (severidad IN ('baja','media','alta')),
  fecha_alerta        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  leida               BOOLEAN       DEFAULT FALSE,
  accion_recomendada  VARCHAR(255)
);

-- ─── 30. DYNAMIC PRICING LOG (RF-044) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dynamic_pricing_log (
  id_pricing          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio         UUID          REFERENCES gimnasios(id_gimnasio),
  zona_geografica     VARCHAR(100),
  precio_anterior     DECIMAL(10,2),
  precio_nuevo        DECIMAL(10,2),
  razon               VARCHAR(255),
  fecha_cambio        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actividad           VARCHAR(20)   CHECK (actividad IN ('aplicada','revertida'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ÍNDICES DE PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_usuarios_email       ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol         ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_gimnasio    ON usuarios(id_gimnasio);
CREATE INDEX IF NOT EXISTS idx_membresias_usuario   ON membresias(id_usuario, estado);
CREATE INDEX IF NOT EXISTS idx_accesos_fecha        ON accesos(fecha_hora_entrada DESC);
CREATE INDEX IF NOT EXISTS idx_accesos_usuario      ON accesos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_clases_fecha         ON clases(fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_clases_gimnasio      ON clases(id_gimnasio);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario        ON pagos(id_usuario, estado);
CREATE INDEX IF NOT EXISTS idx_asistencias_usuario  ON asistencias(id_usuario, fecha_asistencia);
CREATE INDEX IF NOT EXISTS idx_xp_usuario           ON gamification_xp(id_usuario);
CREATE INDEX IF NOT EXISTS idx_churn_usuario        ON churn_predictions(id_usuario, fecha_prediccion);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE gimnasios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE membresias   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE accesos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;

-- Helper function: obtiene el gimnasio del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_gym()
RETURNS UUID AS $$
  SELECT id_gimnasio FROM usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: obtiene el rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM usuarios WHERE id_usuario = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas: usuarios leen su propio perfil
CREATE POLICY "users_select_own" ON usuarios
  FOR SELECT USING (id_usuario = auth.uid());

-- Política: gerentes ven todos los usuarios de su gimnasio
CREATE POLICY "gerente_select_gym_users" ON usuarios
  FOR SELECT USING (
    get_user_rol() IN ('gerente','admin') AND id_gimnasio = get_user_gym()
  );

-- Política: recepcionistas ven miembros de su gimnasio
CREATE POLICY "recepcionista_select_miembros" ON usuarios
  FOR SELECT USING (
    get_user_rol() = 'recepcionista' AND id_gimnasio = get_user_gym()
  );

-- Política: membresias — miembro ve la suya, gerente ve todas las de su gym
CREATE POLICY "membresias_select" ON membresias
  FOR SELECT USING (
    id_usuario = auth.uid() OR
    get_user_rol() IN ('gerente','recepcionista','admin')
  );

-- Política: pagos — solo propio o gerente/recepcionista
CREATE POLICY "pagos_select" ON pagos
  FOR SELECT USING (
    id_usuario = auth.uid() OR
    get_user_rol() IN ('gerente','recepcionista','admin')
  );

-- Política: clases — todos los del mismo gym pueden ver
CREATE POLICY "clases_select" ON clases
  FOR SELECT USING (id_gimnasio = get_user_gym());

-- Política: accesos — propio o staff
CREATE POLICY "accesos_select" ON accesos
  FOR SELECT USING (
    id_usuario = auth.uid() OR
    get_user_rol() IN ('gerente','recepcionista','admin')
  );

-- Política: churn — solo gerentes
CREATE POLICY "churn_gerente_select" ON churn_predictions
  FOR SELECT USING (get_user_rol() IN ('gerente','admin'));

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGER: Crear perfil de usuario al registrarse
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- El perfil completo se crea desde la app (incluye rol, gimnasio, etc.)
  -- Este trigger solo guarda la referencia mínima si se necesita
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DATOS SEMILLA — Gimnasio demo + Usuarios demo
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Insertar gimnasio demo
INSERT INTO gimnasios (id_gimnasio, nombre, ciudad, pais, plan_suscripcion, estado)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'GymFit Lima',
  'Lima',
  'Perú',
  'grande',
  'activo'
) ON CONFLICT (id_gimnasio) DO NOTHING;

-- 2. Planes de membresía demo
INSERT INTO planes (id_plan, id_gimnasio, nombre, precio_mensual, precio_trimestral, precio_anual, duracion_dias, clases_incluidas, descripcion)
VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Basic',       79.90,  220.00,  799.00,  30, 5,  'Acceso básico en horario regular'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001',
   'Silver',     109.90,  299.00, 1099.00,  30, 10, 'Acceso completo + 10 clases/mes'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001',
   'Gold Premium',149.90,  399.00, 1499.00,  30, -1, 'Acceso ilimitado + clases ilimitadas'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001',
   'Enterprise',  299.90,  799.00, 2999.00, 30, -1, 'Acceso multi-sucursal + beneficios VIP')
ON CONFLICT (id_plan) DO NOTHING;

-- NOTA: Los usuarios demo se crean en 2 pasos:
-- Paso 1: Crear en Supabase Auth → Dashboard > Auth > Users > Add User
--   gerente@gymsos.io    / gerente123
--   miembro@gymsos.io    / miembro123
--   entrenador@gymsos.io / entrenador123
--   recepcion@gymsos.io  / recepcion123
--
-- Paso 2: Después de crear los usuarios en Auth, ejecutar el siguiente INSERT
--   reemplazando los UUIDs con los IDs que Supabase generó automáticamente.

/*
INSERT INTO usuarios (id_usuario, email, nombre, telefono, documento, genero, id_gimnasio, rol, estado)
VALUES
  ('UUID-DEL-GERENTE-EN-AUTH',      'gerente@gymsos.io',    'Carlos Ramos',   '+51 987654321', '12345678', 'M', '00000000-0000-0000-0000-000000000001', 'gerente',       'activo'),
  ('UUID-DEL-MIEMBRO-EN-AUTH',      'miembro@gymsos.io',    'Juan Quispe',    '+51 912345678', '87654321', 'M', '00000000-0000-0000-0000-000000000001', 'miembro',       'activo'),
  ('UUID-DEL-ENTRENADOR-EN-AUTH',   'entrenador@gymsos.io', 'Ana Torres',     '+51 901234567', '11223344', 'F', '00000000-0000-0000-0000-000000000001', 'entrenador',    'activo'),
  ('UUID-DEL-RECEPCION-EN-AUTH',    'recepcion@gymsos.io',  'María López',    '+51 934567890', '44332211', 'F', '00000000-0000-0000-0000-000000000001', 'recepcionista', 'activo');
*/

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DEL ESQUEMA GYMsos v2.0
-- ═══════════════════════════════════════════════════════════════════════════════
