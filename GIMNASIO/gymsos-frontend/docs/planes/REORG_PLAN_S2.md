# REORG_PLAN_S2 — Reordenamiento cronológico de migraciones activas (GYMsos / Sistema 2)

> **Rol:** DBA Senior · **Fecha:** 2026-07-04 · **Alcance:** solo reordenamiento lógico del historial ACTIVO.
> **Fuentes:** `DATABASE_MASTER_SCRIPT_S2.md`, `AUDIT_REPORT_S2.md`, y los 12 archivos SQL activos de `gymsos-frontend/migrations/`.
> **Este documento NO ejecuta cambios.** Es un plan de secuenciación. Cualquier aplicación debe seguir el flujo obligatorio de `CLAUDE.md` (documentar → analizar → aprobar → validar → ejecutar).

---

## 0. Objetivo y problema a resolver

El repositorio se concibió como **módulo montado sobre una "BD Maestra" externa**. Sus migraciones (`009`–`020`) son *deltas* con tres defectos de secuenciación que impiden un despliegue limpio:

- **P1 — Dependencias externas no versionadas:** `010/015b/016/020` referencian objetos del Core (`tenants`, `profiles`, `roles`, `role_permissions`, `cat_permissions`) que ningún archivo crea.
- **P2 — Orden de dependencias invertido (bloqueo principal):** `public.fn_current_tenant_id()` se **usa** en `010` (políticas `codes_tenant_*`, líneas `010:167/172/180/427`) pero se **crea** en `016` (`CREATE OR REPLACE`, línea `016:188`). En limpio, `010` antes de `016` → *función inexistente* → falla.
- **P4 — Huecos/inconsistencias de numeración:** `015` original falló (solo vive `015b`); `018`/`018b` se anulan entre sí (archivados); `019` es en realidad `019c`.

**Regla de diseño rectora:** *toda función o tabla auxiliar de RLS debe crearse ANTES de ser invocada en cualquier `CREATE POLICY`.* El reordenamiento agrupa el historial en **capas por dependencia**, no por orden histórico de commits.

---

## 1. Universo de archivos y clasificación

### 1.1 Archivos EXCLUIDOS del reordenamiento (no entran al nuevo historial)

| Archivo | Motivo |
|---|---|
| `000_ROLLBACK_001_to_008.sql` | Revierte la arquitectura standalone 001–008. Ya cumplió su función; no forma parte del estado final. |
| `archive/001`–`008`, `008b`, `015` (original), `018`, `018b`, `00101_SCRATCH` | Superseded / revertidos / no ejecutables. Permanecen como historial en `archive/`. |
| `audi/*.md`, `audi/trigger_debug_checklist.sql` | Documentación y diagnóstico (SELECTs). No son estructura. |

### 1.2 Archivos ACTIVOS a reordenar (12) y su destino

| Antiguo | Contenido dominante | Clasificación destino |
|---|---|---|
| `009_gym_as_bd_maestra_module.sql` | schema `gym`, mueve 21 tablas, columnas extra, `codigos_acceso`, helpers `gym`, RPCs `gym`, trigger, GRANTs amplios | **CONSOLIDADO GYM** (+ capa helpers + capa grants) |
| `010_shared_codes_system.sql` | tablas `cat_code_types/codes/code_usages`, RPCs `fn_*_code`, políticas `codes_*` | **PARCHE PUBLIC** (tablas → capa 3; policies → capa 6; funciones → capa 5) |
| `011_fix_auth_profiles_connection.sql` | fix `handle_new_user` ↔ `profiles` + backfill | **CONSOLIDADO GYM** (capa trigger) |
| `012_fix_profiles_rls_and_rpc.sql` | RLS `profiles` + `fn_get_my_profile` | **PARCHE PUBLIC** (policies → capa 6; función → capa 5) |
| `013_fix_gym_usuarios_rls.sql` | 6 políticas `gym.usuarios` | **CONSOLIDADO GYM** (capa policies gym) |
| `014_universal_avatar.sql` | `avatar_url`, `fn_update_my_avatar`, `fn_get_my_profile` v2 | **CONSOLIDADO GYM** (columnas) + **PARCHE PUBLIC** (funciones → capa 5) |
| `015b_patch_audit_logs.sql` | tabla `audit_logs`, `tenant_id` en `gimnasios`, backfill, `handle_new_user` | **PARCHE PUBLIC** (tabla → capa 4) + **GYM** (columna `tenant_id`) |
| `016_accesos_y_codigos_staff.sql` | seeds `cat_permissions`, `user_roles`, `code_grants`, **`fn_current_tenant_id`**, roles, `fn_has_permission`, `fn_my_permissions`, `fn_create_staff_code`, `handle_new_user` | **DIVIDIDO**: helpers → capa 2; tablas → capa 4; seeds+funciones → capa 5; policies → capa 6; trigger → capa 7 |
| `017_fix_staff_code_trigger.sql` | fix seguridad `handle_new_user` (staff_code) | **CONSOLIDADO GYM** (capa trigger, versión final) |
| `019_fix_fn_create_staff_code_overload_call.sql` | fix `fn_create_staff_code` (consulta directa) | **PARCHE PUBLIC** (capa 5, versión final) |
| `020_elizabeth_capa1_permission_overrides.sql` | tabla `user_permission_overrides`, `fn_my_permissions` v2, `fn_check_permission`, grants `ace.*` | **PARCHE PUBLIC** (tabla → capa 4; funciones → capa 5; policies → capa 6) |

**Conclusión de clasificación:** el bloque `gym` no puede consolidarse en un único archivo monolítico sin romper P2 (sus políticas dependen de helpers que hoy nacen en `010`/`016`). La solución correcta es **consolidar por capa de dependencia**, manteniendo dos "familias" (GYM / PUBLIC) claramente etiquetadas dentro de una secuencia global.

---

## 2. Contrato del Baseline del Core (pre-requisito, no versionado aquí)

Antes de la primera migración propia debe inyectarse el Baseline del Core (BD Maestra). Se propone un archivo *contrato* que valide su presencia y falle temprano con mensaje claro (resuelve P1 sin duplicar el Core):

```
00000000000000_core_baseline_contract.sql   [EXTERNO / VALIDACIÓN]
  · Verifica existencia de: public.tenants, public.profiles, public.roles,
    public.role_permissions, public.cat_permissions, public.sedes, public.user_roles_sedes.
  · Verifica funciones: fn_has_permission(text,uuid), fn_trigger_audit_universal().
  · Verifica catálogos: plan_id, status_financial_id, industry_type_id='gym',
    permisos ace.perms.manage / ace.perms.read.
  · DO $$ ... RAISE EXCEPTION si falta algún objeto. NO crea objetos del Core.
```

---

## 3. Mapa de archivos propuesto (secuencia por capas)

Formato: `YYYYMMDDHHMMSS_objetivo.sql`. Timestamps sintéticos correlativos (2026-07-04) que **codifican la capa de dependencia**, no la fecha histórica. Etiqueta `[GYM]` / `[PUBLIC]` indica familia.

```
00000000000000_core_baseline_contract.sql                 [EXTERNO]  ← §2

CAPA 1 · Estructura de dominio gym
20260704_100000_gym_schema_and_domain_tables.sql          [GYM]

CAPA 2 · Helpers de contexto RLS (ANTES de cualquier policy)
20260704_101000_rls_context_helpers.sql                   [GYM+PUBLIC]

CAPA 3 · Tablas del sistema de códigos (public)
20260704_102000_public_codes_system_tables.sql            [PUBLIC]

CAPA 4 · Tablas puente/RBAC/auditoría (public) + puente tenant
20260704_103000_public_rbac_audit_bridge_tables.sql       [PUBLIC+GYM]

CAPA 5 · Funciones de negocio (códigos, perfil, RBAC, staff)
20260704_104000_functions_codes_profile_rbac.sql          [PUBLIC]

CAPA 6 · Políticas RLS (gym + public) — invocan helpers de capa 2
20260704_105000_rls_policies_gym_and_public.sql           [GYM+PUBLIC]

CAPA 7 · Seeds RBAC + trigger final de provisión
20260704_106000_seeds_rbac_and_handle_new_user.sql        [GYM+PUBLIC]

CAPA 8 · GRANTs amplios a authenticated (AISLADOS para endurecer luego)
20260704_107000_broad_grants_authenticated_TEMP.sql       [GYM]  ← §5
```

---

## 4. Detalle por archivo: qué código antiguo se mueve y por qué

### CAPA 1 — `20260704_100000_gym_schema_and_domain_tables.sql` `[GYM]`
**Fusiona:** DDL de `009` (schema `gym`, `ALTER TABLE ... SET SCHEMA gym`, columnas `009 PASO 0b`, `gym.codigos_acceso`, índices) + columnas de `014` (`avatar`/`foto_url`) aplicadas a `gym.usuarios` + columna `tenant_id` en `gym.gimnasios` de `015b`.
**Excluye de 009:** helpers RLS (→ capa 2), políticas (→ capa 6), RPCs de negocio (→ capa 5), GRANTs amplios (→ capa 8), trigger (→ capa 7).
**Por qué aquí:** las tablas de dominio no dependen de nada del Core salvo `auth.users` y `public.tenants` (ya presente por el contrato §2). Deben existir antes que sus políticas y funciones. Consolidar `014`/`015b` (solo sus `ALTER TABLE`) evita "columnas añadidas por parche posterior" y deja la tabla en su forma final desde el inicio.

### CAPA 2 — `20260704_101000_rls_context_helpers.sql` `[GYM+PUBLIC]` ⭐ **Resuelve P2**
**Fusiona:** `public.fn_current_tenant_id()` extraída de `016:184-200` + `public.get_user_gym()`, `public.get_user_rol()`, `gym.current_gym_id()` extraídas de `009`.
**Por qué aquí (núcleo del arreglo):** hoy `010` (capa de códigos) usa `fn_current_tenant_id()` en sus políticas pero la función se crea en `016`, dos migraciones después → bloqueo P2. Al **adelantar TODAS las funciones helper a la capa 2**, cualquier `CREATE POLICY` posterior (capas 6 y 7) las encuentra ya definidas. Es un helper `SECURITY DEFINER STABLE` sin dependencias de tablas propias (solo lee `public.profiles`/`gym.usuarios`), por lo que puede crearse inmediatamente tras la capa 1.

### CAPA 3 — `20260704_102000_public_codes_system_tables.sql` `[PUBLIC]`
**Fusiona:** DDL de `010` → `public.cat_code_types` (+seeds de tipos), `public.codes`, `public.code_usages` e índices.
**Excluye de 010:** RPCs `fn_*_code` (→ capa 5) y políticas `codes_*` (→ capa 6).
**Por qué aquí:** `codes.tenant_id → public.tenants` (Core, ya presente) y `code_usages.code_id → codes`. Deben preceder a sus funciones y políticas. Sin dependencia de helpers ni RBAC.

### CAPA 4 — `20260704_103000_public_rbac_audit_bridge_tables.sql` `[PUBLIC+GYM]`
**Fusiona:** `public.audit_logs` (tabla + índices) de `015b` + `public.user_roles` y `public.code_grants` de `016` + `public.user_permission_overrides` de `020`.
**Excluye:** el backfill y `handle_new_user` de `015b` (→ capa 7); seeds/funciones de `016` (→ capa 5); funciones/policies de `020` (→ capas 5/6).
**Por qué aquí:** son tablas puente que dependen del Core (`tenants`, `roles`, `cat_permissions`) y de `codes` (capa 3, para `code_grants.code_id`). No dependen de helpers ni de sus propias políticas. Agruparlas fija la superficie de tablas `public` antes de funciones/policies.

### CAPA 5 — `20260704_104000_functions_codes_profile_rbac.sql` `[PUBLIC]`
**Fusiona (versión final de cada función, resolviendo P4):**
- de `010`: `fn_codes_set_updated_at`, `fn_validate_code`, `fn_use_code`, `fn_create_code`, `fn_revoke_code`;
- de `012`+`014`: `fn_get_my_profile` (**v2 de 014, descarta la v1 de 012**), `fn_update_my_avatar`;
- de `016`: `fn_has_permission(text)`, `fn_create_staff_code` (base);
- de `019`: `fn_create_staff_code` **final** (consulta directa a `user_roles`+`role_permissions`; sustituye la de 016 → cierra P4 del overload);
- de `020`: `fn_my_permissions` **v2** y `fn_check_permission`.
**Por qué aquí:** las funciones dependen de las tablas de capas 3–4 pero no de las políticas; se aplican una sola vez en su forma final, eliminando las cadenas de `CREATE OR REPLACE` redundantes (`fn_get_my_profile` ×2, `fn_create_staff_code` ×2, `fn_my_permissions` ×2). No se toca el overload externo `fn_has_permission(text,uuid)` (deuda documentada, fuera de repo).

### CAPA 6 — `20260704_105000_rls_policies_gym_and_public.sql` `[GYM+PUBLIC]`
**Fusiona TODAS las `CREATE POLICY` en un punto posterior a los helpers:**
- `gym`: 12 políticas de `009` + 6 de `013` (`gym.usuarios`, versión final; reemplaza las base);
- `public`: 4 de `010` (`codes_*`, `code_usages_tenant`), 2 de `012` (`profiles_*`), 1 de `015b` (`audit_logs_tenant_select`), 4 de `016` (`user_roles_*`, `code_grants_*`), 4 de `020` (`upo_*`).
**Por qué aquí (cierre de P2):** al colocarse DESPUÉS de la capa 2, cada `USING (tenant_id = public.fn_current_tenant_id())` resuelve contra una función ya existente. Es el punto donde el orden invertido original queda formalmente corregido. Total ≈ 33 políticas.

### CAPA 7 — `20260704_106000_seeds_rbac_and_handle_new_user.sql` `[GYM+PUBLIC]`
**Fusiona:** seeds de `016` (30 permisos en `cat_permissions`, 7 roles + `role_permissions` por tenant `industry_type_id='gym'`) + backfill de `011`/`015b` (`profiles`/`tenants`) + **`handle_new_user` versión final única**: cadena `009→011→015b→016→017` colapsada en la definición de `017` (con fixes de seguridad staff_code) + wiring del trigger `on_auth_user_created`.
**Por qué al final:** el trigger `handle_new_user` es el objeto con más redefiniciones (6). Depende de casi todo (tablas gym+public, helpers, funciones RBAC, catálogos de roles sembrados). Definirlo una sola vez, al final, elimina las 5 reescrituras intermedias y evita estados transitorios inconsistentes. Los seeds preceden al trigger porque CASO A/B consultan `roles`/`code_grants` sembrados.

### CAPA 8 — `20260704_107000_broad_grants_authenticated_TEMP.sql` `[GYM]`
**Aísla:** los GRANTs amplios de `009` (ver §5). Separados a propósito en su propio archivo, marcado `TEMP`, para ser el punto único de endurecimiento en fases posteriores (P5/P6 de la auditoría).
**Por qué al final:** los GRANTs sobre `ALL TABLES IN SCHEMA gym` deben ejecutarse cuando todas las tablas gym ya existen. Aislarlos permite reemplazar este archivo por GRANTs por-tabla/por-permiso sin tocar el resto del historial.

---

## 5. GRANTs amplios a `authenticated` — mapa para endurecimiento posterior

Sentencias localizadas que otorgan escritura amplia y que **se mapearán/atenuarán en fases futuras** (no en este reordenamiento):

| Origen | Línea | Sentencia | Riesgo (AUDIT §3.2) |
|---|---|---|---|
| `009` | `009:30` | `ALTER DEFAULT PRIVILEGES IN SCHEMA gym GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO authenticated` | P5 — default privilege amplio |
| `009` | `009:69` | `GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA gym TO authenticated` | P5 — escritura total gym |
| `009` | `009:611` | `GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA gym TO authenticated` (repetido) | P5 — duplicado |
| `009` | `009:615` | `GRANT USAGE ON ALL SEQUENCES IN SCHEMA gym TO authenticated` | menor (no hay secuencias reales) |
| `010` | `010:191-192` | `GRANT ... ON public.codes / code_usages TO authenticated` | acotado (por tabla) — aceptable |

Todas quedan **concentradas en la Capa 8** (`..._TEMP.sql`), excepto los grants por-tabla de `010` que son acotados y pueden permanecer junto a sus tablas (capa 3). Objetivo futuro: sustituir los grants `ON ALL TABLES IN SCHEMA gym` por grants por-tabla + políticas de escritura con verificación de permiso (`fn_check_permission(...)`), cerrando P5/P6.

---

## 6. Trazabilidad antiguo → nuevo (resumen)

| Migración antigua | Se dispersa en capas |
|---|---|
| `009` | 1 (tablas/schema) · 2 (helpers gym) · 6 (policies gym) · 7 (trigger base→final) · 8 (grants) |
| `010` | 2 (usa helper) · 3 (tablas) · 5 (RPCs) · 6 (policies) |
| `011` | 7 (backfill + trigger) |
| `012` | 5 (`fn_get_my_profile` v1 descartada) · 6 (policies profiles) |
| `013` | 6 (policies `gym.usuarios`) |
| `014` | 1 (columnas avatar) · 5 (`fn_get_my_profile` v2, `fn_update_my_avatar`) |
| `015b` | 1 (`tenant_id` gimnasios) · 4 (`audit_logs`) · 7 (backfill + trigger) |
| `016` | **2 (`fn_current_tenant_id` ⭐)** · 4 (tablas RBAC) · 5 (funciones RBAC) · 6 (policies) · 7 (seeds + trigger) |
| `017` | 7 (`handle_new_user` final) |
| `019` | 5 (`fn_create_staff_code` final) |
| `020` | 4 (tabla overrides) · 5 (`fn_my_permissions` v2, `fn_check_permission`) · 6 (policies `upo_*`) |

---

## 7. Verificación del arreglo P2 (criterio de aceptación)

1. `grep -n "fn_current_tenant_id" capa2` → **1 `CREATE OR REPLACE`**; toda otra aparición (capas 6/7) es solo invocación.
2. Ninguna `CREATE POLICY` (capas 6/7) precede a la capa 2 en la secuencia de timestamps.
3. Orden de tablas: toda FK apunta a una tabla ya creada en una capa ≤ actual o al Core (contrato §2).
4. `handle_new_user` y `fn_create_staff_code` aparecen **una sola vez** en su versión final (P4 cerrado).
5. Ejecución simulada del orden §11 del master script debe coincidir con la secuencia de capas de este plan.

---

## 8. Notas y límites

- Este plan **reordena**; no reescribe la lógica interna de cada objeto (salvo colapsar redefiniciones a su versión final). El SQL concreto de cada archivo nuevo se redactaría en la fase de implementación, bajo el flujo de `CLAUDE.md`.
- Las 9 tablas de innovación huérfanas en `public` (`battle_pass_progression`, `clanes`, …) **no entran** en el nuevo historial: son código muerto con FK rotas (AUDIT §4.1, P15). Decisión de archivado pendiente, fuera de este reordenamiento.
- El endurecimiento de RLS (P5/P6), la unificación de códigos (P10) y del modelo de roles (P9) son fases posteriores; aquí solo se **deja el terreno secuenciable**.

---
*FIN REORG_PLAN_S2.md*
