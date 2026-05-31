-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 008b: Parche de todos los bugs acumulados en 001→008
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor
-- Prerequisito: migraciones 001-008 aplicadas (aunque con errores)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- BUGS QUE REPARA:
--   BUG-3  rpc_registrar_nuevo_miembro    — tablas sin schema qualifier (post-006)
--   BUG-4  rpc_verificar_y_registrar_acceso — ídem
--   BUG-5  log_audit_event                — usa usuarios sin schema (post-006)
--   BUG-6  clases_insert/update/delete_staff — subquery FROM usuarios sin schema
--   BUG-7  accesos_insert_staff           — subquery FROM usuarios sin schema
--   BUG-10 audit_logs                     — quedó en public, moverla a gym
--
-- + Re-aplica los pasos 4-8 de 008 que fallaron por BUG-1 (2>/dev/null).
--
-- Esta migración es IDEMPOTENTE: puede ejecutarse aunque la BD esté parcialmente
-- aplicada o ya tenga algunas correcciones.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX BUG-3 + BUG-4: rpc_registrar_nuevo_miembro y rpc_verificar_y_registrar_acceso
-- Agregar SET search_path = gym, public para que resuelvan las tablas correctamente
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_registrar_nuevo_miembro(
  p_auth_user_id    UUID,
  p_email           TEXT,
  p_nombre          TEXT,
  p_id_gimnasio     UUID,
  p_id_plan         UUID,
  p_monto           DECIMAL,
  p_telefono        TEXT     DEFAULT NULL,
  p_documento       TEXT     DEFAULT NULL,
  p_genero          TEXT     DEFAULT NULL,
  p_duracion_dias   INT      DEFAULT 30,
  p_metodo_pago     TEXT     DEFAULT 'efectivo'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_id_membresia UUID;
  v_id_pago      UUID;
  v_fecha_inicio  DATE := CURRENT_DATE;
  v_fecha_vence   DATE := CURRENT_DATE + p_duracion_dias;
BEGIN
  IF p_monto <= 0 THEN
    RAISE EXCEPTION 'monto_invalido: El monto debe ser mayor a 0';
  END IF;

  IF p_metodo_pago NOT IN ('tarjeta','transferencia','efectivo','yape','plin') THEN
    RAISE EXCEPTION 'metodo_invalido: Método de pago no reconocido';
  END IF;

  IF p_genero IS NOT NULL AND p_genero NOT IN ('M','F','Otro') THEN
    RAISE EXCEPTION 'genero_invalido: Género debe ser M, F u Otro';
  END IF;

  INSERT INTO gym.usuarios (
    id_usuario, email, nombre, telefono, documento, genero,
    id_gimnasio, rol, estado
  ) VALUES (
    p_auth_user_id, p_email, p_nombre, p_telefono, p_documento, p_genero,
    p_id_gimnasio, 'miembro', 'activo'
  );

  INSERT INTO gym.membresias (
    id_usuario, id_plan, fecha_inicio, fecha_vencimiento, estado
  ) VALUES (
    p_auth_user_id, p_id_plan, v_fecha_inicio, v_fecha_vence, 'activa'
  )
  RETURNING id_membresia INTO v_id_membresia;

  INSERT INTO gym.pagos (
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
  RETURN json_build_object(
    'ok',    false,
    'error', SQLERRM,
    'code',  SQLSTATE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_registrar_nuevo_miembro TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ BUG-3 reparado: rpc_registrar_nuevo_miembro apunta a gym.*'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_verificar_y_registrar_acceso(
  p_id_usuario  UUID,
  p_id_gimnasio UUID,
  p_tipo_acceso TEXT DEFAULT 'manual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_tiene_membresia BOOLEAN;
  v_id_acceso       UUID;
  v_razon           TEXT;
BEGIN
  IF p_tipo_acceso NOT IN ('qr','biometria','manual') THEN
    RAISE EXCEPTION 'tipo_acceso_invalido';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM gym.membresias
    WHERE id_usuario = p_id_usuario
      AND estado = 'activa'
      AND fecha_vencimiento >= CURRENT_DATE
  ) INTO v_tiene_membresia;

  IF NOT v_tiene_membresia THEN
    v_razon := 'Membresía inactiva o vencida';
  END IF;

  INSERT INTO gym.accesos (
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

GRANT EXECUTE ON FUNCTION public.rpc_verificar_y_registrar_acceso TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ BUG-4 reparado: rpc_verificar_y_registrar_acceso apunta a gym.*'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX BUG-5: log_audit_event — referenciar gym.usuarios explícitamente
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_accion      TEXT,
  p_entidad     TEXT,
  p_id_entidad  UUID  DEFAULT NULL,
  p_datos_antes JSONB DEFAULT NULL,
  p_datos_desp  JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_gym_id UUID;
  v_rol    TEXT;
BEGIN
  SELECT id_gimnasio, rol INTO v_gym_id, v_rol
    FROM gym.usuarios
   WHERE id_usuario = auth.uid()
   LIMIT 1;

  INSERT INTO audit_logs (
    id_gimnasio, id_actor, rol_actor,
    accion, entidad, id_entidad,
    datos_antes, datos_despues
  ) VALUES (
    v_gym_id, auth.uid(), v_rol,
    p_accion, p_entidad, p_id_entidad,
    p_datos_antes, p_datos_desp
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ BUG-5 reparado: log_audit_event apunta a gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX BUG-6: Políticas RLS de gym.clases con subquery FROM usuarios
-- Las políticas originales de 002 referencian `usuarios` (public), que ya no existe.
-- Se recrean con referencia explícita a gym.usuarios.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "clases_insert_staff"   ON gym.clases;
DROP POLICY IF EXISTS "clases_update_staff"   ON gym.clases;
DROP POLICY IF EXISTS "clases_delete_gerente" ON gym.clases;

CREATE POLICY "clases_insert_staff" ON gym.clases
  FOR INSERT WITH CHECK (
    public.get_user_rol() IN ('entrenador','gerente','admin') AND
    EXISTS (
      SELECT 1 FROM gym.usuarios u
       WHERE u.id_usuario  = auth.uid()
         AND u.id_gimnasio = clases.id_gimnasio
    )
  );

CREATE POLICY "clases_update_staff" ON gym.clases
  FOR UPDATE USING (
    public.get_user_rol() IN ('entrenador','gerente','admin') AND
    EXISTS (
      SELECT 1 FROM gym.usuarios u
       WHERE u.id_usuario  = auth.uid()
         AND u.id_gimnasio = clases.id_gimnasio
    )
  );

CREATE POLICY "clases_delete_gerente" ON gym.clases
  FOR DELETE USING (
    public.get_user_rol() IN ('gerente','admin') AND
    EXISTS (
      SELECT 1 FROM gym.usuarios u
       WHERE u.id_usuario  = auth.uid()
         AND u.id_gimnasio = clases.id_gimnasio
    )
  );

DO $$ BEGIN RAISE NOTICE '✅ BUG-6 reparado: políticas de gym.clases usan gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX BUG-7: Política accesos_insert_staff con subquery FROM usuarios
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "accesos_insert_staff" ON gym.accesos;

CREATE POLICY "accesos_insert_staff" ON gym.accesos
  FOR INSERT WITH CHECK (
    public.get_user_rol() IN ('recepcionista','gerente','admin') AND
    EXISTS (
      SELECT 1 FROM gym.usuarios u
       WHERE u.id_usuario  = auth.uid()
         AND u.id_gimnasio = accesos.id_gimnasio
    )
  );

DO $$ BEGIN RAISE NOTICE '✅ BUG-7 reparado: política accesos_insert_staff usa gym.usuarios'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX BUG-10: Mover audit_logs de public → gym
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE public.audit_logs SET SCHEMA gym;
    RAISE NOTICE '✅ BUG-10 reparado: audit_logs movida a schema gym';
  ELSE
    RAISE NOTICE 'ℹ️  audit_logs ya está en gym o no existe — omitido';
  END IF;
END $$;

-- Grants explícitos en audit_logs ya en gym
GRANT ALL ON gym.audit_logs TO postgres, service_role;
GRANT SELECT, INSERT ON gym.audit_logs TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- RE-APLICAR pasos 4-8 de 008 que fallaron por BUG-1 (2>/dev/null abortó 008)
-- Todos son idempotentes (ON CONFLICT DO NOTHING / IF NOT EXISTS / OR REPLACE)
-- ─────────────────────────────────────────────────────────────────────────────

-- Paso 4: Migrar codigos_acceso desde gimnasios.codigo_acceso (si aún no se hizo)
INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo)
SELECT id_gimnasio, codigo_acceso, 'general'
FROM gym.gimnasios
WHERE codigo_acceso IS NOT NULL
ON CONFLICT (codigo) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ 008-paso4 re-aplicado: códigos migrados de gimnasios.codigo_acceso'; END $$;

-- Paso 5: generate_gym_code actualizada para verificar en codigos_acceso
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
  v_base := upper(regexp_replace(p_nombre, '[^a-zA-Z]', '', 'g'));
  v_base := left(v_base, 4);
  IF length(v_base) < 2 THEN v_base := 'GYM'; END IF;

  LOOP
    v_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    v_code   := v_base || v_suffix;

    SELECT EXISTS(
      SELECT 1 FROM gym.codigos_acceso WHERE codigo = v_code
    ) INTO v_exists;

    EXIT WHEN NOT v_exists OR v_tries >= 20;
    v_tries := v_tries + 1;
  END LOOP;

  RETURN v_code;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ 008-paso5 re-aplicado: generate_gym_code() verifica en codigos_acceso'; END $$;

-- Paso 6: handle_new_user completo con todos los campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_nombre          TEXT;
  v_telefono        TEXT;
  v_documento       TEXT;
  v_fecha_nac       DATE;
  v_genero          TEXT;
  v_cargo           TEXT;
  v_foto_url        TEXT;
  v_rol             TEXT;
  v_gym_nombre      TEXT;
  v_gym_ruc         TEXT;
  v_gym_ciudad      TEXT;
  v_gym_pais        TEXT;
  v_gym_direccion   TEXT;
  v_gym_telefono    TEXT;
  v_gym_email       TEXT;
  v_gym_plan        TEXT;
  v_id_gimnasio     UUID;
  v_codigo          TEXT;
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

  IF v_gym_nombre IS NOT NULL THEN
    v_gym_ruc       := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ruc'),       '');
    v_gym_ciudad    := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
    v_gym_pais      := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_pais'),   ''), 'Perú');
    v_gym_direccion := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_direccion'),  '');
    v_gym_telefono  := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_telefono'),   '');
    v_gym_email     := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_email'),      '');
    v_gym_plan      := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan',    ''), 'mediano');

    v_codigo := public.generate_gym_code(v_gym_nombre);

    INSERT INTO gym.gimnasios (
      nombre, ruc, ciudad, pais, direccion, telefono, email,
      plan_suscripcion, estado
    )
    VALUES (
      v_gym_nombre, v_gym_ruc, v_gym_ciudad, v_gym_pais, v_gym_direccion,
      v_gym_telefono, v_gym_email, v_gym_plan, 'activo'
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    INSERT INTO gym.codigos_acceso (id_gimnasio, codigo, tipo, descripcion)
    VALUES (v_id_gimnasio, v_codigo, 'general', 'Código principal del gimnasio');

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

DO $$ BEGIN RAISE NOTICE '✅ 008-paso6 re-aplicado: handle_new_user completo con todos los campos'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_rpc_miembro  TEXT;
  v_rpc_acceso   TEXT;
  v_log_audit    TEXT;
  v_audit_schema TEXT;
BEGIN
  -- Verificar search_path de las funciones reparadas
  SELECT p.prosrc INTO v_rpc_miembro
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'rpc_registrar_nuevo_miembro';

  SELECT p.prosrc INTO v_rpc_acceso
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'rpc_verificar_y_registrar_acceso';

  -- Verificar esquema de audit_logs
  SELECT table_schema INTO v_audit_schema
  FROM information_schema.tables
  WHERE table_name = 'audit_logs';

  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  VERIFICACIÓN PARCHE 008b';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  rpc_registrar_nuevo_miembro : %',
    CASE WHEN v_rpc_miembro LIKE '%gym.usuarios%' THEN '✅ OK (gym.*)' ELSE '❌ AÚN ROTA' END;
  RAISE NOTICE '  rpc_verificar_y_registrar_acceso : %',
    CASE WHEN v_rpc_acceso LIKE '%gym.membresias%' THEN '✅ OK (gym.*)' ELSE '❌ AÚN ROTA' END;
  RAISE NOTICE '  audit_logs schema : %',
    CASE WHEN v_audit_schema = 'gym' THEN '✅ gym' ELSE '⚠️  ' || COALESCE(v_audit_schema, 'no existe') END;

  -- Verificar que las políticas de clases existen
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clases' AND policyname='clases_insert_staff') THEN
    RAISE NOTICE '  clases RLS policies : ✅ recreadas con gym.usuarios';
  ELSE
    RAISE NOTICE '  clases RLS policies : ❌ no encontradas';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='accesos' AND policyname='accesos_insert_staff') THEN
    RAISE NOTICE '  accesos RLS policies : ✅ recreadas con gym.usuarios';
  ELSE
    RAISE NOTICE '  accesos RLS policies : ❌ no encontradas';
  END IF;

  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  BD lista para migración 009.';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

-- ─── FIN MIGRACIÓN 008b ───────────────────────────────────────────────────────
