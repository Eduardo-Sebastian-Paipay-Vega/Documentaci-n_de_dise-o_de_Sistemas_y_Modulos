# PLAN MAESTRO DE IMPLEMENTACIÓN — GYMSOS OPERATING SYSTEM
> **Versión**: 1.0 · **Fecha**: 2026-06-03
> **Rol del documento**: Contrato técnico de construcción. Transforma el backlog en instrucciones de arquitectura ejecutables.
> **Fuentes**: Auditoría v1 (1.md) · Auditoría v2 (2.md) · Blueprint Definitivo (4.md) · Especificación UX/UI · Backlog Técnico
> **Autores del rol**: Technical Lead · Software Architect · SaaS Architect · Supabase Architect · Next.js Architect

---

# PARTE 1 — FUNDAMENTOS DE ARQUITECTURA

## 1.1 Stack Tecnológico Confirmado

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Frontend | Next.js (App Router) | 14+ | SSR, routing, Server Actions |
| Autenticación | Supabase Auth | — | JWT, sesiones, triggers |
| Base de datos | PostgreSQL (Supabase) | 15+ | Multi-tenant con RLS |
| ORM / Client | Supabase JS Client | 2.x | Dos instancias: `supabase` (public) + `supabaseAdmin` (service role) |
| Estilos | Tailwind CSS | 3.x | Utilidades + componentes |
| Iconos | Lucide React | — | Sistema unificado de iconos |
| Gráficos | Recharts | — | Analytics y dashboards |
| Realtime | Supabase Realtime | — | Control de acceso LIVE |
| Push | Web Push VAPID | — | Notificaciones (Fase D) |
| IA | Gemini API | — | Churn + recomendaciones (Fase E) |
| Pagos | Stripe | — | Renovaciones digitales (Fase E) |

## 1.2 Arquitectura de Schemas de Base de Datos

El sistema opera sobre dos schemas de PostgreSQL. Esta separación es fundamental:

```
public schema
├── tenants          ← El tenant = el gimnasio como entidad de negocio SaaS
├── profiles         ← Perfil universal BD Maestra (multi-módulo)
├── roles            ← Roles RBAC por tenant (7 de sistema + custom futuros)
├── user_roles       ← Asignación usuario → rol → tenant (con expires_at)
├── role_permissions ← Qué permisos tiene cada rol
├── cat_permissions  ← Catálogo de todos los permisos posibles
├── codes            ← Códigos de invitación (GYM_ACCESS, USER_INVITE, etc.)
├── code_grants      ← Qué otorga cada código
├── code_usages      ← Historial de uso de códigos
├── audit_logs       ← Registro append-only de toda acción relevante
├── nps_surveys      ← Scores NPS reales (migración 018)
└── push_subscriptions ← Suscripciones Web Push (migración 019)

gym schema
├── gimnasios        ← El gym físico (vinculado al tenant)
├── usuarios         ← Miembros y staff del gym con rol string legacy
├── planes           ← Planes de membresía del gym
├── membresias       ← Membresías activas/vencidas de los miembros
├── pagos            ← Transacciones económicas
├── accesos          ← Registro de entradas/salidas QR
├── clases           ← Clases programadas
├── inscripciones    ← Relación miembro ↔ clase
├── espacios         ← Salas y áreas del gym
├── entrenadores     ← Perfil extendido de entrenadores
├── evaluaciones     ← Evaluaciones físicas y nutricionales
├── planes_nutricionales ← Planes de nutrición por paciente
└── equipamiento     ← Máquinas y equipos (Fase C)

ai schema (futuro)
├── churn_predictions
├── ai_recommendations
└── gamification_xp
```

## 1.3 Dualidad de Roles — Política Formal

Este es el invariante más importante de la arquitectura. NUNCA debe violarse:

```
gym.usuarios.rol (string)
  → PROPÓSITO: Determina el dashboard de destino al iniciar sesión
  → PROPÓSITO: Label visual en la UI ("Eres Recepcionista")
  → NUNCA para: Autorizar operaciones de negocio

public.user_roles + fn_has_permission()
  → PROPÓSITO ÚNICO: Autorizar o denegar operaciones
  → Es la defensa real (respaldada por RLS y SECURITY DEFINER)
  → Verifica: tenant_id + role_id + expires_at en cada llamada

app_metadata.role (JWT claim)
  → PROPÓSITO: Leer el rol en el middleware de Next.js sin cookie JavaScript
  → Se sincroniza con gym.usuarios.rol al crear/actualizar usuario
  → No tiene autoridad de seguridad real — es solo para routing del middleware
```

## 1.4 Invariantes de Seguridad Multi-tenant

Los siguientes invariantes NUNCA pueden violarse en ninguna línea de código:

1. **Toda tabla en `gym.*` tiene `id_gimnasio` + política RLS `id_gimnasio = gym.current_gym_id()`**
2. **Toda tabla en `public.*` que pertenece a un tenant tiene `tenant_id` + política RLS `tenant_id = fn_current_tenant_id()`**
3. **Toda RPC que modifica datos sensibles usa `SECURITY DEFINER` + `SET search_path = public, gym`**
4. **`fn_has_permission()` SIEMPRE verifica `tenant_id` internamente — nunca confiar en el rol del frontend**
5. **El `service_role` de Supabase NUNCA se usa en el cliente (solo en Server Actions del servidor)**
6. **Un código de staff no puede cruzar tenants — validado en migración 017 y en `fn_create_staff_code`**

---

# PARTE 2 — INFRAESTRUCTURA PREVIA (BUILD FIRST)

Antes de construir cualquier módulo funcional, estos elementos deben existir y estar probados. Son los cimientos de todo lo demás.

## 2.1 Capa de Base de Datos — Orden de Migraciones

Las migraciones deben aplicarse en el siguiente orden estricto. Cada una depende de la anterior.

| # | Migración | Estado | Contenido | Orden |
|---|-----------|--------|-----------|-------|
| 000-008 | Schema base | ✅ Aplicada | Schema inicial, usuarios, gym | — |
| 009 | `gym_as_bd_maestra_module` | ✅ Aplicada | BD Maestra + schema gym | — |
| 010 | Códigos y auditoría base | ✅ Aplicada | `public.codes`, `code_usages`, `code_grants` | — |
| 011 | Perfil universal | ✅ Aplicada | `public.profiles` | — |
| 012 | RPCs de perfil | ✅ Aplicada | SECURITY DEFINER RPCs | — |
| 013 | Multi-tenant RLS | ✅ Aplicada | Políticas RLS en gym.* | — |
| 014 | Avatar universal | ✅ Aplicada | `universal_avatar` | — |
| 015b | Audit logs | ✅ Aplicada | `public.audit_logs` | — |
| 016 | RBAC completo | ✅ Aplicada | `public.roles`, `user_roles`, `role_permissions`, `cat_permissions` | — |
| 017 | Fix staff code trigger | ✅ Aplicada | FOR UPDATE anti-race-condition + tenant filter | — |
| **018** | **Staff perms + fixes** | ❌ **PENDIENTE** | Nuevos permisos, max_licenses, campos revocación, RLS accesos, triggers audit, nps_surveys | **PRIMERA** |
| **019** | **Desacople fn_validate** | ❌ **PENDIENTE** | RPC fn_validate_staff_code sin tenant_id, push_subscriptions | **DESPUÉS de 018** |

### Contenido completo de la Migración 018

La migración 018 es la más crítica del Plan Maestro. Contiene:

```
018_staff_perms_and_fixes.sql

PASO 1: Nuevos permisos en cat_permissions
  - gym.staff.ver
  - gym.staff.gestionar
  - gym.evaluaciones.ver
  - gym.evaluaciones.gestionar
  - gym.asistencia.ver

PASO 2: Asignar permisos a roles en role_permissions
  - gym.staff.ver → Admin General, Supervisor
  - gym.staff.gestionar → Admin General
  - gym.evaluaciones.ver → Admin, Supervisor, Entrenador, Nutricionista
  - gym.evaluaciones.gestionar → Admin, Entrenador, Nutricionista
  - gym.asistencia.ver → Admin, Supervisor, Entrenador
  - gym.pagos.crear → Recepcionista (corrección Contradicción C-02)

PASO 3: Validación max_licenses en fn_create_staff_code
  - Añadir validación antes del CREATE code
  - Retornar { ok: false, error: 'LIMIT_REACHED', current: N, max: M } si excede

PASO 4: Campos de contexto de revocación en user_roles
  - revoked_by UUID REFERENCES auth.users(id) NULL
  - revocation_reason TEXT NULL
  - revocation_type TEXT CHECK IN ('permanent', 'temporary') NULL

PASO 5: Verificar y corregir RLS de gym.accesos para rol Miembro
  - La política SELECT debe filtrar id_usuario = auth.uid() si el actor es Miembro
  - Staff (recepcionista, admin) puede ver todos los accesos del gym

PASO 6: Triggers de audit_logs faltantes
  - ROLE_CHANGED: trigger en UPDATE de public.user_roles cuando role_id cambia
  - ROLE_REVOKED: trigger en UPDATE de public.user_roles cuando expires_at se establece
  - PAYMENT_CREATED: trigger en INSERT en gym.pagos
  - MEMBERSHIP_CANCELLED: trigger en UPDATE de gym.membresias cuando estado='cancelada'
  - GYM_CONFIG_UPDATED: trigger en UPDATE de gym.gimnasios
  - ACCESS_DENIED: trigger en INSERT en gym.accesos cuando permitido=false

PASO 7: Tabla nps_surveys
  - id, user_id, tenant_id, score (0-10), comment, created_at
  - RLS: miembro ve las suyas; admin ve todas las de su tenant

PASO 8: Verificación final
  - SELECT que confirma los nuevos permisos existen
  - SELECT que confirma los triggers fueron creados
```

## 2.2 Componentes Reutilizables — Construir Primero

Estos componentes deben existir antes de construir cualquier página. Todos los módulos los consumen.

### Tier 1 — Absolutamente Primero (Semana 1)

| Componente | Propósito | Consumido por |
|-----------|-----------|--------------|
| `<KpiCard />` | Card de métrica con número grande, variación % y semáforo | Todos los dashboards |
| `<StatusBadge />` | Badge coloreado para estados (membresía, rol, código) | Todos los módulos |
| `<DataTable />` | Tabla con paginación, ordenación y skeleton | Staff, Miembros, Pagos, Audit |
| `<EmptyState />` | Estado vacío con ilustración, título, descripción y CTA opcional | Todos los módulos |
| `<ErrorState />` | Estado de error con mensaje y botón Retry | Todos los módulos |
| `<PageHeader />` | Header de página con título, breadcrumb y acciones | Todas las páginas |
| `<SkeletonTable />` | Skeleton animado para tablas durante carga | Todos los módulos con tabla |
| `<ConfirmModal />` | Modal de confirmación con variantes default/destructive | Staff, Miembros, Clases |
| `<SidebarNav />` | Navegación lateral configurable por rol | Todos los dashboards |
| `<RoleBadge />` | Badge específico de rol con color canónico | Staff, Auditoría |

### Tier 2 — Segunda Semana

| Componente | Propósito | Consumido por |
|-----------|-----------|--------------|
| `<Drawer />` | Panel lateral de 400px con header fijo + footer | Staff (detalle trabajador), Miembro (perfil) |
| `<SearchInput />` | Input con debounce, ícono de lupa y clear button | Cajero, Miembros, Staff, Recepcionista |
| `<FilterBar />` | Barra de filtros con chips de filtros activos | Miembros, Staff, Códigos, Audit |
| `<TabPanel />` | Sistema de tabs con contenido lazy-loaded | Staff (3 tabs), Perfil miembro (5 tabs), Reportes (4 tabs) |
| `<FormField />` | Campo de formulario con label, input, helper y error | Todos los formularios |
| `<ActionMenu />` | Menú contextual ⋮ para acciones de fila | Todas las tablas |
| `<Toast />` | Notificaciones temporales (éxito, error, warning, info) | Todas las acciones |
| `<Avatar />` | Avatar con fallback a iniciales | Tablas, headers, sidebars |
| `<OccupancyBar />` | Barra de progreso de ocupación X/Y | Clases, licencias de staff |
| `<DateRangePicker />` | Selector de rango de fechas | Reportes, Audit, Filtros |

### Tier 3 — Con el Módulo que los Necesite

| Componente | Propósito | Primero necesitado en |
|-----------|-----------|----------------------|
| `<QrDisplay />` | Muestra un QR con fondo blanco y tamaño configurable | Dashboard Miembro |
| `<QrScanner />` | Input de escaneo + cámara + feedback visual | Control de Acceso |
| `<AccessFeedItem />` | Ítem del feed live de accesos | Control de Acceso |
| `<ChurnBadge />` | Badge de score de churn con color semáforo | Lista de Miembros, Dashboard Admin |
| `<LineChart />` | Gráfico de líneas (Recharts wrapper) | Reportes, Dashboard Admin |
| `<BarChart />` | Gráfico de barras (Recharts wrapper) | Reportes, Accesos por hora |
| `<HeatMap />` | Mapa de calor (custom) | Reportes Asistencia |
| `<PermissionMatrix />` | Matriz de roles × permisos | Roles y Permisos |
| `<CodeDisplay />` | Muestra el código de invitación con opción de revelar | Historial de Códigos |
| `<StepModal />` | Modal de múltiples pasos | Revocación de staff, Registro miembro |
| `<PlanCard />` | Card de plan de membresía | Configuración, Cajero |
| `<MemberCard />` | Mini-card del miembro para search results | Cajero, Recepcionista |

## 2.3 Hooks Reutilizables — Construir Primero

### Tier 1 — Antes de cualquier módulo

| Hook | Propósito | Retorna |
|------|-----------|---------|
| `usePermissions()` | Lee los permisos del usuario desde el AuthProvider | `{ permissions: string[], hasPermission: (p: string) => boolean }` |
| `useCurrentUser()` | Usuario autenticado con rol y tenant | `{ user, role, tenantId, gymId }` |
| `useCurrentTenant()` | Datos del tenant del usuario | `{ tenant, gym, maxLicenses }` |
| `usePagination()` | Estado de paginación (página, pageSize, total) | `{ page, pageSize, offset, setPage, setPageSize }` |
| `useDebounce()` | Debounce de valores (para búsqueda) | `debouncedValue` |
| `useToast()` | Disparar toasts desde cualquier componente | `{ success, error, warning, info }` |

### Tier 2 — Segunda Semana

| Hook | Propósito | Retorna |
|------|-----------|---------|
| `useFilters()` | Estado de filtros con serialización en URL | `{ filters, setFilter, clearFilters, activeCount }` |
| `useSupabaseRealtime()` | Suscripción a un canal de Supabase Realtime | `{ isConnected, lastEvent }` |
| `useConfirm()` | Promesa que espera confirmación del usuario | `{ confirm: (opts) => Promise<boolean> }` |
| `useAuditLog()` | Registrar una acción en audit_logs desde el cliente | `{ logAction: (action, targetId, data) => void }` |
| `useStaffSearch()` | Buscar trabajadores del tenant | `{ results, isLoading, search }` |
| `useMemberSearch()` | Buscar miembros del tenant | `{ results, isLoading, search }` |

### Tier 3 — Con el Módulo

| Hook | Módulo | Propósito |
|------|--------|-----------|
| `useRealtimeAccess()` | Control de Acceso | Suscripción a gym.accesos con filtro por gym_id |
| `useChurnPredictions()` | Dashboard Admin | Cargar y cachear predicciones de churn |
| `useGymKPIs()` | Dashboard Admin | KPIs del negocio con auto-refresh |
| `useQrToken()` | Dashboard Miembro | Generar y rotar el token del QR cada 55 segundos |
| `useLicenseCount()` | Staff Management | Contar licencias usadas vs máximas |
| `useCodeGeneration()` | Staff Management | Generar código de staff con validación previa |

---

# PARTE 3 — ORDEN EXACTO DE CONSTRUCCIÓN POR MÓDULO

## 3.1 Clasificación de Módulos

| Módulo | Clasificación | Justificación |
|--------|--------------|--------------|
| Autenticación y JWT | **Core** | Sin esto nada funciona |
| RBAC y Permisos | **Core** | Sin esto no hay seguridad |
| Multi-tenant Isolation | **Core** | Sin esto el SaaS es inseguro |
| Staff Management | **Core** | Sin esto el admin no puede gestionar su equipo |
| Codes de Invitación | **Core** | Sin esto no se puede incorporar personal |
| Control de Accesos QR | **Core** | Es la operación más frecuente del gym |
| Gestión de Miembros | **Core** | Es el negocio central |
| Membresías y Pagos | **Core** | Es el revenue del gym |
| Dashboard Admin | **Core** | Sin esto el admin opera a ciegas |
| Dashboard Recepcionista | **Core** | Operación diaria |
| Dashboard Cajero | **Core** | Nuevo — sin esto el cajero no puede operar |
| Dashboard Supervisor | **Importante** | Nuevo — jerarquía operativa |
| Dashboard Entrenador | **Importante** | Gestión de clases |
| Dashboard Nutricionista | **Importante** | Servicio diferencial |
| Dashboard Miembro | **Core** | QR es la llave del gym |
| Gestión de Clases | **Importante** | Retención de miembros |
| Analytics y Reportes | **Importante** | Decisiones de negocio |
| Auditoría | **Importante** | Compliance y seguridad |
| Configuración del Gym | **Importante** | Sin planes no hay membresías |
| Evaluaciones Físicas | **Importante** | Valor del entrenador |
| Planes Nutricionales | **Importante** | Valor del nutricionista |
| Push Notifications | **Importante** | Canal de retención |
| QR Dinámico Rotativo | **Importante** | Seguridad del acceso |
| Churn IA con Gemini | **Futuro** | Diferenciador clave |
| Gamificación XP | **Futuro** | Engagement +8x |
| Stripe Pagos Digitales | **Futuro** | Revenue digital |
| Super-Admin Multi-gym | **Importante** | SaaS operación |
| Roles Personalizados | **Opcional** | Flexibilidad avanzada |
| Wearables Sync | **Futuro** | Data moat |
| Marketplace | **Futuro** | Revenue adicional |

## 3.2 Orden Exacto de Construcción — Vista Lineal

El orden es estricto. No empezar un nivel hasta que el anterior está completo y estable en main.

```
NIVEL 0 — INFRAESTRUCTURA (Antes de cualquier código de producto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  0.1 Migración 018 aplicada y verificada
  0.2 Componentes Tier 1 construidos y en Storybook (o equivalente)
  0.3 Hooks Tier 1 construidos y con tests unitarios
  0.4 Sistema de tipos TypeScript para todas las entidades del dominio
  0.5 Configuración de ESLint estricto (no-any, no-unused-vars)
  0.6 Variables de entorno verificadas (supabase URL, keys, service role)

NIVEL 1 — AUTENTICACIÓN SEGURA (Sprint 1, Semana 1-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1.1 SEG-001: JWT claim para rol (sincronización auth → BD)
  1.2 SEG-002: Middleware lee JWT en lugar de cookie
  1.3 SEG-003: role_dashboard_map como fuente única de verdad
  1.4 SEG-004: Routing para supervisor y cajero
  1.5 SEG-005: Alias cliente → miembro
  1.6 SEG-006: Validación UUID en QR (sin esto ACC-001 es inseguro)
  1.7 ROL-003: Sidebar dinámico configurado por permisos
  → Checkpoint: TODOS los roles pueden hacer login y llegar a su dashboard

NIVEL 2 — DASHBOARDS BASE POR ROL (Sprint 1, Semana 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  2.1 ROL-001: Dashboard Supervisor MVP
  2.2 ROL-002: Dashboard Cajero MVP
  (Dashboard Admin, Recepcionista, Entrenador, Nutricionista, Miembro
   ya existen — verificar que funcionan con el nuevo sistema JWT)
  → Checkpoint: 7 roles, 7 dashboards funcionales, ninguno con mock de rol

NIVEL 3 — STAFF MANAGEMENT COMPLETO (Sprint 2, Semana 3-4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  3.1 STF-001: Lista de trabajadores activos con roles RBAC reales
  3.2 STF-008: Widget KPIs de licencias (requiere SEG-008 ya en 018)
  3.3 STF-002: Filtros y búsqueda en la tabla de staff
  3.4 STF-003: Drawer de detalle del trabajador (Info + Actividad + Permisos)
  3.5 STF-004: Modal de cambio de rol
  3.6 STF-005: Modal de suspensión temporal
  3.7 STF-006: Modal de revocación definitiva (flujo de 2 pasos)
  3.8 STF-007: Reactivar trabajador suspendido
  → Checkpoint: Admin puede ver, gestionar, suspender y revocar a todo su equipo desde la UI

NIVEL 4 — CÓDIGOS DE INVITACIÓN COMPLETO (Sprint 2, paralelo con 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  4.1 COD-001: Historial de códigos (Tab 3 en /admin/staff)
  4.2 COD-002: Revocar código activo
  4.3 Verificar que Tab 2 (Generar código) funciona con max_licenses de migración 018
  → Checkpoint: Ciclo completo de invitación (generar → compartir → usar → ver en historial)

NIVEL 5 — GESTIÓN DE MIEMBROS (Sprint 3, Semana 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  5.1 MBR-003: RPC transaccional rpc_registrar_nuevo_miembro
  5.2 MBR-001: Lista de miembros con filtros (estado + churn + plan)
  5.3 MBR-004: Formulario de registro de nuevo miembro (Recepcionista)
  5.4 MBR-002: Perfil completo del miembro (5 tabs)
  5.5 MBR-005: Cancelar membresía con confirmación en 2 pasos
  → Checkpoint: Ciclo completo del miembro (registrar → ver perfil → cancelar)

NIVEL 6 — MEMBRESÍAS Y COBROS (Sprint 3, Semana 6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  6.1 MEM-001: Card de cobro rápido en dashboard del Cajero
  6.2 MEM-002: Lista de membresías por cobrar hoy
  6.3 MEM-003: Historial de pagos del gym (Admin)
  → Checkpoint: Cajero puede cobrar en < 3 clics desde buscar hasta confirmar

NIVEL 7 — CONTROL DE ACCESOS COMPLETO (Sprint 3, paralelo con 5-6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  7.1 ACC-001: Control de acceso LIVE con Supabase Realtime
  7.2 ACC-002: Registro de acceso manual (sin QR)
  → Checkpoint: Recepcionista puede escanear QR, el feed actualiza en tiempo real,
    el acceso con membresía vencida es denegado con motivo claro

NIVEL 8 — CLASES Y AGENDA (Sprint 4, Semana 7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  8.1 CLS-001: Agenda semanal del Admin
  8.2 CLS-002: Agenda del día del Entrenador
  8.3 CLS-003: Tomar asistencia en clase
  8.4 CLS-004: Inscripción a clase desde Recepcionista
  8.5 CLS-005: Clases disponibles para el Miembro
  → Checkpoint: Ciclo completo de clase (crear → inscribir → asistir → cerrar)

NIVEL 9 — ANALYTICS Y REPORTES (Sprint 4-5, Semana 7-8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  9.1 ANA-001: Widget NPS con datos reales (no el 72 hardcodeado)
  9.2 ANA-002: Panel de Churn con acciones directas
  9.3 ANA-003: Reporte Financiero con gráficos y exportación
  9.4 ANA-004: Reporte de Retención y Churn
  9.5 ANA-005: Mapa de calor de asistencia
  → Checkpoint: El admin puede tomar decisiones de negocio basadas en datos reales

NIVEL 10 — AUDITORÍA Y CONFIGURACIÓN (Sprint 5, Semana 9-10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  10.1 AUD-001: Visor de audit_logs con filtros
  10.2 AUD-002: Exportar audit log CSV
  10.3 AUD-003: Widget de roles próximos a expirar
  10.4 CFG-001: Editar datos del gimnasio
  10.5 CFG-002: CRUD de planes de membresía
  10.6 CFG-003: Gestión de espacios y equipamiento
  → Checkpoint: El admin puede auditar cualquier acción de su personal y configurar el gym

NIVEL 11 — CICLO COMPLETO DEL MIEMBRO (Sprint 6-7, Semana 11-14)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  11.1 MBM-001: QR dinámico con rotación de 60 segundos
  11.2 MBM-002: Renovación de membresía autoasistida
  11.3 MBM-006: Historial de visitas y estadísticas del miembro
  11.4 MBM-003: Infraestructura Web Push VAPID
  11.5 MBM-004: Push "Tu membresía vence en 5 días"
  11.6 MBM-005: Push de intervención de churn
  → Checkpoint: El miembro puede autogestionarse y recibe comunicaciones proactivas

NIVEL 12 — NUTRICIÓN Y EVALUACIONES (Sprint 6-7, paralelo con 11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  12.1 NUT-001: Lista de pacientes del nutricionista
  12.2 NUT-003: Registrar evaluación nutricional
  12.3 NUT-004: Evaluaciones físicas del entrenador
  12.4 NUT-002: Crear plan nutricional completo (wizard)
  → Checkpoint: Ciclo completo de atención nutricional

NIVEL 13 — IA Y DIFERENCIADORES (Sprint 8-9, Semana 15-18)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  13.1 IA-001: Configurar Gemini API desde panel de Configuración
  13.2 IA-002: Churn interventions con mensajes personalizados
  13.3 IA-003: Recomendaciones de workout para el miembro
  13.4 IA-004: Gamificación MVP (XP + niveles + racha)
  13.5 SAS-001: Panel super-admin para gestión multi-gym
  → Checkpoint: Features diferenciadoras activas

NIVEL 14 — ESCALABILIDAD (Sprint 9-10, Semana 17-20)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14.1 SAS-004: Refactoring God Service → analytics.service
  14.2 SAS-005: Migración 019: fn_validate_staff_code desacoplado
  14.3 SAS-002: Validación de suscripción activa en el middleware
  14.4 COD-003: Notificación al admin cuando código es usado
  14.5 SAS-003: Integración Stripe (inicio — ambiente de test)
  14.6 SAS-006: Roles personalizados del gym (is_system_role=false)
```

---
