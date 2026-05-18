# 📋 PROMPTS ESPECIALIZADOS — Instrucciones para Cada Fase

> **Versión**: 1.0  
> **Tipo**: Librería de prompts temáticos  
> **Propósito**: Proveer instrucciones precisas y detalladas para cada fase  
> **Fecha**: 2026-05-14

---

## FASE 1️⃣ — Análisis de Problemas

### 📌 Objetivo
Identificar, documentar y analizar exhaustivamente los problemas que el sistema resolverá.

### 📥 Entrada
- Nombre del proyecto
- Tipo de aplicación
- Industria
- Usuario principal
- Problema principal descrito
- Escala del problema
- Contexto actual

### 📤 Salida
- Documento: `FASE_1_PROBLEMAS_DETECTADOS.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase 1 (Problemas)\FASE_1_PROBLEMAS_DETECTADOS.md`
- **FORMATO**: Markdown (.md)
- JSON estructurado con problemas

### 🎯 Instrucciones Específicas

⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta Fase 1 (Problemas)

Basándote en los datos proporcionados, elabora un análisis profundo que incluya:

1. **Resumen Ejecutivo**
   - Definición clara del problema principal en 3-5 líneas
   - Impacto cuantificable (si es posible)

2. **Árbol de Problemas** (Mermaid)
   - Problema central en el tronco
   - Causas (raíces)
   - Efectos (ramas)

3. **Desglose de Problemáticas Detectadas**
   - Mínimo 5-7 problemas específicos
   - Para cada uno: descripción, impacto, usuarios afectados

4. **Análisis de Actores/Stakeholders**
   - Tabla de actores y sus dolores
   - Conflictos de intereses (si existen)

5. **Contexto Tecnológico Actual**
   - Herramientas/sistemas usados hoy
   - Limitaciones de sistemas actuales
   - Brecha de funcionalidad

6. **Justificación de la Necesidad**
   - ¿Por qué es urgente resolver esto?
   - Costos de no resolver el problema
   - Oportunidad de mercado

**Longitud**: 500-800 palabras, muy detallado

---

## FASE 2️⃣ — Propuesta de Valor

### 📌 Objetivo
Definir qué valor único aporta la solución propuesta.

### 📥 Entrada
- Nombre del proyecto
- Tipo de aplicación
- Diferenciación mencionada
- Objetivo principal

### 📤 Salida
- Documento: `FASE_2_VALOR_AGREGADO.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase 2 (Valor Agregado)\FASE_2_VALOR_AGREGADO.md`
- **FORMATO**: Markdown (.md)
- JSON estructurado con propuesta

### 🎯 Instrucciones Específicas

⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta Fase 2 (Valor Agregado)

Desarrolla una propuesta de valor completa que contenga:

1. **Propuesta de Valor Única (UVP)**
   - Frase única que resume por qué existe este producto
   - Formato: "[Para quién], [qué soluciona], [diferenciación]"

2. **Canvas de Propuesta de Valor** (Tabla)
   - Trabajos del cliente
   - Dolores específicos
   - Ganancias esperadas
   - Características de la solución
   - Aliviadores de dolor
   - Creadores de ganancia

3. **Beneficios Tangibles**
   - Mínimo 5 beneficios medibles
   - Cantidad/porcentaje si es posible
   - Tabla: Beneficio | Métrica | Valor

4. **Beneficios Intangibles**
   - Comodidad, satisfacción, seguridad, etc.

5. **Comparativa con Competencia/Alternativas**
   - Tabla: Característica | Tu Solución | Competidor | Competidor
   - Resaltar ventajas diferenciadoras

6. **Segmentos de Clientes**
   - Tipos de usuarios/empresas que se beneficiarían
   - Prioridad de cada segmento

7. **Mapa de Empatía** (por segmento principal)
   - Qué ve, qué oye, qué piensa, qué siente
   - Sus miedos, sus aspiraciones

**Longitud**: 600-900 palabras

---

## FASE 3️⃣ — Requisitos Funcionales y Casos de Uso

### 📌 Objetivo
Sistematizar el proyecto en funcionalidades, requisitos y flujos de usuario.

### 📥 Entrada
- Problemas detectados (Fase 1)
- Valor agregado (Fase 2)
- Diferenciación y objetivo

### 📤 Salida
- Documento: `FASE_3_REQUISITOS_CASOS_USO.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase 3 (RF -- CU)\FASE_3_REQUISITOS_CASOS_USO.md`
- **FORMATO**: Markdown (.md) con diagramas Mermaid embebidos
- Diagramas UML (Mermaid)
- Matriz de trazabilidad

### 🎯 Instrucciones Específicas

⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta Fase 3 (RF -- CU)

Crea una especificación técnica completa:

1. **Requisitos Funcionales**
   - Listar como RF-001, RF-002, etc.
   - Mínimo 15-20 requisitos
   - Formato: "El sistema debe [verbo] [acción] [resultado]"
   - Categorizar por módulo/área

2. **Requisitos No Funcionales**
   - Rendimiento (velocidad, capacidad)
   - Seguridad
   - Escalabilidad
   - Usabilidad
   - Disponibilidad

3. **Diagrama de Casos de Uso** (Mermaid)
   - Mostrar actores
   - Casos de uso principales (óvalos)
   - Relaciones (extend, include)

4. **Especificación Detallada de Casos de Uso** (mínimo 5-8)
   - ID: CU-001
   - Nombre
   - Actor principal
   - Precondiciones
   - Flujo normal (paso a paso)
   - Flujos alternativos
   - Postcondiciones
   - Excepciones

5. **Matriz de Trazabilidad**
   - Tabla: RF ↔ CU
   - Mostrar qué requisitos cubre cada caso de uso

6. **Módulos/Áreas Principales**
   - Lista de componentes lógicos
   - Responsabilidad de cada uno

7. **Actores del Sistema**
   - Tabla: Actor | Rol | Responsabilidades | Permisos

**Longitud**: 1000-1500 palabras + diagramas

---

## FASE 4️⃣ — Plan de Negocio

### 📌 Objetivo
Justificar económica, estratégica y comercialmente el proyecto.

### 📥 Entrada
- Requisitos y casos de uso (Fase 3)
- Valor agregado (Fase 2)
- Todo lo anterior

### 📤 Salida
- Documento: `FASE_4_PLAN_NEGOCIO.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase 4 (Plan de Negocio)\FASE_4_PLAN_NEGOCIO.md`
- **FORMATO**: Markdown (.md) con tablas embebidas
- Canvas de negocio
- Análisis económico

### 🎯 Instrucciones Específicas

⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta Fase 4 (Plan de Negocio)

Desarrolla un plan de negocio completo:

1. **Resumen Ejecutivo**
   - 10-15 líneas
   - Qué es, para quién, por qué es viable

2. **Business Model Canvas** (Tabla/Mermaid)
   - Socios
   - Actividades
   - Recursos
   - Propuesta de valor
   - Relaciones
   - Canales
   - Segmentos
   - Estructura de costos
   - Fuentes de ingresos

3. **Análisis de Mercado** (si aplica)
   - Tamaño del mercado
   - Crecimiento esperado
   - Tendencias
   - Competencia

4. **Modelo de Ingresos**
   - Opciones: SaaS, Licencia, Freemium, etc.
   - Precios propuestos
   - Proyección de clientes

5. **Análisis de Costos**
   - Desarrollo (horas × costo)
   - Infraestructura
   - Marketing
   - Operación
   - Total de inversión

6. **ROI y Proyecciones Financieras**
   - Tabla: Año 1, Año 2, Año 3
   - Ingresos, costos, ganancia
   - Break-even point

7. **MVP (Producto Mínimo Viable)**
   - Qué features incluir en versión 1.0
   - Qué postergarse

8. **Cronograma de Implementación**
   - Gantt chart en Markdown (ASCII)
   - Fases de desarrollo
   - Hitos

9. **Análisis de Riesgos**
   - Tabla: Riesgo | Probabilidad | Impacto | Mitigación

10. **Sostenibilidad a Largo Plazo**
    - Cómo mantener y crecer el proyecto
    - Evolución de producto

**Longitud**: 1200-1800 palabras + tablas

---

## FASE 5️⃣ — Base de Datos

### 📌 Objetivo
Diseñar la estructura completa de datos del sistema.

### 📥 Entrada
- Requisitos funcionales (Fase 3)
- Reglas de negocio (Fase 4)
- Actores y casos de uso

### 📤 Salida
- Documento: `FASE_5_BASE_DATOS.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase 5 (BD)\FASE_5_BASE_DATOS.md`
- **FORMATO**: Markdown (.md) con SQL embebido y diagramas Mermaid
- Modelo E-R (Mermaid)
- Scripts SQL

### 🎯 Instrucciones Específicas

⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta Fase 5 (BD)

Crea la arquitectura de datos completa:

1. **Diccionario de Datos**
   - Tabla: Tabla | Campo | Tipo | Restricción | Descripción
   - Mínimo 20-30 campos distribuidos en 5-8 tablas

2. **Modelo Entidad-Relación (Mermaid)**
   - Entidades (rectángulos)
   - Atributos
   - Relaciones (1:1, 1:N, M:N)
   - Cardinalidades

3. **Modelo Relacional Normalizado**
   - Primera Forma Normal (1FN)
   - Segunda Forma Normal (2FN)
   - Tercera Forma Normal (3FN)
   - Explicar decisiones de normalización

4. **Scripts DDL Completos**
   ```sql
   -- CREATE TABLE con:
   -- - Columnas y tipos
   -- - Constraints (PK, FK, UNIQUE, NOT NULL, CHECK)
   -- - Índices
   -- - Comentarios
   ```
   - Mínimo 5-8 tablas

5. **Índices y Optimizaciones**
   - Qué campos indexar y por qué
   - Índices compuestos
   - Índices únicos

6. **Políticas de Integridad**
   - Constraints de foreign key
   - Cascadas (ON DELETE, ON UPDATE)
   - Validaciones a nivel DB

7. **Procedimientos y Funciones** (si aplica)
   - Triggers de auditoría
   - Validaciones complejas
   - Cálculos automáticos

8. **Respaldos y Recuperación**
   - Estrategia de backup
   - Frecuencia
   - Punto de recuperación (RTO, RPO)

9. **Seguridad de Datos**
   - Roles y permisos
   - Encriptación
   - Auditoría

10. **Versionado del Esquema**
    - Cómo manejar cambios
    - Migraciones futuras

**Longitud**: 900-1200 palabras + scripts SQL

---

## FASE 6️⃣ — Diseño UX/UI

### 📌 Objetivo
Diseñar la experiencia e interfaz de usuario del sistema.

### 📥 Entrada
- Funcionalidades (Fase 3)
- Casos de uso (Fase 3)
- Base de datos (Fase 5)
- Requisitos no funcionales

### 📤 Salida
- Documento: `FASE_6_DISEÑO_UX_UI.md`
- **GUARDAR EN**: `C:\botas\Documentación__\Fase 6 (UX - IX)\FASE_6_DISEÑO_UX_UI.md`
- **FORMATO**: Markdown (.md) con descripciones y diagramas Mermaid
- Wireframes (descripciones)
- Flujos de usuario

### 🎯 Instrucciones Específicas

⚠️ **OBLIGATORIO**: El documento DEBE guardarse en `.md` en la carpeta Fase 6 (UX - IX)

Desarrolla el diseño UX/UI completo:

1. **Principios de Diseño UX**
   - 5-7 principios adoptados (usabilidad, accesibilidad, etc.)
   - Justificación de cada uno

2. **Arquitectura de Información**
   - Mapa de sitio (árbol de navegación)
   - Estructura lógica de páginas
   - Diagrama en Mermaid

3. **Flujos de Usuario** (User Flows)
   - Flujo 1: Usuarios nuevos (onboarding)
   - Flujo 2: Caso de uso principal
   - Flujo 3: Caso de uso secundario
   - Diagrama de decisiones para cada uno

4. **Wireframes Detallados** (descripciones textuales)
   
   **Pantalla: Dashboard Principal**
   - Header: [logo] [menú] [perfil]
   - Sidebar: navegación con 6 items
   - Contenido central: 4 cards con KPIs
   - Footer: [copyright]
   - Responsividad: breakpoints en 1200px, 768px, 480px
   
   (Mínimo 8-10 pantallas descritas)

5. **Guía de Estilos**
   - Paleta de colores (con códigos hexadecimales)
   - Tipografía (fuentes, tamaños, pesos)
   - Espaciado (margen, padding convenciones)
   - Componentes base (botones, inputs, cards)
   - Estados (hover, focus, disabled, error)

6. **Componentes Reutilizables**
   - Tabla: Componente | Uso | Estados | Variantes
   - Ejemplos: Button, Card, Modal, Form, Table

7. **Patrones de Interacción**
   - Validación de formularios
   - Confirmaciones
   - Notificaciones (toast, alerts)
   - Cargando y errores

8. **Accesibilidad (WCAG 2.1)**
   - Contraste de colores (AA mínimo)
   - Textos alternativos
   - Navegación por teclado
   - Etiquetas form

9. **Responsive Design**
   - Breakpoints: 1920px, 1200px, 768px, 480px, 320px
   - Adaptaciones para mobile
   - Touch targets (mínimo 44x44px)

10. **Prototipo de Navegación**
    - Cómo llega el usuario de la pantalla A a la B
    - Tabla de transiciones

11. **Testing de Usabilidad Planificado**
    - Qué probar
    - Con quién
    - Métricas

**Longitud**: 1200-1600 palabras + descripciones visuales

---

## 🔄 Flujo de Datos Entre Fases

```
FASE 1 → JSON con problemas
    ↓
FASE 2 → JSON con valor agregado
    ↓
CONSOLIDACIÓN → Documento unificado (1+2)
    ↓
FASE 3 → Requisitos + Casos de Uso (usa consolidación)
    ↓
FASE 4 → Plan de Negocio (usa Fase 3)
    ↓
FASE 5 → Base de Datos (usa Fase 3 + 4)
    ↓
FASE 6 → UX/UI (usa Fase 3 + 5)
```

---

## ✅ Control de Calidad Mínimo

Para cada fase:
- [ ] Documento generado en formato Markdown
- [ ] Extensión: dentro del rango esperado (500+ palabras)
- [ ] Secciones completas (sin "TODO" o "pendiente")
- [ ] Referencias internas consistentes
- [ ] Datos coherentes con fases anteriores
- [ ] Formato profesional (tablas, listas, encabezados claros)

---

*PROMPTS_ESPECIALIZADOS.md — Instrucciones detalladas por fase v1.0*
