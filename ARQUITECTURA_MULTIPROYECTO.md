# 🏗️ ARQUITECTURA MULTI-PROYECTO — Estructura Escalable

> **Versión**: 2.0  
> **Tipo**: Arquitectura del repositorio  
> **Propósito**: Soportar múltiples proyectos simultáneamente  
> **Fecha**: 2026-05-14

---

## 🎯 CONCEPTO

El repositorio ahora soporta **múltiples proyectos independientes**, cada uno con su propia rama de documentación.

**Ventajas:**
- ✅ Proyectos completamente aislados
- ✅ Fácil de navegar y organizar
- ✅ Escalable (sin límite de proyectos)
- ✅ Cada proyecto tiene su propio `DATOS_PROYECTO.json`
- ✅ Puedes ejecutar orquestaciones en paralelo

---

## 📁 ESTRUCTURA DEL REPOSITORIO v2.0

```
Documentación__/                          ← Raíz del repositorio
│
├── 📄 CLAUDE.md                          ← Contexto general del repo
├── 📄 README_PROYECTOS.md               ← Índice de proyectos
│
├── 📁 SISTEMA_ORQUESTACION/              ← (OPCIONAL) Documentación del sistema
│   ├── 📄 PROMPT_MAESTRO.md
│   ├── 📄 PROMPTS_ESPECIALIZADOS.md
│   ├── 📄 FLUJO_EJECUCION.md
│   ├── 📄 MAPA_UBICACION_ARCHIVOS.md
│   ├── 📄 CHECKLIST_EJECUCION_CLAUDE.md
│   ├── 📄 GUIA_RAPIDA_ORQUESTACION.md
│   └── 📄 SISTEMA_ORQUESTACION_README.md
│
│
├── 📁 EDUCACION/                        ← PROYECTO 1: Sistema de Gestión Educativa
│   ├── 📄 DATOS_PROYECTO.json
│   ├── 📁 Fase 1 (Problemas)/
│   │   └── 📄 FASE_1_PROBLEMAS_DETECTADOS.md
│   ├── 📁 Fase 2 (Valor Agregado)/
│   │   └── 📄 FASE_2_VALOR_AGREGADO.md
│   ├── 📄 CONSOLIDACION_1_2.md
│   ├── 📁 Fase 3 (RF -- CU)/
│   │   └── 📄 FASE_3_REQUISITOS_CASOS_USO.md
│   ├── 📁 Fase 4 (Plan de Negocio)/
│   │   └── 📄 FASE_4_PLAN_NEGOCIO.md
│   ├── 📁 Fase 5 (BD)/
│   │   └── 📄 FASE_5_BASE_DATOS.md
│   └── 📁 Fase 6 (UX - IX)/
│       └── 📄 FASE_6_DISEÑO_UX_UI.md
│
│
├── 📁 FARMACIA/                        ← PROYECTO 2: Sistema de Gestión Farmacéutica
│   ├── 📄 DATOS_PROYECTO.json
│   ├── 📁 Fase 1 (Problemas)/
│   │   └── 📄 FASE_1_PROBLEMAS_DETECTADOS.md
│   ├── 📁 Fase 2 (Valor Agregado)/
│   │   └── 📄 FASE_2_VALOR_AGREGADO.md
│   ├── 📄 CONSOLIDACION_1_2.md
│   ├── 📁 Fase 3 (RF -- CU)/
│   ├── 📁 Fase 4 (Plan de Negocio)/
│   ├── 📁 Fase 5 (BD)/
│   └── 📁 Fase 6 (UX - IX)/
│
│
├── 📁 HOTEL/                           ← PROYECTO 3: Sistema de Reservas Hotelero
│   ├── 📄 DATOS_PROYECTO.json
│   ├── 📁 Fase 1 (Problemas)/
│   ├── 📁 Fase 2 (Valor Agregado)/
│   ├── 📄 CONSOLIDACION_1_2.md
│   ├── 📁 Fase 3 (RF -- CU)/
│   ├── 📁 Fase 4 (Plan de Negocio)/
│   ├── 📁 Fase 5 (BD)/
│   └── 📁 Fase 6 (UX - IX)/
│
│
└── ... (más proyectos según sea necesario)
```

---

## 🚀 CÓMO INICIAR UN NUEVO PROYECTO

### PASO 1: Dile a Claude el nombre del proyecto

```
Crear rama de proyecto para: EDUCACION
(Sistema de Gestión Educativa)
```

### PASO 2: Claude ejecuta automáticamente

Claude crea la estructura:
```
mkdir C:\botas\Documentación__\EDUCACION\
mkdir C:\botas\Documentación__\EDUCACION\Fase 1 (Problemas)
mkdir C:\botas\Documentación__\EDUCACION\Fase 2 (Valor Agregado)
mkdir C:\botas\Documentación__\EDUCACION\Fase 3 (RF -- CU)
mkdir C:\botas\Documentación__\EDUCACION\Fase 4 (Plan de Negocio)
mkdir C:\botas\Documentación__\EDUCACION\Fase 5 (BD)
mkdir C:\botas\Documentación__\EDUCACION\Fase 6 (UX - IX)
```

### PASO 3: Inicializar proyecto

Claude crea `DATOS_PROYECTO.json` en esa carpeta.

### PASO 4: Ejecutar orquestación

```
Ejecuta el sistema de orquestación para: EDUCACION
```

Claude pregunta el cuestionario y ejecuta las 6 fases dentro de la carpeta `EDUCACION/`.

---

## 📋 ACTUALIZACIÓN AL MAPA DE UBICACIÓN

Con la arquitectura multi-proyecto, las rutas cambian:

| Proyecto | Fase | Archivo | Ruta NUEVA |
|----------|------|---------|-----------|
| EDUCACIÓN | 1 | `FASE_1_PROBLEMAS_DETECTADOS.md` | `EDUCACION/Fase 1 (Problemas)/` |
| EDUCACIÓN | 2 | `FASE_2_VALOR_AGREGADO.md` | `EDUCACION/Fase 2 (Valor Agregado)/` |
| EDUCACIÓN | 3 | `FASE_3_REQUISITOS_CASOS_USO.md` | `EDUCACION/Fase 3 (RF -- CU)/` |
| FARMACIA | 1 | `FASE_1_PROBLEMAS_DETECTADOS.md` | `FARMACIA/Fase 1 (Problemas)/` |
| FARMACIA | 2 | `FASE_2_VALOR_AGREGADO.md` | `FARMACIA/Fase 2 (Valor Agregado)/` |

---

## 🎯 EJEMPLO: PROYECTO EDUCACIÓN

```
EDUCACION/
├── DATOS_PROYECTO.json
│
├── Fase 1 (Problemas)/
│   └── FASE_1_PROBLEMAS_DETECTADOS.md
│       → Análisis de problemáticas en educación
│       → Por qué se necesita el sistema
│       → Stakeholders afectados
│
├── Fase 2 (Valor Agregado)/
│   └── FASE_2_VALOR_AGREGADO.md
│       → Propuesta de valor única
│       → Canvas de propuesta
│       → Beneficios para estudiantes, profesores, admin
│
├── CONSOLIDACION_1_2.md
│   → Fusión de problemas + valor
│   → Base para Fase 3
│
├── Fase 3 (RF -- CU)/
│   └── FASE_3_REQUISITOS_CASOS_USO.md
│       → Requisitos funcionales (RF-001 a RF-020)
│       → Casos de uso: Login, Registrar estudiante, etc.
│       → Diagrama de casos de uso
│
├── Fase 4 (Plan de Negocio)/
│   └── FASE_4_PLAN_NEGOCIO.md
│       → Business Model Canvas
│       → Modelo de ingresos
│       → Proyecciones financieras
│
├── Fase 5 (BD)/
│   └── FASE_5_BASE_DATOS.md
│       → Entidades: Estudiantes, Cursos, Calificaciones
│       → Relaciones entre tablas
│       → Scripts SQL
│
└── Fase 6 (UX - IX)/
    └── FASE_6_DISEÑO_UX_UI.md
        → Wireframes de dashboard
        → Flujos de usuario
        → Guía de estilos
```

---

## 📊 VENTAJAS DE ESTA ESTRUCTURA

| Ventaja | Descripción |
|---------|-------------|
| **Aislamiento** | Cada proyecto es independiente, sin contaminar otros |
| **Escalabilidad** | Puedes tener 2, 5, 10, 50 proyectos sin problemas |
| **Navegación** | Fácil encontrar documentación de cada proyecto |
| **Versionado** | Cada proyecto tiene su propio historial de commits |
| **Paralelo** | Puedes ejecutar orquestaciones de múltiples proyectos |
| **Mantenimiento** | Actualizar un proyecto no afecta otros |
| **Colaboración** | Múltiples personas pueden trabajar en diferentes proyectos |

---

## 🔄 FLUJO DE TRABAJO CON MÚLTIPLES PROYECTOS

```
┌─────────────────────────────────────────────────────┐
│ Usuario quiere documentar sistema EDUCATIVO        │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Pide: "Crear rama para EDUCACION"                  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Claude crea carpeta EDUCACION/ + subcarpetas       │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Pide: "Ejecuta orquestación para EDUCACION"        │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Claude ejecuta Fases 1-6 dentro de EDUCACION/      │
│ - Todos documentos van a EDUCACION/Fase X/         │
│ - DATOS_PROYECTO.json en EDUCACION/                │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Commit: feat(educacion): generación de fases 1-6   │
│ Push a GitHub                                       │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ ✅ EDUCACION/ lista con documentación completa     │
└─────────────────────────────────────────────────────┘
                      ↓
        Usuario puede crear siguiente proyecto
        (ej: FARMACIA/) sin afectar EDUCACION/
```

---

## 🎨 SINTAXIS PARA CREAR PROYECTOS

### Opción 1: Nombre simple
```
Crear rama para: EDUCACION
```
**Resultado**: Carpeta `EDUCACION/`

### Opción 2: Nombre descriptivo
```
Crear rama para: EDUCACION
Descripción: Sistema de Gestión Educativa Integral
```
**Resultado**: Carpeta `EDUCACION/` con metadata

### Opción 3: Múltiples proyectos
```
Listar proyectos creados
```
**Resultado**: Lista de todas las carpetas de proyecto

---

## 📌 NUEVAS INSTRUCCIONES PARA CLAUDE

Cuando el usuario pida crear una rama de proyecto:

1. **Crear carpeta** con nombre del proyecto (en mayúsculas)
2. **Crear subcarpetas** para las 7 fases
3. **Inicializar** `DATOS_PROYECTO.json` en esa carpeta
4. **Guardar ALL documentos** dentro de esa carpeta
5. **Actualizar** `README_PROYECTOS.md` con el nuevo proyecto

---

## 🗂️ ARCHIVO `README_PROYECTOS.md`

Claude mantendrá un índice de todos los proyectos:

```markdown
# 📚 Proyectos Documentados

## Proyectos Activos

| Nombre | Descripción | Estado | Creado | Última Actualización |
|--------|-------------|--------|--------|---------------------|
| EDUCACION | Sistema de Gestión Educativa | ✅ Fase 6 completa | 2026-05-14 | 2026-05-14 |
| FARMACIA | Sistema de Gestión Farmacéutica | 🟡 Fase 3 en progreso | 2026-05-14 | 2026-05-14 |
| HOTEL | Sistema de Reservas Hotelero | ⬜ Pendiente | — | — |

## Acceso Rápido

- [EDUCACION/](./EDUCACION/) → Documentación educativa
- [FARMACIA/](./FARMACIA/) → Documentación farmacéutica
- [HOTEL/](./HOTEL/) → Documentación hotelera
```

---

## 🚨 REGLAS IMPORTANTES

1. **Nombres en mayúsculas** para proyectos (`EDUCACION`, `FARMACIA`, no `educacion` o `Educación`)
2. **Nombres sin espacios ni caracteres especiales** (usar guiones si necesario: `FARMACIA-CENTRAL`)
3. **Un `DATOS_PROYECTO.json` por proyecto** (en la raíz de cada carpeta)
4. **Documentos SIEMPRE en formato `.md`** (sin excepciones)
5. **Auto-commit y push** después de cada fase
6. **Carpetas de fases NUNCA cambian** (siempre las mismas 7)

---

## 🔄 EJEMPLOS DE PROYECTOS

### Ejemplo 1: Sistema Educativo

```
EDUCACION/
├── DATOS_PROYECTO.json
├── Fase 1 (Problemas)/
│   └── FASE_1_PROBLEMAS_DETECTADOS.md
│       (Analiza problemas en gestión educativa actual)
├── Fase 2 (Valor Agregado)/
│   └── FASE_2_VALOR_AGREGADO.md
│       (Define cómo el sistema agrega valor a estudiantes/profesores)
├── Fase 3 (RF -- CU)/
│   └── FASE_3_REQUISITOS_CASOS_USO.md
│       (Especifica funcionalidades: calificaciones, asistencia, etc.)
├── Fase 4 (Plan de Negocio)/
│   └── FASE_4_PLAN_NEGOCIO.md
│       (Modelo de ingresos, licensing, etc.)
├── Fase 5 (BD)/
│   └── FASE_5_BASE_DATOS.md
│       (Tablas: Estudiantes, Cursos, Calificaciones, Profesores)
└── Fase 6 (UX - IX)/
    └── FASE_6_DISEÑO_UX_UI.md
        (Dashboard, reportes, interfaces de usuario)
```

### Ejemplo 2: Sistema de Farmacia

```
FARMACIA/
├── DATOS_PROYECTO.json
├── Fase 1 (Problemas)/
│   └── FASE_1_PROBLEMAS_DETECTADOS.md
│       (Problemas: gestión manual, vencimientos, pérdidas)
├── Fase 2 (Valor Agregado)/
│   └── FASE_2_VALOR_AGREGADO.md
│       (IA para predicción de demanda, alertas de vencimiento)
├── Fase 3 (RF -- CU)/
│   └── FASE_3_REQUISITOS_CASOS_USO.md
│       (Casos de uso: Vender medicamento, Registrar entrada, Reportar vencimiento)
├── Fase 4 (Plan de Negocio)/
│   └── FASE_4_PLAN_NEGOCIO.md
│       (ROI: Reducir pérdidas 15%, aumentar eficiencia 30%)
├── Fase 5 (BD)/
│   └── FASE_5_BASE_DATOS.md
│       (Tablas: Medicamentos, Proveedores, Ventas, Stock)
└── Fase 6 (UX - IX)/
    └── FASE_6_DISEÑO_UX_UI.md
        (POS, Gestión de inventario, Reportes)
```

---

## ✅ CHECKLIST PARA NUEVO PROYECTO

Cuando crees un nuevo proyecto, verifica:

- [ ] Carpeta creada con nombre en mayúsculas
- [ ] 7 subcarpetas de fases creadas
- [ ] `DATOS_PROYECTO.json` inicializado
- [ ] `README_PROYECTOS.md` actualizado
- [ ] Primer commit hecho
- [ ] Push a GitHub completado

---

## 🎓 PRÓXIMOS PASOS

1. **Crea tu primer proyecto**: `"Crear rama para: EDUCACION"`
2. **Ejecuta orquestación**: `"Ejecuta orquestación para: EDUCACION"`
3. **Responde cuestionario** sobre tu institución educativa
4. **Espera a que genere** documentación en `EDUCACION/`
5. **Revisa documentos** en cada carpeta de fase

---

*ARQUITECTURA_MULTIPROYECTO.md — Sistema escalable v2.0*
