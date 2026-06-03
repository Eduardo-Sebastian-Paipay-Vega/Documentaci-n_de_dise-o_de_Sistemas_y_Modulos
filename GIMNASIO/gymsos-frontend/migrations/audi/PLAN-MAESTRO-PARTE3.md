# PLAN MAESTRO — PARTE 3
## Análisis de Riesgos y Matriz de Dependencias Final

---

# PARTE 4 — ANÁLISIS COMPLETO DE RIESGOS

## 4.1 Riesgos Técnicos

### RT-01 — God Service en dashboard.service (ALTO)
**Descripción**: `dashboard.service.ts` actualmente hace queries directas a 5+ tablas. A medida que se añaden módulos, esta clase crecerá hasta ser inmantenible y generará N+1 queries.
**Impacto**: Degradación de rendimiento progresiva. Dificultad para testear. Alta probabilidad de introducir regresiones al modificar el servicio.
**Mitigación**:
- No añadir NADA nuevo a `dashboard.service.ts` desde este momento
- Crear `analytics.service.ts` para los nuevos módulos de reportes (SAS-004)
- Crear `staff.service.ts`, `codes.service.ts`, `audit.service.ts` como servicios independientes
- Migrar gradualmente funciones de `dashboard.service` al servicio correspondiente (Sprint 9)

### RT-02 — Registro de miembro no atómico (CRÍTICO — resuelto en 018)
**Descripción**: El flujo de registro crea primero en `auth.users` y luego en `gym.usuarios`, `membresias`, `pagos` en pasos separados. Un error en cualquier paso deja un usuario huérfano.
**Impacto**: Usuarios en Supabase Auth sin perfil. Imposible de gestionar desde la UI. Potencial pérdida de ingresos si el pago no se registra.
**Mitigación**:
- `rpc_registrar_nuevo_miembro` (Módulo 05) resuelve esto
- El caller ejecuta `supabase.auth.admin.deleteUser` si la RPC falla
- Crear un job de limpieza semanal de usuarios huérfanos como safety net

### RT-03 — N+1 queries en getPlanesConConteo (MEDIO)
**Descripción**: La función `getPlanesConConteo` en el servicio actual hace una query por cada plan para contar sus miembros activos.
**Impacto**: En un gym con 10 planes, hace 11 queries. Lento y costoso.
**Mitigación**: Reescribir como un solo JOIN con `COUNT(*)` agrupado. Hacerlo en Sprint 4 junto con CFG-002.

### RT-04 — Supabase Realtime: límites de concurrencia (MEDIO)
**Descripción**: El plan gratuito de Supabase tiene límites en conexiones simultáneas de Realtime. Si muchas tablets de recepcionistas se conectan al mismo canal, puede alcanzar el límite.
**Impacto**: La pantalla de control de acceso deja de actualizarse en tiempo real.
**Mitigación**:
- Verificar el plan de Supabase y sus límites antes de implementar ACC-001
- Implementar reconexión automática con backoff exponencial
- Tener como fallback el polling cada 10 segundos si Realtime falla

### RT-05 — Complejidad del QR dinámico rotativo (MEDIO)
**Descripción**: El QR dinámico requiere que el servidor genere tokens JWT de corta duración, que el cliente los rote automáticamente, y que el escáner los valide en tiempo real.
**Impacto**: Si el cliente y el servidor tienen relojes desincronizados, el QR puede rechazar accesos legítimos.
**Mitigación**:
- Usar UNIX timestamps en el JWT (no fecha local)
- Añadir una tolerancia de ±30 segundos en la validación del token
- Testear explícitamente en dispositivos con horario cambiado

### RT-06 — Web Push: soporte limitado en iOS Safari (BAJO)
**Descripción**: iOS Safari tiene soporte parcial para Web Push (requiere iOS 16.4+ y que el sitio esté instalado como PWA).
**Impacto**: Una fracción significativa de los miembros en iOS no recibirá notificaciones push.
**Mitigación**:
- Documentar los requisitos de dispositivo para recibir push
- Mostrar un mensaje en el dashboard del miembro explicando cómo instalarlo como PWA
- Considerar notificaciones por email como canal alternativo (Fase E)

---

## 4.2 Riesgos de Seguridad

### RS-01 — Cookie gymsos_rol legible por JavaScript (CRÍTICO — resuelto en Sprint 1)
**Descripción**: La cookie actual que contiene el rol del usuario puede ser leída (y en algunos casos modificada) por JavaScript.
**Impacto**: Un script XSS puede leer el rol del usuario. Si modifica la cookie, puede cambiar el dashboard que se carga (aunque no puede escalar privilegios reales porque la BD tiene RLS).
**Resolución**: SEG-001 + SEG-002 — migrar a JWT claims leídos en el middleware del servidor.
**Severidad actual**: CRÍTICO (hasta que Sprint 1 complete)

### RS-02 — Falta de validación del UUID en el escáner QR (ALTO — resuelto en Sprint 1)
**Descripción**: El componente de escáner QR actualmente acepta cualquier string sin validación de formato.
**Impacto**: Un string malformado o malicioso puede causar un error en el servidor o (en el peor caso) una inyección SQL si la query no usa parámetros preparados (Supabase JS usa parámetros por defecto).
**Resolución**: SEG-006 — validación de formato UUID antes de cualquier query.
**Severidad actual**: ALTO (hasta que Sprint 1 complete)

### RS-03 — service_role key potencialmente expuesta (CRÍTICO)
**Descripción**: Si la `service_role` key de Supabase se usa en el cliente (en lugar de solo en el servidor), cualquier usuario podría bypassear las políticas RLS.
**Impacto**: Acceso total a TODA la base de datos. Brecha de datos catastrófica.
**Mitigación**:
- La `service_role` key SOLO existe en variables de entorno del servidor (`process.env.SUPABASE_SERVICE_ROLE_KEY`)
- NUNCA en variables con prefijo `NEXT_PUBLIC_`
- Verificar con `grep -r "SERVICE_ROLE_KEY" src/` que no hay referencias en código cliente
- En Server Actions, usar el cliente con service_role. En componentes cliente, usar el cliente público.

### RS-04 — RBAC + RLS: confianza incorrecta en el frontend (ALTO)
**Descripción**: Si un Server Action no verifica `fn_has_permission()` antes de ejecutar una operación, la protección depende únicamente de que el frontend no envíe la petición. Cualquier cliente que haga una llamada directa a la API bypasea el control de acceso.
**Impacto**: Un recepcionista podría llamar directamente a un Server Action de reportes si no tiene verificación de permiso en el servidor.
**Mitigación**:
- TODA Server Action que modifica o lee datos sensibles debe llamar `fn_has_permission()` como primera línea
- La verificación de permisos en el frontend (sidebar oculto, botón disabled) es solo UX — NUNCA seguridad

### RS-05 — Cross-tenant data leak en queries sin filtro (CRÍTICO)
**Descripción**: Si una query a una tabla multi-tenant omite el filtro de `tenant_id` o `id_gimnasio`, puede devolver datos de todos los tenants.
**Impacto**: Filtración de datos de todos los gimnasios del sistema.
**Mitigación**:
- Las políticas RLS son la defensa primaria — están en la BD, no en el código
- Siempre usar el cliente Supabase autenticado (no `supabaseAdmin`) para queries de usuario
- Usar `supabaseAdmin` SOLO para operaciones administrativas que explícitamente necesitan bypasear RLS (ej: crear un usuario huérfano)
- Code review obligatorio en cualquier query que use `supabaseAdmin`

### RS-06 — Tokens de invitación predecibles (BAJO)
**Descripción**: Si `fn_create_staff_code` usa un generador de IDs predecible (ej: UUIDs secuenciales), un atacante podría adivinar códigos válidos.
**Impacto**: Alguien podría registrarse con un rol de staff sin haber recibido el código.
**Mitigación**: Verificar que la generación del código usa `gen_random_uuid()` o `random_string()` con suficiente entropía.

---

## 4.3 Riesgos Multi-tenant

### RMT-01 — fn_current_tenant_id() falla silenciosamente (ALTO)
**Descripción**: Si `fn_current_tenant_id()` retorna NULL (por una condición inesperada), las políticas RLS que la usan retornarían FALSE para todas las filas, mostrando 0 resultados sin error.
**Impacto**: El admin ve el gym vacío. No detecta el problema. Puede tomar decisiones basadas en datos incorrectos (vacíos).
**Mitigación**:
- `fn_current_tenant_id()` debe tener manejo de error explícito: si no puede determinar el tenant, debe lanzar una excepción, no retornar NULL silenciosamente
- El frontend debe distinguir entre "no hay datos" y "error al cargar datos"

### RMT-02 — Cambio de rol de staff no actualiza gym_id en el JWT (MEDIO)
**Descripción**: El JWT de Supabase incluye `app_metadata.role` pero no incluye explícitamente el `gym_id` del tenant. Si el sistema en algún momento usa el `gym_id` del JWT en lugar de derivarlo del perfil del usuario, un cambio en la asignación del gimnasio no se reflejaría.
**Impacto**: El usuario opera en el gym equivocado hasta que su sesión expira.
**Mitigación**:
- Nunca incluir `gym_id` en el JWT. Siempre derivarlo de `gym.usuarios.id_gimnasio` en el servidor.
- `fn_current_tenant_id()` y `gym.current_gym_id()` deben leer de la BD, no del JWT.

### RMT-03 — platform_admin tiene acceso cross-tenant (CRÍTICO — solo cuando se implemente)
**Descripción**: El rol `platform_admin` (SAS-001) rompe por diseño el modelo de tenant único por usuario. Tiene acceso a todos los gyms.
**Impacto**: Si el rol `platform_admin` es comprometido, el atacante tiene acceso a todos los datos de todos los gyms.
**Mitigación**:
- El `platform_admin` SOLO se implementa como un rol de `service_role` en un backend dedicado, nunca como un rol de usuario normal de Supabase
- Cada acción del `platform_admin` debe quedar en un log cross-tenant separado
- Implementar 2FA obligatorio para el `platform_admin`
- Principio de mínimos privilegios: el `platform_admin` solo puede leer los datos del gym que necesita, no hay "SELECT * FROM gym.usuarios WHERE TRUE" sin filtro

### RMT-04 — Código de staff cross-tenant (RESUELTO en migración 017)
**Descripción**: Antes de la migración 017, era posible usar un código de staff del Gym A para registrarse en el Gym B.
**Estado**: Resuelto. La migración 017 añade `c.tenant_id = v_gym_tenant` en el lookup del código.
**Verificación**: TEST-COD-003 cubre este caso.

### RMT-05 — Supabase Realtime channel sin filtro de tenant (MEDIO)
**Descripción**: Si el canal de Realtime para el control de acceso no filtra por `id_gimnasio`, una recepcionista podría recibir eventos de otros gyms.
**Impacto**: Datos de acceso de otros gyms visibles en el feed de recepción.
**Mitigación**: El canal de Realtime DEBE filtrar: `table: 'accesos', filter: 'id_gimnasio=eq.${gymId}'`. Verificar esto en ACC-001.

---

## 4.4 Riesgos RBAC

### RRBAC-01 — Doble sistema de roles sin sincronización (CRÍTICO — resuelto en Sprint 1)
**Descripción**: `gym.usuarios.rol` (string) y `public.user_roles` (RBAC) son independientes. Si se desincronización, el usuario ve un dashboard diferente al que debería.
**Estado**: DA-02 del Blueprint resuelve esto. SEG-001 + SEG-002 lo implementan.
**Riesgo residual**: Si `syncRoleToJWT()` falla silenciosamente, el JWT queda con el rol viejo.
**Mitigación**: `syncRoleToJWT()` debe lanzar una excepción si falla, no continuar silenciosamente. El caller (Server Action de cambio de rol) debe manejar este error.

### RRBAC-02 — Permisos asignados a roles incorrectamente (MEDIO)
**Descripción**: La migración 018 añade nuevos permisos y los asigna a roles. Si hay un error en las asignaciones, un rol puede tener permisos de más o de menos.
**Impacto**: Seguridad (permisos de más) o funcionalidad rota (permisos de menos).
**Mitigación**:
- La migración 018 debe tener un SELECT de verificación al final que liste todos los permisos por rol
- TEST-RBAC-001 a TEST-RBAC-005 deben pasar antes de considerar la migración completa

### RRBAC-03 — Trabajador revocado con sesión activa (BAJO)
**Descripción**: Después de revocar el acceso, el trabajador puede tener una sesión activa en su dispositivo. La revocación invalida sus permisos, pero hasta que haga una acción, no recibe el 403.
**Impacto**: El trabajador puede ver datos en caché de su sesión activa brevemente.
**Mitigación**:
- La revocación es efectiva inmediatamente en `fn_has_permission()` — la primera acción del trabajador falla
- Para revocar la sesión activa: llamar a `supabase.auth.admin.signOut(userId)` en el Server Action de revocación (Fase E)
- En la UI: al revocar, mostrar "El acceso se revocará en la próxima acción del trabajador"

### RRBAC-04 — Supervisor puede hacer demasiado o muy poco (MEDIO)
**Descripción**: El Supervisor tiene 23 permisos (según el Blueprint). Es una lista larga y puede haber permisos que no corresponden operativamente o que faltan.
**Impacto**: Un Supervisor puede ver datos que no debería (ej: reportes financieros completos) o no puede hacer su trabajo (ej: no puede gestionar clases).
**Mitigación**:
- Revisar los 23 permisos del Supervisor con el dueño del gym antes de liberar STF-001 (Pregunta Q1 del backlog)
- La tabla de `role_permissions` puede ajustarse con una migración hotfix si se detecta el error temprano

### RRBAC-05 — Roles personalizados heredan permisos incorrectamente (FUTURO)
**Descripción**: Cuando se implementen roles personalizados (SAS-006), un admin podría crear un rol custom con permisos que no debería tener (ej: gym.config.editar).
**Impacto**: Un trabajador con rol custom podría tener más acceso del autorizado.
**Mitigación**:
- Los roles custom (is_system_role=false) no pueden tener hierarchy_level < 10 (no pueden superar al Supervisor)
- El UI solo permite asignar permisos que ya tiene el Admin — no puede escalar permisos
- Este riesgo es Fase E — documentar y verificar cuando se implemente

---

## 4.5 Riesgos de Rendimiento

### RRP-01 — Dashboard Admin con 8+ queries en el load inicial (ALTO)
**Descripción**: El Panel Ejecutivo del Admin (AD-01) carga 8 widgets, cada uno con su propia query. En total puede hacer 8-12 queries al cargar.
**Impacto**: Tiempo de carga > 3 segundos en conexiones lentas.
**Mitigación**:
- Usar Server Components de Next.js para renderizar los widgets en paralelo (Promise.all en el servidor)
- Implementar `Suspense` boundaries por widget — los que cargan primero se muestran, los demás muestran skeleton
- Cachear con `unstable_cache` de Next.js los KPIs que no son tiempo real (retención mensual, NPS) con TTL de 5 minutos

### RRP-02 — Supabase Realtime + múltiples canales por sesión (MEDIO)
**Descripción**: Si se abren múltiples canales de Realtime en la misma sesión, se consumen más conexiones.
**Impacto**: Límites de plan alcanzados. Degradación del servicio.
**Mitigación**:
- Mantener máximo 1 canal de Realtime por sesión de usuario
- El canal de accesos se cierra al navegar fuera de la pantalla de recepción (cleanup en `useEffect`)

### RRP-03 — audit_logs crecimiento sin límite (MEDIO — Fase E)
**Descripción**: Con 100+ gyms y triggers en todas las operaciones críticas, `public.audit_logs` crecerá rápidamente.
**Impacto**: Queries lentas en el visor de auditoría. Costos de almacenamiento.
**Mitigación en Fase E**:
- Índices sobre `(tenant_id, created_at DESC)` y `(tenant_id, actor_id, created_at DESC)`
- Política de retención: archivar eventos > 2 años a tabla `audit_logs_archive`
- Particionamiento por mes en Fase E (cuando lleguen a 100+ gyms)

### RRP-04 — churn_predictions sin índice de tenant (MEDIO)
**Descripción**: Si la tabla `churn_predictions` no tiene índice en `(tenant_id, score DESC)`, la query del widget de churn hace un full scan.
**Impacto**: Lento en gyms con muchos miembros.
**Mitigación**: Verificar que el índice existe. Si no, añadir en migración 018.

### RRP-05 — Búsqueda de miembros sin índice full-text (BAJO)
**Descripción**: La búsqueda libre de miembros por nombre hace un `ILIKE '%query%'` que no usa índices.
**Impacto**: Lento en gyms con 1000+ miembros.
**Mitigación**: Añadir índice GIN para `tsvector` sobre `(nombre, email)` en `gym.usuarios`. Implementar en Sprint 3 junto con MBR-001.

---

# PARTE 5 — MATRIZ DE DEPENDENCIAS FINAL

## 5.1 Mapa de dependencias entre módulos (no entre historias)

```
MÓDULO                  DEPENDE DE (para existir)
─────────────────────── ──────────────────────────────────────────
Auth JWT (M01)          → [Nada — es el cimiento]
RBAC (M02)              → Auth JWT (M01) · Migración 018
Staff Mgmt (M03)        → Auth JWT · RBAC · Migración 018
Códigos Invit. (M04)    → Auth JWT · RBAC · Migración 018
Gestión Miembros (M05)  → Auth JWT · RBAC · Migración 018 (RPC transaccional)
Membresías/Pagos (M06)  → Gestión Miembros (M05) · Migración 018
Control Accesos (M07)   → Auth JWT · Gestión Miembros · Migración 018 (RLS fix)
Clases (M08)            → Auth JWT · RBAC · Migración 018 (gym.asistencia.ver)
Analytics (M09)         → Gestión Miembros · Membresías/Pagos · Clases
Auditoría (M10)         → Auth JWT · Migración 018 (triggers)
Configuración (M11)     → Auth JWT · RBAC
QR Miembro (M12)        → Control Accesos (M07) · Auth JWT
Nutrición (M13)         → Gestión Miembros · RBAC
Push Notif. (M14)       → QR Miembro (M12) · Migración 019
IA Gemini (M15)         → Analytics (M09) · Configuración (M11) · Push Notif. (M14)
Gamificación (M16)      → Control Accesos (M07) [XP por visita]
Super-Admin (M17)       → Auth JWT · Multi-tenant base
Stripe (M18)            → QR Miembro/Renovación (M12) · Configuración (M11)
```

## 5.2 Qué migraciones requiere cada módulo — Vista consolidada

| Módulo | M018 | M019 | Otras existentes |
|--------|------|------|-----------------|
| Auth JWT | — | — | — |
| RBAC | ✅ (nuevos permisos) | — | 016 |
| Staff Management | ✅ (gym.staff.ver, revocación) | — | 016 |
| Códigos Invitación | ✅ (max_licenses) | ✅ (fn_validate desacoplado) | 010, 016 |
| Gestión de Miembros | ✅ (rpc_registrar transaccional) | — | 009 |
| Membresías y Pagos | ✅ (gym.pagos.crear recepcionista, trigger PAYMENT_CREATED) | — | 009 |
| Control de Accesos | ✅ (RLS gym.accesos, trigger ACCESS_DENIED) | — | 009 |
| Clases | ✅ (gym.asistencia.ver) | — | 009 |
| Analytics | ✅ (nps_surveys) | — | ai schema existente |
| Auditoría | ✅ (triggers faltantes) | — | 015b |
| Configuración | ✅ (trigger GYM_CONFIG_UPDATED) | — | 009 |
| QR Miembro | — | ✅ (push_subscriptions prep) | — |
| Push Notifications | — | ✅ (push_subscriptions tabla) | — |
| IA/Gamificación | — | — | ai schema existente |
| Super-Admin | — | — | tenants existente |

## 5.3 RPCs por módulo — Vista consolidada

| Módulo | RPCs Existentes ✅ | RPCs Nuevas ❌ |
|--------|------------------|--------------|
| Auth JWT | fn_current_tenant_id, fn_has_permission, fn_my_permissions | syncRoleToJWT (Server Action, no SQL) |
| RBAC | fn_has_permission, fn_my_permissions | — |
| Staff Mgmt | fn_has_permission | rpc_revocar_acceso (o en Server Action) |
| Códigos | fn_create_staff_code, fn_revoke_code, fn_validate_code | fn_validate_staff_code (migración 019) |
| Miembros | — | rpc_registrar_nuevo_miembro |
| Membresías/Pagos | — | rpc_registrar_pago (verificar si existe) |
| Control Accesos | — | rpc_registrar_acceso (verificar si existe) |
| Clases | — | rpc_inscribir_a_clase, rpc_cerrar_clase |
| Analytics | — | Solo Server Actions (no RPCs SQL) |
| Auditoría | — | Solo Server Actions |
| Configuración | — | Solo Server Actions |
| QR Miembro | — | generateQrToken, validateQrToken (Server Actions) |

## 5.4 Tabla de páginas frontend por módulo

| Módulo | Páginas | Rutas |
|--------|---------|-------|
| Auth | Login, Signup, Onboarding | `/login`, `/signup`, `/onboarding` |
| RBAC | Matriz de permisos | `/dashboard/admin/staff/roles` |
| Staff Mgmt | Staff (3 tabs), Roles | `/dashboard/admin/staff`, `/dashboard/admin/staff/roles` |
| Códigos | (integrado en Staff Mgmt) | (tabs en `/dashboard/admin/staff`) |
| Miembros | Lista, Perfil, Registro | `/dashboard/admin/miembros`, `…/[id]`, `/dashboard/recepcionista/registro` |
| Membresías/Pagos | Cajero, Pendientes, Historial | `/dashboard/cajero`, `…/pendientes`, `/dashboard/admin/membresias/pagos` |
| Control Accesos | Recepción LIVE | `/dashboard/recepcionista` |
| Clases | Admin, Entrenador, Recepcionista, Miembro | 4 páginas en 4 dashboards |
| Analytics | Reportes (4 tabs) | `/dashboard/admin/reportes/*` |
| Auditoría | Visor de audit | `/dashboard/admin/auditoria` |
| Configuración | Config (4 tabs) | `/dashboard/admin/configuracion/*` |
| QR Miembro | Dashboard Miembro, Progreso | `/dashboard/miembro`, `…/progreso` |

---

# PARTE 6 — GUÍA DE TIPOS TYPESCRIPT DEL DOMINIO

Antes de construir cualquier módulo, estos tipos deben definirse en `types/domain.ts`. Todos los servicios y componentes los importan de aquí.

```
ENTIDADES CORE (definir primero):
  Tenant           — { id, nombre, plan, max_licenses, status }
  GymProfile       — { id_gimnasio, id_tenant, nombre, logo_url, ... }
  UserProfile      — { user_id, tenant_id, gym_id, nombre, email, avatar_url }
  UserRole         — { user_id, tenant_id, role_id, expires_at, revoked_by, ... }
  Role             — { id, name, hierarchy_level, is_system_role, tenant_id }
  Permission       — { id, name, description }

ENTIDADES DE NEGOCIO:
  Miembro          — gym.usuarios con rol = 'miembro'
  Trabajador       — gym.usuarios con rol != 'miembro'
  Membresia        — { id, id_usuario, id_plan, fecha_inicio, fecha_fin, estado }
  Pago             — { id, id_membresia, monto, forma_pago, procesado_por, created_at }
  Acceso           — { id, id_usuario, id_gimnasio, permitido, motivo, created_at }
  Clase            — { id, nombre, id_entrenador, id_espacio, hora_inicio, hora_fin, cupo }
  Inscripcion      — { id, id_clase, id_usuario, asistio, created_at }
  CodigoAcceso     — { id, code, type, status, max_uses, current_uses, expires_at, tenant_id }

ENTIDADES RBAC:
  Permission       — string (ej: 'gym.staff.ver')
  PermissionsMap   — Record<string, boolean>

ESTADOS SEMÁNTICOS:
  EstadoMembresia  — 'activa' | 'por_vencer' | 'vencida' | 'cancelada' | 'sin_membresia'
  EstadoCodigo     — 'active' | 'used' | 'expired' | 'revoked'
  EstadoRol        — 'active' | 'suspended' | 'revoked' | 'expiring_soon'
  FormasPago       — 'efectivo' | 'yape' | 'plin' | 'transferencia' | 'tarjeta'

RESPONSES DE RPCs:
  RPCResponse<T>   — { ok: true, data: T } | { ok: false, error: string }
  LimitReachedError — { ok: false, error: 'LIMIT_REACHED', current: number, max: number }
```

---

# PARTE 7 — CHECKPOINTS DE CADA FASE

## Checkpoint Fase A — Semana 2 (antes de iniciar Fase B)

Preguntas que deben responderse con "SÍ" antes de continuar:

- [ ] ¿La migración 018 está aplicada y verificada en producción?
- [ ] ¿Un usuario con rol `cajero` puede iniciar sesión y ve su dashboard?
- [ ] ¿Un usuario con rol `supervisor` puede iniciar sesión y ve su dashboard?
- [ ] ¿El JWT de cada usuario tiene `app_metadata.role` correcto?
- [ ] ¿El middleware lee el rol del JWT (no de la cookie JavaScript)?
- [ ] ¿Los 7 roles del sistema tienen dashboards funcionales sin 404?
- [ ] ¿No hay regresiones en los dashboards existentes (gerente, recepcionista, entrenador, nutricionista, miembro)?
- [ ] ¿`fn_has_permission('gym.staff.ver')` retorna TRUE para Admin y FALSE para Recepcionista?
- [ ] ¿Los componentes Tier 1 existen y son funcionales?

## Checkpoint Fase B — Semana 6 (antes de iniciar Fase C)

- [ ] ¿El admin puede ver la lista de todos sus trabajadores con sus roles RBAC?
- [ ] ¿El admin puede revocar el acceso de un trabajador y este pierde acceso en < 1 minuto?
- [ ] ¿El cajero puede cobrar una membresía en < 3 clics desde búsqueda hasta confirmación?
- [ ] ¿El control de acceso actualiza el feed en tiempo real (< 2 segundos)?
- [ ] ¿El registro de un nuevo miembro es atómico (sin usuarios huérfanos)?
- [ ] ¿El historial de códigos muestra quién usó cada código?
- [ ] ¿Las pruebas TEST-STF-001 a TEST-STF-006 pasan?
- [ ] ¿Las pruebas TEST-ACC-001 a TEST-ACC-005 pasan?

## Checkpoint Fase C — Semana 10 (antes de iniciar Fase D)

- [ ] ¿El NPS muestra datos reales (no el 72 hardcodeado)?
- [ ] ¿El visor de auditoría muestra eventos ROLE_REVOKED, PAYMENT_CREATED, etc.?
- [ ] ¿El admin puede editar el nombre y el logo del gym?
- [ ] ¿Los planes de membresía son editables desde la UI?
- [ ] ¿El reporte financiero puede exportarse como CSV?

## Checkpoint Fase D — Semana 14 (antes de iniciar Fase E)

- [ ] ¿El QR del miembro rota automáticamente cada 60 segundos?
- [ ] ¿Un token de QR capturado hace 2 minutos es rechazado?
- [ ] ¿Los miembros reciben push notification cuando su membresía vence en 5 días?
- [ ] ¿El nutricionista puede crear un plan nutricional completo para un paciente?

## Checkpoint Fase E — Semana 20 (Go-Live v2.0)

- [ ] ¿El panel de super-admin puede crear un nuevo gym?
- [ ] ¿La integración con Gemini devuelve recomendaciones de workout para el miembro?
- [ ] ¿El refactoring del God Service no introdujo regresiones en el dashboard del admin?
- [ ] ¿El sistema funciona correctamente con 5+ gyms simultáneos en staging?

---

# PARTE 8 — RESUMEN EJECUTIVO PARA EL TECHNICAL LEAD

## Lo que debe construirse EXACTAMENTE en este orden

**SEMANA 1: Solo BD y fundamentos**
Migración 018 completa → Tipos TypeScript del dominio → Componentes Tier 1 → Hooks Tier 1

**SEMANA 2: Seguridad de autenticación**
JWT sync → Middleware → role_dashboard_map → Routing supervisor/cajero → Dashboards MVP

**SEMANAS 3-4: Staff Management**
Lista trabajadores → Drawer → Cambio de rol → Revocación → Historial códigos

**SEMANAS 5-6: Operaciones Core**
RPC transaccional → Registro miembro → Lista miembros → Cobros cajero → Acceso LIVE

**SEMANAS 7-8: Clases + Inicio Analytics**
Agenda semanal → Tomar asistencia → NPS real → Panel Churn

**SEMANAS 9-10: Analytics completo + Auditoría + Configuración**
Reportes financieros → Mapa de calor → Visor audit → CRUD planes

**SEMANAS 11-14: Ciclo del Miembro**
QR dinámico → Renovación autoasistida → Push notifications → Evaluaciones

**SEMANAS 15-20: IA + Escalabilidad**
Gemini → Gamificación → Super-admin → Stripe → Roles personalizados

## Los 5 riesgos que necesitan atención inmediata

1. **RS-01** — Cookie en JavaScript: resuelto en Sprint 1, Semana 1. No puede esperar.
2. **RT-02** — Registro no atómico: resuelto en Sprint 3 (MBR-003). Sin esto, hay riesgo de usuarios huérfanos en producción.
3. **RS-03** — service_role en cliente: verificar INMEDIATAMENTE antes de cualquier desarrollo. Un `grep` en el código base.
4. **RT-01** — God Service: no añadir nada nuevo. Crear los nuevos servicios independientes desde el día 1.
5. **RMT-05** — Realtime sin filtro de tenant: verificar el canal de Supabase Realtime en ACC-001. Un bug aquí expone datos de otro gym.

## Las 3 decisiones que deben tomarse antes del Sprint 1

| # | Decisión | Impacto | Deadline |
|---|---------|---------|----------|
| D1 | ¿El sidebar usa un componente único con config por rol, o un componente por dashboard? | Afecta ROL-003 y todos los dashboards | Antes de comenzar ROL-003 |
| D2 | ¿El QR dinámico usa JWT local o UUID temporal en BD? | Afecta MBM-001 y la complejidad del validador | Antes de iniciar Fase D |
| D3 | ¿Las evaluaciones de Entrenador y Nutricionista comparten tabla o son tablas separadas? | Afecta la migración de NUT-002 y NUT-004 | Antes de iniciar Sprint 6 |

---

*Plan Maestro de Implementación — GYMsos Operating System v1.0*
*2026-06-03 · Listo para iniciar Sprint 1*
*Basado en Blueprint Definitivo v2.0 · Especificación UX/UI v1.0 · Backlog Técnico v1.0*
