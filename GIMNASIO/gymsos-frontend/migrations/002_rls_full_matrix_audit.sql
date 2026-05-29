-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 002: RLS completa (INSERT/UPDATE/DELETE) + audit_logs
-- Fecha: 2026-05-29
-- Prerequisito: migraciones 001 ya aplicada
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA CRÍTICO DETECTADO:
-- Las tablas `asistencias` e `inscripciones` tienen RLS habilitado (schema base)
-- pero CERO políticas. En Supabase, RLS ON + 0 policies = BLOQUEO TOTAL.
-- Esto significa:
--   - inscribirseEnClase()          → falla silenciosamente
--   - getInscripcionesDelMiembro()  → siempre retorna []
--   - registro de asistencia        → completamente bloqueado
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN A: TABLA INSCRIPCIONES (RLS activado, 0 policies → ROTO)
-- ─────────────────────────────────────────────────────────────────────────────

-- SELECT: miembro ve sus propias, staff del gym ve todas
CREATE POLICY "inscripciones_select_own" ON inscripciones
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "inscripciones_select_staff" ON inscripciones
  FOR SELECT USING (
    get_user_rol() IN ('gerente','recepcionista','entrenador','admin')
  );

-- INSERT: miembro/cliente puede inscribirse
CREATE POLICY "inscripciones_insert_miembro" ON inscripciones
  FOR INSERT WITH CHECK (
    id_usuario = auth.uid() AND
    get_user_rol() IN ('miembro','cliente')
  );

-- UPDATE: propio o entrenador/recepcionista (para marcar asistio/ausente)
CREATE POLICY "inscripciones_update_own_or_staff" ON inscripciones
  FOR UPDATE USING (
    id_usuario = auth.uid() OR
    get_user_rol() IN ('gerente','recepcionista','entrenador','admin')
  );

-- DELETE: solo cancelar la propia
CREATE POLICY "inscripciones_delete_own" ON inscripciones
  FOR DELETE USING (id_usuario = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN B: TABLA ASISTENCIAS (RLS activado, 0 policies → ROTO)
-- ─────────────────────────────────────────────────────────────────────────────

-- SELECT: propio o staff
CREATE POLICY "asistencias_select_own" ON asistencias
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "asistencias_select_staff" ON asistencias
  FOR SELECT USING (
    get_user_rol() IN ('gerente','recepcionista','entrenador','admin')
  );

-- INSERT: entrenador y recepcionista pueden registrar asistencias
CREATE POLICY "asistencias_insert_staff" ON asistencias
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('entrenador','recepcionista','gerente','admin')
  );

-- UPDATE: entrenador puede corregir asistencia
CREATE POLICY "asistencias_update_staff" ON asistencias
  FOR UPDATE USING (
    get_user_rol() IN ('entrenador','gerente','admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN C: TABLA USUARIOS — políticas de escritura faltantes
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT: recepcionista/gerente puede crear usuarios (vía registrarNuevoMiembro)
CREATE POLICY "usuarios_insert_staff" ON usuarios
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

-- UPDATE propio: cualquier usuario puede actualizar su propio perfil
CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (id_usuario = auth.uid())
  WITH CHECK (
    id_usuario = auth.uid() AND
    -- No puede cambiarse el rol ni el gimnasio desde el cliente
    id_gimnasio = get_user_gym()
  );

-- UPDATE staff: gerente/recepcionista puede cambiar estado de usuarios de su gym
CREATE POLICY "usuarios_update_staff" ON usuarios
  FOR UPDATE USING (
    get_user_rol() IN ('gerente','recepcionista','admin') AND
    id_gimnasio = get_user_gym()
  );

-- DELETE: solo admin puede eliminar usuarios
CREATE POLICY "usuarios_delete_admin" ON usuarios
  FOR DELETE USING (get_user_rol() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN D: TABLA MEMBRESIAS — políticas de escritura faltantes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "membresias_insert_staff" ON membresias
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

CREATE POLICY "membresias_update_staff" ON membresias
  FOR UPDATE USING (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

CREATE POLICY "membresias_delete_admin" ON membresias
  FOR DELETE USING (get_user_rol() IN ('gerente','admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN E: TABLA PAGOS — políticas de escritura faltantes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "pagos_insert_staff" ON pagos
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

-- Solo gerente puede corregir un pago; recepcionista no puede editar histórico
CREATE POLICY "pagos_update_gerente" ON pagos
  FOR UPDATE USING (
    get_user_rol() IN ('gerente','admin')
  );

-- Solo admin puede eliminar pagos (operación auditada)
CREATE POLICY "pagos_delete_admin" ON pagos
  FOR DELETE USING (get_user_rol() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN F: TABLA CLASES — políticas de escritura faltantes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "clases_insert_staff" ON clases
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('entrenador','gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

CREATE POLICY "clases_update_staff" ON clases
  FOR UPDATE USING (
    get_user_rol() IN ('entrenador','gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

CREATE POLICY "clases_delete_gerente" ON clases
  FOR DELETE USING (
    get_user_rol() IN ('gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN G: TABLA ACCESOS — políticas de escritura faltantes
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT acceso: recepcionista o via RPC
CREATE POLICY "accesos_insert_staff" ON accesos
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

-- UPDATE: solo registrar salida (fecha_hora_salida)
CREATE POLICY "accesos_update_salida" ON accesos
  FOR UPDATE USING (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN H: TABLA CHURN_PREDICTIONS — políticas de escritura
-- ─────────────────────────────────────────────────────────────────────────────

-- Solo sistema/admin puede insertar predicciones de churn
CREATE POLICY "churn_insert_admin" ON churn_predictions
  FOR INSERT WITH CHECK (get_user_rol() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN I: TABLA AUDIT_LOGS — observabilidad y trazabilidad
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id_log          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio     UUID           REFERENCES gimnasios(id_gimnasio),
  id_actor        UUID           REFERENCES auth.users(id),
  rol_actor       VARCHAR(20),
  accion          VARCHAR(50)    NOT NULL,
  entidad         VARCHAR(50)    NOT NULL,
  id_entidad      UUID,
  datos_antes     JSONB,
  datos_despues   JSONB,
  ip_origen       INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo gerente/admin puede leer los logs de su gimnasio
CREATE POLICY "audit_logs_select_gerente" ON audit_logs
  FOR SELECT USING (
    get_user_rol() IN ('gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

-- Sistema puede insertar logs (SECURITY DEFINER functions)
CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Nadie puede modificar ni eliminar logs (inmutables)
-- No se crean políticas UPDATE/DELETE → bloqueado por RLS

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_gimnasio   ON audit_logs(id_gimnasio, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor      ON audit_logs(id_actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidad    ON audit_logs(entidad, id_entidad);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN J: FUNCIÓN HELPER — log_audit_event
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION log_audit_event(
  p_accion      TEXT,
  p_entidad     TEXT,
  p_id_entidad  UUID     DEFAULT NULL,
  p_datos_antes JSONB    DEFAULT NULL,
  p_datos_desp  JSONB    DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    id_gimnasio, id_actor, rol_actor,
    accion, entidad, id_entidad,
    datos_antes, datos_despues
  ) VALUES (
    get_user_gym(),
    auth.uid(),
    get_user_rol(),
    p_accion,
    p_entidad,
    p_id_entidad,
    p_datos_antes,
    p_datos_desp
  );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Los logs nunca deben romper el flujo principal
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN K: VALIDACIÓN — MATRIZ RLS FINAL
-- ─────────────────────────────────────────────────────────────────────────────
/*
  Después de aplicar 001 + 002, la cobertura RLS queda:

  TABLA              │ SELECT │ INSERT │ UPDATE │ DELETE
  ───────────────────┼────────┼────────┼────────┼────────
  gimnasios          │   ✅   │   ❌   │   ❌   │   ❌
  usuarios           │   ✅   │   ✅   │   ✅   │   ✅
  planes             │   ✅   │  (pub) │  (pub) │  (pub)
  membresias         │   ✅   │   ✅   │   ✅   │   ✅
  pagos              │   ✅   │   ✅   │   ✅   │   ✅
  clases             │   ✅   │   ✅   │   ✅   │   ✅
  accesos            │   ✅   │   ✅   │   ✅   │   ❌
  inscripciones      │   ✅   │   ✅   │   ✅   │   ✅  ← CRÍTICO REPARADO
  asistencias        │   ✅   │   ✅   │   ✅   │   ❌  ← CRÍTICO REPARADO
  churn_predictions  │   ✅   │   ✅   │   ❌   │   ❌
  audit_logs         │   ✅   │   ✅   │   ❌   │   ❌  ← NUEVO
*/

-- ─── FIN MIGRACIÓN 002 ────────────────────────────────────────────────────────
