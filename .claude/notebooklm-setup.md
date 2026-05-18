# NotebookLM-py — Integración con GYMsos

> **Proyecto**: GYMsos Operating System
> **Módulo**: Herramientas de Investigación y Generación de Contenido
> **Versión**: 1.0
> **Fecha**: 2026-05-18
> **Autor**: Eduardo Sebastian Paipay Vega

---

## ¿Qué es notebooklm-py?

`notebooklm-py` es una API Python no oficial para Google NotebookLM que permite
acceso programático completo, incluyendo funcionalidades no expuestas en la UI web.

**Repositorio**: https://github.com/teng-lin/notebooklm-py  
**PyPI**: `pip install notebooklm-py`  
**Versión instalada**: 0.4.1

---

## Instalación (ya completada)

```bash
# El paquete ya está instalado. Para reinstalar:
pip install notebooklm-py --break-system-packages

# El skill ya está instalado en:
# - User scope:    ~/.claude/skills/notebooklm/SKILL.md
# - Project scope: .claude/skills/notebooklm/SKILL.md
# - Agents scope:  .agents/skills/notebooklm/SKILL.md
```

---

## Autenticación (REQUERIDA antes de usar)

> ⚠️ Este paso requiere una sesión de navegador activa.

```bash
notebooklm login    # Abre el navegador para Google OAuth
notebooklm list     # Verifica que la autenticación funciona
notebooklm status   # Muestra el contexto activo
```

---

## Comandos Clave para GYMsos

### Investigación de mercado fitness

```bash
# Crear notebook de investigación
notebooklm create "GYMsos - Investigación: Mercado Fitness LAT"

# Agregar fuentes (URLs, PDFs, YouTube)
notebooklm source add "https://articulo-fitness.com"
notebooklm source add ./documento-investigacion.pdf

# Hacer preguntas al contenido
notebooklm ask "¿Cuáles son las principales tendencias de fitness en Latinoamérica?"
notebooklm ask "¿Qué problemas tienen los gimnasios con la retención de miembros?"

# Listar notebooks
notebooklm list
```

### Generación de contenido para inversores

```bash
# Generar podcast de pitch
notebooklm generate audio "Enfocarse en el problema de abandono y la solución de GYMsos"

# Generar presentación de slides
notebooklm generate slide-deck --format executive-overview

# Descargar como PPTX (funcionalidad no disponible en la UI web)
notebooklm download slide-deck ./pitch-gymsos.pptx --format pptx

# Generar quiz para evaluación de conocimiento del mercado
notebooklm generate quiz --difficulty hard

# Generar reporte de análisis
notebooklm generate report --format briefing-doc
notebooklm download report ./reporte-mercado.md
```

### Análisis de documentos del proyecto

```bash
# Cargar documentos de GYMsos a un notebook
notebooklm create "GYMsos - Análisis de Documentación"
notebooklm source add ./FASE\ 1\ \(Problemas\)/AGEN_1.md
notebooklm source add ./MANIFESTO_GYMSOS

# Hacer preguntas de análisis
notebooklm ask "Resume los principales problemas identificados"
notebooklm ask "¿Cuáles son los puntos más fuertes de la propuesta de valor?"
```

### Investigación web profunda

```bash
# Investigación rápida sobre competidores
notebooklm source add-research "software gestión gimnasios Latinoamérica 2026" --mode fast

# Investigación profunda (tarda 2-5 min, usa subagente)
notebooklm source add-research "fitness tech startups Latin America investment" --mode deep --no-wait
notebooklm research wait --import-all
```

---

## Comandos de Verificación

```bash
notebooklm --version      # Versión instalada
notebooklm doctor         # Estado del entorno
notebooklm auth check     # Verificar autenticación
notebooklm skill status   # Estado del skill instalado
```

---

## Archivos del Skill

| Archivo | Ruta |
|---------|------|
| SKILL.md (user) | `~/.claude/skills/notebooklm/SKILL.md` |
| SKILL.md (project) | `.claude/skills/notebooklm/SKILL.md` |
| SKILL.md (agents) | `.agents/skills/notebooklm/SKILL.md` |
| Config permisos | `.claude/settings.local.json` |

---

*Configurado automáticamente el 2026-05-18. Skill v0.4.1 de notebooklm-py.*
