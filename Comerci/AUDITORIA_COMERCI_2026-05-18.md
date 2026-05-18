# AUDITORÍA TÉCNICA Y ESTRATÉGICA — COMERCI

> **Tipo**: Auditoría de documentación pre-desarrollo
> **Proyecto**: Comerci — Sistema Inteligente de Gestión Financiera para MYPEs LATAM
> **Fecha**: 2026-05-18
> **Auditor**: Claude (AI Assistant — Cowork)
> **Alcance**: Fases 1–7 de la carpeta `Comerci/`
> **Estándar de referencia**: Documentación nivel unicornio ($1B+ startup), apto para desarrollo de software

---

## 📊 VEREDICTO GENERAL

| Dimensión | Calificación | Estado |
|-----------|-------------|--------|
| Claridad del problema (FASE 1) | 9.2/10 | ✅ EXCELENTE |
| Propuesta de valor (FASE 2) | 8.5/10 | ✅ SÓLIDA |
| Requisitos funcionales (FASE 3) | 8.0/10 | ✅ SÓLIDA |
| Plan de negocio (FASE 4) | 7.0/10 | 🟡 MEJORABLE |
| Base de datos (FASE 5) | 2.0/10 | 🔴 CRÍTICA — INCOMPLETA |
| Diseño UX/UI (FASE 6) | 2.0/10 | 🔴 CRÍTICA — INCOMPLETA |
| Arquitectura técnica (FASE 7) | 2.0/10 | 🔴 CRÍTICA — INCOMPLETA |
| **Promedio general** | **5.8/10** | **🟡 NO APTO para iniciar desarrollo** |

### Diagnóstico en una línea

> Las fases 1–4 tienen calidad de pitch deck Series A. Las fases 5–7 son **esqueletos vacíos** que bloquean completamente el inicio del desarrollo de software. Sin completarlas, cualquier equipo de ingeniería estará construyendo a ciegas.

---

## ✅ FORTALEZAS REALES (Lo que está bien y puede usarse YA)

### 1. Definición del problema (FASE 1) — Nivel unicornio ✅

La FASE 1 es el documento más fuerte del repositorio. Cumple con el estándar de empresas como Nubank, Konfío o Mercado Pago en sus documentos fundacionales:

- El árbol de causas-efectos está bien construido y es lógicamente coherente
- Las 5 capas del problema (fragmentación, ceguera, predicción, optimización, deuda) son específicas y accionables
- La sección de impacto psicológico es diferenciadora — pocas startups FinTech documentan el componente emocional con esta precisión
- La comparativa con soluciones existentes (QuickBooks, Xero, Wave) es honesta y correcta en sus argumentos estructurales
- El contexto regulatorio peruano (IGV, RUC, Yape/Plin) es auténtico y demuestra conocimiento real del mercado local

**Usable tal cual para**: pitch deck, conversación con inversores, descripción de producto para el equipo.

### 2. Propuesta de valor (FASE 2) — Sólida ✅

- El "gemelo financiero inteligente" es una metáfora poderosa y diferente
- El mockup del dashboard es realista y útil como primer wireframe conceptual
- Los "Aha Moments" están muy bien definidos — son directamente convertibles en criterios de diseño UX
- La segmentación en 3 niveles (desformalizados → formalizados → cooperativas B2B) es estratégicamente correcta
- La tabla comparativa con Excel/Contador/QuickBooks/Wave es honesta

**Usable tal cual para**: diseño de onboarding, definición de métricas de producto, briefing de diseño UX.

### 3. Requisitos funcionales (FASE 3) — Técnicamente usable ✅

- Los 26 RF están correctamente estructurados (actor, precondición, flujo, postcondición, prioridad, estimación)
- Las 14 RF clasificadas como CRÍTICA son correctas en su priorización
- Los 6 Casos de Uso tienen flujos alternativos — nivel de detalle adecuado para un BA o PM
- La matriz de trazabilidad RF ↔ CU es funcional
- Los 10 RNF cubren lo básico (performance, disponibilidad, seguridad, GDPR, PCI-DSS)

**Usable tal cual para**: planning de sprint, estimaciones de desarrollo, criterios de aceptación de QA.

---

## 🔴 BRECHAS CRÍTICAS (Lo que bloquea el desarrollo)

### BRECHA #1 — FASES 5, 6 y 7 son esqueletos vacíos

Este es el problema más grave de todo el repositorio. Las fases 5, 6 y 7 existen como plantilla de índice sin contenido real. Sin ellas, **ningún equipo de ingeniería puede comenzar a construir**.

**Lo que falta en FASE 5 (Base de Datos):**

```
❌ No hay ERD (diagrama Entidad-Relación)
❌ No hay DDL (scripts CREATE TABLE)
❌ No hay diccionario de datos con tipos de campo
❌ No hay definición de normalización (1NF, 2NF, 3NF)
❌ No hay estrategia de índices para queries críticos
❌ No hay política de particionado de datos (volumen 500K+ transacciones/mes)
❌ No hay esquema de encriptación a nivel de campo (datos bancarios)
❌ No hay estrategia de migración de esquema (versionado)
```

**Lo que falta en FASE 6 (UX/UI):**

```
❌ No hay wireframes reales (ni de baja fidelidad)
❌ No hay flujos de usuario dibujados
❌ No hay guía de estilos (colores, tipografía, espaciado)
❌ No hay mapa de sitio completo
❌ No hay definición de componentes reutilizables
❌ No hay criterios de accesibilidad (a11y) específicos
❌ No hay prototipo interactivo de ninguna pantalla
```

**Lo que falta en FASE 7 (Arquitectura):**

```
❌ No hay diagrama de arquitectura (ni monolito ni microservicios)
❌ No hay stack tecnológico decidido (Node.js vs Python vs Go, React vs Flutter, etc.)
❌ No hay contratos de API (endpoints, payloads, schemas)
❌ No hay plan de infraestructura cloud (AWS vs GCP vs Azure, regiones, CDN)
❌ No hay estrategia de CI/CD
❌ No hay plan de pruebas con herramientas específicas
❌ No hay decisión sobre bases de datos (PostgreSQL vs MySQL vs MongoDB)
❌ No hay estrategia de cola de mensajes para alertas en tiempo real
```

**Impacto**: Sin estas tres fases, el primer día de desarrollo termina con un equipo preguntándose "¿en qué base de datos guardamos esto?", "¿qué framework usamos?", "¿cómo luce la pantalla X?". Son preguntas que cuestan semanas de trabajo improductivo.

---

### BRECHA #2 — Riesgo técnico no resuelto: Integración Yape/Plin

El RF-002 (conectar Yape/Plin) está listado como CRÍTICA y estimado en 35 horas. Este supuesto tiene un problema fundamental:

**Yape** (operado por BCP — Banco de Crédito del Perú) **no tiene API pública documentada**. Lo mismo aplica para **Plin** (BBVA, Interbank, Scotiabank). La integración requiere:

1. Un acuerdo comercial formal con el banco emisor (proceso de 3–12 meses)
2. Cumplimiento regulatorio con la SBS (Superintendencia de Banca y Seguros)
3. Posiblemente una licencia de proveedor de servicios de pago (PSP)

Sin esto, el core value del producto (unificación de dinero fragmentado LATAM) se rompe para el 90% de los usuarios que tienen Yape. La estimación de 35 horas asume que la API existe y es accesible — ese supuesto no está validado en ningún documento.

**Mitigación recomendada**: Documentar en FASE 7 la estrategia de integración con bancos (alianza estratégica vs. scraping con consentimiento del usuario vs. Open Banking vía SBS) y el plan de contingencia si no hay API disponible en lanzamiento.

---

### BRECHA #3 — El modelo ML asume datos que no existen en el Día 0

Los RF-006, RF-009, RF-010, RF-012 asumen un modelo de ML entrenado con datos LATAM:

- RF-006: "Clasificación automática con precisión >92%"
- RF-009: "Aprende cuánto gasta POR DÍA"
- RF-010: "Proyecta dinero en 14 días"

Sin embargo, en el Día 0 del lanzamiento no hay datos de usuarios propios. Esto crea el **cold start problem**: ¿cómo clasifica y predice el sistema cuando un nuevo usuario entra por primera vez y tiene cero historial?

La documentación actual no responde:
- ¿Con qué datos se entrena el modelo inicial? (datos públicos de bancos peruanos, datasets externos, reglas manuales)
- ¿Cuántos días de historial mínimo necesita un usuario para que la predicción sea confiable?
- ¿Cuál es el fallback si hay insuficiente historial? (reglas determinísticas simples, promedio nacional, etc.)
- ¿Cómo se gestiona el reentrenamiento del modelo con datos de producción?

Este no es un detalle técnico menor — es el motor del producto. Debe estar en FASE 5 (datos de entrenamiento) y FASE 7 (pipeline de ML).

---

## 🟡 PROBLEMAS MODERADOS (Mejoras importantes pero no bloqueantes)

### 1. Estadísticas sin fuentes citables

La FASE 1 usa varios números que son plausibles pero no verificables:

| Estadística | Problema |
|------------|---------|
| "2.3 millones de MYPEs en Perú" | La cifra real es ~2M MYPEs (INEI 2023). Aceptable, pero citar fuente. |
| "89% usa Excel o papel" | Sin fuente. INEI/PRODUCE tienen datos pero hay que citarlos. |
| "Tasa de quiebra mes 4–6: 47%" | Sin fuente. Los datos reales de quiebra de MYPEs peruanas están en la SBS/SUNAT. |
| "Retención QuickBooks mes 3: 8%" | Dato muy específico, sin fuente. Citar encuesta o reporte sectorial. |
| "$18.7 mil millones en movimiento sin visibilidad" | Número muy preciso sin origen explicado. |

**Por qué importa**: En una reunión con inversores serios (YCombinator, a16z, Kaszek) o con un banco para la alianza de Yape, estos números serán cuestionados. Sin fuente, debilitan la credibilidad.

**Solución**: Agregar sección "Fuentes y Referencias" con links a INEI, PRODUCE, SBS, BID, CEPAL, o encuestas propias.

### 2. Proyecciones financieras FASE 4 — demasiado optimistas

Los números de la FASE 4 tienen problemas de credibilidad ante inversores sofisticados:

**LTV/CAC inconsistente**: El resumen ejecutivo dice "LTV/CAC 292:1 en Year 3" pero el cálculo detallado muestra 64:1. Hay una inconsistencia de 4.5x entre ambos. Los mejores SaaS del mundo (Salesforce, HubSpot) tienen LTV/CAC de 3–5x. Un 64:1 ya es extraordinario y requiere justificación muy sólida. Un 292:1 simplemente no es creíble sin evidencia.

**Crecimiento Year 2**: 460% (de 25K a 140K usuarios) en un mercado donde el CAC apenas se reduce. Para contexto, Nubank tardó 3 años en alcanzar 1M de usuarios con una estrategia de crédito sin tarifa — un diferenciador mucho más viral que un app de presupuesto.

**Margen operativo Year 1 del 41%**: El documento muestra Revenue $7.5M y OPEX $4.45M = +$3.05M profit en Year 1. Pero esto incluye $2M en marketing para adquirir 25K usuarios (CAC $80). Si el payback es 2.2 meses, los primeros usuarios generan revenue desde el mes 3. El modelo es matemáticamente posible, pero asume que los 25K usuarios se adquieren distribuidos desde el mes 1, no al final del año. Hay que modelar el flujo de caja mensual, no solo anual.

**Recomendación**: Presentar escenario base con proyecciones 40% más conservadoras. El escenario conservador (60% de proyección) ya está documentado — hacerlo el escenario base y el actual convertirlo en "upside".

### 3. Ausencia de estrategia de datos y privacidad

El producto maneja información bancaria extremadamente sensible. La FASE 3 menciona "PCI-DSS" y "AES-256" pero no hay ningún documento que defina:

- ¿Dónde se almacenan las credenciales bancarias? (¿Comerci las guarda o usa un tercero como Plaid/Belvo?)
- ¿Cuál es la política de retención de datos?
- ¿Cómo cumple con la Ley de Protección de Datos Personales de Perú (Ley 29733)?
- ¿Hay un Data Processing Agreement para cuando cooperativas accedan a datos de comerciantes?
- ¿Se venden "datos agregados a fintech/bancos" (Revenue stream #3 de FASE 4)? Esto requiere consentimiento explícito del usuario.

---

## 🟢 VALIDACIÓN DE LA INFORMACIÓN

### ¿Es válida la información para documentación de software?

**FASE 1 — Válida ✅**: Los problemas descritos son reales y verificables. La descripción de la economía informal peruana es precisa. La comparativa con QuickBooks/Wave es correcta en sus argumentos. Puede usarse directamente como insumo para diseño de producto.

**FASE 2 — Válida con matices 🟡**: El canvas de valor es sólido. Los "Aha Moments" son convertibles en criterios de aceptación UX. El mockup del dashboard es utilizable como primer brief para diseñadores. Los ROI (43x–251x) son cuestionables pero correctos en la dirección (el valor es real, la magnitud puede variar).

**FASE 3 — Válida para desarrollo ✅**: Los RF están en el formato correcto para ser importados a Jira/Linear/Notion como historias de usuario. Las estimaciones de horas (8h–60h por RF) son plausibles para un equipo senior. Los casos de uso tienen el nivel de detalle necesario para QA.

**FASE 4 — Parcialmente válida 🟡**: La estructura del Business Model Canvas es correcta. TAM/SAM/SOM están bien calculados. El modelo de revenue streams es estratégicamente sólido. Las proyecciones financieras específicas necesitan revisión por un CFO o analista financiero antes de presentarlas a inversores.

**FASES 5, 6, 7 — No válidas para desarrollo ❌**: Son plantillas vacías. No pueden usarse para comenzar el desarrollo.

---

## 🚀 PLAN DE ACCIÓN — Lo que debe hacerse ANTES de desarrollar

### Prioridad CRÍTICA (Bloquea todo lo demás)

**1. Completar FASE 5 — Base de Datos** _(estimado: 3–4 días de trabajo)_

El mínimo viable para iniciar desarrollo incluye:
- ERD con al menos 8 entidades: `users`, `businesses`, `accounts`, `transactions`, `categories`, `predictions`, `alerts`, `subscriptions`
- DDL (CREATE TABLE) con tipos de datos específicos, constraints, foreign keys
- Definición de índices para queries críticos (buscar transacciones por usuario + período)
- Decisión sobre el motor: PostgreSQL recomendado (soporte JSON, performance, LATAM adoption)

**2. Completar FASE 7 — Arquitectura Técnica** _(estimado: 2–3 días de trabajo)_

El mínimo viable para iniciar desarrollo incluye:
- Decisión de stack: Backend (Node.js + TypeScript o Python/FastAPI), Mobile (React Native o Flutter), DB (PostgreSQL + Redis para caché)
- Diagrama de arquitectura con los componentes: API Gateway → Service Layer → DB → ML Engine → Notification Service
- Contratos de los 10 endpoints principales (método HTTP, payload request, payload response)
- Estrategia de integración bancaria: decidir si usar Belvo, Plaid LATAM, o integración directa

**3. Resolver la estrategia de Yape/Plin** _(estimado: investigación de 1 semana)_

- Contactar a BCP y consultar acceso a API de Yape para startups FinTech
- Evaluar alternativa: **Belvo** (proveedor de Open Banking en LATAM, ya tiene integraciones con bancos peruanos)
- Definir plan de contingencia para lanzamiento sin integración Yape (solo banco + caja manual)

**4. Completar FASE 6 — UX/UI** _(estimado: 3–5 días con un diseñador)_

El mínimo viable para iniciar desarrollo incluye:
- Wireframes de baja fidelidad de las 5 pantallas críticas: Dashboard, Gastos, Predictor, Alertas, Onboarding
- Flujo de usuario completo (de descarga de app a primera vista del dashboard)
- Guía de estilos básica: paleta de colores, tipografía, tamaño de botones

### Prioridad ALTA (Mejora credibilidad y reduce riesgo)

**5. Agregar fuentes a las estadísticas de FASE 1** _(estimado: 1 día)_

Fuentes recomendadas: INEI (Encuesta Nacional de Hogares), PRODUCE (estadísticas MYPEs), SBS (información financiera), BID (Banco Interamericano de Desarrollo reportes MYPE), CEPAL.

**6. Revisar proyecciones financieras de FASE 4** _(estimado: 1 día)_

- Corregir inconsistencia LTV/CAC (292:1 vs 64:1)
- Agregar modelo de flujo de caja mensual (no solo anual)
- Hacer el escenario conservador el caso base

**7. Agregar sección de privacidad y compliance** _(estimado: 1 día)_

- Decisión sobre custodia de credenciales bancarias (propio vs tercero como Belvo)
- Mención explícita de Ley 29733 de Perú
- Política de datos para revenue stream de "venta de analytics"

---

## 📋 CHECKLIST DE READINESS PARA DESARROLLO

Antes de escribir la primera línea de código, esto debe estar completo:

```
Fase 1 — Problemas
[✅] Problema central definido
[✅] Árbol de causas documentado
[✅] Actores identificados
[⚠️] Estadísticas con fuentes citadas ← PENDIENTE

Fase 2 — Propuesta de valor
[✅] UVP definida
[✅] Canvas completo
[✅] Segmentos de clientes
[✅] Métricas de éxito (KPIs)
[⚠️] ROI verificado y conservador ← REVISAR

Fase 3 — Requisitos
[✅] RF con prioridades y estimaciones
[✅] RNF documentados
[✅] Casos de uso con flujos alternativos
[✅] Matriz de trazabilidad
[⚠️] Estrategia cold start ML ← FALTA

Fase 4 — Plan de Negocio
[✅] TAM/SAM/SOM
[✅] Business Model Canvas
[✅] Análisis de riesgos
[⚠️] Proyecciones financieras revisadas ← REVISAR
[⚠️] Estrategia Yape/Plin documentada ← CRÍTICO

Fase 5 — Base de Datos
[❌] ERD completo ← CRÍTICO
[❌] DDL scripts ← CRÍTICO
[❌] Diccionario de datos ← CRÍTICO
[❌] Política de backup ← FALTA

Fase 6 — UX/UI
[❌] Wireframes principales ← CRÍTICO
[❌] Flujos de usuario ← CRÍTICO
[❌] Guía de estilos ← FALTA

Fase 7 — Arquitectura
[❌] Stack tecnológico decidido ← CRÍTICO
[❌] Diagrama de arquitectura ← CRÍTICO
[❌] Contratos de API ← CRÍTICO
[❌] Plan de infraestructura cloud ← FALTA
[❌] Pipeline de ML ← CRÍTICO
```

**Estado actual: 14/27 ítems completos (52%)**

Para iniciar desarrollo con seguridad: se necesita **mínimo 22/27 (81%)**.

---

## 🏆 EVALUACIÓN FINAL

### ¿Tiene nivel de unicornio?

**Las fases 1–4: SÍ, tienen el nivel de claridad y ambición estratégica de documentación de startups que han llegado a Serie A** (Nubank, Konfío, Belvo, Pagali). La narrativa es poderosa, el problema está bien definido, y la propuesta de valor es diferenciadora.

**Las fases 5–7: NO.** Un unicornio tiene ingeniería de clase mundial desde el Día 1. Eso requiere arquitectura bien pensada antes de escribir código, no durante.

### ¿Es válida para empezar a crear el software?

**No todavía.** No porque la visión sea incorrecta — sino porque falta el puente entre la visión y la implementación. Las fases 5, 6 y 7 son ese puente. Iniciar desarrollo sin ellas generará:

- Rediseños costosos de la base de datos en producción
- Cambios de stack a mitad del desarrollo
- UX inconsistente que reduce retención
- Deuda técnica imposible de pagar en los primeros 12 meses críticos

### Próximo paso recomendado

Completar FASE 7 (Arquitectura) primero. Las decisiones de stack y arquitectura determinan la estructura de la base de datos (FASE 5) y condicionan las opciones de diseño UX (FASE 6). El orden correcto es: **Arquitectura → Base de datos → UX/UI → Desarrollo**.

---

*Auditoría generada el 2026-05-18. Repositorio: Comerci — Sistema Inteligente de Gestión Financiera para MYPEs LATAM.*
