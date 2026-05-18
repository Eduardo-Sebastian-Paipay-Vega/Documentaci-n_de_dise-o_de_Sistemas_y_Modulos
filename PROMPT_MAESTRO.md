# 🎯 PROMPT MAESTRO — Orquestador Automatizado de Fases 1-6

> **Versión**: 1.0  
> **Tipo**: Sistema de orquestación centralizado  
> **Propósito**: Ejecutar automáticamente las 6 fases sin intervención del usuario  
> **Fecha**: 2026-05-14

---

## 🔑 Instrucción Principal

Este es el **PROMPT MAESTRO**. Tu función es:

1. **Crear rama de proyecto** (carpeta aislada para cada proyecto)
2. **Recibir los datos iniciales del proyecto** (cuestionario)
3. **Almacenar esos datos** en `DATOS_PROYECTO.json` dentro de la rama
4. **Ejecutar automáticamente las 6 fases** en orden correcto
5. **Pasar información entre fases** de forma automática
6. **Ejecutar en paralelo** Fase 1 y Fase 2
7. **Consolidar resultados** antes de Fase 3
8. **Guardar TODOS documentos** dentro de la rama del proyecto
9. **Al terminar**: hacer auto-push a GitHub

**NO PREGUNTES POR CADA FASE.** Solo pide datos al inicio y ejecuta todo automáticamente.

**ARQUITECTURA MULTI-PROYECTO**: Cada proyecto tiene su propia carpeta aislada con sus propias 7 fases.

---

## 🏗️ CREACIÓN DE RAMA DE PROYECTO

Cuando el usuario pida crear un proyecto, sigue estos pasos:

### PASO 0: Usuario solicita
```
Crear rama para: EDUCACION
```
o
```
Crear rama de proyecto para institución educativa
```

### PASO 1: Claude crea estructura
```bash
mkdir EDUCACION
mkdir EDUCACION/Fase 1 (Problemas)
mkdir EDUCACION/Fase 2 (Valor Agregado)
mkdir EDUCACION/Fase 3 (RF -- CU)
mkdir EDUCACION/Fase 4 (Plan de Negocio)
mkdir EDUCACION/Fase 5 (BD)
mkdir EDUCACION/Fase 6 (UX - IX)
```

### PASO 2: Claude inicializa proyecto
Crea `EDUCACION/DATOS_PROYECTO.json` con estructura inicial

### PASO 3: Confirma creación
```
✅ Rama de proyecto EDUCACION/ creada
   Carpetas: 7 subcarpetas de fases
   DATOS_PROYECTO.json: Inicializado
   
   ¿Ejecuto la orquestación para EDUCACION?
```

### PASO 4: Usuario pide orquestación
```
Ejecuta orquestación para EDUCACION
```

Claude procede con el cuestionario (ver sección siguiente)

---

## 📋 Cuestionario Inicial de Recopilación

Cuando el usuario te pide ejecutar el sistema, haz SOLO estas preguntas (en una sola interacción):

### Sección 1: Información Básica
- **Nombre del proyecto/sistema**: (ej: "Sistema de Gestión de Inventario para Farmacia")
- **Tipo de aplicación**: (ej: Web, Mobile, Desktop, API, Híbrido)
- **Industria/Sector**: (ej: Retail, Salud, Educación, Finanzas)
- **Usuario principal**: (ej: Farmacéutico, Cliente final, Administrador)

### Sección 2: Contexto del Problema
- **¿Cuál es el problema principal que resuelve?**: (descripción breve, 2-3 líneas)
- **¿A cuántas personas/empresas afecta?**: (escala)
- **¿Cuál es el contexto actual?** (¿cómo lo hacen hoy?)

### Sección 3: Visión de Solución
- **¿Qué hace diferente tu solución?** (ej: más rápida, más barata, más inteligente)
- **¿Cuál es el objetivo principal?** (ej: aumentar ventas, reducir tiempo, automatizar)
- **Restricciones o requisitos obligatorios**: (ej: presupuesto limitado, plataforma específica)

---

## 🔄 Flujo de Ejecución Automatizado

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INICIO: RECIBIR DATOS INICIALES                  │
│                     (Cuestionario único al inicio)                  │
│                                                                     │
│  → Usuario responde preguntas                                       │
│  → Claude almacena en DATOS_PROYECTO.json                           │
│  → Claude confirma: "Iniciando ejecución automática..."             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
                    ╔═══════════════════════════╗
                    ║   FASE 1 ────┐            ║
                    ║              │ PARALELO  ║
                    ║   FASE 2 ────┘            ║
                    ╚═══════════════════════════╝
                                  ↓
                   ┌─────────────────────────────┐
                   │ CONSOLIDACIÓN (1 + 2)       │
                   │ Fusionar resultados         │
                   └─────────────────────────────┘
                                  ↓
                    ╔═══════════════════════════╗
                    ║       FASE 3              ║
                    ║  (RF + Casos de Uso)      ║
                    ╚═══════════════════════════╝
                                  ↓
                    ╔═══════════════════════════╗
                    ║       FASE 4              ║
                    ║   (Plan de Negocio)       ║
                    ╚═══════════════════════════╝
                                  ↓
                    ╔═══════════════════════════╗
                    ║       FASE 5              ║
                    ║    (Base de Datos)        ║
                    ╚═══════════════════════════╝
                                  ↓
                    ╔═══════════════════════════╗
                    ║       FASE 6              ║
                    ║      (UX/UI Design)       ║
                    ╚═══════════════════════════╝
                                  ↓
                   ┌─────────────────────────────┐
                   │ AUTO-PUSH A GITHUB          │
                   │ git add -A && git commit    │
                   │ && git push origin main     │
                   └─────────────────────────────┘
```

---

## 🎬 Ejecución Detallada

### PASO 1: Recepción de Datos Iniciales

```json
{
  "proyecto": {
    "nombre": "",
    "tipo_aplicacion": "",
    "industria": "",
    "usuario_principal": "",
    "problema_principal": "",
    "escala": "",
    "contexto_actual": "",
    "diferenciacion": "",
    "objetivo_principal": "",
    "restricciones": ""
  },
  "timestamp_inicio": "2026-05-14T00:00:00Z",
  "estado": "inicializado"
}
```

### PASO 2: Ejecutar FASE 1 (Análisis de Problemas)

**Trigger**: `PROMPT_FASE_1.md`

**Entrada**: Datos del cuestionario inicial

**Salida**: 
- `FASE_1_PROBLEMAS_DETECTADOS.md`
- Estructura JSON con problemas

**Duración estimada**: 5 minutos

---

### PASO 3: Ejecutar FASE 2 (Valor Agregado) — EN PARALELO

**Trigger**: `PROMPT_FASE_2.md`

**Entrada**: Datos del cuestionario inicial (mismos datos que Fase 1)

**Salida**:
- `FASE_2_VALOR_AGREGADO.md`
- Estructura JSON con propuesta de valor

**Duración estimada**: 5 minutos

---

### PASO 4: Consolidación (Fase 1 + Fase 2)

**Acción**: Fusionar resultados de ambas fases

**Salida**: 
- `CONSOLIDACION_1_2.md` (documento integrador)

**Proceso**:
```
[Problemas Detectados] + [Valor Agregado]
        ↓                        ↓
        └────────┬───────────────┘
                 ↓
      Documento Consolidado
      (Conceptualización completa)
```

---

### PASO 5: Ejecutar FASE 3 (RF + Casos de Uso)

**Trigger**: `PROMPT_FASE_3.md`

**Entrada**: 
- Problemas (Fase 1)
- Valor Agregado (Fase 2)
- Documento Consolidado

**Salida**:
- `FASE_3_REQUISITOS_CASOS_USO.md`
- Diagramas UML
- Matriz de Trazabilidad

**Duración estimada**: 8 minutos

---

### PASO 6: Ejecutar FASE 4 (Plan de Negocio)

**Trigger**: `PROMPT_FASE_4.md`

**Entrada**:
- Requisitos y Casos de Uso (Fase 3)
- Todo lo anterior

**Salida**:
- `FASE_4_PLAN_NEGOCIO.md`
- Canvas de negocio
- Análisis económico

**Duración estimada**: 8 minutos

---

### PASO 7: Ejecutar FASE 5 (Base de Datos)

**Trigger**: `PROMPT_FASE_5.md`

**Entrada**:
- Requisitos (Fase 3)
- Reglas de negocio (Fase 4)

**Salida**:
- `FASE_5_BASE_DATOS.md`
- Modelo E-R (Mermaid)
- Scripts SQL

**Duración estimada**: 8 minutos

---

### PASO 8: Ejecutar FASE 6 (UX/UI)

**Trigger**: `PROMPT_FASE_6.md`

**Entrada**:
- Funcionalidades (Fase 3)
- Casos de Uso (Fase 3)
- Base de Datos (Fase 5)

**Salida**:
- `FASE_6_DISEÑO_UX_UI.md`
- Wireframes (descripciones)
- Flujos de usuario

**Duración estimada**: 8 minutos

---

### PASO 9: Auto-Push a GitHub

Después de completar Fase 6:

```bash
cd /sessions/admiring-loving-pasteur/mnt/Documentación__/

# Preparar índice
cp .git/index /tmp/gi

# Stagear todo
GIT_INDEX_FILE=/tmp/gi git add -A

# Commit
GIT_INDEX_FILE=/tmp/gi git commit -m "feat(sistema-completo): generación automática fases 1-6"

# Push
git push origin main
```

---

## 📊 Formato de Almacenamiento Intermedio

Cada fase actualiza `DATOS_PROYECTO.json`:

```json
{
  "proyecto": { ... },
  "fase_1": {
    "estado": "completada",
    "fecha": "2026-05-14T10:30:00Z",
    "problemas": [ ... ],
    "archivo_generado": "FASE_1_PROBLEMAS_DETECTADOS.md"
  },
  "fase_2": {
    "estado": "completada",
    "fecha": "2026-05-14T10:35:00Z",
    "valor_agregado": [ ... ],
    "archivo_generado": "FASE_2_VALOR_AGREGADO.md"
  },
  "consolidacion": {
    "estado": "completada",
    "archivo_generado": "CONSOLIDACION_1_2.md"
  },
  "fase_3": {
    "estado": "completada",
    "requisitos": [ ... ],
    "casos_uso": [ ... ],
    "archivo_generado": "FASE_3_REQUISITOS_CASOS_USO.md"
  },
  "fase_4": { ... },
  "fase_5": { ... },
  "fase_6": { ... },
  "estado_general": "completada",
  "timestamp_final": "2026-05-14T11:30:00Z"
}
```

---

## ✅ Reglas de Ejecución

1. **No interrumpir el flujo** — Una vez iniciado, ejecutar todas las fases sin parar
2. **Pasar datos automáticamente** — No repetir preguntas ya respondidas
3. **Paralelo cuando es posible** — Fases 1 y 2 simultáneamente
4. **Validar dependencias** — Fase 3 nunca inicia antes de Fase 1+2
5. **Documentar cada paso** — Cada fase genera archivo `.md` claro
6. **Auto-push sin pedir confirmación** — Después de Fase 6
7. **Usar templates** — Basarse en PROMPTS_ESPECIALIZADOS.md
8. **Mantener coherencia** — Información consistente entre fases

---

## 🚀 Inicio Rápido

**Comando del usuario:**
```
@claude ejecuta el sistema de orquestación de fases
```

**Respuesta de Claude:**
```
Entendido. Voy a ejecutar el sistema automatizado.

Primero, necesito información inicial sobre el proyecto:

[MUESTRA CUESTIONARIO]
```

**Usuario responde** → Claude inicia automáticamente

---

## 📝 Notas Importantes

- Este prompt maestro es el **director central** de orquestación
- Los **prompts especializados** (PROMPTS_ESPECIALIZADOS.md) contienen las instrucciones específicas para cada fase
- El flujo es **determinístico y reproducible**
- Cada ejecución queda registrada en `DATOS_PROYECTO.json`
- Los documentos generados van a la carpeta de cada fase (Fase 1, Fase 2, etc.)

---

*PROMPT_MAESTRO.md — Sistema de orquestación automatizado v1.0*
