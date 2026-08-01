-- ═══════════════════════════════════════════════════════════════════════════════
-- DIAGNÓSTICO: Checklist de debugging del trigger handle_new_user
-- Fecha: 2026-06-03
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- NO ES UNA MIGRACIÓN — es un script de diagnóstico. No modifica datos.
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Ejecutar sección por sección para identificar dónde falla la cadena:
--   auth.users → public.profiles → gym.usuarios → public.profiles.tenant_id
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 1: ¿El trigger existe y está activo?
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Esperado: 1 fila con event_object_table='users', action_timing='AFTER'
-- Si 0 filas → el trigger no existe. Ejecutar handle_new_user() + CREATE TRIGGER.

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 2: ¿La función handle_new_user está actualizada? (debe ser migr-017)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  proname,
  prosecdef AS security_definer,
  -- Verificar que contiene los 3 fixes de migr-017
  pg_get_functiondef(oid) LIKE '%c.tenant_id = v_gym_tenant%' AS tiene_v1_tenant_filter,
  pg_get_functiondef(oid) LIKE '%USER_INVITE%'                AS tiene_v4_type_filter,
  pg_get_functiondef(oid) LIKE '%FOR UPDATE OF c%'            AS tiene_v3_for_update
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Esperado: security_definer=true, los 3 booleanos = true.
-- Si alguno es false → la migración 017 no se ejecutó correctamente.

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 3: Para un email específico — ¿existe en auth.users?
-- ─────────────────────────────────────────────────────────────────────────────

-- Reemplazar 'email@ejemplo.com' con el email del usuario problemático
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data->>'nombre'       AS meta_nombre,
  raw_user_meta_data->>'id_gimnasio'  AS meta_id_gimnasio,
  raw_user_meta_data->>'gym_nombre'   AS meta_gym_nombre,
  raw_user_meta_data->>'staff_code'   AS meta_staff_code,
  raw_user_meta_data->>'rol'          AS meta_rol
FROM auth.users
WHERE email = 'email@ejemplo.com';

-- Esperado: 1 fila.
-- Si 0 filas → el usuario no existe en auth.users. Verificar el signUp.
-- Revisar meta_id_gimnasio: debe ser un UUID válido (CASO B) o NULL + meta_gym_nombre (CASO A).

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 4: ¿El usuario tiene fila en public.profiles?
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  p.id,
  p.full_name,
  p.tenant_id,
  p.avatar_url,
  t.industry_type_id AS tenant_industry_type,
  t.name             AS tenant_name
FROM public.profiles p
LEFT JOIN public.tenants t ON t.id = p.tenant_id
WHERE p.id = (SELECT id FROM auth.users WHERE email = 'email@ejemplo.com');

-- Esperado: 1 fila con full_name poblado.
-- Si 0 filas → el INSERT de profiles en handle_new_user falló.
--   Causa probable: public.profiles tiene columnas NOT NULL sin default no cubiertos por el trigger.
--   Verificar con: \d public.profiles

-- Si tenant_id IS NULL → el UPDATE profiles SET tenant_id no se ejecutó.
--   Para CASO A: el INSERT de gym.gimnasios falló antes del UPDATE.
--   Para CASO B: gym.gimnasios.tenant_id es NULL (no se corrió migr-015b).

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 5: ¿El usuario tiene fila en gym.usuarios?
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.id_usuario,
  u.email,
  u.nombre,
  u.rol,
  u.estado,
  u.id_gimnasio,
  g.nombre AS gimnasio_nombre,
  g.tenant_id AS gym_tenant_id
FROM gym.usuarios u
LEFT JOIN gym.gimnasios g ON g.id_gimnasio = u.id_gimnasio
WHERE u.id_usuario = (SELECT id FROM auth.users WHERE email = 'email@ejemplo.com');

-- Esperado: 1 fila con id_gimnasio y gym_tenant_id poblados.
-- Si 0 filas → el INSERT en gym.usuarios falló.
--   Causas probables:
--   a) id_gimnasio en raw_user_meta_data no existe en gym.gimnasios (FK violation)
--   b) El bloque EXCEPTION WHEN OTHERS atrapó el error silenciosamente
--   c) Constraint UNIQUE en id_usuario ya tenía esa fila de un signup previo

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 6: ¿El gymnasium al que se unió existe y tiene tenant_id?
-- ─────────────────────────────────────────────────────────────────────────────

-- Reemplazar con el UUID del gimnasio
SELECT
  id_gimnasio,
  nombre,
  estado,
  tenant_id,
  plan_suscripcion,
  created_at
FROM gym.gimnasios
WHERE id_gimnasio = 'UUID-DEL-GIMNASIO-AQUI';

-- Esperado: 1 fila con tenant_id NOT NULL.
-- Si tenant_id IS NULL → migr-015b no se ejecutó o el gimnasio fue creado antes.
--   FIX: ejecutar migr-015b para backfill del tenant_id.

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 7: ¿Hay errores recientes del trigger en los logs de Supabase?
-- ─────────────────────────────────────────────────────────────────────────────

-- Esto NO se puede ver desde SQL. Para verlos:
-- Supabase Dashboard → Settings → Logs → API / Auth
-- Buscar: "handle_new_user FALLÓ" (el RAISE WARNING del bloque EXCEPTION WHEN OTHERS)

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 8: Diagnóstico completo para todos los usuarios recientes
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NOT NULL       THEN '✅' ELSE '❌ FALTA' END AS tiene_profile,
  CASE WHEN p.tenant_id IS NOT NULL THEN '✅' ELSE '⚠️ NULL'  END AS profile_tenant_id,
  t.industry_type_id                                              AS industry_type,
  CASE WHEN gu.id_usuario IS NOT NULL THEN '✅' ELSE '❌ FALTA' END AS tiene_gym_usuario,
  gu.rol                                                          AS gym_rol
FROM auth.users u
LEFT JOIN public.profiles p  ON p.id  = u.id
LEFT JOIN public.tenants  t  ON t.id  = p.tenant_id
LEFT JOIN gym.usuarios    gu ON gu.id_usuario = u.id
ORDER BY u.created_at DESC
LIMIT 20;

-- Este query muestra el estado de cada usuario en las 3 capas.
-- Filas ideales: tiene_profile=✅, profile_tenant_id=✅ (gym), tiene_gym_usuario=✅
-- Filas problemáticas:
--   tiene_gym_usuario=❌ FALTA → el trigger falló en la inserción de gym.usuarios
--   profile_tenant_id=⚠️ NULL  → el trigger falló en el UPDATE de profiles.tenant_id
--   tiene_profile=❌ FALTA     → el trigger falló desde el inicio (INSERT profiles)

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 9: Fix manual para usuario huérfano (gym.usuarios faltante)
-- ─────────────────────────────────────────────────────────────────────────────
-- Si CHECK 5 devuelve 0 filas y CHECK 4 muestra que el perfil existe:
-- El usuario tiene auth.users + public.profiles pero NO gym.usuarios.
-- INSERT manual (ajustar valores según el usuario real):

/*
INSERT INTO gym.usuarios (
  id_usuario, email, nombre, id_gimnasio, rol, estado
)
SELECT
  u.id,
  u.email,
  COALESCE(p.full_name, split_part(u.email, '@', 1)),
  'UUID-DEL-GIMNASIO',   -- id_gimnasio correcto
  'miembro',             -- rol apropiado
  'activo'
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'email@ejemplo.com'
ON CONFLICT (id_usuario) DO NOTHING;

-- Luego vincular el tenant_id en profiles si falta:
UPDATE public.profiles p
   SET tenant_id = g.tenant_id
  FROM gym.gimnasios g
 WHERE g.id_gimnasio = 'UUID-DEL-GIMNASIO'
   AND p.id = (SELECT id FROM auth.users WHERE email = 'email@ejemplo.com')
   AND p.tenant_id IS NULL;
*/
