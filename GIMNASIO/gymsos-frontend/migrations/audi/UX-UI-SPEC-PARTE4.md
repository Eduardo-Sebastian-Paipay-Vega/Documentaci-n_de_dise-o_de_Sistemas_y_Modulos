# ESPECIFICACIÓN UX/UI — PARTE 4
## FASE 9 — DESIGN SYSTEM · FASE 10 — AUDITORÍA UX FINAL

---

# FASE 9 — DESIGN SYSTEM

## 9.1 Jerarquía Visual

### Escala de tipografía

| Nombre | Uso | Tamaño | Peso | Line-height |
|--------|-----|--------|------|-------------|
| Display | KPI números grandes (S/ 2,450) | 36px | 700 | 1.1 |
| H1 | Título de página (Lista de Miembros) | 28px | 700 | 1.2 |
| H2 | Subtítulo de sección (Tab activa) | 22px | 600 | 1.3 |
| H3 | Título de widget / card | 18px | 600 | 1.4 |
| Body Large | Texto principal de tabla y formularios | 15px | 400 | 1.6 |
| Body | Texto secundario, labels | 14px | 400 | 1.6 |
| Body Small | Meta-información, timestamps, helpers | 12px | 400 | 1.5 |
| Caption | Tooltips, pie de página de modales | 11px | 400 | 1.4 |

**Fuente principal**: Inter (variable weight) — presente en Tailwind por defecto
**Fuente monoespaciada**: JetBrains Mono — para códigos de invitación, IDs, valores de auditoría

### Paleta de colores

**Colores de marca (base del sistema):**
```
Primary     #2563eb   (Azul — acciones principales, links)
Primary-dk  #1d4ed8   (Hover de primary)
Secondary   #7c3aed   (Morado — elementos secundarios)
Neutral     #64748b   (Gris — texto secundario)
```

**Semáforo de estados:**
```
Success     #059669   (Verde — ok, activo, permitido)
Warning     #d97706   (Naranja/Ámbar — por vencer, atención)
Error       #dc2626   (Rojo — denegado, crítico, vencido)
Info        #0284c7   (Azul claro — información, live)
```

**Fondos:**
```
Background    #f8fafc   (Gris muy claro — fondo general)
Surface       #ffffff   (Blanco — cards, modales, paneles)
Surface-alt   #f1f5f9   (Gris claro — fondos de tabla fila alterna)
Border        #e2e8f0   (Gris borde)
Border-dark   #cbd5e1   (Gris borde con mayor contraste)
```

**Texto:**
```
Text-primary    #0f172a   (Negro suave — texto principal)
Text-secondary  #64748b   (Gris — texto auxiliar, labels)
Text-disabled   #94a3b8   (Gris claro — elementos deshabilitados)
Text-inverse    #ffffff   (Blanco — texto sobre fondo oscuro)
```

### Espaciado (basado en múltiplos de 4px)

```
xs:   4px    (gap entre iconos y texto)
sm:   8px    (padding interno de badges, separación entre chips)
md:   12px   (padding de botones secondary)
base: 16px   (padding de elementos base, gap entre elementos relacionados)
lg:   24px   (padding de cards, sección spacing)
xl:   32px   (spacing entre secciones de página)
2xl:  48px   (separación entre zonas del dashboard)
3xl:  64px   (padding de páginas en desktop)
```

### Sombras

```
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)         Cards en estado normal
shadow:     0 2px 8px rgba(0,0,0,0.08)          Cards on hover, dropdowns
shadow-md:  0 4px 16px rgba(0,0,0,0.10)         Modales, drawers
shadow-lg:  0 8px 32px rgba(0,0,0,0.12)         Notificaciones flotantes
```

---

## 9.2 Componentes Reutilizables

### KPI Card

**Anatomía:**
```
┌──────────────────────────────────────────────────────┐
│  [Label — Body Small, gris]                          │
│                                                      │
│  [Valor principal — Display, negro]                  │
│                                                      │
│  [↑ +12% vs ayer — Body Small, verde/rojo/gris]      │
│                                                      │
│  [Barra de semáforo en la parte inferior (opcional)] │
└──────────────────────────────────────────────────────┘
```

**Variantes:**
- `default` — sin semáforo, fondo blanco
- `alert` — borde izquierdo rojo 4px, fondo rojo-50
- `warning` — borde izquierdo naranja, fondo amber-50
- `success` — borde izquierdo verde, fondo green-50
- `loading` — skeleton animado para estado de carga

**Comportamiento:**
- Hover: shadow sube de sm a md
- Click opcional: navega a la página del módulo correspondiente
- Tooltip en la variación %: "vs ayer 08:00am - ahora" (explicación del período)

---

### Badge de Estado

Los badges son chips de texto con fondo coloreado. Tienen 2 tamaños.

**Variantes por entidad:**

Para membresías:
```
[Activa]         bg-green-100  text-green-700
[Por vencer]     bg-amber-100  text-amber-700
[Vencida]        bg-red-100    text-red-700
[Sin membresía]  bg-gray-100   text-gray-600
```

Para staff:
```
[Activo]         bg-green-100  text-green-700
[Suspendido]     bg-amber-100  text-amber-700
[Revocado]       bg-red-100    text-red-700
[Por expirar]    bg-orange-100 text-orange-700
```

Para roles:
```
[Administrador]  bg-blue-900   text-white
[Supervisor]     bg-amber-600  text-white
[Cajero]         bg-emerald-600 text-white
[Recepcionista]  bg-blue-500   text-white
[Entrenador]     bg-violet-600 text-white
[Nutricionista]  bg-teal-600   text-white
[Miembro]        bg-gray-200   text-gray-700
```

Para códigos:
```
[Activo]         bg-green-100  text-green-700
[Usado]          bg-blue-100   text-blue-700
[Expirado]       bg-gray-100   text-gray-600
[Revocado]       bg-red-100    text-red-700
```

Para formas de pago:
```
[Efectivo]       bg-green-100  text-green-800
[Yape]           bg-purple-100 text-purple-800
[Plin]           bg-blue-100   text-blue-800
[Tarjeta]        bg-gray-100   text-gray-700
[Transferencia]  bg-slate-100  text-slate-700
```

---

### Tabla de Datos

**Estructura de columnas:**
- Checkbox de selección (opcional, para acciones en bulk)
- Contenido de datos
- Columna de acciones: siempre la última, con menú ⋮ o botones directos

**Comportamiento:**
- Hover en fila: fondo `bg-slate-50` con transición 100ms
- Click en fila: navega al detalle o abre drawer (si está configurado)
- Ordenable: click en header de columna → ícono de chevron indica orden
- Paginación: 25 filas por defecto, selector de 10/25/50/100

**Skeleton durante carga:**
- Las filas se reemplazan por rectángulos grises animados (shimmer)
- La altura de los skeletons coincide con la altura real de las filas
- 5 filas de skeleton por defecto

**Estado vacío de tabla:**
```
[Icono ilustrativo — relacionado con el módulo]
No hay [entidades] que mostrar
[Descripción de por qué podría estar vacío]
[Botón de acción principal, si aplica]
```

**Estado de error de tabla:**
```
[Icono de advertencia]
No se pudieron cargar los datos
Verifica tu conexión a internet
[Reintentar]
```

---

### Modal

**Variantes:**
- `info` — informativo sin acción destructiva
- `confirm` — confirmación de acción reversible
- `destructive` — confirmación de acción irreversible (borde rojo, botón rojo)
- `form` — contiene formulario (mayor ancho)
- `fullscreen` — para formularios complejos (plan nutricional, configuración)

**Estructura del modal:**
```
┌──────────────────────────────────────────────────────┐
│  [Título del modal]                            [×]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Contenido: texto informativo, formulario o lista]  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [Botón cancelar — secundario]  [Botón acción — CTA] │
└──────────────────────────────────────────────────────┘
```

**Reglas de diseño del modal:**
- Fondo overlay: `rgba(0,0,0,0.4)` con blur 2px en el contenido detrás
- El modal se centra vertical y horizontalmente
- Esc cierra el modal (excepto modales destructivos — requieren clic explícito en Cancelar)
- Ancho máximo: 480px (info/confirm), 640px (form), 90vw (fullscreen)
- Animación de entrada: scale de 0.95 a 1.0 + fade in, 150ms

**Jerarquía de botones en modales:**

Para acciones normales:
```
[Cancelar — outline gris]   [Confirmar — solid blue]
```

Para acciones destructivas:
```
[Cancelar — outline gris]   [Revocar acceso — solid red]
```

---

### Formularios

**Estructura de campo:**
```
[Label — Body, negro, obligatorio: asterisco rojo]
┌──────────────────────────────────────────────────────┐
│ [Placeholder o valor]                                │
└──────────────────────────────────────────────────────┘
[Helper text — Body Small, gris] o [Error — Body Small, rojo]
```

**Estados del campo:**
- `default` — borde gris, fondo blanco
- `focus` — borde azul, ring de 2px
- `filled` — borde gris oscuro
- `error` — borde rojo, helper text rojo, ícono de X al final del input
- `success` — borde verde, ícono de checkmark al final del input
- `disabled` — fondo gris-50, texto gris, cursor no permitido

**Validación:**
- Validación en tiempo real: onBlur (al perder el foco)
- Errores de servidor: mostrar al lado del campo afectado, no solo en toast
- Resumen de errores al intentar enviar: scroll al primer campo con error

---

### Drawer (Panel lateral)

**Especificaciones:**
- Ancho: 400px en desktop (no colapsable dentro del drawer)
- Posición: desde el borde derecho de la pantalla
- Overlay: `rgba(0,0,0,0.3)` sobre el contenido principal
- Click en overlay: cierra el drawer
- El contenido principal no se comprime — el drawer se superpone
- Animación: slide desde la derecha, 200ms ease-out

**Estructura del drawer:**
```
┌─────────────────────────────────────────────────────┐
│  [Header: título + botón cerrar ×]                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Contenido scrolleable]                            │
│  (El header queda fijo, el contenido hace scroll)   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Footer fijo: acciones principales]               │
└─────────────────────────────────────────────────────┘
```

---

### Estados de Carga

**Skeleton loaders** (para carga inicial de datos):
- Forma rectangular gris con animación shimmer (de izquierda a derecha)
- Usar para: tablas, cards de KPI, listas de widgets
- No usar para: botones, formularios (esos aparecen vacíos)

**Spinner** (para acciones del usuario):
- Pequeño spinner circular en el botón que disparó la acción
- El botón se deshabilita y muestra el spinner hasta que la acción completa
- Texto del botón puede cambiar: "Guardar" → "Guardando..."

**Skeleton de tabla:**
```
[Header de tabla con columnas — visible pero no clickable]
[Fila 1 skeleton — 3 rectángulos de ancho variable]
[Fila 2 skeleton — 3 rectángulos de ancho variable]
[Fila 3 skeleton — 3 rectángulos de ancho variable]
[Fila 4 skeleton — 3 rectángulos de ancho variable]
[Fila 5 skeleton — 3 rectángulos de ancho variable]
```

---

### Estados Vacíos

**Principio**: Un estado vacío es una oportunidad de comunicación. Nunca mostrar un espacio en blanco sin contexto.

**Estructura del estado vacío:**
```
[Ilustración SVG — 120px, colores del módulo]
[Título — H3 — describe qué está vacío]
[Descripción — Body — explica por qué o cómo llenar]
[CTA — Botón opcional — acción para resolver el vacío]
```

**Catálogo de estados vacíos:**

| Pantalla | Ilustración | Título | Descripción | CTA |
|----------|-------------|--------|-------------|-----|
| Sin miembros | Siluetas de personas | "Tu gym no tiene miembros todavía" | "Comparte el código de acceso del gym para que las personas se registren" | [Ver código QR del gym] |
| Sin staff | Equipo vacío | "No hay trabajadores registrados" | "Genera un código de invitación para añadir a tu primer trabajador" | [Generar código] |
| Sin clases | Calendario vacío | "No hay clases programadas" | "Crea el horario de clases para que los miembros puedan inscribirse" | [Nueva clase] |
| Sin pagos hoy | Caja vacía | "No hay pagos registrados hoy" | "Los pagos aparecerán aquí cuando el cajero o recepcionista los registre" | — |
| Sin auditoría | Lupa | "Sin eventos en este período" | "Ajusta los filtros para ver eventos de otro período" | [Limpiar filtros] |
| Sin evaluaciones | Clipboard | "Sin evaluaciones registradas" | "Registra tu primera evaluación para hacer seguimiento del progreso" | [Nueva evaluación] |

---

### Alertas y Notificaciones (in-app)

**Toast notifications (parte superior derecha):**

```
✅ éxito  · Pago registrado exitosamente       [×]
⚠️ aviso  · Tu membresía vence en 3 días       [×]
❌ error  · No se pudo guardar. Reintenta       [×]  [Reintentar]
ℹ️ info  · Carlos usó tu código de invitación  [×]
```

**Especificaciones de toast:**
- Duración: 4 segundos (success/info) / 8 segundos (warning) / persistente (error)
- Máximo 3 toasts simultáneos
- Apilados verticalmente, el más reciente arriba
- Posición: top-right en desktop, top-center en mobile
- Animación: slide desde arriba + fade in/out

**Banners de alerta en página (inline):**

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️  Alcanzaste el límite de 10 licencias de tu plan Básico.     │
│      Para añadir más trabajadores, actualiza a Pro.              │
│      [Actualizar plan →]                                   [×]  │
└──────────────────────────────────────────────────────────────────┘
```

Para banners más críticos (bloqueo de funcionalidad):
```
┌──────────────────────────────────────────────────────────────────┐
│  🔴 Tu suscripción está suspendida. Algunas funciones no         │
│     están disponibles hasta que se regularice el pago.           │
│     [Regularizar pago →]                                   [×]  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Confirmaciones de acciones destructivas

**Principio**: Una acción destructiva requiere 2 pasos mínimos. Una acción irreversible requiere checkbox de confirmación explícita.

**Nivel 1 — Reversible (borrar borrador, cancelar edición):**
```
[Dialog simple]
¿Descartar cambios?
Los cambios no guardados se perderán.
[Cancelar]  [Descartar]
```

**Nivel 2 — Difícil de deshacer (cancelar membresía):**
```
[Modal confirm]
¿Cancelar la membresía de María González?
Esta acción cancelará su acceso al gym.
El historial se preservará.

Motivo: [campo de texto]

[Cancelar]  [Cancelar membresía]
```

**Nivel 3 — Irreversible (revocar acceso definitivo):**
```
[Modal destructive — borde rojo]
Revocar acceso definitivamente

Esta acción es irreversible. Carlos Pedraza
perderá el acceso inmediatamente.

☐ Confirmo que deseo revocar el acceso de
  Carlos Pedraza de forma permanente

[Cancelar]  [🔴 Confirmar revocación]
(botón de confirmación deshabilitado hasta que se marque el checkbox)
```

---

## 9.3 Iconografía

**Sistema de iconos**: Lucide React (ya presente en la mayoría de proyectos Next.js)

**Catálogo de iconos por módulo:**

| Módulo / Entidad | Ícono Lucide | Uso |
|-----------------|-------------|-----|
| Dashboard/Panel | `LayoutDashboard` | Sidebar item principal |
| Miembros | `Users` | Sidebar + header de sección |
| Miembro individual | `UserRound` | Avatar fallback |
| Membresía activa | `CheckCircle2` | Badge, estado |
| Membresía vencida | `XCircle` | Badge, estado |
| Membresía por vencer | `AlertTriangle` | Badge, estado, alerta |
| Pago | `Receipt` | Historial, badge |
| Cobrar | `Banknote` | Botón de acción |
| Staff | `UserCog` | Sidebar, módulo |
| Invitar trabajador | `UserPlus` | Botón, sidebar |
| Revocar acceso | `UserX` | Acción destructiva |
| Código QR | `QrCode` | Módulo de códigos, QR del miembro |
| Compartir | `Share2` | Acción de compartir código |
| Roles/Permisos | `Shield` | Sidebar, módulo |
| Acceso QR (entrada) | `DoorOpen` | Control de acceso |
| Acceso denegado | `DoorClosed` | Estado de error en acceso |
| Clases | `Calendar` | Sidebar, módulo |
| Clase en curso | `Activity` | Badge "AHORA" |
| Entrenador | `Dumbbell` | Rol, módulo |
| Nutrición | `UtensilsCrossed` | Rol, módulo |
| Evaluación | `ClipboardList` | Módulo |
| Auditoría/Log | `FileSearch` | Sidebar, módulo |
| Configuración | `Settings` | Sidebar, módulo |
| Reporte/Analytics | `TrendingUp` | Sidebar, módulo |
| Exportar | `Download` | Botón de exportación |
| Filtro | `SlidersHorizontal` | Botón de filtros |
| Búsqueda | `Search` | Input, botón global |
| Live/Realtime | `Radio` | Badge de conexión activa |
| Alerta crítica | `AlertCircle` | Evento crítico en audit |
| Notificación | `Bell` | Header, notificaciones |
| Más opciones | `MoreVertical` (⋮) | Menú contextual de tabla |
| Cerrar | `X` | Modales, drawers, chips |
| Atrás | `ArrowLeft` | Navegación |
| Externo | `ExternalLink` | Links que salen del sistema |
| Copiar | `Copy` | Copiar código al clipboard |
| WhatsApp | Ícono SVG custom | Compartir por WhatsApp |

---

## 9.4 Layout y Grilla

### Layout principal del sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER GLOBAL (64px)                                               │
│  [Logo + gym name] ............ [🔔] [Cmd+K] [Avatar usuario]      │
├────────────────┬────────────────────────────────────────────────────┤
│                │                                                     │
│  SIDEBAR       │  ÁREA PRINCIPAL DE CONTENIDO                       │
│  (260px open   │                                                     │
│   64px closed) │  Header de página (32px padding)                   │
│                │  ┌──────────────────────────────────────────────┐  │
│  Navegación    │  │  Título + breadcrumb + acciones de página    │  │
│  colapsable    │  └──────────────────────────────────────────────┘  │
│                │                                                     │
│                │  Contenido de la página                             │
│                │  (padding: 24px horizontal, 24px vertical)         │
│                │                                                     │
└────────────────┴────────────────────────────────────────────────────┘
```

### Grilla del dashboard

El área de contenido usa una grilla de 12 columnas con gaps de 16px.

**Zonas del dashboard del Administrador:**
- Zona 1 (KPI cards): cada card = 12/5 columnas (aprox. 20% del ancho). En 5 cards: cols 2.4 cada una
- Zona 2 (gráficos): 7/12 + 5/12
- Zona 3 (acciones urgentes): 6/12 + 6/12
- Zona 4 (snapshot): 4/12 + 4/12 + 4/12

### Breakpoints del sistema

| Nombre | px | Cambios |
|--------|----|---------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet portrait — sidebar colapsa, grilla 2 cols |
| lg | 1024px | Tablet landscape — sidebar expandido opcional |
| xl | 1280px | Desktop estándar — layout completo |
| 2xl | 1536px | Desktop ancho — contenido más espacioso |

---

# FASE 10 — AUDITORÍA UX FINAL

## 10.1 Fricción detectada y propuesta de mejora

### F-01 — El menú de acciones ⋮ requiere demasiados clics para acciones frecuentes

**Detectado en**: Tabla de miembros, tabla de staff
**Problema**: Para renovar la membresía de un miembro (acción más frecuente), el recepcionista debe: 1) encontrar la fila, 2) abrir el menú ⋮, 3) hacer clic en "Registrar pago". Son 3 interacciones para la acción más común.
**Propuesta**: Para las 1-2 acciones más frecuentes de cada tabla, mostrarlas directamente como botón en la fila (no dentro del menú ⋮). El menú ⋮ contiene el resto.

**Ejemplo en tabla de miembros:**
```
[Nombre + membresía]  [Plan]  [Vence]  [Renovar]  [⋮]
                                        ↑ botón directo
```

---

### F-02 — El QR del miembro requiere múltiples pasos para acceder en mobile

**Detectado en**: Dashboard del miembro en mobile
**Problema**: Al abrir la app, el miembro tiene que: autenticarse → ver dashboard → encontrar el QR. En una situación real (haciendo fila en el gym) cada segundo cuenta.
**Propuesta**: 
1. Recordar la sesión por 30 días (no pedir login cada vez)
2. El QR debe ser el primer elemento visible al abrir la app (ya está diseñado así)
3. Añadir un widget de pantalla de inicio (Progressive Web App) que abre directamente al QR

---

### F-03 — El formulario de registro de miembro nuevo tiene demasiados campos obligatorios

**Detectado en**: RC-02 — Registro de nuevo miembro
**Problema**: El recepcionista necesita registrar a alguien rápidamente durante hora pico. Un formulario con 8+ campos obligatorios crea un cuello de botella.
**Propuesta**: 
- Campos mínimos obligatorios: nombre + email + plan + pago (4 campos)
- El resto (teléfono, documento, fecha de nacimiento) puede completarse después en el perfil
- Badge "Perfil incompleto" en el perfil del miembro para que el admin recuerde completarlo

---

### F-04 — El panel de auditoría podría intimidar a administradores no técnicos

**Detectado en**: AD-07 — Auditoría
**Problema**: La tabla de audit_logs con nombres de tablas técnicas (public.user_roles, gym.membresias) puede ser confusa para un dueño de gym sin background técnico.
**Propuesta**:
- Las acciones se muestran en lenguaje natural en español: "Carlos Pedraza registró un pago de S/150 para María González" en lugar de "PAYMENT_CREATED on gym.pagos"
- La información técnica (tabla afectada, IDs) está disponible en el modal de detalle, no en la vista principal
- Los nombres de tabla se traducen a nombres legibles: gym.pagos → "Módulo de Pagos"

---

### F-05 — La generación de código de staff no acompaña al usuario hasta confirmar que funcionó

**Detectado en**: Tab "Invitar" en AD-04
**Problema**: El admin genera el código, lo comparte por WhatsApp y luego no sabe si el trabajador lo usó. No hay feedback de cierre del loop.
**Propuesta** (Fase D):
- Notificación al admin cuando el código es usado: "Pedro Quispe usó el código de Recepcionista y ya está activo en tu equipo"
- Badge en la tabla del historial de códigos: "Usado hace 2 horas" con animación de nuevo

---

### F-06 — El Cajero no tiene acceso rápido al historial de pagos de un miembro específico

**Detectado en**: Dashboard del Cajero
**Problema**: El cajero a veces necesita verificar si un miembro ya pagó o tiene una deuda antigua. En la pantalla actual solo ve el historial del turno, no el historial por miembro.
**Propuesta**:
- En el card de cobro rápido (cuando el cajero selecciona un miembro), añadir link "Ver historial de pagos" que abre un drawer compacto con los últimos 5 pagos del miembro

---

## 10.2 Complejidad innecesaria detectada

### C-01 — La Página de Roles y Permisos puede abrumar

**Detectado en**: AD-05 — Matriz de permisos
**Problema**: 37 permisos × 7 roles = 259 celdas. Sin grouping, es inmanejable.
**Solución ya incorporada en el diseño**: Agrupación colapsable por módulo. Por defecto, todos los módulos están colapsados y el usuario expande el que necesita.
**Mejora adicional**: Botón "Vista simplificada" que muestra solo los permisos que difieren entre roles (oculta los universales como gym.usuarios.ver que todos tienen).

---

### C-02 — El formulario de plan nutricional puede ser intimidante

**Detectado en**: NU-02 — Plan Nutricional
**Problema**: Un plan nutricional completo tiene muchas secciones. Si el nutricionista ve todo desde el principio, puede sentirse abrumado.
**Propuesta**:
- Formulario en modo "paso a paso" (wizard): Paso 1: Objetivos → Paso 2: Parámetros → Paso 3: Comidas → Paso 4: Revisión
- Alternativamente: modo "desde template" donde el nutricionista elige un template base y modifica solo lo necesario

---

### C-03 — La tabla de historial de códigos tiene demasiadas columnas

**Detectado en**: Tab 3 del módulo de Staff
**Problema**: 8 columnas en la tabla pueden quedar comprimidas en pantallas medianas.
**Propuesta**:
- En desktop (xl+): todas las columnas
- En tablet (md-lg): ocultar "Creado por" y "Vence/Venció" (disponibles en el modal de detalle)
- Añadir capacidad de personalizar columnas visibles (Fase C)

---

## 10.3 Pantallas redundantes

### R-01 — Dashboard de "cliente" es idéntico al de "miembro"

**Ya resuelto en DA-03**: El rol "cliente" se depreca como alias de "miembro". El dashboard de `/dashboard/cliente` redirige a `/dashboard/miembro`.
**Acción de diseño**: No crear diseño separado para cliente. Un solo diseño de miembro que sirve a ambos.

---

### R-02 — "Membresías activas" y "Lista de miembros con filtro=activa" se superponen

**Detectado en**: Sidebar del Admin tiene tanto "Miembros > Todos los miembros" como "Membresías & Pagos > Membresías activas".
**Distinción real**:
- "Todos los miembros": enfocado en gestión de personas (perfil, historial, churn)
- "Membresías activas": enfocado en gestión financiera (vencimientos, renovaciones, flujo de caja)
**Conclusión**: No son redundantes — tienen perspectivas distintas. La diferencia debe ser clara en el diseño de cada página con sus KPIs y acciones específicas.

---

## 10.4 Riesgos de usabilidad

### RU-01 — Un error al revocar el acceso puede afectar al trabajador equivocado

**Riesgo**: En la tabla de staff con muchos trabajadores, el admin podría hacer clic en "Revocar" de la fila incorrecta.
**Mitigación en el diseño**:
- El modal de revocación siempre muestra el nombre del trabajador afectado prominentemente
- La foto/avatar también aparece en el modal (no solo el nombre)
- La acción destructiva requiere el checkbox de confirmación explícita

---

### RU-02 — La búsqueda de miembro en el cajero puede devolver múltiples resultados confusos

**Riesgo**: "Juan García" puede existir 3 veces. El cajero podría cobrar al Juan García equivocado.
**Mitigación**:
- Los resultados de búsqueda muestran: nombre + email + documento + foto
- Si hay múltiples resultados, mostrarlos en lista con suficiente contexto para distinguirlos
- Requiere que el cajero confirme visualmente la foto antes de proceder

---

### RU-03 — El Supervisor puede confundir "Autorizar acceso excepcional" con un bypass permanente

**Riesgo**: El Supervisor autoriza la entrada de un miembro con membresía vencida "por esta vez" y el sistema lo registra como acceso permitido sin renovar la membresía.
**Mitigación en el diseño**:
- "Autorizar acceso excepcional" crea un registro temporal con nota obligatoria
- Al autorizar: badge "EXCEPCIÓN — no renueva membresía" en el log de accesos
- Alerta al administrador: "El Supervisor autorizó una excepción para Juan Torres. Su membresía vencida sigue pendiente."

---

### RU-04 — El entrenador puede cerrar una clase sin haber tomado asistencia

**Riesgo**: El entrenador hace clic en "Cerrar clase" sin marcar los asistentes.
**Mitigación**:
- Si 0 asistentes marcados: modal de advertencia "¿Cerrar la clase sin registrar asistentes? Esto se registrará como clase sin asistencia."
- Dos opciones: "Tomar asistencia ahora" | "Cerrar sin asistencia"
- Si la clase tiene inscritos pero 0 marcados: el warning es más insistente

---

## 10.5 Riesgos operativos

### RO-01 — Pérdida de acceso al gym por fallo de la app del miembro

**Riesgo**: El QR del miembro no carga (sin conexión, app con error). El miembro no puede entrar al gym.
**Mitigación en el diseño**:
- El QR del miembro es accesible en modo offline (PWA con cache) — Fase D
- La recepcionista tiene acceso a buscar el miembro por nombre/documento y registrar el acceso manualmente
- Instrucción en la pantalla de recepción: "Si el QR no funciona → buscar por nombre →"

---

### RO-02 — Pérdida de conexión en Realtime para la recepcionista

**Riesgo**: Supabase Realtime se desconecta durante la operación. El feed de accesos deja de actualizar pero la recepcionista no lo sabe.
**Mitigación en el diseño** (ya incorporada):
- Badge visible "En vivo 🟢" o "Desconectado 🟡"
- Banner de aviso cuando la conexión se pierde
- Los accesos se siguen registrando normalmente — solo el display en tiempo real se ve afectado

---

### RO-03 — El administrador genera demasiados códigos sin usar

**Riesgo**: Si el admin genera 20 códigos para "por si acaso", el límite de licencias se agota sin que se usen.
**Nota**: El límite de licencias se basa en user_roles activos, no en códigos generados. Los códigos sin usar no consumen licencias.
**Comunicación en la UI**: Tooltip en el KPI de licencias: "Las licencias se cuentan por trabajadores activos, no por códigos generados. Un código sin usar no consume licencias."

---

### RO-04 — Un trabajador revocado intenta usar credenciales guardadas en el navegador

**Riesgo**: Después de ser revocado, el trabajador tiene las credenciales guardadas en su navegador. Intenta acceder.
**Mitigación existente** (no requiere diseño):
- El JWT expira naturalmente (tiempo de vida del token de Supabase)
- fn_has_permission() rechaza cualquier operación con su user_id
- La primera acción que intente hacer fallará con 403 → redirección al login
**Diseño del mensaje de error en login** (post-revocación):
```
Tu acceso a [Nombre del Gym] ha sido desactivado.
Contacta al administrador del gimnasio para más información.
```

---

## 10.6 Propuestas de mejora adicionales

### M-01 — Onboarding guiado para el Administrador nuevo

**Cuándo aplica**: Primera sesión del dueño, inmediatamente después del onboarding del gym.

**Diseño propuesto — Checklist de primeros pasos:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🚀 Configura tu GYMsos en 5 pasos                               │
│                                                                  │
│  ✅ 1. Gym creado exitosamente                                   │
│  ☐  2. Añade los planes de membresía  [Ir a Configuración →]    │
│  ☐  3. Invita a tu primer trabajador  [Generar código →]        │
│  ☐  4. Registra tu primer miembro    [Nuevo miembro →]          │
│  ☐  5. Prueba el control de acceso   [Ir a Recepción →]         │
│                                                                  │
│  [Ocultar esta guía]                     2 de 5 completados     │
└──────────────────────────────────────────────────────────────────┘
```
Este banner aparece en el dashboard hasta que los 5 pasos se completan.

---

### M-02 — Indicadores de "hora pico" en el dashboard de clases

**Para el Entrenador y el Administrador**: Si una clase tiene lista de espera frecuente, marcarla con badge "Alta demanda 🔥" para que el admin considere duplicarla.

---

### M-03 — Historial de búsquedas recientes en búsqueda global (Cmd+K)

**Comportamiento**: La búsqueda global recuerda los últimos 5 miembros buscados en la sesión. Al abrir Cmd+K, aparecen como "Búsquedas recientes" sin tener que escribir.
**Caso de uso**: El cajero busca al mismo miembro 3 veces en un día (renovación en partes, corrección de datos, verificación de estado).

---

### M-04 — Vista de impresión del perfil del miembro

**Para**: Administradores que necesitan imprimir fichas de miembros para archivos físicos.
**Diseño**: Botón "Imprimir ficha" en el perfil del miembro que activa un `@media print` con layout optimizado para A4. Sin sidebar, sin header, solo los datos del miembro en formato de ficha.

---

### M-05 — Modo compacto de tabla para densidad de información alta

**Para**: Pantallas donde se muestran muchos miembros o muchas transacciones.
**Diseño**: Toggle "Vista compacta" en el header de cada tabla que reduce el padding de las filas de 16px a 8px, permite ver más filas sin scroll.

---

## 10.7 Resumen ejecutivo de la auditoría UX

| Categoría | Hallazgos | Prioridad de resolución |
|-----------|-----------|------------------------|
| Fricción | 6 puntos detectados | F-01, F-03, F-06: Fase B · F-02: Fase D · F-04, F-05: Fase B |
| Complejidad innecesaria | 3 puntos | C-01: diseño ya incorporado · C-02: Fase D · C-03: Fase B |
| Pantallas redundantes | 2 puntos | R-01: resuelto en DA-03 · R-02: no redundante |
| Riesgos de usabilidad | 4 puntos | RU-01, RU-02: Fase B · RU-03, RU-04: Fase B |
| Riesgos operativos | 4 puntos | RO-01: Fase D · RO-02: Fase B · RO-03: comunicación UI · RO-04: comportamiento existente |
| Mejoras adicionales | 5 propuestas | M-01: Fase A · M-02, M-03: Fase C · M-04, M-05: Fase D |

**Veredicto de la auditoría UX:**
El sistema tiene una arquitectura de experiencia sólida. Los dashboards están diseñados con el principio de mínima exposición correctamente aplicado — cada rol ve solo lo que necesita. Los riesgos más importantes están en los flujos de alta frecuencia (cobro del cajero, escaneo QR de recepcionista, búsqueda de miembro) donde la fricción tiene mayor impacto operativo. La prioridad de diseño antes de la implementación debe ser: flujo del cajero → flujo de acceso del recepcionista → revocación de staff (los más críticos para la operación diaria del gym).

---

# ÍNDICE DE DOCUMENTOS DE ESPECIFICACIÓN UX/UI

| Parte | Archivo | Contenido |
|-------|---------|-----------|
| Parte 1 | UX-UI-SPEC-PARTE1.md | Fase 1 (Mapa de experiencia) · Fase 2 (Sidebars) |
| Parte 2 | UX-UI-SPEC-PARTE2.md | Fase 3 (Páginas por módulo: Dashboard General, Staff, Miembros, Membresías, Finanzas, Accesos, Clases, Nutrición, Auditoría, Configuración) |
| Parte 3 | UX-UI-SPEC-PARTE3.md | Fase 4 (Dashboards por rol) · Fase 5 (Staff Management flujos) · Fase 6 (Códigos de invitación flujos) · Fase 7 (Sistema de permisos visual) · Fase 8 (Auditoría detallada) |
| Parte 4 | UX-UI-SPEC-PARTE4.md | Fase 9 (Design System) · Fase 10 (Auditoría UX Final) |

---

*Especificación UX/UI Completa — GYMsos Operating System v1.0*
*Fecha: 2026-06-03 · Preparada para wireframes, mockups y construcción*
*Todas las decisiones funcionales son consistentes con el Blueprint Definitivo (4.md)*
