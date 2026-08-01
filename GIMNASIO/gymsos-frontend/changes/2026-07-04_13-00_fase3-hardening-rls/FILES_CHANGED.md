# FILES_CHANGED — Fase 3: Endurecimiento RLS

## Creados
- `gymsos-frontend/migrations/021_security_hardening_rls.sql`
  Migración de seguridad Fase 3. Contiene: §0 precondición `fn_current_tenant_id`; §1 índices RLS
  (`idx_espacios_gimnasio` nuevo + reafirma `idx_usuarios_gimnasio`/`idx_gimnasios_tenant`);
  §2 revocación masiva + default privileges (conserva USAGE); §3–§6 RLS unificado `gym`
  (gimnasios directo; 7 tablas vía `id_gimnasio`; 13 vía `id_usuario`; `maquinas` vía `espacios`);
  §7 re-grant por tabla (operativas DML / innovación SELECT); §8 cierre `anon` en
  `public.codes` y `gym.codigos_acceso`; §9 blindaje 9 huérfanas (6 tenant + 3 deny-all);
  §10 validación y rollback.

- `gymsos-frontend/migrations/changes/2026-07-04_13-00_fase3-hardening-rls/CHANGELOG.md`
- `gymsos-frontend/migrations/changes/2026-07-04_13-00_fase3-hardening-rls/SUMMARY.md`
- `gymsos-frontend/migrations/changes/2026-07-04_13-00_fase3-hardening-rls/FILES_CHANGED.md`

## Modificados
- Ninguno (la migración es aditiva; no edita archivos existentes).

## Eliminados
- Ninguno.

## Objetos de base de datos afectados (al ejecutar 021)
- **Revocados:** grants masivos de `009` sobre `authenticated`/`anon` en esquema `gym`; default privileges.
- **Creados/reemplazados:** políticas `*_tenant_isolation` en 22 tablas `gym` + 6 tablas `public`.
- **Eliminadas:** políticas legacy `usuarios_*`, `planes_*`, `espacios_*`, `maquinas_*`,
  `promociones_*`, `codigos_select_public` (gym), `codes_public_lookup` (public.codes).
- **Índices nuevos:** `gym.espacios(id_gimnasio)`.
- **Deny-all (RLS on, sin política):** `marketplace_vendors`, `corporate_clients`, `corporate_leaderboards`.

## Nota de duplicado a resolver en Fase 4
- Existe un borrador previo idéntico `2026-07-04_1300_fase3_hardening_rls.sql`. La versión
  canónica es `021_security_hardening_rls.sql`; el borrador debe archivarse/eliminarse (ver MIGRATION_STRATEGY.md).
