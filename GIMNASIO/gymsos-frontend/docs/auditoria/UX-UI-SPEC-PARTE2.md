# ESPECIFICACIÓN UX/UI — PARTE 2
## FASE 3 — DISEÑO PÁGINA POR PÁGINA

---

# MÓDULO 1 — DASHBOARD GENERAL

## Página AD-01 — Panel Ejecutivo (`/dashboard/admin`)

### Objetivo
Dar al administrador el "estado de salud del negocio" en 30 segundos desde que abre la pantalla. No es un formulario — es un cockpit de decisiones.

### Actor autorizado
Administrador General (rol: gerente / admin)

### Permisos requeridos
- Acceso base: cualquier permiso del tenant
- Para datos financieros: `gym.reportes.ver`
- Para churn risk: `gym.reportes.ver`

### KPIs visibles (Zona 1 — siempre sin scroll)

| Card | Dato principal | Dato secundario | Color semáforo |
|------|---------------|-----------------|----------------|
| Ingresos Hoy | S/ monto | ↑/↓ % vs ayer | Verde si > meta, Rojo si < 80% meta |
| Accesos Hoy | N / capacidad_total | % del aforo | Amarillo si > 80%, Verde si normal |
| Membresías Activas | Total activas | ↑/↓ vs semana pasada | Rojo si caída sostenida 3+ días |
| En Riesgo (Churn) | N miembros | ↑/↓ vs semana pasada | Rojo siempre si > 0 |
| Staff Activo Hoy | N de M | N sin check-in | Amarillo si falta alguien |

### Widgets

**Widget A — Gráfico de ingresos (Zona 2 izquierda, 60%):**
- Tipo: Líneas
- Período: Últimos 30 días (selector: 7d / 30d / 90d / 12m)
- Series: Año actual (línea azul sólida) vs año anterior (línea gris punteada)
- Referencia: Línea de meta mensual en rojo punteado
- Hover: Tooltip con desglose por plan de membresía
- Fuente: `gym.pagos` agrupados por día

**Widget B — Accesos por hora (Zona 2 derecha, 40%):**
- Tipo: Barras verticales
- Período: Hoy (por hora de 6am a 10pm)
- Series: Hoy (azul) vs promedio semana (gris)
- Indicador de hora pico: badge "PICO 7am" sobre la barra más alta
- Fuente: `gym.accesos` agrupados por hora

**Widget C — Membresías por vencer (Zona 3 izquierda, 50%):**
- Tipo: Tabla compacta
- Columnas: Avatar+Nombre, Plan, Días restantes (badge), Acción
- Ordenada: por días restantes ASC (más urgente primero)
- Máximo visible: 5 filas
- Footer: "Ver todas (N membresías)" → link a `/dashboard/admin/membresias/vencimientos`
- Acción por fila: Botón "Notificar" (push notification — Fase D)

**Widget D — Miembros en riesgo de churn (Zona 3 derecha, 50%):**
- Tipo: Tabla compacta
- Columnas: Avatar+Nombre, Score badge (rojo/naranja/amarillo), Último acceso ("hace N días"), Acción
- Ordenada: por score DESC (mayor riesgo primero)
- Máximo visible: 5 filas
- Footer: "Ver todos (N miembros)" → link a `/dashboard/admin/miembros?filter=churn`
- Acción por fila: Botón "Intervenir" (Fase D: abre modal de envío de push)
- Fuente: `churn_predictions`

**Widget E — Clases de hoy (Zona 4 columna 1, 33%):**
- Lista de clases ordenadas por hora
- Cada fila: Hora, Nombre de clase, Entrenador, Barra de ocupación (X/Y) con % visual
- Badge "LLENA" en rojo si inscritos = cupo
- Badge "AHORA" pulsante para la clase en curso

**Widget F — Últimas transacciones (Zona 4 columna 2, 33%):**
- Lista de 5 pagos más recientes
- Cada fila: Avatar+Nombre del miembro, Monto, Forma de pago (badge: Efectivo/Yape/Tarjeta), Hora
- Footer: "Ver historial completo" → `/dashboard/admin/membresias/pagos`

**Widget G — Staff del día (Zona 4 columna 3, 33%):**
- Lista de todos los trabajadores con turno hoy
- Cada fila: Avatar, Nombre, Rol (badge), Estado (✅ Activo / ⚠️ Sin check-in)
- Si alguien no registró actividad en las últimas 2h durante horario de trabajo: badge naranja
- Footer: "Gestionar personal" → `/dashboard/admin/staff`

### Tablas
Solo tablas compactas en widgets C, D, F, G (descritas arriba). No hay tablas en pantalla completa en esta página.

### Filtros
- Selector de período en Widget A (7d/30d/90d/12m) — afecta solo el gráfico
- No hay filtros globales en el dashboard; los filtros viven en las páginas específicas

### Búsquedas
- Barra de búsqueda global en el header (Cmd+K) — Fase B
- Accesible desde cualquier página, busca en miembros, pagos, clases

### Acciones rápidas (header — siempre visibles)

| Acción | Comportamiento | Permiso |
|--------|---------------|---------|
| + Nuevo Miembro | Abre modal de registro rápido | gym.usuarios.crear |
| + Código de Staff | Abre modal de generación de código | gym.staff.gestionar |
| 🔍 Buscar | Abre búsqueda global | — |
| 📤 Exportar hoy | Descarga reporte del día en PDF | gym.reportes.exportar |

### Estados vacíos

| Situación | Mensaje | Acción sugerida |
|-----------|---------|-----------------|
| Sin miembros todavía | "Tu gym aún no tiene miembros registrados" + ilustración | Botón "Invitar primer miembro" |
| Sin accesos hoy | "Aún no se han registrado accesos hoy" | Botón "Ir a Control de Acceso" |
| Sin predicciones de churn | "No hay datos de riesgo todavía — necesitas al menos 30 días de actividad" | Informativo, sin acción |
| Sin transacciones hoy | "No hay pagos registrados hoy" + hora actual | Botón "Registrar cobro" |

### Estados de error

| Error | Mensaje visible | Comportamiento técnico |
|-------|----------------|----------------------|
| Sin datos financieros (permiso faltante) | "No tienes acceso a reportes financieros. Contacta al administrador." | Widget C y D muestran estado bloqueado |
| Error de carga de KPIs | "No se pudieron cargar los datos. Reintenta." + botón Retry | No rompe la página completa — solo el widget falla con skeleton → error |
| Supabase Realtime desconectado | Badge naranja "Conexión en tiempo real perdida" en el widget de Staff | No bloquea la página, muestra datos cacheados |

### Responsive behavior

| Breakpoint | Comportamiento |
|------------|---------------|
| Desktop (1280px+) | Layout completo 5 cols / 60-40 / 50-50 / 33-33-33 |
| Tablet (768-1279px) | KPIs: 3 cols fila 1 + 2 cols fila 2. Gráficos: apilados verticalmente. Zona 4: 50-50 |
| Mobile (< 768px) | KPIs: 2x2+1. Gráficos: solo el de ingresos, accesos ocultado. Widgets: apilados. Acciones rápidas: FAB flotante |

---

# MÓDULO 2 — STAFF MANAGEMENT

## Página AD-04 — Gestión de Personal (`/dashboard/admin/staff`)

### Objetivo
Control total del equipo de trabajo: ver quiénes son, qué permisos tienen, incorporar nuevos, suspender o revocar.

### Actor autorizado
Administrador General

### Permisos requeridos
- Ver trabajadores: `gym.staff.ver`
- Acciones (invitar, revocar, cambiar rol): `gym.staff.gestionar`
- Ver historial de códigos: `gym.codigos.ver`
- Generar código: `gym.codigos.crear`

### KPIs visibles (header de la página, antes de las tabs)

| Card | Dato | Nota |
|------|------|------|
| Trabajadores Activos | N de M licencias | Barra de progreso visual: "6 de 10 licencias usadas" |
| Roles activos | N roles distintos en uso | — |
| Códigos activos | N sin usar | Badge naranja si hay códigos expirados sin usar |
| Incorporaciones este mes | N nuevos trabajadores | — |

### Tab 1 — Trabajadores Activos

**Tabla principal:**

| Columna | Dato | Notas de diseño |
|---------|------|----------------|
| Trabajador | Avatar (32px) + Nombre + Email | Clickable → abre drawer de detalle |
| Rol | Badge coloreado con nombre del rol | Color único por rol: Supervisor=naranja, Cajero=verde, Recepcionista=azul, Entrenador=morado, Nutricionista=teal |
| Estado | Chip: Activo / Suspendido / Por expirar | Por expirar: badge naranja si expires_at < 7 días |
| Última actividad | "Hace 2h · Registró pago" | Texto en gris. Rojo si > 48h sin actividad durante días de trabajo |
| Fecha de ingreso | DD MMM YYYY | — |
| Expira | Countdown si expires_at IS NOT NULL | "En 5 días" en naranja. "Vencido" en rojo |
| Acciones | Menú contextual (⋮) | Ver abajo |

**Filtros disponibles:**
- Por rol: selector múltiple (Todos / Supervisor / Cajero / Recepcionista / Entrenador / Nutricionista)
- Por estado: Activos / Suspendidos / Todos
- Por actividad: Activo esta semana / Sin actividad + 7 días / Todos
- Búsqueda libre: nombre o email
- Ordenar por: Nombre A-Z / Rol / Fecha de ingreso / Última actividad

**Acciones por fila (menú ⋮):**

| Acción | Permiso | Comportamiento |
|--------|---------|---------------|
| Ver detalle completo | gym.staff.ver | Abre drawer lateral con perfil y actividad |
| Editar rol | gym.staff.gestionar | Abre selector de rol. Al confirmar: update en user_roles + JWT + gym.usuarios.rol |
| Suspender temporalmente | gym.staff.gestionar | Modal: "Motivo" + fecha de reactivación. Establece expires_at = fecha seleccionada |
| Revocar acceso | gym.staff.gestionar | Modal de confirmación doble (ver diseño detallado en FASE 5) |
| Reactivar | gym.staff.gestionar | Solo visible si está Suspendido. Elimina la fecha de expiración |

**Drawer de detalle del trabajador:**
Se abre a la derecha (40% del ancho en desktop). Tabs internas:
- **Info**: avatar grande, nombre, email, teléfono, rol, fecha de ingreso, notas del admin
- **Actividad**: timeline de últimas 20 acciones (pagos registrados, accesos procesados, clases iniciadas)
- **Permisos**: lista de permisos RBAC activos para su rol
- **Códigos**: el código que usó para registrarse (parcialmente oculto, visible solo al hover)

---

### Tab 2 — Invitar Nuevo Trabajador

**Formulario de generación de código:**

| Campo | Tipo | Comportamiento |
|-------|------|---------------|
| Rol para este código | Select | Lista de 7 roles del sistema. Cada opción muestra el nombre del rol y el número de permisos que tiene |
| Usos máximos | Number input | Default: 1. Range: 1-50. Helper text: "Para invitar a 1 persona usa 1 uso" |
| Expira en | Select | Opciones: 24 horas / 3 días / 7 días (default) / 30 días / Sin expiración |
| Descripción (opcional) | Text input | Placeholder: "Ej: Para el nuevo recepcionista del turno tarde" |

**Validación pre-generación:**
- Si max_licenses alcanzado: formulario bloqueado con banner rojo "Alcanzaste el límite de 10 licencias de tu plan. [Actualiza a Pro →]"
- Si no está bloqueado: botón "Generar Código" activo

**Post-generación — vista de resultado:**

```
┌─────────────────────────────────────────────────────────┐
│  Código generado exitosamente                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           GYM-4F2K-8X9M                         │   │
│  │  [         QR CODE 200x200px        ]            │   │
│  │                                                  │   │
│  │  Rol: Recepcionista · Vence en 7 días            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [📋 Copiar código]  [🔗 Copiar enlace]  [📱 WhatsApp]  │
│  [📥 Descargar QR PNG]                                  │
│                                                         │
│  [Generar otro código]           [Ir al historial →]   │
└─────────────────────────────────────────────────────────┘
```

**Enlace de registro compartido:** `https://gymsos.app/signup?code=GYM-4F2K-8X9M`

---

### Tab 3 — Historial de Códigos

**Tabla de códigos:**

| Columna | Dato | Notas |
|---------|------|-------|
| Código | GYM-XXXX-XXXX | Parcialmente oculto: GYM-4F**-**9M. Click para revelar |
| Rol asignado | Badge del rol | Color del rol |
| Estado | Badge: Activo / Usado / Expirado / Revocado | Colores: Verde/Azul/Gris/Rojo |
| Creado por | Avatar + Nombre + fecha | — |
| Usado por | Avatar + Nombre + "hace N días" | Solo si fue usado |
| Vence / Venció | Fecha + countdown si activo | Rojo si ya expiró |
| Usos | "1 de 1" o "3 de 5" | Barra de progreso mini |
| Acciones | Botones contextuales | Ver abajo |

**Acciones por fila:**
- Activo: [Ver QR] + [Revocar]
- Usado: [Ver quién lo usó] → link al perfil del trabajador
- Expirado: [Solo lectura]
- Revocado: [Ver razón de revocación]

**Filtros:**
- Por estado: Todos / Activos / Usados / Expirados / Revocados
- Por rol: selector múltiple
- Rango de fechas de creación
- Búsqueda por nombre del creador o del usuario que usó el código

---

## Página AD-05 — Roles y Permisos (`/dashboard/admin/staff/roles`)

### Objetivo
Dar visibilidad clara al administrador de qué puede hacer cada rol. En Fase C: permitir editar.

### Actor autorizado
Administrador General

### Permisos requeridos
`gym.staff.gestionar`

### Vista principal — Matriz de permisos

**Layout de la tabla:**
- Filas: 31 permisos + 6 nuevos (018) agrupados por módulo
- Columnas: 7 roles del sistema
- Celda: indicador de acceso

**Leyenda de celdas:**
```
✅ (verde)    — Permiso concedido
❌ (gris)     — Sin permiso
🔴 (rojo)     — Explícitamente prohibido (con razón documentada)
```

**Agrupación de filas por módulo (collapsable):**

```
▼ USUARIOS (4 permisos)
  gym.usuarios.ver
  gym.usuarios.crear
  gym.usuarios.editar
  gym.usuarios.eliminar

▼ MEMBRESÍAS (4 permisos)
  gym.membresias.ver
  gym.membresias.crear
  gym.membresias.aprobar
  gym.membresias.cancelar

▼ PAGOS (3 permisos)
  gym.pagos.ver
  gym.pagos.crear
  gym.pagos.reembolsar

▼ CLASES (3 permisos)
  gym.clases.ver
  gym.clases.gestionar
  gym.clases.inscribir

... etc por cada módulo
```

**Interacción al hacer clic en una columna (nombre del rol):**
Se abre un panel lateral con:
- Nombre completo del rol y descripción
- Jerarquía (nivel 0 = Admin General, nivel 100 = Miembro)
- Lista de permisos activos (los ✅ de esa columna)
- Lista de trabajadores que tienen este rol ahora
- Botón "Cambiar rol de trabajador" (si tienes gym.staff.gestionar)

**Fase C (no ahora):** Cada celda tiene un checkbox activable. Al cambiar: modal de confirmación + registro en audit_logs.

---

# MÓDULO 3 — ROLES Y PERMISOS (página AD-05 — documentada arriba)

---

# MÓDULO 4 — CÓDIGOS DE INVITACIÓN (Tab 2 y Tab 3 de AD-04 — documentadas arriba)

---

# MÓDULO 5 — MIEMBROS

## Página AD-02 — Lista de Miembros (`/dashboard/admin/miembros`)

### Objetivo
Gestionar la cartera completa de miembros con visibilidad de estado y riesgo.

### Actor autorizado
Administrador General, Supervisor (solo lectura y búsqueda), Recepcionista (buscar + registrar)

### Permisos requeridos
- Ver lista: `gym.usuarios.ver`
- Churn score: `gym.reportes.ver`
- Cancelar membresía: `gym.membresias.cancelar`

### KPIs visibles (antes de la tabla)

| Card | Dato |
|------|------|
| Miembros activos | N total con membresía activa |
| Altas este mes | N nuevos registros |
| Bajas este mes | N cancelaciones o vencimientos sin renovar |
| Con churn score alto | N con score > 60% (solo si gym.reportes.ver) |

### Tabla de miembros

| Columna | Dato | Notas |
|---------|------|-------|
| Miembro | Avatar + Nombre + Email | Clickable → perfil completo |
| Membresía | Badge coloreado | Verde=Activa, Naranja=Por vencer, Rojo=Vencida, Gris=Sin membresía |
| Plan | Nombre del plan | — |
| Vence en | Fecha + "en N días" | Rojo si < 7 días |
| Último acceso | "Hace N días" | Rojo si > 15 días (posible churn) |
| Churn Score | Badge % | Solo visible con permiso. Rojo>70%, Naranja 40-70%, Gris si sin datos |
| Acciones | Menú ⋮ | — |

### Filtros

| Filtro | Opciones |
|--------|----------|
| Estado membresía | Todos / Activa / Por vencer (7 días) / Vencida / Sin membresía |
| Riesgo de churn | Todos / Alto (>70%) / Medio (40-70%) / Bajo (<40%) / Sin datos |
| Plan | Selección múltiple de planes disponibles |
| Fecha de alta | Rango de fechas |
| Actividad reciente | Activo esta semana / Inactivo +7 días / Inactivo +30 días |

### Búsquedas
- Barra de búsqueda libre: nombre, email, número de documento
- Debounce de 300ms
- Resultado inmediato en la tabla

### Acciones rápidas
- Botón "+ Nuevo Miembro" en el header de la página (abre modal o redirige a RC-02)
- Exportar lista CSV (con filtros activos) — requiere gym.reportes.exportar

### Acciones por fila

| Acción | Permiso | Comportamiento |
|--------|---------|---------------|
| Ver perfil completo | gym.usuarios.ver | Navega a /miembros/[id] |
| Renovar / registrar pago | gym.pagos.crear | Abre modal de cobro rápido |
| Enviar mensaje | Fase D | Abre modal de push notification |
| Cancelar membresía | gym.membresias.cancelar | Modal doble confirmación con motivo |

### Estado vacío
Si no hay miembros registrados:
```
[Ilustración de gym vacío]
"Tu gym aún no tiene miembros"
"Empieza compartiendo el código de acceso de tu gym"
[Ver código QR del gym →]
```

### Estado de error
- Sin permiso para ver churn: columna "Churn Score" oculta completamente (no muestra candado)
- Error de carga: tabla con skeleton loaders → botón "Reintentar" tras 3s
- Sin resultados con filtros activos: "No encontramos miembros con estos filtros" + botón "Limpiar filtros"

### Responsive behavior
- Desktop: tabla completa con todas las columnas
- Tablet: ocultar columnas "Churn Score" y "Último acceso" (disponibles en detalle)
- Mobile: lista de cards (una por miembro), no tabla. Cada card: avatar + nombre + badge de membresía + botón de acción principal

---

## Página AD-03 — Perfil de Miembro (`/dashboard/admin/miembros/[id]`)

### Objetivo
Vista completa e histórica de un miembro para tomar decisiones de retención y gestión.

### Permisos requeridos
`gym.usuarios.ver` (base) + `gym.pagos.ver` (para tab Pagos) + `gym.reportes.ver` (para churn)

### Layout

**Header fijo:**
```
[Avatar 64px] Nombre Completo          [Badge: Membresía Activa]
              email@ejemplo.com         [Churn Score: 23%]
              📞 +51 987654321
              📅 Miembro desde: 12 Ene 2026 (hace 5 meses)
              
[Renovar Membresía] [Enviar Notificación] [⋮ más acciones]
```

**5 Tabs:**

**Tab 1 — Membresía:**
- Plan actual: nombre, precio, duración, fechas inicio/fin, estado
- Barra de tiempo visual: inicio → hoy → fin (con porcentaje consumido)
- Historial de membresías anteriores (tabla): plan, fechas, estado, monto total pagado
- Botón "Renovar membresía" → modal de cobro
- Botón "Cancelar membresía" (con modal de doble confirmación + motivo)

**Tab 2 — Pagos:**
- Total pagado en el último año (número destacado)
- Tabla historial: Fecha, Plan, Monto, Forma de pago, Procesado por, Comprobante
- Badge de forma de pago por cada fila

**Tab 3 — Asistencia:**
- Gráfico de barras: visitas por semana (últimas 12 semanas)
- Tabla de últimos 20 accesos: fecha, hora, estado (entrada/salida), tipo
- Stats: visitas este mes, racha actual, hora preferida de visita

**Tab 4 — Clases:**
- Clases inscritas activas (próximas)
- Historial de clases: asistió / no fue (con razón si se canceló)
- Entrenador asignado (si aplica)

**Tab 5 — Notas internas:** (solo Admin/Supervisor, invisible para el miembro)
- Campo de texto libre con historial versionado
- Cada nota: texto + autor + timestamp
- Botón "Añadir nota"

---

# MÓDULO 6 — MEMBRESÍAS

## Página AD-02b — Membresías Activas (`/dashboard/admin/membresias`)

### Objetivo
Vista financiera de todas las membresías para gestión del flujo de caja.

### Permisos requeridos
`gym.membresias.ver`

### KPIs

| Card | Dato |
|------|------|
| Membresías activas | N total |
| Por vencer (7 días) | N — badge naranja clickable |
| Vencidas sin renovar | N — badge rojo clickable |
| Ingresos proyectados (próximos 30 días) | S/ basado en próximas renovaciones |

### Tabla

| Columna | Dato |
|---------|------|
| Miembro | Avatar + Nombre |
| Plan | Nombre + precio/mes |
| Inicio | Fecha |
| Vencimiento | Fecha + "en N días" |
| Estado | Badge: Activa / Por vencer / Vencida |
| Monto | S/ del último pago |
| Acciones | Renovar / Ver pagos / Cancelar |

### Filtros
Estado de membresía + Plan + Rango de fechas de vencimiento

---

# MÓDULO 7 — FINANZAS

## Página AD-06 — Reportes (`/dashboard/admin/reportes`)

### Objetivo
Análisis financiero y operativo para decisiones estratégicas.

### Permisos requeridos
`gym.reportes.ver` + `gym.reportes.exportar` (para descargas)

### Tab 1 — Financiero

**Sección de KPIs mensuales:**

| Card | Dato |
|------|------|
| Ingresos del mes | S/ total vs presupuesto (%) |
| Ticket promedio | S/ por transacción |
| Proyección del mes | S/ estimado basado en tendencia de los últimos 15 días |
| Variación vs mes anterior | ↑/↓ % |

**Gráfico de barras — Ingresos por mes (últimos 12 meses):**
- Hover: tooltip con desglose por plan
- Clic en barra: muestra tabla de transacciones de ese mes

**Pie chart — Distribución por plan:**
- Un slice por cada plan activo
- Leyenda con porcentaje y monto

**Tabla de últimas 50 transacciones:**
- Columnas: Fecha, Miembro, Plan, Monto, Forma de pago, Procesado por
- Paginada (25 por página)

**Exportar:**
- Botón "Exportar CSV" (todas las transacciones del período filtrado)
- Botón "Exportar PDF" (reporte ejecutivo con gráficos)
- Selector de período antes de exportar

### Tab 2 — Retención y Churn

**KPIs:**
- Tasa de retención mensual (%)
- Altas netas del mes (altas - bajas)
- LTV promedio del miembro activo
- Churn rate (%)

**Gráfico de líneas — Tasa de retención (últimos 12 meses)**

**Lista "Miembros en riesgo ahora":**
- Top 20 con mayor churn score
- Columnas: Nombre, Score, Último acceso, Días como miembro, Acción

**Historial de intervenciones:** (Fase D)
- Cuántas intervenciones se enviaron
- Cuántas resultaron en visita

### Tab 3 — Asistencia y Ocupación

**Mapa de calor — Asistencia por día × hora:**
- Eje X: horas del día (6am - 10pm)
- Eje Y: días de la semana (L-D)
- Color: de blanco (0) a azul oscuro (máximo)
- Hover: N accesos en ese slot

**Clases más populares (Top 10):**
- Tabla: Nombre clase, Entrenador, Inscritos promedio, Asistencia real (%), Tasa de no asistencia

**Entrenador con mayor ocupación promedio:**
- Ranking de entrenadores por % de ocupación en sus clases

### Tab 4 — Miembros

**Crecimiento acumulado** (gráfico de área):
- Miembros activos por mes (últimos 12 meses)

**Distribución por plan** (barras horizontales):
- Un barra por plan, mostrando N miembros

**Cohortes de permanencia** (tabla):

| Cohorte | N miembros | % del total | LTV promedio |
|---------|-----------|-------------|-------------|
| < 1 mes | N | % | S/ |
| 1-3 meses | N | % | S/ |
| 3-6 meses | N | % | S/ |
| > 6 meses | N | % | S/ |

---

# MÓDULO 8 — ACCESOS

## Página RC-01 — Control de Acceso LIVE (`/dashboard/recepcionista`)

### Objetivo
Gestión de entradas y salidas en tiempo real. La pantalla más crítica del sistema para la operación diaria.

### Actor autorizado
Recepcionista, Supervisor

### Permisos requeridos
`gym.accesos.ver` + `gym.accesos.crear`

### KPIs (4 cards)

| Card | Dato | Semáforo |
|------|------|----------|
| Accesos de hoy | N entradas confirmadas | — |
| Aforo ahora | N / capacidad | Rojo si > 90% |
| Denegados hoy | N intentos rechazados | Naranja si > 0 |
| Próxima clase | Nombre + en X minutos | — |

### Zona principal — Escáner QR y Feed Live

**Input de escaneo:**
- Área visual de cámara (si dispositivo tiene cámara) o input de texto para lector QR externo
- Activo y enfocado por defecto al cargar la página
- El cursor vuelve al input automáticamente después de cada escaneo
- Shortcut: Enter en el input procesa el código

**Respuesta al escanear (feedback inmediato < 500ms):**

ENTRADA PERMITIDA:
```
┌──────────────────────────────────────────┐
│  ✅  ACCESO PERMITIDO                     │
│  [Foto 80px]  María González             │
│               Plan: Mensual Premium      │
│               Vence: 15 Jun 2026         │
│               (auto-cierra en 3 segundos) │
└──────────────────────────────────────────┘
```
(Fondo verde, sonido de confirmación opcional)

ACCESO DENEGADO:
```
┌──────────────────────────────────────────┐
│  ❌  ACCESO DENEGADO                      │
│  [Foto 80px]  Carlos Pérez               │
│               Membresía vencida hace 3 días │
│               [Enviar al cajero →]       │
│               (auto-cierra en 5 segundos) │
└──────────────────────────────────────────┘
```
(Fondo rojo, badge de alerta)

**Feed Live (lista de últimos 30 accesos):**
- Actualización en tiempo real via Supabase Realtime channel
- Cada fila: timestamp, avatar, nombre, tipo (✅ Entrada / ❌ Denegado), badge de membresía
- Las últimas entradas aparecen en la parte superior con animación de slide-in
- Indicador de conexión: punto verde pulsante "En vivo" / naranja "Reconectando"

### Panel lateral derecho — Alertas del turno

Lista de alertas ordenadas por urgencia:
- "Juan Torres — membresía vence HOY" → [Cobrar ahora]
- "Ana López — 3er acceso denegado" → [Ver perfil]
- "Clase de Yoga en 10 min — 2 cupos" → [Informativo]

### Estado vacío
"Esperando primer acceso del día... · El escáner está activo"
(Animación de cámara pulsante)

### Estado de error
- Realtime desconectado: banner amarillo "Conexión en tiempo real perdida. Los accesos se registran pero la lista no actualiza automáticamente." + botón "Reconectar"
- UUID inválido escaneado: feedback rápido "Código no reconocido" sin abrir modal

### Responsive behavior
- Esta pantalla está optimizada para tablet (el dispositivo típico en recepción)
- Tablet vertical: feed live ocupa 60% de pantalla, escáner + KPIs el 40%
- Mobile: solo el escáner y el último resultado son visibles. Feed en tab separada
- Desktop: layout completo con panel de alertas en sidebar derecho

---

# MÓDULO 9 — CLASES

## Página AD-04b — Agenda de Clases (`/dashboard/admin/clases`)

### Objetivo
Gestión completa del programa de clases: agenda, ocupación, y administración.

### Permisos requeridos
`gym.clases.ver` (ver) + `gym.clases.gestionar` (crear/editar/cancelar)

### Vista Agenda Semanal

**Calendario tipo "Google Calendar":**
- Vista semana: columnas L-D, filas por hora (6am - 10pm)
- Cada clase: bloque coloreado por entrenador, muestra nombre de clase + N/capacidad
- Clic en clase: abre panel lateral con detalle
- Botón "+ Nueva Clase" flotante

**Panel de detalle de clase:**
- Nombre, entrenador, espacio, horario
- Lista de inscritos con avatar y nombre
- Barra de ocupación con % visual
- Acciones: Editar / Cancelar clase (con modal de confirmación)
- En Fase D: botón "Notificar a inscritos"

### Vista Lista (alternativa)

Tabla compacta para ver muchas clases:
| Hora | Nombre | Entrenador | Espacio | Inscritos | Estado |
|------|--------|-----------|---------|-----------|--------|

### Filtros
- Por entrenador
- Por espacio
- Por estado: activas / canceladas / completadas
- Por rango de fechas

---

# MÓDULO 10 — NUTRICIÓN

## Página NU-01 — Mis Pacientes (`/dashboard/nutricionista`)

### Objetivo
Vista rápida del estado de todos los pacientes asignados.

### Permisos requeridos
`gym.nutricion.ver` + `gym.usuarios.ver`

### Tabla de pacientes

| Columna | Dato | Notas |
|---------|------|-------|
| Paciente | Avatar + Nombre | Clickable → ficha completa |
| Plan activo | Sí/No (badge) | Si No: badge naranja |
| Última evaluación | "Hace N días" | Rojo si > 30 días |
| Próxima revisión | Fecha o "No programada" | — |
| Acciones | [Ver ficha] [Nueva evaluación] | — |

### Alertas (panel superior)

```
⚠️  3 pacientes sin plan activo
⏰  2 pacientes sin evaluación en más de 30 días
```

### Estado vacío
"Aún no tienes pacientes asignados. El administrador del gym te asignará pacientes."

---

## Página NU-02 — Plan Nutricional (`/dashboard/nutricionista/planes/[id]`)

### Objetivo
Creación y edición de un plan nutricional completo para un paciente.

### Secciones del plan

1. **Objetivos**: texto libre con meta del paciente (bajar peso, ganar masa, mantenimiento)
2. **Parámetros base**: calorías diarias objetivo, distribución de macros (% proteína, carbos, grasas), hidratación
3. **Distribución por comidas**: N comidas por día, calorías por comida
4. **Comidas del día** (acordeón expandible por cada comida):
   - Nombre de la comida (Desayuno, Almuerzo, etc.)
   - Lista de alimentos con gramos y valores nutricionales
   - Recetas opcionales vinculadas desde la biblioteca
5. **Observaciones del nutricionista**: notas clínicas
6. **Vigencia del plan**: fechas de inicio y revisión programada

### Acciones
- Guardar borrador (auto-save cada 30s)
- Publicar plan (activa el plan para el paciente)
- Duplicar plan (crear desde este como template)
- Imprimir plan en PDF

---

# MÓDULO 11 — AUDITORÍA

## Página AD-07 — Audit Log (`/dashboard/admin/auditoria`)

### Objetivo
Trazabilidad completa de acciones del personal para investigación de incidentes y compliance.

### Permisos requeridos
`gym.reportes.ver`

### KPIs (header)

| Card | Dato |
|------|------|
| Eventos hoy | N total de acciones registradas |
| Acciones críticas | N de tipo: ROLE_REVOKED / CODE_REVOKED / MEMBERSHIP_CANCELLED |
| Actores activos hoy | N trabajadores que realizaron acciones |

### Filtros (sidebar izquierdo o panel superior)

| Filtro | Opciones |
|--------|----------|
| Actor | Búsqueda por nombre de trabajador |
| Tipo de acción | Selector múltiple de los 11 tipos canónicos |
| Módulo afectado | gym.usuarios / gym.pagos / gym.accesos / public.user_roles / etc. |
| Rango de fechas | DatePicker desde/hasta |
| Buscar en texto | Búsqueda full-text en la descripción de la acción |

### Tabla principal

| Columna | Dato | Notas |
|---------|------|-------|
| Timestamp | DD MMM YYYY HH:mm:ss | Timezone local |
| Actor | Avatar + Nombre + badge de Rol | — |
| Acción | Descripción legible en español | "Revocó acceso de Pedro Quispe (Entrenador)" |
| Módulo | Badge del módulo afectado | Coloreado por módulo |
| Detalle | Ícono "🔍" | Click → abre modal de detalle |

### Modal de detalle de evento

```
┌─────────────────────────────────────────────────────┐
│  ROLE_REVOKED · 03 Jun 2026 · 14:32:17              │
│                                                     │
│  Actor: Eduardo Paipay (Administrador General)      │
│  Objetivo: Pedro Quispe (user_id: abc-123)          │
│  Razón: Fin de contrato                             │
│  Tipo: Definitivo                                   │
│                                                     │
│  VALORES ANTERIORES:              VALORES NUEVOS:   │
│  expires_at: NULL         →       expires_at: now() │
│  revoked_by: NULL         →       revoked_by: edu-id│
│  revocation_reason: NULL  →       "Fin de contrato" │
└─────────────────────────────────────────────────────┘
```

### Exportar
- Botón "Exportar CSV" con los filtros activos
- Nombre del archivo: `gymsos-audit-2026-06-03.csv`

### Estado vacío
"No hay eventos de auditoría registrados para este período"
(Información útil: los eventos se registran automáticamente conforme el personal opera el sistema)

### Responsive behavior
- Desktop: tabla con todas las columnas + sidebar de filtros
- Tablet: tabla compacta + filtros en drawer
- Mobile: lista de cards (una por evento) + filtros en modal inferior

---

# MÓDULO 12 — CONFIGURACIÓN

## Página AD-08 — Configuración del Gym (`/dashboard/admin/configuracion`)

### Objetivo
Gestión de la identidad y estructura operativa del gimnasio.

### Permisos requeridos
`gym.config.ver` (ver) + `gym.config.editar` (modificar)

### Tab 1 — Datos del Gym

**Formulario con validación en tiempo real:**

| Campo | Tipo | Validación |
|-------|------|-----------|
| Nombre del gym | Text | Requerido, max 100 chars |
| RUC / NIT | Text | Formato numérico según país |
| País | Select | Lista de países Latam |
| Ciudad | Text | — |
| Dirección | Textarea | — |
| Teléfono de contacto | Phone | Formato internacional |
| Email del gym | Email | Validación de formato |
| Logo | Upload | PNG/JPG max 2MB, muestra preview |
| Horario de apertura | Time picker | Por día de la semana |

**Comportamiento del botón Guardar:**
- Confirmación antes de guardar: "¿Guardar los cambios en los datos del gym?"
- Éxito: toast "Cambios guardados · Registrado en auditoría"
- Cambio registrado en `audit_logs` con action = 'GYM_CONFIG_UPDATED'

### Tab 2 — Planes de Membresía

**Lista de planes activos:**
- Card por cada plan: nombre, precio, duración, número de miembros activos en ese plan
- Badges: "Activo" (verde) / "Inactivo" (gris)
- Botones: [Editar] [Desactivar] — Desactivar solo si no tiene miembros activos

**Formulario de nuevo plan (modal):**
| Campo | Tipo | Notas |
|-------|------|-------|
| Nombre | Text | Ej: "Mensual Estándar" |
| Precio | Number (S/) | — |
| Duración | Number + selector (días/meses) | — |
| Descripción breve | Text | Para mostrar al miembro |
| Límite de clases por semana | Number | Opcional, 0 = ilimitado |
| Color identificador | Color picker | Para diferenciar en la UI |

**Regla de negocio en la UI:**
- No se puede eliminar un plan con miembros activos — solo desactivar
- Si se desactiva: "No se generarán nuevas membresías con este plan. Los actuales no se afectan."

### Tab 3 — Espacios y Equipamiento

**Gestión de espacios (salas, canchas):**
- Lista con: nombre, capacidad máxima, estado (disponible/mantenimiento)
- Formulario de creación: nombre + capacidad + descripción
- Cada espacio tiene un QR único para identificación física

**Gestión de equipamiento:**
- Lista de máquinas con: nombre, código, QR, estado
- Reportar falla de equipo (crea alerta en el dashboard del admin)

### Tab 4 — Integraciones (Fase D)

| Integración | Estado actual | Acción |
|-------------|---------------|--------|
| Stripe (pagos digitales) | No configurado | [Configurar] |
| Gemini AI (churn + recomendaciones) | No configurado | [Configurar] |
| Web Push (notificaciones) | No configurado | [Activar] |
| Google Fit / Apple Health | No disponible | Badge "Próximamente" |

Cada integración muestra: descripción de qué hace + requisitos + instrucciones de configuración en un paso a paso.

---
