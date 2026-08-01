# BACKLOG TÉCNICO COMPLETO — GYMSOS OPERATING SYSTEM
> **Versión**: 1.0 · **Fecha**: 2026-06-03
> **Fuente de verdad**: Auditoría v1 (1.md) · Auditoría v2 (2.md) · Especificación Funcional (3.md) · Blueprint Definitivo (4.md) · Especificación UX/UI (UX-UI-SPEC-PARTE1-4.md)
> **Propósito**: Este backlog es el contrato de construcción de GYMsos. Cada historia de usuario tiene criterios de aceptación verificables, dependencias explícitas y relación directa con los GAPs y DAs del Blueprint.

---

## CONVENCIONES

**Formato de ID**: `[ÉPICA]-[NÚMERO]`
- `SEG` — Seguridad y Autenticación
- `ROL` — Roles y Dashboards
- `STF` — Staff Management
- `COD` — Códigos de Invitación
- `MBR` — Gestión de Miembros
- `MEM` — Membresías y Pagos
- `ACC` — Control de Accesos
- `CLS` — Clases y Agenda
- `NUT` — Nutrición y Evaluaciones
- `ANA` — Analytics y Reportes
- `AUD` — Auditoría
- `CFG` — Configuración del Gym
- `MBM` — Experiencia del Miembro
- `IA`  — IA y Diferenciadores
- `SAS` — Escalabilidad SaaS

**Estimación (Story Points — Fibonacci):**
- `1` — Trivial: cambio de configuración, texto, redirect
- `2` — Pequeño: UI simple sobre datos existentes
- `3` — Mediano: UI + lógica simple
- `5` — Normal: UI + lógica de negocio + test
- `8` — Grande: múltiples componentes + migración o RPC
- `13` — Muy grande: feature completa multi-capa
- `21` — Épica: debe descomponerse más

**Prioridad:**
- `P0` — Bloqueante de seguridad o integridad de datos
- `P1` — Core operativo — bloquea la operación diaria sin esto
- `P2` — Mejora significativa de experiencia
- `P3` — Feature diferenciadora / aspiracional

**Estado de la infraestructura (qué ya existe en BD):**
- ✅ Tabla/RPC existe y funciona
- 🟡 Tabla existe, incompleta o con gaps
- ❌ No existe, necesita migración

---

## FASE A — SEGURIDAD Y ESTRUCTURA FUNDAMENTAL
**Duración estimada**: Sprint 1 (~2 semanas)
**Objetivo**: El sistema es seguro. Todos los roles pueden iniciar sesión. Las vulnerabilidades P0 están eliminadas.
**Total SP estimados**: ~65 puntos

---

# ÉPICA 1 — SEGURIDAD Y AUTENTICACIÓN (SEG)

Resuelve: GAP-C01, GAP-C05, GAP-C04, GAP-C05, H-01 (hallazgo crítico del Blueprint)

---

## SEG-001 — JWT claim para el rol del usuario
**Como** sistema de autenticación,
**quiero** que el rol del usuario esté almacenado en los JWT claims (`app_metadata.role`)
**para que** el middleware de Next.js pueda leer el rol sin depender de una cookie JavaScript manipulable.

**Prioridad**: P0 | **SP**: 5
**Resolves**: GAP-C05 (cookie gymsos_rol legible por JavaScript) · DA-02

**Criterios de aceptación:**
1. Al crearse un usuario (onboarding CASO A), `app_metadata.role` se establece como `"gerente"` en Supabase Auth vía `supabase.auth.admin.updateUser`
2. Al crearse un trabajador (signup CASO B con staff_code), `app_metadata.role` se establece con el string del rol derivado del `code_grants`
3. El campo `app_metadata.role` existe y es legible en el JWT del usuario en cualquier sesión activa
4. Si el rol cambia en `gym.usuarios.rol`, `app_metadata.role` se actualiza en el mismo flujo (no con delay)
5. El trigger `handle_new_user` o el flujo de signup llama a `supabase.auth.admin.updateUser` con el `app_metadata.role` correcto

**Dependencias técnicas:**
- Service role key disponible en el servidor (no en cliente)
- `handle_new_user` trigger o Server Action en el flujo de registro

**Archivos afectados**: `handle_new_user` (SQL), `auth.ts` o Server Action de signup

---

## SEG-002 — Middleware lee rol desde JWT (no desde cookie)
**Como** middleware de Next.js,
**quiero** leer el rol del usuario desde `session.user.app_metadata.role`
**para que** el enrutamiento de dashboards sea seguro y no manipulable desde JavaScript.

**Prioridad**: P0 | **SP**: 3
**Resolves**: GAP-C05 · DA-02
**Depende de**: SEG-001

**Criterios de aceptación:**
1. El middleware de Next.js lee `session.user.app_metadata.role` del JWT de Supabase
2. La cookie `gymsos_rol` ya no se usa para decisiones de enrutamiento
3. Si `app_metadata.role` es `undefined` o no reconocido → redirige a `/login`
4. El flujo de redirección post-login usa el `role` del JWT para determinar el dashboard de destino
5. La cookie `gymsos_rol` si se mantiene: debe ser `HttpOnly` y `Secure` (no accesible por JavaScript)

**Dependencias técnicas:**
- SEG-001 completo
- Acceso a `session` de Supabase en el middleware (`createMiddlewareClient`)

**Archivos afectados**: `middleware.ts`, `auth.ts`

---

## SEG-003 — `role_dashboard_map` como objeto de configuración canónico
**Como** desarrollador,
**quiero** un objeto de configuración único que mapee cada string de rol a su ruta de dashboard
**para que** no existan definiciones duplicadas y el mapeo sea la única fuente de verdad.

**Prioridad**: P1 | **SP**: 2
**Resolves**: GAP-C01 · DA-02
**Depende de**: SEG-002

**Criterios de aceptación:**
1. Existe un objeto `ROLE_DASHBOARD_MAP` en `roles.ts` o `config/routes.ts` con la siguiente estructura:
```typescript
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  'gerente': '/dashboard/admin',
  'admin':   '/dashboard/admin',
  'supervisor': '/dashboard/supervisor',
  'cajero':  '/dashboard/cajero',
  'recepcionista': '/dashboard/recepcionista',
  'entrenador': '/dashboard/entrenador',
  'nutricionista': '/dashboard/nutricionista',
  'miembro': '/dashboard/miembro',
  'cliente': '/dashboard/miembro', // alias DA-03
}
```
2. El middleware usa este objeto para la redirección post-login
3. `ROUTE_ALLOWED_ROLES` también usa este objeto como fuente de verdad de los roles válidos
4. No existe ninguna otra definición de mapeo rol → ruta en el codebase

**Archivos afectados**: `lib/roles.ts` o `config/routes.ts`, `middleware.ts`

---

## SEG-004 — Añadir "supervisor" y "cajero" al sistema de routing
**Como** sistema,
**quiero** reconocer los roles `supervisor` y `cajero` como roles válidos con dashboards propios
**para que** los trabajadores con estos roles puedan iniciar sesión correctamente.

**Prioridad**: P0 | **SP**: 2
**Resolves**: GAP-C02 · DA-01
**Depende de**: SEG-003

**Criterios de aceptación:**
1. `"supervisor"` y `"cajero"` están en el array `ROLES` de `roles.ts`
2. `ROUTE_ALLOWED_ROLES` incluye entradas para `/dashboard/supervisor/*` y `/dashboard/cajero/*`
3. Un usuario con `app_metadata.role = 'supervisor'` es redirigido a `/dashboard/supervisor` al iniciar sesión
4. Un usuario con `app_metadata.role = 'cajero'` es redirigido a `/dashboard/cajero` al iniciar sesión
5. Si un usuario supervisor intenta acceder a `/dashboard/admin`, el middleware lo redirige a `/dashboard/supervisor`

**Archivos afectados**: `lib/roles.ts`, `middleware.ts`

---

## SEG-005 — Deprecar rol "cliente" como alias de "miembro"
**Como** sistema de autenticación,
**quiero** tratar el rol `cliente` como un alias del rol `miembro`
**para que** no existan dos dashboards idénticos y el código no tenga duplicación.

**Prioridad**: P1 | **SP**: 2
**Resolves**: GAP-M02 · DA-03
**Depende de**: SEG-003

**Criterios de aceptación:**
1. En el `AuthProvider`, si el usuario tiene `rol = 'cliente'` → se enruta a `/dashboard/miembro`
2. La ruta `/dashboard/cliente` existe como página que redirige a `/dashboard/miembro` (no 404)
3. En `ROLE_DASHBOARD_MAP`, `'cliente'` mapea a `/dashboard/miembro`
4. No se elimina el string `cliente` de la BD todavía (migración posterior)
5. Los usuarios con `gym.usuarios.rol = 'cliente'` funcionan correctamente como miembros

**Archivos afectados**: `AuthProvider`, `middleware.ts`, `/dashboard/cliente/page.tsx`

---

## SEG-006 — Validación de UUID en escáner QR
**Como** sistema de control de accesos,
**quiero** validar que el input del escáner QR es un UUID v4 válido antes de hacer cualquier consulta a la BD
**para que** inputs malformados no causen errores inesperados en el servidor.

**Prioridad**: P0 | **SP**: 2
**Resolves**: GAP-M06 (Sin validación de UUID en QR scanner) · G-06

**Criterios de aceptación:**
1. La función de registro de acceso valida el formato UUID antes de llamar a la BD
2. Si el input no es un UUID válido → respuesta inmediata `{ ok: false, error: 'INVALID_FORMAT' }` sin query a BD
3. La validación usa una regex estándar de UUID v4: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`
4. El componente de escáner muestra feedback "Código no reconocido" en < 200ms sin abrir ningún modal
5. El error se registra en consola del servidor pero no expone detalles al cliente

**Archivos afectados**: `accesos.service.ts`, componente de escáner QR

---

## SEG-007 — Migración 018: nuevos permisos RBAC de staff y evaluaciones
**Como** sistema RBAC,
**quiero** tener los permisos `gym.staff.ver`, `gym.staff.gestionar`, `gym.evaluaciones.ver`, `gym.evaluaciones.gestionar` y `gym.asistencia.ver` en `cat_permissions`
**para que** el módulo de Staff Management pueda usarlos para controlar el acceso.

**Prioridad**: P0 | **SP**: 3
**Resolves**: GAP-M01 · DA-06
**Requiere**: Crear archivo `018_staff_perms_and_fixes.sql`

**Criterios de aceptación:**
1. Los siguientes permisos existen en `public.cat_permissions`:
   - `gym.staff.ver` — description: "Ver lista de trabajadores y sus roles"
   - `gym.staff.gestionar` — description: "Invitar, cambiar rol y revocar accesos de staff"
   - `gym.evaluaciones.ver` — description: "Ver evaluaciones físicas y nutricionales"
   - `gym.evaluaciones.gestionar` — description: "Crear y editar evaluaciones"
   - `gym.asistencia.ver` — description: "Ver asistencia a clases"
2. Los permisos están asignados correctamente en `public.role_permissions`:
   - `gym.staff.ver`: Admin General ✅, Supervisor ✅, resto ❌
   - `gym.staff.gestionar`: Admin General ✅, resto ❌
   - `gym.evaluaciones.ver`: Admin ✅, Supervisor ✅, Entrenador ✅, Nutricionista ✅, resto ❌
   - `gym.evaluaciones.gestionar`: Admin ✅, Entrenador ✅, Nutricionista ✅, resto ❌
   - `gym.asistencia.ver`: Admin ✅, Supervisor ✅, Entrenador ✅, resto ❌
3. La migración es idempotente (usa `INSERT ... ON CONFLICT DO NOTHING`)
4. RAISE NOTICE en cada paso para verificación

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql`

---

## SEG-008 — Migración 018: validación de max_licenses en fn_create_staff_code
**Como** sistema de monetización,
**quiero** que `fn_create_staff_code` valide el límite de licencias del plan antes de crear un código
**para que** un gym en plan básico no pueda contratar más trabajadores de los permitidos.

**Prioridad**: P0 | **SP**: 5
**Resolves**: GAP-B03 · GAP-C04 (monetización) · DA-04

**Criterios de aceptación:**
1. `fn_create_staff_code` ejecuta la siguiente validación antes de crear el código:
```sql
SELECT COUNT(*) INTO v_active_staff
FROM public.user_roles ur
WHERE ur.tenant_id = p_tenant_id
  AND (ur.expires_at IS NULL OR ur.expires_at > now());

SELECT max_licenses INTO v_max
FROM public.tenants WHERE id = p_tenant_id;

IF v_max IS NOT NULL AND v_active_staff >= v_max THEN
  RETURN jsonb_build_object('ok', false, 'error', 'LIMIT_REACHED',
    'current', v_active_staff, 'max', v_max);
END IF;
```
2. Si `max_licenses IS NULL` → plan Enterprise, sin límite, pasa la validación
3. La respuesta de error incluye `current` y `max` para que el frontend pueda mostrar "10 de 10 licencias usadas"
4. La validación está en el BACKEND (BD) — no solo en el frontend
5. Un test manual confirma que un tenant con `max_licenses = 2` y 2 staff activos no puede generar más códigos

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql` (modifica `fn_create_staff_code`)

---

## SEG-009 — Migración 018: campos de contexto de revocación en user_roles
**Como** sistema de auditoría,
**quiero** que `public.user_roles` tenga columnas `revoked_by`, `revocation_reason` y `revocation_type`
**para que** la revocación de un acceso quede documentada con contexto completo.

**Prioridad**: P0 | **SP**: 3
**Resolves**: DA-05 · GAP-B04

**Criterios de aceptación:**
1. La migración añade a `public.user_roles`:
   - `revoked_by UUID REFERENCES auth.users(id) NULL`
   - `revocation_reason TEXT NULL`
   - `revocation_type TEXT CHECK (revocation_type IN ('permanent', 'temporary')) NULL`
2. Las columnas aceptan NULL (para filas existentes sin revocación)
3. No se modifica `fn_has_permission()` — ya verifica `expires_at` correctamente
4. Las columnas son visibles en la tabla `public.user_roles`

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql`

---

## SEG-010 — Migración 018: verificar y corregir RLS de gym.accesos para Miembro
**Como** sistema de seguridad multi-tenant,
**quiero** que la política RLS de `gym.accesos` filtre correctamente por `id_usuario = auth.uid()` cuando el rol es Miembro
**para que** un miembro no pueda ver los accesos de otros miembros del gym.

**Prioridad**: P0 | **SP**: 3
**Resolves**: GAP-M03 · GAP-013

**Criterios de aceptación:**
1. La política RLS de `gym.accesos` para SELECT verifica: si el usuario tiene rol Miembro → solo puede ver filas donde `id_usuario = auth.uid()`
2. Si el usuario tiene rol de staff (recepcionista, admin, etc.) → puede ver todos los accesos del gym (`id_gimnasio = gym.current_gym_id()`)
3. Test manual: miembro A no puede ver los accesos de miembro B aunque estén en el mismo gym
4. Test manual: recepcionista puede ver todos los accesos del gym
5. La política usa `fn_has_permission('gym.accesos.ver')` o similar para la distinción

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql`

---

## SEG-011 — Migración 018: triggers de audit_logs faltantes
**Como** sistema de auditoría,
**quiero** que los eventos críticos del sistema se registren automáticamente en `public.audit_logs`
**para que** el administrador pueda auditar cualquier acción relevante.

**Prioridad**: P1 | **SP**: 8
**Resolves**: GAP-B04 · DA-07

**Eventos que deben añadirse (los que no existen actualmente):**

| Evento | Trigger | Tabla origen |
|--------|---------|-------------|
| ROLE_CHANGED | UPDATE en `public.user_roles` cuando `role_id` cambia | `public.user_roles` |
| ROLE_REVOKED | UPDATE en `public.user_roles` cuando `expires_at` se establece | `public.user_roles` |
| PAYMENT_CREATED | INSERT en `gym.pagos` | `gym.pagos` |
| MEMBERSHIP_CANCELLED | UPDATE en `gym.membresias` cuando `estado = 'cancelada'` | `gym.membresias` |
| GYM_CONFIG_UPDATED | UPDATE en `gym.gimnasios` | `gym.gimnasios` |
| ACCESS_DENIED | INSERT en `gym.accesos` cuando `permitido = false` | `gym.accesos` |

**Criterios de aceptación:**
1. Cada trigger usa el formato canónico de audit_logs: `actor_id`, `actor_role`, `action`, `target_table`, `target_id`, `old_data`, `new_data`, `tenant_id`, `created_at`
2. Los triggers son `AFTER INSERT/UPDATE` (no bloquean la operación principal)
3. Los triggers usan `SECURITY DEFINER` con `search_path` explícito
4. Test: revocar un rol → verificar que aparece en `public.audit_logs` con action = 'ROLE_REVOKED'
5. Test: procesar un pago → verificar PAYMENT_CREATED en audit_logs

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql`

---

## SEG-012 — Migración 018: tabla nps_surveys
**Como** sistema de analytics,
**quiero** una tabla `public.nps_surveys` para almacenar scores NPS reales
**para que** el dashboard del administrador muestre datos reales en lugar del hardcodeado 72.

**Prioridad**: P1 | **SP**: 2
**Resolves**: GAP-M05

**Criterios de aceptación:**
1. La tabla existe con estructura mínima:
```sql
CREATE TABLE public.nps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES public.tenants(id),
  score INTEGER CHECK (score BETWEEN 0 AND 10),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
2. RLS activa: usuario solo puede ver sus propias respuestas. Admin puede ver todas las de su tenant.
3. Si la tabla está vacía → el dashboard muestra "Sin datos de NPS todavía" en lugar de un número inventado

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql`

---

## SEG-013 — Migración 018: gym.pagos.crear para Recepcionista
**Como** Recepcionista,
**quiero** tener el permiso `gym.pagos.crear`
**para que** pueda cobrar membresías en el mostrador sin necesidad de un cajero.

**Prioridad**: P1 | **SP**: 2
**Resolves**: Contradicción C-02 del Blueprint (Recepcionista necesita crear pagos pero no tiene el permiso)

**Criterios de aceptación:**
1. El permiso `gym.pagos.crear` está asignado al rol Recepcionista en `role_permissions`
2. `fn_has_permission('gym.pagos.crear')` retorna TRUE para un usuario con rol Recepcionista
3. La migración usa `INSERT INTO role_permissions ... ON CONFLICT DO NOTHING`

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql`

---

# ÉPICA 2 — ROLES Y DASHBOARDS (ROL)

Resuelve: GAP-C02 — Cajero y Supervisor sin dashboard

---

## ROL-001 — Dashboard mínimo viable del Supervisor
**Como** Supervisor,
**quiero** una pantalla de inicio al hacer login
**para que** pueda operar el turno sin ser redirigido erróneamente al dashboard de recepcionista o miembro.

**Prioridad**: P1 | **SP**: 5
**Resolves**: GAP-C02 · DA-01
**Depende de**: SEG-004

**Criterios de aceptación:**
1. La ruta `/dashboard/supervisor` existe y carga correctamente
2. Muestra 4 KPI cards: Accesos del turno / Membresías procesadas hoy / Clases activas / Incidencias pendientes
3. La página verifica `fn_has_permission('gym.staff.ver')` al cargar — si falla → 403
4. Un usuario con `app_metadata.role = 'supervisor'` llega aquí al iniciar sesión
5. El sidebar del Supervisor muestra solo los módulos documentados en la especificación UX/UI (sin Auditoría completa, sin Configuración, sin Creación de códigos)
6. La página no tiene datos mock — si no hay datos, muestra estados vacíos correctos

**Archivos afectados**: `/dashboard/supervisor/page.tsx`, `/dashboard/supervisor/layout.tsx`

---

## ROL-002 — Dashboard mínimo viable del Cajero
**Como** Cajero,
**quiero** una pantalla de inicio orientada exclusivamente a procesar cobros
**para que** pueda cobrar membresías con el mínimo de clics posibles.

**Prioridad**: P1 | **SP**: 5
**Resolves**: GAP-C02 · DA-01
**Depende de**: SEG-004

**Criterios de aceptación:**
1. La ruta `/dashboard/cajero` existe y carga correctamente
2. Muestra 3 KPI cards: Total cobrado en el turno (S/) / N° de transacciones / Membresías pendientes hoy
3. La barra de búsqueda de miembro es el elemento dominante de la pantalla (primer focus al cargar)
4. La búsqueda funciona con debounce de 300ms sobre `gym.usuarios` por nombre, email o documento
5. Un usuario con `app_metadata.role = 'cajero'` llega aquí al iniciar sesión
6. El sidebar del Cajero muestra solo: Mi Caja / Buscar Miembro / Cobros / Membresías
7. La página verifica `fn_has_permission('gym.pagos.crear')` al cargar

**Archivos afectados**: `/dashboard/cajero/page.tsx`, `/dashboard/cajero/layout.tsx`

---

## ROL-003 — Sidebar dinámico según permisos RBAC
**Como** sistema de UI,
**quiero** que el sidebar de cada dashboard muestre solo los módulos para los que el usuario tiene permiso
**para que** la navegación sea coherente con los permisos RBAC reales.

**Prioridad**: P1 | **SP**: 5
**Depende de**: SEG-002, SEG-007

**Criterios de aceptación:**
1. El sidebar del Admin muestra los 8 módulos documentados en la especificación UX/UI
2. El sidebar del Supervisor muestra solo sus 5 módulos (sin Auditoría completa, sin Config, sin Códigos)
3. El sidebar del Cajero muestra solo sus 4 módulos
4. El sidebar del Recepcionista muestra solo sus 4 módulos
5. Si un ítem del sidebar requiere un permiso que el usuario no tiene → no se muestra (no se muestra disabled)
6. El sidebar responde al estado colapsado/expandido guardado en `localStorage`

**Archivos afectados**: `components/sidebar.tsx`, `lib/navigation.ts`

---

## FASE B — STAFF MANAGEMENT Y OPERACIONES COMPLETAS
**Duración estimada**: Sprint 2-3 (~3 semanas)
**Objetivo**: El administrador puede gestionar su equipo desde la UI. Los dashboards operativos están completos.
**Total SP estimados**: ~89 puntos

---

# ÉPICA 3 — STAFF MANAGEMENT (STF)

Resuelve: GAP-B01, GAP-C03, RF-022, RF-023

---

## STF-001 — Lista de trabajadores activos con roles RBAC
**Como** Administrador General,
**quiero** ver una tabla de todos los trabajadores activos con sus roles RBAC reales
**para que** sepa exactamente quiénes son mis empleados y qué pueden hacer.

**Prioridad**: P0 | **SP**: 8
**Resolves**: GAP-B01 · RF-022
**Depende de**: SEG-007 (permisos gym.staff.ver)
**Infraestructura**: ✅ `public.user_roles`, `public.roles`, `gym.usuarios`

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/staff` muestra una tabla con todos los `user_roles` activos del tenant
2. Query base:
```sql
SELECT ur.*, r.name as role_name, r.hierarchy_level,
       u.nombre, u.email, u.avatar_url,
       ur.expires_at, ur.created_at
FROM public.user_roles ur
JOIN public.roles r ON r.id = ur.role_id
JOIN gym.usuarios u ON u.auth_user_id = ur.user_id
WHERE ur.tenant_id = fn_current_tenant_id()
  AND (ur.expires_at IS NULL OR ur.expires_at > now())
ORDER BY r.hierarchy_level ASC, u.nombre ASC
```
3. Columnas visibles: Avatar+Nombre+Email / Rol (badge coloreado) / Estado / Última actividad / Fecha ingreso / Expira / Acciones
4. La página verifica `fn_has_permission('gym.staff.ver')` — si falla → 403 con mensaje legible
5. La tabla tiene paginación de 25 filas por defecto
6. Estado vacío si no hay trabajadores: mensaje + botón "Generar primer código"
7. Skeleton loaders durante la carga inicial

**Nuevo servicio**: `services/staff.service.ts` con función `getActiveStaff(tenantId)`

**Archivos afectados**: `/dashboard/admin/staff/page.tsx`, `services/staff.service.ts`

---

## STF-002 — Filtros y búsqueda en tabla de staff
**Como** Administrador General,
**quiero** poder filtrar el listado de trabajadores por rol, estado y actividad
**para que** pueda encontrar rápidamente a un trabajador específico.

**Prioridad**: P1 | **SP**: 3
**Depende de**: STF-001

**Criterios de aceptación:**
1. Filtro por rol: selector múltiple con todos los roles del tenant
2. Filtro por estado: Activos / Suspendidos / Todos
3. Filtro por actividad: Activo esta semana / Sin actividad +7 días (join con audit_logs)
4. Búsqueda libre por nombre o email (debounce 300ms, afecta la query)
5. Ordenación clickable en headers: Nombre / Rol / Fecha ingreso / Última actividad
6. Los filtros activos se reflejan en la URL como query params (bookmarkable)
7. Botón "Limpiar filtros" visible cuando hay filtros activos

**Archivos afectados**: `/dashboard/admin/staff/page.tsx`, `components/staff-filters.tsx`

---

## STF-003 — Drawer de detalle del trabajador
**Como** Administrador General,
**quiero** ver el perfil completo de un trabajador con su historial de actividad
**para que** pueda tomar decisiones informadas sobre su rol y acceso.

**Prioridad**: P1 | **SP**: 8
**Depende de**: STF-001

**Criterios de aceptación:**
1. Al hacer clic en una fila de la tabla → se abre un drawer lateral (400px) sin navegación de página
2. **Tab Info**: avatar grande, nombre, email, teléfono, rol, fecha de ingreso, notas del admin
3. **Tab Actividad**: timeline de últimas 20 acciones del trabajador (desde `audit_logs` WHERE `actor_id = worker_id`)
4. Cada acción en el timeline: icono por tipo + descripción en español + timestamp
5. **Tab Permisos**: lista de permisos activos de su rol (desde `role_permissions JOIN cat_permissions`)
6. **Tab Códigos**: el código de invitación que usó para registrarse (desde `code_usages`)
7. El drawer se cierra al hacer clic fuera o con Esc
8. Los botones de acción (Editar rol, Suspender, Revocar) están en el footer del drawer

**Archivos afectados**: `components/staff-drawer.tsx`, `services/staff.service.ts`

---

## STF-004 — Modal de cambio de rol del trabajador
**Como** Administrador General,
**quiero** poder cambiar el rol de un trabajador existente
**para que** pueda actualizar sus responsabilidades sin tener que crear una cuenta nueva.

**Prioridad**: P1 | **SP**: 8
**Depende de**: STF-001, SEG-001 (JWT sync)

**Criterios de aceptación:**
1. El modal muestra el rol actual del trabajador y un selector de nuevo rol
2. Cada opción del selector muestra: nombre del rol + número de permisos
3. Al seleccionar un nuevo rol, muestra los permisos que se ganarán y los que se perderán
4. Botón "Cambiar rol" habilitado solo si se seleccionó un rol diferente al actual
5. Al confirmar, se ejecuta:
   - `UPDATE public.user_roles SET role_id = $nuevo_rol WHERE user_id = $target AND tenant_id = $tenant`
   - `UPDATE gym.usuarios SET rol = $string_nuevo_rol WHERE auth_user_id = $target`
   - Llamada a `supabase.auth.admin.updateUser($target, { app_metadata: { role: $string_nuevo_rol } })`
6. Se registra en `audit_logs` con `action = 'ROLE_CHANGED'`, `old_data` y `new_data`
7. Toast de éxito: "Rol de [Nombre] actualizado a [Nuevo Rol]"
8. La fila en la tabla actualiza el badge de rol sin recargar la página

**Archivos afectados**: `components/staff-role-modal.tsx`, `app/actions/staff.actions.ts`

---

## STF-005 — Acción de suspensión temporal de trabajador
**Como** Administrador General,
**quiero** poder suspender temporalmente a un trabajador estableciendo una fecha de reactivación
**para que** pueda gestionar vacaciones o conflictos temporales sin revocar definitivamente.

**Prioridad**: P1 | **SP**: 5
**Depende de**: STF-001, SEG-009

**Criterios de aceptación:**
1. El modal de suspensión tiene: campo "Motivo" (obligatorio) + DatePicker "Fecha de reactivación"
2. La fecha de reactivación debe ser al menos mañana
3. Al confirmar:
   - `UPDATE public.user_roles SET expires_at = $fecha_reactivacion, revocation_reason = $motivo, revocation_type = 'temporary' WHERE user_id = $target AND tenant_id = $tenant`
4. El trabajador pierde acceso inmediatamente (`fn_has_permission` verifica `expires_at`)
5. En la tabla, el badge del trabajador cambia a "Suspendido hasta [fecha]" en naranja
6. Se registra en `audit_logs` con `action = 'ROLE_REVOKED'`, `revocation_type = 'temporary'`
7. Test: trabajador suspendido no puede realizar operaciones hasta la fecha de reactivación

**Archivos afectados**: `components/staff-suspend-modal.tsx`, `app/actions/staff.actions.ts`

---

## STF-006 — Acción de revocación definitiva de acceso
**Como** Administrador General,
**quiero** poder revocar el acceso de un trabajador de forma definitiva con motivo obligatorio
**para que** un empleado que abandona el gym pierda el acceso inmediatamente con trazabilidad completa.

**Prioridad**: P0 | **SP**: 8
**Resolves**: GAP-C03 · RF-023
**Depende de**: STF-001, SEG-009

**Criterios de aceptación:**
1. El flujo de revocación es de 2 pasos: Paso 1 (contexto + motivo) → Paso 2 (confirmación con checkbox)
2. El Paso 1 requiere: motivo (campo de texto, obligatorio) + tipo de revocación (Temporal/Definitivo)
3. El Paso 2 muestra todos los datos ingresados + checkbox de confirmación explícita
4. El botón "Confirmar revocación" está deshabilitado hasta que se marca el checkbox
5. Al confirmar:
   - `UPDATE public.user_roles SET expires_at = now(), revoked_by = auth.uid(), revocation_reason = $motivo, revocation_type = 'permanent'`
6. Se registra en `audit_logs` con `action = 'ROLE_REVOKED'`
7. La próxima llamada a `fn_has_permission()` del trabajador retorna FALSE
8. El badge de la fila cambia a "Revocado" en rojo
9. El trabajador, en su próxima acción, recibe 403 y es redirigido al login con mensaje "Tu acceso ha sido revocado. Contacta al administrador."

**Archivos afectados**: `components/staff-revoke-modal.tsx`, `app/actions/staff.actions.ts`

---

## STF-007 — Acción de reactivar trabajador suspendido
**Como** Administrador General,
**quiero** poder reactivar a un trabajador suspendido antes de su fecha automática
**para que** pueda gestionar reincorporaciones anticipadas.

**Prioridad**: P2 | **SP**: 3
**Depende de**: STF-005

**Criterios de aceptación:**
1. El botón "Reactivar" es visible en la fila solo si el trabajador tiene estado "Suspendido"
2. Modal de confirmación simple: "¿Reactivar el acceso de [Nombre]?"
3. Al confirmar: `UPDATE public.user_roles SET expires_at = NULL WHERE user_id = $target`
4. Se registra en `audit_logs` con `action = 'ROLE_REACTIVATED'`
5. El badge vuelve a "Activo" en verde

---

## STF-008 — Widget de KPIs de licencias en el header de Staff
**Como** Administrador General,
**quiero** ver cuántas licencias están en uso vs el total disponible en el plan
**para que** sepa si puedo contratar más personal.

**Prioridad**: P1 | **SP**: 3
**Depende de**: STF-001, SEG-008

**Criterios de aceptación:**
1. El header de la página `/admin/staff` muestra: "6 de 10 licencias usadas" con barra de progreso
2. Si `max_licenses IS NULL` → muestra "Licencias ilimitadas (Plan Enterprise)"
3. Si licencias al 80%+ → la barra es naranja
4. Si licencias al 100% → la barra es roja + banner "Alcanzaste el límite. [Actualizar plan →]"
5. El conteo usa la misma lógica que `fn_create_staff_code`: `user_roles activos sin expires_at vencido`

---

# ÉPICA 4 — CÓDIGOS DE INVITACIÓN (COD)

Resuelve: GAP-B02, RF-024

---

## COD-001 — Historial completo de códigos emitidos (Tab 3)
**Como** Administrador General,
**quiero** ver el historial completo de todos los códigos de invitación generados
**para que** pueda saber qué códigos están activos, cuáles fueron usados y por quién.

**Prioridad**: P1 | **SP**: 8
**Resolves**: GAP-B02 · RF-024
**Depende de**: STF-001
**Infraestructura**: ✅ `public.codes`, `public.code_usages`, `public.code_grants`

**Criterios de aceptación:**
1. La Tab 3 "Historial de Códigos" en `/admin/staff` muestra todos los códigos del tenant
2. Query base:
```sql
SELECT c.*, cg.role_id, r.name as role_name,
       cu.used_by, cu.used_at, u.nombre as used_by_nombre
FROM public.codes c
LEFT JOIN public.code_grants cg ON cg.code_id = c.id
LEFT JOIN public.roles r ON r.id = cg.role_id
LEFT JOIN public.code_usages cu ON cu.code_id = c.id
LEFT JOIN gym.usuarios u ON u.auth_user_id = cu.used_by
WHERE c.tenant_id = fn_current_tenant_id()
  AND c.type = 'USER_INVITE'
ORDER BY c.created_at DESC
```
3. Columnas: Código (parcialmente oculto) / Rol / Estado (badge) / Creado por+fecha / Usado por+fecha / Vence / Usos
4. KPIs en el header de la tab: Activos sin usar / Usados este mes / Expirados sin usar / Tasa de conversión
5. Filtros: por estado (todos/activos/usados/expirados/revocados) + por rol + rango de fechas
6. El código se muestra parcialmente oculto; al hacer hover o clic → se revela completo

**Nuevo servicio**: `services/codes.service.ts` con `getCodes(tenantId, filters)`

---

## COD-002 — Revocar código activo
**Como** Administrador General,
**quiero** poder revocar un código de invitación que aún no fue usado
**para que** el código no pueda ser utilizado si ya no es necesario.

**Prioridad**: P1 | **SP**: 3
**Depende de**: COD-001
**Infraestructura**: ✅ `fn_revoke_code()` existe

**Criterios de aceptación:**
1. El botón "Revocar" es visible solo en filas con estado "Activo"
2. Modal de confirmación: "¿Revocar el código [GYM-XXXX]? No podrá ser usado después de esto."
3. Al confirmar → llama a `fn_revoke_code(p_code_id)`
4. El badge del código cambia a "Revocado" en rojo
5. Se registra en `audit_logs` con `action = 'CODE_REVOKED'`

---

## COD-003 — Notificación al admin cuando código es usado (Fase B)
**Como** Administrador General,
**quiero** recibir una notificación in-app cuando un trabajador usa un código de invitación
**para que** sepa en tiempo real que alguien se incorporó a mi equipo.

**Prioridad**: P2 | **SP**: 5
**Depende de**: SEG-011 (triggers audit_logs), COD-001

**Criterios de aceptación:**
1. Cuando se registra `CODE_USED` en audit_logs → el sistema crea una notificación in-app para el admin del tenant
2. La notificación aparece en el ícono de campana del header: "[Nombre] usó tu código de [Rol] y ya está activo en tu equipo"
3. La notificación tiene un link directo al perfil del nuevo trabajador en `/admin/staff`
4. El badge de la campana muestra el número de notificaciones no leídas
5. Las notificaciones persisten hasta que el admin las marque como leídas

---

# ÉPICA 5 — GESTIÓN DE MIEMBROS (MBR)

---

## MBR-001 — Lista de miembros con filtros y búsqueda
**Como** Administrador General,
**quiero** ver la lista completa de miembros con filtros por estado de membresía, churn y plan
**para que** pueda gestionar mi cartera de clientes eficientemente.

**Prioridad**: P0 | **SP**: 8
**Infraestructura**: 🟡 La UI básica existe, pero sin churn filter ni todos los estados

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/miembros` muestra todos los miembros del tenant (gym.usuarios WHERE rol = 'miembro')
2. Filtros funcionales: estado membresía / riesgo churn / plan / fecha de alta / actividad
3. Búsqueda por nombre, email, documento con debounce
4. Columnas: Avatar+Nombre+Email / Membresía (badge estado) / Plan / Vence en / Último acceso / Churn Score / Acciones
5. Badge de churn score solo visible si `fn_has_permission('gym.reportes.ver')` = TRUE
6. Ordenación por cualquier columna
7. Paginación 25 filas con selector 10/25/50
8. KPIs en el header: Activos / Altas este mes / Bajas / Con churn alto

---

## MBR-002 — Perfil completo del miembro con tabs
**Como** Administrador General,
**quiero** ver el perfil completo de un miembro con historial de membresías, pagos, asistencia y clases
**para que** pueda tomar decisiones informadas sobre su retención.

**Prioridad**: P1 | **SP**: 8

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/miembros/[id]` muestra el perfil completo
2. **Tab Membresía**: plan actual, fechas, estado, barra de tiempo visual, historial de membresías previas
3. **Tab Pagos**: historial de todos los pagos con monto, forma de pago, responsable
4. **Tab Asistencia**: gráfico de visitas por semana (12 semanas) + tabla últimos 20 accesos
5. **Tab Clases**: clases inscritas activas + historial de asistencia
6. **Tab Notas**: campo de texto para notas internas (solo Admin/Supervisor, invisible para el miembro)
7. Header: foto, nombre, email, teléfono, fecha de alta, badge de membresía, churn score
8. Acciones en el header: Renovar membresía / Cancelar membresía / Enviar notificación (Fase D)

---

## MBR-003 — RPC transaccional para registro de nuevo miembro
**Como** sistema de registro,
**quiero** una RPC `rpc_registrar_nuevo_miembro` que cree en una sola transacción el usuario, membresía y pago
**para que** no existan usuarios huérfanos en Supabase Auth sin perfil ni membresía.

**Prioridad**: P0 | **SP**: 8
**Resolves**: GAP-C04 · G-01

**Criterios de aceptación:**
1. La RPC `rpc_registrar_nuevo_miembro(p_auth_user_id, p_datos, p_id_plan, p_monto, p_forma_pago, p_id_gimnasio)` existe en la BD
2. La RPC ejecuta en una sola transacción PL/pgSQL:
   - `INSERT INTO gym.usuarios (si no existe por trigger)`
   - `INSERT INTO gym.membresias (plan, fecha_inicio, fecha_fin)`
   - `INSERT INTO gym.pagos (monto, forma_pago, procesado_por)`
3. Si cualquier paso falla → `ROLLBACK` completo
4. Si la RPC falla → el caller hace `supabase.auth.admin.deleteUser(p_auth_user_id)` para limpiar el usuario huérfano en Auth
5. La RPC retorna `{ ok: boolean, member_id: UUID, membership_id: UUID }` o `{ ok: false, error: string }`
6. Test: si la inserción de membresía falla, el usuario en auth.users también se elimina

**Archivos afectados**: `migrations/018_staff_perms_and_fixes.sql` o `019_...`, `services/miembros.service.ts`

---

## MBR-004 — Formulario de registro de nuevo miembro (Recepcionista)
**Como** Recepcionista,
**quiero** registrar a un nuevo miembro con membresía y pago inicial en un único formulario
**para que** el alta sea rápida y sin riesgo de datos incompletos.

**Prioridad**: P1 | **SP**: 8
**Depende de**: MBR-003

**Criterios de aceptación:**
1. La ruta `/dashboard/recepcionista/registro` muestra el formulario de alta
2. Campos mínimos obligatorios: nombre + email + plan seleccionado + monto + forma de pago (5 campos)
3. Campos opcionales (completar después): teléfono, documento, fecha de nacimiento
4. Selector de plan: muestra todos los planes activos del gym con nombre y precio
5. Al enviar: llama a `supabase.auth.signUp` → obtiene `auth_user_id` → llama a `rpc_registrar_nuevo_miembro`
6. Si la RPC falla: llama a `supabase.auth.admin.deleteUser` + muestra error descriptivo
7. Si todo OK: toast "Miembro [Nombre] registrado exitosamente. Membresía activa hasta [fecha]"
8. Badge "Perfil incompleto" en el perfil del miembro si faltan campos opcionales

---

## MBR-005 — Cancelar membresía con confirmación en 2 pasos
**Como** Administrador General,
**quiero** poder cancelar la membresía de un miembro con motivo obligatorio y doble confirmación
**para que** las cancelaciones sean intencionales y trazables.

**Prioridad**: P1 | **SP**: 5
**Resolves**: G-11 (Sin flujo de cancelación de membresía)

**Criterios de aceptación:**
1. El botón "Cancelar membresía" requiere `gym.membresias.cancelar`
2. Paso 1: modal con motivo obligatorio (texto libre)
3. Paso 2: confirmación "¿Cancelar la membresía de [Nombre]? El acceso al gym será negado."
4. Al confirmar: `UPDATE gym.membresias SET estado = 'cancelada', cancelado_por = auth.uid(), cancelado_en = now()`
5. Se registra en `audit_logs` con `MEMBERSHIP_CANCELLED`
6. La próxima vez que el miembro escanee QR → acceso denegado con motivo "Membresía cancelada"

---

# ÉPICA 6 — MEMBRESÍAS Y PAGOS (MEM)

---

## MEM-001 — Card de cobro rápido en dashboard del Cajero
**Como** Cajero,
**quiero** buscar a un miembro y cobrarle su membresía en el menor número de pasos
**para que** el tiempo de atención en caja sea mínimo.

**Prioridad**: P0 | **SP**: 8
**Depende de**: ROL-002

**Criterios de aceptación:**
1. Al buscar un miembro y seleccionarlo → aparece inmediatamente un card de cobro
2. El card muestra: foto, nombre, estado de membresía, plan, monto a cobrar
3. Selector de forma de pago: Efectivo / Yape / Plin / Transferencia
4. Selector de plan (permite cambiar el plan al renovar)
5. Botón "Registrar Pago" grande y prominente
6. Al confirmar el pago:
   - `INSERT gym.pagos (monto, forma_pago, id_miembro, procesado_por)`
   - `UPDATE gym.membresias SET fecha_fin = fecha_fin + plan.dias, estado = 'activa'`
7. Feedback inmediato: "✅ Pago registrado · [Nombre] · S/ 150 · Nueva vigencia: [fecha]"
8. La pantalla se limpia automáticamente en 3 segundos para el siguiente cobro
9. El historial del turno se actualiza en tiempo real

---

## MEM-002 — Lista de membresías por cobrar hoy
**Como** Cajero,
**quiero** ver la lista de miembros con membresía vencida o por vencer hoy
**para que** pueda cobrar proactivamente sin esperar a que vengan a la caja.

**Prioridad**: P1 | **SP**: 5
**Depende de**: ROL-002

**Criterios de aceptación:**
1. La ruta `/dashboard/cajero/pendientes` muestra membresías vencidas o que vencen hoy
2. Columnas: Nombre / Plan / Vencimiento / Días vencido / Monto / Acción "Cobrar"
3. Ordenada por urgencia: vencidas primero, luego por días vencido DESC
4. Botón "Cobrar" en cada fila: abre directamente el card de cobro rápido pre-cargado con ese miembro
5. Se actualiza automáticamente cada 5 minutos (polling simple)

---

## MEM-003 — Historial de pagos del gym (Admin)
**Como** Administrador General,
**quiero** ver el historial completo de transacciones del gym con filtros
**para que** pueda reconciliar caja y detectar irregularidades.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/membresias/pagos` muestra todas las transacciones del tenant
2. Columnas: Fecha / Miembro / Plan / Monto / Forma de pago / Procesado por
3. Filtros: rango de fechas / forma de pago / procesado por (trabajador)
4. Total del período filtrado visible en el header de la tabla
5. Exportar CSV del período filtrado
6. Paginación de 50 transacciones por página

---

# ÉPICA 7 — CONTROL DE ACCESOS (ACC)

---

## ACC-001 — Control de acceso LIVE con Supabase Realtime
**Como** Recepcionista,
**quiero** que el feed de accesos se actualice en tiempo real sin recargar la página
**para que** pueda ver quién está entrando mientras atiende a otras personas.

**Prioridad**: P1 | **SP**: 8
**Resolves**: GAP-003 (acceso live ya parcialmente implementado, mejorar)
**Depende de**: SEG-006

**Criterios de aceptación:**
1. La página usa `supabase.channel('gym.accesos').on('INSERT', ...)` para recibir nuevos accesos
2. El canal está filtrado por `id_gimnasio = gym_id` (no recibe accesos de otros gyms)
3. El indicador de conexión muestra: punto verde "En vivo" cuando conectado / punto naranja "Reconectando" cuando no
4. Si el canal se desconecta: banner naranja "Conexión en tiempo real perdida. Los accesos se registran pero la lista no actualiza automáticamente."
5. Al reconectar: los accesos perdidos se cargan desde la BD y se insertan en la lista en orden cronológico
6. El input de escaneo QR vuelve al foco automáticamente después de cada acceso procesado

---

## ACC-002 — Registro de acceso manual (sin QR)
**Como** Recepcionista,
**quiero** poder registrar el acceso de un miembro manualmente cuando el QR no funciona
**para que** el miembro no sea bloqueado por un problema técnico.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. Existe un botón "Acceso manual" en la pantalla de control de acceso
2. Abre un buscador de miembro (nombre / documento)
3. Al seleccionar el miembro → verifica si tiene membresía activa (misma lógica que QR)
4. Si membresía activa → registra el acceso con `tipo = 'manual'`
5. Si membresía vencida → muestra el mismo feedback que el QR denegado
6. El acceso manual queda marcado con badge "Manual" en el feed y en el historial de audit

---
