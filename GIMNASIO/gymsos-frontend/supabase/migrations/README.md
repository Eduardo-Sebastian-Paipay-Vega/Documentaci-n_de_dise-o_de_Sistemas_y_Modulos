# supabase/migrations — Sistema 2 (GYMsos)

Secuencia unificada y reproducible (`supabase db reset` aplica en orden lexicográfico).
Ver `../../MIGRATION_STRATEGY.md` para el detalle de capas y proveniencia.

| Orden | Archivo | Fase / Capa |
|---|---|---|
| 1 | `00000000000000_core_baseline.sql` | **Fase 1 — PROVISTO POR SISTEMA 1 (ONG).** Inyectar aquí el baseline del Core (tenants, profiles, roles, role_permissions, cat_permissions, sedes, user_roles_sedes, fn_has_permission(text,uuid), fn_trigger_audit_universal, catálogos). No se versiona desde este repo. |
| 2 | `00000000000100_core_baseline_contract.sql` | Fase 1 — guard: falla si el baseline no está. |
| 3 | `20260701010000_gym_schema_and_domain.sql` | Capa 1 — schema gym + 22 tablas de dominio. |
| 4 | `20260701020000_rls_context_helpers.sql` | Capa 2 — **fn_current_tenant_id (resuelve P2).** |
| 5 | `20260701030000_public_codes_system.sql` | Capa 3 — cat_code_types, codes, code_usages + RPCs. |
| 6 | `20260701040000_core_fixes_profiles_avatar.sql` | Capa 4 — fixes auth/profiles, RLS gym.usuarios, avatar. |
| 7 | `20260701050000_audit_logs_and_tenant_bridge.sql` | Capa 4b — audit_logs + tenant_id en gimnasios. |
| 8 | `20260701060000_rbac_permissions_and_roles.sql` | Capa 5/6 — seeds permisos/roles, user_roles, RBAC. |
| 9 | `20260701070000_staff_code_and_overrides.sql` | Capa 7 — handle_new_user final, staff code, overrides. |
| 10 | `20260702000000_codes_polymorphic_multitenant.sql` | Fase 2 — code_type/context_payload. |
| 11 | `20260702010000_sync_gym_rol_to_rbac.sql` | Fase 2 — trigger de sincronización de roles. |
| 12 | `20260704130000_security_hardening_rls.sql` | Fase 3 — endurecimiento RLS (=021), **último**. |

> Fuente histórica preservada en `../migrations_archive/` (no ejecutable).
