# userEmail
The user's email address is eduardo.paipay.27@unsch.edu.pe.
# currentDate
Today's date is 2026-06-01.

## REGLA: Documentación obligatoria de cambios en BD

**Cualquier cambio en la base de datos — tablas, triggers, funciones, RLS, seeds, backfills, fixes puntuales — debe quedar registrado en un archivo `.sql` de migración antes de ejecutarse.**

- Ubicación: `gymsos-frontend/migrations/`
- Nombre: `NNN_descripcion_corta.sql` donde NNN es el número secuencial siguiente (ej: `012_...`)
- Formato: seguir el estilo de `009_gym_as_bd_maestra_module.sql` — encabezado con contexto, pasos numerados, RAISE NOTICE en cada paso, verificación final
- Todo cambio ejecutado en Supabase SQL Editor sin migración previa se considera deuda técnica y debe retroactivamente documentarse

**Si el usuario pide ejecutar SQL directamente**, Claude primero crea el archivo `.sql` en migrations/, luego da el SQL para ejecutar, nunca al revés.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
