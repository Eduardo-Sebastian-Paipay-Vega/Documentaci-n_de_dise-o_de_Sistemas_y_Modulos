# Plan de Negocio — Módulo de Software Multi-Tenant

> **Proyecto**: Sistema de Gestión Empresarial Multi-Tenant (SaaS)
> **Fase**: 4 — Plan de Negocio, Competitividad y Modelo de Monetización
> **Versión**: 1.0
> **Fecha**: 2026-05-13
> **Autor**: Eduardo Sebastian Paipay Vega
> **Universidad**: UNSCH — Universidad Nacional de San Cristóbal de Huamanga
> **Trazabilidad**: Fase 1 (AGEN_1) · Fase 2 (AGEN_2) · Fase 3 (AGEN_3)

---

## 0. FICHA EJECUTIVA DEL PLAN

| Campo | Valor |
|-------|-------|
| **Nombre del producto** | Sistema de Gestión Empresarial Multi-Tenant (SaaS) |
| **Problema central** | Las PYMEs y organizaciones en Ayacucho y regiones similares operan sin sistemas integrados, generando pérdida de datos, errores manuales, ineficiencia operativa y nula trazabilidad de procesos |
| **Propuesta de valor** | Software SaaS multi-tenant adaptado al contexto peruano regional, asequible, fácil de implementar y con soporte local, que permite a múltiples organizaciones operar desde una sola plataforma compartida y segura |
| **Modelo de negocio** | SaaS — Suscripción mensual/anual por planes |
| **Mercado objetivo** | PYMEs, cooperativas, instituciones educativas y organizaciones del sector público-privado en Ayacucho y regiones del sur del Perú |
| **Inversión estimada desarrollo** | S/. 85,000 — S/. 120,000 (MVP a versión comercial completa) |
| **Precio — Plan Básico** | S/. 120 / mes · S/. 1,200 / año |
| **Precio — Plan Estándar** | S/. 280 / mes · S/. 2,800 / año |
| **Precio — Plan Plus** | S/. 580 / mes · S/. 5,800 / año (o cotización enterprise) |
| **Break-even estimado** | 38 clientes activos (mix de planes) — Mes 10 |
| **ROI proyectado (12 meses)** | −18% (inversión en crecimiento) |
| **ROI proyectado (24 meses)** | +42% |
| **ROI proyectado (36 meses)** | +118% |

---

## 1. RESUMEN EJECUTIVO

El presente plan de negocio describe la estrategia comercial, financiera y operativa del **Sistema de Gestión Empresarial Multi-Tenant**, un producto de software como servicio (SaaS) diseñado para resolver la crítica fragmentación operativa que enfrentan las organizaciones pequeñas y medianas en Ayacucho, Perú, y regiones económicamente similares del país.

El modelo **multi-tenant** permite que múltiples organizaciones (tenants) utilicen simultáneamente la misma plataforma tecnológica, cada una con sus datos completamente aislados y seguros, sin necesidad de servidores propios, instalaciones locales ni equipos de TI internos. Esto reduce dramáticamente el costo de adopción frente a soluciones tradicionales.

El mercado objetivo identificado en la Fase 1 revela que el 73% de las PYMEs en regiones como Ayacucho opera con procesos manuales o semi-digitales, careciendo de integración entre áreas como ventas, inventario, finanzas, recursos humanos y atención al cliente. La Fase 2 identificó que los competidores actuales fallan en tres dimensiones críticas: precio inaccesible para el segmento regional, interfaces complejas que requieren especialistas para operar, y nula adaptación al contexto operativo peruano fuera de Lima.

El sistema se estructura en tres planes comerciales — **Básico, Estándar y Plus** — cada uno diseñado para un segmento específico de cliente, con módulos funcionales escalonados basados directamente en la priorización MoSCoW de la Fase 3.

La inversión total estimada para alcanzar la versión comercial completa (v1.0) es de **S/. 95,000**, con un punto de equilibrio proyectado en el mes 10 de operación comercial con 38 clientes activos. A 36 meses, el sistema proyecta un ARR (ingreso anual recurrente) de **S/. 312,000**, representando un ROI positivo de 118% sobre la inversión inicial.

---

## 2. ANÁLISIS DE MERCADO

### 2.1 Tamaño del Mercado

#### TAM — Mercado Total Disponible

Según el INEI (Censo Económico 2020 y proyecciones 2024), existen en Perú aproximadamente **1.7 millones de micro y pequeñas empresas formales**. De estas, el **11.2%** se ubica fuera de Lima Metropolitana en zonas con acceso digital creciente pero baja penetración de software de gestión empresarial.

El mercado total de software ERP/gestión empresarial en Perú movió aproximadamente **USD 180 millones en 2024** (fuente: IDC Latinoamérica, estimación para el segmento PYME), creciendo a una tasa del 14% anual impulsado por digitalización post-pandemia.

**TAM estimado: USD 180 millones / S/. 675 millones (mercado software gestión PYME Perú)**

#### SAM — Mercado Atendible

El SAM se limita a organizaciones con las siguientes características:
- Ubicadas en Ayacucho, Apurímac, Huancavelica, Puno, Cusco (sur andino)
- Con 3 a 150 empleados
- Con algún nivel de acceso a internet estable
- Con capacidad de pago mensual entre S/. 100 y S/. 600
- Sin solución tecnológica integrada formal

Estimación: **~12,000 organizaciones** en el radio geográfico inicial que cumplen estos criterios, con un valor de mercado anual de aproximadamente **S/. 28 millones**.

**SAM estimado: S/. 28 millones / año**

#### SOM — Mercado Obtenible

En los primeros 24 meses, con las capacidades actuales de equipo y marketing, es realista capturar entre el 0.5% y 1.2% del SAM:

- **Escenario conservador (0.5%)**: 60 clientes activos → S/. 252,000/año
- **Escenario base (0.8%)**: 96 clientes activos → S/. 403,200/año
- **Escenario optimista (1.2%)**: 144 clientes activos → S/. 604,800/año

**SOM objetivo (24 meses): 80-100 clientes activos → S/. 336,000-420,000/año**

---

### 2.2 Análisis de Competidores

#### Competidores directos en el mercado peruano

| Competidor | Tipo | Precio referencial | Fortalezas | Debilidades críticas |
|-----------|------|-------------------|-----------|---------------------|
| **SIGE** (Sistema Integral de Gestión Empresarial) | Software local peruano | S/. 350-800/mes | Adaptado a normativa SUNAT | Interfaz obsoleta; sin cloud nativo; soporte deficiente en regiones |
| **Alegra** | SaaS latinoamericano | S/. 99-299/mes | Simple, bien diseñado | Solo facturación y contabilidad; sin módulos operativos |
| **Defontana** | SaaS Chile/Perú | S/. 400-1,200/mes | Completo, robusto | Precio prohibitivo para PYMEs regionales; sin soporte local |
| **SAP Business One** | ERP enterprise | USD 1,500-5,000/mes | Muy completo | Inaccesible en precio y complejidad para el segmento objetivo |
| **Sistemas locales artesanales** | Software a medida | S/. 500-2,000 único | Personalizado | Sin mantenimiento, sin actualizaciones, sin nube, riesgo de abandono |
| **Excel + WhatsApp** | Sin sistema | S/. 0 | Conocido | Nula trazabilidad, propenso a errores, no escala |

#### Mapa de posicionamiento

```
PRECIO ALTO
     |
SAP  |
     |                    Defontana
     |          SIGE
     |
     |    [NUESTRO SISTEMA - PLUS]
     |
     |    [NUESTRO SISTEMA - ESTÁNDAR]    Alegra
     |
     |    [NUESTRO SISTEMA - BÁSICO]
     |
     +---------------------------------> FUNCIONALIDAD
 PRECIO  BÁSICA              COMPLETA
  BAJO
```

**Conclusión del mapa**: Existe un espacio estratégico claro entre Alegra (barato pero limitado) y SIGE/Defontana (funcional pero caro e inaccesible), donde nuestro sistema puede posicionarse con funcionalidad completa a precio accesible y con soporte local.

---

### 2.3 Análisis de las 5 Fuerzas de Porter

**1. Amenaza de nuevos entrantes: MEDIA**
La barrera de entrada al mercado SaaS regional es media. Desarrollar un MVP funcional requiere inversión de S/. 40,000-80,000 y 4-8 meses, lo cual es accesible para equipos pequeños. Sin embargo, la ventaja de tener ya los primeros clientes, la base de datos de conocimiento y el soporte local genera una barrera de switching cost para los clientes una vez adoptada la solución.

**2. Poder de negociación de clientes: MEDIA-ALTA**
Los clientes del segmento PYME regional son sensibles al precio y tienen acceso creciente a alternativas. Sin embargo, una vez implementado el sistema y migrados sus datos, el costo de cambio es alto (tiempo de capacitación, pérdida de historial, riesgo operativo). La estrategia es aumentar este switching cost a través de integraciones profundas, almacenamiento de datos históricos y workflows críticos del negocio.

**3. Poder de negociación de proveedores: BAJA**
Los proveedores clave (AWS, GitHub, herramientas de desarrollo) operan en mercados altamente competitivos con precios regulados y contratos transparentes. El riesgo de dependencia existe con AWS, mitigable con arquitectura cloud-agnostic.

**4. Amenaza de productos sustitutos: ALTA**
El principal sustituto es la no-solución: Excel, WhatsApp y procesos manuales. Está profundamente arraigado por costo cero percibido y curva de aprendizaje ya superada. La estrategia de mitigación es demostrar ROI concreto en los primeros 60 días de uso.

**5. Rivalidad entre competidores existentes: MEDIA**
El segmento regional específico (Ayacucho y sur andino) está relativamente desatendido por los grandes jugadores nacionales. La rivalidad es menor en este nicho geográfico, aunque puede intensificarse si el mercado crece visiblemente.

---

### 2.4 Tendencias del Mercado 2024-2027

- **Digitalización de PYMEs**: El gobierno peruano, a través de PRODUCE y Reactiva Digital, está financiando programas de digitalización para 100,000 PYMEs al 2026, generando demanda inducida de herramientas como la propuesta.
- **Adopción de cloud en regiones**: El acceso a internet de banda ancha en ciudades del interior del Perú creció 34% entre 2021-2024 (OSIPTEL), eliminando la principal barrera técnica de acceso.
- **IA y automatización**: La integración de IA para automatizar tareas repetitivas (clasificación de gastos, alertas predictivas de stock, reportes automáticos) se convierte en diferenciador clave en el horizonte 2025-2027.
- **Regulación SUNAT**: La obligatoriedad progresiva de facturación electrónica y reportes digitales impulsa la demanda de sistemas integrados con capacidad de cumplimiento normativo.
- **Financiamiento disponible**: Startup Perú (CONCYTEC), fondos FIDECOM y cooperación internacional (BID, CAF) financian proyectos de innovación digital con énfasis en regiones.

---

## 3. MODELO DE NEGOCIO CANVAS

### 3.1 Segmentos de Clientes

| Segmento | Descripción | Tamaño estimado (SAM) | Plan recomendado |
|---------|------------|----------------------|-----------------|
| **A — Microempresa formal** | Negocio de 1-10 empleados, tienda, servicios básicos, formalizada con RUC. Primer contacto con software. | ~6,500 orgs | Plan Básico |
| **B — PYME operativa** | Empresa de 10-50 empleados, múltiples áreas, ya usa Excel o sistema básico, quiere ordenar procesos. | ~4,200 orgs | Plan Estándar |
| **C — Organización compleja** | Cooperativa, institución educativa, ONG grande, empresa con sucursales. Necesita multi-sede y reportes gerenciales. | ~1,300 orgs | Plan Plus |

### 3.2 Propuesta de Valor

- **Para Segmento A**: "Por menos del costo de un trabajador medio tiempo, tendrás orden total en tu negocio desde el primer día."
- **Para Segmento B**: "Integra tus áreas, elimina el Excel y toma decisiones con datos reales, no suposiciones."
- **Para Segmento C**: "Gestiona múltiples sedes, equipos y proyectos desde una sola plataforma, con reportes ejecutivos en tiempo real."

### 3.3 Fuentes de Ingresos

| Fuente | Tipo | Participación estimada (Y2) |
|--------|------|---------------------------|
| Suscripciones mensuales (3 planes) | Recurrente | 72% |
| Suscripciones anuales (descuento 2 meses) | Recurrente | 15% |
| Implementación y configuración inicial | Único | 7% |
| Capacitación adicional | Servicio | 4% |
| Módulos add-on | Recurrente | 2% |

### 3.4 Estructura de Costos (Operación mensual en régimen)

| Concepto | Costo mensual estimado |
|---------|----------------------|
| Equipo técnico (2 devs + 1 soporte) | S/. 7,500 |
| Infraestructura cloud (AWS/GCP) | S/. 1,200 |
| Marketing y ventas | S/. 1,500 |
| Herramientas y licencias | S/. 300 |
| Administración y legal | S/. 500 |
| **Total costo operativo mensual** | **S/. 11,000** |

---

## 4. ESTRUCTURA DE PLANES Y PRECIOS DEL MÓDULO TENANT

> Esta sección define los tres planes comerciales del sistema multi-tenant, con los módulos incluidos en cada nivel. Los módulos corresponden directamente a los Requisitos Funcionales y Épicas definidos en la Fase 3 (AGEN_3).

---

### 4.1 Filosofía de Pricing

El precio de cada plan está calculado usando una estrategia **híbrida**:

- **Value-based**: El precio refleja el ahorro real que genera al cliente. Una PYME con 10 empleados que elimina 2 horas diarias de trabajo manual ahorra ~S/. 1,800/mes en tiempo productivo. El Plan Básico a S/. 120/mes representa apenas el 6.7% de ese ahorro.
- **Competitive-based**: Los precios están posicionados por debajo de SIGE y Defontana (accesibilidad) y por encima de Alegra (funcionalidad superior).
- **Escalonado por módulos**: Cada plan agrega módulos funcionales reales definidos en los RF de Fase 3, creando una progresión de valor clara y verificable.

**Conversión de moneda de referencia**: Todos los precios en Soles (S/.) basados en tipo de cambio referencial S/. 3.75 por USD.

---

### 🟢 PLAN BÁSICO — "Esencial"

**Precio mensual:** S/. 120 / mes
**Precio anual:** S/. 1,200 / año *(equivale a 10 meses — 2 meses gratis)*
**Precio por usuario adicional:** S/. 15 / usuario / mes (sobre el límite base)

**Perfil del cliente objetivo:**
Microempresa formal de 1 a 10 empleados. Primera experiencia con software de gestión. Necesita digitalizar lo básico: clientes, productos, ventas y facturación. Presupuesto ajustado, busca simplicidad ante todo.

---

#### Módulos Funcionales Incluidos

| # | Módulo | Descripción | Usuarios habilitados |
|---|--------|-------------|---------------------|
| 1 | **Gestión de Clientes (CRM básico)** | Registro, historial de compras, datos de contacto, seguimiento básico | Todos |
| 2 | **Gestión de Productos / Catálogo** | Alta, edición y baja de productos. Categorías. Precios. Fotos. | Admin + Ventas |
| 3 | **Control de Inventario simple** | Stock actual, alertas de stock mínimo, movimientos de entrada/salida | Admin |
| 4 | **Registro de Ventas** | Emisión de cotizaciones, pedidos y ventas. Historial por cliente. | Ventas |
| 5 | **Facturación electrónica básica** | Emisión de facturas y boletas electrónicas (integrado SUNAT) | Admin + Ventas |
| 6 | **Caja diaria** | Apertura/cierre de caja, registro de ingresos/egresos del día | Admin |
| 7 | **Reportes básicos** | Reporte de ventas del día/semana/mes. Top productos. Top clientes. | Admin |
| 8 | **Gestión de usuarios** | Creación de hasta 3 usuarios con roles básicos (Admin, Ventas) | Admin |
| 9 | **Panel de tenant** | Configuración del perfil de la organización, logo, datos de empresa | Admin |
| 10 | **Soporte por email** | Tickets de soporte con tiempo de respuesta de 48 horas hábiles | Admin |

#### Límites Técnicos del Plan Básico

| Límite | Valor |
|--------|-------|
| Usuarios incluidos | 3 usuarios |
| Almacenamiento de datos | 2 GB por tenant |
| Registros de productos | Hasta 500 productos |
| Registros de clientes | Hasta 1,000 clientes |
| Facturas / mes | Hasta 200 documentos electrónicos / mes |
| Multi-sede | No (1 sede) |
| Acceso a API | No |
| Exportación de datos | CSV básico |
| Backup automático | Diario |
| Uptime garantizado | 99.0% (sin SLA formal) |

#### Lo que NO incluye el Plan Básico

- ❌ Gestión de recursos humanos y planillas
- ❌ Módulo de compras y proveedores
- ❌ Contabilidad y estados financieros
- ❌ Gestión de proyectos o contratos
- ❌ Reportes avanzados y Business Intelligence
- ❌ Integración con sistemas externos (ERP, contabilidad)
- ❌ Acceso a API REST para desarrolladores
- ❌ Multi-sede o multi-sucursal
- ❌ Soporte prioritario y gerente de cuenta

#### Servicios de Onboarding (Plan Básico)

- 2 horas de capacitación inicial remota (videollamada)
- Configuración básica del tenant incluida
- Acceso a base de conocimiento y tutoriales en video
- Importación de hasta 200 productos desde Excel (asistida)

---

### 🔵 PLAN ESTÁNDAR — "Profesional"

**Precio mensual:** S/. 280 / mes
**Precio anual:** S/. 2,800 / año *(equivale a 10 meses — 2 meses gratis)*
**Precio por usuario adicional:** S/. 20 / usuario / mes (sobre el límite base)

**Perfil del cliente objetivo:**
PYME de 10 a 50 empleados con múltiples áreas operativas. Ya tiene cierta experiencia digital. Necesita integrar ventas, inventario, compras, recursos humanos y finanzas en un solo sistema. Quiere reportes para tomar decisiones con datos.

---

#### Módulos Funcionales Incluidos

| # | Módulo | Descripción | Usuarios habilitados |
|---|--------|-------------|---------------------|
| 1-10 | **Todo el Plan Básico** | Todos los módulos del plan anterior | Todos |
| 11 | **Gestión de Compras y Proveedores** | Órdenes de compra, recepción de mercancía, historial de proveedores, valorización de inventario | Admin + Compras |
| 12 | **Gestión de Recursos Humanos** | Ficha de empleados, asistencia, vacaciones, documentos del personal | RRHH + Admin |
| 13 | **Planilla básica** | Cálculo de sueldos, descuentos, gratificaciones (según LFT peruana) | Admin + RRHH |
| 14 | **Gestión de Almacenes** | Multi-almacén, transferencias entre almacenes, auditoría de stock | Almacén + Admin |
| 15 | **Módulo de Cobranzas** | Cuentas por cobrar, estado de cuenta por cliente, recordatorios de pago | Admin + Ventas |
| 16 | **Módulo de Pagos** | Cuentas por pagar, programación de pagos a proveedores | Admin + Finanzas |
| 17 | **Contabilidad básica** | Registro de asientos, plan de cuentas PCGE peruano, libro diario/mayor | Contabilidad |
| 18 | **Reportes avanzados** | Dashboard gerencial, análisis de rentabilidad, flujo de caja, márgenes | Admin + Gerencia |
| 19 | **Gestión de documentos** | Almacenamiento de contratos, facturas recibidas, documentos del negocio | Todos (por rol) |
| 20 | **Notificaciones y alertas** | Alertas de stock crítico, vencimientos de contratos, cuotas por cobrar | Configurable por rol |
| 21 | **Exportación avanzada** | Excel, PDF, reportes programados por email | Admin + Gerencia |
| 22 | **Soporte Chat** | Chat en vivo durante horario de atención (Lun-Vie 8am-6pm) — respuesta < 24h | Admin |

#### Límites Técnicos del Plan Estándar

| Límite | Valor |
|--------|-------|
| Usuarios incluidos | 10 usuarios |
| Almacenamiento de datos | 10 GB por tenant |
| Registros de productos | Ilimitados |
| Registros de clientes | Ilimitados |
| Facturas / mes | Hasta 1,000 documentos electrónicos / mes |
| Multi-sede | No (1 sede, múltiples almacenes) |
| Acceso a API | Parcial (lectura de datos) |
| Exportación de datos | Excel + PDF + CSV |
| Backup automático | Diario + respaldo semanal |
| Uptime garantizado | 99.5% (sin SLA formal) |

#### Lo que NO incluye el Plan Estándar

- ❌ Multi-tenant / multi-sede (múltiples organizaciones bajo un mismo tenant)
- ❌ BI avanzado y dashboards ejecutivos personalizables
- ❌ Integración con ERP o CRM externo mediante API completa
- ❌ Gestión de proyectos con cronogramas y asignación de recursos
- ❌ Módulo de activos fijos y depreciación
- ❌ Soporte telefónico y gerente de cuenta dedicado
- ❌ SLA formal con penalidades
- ❌ Auditoría de seguridad incluida
- ❌ Personalización de marca (white-label)

#### Servicios de Onboarding (Plan Estándar)

- 6 horas de capacitación inicial (remota o presencial en Ayacucho)
- Configuración completa del tenant (usuarios, roles, catálogos)
- Migración de datos desde sistema anterior o Excel (hasta 2,000 registros)
- 30 días de soporte intensivo post-implementación
- Manual de usuario personalizado (PDF)

---

### 🟣 PLAN PLUS — "Empresarial"

**Precio mensual:** S/. 580 / mes
**Precio anual:** S/. 5,800 / año *(equivale a 10 meses — 2 meses gratis)*
**Precio enterprise (organizaciones >100 empleados):** Cotización personalizada

**Perfil del cliente objetivo:**
Organización compleja de 50 a 300+ empleados: cooperativas agroindustriales, instituciones educativas privadas, ONG con múltiples proyectos, empresas con varias sucursales. Necesita multi-tenant (gestionar múltiples unidades bajo una sola licencia), reportes ejecutivos, integración con otros sistemas y soporte dedicado.

---

#### Módulos Funcionales Incluidos

| # | Módulo | Descripción | Usuarios habilitados |
|---|--------|-------------|---------------------|
| 1-22 | **Todo el Plan Estándar** | Todos los módulos del plan anterior | Todos |
| 23 | **Multi-tenant / Multi-sede** | Gestión de hasta 5 sedes u organizaciones bajo una sola suscripción, con datos aislados por tenant | Super-Admin |
| 24 | **Business Intelligence (BI)** | Dashboards ejecutivos personalizables, KPIs configurables, comparativas entre periodos y sedes | Gerencia |
| 25 | **Gestión de Proyectos** | Proyectos, tareas, cronogramas, asignación de recursos, seguimiento de avance y presupuesto | Gerencia + Equipos |
| 26 | **Gestión de Activos Fijos** | Registro de activos, depreciación automática (método lineal/acelerado), baja de activos | Finanzas + Admin |
| 27 | **Módulo de Contratos** | Gestión de contratos con clientes y proveedores, alertas de vencimiento, renovaciones | Legal + Admin |
| 28 | **API REST Completa** | Acceso completo a todos los endpoints del sistema para integraciones personalizadas | TI / Desarrolladores |
| 29 | **Integraciones nativas** | Conector con plataformas contables (Contasis, Concar), SUNAT, entidades bancarias | Admin + Finanzas |
| 30 | **Módulo de Auditoría** | Log completo de todas las acciones del sistema por usuario, exportable, inmutable | Super-Admin |
| 31 | **Personalización de marca** | Logo propio en el sistema, colores corporativos, dominio personalizado (white-label parcial) | Super-Admin |
| 32 | **Soporte prioritario** | Email + Chat + Teléfono dedicado. Tiempo de respuesta garantizado < 4 horas | Todos |
| 33 | **Gerente de cuenta dedicado** | Punto de contacto personal asignado, revisiones mensuales de uso y evolución del sistema | Admin Principal |
| 34 | **Capacitación continua** | 2 sesiones mensuales de capacitación para nuevos usuarios o nuevas funcionalidades | Todos |
| 35 | **Auditoría de seguridad anual** | Revisión anual de configuración de seguridad, permisos y accesos del sistema | Super-Admin |

#### Límites Técnicos del Plan Plus

| Límite | Valor |
|--------|-------|
| Usuarios incluidos | 30 usuarios |
| Almacenamiento de datos | 50 GB por tenant principal |
| Registros en todas las entidades | Ilimitados |
| Facturas / mes | Ilimitadas |
| Tenants / sedes | Hasta 5 tenants bajo un plan (adicionales a negociar) |
| Acceso a API | Completo (lectura y escritura) |
| Exportación de datos | Todos los formatos + programación automática |
| Backup automático | Diario + semanal + mensual en almacenamiento separado |
| Uptime garantizado | 99.9% **con SLA formal** y créditos por incumplimiento |

#### Servicios de Onboarding (Plan Plus)

- 20 horas de implementación asistida (presencial en Ayacucho o remota estructurada)
- Levantamiento de procesos actual y parametrización del sistema a medida
- Migración completa de datos históricos
- Capacitación diferenciada por rol (gerentes, operativos, contabilidad)
- Manual de administrador y manual de usuario final personalizados
- Período de estabilización de 60 días con soporte intensivo

---

### 4.2 Tabla Comparativa Completa de Planes

| Característica | 🟢 Básico | 🔵 Estándar | 🟣 Plus |
|----------------|:---------:|:-----------:|:------:|
| **Precio / mes** | **S/. 120** | **S/. 280** | **S/. 580** |
| **Precio / año** | **S/. 1,200** | **S/. 2,800** | **S/. 5,800** |
| **Usuarios incluidos** | 3 | 10 | 30 |
| **Almacenamiento** | 2 GB | 10 GB | 50 GB |
| Gestión de clientes (CRM básico) | ✅ | ✅ | ✅ |
| Catálogo de productos | ✅ | ✅ | ✅ |
| Control de inventario | ✅ | ✅ | ✅ |
| Registro de ventas | ✅ | ✅ | ✅ |
| Facturación electrónica SUNAT | ✅ | ✅ | ✅ |
| Caja diaria | ✅ | ✅ | ✅ |
| Reportes básicos | ✅ | ✅ | ✅ |
| Gestión de compras y proveedores | ❌ | ✅ | ✅ |
| Recursos humanos y planilla | ❌ | ✅ | ✅ |
| Multi-almacén | ❌ | ✅ | ✅ |
| Cuentas por cobrar / pagar | ❌ | ✅ | ✅ |
| Contabilidad básica (PCGE) | ❌ | ✅ | ✅ |
| Reportes avanzados y dashboard | ❌ | ✅ | ✅ |
| Notificaciones y alertas | ❌ | ✅ | ✅ |
| Multi-tenant / Multi-sede | ❌ | ❌ | ✅ |
| Business Intelligence (BI) | ❌ | ❌ | ✅ |
| Gestión de proyectos | ❌ | ❌ | ✅ |
| Gestión de activos fijos | ❌ | ❌ | ✅ |
| Módulo de contratos | ❌ | ❌ | ✅ |
| API REST completa | ❌ | Parcial | ✅ |
| Integraciones nativas | ❌ | ❌ | ✅ |
| Módulo de auditoría completa | ❌ | ❌ | ✅ |
| Personalización de marca | ❌ | ❌ | ✅ |
| Soporte | Email 48h | Chat 24h | Teléfono 4h |
| SLA garantizado | ❌ | ❌ | ✅ (99.9%) |
| Gerente de cuenta | ❌ | ❌ | ✅ |
| Auditoría de seguridad anual | ❌ | ❌ | ✅ |
| Horas de onboarding | 2h | 6h | 20h |
| **Recomendado para** | Microempresas 1-10 emp. | PYMEs 10-50 emp. | Grandes orgs. 50+ emp. |

---

### 4.3 Servicios Adicionales (Add-ons disponibles)

| Servicio | Precio | Descripción |
|---------|--------|-------------|
| Usuario adicional | S/. 15-20 / usuario / mes | Por encima del límite del plan |
| Almacenamiento extra | S/. 10 / 5 GB / mes | Para planes Básico y Estándar |
| Módulo de e-commerce | S/. 80 / mes | Tienda online conectada al inventario |
| Módulo de delivery | S/. 60 / mes | Gestión de repartos y seguimiento de pedidos |
| Sede adicional (Plan Plus) | S/. 150 / sede / mes | Tenants adicionales sobre los 5 incluidos |
| Soporte premium puntual | S/. 35 / hora | Para Planes Básico/Estándar que necesitan asistencia urgente |
| Migración de datos | S/. 200 - S/. 800 único | Según volumen y complejidad |
| Capacitación adicional | S/. 80 / hora | Sesiones de entrenamiento a demanda |
| Integración personalizada | S/. 500 - S/. 2,000 único | Conector con sistema específico del cliente |
| Backup bajo demanda | S/. 20 / respaldo | Respaldo manual con entrega de archivo |

---

### 4.2 — Mapa de Stakeholders, Actores del Sistema y Roles

> Esta sección identifica a todos los actores que interactúan con el sistema, ya sea como
> usuarios directos, beneficiarios indirectos o reguladores externos. Sirve como base para
> el diseño de roles, permisos y experiencias diferenciadas en las Fases 5 y 6.

---

#### 4.2.1 Clasificación de Stakeholders

Los stakeholders del sistema se dividen en tres categorías principales:

```
STAKEHOLDERS DEL SISTEMA MULTI-TENANT
│
├── INTERNOS DEL TENANT (usuarios directos del sistema)
│   ├── Dueño / Owner
│   ├── Administrador
│   ├── Supervisores / Coordinadores
│   ├── Operadores / Trabajadores
│   └── Auditores internos
│
├── EXTERNOS AL TENANT (relacionados al negocio del cliente)
│   ├── Clientes finales del tenant (portal de cliente, si aplica)
│   ├── Proveedores (gestión de compras)
│   └── Socios / Partners del tenant
│
└── REGULADORES / CONTEXTO (no usan el sistema, pero condicionan su diseño)
    ├── SUNAT (facturación electrónica)
    ├── INDECOPI / Ley 29733 (privacidad de datos)
    ├── Entidades bancarias (pasarelas de pago)
    └── Entes auditores externos (contadores, revisores)
```

---

#### 4.2.2 Ficha de Stakeholders Internos del Tenant

Estos son los actores que tienen cuenta y acceso activo dentro del sistema.

---

**STAKEHOLDER 1 — DUEÑO / OWNER DEL TENANT**

| Campo | Descripción |
|-------|-------------|
| **Quién es** | Persona natural o jurídica que contrató el plan SaaS. Máxima autoridad del tenant. |
| **Motivación** | Ver el estado general del negocio, controlar costos, administrar usuarios y el plan contratado. |
| **Uso típico** | Ingresa 2-3 veces por semana para revisar indicadores, aprobar decisiones estratégicas y gestionar facturación. |
| **Dolor principal** | No tener visibilidad real del negocio sin depender de reportes manuales de otros. |
| **Expectativa del sistema** | Panel ejecutivo limpio, KPIs clave en portada, acceso total sin restricciones, control de usuarios y billing. |
| **Nivel técnico** | Variable: puede ser un empresario con nivel digital básico o un gerente técnico. El sistema debe adaptarse a ambos. |

---

**STAKEHOLDER 2 — ADMINISTRADOR DEL TENANT**

| Campo | Descripción |
|-------|-------------|
| **Quién es** | Empleado de confianza del dueño. Opera el sistema diariamente. Puede ser gerente, jefe de operaciones o encargado general. |
| **Motivación** | Gestionar todas las áreas operativas del negocio con información centralizada y procesos ordenados. |
| **Uso típico** | Uso intensivo diario: crea usuarios, aprueba operaciones, genera reportes, supervisa módulos. |
| **Dolor principal** | Actualmente usa múltiples herramientas desconectadas (Excel, WhatsApp, cuadernos). |
| **Expectativa del sistema** | Acceso a todos los módulos operativos, cola de aprobaciones visible al inicio del día, reportes exportables. |
| **Nivel técnico** | Medio. Maneja herramientas digitales básicas, aprende rápido si la interfaz es intuitiva. |

---

**STAKEHOLDER 3 — SUPERVISOR / COORDINADOR DE ÁREA**

| Campo | Descripción |
|-------|-------------|
| **Quién es** | Jefe de un área específica: ventas, logística, producción, RRHH, finanzas, según el rubro del tenant. |
| **Motivación** | Gestionar a su equipo, ver el desempeño de su área y coordinar actividades. |
| **Uso típico** | Diario moderado: revisa su área, aprueba o rechaza solicitudes de su equipo, genera reportes de área. |
| **Dolor principal** | Falta de visibilidad de lo que hace su equipo en tiempo real. |
| **Expectativa del sistema** | Vista de su área con KPIs propios, lista de tareas del equipo, aprobaciones de su nivel. |
| **Nivel técnico** | Medio. Familiarizado con herramientas de gestión básicas. |

---

**STAKEHOLDER 4 — OPERADOR / TRABAJADOR**

| Campo | Descripción |
|-------|-------------|
| **Quién es** | Empleado operativo: vendedor, cajero, almacenero, asistente, voluntario, auxiliar. |
| **Motivación** | Completar sus tareas del día de forma rápida y sin errores. No le interesa la visión global del negocio. |
| **Uso típico** | Uso frecuente pero acotado: registra ventas, mueve inventario, marca asistencias, sube documentos. |
| **Dolor principal** | Interfaces complejas que lo ralentizan. Preferiría hacer su tarea en 3 pasos. |
| **Expectativa del sistema** | Flujos simples, acceso solo a lo que necesita, feedback inmediato de sus acciones. |
| **Nivel técnico** | Básico. Puede ser su primera experiencia con software de gestión empresarial. |

---

**STAKEHOLDER 5 — AUDITOR INTERNO**

| Campo | Descripción |
|-------|-------------|
| **Quién es** | Contador, revisor de cumplimiento o asesor externo con acceso de solo lectura a la bitácora y reportes financieros. |
| **Motivación** | Verificar que las operaciones del negocio cumplan con normativas internas y legales. |
| **Uso típico** | Eventual: auditorías periódicas, revisiones de fin de mes o ante incidentes. |
| **Dolor principal** | No tener un registro trazable y exportable de quién hizo qué y cuándo. |
| **Expectativa del sistema** | Bitácora completa e inmutable, reportes exportables en PDF/Excel, filtros por fecha/usuario/módulo. |
| **Nivel técnico** | Medio-alto. Habituado a trabajar con datos y reportes. |

---

#### 4.2.3 Stakeholders Externos al Tenant

Estos actores no usan el sistema directamente pero interactúan con él de forma indirecta.

| Stakeholder | Relación con el sistema | Implicancia de diseño |
|-------------|------------------------|-----------------------|
| **Clientes finales del tenant** | Pueden recibir notificaciones, facturas o acceder a un portal básico de seguimiento de pedidos | Vistas públicas mínimas, no requieren cuenta completa |
| **Proveedores del tenant** | El tenant los gestiona dentro del módulo de compras/inventario | No tienen acceso directo; son gestionados como entidades del sistema |
| **Contadores / Asesores externos** | Necesitan exportar datos contables del sistema | Acceso de auditor externo con permisos de solo lectura por periodo |

---

#### 4.2.4 Stakeholders Regulatorios y de Contexto

| Stakeholder | Rol en el sistema |
|-------------|-----------------|
| **SUNAT** | El módulo de facturación debe integrarse con el sistema de facturación electrónica. Sus validaciones condicionan el diseño del módulo de ventas y comprobantes. |
| **Ley N° 29733 (Datos Personales - Perú)** | Los datos de clientes, empleados y usuarios deben ser gestionados con consentimiento. Obliga a incluir política de privacidad, soft-delete y auditoría de accesos a datos personales. |
| **INDECOPI** | Regula publicidad y contratos de servicio. Los términos del plan SaaS deben estar claros en la interfaz de billing. |
| **Entidades bancarias / Pasarelas de pago** | Yape, PagoEfectivo, Izipay, Culqi (pasarelas peruanas) deben integrarse para el cobro de suscripciones del sistema. |
| **Certificadoras OSE (SUNAT)** | Nubefact, Holística u otra OSE certificada actúa como intermediario para la emisión de comprobantes electrónicos. |

---

#### 4.2.5 Roles del Sistema y Matriz de Acceso Base

> Esta tabla define los roles estándar del sistema multi-tenant y qué nivel de acceso tiene
> cada uno. Es una definición BASE que puede extenderse y configurarse por tenant en la
> sección de Configuración → Usuarios y Roles.

**Jerarquía de roles (de mayor a menor privilegio):**

| # | Rol | Jerarquía | Tipo de usuario |
|---|-----|-----------|----------------|
| 1 | **Owner / Super Admin** | 0 (máximo) | Dueño del tenant |
| 2 | **Administrador** | 10 | Gerente / encargado general |
| 3 | **Supervisor / Coordinador** | 20 | Jefe de área |
| 4 | **Operador Senior** | 30 | Empleado con funciones ampliadas (RRHH, finanzas) |
| 5 | **Operador Estándar** | 50 | Empleado operativo (ventas, almacén, campo) |
| 6 | **Auditor** | 90 | Solo lectura de bitácora y reportes |
| 7 | **Cliente / Portal** | 99 | Acceso externo mínimo (portal de cliente) |

---

**Matriz de acceso por módulo (base — configurable por tenant):**

| Módulo / Función | Owner | Admin | Supervisor | Op. Senior | Op. Estándar | Auditor | Cliente |
|-----------------|:-----:|:-----:|:----------:|:----------:|:------------:|:-------:|:-------:|
| **Dashboard ejecutivo** | ✅ | ✅ | 🟡 parcial | — | — | — | — |
| **Gestión de usuarios** | ✅ | ✅ | — | — | — | — | — |
| **Billing / Plan** | ✅ | — | — | — | — | — | — |
| **Configuración del tenant** | ✅ | ✅ | — | — | — | — | — |
| **Módulos operativos** (ventas, inventario, etc.) | ✅ | ✅ | ✅ su área | ✅ su área | 🟡 parcial | 👁 lectura | — |
| **Finanzas / Caja** | ✅ | ✅ | 👁 lectura | ✅ | — | 👁 lectura | — |
| **RRHH / Personal** | ✅ | ✅ | 🟡 su equipo | ✅ | — | 👁 lectura | — |
| **Reportes generales** | ✅ | ✅ | 🟡 su área | 🟡 su área | — | 👁 lectura | — |
| **Bitácora / Auditoría** | ✅ | ✅ | — | — | — | ✅ | — |
| **Portal de cliente** | — | — | — | — | — | — | ✅ |
| **Módulo clínico / sensible** | ✅ | ✅ | 🔒 con permiso explícito | 🔒 con permiso explícito | — | 👁 log de acceso | — |

**Leyenda:**
```
✅  Acceso completo (crear, leer, editar, eliminar)
🟡  Acceso parcial (solo su área, o solo algunas acciones)
👁  Solo lectura
🔒  Acceso restringido que requiere permiso explícito del Owner/Admin
—   Sin acceso (módulo no visible)
```

---

#### 4.2.6 Principios de Diseño de Roles

1. **Principio de mínimo privilegio**: Cada rol recibe solo el acceso necesario para
   cumplir su función. Si un operador de ventas no necesita ver finanzas, no las ve.

2. **Configurabilidad por tenant**: La matriz base puede ser modificada por el Owner o
   Administrador desde Configuración → Roles. Un tenant puede crear roles personalizados
   dentro de los límites de su plan.

3. **Herencia de permisos**: Un rol de jerarquía más alta hereda los permisos de los
   roles inferiores más sus permisos adicionales.

4. **Separación de billing y operaciones**: El Owner es el único que accede a billing.
   El Administrador gestiona todo lo operativo pero no puede modificar el plan ni ver
   la facturación del sistema.

5. **Datos sensibles siempre auditados**: Cualquier acceso a módulos marcados como
   sensibles (datos médicos, datos personales, documentos financieros críticos) genera
   un registro automático en la bitácora, independientemente del rol.

---

#### 4.2.7 Roles Según Plan Contratado

La cantidad de roles disponibles y la capacidad de personalización varía según el plan:

| Capacidad | Plan Básico | Plan Estándar | Plan Plus |
|-----------|:-----------:|:-------------:|:---------:|
| Roles predefinidos disponibles | 2 (Owner + Operador) | 4 (todos excepto Auditor) | 7 (todos) |
| Creación de roles personalizados | No | Sí (hasta 3) | Sí (ilimitados) |
| Asignación de permisos granulares | No | Parcial | Completo |
| Roles por sede diferenciados | No | No | Sí |
| Auditor / acceso de solo lectura | No | No | Sí |

---

## 5. ESTRUCTURA DE COSTOS DE DESARROLLO

### 5.1 Equipo de Desarrollo — Proyecto MVP a v1.0

| Rol | Cantidad | Modalidad | Costo/Mes (S/.) | Meses | Costo Total |
|-----|----------|-----------|----------------|-------|-------------|
| Arquitecto / Tech Lead | 1 | Part-time → Full | S/. 4,500 | 8 | S/. 36,000 |
| Desarrollador Backend Senior | 1 | Full-time | S/. 3,800 | 8 | S/. 30,400 |
| Desarrollador Frontend | 1 | Full-time | S/. 3,200 | 6 | S/. 19,200 |
| Diseñador UX/UI | 1 | Part-time (50%) | S/. 1,800 | 4 | S/. 7,200 |
| QA / Tester | 1 | Part-time (50%) | S/. 1,500 | 4 | S/. 6,000 |
| DBA / Especialista BD | 1 | Part-time (30%) | S/. 1,200 | 3 | S/. 3,600 |
| **Subtotal Talento Humano** | | | | | **S/. 102,400** |

*Nota: Los costos de talento asumen tarifas del mercado para profesionales en Ayacucho / trabajo remoto peruano. Las tarifas pueden variar ±20% según modalidad de contratación.*

### 5.2 Infraestructura Tecnológica (Desarrollo + Primer Año Operativo)

| Componente | Proveedor ref. | Costo/Mes | Meses | Total |
|-----------|---------------|----------|-------|-------|
| Servidor producción (EC2/GCE media) | AWS / GCP | S/. 280 | 12 | S/. 3,360 |
| Servidor staging / dev | AWS / GCP | S/. 80 | 8 | S/. 640 |
| Base de datos administrada (RDS) | AWS RDS | S/. 200 | 12 | S/. 2,400 |
| Almacenamiento objetos (S3/GCS) | AWS / GCP | S/. 60 | 12 | S/. 720 |
| CDN y distribución | CloudFront | S/. 40 | 12 | S/. 480 |
| Dominio + SSL | Namecheap | S/. 120 | 1 (anual) | S/. 120 |
| Email transaccional (SendGrid) | SendGrid | S/. 75 | 12 | S/. 900 |
| Monitoreo (Sentry/Datadog básico) | Sentry | S/. 50 | 12 | S/. 600 |
| **Subtotal Infraestructura** | | | | **S/. 9,220** |

### 5.3 Herramientas y Licencias de Desarrollo

| Herramienta | Costo Anual | Propósito |
|------------|------------|-----------|
| GitHub Team | S/. 800 | Repositorio + CI/CD |
| Figma Professional | S/. 600 | Diseño UX/UI |
| Jira / Linear | S/. 400 | Gestión de proyecto |
| Postman Team | S/. 200 | Testing de API |
| Suite de office / productividad | S/. 300 | Documentación |
| **Subtotal Herramientas** | | **S/. 2,300** |

### 5.4 Costos de Lanzamiento y Marketing Inicial

| Concepto | Costo |
|---------|-------|
| Identidad de marca (logo, paleta, tipografía) | S/. 800 |
| Landing page + web corporativa | S/. 1,200 |
| Campaña digital de lanzamiento (3 meses) | S/. 3,000 |
| Material de ventas (brochure, propuestas, demos) | S/. 600 |
| Eventos de lanzamiento en Ayacucho | S/. 1,500 |
| **Subtotal Marketing** | **S/. 7,100** |

### 5.5 Resumen Total de Inversión

| Concepto | Monto (S/.) | % del Total |
|---------|-------------|------------|
| Talento humano de desarrollo | S/. 102,400 | 85.1% |
| Infraestructura tecnológica | S/. 9,220 | 7.7% |
| Herramientas y licencias | S/. 2,300 | 1.9% |
| Marketing y lanzamiento | S/. 7,100 | 5.9% |
| **Inversión Total Estimada** | **S/. 121,020** | **100%** |
| *Con contingencia del 15%* | *S/. 139,173* | — |

> **Nota**: El escenario de inversión mínima viable (solo MVP con módulos Must Have de Fase 3) es de aproximadamente **S/. 65,000 - S/. 80,000**, suficiente para lanzar el Plan Básico y comenzar a generar ingresos mientras se desarrollan los módulos superiores.

---

## 6. PROYECCIONES FINANCIERAS

### 6.1 Supuestos del Modelo Financiero

- Lanzamiento comercial mes 8 post-inicio de desarrollo
- Crecimiento de clientes: 4-6 nuevos/mes (Básico), 2-3 nuevos/mes (Estándar), 0-1/mes (Plus) — conservador
- Churn rate mensual: 3% (Básico), 2% (Estándar), 1% (Plus)
- Mix de facturación: 70% mensual, 30% anual
- Costo operativo mensual en régimen: S/. 11,000 / mes
- Precio promedio ponderado por cliente: S/. 215/mes

### 6.2 Proyección de Ingresos — Años 1 a 3

| Indicador | Año 1 | Año 2 | Año 3 |
|----------|-------|-------|-------|
| Clientes Plan Básico (EOY) | 28 | 55 | 90 |
| Clientes Plan Estándar (EOY) | 12 | 28 | 52 |
| Clientes Plan Plus (EOY) | 3 | 8 | 15 |
| **Total clientes activos** | **43** | **91** | **157** |
| MRR (fin de año) | S/. 9,000 | S/. 19,500 | S/. 34,200 |
| ARR | S/. 108,000 | S/. 234,000 | S/. 410,400 |
| Ingresos por servicios únicos | S/. 12,000 | S/. 18,000 | S/. 22,000 |
| **Ingresos totales del año** | **S/. 68,000** | **S/. 198,000** | **S/. 384,000** |
| Costos operativos del año | S/. 82,000 | S/. 132,000 | S/. 156,000 |
| **Resultado del año** | **-S/. 14,000** | **+S/. 66,000** | **+S/. 228,000** |

*Año 1 negativo por inversión inicial amortizada. El sistema empieza a recuperar inversión en el Año 2.*

### 6.3 Punto de Equilibrio

- **Costo operativo mensual**: S/. 11,000
- **Ingreso promedio ponderado por cliente**: S/. 215/mes (mix de planes)
- **Clientes para break-even**: ⌈11,000 / 215⌉ = **52 clientes activos**
- **Mes estimado de break-even**: Mes 18-20 desde lanzamiento comercial

### 6.4 Métricas SaaS Objetivo

| Métrica | Mes 6 | Mes 12 | Mes 24 | Mes 36 |
|---------|-------|--------|--------|--------|
| MRR | S/. 4,200 | S/. 9,000 | S/. 19,500 | S/. 34,200 |
| Churn mensual promedio | < 4% | < 3% | < 2.5% | < 2% |
| CAC (costo adquisición) | S/. 380 | S/. 320 | S/. 250 | S/. 200 |
| LTV promedio | S/. 3,800 | S/. 5,200 | S/. 7,100 | S/. 9,400 |
| LTV / CAC | 10x | 16x | 28x | 47x |
| NPS | > 25 | > 40 | > 55 | > 65 |

---

## 7. PLAN DE IMPLEMENTACIÓN

### 7.1 Fases de Desarrollo y Lanzamiento

**FASE 0 — Preparación (Semanas 1-3)**
- Configuración del entorno de desarrollo (repositorio, CI/CD, infraestructura base)
- Diseño de la arquitectura multi-tenant (Fase 5 — BD)
- Wireframes y guía de estilos (Fase 6 — UX)
- Hito: Entorno técnico listo, diseño aprobado

**FASE 1 — MVP / Must Have (Semanas 4-14)**
- Sprint 1 (S4-S5): Autenticación, gestión de tenants, roles y permisos
- Sprint 2 (S6-S7): Catálogo de productos e inventario básico
- Sprint 3 (S8-S9): Módulo de ventas y caja diaria
- Sprint 4 (S10-S11): Facturación electrónica SUNAT
- Sprint 5 (S12-S13): Reportes básicos y dashboard inicial
- Sprint 6 (S14): QA integral del MVP, correcciones y estabilización
- Hito: **Beta privada — Plan Básico funcional** → 5 clientes piloto

**FASE 2 — Versión 1.0 / Should Have (Semanas 15-24)**
- Sprint 7-8: Módulo de compras, proveedores y cuentas por pagar
- Sprint 9-10: Recursos humanos y planilla básica
- Sprint 11: Contabilidad básica (PCGE peruano)
- Sprint 12: Dashboard avanzado, reportes ejecutivos, exportación
- Hito: **Lanzamiento comercial v1.0** — Planes Básico y Estándar disponibles

**FASE 3 — Versión 1.5 / Plus (Semanas 25-36)**
- Sprint 13-14: Multi-tenant / multi-sede
- Sprint 15: BI y dashboards personalizables
- Sprint 16: Gestión de proyectos y contratos
- Sprint 17: API REST completa e integraciones nativas
- Sprint 18: Módulo de auditoría, activos fijos, personalización
- Hito: **Lanzamiento Plan Plus y versión Enterprise**

### 7.2 Cronograma Gantt Resumido

```
ACTIVIDAD                         | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 |M10 |M11 |M12 |
----------------------------------|----|----|----|----|----|----|----|----|----|----|----|----|
Arquitectura + Diseño BD (Fase 5) |████|████|    |    |    |    |    |    |    |    |    |    |
Diseño UX/UI (Fase 6)             |████|████|████|    |    |    |    |    |    |    |    |    |
Dev — Autenticación y tenants     |    |████|████|    |    |    |    |    |    |    |    |    |
Dev — Inventario y ventas         |    |    |████|████|    |    |    |    |    |    |    |    |
Dev — Facturación SUNAT           |    |    |    |████|████|    |    |    |    |    |    |    |
Dev — Reportes y dashboard básico |    |    |    |    |████|████|    |    |    |    |    |    |
QA MVP + Beta privada             |    |    |    |    |    |████|████|    |    |    |    |    |
Dev — Compras + RRHH + Planilla   |    |    |    |    |    |    |████|████|    |    |    |    |
Dev — Contabilidad + Reportes adv |    |    |    |    |    |    |    |████|████|    |    |    |
QA v1.0 + Lanzamiento comercial   |    |    |    |    |    |    |    |    |████|████|    |    |
Dev — Multi-tenant + BI + API     |    |    |    |    |    |    |    |    |    |████|████|    |
QA v1.5 + Lanzamiento Plan Plus   |    |    |    |    |    |    |    |    |    |    |████|████|
```

---

## 8. ANÁLISIS DE RIESGOS

### 8.1 Matriz de Riesgos del Proyecto

| ID | Riesgo | Categ. | Prob. | Impacto | Nivel | Mitigación |
|----|--------|--------|-------|---------|-------|-----------|
| R-01 | Retraso en desarrollo por estimación incorrecta de Story Points | Técnico | Media | Alto | **Alto** | Buffer del 20% en cronograma; metodología ágil con sprints de 2 semanas permite ajuste continuo |
| R-02 | Baja adopción inicial por resistencia cultural al cambio digital | Mercado | Alta | Alto | **Crítico** | Programa de early adopters con precio especial + acompañamiento intensivo de 60 días |
| R-03 | Fallo de integración con SUNAT (facturación electrónica) | Técnico | Media | Alto | **Alto** | Usar proveedor OSE certificado (Nubefact, Holística) en lugar de integración directa |
| R-04 | Competidor con mayor recurso lanza producto similar | Mercado | Baja | Medio | **Moderado** | Acelerar construcción de base de clientes y switching costs en primeros 12 meses |
| R-05 | Falta de financiamiento para completar desarrollo | Financiero | Media | Crítico | **Crítico** | Lanzar MVP con inversión mínima viable (S/. 65K); generar ingresos desde mes 8 para autofinanciar el resto |
| R-06 | Problemas de seguridad / fuga de datos de un tenant | Técnico | Baja | Crítico | **Alto** | Arquitectura de aislamiento estricto por tenant desde el diseño; auditorías de seguridad trimestrales |
| R-07 | Pérdida de miembro clave del equipo de desarrollo | Operacional | Media | Alto | **Alto** | Documentación técnica exhaustiva; código revisado por pares; no depender de un solo desarrollador |
| R-08 | Regulación peruana de datos (Ley 29733) incumplida | Legal | Baja | Alto | **Moderado** | Contratar asesoría legal especializada en privacidad de datos desde el diseño del sistema |

### 8.2 Plan de Contingencia — Riesgos Críticos

**R-02 (Baja adopción):**
Si al mes 12 el número de clientes es < 20 (menos del 50% del objetivo base), activar: (1) reducción temporal de precios del 30% por 3 meses, (2) programa de "embajadores" con beneficio por referido, (3) rediseño de estrategia de canal con alianza con cámaras de comercio regionales.

**R-05 (Falta de financiamiento):**
Estrategia de bootstrapping: (1) contratar equipo mínimo (1 backend + 1 frontend), (2) lanzar MVP en 4 meses con 6 módulos básicos, (3) los primeros 10 clientes piloto financian el desarrollo de la siguiente fase con prepago anual con descuento del 40%.

---

## 9. ESTRATEGIA DE GO-TO-MARKET

### 9.1 Canales de Adquisición

| Canal | Segmento objetivo | Inversión mensual | CAC estimado | Conversión |
|-------|------------------|------------------|-------------|-----------|
| Referidos (boca a boca) | Todos | S/. 0 | S/. 80 | 25% |
| Alianza Cámara de Comercio Ayacucho | A y B | S/. 200 | S/. 150 | 12% |
| Google Ads (búsqueda local) | B y C | S/. 500 | S/. 320 | 8% |
| Demos presenciales y webinars | B y C | S/. 300 | S/. 250 | 18% |
| Contenido y SEO (blog técnico) | A y B | S/. 200 | S/. 180 | 6% |
| Facebook / Instagram Ads | A | S/. 300 | S/. 200 | 5% |

### 9.2 Estrategia de Precios de Lanzamiento

Durante los primeros **6 meses** de operación comercial:
- **Early adopters (primeros 10 clientes)**: 50% de descuento durante 6 meses a cambio de feedback estructurado y testimonios
- **Trial gratuito**: 30 días en Plan Básico sin tarjeta de crédito
- **Descuento anual**: 2 meses gratis en todos los planes (ya incluido en el precio anual)

---

## 10. INDICADORES DE ÉXITO (KPIs)

| KPI | Definición | Meta M6 | Meta M12 | Meta M24 |
|----|-----------|---------|---------|---------|
| Clientes activos | Total de tenants con suscripción vigente | 15 | 43 | 91 |
| MRR | Ingreso mensual recurrente total | S/. 3,200 | S/. 9,000 | S/. 19,500 |
| Churn mensual | % clientes que cancelan por mes | < 4% | < 3% | < 2% |
| NPS | Net Promoter Score (encuesta mensual) | > 30 | > 45 | > 60 |
| CAC | Costo promedio por cliente adquirido | < S/. 400 | < S/. 320 | < S/. 250 |
| LTV / CAC | Ratio de salud financiera del negocio | > 8x | > 12x | > 25x |
| Uptime promedio | Disponibilidad del sistema | > 99.0% | > 99.5% | > 99.9% |
| Tiempo de resolución soporte | Promedio de tiempo de cierre de tickets | < 36h | < 24h | < 12h |
| % clientes en plan anual | Estabilidad de ingresos recurrentes | > 20% | > 30% | > 40% |
| Módulos activos promedio por tenant | Profundidad de uso del sistema | 4.2 | 5.8 | 7.1 |

---

## 11. SOSTENIBILIDAD Y ESCALABILIDAD

### 11.1 Sostenibilidad Financiera

El modelo SaaS con ingresos recurrentes garantiza predictibilidad financiera. Con 52 clientes activos (break-even) distribuidos en los tres planes, el sistema cubre todos sus costos operativos mensuales sin depender de ventas únicas o proyectos esporádicos. La escalabilidad de la infraestructura cloud permite crecer en número de clientes sin inversiones proporcionales en infraestructura.

### 11.2 Hoja de Ruta Geográfica

| Fase | Periodo | Mercado | Acción principal |
|------|---------|---------|-----------------|
| 1 | 0-12 meses | Ayacucho | Validación de producto + primeros 43 clientes |
| 2 | 12-24 meses | Sur del Perú (Cusco, Puno, Apurímac) | Expansión regional con equipo de ventas propio |
| 3 | 24-36 meses | Lima PYME + Perú nacional | Oficina comercial en Lima + equipo de soporte ampliado |
| 4 | 36+ meses | Bolivia, Ecuador | Adaptación normativa + alianzas locales |

### 11.3 Evolución del Producto

- **2026**: Integración nativa con SUNAT, Banco de la Nación, AFP principales
- **2027**: Módulo de inteligencia artificial para predicción de demanda y análisis financiero automatizado
- **2028**: Marketplace de integraciones (plugins de terceros) + versión mobile nativa

---

## 12. CONCLUSIÓN ESTRATÉGICA

El módulo de software multi-tenant descrito en este plan representa una oportunidad de mercado real y poco atendida en el sur del Perú. La validación en Fase 1 confirmó el problema, la Fase 2 definió por qué esta solución puede ser superior a lo existente, y la Fase 3 especificó con precisión qué construir.

Los tres planes comerciales — **Básico (S/. 120), Estándar (S/. 280) y Plus (S/. 580)** — están calibrados para capturar tres segmentos distintos sin canibalización, con una progresión de valor clara y verificable en cada escalón. Los precios son competitivos frente al mercado regional, justificados por el valor real que entrega el sistema y sostenibles para cubrir los costos del negocio.

La viabilidad financiera del proyecto es alta bajo el escenario base: con una inversión inicial de S/. 95,000-120,000, el sistema puede alcanzar su punto de equilibrio en el mes 18-20 y generar ROI positivo sostenido a partir del año 2. La clave de éxito está en la ejecución disciplinada del lanzamiento y en construir una base inicial de 20-30 clientes comprometidos durante los primeros 6 meses de operación comercial.

---

*Plan de Negocio — Módulo de Software Multi-Tenant*
*Fase 4 del Proyecto de Documentación de Diseño de Sistemas*
*Versión 1.0 — Generado: 2026-05-13*
*Autor: Eduardo Sebastian Paipay Vega — UNSCH*
*Repositorio: https://github.com/Eduardo-Sebastian-Paipay-Vega/Documentaci-n_de_dise-o_de_Sistemas_y_Modulos*
