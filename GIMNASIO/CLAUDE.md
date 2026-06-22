# userEmail
The user's email address is eduardo.paipay.27@unsch.edu.pe.
# currentDate
Today's date is 2026-06-21.

# 🔒 REGLA PRIMORDIAL — MIGRACIONES Y MODIFICACIONES DE BASE DE DATOS

**TODA** modificación a la base de datos debe seguir este flujo obligatorio. Sin excepción.

## FLUJO OBLIGATORIO (5 pasos)

### 1️⃣ DOCUMENTAR
- Crear archivo en `gymsos-frontend/migrations/` con nombre: `YYYY-MM-DD_HHMM_descripcion.sql`
- Incluir: descripción, impacto esperado, dependencias afectadas, plan de rollback

### 2️⃣ ANALIZAR
- Revisar qué tablas/campos se modifican
- Identificar impacto en queries existentes
- Verificar integridad referencial
- Definir rollback strategy completo

### 3️⃣ SOLICITAR APROBACIÓN
- Presentar el SQL documentado al usuario
- Explicar el impacto claramente
- **ESPERAR CONFIRMACIÓN EXPLÍCITA — NO EJECUTAR SIN APROBACIÓN**

### 4️⃣ VALIDAR EN STAGING (si aplica)
- Ejecutar primero en ambiente de desarrollo/staging si existe
- Verificar que funciona correctamente

### 5️⃣ EJECUTAR EN SUPABASE
- Solo después de aprobación y validación
- Usando `mcp__supabase__apply_migration` o `execute_sql` según el tipo de cambio
- Guardar registro de auditoría

## PLANTILLA DE MIGRACIÓN

```sql
-- gymsos-frontend/migrations/YYYY-MM-DD_HHMM_descripcion_clara.sql
/*
  DESCRIPCIÓN: [Qué hace esta migración]
  IMPACTO:     [Qué se modifica, crea o elimina]
  ROLLBACK:    [Script para revertir]
  DEPENDENCIAS:[Tablas/funciones afectadas]
  VALIDACIÓN:  [Cómo verificar que funciona]
*/
-- SQL aquí
```

## RESTRICCIONES DURAS

**NUNCA ejecutar sin seguir el flujo:**
- `CREATE TABLE` sin documentación
- `ALTER TABLE` (DROP/MODIFY columnas) sin análisis de impacto
- `DELETE/UPDATE` masivos sin backup verificado
- Cambios de schema sin registro en `/migrations/`
- Cualquier DDL/DML en producción sin aprobación explícita del usuario

## INSTRUCCIÓN PARA CLAUDE

Si Eduardo propone o Claude genera código que altere la BD sin seguir este flujo:
**DETENTE. Crea el archivo de migración primero. Luego solicita aprobación. Nunca al revés.**

El acceso directo vía MCP (`mcp__supabase__execute_sql`) NO exime de este flujo —
tener acceso técnico no significa ejecutar sin aprobación.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
