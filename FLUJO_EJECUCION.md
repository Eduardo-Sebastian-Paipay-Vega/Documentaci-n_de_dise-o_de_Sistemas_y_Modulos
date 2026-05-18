# 🔄 FLUJO DE EJECUCIÓN — Orquestación Paso a Paso

> **Versión**: 1.0  
> **Tipo**: Guía de ejecución  
> **Propósito**: Explicar exactamente cómo se ejecutan las fases  
> **Fecha**: 2026-05-14

---

## 📍 Punto de Inicio

El usuario solicita:
```
"Ejecuta el sistema de orquestación de fases 1-6"
```

---

## 🎯 PASO 0: Claude Responde y Presenta Cuestionario

**Acción de Claude:**
```
✅ Entiendo. Voy a ejecutar el sistema automatizado de 6 fases.

Necesito información inicial (solo responde estas preguntas una vez, 
luego todo se ejecuta automáticamente):

[MUESTRA CUESTIONARIO COMPLETO - Ver PROMPT_MAESTRO.md]
```

**Usuario responde** todas las preguntas en una sola interacción.

---

## 📝 PASO 1: Guardar Datos Iniciales

Claude crea/actualiza `DATOS_PROYECTO.json`:

```json
{
  "metadata": {
    "timestamp_inicio": "2026-05-14T10:00:00Z",
    "version": "1.0",
    "estado_general": "en_ejecucion"
  },
  "proyecto": {
    "nombre": "[respuesta usuario]",
    "tipo_aplicacion": "[respuesta usuario]",
    "industria": "[respuesta usuario]",
    "usuario_principal": "[respuesta usuario]",
    "problema_principal": "[respuesta usuario]",
    "escala": "[respuesta usuario]",
    "contexto_actual": "[respuesta usuario]",
    "diferenciacion": "[respuesta usuario]",
    "objetivo_principal": "[respuesta usuario]",
    "restricciones": "[respuesta usuario]"
  },
  "fases": {}
}
```

**Confirma:** "Datos guardados. Iniciando ejecución automática de fases..."

---

## ⚙️ PASO 2: Ejecutar FASE 1 y FASE 2 en PARALELO

### Elemento Visual de Paralelo:

```
Claude inicia ambas fases simultáneamente (en la misma respuesta):

┌─────────────────────────┬─────────────────────────┐
│   FASE 1                │   FASE 2                │
│ Analizando problemas... │ Analizando valor...     │
│ ▓▓▓░░░░░░ 30%           │ ▓▓▓░░░░░░ 30%           │
└─────────────────────────┴─────────────────────────┘
```

### Mecanismo Técnico:

Claude utiliza el **prompt de Fase 1** (`PROMPTS_ESPECIALIZADOS.md` - sección FASE 1️⃣):

**Input:** Datos del proyecto (nombre, problema, industria, etc.)

**Proceso:** 
- Analizar problema principal
- Crear árbol de problemas
- Identificar stakeholders
- Documentar impacto
- Escribir análisis de contexto

**Output:** Documento `FASE_1_PROBLEMAS_DETECTADOS.md`

---

**Simultáneamente**, Claude utiliza el **prompt de Fase 2** (`PROMPTS_ESPECIALIZADOS.md` - sección FASE 2️⃣):

**Input:** Datos del proyecto (diferenciación, objetivo, industria)

**Proceso:**
- Definir UVP
- Crear canvas de valor
- Listar beneficios
- Comparar con competencia
- Desarrollar mapa de empatía

**Output:** Documento `FASE_2_VALOR_AGREGADO.md`

---

### Actualización de JSON:

```json
{
  "fase_1": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:05:00Z",
    "archivo": "Fase 1 (Problemas)/FASE_1_PROBLEMAS_DETECTADOS.md",
    "items_generados": 7,
    "longitud_aprox": "650 palabras"
  },
  "fase_2": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:05:00Z",
    "archivo": "Fase 2 (Valor Agregado)/FASE_2_VALOR_AGREGADO.md",
    "items_generados": 8,
    "longitud_aprox": "750 palabras"
  }
}
```

**Claude comunica:** 
```
✅ FASE 1 completada: FASE_1_PROBLEMAS_DETECTADOS.md
✅ FASE 2 completada: FASE_2_VALOR_AGREGADO.md

Consolidando resultados...
```

---

## 🔀 PASO 3: Consolidación de Fases 1 + 2

### Acción:

Claude crea documento `CONSOLIDACION_1_2.md` que:

1. **Resume** hallazgos de ambas fases
2. **Integra** problemas + valor agregado en una narrativa coherente
3. **Extrae** puntos clave que alimentarán Fase 3
4. **Crea** matriz de: Problema ↔ Solución ↔ Valor

**Ejemplo de estructura:**

```markdown
# Consolidación: Análisis Integrado

## Problema Principal
[Del resumen de Fase 1]

## Solución Propuesta
[De la propuesta de Fase 2]

## Cadena de Valor
[Cómo la solución resuelve el problema]

## Matriz Problema-Valor
| Problema | Impacto | Solución | Valor Agregado |
|----------|---------|----------|-----------------|
| ... | ... | ... | ... |

## Inputs para Fase 3
[Requisitos y casos de uso a derivar]
```

**JSON actualizado:**
```json
{
  "consolidacion": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:07:00Z",
    "archivo": "CONSOLIDACION_1_2.md"
  }
}
```

---

## 📋 PASO 4: Ejecutar FASE 3

**Trigger:** Consolidación completada

**Input:** 
- Problemas detectados
- Valor agregado
- Documento consolidado
- Datos del proyecto

**Acción:** Claude ejecuta `PROMPT_FASE_3` (de PROMPTS_ESPECIALIZADOS.md):

```
Claude genera:

✅ REQUISITOS FUNCIONALES
   RF-001: El sistema debe registrar nuevos usuarios
   RF-002: El sistema debe autenticar usuarios
   RF-003: El sistema debe gestionar inventario
   ... (15-20 requisitos)

✅ REQUISITOS NO FUNCIONALES
   RNF-001: Performance <2s
   RNF-002: Disponibilidad 99.9%
   ... (5-8 requisitos)

✅ DIAGRAMA DE CASOS DE USO (Mermaid)
   graph TB
      Usuario -->|Login| Autenticación
      Usuario -->|Manage| Inventario
      Admin -->|Reports| Reportes
      ...

✅ ESPECIFICACIÓN DE CASOS DE USO
   CU-001: Login de Usuario
   - Actor: Usuario
   - Precondiciones: Tener cuenta
   - Flujo normal: ...
   - Excepciones: ...
```

**Output:** `FASE_3_REQUISITOS_CASOS_USO.md`

**JSON actualizado:**
```json
{
  "fase_3": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:15:00Z",
    "archivo": "Fase 3 (RF -- CU)/FASE_3_REQUISITOS_CASOS_USO.md",
    "requisitos_funcionales": 17,
    "casos_uso": 8,
    "diagramas": 2
  }
}
```

---

## 💼 PASO 5: Ejecutar FASE 4

**Trigger:** Fase 3 completada

**Input:**
- Requisitos (Fase 3)
- Casos de uso (Fase 3)
- Valor agregado (Fase 2)
- Datos del proyecto

**Acción:** Claude ejecuta `PROMPT_FASE_4`:

```
Claude genera:

✅ RESUMEN EJECUTIVO
✅ BUSINESS MODEL CANVAS (9 secciones)
✅ ANÁLISIS DE MERCADO
✅ MODELO DE INGRESOS (SaaS, pricing)
✅ ANÁLISIS DE COSTOS
   - Desarrollo: 6 meses
   - Costo total: $XX,000
✅ ROI Y PROYECCIONES
   - Año 1: Break-even
   - Año 3: 150% ROI
✅ MVP SCOPE
✅ CRONOGRAMA GANTT
✅ ANÁLISIS DE RIESGOS
✅ SOSTENIBILIDAD
```

**Output:** `FASE_4_PLAN_NEGOCIO.md`

**JSON actualizado:**
```json
{
  "fase_4": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:25:00Z",
    "archivo": "Fase 4 (Plan de Negocio)/FASE_4_PLAN_NEGOCIO.md",
    "secciones": 10,
    "tablas": 8
  }
}
```

---

## 🗄️ PASO 6: Ejecutar FASE 5

**Trigger:** Fase 4 completada

**Input:**
- Requisitos (Fase 3)
- Reglas de negocio (Fase 4)
- Actores y casos de uso (Fase 3)

**Acción:** Claude ejecuta `PROMPT_FASE_5`:

```
Claude genera:

✅ DICCIONARIO DE DATOS
   | Tabla | Campo | Tipo | Constraint | Descripción |
   |-------|-------|------|-----------|-------------|
   | usuarios | id | INT | PK | ID único |
   | usuarios | email | VARCHAR | UNIQUE | Email usuario |
   ...

✅ MODELO ENTIDAD-RELACIÓN (Mermaid)
   erDiagram
      USUARIOS ||--o{ PEDIDOS : realiza
      PEDIDOS ||--|{ ITEMS : contiene
      ...

✅ MODELO RELACIONAL NORMALIZADO
   1FN, 2FN, 3FN verificados

✅ SCRIPTS DDL COMPLETOS
   CREATE TABLE usuarios (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      ...
   );
   ...

✅ ÍNDICES Y OPTIMIZACIONES
✅ POLÍTICAS DE INTEGRIDAD
✅ PROCEDIMIENTOS ALMACENADOS
✅ ESTRATEGIA DE BACKUP
✅ SEGURIDAD DE DATOS
✅ VERSIONADO DEL ESQUEMA
```

**Output:** `FASE_5_BASE_DATOS.md` (con scripts SQL)

**JSON actualizado:**
```json
{
  "fase_5": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:35:00Z",
    "archivo": "Fase 5 (BD)/FASE_5_BASE_DATOS.md",
    "tablas": 8,
    "campos": 35,
    "relaciones": 12,
    "indices": 15
  }
}
```

---

## 🎨 PASO 7: Ejecutar FASE 6

**Trigger:** Fase 5 completada

**Input:**
- Funcionalidades (Fase 3)
- Casos de uso (Fase 3)
- Base de datos (Fase 5)
- Requisitos no funcionales (Fase 3)

**Acción:** Claude ejecuta `PROMPT_FASE_6`:

```
Claude genera:

✅ PRINCIPIOS DE DISEÑO UX
   - Simplicidad
   - Consistencia
   - Feedback inmediato
   - ...

✅ ARQUITECTURA DE INFORMACIÓN
   Mapa de sitio (árbol de navegación)

✅ FLUJOS DE USUARIO (3-5 principales)
   - Onboarding: usuario nuevo
   - Compra: caso principal
   - Administración: panel de admin

✅ WIREFRAMES DETALLADOS (8-10 pantallas)
   - Dashboard
   - Login
   - Listado de productos
   - Carrito de compra
   - Checkout
   - Perfil usuario
   - Administración
   - Reportes

✅ GUÍA DE ESTILOS
   - Colores: #FF6B6B, #4ECDC4, ...
   - Tipografía: Inter, Roboto
   - Espaciado: 8px, 16px, 24px
   - Componentes: Button, Card, Modal

✅ COMPONENTES REUTILIZABLES
✅ PATRONES DE INTERACCIÓN
✅ ACCESIBILIDAD (WCAG 2.1)
✅ RESPONSIVE DESIGN (5 breakpoints)
✅ TESTING DE USABILIDAD PLANIFICADO
```

**Output:** `FASE_6_DISEÑO_UX_UI.md`

**JSON actualizado:**
```json
{
  "fase_6": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:50:00Z",
    "archivo": "Fase 6 (UX - IX)/FASE_6_DISEÑO_UX_UI.md",
    "pantallas": 10,
    "componentes": 25,
    "flujos_usuario": 5,
    "breakpoints": 5
  }
}
```

---

## 🚀 PASO 8: Auto-Push a GitHub

**Trigger:** Fase 6 completada

**Acción:** Claude ejecuta en bash:

```bash
cd /sessions/admiring-loving-pasteur/mnt/Documentación__/

# Crear índice temporal para evitar lock de Windows
cp .git/index /tmp/gi

# Stagear todos los cambios
GIT_INDEX_FILE=/tmp/gi git add -A

# Commit descriptivo
GIT_INDEX_FILE=/tmp/gi git commit -m "feat(sistema-completo): generación automatizada de todas las fases 1-6"

# Push a GitHub
git push origin main
```

**Resultado:**
```
✅ Git commit creado
✅ Push a GitHub completado
✅ Repositorio sincronizado
```

**JSON actualizado:**
```json
{
  "github_sync": {
    "estado": "completada",
    "timestamp": "2026-05-14T10:52:00Z",
    "commit": "feat(sistema-completo): generación automatizada de todas las fases 1-6",
    "archivos": 11,
    "url_commit": "https://github.com/.../commit/HASH"
  },
  "estado_general": "completada",
  "timestamp_final": "2026-05-14T10:52:00Z",
  "duracion_total_minutos": 52
}
```

---

## ✅ PASO 9: Resumen Final

Claude muestra:

```
═══════════════════════════════════════════════════════════════
🎉 ORQUESTACIÓN COMPLETADA EXITOSAMENTE

📊 Resumen de Ejecución:

✅ FASE 1 (Análisis de Problemas)
   → FASE_1_PROBLEMAS_DETECTADOS.md

✅ FASE 2 (Valor Agregado)
   → FASE_2_VALOR_AGREGADO.md

✅ CONSOLIDACIÓN
   → CONSOLIDACION_1_2.md

✅ FASE 3 (Requisitos y Casos de Uso)
   → FASE_3_REQUISITOS_CASOS_USO.md

✅ FASE 4 (Plan de Negocio)
   → FASE_4_PLAN_NEGOCIO.md

✅ FASE 5 (Base de Datos)
   → FASE_5_BASE_DATOS.md

✅ FASE 6 (Diseño UX/UI)
   → FASE_6_DISEÑO_UX_UI.md

📁 Todos los documentos guardados en sus carpetas correspondientes
🔄 GitHub sincronizado
⏱️ Tiempo total: 52 minutos

═══════════════════════════════════════════════════════════════

El sistema está listo para:
→ Revisión y refinamiento manual
→ Próximas fases (implementación, testing, deployment)
→ Documentación adicional específica
```

---

## 🔧 Recuperación ante Errores

Si algo falla en el proceso:

1. **Fase 1 o 2 fallan**: Reintentar esa fase específica
2. **Consolidación falla**: Revisar manualmente problemas y valor, luego continuar
3. **Fase 3+ falla**: Usar la consolidación anterior y reintentar
4. **Push a GitHub falla**: Mostrar comando manual al usuario para ejecutar

---

## 📊 Visualización del Progreso

```
Cuestionario Inicial
     ↓
┌────────────┬────────────┐
│  FASE 1    │  FASE 2    │  ← Paralelo
│ ▓▓▓▓▓▓░░░░ │ ▓▓▓▓▓▓░░░░ │
└────────────┴────────────┘
     ↓
┌──────────────────────────┐
│ CONSOLIDACIÓN            │
│ ▓▓▓▓▓▓▓▓▓▓               │
└──────────────────────────┘
     ↓
┌──────────────────────────┐
│ FASE 3                   │
│ ▓▓▓▓▓▓▓░░░░              │
└──────────────────────────┘
     ↓
┌──────────────────────────┐
│ FASE 4                   │
│ ▓▓▓▓▓▓▓░░░░              │
└──────────────────────────┘
     ↓
┌──────────────────────────┐
│ FASE 5                   │
│ ▓▓▓▓▓▓▓░░░░              │
└──────────────────────────┘
     ↓
┌──────────────────────────┐
│ FASE 6                   │
│ ▓▓▓▓▓▓▓░░░░              │
└──────────────────────────┘
     ↓
┌──────────────────────────┐
│ GitHub Sync              │
│ ▓▓▓▓▓▓▓▓▓▓               │
└──────────────────────────┘
```

---

*FLUJO_EJECUCION.md — Guía completa de orquestación v1.0*
