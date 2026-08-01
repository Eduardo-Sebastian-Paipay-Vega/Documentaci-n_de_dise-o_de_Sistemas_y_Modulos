# CHANGELOG — Fase 3: Endurecimiento de seguridad y blindaje RLS

**Fecha/hora:** 2026-07-04 13:00 (America/Lima)
**Autor:** Claude (asistido) · **Rol:** Ingeniero de Seguridad de Apps + DBA Senior
**Migración:** `gymsos-frontend/migrations/021_security_hardening_rls.sql`
**Aprobación:** Arquitecto (Fase 3). Cierre de `anon` sobre `public.codes` aprobado explícitamente por el usuario.
**Estado del cambio:** Completado (documentado y listo para ejecución bajo flujo `CLAUDE.md`).

## Objetivo del cambio
Aplicar mínimo privilegio y aislamiento multi-tenant estricto sobre la BD compartida
(Sistema 1 ONG + Sistema 2 Gimnasio): revocar los GRANT masivos de la migración 009,
activar y unificar RLS por tenant en el esquema `gym`, y blindar las 9 tablas de innovación
huérfanas del esquema `public`.

## Contexto del problema (auditoría S2)
- **P5 (ALTA):** `009` otorga `SELECT/INSERT/UPDATE/DELETE ON ALL TABLES IN SCHEMA gym` a
  `authenticated`. Tablas sin RLS completo (`pagos`, `membresias`, innovación) quedaban
  escribibles por cualquier usuario del tenant o totalmente abiertas.
- **P6 (ALTA):** políticas de escritura sin verificación de permiso.
- **P7 (MEDIA):** lectura `anon` de códigos (`gym.codigos_acceso`, `public.codes`) → enumeración.
- **P15 (MEDIA):** 9 tablas de innovación en `public` sin RLS, sin UI, con FK rotas.

## Motivo de la modificación
Dejar la contención de datos exclusivamente en RLS por tenant, eliminando la superficie
abierta heredada, antes de considerar la BD apta para producción.

## Solución implementada
1. **Revocación + reasignación:** `REVOKE ALL ON ALL TABLES IN SCHEMA gym FROM authenticated, anon`
   + cierre de `DEFAULT PRIVILEGES`; se conserva `GRANT USAGE ON SCHEMA gym`. Re-GRANT por tabla:
   DML completo en operativas; **solo SELECT** en las 8 tablas de innovación sin UI.
2. **RLS unificado `gym`:** `ENABLE ROW LEVEL SECURITY` + política `FOR ALL` `*_tenant_isolation`
   anclada en `gym.gimnasios.tenant_id = public.fn_current_tenant_id()`. Tablas sin `tenant_id`
   usan `EXISTS` (vía `id_gimnasio`, `id_usuario`→usuarios, o `id_espacio`→espacios). Se eliminan
   las políticas permisivas legacy de 009/013 para no debilitar por `OR`.
3. **Huérfanas `public`:** 6 con enlace → aislamiento por tenant; 3 sin enlace
   (`marketplace_vendors`, `corporate_clients`, `corporate_leaderboards`) → **deny-all**
   (RLS on + `REVOKE`, sin política permisiva).
4. **Cierre `anon`:** `DROP POLICY codes_public_lookup` y `codigos_select_public`;
   `REVOKE SELECT ... FROM anon` en ambas. Validación anónima forzada a `fn_validate_code` (SECURITY DEFINER).
5. **Índices RLS:** `idx_espacios_gimnasio` (nuevo), `idx_usuarios_gimnasio`, `idx_gimnasios_tenant`.

## Riesgos identificados
- `public.codes` es compartida con el Sistema 1. **Mitigado:** la ONG opera invitaciones vía
  Edge Functions (Service Role), sin lecturas directas del cliente → sin impacto cruzado (confirmado por el usuario).
- Políticas `EXISTS` se evalúan por fila. **Mitigado:** índices de cruce en §1.
- Deny-all bloquea las 3 tablas para toda API; correcto por ser código muerto. Si reciben UI,
  requerirán una columna de enlace a tenant antes de abrir acceso.

## Impacto esperado
Aislamiento por tenant infranqueable en `gym` y `public` (repo). Sin acceso anónimo a códigos.
Sin cambios en el frontend del Gimnasio (accede vía RPC, no por columnas directas de códigos).

## Módulos afectados
Esquema `gym` (22 tablas), esquema `public` (9 huérfanas + `codes`/`codigos_acceso`), rol `authenticated`, rol `anon`.

## Dependencias involucradas
`public.fn_current_tenant_id()` (016), `gym.gimnasios.tenant_id` (015b), `public.fn_validate_code` (010).

## Posibles efectos secundarios
- Cualquier flujo que dependiera del GRANT masivo dejará de funcionar hasta re-otorgarse por tabla (ya cubierto).
- Herramientas que leyeran `public.codes` como `anon` perderán acceso (debe migrar a `fn_validate_code`).

## Rollback
Incluido en §10 de la migración: re-GRANT masivo, recrear `codes_public_lookup`/`codigos_select_public`,
`DROP POLICY %_tenant_isolation`, `DISABLE RLS` donde no existía.
