-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 007: Onboarding de dueños de gimnasio
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA QUE RESUELVE:
--   /signup requiere un código de gym existente → solo sirve para miembros.
--   Un dueño nuevo necesita crear su gym + cuenta gerente en un solo paso.
--
-- SOLUCIÓN:
--   Actualizar handle_new_user para detectar metadatos de onboarding.
--   Si el signup incluye `gym_nombre`, el trigger crea el gym automáticamente
--   y asigna al usuario como gerente. Sin service role key. Sin RPC extra.
--
-- FLUJO RESULTANTE:
--   /onboarding → signUp({ data: { gym_nombre, gym_ciudad, rol:'gerente' } })
--              → trigger crea gym.gimnasios + gym.usuarios (gerente)
--              → usuario puede hacer login inmediatamente
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Función helper para generar código de acceso único
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
  -- Base: primeras 4 letras del nombre en mayúsculas (solo letras)
  v_base := upper(regexp_replace(p_nombre, '[^a-zA-Z]', '', 'g'));
  v_base := left(v_base, 4);
  IF length(v_base) < 2 THEN v_base := 'GYM'; END IF;

  -- Intentar hasta 10 veces con sufijo random
  LOOP
    v_code   := v_base || upper(substr(md5(random()::text), 1, 4));
    SELECT EXISTS (
      SELECT 1 FROM gym.gimnasios WHERE codigo_acceso = v_code
    ) INTO v_exists;

    EXIT WHEN NOT v_exists OR v_tries >= 10;
    v_tries := v_tries + 1;
  END LOOP;

  RETURN v_code;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Actualizar handle_new_user con soporte para onboarding
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public
AS $$
DECLARE
  v_id_gimnasio UUID;
  v_nombre      TEXT;
  v_rol         TEXT;
  v_telefono    TEXT;
  v_gym_nombre  TEXT;
  v_gym_ciudad  TEXT;
  v_gym_plan    TEXT;
  v_codigo      TEXT;
BEGIN
  -- ── Leer metadatos del signup ──────────────────────────────────────────────
  v_nombre     := COALESCE(
                    NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'), ''),
                    split_part(NEW.email, '@', 1)
                  );
  v_rol        := COALESCE(NULLIF(NEW.raw_user_meta_data->>'rol', ''), 'miembro');
  v_telefono   := NULLIF(TRIM(NEW.raw_user_meta_data->>'telefono'), '');
  v_gym_nombre := NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_nombre'), '');
  v_gym_ciudad := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'gym_ciudad'), ''), 'Lima');
  v_gym_plan   := COALESCE(NULLIF(NEW.raw_user_meta_data->>'gym_plan', ''), 'mediano');

  -- ── CASO A: Onboarding de dueño (tiene gym_nombre en metadata) ────────────
  IF v_gym_nombre IS NOT NULL THEN
    -- Generar código de acceso único
    v_codigo := public.generate_gym_code(v_gym_nombre);

    -- Crear el gimnasio
    INSERT INTO gym.gimnasios (
      nombre, ciudad, plan_suscripcion, estado, codigo_acceso
    )
    VALUES (
      v_gym_nombre, v_gym_ciudad, v_gym_plan, 'activo', v_codigo
    )
    RETURNING id_gimnasio INTO v_id_gimnasio;

    -- Crear perfil como gerente
    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_id_gimnasio, 'gerente', 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

    RAISE LOG 'handle_new_user [ONBOARDING]: gym "%" creado (id: %, codigo: %) para %',
              v_gym_nombre, v_id_gimnasio, v_codigo, NEW.email;

  -- ── CASO B: Signup de miembro/staff (tiene id_gimnasio existente) ──────────
  ELSIF NEW.raw_user_meta_data->>'id_gimnasio' IS NOT NULL THEN
    v_id_gimnasio := (NEW.raw_user_meta_data->>'id_gimnasio')::uuid;

    INSERT INTO gym.usuarios (
      id_usuario, email, nombre, telefono, id_gimnasio, rol, estado
    )
    VALUES (
      NEW.id, NEW.email, v_nombre, v_telefono, v_id_gimnasio, v_rol, 'activo'
    )
    ON CONFLICT (id_usuario) DO NOTHING;

    RAISE LOG 'handle_new_user [SIGNUP]: % registrado en gym % como %',
              NEW.email, v_id_gimnasio, v_rol;

  -- ── CASO C: Signup manual desde Dashboard (sin metadata) ──────────────────
  ELSE
    RAISE LOG 'handle_new_user [MANUAL]: % sin metadata de gym — perfil omitido', NEW.email;
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ handle_new_user actualizado con soporte onboarding'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Verificación: simular qué código generaría para "Mi Gimnasio"
-- ─────────────────────────────────────────────────────────────────────────────
SELECT public.generate_gym_code('CrossFit Lima') AS ejemplo_codigo_crossfit;
SELECT public.generate_gym_code('Mi Gimnasio')   AS ejemplo_codigo_migi;
SELECT public.generate_gym_code('Fitness Center') AS ejemplo_codigo_fitness;

DO $$
BEGIN
  RAISE NOTICE '✅ Migración 007 completada.';
  RAISE NOTICE '   /onboarding puede crear gyms nuevos via trigger.';
  RAISE NOTICE '   /signup sigue funcionando para miembros de gyms existentes.';
END $$;

-- ─── FIN MIGRACIÓN 007 ────────────────────────────────────────────────────────
