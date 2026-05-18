# ⚡ GUÍA RÁPIDA — Sistema de Orquestación en 1 Página

---

## 🎬 INICIO RÁPIDO (3 PASOS)

### 1. Usuario escribe:
```
Ejecuta el sistema de orquestación de fases
```

### 2. Claude presenta cuestionario (responde TODO de una vez):
```
- Nombre del proyecto
- Tipo de aplicación
- Industria
- Usuario principal
- Problema principal
- Escala
- Contexto actual
- Diferenciación
- Objetivo principal
- Restricciones
```

### 3. Claude ejecuta TODO automáticamente:
```
✅ Fase 1 (Análisis) + Fase 2 (Valor) EN PARALELO
✅ Consolidación
✅ Fase 3 (RF + CU)
✅ Fase 4 (Negocio)
✅ Fase 5 (BD)
✅ Fase 6 (UX/UI)
✅ Auto-push GitHub
```

---

## 📁 ARCHIVOS CLAVE

| Archivo | Qué es | Cuándo leer |
|---------|--------|-----------|
| **PROMPT_MAESTRO.md** | Cerebro central | Primer inicio |
| **PROMPTS_ESPECIALIZADOS.md** | Instrucciones por fase | Para entender cada fase |
| **FLUJO_EJECUCION.md** | Paso a paso de ejecución | Para debuggear |
| **DATOS_PROYECTO.json** | Almacén de datos | Al final, para verificar |
| **SISTEMA_ORQUESTACION_README.md** | Guía completa | Referencia general |

---

## 🔄 FLUJO DE EJECUCIÓN

```
Cuestionario Inicial
        ↓
┌───────────────┬───────────────┐
│ FASE 1        │ FASE 2        │  ← PARALELO
│ (Problemas)   │ (Valor)       │
└───────────────┴───────────────┘
        ↓
  CONSOLIDACIÓN
        ↓
    FASE 3
 (RF + Casos)
        ↓
    FASE 4
(Plan Negocio)
        ↓
    FASE 5
  (BD + SQL)
        ↓
    FASE 6
  (UX + UI)
        ↓
 GITHUB SYNC
        ↓
    FIN
```

---

## 📋 QUÉ GENERA CADA FASE

| Fase | Entrada | Salida | Archivos |
|------|---------|--------|----------|
| **1** | Problema | Análisis | `FASE_1_PROBLEMAS_DETECTADOS.md` |
| **2** | Diferenciación | Propuesta valor | `FASE_2_VALOR_AGREGADO.md` |
| **C** | 1+2 | Consolidado | `CONSOLIDACION_1_2.md` |
| **3** | 1+2 | RF + CU + Diagramas | `FASE_3_REQUISITOS_CASOS_USO.md` |
| **4** | 3 | Plan negocio | `FASE_4_PLAN_NEGOCIO.md` |
| **5** | 3+4 | BD + SQL | `FASE_5_BASE_DATOS.md` |
| **6** | 3+5 | UX/UI + Wireframes | `FASE_6_DISEÑO_UX_UI.md` |

---

## ✅ REGLAS IMPORTANTES

1. **Sin intervención**: Una vez iniciado, ejecuta todo automáticamente
2. **Sin preguntas extra**: Solo pregunta el cuestionario inicial
3. **Paralelo**: Fases 1 y 2 ocurren simultáneamente
4. **Secuencial después**: Fases 3-6 son secuenciales
5. **Auto-push**: Sincroniza GitHub automáticamente al terminar

---

## ⏱️ TIEMPOS ESTIMADOS

```
Fase 1:      5 min  }
Fase 2:      5 min  } PARALELO = 5 min total
Consolidación: 2 min
Fase 3:      8 min
Fase 4:      8 min
Fase 5:      8 min
Fase 6:      8 min
GitHub:      2 min
─────────────────────
TOTAL:      45-50 min
```

---

## 🎯 EJEMPLOS DE RESPUESTAS

### Pregunta: "¿Nombre del proyecto?"
**Buena**: Sistema de Gestión de Inventario para Farmacias  
**Mala**: Un sistema

### Pregunta: "¿Cuál es el problema principal?"
**Buena**: Los farmacéuticos pierden 2 horas diarias en gestión manual de inventario, lo que causa pérdidas financieras del 15% por productos vencidos  
**Mala**: Necesito un sistema

### Pregunta: "¿Qué hace diferente tu solución?"
**Buena**: Automatización con IA que predice demanda, reduce vencimientos y genera reportes en tiempo real  
**Mala**: Es más rápida

---

## 🛠️ SI ALGO FALLA

| Problema | Solución |
|----------|----------|
| Claude pregunta por cada fase | Responde TODO en una interacción |
| Fase X no genera | Revisa error en `DATOS_PROYECTO.json` |
| No se pushea a GitHub | Usa: `git push origin main` manual |
| Documenta mal | Las respuestas iniciales determinan calidad |

---

## 💾 ARCHIVOS GENERADOS

Después de ejecutar:
```
Documentación__/
├── Fase 1 (Problemas)/
│   └── FASE_1_PROBLEMAS_DETECTADOS.md
├── Fase 2 (Valor Agregado)/
│   └── FASE_2_VALOR_AGREGADO.md
├── Consolidación/
│   └── CONSOLIDACION_1_2.md
├── Fase 3 (RF -- CU)/
│   └── FASE_3_REQUISITOS_CASOS_USO.md
├── Fase 4 (Plan de Negocio)/
│   └── FASE_4_PLAN_NEGOCIO.md
├── Fase 5 (BD)/
│   └── FASE_5_BASE_DATOS.md
└── Fase 6 (UX - IX)/
    └── FASE_6_DISEÑO_UX_UI.md
```

---

## 🎓 PRÓXIMOS PASOS

1. ✅ **Lee los documentos generados**
2. ✅ **Refina manualmente si necesario**
3. ✅ **Haz commits adicionales** (`git add -A && git commit -m "..."`
4. ✅ **Continúa con Fase 7** o nuevas iteraciones

---

## 📌 COMANDOS ÚTILES

```bash
# Ver estado del repo
git status

# Ver historial
git log --oneline -10

# Ver cambios de un archivo
git diff ARCHIVO.md

# Hacer commit manual (si necesario)
git add -A
git commit -m "feat(fase-X): descripción"
git push origin main

# Ver archivos generados
ls -la "Fase 1 (Problemas)/"
```

---

## 🚀 YA ESTÁS LISTO

**Comando final para iniciar todo:**
```
Ejecuta el sistema de orquestación de fases
```

**Luego:** Responde el cuestionario y espera

**Resultado:** 6 fases documentadas en ~50 minutos

---

*GUIA_RAPIDA_ORQUESTACION.md — Referencia rápida v1.0*
