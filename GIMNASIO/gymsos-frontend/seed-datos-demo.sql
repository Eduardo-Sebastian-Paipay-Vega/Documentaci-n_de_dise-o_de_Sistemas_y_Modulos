-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Seed Datos Demo (DATOS REALES EN SUPABASE)
-- Ejecutar en: Supabase > SQL Editor  (después de supabase-schema.sql)
-- Incluye: staff, 10 miembros, clases, membresías, pagos, accesos, churn
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  -- Gimnasio (ya existe en schema seed)
  gym_id        UUID := '00000000-0000-0000-0000-000000000001';

  -- Planes (ya existen en schema seed)
  plan_basic    UUID := '00000000-0000-0000-0000-000000000010';
  plan_silver   UUID := '00000000-0000-0000-0000-000000000011';
  plan_gold     UUID := '00000000-0000-0000-0000-000000000012';
  plan_ent      UUID := '00000000-0000-0000-0000-000000000013';

  -- Staff
  recepcion_id   UUID := '00000000-0000-0000-0000-000000000002';
  entrenador_uid UUID := '00000000-0000-0000-0000-000000000003';
  entrenador_id  UUID := '00000000-0000-0000-0000-000000000003'; -- mismo UUID en entrenadores

  -- Miembros
  m01 UUID := '00000000-0000-0000-0000-000000000101';
  m02 UUID := '00000000-0000-0000-0000-000000000102';
  m03 UUID := '00000000-0000-0000-0000-000000000103';
  m04 UUID := '00000000-0000-0000-0000-000000000104';
  m05 UUID := '00000000-0000-0000-0000-000000000105';
  m06 UUID := '00000000-0000-0000-0000-000000000106';
  m07 UUID := '00000000-0000-0000-0000-000000000107';
  m08 UUID := '00000000-0000-0000-0000-000000000108';
  m09 UUID := '00000000-0000-0000-0000-000000000109';
  m10 UUID := '00000000-0000-0000-0000-000000000110';

  -- Clases
  clase01 UUID := '00000000-0000-0000-0000-000000000401';
  clase02 UUID := '00000000-0000-0000-0000-000000000402';
  clase03 UUID := '00000000-0000-0000-0000-000000000403';
  clase04 UUID := '00000000-0000-0000-0000-000000000404';
  clase05 UUID := '00000000-0000-0000-0000-000000000405';
  clase06 UUID := '00000000-0000-0000-0000-000000000406';

  hoy DATE := CURRENT_DATE;

BEGIN

-- ─── 1. AUTH.USERS — Staff ────────────────────────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
) VALUES
  (
    recepcion_id, '00000000-0000-0000-0000-000000000000',
    'recepcion@gymsos.io', crypt('recepcion123', gen_salt('bf')),
    NOW(), NOW() - INTERVAL '1 year', NOW(),
    '{"provider":"email","providers":["email"]}', '{}',
    FALSE, 'authenticated', 'authenticated'
  ),
  (
    entrenador_uid, '00000000-0000-0000-0000-000000000000',
    'entrenador@gymsos.io', crypt('entrenador123', gen_salt('bf')),
    NOW(), NOW() - INTERVAL '2 years', NOW(),
    '{"provider":"email","providers":["email"]}', '{}',
    FALSE, 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- ─── 2. AUTH.USERS — Miembros ─────────────────────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
) VALUES
  (m01,'00000000-0000-0000-0000-000000000000','carlos.mamani@gymsos.demo',   crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '8 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m02,'00000000-0000-0000-0000-000000000000','ana.flores@gymsos.demo',       crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '5 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m03,'00000000-0000-0000-0000-000000000000','luis.ccapa@gymsos.demo',       crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '3 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m04,'00000000-0000-0000-0000-000000000000','maria.gutierrez@gymsos.demo',  crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '11 months',NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m05,'00000000-0000-0000-0000-000000000000','jorge.condori@gymsos.demo',    crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '2 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m06,'00000000-0000-0000-0000-000000000000','rosa.chipana@gymsos.demo',     crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '7 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m07,'00000000-0000-0000-0000-000000000000','diego.vargas@gymsos.demo',     crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '4 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m08,'00000000-0000-0000-0000-000000000000','patricia.huanca@gymsos.demo',  crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '1 month',  NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m09,'00000000-0000-0000-0000-000000000000','roberto.apaza@gymsos.demo',    crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '9 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated'),
  (m10,'00000000-0000-0000-0000-000000000000','lucia.mamani@gymsos.demo',     crypt('demo1234',gen_salt('bf')),NOW(),NOW()-INTERVAL '6 months', NOW(),'{"provider":"email","providers":["email"]}','{}',FALSE,'authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;

-- ─── 3. USUARIOS — Perfiles de la tabla ──────────────────────────────────────

INSERT INTO usuarios (id_usuario, email, nombre, telefono, documento, genero, id_gimnasio, rol, estado, created_at)
VALUES
  (recepcion_id,  'recepcion@gymsos.io',          'María López Huanca',          '+51 934567890', '44332211', 'F', gym_id, 'recepcionista', 'activo', NOW()-INTERVAL '1 year'),
  (entrenador_uid,'entrenador@gymsos.io',          'Ana Torres Condori',          '+51 901234567', '11223344', 'F', gym_id, 'entrenador',    'activo', NOW()-INTERVAL '2 years'),
  (m01, 'carlos.mamani@gymsos.demo',   'Carlos Mamani Quispe',    '+51 987654321', '12345678', 'M', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '8 months'),
  (m02, 'ana.flores@gymsos.demo',      'Ana Flores Torres',       '+51 912345678', '87654321', 'F', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '5 months'),
  (m03, 'luis.ccapa@gymsos.demo',      'Luis Ccapa Rivera',       '+51 923456789', '23456789', 'M', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '3 months'),
  (m04, 'maria.gutierrez@gymsos.demo', 'María Gutierrez Huanca',  '+51 934561234', '34567890', 'F', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '11 months'),
  (m05, 'jorge.condori@gymsos.demo',   'Jorge Condori Mamani',    '+51 945678901', '45678901', 'M', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '2 months'),
  (m06, 'rosa.chipana@gymsos.demo',    'Rosa Chipana Ticona',     '+51 956789012', '56789012', 'F', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '7 months'),
  (m07, 'diego.vargas@gymsos.demo',    'Diego Vargas Soto',       '+51 967890123', '67890123', 'M', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '4 months'),
  (m08, 'patricia.huanca@gymsos.demo', 'Patricia Huanca Cruz',    '+51 978901234', '78901234', 'F', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '1 month'),
  (m09, 'roberto.apaza@gymsos.demo',   'Roberto Apaza Limachi',   '+51 989012345', '89012345', 'M', gym_id, 'miembro', 'inactivo',  NOW()-INTERVAL '9 months'),
  (m10, 'lucia.mamani@gymsos.demo',    'Lucía Mamani Flores',     '+51 990123456', '90123456', 'F', gym_id, 'miembro', 'activo',    NOW()-INTERVAL '6 months')
ON CONFLICT (id_usuario) DO NOTHING;

-- ─── 4. ENTRENADORES — Perfil profesional ────────────────────────────────────

INSERT INTO entrenadores (id_entrenador, id_usuario, especialidades, certificaciones, rating_promedio, total_clientes_activos, total_clases_dictadas)
VALUES (
  entrenador_id,
  entrenador_uid,
  'CrossFit, Yoga, Funcional, Spinning',
  'CrossFit Level 2, ACE Personal Trainer, RYT-200 Yoga',
  4.87,
  32,
  480
) ON CONFLICT (id_entrenador) DO NOTHING;

-- ─── 5. MEMBRESÍAS ────────────────────────────────────────────────────────────

INSERT INTO membresias (id_membresia, id_usuario, id_plan, fecha_inicio, fecha_vencimiento, estado)
VALUES
  ('00000000-0000-0000-0000-000000000301', m01, plan_gold,   hoy - 10,  hoy + 20, 'activa'),
  ('00000000-0000-0000-0000-000000000302', m02, plan_silver, hoy - 5,   hoy + 25, 'activa'),
  ('00000000-0000-0000-0000-000000000303', m03, plan_basic,  hoy - 15,  hoy + 15, 'activa'),
  ('00000000-0000-0000-0000-000000000304', m04, plan_gold,   hoy - 20,  hoy + 10, 'activa'),
  ('00000000-0000-0000-0000-000000000305', m05, plan_silver, hoy - 8,   hoy + 22, 'activa'),
  ('00000000-0000-0000-0000-000000000306', m06, plan_basic,  hoy - 25,  hoy + 5,  'activa'),
  ('00000000-0000-0000-0000-000000000307', m07, plan_gold,   hoy - 3,   hoy + 27, 'activa'),
  ('00000000-0000-0000-0000-000000000308', m08, plan_ent,    hoy - 1,   hoy + 29, 'activa'),
  ('00000000-0000-0000-0000-000000000309', m09, plan_basic,  hoy - 60,  hoy - 30, 'vencida'),
  ('00000000-0000-0000-0000-000000000310', m10, plan_silver, hoy - 12,  hoy + 3,  'activa')
ON CONFLICT (id_membresia) DO NOTHING;

-- ─── 6. PAGOS — Últimos 30 días ──────────────────────────────────────────────

INSERT INTO pagos (id_usuario, id_membresia, monto, moneda, metodo_pago, estado, descripcion, fecha_pago)
VALUES
  (m01, '00000000-0000-0000-0000-000000000301', 149.90, 'PEN', 'yape',          'completado', 'Membresía Gold Premium — Mayo 2026',   NOW() - INTERVAL '10 days'),
  (m02, '00000000-0000-0000-0000-000000000302', 109.90, 'PEN', 'tarjeta',       'completado', 'Membresía Silver — Mayo 2026',          NOW() - INTERVAL '5 days'),
  (m03, '00000000-0000-0000-0000-000000000303',  79.90, 'PEN', 'efectivo',      'completado', 'Membresía Basic — Mayo 2026',           NOW() - INTERVAL '15 days'),
  (m04, '00000000-0000-0000-0000-000000000304', 149.90, 'PEN', 'transferencia', 'completado', 'Membresía Gold Premium — Mayo 2026',   NOW() - INTERVAL '20 days'),
  (m05, '00000000-0000-0000-0000-000000000305', 109.90, 'PEN', 'plin',          'completado', 'Membresía Silver — Mayo 2026',          NOW() - INTERVAL '8 days'),
  (m06, '00000000-0000-0000-0000-000000000306',  79.90, 'PEN', 'efectivo',      'completado', 'Membresía Basic — Mayo 2026',           NOW() - INTERVAL '25 days'),
  (m07, '00000000-0000-0000-0000-000000000307', 149.90, 'PEN', 'yape',          'completado', 'Membresía Gold Premium — Mayo 2026',   NOW() - INTERVAL '3 days'),
  (m08, '00000000-0000-0000-0000-000000000308', 299.90, 'PEN', 'tarjeta',       'completado', 'Membresía Enterprise — Mayo 2026',     NOW() - INTERVAL '1 day'),
  (m10, '00000000-0000-0000-0000-000000000310', 109.90, 'PEN', 'yape',          'completado', 'Membresía Silver — Mayo 2026',          NOW() - INTERVAL '12 days'),
  -- Pagos de hoy (para el panel de recepcionista)
  (m03, NULL, 79.90,  'PEN', 'efectivo', 'completado', 'Renovación Basic',          NOW() - INTERVAL '2 hours'),
  (m05, NULL, 109.90, 'PEN', 'yape',     'completado', 'Renovación Silver',         NOW() - INTERVAL '1 hour'),
  (m08, NULL, 50.00,  'PEN', 'efectivo', 'completado', 'Clase privada personal',    NOW() - INTERVAL '30 minutes');

-- ─── 7. CLASES — Horario de hoy ──────────────────────────────────────────────

INSERT INTO clases (id_clase, id_gimnasio, id_entrenador, nombre, descripcion, capacidad_maxima, nivel, fecha_hora_inicio, duracion_minutos, recurrencia, dias_semana, estado)
VALUES
  (clase01, gym_id, entrenador_id, 'CrossFit Mañana',     'Alta intensidad funcional para todos los niveles',   20, 'intermedio',   (hoy || ' 06:00:00+05:00')::TIMESTAMPTZ, 60,  'semanal', 'Lun,Mar,Mie,Jue,Vie', 'programada'),
  (clase02, gym_id, entrenador_id, 'Yoga Flow',           'Yoga dinámico para flexibilidad y mindfulness',       15, 'principiante', (hoy || ' 08:00:00+05:00')::TIMESTAMPTZ, 60,  'semanal', 'Lun,Mie,Vie',         'programada'),
  (clase03, gym_id, entrenador_id, 'Spinning Power',      'Ciclismo indoor de alta energía',                    20, 'intermedio',   (hoy || ' 09:00:00+05:00')::TIMESTAMPTZ, 45,  'diaria',  NULL,                  'en_curso'),
  (clase04, gym_id, entrenador_id, 'Pilates Core',        'Fortalecimiento de core y postura',                   12, 'principiante', (hoy || ' 11:00:00+05:00')::TIMESTAMPTZ, 60,  'semanal', 'Mar,Jue,Sab',         'programada'),
  (clase05, gym_id, entrenador_id, 'Functional Training', 'Entrenamiento funcional con pesas y bandas',          25, 'avanzado',     (hoy || ' 18:00:00+05:00')::TIMESTAMPTZ, 60,  'semanal', 'Lun,Mar,Mie,Jue,Vie', 'programada'),
  (clase06, gym_id, entrenador_id, 'Zumba Night',         'Baile fitness, ritmos latinos, cardio divertido',     30, 'principiante', (hoy || ' 19:00:00+05:00')::TIMESTAMPTZ, 55,  'semanal', 'Mar,Jue',             'programada')
ON CONFLICT (id_clase) DO NOTHING;

-- ─── 8. INSCRIPCIONES ────────────────────────────────────────────────────────

INSERT INTO inscripciones (id_usuario, id_clase, estado)
VALUES
  (m01, clase01, 'inscrito'), (m02, clase01, 'inscrito'), (m04, clase01, 'inscrito'),
  (m06, clase01, 'inscrito'), (m07, clase01, 'inscrito'), (m10, clase01, 'inscrito'),
  (m01, clase02, 'inscrito'), (m02, clase02, 'inscrito'), (m03, clase02, 'inscrito'),
  (m05, clase02, 'inscrito'), (m08, clase02, 'inscrito'),
  (m01, clase03, 'asistio'),  (m02, clase03, 'asistio'),  (m03, clase03, 'asistio'),
  (m04, clase03, 'asistio'),  (m05, clase03, 'asistio'),  (m06, clase03, 'asistio'),
  (m07, clase03, 'asistio'),  (m08, clase03, 'asistio'),  (m10, clase03, 'asistio'),
  (m02, clase04, 'inscrito'), (m05, clase04, 'inscrito'), (m08, clase04, 'inscrito'),
  (m10, clase04, 'inscrito'),
  (m01, clase05, 'inscrito'), (m03, clase05, 'inscrito'), (m04, clase05, 'inscrito'),
  (m06, clase05, 'inscrito'), (m07, clase05, 'inscrito'),
  (m02, clase06, 'inscrito'), (m05, clase06, 'inscrito'), (m08, clase06, 'inscrito'),
  (m10, clase06, 'inscrito')
ON CONFLICT (id_usuario, id_clase) DO NOTHING;

-- ─── 9. ACCESOS — Últimas 24 horas ───────────────────────────────────────────

INSERT INTO accesos (id_usuario, id_gimnasio, fecha_hora_entrada, fecha_hora_salida, tipo_acceso, estado_acceso)
VALUES
  (m01, gym_id, NOW()-INTERVAL '8 hours',   NOW()-INTERVAL '7 hours',   'qr',     'permitido'),
  (m02, gym_id, NOW()-INTERVAL '7.5 hours', NOW()-INTERVAL '6.5 hours', 'qr',     'permitido'),
  (m03, gym_id, NOW()-INTERVAL '7 hours',   NOW()-INTERVAL '6 hours',   'manual', 'permitido'),
  (m04, gym_id, NOW()-INTERVAL '6.5 hours', NOW()-INTERVAL '5.5 hours', 'qr',     'permitido'),
  (m05, gym_id, NOW()-INTERVAL '6 hours',   NOW()-INTERVAL '5 hours',   'qr',     'permitido'),
  (m06, gym_id, NOW()-INTERVAL '5 hours',   NOW()-INTERVAL '4 hours',   'qr',     'permitido'),
  (m07, gym_id, NOW()-INTERVAL '4.5 hours', NOW()-INTERVAL '3.5 hours', 'qr',     'permitido'),
  (m08, gym_id, NOW()-INTERVAL '3 hours',   NULL,                        'qr',     'permitido'),
  (m10, gym_id, NOW()-INTERVAL '2.5 hours', NULL,                        'manual', 'permitido'),
  (m02, gym_id, NOW()-INTERVAL '2 hours',   NULL,                        'qr',     'permitido'),
  -- Acceso denegado (membresía vencida)
  (m09, gym_id, NOW()-INTERVAL '1 hour',    NULL,                        'qr',     'denegado');

-- ─── 10. CHURN PREDICTIONS — Miembros en riesgo ──────────────────────────────

INSERT INTO churn_predictions (id_usuario, probability_churn, score_riesgo, dias_para_abandono, razon_principal, ultima_sesion, fecha_prediccion)
VALUES
  (m10, 0.87, 87, 8,  'Sin visitas en 18 días, membresía vence en 3 días',              hoy - 18, NOW()),
  (m06, 0.71, 71, 15, 'Frecuencia de visitas bajó 60% en último mes',                   hoy - 12, NOW()),
  (m09, 0.95, 95, NULL, 'Membresía vencida hace 30 días, no ha renovado',               hoy - 35, NOW())
ON CONFLICT DO NOTHING;

END $$;

-- ─── VERIFICACIÓN FINAL ───────────────────────────────────────────────────────
SELECT 'usuarios'    AS tabla, COUNT(*) AS total FROM usuarios    UNION ALL
SELECT 'membresias',          COUNT(*) FROM membresias            UNION ALL
SELECT 'pagos',               COUNT(*) FROM pagos                 UNION ALL
SELECT 'clases',              COUNT(*) FROM clases                UNION ALL
SELECT 'inscripciones',       COUNT(*) FROM inscripciones         UNION ALL
SELECT 'accesos',             COUNT(*) FROM accesos               UNION ALL
SELECT 'churn_predictions',   COUNT(*) FROM churn_predictions
ORDER BY tabla;
