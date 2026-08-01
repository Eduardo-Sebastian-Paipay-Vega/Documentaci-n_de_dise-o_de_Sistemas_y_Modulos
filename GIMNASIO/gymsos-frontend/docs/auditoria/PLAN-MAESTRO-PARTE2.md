# PLAN MAESTRO — PARTE 2
## Especificación Técnica por Módulo

Para cada módulo: Migraciones · RPCs · Tablas · RLS · Páginas Frontend · Pruebas mínimas

---

# MÓDULO 01 — AUTENTICACIÓN Y JWT SEGURO
**Clasificación**: Core | **Fase**: A | **Sprint**: 1

## Migraciones requeridas
| Migración | Contenido requerido | Estado |
|-----------|--------------------|----|
| 018 | Ninguna de autenticación — pero DEBE aplicarse antes | ❌ Pendiente |

## RPCs requeridas
| RPC | Schema | Propósito | Estado |
|-----|--------|-----------|--------|
| `fn_current_tenant_id()` | public | Retorna el tenant del usuario autenticado desde el JWT | ✅ Existe |
| `fn_has_permission(p_permission)` | public | Verifica si el usuario tiene un permiso en su tenant | ✅ Existe |
| `fn_my_permissions()` | public | Lista todos los permisos del usuario (para el AuthProvider) | ✅ Existe |

**Nueva función requerida (no RPC SQL — es Server Action de Next.js):**
- `syncRoleToJWT(userId, role)` — Server Action que llama a `supabase.auth.admin.updateUser` con `app_metadata.role`

## Tablas utilizadas
| Tabla | Schema | Operación | Columna clave |
|-------|--------|-----------|---------------|
| `usuarios` | gym | SELECT | `rol`, `auth_user_id` |
| `user_roles` | public | SELECT | `user_id`, `tenant_id`, `role_id`, `expires_at` |
| `roles` | public | SELECT | `id`, `name`, `hierarchy_level` |

## Políticas RLS utilizadas
Este módulo no lee tablas adicionales — opera sobre el JWT. La política crítica es:
- El JWT tiene `app_metadata.role` y `sub` (user_id) — firmado por Supabase Auth
- El middleware verifica la firma del JWT (no puede ser falsificado sin la service key)

## Páginas frontend
| Página | Ruta | Rol |
|--------|------|-----|
| Login | `/login` | Todos |
| Signup | `/signup` | Nuevos usuarios |
| Onboarding | `/onboarding` | Nuevos dueños de gym |
| Middleware | `middleware.ts` | Intercepta todas las rutas |

## Pruebas mínimas antes de liberar

**TEST-AUTH-001**: Usuario con `app_metadata.role = 'cajero'` llega a `/dashboard/cajero` después del login, NO a `/dashboard/recepcionista`

**TEST-AUTH-002**: Si se modifica manualmente la URL a `/dashboard/admin` siendo recepcionista → middleware redirige a `/dashboard/recepcionista`

**TEST-AUTH-003**: Un usuario sin sesión activa que intenta acceder a cualquier `/dashboard/*` → redirigido a `/login`

**TEST-AUTH-004**: Un usuario con `app_metadata.role` no reconocido (valor inesperado) → redirigido a `/login` con log de error, NO crash de 500

**TEST-AUTH-005**: Después de cambiar el rol de un trabajador (`STF-004`), la próxima sesión del trabajador llega al nuevo dashboard

---

# MÓDULO 02 — RBAC Y PERMISOS
**Clasificación**: Core | **Fase**: A | **Sprint**: 1

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 016 | Schema RBAC base (roles, user_roles, cat_permissions, role_permissions) | ✅ Aplicada |
| **018** | Nuevos permisos: gym.staff.ver, gym.staff.gestionar, gym.evaluaciones.ver, gym.evaluaciones.gestionar, gym.asistencia.ver, gym.pagos.crear para Recepcionista | ❌ **Pendiente** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `fn_has_permission(p_permission TEXT)` | Core de autorización. Verifica tenant + rol + expires_at | ✅ Existe |
| `fn_my_permissions()` | Carga todos los permisos para el caché del AuthProvider | ✅ Existe |
| `fn_current_tenant_id()` | Usado internamente por fn_has_permission | ✅ Existe |

## Tablas utilizadas
| Tabla | Schema | Acceso | Propósito |
|-------|--------|--------|-----------|
| `roles` | public | SELECT | Lista de roles del sistema por tenant |
| `user_roles` | public | SELECT / UPDATE | Asignación usuario-rol con expires_at |
| `role_permissions` | public | SELECT | Qué permisos tiene cada rol |
| `cat_permissions` | public | SELECT | Catálogo de todos los permisos posibles |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `roles` | SELECT | `tenant_id = fn_current_tenant_id()` |
| `user_roles` | SELECT | `tenant_id = fn_current_tenant_id()` |
| `user_roles` | UPDATE | Solo via RPC `SECURITY DEFINER` (nunca UPDATE directo del cliente) |
| `role_permissions` | SELECT | `role_id IN (SELECT id FROM roles WHERE tenant_id = fn_current_tenant_id())` |
| `cat_permissions` | SELECT | Sin restricción (es un catálogo global) |

## Páginas frontend
| Página | Ruta | Propósito |
|--------|------|-----------|
| Matriz de Permisos | `/dashboard/admin/staff/roles` | Visualizar permisos × roles |

## Pruebas mínimas antes de liberar

**TEST-RBAC-001**: `fn_has_permission('gym.staff.gestionar')` retorna TRUE para Admin General y FALSE para Recepcionista

**TEST-RBAC-002**: `fn_has_permission('gym.pagos.reembolsar')` retorna TRUE solo para Admin General

**TEST-RBAC-003**: Un trabajador con `user_roles.expires_at = now() - 1 hour` recibe FALSE de `fn_has_permission()` para cualquier permiso

**TEST-RBAC-004**: `fn_my_permissions()` retorna la lista correcta de permisos para cada uno de los 7 roles del sistema

**TEST-RBAC-005**: Los nuevos permisos de migración 018 (gym.staff.ver, gym.evaluaciones.ver, etc.) están en la tabla y asignados correctamente

---

# MÓDULO 03 — STAFF MANAGEMENT
**Clasificación**: Core | **Fase**: B | **Sprint**: 2

## Migraciones requeridas
| Migración | Contenido necesario | Estado |
|-----------|--------------------|----|
| 016 | RBAC base (user_roles, roles) | ✅ Existe |
| **018** | gym.staff.ver, gym.staff.gestionar, campos de revocación en user_roles | ❌ **Bloqueante** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `fn_has_permission('gym.staff.ver')` | Autorizar acceso a la lista de trabajadores | ✅ (post-018) |
| `fn_has_permission('gym.staff.gestionar')` | Autorizar revocación y cambio de rol | ✅ (post-018) |
| `fn_has_permission('gym.codigos.crear')` | Autorizar generación de código | ✅ Existe |

**Nueva RPC requerida (migración 018 o Server Action):**
- `rpc_revocar_acceso(p_user_id UUID, p_motivo TEXT, p_tipo TEXT)` — actualiza `user_roles` y registra en `audit_logs`

**Server Actions de Next.js requeridas (no RPCs de BD):**
- `changeStaffRole(targetUserId, newRoleId)` — actualiza user_roles + gym.usuarios.rol + JWT claim
- `revokeStaffAccess(targetUserId, motivo, tipo)` — wrapper de rpc_revocar_acceso
- `suspendStaff(targetUserId, motivo, reactivationDate)` — establece expires_at temporal
- `reactivateStaff(targetUserId)` — elimina expires_at

## Tablas utilizadas
| Tabla | Schema | Operación | Columnas clave |
|-------|--------|-----------|----------------|
| `user_roles` | public | SELECT, UPDATE | `user_id`, `tenant_id`, `role_id`, `expires_at`, `revoked_by`, `revocation_reason` |
| `roles` | public | SELECT | `id`, `name`, `hierarchy_level` |
| `usuarios` | gym | SELECT, UPDATE | `auth_user_id`, `nombre`, `email`, `rol` |
| `audit_logs` | public | SELECT | `actor_id`, `action`, `created_at` (para actividad del trabajador) |
| `codes` | public | SELECT | `created_by`, `type` |
| `code_usages` | public | SELECT | `used_by`, `code_id` |
| `tenants` | public | SELECT | `max_licenses` (para widget de licencias) |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `user_roles` | SELECT | `tenant_id = fn_current_tenant_id()` |
| `user_roles` | UPDATE | Solo via `SECURITY DEFINER` RPC — el cliente NO hace UPDATE directo |
| `usuarios` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `audit_logs` | SELECT | `tenant_id = fn_current_tenant_id()` |

## Páginas frontend
| Página | Ruta | Componentes usados |
|--------|------|--------------------|
| Staff Management | `/dashboard/admin/staff` | `<DataTable />`, `<RoleBadge />`, `<Drawer />`, `<ActionMenu />` |
| — Tab Trabajadores | (default) | `<StaffTable />`, `<StaffDrawer />` |
| — Tab Invitar | `/admin/staff/invitar` | `<CodeGenerationForm />`, `<QrDisplay />`, `<OccupancyBar />` |
| — Tab Historial | `/admin/staff/historial` | `<CodeHistoryTable />`, `<CodeDisplay />` |
| Roles y Permisos | `/dashboard/admin/staff/roles` | `<PermissionMatrix />`, `<RoleDetailPanel />` |

## Pruebas mínimas antes de liberar

**TEST-STF-001**: La tabla de staff solo muestra trabajadores del tenant del admin autenticado (tenant isolation)

**TEST-STF-002**: Admin revoca acceso de Carlos → `user_roles.expires_at = now()` → `fn_has_permission()` retorna FALSE para Carlos inmediatamente

**TEST-STF-003**: Admin con `max_licenses = 5` ya tiene 5 staff activos → botón "Generar código" está deshabilitado con mensaje de límite

**TEST-STF-004**: Al cambiar el rol de un trabajador → `gym.usuarios.rol` + `app_metadata.role` en JWT se actualizan en la misma operación

**TEST-STF-005**: La acción de revocación definitiva requiere el checkbox de confirmación marcado — el botón está deshabilitado sin él

**TEST-STF-006**: El drawer de detalle del trabajador muestra SOLO las acciones en audit_logs de ese trabajador en ese tenant (no de otros tenants)

---

# MÓDULO 04 — CÓDIGOS DE INVITACIÓN
**Clasificación**: Core | **Fase**: A-B | **Sprint**: 1-2

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 010 | `public.codes`, `code_usages`, `code_grants` | ✅ Existe |
| 016 | `fn_create_staff_code`, `fn_revoke_code`, `fn_validate_code` | ✅ Existe |
| **018** | Validación `max_licenses` en `fn_create_staff_code` | ❌ **Bloqueante** |
| 019 | `fn_validate_staff_code` desacoplado (sin tenant_id en frontend) | ❌ Fase E |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `fn_create_staff_code(p_tenant_id, p_role_id, p_max_uses, p_expires_in_days)` | Crear código de invitación para staff | ✅ Existe (necesita 018) |
| `fn_revoke_code(p_code_id)` | Invalidar un código activo | ✅ Existe |
| `fn_validate_code(p_code, p_tenant_id)` | Validar un código antes del signup | ✅ Existe |
| `fn_validate_staff_code(p_code, p_gym_id)` | Versión desacoplada — no expone tenant_id | ❌ Migración 019 |

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `codes` | public | SELECT, UPDATE | Código de invitación con estado y usos |
| `code_grants` | public | SELECT | Qué rol otorga cada código |
| `code_usages` | public | SELECT, INSERT | Historial de uso de cada código |
| `roles` | public | SELECT | Nombre del rol asociado al código |
| `usuarios` | gym | SELECT | Nombre del trabajador que usó el código |
| `tenants` | public | SELECT | `max_licenses` para validación |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `codes` | SELECT | `tenant_id = fn_current_tenant_id()` |
| `codes` | INSERT | Via RPC `fn_create_staff_code` (SECURITY DEFINER) |
| `codes` | UPDATE | Via RPC `fn_revoke_code` (SECURITY DEFINER) |
| `code_grants` | SELECT | `code_id IN (SELECT id FROM codes WHERE tenant_id = fn_current_tenant_id())` |
| `code_usages` | SELECT | Misma condición via join a codes |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Tab Invitar | `/dashboard/admin/staff` (Tab 2) | `<CodeGenerationForm />`, `<QrDisplay />`, `<ShareButtons />` |
| Tab Historial | `/dashboard/admin/staff` (Tab 3) | `<CodeHistoryTable />`, `<CodeDisplay />`, `<KpiCard />` |

## Pruebas mínimas antes de liberar

**TEST-COD-001**: `fn_create_staff_code` con tenant que tiene `max_licenses = 2` y 2 staff activos retorna `{ ok: false, error: 'LIMIT_REACHED' }`

**TEST-COD-002**: Un código con `max_uses = 1` no puede ser usado dos veces (el segundo intento falla con error apropiado)

**TEST-COD-003**: Un código generado para el tenant A no puede ser usado en el gym del tenant B (cross-tenant check de migración 017)

**TEST-COD-004**: `fn_revoke_code` establece el estado del código como 'revoked' y el trabajador que intenta usarlo recibe un error

**TEST-COD-005**: El historial de códigos muestra el nombre del trabajador que usó el código, con la fecha correcta

---

# MÓDULO 05 — GESTIÓN DE MIEMBROS
**Clasificación**: Core | **Fase**: B | **Sprint**: 3

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 009 | `gym.usuarios`, `gym.membresias`, `gym.pagos` | ✅ Existe |
| **018** | `rpc_registrar_nuevo_miembro` (transaccional) | ❌ **Bloqueante** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `rpc_registrar_nuevo_miembro(auth_user_id, datos, id_plan, monto, forma_pago, id_gimnasio)` | Crear usuario + membresía + pago en una sola transacción | ❌ **Crear en 018** |

**Comportamiento de la RPC transaccional:**
```
FUNCIÓN rpc_registrar_nuevo_miembro:
  BEGIN
    1. INSERT INTO gym.usuarios (si no existe — handle_new_user ya puede haberlo creado)
    2. INSERT INTO gym.membresias (id_usuario, id_plan, fecha_inicio, fecha_fin, estado='activa')
    3. INSERT INTO gym.pagos (id_miembro, id_membresia, monto, forma_pago, procesado_por)
    RETURN { ok: true, member_id, membership_id }
  EXCEPTION
    ROLLBACK
    RETURN { ok: false, error: 'mensaje descriptivo' }
  END
```

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `usuarios` | gym | SELECT, INSERT, UPDATE | Perfil del miembro |
| `membresias` | gym | SELECT, INSERT, UPDATE | Estado de la membresía |
| `planes` | gym | SELECT | Planes disponibles para inscribir |
| `pagos` | gym | SELECT, INSERT | Transacciones económicas |
| `accesos` | gym | SELECT | Historial de visitas |
| `clases` | gym | SELECT | Clases inscritas |
| `inscripciones` | gym | SELECT | Relación miembro-clase |
| `churn_predictions` | ai | SELECT | Score de riesgo de abandono |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `usuarios` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `usuarios` | INSERT | Via RPC transaccional (SECURITY DEFINER) |
| `usuarios` | UPDATE | `id_gimnasio = gym.current_gym_id()` AND `fn_has_permission('gym.usuarios.editar')` |
| `membresias` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `membresias` | INSERT/UPDATE | `fn_has_permission('gym.membresias.crear')` o RPC |
| `membresias` | UPDATE (cancelar) | `fn_has_permission('gym.membresias.cancelar')` |
| `pagos` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `pagos` | INSERT | `fn_has_permission('gym.pagos.crear')` |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Lista de Miembros | `/dashboard/admin/miembros` | `<DataTable />`, `<StatusBadge />`, `<ChurnBadge />`, `<FilterBar />` |
| Perfil de Miembro | `/dashboard/admin/miembros/[id]` | `<TabPanel />`, `<MembershipTimeline />`, `<PaymentHistoryTable />`, `<AttendanceChart />` |
| Registro (Recepcionista) | `/dashboard/recepcionista/registro` | `<MemberRegistrationForm />`, `<PlanSelector />`, `<PaymentMethodSelector />` |

## Pruebas mínimas antes de liberar

**TEST-MBR-001**: `rpc_registrar_nuevo_miembro` falla a mitad (simular error en INSERT membresias) → el usuario en `auth.users` es eliminado por el caller, sin usuarios huérfanos

**TEST-MBR-002**: Un miembro del Gym A no aparece en la lista de miembros del Gym B (tenant isolation)

**TEST-MBR-003**: La cancelación de membresía requiere motivo + 2 confirmaciones — no se puede hacer en 1 clic

**TEST-MBR-004**: La columna de Churn Score es invisible para un recepcionista (no tiene `gym.reportes.ver`)

**TEST-MBR-005**: El perfil del miembro Tab "Notas" no es visible para el propio miembro — solo para Admin y Supervisor

---

# MÓDULO 06 — MEMBRESÍAS Y PAGOS
**Clasificación**: Core | **Fase**: B | **Sprint**: 3

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 009 | `gym.membresias`, `gym.pagos`, `gym.planes` | ✅ Existe |
| **018** | `gym.pagos.crear` asignado a Recepcionista | ❌ **Bloqueante** |
| **018** | Trigger `PAYMENT_CREATED` en audit_logs | ❌ **Bloqueante** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `rpc_registrar_pago(id_miembro, id_plan, monto, forma_pago, procesado_por)` | Registrar cobro + renovar membresía en una transacción | Verificar si existe o crear |

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `pagos` | gym | SELECT, INSERT | Historial financiero |
| `membresias` | gym | SELECT, UPDATE | Extender fecha_fin al renovar |
| `planes` | gym | SELECT | Precio y duración para calcular nueva fecha |
| `usuarios` | gym | SELECT | Nombre del miembro que paga |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `pagos` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `pagos` | INSERT | `fn_has_permission('gym.pagos.crear')` |
| `membresias` | UPDATE (renovar) | `fn_has_permission('gym.membresias.crear')` |
| `planes` | SELECT | `id_gimnasio = gym.current_gym_id()` |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Dashboard Cajero | `/dashboard/cajero` | `<SearchInput />`, `<MemberCard />`, `<QuickPayCard />`, `<PaymentHistoryList />` |
| Membresías por Cobrar | `/dashboard/cajero/pendientes` | `<DataTable />`, `<StatusBadge />` |
| Historial de Pagos | `/dashboard/admin/membresias/pagos` | `<DataTable />`, `<DateRangePicker />`, `<ExportButton />` |

## Pruebas mínimas antes de liberar

**TEST-MEM-001**: Al registrar un pago para una membresía vencida → `fecha_fin` se extiende correctamente desde hoy (no desde la fecha original de vencimiento)

**TEST-MEM-002**: El cajero no puede ver la pestaña de analytics ni el módulo de staff — su sidebar solo muestra sus módulos

**TEST-MEM-003**: Un pago registrado aparece en audit_logs con `action = 'PAYMENT_CREATED'`

**TEST-MEM-004**: Si el SELECT de `pagos` falla (error de BD) → la UI muestra el estado de error con botón Retry, no una pantalla en blanco

---

# MÓDULO 07 — CONTROL DE ACCESOS QR
**Clasificación**: Core | **Fase**: B | **Sprint**: 3

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 009 | `gym.accesos` | ✅ Existe |
| **018** | Corrección RLS `gym.accesos` para rol Miembro | ❌ **Bloqueante** |
| **018** | Trigger `ACCESS_DENIED` en audit_logs | ❌ **Bloqueante** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `rpc_registrar_acceso(p_uuid, p_gym_id)` | Registrar entrada, verificar membresía activa, retornar resultado | Verificar si existe |

**Comportamiento de la RPC:**
```
FUNCIÓN rpc_registrar_acceso:
  1. Validar UUID formato (si no es UUID válido → RETURN { ok: false, error: 'INVALID_FORMAT' })
  2. SELECT gym.membresias WHERE id_usuario = p_uuid AND id_gimnasio = p_gym_id AND estado = 'activa'
  3. Si membresía activa:
       INSERT gym.accesos (permitido=true, entrada=now())
       RETURN { ok: true, nombre, foto, plan, fecha_fin }
  4. Si no:
       INSERT gym.accesos (permitido=false, motivo='sin_membresia_activa')
       RETURN { ok: false, error: 'MEMBERSHIP_EXPIRED', nombre, foto, dias_vencido }
```

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `accesos` | gym | SELECT, INSERT | Registro de entradas/salidas |
| `membresias` | gym | SELECT | Verificar si está activa |
| `usuarios` | gym | SELECT | Nombre y foto del miembro |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `accesos` | SELECT (staff) | `id_gimnasio = gym.current_gym_id()` |
| `accesos` | SELECT (miembro) | `id_usuario = auth.uid()` AND `id_gimnasio = gym.current_gym_id()` |
| `accesos` | INSERT | `fn_has_permission('gym.accesos.crear')` |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Control de Acceso LIVE | `/dashboard/recepcionista` | `<QrScanner />`, `<AccessFeedItem />`, `<RealtimeStatusBadge />`, `<AccessAlertPanel />` |
| Mi QR (Miembro) | `/dashboard/miembro` | `<QrDisplay />`, `<MembershipStatusBadge />` |

## Pruebas mínimas antes de liberar

**TEST-ACC-001**: Un string que no es UUID (ej: "abc") procesado por el escáner retorna `INVALID_FORMAT` en < 200ms sin query a la BD

**TEST-ACC-002**: Un miembro con membresía activa escanea QR → acceso permitido, aparece en feed live en < 2 segundos

**TEST-ACC-003**: Un miembro con membresía vencida escanea QR → acceso denegado, aparece en feed con badge "Vencida", evento registrado en audit_logs

**TEST-ACC-004**: Un miembro NO puede ver los registros de acceso de otros miembros (RLS corregida en 018)

**TEST-ACC-005**: Si el canal Realtime se desconecta → el banner de "Conexión perdida" aparece en < 5 segundos

---

# MÓDULO 08 — CLASES Y AGENDA
**Clasificación**: Importante | **Fase**: B | **Sprint**: 4

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 009 (o similar) | `gym.clases`, `gym.inscripciones` | ✅ Existe |
| **018** | `gym.asistencia.ver` asignado a Entrenador | ❌ **Bloqueante** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| `rpc_inscribir_a_clase(p_clase_id, p_usuario_id)` | Inscribir con verificación de cupo disponible | Verificar si existe |
| `rpc_cerrar_clase(p_clase_id, p_asistencias[])` | Registrar asistencia en bulk | Crear si no existe |

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `clases` | gym | SELECT, INSERT, UPDATE | Datos de la clase |
| `inscripciones` | gym | SELECT, INSERT, UPDATE | Relación miembro-clase con asistencia |
| `espacios` | gym | SELECT | Sala asignada a la clase |
| `entrenadores` | gym | SELECT | Entrenador asignado |
| `usuarios` | gym | SELECT | Lista de inscritos |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `clases` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `clases` | INSERT/UPDATE | `fn_has_permission('gym.clases.gestionar')` |
| `inscripciones` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `inscripciones` | INSERT | `fn_has_permission('gym.clases.inscribir')` OR `id_usuario = auth.uid()` (miembro se inscribe a sí mismo) |
| `inscripciones` | UPDATE (asistencia) | `fn_has_permission('gym.asistencia.ver')` o `id_entrenador = auth.uid()` |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Agenda Admin | `/dashboard/admin/clases` | `<WeekCalendar />`, `<ClassDetailPanel />`, `<OccupancyBar />` |
| Agenda Entrenador | `/dashboard/entrenador` | `<DayTimeline />`, `<ClassModal />`, `<AttendanceCheckList />` |
| Clases Recepcionista | `/dashboard/recepcionista/clases` | `<ClassListTable />`, `<MemberSearchModal />` |
| Clases Miembro | `/dashboard/miembro/clases` | `<WeekCalendar />`, enroll/cancel buttons |

## Pruebas mínimas antes de liberar

**TEST-CLS-001**: Un miembro no puede inscribirse en una clase llena (cupo = inscritos_actuales)

**TEST-CLS-002**: El entrenador solo ve sus propias clases en la agenda (filtro por `id_entrenador = auth.uid()`)

**TEST-CLS-003**: Cerrar clase sin haber marcado asistencia → aparece warning antes de confirmar

**TEST-CLS-004**: Un miembro puede cancelar su inscripción hasta X horas antes de la clase (regla de negocio pendiente de definir)

---

# MÓDULO 09 — ANALYTICS Y REPORTES
**Clasificación**: Importante | **Fase**: C | **Sprint**: 4-5

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| **018** | `public.nps_surveys` | ❌ Pendiente |

## RPCs / Server Actions requeridas
Nota: Los reportes son computacionalmente costosos — deben ejecutarse en Server Actions, no en el cliente.

| Función | Propósito | Tipo |
|---------|-----------|------|
| `getKPIsDashboard(tenantId)` | KPIs del Panel Ejecutivo | Server Action |
| `getIngresosUltimos12Meses(tenantId)` | Datos para gráfico de barras | Server Action |
| `getAccesosPorHora(tenantId, fecha)` | Datos para gráfico de accesos | Server Action |
| `getChurnAtRisk(tenantId, limit)` | Top N miembros con mayor churn score | Server Action |
| `getRetencionMensual(tenantId)` | Tasa de retención por mes | Server Action |
| `getMembresiasPorVencer(tenantId, dias)` | Membresías próximas a vencer | Server Action |
| `getAsistenciaMapa(tenantId, periodo)` | Datos para mapa de calor | Server Action |

**Extracción del God Service (SAS-004):**
Todas estas funciones deben estar en `services/analytics.service.ts`, NO en `services/dashboard.service.ts`

## Tablas utilizadas
| Tabla | Schema | Propósito |
|-------|--------|-----------|
| `pagos` | gym | Ingresos, ticket promedio |
| `membresias` | gym | Retención, vencimientos |
| `accesos` | gym | Tráfico, horas pico |
| `clases` | gym | Ocupación, clases populares |
| `inscripciones` | gym | Asistencia real vs esperada |
| `churn_predictions` | ai | Scores de riesgo |
| `nps_surveys` | public | Score NPS real (post-018) |

## Políticas RLS
| Tabla | Política |
|-------|---------|
| Todas | `fn_has_permission('gym.reportes.ver')` verificado en el Server Action antes de ejecutar queries |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Reportes (Admin) | `/dashboard/admin/reportes` | `<TabPanel />`, `<LineChart />`, `<BarChart />`, `<PieChart />`, `<HeatMap />`, `<ExportButton />` |
| KPIs Dashboard | `/dashboard/admin` | `<KpiCard />` × 5, `<BarChart />`, `<LineChart />` |

## Pruebas mínimas antes de liberar

**TEST-ANA-001**: El widget de NPS no muestra "72" — muestra datos reales o "Sin datos suficientes"

**TEST-ANA-002**: Un recepcionista que navega a `/dashboard/admin/reportes` es redirigido — no tiene `gym.reportes.ver`

**TEST-ANA-003**: Los gráficos de reportes usan datos del tenant correcto — no datos de otros gyms

**TEST-ANA-004**: La exportación CSV incluye solo las filas del período filtrado, no todo el historial

---

# MÓDULO 10 — AUDITORÍA
**Clasificación**: Importante | **Fase**: C | **Sprint**: 5

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 015b | `public.audit_logs` | ✅ Existe |
| **018** | Triggers: ROLE_CHANGED, ROLE_REVOKED, PAYMENT_CREATED, MEMBERSHIP_CANCELLED, GYM_CONFIG_UPDATED, ACCESS_DENIED | ❌ **Bloqueante** |

## RPCs requeridas
| RPC | Propósito | Estado |
|-----|-----------|--------|
| Ninguna directa | Las queries se hacen via Server Action con service_role | — |

**Server Action requerida:**
- `getAuditLogs(tenantId, filters)` — usa service_role para leer audit_logs sin exponer la clave al cliente

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `audit_logs` | public | SELECT | Visor de eventos |
| `usuarios` | gym | SELECT | Nombre del actor |
| `roles` | public | SELECT | Rol del actor al momento del evento |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `audit_logs` | SELECT | `tenant_id = fn_current_tenant_id()` AND `fn_has_permission('gym.reportes.ver')` |
| `audit_logs` | INSERT | Solo via triggers `SECURITY DEFINER` — NUNCA INSERT directo del cliente |
| `audit_logs` | UPDATE | PROHIBIDO (append-only) |
| `audit_logs` | DELETE | PROHIBIDO (append-only) |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Auditoría | `/dashboard/admin/auditoria` | `<DataTable />`, `<FilterBar />`, `<AuditEventModal />`, `<ExportButton />` |

## Pruebas mínimas antes de liberar

**TEST-AUD-001**: Al revocar el acceso de un trabajador → aparece en audit_logs con `action = 'ROLE_REVOKED'`, actor correcto, tenant correcto

**TEST-AUD-002**: Un recepcionista no puede acceder a `/dashboard/admin/auditoria` (no tiene `gym.reportes.ver`)

**TEST-AUD-003**: Los eventos de audit_logs filtrados por actor muestran SOLO los eventos de ese actor en ese tenant

**TEST-AUD-004**: Intentar hacer INSERT directo en audit_logs desde el cliente (bypass de trigger) → falla con error de RLS

---

# MÓDULO 11 — CONFIGURACIÓN DEL GYM
**Clasificación**: Importante | **Fase**: C | **Sprint**: 5

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 009 | `gym.gimnasios`, `gym.planes`, `gym.espacios` | ✅ Existe |
| **018** | Trigger `GYM_CONFIG_UPDATED` en audit_logs | ❌ **Bloqueante** |

## RPCs requeridas
Operaciones vía Server Actions directamente sobre las tablas (no RPCs SQL dedicadas).

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `gimnasios` | gym | SELECT, UPDATE | Datos del gym |
| `planes` | gym | SELECT, INSERT, UPDATE | Planes de membresía |
| `espacios` | gym | SELECT, INSERT, UPDATE | Salas y áreas |
| `equipamiento` | gym | SELECT, INSERT, UPDATE | Máquinas (Fase C) |
| `tenants` | public | SELECT | Info del plan SaaS |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `gimnasios` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `gimnasios` | UPDATE | `fn_has_permission('gym.config.editar')` |
| `planes` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `planes` | INSERT/UPDATE | `fn_has_permission('gym.planes.gestionar')` |
| `espacios` | SELECT | `id_gimnasio = gym.current_gym_id()` |
| `espacios` | INSERT/UPDATE | `fn_has_permission('gym.espacios.gestionar')` |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Configuración | `/dashboard/admin/configuracion` | `<TabPanel />`, `<GymDataForm />`, `<PlanList />`, `<PlanModal />`, `<SpaceList />` |

## Pruebas mínimas antes de liberar

**TEST-CFG-001**: Actualizar el nombre del gym → cambio visible en el sidebar inmediatamente, evento en audit_logs

**TEST-CFG-002**: Intentar desactivar un plan con miembros activos → error descriptivo, no se desactiva

**TEST-CFG-003**: La subida del logo acepta PNG/JPG y rechaza PDF o EXE

---

# MÓDULO 12 — DASHBOARD DEL MIEMBRO Y QR
**Clasificación**: Core | **Fase**: D | **Sprint**: 6

## Migraciones requeridas
| Migración | Contenido | Estado |
|-----------|-----------|--------|
| 019 | `push_subscriptions` para Web Push | ❌ Pendiente |

## RPCs / Server Actions requeridas
| Función | Propósito | Tipo |
|---------|-----------|------|
| `generateQrToken(userId)` | Generar JWT de corta duración para el QR | Server Action (usa service_role) |
| `validateQrToken(token, gymId)` | Verificar el token firmado del QR | Server Action |
| `getMemberStats(userId)` | Estadísticas personales del miembro | Server Action |
| `renewMembership(userId, planId, paymentMethod)` | Renovación autoasistida | Server Action |

## Tablas utilizadas
| Tabla | Schema | Operación | Propósito |
|-------|--------|-----------|-----------|
| `membresias` | gym | SELECT, UPDATE | Estado y renovación |
| `accesos` | gym | SELECT | Historial de visitas (RLS: solo los propios) |
| `clases` | gym | SELECT | Clases disponibles |
| `inscripciones` | gym | SELECT, INSERT, DELETE | Reservas del miembro |
| `push_subscriptions` | public | INSERT, DELETE | Suscripción a notificaciones push |

## Políticas RLS
| Tabla | Política | Condición |
|-------|---------|-----------|
| `membresias` | SELECT (miembro) | `id_usuario = auth.uid()` |
| `accesos` | SELECT (miembro) | `id_usuario = auth.uid()` (corregido en 018) |
| `inscripciones` | SELECT (miembro) | `id_usuario = auth.uid()` |
| `inscripciones` | INSERT (miembro) | `id_usuario = auth.uid()` |

## Páginas frontend
| Página | Ruta | Componentes |
|--------|------|-------------|
| Dashboard Miembro | `/dashboard/miembro` | `<QrDisplay />`, `<MembershipStatusBadge />`, `<NextClassesList />`, `<StatsRow />` |
| Clases | `/dashboard/miembro/clases` | `<WeekCalendar />`, enroll/cancel buttons |
| Mi Membresía | `/dashboard/miembro/membresia` | `<MembershipCard />`, `<PaymentHistoryMini />`, `<RenewalFlow />` |
| Mi Progreso | `/dashboard/miembro/progreso` | `<VisitChart />`, `<StreakDisplay />` |

## Pruebas mínimas antes de liberar

**TEST-MBM-001**: El QR se genera y muestra en < 2 segundos al cargar el dashboard del miembro

**TEST-MBM-002**: El token del QR expira después de 60 segundos — un token capturado hace 2 minutos es rechazado por el escáner

**TEST-MBM-003**: El miembro con membresía vencida ve el QR deshabilitado y el botón "Renovar" prominente

**TEST-MBM-004**: El miembro solo puede ver sus propios accesos — no los de otros miembros del gym (RLS de 018)

---
