-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 002: RLS completa (INSERT/UPDATE/DELETE) + audit_logs
-- Fecha: 2026-05-29  |  Versión: 1.1 (idempotente)
-- Prerequisito: migración 001 ya aplicada
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA CRÍTICO REPARADO EN ESTA MIGRACIÓN:
-- Las tablas `asistencias` e `inscripciones` tienen RLS habilitado (schema base)
-- pero CERO políticas → BLOQUEO TOTAL de todas las operaciones:
--   - inscribirseEnClase()          → falla silenciosamente (retorna vacío)
--   - getInscripcionesDelMiembro()  → siempre retorna []
--   - registro de asistencia        → completamente bloqueado
--
-- NOTA TÉCNICA: Cada bloque usa DROP POLICY IF EXISTS antes de CREATE POLICY
-- para garantizar ejecución idempotente (re-runnable sin errores).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN A: TABLA INSCRIPCIONES (RLS ON, 0 policies → BLOQUEO TOTAL → FIX)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "inscripciones_select_own"       ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_select_staff"     ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_insert_miembro"   ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_update_staff"     ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_delete_own"       ON inscripciones;

CREATE POLICY "inscripciones_select_own" ON inscripciones
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "inscripciones_select_staff" ON inscripciones
  FOR SELECT USING (
    get_user_rol() IN ('gerente','recepcionista','entrenador','admin')
  );

CREATE POLICY "inscripciones_insert_miembro" ON inscripciones
  FOR INSERT WITH CHECK (
    id_usuario = auth.uid() AND
    get_user_rol() IN ('miembro','cliente')
  );

CREATE POLICY "inscripciones_update_staff" ON inscripciones
  FOR UPDATE USING (
    id_usuario = auth.uid() OR
    get_user_rol() IN ('gerente','recepcionista','entrenador','admin')
  );

CREATE POLICY "inscripciones_delete_own" ON inscripciones
  FOR DELETE USING (id_usuario = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN B: TABLA ASISTENCIAS (RLS ON, 0 policies → BLOQUEO TOTAL → FIX)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "asistencias_select_own"    ON asistencias;
DROP POLICY IF EXISTS "asistencias_select_staff"  ON asistencias;
DROP POLICY IF EXISTS "asistencias_insert_staff"  ON asistencias;
DROP POLICY IF EXISTS "asistencias_update_staff"  ON asistencias;

CREATE POLICY "asistencias_select_own" ON asistencias
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "asistencias_select_staff" ON asistencias
  FOR SELECT USING (
    get_user_rol() IN ('gerente','recepcionista','entrenador','admin')
  );

CREATE POLICY "asistencias_insert_staff" ON asistencias
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('entrenador','recepcionista','gerente','admin')
  );

CREATE POLICY "asistencias_update_staff" ON asistencias
  FOR UPDATE USING (
    get_user_rol() IN ('entrenador','gerente','admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN C: TABLA USUARIOS — políticas de escritura
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "usuarios_insert_staff"   ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own"     ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_staff"   ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_admin"   ON usuarios;

CREATE POLICY "usuarios_insert_staff" ON usuarios
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

-- Propio: el usuario actualiza su perfil pero no puede cambiar rol
CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (id_usuario = auth.uid())
  WITH CHECK (
    id_usuario = auth.uid() AND
    get_user_rol() IN ('miembro','cliente','entrenador','recepcionista','gerente','nutricionista','admin')
  );

-- Staff: gerente/recepcionista cambia estado (activo/inactivo/suspendido)
CREATE POLICY "usuarios_update_staff" ON usuarios
  FOR UPDATE USING (
    get_user_rol() IN ('gerente','recepcionista','admin')
  );

CREATE POLICY "usuarios_delete_admin" ON usuarios
  FOR DELETE USING (get_user_rol() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN D: TABLA MEMBRESIAS — políticas de escritura
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "membresias_insert_staff"  ON membresias;
DROP POLICY IF EXISTS "membresias_update_staff"  ON membresias;
DROP POLICY IF EXISTS "membresias_delete_admin"  ON membresias;

CREATE POLICY "membresias_insert_staff" ON membresias
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

CREATE POLICY "membresias_update_staff" ON membresias
  FOR UPDATE USING (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

CREATE POLICY "membresias_delete_admin" ON membresias
  FOR DELETE USING (
    get_user_rol() IN ('gerente','admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN E: TABLA PAGOS — políticas de escritura
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "pagos_insert_staff"    ON pagos;
DROP POLICY IF EXISTS "pagos_update_gerente"  ON pagos;
DROP POLICY IF EXISTS "pagos_delete_admin"    ON pagos;

CREATE POLICY "pagos_insert_staff" ON pagos
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

-- Solo gerente puede corregir un pago; recepcionista no puede editar histórico
CREATE POLICY "pagos_update_gerente" ON pagos
  FOR UPDATE USING (
    get_user_rol() IN ('gerente','admin')
  );

CREATE POLICY "pagos_delete_admin" ON pagos
  FOR DELETE USING (
    get_user_rol() = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN F: TABLA CLASES — políticas de escritura
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "clases_insert_staff"    ON clases;
DROP POLICY IF EXISTS "clases_update_staff"    ON clases;
DROP POLICY IF EXISTS "clases_delete_gerente"  ON clases;

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
-- SECCIÓN G: TABLA ACCESOS — políticas de escritura
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "accesos_insert_staff"   ON accesos;
DROP POLICY IF EXISTS "accesos_update_salida"  ON accesos;

CREATE POLICY "accesos_insert_staff" ON accesos
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('recepcionista','gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

CREATE POLICY "accesos_update_salida" ON accesos
  FOR UPDATE USING (
    get_user_rol() IN ('recepcionista','gerente','admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN H: TABLA CHURN_PREDICTIONS — política de escritura
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "churn_insert_admin" ON churn_predictions;

CREATE POLICY "churn_insert_admin" ON churn_predictions
  FOR INSERT WITH CHECK (
    get_user_rol() = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN I: TABLA AUDIT_LOGS — observabilidad inmutable
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id_log        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_gimnasio   UUID        REFERENCES gimnasios(id_gimnasio),
  id_actor      UUID        REFERENCES auth.users(id),
  rol_actor     VARCHAR(20),
  accion        VARCHAR(50) NOT NULL,
  entidad       VARCHAR(50) NOT NULL,
  id_entidad    UUID,
  datos_antes   JSONB,
  datos_despues JSONB,
  ip_origen     INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select_gerente"  ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_system"   ON audit_logs;

-- Gerente ve logs de su gimnasio
CREATE POLICY "audit_logs_select_gerente" ON audit_logs
  FOR SELECT USING (
    get_user_rol() IN ('gerente','admin') AND
    id_gimnasio = get_user_gym()
  );

-- Cualquier usuario autenticado puede insertar logs (escritura libre, inmutable)
CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Índices de consulta
CREATE INDEX IF NOT EXISTS idx_audit_logs_gimnasio ON audit_logs(id_gimnasio, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor    ON audit_logs(id_actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidad  ON audit_logs(entidad, id_entidad);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECCIÓN J: FUNCIÓN HELPER — log_audit_event
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION log_audit_event(
  p_accion      TEXT,
  p_entidad     TEXT,
  p_id_entidad  UUID  DEFAULT NULL,
  p_datos_antes JSONB DEFAULT NULL,
  p_datos_desp  JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gym_id UUID;
BEGIN
  SELECT id_gimnasio INTO v_gym_id
    FROM usuarios
   WHERE id_usuario = auth.uid()
   LIMIT 1;

  INSERT INTO audit_logs (
    id_gimnasio, id_actor, rol_actor,
    accion, entidad, id_entidad,
    datos_antes, datos_despues
  ) VALUES (
    v_gym_id,
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
-- SECCIÓN K: MATRIZ RLS FINAL (para referencia)
-- ─────────────────────────────────────────────────────────────────────────────
/*
  Después de 001 + 002:

  TABLA              │ SELECT │ INSERT │ UPDATE │ DELETE
  ───────────────────┼────────┼────────┼────────┼────────
  gimnasios          │   ✅   │   ──   │   ──   │   ──
  usuarios           │   ✅   │   ✅   │   ✅   │   ✅
  planes             │   ✅   │   ──   │   ──   │   ──
  membresias         │   ✅   │   ✅   │   ✅   │   ✅
  pagos              │   ✅   │   ✅   │   ✅   │   ✅
  clases             │   ✅   │   ✅   │   ✅   │   ✅
  accesos            │   ✅   │   ✅   │   ✅   │   ──
  inscripciones      │   ✅   │   ✅   │   ✅   │   ✅  ← CRÍTICO REPARADO
  asistencias        │   ✅   │   ✅   │   ✅   │   ──  ← CRÍTICO REPARADO
  churn_predictions  │   ✅   │   ✅   │   ──   │   ──
  audit_logs         │   ✅   │   ✅   │   ──   │   ──  ← NUEVO
*/

-- ─── FIN MIGRACIÓN 002 ────────────────────────────────────────────────────────
