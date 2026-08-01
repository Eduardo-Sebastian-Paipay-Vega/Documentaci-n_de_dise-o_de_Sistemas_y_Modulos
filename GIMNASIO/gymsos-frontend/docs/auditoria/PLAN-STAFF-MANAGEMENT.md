# PLAN TÉCNICO — ÉPICA STAFF MANAGEMENT
> **Fecha**: 2026-06-03 · **Versión**: 1.0
> **Alcance**: Implementación completa de la épica Staff Management (STF-001 a STF-008 + dependencias bloqueantes SEG-001 a SEG-006)
> **Roles de revisión**: Technical Lead · Software Architect · SaaS Architect · Supabase Architect · Next.js Architect

---

# PARTE 1 — AUDITORÍA DEL ESTADO ACTUAL

## 1.1 Estado del código frontend

### `src/lib/roles.ts` — INCOMPLETO
```
ROLES array actual:     ["miembro","cliente","entrenador","recepcionista","gerente","nutricionista","admin"]
ROLES que faltan:       "supervisor", "cajero"

ROL_ROUTES actual:      7 entradas — sin "supervisor", sin "cajero"
ROL_ROUTES que faltan:  "/dashboard/supervisor", "/dashboard/cajero"

ROUTE_ALLOWED_ROLES:    Tampoco tiene supervisor ni cajero
```
**Impacto directo**: Un usuario con `gym.usuarios.rol = 'supervisor'` o `'cajero'` entra al
`isValidRol()` de `auth-provider.tsx`, falla la validación y queda con rol `"miembro"`.
Ese trabajador se registró con el código correcto, tiene los permisos RBAC en `user_roles`,
pero el frontend lo manda al dashboard de miembro. **Es un bug crítico activo hoy.**

---

### `src/components/providers/auth-provider.tsx` — VULNERABILIDAD DE SEGURIDAD ACTIVA

**Línea 134–136** — `isValidRol()` no incluye `supervisor` ni `cajero`:
```typescript
// ACTUAL (incompleto):
function isValidRol(value: string): boolean {
  return ["gerente","recepcionista","entrenador","nutricionista","miembro","cliente","admin"].includes(value)
}
```
Cualquier usuario con `rol = "supervisor"` o `rol = "cajero"` obtiene rol efectivo `"miembro"`.

**Línea 265** — Cookie JavaScript-readable (riesgo de seguridad documentado):
```typescript
// ACTUAL (inseguro — cookie SIN HttpOnly):
document.cookie = `gymsos_rol=${profile.rol}; path=/; max-age=86400; SameSite=Lax`
```
Legible por cualquier script en la página. Un XSS puede leer el rol y modificarlo.
El middleware (si existiera) que lea esta cookie es bypasseable.

**Impacto**: ROL_ROUTES en el AuthProvider tampoco tiene `supervisor` ni `cajero` (líneas 50-58).

---

### `src/components/app/sidebar.tsx` — INCOMPLETO + ERROR DE TIPOS

`NAV_BY_ROL` es `Record<Rol, NavItem[]>` pero `Rol` incluye `"admin"`.
El objeto no tiene entrada `"admin"`, lo que genera un error TypeScript silencioso
(si no está en modo estricto) o crash en runtime si `user.rol === "admin"`.

```
NAV_BY_ROL: tiene 6 entradas (gerente, miembro, cliente, entrenador, recepcionista, nutricionista)
Faltan:     "supervisor", "cajero", "admin"

ROL_ACCENT: tiene 6 entradas — falta "admin"
ROL_LABEL:  tiene 6 entradas — falta "admin"
```

**La línea 101: `const nav = NAV_BY_ROL[user.rol]` retorna `undefined` para admin, supervisor, cajero.**
Esto causa un crash en la línea 162: `nav.map(...)` porque `undefined.map` lanza excepción.

---

### `src/app/dashboard/gerente/staff/page.tsx` — PARCIALMENTE IMPLEMENTADO

**Lo que existe:**
- Tab único "Generar código de invitación" — funciona correctamente
- Carga de roles del tenant desde `public.roles`
- Llama a `fn_create_staff_code` con los parámetros correctos
- Genera QR, permite copiar código, copiar enlace, compartir por WhatsApp, descargar SVG
- Manejo de permisos con `usePermission("gym.codigos.crear")`
- Estados de carga, error y vacío

**Lo que NO existe (toda la épica Staff Management real):**
- Tab 1: Lista de trabajadores activos con roles RBAC reales — **no existe**
- Tab 3: Historial de códigos emitidos — **no existe**
- Widget de licencias usadas / disponibles — **no existe**
- Revocación de acceso — **no existe**
- Suspensión temporal — **no existe**
- Cambio de rol de trabajador — **no existe**
- Drawer de detalle del trabajador — **no existe**
- Matriz de Roles × Permisos — **no existe** (página `/admin/staff/roles`)

---

### `src/app/dashboard/` — RUTAS FALTANTES PARA STAFF MANAGEMENT

```
/dashboard/gerente/staff/page.tsx       ✅ Existe (solo Tab 2: generar código)
/dashboard/gerente/staff/roles/         ❌ No existe
/dashboard/supervisor/                  ❌ No existe (ruta completa)
/dashboard/cajero/                      ❌ No existe (ruta completa)
```

**Nota arquitectónica**: El spec dice `/dashboard/admin/staff` pero el código existente usa
`/dashboard/gerente/staff`. La ruta debe mantenerse como `/dashboard/gerente/staff` para
no romper la navegación existente. El sidebar del gerente ya apunta a esa ruta.

---

### No existe `middleware.ts`

El archivo `middleware.ts` **no existe** en ninguna ubicación del proyecto.
La única protección de rutas es client-side en `src/app/dashboard/layout.tsx` línea 14-17:
```typescript
useEffect(() => {
  if (!loading && !user) router.replace("/login")
}, [user, loading, router])
```
Esto es insuficiente — cualquier usuario puede acceder a `/dashboard/gerente` desde la URL
mientras el `useEffect` no ha corrido. No hay Server-side route protection.

---

### Servicios — SIN `staff.service.ts`

```
src/lib/services/
  accesos.service.ts     ✅
  ai.service.ts          ✅
  alerts.service.ts      ✅
  clases.service.ts      ✅
  dashboard.service.ts   ✅ (God Service — no añadir nada aquí)
  gamification.service.ts ✅
  membresias.service.ts  ✅
  pagos.service.ts       ✅
  planes.service.ts      ✅
  usuarios.service.ts    ✅

  staff.service.ts       ❌ NO EXISTE — debe crearse
  codes.service.ts       ❌ NO EXISTE — debe crearse
```

---

## 1.2 Estado de la base de datos

### `public.user_roles` — INCOMPLETA (columnas de revocación)
```sql
-- COLUMNAS EXISTENTES (migración 016):
id, tenant_id, user_id, role_id, assigned_by, assigned_at, expires_at

-- COLUMNAS FALTANTES (necesarias para Staff Management):
revoked_by         UUID REFERENCES auth.users(id)
revocation_reason  TEXT
revocation_type    TEXT CHECK IN ('permanent', 'temporary')
```
Sin estas columnas no se puede implementar STF-005 ni STF-006.

---

### `public.cat_permissions` — PERMISOS FALTANTES
```
PERMISOS ACTUALES (31):  ver migración 016 PASO 1
PERMISOS FALTANTES:
  gym.staff.ver          → autorizar ver lista de trabajadores
  gym.staff.gestionar    → autorizar revocar/suspender/cambiar rol
  gym.evaluaciones.ver   → (para Fase D)
  gym.evaluaciones.gestionar → (para Fase D)
  gym.asistencia.ver     → (para Fase D)
```
Sin `gym.staff.ver` y `gym.staff.gestionar`, las páginas de Staff Management
no tienen permisos RBAC para protegerse.

---

### `public.role_permissions` — ASIGNACIONES FALTANTES
```
Recepcionista: FALTA gym.pagos.crear
  (Contradicción C-02 del Blueprint — el Recepcionista necesita crear pagos
   para cobrar membresías en el mostrador, pero no tiene el permiso en 016)
```

---

### `fn_create_staff_code` — SIN VALIDACIÓN DE max_licenses
La RPC existe (migración 016 PASO 10) pero NO valida el límite de licencias.
Un gym en plan básico con `max_licenses = 5` puede generar códigos ilimitados.

---

### `public.audit_logs` — TRIGGERS FALTANTES PARA STAFF
```
TRIGGERS QUE EXISTEN: no documentados explícitamente en las migraciones revisadas
TRIGGERS QUE FALTAN:
  ROLE_CHANGED     → UPDATE en user_roles cuando role_id cambia
  ROLE_REVOKED     → UPDATE en user_roles cuando expires_at se establece
```
Sin estos triggers, el visor de auditoría no registra las acciones de Staff Management.

---

### `fn_revoke_code` — EXISTE, pero sin RPC para revocar el ROL del usuario
```
fn_revoke_code(p_code_id)    ✅ Existe (invalida un código activo)
fn_revocar_rol(p_user_id)    ❌ No existe (SET expires_at = now() en user_roles)
```
La revocación del acceso de un trabajador requiere una RPC que:
1. Actualice `user_roles.expires_at = now()`
2. Guarde `revoked_by`, `revocation_reason`, `revocation_type`
3. Registre en `audit_logs` con `action = 'ROLE_REVOKED'`

---

## 1.3 Resumen ejecutivo del estado actual

| Área | Estado | Bloqueante |
|------|--------|-----------|
| `fn_create_staff_code` | ✅ Funciona (sin max_licenses) | No para Tab 2 existente |
| Tab 2: Generar código | ✅ Funciona y está en producción | — |
| Tab 1: Lista de trabajadores | ❌ No existe | gym.staff.ver (migración 018) |
| Tab 3: Historial de códigos | ❌ No existe | — |
| Revocación de acceso | ❌ No existe | user_roles sin columnas + sin RPC |
| Suspensión temporal | ❌ No existe | user_roles sin columnas + sin RPC |
| Cambio de rol | ❌ No existe | — |
| Drawer de detalle | ❌ No existe | — |
| Roles Supervisor y Cajero | ❌ Crash en runtime | roles.ts sin supervisor/cajero |
| Route protection server-side | ❌ No existe | No hay middleware.ts |
| Cookie HttpOnly | ❌ Cookie vulnerable | auth-provider.tsx línea 265 |
| Sidebar admin crash | ⚠️ Bug activo | NAV_BY_ROL sin "admin" |

---

# PARTE 2 — IDENTIFICACIÓN COMPLETA

## 2.1 Qué ya existe y es reutilizable

| Elemento | Reutilizable sin cambios | Requiere modificación |
|---------|--------------------------|----------------------|
| `usePermission(permission)` hook | ✅ Total | — |
| `useMyPermissions()` hook | ✅ Total | — |
| `useAuth()` → `hasPermission()` | ✅ Total | — |
| `fn_has_permission(p_permission)` RPC | ✅ Total | — |
| `fn_my_permissions()` RPC | ✅ Total | — |
| `fn_current_tenant_id()` RPC | ✅ Total | — |
| `fn_create_staff_code(...)` RPC | ⚠️ Funciona, pero falta max_licenses | Ampliar en migración 018 |
| `fn_revoke_code(p_code_id)` RPC | ✅ Para revocar códigos | — |
| `supabasePublic` client | ✅ Total | — |
| `supabase` client (gym schema) | ✅ Total | — |
| `AuthProvider` → `permissions[]` | ✅ Total | — |
| `public.user_roles` tabla | ⚠️ Existe, faltan columnas | Migración 018 añade columnas |
| `public.roles` tabla + 7 roles | ✅ Total | — |
| `public.cat_permissions` (31 permisos) | ⚠️ Incompleta | Migración 018 añade 5 más |
| `public.role_permissions` (asignaciones) | ⚠️ Incompleta | Migración 018 corrige Recepcionista |
| `public.code_grants` tabla | ✅ Total | — |
| `public.codes` tabla | ✅ Total | — |
| `public.code_usages` tabla | ✅ Total | — |
| Staff page Tab 2 (generar código) | ✅ Total | Sin cambios en Tab 2 |
| Sidebar visual (componente) | ⚠️ Buggy para admin/supervisor/cajero | Requiere modificación |
| Framer Motion animations | ✅ Total | — |
| `fadeIn`, `staggerContainer`, `scaleIn` de `lib/motion.ts` | ✅ Total | — |
| Estilos CSS variables (`var(--accent)`, etc.) | ✅ Total | — |
| `cn()` utility de `lib/utils.ts` | ✅ Total | — |

---

## 2.2 Qué falta crear (inventario completo)

### Archivos nuevos a crear

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `src/lib/services/staff.service.ts` | Servicio | Queries de staff activo, cambio de rol, revocación |
| `src/lib/services/codes.service.ts` | Servicio | Historial de códigos, revocar código |
| `src/app/dashboard/gerente/staff/components/staff-table.tsx` | Componente | Tabla Tab 1: trabajadores activos |
| `src/app/dashboard/gerente/staff/components/staff-drawer.tsx` | Componente | Drawer de detalle del trabajador (4 tabs) |
| `src/app/dashboard/gerente/staff/components/revoke-modal.tsx` | Componente | Modal revocación definitiva (2 pasos) |
| `src/app/dashboard/gerente/staff/components/suspend-modal.tsx` | Componente | Modal suspensión temporal |
| `src/app/dashboard/gerente/staff/components/role-change-modal.tsx` | Componente | Modal cambio de rol |
| `src/app/dashboard/gerente/staff/components/code-history-table.tsx` | Componente | Tabla Tab 3: historial de códigos |
| `src/app/dashboard/gerente/staff/components/license-kpi.tsx` | Componente | Widget licencias usadas/disponibles |
| `src/app/dashboard/gerente/staff/roles/page.tsx` | Página | Matriz de roles × permisos (solo lectura) |
| `src/app/dashboard/supervisor/page.tsx` | Página | Dashboard MVP del Supervisor |
| `src/app/dashboard/supervisor/layout.tsx` | Layout | Layout del dashboard Supervisor |
| `src/app/dashboard/cajero/page.tsx` | Página | Dashboard MVP del Cajero |
| `src/app/dashboard/cajero/layout.tsx` | Layout | Layout del dashboard Cajero |
| `src/app/actions/staff.actions.ts` | Server Actions | revocarAcceso, suspenderStaff, cambiarRol |
| `src/types/staff.ts` | Tipos | WorkerProfile, RevocationType, StaffFilters |
| `migrations/018_staff_perms_and_fixes.sql` | Migración SQL | Nuevos permisos, columnas, RPC revocación, triggers |

### Archivos existentes a modificar

| Archivo | Cambio necesario |
|---------|-----------------|
| `src/lib/roles.ts` | Añadir `"supervisor"` y `"cajero"` a ROLES + ROL_ROUTES + ROUTE_ALLOWED_ROLES |
| `src/components/providers/auth-provider.tsx` | `isValidRol()` incluir supervisor y cajero · ROL_ROUTES añadir ambos · Corregir cookie a HttpOnly |
| `src/components/app/sidebar.tsx` | NAV_BY_ROL añadir supervisor, cajero, admin · ROL_ACCENT y ROL_LABEL también |
| `src/app/dashboard/gerente/staff/page.tsx` | Convertir en sistema de tabs (Tab 1 + Tab 2 existente + Tab 3) |

---

# PARTE 3 — MIGRACIONES NECESARIAS

## Migración 018 — `018_staff_perms_and_fixes.sql`

Esta es la única migración nueva. Debe ejecutarse antes de cualquier código frontend.

### PASO 1 — Nuevos permisos en `cat_permissions`

```sql
INSERT INTO public.cat_permissions (id, description, module)
  ('gym.staff.ver',             'Ver lista de trabajadores y sus roles',       'gym'),
  ('gym.staff.gestionar',       'Invitar, cambiar rol y revocar accesos staff','gym'),
  ('gym.evaluaciones.ver',      'Ver evaluaciones físicas y nutricionales',    'gym'),
  ('gym.evaluaciones.gestionar','Crear y editar evaluaciones',                 'gym'),
  ('gym.asistencia.ver',        'Ver asistencia a clases',                     'gym')
ON CONFLICT (id) DO NOTHING;
```

### PASO 2 — Asignar nuevos permisos a roles

| Permiso | Admin General | Supervisor | Cajero | Entrenador | Nutricionista | Resto |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| `gym.staff.ver` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `gym.staff.gestionar` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `gym.evaluaciones.ver` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `gym.evaluaciones.gestionar` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `gym.asistencia.ver` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

### PASO 3 — Corrección Recepcionista: añadir `gym.pagos.crear`

```sql
-- Contradicción C-02 del Blueprint: Recepcionista necesita cobrar en mostrador
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, 'gym.pagos.crear'
FROM public.roles r
WHERE r.name = 'Recepcionista'
  AND r.is_system_role = true
ON CONFLICT DO NOTHING;
```

### PASO 4 — Columnas de contexto de revocación en `user_roles`

```sql
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS revoked_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT,
  ADD COLUMN IF NOT EXISTS revocation_type   TEXT CHECK (revocation_type IN ('permanent','temporary'));
```

### PASO 5 — Nueva RPC `fn_revocar_acceso_staff`

Atomiza en una sola transacción:
1. `UPDATE public.user_roles SET expires_at = now(), revoked_by = ..., revocation_reason = ..., revocation_type = ...`
2. `INSERT INTO public.audit_logs (action = 'ROLE_REVOKED', actor_id, target_id, metadata)`

Signature:
```sql
fn_revocar_acceso_staff(
  p_target_user_id UUID,
  p_motivo         TEXT,
  p_tipo           TEXT  -- 'permanent' | 'temporary'
) RETURNS JSONB
```

Requiere: `fn_has_permission('gym.staff.gestionar')` = TRUE, mismo tenant.

### PASO 6 — Nueva RPC `fn_cambiar_rol_staff`

Atomiza:
1. `UPDATE public.user_roles SET role_id = $nuevo_rol`
2. `UPDATE gym.usuarios SET rol = $string_nuevo_rol WHERE auth_user_id = $target`
3. `INSERT INTO audit_logs (action = 'ROLE_CHANGED', old_role, new_role)`

Nota: La actualización del JWT (`app_metadata.role`) se hace en el Server Action de Next.js
con `supabase.auth.admin.updateUser()` — no en la RPC (auth.admin no disponible en PL/pgSQL).

### PASO 7 — Triggers de `audit_logs` para Staff Management

```sql
-- Trigger ROLE_REVOKED: detecta cuando expires_at cambia de NULL a un valor
CREATE OR REPLACE FUNCTION trg_audit_role_revoked() ...

-- Trigger ROLE_CHANGED: detecta cuando role_id cambia
CREATE OR REPLACE FUNCTION trg_audit_role_changed() ...
```

Formato de cada fila en audit_logs:
```
actor_id:     auth.uid() del admin que ejecuta la acción
action:       'ROLE_REVOKED' | 'ROLE_CHANGED'
target_table: 'public.user_roles'
target_id:    UUID del user_roles afectado
old_data:     JSONB con valores anteriores
new_data:     JSONB con valores nuevos (motivo, tipo, etc.)
tenant_id:    fn_current_tenant_id()
created_at:   now()
```

### PASO 8 — Validación `max_licenses` en `fn_create_staff_code`

```sql
-- Añadir al inicio de fn_create_staff_code, antes del INSERT:
SELECT max_licenses INTO v_max FROM public.tenants WHERE id = p_tenant_id;
SELECT COUNT(*) INTO v_active_staff
FROM public.user_roles
WHERE tenant_id = p_tenant_id
  AND (expires_at IS NULL OR expires_at > now());

IF v_max IS NOT NULL AND v_active_staff >= v_max THEN
  RETURN jsonb_build_object(
    'ok', false, 'error', 'LIMIT_REACHED',
    'current', v_active_staff, 'max', v_max
  );
END IF;
```

### PASO 9 — Verificación final

```sql
-- SELECT que confirma todos los nuevos permisos existen
SELECT id FROM public.cat_permissions
WHERE id IN ('gym.staff.ver','gym.staff.gestionar','gym.evaluaciones.ver',
             'gym.evaluaciones.gestionar','gym.asistencia.ver');

-- SELECT que confirma columnas de revocación existen
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_roles'
  AND column_name IN ('revoked_by','revocation_reason','revocation_type');
```

---

# PARTE 4 — RPCs NECESARIAS

## RPCs existentes (usar sin cambios)

| RPC | Schema | Usar para |
|-----|--------|-----------|
| `fn_has_permission(p_permission)` | public | Verificar acceso antes de cualquier operación |
| `fn_my_permissions()` | public | Cargar permisos al inicio de sesión (AuthProvider) |
| `fn_current_tenant_id()` | public | Obtener tenant del usuario autenticado |
| `fn_create_staff_code(...)` | public | Tab 2: generar código (ya funciona, ampliar con max_licenses) |
| `fn_revoke_code(p_code_id)` | public | Revocar código activo en Tab 3 |
| `fn_validate_code(p_code, p_tenant_id)` | public | Validar código en el formulario de signup |

## RPCs nuevas a crear en migración 018

| RPC | Propósito | Input | Output |
|-----|-----------|-------|--------|
| `fn_revocar_acceso_staff(p_target_user_id, p_motivo, p_tipo)` | Revocar acceso de un trabajador de forma atómica | UUID del trabajador, motivo obligatorio, tipo permanent/temporary | `{ ok: boolean, error?: string }` |
| `fn_cambiar_rol_staff(p_target_user_id, p_nuevo_role_id)` | Cambiar el rol RBAC de un trabajador (la parte SQL) | UUID trabajador, UUID nuevo rol | `{ ok: boolean, old_role_name: string, new_role_name: string }` |

## Queries como Server Actions (no RPCs SQL)

Estas operaciones se hacen en Server Actions de Next.js usando el cliente con `service_role`:

| Server Action | Propósito | Por qué Server Action y no RPC |
|--------------|-----------|-------------------------------|
| `syncRoleToJWT(userId, newRole)` | Llama a `supabase.auth.admin.updateUser` para actualizar `app_metadata.role` en el JWT | `auth.admin` no está disponible en PL/pgSQL |
| `getActiveStaff(tenantId)` | Lista todos los trabajadores activos con sus roles RBAC | Query compleja con JOINs — más fácil como Server Action |
| `getCodeHistory(tenantId, filters)` | Historial de códigos con filtros | — |

---

# PARTE 5 — PÁGINAS FRONTEND NECESARIAS

## Páginas a crear (nuevas)

| Página | Ruta | Prioridad | Depende de |
|--------|------|-----------|------------|
| Dashboard Supervisor MVP | `/dashboard/supervisor/page.tsx` | Alta | roles.ts + sidebar actualizados |
| Layout Supervisor | `/dashboard/supervisor/layout.tsx` | Alta | — |
| Dashboard Cajero MVP | `/dashboard/cajero/page.tsx` | Alta | roles.ts + sidebar actualizados |
| Layout Cajero | `/dashboard/cajero/layout.tsx` | Alta | — |
| Matriz de Permisos | `/dashboard/gerente/staff/roles/page.tsx` | Media | Migración 018 (gym.staff.gestionar) |

## Páginas a modificar

| Página | Ruta | Cambio |
|--------|------|--------|
| Staff Management | `/dashboard/gerente/staff/page.tsx` | Convertir en 3 tabs: Tab 1 (nuevo) + Tab 2 (existente, sin cambios) + Tab 3 (nuevo) |

## Componentes de página a crear (co-ubicados con la página)

```
src/app/dashboard/gerente/staff/
  page.tsx                           ← MODIFICAR: añadir sistema de tabs
  components/
    staff-table.tsx                  ← NUEVO: Tab 1 — lista trabajadores activos
    staff-drawer.tsx                 ← NUEVO: Drawer detalle (Info + Actividad + Permisos + Código)
    revoke-modal.tsx                 ← NUEVO: Modal revocación 2 pasos
    suspend-modal.tsx                ← NUEVO: Modal suspensión temporal
    role-change-modal.tsx            ← NUEVO: Modal cambio de rol
    code-history-table.tsx           ← NUEVO: Tab 3 — historial de códigos
    license-kpi-bar.tsx              ← NUEVO: Widget licencias (X de Y usadas)
    staff-filters.tsx                ← NUEVO: Filtros de la tabla de staff
  roles/
    page.tsx                         ← NUEVO: Matriz permisos × roles (solo lectura)
```

---

# PARTE 6 — COMPONENTES NECESARIOS

## Componentes de infraestructura (reutilizables en todo el sistema)

Estos componentes no existen en el proyecto y son necesarios tanto para Staff Management
como para todos los módulos futuros. Se construyen UNA VEZ y se usan en todo el sistema.

### Tier 1 — Primeros antes del módulo

| Componente | Ruta | Propósito | Consumido por en Staff Mgmt |
|-----------|------|-----------|------------------------------|
| `<ConfirmModal />` | `src/components/ui/confirm-modal.tsx` | Modal de confirmación con variantes default/destructive. Props: title, description, confirmLabel, onConfirm, variant | revoke-modal, suspend-modal, role-change-modal |
| `<StatusBadge />` | `src/components/ui/status-badge.tsx` | Badge semántico coloreado. Props: status, size. Variantes: activo/suspendido/revocado/expirado/por-expirar | staff-table, code-history-table |
| `<RoleBadge />` | `src/components/ui/role-badge.tsx` | Badge específico de rol con color canónico del sistema (Supervisor=naranja, Cajero=verde, etc.) | staff-table, staff-drawer |
| `<ActionMenu />` | `src/components/ui/action-menu.tsx` | Menú contextual ⋮ para filas de tabla. Props: items[{ label, icon, onClick, variant }] | staff-table |
| `<EmptyState />` | `src/components/ui/empty-state.tsx` | Estado vacío con ilustración, título, descripción, CTA. Ya existe un patrón inline en staff/page.tsx — extraer a componente | staff-table, code-history-table |
| `<Drawer />` | `src/components/ui/drawer.tsx` | Panel lateral 400px con header fijo + contenido scrolleable + footer. Animación slide desde derecha | staff-drawer |

### Tier 2 — Con el módulo

| Componente | Ruta | Propósito |
|-----------|------|-----------|
| `<TabBar />` | `src/components/ui/tab-bar.tsx` | Sistema de tabs (underline o pill). Props: tabs[], activeTab, onChange. Para los 3 tabs de staff page |
| `<Avatar />` | `src/components/ui/avatar.tsx` | Avatar con fallback a iniciales. Props: name, url, size. Extrae el patrón inline ya usado en sidebar |
| `<OccupancyBar />` | `src/components/ui/occupancy-bar.tsx` | Barra visual X/Y con porcentaje. Para licencias usadas |
| `<DataTable />` | `src/components/ui/data-table.tsx` | Tabla con skeleton, estado vacío, estado error, paginación. Base para staff-table y code-history-table |
| `<SearchInput />` | `src/components/ui/search-input.tsx` | Input con debounce, ícono lupa, botón clear. Para filtros de staff |
| `<StepModal />` | `src/components/ui/step-modal.tsx` | Modal de múltiples pasos con indicador de progreso. Para el flujo de revocación de 2 pasos |

---

# PARTE 7 — HOOKS NECESARIOS

## Hooks nuevos a crear

| Hook | Ruta | Propósito | Retorna |
|------|------|-----------|---------|
| `useStaff(filters?)` | `src/hooks/useStaff.ts` | Carga la lista de trabajadores activos del tenant con sus roles. Reutiliza `useAuth()` para el `bd_tenant_id` | `{ staff: WorkerProfile[], isLoading, error, refetch }` |
| `useCodes(filters?)` | `src/hooks/useCodes.ts` | Historial de códigos del tenant con filtros opcionales | `{ codes: CodeRecord[], isLoading, error, refetch }` |
| `useLicenses()` | `src/hooks/useLicenses.ts` | Conteo de licencias: activas vs máximas del plan. Lee de `public.tenants.max_licenses` + conteo de `user_roles` activos | `{ used: number, max: number \| null, isAtLimit: boolean }` |
| `usePermissionMatrix()` | `src/hooks/usePermissionMatrix.ts` | Carga la matriz completa de roles × permisos para la página de Roles | `{ roles: Role[], permissions: Permission[], matrix: Record<roleId, Set<permission>>, isLoading }` |

## Hooks existentes reutilizables sin cambios

| Hook | Usar para |
|------|-----------|
| `usePermission("gym.staff.ver")` | Guard de acceso a la Tab 1 y Tab 3 |
| `usePermission("gym.staff.gestionar")` | Guard para acciones de revocación, suspensión, cambio de rol |
| `usePermission("gym.codigos.ver")` | Guard para la Tab 3 (historial de códigos) |
| `useAuth()` → `user.bd_tenant_id` | Obtener el `tenant_id` para todas las queries |
| `useAuth()` → `hasPermission()` | Verificación de permisos en componentes (no requiere RPC adicional) |

---

# PARTE 8 — TIPOS TYPESCRIPT NECESARIOS

Crear en `src/types/staff.ts`:

```
WorkerProfile {
  user_id:          string         // auth.users.id
  nombre:           string
  email:            string
  foto_url:         string | null
  rol_string:       string         // gym.usuarios.rol (para routing)
  role_id:          string         // public.roles.id
  role_name:        string         // "Recepcionista", "Cajero", etc.
  hierarchy_level:  number
  status:           'active' | 'suspended' | 'revoked' | 'expiring_soon'
  expires_at:       string | null  // ISO timestamp
  revoked_by:       string | null
  revocation_reason: string | null
  revocation_type:  'permanent' | 'temporary' | null
  assigned_at:      string         // Fecha de incorporación
  last_activity_at: string | null  // Desde audit_logs
  last_activity_desc: string | null
}

CodeRecord {
  code_id:          string
  code:             string          // El código texto (ej: GYM-4F2K-8X9M)
  role_id:          string
  role_name:        string
  status:           'active' | 'used' | 'expired' | 'revoked'
  created_by:       string
  created_by_name:  string
  created_at:       string
  used_by:          string | null
  used_by_name:     string | null
  used_at:          string | null
  expires_at:       string | null
  current_uses:     number
  max_uses:         number
  description:      string | null
}

RevokePayload {
  motivo:          string   // obligatorio
  tipo:            'permanent' | 'temporary'
  reactivation_at?: string  // solo si tipo = 'temporary'
}

RoleChangePayload {
  nuevo_role_id:   string
  nuevo_role_name: string
}

StaffFilters {
  rol?:       string
  status?:    'active' | 'suspended' | 'all'
  activity?:  'this_week' | 'inactive_7d' | 'all'
  search?:    string
}
```

---

# PARTE 9 — RIESGOS

## Riesgos de Seguridad

### RS-01 — Cookie gymsos_rol sin HttpOnly (CRÍTICO, activo hoy)
**Archivo**: `src/components/providers/auth-provider.tsx` línea 265
**Código actual**: `document.cookie = 'gymsos_rol=${profile.rol}; path=/; max-age=86400; SameSite=Lax'`
**Riesgo**: Sin `HttpOnly`, la cookie es legible por JavaScript. Un script XSS puede leer
el rol del usuario. El middleware (cuando se cree) que lea esta cookie es bypasseable por un attacker.
**Resolución en este plan**: La cookie se puede marcar `HttpOnly` desde un Server Action o
una API Route al hacer login, no desde `document.cookie`. Requiere mover el set de cookie
al lado del servidor. **O bien**: eliminar la cookie completamente y que el middleware lea
el rol desde el JWT de Supabase (`session.user.app_metadata.role`).
**Decisión que debe tomarse**: ¿Se migra a JWT claims ahora o después de Staff Management?
Recomendación: hacerlo ANTES. El riesgo de tener la cookie insegura en producción es mayor
que el costo de cambiar el middleware.

### RS-02 — Supervisor y Cajero caen como `miembro` (CRÍTICO, activo hoy)
**Archivo**: `auth-provider.tsx` línea 114 + `isValidRol()` línea 134
**Impacto**: Un trabajador Supervisor registrado con el código correcto y con `user_roles`
asignado en la BD, al hacer login cae al dashboard de miembro y ve su membresía.
Sus permisos RBAC existen en la BD pero son inaccesibles porque el routing lo manda al lugar equivocado.
**Resolución**: Añadir `supervisor` y `cajero` a `isValidRol()`, `ROLES`, `ROL_ROUTES`.

### RS-03 — Crash en Sidebar para rol `admin` (BUG ACTIVO)
**Archivo**: `src/components/app/sidebar.tsx` línea 101
**Código**: `const nav = NAV_BY_ROL[user.rol]` → retorna `undefined` para `admin`
**Línea 162**: `nav.map(...)` → `TypeError: Cannot read properties of undefined (reading 'map')`
El usuario con `rol = "admin"` ve la pantalla de crash o un spinner infinito.
**Resolución**: Añadir `admin` a `NAV_BY_ROL` con los mismos items que `gerente`.

### RS-04 — No hay Server-side route protection (ALTO)
**Estado**: No existe `middleware.ts`.
Solo hay un `useEffect` en `dashboard/layout.tsx` que redirige si no hay usuario.
Cualquier usuario puede navegar directamente a `/dashboard/gerente` y ver brevemente
el contenido antes de que el `useEffect` corra.
**Para Staff Management**: Un recepcionista puede intentar navegar a `/dashboard/gerente/staff`
con la URL directamente. El `usePermission("gym.staff.ver")` en la página lo bloqueará,
pero solo después de cargar el componente, hacer la llamada RPC y recibir `false`.
Esto es UX malo y potencialmente expone datos en el skeleton.
**Decisión**: ¿Crear middleware.ts en este sprint? Recomendación: SÍ para las rutas de staff.

### RS-05 — Server Action de cambio de rol requiere service_role key
**Para `syncRoleToJWT()`**: Se necesita `supabase.auth.admin.updateUser()`.
Esto requiere la `SERVICE_ROLE_KEY` que **no debe estar en el cliente**.
La key debe estar en variables de entorno del servidor (sin prefijo `NEXT_PUBLIC_`).
**Riesgo**: Si se implementa incorrectamente, la service_role key queda expuesta.
**Resolución**: Usar Server Actions de Next.js (ejecutan solo en el servidor). Verificar
que `SUPABASE_SERVICE_ROLE_KEY` no tenga prefijo `NEXT_PUBLIC_` en `.env.local`.

---

## Riesgos Técnicos

### RT-01 — No existe `middleware.ts` para protección de rutas (ALTO)
El sistema de tabs de la Staff page usa `usePermission()` que hace una RPC call.
Si el usuario no tiene el permiso, ve el skeleton + luego el estado "sin acceso".
Esto es aceptable para la implementación actual. El middleware puede agregarse en un
sprint separado sin bloquear Staff Management.

### RT-02 — Refactoring del staff/page.tsx (MEDIO)
La página actual es un monolito (`page.tsx` de 714 líneas, todo inline).
Convertirla en un sistema de 3 tabs requiere refactoring cuidadoso para no romper
el Tab 2 que ya funciona en producción.
**Estrategia**: Extraer el contenido actual del formulario (líneas 317-712) a un componente
`<GenerateCodeTab />` y envolverlo en el sistema de tabs. Sin tocar la lógica interna.

### RT-03 — La query de "lista de trabajadores" cruza dos schemas (MEDIO)
```sql
-- Necesita JOIN entre:
public.user_roles    (schema: public  → usar supabasePublic)
public.roles         (schema: public)
gym.usuarios         (schema: gym    → usar supabase)
```
Supabase JS no puede hacer un JOIN cross-schema directamente desde el cliente.
**Opciones**:
- (A) Server Action que use `service_role` y haga el JOIN en SQL raw
- (B) Dos queries separadas y hacer el merge en el servidor
- (C) Una RPC `fn_get_staff_activo(p_tenant_id)` en la BD que haga el JOIN internamente

**Recomendación**: Opción C — RPC en la BD. Es más eficiente, no expone el service_role,
y el query se puede optimizar con índices. Esta RPC va en la migración 018.

### RT-04 — Drawer de detalle carga historial de audit_logs (BAJO)
El Tab "Actividad" del drawer consulta `public.audit_logs` filtrado por `actor_id`.
Si el trabajador tiene muchas acciones, la query puede ser lenta sin índice apropiado.
**Verificar**: que existe `INDEX ON public.audit_logs(actor_id, tenant_id)` antes de implementar.

---

## Riesgos Multi-tenant

### RMT-01 — getActiveStaff sin filtro de tenant retornaría todos los trabajadores del sistema
La query de la Tab 1 DEBE incluir `tenant_id = fn_current_tenant_id()` en `user_roles`.
Si se usa `supabasePublic.from("user_roles").select(...)` sin el filtro de tenant,
la RLS lo filtra automáticamente. Pero si se usa el cliente con `service_role`, no hay RLS.
**Regla**: En la RPC `fn_get_staff_activo(p_tenant_id)`, la función valida que
`p_tenant_id = fn_current_tenant_id()` antes de ejecutar el SELECT.

### RMT-02 — `fn_revocar_acceso_staff` debe verificar mismo tenant
La RPC de revocación recibe `p_target_user_id`. Debe verificar que ese usuario
pertenece al mismo tenant del invocador antes de establecer `expires_at`.
Sin esta verificación, un admin del Gym A podría revocar el acceso de un trabajador del Gym B.

---

## Riesgos RBAC

### RRBAC-01 — Sincronización de gym.usuarios.rol y app_metadata.role al cambiar rol
Al usar `fn_cambiar_rol_staff`, se actualiza `user_roles.role_id` en la BD.
Pero `gym.usuarios.rol` (string legacy) y `app_metadata.role` en el JWT también deben actualizarse.
Si no se sincronizan, el trabajador ve el dashboard del rol antiguo en su próxima sesión.
**La actualización es en 3 capas**:
1. `public.user_roles` → RPC SQL
2. `gym.usuarios.rol` → RPC SQL (mismo bloque)
3. `auth.users.app_metadata.role` → Server Action con `supabase.auth.admin.updateUser`

### RRBAC-02 — El admin `admin` y el `gerente` comparten el mismo dashboard
En `auth-provider.tsx` y `roles.ts`, el rol `admin` apunta a `/dashboard/gerente`.
En la nueva implementación, el gerente tiene `gym.staff.ver` y `gym.staff.gestionar`.
El `admin` (super-admin) debería también tener acceso. Verificar que el rol `admin`
en la BD tiene todos los permisos del `Administrador General`.
Si no: añadir los permisos al rol `admin` en la migración 018.

---

# PARTE 10 — ORDEN EXACTO DE IMPLEMENTACIÓN

## Precondición obligatoria: Migración 018 aplicada en Supabase

**ANTES de escribir una sola línea de código frontend, la migración 018 debe estar
aplicada y verificada. Sin ella, las Tab 1 y Tab 3 no tienen permisos RBAC para funcionar.**

---

## Paso 1 — Correcciones de infraestructura (BLOQUEANTES, sin esto nada funciona)

**Orden estricto:**

```
1.1 roles.ts
    + añadir "supervisor" y "cajero" a ROLES
    + añadir entradas en ROL_ROUTES
    + añadir entradas en ROUTE_ALLOWED_ROLES

1.2 auth-provider.tsx
    + isValidRol(): añadir "supervisor" y "cajero"
    + ROL_ROUTES interno: añadir entradas para ambos
    + Corregir cookie a HttpOnly (mover el set a Server Action o API Route)

1.3 sidebar.tsx
    + NAV_BY_ROL: añadir supervisor, cajero, admin
    + ROL_ACCENT: añadir admin
    + ROL_LABEL: añadir admin, supervisor, cajero

1.4 Verificar: iniciar sesión con cada uno de los 7 roles y confirmar que
    llegan al dashboard correcto sin crash
```

## Paso 2 — Crear tipos de dominio

```
2.1 src/types/staff.ts → WorkerProfile, CodeRecord, RevokePayload, etc.
    (sin esto los componentes no tienen tipado)
```

## Paso 3 — Crear componentes de infraestructura (Tier 1)

```
3.1 src/components/ui/status-badge.tsx
3.2 src/components/ui/role-badge.tsx
3.3 src/components/ui/action-menu.tsx
3.4 src/components/ui/drawer.tsx
3.5 src/components/ui/confirm-modal.tsx
3.6 src/components/ui/step-modal.tsx
3.7 src/components/ui/tab-bar.tsx
3.8 src/components/ui/data-table.tsx
    (cada componente tiene sus propios tipos y estados vacíos)
```

## Paso 4 — Crear servicios (sin dependencia de los componentes)

```
4.1 src/lib/services/staff.service.ts
    + getActiveStaff(tenantId, filters?)  → WorkerProfile[]
    + getWorkerActivity(userId, tenantId) → ActivityEvent[]
    + getWorkerPermissions(userId, tenantId) → Permission[]
    Notas: Las queries cross-schema llaman a la RPC fn_get_staff_activo

4.2 src/lib/services/codes.service.ts
    + getCodeHistory(tenantId, filters?) → CodeRecord[]
    + revokeCode(codeId)                 → boolean
```

## Paso 5 — Crear hooks

```
5.1 src/hooks/useStaff.ts
5.2 src/hooks/useCodes.ts
5.3 src/hooks/useLicenses.ts
```

## Paso 6 — Crear Server Actions

```
6.1 src/app/actions/staff.actions.ts
    + revocarAcceso(targetUserId, payload: RevokePayload)
    + suspenderStaff(targetUserId, payload)
    + cambiarRol(targetUserId, payload: RoleChangePayload)
    + reactivarStaff(targetUserId)
    Cada action: verifica session → llama RPC → llama syncRoleToJWT si aplica
```

## Paso 7 — Construir componentes de Staff Management

```
7.1 license-kpi-bar.tsx        (más simple — solo datos numéricos)
7.2 staff-filters.tsx          (estado local, sin BD)
7.3 staff-table.tsx            (usa useStaff, DataTable, RoleBadge, ActionMenu, StatusBadge)
7.4 staff-drawer.tsx           (usa Drawer, tabs internos, staff.service)
7.5 role-change-modal.tsx      (usa ConfirmModal, llama cambiarRol action)
7.6 suspend-modal.tsx          (usa ConfirmModal + DatePicker, llama suspenderStaff action)
7.7 revoke-modal.tsx           (usa StepModal, llama revocarAcceso action)
7.8 code-history-table.tsx     (usa useCodes, DataTable)
```

## Paso 8 — Modificar staff/page.tsx (convertir a tabs)

```
8.1 Extraer el formulario actual (Tab 2) a un componente <GenerateCodeTab />
    SIN cambiar su lógica interna
8.2 Añadir TabBar con: "Equipo" | "Invitar" | "Códigos"
8.3 Tab 1: renderiza <StaffTable /> + <LicenseKpiBar />
8.4 Tab 2: renderiza <GenerateCodeTab /> (sin cambios funcionales)
8.5 Tab 3: renderiza <CodeHistoryTable />
```

## Paso 9 — Crear dashboards de Supervisor y Cajero (MVPs)

```
9.1 /dashboard/supervisor/layout.tsx  → igual estructura que gerente/layout
9.2 /dashboard/supervisor/page.tsx    → 4 KPIs + acciones del turno (datos mock inicialmente)
9.3 /dashboard/cajero/layout.tsx
9.4 /dashboard/cajero/page.tsx        → 3 KPIs + barra de búsqueda prominente
```

## Paso 10 — Crear página de Roles y Permisos (opcional para este sprint)

```
10.1 /dashboard/gerente/staff/roles/page.tsx
     Tabla cruzada: filas = permisos agrupados por módulo, columnas = 7 roles
     Solo lectura en este sprint. Sin checkboxes editables (Fase C).
```

## Paso 11 — Testing y verificación

```
11.1 TEST-STF-001: La Tab 1 solo muestra trabajadores del tenant del admin
11.2 TEST-STF-002: Admin revoca a un trabajador → user_roles.expires_at = now()
11.3 TEST-STF-003: Gym con max_licenses = 2, 2 staff activos → botón "Generar" deshabilitado
11.4 TEST-STF-004: Al cambiar el rol → gym.usuarios.rol actualizado + app_metadata.role actualizado
11.5 TEST-STF-005: El botón "Confirmar revocación" está disabled hasta marcar el checkbox
11.6 TEST-STF-006: Un trabajador revocado no puede ejecutar ninguna operación (fn_has_permission retorna false)
11.7 TEST-ROLS-001: Los 7 roles pueden iniciar sesión sin crash de sidebar
11.8 TEST-ROLS-002: Supervisor llega a /dashboard/supervisor, no a /dashboard/miembro
```

---

# RESUMEN — INVENTARIO DE TRABAJO

## Migraciones
| # | Archivo | Estado | Sprint |
|---|---------|--------|--------|
| 018 | `018_staff_perms_and_fixes.sql` | ❌ Crear | Antes de Sprint 1 |

## RPCs
| # | RPC | Estado | Sprint |
|---|-----|--------|--------|
| 1 | `fn_get_staff_activo(p_tenant_id)` | ❌ Crear en migración 018 | Pre-Sprint |
| 2 | `fn_revocar_acceso_staff(target, motivo, tipo)` | ❌ Crear en migración 018 | Pre-Sprint |
| 3 | `fn_cambiar_rol_staff(target, nuevo_role_id)` | ❌ Crear en migración 018 | Pre-Sprint |

## Páginas
| # | Ruta | Estado | Sprint |
|---|------|--------|--------|
| 1 | `/dashboard/gerente/staff/page.tsx` | ⚠️ Modificar (tab system) | Sprint 1 |
| 2 | `/dashboard/gerente/staff/roles/page.tsx` | ❌ Crear | Sprint 1 |
| 3 | `/dashboard/supervisor/page.tsx` + layout | ❌ Crear | Sprint 1 |
| 4 | `/dashboard/cajero/page.tsx` + layout | ❌ Crear | Sprint 1 |

## Componentes UI reutilizables (nuevos)
| # | Componente | Ruta |
|---|-----------|------|
| 1 | `<StatusBadge />` | `src/components/ui/status-badge.tsx` |
| 2 | `<RoleBadge />` | `src/components/ui/role-badge.tsx` |
| 3 | `<ActionMenu />` | `src/components/ui/action-menu.tsx` |
| 4 | `<Drawer />` | `src/components/ui/drawer.tsx` |
| 5 | `<ConfirmModal />` | `src/components/ui/confirm-modal.tsx` |
| 6 | `<StepModal />` | `src/components/ui/step-modal.tsx` |
| 7 | `<TabBar />` | `src/components/ui/tab-bar.tsx` |
| 8 | `<DataTable />` | `src/components/ui/data-table.tsx` |
| 9 | `<SearchInput />` | `src/components/ui/search-input.tsx` |

## Componentes de módulo (co-ubicados)
| # | Componente | Ruta |
|---|-----------|------|
| 1 | `<GenerateCodeTab />` | `...staff/components/generate-code-tab.tsx` (extraído) |
| 2 | `<StaffTable />` | `...staff/components/staff-table.tsx` |
| 3 | `<StaffDrawer />` | `...staff/components/staff-drawer.tsx` |
| 4 | `<RevokeModal />` | `...staff/components/revoke-modal.tsx` |
| 5 | `<SuspendModal />` | `...staff/components/suspend-modal.tsx` |
| 6 | `<RoleChangeModal />` | `...staff/components/role-change-modal.tsx` |
| 7 | `<CodeHistoryTable />` | `...staff/components/code-history-table.tsx` |
| 8 | `<LicenseKpiBar />` | `...staff/components/license-kpi-bar.tsx` |
| 9 | `<StaffFilters />` | `...staff/components/staff-filters.tsx` |

## Servicios
| # | Archivo | Estado |
|---|---------|--------|
| 1 | `src/lib/services/staff.service.ts` | ❌ Crear |
| 2 | `src/lib/services/codes.service.ts` | ❌ Crear |

## Hooks
| # | Archivo | Estado |
|---|---------|--------|
| 1 | `src/hooks/useStaff.ts` | ❌ Crear |
| 2 | `src/hooks/useCodes.ts` | ❌ Crear |
| 3 | `src/hooks/useLicenses.ts` | ❌ Crear |

## Server Actions
| # | Archivo | Estado |
|---|---------|--------|
| 1 | `src/app/actions/staff.actions.ts` | ❌ Crear |

## Tipos
| # | Archivo | Estado |
|---|---------|--------|
| 1 | `src/types/staff.ts` | ❌ Crear |

## Archivos a modificar
| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/lib/roles.ts` | Añadir supervisor, cajero |
| 2 | `src/components/providers/auth-provider.tsx` | isValidRol, ROL_ROUTES, cookie HttpOnly |
| 3 | `src/components/app/sidebar.tsx` | NAV_BY_ROL admin/supervisor/cajero, ROL_ACCENT, ROL_LABEL |

---

## Decisiones pendientes antes de escribir código

| # | Decisión | Opciones | Impacto |
|---|---------|---------|---------|
| D1 | ¿Mover el set de cookie `gymsos_rol` al servidor ahora (HttpOnly) o en sprint posterior? | (A) Ahora — más seguro pero requiere API Route o Server Action para login; (B) Después — deuda de seguridad documentada | Afecta auth-provider.tsx y la estrategia del middleware |
| D2 | ¿Crear `middleware.ts` en este sprint para las rutas de staff? | (A) Sí — protección server-side para `/dashboard/gerente/staff`; (B) No — usar solo client-side `usePermission()` | Afecta seguridad pero no funcionalidad visible |
| D3 | ¿La lista de staff activo se obtiene vía RPC SQL o vía dos queries + merge en Server Action? | (A) RPC `fn_get_staff_activo` — recomendado (query en BD, JOIN interno); (B) Dos queries separadas + merge en TS | Afecta migración 018 y staff.service.ts |
| D4 | ¿El dashboard de Supervisor y Cajero va en `/dashboard/supervisor` o en `/dashboard/gerente` con parámetro de rol? | (A) Rutas propias `/dashboard/supervisor` — spec y backlog dicen esto; (B) Una ruta con config por rol | Afecta roles.ts, sidebar.tsx, middleware |

**Recomendación del Technical Lead**: D1=A, D2=A, D3=A, D4=A. Las opciones A en todos los casos
son las que cumplen el Blueprint Definitivo sin compromiso de seguridad.

---

*Plan Técnico de Staff Management — GYMsos v1.0*
*2026-06-03 · Basado en auditoría del código real + documentación de referencia*
*Próximo paso: Aprobar las 4 decisiones pendientes → iniciar con migración 018*
