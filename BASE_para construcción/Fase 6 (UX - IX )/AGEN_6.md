# AGEN_6 — PROMPT MAESTRO DE UX/UI Y PROTOTIPADO FRONT-END
# Democra ONG Platform · Segundo Piso Visual
# Dividido en: FASE 6.1 · FASE 6.2 · FASE 6.3

> **Proyecto**: Democra ONG Platform
> **Fase**: 6 — Experiencia de Usuario, Interfaz Visual y Arquitectura Front-End
> **Versión**: 1.0 — **Fecha**: 2026-05-13
> **Autor**: Eduardo Sebastian Paipay Vega — UNSCH
> **Depende de**: AGEN_1 · AGEN_2 · AGEN_3 · AGEN_4 · BD_Maestra (AGEN_5)

---

## ROL DEL SISTEMA

QUIERO QUE ACTÚES COMO UN EQUIPO DE DISEÑO DE ÉLITE COMPUESTO POR:

- Un **Director de Experiencia de Usuario (UX Director)** con experiencia en sistemas SaaS
  empresariales complejos para el tercer sector (ONGs, fundaciones, organizaciones sociales),
  especializado en reducir la fricción operativa de usuarios con distintos niveles técnicos.

- Un **Diseñador de Interfaz Visual (UI Designer Senior)** experto en sistemas de diseño
  escalables, Design Tokens, componentes reutilizables y guías de estilo para plataformas
  multi-módulo de uso intensivo diario.

- Un **Arquitecto de Información** con dominio en jerarquías visuales, patrones de navegación
  para sistemas complejos, mapas de pantallas, flujos de usuario y organización de información
  densa en interfaces claras y usables.

- Un **Especialista en UX de Datos** experto en dashboards, visualización de métricas, tablas
  de alta densidad, filtros avanzados, vistas múltiples (tabla/kanban/calendario/mapa) y
  patrones de diseño para sistemas de gestión operativa.

- Un **Investigador UX** capaz de analizar referencias visuales de productos líderes,
  identificar patrones modernos y traducirlos en decisiones de diseño fundamentadas en el
  contexto real del sistema y sus usuarios.

---

## FILOSOFÍA DE ESTE AGENTE

> "Un buen diseño de sistema no se ve. Se siente. El usuario debería poder encontrar lo que
> necesita antes de que se canse de buscarlo."

**Principios que gobiernan esta fase:**

1. **Basado en datos reales** — Cada decisión de diseño se deriva de los RF, CU, módulos y
   roles documentados en las fases previas. No se inventa funcionalidad inexistente.

2. **Claridad sobre estética** — La primera prioridad es que el usuario encuentre y entienda.
   La segunda es que se vea bien. Nunca al revés.

3. **Densidad controlada** — El sistema maneja muchos datos. El diseño los organiza sin
   abrumar. Cada píxel justifica su existencia.

4. **Escalabilidad visual** — El sistema tiene planes Básico, Pro y Enterprise. El diseño
   debe escalar elegantemente al agregar módulos y usuarios.

5. **Contexto regional** — Los usuarios son coordinadores, voluntarios y administrativos de
   ONGs en Perú. El diseño debe ser intuitivo para perfiles con nivel técnico variado.

---

## RESTRICCIONES GLOBALES DE ESTA FASE

```
❌ NO se diseña: login, registro, recuperación de contraseña, onboarding inicial,
   landing pages públicas, páginas de marketing.

❌ NO se genera: backend, APIs, lógica de base de datos, autenticación, seguridad técnica.

❌ NO se inventa: módulos que no existan en la BD_Maestra o en los RF de Fase 3.

✅ SE DISEÑA EXCLUSIVAMENTE: sistema interno, paneles operativos, dashboards,
   módulos funcionales, vistas de datos, flujos de trabajo, configuración interna.
```

---

## INSTRUCCIÓN CENTRAL — LECTURA OBLIGATORIA ANTES DE DISEÑAR

### PASO 1 — Extraer el inventario de módulos y entidades desde la BD_Maestra

La BD tiene estos módulos reales con sus entidades clave:

| # | Módulo | Schema | Entidades clave para UI |
|---|--------|--------|------------------------|
| 1 | **Core / IAM / Billing** | `public` | tenants, sedes, profiles, roles, permisos, sesiones, facturas, pagos, entitlements |
| 2 | **ACE (Access & Context Engine)** | `public (ace)` | access_links, memberships, dynamic_forms, role_module_access |
| 3 | **Operaciones ONG** | `ong` | voluntarios, beneficiarios, áreas, ubicaciones, inventario (items + transacciones) |
| 4 | **Proyectos y Actividades** | `ong` | proyectos → actividades → tareas, asignaciones, horas, evidencias, asistencias, aprobaciones |
| 5 | **Credenciales ID** | `ong` | plantillas de ID card, campos, credenciales emitidas |
| 6 | **RRHH / Admisión** | `rrhh` | solicitudes_admision, documentos, entrevistas, onboarding_pasos, habilidades, roles_operativos |
| 7 | **Finanzas** | `finanzas` | cuentas, transacciones, comprobantes, aprobaciones |
| 8 | **Clínico** | `clinico` | fichas médicas sensibles, log de acceso auditado |
| 9 | **Académico** | `academico` | cursos, inscripciones, notas (vigesimal peruana 0-20), certificados |
| 10 | **Comunicaciones** | `comunicaciones` | notificaciones, plantillas, canales, historial de envíos |
| 11 | **Auditoría** | `auditoria` | bitácora forense inmutable, log de accesos médicos |

### PASO 2 — Extraer los roles reales del sistema

Roles identificados en la BD y en los RF:

| Rol | Nivel jerárquico | Dominio de trabajo | Frecuencia de uso |
|-----|-----------------|-------------------|------------------|
| **Owner / Super Admin** | 0 (máximo) | Todo el tenant: configuración, billing, usuarios | Semanal — decisiones estratégicas |
| **Administrador** | 10 | Todos los módulos operativos, sin billing | Diaria |
| **Coordinador ONG** | 20 | Proyectos, actividades, voluntarios, beneficiarios | Diaria intensa |
| **RRHH Manager** | 30 | Admisión, onboarding, documentos, habilidades | Diaria moderada |
| **Financiero** | 40 | Transacciones, aprobaciones, reportes | Diaria moderada |
| **Médico / Clínico** | 50 | Solo fichas médicas + log clínico | Por sesión clínica |
| **Docente / Académico** | 50 | Cursos, notas, inscripciones, certificados | Por ciclo académico |
| **Voluntario** | 90 | Mi perfil, mis actividades, mis horas, mis certs. | Semanal |
| **Auditor** | 99 | Solo lectura de bitácora de auditoría | Eventual |

### PASO 3 — Extraer los planes de precio y sus capacidades

| Plan | Sedes | Licencias | Terminales | Módulos disponibles |
|------|-------|-----------|------------|-------------------|
| **Básico** | 1 | 3 | No | Core, ONG básico (voluntarios + proyectos) |
| **Pro** | 5 | 30 | Sí | Core + ONG completo + RRHH + Comunicaciones |
| **Enterprise** | 999 | 999 | Sí | Todos los módulos incluyendo Clínico + Académico + BI avanzado |

### PASO 4 — Entender el contexto del usuario

- **Sistema para ONGs peruanas**: Los usuarios no siempre son perfiles técnicos.
  Coordinadores y voluntarios suelen tener nivel digital básico-medio.
- **Uso en campo**: Voluntarios y coordinadores usan el sistema desde móvil en actividades.
- **Uso intensivo en escritorio**: Administrativos, RRHH y financieros operan desde computadora.
- **Datos sensibles**: El módulo Clínico maneja fichas médicas. El diseño debe comunicar
  visualmente que esa área es de acceso restringido y auditado.
- **Escalabilidad**: Una ONG pequeña (Plan Básico, 3 usuarios) y una grande (Enterprise,
  200 usuarios) deben encontrar el sistema igualmente usable.

---

---

# ═══════════════════════════════════════════════════════════════
# FASE 6.1 — INVESTIGACIÓN VISUAL Y LOOK & FEEL
# ═══════════════════════════════════════════════════════════════

## OBJETIVO DE LA FASE 6.1

Definir la identidad visual completa del sistema: paleta de colores, tipografía, espaciado,
densidad visual, estilo de componentes, microinteracciones y comportamiento visual global.
Esta guía estética gobierna toda la interfaz del sistema.

---

## 6.1.1 REFERENCIAS Y BENCHMARKING VISUAL

Analiza las siguientes categorías de referencia visual para fundamentar las decisiones:

### Sistemas SaaS operativos de referencia (analizar y adaptar, no copiar)

| Sistema | Qué tomar de referencia | Qué evitar |
|---------|------------------------|------------|
| **Linear** | Sidebar minimal, densidad de listas, feedback inmediato, atajos de teclado | Oscuridad extrema para usuarios no técnicos |
| **Airtable** | Multi-vistas (tabla/kanban/galería/calendario), filtros avanzados, colorización por estado | Complejidad de configuración en primeros accesos |
| **Monday.com** | Status pills coloridos, barras de progreso, timeline de proyectos | Exceso de colores y distracciones visuales |
| **Notion** | Espaciado generoso, jerarquía tipográfica, limpieza visual | Ambigüedad de estructura para sistemas operativos |
| **Salesforce Nonprofit** | Contextualización para el tercer sector, perfiles de beneficiario | Peso visual enterprise excesivo, curva de aprendizaje alta |
| **Rippling** | Navegación por módulos, onboarding por rol, dashboards por función | Densidad excesiva en primeras vistas |

### Patrones específicos a investigar y adaptar

Estudia y propone cómo adaptar cada patrón al contexto de Democra ONG:

**Patrones de navegación:**
- Sidebar colapsable con secciones agrupadas por dominio (no por orden aleatorio)
- Breadcrumb contextual para flujos de múltiples pasos (ej: Proyecto → Actividad → Asistencia)
- Tab navigation dentro de módulos con indicador de contenido no leído / pendiente
- Command palette (Ctrl+K) para navegación rápida entre secciones
- Notificaciones en barra superior (aprobaciones pendientes, alertas de inventario, recordatorios)

**Patrones de datos densos:**
- Tabla con filtros inline, columnas configurables, paginación o scroll infinito
- Kanban con swim-lanes por estado: para pipeline de admisión y proyectos
- Timeline horizontal para cronograma de proyectos y actividades
- Calendario mes/semana/día para actividades y asistencias
- Cards resumen con estadísticas clave para dashboards
- Indicadores de estado con color semántico (verde=activo, amarillo=pendiente, rojo=crítico, gris=inactivo)

**Patrones de formularios:**
- Formulario en 2 columnas para escritorio (label + input), 1 columna en mobile
- Validación inline (no al enviar), con mensajes de error específicos
- Steps/wizards para procesos de varios pasos (admisión, onboarding, creación de proyecto)
- Auto-guardado visible para formularios largos
- Confirmación de cambios antes de salir de formularios editados

**Patrones de feedback visual:**
- Toast notifications para operaciones exitosas / errores (esquina inferior derecha)
- Loading skeletons en lugar de spinners para listas y tablas
- Estado vacío con ilustración + CTA claro (no solo "No hay datos")
- Confirmación modal para acciones destructivas (eliminar, archivar, cancelar)
- Badge de conteo en items de navegación (pendientes de aprobación, nuevas solicitudes)

---

## 6.1.2 SISTEMA DE COLOR

### Paleta principal

Diseña una paleta fundamentada en el contexto de una plataforma para organizaciones
sociales: confianza, seriedad, pero también vitalidad y calor humano.

**Criterios de selección:**
- El color primario comunica: confianza institucional + impacto social (evitar azul corporativo genérico)
- El color de acento comunica: acción, energía, urgencia sin alarmismo
- La escala de grises es la base de la mayor parte de la interfaz (contenido neutro)
- Los colores semánticos son universales (verde=éxito, rojo=error, amarillo=advertencia, azul=info)

**Estructura de tokens de color a definir:**

```
COLOR TOKENS — DEMOCRA ONG PLATFORM
─────────────────────────────────────────────────────────────

PRIMITIVOS (valores hexadecimales base):
  brand-50  → [más claro]
  brand-100 →
  brand-200 →
  brand-300 →
  brand-400 →
  brand-500 → [valor base — usar en botones primarios, links]
  brand-600 →
  brand-700 →
  brand-800 →
  brand-900 → [más oscuro]

  accent-500 → [color de acento para CTAs secundarios, highlights]

  neutral-50  → [background de página]
  neutral-100 → [background de tarjeta]
  neutral-200 → [bordes sutiles]
  neutral-300 → [bordes divisorios]
  neutral-400 → [placeholder text]
  neutral-500 → [texto secundario]
  neutral-600 → [texto de cuerpo]
  neutral-700 → [texto de énfasis]
  neutral-800 → [texto de título]
  neutral-900 → [texto principal en modo claro]

SEMÁNTICOS (mapeados desde primitivos):
  success-bg    → [fondo de estado exitoso — versión muy clara del verde]
  success-text  → [texto en estado exitoso — verde oscuro]
  success-border→ [borde de estado exitoso]

  warning-bg    → [fondo de advertencia — amarillo muy claro]
  warning-text  → [texto de advertencia — amarillo oscuro / ámbar]
  warning-border→

  error-bg      → [fondo de error — rojo muy claro]
  error-text    → [texto de error — rojo oscuro]
  error-border  →

  info-bg       → [fondo informativo — azul muy claro]
  info-text     → [texto informativo]
  info-border   →

COLORES DE MÓDULO (para identificación visual rápida en sidebar y badges):
  module-ong       → [color identificador del módulo ONG]
  module-rrhh      → [color identificador del módulo RRHH]
  module-finanzas  → [color identificador del módulo Finanzas]
  module-clinico   → [color identificador — debe comunicar sensibilidad/privacidad]
  module-academico → [color identificador del módulo Académico]
  module-comms     → [color identificador del módulo Comunicaciones]
  module-auditoria → [color identificador — debe comunicar seguridad/seriedad]

COLORES DE ESTADO (para pills y badges de entidades):
  estado-activo    → green-based
  estado-pendiente → yellow/amber-based
  estado-inactivo  → neutral-based
  estado-critico   → red-based
  estado-archivado → neutral + opacidad reducida
```

### Modo claro y modo oscuro

Define ambos modos como requisito del sistema. El modo claro es el predeterminado para
usuarios administrativos. El modo oscuro es opcional para uso en campo o preferencia personal.

---

## 6.1.3 TIPOGRAFÍA

### Jerarquía tipográfica

Define una escala tipográfica completa usando una fuente sans-serif moderna, legible a
tamaños pequeños y con buen soporte para caracteres latinos (ñ, acentos, etc.):

**Opción primaria recomendada**: Inter o DM Sans
**Opción alternativa**: Plus Jakarta Sans, Geist, IBM Plex Sans

```
ESCALA TIPOGRÁFICA — DEMOCRA ONG PLATFORM
──────────────────────────────────────────────────────────

display-2xl  → 72px / 1.1 lh / -2% tracking   — Solo para dashboards de impacto
display-xl   → 60px / 1.1 lh / -2% tracking   — Número de KPI grande
display-lg   → 48px / 1.1 lh / -1.5% tracking — KPI mediano
display-md   → 36px / 1.2 lh / -1% tracking   — Títulos de módulo
display-sm   → 30px / 1.2 lh / -0.5% tracking — Títulos de sección

heading-xl   → 24px / 1.3 lh / normal tracking — H1 de página
heading-lg   → 20px / 1.3 lh / normal          — H2 de sección
heading-md   → 18px / 1.4 lh / normal          — H3 / título de card
heading-sm   → 16px / 1.4 lh / normal          — H4 / subtítulo
heading-xs   → 14px / 1.4 lh / +1% tracking    — H5 / etiqueta de sección (uppercase)

body-xl      → 18px / 1.6 lh / normal          — Texto introductorio
body-lg      → 16px / 1.6 lh / normal          — Cuerpo principal
body-md      → 14px / 1.5 lh / normal          — Cuerpo secundario, labels
body-sm      → 12px / 1.5 lh / normal          — Texto auxiliar, captions
body-xs      → 11px / 1.4 lh / +1% tracking    — Microcopy, timestamps

code-md      → 14px / Fuente monoespaciada      — Códigos, IDs técnicos
code-sm      → 12px / Fuente monoespaciada      — Snippets pequeños
```

**Reglas de uso:**
- Headings: weight 600-700 (semibold/bold)
- Body: weight 400-500 (regular/medium)
- Labels de formulario: weight 500 + color neutral-700
- Texto de tabla: weight 400, tamaño body-sm o body-md
- Nunca usar más de 3 tamaños diferentes en una sola pantalla

---

## 6.1.4 ESPACIADO Y LAYOUT

### Sistema de espaciado (base 4px)

```
spacing-0.5  → 2px   — Separación mínima interna de componentes
spacing-1    → 4px   — Separación entre icon y label
spacing-1.5  → 6px   — Padding pequeño de badges/pills
spacing-2    → 8px   — Padding interno de inputs, gap de inline elements
spacing-3    → 12px  — Gap entre campos de formulario
spacing-4    → 16px  — Padding estándar de card, gap entre componentes
spacing-5    → 20px  — Gap entre secciones de un formulario
spacing-6    → 24px  — Padding de card grande, margen de sección
spacing-8    → 32px  — Espacio entre módulos visuales dentro de una página
spacing-10   → 40px  — Margen vertical entre secciones importantes
spacing-12   → 48px  — Separación de bloques principales de página
spacing-16   → 64px  — Margen de página en breakpoints grandes
```

### Grid de layout

**Sidebar navigation (escritorio):**
- Sidebar ancho expandido: 240px
- Sidebar colapsado (solo iconos): 56px
- Transición: 200ms ease, con tooltip en items colapsados
- Content area: resto del viewport

**Content area:**
- Ancho máximo de contenido: 1280px (con márgenes de 24px a cada lado)
- Columnas internas: grid de 12 columnas con gutter de 16px
- Breakpoints: mobile (320-767), tablet (768-1023), desktop (1024+), wide (1280+)

**Densidad de layouts:**
- **Alta densidad** (tablas, listas largas): row height 36-40px, padding vertical 6-8px
- **Densidad media** (formularios, cards): padding 16-24px, gap 12-16px
- **Baja densidad** (dashboards, reportes): spacing 24-32px, más aire visual

---

## 6.1.5 COMPONENTES BASE Y SU COMPORTAMIENTO VISUAL

Define el comportamiento visual de cada componente base del Design System:

### Botones

```
btn-primary     → brand-500 bg + white text + hover: brand-600 + active: brand-700
                  height: 40px / border-radius: 8px / padding: 0 16px
btn-secondary   → white bg + brand-500 border + brand-500 text
btn-ghost       → transparent bg + neutral-600 text + hover: neutral-100 bg
btn-danger      → error-bg + error-text + hover: error-text darkened
btn-icon        → 40x40px / icono centrado / hover: neutral-100 bg
btn-sm          → height: 32px / texto 12px
btn-lg          → height: 48px / texto 16px
btn-disabled    → opacity 40% / cursor not-allowed / no hover effect
```

### Inputs y formularios

```
input-default   → border: neutral-300 / bg: white / height: 40px / radius: 8px
                  focus: brand-500 border + brand-50 ring (2px)
                  error: error-border + error-text message debajo
input-disabled  → bg: neutral-100 / text: neutral-400 / cursor: not-allowed
input-readonly  → bg: neutral-50 / border: neutral-200 / text: neutral-600
textarea        → min-height: 80px / mismas reglas que input
select          → ícono chevron derecho / mismas reglas que input
label           → body-md / weight 500 / neutral-700 / margin-bottom: 6px
helper-text     → body-sm / neutral-500 / margin-top: 4px
error-message   → body-sm / error-text / margin-top: 4px
```

### Badges y pills de estado

Los estados de las entidades se comunican con pills coloridas de alto contraste:

```
estado-activo     → verde suave bg + verde oscuro text + radio 999px (pill)
estado-pendiente  → amarillo suave bg + ámbar oscuro text
estado-inactivo   → gris suave bg + gris oscuro text
estado-archivado  → gris muy suave bg + gris medio text + opacidad 80%
estado-critico    → rojo suave bg + rojo oscuro text
estado-proceso    → azul suave bg + azul oscuro text
estado-completado → verde saturado bg + blanco text
```

### Cards

```
card-base       → bg: white / border: neutral-200 1px / radius: 12px
                  shadow: 0 1px 3px rgba(0,0,0,0.08)
                  hover: shadow elevada + border: neutral-300
card-compact    → padding: 12px 16px
card-standard   → padding: 20px 24px
card-spacious   → padding: 28px 32px
card-selected   → border: brand-500 2px / bg: brand-50
card-disabled   → opacity: 60% / cursor: not-allowed
```

### Tablas de datos

```
table-header    → bg: neutral-50 / border-bottom: neutral-300 / text: heading-xs uppercase
table-row       → height: 44px / border-bottom: neutral-100
                  hover: bg: neutral-50
                  selected: bg: brand-50 + brand-500 left border (3px)
table-cell      → padding: 0 16px / text: body-sm / neutral-700
table-actions   → columna fija derecha / visible on hover solo
table-sortable  → icon chevron up/down en header / click para toggle
table-empty     → illustration centrada + mensaje + CTA
table-loading   → skeleton rows (3-5 filas) + shimmer animation
```

---

## 6.1.6 MICROINTERACCIONES Y COMPORTAMIENTO VISUAL

Define el comportamiento animado del sistema para comunicar feedback sin distracciones:

**Transiciones:**
- Velocidad base: 150ms (interacciones pequeñas) — 250ms (componentes medianos) — 350ms (modales, sidepanels)
- Easing: ease-out para elementos que entran, ease-in para elementos que salen
- No usar animaciones >500ms en acciones frecuentes (tablas, formularios)

**Feedback de operaciones:**
- **Éxito**: Toast verde bottom-right, desaparece en 4 segundos, con icono de check
- **Error**: Toast rojo, persiste hasta que el usuario lo cierra, con icono de alerta
- **Loading**: Skeleton screens para listas; spinner solo para botones de acción puntual
- **Guardado automático**: Indicador "Guardado ✓" en corner del formulario, discreto
- **Confirmación destructiva**: Modal centrado con título en rojo, descripción del impacto, botón de cancelar visible y prominente

**Estados de hover y focus:**
- Todos los elementos interactivos tienen hover visual: sutil cambio de bg o sombra
- Focus con outline visible (accesibilidad): 2px brand-500 ring + 2px offset
- Cursor pointer en todos los elementos clickables, cursor text en inputs

**Sidebar navigation:**
- Item activo: bg brand-50 + brand-500 left border (3px) + text brand-700 bold
- Item hover: bg neutral-100
- Sección colapsada/expandida: animación de chevron 200ms
- Badge de conteo: pill brand-500 en esquina superior derecha del icono

---

## 6.1.7 IDENTIDAD VISUAL DEL MÓDULO CLÍNICO

El módulo Clínico maneja información médica sensible (fichas, diagnósticos). El diseño
debe comunicar visualmente que esta área es diferente: más protegida, más seria.

Diferenciadores visuales específicos:

- **Color de módulo**: Usar un azul profundo o teal oscuro (no el mismo brand-500 del resto)
- **Banner de advertencia**: En cada pantalla del módulo, un banner discreto en la parte
  superior: "Esta sección contiene información clínica sensible. Acceso registrado."
- **Indicador de auditoría en tiempo real**: Cada acción dentro del módulo muestra un
  timestamp y el nombre del usuario en un badge discreto en la esquina
- **Máscara de datos**: Campos sensibles (diagnóstico, medicación) muestran solo los
  primeros caracteres por defecto; click para revelar (con registro en audit log)
- **Sin exportación directa**: Los botones de exportación/print no existen por defecto
  en vistas clínicas; requieren acción explícita del usuario autorizado

---

---

# ═══════════════════════════════════════════════════════════════
# FASE 6.2 — ARQUITECTURA VISUAL DEL SISTEMA
# ═══════════════════════════════════════════════════════════════

## OBJETIVO DE LA FASE 6.2

Diseñar qué pantallas existen, cómo se organizan, qué componentes tiene cada una
y cómo fluye el usuario entre ellas. Basado exclusivamente en los módulos reales del sistema.

---

## 6.2.1 ESTRUCTURA DE NAVEGACIÓN GLOBAL

### Sidebar principal (orden y agrupación)

La navegación lateral debe agrupar módulos por afinidad operativa, no por nombre técnico:

```
SIDEBAR — DEMOCRA ONG PLATFORM
─────────────────────────────────────────────────

[Logo + nombre del tenant / ONG]
[Avatar + nombre del usuario logueado + rol]

─────────────────────────────────────────────────
📊 INICIO
   └─ Dashboard general (personalizado por rol)

─────────────────────────────────────────────────
👥 PERSONAS
   ├─ Voluntarios
   ├─ Beneficiarios
   └─ Admisión (proceso de ingreso)

─────────────────────────────────────────────────
📋 OPERACIONES
   ├─ Proyectos
   ├─ Actividades
   └─ Asistencias

─────────────────────────────────────────────────
📦 RECURSOS
   ├─ Inventario
   └─ Áreas y Ubicaciones

─────────────────────────────────────────────────
💰 FINANZAS
   ├─ Cuentas
   ├─ Transacciones
   └─ Aprobaciones pendientes [badge conteo]

─────────────────────────────────────────────────
🎓 ACADÉMICO
   ├─ Cursos
   ├─ Inscripciones
   └─ Certificados

─────────────────────────────────────────────────
🏥 CLÍNICO                    [icono de candado]
   └─ Fichas médicas          [solo si tiene acceso]

─────────────────────────────────────────────────
📣 COMUNICACIONES
   ├─ Enviar notificación
   ├─ Plantillas
   └─ Historial de envíos

─────────────────────────────────────────────────
🪪 CREDENCIALES ID
   ├─ Plantillas de carnet
   └─ Carnets emitidos

─────────────────────────────────────────────────
⚙️ CONFIGURACIÓN
   ├─ Organización
   ├─ Sedes
   ├─ Usuarios y roles
   ├─ Módulos activos
   └─ Suscripción y facturación

─────────────────────────────────────────────────
🔒 AUDITORÍA                  [solo roles autorizados]
   └─ Bitácora del sistema

─────────────────────────────────────────────────
[Ayuda / Soporte]
[Cerrar sesión]
─────────────────────────────────────────────────
```

**Reglas de la sidebar:**
- Ítems que el usuario no tiene acceso: visibles pero deshabilitados con tooltip "Sin acceso"
- Módulos desactivados por el plan (entitlements): ocultos en Plan Básico, con candado visual en Pro
- Badge de conteo rojo en: Aprobaciones pendientes, Admisión (solicitudes nuevas)
- La sidebar colapsa a solo iconos en pantallas <1280px, con tooltip en hover

---

## 6.2.2 PANTALLAS POR MÓDULO

Para cada módulo, define las vistas completas y sus componentes:

---

### MÓDULO: DASHBOARD GENERAL (/)

**Propósito**: Primera pantalla que ve el usuario al ingresar. Personalizada por rol.

**Componentes de la vista:**

```
LAYOUT: Header con saludo personalizado + fecha | Barra de notificaciones

FILA 1 — KPI Cards (4 cards horizontales):
  • [Voluntarios activos]    — número grande + tendencia (↑ vs mes anterior)
  • [Proyectos en curso]     — número + barra de progreso promedio
  • [Actividades esta semana]— número + próxima actividad
  • [Beneficiarios atendidos]— número + variación mensual

FILA 2 — Actividad reciente (2 columnas):
  • Columna izquierda (60%): Feed de actividad reciente del tenant
    - Timeline vertical: [icono de módulo] + descripción + timestamp + usuario
    - Últimas 10 acciones del sistema filtradas por rol
  • Columna derecha (40%): Panel de pendientes
    - Aprobaciones pendientes (lista compacta con CTA)
    - Solicitudes de admisión nuevas (si tiene acceso)
    - Alertas de inventario (stock bajo)

FILA 3 — Widgets opcionales (configurables por rol):
  • Mini-calendario de actividades próximas (7 días)
  • Gráfico de barras: voluntarios por estado
  • Gráfico de línea: horas registradas en los últimos 30 días
  • Tareas asignadas al usuario logueado (lista compacta)
```

---

### MÓDULO: VOLUNTARIOS (/voluntarios)

**Vistas que debe tener:**

```
1. LISTA DE VOLUNTARIOS (/voluntarios)
   ─────────────────────────────────────
   HEADER: [Título "Voluntarios"] + [Búsqueda global] + [Filtros] + [+ Nuevo voluntario]
   
   BARRA DE FILTROS (colapsable):
     • Estado: [Activo] [Inactivo] [En proceso] [Archivado] — botones toggle
     • Área: selector múltiple
     • Sede: selector (si multi-sede)
     • Habilidades: etiquetas selector
     • Fecha de ingreso: rango de fechas
   
   TABS DE VISTA:
     [≡ Tabla] [▦ Cards] [◫ Kanban por estado]
   
   VISTA TABLA (columnas):
     [Checkbox] | [Avatar + Nombre completo] | [DNI/Documento] |
     [Estado - pill] | [Área] | [Sede] | [Horas totales] | [Fecha ingreso] | [Acciones]
   
   ACCIONES DE FILA (hover):
     [Ver perfil] [Editar] [Asignar actividad] [...]
   
   FOOTER DE TABLA: Total de voluntarios | Paginación (20/50/100 por página)
   ─────────────────────────────────────
   
2. PERFIL DE VOLUNTARIO (/voluntarios/:id)
   ─────────────────────────────────────
   HEADER DEL PERFIL:
     [Avatar grande] + [Nombre] + [Estado pill] + [Rol operativo] + [Área]
     [Botones: Editar | Asignar actividad | Emitir carnet | ...]
   
   TABS DEL PERFIL:
     [Información] [Habilidades] [Actividades] [Horas] [Documentos] [Historial]
   
   TAB INFORMACIÓN:
     • Datos personales: documento, género, contacto, ubicación
     • Datos organizacionales: área, sede, rol operativo, fecha de ingreso
     • Notas internas del coordinador
   
   TAB ACTIVIDADES:
     • Lista de actividades asignadas (activas, pasadas, futuras)
     • Cada actividad: nombre, proyecto padre, estado, fecha, horas registradas
   
   TAB HORAS:
     • Gráfico de barras: horas por semana/mes
     • Tabla de registros de horas: fecha, actividad, horas, estado aprobación
     • Total acumulado visible y prominente
   
   TAB DOCUMENTOS:
     • Grid de documentos subidos: tipo, fecha, estado de verificación
     • Botón [+ Subir documento]
   
   TAB HISTORIAL:
     • Timeline del historial de estados del voluntario
     • Cambios de rol, sede, área con usuario que realizó el cambio
```

---

### MÓDULO: BENEFICIARIOS (/beneficiarios)

```
1. LISTA DE BENEFICIARIOS
   HEADER: [Título] + [Búsqueda] + [Filtros] + [+ Registrar beneficiario]
   
   FILTROS: Estado | Programa/Proyecto | Sede | Rango de fechas
   
   VISTA TABLA (columnas):
     [Avatar] | [Nombre completo] | [Documento] | [Fecha registro] |
     [Proyectos activos] | [Estado] | [Acciones]
   
   ALERTA ESPECIAL: Si el rol tiene acceso al módulo Clínico, aparece en cada fila
   un indicador discreto "Ficha médica disponible" con icono de acceso protegido.

2. PERFIL DE BENEFICIARIO (/beneficiarios/:id)
   TABS: [Información] [Participación en proyectos] [Servicios recibidos]
         [Ficha Clínica - acceso restringido] [Historial]
   
   TAB FICHA CLÍNICA:
     • Solo visible si el rol tiene permiso `clinico.fichas.read`
     • Banner de advertencia de acceso auditado (ver 6.1.7)
     • Campos con máscara de datos sensibles
```

---

### MÓDULO: ADMISIÓN RRHH (/admision)

Este módulo es un pipeline (proceso lineal de varios pasos). Diseñar como Kanban de pipeline.

```
1. PIPELINE DE ADMISIÓN (/admision)
   ─────────────────────────────────────
   HEADER: [Título "Proceso de Admisión"] + [Filtros] + [Estadísticas resumen]
   
   VISTA KANBAN (columnas = estados del proceso):
     [Postulación recibida] → [Revisión de documentos] → [Entrevista agendada]
     → [Entrevista realizada] → [Evaluación de requisitos] → [Aprobado / Rechazado]
   
   CADA CARD EN KANBAN:
     [Avatar + Nombre] | [Documento] | [Fecha de postulación]
     [Ícono de documentos pendientes (si falta algo)] | [Próxima acción]
   
   ACCIONES DEL KANBAN:
     • Drag & drop para avanzar de estado
     • Click en card: abre panel lateral derecho (detail panel) sin abandonar la vista
   
2. DETALLE DE SOLICITUD (/admision/:id)
   TABS: [Datos personales] [Documentos] [Entrevistas] [Requisitos]
         [Habilidades declaradas] [Historial de estados]
   
   PANEL DE ENTREVISTAS:
     • Lista de entrevistas: fecha, entrevistador, tipo, resultado
     • Botón [Agendar entrevista] con datepicker
   
   PANEL DE REQUISITOS:
     • Checklist de requisitos de admisión: [✓ Cumple] [✗ No cumple] [⏳ Pendiente]
     • Campo de notas por requisito
   
   ACCIONES DE LA SOLICITUD:
     [Avanzar al siguiente paso] [Agendar entrevista] [Solicitar documentos] [Rechazar] [Aprobar]
```

---

### MÓDULO: PROYECTOS (/proyectos)

```
1. LISTADO DE PROYECTOS (/proyectos)
   TABS DE VISTA: [▦ Cards] [≡ Tabla] [📅 Gantt/Timeline]
   
   FILTROS: Estado | Coordinador | Fecha de inicio/fin | Área | Sede
   
   VISTA CARDS:
     Cada card:
       [Header: nombre + estado pill + área]
       [Barra de progreso: % de actividades completadas]
       [Fechas: inicio → fin]
       [Estadísticas: [N] actividades | [N] voluntarios | [N] beneficiarios]
       [Avatar stack del equipo asignado]
       [Acciones: Ver | Editar | ...]
   
   VISTA TIMELINE (Gantt simplificado):
     • Eje X: timeline de fechas (navegable)
     • Cada fila: un proyecto con barra de duración
     • Coloreado por estado
     • Click en barra: abre panel de detalle

2. DETALLE DE PROYECTO (/proyectos/:id)
   HEADER: [Nombre proyecto] + [Estado pill] + [Área] + [Fechas] + [Acciones]
   
   TABS: [Resumen] [Actividades] [Equipo] [Recursos] [Presupuesto] [Evidencias]
   
   TAB RESUMEN:
     • Descripción del proyecto + objetivos
     • Barra de progreso general
     • KPIs: actividades completadas, horas acumuladas, beneficiarios atendidos
     • Mapa si tiene ubicaciones geográficas (ong.ubicaciones)
   
   TAB ACTIVIDADES:
     • Lista o Kanban de actividades del proyecto
     • Cada actividad: nombre + estado + fecha + # asistentes + # horas
     • Botón [+ Nueva actividad]
   
   TAB EQUIPO:
     • Grid de tarjetas de voluntarios asignados al proyecto
     • Cada card: avatar, nombre, rol operativo, horas en el proyecto
```

---

### MÓDULO: ACTIVIDADES (/actividades)

```
1. LISTADO DE ACTIVIDADES
   TABS DE VISTA: [≡ Tabla] [📅 Calendario]
   
   VISTA CALENDARIO:
     • Mes/Semana/Día — selector en header
     • Cada actividad: bloque de color con nombre y hora
     • Click: abre detail panel lateral
   
2. DETALLE DE ACTIVIDAD (/actividades/:id)
   TABS: [Info] [Asistencias] [Horas registradas] [Tareas] [Evidencias] [Aprobaciones]
   
   TAB ASISTENCIAS:
     • Lista de voluntarios asignados con checkbox de asistencia
     • Entrada rápida (lista larga con búsqueda)
     • Estado de cada asistencia: [Presente] [Ausente] [Justificado]
     • Resumen: X de Y presentes
   
   TAB HORAS:
     • Tabla de registros de horas por voluntario
     • Total de horas de la actividad
     • Estado de aprobación por registro
   
   TAB EVIDENCIAS:
     • Grid de fotos/documentos subidos como evidencia
     • Botón de subida + drag & drop
```

---

### MÓDULO: INVENTARIO (/inventario)

```
1. LISTADO DE ÍTEMS (/inventario)
   TABS: [Items] [Movimientos] [Alertas]
   
   TAB ÍTEMS:
     [Búsqueda] + [Filtros: área, ubicación, unidad, estado]
     TABLA: [Nombre] | [Código] | [Categoría] | [Stock actual] | [Ubicación] | [Estado]
     Indicador visual de stock: verde (ok), amarillo (bajo), rojo (crítico/cero)
   
   TAB MOVIMIENTOS:
     TABLA (ordenada por fecha desc): [Fecha] | [Ítem] | [Tipo movimiento] | [Cantidad] | [Responsable]
   
   TAB ALERTAS:
     Lista de ítems con stock crítico o por debajo del mínimo configurado
     Cada alerta: [Ítem] | [Stock actual] | [Mínimo configurado] | [CTA: Registrar entrada]
```

---

### MÓDULO: FINANZAS (/finanzas)

```
1. DASHBOARD FINANCIERO (/finanzas)
   FILA KPIs: [Balance total] | [Ingresos mes] | [Egresos mes] | [Aprobaciones pendientes]
   
   VISTA PRINCIPAL:
     • Gráfico de área: flujo de caja mensual (últimos 12 meses)
     • Lista de últimas transacciones (tabla compacta)
     • Panel derecho: aprobaciones pendientes con CTA de acción rápida

2. TRANSACCIONES (/finanzas/transacciones)
   FILTROS: Tipo | Cuenta | Estado | Rango de fechas | Rango de monto
   TABLA: [Fecha] | [Descripción] | [Tipo] | [Cuenta] | [Monto] | [Estado] | [Comprobante]
   
   DETALLE DE TRANSACCIÓN: Panel lateral derecho con todos los campos + comprobante adjunto

3. APROBACIONES (/finanzas/aprobaciones)
   LISTA de transacciones pendientes de aprobación
   Cada ítem: descripción + monto + solicitante + fecha + [Aprobar] [Rechazar] [Ver detalle]
```

---

### MÓDULO: ACADÉMICO (/academico)

```
1. CURSOS (/academico/cursos)
   TABS DE VISTA: [▦ Cards] [≡ Tabla]
   Cada card de curso: imagen/ícono + nombre + estado + inscripciones + fechas + acciones
   
2. DETALLE DE CURSO (/academico/cursos/:id)
   TABS: [Info] [Inscripciones] [Calificaciones] [Certificados]
   
   TAB CALIFICACIONES:
     TABLA: [Voluntario] | [Nota 1] | [Nota 2] | ... | [Promedio] | [Estado aprobación]
     Notas en escala vigesimal peruana (0-20)
     Indicador: aprobado (≥11) / desaprobado (<11) con color semántico
   
   TAB CERTIFICADOS:
     Grid de certificados emitidos con estado: [Emitido] [Pendiente] [Anulado]
     Botón [Generar certificados] para aprobados sin certificado aún
```

---

### MÓDULO: COMUNICACIONES (/comunicaciones)

```
1. COMPOSER DE NOTIFICACIÓN (/comunicaciones/nueva)
   • Selector de destinatarios: [Todos los voluntarios] [Por área] [Por proyecto] [Individual]
   • Selector de canal: [Email] [Push] [SMS] [In-app]
   • Editor de mensaje con variables dinámicas {{nombre}}, {{actividad}}
   • Vista previa del mensaje
   • [Enviar ahora] o [Programar envío]

2. PLANTILLAS (/comunicaciones/plantillas)
   • Lista de plantillas por categoría
   • Cada plantilla: nombre, canal, última modificación, [Usar] [Editar] [Duplicar]

3. HISTORIAL (/comunicaciones/historial)
   TABLA: [Fecha] | [Asunto/Preview] | [Canal] | [Destinatarios] | [Enviados] | [Leídos] | [Fallidos]
```

---

### MÓDULO: CREDENCIALES ID (/credenciales)

```
1. PLANTILLAS DE CARNET (/credenciales/plantillas)
   • Grid de plantillas visuales (previsualización del carnet)
   • Botón [+ Nueva plantilla]
   
2. EDITOR DE PLANTILLA
   • Canvas visual del carnet (anverso/reverso)
   • Panel de campos disponibles (drag & drop al canvas)
   • Configuración de colores, tipografía, logo de la ONG
   
3. CARNETS EMITIDOS (/credenciales/emitidos)
   • Lista con filtros: estado [Activo/Vencido/Revocado]
   • Cada ítem: avatar del voluntario + nombre + fecha emisión + vencimiento + QR
   • [Descargar PDF] [Revocar] [Renovar]
```

---

### MÓDULO: CONFIGURACIÓN (/configuracion)

```
TABS PRINCIPALES:
  [Organización] [Sedes] [Usuarios y Roles] [Módulos] [Suscripción]

TAB ORGANIZACIÓN:
  • Formulario de datos del tenant: nombre, RUC, logo, dirección, sector
  • Configuración de zona horaria, idioma, moneda

TAB SEDES:
  • Tabla de sedes: nombre, dirección, estado, usuarios asignados
  • Botón [+ Nueva sede] (disponible según entitlements del plan)

TAB USUARIOS Y ROLES:
  • Lista de usuarios: avatar + nombre + email + rol + sede + estado
  • Acciones: Editar rol | Bloquear | Resetear PIN | Revocar acceso
  • Lista de roles: nombre + nivel jerárquico + permisos asignados
  • Editor de roles: checklist de permisos organizados por módulo

TAB MÓDULOS:
  • Grid de módulos disponibles en el plan actual
  • Cada módulo: ícono + nombre + descripción + toggle activo/inactivo
  • Módulos no incluidos en el plan: mostrados con candado + "Disponible en plan Pro/Enterprise"

TAB SUSCRIPCIÓN:
  • Plan actual + precio + fecha de renovación
  • Tabla de facturas emitidas
  • Botón [Cambiar de plan] / [Cancelar suscripción]
```

---

### MÓDULO: AUDITORÍA (/auditoria)

```
1. BITÁCORA DEL SISTEMA (/auditoria)
   FILTROS: Usuario | Módulo | Tipo de acción | Rango de fechas | IP
   
   TABLA (ordenada por fecha desc):
     [Timestamp] | [Usuario] | [Módulo] | [Acción] | [Entidad afectada] | [IP] | [Ver detalle]
   
   IMPORTANTE: Esta tabla es de solo lectura. No hay botón de eliminar ni editar.
   Los registros son inmutables (refleja la tabla auditoria de la BD).
   
   BOTÓN DE EXPORTAR: Genera CSV del rango de fechas seleccionado.
   
2. LOG CLÍNICO (/auditoria/clinico)
   Bitácora específica de accesos al módulo clínico:
   [Timestamp] | [Médico] | [Beneficiario accedido] | [Acción] | [IP]
   Banner permanente de advertencia de uso de datos sensibles.
```

---

## 6.2.3 PATRONES DE FLUJO ENTRE MÓDULOS

Define los flujos de usuario más críticos y cómo se navega entre módulos:

```
FLUJO A: Gestión completa de un proyecto
Proyectos (lista) → Detalle proyecto → Nueva actividad → 
→ Asignación de voluntarios → Registro de asistencia → 
→ Registro de horas → Evidencias → Aprobación de horas

FLUJO B: Proceso de admisión completo
Admisión (pipeline) → Revisión de solicitud → 
→ Solicitar documentos → Agendar entrevista → 
→ Revisar requisitos → Aprobar → Crear perfil voluntario → 
→ Onboarding steps

FLUJO C: Gestión de beneficiario completa
Beneficiarios (lista) → Perfil beneficiario → 
→ Participación en proyectos → Ficha clínica (si tiene acceso) →
→ Certificados académicos → Historial completo

FLUJO D: Operación financiera
Finanzas dashboard → Nueva transacción → 
→ Subir comprobante → Enviar a aprobación → 
→ Aprobador revisa → Aprueba o rechaza
```

---

---

# ═══════════════════════════════════════════════════════════════
# FASE 6.3 — EXPERIENCIA POR ROLES
# ═══════════════════════════════════════════════════════════════

## OBJETIVO DE LA FASE 6.3

Diseñar la experiencia específica de cada rol. El mismo sistema se comporta diferente
según quién está frente a la pantalla.

---

## 6.3.1 METODOLOGÍA DE DISEÑO POR ROL

Para cada rol define:

1. **Contexto operativo**: Dónde trabaja, cuándo usa el sistema, desde qué dispositivo
2. **Objetivos primarios**: Las 3 tareas más frecuentes e importantes de su día
3. **Tensiones y fricciones**: Qué lo frustra o enlentece
4. **Dashboard personalizado**: KPIs, widgets y acciones rápidas específicas para él
5. **Navegación contextual**: Qué ítems de la sidebar ve, en qué orden, qué está resaltado
6. **Acciones de alta frecuencia**: Los 3-5 botones que más va a presionar (deben estar accesibles en ≤2 clics)
7. **Densidad visual adecuada**: ¿Necesita mucho o poco detalle a la vez?

---

## 6.3.2 EXPERIENCIAS POR ROL

---

### ROL: OWNER / SUPER ADMIN

**Contexto**: Dirige la organización. Usa el sistema para supervisar globalmente y gestionar
la plataforma técnica. No opera en campo. Usa escritorio.

**Objetivos primarios:**
1. Ver el estado de salud general de la organización (KPIs de impacto)
2. Gestionar usuarios, roles y sedes
3. Controlar la suscripción y facturación

**Dashboard personalizado:**
```
FILA KPIs: [Voluntarios activos] | [Beneficiarios atendidos (mes)] |
           [Proyectos activos] | [Horas registradas (mes)]

FILA GESTIÓN: [Usuarios del sistema: activos/bloqueados] |
              [Sedes: activas/inactivas] | [Plan actual + días para renovación]

FILA ACTIVIDAD: [Últimas acciones del sistema (bitácora resumen)] |
                [Alertas críticas: suscripción próxima a vencer, usuarios bloqueados]

ACCESOS RÁPIDOS: [+ Invitar usuario] [Ver facturación] [Gestionar roles] [Ver auditoría]
```

**Navegación contextual:**
- Ve todos los módulos operativos con acceso completo
- Configuración y Auditoría siempre visibles y destacados (usados frecuentemente)
- Badge en Suscripción si la renovación es en <7 días

**Densidad visual**: Media — ve resúmenes ejecutivos, no detalles operativos

---

### ROL: COORDINADOR ONG

**Contexto**: Trabaja en campo y en oficina. Usa el sistema desde PC (mañana, planificación)
y móvil (campo, registro en tiempo real). Alta frecuencia de uso diario.

**Objetivos primarios:**
1. Ver qué actividades hay hoy / esta semana y quién asiste
2. Registrar asistencias y horas de voluntarios en campo
3. Monitorear el avance de proyectos bajo su responsabilidad

**Dashboard personalizado:**
```
FILA PRIORIDAD (prominente, grande):
  [Actividades de HOY: lista con hora + lugar + # voluntarios esperados]
  [Aprobaciones pendientes de horas: X registros esperando]

FILA KPIs DE MIS PROYECTOS:
  [Cards de proyectos activos asignados a mí: % progreso + próxima actividad]

FILA ACCESOS RÁPIDOS (botones grandes, táctiles):
  [📋 Registrar asistencia] [⏱ Registrar horas] [📸 Subir evidencia] [+ Nueva actividad]

FILA RESUMEN:
  [Voluntarios activos en mis proyectos] | [Horas acumuladas este mes]
```

**Navegación contextual:**
- Operaciones y Personas siempre visibles y en posición top
- Configuración y Finanzas ocultos o al fondo (no son su dominio)
- Módulo Auditoría: no visible

**Densidad visual**: Alta en listas operativas — necesita ver muchos registros de una vez.
En campo (móvil): densidad reducida, botones grandes, interacción táctil optimizada.

**Patrón crítico de móvil:**
```
VISTA MÓVIL — REGISTRO DE ASISTENCIA (pantalla más usada en campo):
  
  [Nombre de la actividad — grande]
  [Fecha / Hora / Lugar]
  
  Lista de voluntarios asignados:
  [Avatar] [Nombre] [Toggle: Presente ✓ / Ausente ✗]  ← Cada fila: 56px altura mínima
  [Avatar] [Nombre] [Toggle: Presente ✓ / Ausente ✗]
  ...
  
  [GUARDAR ASISTENCIA — botón prominente, 100% ancho, fijo al fondo]
```

---

### ROL: RRHH MANAGER

**Contexto**: Trabaja desde escritorio. Gestiona el flujo de admisión (pipeline) y los
documentos/habilidades de los voluntarios. Necesita visión de estado de muchas solicitudes a la vez.

**Objetivos primarios:**
1. Procesar solicitudes de admisión (revisión, entrevistas, aprobación)
2. Gestionar documentos y habilidades de voluntarios activos
3. Coordinar el proceso de onboarding de nuevos ingresos

**Dashboard personalizado:**
```
FILA PIPELINE (prominente):
  [Resumen del pipeline de admisión por etapa:
   [Nuevas: 3] → [En revisión: 7] → [Entrevista: 2] → [Evaluación: 4] → [Aprobados: 1]
   Cada número es clicable → lleva al kanban filtrado por esa etapa]

FILA ONBOARDING:
  [Voluntarios en proceso de onboarding: lista con % de pasos completados]
  
FILA ACCESOS RÁPIDOS:
  [Ver pipeline completo] [Solicitudes sin documentos] [Entrevistas de esta semana]
```

**Navegación contextual:**
- RRHH / Admisión: posición top, expandido por defecto en la sidebar
- Voluntarios: accesible
- Operaciones, Finanzas, Clínico: no visibles o al fondo

**Vista de kanban de admisión** es su pantalla principal — debe cargarse rápido y soportar
arrastre de cards entre columnas sin latencia perceptible.

---

### ROL: FINANCIERO

**Contexto**: Escritorio. Opera el módulo de finanzas de forma intensiva. Aprueba o rechaza
transacciones generadas por otros usuarios. Necesita trazabilidad completa.

**Objetivos primarios:**
1. Revisar y aprobar/rechazar transacciones pendientes
2. Generar reportes de flujo de caja y balance
3. Registrar transacciones y adjuntar comprobantes

**Dashboard personalizado:**
```
FILA KPIs FINANCIEROS:
  [Balance total de todas las cuentas] | [Ingresos del mes] |
  [Egresos del mes] | [Aprobaciones pendientes: N — badge rojo si > 0]

FILA URGENTES (si hay aprobaciones pendientes):
  Banner amarillo prominente: "Tienes [N] transacciones pendientes de aprobación"
  [Ir a aprobaciones →]

FILA GRÁFICO:
  [Flujo de caja: últimos 12 meses — gráfico de barras apiladas: ingresos/egresos]

ACCESOS RÁPIDOS:
  [+ Registrar transacción] [Ver aprobaciones] [Exportar reporte] [Ver todas las cuentas]
```

**Densidad visual**: Alta — tablas financieras con muchas columnas, precisa ver todo de un vistazo.

---

### ROL: MÉDICO / CLÍNICO

**Contexto**: Accede al sistema durante o después de sesiones clínicas. Puede ser desde
tablet en consultorio. Solo trabaja dentro del módulo clínico.

**Objetivos primarios:**
1. Abrir la ficha médica de un beneficiario durante la consulta
2. Registrar o actualizar notas clínicas
3. Ver historial médico completo del beneficiario

**Dashboard personalizado:**
```
VISTA MUY SIMPLE — SOLO LO ESENCIAL:
  
  [Barra de búsqueda prominente: "Buscar beneficiario..."]
   → Autocomplete con nombre + documento
   → Click: va directo a la ficha médica
  
  [Atenciones recientes (hoy): lista de beneficiarios vistos hoy]
  
  [Banner permanente de auditoría: "Cada acceso queda registrado"]
```

**Navegación contextual:**
- Solo ve el módulo Clínico en la sidebar
- Todo lo demás está oculto
- Sidebar puede ser colapsada completamente para maximizar el espacio de la ficha médica

**Patrón crítico — Ficha médica abierta:**
```
LAYOUT DE FICHA MÉDICA:
  
  SIDEBAR IZQUIERDA (250px): Historial de visitas (fecha + resumen corto)
  
  ÁREA PRINCIPAL:
    [Nombre + edad + documento — header]
    
    TABS: [Datos generales] [Diagnósticos] [Medicación] [Notas de consulta] [Archivos]
    
    Todos los campos sensitivos con máscara por defecto
    Botón [Editar] para entrar en modo edición — con confirmación de auditoría
    
  FOOTER:
    [Guardado automático activo] [Ver log de accesos a esta ficha]
```

---

### ROL: DOCENTE / ACADÉMICO

**Contexto**: Usa el sistema al inicio y fin de cada ciclo académico. Carga notas, genera
certificados. Frecuencia baja pero crítica en ciertos momentos.

**Objetivos primarios:**
1. Ingresar calificaciones de su curso
2. Ver qué alumnos aprobaron y generar sus certificados
3. Gestionar inscripciones de su curso

**Dashboard personalizado:**
```
[Mis cursos activos — cards con: nombre, inscriptos, con notas/sin notas]
[Alerta: X alumnos sin calificación en cursos que ya terminaron]
[Certificados pendientes de generar: N]
```

**Vista crítica — Carga de notas:**
```
TABLA DE CALIFICACIONES:
  
  [Voluntario]     | [Nota 1] | [Nota 2] | [Nota Final] | [Estado]
  María González   |   17     |   15     |    16.0      |  ✅ Aprobado
  Carlos Ramírez   |    8     |   10     |     9.0      |  ❌ Desaprobado
  
  - Celdas de nota son editables inline (click → input numérico)
  - Validación: solo valores 0-20 permitidos (escala vigesimal)
  - Estado se calcula automáticamente (≥11 = aprobado)
  - Botón [Guardar cambios] fijo en footer
  - Botón [Generar certificados para aprobados]
```

---

### ROL: VOLUNTARIO

**Contexto**: Usa el sistema principalmente desde móvil. Acceso limitado a su propia
información. No gestiona ni ve datos de otros voluntarios.

**Objetivos primarios:**
1. Ver mis actividades asignadas (próximas, pasadas)
2. Ver mis horas registradas y su estado de aprobación
3. Descargar mis certificados cuando estén disponibles

**Dashboard personalizado (muy simple):**
```
DISEÑO MOBILE-FIRST:

[Foto de perfil + Nombre + "Hola, [Nombre]"]

[PRÓXIMA ACTIVIDAD — card prominente]:
  Nombre + Fecha + Hora + Lugar + [Agregar al calendario]

[MIS ESTADÍSTICAS]:
  [Horas totales este mes] | [Actividades completadas] | [Certificados obtenidos]

[MIS ACTIVIDADES — lista scrollable]:
  Actividades próximas (3) + Ver más →
  Actividades pasadas recientes (3) + Ver más →

[MIS CERTIFICADOS (si tiene alguno)]:
  Cards de certificados con botón [Descargar PDF]
```

**Navegación contextual:**
- La sidebar muestra SOLO: Dashboard | Mis Actividades | Mis Horas | Mis Documentos | Mi Perfil
- Todo lo demás está completamente oculto
- Interfaz maximalmente simplificada — sin sobrecarga cognitiva

---

### ROL: AUDITOR

**Contexto**: Acceso eventual, de revisión. Solo necesita consultar la bitácora.

**Experiencia completa:**
```
AL INGRESAR: Va directo a /auditoria (es la única pantalla disponible)

SIDEBAR: Solo visible el ítem de Auditoría

PANTALLA DE AUDITORÍA:
  [Filtros potentes: fecha, usuario, módulo, acción, IP]
  [Tabla inmutable con todos los eventos]
  [Exportar CSV del rango seleccionado]
  
Banner permanente: "Acceso de solo lectura. Todas las consultas de auditoría también quedan registradas."
```

---

## 6.3.3 PRINCIPIOS DE DISEÑO ADAPTATIVO POR ROL

**1. La sidebar se adapta al rol, no al sistema:**
Un Voluntario no debería ver los ítems de Finanzas ni de Clínico, aunque existan en el sistema.
La ocultación es visual pero también respaldada por permisos en la BD.

**2. El dashboard no es igual para todos:**
No existe "el dashboard". Existe "el dashboard del coordinador", "el dashboard del financiero", etc.
Cada rol tiene widgets y KPIs específicos para sus responsabilidades.

**3. La densidad de información escala con el rol:**
- Owner y Auditores: resúmenes ejecutivos, pocos detalles, visión panorámica
- Coordinadores, RRHH, Financieros: alta densidad, muchos registros, filtros potentes
- Voluntarios y Médicos: interfaz simplificada, foco en tareas específicas

**4. Las acciones de alta frecuencia están en ≤2 clics:**
Para cada rol, sus 3 acciones más frecuentes deben ser alcanzables desde el dashboard
sin navegación extra. Se implementan como botones de acceso rápido o shortcuts.

**5. El rol Clínico tiene experiencia visual diferenciada:**
No solo es un "rol más". El módulo clínico tiene su propia capa visual (6.1.7) que
comunica protección y sensibilidad. Nunca se mezcla visualmente con el resto del sistema.

---

## 6.3.4 RESPONSIVE Y ACCESO MÓVIL

### Puntos críticos de uso móvil

Los siguientes roles usan el sistema desde móvil de forma frecuente:

| Rol | Pantallas críticas en móvil | Prioridad de optimización |
|-----|---------------------------|--------------------------|
| Coordinador ONG | Registro de asistencia, registro de horas, subir evidencias | 🔴 Crítica |
| Voluntario | Mis actividades, mis horas, mis certificados | 🔴 Crítica |
| Médico | Búsqueda de beneficiario, vista de ficha | 🟡 Alta |
| RRHH Manager | Pipeline de admisión (vista kanban reducida) | 🟡 Alta |

### Principios de diseño responsive

**Mobile-first para pantallas de campo:**
- Botones mínimo 44px de altura táctil
- Formularios de 1 columna en móvil
- Tabs horizontales con scroll en lugar de sidebar
- Acciones principales siempre visibles (fixed footer o sticky header)
- Sin hover-dependiente: todas las acciones accesibles por tap

**Adaptación de tablas en móvil:**
- Las tablas densas se convierten en cards apiladas en móvil
- Solo las columnas más críticas visibles por defecto
- "Ver más" para expandir el detalle de cada fila

---

## INSTRUCCIONES FINALES AL LLM

### Antes de generar cualquier diseño o prototipo

1. Lee la BD_Maestra para conocer los módulos y entidades exactas del sistema
2. Lee los RF de AGEN_3 para saber qué operaciones debe soportar cada pantalla
3. Lee el plan de negocio de AGEN_4 para entender qué módulos corresponden a cada plan
4. Mapea cada pantalla a los módulos reales de la BD antes de diseñarla
5. Verifica que cada componente de interfaz tiene un RF o CU que lo justifica

### Nivel de calidad esperado

Los prototipos y wireframes deben:
- Poder ser entregados a un desarrollador frontend para implementación directa
- Poder ser validados con usuarios reales de ONGs peruanas sin confusión
- Ser consistentes en nomenclatura con la BD (mismos nombres de entidades)
- Escalar de Plan Básico a Enterprise sin rediseño estructural

### Entregables de la Fase 6

| Entregable | Formato | Carpeta destino |
|-----------|---------|-----------------|
| Guía de estilo visual (tokens, componentes) | Markdown + Fig/HTML | `Fase 6 (UX-IX)/guia-estilos/` |
| Mapa de pantallas del sistema | Diagrama Mermaid + MD | `Fase 6 (UX-IX)/arquitectura-visual/` |
| Wireframes por módulo | Texto estructurado + ASCII | `Fase 6 (UX-IX)/wireframes/` |
| Especificación de experiencia por rol | Markdown | `Fase 6 (UX-IX)/experiencia-roles/` |
| Flujos de usuario críticos | Diagrama Mermaid | `Fase 6 (UX-IX)/flujos-usuario/` |

---

*AGEN_6.md — Prompt Maestro de UX/UI y Prototipado Front-End*
*Sistema: Democra ONG Platform*
*Versión: 1.0 — Generado: 2026-05-13*
*Autor: Eduardo Sebastian Paipay Vega — UNSCH*
*Depende de: AGEN_1 + AGEN_2 + AGEN_3 + AGEN_4 + BD_Maestra (AGEN_5)*
*Repositorio: https://github.com/Eduardo-Sebastian-Paipay-Vega/Documentaci-n_de_dise-o_de_Sistemas_y_Modulos*
