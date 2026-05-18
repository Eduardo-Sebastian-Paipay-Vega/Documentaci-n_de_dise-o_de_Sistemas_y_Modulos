# 🎨 FASE 6 — Diseño UX/UI

> **Proyecto**: Sistema de Gestión Educativa Integral  
> **Fase**: 6 — Experiencia e Interfaz de Usuario  
> **Versión**: 1.0  
> **Fecha**: 2026-05-15  
> **Autor**: Orquestación Automática Claude

---

## 🎯 Principios de Diseño UX

### **1. Mobile-First**
- 70% de estudiantes acceden desde móvil
- Diseño responsive, funcionality sin compromisos
- Touch-friendly (botones 48px+)

### **2. Gamificación Visual**
- Colores vibrantes, animaciones engaging
- Badges visibles, leaderboards celebratorios
- Micro-interacciones que recompensen acciones

### **3. Claridad y Accesibilidad**
- Contraste mínimo 4.5:1 (WCAG AA)
- Fuentes legibles (16px mínimo en mobile)
- Sin jerga técnica; lenguaje simple

### **4. Rapidez**
- Carga <2 segundos (target)
- Respuesta <200ms en interacciones
- Ofline-first para content crítico

### **5. Personalización**
- Dark/light mode
- Idiomas (10+)
- Temas por institución (branding)

---

## 🗺️ Mapa de Sitio / Información Architecture

```
SISTEMA INTEGRADO EDUCATIVO
│
├── 📚 ENSEÑANZA & APRENDIZAJE
│   ├─ Dashboard estudiante
│   ├─ Cursos disponibles
│   ├─ Mis lecciones (en progreso)
│   ├─ Evaluaciones y pruebas
│   ├─ Mis calificaciones
│   └─ Recursos (descargar)
│
├── 🎮 GAMIFICACIÓN
│   ├─ Mi perfil (nivel, puntos)
│   ├─ Badges ganados
│   ├─ Leaderboard global
│   ├─ Misiones del mes
│   └─ Tienda (puntos → premios)
│
├── 💬 COMUNICACIÓN
│   ├─ Chat con profesor
│   ├─ Mensajes del curso
│   ├─ Notificaciones
│   └─ Anuncios institución
│
├── 👨‍💼 PERFIL & CUENTA
│   ├─ Mi información
│   ├─ Cambiar contraseña
│   ├─ Preferencias (idioma, tema)
│   └─ Privacidad y seguridad
│
├── 💳 PAGOS & FINANZAS
│   ├─ Mi estado de pagos
│   ├─ Pagar matrícula
│   ├─ Descargar recibos
│   └─ Historial
│
├── 📊 REPORTES (Padre/Admin)
│   ├─ Desempeño del estudiante
│   ├─ Asistencia
│   ├─ Predicción de riesgo
│   └─ Exportar reportes
│
└── ⚙️ ADMINISTRACIÓN (Admin/Profesor)
    ├─ Gestionar cursos
    ├─ Calificar trabajos
    ├─ Crear evaluaciones
    ├─ Ver estadísticas clase
    └─ Comunicados masivos
```

---

## 📱 Wireframes Principales

### **1. Dashboard Estudiante (Mobile)**

```
┌─────────────────────────────┐
│  Sistema Educativo  🔔 👤   │ ← Header (sticky)
├─────────────────────────────┤
│                             │
│  ¡Hola, Juan!              │
│  Nivel 5 ⭐⭐⭐⭐⭐        │
│  1250 puntos               │
│                             │
├─────────────────────────────┤
│ 📊 TUS CURSOS (3)           │ ← Tabs
├─────────────────────────────┤
│                             │
│ [Matemáticas]              │
│ Progreso: ████░░░░░░ 60%   │
│ Próxima lección: Álgebra    │
│                             │
│ [Inglés]                    │
│ Progreso: ██████░░░░ 40%   │
│                             │
│ [Historia]                  │
│ Progreso: ████████░░ 75%   │
│                             │
├─────────────────────────────┤
│ 🎯 MISIÓN DEL MES           │
├─────────────────────────────┤
│ Completa 5 lecciones        │
│ Progreso: ████░░░░░░ 60%   │
│ Recompensa: 100 puntos      │
│                             │
├─────────────────────────────┤
│ [Empezar] [Mis Badges]      │ ← Botones CTA
└─────────────────────────────┘
```

---

### **2. Lectura de Lección (Web)**

```
┌──────────────────────────────────────────────────────┐
│ 📚 Matemáticas → Módulo 2 → Lección 5             │ ← Breadcrumb
│ Ecuaciones Cuadráticas                             │
├─────────────────────────┬──────────────────────────┤
│                         │                          │
│  CONTENIDO PRINCIPAL    │  PANEL DERECHO:          │
│  ─────────────────      │  ─────────────────       │
│                         │  Progreso módulo:        │
│  [Video 5:30]           │  ████░░░░░ 50%          │
│                         │                          │
│  Transcripción + texto  │  Próxima lección:        │
│  sobre ecuaciones...    │  Teorema Cuadrático     │
│                         │                          │
│  📊 Problema interactivo│  Recursos:               │
│  [Resuelve: x² + 2x...] │  📄 PDF (descarga)      │
│  [TU RESPUESTA: ]       │  📹 Video (4:30)        │
│  [REVISAR]              │  📝 Apuntes             │
│                         │                          │
│                         │  Puntaje: 10/10 ✅      │
│                         │  Tiempo: 8 min          │
│                         │  +10 puntos 🎉          │
│                         │                          │
├─────────────────────────┼──────────────────────────┤
│ [← Atrás] [Siguiente →] │ [Chat profesor] [Ayuda]  │
└─────────────────────────┴──────────────────────────┘
```

---

### **3. Panel Padre (Dashboard)**

```
┌────────────────────────────────────────┐
│ Portal Padre | Sistema Educativo      │
├────────────────────────────────────────┤
│                                        │
│ 👦 Juan González — 10° A              │ ← Selector hijo
│                                        │
│ ESTADO GENERAL:                       │
│ ├─ Asistencia: 96% ✅                │
│ ├─ Promedio: 8.5/10 ✅               │
│ ├─ Nivel de engagement: Alto ✅      │
│ └─ Riesgo de abandono: 5% ✅         │
│                                        │
│ CALIFICACIONES (Este bimestre):       │
│ ├─ Matemáticas: 8/10 📈              │
│ ├─ Inglés: 7.5/10 →                  │
│ ├─ Historia: 9/10 📈                 │
│ └─ Ver detalle de todas               │
│                                        │
│ ÚLTIMAS LECCIONES:                    │
│ ├─ ✅ Ecuaciones Cuadráticas (8/10)  │
│ ├─ ✅ Simple Past (7/10)             │
│ └─ ⏳ Revolución Francesa (En curso)  │
│                                        │
│ INFORMACIÓN DE PAGO:                  │
│ ├─ Próximo pago: 1 de Junio           │
│ ├─ Monto: $150                        │
│ └─ Estado: Al día ✅                  │
│                                        │
│ [Ver reportes completo] [Pagar]       │
└────────────────────────────────────────┘
```

---

## 🎨 Guía de Estilos

### **Paleta de Colores**

```
PRIMARY:      #4F46E5 (Azul profundo)
SECONDARY:    #06B6D4 (Cyan/Turquesa)
ACCENT:       #EC4899 (Rosa/Magenta)
SUCCESS:      #10B981 (Verde)
WARNING:      #F59E0B (Naranja)
ERROR:        #EF4444 (Rojo)
NEUTRAL:      #6B7280 (Gris)

DARK MODE:
BG Primary:   #0F172A (Azul muy oscuro)
BG Secondary: #1E293B (Gris oscuro)
Text:         #F8FAFC (Blanco roto)
```

---

### **Tipografía**

```
FUENTE PRINCIPAL: Inter (sans-serif, moderno, limpio)

H1 (Títulos): 32px, Bold (700), line-height 1.2
H2 (Subtítulos): 24px, Semibold (600), line-height 1.3
H3 (Secciones): 18px, Semibold (600), line-height 1.4
Body (Texto): 16px, Regular (400), line-height 1.6
Small (Labels): 14px, Regular (400), line-height 1.5
```

---

### **Componentes Clave**

| Componente | Descripción | Uso |
|-----------|------------|-----|
| **Button** | Primary (fill), Secondary (outline), Tertiary (text) | CTA, acciones |
| **Input** | Texto, email, password, select, checkbox, radio | Formularios |
| **Card** | Contenedor con sombra, borde, padding | Agrupar contenido |
| **Badge** | Pequeño indicador (color, icono, texto) | Estados, logros |
| **Modal** | Overlay oscuro + contenedor central | Confirmaciones |
| **Toast** | Notificación temporal (esquina inferior) | Feedback |
| **Loader** | Spinner circular o progreso | Operaciones async |
| **Avatar** | Imagen redonda de usuario | Identificación |
| **Dropdown** | Menú desplegable | Opciones |

---

## 🌊 Flujos de Usuario Principales

### **Flujo 1: Estudiante Completa Lección**

```
[Dashboard] 
    ↓ Clic en curso
[Lista Lecciones]
    ↓ Abre lección
[Lectura + Video]
    ↓ Completa problema
[Verificación IA]
    ↓
    ├─→ Correcto → [Siguiente lección] + 10 puntos ✅
    └─→ Incorrecto → [Retroalimentación] + Reintentar
```

---

### **Flujo 2: Padre Realiza Pago**

```
[Dashboard Padre]
    ↓ Sección "Pagos"
[Mis Pagos Pendientes]
    ↓ Clic en "Pagar"
[Confirmación de Monto]
    ↓ Clic "Confirmar"
[Ingresa Tarjeta] *Stripe
    ↓ Procesa (2-3 seg)
    ├─→ Exitoso → [Recibo descargable] + Email ✅
    └─→ Fallido → [Reintenta] o [Contactar soporte]
```

---

## 📊 Prototipado y Validación

### **Testing Plan**

1. **Usability Testing** (50+ usuarios)
   - Estudiantes de diferentes grados
   - Padres sin experiencia tech
   - Profesores mayores (50+)

2. **A/B Testing** (Después de MVP)
   - Variaciones de botones, colores
   - Micro-copy (textos motivacionales vs neutros)
   - Orden de secciones

3. **Análisis Heatmap/Session Recording**
   - Dónde hacen clic los usuarios
   - Tiempo en secciones
   - Rutas de abandono

---

## ♿ Accesibilidad (WCAG 2.1 AA)

| Criterio | Implementación |
|----------|-----------------|
| **Contraste** | Mínimo 4.5:1 (texto normal) |
| **Tamaño texto** | Escalable hasta 200% |
| **Navegación teclado** | Tab completo, focus visible |
| **Alt text** | Todas las imágenes descritas |
| **Labels** | Todos los inputs con <label> |
| **Aria** | Roles y atributos para screen readers |
| **Color** | No solo color transmite info |
| **Movimiento** | Reducible (prefers-reduced-motion) |

---

## 📱 Responsive Breakpoints

```
Mobile:      < 640px  (layouts de una columna)
Tablet:      640-1024px (dos columnas)
Desktop:     > 1024px (tres+ columnas, sidebars)

Ejemplo (Cursos):
┌─────────┐        ┌──────────────┐        ┌────────────────────┐
│ Curso 1 │        │ Curso 1      │        │ Sidebar │ Curso 1   │
│ Curso 2 │        │ Curso 2      │        │         │           │
│ Curso 3 │        │ Curso 3      │        │         │ (Detalles)│
│         │        │ Curso 4      │        │         │           │
└─────────┘        └──────────────┘        └────────────────────┘
  Mobile             Tablet                    Desktop
```

---

## 🎬 Animaciones y Micro-interacciones

```
Lección completada:
┌────────────────────┐
│  ¡Excelente! 🎉   │  (Confetti animation)
│  +10 puntos        │  (Contador animado: 0 → 10)
│  Nuevo badge: 🏆   │  (Aparece con scale-in)
│  Próxima lección   │  (Fade-in después 1s)
│  en 3... 2... 1...  │  (Countdown)
└────────────────────┘

Button hover:
Normal:  bg=#4F46E5, shadow=0
Hover:   bg=#4338CA, shadow=8px, scale=1.02
Active:  bg=#3730A3, scale=0.98
```

---

## ✅ Conclusión

Diseño UX/UI pensado para:
- ✅ Máximo engagement (gamificación, rapidez)
- ✅ Accesibilidad (WCAG AA)
- ✅ Responsivo (móvil, tablet, desktop)
- ✅ Rendimiento (<2s carga, <200ms respuesta)
- ✅ Inclusivo (10+ idiomas, dark/light mode)
- ✅ Delightful (animaciones, micro-interacciones)

---

*Fase 6 completada: 2026-05-15*  
**TODAS LAS FASES COMPLETADAS**

---
