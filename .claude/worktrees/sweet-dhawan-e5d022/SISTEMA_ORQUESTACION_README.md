# 🏭 SISTEMA DE ORQUESTACIÓN AUTOMATIZADO — README

> **Versión**: 1.0  
> **Tipo**: Guía de inicio rápido  
> **Propósito**: Explicar cómo usar el sistema de orquestación  
> **Fecha**: 2026-05-14

---

## 🎯 ¿QUÉ ES ESTO?

Este es un **sistema automatizado y estructurado** que ejecuta las 6 primeras fases de documentación de sistemas sin intervención del usuario.

**Antes:**
```
Usuario: "Crea la Fase 1"
Claude: [crea Fase 1]
Usuario: "Ahora la Fase 2"
Claude: [crea Fase 2]
Usuario: "Ahora la Fase 3"
Claude: [crea Fase 3]
... (tedioso y propenso a errores)
```

**Ahora:**
```
Usuario: "Ejecuta el sistema de orquestación de fases"
Claude: [presenta cuestionario único]
Usuario: [responde todas las preguntas en UNA interacción]
Claude: [ejecuta automáticamente Fase 1 → Fase 2 → ... → Fase 6 → GitHub]
... [sin preguntar nada más]
```

---

## 📁 Archivos del Sistema

Dentro de `C:\botas\Documentación__\` encontrarás:

| Archivo | Propósito |
|---------|-----------|
| **PROMPT_MAESTRO.md** | 🎯 El director de orquestación. Define cómo ejecutar todo |
| **PROMPTS_ESPECIALIZADOS.md** | 📋 Prompts detallados para cada una de las 6 fases |
| **FLUJO_EJECUCION.md** | 🔄 Explicación paso a paso de cómo se ejecuta todo |
| **DATOS_PROYECTO.json** | 📊 Archivo JSON que almacena datos intermedios |
| **SISTEMA_ORQUESTACION_README.md** | 📖 Este archivo |

---

## 🚀 CÓMO USAR (SUPER SIMPLE)

### PASO 1: El usuario escribe esto

```
Ejecuta el sistema de orquestación de fases
```

### PASO 2: Claude responde

Claude presenta un cuestionario único con preguntas como:

```
1. ¿Nombre del proyecto/sistema?
2. ¿Tipo de aplicación? (Web, Mobile, Desktop, API, etc.)
3. ¿Industria/Sector?
4. ¿Usuario principal?
5. ¿Cuál es el problema principal?
6. ¿A cuántas personas afecta?
7. ¿Cuál es el contexto actual?
8. ¿Qué hace diferente tu solución?
9. ¿Cuál es el objetivo principal?
10. ¿Restricciones o requisitos obligatorios?
```

### PASO 3: El usuario responde TODO de una vez

El usuario responde todas las preguntas en una sola interacción.

### PASO 4: Claude ejecuta automáticamente (SIN PARAR)

Claude inicia:
1. ✅ Fase 1 (Análisis de Problemas)
2. ✅ Fase 2 (Valor Agregado) — EN PARALELO con Fase 1
3. ✅ Consolidación (fusiona resultados)
4. ✅ Fase 3 (Requisitos y Casos de Uso)
5. ✅ Fase 4 (Plan de Negocio)
6. ✅ Fase 5 (Base de Datos)
7. ✅ Fase 6 (Diseño UX/UI)
8. ✅ Auto-Push a GitHub

**Sin hacer más preguntas.** Todo automáticamente.

---

## 🔍 ARCHIVOS CLAVE EXPLICADOS

### 1. PROMPT_MAESTRO.md

Es el **cerebro central**. Define:
- Cuestionario inicial (qué preguntar)
- Flujo de ejecución (en qué orden)
- Reglas de ejecución (dependencias)
- Formato de datos intermedios

**Cuándo leerlo:** Al inicio, para entender la arquitectura general.

---

### 2. PROMPTS_ESPECIALIZADOS.md

Contiene los **6 prompts específicos**, uno por cada fase:

- **FASE 1️⃣ — Análisis de Problemas**
  - Qué debe contener el documento
  - Cuántas palabras
  - Qué secciones
  - Ejemplos de estructura

- **FASE 2️⃣ — Propuesta de Valor**
  - Canvas de valor
  - Beneficios
  - Comparativa con competencia

- **FASE 3️⃣ — Requisitos y Casos de Uso**
  - RF, RNF
  - Casos de uso detallados
  - Diagramas UML

- **FASE 4️⃣ — Plan de Negocio**
  - Business Model Canvas
  - Análisis económico
  - Proyecciones financieras

- **FASE 5️⃣ — Base de Datos**
  - Modelo E-R
  - Scripts SQL
  - Índices y optimizaciones

- **FASE 6️⃣ — Diseño UX/UI**
  - Wireframes
  - Flujos de usuario
  - Guía de estilos

**Cuándo leerlo:** Si quieres entender exactamente qué generará cada fase.

---

### 3. FLUJO_EJECUCION.md

Paso a paso: **cómo ejecuta Claude cada fase**.

Muestra:
- Qué datos recibe cada fase
- Qué procesa
- Qué entrega
- Cómo se comunica con la siguiente fase

**Cuándo leerlo:** Si quieres debuggear o entender qué pasó en cada fase.

---

### 4. DATOS_PROYECTO.json

**Archivo de almacenamiento temporal**.

Estructura:
```json
{
  "proyecto": { "nombre": ..., "tipo": ... },
  "fase_1": { "estado": "completada", "archivo": ... },
  "fase_2": { "estado": "completada", "archivo": ... },
  ...
  "github_sync": { "estado": "completada", "commit": ... }
}
```

Claude lo actualiza automáticamente después de cada fase.

**Cuándo verificarlo:** Al final, para confirmar que todas las fases completaron.

---

## ⚙️ CÓMO FUNCIONA INTERNAMENTE

### Ciclo de ejecución

```
1. Usuario pide: "Ejecuta el sistema"
   ↓
2. Claude lee PROMPT_MAESTRO.md
   ↓
3. Claude presenta cuestionario
   ↓
4. Usuario responde
   ↓
5. Claude guarda en DATOS_PROYECTO.json
   ↓
6. Claude lee PROMPTS_ESPECIALIZADOS.md (sección FASE 1)
   ↓
7. Claude ejecuta FASE 1 → genera FASE_1_*.md
   ↓
8. Claude lee PROMPTS_ESPECIALIZADOS.md (sección FASE 2)
   ↓
9. Claude ejecuta FASE 2 (EN PARALELO) → genera FASE_2_*.md
   ↓
10. Ambas completadas → Claude crea CONSOLIDACION_1_2.md
   ↓
11. Claude lee PROMPTS_ESPECIALIZADOS.md (sección FASE 3)
   ↓
12. Claude ejecuta FASE 3 → genera FASE_3_*.md
   ↓
... (repite para fases 4, 5, 6)
   ↓
30. Claude ejecuta git add -A && git commit && git push
   ↓
31. ¡COMPLETADO!
```

---

## 📊 ESTRUCTURA DE CARPETAS ESPERADA

Después de ejecutar el sistema:

```
C:\botas\Documentación__\
│
├── CLAUDE.md                          ← Tu CLAUDE.md existente
├── PROMPT_MAESTRO.md                  ← ✅ Nuevo
├── PROMPTS_ESPECIALIZADOS.md          ← ✅ Nuevo
├── FLUJO_EJECUCION.md                 ← ✅ Nuevo
├── DATOS_PROYECTO.json                ← ✅ Nuevo (actualizado)
├── SISTEMA_ORQUESTACION_README.md     ← ✅ Este archivo
│
├── FASE 1 (Problemas)/
│   └── FASE_1_PROBLEMAS_DETECTADOS.md    ← ✅ Generado por Fase 1
│
├── FASE 2 (Valor Agregado)/
│   └── FASE_2_VALOR_AGREGADO.md          ← ✅ Generado por Fase 2
│
├── CONSOLIDACION/                         ← ✅ Nueva carpeta
│   └── CONSOLIDACION_1_2.md               ← ✅ Generado
│
├── FASE 3 (RF -- CU)/
│   └── FASE_3_REQUISITOS_CASOS_USO.md    ← ✅ Generado por Fase 3
│
├── FASE 4 (Plan de Negocio)/
│   └── FASE_4_PLAN_NEGOCIO.md            ← ✅ Generado por Fase 4
│
├── FASE 5 (BD)/
│   └── FASE_5_BASE_DATOS.md              ← ✅ Generado por Fase 5
│
├── FASE 6 (UX - IX)/
│   └── FASE_6_DISEÑO_UX_UI.md            ← ✅ Generado por Fase 6
│
└── .git/                              ← GitHub actualizado
```

---

## 🎯 CASOS DE USO

### Caso 1: Proyecto Nuevo desde Cero
```
Usuario: "Ejecuta el sistema de orquestación"
Claude: [presenta cuestionario]
Usuario: [responde sobre su idea nueva]
Claude: [genera documentación completa de 6 fases]
Resultado: Proyecto completamente documentado en 1 hora
```

### Caso 2: Refinamiento de Proyecto Existente
```
Usuario: "Ejecuta el sistema de orquestación"
Claude: [presenta cuestionario]
Usuario: [actualiza algunas respuestas previas]
Claude: [regenera las 6 fases con nueva información]
Resultado: Documentación actualizada
```

### Caso 3: Ejecución Parcial
```
Usuario: "Ejecuta solo hasta Fase 4"
Claude: [ejecuta Fases 1-4, se detiene antes de Fase 5]
Resultado: Fases 1-4 completadas, Fase 5-6 pendientes para después
```

---

## ⚠️ REQUISITOS PREVIOS

1. ✅ Carpeta `C:\botas\Documentación__\` existente
2. ✅ Repositorio Git configurado (CLAUDE.md debe estar presente)
3. ✅ Token de GitHub en el remote (para auto-push)
4. ✅ Estos 6 archivos en la carpeta raíz:
   - PROMPT_MAESTRO.md ✅
   - PROMPTS_ESPECIALIZADOS.md ✅
   - FLUJO_EJECUCION.md ✅
   - DATOS_PROYECTO.json ✅
   - SISTEMA_ORQUESTACION_README.md ✅

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### "Claude pregunta sobre cada fase"
**Problema:** El sistema no está funcionando automáticamente.

**Solución:** 
- Asegúrate de que el usuario respondió TODAS las preguntas en UNA interacción
- Claude debe leer PROMPT_MAESTRO.md y entender que NO debe preguntar más

### "Fase X no se genera"
**Problema:** Una fase falla o no genera documento.

**Solución:**
- Revisar DATOS_PROYECTO.json en la sección de esa fase
- Buscar campo `"error"` para ver el mensaje de error
- Reintentar esa fase específica

### "No se pushea a GitHub"
**Problema:** Auto-push al final falla.

**Solución:**
- Verificar que el token de GitHub esté en el remote URL
- Ejecutar manualmente: `git push origin main` desde la carpeta

### "Algunos archivos no se generan"
**Problema:** No hay consolidación o faltan archivos.

**Solución:**
- Crear manualmente `CONSOLIDACION/` si no existe
- Claude debe generar `CONSOLIDACION_1_2.md` después de Fase 2

---

## 📈 EVOLUCIÓN DEL SISTEMA

**Versión 1.0 (Actual):**
- ✅ Ejecuta Fases 1-6 automáticamente
- ✅ Paralelo para Fases 1 y 2
- ✅ Consolidación automática
- ✅ Auto-push a GitHub
- ✅ Almacenamiento de datos intermedios

**Versión 2.0 (Futura):**
- 🔄 Fases 7 (Implementación)
- 🔄 Ajustes iterativos
- 🔄 Validación de calidad automática
- 🔄 Reportes de progreso en HTML

---

## 💡 TIPS Y TRICKS

### Acelerar ejecución
- Responde preguntas con descripciones medianas (no muy largas)
- Así Claude genera documentos más rápido

### Mejorar calidad
- Sé específico en las respuestas del cuestionario inicial
- Proporciona contexto real sobre tu industria
- Así los documentos serán más precisos y relevantes

### Reutilizar el sistema
- El archivo `DATOS_PROYECTO.json` persiste
- Puedes ejecutar el sistema de nuevo con datos nuevos
- Genera múltiples proyectos sin conflictos

### Explorar resultados
- Abre cada carpeta de fase
- Lee los documentos `.md` generados
- Son los outputs finales que puedes usar

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Cuánto tiempo toma?**
R: 45-60 minutos para todo automáticamente.

**P: ¿Puedo pausar en medio?**
R: Sí, pero no es recomendado. Es mejor que termines todo de una vez.

**P: ¿Puedo cambiar las respuestas después?**
R: Sí, ejecuta el sistema nuevamente con respuestas nuevas.

**P: ¿Los documentos generados son finales?**
R: Son v1.0. Puedes editarlos y mejorarlos manualmente después.

**P: ¿Qué pasa si hay errores?**
R: Claude te notifica cuál fase falló. Puedes reintentar esa fase o todo desde cero.

---

## 🎓 APRENDE MÁS

Para profundizar:

1. **Lee PROMPT_MAESTRO.md** → Entiende la arquitectura
2. **Lee PROMPTS_ESPECIALIZADOS.md** → Entiende cada fase
3. **Lee FLUJO_EJECUCION.md** → Entiende el flujo paso a paso
4. **Ejecuta el sistema** → Experimenta en vivo
5. **Revisa resultados** → Analiza qué generó Claude

---

## ✨ PRÓXIMOS PASOS

Una vez que completes las Fases 1-6:

1. ✅ **Revisa los documentos** en cada carpeta de fase
2. ✅ **Refina manualmente** cualquier sección que necesite
3. ✅ **Commits adicionales** si haces cambios importantes
4. ✅ **Continúa con Fase 7** (Implementación) manualmente o solicita nuevos prompts

---

## 📝 NOTA FINAL

Este sistema fue diseñado para **automatizar el 80% del trabajo** de documentación.

El 20% restante (refinamiento, validación, ajustes) es responsabilidad del usuario.

**Nunca confíes 100% en la IA. Siempre revisa y valida los resultados.**

---

*SISTEMA_ORQUESTACION_README.md — Guía de uso v1.0*

**¿Listo para empezar?**

```
Escribe: "Ejecuta el sistema de orquestación de fases"

Claude responderá automáticamente con el cuestionario.
```

---

**Creado**: 2026-05-14  
**Propietario**: Eduardo Sebastian Paipay Vega  
**Repositorio**: https://github.com/Eduardo-Sebastian-Paipay-Vega/Documentaci-n_de_dise-o_de_Sistemas_y_Modulos
