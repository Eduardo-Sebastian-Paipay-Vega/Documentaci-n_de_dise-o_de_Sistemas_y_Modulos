# 📍 MAPA DE UBICACIÓN DE ARCHIVOS — Dónde se guardan todos los documentos

> **Versión**: 1.0  
> **Tipo**: Guía de almacenamiento  
> **Propósito**: Especificar EXACTAMENTE dónde va cada archivo  
> **Fecha**: 2026-05-14

---

## 🚨 REGLA FUNDAMENTAL

**TODOS los documentos se generan en formato `.md` (Markdown)**

**TODOS los documentos se guardan en sus carpetas de fase correspondiente**

**NO se guardan en la raíz, NO en carpetas de BASE, NO en Creaciones**

---

## 📊 TABLA DE UBICACIÓN EXACTA

| Fase | Archivo | Ubicación EXACTA | Formato |
|------|---------|------------------|---------|
| **FASE 1** | `FASE_1_PROBLEMAS_DETECTADOS.md` | `C:\botas\Documentación__\Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md` | `.md` ✅ |
| **FASE 2** | `FASE_2_VALOR_AGREGADO.md` | `C:\botas\Documentación__\Fase 2 (Valor Agregado)\FASE_2_VALOR_AGREGADO.md` | `.md` ✅ |
| **CONSOLIDACIÓN** | `CONSOLIDACION_1_2.md` | `C:\botas\Documentación__\CONSOLIDACION_1_2.md` | `.md` ✅ |
| **FASE 3** | `FASE_3_REQUISITOS_CASOS_USO.md` | `C:\botas\Documentación__\Fase 3 (RF -- CU)\FASE_3_REQUISITOS_CASOS_USO.md` | `.md` ✅ |
| **FASE 4** | `FASE_4_PLAN_NEGOCIO.md` | `C:\botas\Documentación__\Fase 4 (Plan de Negocio)\FASE_4_PLAN_NEGOCIO.md` | `.md` ✅ |
| **FASE 5** | `FASE_5_BASE_DATOS.md` | `C:\botas\Documentación__\Fase 5 (BD)\FASE_5_BASE_DATOS.md` | `.md` ✅ |
| **FASE 6** | `FASE_6_DISEÑO_UX_UI.md` | `C:\botas\Documentación__\Fase 6 (UX - IX)\FASE_6_DISEÑO_UX_UI.md` | `.md` ✅ |

---

## 🏗️ ESTRUCTURA DE CARPETAS ESPERADA DESPUÉS DE EJECUCIÓN

```
C:\botas\Documentación__\
│
├── 📄 CLAUDE.md                              (existente)
├── 📄 PROMPT_MAESTRO.md                      (existente)
├── 📄 PROMPTS_ESPECIALIZADOS.md              (existente)
├── 📄 FLUJO_EJECUCION.md                     (existente)
├── 📄 DATOS_PROYECTO.json                    (existente)
├── 📄 SISTEMA_ORQUESTACION_README.md         (existente)
├── 📄 GUIA_RAPIDA_ORQUESTACION.md            (existente)
├── 📄 MAPA_UBICACION_ARCHIVOS.md             (este archivo)
│
│
├── 📁 Fase 1 (Problemas)
│   ├── 📄 FASE_1_PROBLEMAS_DETECTADOS.md    ← AQUÍ va Fase 1 ✅
│   └── (otros archivos previos)
│
├── 📁 Fase 2 (Valor Agregado)
│   ├── 📄 FASE_2_VALOR_AGREGADO.md          ← AQUÍ va Fase 2 ✅
│   └── (otros archivos previos)
│
├── 📄 CONSOLIDACION_1_2.md                   ← AQUÍ va Consolidación ✅
│   (en la raíz, no en una carpeta)
│
├── 📁 Fase 3 (RF -- CU)
│   ├── 📄 FASE_3_REQUISITOS_CASOS_USO.md    ← AQUÍ va Fase 3 ✅
│   └── (otros archivos previos)
│
├── 📁 Fase 4 (Plan de Negocio)
│   ├── 📄 FASE_4_PLAN_NEGOCIO.md            ← AQUÍ va Fase 4 ✅
│   └── (otros archivos previos)
│
├── 📁 Fase 5 (BD)
│   ├── 📄 FASE_5_BASE_DATOS.md              ← AQUÍ va Fase 5 ✅
│   └── (otros archivos previos)
│
├── 📁 Fase 6 (UX - IX)
│   ├── 📄 FASE_6_DISEÑO_UX_UI.md            ← AQUÍ va Fase 6 ✅
│   └── (otros archivos previos)
│
├── 📁 BASE_para construcción (carpeta de referencia)
├── 📁 Creaciones (para outputs opcionales)
├── 📁 .git (repositorio GitHub)
└── ...otros archivos
```

---

## ✅ CHECKLIST DE ALMACENAMIENTO

Cuando Claude termine cada fase, verifica:

- [ ] **Fase 1**: ¿Existe `Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md`?
- [ ] **Fase 2**: ¿Existe `Fase 2 (Valor Agregado)\FASE_2_VALOR_AGREGADO.md`?
- [ ] **Consolidación**: ¿Existe `CONSOLIDACION_1_2.md` en la raíz?
- [ ] **Fase 3**: ¿Existe `Fase 3 (RF -- CU)\FASE_3_REQUISITOS_CASOS_USO.md`?
- [ ] **Fase 4**: ¿Existe `Fase 4 (Plan de Negocio)\FASE_4_PLAN_NEGOCIO.md`?
- [ ] **Fase 5**: ¿Existe `Fase 5 (BD)\FASE_5_BASE_DATOS.md`?
- [ ] **Fase 6**: ¿Existe `Fase 6 (UX - IX)\FASE_6_DISEÑO_UX_UI.md`?

Si alguno falta, ese documento NO se guardó correctamente.

---

## 🔴 ERRORES COMUNES QUE NO DEBEN OCURRIR

### ❌ MAL: Guardar en la raíz
```
C:\botas\Documentación__\FASE_1_PROBLEMAS_DETECTADOS.md  ❌ INCORRECTO
```
**Debe ser:**
```
C:\botas\Documentación__\Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md  ✅ CORRECTO
```

---

### ❌ MAL: Guardar en Creaciones
```
C:\botas\Documentación__\Creaciones\FASE_1_PROBLEMAS_DETECTADOS.md  ❌ INCORRECTO
```
**Debe ser:**
```
C:\botas\Documentación__\Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md  ✅ CORRECTO
```

---

### ❌ MAL: Guardar en BASE
```
C:\botas\Documentación__\BASE_para construcción\FASE_1_PROBLEMAS_DETECTADOS.md  ❌ INCORRECTO
```
**Debe ser:**
```
C:\botas\Documentación__\Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md  ✅ CORRECTO
```

---

### ❌ MAL: Guardar en formato .docx, .txt, .pdf
```
FASE_1_PROBLEMAS_DETECTADOS.docx  ❌ INCORRECTO
FASE_1_PROBLEMAS_DETECTADOS.txt   ❌ INCORRECTO
FASE_1_PROBLEMAS_DETECTADOS.pdf   ❌ INCORRECTO
```
**Debe ser:**
```
FASE_1_PROBLEMAS_DETECTADOS.md    ✅ CORRECTO (Markdown)
```

---

## 🛠️ INSTRUCCIÓN PARA CLAUDE

Cuando Claude genere cada documento, DEBE:

1. **Crear el contenido** en formato Markdown
2. **Verificar la ruta destino** según la tabla de arriba
3. **Guardar EXACTAMENTE en esa ubicación** usando `Write` o comando equivalente
4. **Confirmar al usuario** que el archivo fue guardado en la ubicación correcta
5. **Actualizar DATOS_PROYECTO.json** con la ruta real

**Ejemplo de confirmación correcta:**
```
✅ FASE 1 completada
   Documento: FASE_1_PROBLEMAS_DETECTADOS.md
   Ubicación: C:\botas\Documentación__\Fase 1 (Problemas)\
   Formato: .md
   Líneas: 450
```

---

## 📝 NOTA EN PROMPTS_ESPECIALIZADOS.md

Cada sección de fase en PROMPTS_ESPECIALIZADOS.md incluye ahora:

```
### 📤 Salida
- Documento: `NOMBRE_ARCHIVO.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase X (...)\NOMBRE_ARCHIVO.md`
- **FORMATO**: Markdown (.md)

### 🎯 Instrucciones Específicas
⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta correspondiente
```

---

## 🚀 VERIFICACIÓN FINAL

Después de que Claude termine TODO (todas las 6 fases):

**Abre el explorador de archivos** y verifica:

```
Fase 1 (Problemas)
  └── FASE_1_PROBLEMAS_DETECTADOS.md  ← ¿Existe? ✅

Fase 2 (Valor Agregado)
  └── FASE_2_VALOR_AGREGADO.md  ← ¿Existe? ✅

CONSOLIDACION_1_2.md  ← ¿Existe en raíz? ✅

Fase 3 (RF -- CU)
  └── FASE_3_REQUISITOS_CASOS_USO.md  ← ¿Existe? ✅

Fase 4 (Plan de Negocio)
  └── FASE_4_PLAN_NEGOCIO.md  ← ¿Existe? ✅

Fase 5 (BD)
  └── FASE_5_BASE_DATOS.md  ← ¿Existe? ✅

Fase 6 (UX - IX)
  └── FASE_6_DISEÑO_UX_UI.md  ← ¿Existe? ✅
```

**Si todos existen → ✅ TODO CORRECTO**
**Si alguno falta → ❌ Hay un problema de almacenamiento**

---

## 📋 RESUMEN RÁPIDO

| Pregunta | Respuesta |
|----------|-----------|
| **¿Dónde se guardan?** | En la carpeta de cada fase específica |
| **¿Qué formato?** | SIEMPRE `.md` (Markdown) |
| **¿En qué carpeta va Fase 1?** | `Fase 1 (Problemas)` |
| **¿En qué carpeta va Fase 2?** | `Fase 2 (Valor Agregado)` |
| **¿Dónde va Consolidación?** | `C:\botas\Documentación__\` (raíz) |
| **¿En qué carpeta va Fase 3?** | `Fase 3 (RF -- CU)` |
| **¿En qué carpeta va Fase 4?** | `Fase 4 (Plan de Negocio)` |
| **¿En qué carpeta va Fase 5?** | `Fase 5 (BD)` |
| **¿En qué carpeta va Fase 6?** | `Fase 6 (UX - IX)` |

---

*MAPA_UBICACION_ARCHIVOS.md — Guía de almacenamiento v1.0*
