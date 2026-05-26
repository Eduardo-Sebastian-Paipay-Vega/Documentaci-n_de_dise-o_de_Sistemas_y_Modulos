-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Seed: Roles adicionales (nutricionista + cliente)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de seed-datos-demo.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Crear cuentas en auth.users ──────────────────────────────────────────

-- Nutricionista
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'nutricion@gymsos.io',
  crypt('nutricion123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'nutricion@gymsos.io'
);

-- Cliente (miembro con rol "cliente")
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'cliente@gymsos.io',
  crypt('cliente123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'cliente@gymsos.io'
);

-- ── 2. Crear registros en tabla usuarios ────────────────────────────────────

INSERT INTO usuarios (id_usuario, email, nombre, telefono, documento, genero, id_gimnasio, rol, estado)
VALUES
  (
    '00000000-0000-0000-0000-000000000004',
    'nutricion@gymsos.io',
    'Sofía Ramos Paredes',
    '+51 945 678 901',
    '55443322',
    'F',
    '00000000-0000-0000-0000-000000000001',
    'nutricionista',
    'activo'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'cliente@gymsos.io',
    'Lucia Mendoza Torres',
    '+51 955 123 456',
    '66554433',
    'F',
    '00000000-0000-0000-0000-000000000001',
    'cliente',
    'activo'
  )
ON CONFLICT (id_usuario) DO UPDATE SET
  rol    = EXCLUDED.rol,
  estado = EXCLUDED.estado;

-- ── 3. Membresía activa para el cliente ────────────────────────────────────

INSERT INTO membresias (
  id_membresia, id_usuario, id_plan, id_gimnasio,
  fecha_inicio, fecha_vencimiento, estado
)
SELECT
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000005',
  id_plan,
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days',
  'activa'
FROM planes
WHERE nombre ILIKE '%silver%'
  AND id_gimnasio = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT (id_membresia) DO NOTHING;

-- ── 4. Verificar ────────────────────────────────────────────────────────────

SELECT
  u.email,
  u.nombre,
  u.rol,
  u.estado,
  COALESCE(m.estado, 'sin membresía') AS membresia
FROM usuarios u
LEFT JOIN membresias m ON m.id_usuario = u.id_usuario AND m.estado = 'activa'
WHERE u.email IN ('nutricion@gymsos.io', 'cliente@gymsos.io');
