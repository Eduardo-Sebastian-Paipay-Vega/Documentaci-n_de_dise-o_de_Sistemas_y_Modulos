# FASE 6 — Diseño UX/UI

> **Proyecto**: Comerci — Sistema Inteligente de Gestión Financiera para MYPEs LATAM
> **Fase**: 6 — Diseño UX/UI
> **Versión**: 2.0
> **Fecha**: 2026-05-18
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🎯 Propósito de Esta Fase

Diseñar la experiencia completa del usuario de Comerci: desde que descarga la app hasta que toma su primera decisión financiera inteligente. Este documento define los principios de diseño, mapa de sitio, wireframes detallados de todas las pantallas clave, guía de estilos visual y flujos completos de usuario.

El usuario objetivo es un **comerciante peruano de 28–50 años, con educación secundaria, que usa el teléfono como su herramienta principal** y nunca ha usado un software financiero complejo.

---

## 1. PRINCIPIOS DE DISEÑO UX

### 1.1 Los 5 principios que guían cada decisión

**Principio 1 — Responde antes de preguntar**
El usuario no debe escribir nada para ver el valor. Al abrir la app, la respuesta ya está ahí. No formularios. No tutoriales. Valor en 3 segundos.

**Principio 2 — Un número, una pantalla**
Cada pantalla tiene una sola métrica protagonista. El cerebro del comerciante ya está saturado. No lo saturamos más. El dashboard tiene UN número principal: el balance neto de hoy.

**Principio 3 — El color es el mensaje**
Verde = tranquilidad. Amarillo = atención. Rojo = acción urgente. El usuario que no sabe leer el gráfico entiende el color. El diseño nunca depende de leer texto para comunicar urgencia.

**Principio 4 — Las alertas proponen, no solo informan**
"En 8 días sin dinero" no es útil. "En 8 días sin dinero. Haz esto ahora: [Botón: Cobrar deuda de S/ 300]" sí es útil. Cada alerta tiene una acción concreta adjunta.

**Principio 5 — Cero fricción en el dato más importante**
El saldo total de hoy se actualiza solo, sin que el usuario toque nada. El onboarding dura máximo 5 minutos. Si el usuario tiene que hacer algo complicado en los primeros 10 minutos, habrá abandonado antes de ver el valor.

### 1.2 Guía de tono de voz (microcopy)

| Situación | ❌ No decir | ✅ Decir |
|-----------|------------|---------|
| Error de conexión | "Error 503 de sincronización" | "No pudimos conectar con tu banco. Lo reintentamos en 5 min." |
| Alerta de quiebra | "Breakeven proyectado en T-8 días" | "⚠️ En 8 días, sin dinero para nómina. Actúa hoy." |
| Carga exitosa | "Sync completado" | "Todo al día ✓" |
| Categoría dudosa | "Confianza: 67%" | "¿Es esto un gasto de mercadería? [Sí / No]" |
| Sin datos aún | "Insufficient data" | "Tus primeros 3 días de datos están cargando. Regresa mañana para ver tendencias." |

---

## 2. GUÍA DE ESTILOS

### 2.1 Paleta de colores

```
PRIMARIOS
─────────────────────────────────────────────────────
Verde Comerci:      #1DB954   (éxito, balance positivo, "sí puedes comprar")
Azul Confianza:     #2563EB   (acción principal, botones CTA)
Blanco Base:        #FFFFFF   (fondos, cards)
Gris Fondo:         #F5F5F5   (background general)

SEMÁNTICOS (estado)
─────────────────────────────────────────────────────
Rojo Crítico:       #EF4444   (alerta crítica, quiebra inminente)
Amarillo Alerta:    #F59E0B   (advertencia, atención necesaria)
Verde OK:           #10B981   (sin riesgo, positivo)
Gris Info:          #6B7280   (texto secundario, labels)

CATEGORÍAS (consistentes en gráficos y íconos)
─────────────────────────────────────────────────────
Mercadería:         #FF6B6B   (rojo suave)
Nómina:             #4ECDC4   (turquesa)
Servicios:          #45B7D1   (azul cielo)
Transporte:         #96CEB4   (verde menta)
Alquiler:           #FFEAA7   (amarillo suave)
Marketing:          #DDA0DD   (violeta)
Otros gastos:       #D3D3D3   (gris neutro)
Ingresos (ventas):  #32CD32   (verde brillante)
```

### 2.2 Tipografía

```
FUENTE PRINCIPAL: Inter (Google Fonts — libre, legible en pantallas pequeñas)

Jerarquía:
├─ H1 (número principal del dashboard): 48px Bold
├─ H2 (títulos de sección):             22px SemiBold
├─ H3 (subtítulos, nombres de cuenta):  18px Medium
├─ Body (texto general):                15px Regular
├─ Caption (labels, fechas):            13px Regular
└─ Micro (términos legales, hints):     11px Regular

Línea de base: 1.5x interlineado
Color de texto principal: #1A1A1A
Color de texto secundario: #6B7280
```

### 2.3 Espaciado y grilla

```
Sistema de espaciado (múltiplos de 4px):
  xs:  4px
  sm:  8px
  md:  16px
  lg:  24px
  xl:  32px
  2xl: 48px

Grilla mobile: 375px ancho, padding lateral 16px, 4 columnas
Grilla tablet: 768px ancho, padding lateral 24px, 8 columnas

Bordes: radius 12px para cards, 8px para botones, 999px para chips/badges
Sombras: box-shadow 0 2px 8px rgba(0,0,0,0.08) para cards elevados
```

### 2.4 Componentes base

```
BOTÓN PRIMARIO
─────────────────────────────────
Background: #2563EB
Texto: blanco, 16px SemiBold
Padding: 14px 24px
Radius: 8px
Estado hover: #1D4ED8
Estado disabled: #93C5FD

BOTÓN SECUNDARIO
─────────────────────────────────
Background: transparente
Borde: 1.5px #2563EB
Texto: #2563EB, 16px Medium

CARD
─────────────────────────────────
Background: #FFFFFF
Radius: 12px
Padding: 16px
Shadow: 0 2px 8px rgba(0,0,0,0.08)

BADGE DE ALERTA
─────────────────────────────────
Critical: bg #FEE2E2, text #DC2626, borde #FECACA
Warning:  bg #FEF3C7, text #D97706, borde #FDE68A
Info:     bg #DBEAFE, text #2563EB, borde #BFDBFE

CHIP DE CATEGORÍA
─────────────────────────────────
Background: color de categoría al 15% opacidad
Texto: color de categoría al 100%
Padding: 4px 10px, radius: 999px
```

---

## 3. MAPA DE SITIO

```
COMERCI APP
│
├── 🚀 ONBOARDING (primera vez)
│   ├── 01 — Bienvenida + propuesta de valor
│   ├── 02 — Crear cuenta (email / Google / Facebook)
│   ├── 03 — Datos del negocio (nombre, sector, país)
│   ├── 04 — Conectar primera fuente de dinero
│   │   ├── Opción A: Conectar banco (Belvo)
│   │   ├── Opción B: Conectar Yape
│   │   └── Opción C: Ingresar caja manualmente
│   └── 05 — ¡Dashboard listo! (primer "Aha Moment")
│
├── 🏠 DASHBOARD (pantalla principal, tab 1)
│   ├── Balance total de hoy (número protagonista)
│   ├── Desglose por fuente (Banco / Yape / Caja / Deudas)
│   ├── Mini-gráfico ingresos vs gastos (7 días)
│   ├── Predictor de flujo (resumen 14 días)
│   └── Alertas activas (cards destacados)
│
├── 💸 MOVIMIENTOS (tab 2)
│   ├── Lista de transacciones (por fecha, paginada)
│   ├── Filtros: categoría, cuenta, fecha, monto
│   ├── Detalle de transacción
│   │   ├── Ver categoría asignada
│   │   ├── Cambiar categoría (reclasificación manual)
│   │   └── Excluir de cálculos
│   └── Búsqueda de transacciones
│
├── 📊 ANÁLISIS (tab 3)
│   ├── Gráfico de gastos por categoría (pie chart)
│   ├── Comparativa: este mes vs mes anterior
│   ├── Tendencias por categoría (línea de tiempo)
│   ├── Predictor de flujo (14 y 30 días)
│   │   ├── Gráfico de línea proyectada
│   │   ├── Día de quiebra proyectado (si aplica)
│   │   └── Recomendaciones asociadas
│   └── Simulador "¿Qué pasa si...?"
│       ├── "¿Puedo comprar X?"
│       ├── "¿Contrato empleado?"
│       └── "¿Reduzco gasto en Y?"
│
├── 🔔 ALERTAS (tab 4)
│   ├── Lista de alertas activas (ordenadas por severidad)
│   ├── Historial de alertas
│   └── Configuración de alertas
│       ├── Umbral de alerta de nómina
│       ├── Frecuencia de reportes
│       └── Canales (push / email / WhatsApp)
│
└── ⚙️ CONFIGURACIÓN (tab 5)
    ├── Mi negocio
    │   ├── Datos del negocio
    │   ├── Cuentas conectadas
    │   │   ├── Agregar cuenta
    │   │   ├── Sincronizar manualmente
    │   │   └── Desconectar cuenta
    │   ├── Deudas y pasivos
    │   └── Miembros del equipo
    ├── Mi suscripción
    │   ├── Plan actual
    │   ├── Upgrade de plan
    │   └── Historial de pagos
    ├── Categorías personalizadas
    ├── Reportes (descargar PDF)
    └── Cuenta y seguridad
```

---

## 4. WIREFRAMES DETALLADOS

### PANTALLA 01 — Onboarding: Bienvenida

```
┌─────────────────────────────┐
│                             │
│                             │
│    [LOGO COMERCI]           │
│                             │
│   ┌─────────────────────┐   │
│   │   Ilustración       │   │
│   │   comerciante       │   │
│   │   con datos         │   │
│   └─────────────────────┘   │
│                             │
│  Tu negocio. Tus finanzas.  │
│  Siempre claros.            │
│                             │
│  Sabe exactamente cuánto    │
│  tienes, dónde se fue, y    │
│  cuánto tendrás mañana.     │
│                             │
│                             │
│  ┌─────────────────────┐    │
│  │  Empieza gratis →   │    │   ← Botón primario (#2563EB)
│  └─────────────────────┘    │
│                             │
│   Ya tengo cuenta. Entrar   │   ← Link texto
│                             │
└─────────────────────────────┘
```

---

### PANTALLA 02 — Onboarding: Crear cuenta

```
┌─────────────────────────────┐
│  ← Atrás                   │
│                             │
│  Crea tu cuenta             │   ← H2
│  Es gratis por 14 días      │   ← Caption, #6B7280
│                             │
│  ┌─────────────────────┐    │
│  │ Continúa con Google │    │   ← Botón OAuth (blanco + borde)
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ Continúa con Facebook│   │
│  └─────────────────────┘    │
│                             │
│  ──────── o usa email ────  │
│                             │
│  [Nombre completo        ]  │   ← Input
│  [Correo electrónico     ]  │
│  [Contraseña             ]  │
│                             │
│  ┌─────────────────────┐    │
│  │    Crear cuenta →   │    │   ← Botón primario
│  └─────────────────────┘    │
│                             │
│  Al crear aceptas los       │
│  Términos y Privacidad      │   ← Micro text
│                             │
└─────────────────────────────┘
```

---

### PANTALLA 03 — Onboarding: Datos del negocio

```
┌─────────────────────────────┐
│  ← Atrás      [2 de 4]     │
│                             │
│  Cuéntanos sobre            │
│  tu negocio                 │   ← H2
│                             │
│  Nombre del negocio         │   ← Label
│  [Bodega Don José        ]  │   ← Input
│                             │
│  ¿Qué tipo de negocio?      │
│  ┌──────┐┌──────┐┌──────┐  │
│  │ 🛒   ││ 🍽️   ││ ⚙️   │  │   ← Chips seleccionables
│  │Tienda││Comida││Servs.│  │
│  └──────┘└──────┘└──────┘  │
│  ┌──────┐┌──────┐          │
│  │ 🚗   ││ ➕   │          │
│  │Transp││Otro  │          │
│  └──────┘└──────┘          │
│                             │
│  ¿Cuántos empleados?        │
│  [  3                    ]  │
│                             │
│  ¿Cuánto vendes al mes?     │
│  (aproximado, solo para ti) │   ← Caption
│  [  S/ 5,000             ]  │
│                             │
│  ┌─────────────────────┐    │
│  │    Continuar →      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### PANTALLA 04 — Onboarding: Conectar dinero

```
┌─────────────────────────────┐
│  ← Atrás      [3 de 4]     │
│                             │
│  ¿Dónde está tu dinero?     │   ← H2
│  Conecta tus cuentas        │
│                             │
│  ┌─────────────────────┐    │
│  │ 🏦 Conectar Banco   │    │   ← Card (borde #2563EB si seleccionado)
│  │ BCP, BBVA, Inter... │    │
│  │            →        │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 📱 Conectar Yape    │    │
│  │ o Plin              │    │
│  │            →        │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 💵 Tengo caja       │    │
│  │ efectivo            │    │
│  │            →        │    │
│  └─────────────────────┘    │
│                             │
│  Puedes agregar más         │   ← Caption, #6B7280
│  cuentas después            │
│                             │
│  ┌─────────────────────┐    │
│  │  Ahora no / saltar  │    │   ← Link texto, no botón
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### PANTALLA 05 — DASHBOARD (pantalla principal)

```
┌─────────────────────────────┐
│  Hola José ☀️    🔔 [2]    │   ← Header. Badge = alertas sin leer
│  Bodega Don José            │
│─────────────────────────────│
│                             │
│       TU DINERO HOY         │   ← Caption, centrado
│                             │
│         S/ 4,350            │   ← H1, 48px Bold, #1A1A1A
│                             │
│  ┌──────┐┌──────┐┌──────┐  │
│  │🏦    ││📱    ││💵    │  │   ← Mini-cards de cuentas
│  │Banco ││Yape  ││Caja  │  │
│  │1,800 ││1,200 ││  850 │  │
│  └──────┘└──────┘└──────┘  │
│     Deudas: - S/ 500 ↗     │   ← Link a detalle de pasivos
│─────────────────────────────│
│                             │
│  ⚠️ ATENCIÓN               │   ← Badge amarillo
│  En 14 días, podrías        │
│  quedarte sin dinero        │
│  para nómina (S/ 600)       │
│                             │
│  [Ver qué hacer →]          │   ← Botón secundario
│─────────────────────────────│
│                             │
│  Esta semana                │   ← H3
│  📈 Ingresos: S/ 1,250      │   ← Verde
│  📉 Gastos:   S/ 890        │   ← Rojo suave
│                             │
│  [  Gráfico barras 7 días ] │
│                             │
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │   ← Tab bar bottom
└─────────────────────────────┘
```

---

### PANTALLA 06 — Dashboard con alerta crítica

```
┌─────────────────────────────┐
│  Hola José      🔔 [1]     │
│  Bodega Don José            │
│─────────────────────────────│
│                             │
│       TU DINERO HOY         │
│                             │
│         S/ 1,500            │   ← Número en rojo (#EF4444)
│                             │
│  ┌──────┐┌──────┐┌──────┐  │
│  │🏦    ││📱    ││💵    │  │
│  │Banco ││Yape  ││Caja  │  │
│  │  800 ││  400 ││  300 │  │
│  └──────┘└──────┘└──────┘  │
│─────────────────────────────│
│                             │
│  🚨 ACTÚA HOY               │   ← Badge rojo parpadeante
│  En 8 días sin dinero       │
│  para operar.               │
│                             │
│  Opciones:                  │
│  • Cobra S/300 de Luis G.   │   ← Acción específica
│  • Pospón compra de S/400   │
│  • Reduce gastos S/30/día   │
│                             │
│  [Tomar acción →]           │   ← Botón rojo primario
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

### PANTALLA 07 — Movimientos (lista de transacciones)

```
┌─────────────────────────────┐
│  Mis movimientos            │   ← H2
│  Mayo 2026        [Filtro ▾]│
│─────────────────────────────│
│                             │
│  HOY                        │   ← Sección por fecha
│  ┌─────────────────────┐    │
│  │ 🛒 Mercadería       │    │
│  │ Compra a dist. Lima │    │
│  │ - S/ 250       12:30│    │   ← Monto negativo en rojo
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 💰 Venta            │    │
│  │ Cobro cliente Marta │    │
│  │ + S/ 180       09:15│    │   ← Monto positivo en verde
│  └─────────────────────┘    │
│                             │
│  AYER                       │
│  ┌─────────────────────┐    │
│  │ 👥 Nómina           │    │
│  │ Pago semanal Juan   │    │
│  │ - S/ 150       18:00│    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ ❓ Otros gastos     │    │   ← Categoría dudosa = icono ❓
│  │ "pago tienda"       │    │
│  │ - S/ 45       14:20 │    │
│  │  ¿Es mercadería?    │    │   ← Prompt inline de reclasificación
│  │  [Sí] [No]          │    │
│  └─────────────────────┘    │
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

### PANTALLA 08 — Análisis: Gastos por categoría

```
┌─────────────────────────────┐
│  Análisis         [Mayo ▾]  │   ← Selector de período
│─────────────────────────────│
│                             │
│  Tus gastos este mes        │   ← H3
│                             │
│      ┌──────────┐           │
│      │  PIE     │           │   ← Gráfico pie, colores de categorías
│      │ CHART    │           │
│      │          │           │
│      └──────────┘           │
│                             │
│  🛒 Mercadería    S/1,250   42%│
│  ████████████████ ███       │   ← Barra horizontal proporcional
│                             │
│  👥 Nómina        S/ 600   20%│
│  ████████         │         │
│                             │
│  🏪 Alquiler      S/ 500   17%│
│  ███████          │         │
│                             │
│  🚗 Transporte    S/ 180    6%│
│  ██               │         │
│  ↑ +25% vs abril            │   ← Anomalía resaltada en amarillo
│                             │
│  📣 Marketing     S/  50    2%│
│  █                │         │
│  ↑ +300% vs abril ⚠️        │   ← Anomalía crítica
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

### PANTALLA 09 — Predictor de flujo (14 y 30 días)

```
┌─────────────────────────────┐
│  ← Análisis                 │
│                             │
│  ¿Cuánto tendrás?           │   ← H2
│                             │
│  [14 días] [30 días]        │   ← Toggle selector
│─────────────────────────────│
│                             │
│    GRÁFICO DE LÍNEA         │
│    S/                       │
│    4k ─ ─ ─ ─ ─ · · ·      │   ← Línea punteada = proyección
│    3k         ·             │
│    2k   ·   ·               │
│    1k  ·                    │
│    0  ─────────────────→    │
│       hoy       +14 días    │
│                             │
│─────────────────────────────│
│  En 14 días tendrás:        │
│                             │
│         S/ 2,850            │   ← Verde si positivo
│                             │
│  📥 Ingresos esperados: S/3,600
│  📤 Gastos esperados:   S/2,100
│  ✅ Saldo: positivo, seguro │
│─────────────────────────────│
│  Gasto diario promedio:     │
│  S/ 70 / día                │
│                             │
│  💡 Si reduces transporte   │
│  15%, ahorras S/27/mes      │   ← Recomendación contextual
│                             │
│  [Ver recomendaciones →]    │
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

### PANTALLA 10 — Simulador "¿Puedo comprar?"

```
┌─────────────────────────────┐
│  ← Análisis                 │
│                             │
│  ¿Puedo hacer             │
│  esta compra?               │   ← H2
│                             │
│  ¿Cuánto cuesta?            │
│  ┌─────────────────────┐    │
│  │  S/  [500        ]  │    │   ← Input numérico grande
│  └─────────────────────┘    │
│                             │
│  ¿Para qué es?   [opcional] │
│  [Compra de mercadería   ▾] │
│                             │
│  ┌─────────────────────┐    │
│  │   Verificar →       │    │   ← Botón primario
│  └─────────────────────┘    │
│                             │
│─────────────────────────────│
│                             │
│  RESULTADO:                 │
│                             │
│  ✅ SÍ PUEDES               │   ← Verde grande si OK
│                             │
│  Hoy: S/ 4,350              │
│  Después de compra: S/3,850 │
│  En 30 días: S/ 2,950       │
│  Margen seguro: ✅           │
│                             │
│  [Registrar esta compra]    │   ← Botón secundario
│                             │
│  ─────────────────────      │
│                             │
│  ❌ NO RECOMENDADO          │   ← (versión alternativa si no puede)
│                             │
│  Te quedarías con S/ 700.   │
│  Por debajo del mínimo S/1K │
│                             │
│  [Qué hacer en cambio →]    │
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

### PANTALLA 11 — Centro de alertas

```
┌─────────────────────────────┐
│  Alertas                    │   ← H2
│  2 sin leer                 │   ← Caption
│─────────────────────────────│
│                             │
│  ┌─────────────────────┐    │
│  │ 🚨 CRÍTICO          │    │   ← Card borde rojo
│  │ En 8 días sin dinero│    │
│  │ para nómina (S/600) │    │
│  │ Hace 1 hora         │    │
│  │ [Qué hacer →]       │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ ⚠️ ATENCIÓN         │    │   ← Card borde amarillo
│  │ Marketing subió 300%│    │
│  │ vs mes anterior     │    │
│  │ Hace 3 horas        │    │
│  │ [Ver detalle →]     │    │
│  └─────────────────────┘    │
│                             │
│  YA LEÍDAS                  │   ← Separador
│                             │
│  ┌─────────────────────┐    │
│  │ ℹ️ INFO              │    │   ← Card borde gris
│  │ Banco sincronizado  │    │
│  │ correctamente       │    │
│  │ Hace 2 días         │    │
│  └─────────────────────┘    │
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

### PANTALLA 12 — Configuración de cuentas

```
┌─────────────────────────────┐
│  ← Configuración            │
│                             │
│  Mis cuentas                │   ← H2
│─────────────────────────────│
│                             │
│  ┌─────────────────────┐    │
│  │ 🏦 BCP — Ahorros    │    │
│  │ Saldo: S/ 1,800     │    │
│  │ Sync: hace 5 min ✓  │    │
│  │           [···]     │    │   ← Menú contextual
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 📱 Yape             │    │
│  │ Saldo: S/ 1,200     │    │
│  │ Sync: hace 12 min ✓ │    │
│  │           [···]     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 💵 Caja principal   │    │
│  │ Saldo: S/ 850       │    │
│  │ Actualizado manual  │    │
│  │           [···]     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   + Agregar cuenta  │    │   ← Botón secundario
│  └─────────────────────┘    │
│─────────────────────────────│
│  🏠     💸     📊    🔔  ⚙️ │
└─────────────────────────────┘
```

---

## 5. FLUJOS DE USUARIO (USER FLOWS)

### FLUJO 1 — Onboarding completo (primera vez)

```
[Descarga app]
       │
       ▼
[Pantalla Bienvenida]
       │
       ├─ "Empieza gratis" ──────────────────────────────────────────────┐
       └─ "Ya tengo cuenta" → [Pantalla Login] → [Dashboard]            │
                                                                         ▼
                                                              [Crear cuenta]
                                                                    │
                                                     ┌──────────────┤
                                                     ▼              ▼
                                             [OAuth Google]   [Form email]
                                                     │              │
                                                     └──────┬───────┘
                                                            ▼
                                                  [Datos del negocio]
                                                  nombre, sector, empleados
                                                            │
                                                            ▼
                                                  [Conectar dinero]
                                                       │    │    │
                                              ┌────────┘    │    └────────┐
                                              ▼             ▼             ▼
                                          [Banco]        [Yape]       [Caja]
                                          (Belvo)        (API)      (manual)
                                              │             │             │
                                              └─────────────┴─────────────┘
                                                            │
                                                            ▼
                                                    [Cargando datos...]
                                                    (máx 30 segundos)
                                                            │
                                                            ▼
                                                    [Dashboard: primer
                                                     Aha Moment]
                                                    Muestra balance real
                                                    por primera vez
```

---

### FLUJO 2 — Consulta diaria (usuario habitual)

```
[Abre app]
     │
     ▼
[Dashboard] ──────────────────────────────────────────────────────────┐
     │                                                                 │
     ├── Sin alertas ────────────────────────────────────────────────→│ ve balance, cierra app
     │                                                                 │
     └── Con alerta crítica ──────────────────────────────────────────┐
                                                                       │
                                                                       ▼
                                                             [Card de alerta]
                                                             "En 8 días sin dinero"
                                                                       │
                                                               [Ver qué hacer]
                                                                       │
                                                                       ▼
                                                            [Pantalla de acción]
                                                            Opciones concretas
                                                                  │    │
                                                              ┌───┘    └───┐
                                                              ▼            ▼
                                                        [Marcar           [Ir a
                                                         tomada]        Movimientos
                                                                        a revisar]
```

---

### FLUJO 3 — Decisión de compra

```
[Dashboard]
     │
     ▼
[Tab Análisis]
     │
     ▼
[Simulador "¿Puedo comprar?"]
     │
     ▼
[Usuario ingresa monto: S/ 500]
     │
     ▼
[Sistema calcula en <1 segundo]
     │
     ├── Resultado: SÍ ──────────────────────────────────────────────┐
     │                                                                │
     │                                                       [Muestra S/3,850]
     │                                                       [en 30 días]
     │                                                                │
     │                                               [Registrar como compra]
     │                                                                │
     │                                                       [Transacción
     │                                                        guardada]
     │
     └── Resultado: NO ──────────────────────────────────────────────┐
                                                                      │
                                                             [Muestra S/700]
                                                             [Por debajo del mínimo]
                                                                      │
                                                            [Qué hacer en cambio →]
                                                                      │
                                                            [Lista de alternativas:
                                                             cobrar deudas, etc.]
```

---

### FLUJO 4 — Corrección de categoría

```
[Tab Movimientos]
     │
     ▼
[Lista transacciones]
     │
     ▼
[Toca transacción con ❓]
     │
     ▼
[Modal: "¿Es mercadería?"]
[Sí] [No] [Elegir otra]
     │
     ├── [Sí] ──────────────────────────────────────────────────────┐
     │                                                               │
     │                                                    [Categoría: Mercadería ✓]
     │                                                    [Sistema aprende]
     │                                                               │
     │                                                    [Gráficos actualizados]
     │
     └── [Elegir otra] ──────────────────────────────────────────────┐
                                                                      │
                                                          [Listado de categorías]
                                                          con íconos y colores
                                                                      │
                                                          [Usuario selecciona]
                                                                      │
                                                          [Confirmado ✓]
```

---

## 6. CRITERIOS DE ACCESIBILIDAD (a11y)

### Estándar de cumplimiento: WCAG 2.1 nivel AA

| Criterio | Especificación |
|----------|---------------|
| **Contraste de texto** | Mínimo 4.5:1 para texto normal, 3:1 para texto grande |
| **Tamaño de touch target** | Mínimo 44×44 px en todos los botones e íconos interactivos |
| **No solo color** | Las alertas usan color + ícono + texto (nunca solo color) |
| **Texto escalable** | La UI funciona correctamente con texto al 200% de zoom |
| **Labels en inputs** | Todos los campos tienen `label` explícito (no solo placeholder) |
| **Modo oscuro** | Soporte de sistema (prefers-color-scheme) en v1.1 |
| **Compatibilidad** | iOS VoiceOver y Android TalkBack compatible desde v1.0 |

### Consideraciones específicas para el usuario objetivo

El comerciante peruano típico puede tener dificultades de lectura o usar el teléfono en condiciones de luz solar directa. Por eso:

- Los números principales son de 48px mínimo (legibles a distancia)
- Los botones de acción son de mínimo 56px de altura en mobile
- El contraste de los colores semánticos (rojo/verde) supera 5:1 en todos los fondos
- Los mensajes de error y alerta incluyen siempre texto descriptivo, no solo íconos

---

## 7. ESTADOS DE PANTALLA (State Design)

Para cada pantalla clave, se definen todos los estados posibles:

### Dashboard — estados

| Estado | Descripción | Visual |
|--------|------------|--------|
| `loading` | Primera carga o sincronización | Skeleton screens grises animados |
| `ok` | Balance positivo, sin alertas | Número en negro, fondo blanco limpio |
| `warning` | Alerta amarilla activa | Card de alerta amarillo visible |
| `critical` | Alerta roja activa | Número en rojo, card rojo visible |
| `no_data` | Sin transacciones aún | Ilustración + mensaje de guía |
| `offline` | Sin conexión a internet | Banner "Sin conexión — datos pueden no estar actualizados" |
| `sync_error` | Error de sincronización bancaria | Badge en la cuenta con error |

### Transacciones — estados

| Estado | Descripción |
|--------|------------|
| `loading` | Skeleton screens mientras carga historial |
| `empty` | Sin transacciones en el período seleccionado |
| `categorized` | Transacción con categoría asignada |
| `uncategorized` | Categoría ❓ con prompt inline de clasificación |
| `excluded` | Marcada como no contable (visible pero tachada) |

---

## 8. ANIMACIONES Y MICRO-INTERACCIONES

Las animaciones deben respetar `prefers-reduced-motion`:

| Interacción | Animación | Duración |
|-------------|----------|----------|
| Carga del número principal | Count-up desde 0 hasta el valor real | 600ms, ease-out |
| Aparición de card de alerta | Slide-in desde abajo | 300ms, ease-out |
| Cambio de tab | Fade + slide horizontal | 200ms, ease |
| Confirmación de acción | Check mark animado (✓) | 400ms |
| Pull-to-refresh | Spinner con logo Comerci | Variable |
| Transición entre pantallas | Slide horizontal iOS nativo | 350ms, spring |

---

## 9. LINEAMIENTOS DE RESPONSIVE Y PLATAFORMAS

### Plataformas prioritarias (en orden)

1. **Android mobile** (375–430px): 80% del mercado LATAM de MYPEs
2. **iOS mobile** (375–430px): 15% del mercado
3. **Web mobile** (PWA, por si no instala la app): 5%
4. **Tablet** (768px+): soporte secundario, misma jerarquía visual
5. **Desktop web**: solo para contadores (rol accountant). Layout de 2 columnas.

### Adaptación de wireframes por breakpoint

```
Mobile (<768px):
  - Tab bar al fondo
  - Número principal en H1 grande (48px)
  - Cards en columna única, full-width

Tablet (≥768px):
  - Tab bar lateral izquierda
  - Número principal mantiene 48px
  - Cards en grilla 2 columnas

Desktop (≥1024px, solo contadores):
  - Sidebar con navegación completa
  - Dashboard en 3 columnas
  - Tabla de transacciones en lugar de lista
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN UX

```
Principios y tono de voz
[✅] 5 principios de diseño definidos
[✅] Guía de microcopy con ejemplos correctos/incorrectos

Guía de estilos
[✅] Paleta de colores completa (primarios + semánticos + categorías)
[✅] Tipografía definida (fuente, tamaños, jerarquía)
[✅] Sistema de espaciado (4px base)
[✅] Componentes base (botones, cards, badges, chips)

Mapa de sitio
[✅] 5 secciones principales con sub-pantallas
[✅] Flujo de onboarding separado

Wireframes
[✅] 12 pantallas clave con wireframes detallados
[✅] Estados de dashboard (ok / warning / critical / loading / offline)

Flujos de usuario
[✅] Flujo 1: Onboarding completo
[✅] Flujo 2: Consulta diaria
[✅] Flujo 3: Decisión de compra
[✅] Flujo 4: Corrección de categoría

Accesibilidad y estados
[✅] Criterios WCAG 2.1 AA definidos
[✅] Estados de pantalla para dashboard y movimientos
[✅] Animaciones y micro-interacciones
[✅] Lineamientos responsive por plataforma
```

---

## 📚 Cambios de Versión

**v1.0** (2026-05-18): Plantilla vacía
**v2.0** (2026-05-18): Documento completo — 5 principios UX, guía de estilos, mapa de sitio, 12 wireframes, 4 flujos de usuario, a11y, estados de pantalla, animaciones

---

*FASE 6 completada. Siguiente: FASE 7 — Arquitectura Técnica e Implementación.*
