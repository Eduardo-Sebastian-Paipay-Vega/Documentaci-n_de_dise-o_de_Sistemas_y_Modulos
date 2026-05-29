-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 001: Fix roles CHECK + RLS gimnasios + RPC atómica
-- Fecha: 2026-05-29
-- Ejecutar en: Supabase SQL Editor (DESPUÉS del schema base v2.0)
-- Requisito: supabase-schema.sql ya aplicado
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. CORREGIR CHECK CONSTRAINT DE ROLES ───────────────────────────────────
-- Problema: 'cliente' y 'nutricionista' existen en código y seeds pero no en
-- el constraint del schema original. Los seeds de seed-nuevos-roles.sql fallaban.

ALTER TABLE usuarios
  DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('miembro','cliente','entrenador','recepcionista','gerente','nutricionista','admin'));

-- ─── 2. RLS POLÍTICA SELECT PARA TABLA GIMNASIOS ─────────────────────────────
-- Problema detectado en auth-provider.tsx (comentario línea 69):
-- "NO se hace join a gimnasios porque esa tabla no tiene RLS policy SELECT"
-- Esto causa que el join silenciosamente devuelva NULL y el nombre del gimnasio
-- no se cargue en el primer fetch, requiriendo una segunda query separada.

CREATE POLICY "gimnasios_select_propio" ON gimnasios
  FOR SELECT USING (
    id_gimnasio = get_user_gym()
  );

-- Permite que el admin del sistema vea todos los gimnasios
CREATE POLICY "admin_select_all_gimnasios" ON gimnasios
  FOR SELECT USING (
    get_user_rol() = 'admin'
  );

-- ─── 3. RLS POLÍTICAS FALTANTES PARA ROLES NUEVOS ────────────────────────────
-- Los roles 'nutricionista' y 'cliente' no tenían cobertura en las políticas RLS

-- nutricionista puede ver miembros de su gimnasio (para evaluaciones)
CREATE POLICY "nutricionista_select_miembros" ON usuarios
  FOR SELECT USING (
    get_user_rol() = 'nutricionista' AND id_gimnasio = get_user_gym()
  );

-- cliente puede ver su propio perfil (igual que miembro)
-- ya cubierto por "users_select_own" existente

-- entrenador puede ver miembros de su gimnasio (para clases)
CREATE POLICY "entrenador_select_gym_users" ON usuarios
  FOR SELECT USING (
    get_user_rol() = 'entrenador' AND id_gimnasio = get_user_gym()
  );

-- ─── 4. RPC ATÓMICA: registrar_nuevo_miembro ─────────────────────────────────
-- Problema: registrarNuevoMiembro en usuarios.service.ts hace 3 INSERTs
-- separados sin transacción. Si falla el pago, queda usuario sin membresía.
-- Solución: función PL/pgSQL que ejecuta todo en una transacción implícita.
--
-- NOTA: auth.signUp() NO puede hacerse dentro de PL/pgSQL (es una API HTTP).
-- Esta función asume que auth.users ya fue creado y recibe el UUID resultante.
-- El flujo correcto es:
--   1. Frontend: supabase.auth.signUp() → obtiene authUserId
--   2. Frontend: llama a esta RPC con authUserId
--   3. Si la RPC falla, frontend debe llamar supabase.auth.admin.deleteUser()

CREATE OR REPLACE FUNCTION rpc_registrar_nuevo_miembro(
  p_auth_user_id    UUID,
  p_email           TEXT,
  p_nombre          TEXT,
  p_telefono        TEXT     DEFAULT NULL,
  p_documento       TEXT     DEFAULT NULL,
  p_genero          TEXT     DEFAULT NULL,
  p_id_gimnasio     UUID,
  p_id_plan         UUID,
  p_duracion_dias   INT      DEFAULT 30,
  p_monto           DECIMAL,
  p_metodo_pago     TEXT     DEFAULT 'efectivo'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id_membresia UUID;
  v_id_pago      UUID;
  v_fecha_inicio  DATE := CURRENT_DATE;
  v_fecha_vence   DATE := CURRENT_DATE + p_duracion_dias;
BEGIN
  -- Validaciones de entrada
  IF p_monto <= 0 THEN
    RAISE EXCEPTION 'monto_invalido: El monto debe ser mayor a 0';
  END IF;

  IF p_metodo_pago NOT IN ('tarjeta','transferencia','efectivo','yape','plin') THEN
    RAISE EXCEPTION 'metodo_invalido: Método de pago no reconocido';
  END IF;

  IF p_genero IS NOT NULL AND p_genero NOT IN ('M','F','Otro') THEN
    RAISE EXCEPTION 'genero_invalido: Género debe ser M, F u Otro';
  END IF;

  -- 1. Insertar usuario
  INSERT INTO usuarios (
    id_usuario, email, nombre, telefono, documento, genero,
    id_gimnasio, rol, estado
  ) VALUES (
    p_auth_user_id, p_email, p_nombre, p_telefono, p_documento, p_genero,
    p_id_gimnasio, 'miembro', 'activo'
  );

  -- 2. Insertar membresía
  INSERT INTO membresias (
    id_usuario, id_plan, fecha_inicio, fecha_vencimiento, estado
  ) VALUES (
    p_auth_user_id, p_id_plan, v_fecha_inicio, v_fecha_vence, 'activa'
  )
  RETURNING id_membresia INTO v_id_membresia;

  -- 3. Insertar pago
  INSERT INTO pagos (
    id_usuario, id_membresia, monto, moneda,
    metodo_pago, estado, descripcion
  ) VALUES (
    p_auth_user_id, v_id_membresia, p_monto, 'PEN',
    p_metodo_pago, 'completado', 'Registro nuevo miembro'
  )
  RETURNING id_pago INTO v_id_pago;

  RETURN json_build_object(
    'ok',           true,
    'id_usuario',   p_auth_user_id,
    'id_membresia', v_id_membresia,
    'id_pago',      v_id_pago
  );

EXCEPTION WHEN OTHERS THEN
  -- La transacción se revierte automáticamente (PL/pgSQL)
  RETURN json_build_object(
    'ok',    false,
    'error', SQLERRM,
    'code',  SQLSTATE
  );
END;
$$;

-- Permitir que usuarios autenticados llamen a la función
GRANT EXECUTE ON FUNCTION rpc_registrar_nuevo_miembro TO authenticated;

-- ─── 5. RPC: verificar_acceso_miembro ────────────────────────────────────────
-- Centraliza la lógica de validación de acceso al gimnasio.
-- Actualmente está dispersa en accesos.service.ts sin protección server-side.

CREATE OR REPLACE FUNCTION rpc_verificar_y_registrar_acceso(
  p_id_usuario  UUID,
  p_id_gimnasio UUID,
  p_tipo_acceso TEXT DEFAULT 'manual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tiene_membresia BOOLEAN;
  v_id_acceso       UUID;
  v_razon           TEXT;
BEGIN
  IF p_tipo_acceso NOT IN ('qr','biometria','manual') THEN
    RAISE EXCEPTION 'tipo_acceso_invalido';
  END IF;

  -- Verificar membresía activa y vigente
  SELECT EXISTS (
    SELECT 1 FROM membresias
    WHERE id_usuario = p_id_usuario
      AND estado = 'activa'
      AND fecha_vencimiento >= CURRENT_DATE
  ) INTO v_tiene_membresia;

  IF NOT v_tiene_membresia THEN
    v_razon := 'Membresía inactiva o vencida';
  END IF;

  -- Registrar acceso (permitido o denegado)
  INSERT INTO accesos (
    id_usuario, id_gimnasio, tipo_acceso,
    estado_acceso, razon_denegacion
  ) VALUES (
    p_id_usuario, p_id_gimnasio, p_tipo_acceso,
    CASE WHEN v_tiene_membresia THEN 'permitido' ELSE 'denegado' END,
    v_razon
  )
  RETURNING id_acceso INTO v_id_acceso;

  RETURN json_build_object(
    'permitido',  v_tiene_membresia,
    'id_acceso',  v_id_acceso,
    'razon',      v_razon
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_verificar_y_registrar_acceso TO authenticated;

-- ─── 6. ÍNDICE FALTANTE: membresias por vencimiento ──────────────────────────
-- Queries frecuentes: getMembresiasPorVencer y getPagosPendientesPorVencer
-- filtran por fecha_vencimiento pero no hay índice en esa columna.

CREATE INDEX IF NOT EXISTS idx_membresias_vencimiento
  ON membresias(fecha_vencimiento, estado);

-- ─── FIN MIGRACIÓN 001 ────────────────────────────────────────────────────────
