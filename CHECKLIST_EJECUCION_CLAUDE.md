# ✅ CHECKLIST DE EJECUCIÓN PARA CLAUDE — Verificación en cada fase

> **Versión**: 1.0  
> **Tipo**: Checklist operacional para Claude  
> **Propósito**: Asegurar que cada fase se ejecute correctamente  
> **Fecha**: 2026-05-14

---

## 📋 ANTES DE INICIAR LA ORQUESTACIÓN

Claude debe verificar:

- [ ] Leer completamente `PROMPT_MAESTRO.md`
- [ ] Leer completamente `PROMPTS_ESPECIALIZADOS.md`
- [ ] Leer completamente `MAPA_UBICACION_ARCHIVOS.md`
- [ ] Confirmar que todas las carpetas de fases existen:
  - [ ] `Fase 1 (Problemas)`
  - [ ] `Fase 2 (Valor Agregado)`
  - [ ] `Fase 3 (RF -- CU)`
  - [ ] `Fase 4 (Plan de Negocio)`
  - [ ] `Fase 5 (BD)`
  - [ ] `Fase 6 (UX - IX)`
- [ ] Crear/inicializar `DATOS_PROYECTO.json` si no existe

---

## 🎯 DURANTE LA EJECUCIÓN DE CADA FASE

### GENERAL PARA TODAS LAS FASES

**ANTES de generar:**
- [ ] Leer instrucciones específicas de fase en `PROMPTS_ESPECIALIZADOS.md`
- [ ] Verificar ruta de almacenamiento en `MAPA_UBICACION_ARCHIVOS.md`
- [ ] Confirmar datos disponibles del proyecto

**DURANTE la generación:**
- [ ] Escribir contenido en Markdown
- [ ] Incluir todas las secciones requeridas
- [ ] Mantener longitud dentro del rango especificado
- [ ] Usar tablas, listas, código cuando sea apropiado
- [ ] Si hay diagramas, usar sintaxis Mermaid embebida

**DESPUÉS de generar:**
- [ ] Guardar el archivo en la ruta EXACTA especificada
- [ ] **Usar formato `.md`** (NO .txt, NO .docx, NO .pdf)
- [ ] Verificar que el archivo existe en la ubicación correcta
- [ ] Actualizar `DATOS_PROYECTO.json` con metadata
- [ ] Confirmar al usuario la ubicación exacta

---

## 🔄 FASE 1: ANÁLISIS DE PROBLEMAS

### Checklist Fase 1

**Entrada:**
- [ ] Nombre del proyecto: ✅ Recibido
- [ ] Tipo de aplicación: ✅ Recibido
- [ ] Industria: ✅ Recibido
- [ ] Usuario principal: ✅ Recibido
- [ ] Problema principal: ✅ Recibido
- [ ] Escala: ✅ Recibido
- [ ] Contexto actual: ✅ Recibido

**Contenido:**
- [ ] Resumen ejecutivo (3-5 líneas)
- [ ] Árbol de problemas (Mermaid)
- [ ] 5-7 problemáticas específicas
- [ ] Tabla de stakeholders
- [ ] Contexto tecnológico actual
- [ ] Justificación de necesidad

**Almacenamiento:**
- [ ] Archivo: `FASE_1_PROBLEMAS_DETECTADOS.md`
- [ ] Ruta: `C:\botas\Documentación__\Fase 1 (Problemas)\`
- [ ] Formato: ✅ `.md` (Markdown)
- [ ] Longitud: 500-800 palabras
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "fase_1": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "Fase 1 (Problemas)/FASE_1_PROBLEMAS_DETECTADOS.md",
    "longitud_aprox": XXX
  }
}
```

**Confirmación al usuario:**
```
✅ FASE 1 COMPLETADA
   Archivo: FASE_1_PROBLEMAS_DETECTADOS.md
   Ubicación: Fase 1 (Problemas)/
   Formato: .md
   Secciones: 6
```

---

## 🔄 FASE 2: PROPUESTA DE VALOR

### Checklist Fase 2

**Entrada:**
- [ ] Nombre del proyecto: ✅ Recibido
- [ ] Tipo de aplicación: ✅ Recibido
- [ ] Diferenciación: ✅ Recibida
- [ ] Objetivo principal: ✅ Recibido

**Contenido:**
- [ ] Propuesta de Valor Única (UVP)
- [ ] Canvas de Propuesta de Valor (tabla)
- [ ] 5+ Beneficios Tangibles
- [ ] Beneficios Intangibles
- [ ] Comparativa con competencia
- [ ] Segmentos de clientes
- [ ] Mapa de empatía

**Almacenamiento:**
- [ ] Archivo: `FASE_2_VALOR_AGREGADO.md`
- [ ] Ruta: `C:\botas\Documentación__\Fase 2 (Valor Agregado)\`
- [ ] Formato: ✅ `.md` (Markdown)
- [ ] Longitud: 600-900 palabras
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "fase_2": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "Fase 2 (Valor Agregado)/FASE_2_VALOR_AGREGADO.md",
    "longitud_aprox": XXX
  }
}
```

**Confirmación al usuario:**
```
✅ FASE 2 COMPLETADA
   Archivo: FASE_2_VALOR_AGREGADO.md
   Ubicación: Fase 2 (Valor Agregado)/
   Formato: .md
   Secciones: 7
```

---

## 🔄 CONSOLIDACIÓN: FUSION 1 + 2

### Checklist Consolidación

**Entrada:**
- [ ] Datos de Fase 1: ✅ Disponibles
- [ ] Datos de Fase 2: ✅ Disponibles

**Contenido:**
- [ ] Resumen de problemas (Fase 1)
- [ ] Resumen de valor agregado (Fase 2)
- [ ] Integración narrativa
- [ ] Matriz Problema ↔ Solución ↔ Valor
- [ ] Inputs derivados para Fase 3

**Almacenamiento:**
- [ ] Archivo: `CONSOLIDACION_1_2.md`
- [ ] Ruta: `C:\botas\Documentación__\` (raíz, NO en carpeta)
- [ ] Formato: ✅ `.md` (Markdown)
- [ ] Longitud: 400-600 palabras
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "consolidacion": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "CONSOLIDACION_1_2.md"
  }
}
```

**Confirmación al usuario:**
```
✅ CONSOLIDACIÓN COMPLETADA
   Archivo: CONSOLIDACION_1_2.md
   Ubicación: Raíz (C:\botas\Documentación__\)
   Formato: .md
```

---

## 🔄 FASE 3: REQUISITOS Y CASOS DE USO

### Checklist Fase 3

**Entrada:**
- [ ] Problemas (Fase 1): ✅ Disponibles
- [ ] Valor agregado (Fase 2): ✅ Disponible
- [ ] Consolidación: ✅ Disponible

**Contenido:**
- [ ] 15-20 Requisitos Funcionales (RF-001, RF-002, ...)
- [ ] 5-8 Requisitos No Funcionales (RNF-001, ...)
- [ ] Diagrama de Casos de Uso (Mermaid)
- [ ] 5-8 Especificaciones de Casos de Uso detalladas
- [ ] Matriz de Trazabilidad RF ↔ CU
- [ ] Lista de módulos/áreas
- [ ] Tabla de actores

**Almacenamiento:**
- [ ] Archivo: `FASE_3_REQUISITOS_CASOS_USO.md`
- [ ] Ruta: `C:\botas\Documentación__\Fase 3 (RF -- CU)\`
- [ ] Formato: ✅ `.md` (Markdown con Mermaid embebido)
- [ ] Longitud: 1000-1500 palabras
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "fase_3": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "Fase 3 (RF -- CU)/FASE_3_REQUISITOS_CASOS_USO.md",
    "requisitos_funcionales": XX,
    "casos_uso": XX,
    "diagramas": 2
  }
}
```

**Confirmación al usuario:**
```
✅ FASE 3 COMPLETADA
   Archivo: FASE_3_REQUISITOS_CASOS_USO.md
   Ubicación: Fase 3 (RF -- CU)/
   Formato: .md
   RF: XX | CU: XX | Diagramas: 2
```

---

## 🔄 FASE 4: PLAN DE NEGOCIO

### Checklist Fase 4

**Entrada:**
- [ ] Requisitos (Fase 3): ✅ Disponibles
- [ ] Valor agregado (Fase 2): ✅ Disponible
- [ ] Todo lo anterior: ✅ Disponible

**Contenido:**
- [ ] Resumen ejecutivo
- [ ] Business Model Canvas (9 secciones)
- [ ] Análisis de mercado
- [ ] Modelo de ingresos
- [ ] Análisis de costos
- [ ] ROI y proyecciones
- [ ] MVP scope
- [ ] Cronograma Gantt
- [ ] Análisis de riesgos
- [ ] Sostenibilidad

**Almacenamiento:**
- [ ] Archivo: `FASE_4_PLAN_NEGOCIO.md`
- [ ] Ruta: `C:\botas\Documentación__\Fase 4 (Plan de Negocio)\`
- [ ] Formato: ✅ `.md` (Markdown con tablas)
- [ ] Longitud: 1200-1800 palabras
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "fase_4": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "Fase 4 (Plan de Negocio)/FASE_4_PLAN_NEGOCIO.md",
    "secciones": 10
  }
}
```

**Confirmación al usuario:**
```
✅ FASE 4 COMPLETADA
   Archivo: FASE_4_PLAN_NEGOCIO.md
   Ubicación: Fase 4 (Plan de Negocio)/
   Formato: .md
   Secciones: 10 | Tablas: 8
```

---

## 🔄 FASE 5: BASE DE DATOS

### Checklist Fase 5

**Entrada:**
- [ ] Requisitos funcionales (Fase 3): ✅ Disponibles
- [ ] Reglas de negocio (Fase 4): ✅ Disponibles
- [ ] Actores y CU (Fase 3): ✅ Disponibles

**Contenido:**
- [ ] Diccionario de datos (20-30 campos)
- [ ] Modelo Entidad-Relación (Mermaid)
- [ ] Modelo relacional normalizado (1FN, 2FN, 3FN)
- [ ] Scripts DDL completos (5-8 tablas)
- [ ] Índices y optimizaciones
- [ ] Políticas de integridad
- [ ] Procedimientos/triggers
- [ ] Estrategia de backup
- [ ] Seguridad de datos
- [ ] Versionado del esquema

**Almacenamiento:**
- [ ] Archivo: `FASE_5_BASE_DATOS.md`
- [ ] Ruta: `C:\botas\Documentación__\Fase 5 (BD)\`
- [ ] Formato: ✅ `.md` (Markdown con SQL embebido)
- [ ] Longitud: 900-1200 palabras + scripts
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "fase_5": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "Fase 5 (BD)/FASE_5_BASE_DATOS.md",
    "tablas": XX,
    "campos_totales": XX,
    "relaciones": XX
  }
}
```

**Confirmación al usuario:**
```
✅ FASE 5 COMPLETADA
   Archivo: FASE_5_BASE_DATOS.md
   Ubicación: Fase 5 (BD)/
   Formato: .md
   Tablas: XX | Campos: XX | Relaciones: XX
```

---

## 🔄 FASE 6: DISEÑO UX/UI

### Checklist Fase 6

**Entrada:**
- [ ] Funcionalidades (Fase 3): ✅ Disponibles
- [ ] Casos de uso (Fase 3): ✅ Disponibles
- [ ] Base de datos (Fase 5): ✅ Disponible
- [ ] RNF (Fase 3): ✅ Disponibles

**Contenido:**
- [ ] Principios de diseño UX
- [ ] Arquitectura de información
- [ ] Flujos de usuario (3-5)
- [ ] Wireframes detallados (8-10 pantallas)
- [ ] Guía de estilos
- [ ] Componentes reutilizables
- [ ] Patrones de interacción
- [ ] Accesibilidad (WCAG 2.1)
- [ ] Responsive design
- [ ] Testing de usabilidad

**Almacenamiento:**
- [ ] Archivo: `FASE_6_DISEÑO_UX_UI.md`
- [ ] Ruta: `C:\botas\Documentación__\Fase 6 (UX - IX)\`
- [ ] Formato: ✅ `.md` (Markdown con descripciones y Mermaid)
- [ ] Longitud: 1200-1600 palabras
- [ ] Verificado que existe en ubicación correcta

**Actualización JSON:**
```json
{
  "fase_6": {
    "estado": "completada",
    "timestamp": "YYYY-MM-DDTHH:MM:00Z",
    "archivo": "Fase 6 (UX - IX)/FASE_6_DISEÑO_UX_UI.md",
    "pantallas": XX,
    "componentes": XX,
    "flujos": XX
  }
}
```

**Confirmación al usuario:**
```
✅ FASE 6 COMPLETADA
   Archivo: FASE_6_DISEÑO_UX_UI.md
   Ubicación: Fase 6 (UX - IX)/
   Formato: .md
   Pantallas: XX | Componentes: XX | Flujos: XX
```

---

## 🚀 DESPUÉS DE TODAS LAS FASES

**Antes de GitHub Sync:**
- [ ] Verificar que existen 7 archivos `.md`:
  - [ ] `Fase 1 (Problemas)/FASE_1_PROBLEMAS_DETECTADOS.md`
  - [ ] `Fase 2 (Valor Agregado)/FASE_2_VALOR_AGREGADO.md`
  - [ ] `CONSOLIDACION_1_2.md` (raíz)
  - [ ] `Fase 3 (RF -- CU)/FASE_3_REQUISITOS_CASOS_USO.md`
  - [ ] `Fase 4 (Plan de Negocio)/FASE_4_PLAN_NEGOCIO.md`
  - [ ] `Fase 5 (BD)/FASE_5_BASE_DATOS.md`
  - [ ] `Fase 6 (UX - IX)/FASE_6_DISEÑO_UX_UI.md`

- [ ] Verificar que `DATOS_PROYECTO.json` está completo con toda metadata
- [ ] Hacer commit a GitHub con mensaje descriptivo
- [ ] Verificar que el push fue exitoso

**Confirmación final:**
```
═══════════════════════════════════════════════════════════════
🎉 ORQUESTACIÓN COMPLETADA

✅ Fase 1: C:\botas\Documentación__\Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md
✅ Fase 2: C:\botas\Documentación__\Fase 2 (Valor Agregado)\FASE_2_VALOR_AGREGADO.md
✅ Consolidación: C:\botas\Documentación__\CONSOLIDACION_1_2.md
✅ Fase 3: C:\botas\Documentación__\Fase 3 (RF -- CU)\FASE_3_REQUISITOS_CASOS_USO.md
✅ Fase 4: C:\botas\Documentación__\Fase 4 (Plan de Negocio)\FASE_4_PLAN_NEGOCIO.md
✅ Fase 5: C:\botas\Documentación__\Fase 5 (BD)\FASE_5_BASE_DATOS.md
✅ Fase 6: C:\botas\Documentación__\Fase 6 (UX - IX)\FASE_6_DISEÑO_UX_UI.md

📊 DATOS_PROYECTO.json actualizado
🔄 GitHub sincronizado
⏱️ Tiempo total: XX minutos

═══════════════════════════════════════════════════════════════
```

---

## 🛠️ SI ALGO SALE MAL

| Problema | Acción |
|----------|--------|
| Un archivo no se guarda | Reintentar con la ruta EXACTA |
| Archivo en formato incorrecto | Convertir a `.md` y guardar nuevamente |
| Falta una sección | Regenerar esa fase |
| GitHub sync falla | Reportar al usuario para hacer push manual |

---

*CHECKLIST_EJECUCION_CLAUDE.md — Guía operacional para Claude v1.0*
