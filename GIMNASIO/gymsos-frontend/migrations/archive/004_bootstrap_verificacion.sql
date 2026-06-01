-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 004: Bootstrap de cuentas + Verificación de RLS
-- Fecha: 2026-05-30
-- Ejecutar en: Supabase SQL Editor (corre como postgres/service_role → bypasa RLS)
-- Prerequisito: migraciones 001, 002, 003 aplicadas
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- CONTEXTO:
--   El SQL Editor de Supabase corre como `postgres` (superusuario), lo que
--   BYPASA el RLS automáticamente. Esto nos permite crear la cuenta raíz sin
--   necesitar una sesión autenticada previa — resolviendo el bootstrap.
--
-- SOBRE EL RLS:
--   ✅ NO borrar el RLS — está correctamente configurado.
--   El RLS filtra por id_gimnasio usando get_user_gym() que consulta la tabla
--   `usuarios`. Solo los usuarios con una fila en `usuarios` pueden ver datos.
--   Un usuario de auth.users SIN fila en `usuarios` verá 0 datos (correcto).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — DIAGNÓSTICO: Ver el estado actual de la BD
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '=== DIAGNÓSTICO GYMSOS ===';
  RAISE NOTICE 'Fecha: %', NOW();
END $$;

-- ¿Qué hay en auth.users?
SELECT
  id,
  email,
  email_confirmed_at IS NOT NULL AS email_confirmado,
  created_at::date AS creado
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- ¿Qué hay en usuarios (tabla custom)?
SELECT
  u.id_usuario,
  u.email,
  u.nombre,
  u.rol,
  u.estado,
  g.nombre AS gimnasio,
  CASE
    WHEN au.id IS NOT NULL THEN '✅ auth OK'
    ELSE '❌ SIN auth.users'
  END AS estado_auth
FROM usuarios u
LEFT JOIN gimnasios g  ON g.id_gimnasio  = u.id_gimnasio
LEFT JOIN auth.users au ON au.id         = u.id_usuario
ORDER BY u.rol, u.email;

-- Usuarios en auth.users que NO tienen fila en usuarios (huérfanos)
SELECT
  au.id,
  au.email,
  '❌ NO está en tabla usuarios — no puede ver datos' AS problema
FROM auth.users au
LEFT JOIN usuarios u ON u.id_usuario = au.id
WHERE u.id_usuario IS NULL
  AND au.email NOT LIKE '%@example.com'
ORDER BY au.created_at DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — CREAR CUENTA GERENTE (gerente@gymsos.io)
-- El gerente@gymsos.io NUNCA fue creado en auth.users en los seeds anteriores.
-- Los seeds solo crearon: recepcionista, entrenador, 10 miembros, nutricionista,
-- cliente. El gerente era de crear via Dashboard. Lo creamos aquí directamente.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_gerente_id UUID := '00000000-0000-0000-0000-000000000006';
  v_gym_id     UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Crear en auth.users si no existe
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  SELECT
    v_gerente_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gerente@gymsos.io',
    crypt('gerente123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '1 year',
    NOW(),
    '', '', '', ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'gerente@gymsos.io'
  );

  IF FOUND THEN
    RAISE NOTICE '✅ gerente@gymsos.io creado en auth.users (UUID: %)', v_gerente_id;
  ELSE
    -- Si ya existe, obtener su UUID real
    SELECT id INTO v_gerente_id FROM auth.users WHERE email = 'gerente@gymsos.io';
    RAISE NOTICE 'ℹ️  gerente@gymsos.io ya existía en auth.users (UUID: %)', v_gerente_id;
  END IF;

  -- Crear en tabla usuarios si no existe
  INSERT INTO usuarios (
    id_usuario, email, nombre, id_gimnasio, rol, estado
  )
  SELECT
    au.id,
    'gerente@gymsos.io',
    'Carlos Ramos Gerente',
    v_gym_id,
    'gerente',
    'activo'
  FROM auth.users au
  WHERE au.email = 'gerente@gymsos.io'
  ON CONFLICT (id_usuario) DO UPDATE SET
    rol    = 'gerente',
    estado = 'activo';

  RAISE NOTICE '✅ gerente@gymsos.io registrado en tabla usuarios';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — CREAR CUENTA PERSONAL DE EDUARDO (si tiene auth.users ya creado)
-- seed-mi-cuenta.sql requiere que la cuenta de Google/Email ya exista en auth.
-- Este bloque la conecta automáticamente si fue creada via Dashboard o signup.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_gym_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Intentar conectar la cuenta de Eduardo si existe en auth.users
  INSERT INTO usuarios (
    id_usuario, email, nombre, id_gimnasio, rol, estado
  )
  SELECT
    au.id,
    au.email,
    'Eduardo Sebastian Paipay Vega',
    v_gym_id,
    'gerente',
    'activo'
  FROM auth.users au
  WHERE au.email = 'paipayvegabastian@gmail.com'
  ON CONFLICT (id_usuario) DO UPDATE SET
    rol    = 'gerente',
    estado = 'activo';

  IF FOUND THEN
    RAISE NOTICE '✅ Cuenta personal de Eduardo conectada como gerente';
  ELSE
    RAISE NOTICE 'ℹ️  paipayvegabastian@gmail.com aún no existe en auth.users';
    RAISE NOTICE '   → Ve a Supabase Dashboard > Authentication > Users > "Add User"';
    RAISE NOTICE '   → Crea con email: paipayvegabastian@gmail.com';
    RAISE NOTICE '   → Luego ejecuta esta migración de nuevo';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — VERIFICACIÓN DE TENANT ISOLATION (RLS)
-- Prueba que el RLS funciona correctamente desde SQL (simulando como si fuera
-- un usuario autenticado usando SET LOCAL).
-- ─────────────────────────────────────────────────────────────────────────────

-- Test A: get_user_gym() y get_user_rol() funcionan para el gerente
DO $$
DECLARE
  v_gerente_id UUID;
  v_gym_result UUID;
  v_rol_result TEXT;
BEGIN
  SELECT id INTO v_gerente_id FROM auth.users WHERE email = 'gerente@gymsos.io';

  IF v_gerente_id IS NULL THEN
    RAISE NOTICE '❌ gerente@gymsos.io no encontrado en auth.users';
    RETURN;
  END IF;

  -- Simular como si auth.uid() = gerente_id
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_gerente_id::text)::text,
    TRUE
  );

  SELECT get_user_gym() INTO v_gym_result;
  SELECT get_user_rol() INTO v_rol_result;

  IF v_gym_result IS NOT NULL AND v_rol_result = 'gerente' THEN
    RAISE NOTICE '✅ RLS OK — gerente ve su gym (%) con rol (%)', v_gym_result, v_rol_result;
  ELSE
    RAISE NOTICE '❌ RLS FALLA — gym=%, rol=%', v_gym_result, v_rol_result;
    RAISE NOTICE '   Causa probable: usuario no está en tabla usuarios';
  END IF;
END $$;

-- Test B: Contar cuántos registros ve cada tabla para el gerente
DO $$
DECLARE
  v_gerente_id UUID;
  v_cnt_usuarios   INT;
  v_cnt_membresias INT;
  v_cnt_pagos      INT;
  v_cnt_accesos    INT;
  v_cnt_clases     INT;
BEGIN
  SELECT id INTO v_gerente_id FROM auth.users WHERE email = 'gerente@gymsos.io';

  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_gerente_id::text)::text,
    TRUE
  );

  -- Contar registros visibles CON RLS activo
  SELECT COUNT(*) INTO v_cnt_usuarios   FROM usuarios;
  SELECT COUNT(*) INTO v_cnt_membresias FROM membresias;
  SELECT COUNT(*) INTO v_cnt_pagos      FROM pagos;
  SELECT COUNT(*) INTO v_cnt_accesos    FROM accesos;
  SELECT COUNT(*) INTO v_cnt_clases     FROM clases;

  RAISE NOTICE '=== DATOS VISIBLES PARA GERENTE (con RLS) ===';
  RAISE NOTICE '  usuarios:   % filas', v_cnt_usuarios;
  RAISE NOTICE '  membresias: % filas', v_cnt_membresias;
  RAISE NOTICE '  pagos:      % filas', v_cnt_pagos;
  RAISE NOTICE '  accesos:    % filas', v_cnt_accesos;
  RAISE NOTICE '  clases:     % filas', v_cnt_clases;

  IF v_cnt_usuarios = 0 THEN
    RAISE NOTICE '⚠️  0 usuarios visibles → los seeds no han sido aplicados aún';
    RAISE NOTICE '   Ejecuta seed-datos-demo.sql para poblar datos de prueba';
  ELSE
    RAISE NOTICE '✅ Tenant isolation OK — gerente ve % usuarios de su gimnasio', v_cnt_usuarios;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — TABLA DE CUENTAS LISTAS PARA USAR
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.email,
  u.nombre,
  u.rol,
  u.estado,
  CASE
    WHEN au.id IS NOT NULL AND au.email_confirmed_at IS NOT NULL
      THEN '✅ Lista para login'
    WHEN au.id IS NOT NULL AND au.email_confirmed_at IS NULL
      THEN '⚠️  Necesita confirmar email'
    ELSE '❌ Sin auth.users — no puede hacer login'
  END AS estado_login,
  '→ ' || u.email || ' / [ver abajo]' AS credenciales
FROM usuarios u
LEFT JOIN auth.users au ON au.id = u.id_usuario
WHERE u.id_gimnasio = '00000000-0000-0000-0000-000000000001'
ORDER BY
  CASE u.rol
    WHEN 'gerente'       THEN 1
    WHEN 'recepcionista' THEN 2
    WHEN 'entrenador'    THEN 3
    WHEN 'nutricionista' THEN 4
    WHEN 'miembro'       THEN 5
    WHEN 'cliente'       THEN 6
    ELSE 7
  END,
  u.email;

-- ─────────────────────────────────────────────────────────────────────────────
-- CONTRASEÑAS PARA LAS CUENTAS CREADAS POR SEEDS
-- ─────────────────────────────────────────────────────────────────────────────
/*
  CUENTA                        CONTRASEÑA      ROL
  gerente@gymsos.io             gerente123      gerente
  recepcion@gymsos.io           recepcion123    recepcionista
  entrenador@gymsos.io          entrenador123   entrenador
  nutricion@gymsos.io           nutricion123    nutricionista
  cliente@gymsos.io             cliente123      cliente
  carlos.mamani@gymsos.demo     demo1234        miembro
  ana.flores@gymsos.demo        demo1234        miembro
  (todos los .demo usan demo1234)

  NOTA: Si alguna cuenta muestra "⚠️ Necesita confirmar email":
    Supabase Dashboard > Authentication > Users > click en el usuario > "Confirm email"
*/

-- ─── FIN MIGRACIÓN 004 ────────────────────────────────────────────────────────
