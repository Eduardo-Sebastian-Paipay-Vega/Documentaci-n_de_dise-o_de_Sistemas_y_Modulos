# ESPECIFICACIÓN UX/UI COMPLETA — GYMSOS OPERATING SYSTEM
> **Versión**: 1.0 · **Fecha**: 2026-06-03
> **Fuente de verdad**: Auditoría v1.0 (1.md) · Auditoría v2.0 (2.md) · Especificación Funcional (3.md) · Blueprint Definitivo (4.md)
> **Rol del documento**: Contrato de diseño visual y operativo. Ninguna decisión funcional nueva. Todo lo que aquí se especifica implementa decisiones ya tomadas.

---

# FASE 1 — MAPA DE EXPERIENCIA POR ACTOR

## 1.1 Dueño / Administrador General

### Qué ve al iniciar sesión
Panel Ejecutivo con 5 KPI cards en la parte superior (siempre visibles sin scroll):
- Ingresos del día con variación vs ayer
- Accesos del día (X de Y capacidad)
- Membresías activas con delta de la semana
- Miembros en riesgo de churn (número con badge rojo)
- Staff activo hoy (X de Y con alerta si faltan)

Bajo los KPIs: gráfico de ingresos últimos 30 días (izquierda) + gráfico de accesos por hora de hoy (derecha).
Bajo los gráficos: tabla de membresías por vencer (izquierda) + lista de churn risk (derecha).
Footer de la pantalla: snapshot de clases del día, últimas transacciones, staff del día.

### Acciones diarias
1. Revisar KPIs matutinos — ¿todo bien o hay alerta roja?
2. Ver membresías que vencen hoy y enviar recordatorio
3. Revisar miembros con churn score alto e intervenir
4. Verificar que todo el staff está activo
5. Revisar los últimos cobros del día

### Información que necesita primero (P0 — sin scroll)
- Ingresos de hoy vs ayer
- Aforo actual del gym
- Número de miembros en riesgo
- Staff que no registró check-in
- Membresías que vencen hoy (número)

### Información secundaria (scroll o navegación)
- Detalle de cada miembro en riesgo
- Historial de pagos de la semana
- Ocupación por clase
- Reportes mensuales
- Audit log de acciones del personal

### Tareas frecuentes (diarias)
- Revisar dashboard de KPIs
- Generar código de staff cuando hay contratación nueva
- Aprobar renovación de membresía con descuento
- Ver perfil de miembro reportado

### Tareas excepcionales
- Revocar acceso de un trabajador (baja)
- Cambiar rol de un trabajador
- Crear o modificar planes de membresía
- Revisar audit log por incidente
- Exportar reporte financiero mensual
- Actualizar datos del gimnasio (logo, nombre, RUC)

---

## 1.2 Supervisor

### Qué ve al iniciar sesión
Panel de Turno con 4 KPI cards:
- Accesos procesados en este turno
- Membresías procesadas hoy
- Clases activas en este momento
- Incidencias pendientes (accesos denegados, renovaciones por aprobar)

Bajo los KPIs: lista de membresías que vencen hoy (con botón "Aprobar renovación"), lista de accesos denegados (con botón "Autorizar excepción"), y tabla de staff activo en el turno.

### Acciones diarias
1. Verificar que recepcionistas y cajeros están activos
2. Resolver incidencias de acceso denegado
3. Aprobar renovaciones que requieren autorización superior
4. Monitorear ocupación de clases
5. Generar reporte de cierre de turno

### Información que necesita primero
- Incidencias pendientes del turno
- Staff que está activo ahora mismo
- Membresías por resolver hoy

### Información secundaria
- Reporte consolidado del turno anterior
- Estadísticas de asistencia
- Estado de clases próximas

### Tareas frecuentes
- Resolver incidencia de acceso denegado
- Aprobar renovación con descuento excepcional
- Verificar que recepcionistas están atendiendo
- Enviar reporte de turno al admin

### Tareas excepcionales
- Autorizar acceso manual sin QR (membresía válida, QR no funciona)
- Reemplazar recepcionista en el frente de registro
- Escalar incidencia grave al administrador

---

## 1.3 Cajero

### Qué ve al iniciar sesión
Pantalla de caja con foco exclusivo en transacciones:
- 3 KPI cards: total cobrado en el turno (S/), número de transacciones, membresías pendientes de cobrar hoy
- Barra de búsqueda grande y prominente: "Buscar miembro por nombre o documento"
- Lista "Cobros Pendientes del Día" (membresías vencidas o por vencer hoy)
- Historial del turno (últimas 10 transacciones)

### Acciones diarias
1. Buscar miembro al llegar a pagar
2. Verificar estado de membresía del miembro
3. Registrar cobro (efectivo, Yape, Plin, tarjeta)
4. Crear nueva membresía para miembro sin plan
5. Revisar membresías por cobrar pendientes

### Información que necesita primero
- Barra de búsqueda (siempre activa)
- Estado de membresía del miembro que está frente a la caja
- Monto a cobrar y planes disponibles

### Información secundaria
- Total del turno
- Historial de cobros
- Lista de pendientes del día

### Tareas frecuentes
- Buscar miembro → cobrar membresía → confirmar
- Crear nueva membresía para miembro existente
- Cambiar forma de pago

### Tareas excepcionales
- Registrar pago parcial (Fase E, cuando Stripe esté disponible)
- Revertir cobro erróneo (solo Admin puede hacer reembolso)
- Buscar miembro por número de documento en lugar de nombre

---

## 1.4 Recepcionista

### Qué ve al iniciar sesión
Control de acceso en tiempo real:
- 4 KPI cards: accesos de hoy, aforo actual, membresías vencidas que intentaron entrar, clases próximas (2 horas)
- Input de escaneo QR (activo y enfocado por defecto — la cámara o el lector QR está listo)
- Feed live de últimos accesos (con colores: verde = permitido, rojo = denegado)
- Panel lateral derecho: alertas del turno (membresías por vencer, avisos de clase)

### Acciones diarias
1. Escanear QR de cada miembro al entrar
2. Revisar alertas de membresías vencidas en tiempo real
3. Registrar nuevo miembro cuando llega alguien por primera vez
4. Inscribir miembros en clases del día
5. Informar estado de membresía cuando el miembro pregunta

### Información que necesita primero
- Estado del QR escaneado (VERDE / ROJO) en los primeros 2 segundos
- Nombre y foto del miembro al escanear
- Si membresía vencida: cuánto debe y opción de enviar al cajero

### Información secundaria
- Historial de accesos del día
- Agenda de clases del día
- Lista completa de miembros del gym

### Tareas frecuentes
- Escanear QR → feedback inmediato → siguiente miembro
- Informar que membresía venció → derivar al cajero
- Inscribir miembro en clase con cupo disponible

### Tareas excepcionales
- Registrar acceso manual (miembro sin QR, número de documento)
- Alta de nuevo miembro con formulario completo
- Actualizar datos de contacto de un miembro existente

---

## 1.5 Entrenador

### Qué ve al iniciar sesión
Agenda del día con foco en sus clases y clientes:
- 3 KPI cards: clases de hoy (próxima en X minutos), clientes activos bajo seguimiento, evaluaciones pendientes
- Timeline del día: lista de clases con hora, espacio, inscritos/cupo, estado (Próxima / En curso / Completada)
- Panel inferior: "Mis Clientes" con los que tienen clase hoy y sus estados

### Acciones diarias
1. Revisar agenda del día al llegar
2. Iniciar clase y registrar asistencia en bulk
3. Verificar qué clientes tienen evaluación pendiente
4. Añadir nota rápida al perfil de un cliente tras la sesión
5. Ver próximas clases de la semana

### Información que necesita primero
- Próxima clase (hora, espacio, inscritos)
- Lista de asistentes de la clase actual
- Evaluaciones pendientes urgentes

### Información secundaria
- Historial de asistencia de un cliente específico
- Evaluaciones anteriores de un cliente
- Rendimiento promedio de sus clases (% asistencia)

### Tareas frecuentes
- Iniciar clase → marcar asistentes → cerrar clase
- Ver perfil rápido de un cliente antes de la sesión
- Registrar evaluación física después de la sesión

### Tareas excepcionales
- Cancelar una clase (con aviso a inscritos — Fase D)
- Ver qué clientes suyos llevan más de 7 días sin venir
- Crear nueva clase en el horario disponible

---

## 1.6 Nutricionista

### Qué ve al iniciar sesión
Lista de pacientes con estado de plan nutricional:
- 3 KPI cards: pacientes activos, planes nutricionales vigentes, evaluaciones del mes
- Lista de pacientes con: nombre, plan activo (sí/no), última evaluación (hace N días), alerta si > 30 días sin evaluación
- Panel de alertas: pacientes sin plan activo, pacientes sin evaluación reciente

### Acciones diarias
1. Revisar lista de pacientes y estado de seguimiento
2. Ver si algún paciente tiene evaluación pendiente urgente
3. Crear o actualizar plan nutricional de un paciente
4. Registrar evaluación nutricional tras consulta
5. Revisar progreso de un paciente específico

### Información que necesita primero
- Pacientes sin seguimiento reciente (> 30 días)
- Pacientes sin plan nutricional activo
- Próximas evaluaciones planificadas

### Información secundaria
- Historial completo de evaluaciones por paciente
- Biblioteca de recetas y templates de planes
- Evolución de IMC y medidas del paciente

### Tareas frecuentes
- Buscar paciente → ver ficha → actualizar plan
- Registrar evaluación nutricional completa
- Crear plan desde template existente

### Tareas excepcionales
- Crear template de plan nutricional reutilizable
- Ver lista completa de todos los miembros del gym (para asignar nuevos pacientes)

---

## 1.7 Miembro

### Qué ve al iniciar sesión
Su llave digital y estado de membresía:
- Hero prominente: QR grande y legible (toda la parte superior de la pantalla)
- Badge de estado de membresía: "✅ Activa hasta 15 Jun 2026" o "⚠️ Vence en 3 días"
- Mis próximas clases inscritas (lista compacta con hora y nombre)
- 3 estadísticas rápidas: visitas este mes, clases asistidas, racha actual (cuando gamificación esté activa)

### Acciones diarias
1. Abrir la app para mostrar QR al entrar al gym
2. Ver sus próximas clases inscritas
3. Inscribirse en una nueva clase
4. Revisar cuándo vence su membresía

### Información que necesita primero
- QR (tiene que estar visible en < 2 segundos, sin login adicional)
- Estado de membresía (activa / por vencer / vencida)
- Próxima clase inscrita

### Información secundaria
- Historial de visitas
- Clases disponibles para reservar
- Detalle de su plan y precio

### Tareas frecuentes
- Abrir QR para entrar al gym
- Inscribirse en clase
- Ver cuándo vence la membresía

### Tareas excepcionales
- Renovar membresía (Fase D: autoasistido)
- Cancelar inscripción a una clase
- Ver historial completo de visitas

---

# FASE 2 — SIDEBAR GLOBAL

## 2.1 Sidebar — Administrador General

| # | Nombre | Icono sugerido | Permiso RBAC | Prioridad visual |
|---|--------|----------------|--------------|-----------------|
| 1 | Panel Ejecutivo | BarChart3 (Lucide) | cualquier permiso del tenant | P0 — siempre visible, ítem activo default |
| 2 | **Miembros** | Users | gym.usuarios.ver | P0 — siempre visible |
| 2a | → Todos los miembros | UserRound | gym.usuarios.ver | Sub-ítem |
| 2b | → En riesgo (badge con número) | UserMinus | gym.usuarios.ver | Sub-ítem con badge rojo |
| 2c | → Nuevos esta semana | UserPlus | gym.usuarios.ver | Sub-ítem |
| 3 | **Membresías & Pagos** | CreditCard | gym.membresias.ver | P0 — siempre visible |
| 3a | → Membresías activas | CheckCircle | gym.membresias.ver | Sub-ítem |
| 3b | → Por vencer (badge 7 días) | AlertTriangle | gym.membresias.ver | Sub-ítem con badge naranja |
| 3c | → Historial de pagos | Receipt | gym.pagos.ver | Sub-ítem |
| 4 | **Clases & Agenda** | Calendar | gym.clases.ver | P1 |
| 4a | → Agenda semanal | CalendarDays | gym.clases.ver | Sub-ítem |
| 4b | → Gestión de clases | Settings | gym.clases.gestionar | Sub-ítem |
| 5 | **Personal** | UserCog | gym.staff.ver | P1 |
| 5a | → Trabajadores activos | Users | gym.staff.ver | Sub-ítem |
| 5b | → Invitar (Código) | QrCode | gym.staff.gestionar | Sub-ítem |
| 5c | → Historial de códigos | History | gym.codigos.ver | Sub-ítem |
| 5d | → Roles y permisos | Shield | gym.staff.gestionar | Sub-ítem |
| 6 | **Reportes** | TrendingUp | gym.reportes.ver | P1 |
| 6a | → Financiero | DollarSign | gym.reportes.ver | Sub-ítem |
| 6b | → Retención / Churn | Activity | gym.reportes.ver | Sub-ítem |
| 6c | → Asistencia | BarChart2 | gym.reportes.ver | Sub-ítem |
| 6d | → Exportar | Download | gym.reportes.exportar | Sub-ítem |
| 7 | **Auditoría** | ClipboardList | gym.reportes.ver | P2 |
| 8 | **Configuración** | Settings | gym.config.ver | P2 |
| 8a | → Datos del Gym | Building | gym.config.editar | Sub-ítem |
| 8b | → Planes | Tag | gym.planes.gestionar | Sub-ítem |
| 8c | → Espacios | Map | gym.espacios.gestionar | Sub-ítem |
| 8d | → Integraciones | Plug | gym.config.editar | Sub-ítem (badge "Fase D") |

**Comportamiento del sidebar:**
- Ancho: 260px expandido / 64px colapsado (solo iconos)
- Colapso mediante botón toggle en la parte superior derecha del sidebar
- Items con sub-ítems: expandibles / colapsables con chevron
- Item activo: fondo con color primario (no solo subrayado)
- Badges numéricos en ítem principal se acumulan de los sub-ítems
- Footer del sidebar: nombre del gym + plan de suscripción + avatar del admin

---

## 2.2 Sidebar — Supervisor

| # | Nombre | Icono | Permiso RBAC | Prioridad visual |
|---|--------|-------|--------------|-----------------|
| 1 | Mi Turno | Monitor | gym.staff.ver | P0 — default al entrar |
| 2 | **Miembros** | Users | gym.usuarios.ver | P0 |
| 2a | → Buscar miembro | Search | gym.usuarios.ver | Sub-ítem |
| 2b | → Membresías por vencer | AlertTriangle | gym.membresias.ver | Sub-ítem con badge |
| 2c | → Accesos denegados hoy | XCircle | gym.accesos.ver | Sub-ítem con badge rojo |
| 3 | **Clases y Agenda** | Calendar | gym.clases.ver | P1 |
| 3a | → Agenda del día | CalendarCheck | gym.clases.ver | Sub-ítem |
| 3b | → Gestionar clases | Edit | gym.clases.gestionar | Sub-ítem |
| 4 | **Mi Equipo** | Users | gym.staff.ver | P1 |
| 4a | → Staff activo ahora | Activity | gym.staff.ver | Sub-ítem |
| 5 | **Reportes Operativos** | BarChart2 | gym.reportes.ver | P2 |
| 5a | → Resumen del turno | FileText | gym.reportes.ver | Sub-ítem |
| 5b | → Accesos del día | DoorOpen | gym.accesos.ver | Sub-ítem |

**Diferenciador visual del Supervisor**: El header del sidebar lleva badge "SUPERVISOR" en color naranja para distinguirlo visualmente del Admin.

---

## 2.3 Sidebar — Cajero

| # | Nombre | Icono | Permiso RBAC | Prioridad visual |
|---|--------|-------|--------------|-----------------|
| 1 | Mi Caja | Banknote | gym.pagos.crear | P0 — default, mayor tamaño de fuente |
| 2 | Buscar Miembro | Search | gym.usuarios.ver | P0 — acción más frecuente |
| 3 | **Cobros** | Receipt | gym.pagos.ver | P0 |
| 3a | → Pendientes hoy | Clock | gym.membresias.ver | Sub-ítem con badge numérico |
| 3b | → Historial del turno | History | gym.pagos.ver | Sub-ítem |
| 4 | **Membresías** | CreditCard | gym.membresias.ver | P1 |
| 4a | → Ver estado por miembro | Eye | gym.membresias.ver | Sub-ítem |

**Principio de diseño del sidebar del Cajero**: Mínimo. Solo lo que necesita para cobrar. Sin clases, sin staff, sin reportes estratégicos. El sidebar puede estar colapsado por defecto dado que la acción principal es la búsqueda en pantalla central.

---

## 2.4 Sidebar — Recepcionista

| # | Nombre | Icono | Permiso RBAC | Prioridad visual |
|---|--------|-------|--------------|-----------------|
| 1 | Control de Acceso | DoorOpen | gym.accesos.crear | P0 — LIVE badge parpadeante |
| 2 | **Miembros** | Users | gym.usuarios.ver | P0 |
| 2a | → Buscar miembro | Search | gym.usuarios.ver | Sub-ítem |
| 2b | → Registrar nuevo | UserPlus | gym.usuarios.crear | Sub-ítem |
| 2c | → Vencimientos hoy | AlertCircle | gym.membresias.ver | Sub-ítem con badge |
| 3 | **Clases del Día** | Calendar | gym.clases.ver | P1 |
| 3a | → Horario de hoy | Clock | gym.clases.ver | Sub-ítem |
| 3b | → Inscribir a clase | Plus | gym.clases.inscribir | Sub-ítem |
| 4 | Soporte al Miembro | HelpCircle | gym.usuarios.ver | P2 |

**Badge LIVE**: El ítem "Control de Acceso" tiene un badge verde con punto pulsante que indica actualización en tiempo real. Es el único item del sistema con este indicador visual.

---

## 2.5 Sidebar — Entrenador

| # | Nombre | Icono | Permiso RBAC | Prioridad visual |
|---|--------|-------|--------------|-----------------|
| 1 | Mi Agenda | CalendarCheck | gym.clases.ver | P0 — default |
| 1a | → Hoy | Sun | gym.clases.ver | Sub-ítem activo |
| 1b | → Esta semana | CalendarDays | gym.clases.ver | Sub-ítem |
| 2 | **Mis Clientes** | Users | gym.usuarios.ver | P0 |
| 2a | → Activos | UserCheck | gym.usuarios.ver | Sub-ítem |
| 2b | → Con eval. pendiente | AlertCircle | gym.evaluaciones.ver | Sub-ítem con badge |
| 3 | **Mis Clases** | Dumbbell | gym.clases.gestionar | P1 |
| 3a | → Próximas | ChevronRight | gym.clases.ver | Sub-ítem |
| 3b | → Historial | Archive | gym.clases.ver | Sub-ítem |
| 4 | **Evaluaciones** | ClipboardEdit | gym.evaluaciones.gestionar | P1 |
| 4a | → Registrar nueva | Plus | gym.evaluaciones.gestionar | Sub-ítem |
| 4b | → Historial por cliente | History | gym.evaluaciones.ver | Sub-ítem |
| 5 | Mi Rendimiento | TrendingUp | gym.asistencia.ver | P2 |

---

## 2.6 Sidebar — Nutricionista

| # | Nombre | Icono | Permiso RBAC | Prioridad visual |
|---|--------|-------|--------------|-----------------|
| 1 | Mi Panel | Home | gym.nutricion.ver | P0 — default |
| 2 | **Mis Pacientes** | Users | gym.usuarios.ver | P0 |
| 2a | → Activos | UserCheck | gym.nutricion.ver | Sub-ítem |
| 2b | → Sin plan activo | UserMinus | gym.nutricion.ver | Sub-ítem con badge naranja |
| 3 | **Planes Nutricionales** | UtensilsCrossed | gym.nutricion.gestionar | P0 |
| 3a | → Activos | CheckCircle | gym.nutricion.ver | Sub-ítem |
| 3b | → Crear nuevo | Plus | gym.nutricion.gestionar | Sub-ítem |
| 4 | Recetas y Templates | BookOpen | gym.nutricion.gestionar | P1 |
| 5 | **Evaluaciones** | ClipboardList | gym.evaluaciones.gestionar | P1 |
| 5a | → Pendientes | Clock | gym.evaluaciones.ver | Sub-ítem con badge |
| 5b | → Historial | History | gym.evaluaciones.ver | Sub-ítem |

---

## 2.7 Sidebar — Miembro

| # | Nombre | Icono | Permiso RBAC | Prioridad visual |
|---|--------|-------|--------------|-----------------|
| 1 | Mi QR | QrCode | — | P0 — hero visual, item más grande |
| 2 | **Clases** | Calendar | gym.clases.ver | P0 |
| 2a | → Disponibles | Search | gym.clases.ver | Sub-ítem |
| 2b | → Mis inscripciones | BookMarked | gym.clases.ver | Sub-ítem |
| 3 | **Mi Progreso** | Activity | gym.accesos.ver | P1 |
| 3a | → Mis visitas | DoorOpen | gym.accesos.ver | Sub-ítem |
| 3b | → Mi historial | History | gym.accesos.ver | Sub-ítem |
| 4 | Mi Membresía | CreditCard | gym.planes.ver | P1 — badge si vence pronto |
| 4a | → Estado | Eye | gym.planes.ver | Sub-ítem |
| 4b | → Renovar | RefreshCw | gym.planes.ver | Sub-ítem (Fase D) |
| 5 | Retos (Fase E) | Trophy | — | P3 — greyed out hasta activación |
| 6 | Ayuda y Soporte | HelpCircle | — | P2 |

**Nota sobre el sidebar del Miembro**: Es el único sidebar donde el primer ítem es una función (mostrar QR), no una sección de navegación. El QR es tan crítico que debe ser accesible con un toque desde cualquier parte de la app (también accesible desde el header con botón flotante).

---
