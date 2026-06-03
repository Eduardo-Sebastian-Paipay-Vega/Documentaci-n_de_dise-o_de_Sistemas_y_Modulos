# BACKLOG TÉCNICO — PARTE 2
## FASES B, C, D, E — Continuación

---

## FASE B — CONTINUACIÓN (CLASES, REPORTES BÁSICOS)

---

# ÉPICA 8 — CLASES Y AGENDA (CLS)

---

## CLS-001 — Agenda semanal del Administrador
**Como** Administrador General,
**quiero** ver la agenda de clases del gym en vista semanal
**para que** pueda monitorear la ocupación y detectar problemas.

**Prioridad**: P1 | **SP**: 5
**Infraestructura**: ✅ `gym.clases`, `gym.inscripciones`

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/clases` muestra un calendario semanal con las clases del gym
2. Cada clase: bloque coloreado por entrenador con nombre + N inscritos / cupo
3. Badge "LLENA" en rojo si inscritos = cupo máximo
4. Badge "AHORA" pulsante en la clase actualmente en curso (hora_inicio <= now <= hora_fin)
5. Filtros: por entrenador / por espacio
6. Al hacer clic en una clase → panel lateral con detalle (lista de inscritos, entrenador, espacio, acciones)
7. Navegación entre semanas con botones anterior/siguiente

---

## CLS-002 — Agenda del día del Entrenador
**Como** Entrenador,
**quiero** ver mi agenda de clases de hoy en formato de timeline vertical
**para que** sepa cuándo y dónde son mis clases y cuántos inscritos hay.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. La ruta `/dashboard/entrenador` muestra solo las clases del entrenador autenticado para hoy
2. Query filtrada: `WHERE id_entrenador = auth.uid() AND DATE(hora_inicio) = CURRENT_DATE`
3. Cada clase en el timeline: hora, nombre, espacio, N/cupo, estado (Próxima/En curso/Completada)
4. "Próxima en X minutos" calculado en tiempo real (client-side)
5. Al hacer clic en una clase → abre modal de gestión con lista de inscritos

---

## CLS-003 — Tomar asistencia en clase (Entrenador)
**Como** Entrenador,
**quiero** marcar la asistencia de mis alumnos durante o después de la clase
**para que** quede registrado quién realmente asistió.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. Al hacer clic en una clase → modal con lista de inscritos y checkbox de asistencia por cada uno
2. Checkbox "Marcar todos como presentes" en el header de la lista
3. Botón "Cerrar clase" que:
   - Si 0 asistentes marcados → muestra warning: "¿Cerrar sin registrar asistentes?"
   - Si hay inscritos sin marcar → registra los no marcados como "no asistió"
4. Al cerrar: `UPDATE gym.inscripciones SET asistio = true/false WHERE clase_id = $id AND usuario_id = $uid`
5. El estado de la clase cambia a "Completada" en el timeline
6. Toast: "Clase cerrada · N asistentes registrados"

---

## CLS-004 — Inscripción a clase desde Recepcionista
**Como** Recepcionista,
**quiero** inscribir a un miembro en una clase del día o de la semana
**para que** el miembro no necesite usar la app para reservar.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. La ruta `/dashboard/recepcionista/clases` muestra el horario de la semana con ocupación
2. Flujo: Buscar miembro → Seleccionar clase → Confirmar inscripción
3. Solo se pueden inscribir si hay cupo disponible
4. Si clase llena → muestra "Sin cupo. ¿Añadir a lista de espera?" (lista de espera — Fase D)
5. Toast: "[Nombre] inscrito en [Clase] del [día] a las [hora]"

---

## CLS-005 — Clases disponibles para el Miembro
**Como** Miembro,
**quiero** ver las clases disponibles del gym y poder inscribirme
**para que** pueda reservar mi lugar sin ir en persona.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. La ruta `/dashboard/miembro/clases` muestra un calendario semanal con las clases del gym
2. Cada clase: nombre, hora, entrenador, espacio, N disponible / cupo, botón "Inscribirme"
3. Si ya está inscrito → botón "Cancelar inscripción"
4. Si clase llena → botón "Lista de espera" (Fase D)
5. Al inscribirse: `INSERT gym.inscripciones (clase_id, usuario_id, estado='inscrito')`
6. La "Mis próximas clases" en el dashboard del miembro se actualiza inmediatamente

---

---

## FASE C — ANALYTICS Y AUDITORÍA CONFIABLE
**Duración estimada**: Sprint 4 (~2 semanas)
**Objetivo**: El administrador toma decisiones con datos reales. Trazabilidad completa.
**Total SP estimados**: ~55 puntos

---

# ÉPICA 9 — ANALYTICS Y REPORTES (ANA)

---

## ANA-001 — NPS desde datos reales
**Como** Administrador General,
**quiero** que el widget de NPS en el dashboard muestre datos reales de la tabla nps_surveys
**para que** mis decisiones de retención se basen en datos reales y no en un número inventado.

**Prioridad**: P1 | **SP**: 3
**Resolves**: GAP-M05 · G-05 (NPS hardcodeado)
**Depende de**: SEG-012 (tabla nps_surveys)

**Criterios de aceptación:**
1. El widget de NPS en el dashboard del Admin lee el promedio real de `public.nps_surveys` del tenant
2. Si hay < 5 respuestas → muestra "Sin datos suficientes de NPS (necesitas al menos 5 respuestas)"
3. Si no hay tabla poblada → no muestra el número 72 hardcodeado bajo ninguna circunstancia
4. El promedio se calcula: `AVG(score)` WHERE `tenant_id = fn_current_tenant_id()` AND `created_at > now() - interval '90 days'`
5. El widget muestra: N/N Promotores/Detractores + Score NPS = Promotores% - Detractores%

---

## ANA-002 — Panel de Churn con acciones directas
**Como** Administrador General,
**quiero** que el widget de churn tenga botones de intervención directa para cada miembro en riesgo
**para que** pueda actuar sobre el churn desde el dashboard sin navegar a otras páginas.

**Prioridad**: P1 | **SP**: 5
**Resolves**: G-04 (Churn Prediction sin frontend de acción)
**Infraestructura**: ✅ `churn_predictions` existe con scores

**Criterios de aceptación:**
1. El widget de Churn Risk muestra el Top 5 de miembros con mayor score
2. Cada fila: avatar + nombre + score badge + "último acceso hace N días" + botón "Intervenir"
3. El botón "Intervenir" en Fase C: abre modal con opciones de acción manual ("Llamar", "Añadir nota", "Aplicar descuento")
4. En Fase D: el botón dispara una push notification al miembro
5. Si score = NULL (sin predicción) → no aparece en la lista
6. Link "Ver todos (N miembros)" → navega a `/admin/miembros?filter=churn-high`

---

## ANA-003 — Reporte financiero con gráficos y exportación
**Como** Administrador General,
**quiero** ver el reporte financiero del gym con gráficos de tendencia y poder exportarlo
**para que** pueda presentar el desempeño del negocio a socios o tomar decisiones de pricing.

**Prioridad**: P1 | **SP**: 8

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/reportes` con Tab "Financiero" muestra:
   - Ingresos por mes (últimos 12 meses) — gráfico de barras
   - Distribución por plan (pie chart)
   - Ticket promedio del período
   - Proyección del mes en curso (basada en tendencia de los últimos 15 días)
2. Selector de período: 7d / 30d / 90d / 12m
3. Botón "Exportar CSV" — descarga todas las transacciones del período filtrado
4. Botón "Exportar PDF" — Fase D (reporte ejecutivo con gráficos)
5. Los gráficos usan una librería ligera (Recharts o Chart.js)
6. Hover en gráfico: tooltip con desglose por plan en ese período

---

## ANA-004 — Reporte de retención y churn
**Como** Administrador General,
**quiero** ver la tasa de retención mensual y el análisis de churn histórico
**para que** pueda evaluar si mis acciones de retención están funcionando.

**Prioridad**: P1 | **SP**: 5
**Depende de**: ANA-003

**Criterios de aceptación:**
1. Tab "Retención" en `/dashboard/admin/reportes` con:
   - Tasa de retención mensual (%) — gráfico de líneas (12 meses)
   - Altas vs Bajas netas por mes — gráfico de barras apiladas
   - Tabla Top 10 miembros con mayor riesgo de churn + último acceso
2. Las métricas se calculan desde `gym.membresias` y `churn_predictions`
3. Si el rango seleccionado no tiene datos suficientes → estado vacío descriptivo

---

## ANA-005 — Reporte de asistencia y mapa de calor
**Como** Administrador General,
**quiero** ver un mapa de calor de asistencia por día y hora
**para que** pueda optimizar el horario de clases y de staff según el tráfico real.

**Prioridad**: P2 | **SP**: 8
**Depende de**: ANA-003

**Criterios de aceptación:**
1. Tab "Asistencia" con mapa de calor: eje X = horas (6am-10pm) / eje Y = días de la semana
2. El color del celda va de blanco (0 accesos) a azul oscuro (máximo de accesos en ese slot)
3. Hover: "N accesos los [día] a las [hora]"
4. Período seleccionable: última semana / último mes / último trimestre
5. Clases más populares del período (tabla con % de ocupación y tasa de asistencia real)
6. Entrenador con mayor ocupación promedio en sus clases

---

---

# ÉPICA 10 — AUDITORÍA (AUD)

---

## AUD-001 — Visor de audit_logs con filtros
**Como** Administrador General,
**quiero** ver el log de auditoría del gym con filtros por actor, tipo de acción y fecha
**para que** pueda investigar incidentes y verificar la actividad del personal.

**Prioridad**: P1 | **SP**: 8
**Resolves**: GAP-B04 · G-10
**Depende de**: SEG-011 (triggers de audit_logs completos)
**Infraestructura**: ✅ `public.audit_logs` existe

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/auditoria` carga los eventos de `audit_logs` del tenant
2. Filtros: por actor (buscar trabajador) / tipo de acción (selector múltiple) / módulo / rango de fechas
3. Columnas: Timestamp / Actor (avatar+nombre+rol) / Acción (descripción legible en español) / Módulo (badge) / Detalle (ícono)
4. Los tipos de acción se muestran en español: "ROLE_REVOKED" → "Revocó acceso"
5. Al hacer clic en una fila → modal con `old_data` y `new_data` del registro
6. KPIs en el header: Eventos hoy / Acciones críticas / Actores activos hoy
7. La página verifica `fn_has_permission('gym.reportes.ver')`
8. Paginación de 50 eventos, ordenados por `created_at DESC`

**Nuevo servicio**: `services/audit.service.ts` con `getAuditLogs(tenantId, filters)`

---

## AUD-002 — Exportar audit log como CSV
**Como** Administrador General,
**quiero** poder exportar el audit log filtrado como CSV
**para que** pueda compartirlo con auditores o analizarlo en una hoja de cálculo.

**Prioridad**: P2 | **SP**: 3
**Depende de**: AUD-001

**Criterios de aceptación:**
1. Botón "Exportar CSV" en la página de auditoría (filtros activos se respetan)
2. Nombre del archivo: `gymsos-auditoria-[gym_nombre]-[fecha_inicio]-[fecha_fin].csv`
3. Columnas del CSV: timestamp, actor_nombre, actor_rol, accion, modulo, descripcion, old_data (JSON), new_data (JSON)
4. Preview antes de exportar: "N registros encontrados con estos filtros. ¿Descargar?"
5. La exportación es una Server Action (no expone la BD directamente al cliente)

---

## AUD-003 — Widget de roles próximos a expirar en dashboard Admin
**Como** Administrador General,
**quiero** ver en el dashboard principal cuántos roles de trabajadores expiran en los próximos 7 días
**para que** pueda renovarlos antes de que el trabajador pierda acceso inesperadamente.

**Prioridad**: P2 | **SP**: 3
**Depende de**: STF-001

**Criterios de aceptación:**
1. Widget en el dashboard del Admin: "N roles expiran en los próximos 7 días"
2. Al hacer clic: lista con nombre del trabajador + rol + fecha de expiración
3. Botón "Reactivar" en cada fila (ejecuta la misma lógica que STF-007)
4. Si N = 0 → el widget no aparece (no es necesario mostrarlo)

---

---

# ÉPICA 11 — CONFIGURACIÓN DEL GYM (CFG)

---

## CFG-001 — Editar datos del gimnasio
**Como** Administrador General,
**quiero** poder editar los datos del gimnasio (nombre, dirección, logo, RUC)
**para que** los datos del gym en el sistema sean siempre correctos.

**Prioridad**: P1 | **SP**: 5
**Resolves**: GAP-B05 · RF-029

**Criterios de aceptación:**
1. La ruta `/dashboard/admin/configuracion` con Tab "Datos del Gym" muestra el formulario
2. Campos: nombre, RUC, país, ciudad, dirección, teléfono, email, logo (upload)
3. Upload de logo: acepta PNG/JPG max 2MB, muestra preview antes de guardar
4. Al guardar: confirmación "¿Guardar los cambios en los datos del gym?"
5. Los cambios se guardan en `gym.gimnasios`
6. El cambio se registra en `audit_logs` con `GYM_CONFIG_UPDATED`
7. Toast de éxito + el logo del gym en el sidebar se actualiza inmediatamente

---

## CFG-002 — CRUD de planes de membresía
**Como** Administrador General,
**quiero** poder crear, editar y desactivar planes de membresía
**para que** los planes reflejen la oferta actual del gym.

**Prioridad**: P1 | **SP**: 8
**Resolves**: GAP-B06 · RF-030
**Infraestructura**: 🟡 `gym.planes` existe, sin UI completa

**Criterios de aceptación:**
1. Tab "Planes" en Configuración lista todos los planes del tenant
2. Cada plan en una card: nombre, precio, duración, número de miembros activos, estado (Activo/Inactivo)
3. Crear plan: modal con nombre + precio + duración + descripción + límite de clases por semana
4. Editar plan: mismo modal pre-cargado con los datos existentes
5. Desactivar plan: solo permitido si el plan NO tiene miembros activos. Si tiene → error: "Este plan tiene N miembros activos. Para desactivarlo, primero migra a los miembros a otro plan."
6. Eliminar plan: nunca permitido (soft delete via `is_active = false`)
7. Los cambios en planes no afectan retroactivamente las membresías existentes

---

## CFG-003 — Gestión de espacios y equipamiento
**Como** Administrador General,
**quiero** poder gestionar los espacios físicos del gym (salas, áreas)
**para que** las clases se puedan asignar a espacios reales con capacidad correcta.

**Prioridad**: P2 | **SP**: 5

**Criterios de aceptación:**
1. Tab "Espacios" en Configuración lista las salas/áreas del gym
2. Cada espacio: nombre, capacidad máxima, estado (Disponible/Mantenimiento)
3. Crear espacio: formulario con nombre + capacidad + descripción
4. Editar/desactivar espacio: no se puede desactivar si tiene clases activas asignadas
5. El número de espacios disponibles se refleja en el selector de espacio al crear/editar una clase

---

---

## FASE D — CICLO COMPLETO DEL MIEMBRO
**Duración estimada**: Sprint 5-6 (~2.5 semanas)
**Objetivo**: El miembro puede autogestionar su experiencia. El gym puede comunicarse proactivamente.
**Total SP estimados**: ~68 puntos

---

# ÉPICA 12 — EXPERIENCIA DEL MIEMBRO (MBM)

---

## MBM-001 — QR dinámico con UUID rotativo
**Como** sistema de control de accesos,
**quiero** que el QR del miembro use un UUID que rota cada 60 segundos
**para que** el QR no pueda ser reutilizado por otra persona después de ser fotografiado.

**Prioridad**: P1 | **SP**: 8
**Depende de**: ACC-001

**Criterios de aceptación:**
1. El QR del miembro no muestra su `user_id` directamente
2. El servidor genera un token firmado temporal (JWT de corta duración) con el `user_id` y `exp = now + 60s`
3. El componente del QR regenera el token automáticamente cada 55 segundos (5s antes de expirar)
4. El escáner QR valida el token: verifica la firma + verifica que no está expirado
5. Si el token expiró (miembro tardó en mostrar el QR) → regenerar automáticamente sin interacción
6. El QR funciona offline: el token generado previamente es válido hasta su expiración aunque el miembro no tenga conexión

---

## MBM-002 — Renovación de membresía autoasistida por el miembro
**Como** Miembro,
**quiero** poder renovar mi membresía directamente desde la app sin ir a la recepción
**para que** no tenga que interrumpir mi rutina para renovar.

**Prioridad**: P1 | **SP**: 8
**Depende de**: MBR-003 (RPC transaccional)

**Criterios de aceptación:**
1. La ruta `/dashboard/miembro/membresia` muestra botón "Renovar membresía" cuando estado = por vencer o vencida
2. Flujo: Seleccionar plan (con precios) → Seleccionar forma de pago → Confirmar
3. Fase D con Yape/Plin: el miembro genera un QR de pago Yape/Plin y confirma manualmente
4. Fase E con Stripe: pago automático con tarjeta
5. Al confirmar el pago: llama a `rpc_registrar_nuevo_miembro` (o RPC de renovación similar)
6. Toast: "Membresía renovada hasta [fecha]. ¡Sigue así!"
7. El badge de membresía en el hero del dashboard se actualiza inmediatamente

---

## MBM-003 — Push notifications (Web Push VAPID)
**Como** sistema de comunicación,
**quiero** poder enviar notificaciones push a los miembros
**para que** puedan recibir recordatorios y comunicaciones importantes.

**Prioridad**: P1 | **SP**: 13
**Depende de**: MBM-001

**Criterios de aceptación:**
1. El servicio usa Web Push con VAPID keys configuradas en el servidor
2. Los miembros pueden suscribirse a notificaciones desde el dashboard (con su permiso del navegador)
3. El sistema puede enviar push desde el servidor (Server Action o Edge Function)
4. La suscripción del miembro se guarda en `public.push_subscriptions` (tabla nueva en migración 019)
5. Las notificaciones funcionan cuando la app está en background o cerrada (si el navegador lo soporta)
6. El miembro puede desuscribirse desde Configuración de su perfil

---

## MBM-004 — Notificación "Tu membresía vence en 5 días"
**Como** sistema de retención,
**quiero** enviar automáticamente una push notification cuando la membresía de un miembro vence en 5 días
**para que** el miembro recuerde renovar antes de perder acceso.

**Prioridad**: P1 | **SP**: 5
**Depende de**: MBM-003

**Criterios de aceptación:**
1. Un scheduled job (Supabase Edge Function o pg_cron) se ejecuta diariamente a las 9am
2. Encuentra todos los miembros con `gym.membresias.fecha_fin = CURRENT_DATE + 5 days AND estado = 'activa'`
3. Para cada miembro encontrado: envía push notification con título "Tu membresía vence en 5 días"
4. El mensaje incluye un CTA: "Renueva ahora →" que abre `/dashboard/miembro/membresia`
5. La notificación se registra en `audit_logs` (o tabla de notificaciones enviadas)
6. No se envía si el miembro ya tiene una notificación de este tipo enviada en las últimas 24h

---

## MBM-005 — Notificación de intervención de churn
**Como** sistema de retención proactiva,
**quiero** enviar una push notification a los miembros con churn score crítico que llevan X días sin visitar
**para que** el gym pueda reconectarse con miembros en riesgo antes de que abandonen.

**Prioridad**: P1 | **SP**: 5
**Depende de**: MBM-003

**Criterios de aceptación:**
1. El trigger: miembro con `churn_predictions.score > 0.7` Y sin acceso en los últimos 14 días
2. Mensaje personalizado: "¡Hola [Nombre]! Llevas un tiempo sin visitarnos. Te esperamos 💪"
3. La notificación se envía máximo 1 vez cada 7 días por miembro
4. El administrador puede ver en el dashboard cuántas intervenciones se enviaron y cuántas resultaron en visita
5. El miembro puede desactivar estas notificaciones desde su perfil

---

## MBM-006 — Historial de visitas y estadísticas del miembro
**Como** Miembro,
**quiero** ver mi historial de visitas al gym con estadísticas básicas
**para que** pueda monitorear mi consistencia de entrenamiento.

**Prioridad**: P1 | **SP**: 5

**Criterios de aceptación:**
1. La ruta `/dashboard/miembro/progreso` muestra estadísticas del miembro
2. Gráfico de visitas por semana (últimas 12 semanas)
3. Estadísticas: Visitas este mes / Racha actual (días consecutivos) / Mes con más visitas
4. Tabla de últimos 20 accesos: fecha, hora, tipo (entrada/salida si aplica)
5. Los datos son filtrados por RLS: el miembro solo ve SUS propios accesos
6. Estado vacío: "Aún no tienes visitas registradas. ¡Empieza hoy!"

---

---

# ÉPICA 13 — NUTRICIÓN Y EVALUACIONES (NUT)

---

## NUT-001 — Lista de pacientes del nutricionista
**Como** Nutricionista,
**quiero** ver mi lista de pacientes asignados con el estado de su plan nutricional
**para que** pueda identificar quién necesita atención urgente.

**Prioridad**: P2 | **SP**: 5
**Infraestructura**: 🟡 UI con mocks, tablas a confirmar

**Criterios de aceptación:**
1. La ruta `/dashboard/nutricionista` muestra los pacientes asignados al nutricionista autenticado
2. Columnas: Nombre / Plan activo (Sí/No) / Última evaluación (hace N días) / Próxima revisión
3. Ordenada por urgencia: sin plan primero, luego por días sin evaluación DESC
4. Banner de alerta: "N pacientes sin plan activo" y "N pacientes sin evaluación en +30 días"
5. Filtro: Con plan / Sin plan / Con evaluación pendiente

---

## NUT-002 — Crear plan nutricional para paciente
**Como** Nutricionista,
**quiero** crear un plan nutricional completo para un paciente
**para que** tenga una guía alimenticia personalizada.

**Prioridad**: P2 | **SP**: 13

**Criterios de aceptación:**
1. La ruta `/dashboard/nutricionista/planes/nuevo?paciente=[id]` muestra el formulario de plan
2. Formulario en pasos: Objetivos → Parámetros → Comidas del día → Revisión
3. Parámetros: calorías diarias objetivo, % proteínas/carbos/grasas, hidratación, número de comidas
4. Comidas: acordeón expandible por cada comida del día con lista de alimentos y cantidades
5. Auto-save cada 30 segundos (guarda borrador)
6. Publicar plan: activa el plan y se vincula al paciente como plan activo
7. El paciente puede ver su plan en su perfil (Fase E — cuando el miembro tenga acceso a nutrición)

---

## NUT-003 — Registrar evaluación nutricional
**Como** Nutricionista,
**quiero** registrar la evaluación nutricional de un paciente
**para que** pueda hacer seguimiento de su evolución.

**Prioridad**: P2 | **SP**: 5

**Criterios de aceptación:**
1. Formulario: peso (kg), talla (cm), IMC (calculado automáticamente), % grasa, medidas corporales, observaciones, fecha
2. La evaluación se vincula al paciente y al nutricionista
3. El historial de evaluaciones del paciente muestra la evolución con un mini gráfico de IMC
4. Si IMC > 30 o < 18.5 → alerta visual en el registro (solo informativa para el profesional)

---

## NUT-004 — Evaluaciones físicas del Entrenador
**Como** Entrenador,
**quiero** registrar evaluaciones físicas de mis clientes
**para que** pueda hacer seguimiento de su progreso de entrenamiento.

**Prioridad**: P2 | **SP**: 5

**Criterios de aceptación:**
1. La ruta `/dashboard/entrenador/evaluaciones` muestra las evaluaciones del entrenador
2. Tabs: Pendientes de registrar / Historial por cliente
3. Formulario de evaluación: peso, talla, IMC, % graso, observaciones, fecha
4. Historial por cliente: gráfico de evolución de peso e IMC
5. El badge "Evaluación pendiente" en la tabla de clientes desaparece al registrar una nueva

---

---

## FASE E — IA, ESCALABILIDAD Y DIFERENCIACIÓN
**Duración estimada**: Sprint 7-10 (~4 semanas)
**Objetivo**: Activar los diferenciadores de GYMsos que crean el data moat.
**Total SP estimados**: ~95 puntos

---

# ÉPICA 14 — IA Y DIFERENCIADORES (IA)

---

## IA-001 — Configurar Gemini API en Configuración del Gym
**Como** Administrador General,
**quiero** poder conectar el gym a Gemini AI desde la pantalla de configuración
**para que** las features de IA se activen sin necesidad de intervención técnica.

**Prioridad**: P1 | **SP**: 5
**Depende de**: CFG-001

**Criterios de aceptación:**
1. Tab "Integraciones" en Configuración muestra el estado de la integración con Gemini AI
2. Formulario: campo para la API Key + botón "Verificar conexión"
3. Al verificar: hace una llamada de prueba a la API y retorna "Conexión exitosa" o error
4. La API Key se guarda cifrada en la BD (no en texto plano)
5. Una vez conectada: el widget de churn en el dashboard muestra predicciones activas

---

## IA-002 — Churn interventions automáticas con IA
**Como** sistema de retención,
**quiero** que Gemini AI genere mensajes de intervención personalizados para miembros en riesgo
**para que** el mensaje sea más efectivo que uno genérico.

**Prioridad**: P1 | **SP**: 8
**Depende de**: IA-001, MBM-003

**Criterios de aceptación:**
1. Para miembros con `churn_score > 0.7`, el sistema genera un mensaje personalizado via Gemini
2. El mensaje considera: días sin visitar, clase favorita, historial del miembro
3. El admin puede revisar el mensaje propuesto antes de enviarlo (no automático en primera instancia)
4. Métrica de efectividad: % de miembros que visitaron el gym en 7 días post-intervención

---

## IA-003 — Recomendaciones IA de workout para el Miembro
**Como** Miembro,
**quiero** recibir recomendaciones de rutinas de entrenamiento personalizadas
**para que** mis sesiones sean más efectivas.

**Prioridad**: P1 | **SP**: 8
**Depende de**: IA-001

**Criterios de aceptación:**
1. Sección "Mi Rutina Sugerida" en `/dashboard/miembro/progreso` (Fase E)
2. La recomendación considera: historial de clases asistidas, evaluaciones físicas, objetivos declarados
3. Se genera máximo una vez por semana para no saturar al miembro
4. El miembro puede indicar si la recomendación fue útil (feedback para el modelo)

---

## IA-004 — Gamificación MVP: XP + niveles + racha
**Como** Miembro,
**quiero** ganar puntos de experiencia (XP) por cada visita al gym
**para que** sentir progreso y motivación adicional para mantener mi rutina.

**Prioridad**: P2 | **SP**: 13
**Infraestructura**: ✅ `gamification_xp`, `levels` tablas existen en BD

**Criterios de aceptación:**
1. Cada visita al gym (acceso registrado): +10 XP
2. Cada clase asistida: +20 XP adicionales
3. Racha de 7 días: bonus de +50 XP
4. Niveles visibles en el perfil: Principiante (0-500 XP) → Intermedio (501-2000 XP) → Avanzado (2001-5000 XP) → Elite (5000+)
5. El QR del miembro muestra el nivel actual junto al nombre
6. El dashboard del miembro muestra: XP acumulado + nivel + progreso al siguiente nivel (barra)
7. La barra de stats rápidas del miembro incluye: "Racha actual: N días" y "Nivel: [nombre]"

---

---

# ÉPICA 15 — ESCALABILIDAD SAAS (SAS)

---

## SAS-001 — Panel super-admin para gestionar múltiples gymnásios
**Como** platform_admin (el equipo de GYMsos),
**quiero** una pantalla para crear y gestionar todos los gymnásios del sistema
**para que** pueda operar el SaaS sin tener que acceder directamente a la base de datos.

**Prioridad**: P1 | **SP**: 13
**Resolves**: DA-05 del Blueprint

**Criterios de aceptación:**
1. La ruta `/admin/gyms` existe y solo es accesible para el rol `platform_admin`
2. Lista de todos los tenants en el sistema: nombre, plan, estado, licencias usadas, fecha de alta
3. Formulario para crear un nuevo gimnasio (crea el tenant + admin del gym)
4. Acciones: Ver detalles / Suspender gym / Cambiar plan / Ver audit logs del tenant
5. El rol `platform_admin` es cross-tenant y usa `service_role` de Supabase — no tiene RLS normal
6. CADA acción del platform_admin queda registrada en un log separado (audit especial cross-tenant)
7. El acceso a esta ruta requiere autenticación multifactor (Fase E)

---

## SAS-002 — Validación de suscripción activa del gym en el middleware
**Como** sistema de monetización,
**quiero** que el middleware verifique el estado de la suscripción del gym antes de permitir acceso
**para que** un gym con suscripción suspendida no pueda usar el sistema.

**Prioridad**: P2 | **SP**: 8
**Depende de**: SAS-001

**Criterios de aceptación:**
1. El middleware verifica `public.tenants.status_financial_id` para el tenant del usuario
2. Si `status = 'FIN-SUSPENDED'` → redirige a una página de "Suscripción suspendida. Regulariza el pago."
3. Si `status = 'FIN-ACTIVE'` → acceso normal
4. El rol `platform_admin` nunca es bloqueado por esta validación
5. El bloqueo solo aplica a rutas de dashboard (no a `/login`)

---

## SAS-003 — Integración Stripe para pagos digitales
**Como** Cajero / Miembro (Fase E),
**quiero** poder procesar pagos con tarjeta de crédito/débito
**para que** el gym no dependa exclusivamente del efectivo.

**Prioridad**: P2 | **SP**: 21 (descomponer antes de implementar)
**Depende de**: MBM-002 (flujo de renovación), CFG-001 (configuración de integraciones)

**Criterios de aceptación de alto nivel (a descomponer en sub-historias):**
1. El admin puede configurar las credenciales de Stripe desde Configuración > Integraciones
2. Al renovar membresía, el miembro puede pagar con tarjeta (Stripe Checkout o Payment Element)
3. El pago se registra automáticamente en `gym.pagos` cuando Stripe confirma el cobro (webhook)
4. Los reembolsos se procesan desde el dashboard del admin (solo Admin puede reembolsar)
5. El sistema cumple PCI DSS (los datos de tarjeta nunca pasan por el servidor de GYMsos — solo Stripe)

---

## SAS-004 — Refactoring: extraer analytics.service del God Service
**Como** desarrollador,
**quiero** extraer las responsabilidades de analytics de `dashboard.service` a un `analytics.service` separado
**para que** el código sea mantenible y testeable.

**Prioridad**: P2 | **SP**: 8
**Resolves**: G-07 (God Service en dashboard.service)

**Criterios de aceptación:**
1. `analytics.service.ts` existe con funciones: `getKPIsDashboard()`, `getChurnAtRisk()`, `getRetencionMensual()`, `getIngresosPorMes()`
2. `dashboard.service.ts` delega en `analytics.service` — no llama directamente a 5+ tablas
3. Los tests unitarios pueden testear `analytics.service` de forma aislada
4. Sin regresión en el comportamiento del dashboard

---

## SAS-005 — Migración 019: RPC fn_validate_staff_code desacoplado
**Como** frontend,
**quiero** validar un staff_code sin necesitar pasar el tenant_id desde el cliente
**para que** el modelo interno de tenants no esté expuesto al cliente.

**Prioridad**: P2 | **SP**: 3
**Resolves**: GAP-L04 · Deuda Técnica DT-08

**Criterios de aceptación:**
1. Nueva RPC `fn_validate_staff_code(p_code TEXT, p_gym_id UUID)` que:
   - Busca el código por su valor
   - Verifica internamente que el código pertenece al gym especificado (sin que el frontend pase tenant_id)
   - Retorna `{ valid: boolean, role_name: string, error: string? }`
2. El frontend del signup llama a esta RPC en lugar de `fn_validate_code(p_code, p_tenant_id)`
3. El `tenant_id` nunca se envía desde el cliente en el flujo de validación de código

---

## SAS-006 — Roles personalizados del gym (is_system_role = false)
**Como** Administrador General,
**quiero** poder crear roles personalizados para mi gym
**para que** pueda adaptare el sistema a roles especiales de mi negocio (ej: "Médico Deportivo", "Community Manager").

**Prioridad**: P3 | **SP**: 13
**Depende de**: AUD-001 (auditría de cambios de permisos), SAS-001

**Criterios de aceptación:**
1. El admin puede crear un nuevo rol desde `/admin/staff/roles` con nombre + descripción
2. El rol se crea en `public.roles` con `is_system_role = false` y `tenant_id` del gym
3. El admin puede asignar permisos al rol custom desde la matriz de permisos
4. Los roles custom son visibles en el selector al generar códigos de invitación
5. Los roles custom no pueden tener `hierarchy_level < 10` (no pueden ser más altos que Supervisor)
6. Los 7 roles de sistema (is_system_role = true) no pueden ser editados ni eliminados

---

---

# RESUMEN EJECUTIVO DEL BACKLOG

## Tabla de todas las historias por fase y épica

| ID | Historia | Épica | Fase | P | SP | Depende de |
|----|---------|-------|------|---|-----|------------|
| SEG-001 | JWT claim para rol | SEG | A | P0 | 5 | — |
| SEG-002 | Middleware lee JWT | SEG | A | P0 | 3 | SEG-001 |
| SEG-003 | role_dashboard_map | SEG | A | P1 | 2 | SEG-002 |
| SEG-004 | Supervisor y cajero en routing | SEG | A | P0 | 2 | SEG-003 |
| SEG-005 | Deprecar rol cliente | SEG | A | P1 | 2 | SEG-003 |
| SEG-006 | Validación UUID en QR | SEG | A | P0 | 2 | — |
| SEG-007 | Migración 018: permisos staff | SEG | A | P0 | 3 | — |
| SEG-008 | Migración 018: max_licenses | SEG | A | P0 | 5 | SEG-007 |
| SEG-009 | Migración 018: campos revocación | SEG | A | P0 | 3 | SEG-007 |
| SEG-010 | Migración 018: RLS accesos miembro | SEG | A | P0 | 3 | — |
| SEG-011 | Migración 018: triggers audit | SEG | A | P1 | 8 | SEG-007 |
| SEG-012 | Migración 018: tabla nps_surveys | SEG | A | P1 | 2 | — |
| SEG-013 | Migración 018: gym.pagos.crear para Recepcionista | SEG | A | P1 | 2 | SEG-007 |
| ROL-001 | Dashboard Supervisor MVp | ROL | A | P1 | 5 | SEG-004 |
| ROL-002 | Dashboard Cajero MVP | ROL | A | P1 | 5 | SEG-004 |
| ROL-003 | Sidebar dinámico por permisos | ROL | A | P1 | 5 | SEG-002, SEG-007 |
| STF-001 | Lista trabajadores activos | STF | B | P0 | 8 | SEG-007 |
| STF-002 | Filtros en tabla de staff | STF | B | P1 | 3 | STF-001 |
| STF-003 | Drawer de detalle del trabajador | STF | B | P1 | 8 | STF-001 |
| STF-004 | Modal cambio de rol | STF | B | P1 | 8 | STF-001, SEG-001 |
| STF-005 | Suspensión temporal | STF | B | P1 | 5 | STF-001, SEG-009 |
| STF-006 | Revocación definitiva | STF | B | P0 | 8 | STF-001, SEG-009 |
| STF-007 | Reactivar trabajador | STF | B | P2 | 3 | STF-005 |
| STF-008 | Widget KPIs de licencias | STF | B | P1 | 3 | STF-001, SEG-008 |
| COD-001 | Historial de códigos (Tab 3) | COD | B | P1 | 8 | STF-001 |
| COD-002 | Revocar código activo | COD | B | P1 | 3 | COD-001 |
| COD-003 | Notif. al admin cuando código es usado | COD | B | P2 | 5 | SEG-011, COD-001 |
| MBR-001 | Lista de miembros con filtros | MBR | B | P0 | 8 | — |
| MBR-002 | Perfil completo del miembro | MBR | B | P1 | 8 | MBR-001 |
| MBR-003 | RPC transaccional registro miembro | MBR | B | P0 | 8 | — |
| MBR-004 | Formulario registro nuevo miembro | MBR | B | P1 | 8 | MBR-003 |
| MBR-005 | Cancelar membresía | MBR | B | P1 | 5 | MBR-002 |
| MEM-001 | Card cobro rápido Cajero | MEM | B | P0 | 8 | ROL-002 |
| MEM-002 | Lista membresías por cobrar | MEM | B | P1 | 5 | ROL-002 |
| MEM-003 | Historial pagos del gym | MEM | B | P1 | 5 | — |
| ACC-001 | Control acceso LIVE Realtime | ACC | B | P1 | 8 | SEG-006 |
| ACC-002 | Registro de acceso manual | ACC | B | P1 | 5 | ACC-001 |
| CLS-001 | Agenda semanal Admin | CLS | B | P1 | 5 | — |
| CLS-002 | Agenda del día Entrenador | CLS | B | P1 | 5 | — |
| CLS-003 | Tomar asistencia en clase | CLS | B | P1 | 5 | CLS-002 |
| CLS-004 | Inscripción a clase desde Recepcionista | CLS | B | P1 | 5 | CLS-001 |
| CLS-005 | Clases disponibles para el Miembro | CLS | B | P1 | 5 | CLS-001 |
| ANA-001 | NPS desde datos reales | ANA | C | P1 | 3 | SEG-012 |
| ANA-002 | Panel Churn con acciones | ANA | C | P1 | 5 | — |
| ANA-003 | Reporte financiero + exportación | ANA | C | P1 | 8 | — |
| ANA-004 | Reporte retención y churn | ANA | C | P1 | 5 | ANA-003 |
| ANA-005 | Reporte asistencia mapa de calor | ANA | C | P2 | 8 | ANA-003 |
| AUD-001 | Visor audit_logs con filtros | AUD | C | P1 | 8 | SEG-011 |
| AUD-002 | Exportar audit log CSV | AUD | C | P2 | 3 | AUD-001 |
| AUD-003 | Widget roles próximos a expirar | AUD | C | P2 | 3 | STF-001 |
| CFG-001 | Editar datos del gym | CFG | C | P1 | 5 | — |
| CFG-002 | CRUD planes de membresía | CFG | C | P1 | 8 | — |
| CFG-003 | Gestión espacios y equipamiento | CFG | C | P2 | 5 | — |
| MBM-001 | QR dinámico rotativo | MBM | D | P1 | 8 | ACC-001 |
| MBM-002 | Renovación autoasistida membresía | MBM | D | P1 | 8 | MBR-003 |
| MBM-003 | Web Push VAPID infraestructura | MBM | D | P1 | 13 | MBM-001 |
| MBM-004 | Push: membresía vence en 5 días | MBM | D | P1 | 5 | MBM-003 |
| MBM-005 | Push: intervención de churn | MBM | D | P1 | 5 | MBM-003 |
| MBM-006 | Historial visitas y estadísticas | MBM | D | P1 | 5 | — |
| NUT-001 | Lista de pacientes nutricionista | NUT | D | P2 | 5 | — |
| NUT-002 | Crear plan nutricional | NUT | D | P2 | 13 | NUT-001 |
| NUT-003 | Registrar evaluación nutricional | NUT | D | P2 | 5 | NUT-001 |
| NUT-004 | Evaluaciones físicas Entrenador | NUT | D | P2 | 5 | CLS-002 |
| IA-001 | Configurar Gemini API | IA | E | P1 | 5 | CFG-001 |
| IA-002 | Churn interventions con IA | IA | E | P1 | 8 | IA-001, MBM-003 |
| IA-003 | Recomendaciones workout IA | IA | E | P1 | 8 | IA-001 |
| IA-004 | Gamificación MVP: XP + niveles | IA | E | P2 | 13 | — |
| SAS-001 | Panel super-admin multi-gym | SAS | E | P1 | 13 | — |
| SAS-002 | Validación suscripción gym middleware | SAS | E | P2 | 8 | SAS-001 |
| SAS-003 | Integración Stripe | SAS | E | P2 | 21 | MBM-002, CFG-001 |
| SAS-004 | Refactoring God Service | SAS | E | P2 | 8 | — |
| SAS-005 | Migración 019: fn_validate_staff_code | SAS | E | P2 | 3 | — |
| SAS-006 | Roles personalizados del gym | SAS | E | P3 | 13 | AUD-001, SAS-001 |

---

## Totales por fase

| Fase | Historias | SP Totales | Duración estimada |
|------|-----------|-----------|-------------------|
| A — Seguridad | 16 | 65 | ~2 semanas (Sprint 1) |
| B — Operaciones | 29 | 152 | ~3 semanas (Sprint 2-3) |
| C — Analytics | 11 | 58 | ~2 semanas (Sprint 4) |
| D — Miembro | 10 | 69 | ~2.5 semanas (Sprint 5-6) |
| E — IA + Escala | 10 | 100 | ~4 semanas (Sprint 7-10) |
| **TOTAL** | **76** | **444** | **~14 semanas** |

*Asumiendo un equipo de 2-3 desarrolladores capaces de ~30-35 SP por sprint de 2 semanas.*

---
