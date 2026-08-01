# ESPECIFICACIÓN UX/UI — PARTE 3
## FASE 4 — DASHBOARDS COMPLETOS POR ROL

---

# DASHBOARD 1 — ADMINISTRADOR GENERAL

Documentado completamente en Parte 2 (Página AD-01).

**Resumen ejecutivo del dashboard:**
- **Objetivo de la sesión**: "¿Está el negocio bien hoy?" + alertas de acción urgente
- **Tiempo objetivo para responder**: ≤ 30 segundos desde que carga
- **Contenido total sin scroll**: 5 KPI cards + cabecera con acciones rápidas
- **Contenido con 1 scroll**: 2 gráficos
- **Contenido con 2 scrolls**: 4 widgets adicionales (vencimientos, churn, clases, transacciones, staff)

**Por qué cada elemento existe:**

| Elemento | Razón de existir |
|----------|-----------------|
| Ingresos del día | El dueño necesita saber si el negocio está generando dinero hoy vs ayer |
| Accesos del día | Indica si el gym está siendo usado. Correlaciona con retención |
| Membresías activas | Métrica de salud del negocio. Caída = problema |
| Churn risk | Los miembros se van antes de que el gym lo note. Esta alerta permite actuar |
| Staff activo | El dueño delega. Necesita saber si su equipo está en el puesto |
| Gráfico ingresos | Contexto histórico para decisiones. "¿Esto es normal para junio?" |
| Gráfico accesos/hora | Para decisiones de horario de staff y clases |
| Membresías por vencer | Acción urgente con alto retorno: una renovación es S/ 180 |
| Churn list | Intervención proactiva con alto ROI: retener es más barato que adquirir |
| Clases de hoy | Operación diaria — saber si hay alguna cancelación |
| Últimas transacciones | Confirmar que la caja está activa |
| Staff del día | Cierre del loop de "¿está mi equipo trabajando?" |

---

# DASHBOARD 2 — SUPERVISOR

**URL**: `/dashboard/supervisor`

**Objetivo de la sesión**: Asegurar que el turno opera sin incidencias. No tomar decisiones estratégicas — ejecutar decisiones operativas que el recepcionista y cajero no pueden tomar.

**Header KPIs (4 cards):**

| Card | Fuente de datos | Por qué está aquí |
|------|----------------|------------------|
| Accesos del turno | `gym.accesos` WHERE hora >= turno_inicio | El supervisor mide su turno, no el día completo |
| Membresías procesadas hoy | `gym.membresias` WHERE updated_at = hoy | Indica actividad comercial del turno |
| Clases activas ahora | `gym.clases` WHERE hora_fin > now() AND hora_inicio < now() | Visibilidad operativa |
| Incidencias pendientes | COUNT de accesos denegados sin resolver + renovaciones pendientes de aprobación | La métrica de trabajo del supervisor |

**Zona principal — Acciones del turno (50/50):**

**Izquierda — Membresías por resolver hoy:**
- Tabla: Nombre del miembro, plan que vence, monto, estado
- Acciones: [Aprobar renovación estándar] [Aprobar con descuento X%] [Derivar al cajero]
- Badge en el header: "5 membresías por resolver"
- Filtro rápido: Vencen hoy / Vencidas hace 1-3 días / Vencidas hace más de 3 días

**Derecha — Accesos denegados del turno:**
- Tabla: Hora, Miembro, Motivo de denegación (vencida / suspendida / sin membresía)
- Acciones: [Autorizar excepción manual] [Ver perfil del miembro]
- Cada fila: badge con el número de intento (1er intento / 2do intento / ...)
- "Autorizar excepción" requiere ingresar motivo y queda registrado en audit_logs

**Zona secundaria — Supervisión del personal:**
- Lista de staff del turno: avatar + nombre + rol + última acción registrada + hace cuánto tiempo
- Alerta automática: si un recepcionista lleva > 20 minutos sin registrar ningún acceso durante hora pico → badge naranja
- Acciones: [Ver actividad completa] (abre drawer con timeline)

**Zona inferior — Agenda de clases:**
- Timeline de clases del día con estado: Próxima / En curso / Completada / Cancelada
- Barra de ocupación por clase
- Acción contextual: [Abrir cupo extra] si clase en curso tiene lista de espera

**Sidebar del Supervisor** (documentado en Fase 2):
- Su sidebar NO incluye: Auditoría, Configuración, Reportes estratégicos, Creación de códigos de staff

**Alertas específicas del Supervisor:**

| Tipo de alerta | Trigger | Acción sugerida |
|---------------|---------|-----------------|
| Recepcionista inactiva | Sin registrar acceso en 20min durante hora pico | "Ver estado del personal" |
| Clase por iniciar sin docente | Entrenador no ha iniciado clase en primeros 5 min | "Contactar entrenador" (Fase D) |
| Aforo al 95% | gym.accesos activos / capacidad > 0.95 | "Monitorear aforo" |
| Equipo reportado con falla | Registro en gym.equipos con estado='falla' | "Ver reporte" |

---

# DASHBOARD 3 — CAJERO

**URL**: `/dashboard/cajero`

**Objetivo de la sesión**: Procesar el máximo de cobros con el mínimo de clics posibles. **Cero distracción**.

**Principio de diseño**: Esta pantalla es un POS (Point of Sale) simplificado. La interfaz debe ser tan simple que un cajero nuevo pueda usarla sin entrenamiento.

**Header KPIs (3 cards):**

| Card | Fuente | Por qué |
|------|--------|---------|
| Total cobrado (turno) | SUM de pagos WHERE procesado_por = user_id AND created_at > turno_inicio | El cajero mide su propio desempeño por turno |
| N° de transacciones | COUNT pagos del turno | Métr rica de actividad |
| Membresías pendientes | COUNT membresias WHERE fecha_fin <= hoy+1 AND estado != 'vencida_pagada' | Trabajo que tiene que hacer hoy |

**Zona central — Acción de cobro (elemento dominante):**

Barra de búsqueda ocupa el 50% del ancho visible, centrada verticalmente en la pantalla superior:

```
┌────────────────────────────────────────────────────────┐
│  🔍  Buscar miembro por nombre, email o documento...   │
│      (Enter para buscar · 300ms debounce)              │
└────────────────────────────────────────────────────────┘
```

**Al seleccionar un miembro — Card de cobro inmediato:**

```
┌──────────────────────────────────────────────────────────┐
│  [Foto]  María González                [× cerrar]        │
│          DNI: 12345678                                   │
│                                                          │
│  Estado membresía: ⚠️ Vencida hace 2 días               │
│  Plan anterior: Mensual Estándar (S/ 150)                │
│                                                          │
│  ─────────── Renovar membresía ───────────               │
│  Plan:  [Mensual Estándar ▼]  (S/ 150)                  │
│  Forma de pago: [Efectivo ▼]                             │
│                                                          │
│  [  REGISTRAR PAGO S/ 150  ]  ← botón grande            │
│                                                          │
│  [Ver historial de pagos]                                │
└──────────────────────────────────────────────────────────┘
```

**Formas de pago disponibles en el selector:**
Efectivo / Yape / Plin / Transferencia bancaria / Tarjeta (Fase E con Stripe)

**Confirmación post-pago:**
```
✅ Pago registrado exitosamente
   María González · Mensual Estándar · S/ 150 · Efectivo
   Nueva fecha de vencimiento: 03 Jul 2026
   [Nuevo cobro]
```
(Auto-cierra en 3 segundos y limpia la pantalla para el siguiente miembro)

**Panel derecho (30% del ancho) — Caja del turno:**

- Total S/ del turno (número grande)
- Desglose por forma de pago: Efectivo S/ X | Yape S/ X | etc.
- Lista de últimas 10 transacciones (compacta): nombre + monto + hora

**Comportamiento especial del sidebar en Cajero:**
El sidebar puede estar colapsado por defecto (solo iconos, 64px) porque la pantalla central es la herramienta de trabajo. El cajero raramente necesita navegar a otras secciones.

**Por qué cada elemento existe:**

| Elemento | Razón |
|----------|-------|
| Búsqueda grande y prominente | El 90% de las interacciones empiezan por aquí. Reducir clics = reducir tiempo de cola |
| Card de cobro inmediato | No hay pantallas intermedias entre "busqué el miembro" y "registré el pago" |
| Selector de plan en el card | El miembro puede cambiar de plan al renovar. Debe ser fácil |
| Total del turno | El cajero quiere saber cómo va su jornada |
| Últimas 10 transacciones | Para verificar si el pago anterior se registró bien |

---

# DASHBOARD 4 — RECEPCIONISTA

**URL**: `/dashboard/recepcionista`

Documentado completamente en Parte 2 (Página RC-01 — Control de Acceso LIVE).

**Resumen del dashboard:**
- **Objetivo**: Control de flujo físico del gym en tiempo real
- **Elemento dominante**: Input de escaneo QR (siempre activo)
- **Actualización**: Tiempo real via Supabase Realtime
- **Dispositivo objetivo**: Tablet (la tablet del front desk)

**Por qué cada elemento existe:**

| Elemento | Razón |
|----------|-------|
| Input QR prominente | Es la acción de cada 60 segundos durante horas pico |
| Feedback visual inmediato | No puede haber ambigüedad: el recepcionista debe saber en < 1 segundo si deja pasar o no |
| Feed live | Ver que el sistema está funcionando + recordar quién acaba de entrar |
| Panel de alertas | Acciones que el recepcionista puede tomar proactivamente (renovación, inscripción en clase) |
| Aforo en KPI | El gimnasio puede tener límite de aforo. El recepcionista es el portero |

---

# DASHBOARD 5 — ENTRENADOR

**URL**: `/dashboard/entrenador`

**Objetivo de la sesión**: Saber qué clases tiene hoy y con quién, gestionar asistencia, hacer seguimiento de clientes.

**Header KPIs (3 cards):**

| Card | Dato | Por qué |
|------|------|---------|
| Clases de hoy | N total + "Próxima en X min" | Orientación temporal inmediata |
| Mis clientes activos | N clientes bajo seguimiento | Métrica de carga de trabajo |
| Evaluaciones pendientes | N sin registrar | Recordatorio de pendientes |

**Zona principal — Timeline del día (70% del ancho):**

Vista de timeline vertical de las clases del entrenador:

```
AGENDA HOY — Martes 3 Jun 2026

  08:00 ─┬─ Funcional Avanzado               [EN CURSO]
         │  Sala Principal · 12 de 15 inscritos
         │  [Ver inscritos] [Tomar asistencia]
         │
  10:00 ─┴─ ● ● ● ● ● ● ● ● ● (espacio libre)
  
  10:00 ─┬─ Spinning Matutino                [PRÓXIMA en 2h]
         │  Sala de Spinning · 20 de 20 inscritos
         │  Badge LLENA
         │  [Ver inscritos]
         │
  12:00 ─┴─

  16:00 ─┬─ Yoga para Principiantes          [PRÓXIMA en 6h]
         │  Sala 2 · 8 de 12 inscritos
         │  [Ver inscritos] [Editar clase]
         │
  18:00 ─┴─
```

**Al hacer clic en una clase — Panel lateral de la clase:**
- Header: nombre, hora, espacio, inscritos/cupo
- Lista de inscritos con checkbox de asistencia (toggle individual)
- Botón "Marcar todos como presentes"
- Botón "Cerrar clase" (registra la asistencia en bulk, cambia estado a 'Completada')
- Si clase completada: muestra asistencia final y permite añadir nota

**Zona lateral — Mis Clientes de hoy (30% del ancho):**

Lista filtrada de clientes inscritos en las clases del día:

| Columna | Dato |
|---------|------|
| Cliente | Avatar + Nombre |
| Clase | Nombre de la clase del día |
| Estado | Asistió / Por asistir / No asistió |
| Evaluación | Badge si tiene evaluación pendiente |

**Tab "Esta semana":**
Vista de calendario semanal (Mo-Su) con las clases del entrenador por día. Permite planificación.

**Por qué cada elemento existe:**

| Elemento | Razón |
|----------|-------|
| Timeline vertical | Más intuitivo que un calendario para ver el día secuencialmente |
| "Próxima en X min" | Orientación temporal sin mirar el reloj |
| Lista de inscritos en modal | La asistencia se toma durante o al final de la clase |
| Evaluaciones pendientes en KPI | Recordatorio inmediato al entrar |
| Panel de clientes de hoy | Saber de un vistazo con quién trabajará el entrenador hoy |

---

# DASHBOARD 6 — NUTRICIONISTA

**URL**: `/dashboard/nutricionista`

**Objetivo de la sesión**: Gestionar activamente la salud nutricional de los pacientes. Detectar quién necesita atención.

**Header KPIs (3 cards):**

| Card | Dato | Por qué |
|------|------|---------|
| Pacientes activos | N total | Métrica de carga de trabajo |
| Planes vigentes | N planes activos | Confirma cobertura |
| Evaluaciones este mes | N registradas | Seguimiento de actividad profesional |

**Zona principal — Lista de pacientes con alertas:**

Tabla de pacientes ordenada por urgencia:
1. Pacientes sin plan activo (primero — badge naranja)
2. Pacientes sin evaluación en > 30 días (segundo — badge amarillo)
3. Resto ordenado por nombre

**Panel de alertas (banner arriba de la tabla):**
```
⚠️  Ana Torres lleva 45 días sin evaluación  [Ver ficha →]
⚠️  3 pacientes sin plan nutricional activo  [Ver lista →]
```

**Detalle rápido al pasar hover sobre un paciente (tooltip expandido):**
- Último IMC registrado
- Objetivo del plan
- Días hasta próxima revisión programada

**Por qué cada elemento existe:**

| Elemento | Razón |
|----------|-------|
| Ordenación por urgencia | El nutricionista debe atender primero a quien más lo necesita |
| Alertas de días sin evaluación | El seguimiento sistemático es la clave de la nutrición efectiva |
| Acceso rápido a plan desde la tabla | El nutricionista navega a planes varias veces al día |

---

# DASHBOARD 7 — MIEMBRO

**URL**: `/dashboard/miembro`

**Objetivo de la sesión**: Acceder al gym (QR), inscribirse en clases, ver su progreso.

**Diseño del hero (pantalla completa en mobile):**

```
┌────────────────────────────────────────┐
│                                        │
│  Hola, María 👋                        │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │        [  QR CODE 220x220px  ]   │  │
│  │                                  │  │
│  │  ✅ Membresía activa             │  │
│  │     Vence el 15 Jun 2026         │  │
│  │     (en 12 días)                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  🔥 Visitas este mes: 14              │
│  ⚡ Racha: 5 días consecutivos        │
│  🏆 Clases asistidas: 8              │
│                                        │
└────────────────────────────────────────┘
```

**Si membresía vencida — Hero con alerta:**

```
┌────────────────────────────────────────┐
│  [QR DESHABILITADO — gris]             │
│  ❌ Membresía vencida                  │
│     Venció el 01 Jun 2026              │
│                                        │
│  [  RENOVAR MI MEMBRESÍA  ]            │
└────────────────────────────────────────┘
```

**Si membresía vence en ≤ 5 días — Banner de alerta:**
```
⚠️ Tu membresía vence en 3 días · [Renovar ahora →]
```

**Sección "Mis próximas clases":**
```
📅 PRÓXIMAS CLASES

  Mañana 8:00am    Spinning Matutino        [Cancelar]
  Jue 10 Jun 6pm   Yoga para Principiantes  [Cancelar]
  
  [Ver más clases disponibles →]
```

**Por qué cada elemento existe:**

| Elemento | Razón |
|----------|-------|
| QR grande y prominente | Es la única razón por la que muchos miembros abren la app |
| Estado de membresía junto al QR | El miembro siempre se pregunta cuánto le queda |
| Stats rápidas | Motivación y gamificación ligera. "14 visitas este mes" es un logro |
| Próximas clases | Recordatorio para que el miembro no olvide su clase reservada |
| Botón de renovar cuando vence | Conversión directa. El miembro lo ve en el momento más relevante |

---

# FASE 5 — STAFF MANAGEMENT (FLUJOS COMPLETOS)

## 5.1 Flujo: Ver lista de trabajadores activos

**Punto de entrada**: Admin en `/dashboard/admin/staff`

1. Página carga con Tab 1 (Trabajadores) activa por defecto
2. Tabla se carga con todos los trabajadores activos del tenant
3. Skeleton loaders durante la carga (2-3 segundos)
4. KPI cards de licencias se muestran en el header: "6 de 10 licencias usadas" con barra de progreso

**Estado vacío (sin trabajadores):**
```
[Icono de grupo de personas]
Tu equipo está vacío
Invita a tu primer trabajador para comenzar

[Generar código de invitación →]
```

**Estado con trabajador próximo a expirar:**
Badge naranja "Expira en 3 días" en la fila + alerta en el KPI card "Próximos a expirar"

---

## 5.2 Flujo: Perfil completo del trabajador (Drawer)

**Punto de entrada**: Click en nombre o avatar de cualquier trabajador en la tabla

**Drawer de detalle (Panel lateral 40% del ancho):**

```
┌─────────────────────────────────────────────────┐
│  [Avatar 80px]  Carlos Pedraza                  │
│                 Recepcionista                   │
│                 carlos@gmail.com                │
│                 ✅ Activo · Miembro del equipo  │
│                    hace 3 meses                 │
├─────────────────────────────────────────────────┤
│  [Info] [Actividad] [Permisos] [Códigos]        │
├─────────────────────────────────────────────────┤
│  TAB ACTIVO: Actividad                          │
│                                                 │
│  Hoy                                            │
│  ↑ 14:23 · Registró pago S/150 · María Torres  │
│  ↑ 13:45 · Acceso QR · Pedro Quispe            │
│  ↑ 11:32 · Inscripción clase · Ana Flores      │
│                                                 │
│  Ayer                                           │
│  ↑ 17:10 · Registró pago S/80 · Luis Mamani    │
│  ↑ 16:30 · Acceso QR · ...                     │
│                                                 │
│  [Cargar más actividad]                         │
├─────────────────────────────────────────────────┤
│  [Editar rol] [Suspender] [Revocar acceso]      │
└─────────────────────────────────────────────────┘
```

---

## 5.3 Flujo: Asignación / cambio de rol

**Punto de entrada**: Botón "Editar rol" en menú ⋮ de la tabla o en el footer del drawer

**Modal — Cambiar Rol:**

```
┌─────────────────────────────────────────────────────┐
│  Cambiar rol de Carlos Pedraza                      │
│                                                     │
│  Rol actual:  [Recepcionista]                       │
│                                                     │
│  Nuevo rol:                                         │
│  ○ Supervisor        (20 permisos)                  │
│  ● Cajero            (9 permisos) ← seleccionado    │
│  ○ Recepcionista     (10 permisos) — actual         │
│  ○ Entrenador        (10 permisos)                  │
│  ○ Nutricionista     (7 permisos)                   │
│                                                     │
│  ⚠️  Carlos perderá el acceso actual y recibirá    │
│      los permisos del nuevo rol inmediatamente.     │
│      Su sesión activa se actualizará.               │
│                                                     │
│  Motivo del cambio (opcional):                      │
│  [ Promoción interna / cambio de responsabilidades ] │
│                                                     │
│  [Cancelar]              [Cambiar rol →]            │
└─────────────────────────────────────────────────────┘
```

**Post-cambio:**
- Toast: "Rol de Carlos Pedraza actualizado a Cajero"
- La fila en la tabla actualiza el badge de rol sin recargar la página
- El JWT del trabajador se actualiza (se verá en su próxima acción)
- Evento registrado en audit_logs: ROLE_CHANGED

---

## 5.4 Flujo: Revocación de acceso

**Este es el flujo más crítico del módulo de Staff. Requiere el mayor rigor de confirmación.**

**Punto de entrada**: Botón "Revocar acceso" en menú ⋮ o en el drawer del trabajador

**Modal de revocación — Paso 1: Contexto:**

```
┌─────────────────────────────────────────────────────┐
│  🔴 Revocar acceso a Carlos Pedraza                 │
│                                                     │
│  Esta acción invalidará todos los permisos          │
│  de Carlos inmediatamente. El acceso se             │
│  preserva en el historial de auditoría.             │
│                                                     │
│  Tipo de revocación:                                │
│  ○ Temporal — suspensión hasta una fecha            │
│  ● Definitivo — fin de la relación laboral          │
│                                                     │
│  Motivo (obligatorio):                              │
│  [ Renuncia voluntaria                            ] │
│                                                     │
│  [Cancelar]              [Continuar →]              │
└─────────────────────────────────────────────────────┘
```

**Si Temporal — Paso 1b: Fecha de reactivación:**

```
│  Fecha de reactivación:  [ 10 Jul 2026 ]            │
│  (Carlos podrá volver a usar su cuenta desde        │
│   esta fecha automáticamente)                       │
```

**Modal de revocación — Paso 2: Confirmación definitiva:**

```
┌─────────────────────────────────────────────────────┐
│  ¿Confirmas la revocación?                          │
│                                                     │
│  Trabajador:  Carlos Pedraza (Recepcionista)        │
│  Tipo:        Definitivo                            │
│  Motivo:      Renuncia voluntaria                   │
│  Efectivo:    Inmediatamente                        │
│                                                     │
│  ☑ Confirmo que deseo revocar el acceso de         │
│    Carlos Pedraza de forma definitiva               │
│                                                     │
│  [Cancelar]              [🔴 Confirmar revocación]  │
└─────────────────────────────────────────────────────┘
```

**Post-revocación:**
- Toast: "Acceso de Carlos Pedraza revocado · Registrado en auditoría"
- La fila en la tabla cambia el badge a "Revocado" en rojo
- La próxima acción del trabajador retornará 403 → redirección al login
- Evento en audit_logs: ROLE_REVOKED con motivo y tipo

---

## 5.5 Flujo: Historial de actividad

**Punto de entrada**: Tab "Actividad" en el drawer del trabajador, o filtro de auditoría por actor

**Filtros dentro del drawer:**
- Tipo de acción: Todos / Pagos / Accesos / Clases / Membresías
- Período: Hoy / Esta semana / Este mes
- Búsqueda: nombre del miembro afectado

**Comportamiento del timeline:**
- Agrupado por día (encabezados: "Hoy", "Ayer", "Lun 2 Jun", etc.)
- Iconos distintos por tipo de acción
- Carga por páginas (mostrar primeros 20, botón "Cargar más")
- Exportar actividad del trabajador (filtros activos) → CSV

---

# FASE 6 — CÓDIGOS DE INVITACIÓN (FLUJOS COMPLETOS)

## 6.1 Flujo: Generación de código

**Punto de entrada**: Tab "Invitar nuevo trabajador" en /admin/staff

**Validación antes de mostrar el formulario:**
- El sistema verifica `max_licenses` del tenant
- Si límite alcanzado: formulario reemplazado por banner de upgrade
- Si hay cupo: formulario disponible con indicador "9 de 10 licencias usadas"

**Selección de rol — Comportamiento del select:**
Al seleccionar un rol en el dropdown, se muestra debajo:
```
Entrenador · Nivel 50
Este rol puede: Gestionar sus clases, Evaluar clientes, Ver agenda
Este rol NO puede: Gestionar pagos, Ver reportes, Modificar configuración
[Ver todos los permisos de este rol →]
```
Este diseño permite al admin entender exactamente qué permisos otorgará antes de generar el código.

**Generación:**
- Al hacer clic en "Generar Código": spinner de 1-2 segundos → aparece la vista de resultado
- El código se genera en el backend con `fn_create_staff_code()`
- El resultado aparece con animación de entrada

---

## 6.2 Historial de códigos — Indicadores de negocio

**KPIs del módulo de códigos (Tab 3):**

```
┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐
│  Activos    │ │  Usados     │ │  Expirados   │ │  Tasa conversión    │
│  sin usar   │ │  este mes   │ │  sin usar    │ │  último mes         │
│             │ │             │ │              │ │                     │
│      2      │ │      7      │ │      1       │ │       87.5%         │
│             │ │             │ │ ⚠️ Inefic.  │ │  7 de 8 códigos     │
└─────────────┘ └─────────────┘ └──────────────┘ └─────────────────────┘
```

**Tooltips explicativos en cada KPI:**
- Activos sin usar: "Códigos generados que aún no fueron usados pero siguen vigentes"
- Expirados sin usar: "Oportunidades de incorporación que no se concretaron. Revisa si el trabajador recibió el código"
- Tasa de conversión: "% de códigos generados que resultaron en una incorporación exitosa. < 70% puede indicar problemas en el proceso"

---

## 6.3 Flujo: Revocación de código

**Caso de uso**: El admin generó un código para una persona que ya no ingresará al gym.

**Acceso**: Botón "Revocar" en la tabla de historial (solo visible si estado = Activo)

**Modal:**
```
┌───────────────────────────────────────────────┐
│  Revocar código GYM-4F2K-8X9M                │
│                                               │
│  Para rol: Recepcionista                      │
│  Creado: hace 3 días                          │
│  Vence en: 4 días                             │
│                                               │
│  Al revocar este código, nadie podrá usarlo   │
│  para registrarse. Esta acción no se puede   │
│  deshacer.                                    │
│                                               │
│  [Cancelar]     [Revocar código]              │
└───────────────────────────────────────────────┘
```

Post-revocación: badge del código cambia a "Revocado" en rojo. Registrado en audit_logs (CODE_REVOKED).

---

## 6.4 Flujo: Compartir código QR

**Opciones de compartir (botones post-generación):**

1. **Copiar código** — copia el texto "GYM-4F2K-8X9M" al clipboard. Toast: "Código copiado"
2. **Copiar enlace** — copia `https://gymsos.app/signup?code=GYM-4F2K-8X9M`. Toast: "Enlace copiado"
3. **WhatsApp** — abre WhatsApp con el mensaje preescrito:
   ```
   "Hola! Te invito a unirte al equipo de [Nombre del Gym] en GYMsos.
   
   1. Descarga la app o entra a gymsos.app/signup
   2. Usa este código: GYM-4F2K-8X9M
   3. Completa tu registro
   
   El código vence en 7 días. ¡Bienvenido!"
   ```
4. **Descargar QR PNG** — descarga imagen PNG del QR en alta resolución para imprimir

---

# FASE 7 — SISTEMA DE PERMISOS (DISEÑO VISUAL)

## 7.1 Matriz de Roles × Permisos — Diseño completo

**Filosofía de diseño**: La matriz de permisos es un documento operativo, no un panel técnico. Debe ser legible por un dueño de gym que no tiene conocimientos de programación.

**Cabecera de la tabla:**

```
                    Admin   Super   Cajero  Recep.  Entren.  Nutri.  Miembro
───────────────────────────────────────────────────────────────────────────
USUARIOS
  Ver miembros         ✅      ✅      ✅      ✅      ✅      ✅      —
  Crear miembro        ✅      ✅      —       ✅      —       —       —
  Editar miembro       ✅      ✅      —       —       —       —       —
  Eliminar miembro     ✅      —       —       —       —       —       —

MEMBRESÍAS
  Ver membresías       ✅      ✅      ✅      ✅      —       —       —
  Crear membresía      ✅      ✅      ✅      —       —       —       —
  Aprobar renovación   ✅      ✅      ✅      —       —       —       —
  Cancelar membresía   ✅      ✅      —       —       —       —       —

PAGOS
  Ver pagos            ✅      ✅      ✅      ✅      —       —       —
  Registrar pago       ✅      ✅      ✅      —       —       —       —
  Reembolsar           ✅      —       —       —       —       —       —

... (resto de módulos)
```

**Leyenda con tooltips explicativos:**
- ✅ = Este rol puede realizar esta acción
- — (gris) = Este rol no tiene este permiso
- 🔒 (rojo) = Explícitamente bloqueado (hover muestra razón)

**Funcionalidad de filtro en la matriz:**
- Selector de rol: ver solo los permisos de un rol específico
- Selector de módulo: ver solo los permisos de un módulo
- Toggle "Mostrar diferencias": oculta filas donde todos tienen o ninguno tiene

**Tooltip al hacer clic en un ✅:**
```
"El Supervisor puede registrar pagos porque puede
reemplazar al Cajero cuando es necesario, pero no
puede hacer reembolsos (solo el Administrador)."
```

---

## 7.2 Vista de rol individual — Experiencia para no técnicos

**Al hacer clic en "Supervisor" en la cabecera de la matriz:**

```
┌──────────────────────────────────────────────────────────────┐
│  SUPERVISOR                                                  │
│  Nivel de jerarquía: 10 (entre Admin y Recepcionista)        │
│                                                              │
│  Descripción: El Supervisor gestiona las operaciones         │
│  del turno. Puede hacer todo lo que hace el Recepcionista    │
│  y el Cajero, y además puede aprobar excepciones.            │
│                                                              │
│  PUEDE HACER:                           NO PUEDE HACER:      │
│  ✅ Ver y gestionar membresías          ❌ Reembolsar pagos   │
│  ✅ Registrar pagos                     ❌ Cambiar configurac.│
│  ✅ Aprobar renovaciones con descuento  ❌ Crear códigos staff│
│  ✅ Gestionar accesos QR                ❌ Ver audit logs     │
│  ✅ Ver lista de trabajadores           ❌ Revocar accesos    │
│  ✅ Autorizar accesos excepcionales                          │
│                                                              │
│  TRABAJADORES CON ESTE ROL:                                  │
│  [Avatar] Pedro Mamani · Activo desde 12 Ene 2026            │
│                                                              │
│  [Cambiar rol de Pedro →]   [Ver toda la actividad →]        │
└──────────────────────────────────────────────────────────────┘
```

---

## 7.3 Roles del sistema — Descripción canónica para la UI

Para cada rol, la UI debe mostrar una descripción en lenguaje no técnico:

| Rol | Descripción para la UI | Badge color |
|-----|----------------------|-------------|
| Administrador General | "Control total del gym. Puede ver y hacer todo." | Azul oscuro (#1e3a5f) |
| Supervisor | "Gestiona el turno. Puede aprobar excepciones que el Recepcionista no puede." | Naranja (#d97706) |
| Cajero | "Gestiona los cobros. Solo ve lo relacionado con pagos." | Verde (#059669) |
| Recepcionista | "Controla el acceso al gym. Registra miembros y escanea QR." | Azul (#2563eb) |
| Entrenador | "Gestiona sus clases y el progreso de sus clientes." | Morado (#7c3aed) |
| Nutricionista | "Crea planes nutricionales y hace seguimiento de sus pacientes." | Teal (#0d9488) |
| Miembro | "Usuario del gym. Solo puede ver su propia información." | Gris (#6b7280) |

---

# FASE 8 — AUDITORÍA (DISEÑO DETALLADO)

## 8.1 Visor de Auditoría — Página AD-07 completa

Ya documentada en Parte 2. Aquí se amplía la experiencia de búsqueda y filtrado.

## 8.2 Búsquedas y filtros de auditoría

**Panel de filtros (sidebar izquierdo en desktop, drawer en tablet/mobile):**

```
FILTROS DE AUDITORÍA

Actor del evento
┌─────────────────────────┐
│ 🔍 Buscar trabajador... │
└─────────────────────────┘
[Carlos Pedraza  ×]

Tipo de acción
☑ MEMBER_CREATED
☑ MEMBERSHIP_CANCELLED
☑ PAYMENT_CREATED
☑ ROLE_CHANGED
☑ ROLE_REVOKED
☑ CODE_CREATED
☑ CODE_USED
☑ CODE_REVOKED
☑ ACCESS_DENIED
☑ GYM_CONFIG_UPDATED
[Seleccionar todos] [Deseleccionar]

Período
● Hoy
○ Esta semana
○ Este mes
○ Rango personalizado

Módulo afectado
[ Todos los módulos ▼ ]

[Aplicar filtros]  [Limpiar]
```

## 8.3 Eventos críticos — Diseño visual diferenciado

Los eventos de mayor severidad tienen tratamiento visual especial:

| Evento | Visualización en tabla |
|--------|----------------------|
| ROLE_REVOKED | Fila con fondo rojo muy suave. Icono de candado rojo. |
| CODE_REVOKED | Fila con fondo naranja muy suave. Icono de código inválido. |
| MEMBERSHIP_CANCELLED | Fila con fondo naranja muy suave. |
| GYM_CONFIG_UPDATED | Fila con borde izquierdo azul. |
| ACCESS_DENIED | Fila normal con ícono de X roja. Muchos ACCESS_DENIED del mismo usuario → alerta |

## 8.4 Exportaciones

**Exportar CSV:**
- El archivo incluye todos los campos de audit_logs del período filtrado
- Nombre del archivo: `gymsos-auditoria-[gym_nombre]-[fecha_inicio]-[fecha_fin].csv`
- Columnas del CSV: timestamp, actor_nombre, actor_rol, action, target_tabla, descripcion_legible, ip_address (Fase C)

**Vista previa antes de exportar:**
```
┌──────────────────────────────────────────────────┐
│  Exportar Auditoría                              │
│                                                  │
│  Período: 01 Jun 2026 – 03 Jun 2026              │
│  Filtros activos: Actor = Carlos Pedraza         │
│  Eventos encontrados: 47 registros               │
│                                                  │
│  Formato: ● CSV  ○ PDF (Fase C)                  │
│                                                  │
│  [Cancelar]          [Descargar CSV]             │
└──────────────────────────────────────────────────┘
```

---
