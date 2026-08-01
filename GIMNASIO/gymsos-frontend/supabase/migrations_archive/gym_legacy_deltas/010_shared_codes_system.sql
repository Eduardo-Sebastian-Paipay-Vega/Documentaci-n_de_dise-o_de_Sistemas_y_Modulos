-- ═══════════════════════════════════════════════════════════════════════════════
-- BD Maestra — Migración 010: Sistema de Códigos Genérico (Shared Core)
-- Fecha: 2026-06-01
-- Schema: public (transversal — todos los módulos lo usan)
-- Ejecutar en: Supabase SQL Editor (como postgres/service_role)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ARQUITECTURA:
--   public.codes        → tabla central de códigos (multi-tenant, multi-módulo)
--   public.code_usages  → auditoría de cada uso (trazabilidad completa)
--   public.cat_code_types → catálogo extensible de tipos
--
-- CASOS DE USO:
--   GYM_ACCESS      → invitaciones de gimnasio (/signup con código)
--   GYM_PROMO       → cupones descuento en gym
--   USER_INVITE     → invitación de usuarios a la plataforma
--   ACCOUNT_ACTIVATE → activación de cuenta por email
--   PASSWORD_RESET  → recuperación de contraseña
--   TEMP_ACCESS     → acceso temporal a cualquier recurso
--   LICENSE         → licencias de software SaaS
--   DOCUMENT_VERIFY → validación de documentos
--   EDU_ENROLL      → matrícula/inscripción educativa (futuro módulo)
--   COUPON          → cupones genéricos
--
-- RPCs EXPUESTAS:
--   fn_validate_code(code, type_id?, tenant_id?)  → valida sin consumir (anon/auth)
--   fn_use_code(code, module_name, ...)            → valida + consume + audita
--   fn_create_code(tenant_id, type_id, ...)        → genera código para un tenant
--   fn_revoke_code(code_id, reason?)               → revoca un código
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1 — Catálogo de tipos de código
-- Extensible sin modificar la estructura de codes.
-- public_lookup = true → anon puede verificar este tipo (ej: GYM_ACCESS para signup)
-- public_lookup = false → solo authenticated/service_role puede consultar (ej: PASSWORD_RESET)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cat_code_types (
  id            TEXT        PRIMARY KEY,
  description   TEXT        NOT NULL,
  module        TEXT        NOT NULL DEFAULT 'core',
  public_lookup BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.cat_code_types (id, description, module, public_lookup) VALUES
  ('GYM_ACCESS',        'Código de acceso a gimnasio',                'gym',  TRUE),
  ('GYM_PROMO',         'Código promocional de gimnasio',             'gym',  TRUE),
  ('USER_INVITE',       'Invitación de usuario a la plataforma',      'core', FALSE),
  ('ACCOUNT_ACTIVATE',  'Activación de cuenta por correo',            'core', FALSE),
  ('PASSWORD_RESET',    'Recuperación de contraseña',                 'core', FALSE),
  ('TEMP_ACCESS',       'Acceso temporal a un recurso',               'core', TRUE),
  ('LICENSE',           'Licencia de software SaaS',                  'core', FALSE),
  ('DOCUMENT_VERIFY',   'Validación de documento oficial',            'core', FALSE),
  ('EDU_ENROLL',        'Matricula / inscripcion educativa',          'edu',  TRUE),
  ('COUPON',            'Cupón de descuento genérico',                'core', TRUE)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ PASO 1: cat_code_types lista con 10 tipos'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2 — Tabla principal: public.codes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.codes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code          TEXT        NOT NULL,
  type_id       TEXT        NOT NULL REFERENCES public.cat_code_types(id),
  description   TEXT,

  -- Control de ciclo de vida
  status        TEXT        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','used','expired','revoked','suspended')),
  max_uses      INT         CHECK (max_uses IS NULL OR max_uses > 0),  -- NULL = ilimitado
  current_uses  INT         NOT NULL DEFAULT 0 CHECK (current_uses >= 0),
  expires_at    TIMESTAMPTZ,                                            -- NULL = sin expiración

  -- Datos flexibles por módulo (sin alterar estructura)
  metadata      JSONB       NOT NULL DEFAULT '{}',

  -- Trazabilidad
  created_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un código es único por tenant (distintos tenants pueden tener el mismo código)
  UNIQUE (tenant_id, code)
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_codes_tenant          ON public.codes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_codes_code            ON public.codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_type            ON public.codes(type_id);
CREATE INDEX IF NOT EXISTS idx_codes_status_active   ON public.codes(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_codes_tenant_type     ON public.codes(tenant_id, type_id);
CREATE INDEX IF NOT EXISTS idx_codes_expires         ON public.codes(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_codes_lookup          ON public.codes(code, status) WHERE status = 'active';

-- Trigger updated_at automático
CREATE OR REPLACE FUNCTION public.fn_codes_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS tr_codes_updated_at ON public.codes;
CREATE TRIGGER tr_codes_updated_at
  BEFORE UPDATE ON public.codes
  FOR EACH ROW EXECUTE FUNCTION public.fn_codes_set_updated_at();

DO $$ BEGIN RAISE NOTICE '✅ PASO 2: public.codes creada con índices y trigger updated_at'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3 — Tabla de auditoría: public.code_usages
-- Registro inmutable de cada vez que un código fue consumido.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.code_usages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id      UUID        NOT NULL REFERENCES public.codes(id) ON DELETE CASCADE,
  tenant_id    UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  used_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  module_name  TEXT        NOT NULL,           -- 'gym', 'edu', 'core', etc.
  observations TEXT,
  ip_address   INET,
  metadata     JSONB       NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_code_usages_code_id  ON public.code_usages(code_id);
CREATE INDEX IF NOT EXISTS idx_code_usages_tenant   ON public.code_usages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_code_usages_used_by  ON public.code_usages(used_by);
CREATE INDEX IF NOT EXISTS idx_code_usages_used_at  ON public.code_usages(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_usages_module   ON public.code_usages(module_name);

DO $$ BEGIN RAISE NOTICE '✅ PASO 3: public.code_usages creada con índices'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4 — RLS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_usages ENABLE ROW LEVEL SECURITY;

-- ── public.codes ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "codes_public_lookup"  ON public.codes;
DROP POLICY IF EXISTS "codes_tenant_select"  ON public.codes;
DROP POLICY IF EXISTS "codes_tenant_write"   ON public.codes;

-- Anon puede ver códigos activos de tipos marcados como public_lookup = true
-- (ej: GYM_ACCESS para que usuarios no autenticados validen un código al registrarse)
CREATE POLICY "codes_public_lookup" ON public.codes
  FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.cat_code_types ct
       WHERE ct.id = codes.type_id AND ct.public_lookup = TRUE
    )
  );

-- Usuarios autenticados ven todos los códigos de su tenant (incluso no públicos)
CREATE POLICY "codes_tenant_select" ON public.codes
  FOR SELECT
  USING (tenant_id = public.fn_current_tenant_id());

-- Write: solo dentro del propio tenant
CREATE POLICY "codes_tenant_write" ON public.codes
  FOR ALL
  USING (tenant_id = public.fn_current_tenant_id());

-- ── public.code_usages ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "code_usages_tenant" ON public.code_usages;

CREATE POLICY "code_usages_tenant" ON public.code_usages
  FOR ALL
  USING (tenant_id = public.fn_current_tenant_id());

DO $$ BEGIN RAISE NOTICE '✅ PASO 4: RLS habilitado en codes y code_usages'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5 — Grants
-- ─────────────────────────────────────────────────────────────────────────────

GRANT SELECT ON public.cat_code_types              TO anon, authenticated;
GRANT SELECT ON public.codes                       TO anon;  -- limitado por RLS
GRANT ALL    ON public.codes, public.code_usages   TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.codes       TO authenticated;
GRANT SELECT, INSERT ON public.code_usages         TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ PASO 5: Grants aplicados'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6 — RPC: fn_validate_code
-- Valida un código sin consumirlo. Segura para llamar desde el frontend.
-- Disponible para anon (signup lookup) y authenticated.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_validate_code(
  p_code      TEXT,
  p_type_id   TEXT  DEFAULT NULL,
  p_tenant_id UUID  DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.codes;
BEGIN
  SELECT * INTO v_row
  FROM public.codes
  WHERE code    = upper(trim(p_code))
    AND status  = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    AND (p_type_id   IS NULL OR type_id   = p_type_id)
    AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
  LIMIT 1;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid',  false,
      'reason', 'Código inválido, expirado o inactivo'
    );
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.current_uses >= v_row.max_uses THEN
    RETURN jsonb_build_object(
      'valid',  false,
      'reason', 'Límite de usos alcanzado'
    );
  END IF;

  RETURN jsonb_build_object(
    'valid',          true,
    'code_id',        v_row.id,
    'tenant_id',      v_row.tenant_id,
    'type_id',        v_row.type_id,
    'description',    v_row.description,
    'remaining_uses', CASE
                        WHEN v_row.max_uses IS NULL THEN NULL
                        ELSE v_row.max_uses - v_row.current_uses
                      END,
    'expires_at',     v_row.expires_at,
    'metadata',       v_row.metadata
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_validate_code TO anon, authenticated, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 6: fn_validate_code() lista (anon + authenticated)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7 — RPC: fn_use_code
-- Valida + consume + registra en code_usages de forma atómica.
-- SELECT FOR UPDATE previene race conditions en usos concurrentes.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_use_code(
  p_code         TEXT,
  p_module_name  TEXT,
  p_type_id      TEXT  DEFAULT NULL,
  p_tenant_id    UUID  DEFAULT NULL,
  p_observations TEXT  DEFAULT NULL,
  p_ip_address   INET  DEFAULT NULL,
  p_metadata     JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row      public.codes;
  v_usage_id UUID;
  v_new_status TEXT;
BEGIN
  -- Lock the row to prevent double-spending under concurrent requests
  SELECT * INTO v_row
  FROM public.codes
  WHERE code    = upper(trim(p_code))
    AND status  = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    AND (p_type_id   IS NULL OR type_id   = p_type_id)
    AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
  LIMIT 1
  FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Código inválido, expirado o inactivo');
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.current_uses >= v_row.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Límite de usos alcanzado');
  END IF;

  -- Determinar nuevo estado
  v_new_status := CASE
    WHEN v_row.max_uses IS NOT NULL AND (v_row.current_uses + 1) >= v_row.max_uses
      THEN 'used'
    ELSE 'active'
  END;

  -- Incrementar uso y actualizar estado si corresponde
  UPDATE public.codes
     SET current_uses = current_uses + 1,
         status       = v_new_status
   WHERE id = v_row.id;

  -- Registrar auditoría
  INSERT INTO public.code_usages (
    code_id, tenant_id, used_by, module_name, observations, ip_address, metadata
  )
  VALUES (
    v_row.id, v_row.tenant_id, auth.uid(),
    p_module_name, p_observations, p_ip_address, p_metadata
  )
  RETURNING id INTO v_usage_id;

  RETURN jsonb_build_object(
    'ok',        true,
    'code_id',   v_row.id,
    'usage_id',  v_usage_id,
    'tenant_id', v_row.tenant_id,
    'type_id',   v_row.type_id,
    'metadata',  v_row.metadata,
    'new_status', v_new_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_use_code TO authenticated, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 7: fn_use_code() lista (atómica, anti-race-condition)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8 — RPC: fn_create_code
-- Genera un código para un tenant. Si p_code es NULL, auto-genera formato ABC-1234-XY.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_create_code(
  p_tenant_id   UUID,
  p_type_id     TEXT,
  p_code        TEXT        DEFAULT NULL,   -- NULL = auto-generar
  p_description TEXT        DEFAULT NULL,
  p_max_uses    INT         DEFAULT NULL,   -- NULL = ilimitado
  p_expires_at  TIMESTAMPTZ DEFAULT NULL,   -- NULL = sin expiración
  p_metadata    JSONB       DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_id   UUID;
  v_base TEXT;
  v_tries INT := 0;
BEGIN
  IF p_code IS NULL THEN
    -- Auto-generar: formato ABC-12D3-XY (3-4-2, alfanumérico mayúsculas)
    LOOP
      v_code :=
        upper(substr(md5(random()::text), 1, 3)) || '-' ||
        upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' ||
        upper(substr(md5(clock_timestamp()::text), 1, 2));

      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.codes WHERE code = v_code AND tenant_id = p_tenant_id
      ) OR v_tries >= 20;
      v_tries := v_tries + 1;
    END LOOP;
  ELSE
    v_code := upper(trim(p_code));
  END IF;

  INSERT INTO public.codes (
    tenant_id, code, type_id, description,
    max_uses, expires_at, metadata, created_by
  )
  VALUES (
    p_tenant_id, v_code, p_type_id, p_description,
    p_max_uses, p_expires_at, p_metadata, auth.uid()
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'id', v_id, 'code', v_code);

EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'El código ya existe para este tenant');
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_create_code TO authenticated, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 8: fn_create_code() lista (auto-formato o custom)'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 9 — RPC: fn_revoke_code
-- Revoca un código de forma permanente. Solo el dueño del tenant puede hacerlo.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_revoke_code(
  p_code_id UUID,
  p_reason  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.codes
     SET status   = 'revoked',
         metadata = metadata || jsonb_build_object(
           'revoked_by',     auth.uid(),
           'revoke_reason',  p_reason,
           'revoked_at',     now()
         )
   WHERE id        = p_code_id
     AND tenant_id = public.fn_current_tenant_id()
     AND status   != 'revoked';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Código no encontrado, ya revocado, o no pertenece a tu tenant'
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'code_id', p_code_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_revoke_code TO authenticated, service_role;

DO $$ BEGIN RAISE NOTICE '✅ PASO 9: fn_revoke_code() lista'; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 10 — Verificación final
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_codes      INT;
  v_usages     INT;
  v_types      INT;
  v_fn_validate TEXT;
  v_fn_use      TEXT;
  v_fn_create   TEXT;
  v_fn_revoke   TEXT;
BEGIN
  SELECT COUNT(*) INTO v_codes  FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'codes';
  SELECT COUNT(*) INTO v_usages FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'code_usages';
  SELECT COUNT(*) INTO v_types  FROM public.cat_code_types;

  SELECT p.proname INTO v_fn_validate FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='fn_validate_code';
  SELECT p.proname INTO v_fn_use      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='fn_use_code';
  SELECT p.proname INTO v_fn_create   FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='fn_create_code';
  SELECT p.proname INTO v_fn_revoke   FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='fn_revoke_code';

  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  SISTEMA DE CODIGOS GENERICO — VERIFICACION FINAL';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  public.codes         : %', CASE WHEN v_codes>0  THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  public.code_usages   : %', CASE WHEN v_usages>0 THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  cat_code_types       : % tipos', v_types;
  RAISE NOTICE '  fn_validate_code()   : %', CASE WHEN v_fn_validate IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_use_code()        : %', CASE WHEN v_fn_use      IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_create_code()     : %', CASE WHEN v_fn_create   IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '  fn_revoke_code()     : %', CASE WHEN v_fn_revoke   IS NOT NULL THEN '✅ OK' ELSE '❌ FALLA' END;
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  TIPOS DISPONIBLES:';
  RAISE NOTICE '  GYM_ACCESS, GYM_PROMO, USER_INVITE, ACCOUNT_ACTIVATE,';
  RAISE NOTICE '  PASSWORD_RESET, TEMP_ACCESS, LICENSE, DOCUMENT_VERIFY,';
  RAISE NOTICE '  EDU_ENROLL, COUPON';
  RAISE NOTICE '';
  RAISE NOTICE '  EJEMPLO DE USO (gym):';
  RAISE NOTICE '  -- Crear código de acceso para un gym:';
  RAISE NOTICE '  SELECT fn_create_code(tenant_id, ''GYM_ACCESS'', ''GYMFIT'', ...);';
  RAISE NOTICE '  -- Validar código (desde /signup, sin autenticación):';
  RAISE NOTICE '  SELECT fn_validate_code(''GYMFIT'', ''GYM_ACCESS'');';
  RAISE NOTICE '  -- Consumir código al registrarse:';
  RAISE NOTICE '  SELECT fn_use_code(''GYMFIT'', ''gym'', ''GYM_ACCESS'');';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;

-- ─── FIN MIGRACIÓN 010 ────────────────────────────────────────────────────────
