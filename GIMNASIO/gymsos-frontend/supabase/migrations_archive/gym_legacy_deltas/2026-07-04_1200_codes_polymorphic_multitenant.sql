-- gymsos-frontend/migrations/2026-07-04_1200_codes_polymorphic_multitenant.sql
/*
  DESCRIPCIÓN: Convierte el motor de códigos compartido (public.codes) en un sistema
               POLIMÓRFICO y MULTI-TENANT capaz de servir a Sistema 1 (ONG / motor ACE)
               y Sistema 2 (Gimnasio) sobre la misma tabla física, con aislamiento por tenant.

  IMPACTO:     Solo cambios ADITIVOS sobre public.codes (sin renombrar ni eliminar columnas):
                 - Garantiza columna tenant_id (UUID) + FK a public.tenants (ya existe desde 010; se valida).
                 - Añade code_type (TEXT) con CHECK que admite tipos de ambos mundos (NULL permitido).
                 - Añade context_payload (JSONB DEFAULT '{}') para metadatos por aplicación.
                 - Crea índice compuesto idx_codes_tenant_type_code (tenant_id, code_type, code).
               NO se altera 'code', 'status', 'expires_at', 'type_id' ni 'metadata'.

  ROLLBACK:    -- Reversible sin pérdida de datos preexistentes:
               DROP INDEX IF EXISTS public.idx_codes_tenant_type_code;
               ALTER TABLE public.codes DROP CONSTRAINT IF EXISTS chk_codes_code_type;
               ALTER TABLE public.codes DROP COLUMN IF EXISTS code_type;
               ALTER TABLE public.codes DROP COLUMN IF EXISTS context_payload;
               -- (tenant_id NO se revierte: es preexistente de la migración 010.)

  DEPENDENCIAS: public.codes (010), public.tenants (BD Maestra / Core externo).
                Convive con las columnas ya existentes type_id (FK cat_code_types) y metadata (JSONB);
                code_type y context_payload son capas polimórficas adicionales, no reemplazos.

  VALIDACIÓN:  Ver bloque de verificación al final (information_schema + pg_indexes).

  NOTA DE COMPATIBILIDAD (anti-regresión frontend):
    Auditoría del repo: el frontend del Gimnasio NO lee public.codes por columnas directas;
    accede vía RPC (fn_validate_code / fn_use_code / fn_check_permission). No existe columna
    'is_active' en la tabla (el ciclo de vida se controla con 'status'). Por eso esta migración
    NO crea 'is_active' ni renombra 'status'; toda columna consumida hoy queda intacta.
*/

BEGIN;

-- =====================================================================================
-- 1. AISLAMIENTO MULTI-TENANT — columna tenant_id + FK a public.tenants
--    (Preexistente desde la migración 010. Se asegura de forma idempotente por si algún
--     entorno divergió por ejecución manual — ver AUDIT_REPORT P3.)
-- =====================================================================================

-- 1.a Asegurar la columna (no-op si ya existe).
ALTER TABLE public.codes
  ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 1.b Asegurar la FK a public.tenants solo si aún no existe una FK sobre tenant_id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conrelid = 'public.codes'::regclass
      AND c.contype  = 'f'
      AND c.confrelid = 'public.tenants'::regclass
      AND c.conkey = ARRAY[
        (SELECT attnum FROM pg_attribute
          WHERE attrelid = 'public.codes'::regclass AND attname = 'tenant_id')
      ]
  ) THEN
    ALTER TABLE public.codes
      ADD CONSTRAINT codes_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================================================
-- 2. POLIMORFISMO — columna code_type con CHECK que valida los tipos de ambos sistemas
--    Se permite NULL para no romper filas existentes (que usan type_id/cat_code_types).
--    Amplía, no sustituye, al catálogo type_id.
-- =====================================================================================

ALTER TABLE public.codes
  ADD COLUMN IF NOT EXISTS code_type TEXT;

-- CHECK aditivo e idempotente (ADD CONSTRAINT IF NOT EXISTS no es válido en PostgreSQL).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_codes_code_type'
      AND conrelid = 'public.codes'::regclass
  ) THEN
    ALTER TABLE public.codes
      ADD CONSTRAINT chk_codes_code_type
      CHECK (
        code_type IS NULL OR code_type IN (
          -- Sistema 2 · Gimnasio
          'gym_free_pass',            -- pase libre / cortesía
          'gym_membership_discount',  -- cupón de descuento de membresía
          -- Sistema 1 · ONG
          'ong_volunteer_signup',     -- alta de voluntario
          'ong_donor_invite',         -- invitación a donante
          -- Motor ACE (enlaces de acceso ONG)
          'ace_access_link'           -- enlace de acceso contextual (permisos ace.perms.*)
        )
      );
  END IF;
END $$;

-- =====================================================================================
-- 3. PAYLOAD FLEXIBLE — columna context_payload (JSONB) para metadatos por aplicación
--    ONG: permisos requeridos (ace.perms.*), contexto del enlace de acceso.
--    Gimnasio: datos del pase de batalla / promoción, sin crear tablas nuevas.
--    Coexiste con 'metadata' (010); no la reemplaza.
-- =====================================================================================

ALTER TABLE public.codes
  ADD COLUMN IF NOT EXISTS context_payload JSONB NOT NULL DEFAULT '{}'::jsonb;

-- =====================================================================================
-- 4. RENDIMIENTO — índice compuesto para búsquedas por (tenant, tipo, código)
--    Sirve a las APIs de ambas aplicaciones para lookups instantáneos y aislados.
-- =====================================================================================

CREATE INDEX IF NOT EXISTS idx_codes_tenant_type_code
  ON public.codes (tenant_id, code_type, code);

-- =====================================================================================
-- 5. DOCUMENTACIÓN EN CATÁLOGO (COMMENT ON) — trazabilidad del propósito polimórfico
-- =====================================================================================

COMMENT ON COLUMN public.codes.code_type IS
  'Tipo polimórfico multi-sistema (gym_*/ong_*/ace_access_link). Complementa type_id; NULL permitido en filas legacy.';
COMMENT ON COLUMN public.codes.context_payload IS
  'Metadatos específicos por aplicación (ACE: ace.perms.*; Gimnasio: battle pass/promos). Complementa metadata.';
COMMENT ON INDEX public.idx_codes_tenant_type_code IS
  'Lookup aislado por tenant+tipo+código para las APIs de ONG y Gimnasio.';

COMMIT;

-- =====================================================================================
-- 6. VALIDACIÓN (ejecutar tras aplicar; solo lectura, no modifica la BD)
-- =====================================================================================
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_schema = 'public' AND table_name = 'codes'
--    AND column_name IN ('tenant_id','code_type','context_payload')
--  ORDER BY column_name;
--
-- SELECT indexname FROM pg_indexes
--  WHERE schemaname = 'public' AND tablename = 'codes'
--    AND indexname = 'idx_codes_tenant_type_code';
--
-- SELECT conname FROM pg_constraint
--  WHERE conrelid = 'public.codes'::regclass
--    AND conname IN ('chk_codes_code_type','codes_tenant_id_fkey');
