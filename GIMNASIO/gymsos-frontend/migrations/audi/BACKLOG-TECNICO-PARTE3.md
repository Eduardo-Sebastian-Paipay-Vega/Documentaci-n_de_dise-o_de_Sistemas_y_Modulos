# BACKLOG TÉCNICO — PARTE 3
## Dependencias, Orden de Implementación y Guía de Desarrollo

---

# PARTE 3 — GRAFO DE DEPENDENCIAS Y ORDEN DE IMPLEMENTACIÓN

## 3.1 Dependencias críticas de bloqueo

Las siguientes cadenas de dependencia son bloqueantes — una historia NO puede comenzarse sin que su dependencia esté completa y mergeada:

```
CADENA 1 — Seguridad de autenticación (CRÍTICA):
SEG-001 (JWT claim)
  └─→ SEG-002 (Middleware lee JWT)
        └─→ SEG-003 (role_dashboard_map)
              ├─→ SEG-004 (supervisor/cajero en routing)
              │     ├─→ ROL-001 (Dashboard Supervisor)
              │     └─→ ROL-002 (Dashboard Cajero)
              │           ├─→ MEM-001 (cobro rápido)
              │           └─→ MEM-002 (pendientes del día)
              └─→ SEG-005 (deprecar cliente)

CADENA 2 — Permisos RBAC (BLOQUEANTE para Staff Management):
SEG-007 (Migración 018: permisos)
  ├─→ SEG-008 (max_licenses en fn_create_staff_code)
  ├─→ SEG-009 (campos de revocación)
  ├─→ SEG-011 (triggers audit_logs)
  │     ├─→ COD-003 (notif. código usado)
  │     └─→ AUD-001 (visor audit_logs)
  │           └─→ AUD-002 (exportar CSV)
  └─→ ROL-003 (sidebar dinámico)
        └─→ STF-001 (lista de staff)
              ├─→ STF-002 (filtros)
              ├─→ STF-003 (drawer detalle)
              ├─→ STF-004 (cambio de rol) ←── también depende de SEG-001
              ├─→ STF-005 (suspensión) ←── también depende de SEG-009
              ├─→ STF-006 (revocación) ←── también depende de SEG-009
              ├─→ STF-007 (reactivar) ←── depende de STF-005
              ├─→ STF-008 (widget licencias) ←── depende de SEG-008
              └─→ COD-001 (historial códigos)
                    └─→ COD-002 (revocar código)

CADENA 3 — Registro de miembro (BLOQUEANTE para operación):
MBR-003 (RPC transaccional)
  ├─→ MBR-004 (formulario recepcionista)
  └─→ MBM-002 (renovación autoasistida del miembro)

CADENA 4 — Control de acceso (BLOQUEANTE para Realtime):
SEG-006 (validación UUID)
  └─→ ACC-001 (Realtime LIVE)
        ├─→ ACC-002 (acceso manual)
        └─→ MBM-001 (QR dinámico)

CADENA 5 — Push Notifications (BLOQUEANTE para retención):
MBM-001 (QR dinámico) → MBM-003 (Web Push infra)
  ├─→ MBM-004 (push membresía vence)
  └─→ MBM-005 (push churn intervention)
        └─→ IA-002 (churn IA personalizado)

CADENA 6 — Configuración (BLOQUEANTE para IA):
CFG-001 (editar datos gym)
  └─→ IA-001 (configurar Gemini)
        ├─→ IA-002 (churn IA)
        └─→ IA-003 (recomendaciones workout)

CADENA 7 — Auditoría completa:
SEG-011 (triggers audit) → AUD-001 (visor)
  └─→ AUD-002 (exportar)
        └─→ SAS-006 (roles personalizados) ←── también depende de AUD-001
```

## 3.2 Historias que pueden ejecutarse en paralelo

Estas historias NO tienen dependencias entre sí y pueden asignarse a desarrolladores distintos simultáneamente:

**Paralelas en Fase A (Sprint 1):**
- `SEG-006` (validación UUID) puede hacerse en paralelo con toda la cadena SEG-001→SEG-005
- `SEG-010` (RLS accesos) puede hacerse en paralelo con `SEG-007`→`SEG-013`
- `SEG-012` (tabla nps_surveys) es independiente de todo

**Paralelas en Fase B (Sprint 2-3):**
- `MBR-001` (lista miembros) puede hacerse en paralelo con `STF-001`
- `CLS-001` (agenda semanal admin) es independiente de Staff Management
- `ANA-003` puede empezarse antes de que termine Fase C si hay capacidad
- `MEM-003` (historial pagos) es independiente de MEM-001

**Paralelas en Fase C (Sprint 4):**
- `CFG-001`, `CFG-002`, `CFG-003` son independientes entre sí
- `ANA-001` (NPS) depende de SEG-012 pero no de otras historias de Fase C

## 3.3 Orden de implementación recomendado por sprint

### SPRINT 1 — Semanas 1-2 (Fase A — Seguridad)

**Objetivo del sprint**: Sistema seguro y todos los roles con dashboard.

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | SEG-007 — Migración 018 (estructura) | 3 | Backend |
| 2 | SEG-008 — max_licenses en fn | 5 | Backend |
| 3 | SEG-009 — campos revocación | 3 | Backend |
| 4 | SEG-010 — RLS accesos | 3 | Backend |
| 5 | SEG-011 — triggers audit_logs | 8 | Backend |
| 6 | SEG-012 — tabla nps_surveys | 2 | Backend |
| 7 | SEG-013 — gym.pagos.crear para Recepcionista | 2 | Backend |
| 8 | SEG-001 — JWT claim | 5 | Fullstack |
| 9 | SEG-006 — Validación UUID | 2 | Frontend |
| 10 | SEG-002 — Middleware JWT | 3 | Frontend |
| 11 | SEG-003 — role_dashboard_map | 2 | Frontend |
| 12 | SEG-004 — supervisor/cajero routing | 2 | Frontend |
| 13 | SEG-005 — deprecar cliente | 2 | Frontend |
| 14 | ROL-001 — Dashboard Supervisor MVP | 5 | Frontend |
| 15 | ROL-002 — Dashboard Cajero MVP | 5 | Frontend |
| 16 | ROL-003 — Sidebar dinámico | 5 | Frontend |

**Total Sprint 1**: 57 SP *(posiblemente dividir en dos semanas estrictas)*

**Criterio de "Done" del Sprint 1:**
- ✅ Un usuario con rol `supervisor` puede iniciar sesión y ver su dashboard
- ✅ Un usuario con rol `cajero` puede iniciar sesión y ver su dashboard
- ✅ El rol del usuario viaja en el JWT (no en cookie JavaScript)
- ✅ Las migraciones de la migración 018 están en producción
- ✅ No hay regresiones en los dashboards existentes (gerente, recepcionista, entrenador, nutricionista, miembro)

---

### SPRINT 2 — Semanas 3-4 (Fase B — Staff Management I)

**Objetivo**: El admin puede ver y gestionar su equipo.

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | STF-001 — Lista trabajadores | 8 | Fullstack |
| 2 | STF-002 — Filtros tabla staff | 3 | Frontend |
| 3 | STF-003 — Drawer detalle | 8 | Frontend |
| 4 | STF-004 — Modal cambio rol | 8 | Fullstack |
| 5 | STF-006 — Revocación definitiva | 8 | Fullstack |
| 6 | STF-008 — Widget KPIs licencias | 3 | Frontend |

**Total Sprint 2**: 38 SP

**Criterio de "Done" del Sprint 2:**
- ✅ Admin ve la lista de trabajadores con sus roles RBAC reales
- ✅ Admin puede revocar el acceso de un trabajador y este pierde acceso inmediatamente
- ✅ El widget de licencias muestra el conteo correcto

---

### SPRINT 3 — Semanas 5-6 (Fase B — Operaciones Completas)

**Objetivo**: Dashboards operativos completos para todos los roles.

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | STF-005 — Suspensión temporal | 5 | Fullstack |
| 2 | COD-001 — Historial códigos (Tab 3) | 8 | Frontend |
| 3 | COD-002 — Revocar código | 3 | Frontend |
| 4 | MBR-003 — RPC transaccional | 8 | Backend |
| 5 | MBR-004 — Formulario registro miembro | 8 | Frontend |
| 6 | MBR-001 — Lista miembros con filtros | 8 | Frontend |
| 7 | MEM-001 — Card cobro rápido Cajero | 8 | Frontend |
| 8 | ACC-001 — Acceso LIVE Realtime | 8 | Fullstack |
| 9 | MEM-002 — Lista membresías por cobrar | 5 | Frontend |

**Total Sprint 3**: 61 SP *(considerar extender a 3 semanas o priorizar)*

**Criterio de "Done" del Sprint 3:**
- ✅ Recepcionista puede registrar a un nuevo miembro con membresía inicial de forma atómica
- ✅ Cajero puede buscar, seleccionar y cobrar una membresía en < 3 clics
- ✅ Control de acceso live se actualiza sin recargar la página
- ✅ Historial de códigos de invitación visible para el admin

---

### SPRINT 4 — Semanas 7-8 (Fase B+C — Resto de Operaciones + Analytics Base)

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | MBR-002 — Perfil completo miembro | 8 | Frontend |
| 2 | MBR-005 — Cancelar membresía | 5 | Fullstack |
| 3 | MEM-003 — Historial pagos gym | 5 | Frontend |
| 4 | CLS-001 — Agenda semanal Admin | 5 | Frontend |
| 5 | CLS-002 — Agenda día Entrenador | 5 | Frontend |
| 6 | CLS-003 — Tomar asistencia | 5 | Frontend |
| 7 | CLS-004 — Inscripción desde Recepcionista | 5 | Frontend |
| 8 | CLS-005 — Clases para Miembro | 5 | Frontend |
| 9 | ANA-001 — NPS datos reales | 3 | Frontend |
| 10 | ANA-002 — Panel Churn acciones | 5 | Frontend |

**Total Sprint 4**: 51 SP

---

### SPRINT 5 — Semanas 9-10 (Fase C — Analytics + Auditoría + Configuración)

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | ANA-003 — Reporte financiero | 8 | Frontend |
| 2 | ANA-004 — Retención y churn | 5 | Frontend |
| 3 | AUD-001 — Visor audit_logs | 8 | Fullstack |
| 4 | AUD-002 — Exportar CSV | 3 | Frontend |
| 5 | AUD-003 — Widget roles expiran | 3 | Frontend |
| 6 | CFG-001 — Editar datos gym | 5 | Fullstack |
| 7 | CFG-002 — CRUD planes | 8 | Fullstack |
| 8 | ANA-005 — Mapa de calor asistencia | 8 | Frontend |
| 9 | COD-003 — Notif. código usado | 5 | Fullstack |
| 10 | ACC-002 — Acceso manual | 5 | Frontend |

**Total Sprint 5**: 58 SP

---

### SPRINT 6 — Semanas 11-12 (Fase D — Ciclo del Miembro I)

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | MBM-001 — QR dinámico | 8 | Fullstack |
| 2 | MBM-002 — Renovación autoasistida | 8 | Fullstack |
| 3 | MBM-006 — Historial visitas stats | 5 | Frontend |
| 4 | NUT-001 — Lista pacientes nutricionista | 5 | Frontend |
| 5 | NUT-003 — Registrar evaluación nutricional | 5 | Frontend |
| 6 | NUT-004 — Evaluaciones Entrenador | 5 | Frontend |
| 7 | STF-007 — Reactivar trabajador | 3 | Frontend |
| 8 | CFG-003 — Espacios y equipamiento | 5 | Frontend |

**Total Sprint 6**: 44 SP

---

### SPRINT 7 — Semanas 13-14 (Fase D — Push + Fase E inicio)

| Orden | Historia | SP | Asignar a |
|-------|---------|-----|-----------|
| 1 | MBM-003 — Web Push VAPID infraestructura | 13 | Backend |
| 2 | MBM-004 — Push membresía vence | 5 | Backend |
| 3 | MBM-005 — Push churn intervention | 5 | Backend |
| 4 | NUT-002 — Crear plan nutricional | 13 | Frontend |
| 5 | IA-001 — Configurar Gemini API | 5 | Fullstack |

**Total Sprint 7**: 41 SP

---

### SPRINT 8-10 — Semanas 15-20 (Fase E — IA y Escalabilidad)

| Historia | SP | Sprint |
|---------|-----|--------|
| IA-002 — Churn IA personalizado | 8 | 8 |
| IA-003 — Recomendaciones workout | 8 | 8 |
| SAS-001 — Panel super-admin | 13 | 8 |
| IA-004 — Gamificación MVP | 13 | 9 |
| SAS-004 — Refactoring God Service | 8 | 9 |
| SAS-002 — Validación suscripción | 8 | 9 |
| SAS-005 — Migración 019 fn_validate | 3 | 9 |
| SAS-003 — Stripe (iniciar) | 21 | 10 |
| SAS-006 — Roles personalizados | 13 | 10 |

---

## 3.4 Definición de "Done" global del proyecto

Una historia se considera **Done** cuando:
1. ✅ El código está mergeado a `main`
2. ✅ Los criterios de aceptación fueron verificados manualmente en un ambiente real (no mock)
3. ✅ No hay regresiones detectadas en las historias previas
4. ✅ La migración de BD (si aplica) fue aplicada en el ambiente de staging
5. ✅ Los estados vacíos y de error están implementados (no solo el happy path)
6. ✅ El comportamiento en mobile/tablet fue verificado (para páginas críticas: QR, cobro, acceso)

Una historia se considera **Bloqueada** cuando:
- Su dependencia no está mergeada
- Se encontró un GAP técnico no documentado que requiere decisión arquitectónica
- Hay conflicto entre lo especificado y el estado actual del código

---

## 3.5 Criterios de aceptación de las migraciones SQL

Para TODA migración (018, 019, etc.) se deben verificar:

1. **Idempotencia**: La migración puede correrse dos veces sin errores (`ON CONFLICT DO NOTHING`, `IF NOT EXISTS`)
2. **RAISE NOTICE**: Al menos un `RAISE NOTICE` por cada paso significativo para confirmar que se ejecutó
3. **SECURITY DEFINER**: Todas las RPCs nuevas o modificadas tienen `SECURITY DEFINER` y `SET search_path`
4. **Tenant isolation**: Toda nueva tabla tiene `tenant_id` con FK a `public.tenants` y política RLS
5. **Rollback mental**: Documentar brevemente cómo revertir cada cambio si algo sale mal
6. **Verificación final**: La migración termina con un SELECT de verificación que confirma el estado esperado

---

## 3.6 Riesgos de implementación por historia

| Historia | Riesgo | Mitigación |
|---------|--------|------------|
| SEG-001 | El trigger handle_new_user puede fallar al llamar a supabase.auth.admin | Usar try/catch, registrar error en logs, no bloquear el registro del usuario |
| SEG-002 | El cambio en middleware puede romper todas las redirecciones post-login | Feature flag: usar un env `USE_JWT_AUTH=true` para activar gradualmente |
| MBR-003 | La RPC transaccional requiere que auth.admin.deleteUser funcione como cleanup | Tener un job de limpieza de usuarios huérfanos como fallback |
| ACC-001 | Supabase Realtime puede tener límites de concurrencia en plan gratuito | Verificar los límites del plan actual antes de implementar |
| MBM-003 | Web Push tiene soporte variable en navegadores (iOS Safari limitado) | Documentar qué navegadores soportan Web Push y mostrar warning en los que no |
| IA-003 | Gemini API puede tener costos inesperados si se llama muy frecuentemente | Implementar rate limiting y caché de recomendaciones (TTL 7 días) |
| SAS-003 | Stripe requiere configuración de webhooks, PCI DSS y ambiente de test separado | Empezar con el ambiente de test de Stripe antes de producción. Documentar el flujo de webhook |

---

## 3.7 Decisiones de diseño que deben tomarse antes de implementar

Las siguientes decisiones son bloqueantes para ciertas historias y deben tomarse antes de comenzar:

| # | Decisión | Bloqueante para | Opciones | Recomendación |
|---|---------|----------------|---------|---------------|
| D1 | ¿El sidebar del Admin usa un componente único o uno por dashboard? | ROL-003 | A) Un componente con config por rol; B) Un componente por dashboard | A — más mantenible |
| D2 | ¿Los modales de Staff usan estado local o Zustand/Context? | STF-004, STF-005, STF-006 | A) Estado local en cada página; B) Context global de modales | A — menor complejidad |
| D3 | ¿La búsqueda global (Cmd+K) usa Fuse.js (local) o un endpoint del servidor? | — (Fase B) | A) Fuse.js client-side; B) Server endpoint con debounce | B — seguridad de datos |
| D4 | ¿Los gráficos de Analytics usan Recharts o Chart.js? | ANA-003 | A) Recharts (React); B) Chart.js | A — mejor integración con React |
| D5 | ¿El QR dinámico usa JWT firmado o UUID temporal en BD? | MBM-001 | A) JWT firmado (sin BD); B) UUID en tabla temporal | A — sin overhead de BD |
| D6 | ¿Las push notifications usan Supabase Edge Functions o Next.js API Routes? | MBM-003 | A) Edge Functions; B) Next.js API Route | A — más cercano a la BD |

---

## 3.8 Guía de archivos por historia

Los siguientes archivos son los más frecuentemente modificados y su relación con las historias:

| Archivo | Historias relacionadas |
|---------|----------------------|
| `middleware.ts` | SEG-002, SEG-003, SEG-004, SEG-005, SAS-002 |
| `lib/roles.ts` | SEG-003, SEG-004, SEG-005, ROL-001, ROL-002 |
| `app/dashboard/admin/staff/page.tsx` | STF-001, STF-002, STF-003 |
| `components/staff-revoke-modal.tsx` | STF-006 (nuevo) |
| `components/staff-role-modal.tsx` | STF-004 (nuevo) |
| `services/staff.service.ts` | STF-001, STF-003, STF-004 (nuevo) |
| `services/codes.service.ts` | COD-001, COD-002 (nuevo) |
| `services/audit.service.ts` | AUD-001 (nuevo) |
| `services/analytics.service.ts` | ANA-001, ANA-002, ANA-003, ANA-004, ANA-005 (nuevo — split de dashboard.service) |
| `app/actions/staff.actions.ts` | STF-004, STF-005, STF-006 (nuevo — Server Actions) |
| `app/dashboard/cajero/page.tsx` | ROL-002, MEM-001, MEM-002 (nuevo) |
| `app/dashboard/supervisor/page.tsx` | ROL-001 (nuevo) |
| `app/dashboard/recepcionista/page.tsx` | ACC-001, ACC-002 |
| `app/dashboard/recepcionista/registro/page.tsx` | MBR-004 |
| `app/dashboard/miembro/page.tsx` | MBM-001 |
| `app/dashboard/admin/reportes/page.tsx` | ANA-003, ANA-004, ANA-005 |
| `app/dashboard/admin/auditoria/page.tsx` | AUD-001, AUD-002 (nuevo) |
| `app/dashboard/admin/configuracion/page.tsx` | CFG-001, CFG-002, CFG-003 |
| `migrations/018_*.sql` | SEG-007, SEG-008, SEG-009, SEG-010, SEG-011, SEG-012, SEG-013 |
| `migrations/019_*.sql` | SAS-005, MBM-003 (tabla push_subscriptions) |

---

## 3.9 Checklist de QA por módulo

### Módulo de Seguridad y Auth
- [ ] Un usuario cuya cookie fue modificada manualmente no puede acceder a rutas protegidas
- [ ] Un trabajador revocado pierde acceso en su próxima acción (< 1 minuto después de revocación)
- [ ] Un cajero no puede acceder a `/dashboard/admin` ni a `/dashboard/recepcionista`
- [ ] Un miembro no puede acceder a ningún dashboard de staff
- [ ] Un usuario de tenant A no puede ver datos de tenant B

### Módulo de Staff Management
- [ ] La tabla de staff solo muestra trabajadores del tenant del admin autenticado
- [ ] Al revocar un acceso, el botón "Confirmar" está deshabilitado hasta que se marca el checkbox
- [ ] El cambio de rol actualiza el JWT del trabajador (verificable en la siguiente acción del trabajador)
- [ ] El historial de códigos muestra el nombre del trabajador que usó cada código

### Módulo de Cobros (Cajero)
- [ ] El cajero puede buscar un miembro y procesar el cobro en < 3 clics
- [ ] El cajero no puede ver el panel de analytics ni el módulo de staff
- [ ] Al registrar un pago, la membresía del miembro se extiende correctamente
- [ ] Si el pago falla (error de red), no se crea una membresía "fantasma"

### Módulo de Control de Accesos
- [ ] El input QR rechaza inputs que no son UUID con feedback en < 200ms
- [ ] El feed live se actualiza en < 2 segundos después de cada acceso
- [ ] Si hay pérdida de conexión Realtime, aparece el banner de advertencia
- [ ] El acceso denegado por membresía vencida registra el intento en audit_logs

### Módulo de Miembro
- [ ] El QR del miembro es visible en < 2 segundos al abrir la app
- [ ] Si la membresía venció, el QR aparece deshabilitado y el botón "Renovar" es prominente
- [ ] El miembro no puede ver los datos de otros miembros

---

## 3.10 Deuda técnica programada

Estas tareas no son historias de usuario pero son necesarias para la salud del código:

| Deuda | Descripción | Sprint sugerido |
|-------|-------------|-----------------|
| DT-04 | Reemplazar NPS hardcodeado con `nps.service` | Sprint 5 (junto con ANA-001) |
| DT-06 | Corregir N+1 en `getPlanesConConteo` | Sprint 4 (junto con CFG-002) |
| DT-05 | Refactoring: extraer `analytics.service` del God Service | Sprint 9 (SAS-004) |
| DT-12 | Validación de suscripción activa del gym | Sprint 9 (SAS-002) |
| Linting | Configurar ESLint con reglas de no-any y no-unused-vars | Sprint 1 (junto con las migraciones) |
| Tests E2E | Escribir test de flujo crítico: registro → login → acceso QR | Sprint 3 |

---

## 3.11 Preguntas abiertas para el Product Owner

Estas preguntas requieren respuesta antes de iniciar las historias indicadas:

| # | Pregunta | Bloquea a | Opciones |
|---|---------|----------|---------|
| Q1 | ¿El Supervisor puede registrar nuevos miembros? La especificación dice que puede crear usuarios pero no si aplica a miembros o solo staff | STF-001, MBR-004 | Sí — puede actuar como recepcionista; No — solo supervisa |
| Q2 | ¿El Cajero puede crear una membresía nueva o solo renovar? La distinción importa para MEM-001 | MEM-001 | Solo renovar membresías existentes; Puede crear para miembros nuevos |
| Q3 | ¿El QR del miembro rota en el cliente (sin backend) o requiere una llamada al servidor? | MBM-001 | JWT local (sin BD, recomendado); UUID temporal en BD |
| Q4 | ¿Las evaluaciones del Entrenador y del Nutricionista usan la misma tabla o tablas separadas? La migración no está confirmada | NUT-002, NUT-003, NUT-004 | Misma tabla `gym.evaluaciones` con campo `tipo`; Tablas separadas |
| Q5 | ¿El admin puede ver los planes nutricionales de los pacientes de sus nutricionistas? | NUT-001 | Sí (visibilidad completa del admin); No (privacidad del paciente) |
| Q6 | ¿El Stripe se configura a nivel de tenant (cada gym tiene su propia cuenta Stripe) o a nivel de plataforma (GYMsos cobra y distribuye)? | SAS-003 | Por tenant (más simple, cada gym cobra directo); Plataforma (model Marketplace, más complejo) |

---

# ÍNDICE COMPLETO DEL BACKLOG

| Archivo | Contenido |
|---------|-----------|
| BACKLOG-TECNICO-PARTE1.md | Épicas 1-7: SEG (16 historias), ROL (3), STF (8), COD (3), MBR (5), MEM (3), ACC (2) + Fases A y B inicio |
| BACKLOG-TECNICO-PARTE2.md | Épicas 8-15: CLS (5), ANA (5), AUD (3), CFG (3), MBM (6), NUT (4), IA (4), SAS (6) + Tabla resumen completa |
| BACKLOG-TECNICO-PARTE3.md | Grafo de dependencias, orden de implementación, checklist QA, guía de archivos, decisiones pendientes |

**Total del backlog**: 76 historias de usuario · 444 story points · 14 semanas estimadas

---

*Backlog Técnico Completo — GYMsos Operating System v1.0*
*2026-06-03 · Listo para planning de sprints*
*Basado en Blueprint Definitivo v2.0 — todas las decisiones DA-01 a DA-07 implementadas*
