# FASE 3 — Requisitos Funcionales y Casos de Uso Completo

> **Proyecto**: Comerci
> **Fase**: 3 — Requisitos Funcionales y Casos de Uso
> **Versión**: 2.0
> **Fecha**: 2026-05-18
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🎯 Propósito

Especificar **exactamente qué debe hacer Comerci** con precisión técnica. Cada requisito es rastreable, testeable y verificable.

---

## 📋 Requisitos Funcionales (RF)

### CATEGORÍA 1: Unificación de Fuentes de Dinero

#### **RF-001: Conectar Banco Principal**
- **Descripción**: Usuario conecta su banco vía API segura
- **Actor**: Comerciante
- **Precondición**: Tiene cuenta bancaria registrada
- **Flujo normal**: 
  1. Click "Conectar banco"
  2. Selecciona su banco (BCP, BBVA, Interbank, etc.)
  3. Ingresa credenciales (OAuth seguro)
  4. Sistema sincroniza últimos 6 meses
- **Postcondición**: Saldo del banco visible en dashboard
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 40 horas

#### **RF-002: Conectar Yape/Plin**
- **Descripción**: Usuario vincula su app Yape/Plin vía token seguro
- **Actor**: Comerciante
- **Flujo normal**:
  1. Click "Conectar Yape"
  2. Sistema genera código QR o link
  3. Usuario abre Yape y autoriza
  4. Sincroniza últimos 90 días
- **Postcondición**: Saldo Yape + historial en dashboard
- **Prioridad**: 🔴 CRÍTICA (90% usuarios tienen Yape)
- **Estimación**: 35 horas

#### **RF-003: Entrada Manual de Caja**
- **Descripción**: Usuario ingresa dinero en efectivo/caja física
- **Actor**: Comerciante
- **Flujo normal**:
  1. Click "Registrar dinero en caja"
  2. Ingresa monto ($X) y concepto
  3. Sistema guarda + marca timestamp
- **Postcondición**: Caja actualizada en balance
- **Prioridad**: 🔴 CRÍTICA (70% ingresos son cash)
- **Estimación**: 8 horas

#### **RF-004: Registrar Deudas (Pasivos)**
- **Descripción**: Usuario registra dinero que debe (proveedores, préstamos)
- **Actor**: Comerciante
- **Flujo normal**:
  1. Click "Registrar deuda"
  2. Ingresa acreedor, monto, plazo
  3. Sistema calcula impacto en flujo
- **Postcondición**: Deuda resta del balance total
- **Prioridad**: 🟠 ALTA
- **Estimación**: 12 horas

#### **RF-005: Vista Unificada de Dinero**
- **Descripción**: Dashboard muestra total consolidado
- **Presentación**:
```
DINERO TOTAL: $X,XXX
├─ Banco: $X,XXX (Actualizado hace 2 min)
├─ Yape: $X,XXX (Actualizado hace 5 min)
├─ Caja: $X,XXX (Actualizado hace 30 min)
├─ Deudas: -$X,XXX
└─ NETO: $X,XXX
```
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 16 horas

---

### CATEGORÍA 2: Clasificación Automática de Transacciones

#### **RF-006: Clasificar Gastos Automáticamente**
- **Descripción**: Sistema categoriza cada gasto sin usuario
- **Categorías**:
  - 🛒 Compras de mercadería
  - 🏪 Gastos de local (alquiler, servicios)
  - 👥 Nómina/salarios
  - 🚗 Transporte/logística
  - 📱 Servicios (teléfono, internet)
  - 💼 Administrativos
  - 🎯 Marketing
  - ❓ Otros
- **Motor**: NLP + ML entrenado con datos LATAM
- **Precisión target**: >92%
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 60 horas

#### **RF-007: Permitir Reclasificación Manual**
- **Descripción**: Usuario puede corregir categoría si es incorrecta
- **Flujo**: Click transacción → Change category → Confirmar
- **Impacto**: Sistema aprende y mejora clasificación futura
- **Prioridad**: 🟠 MEDIA
- **Estimación**: 6 horas

#### **RF-008: Desglose de Gastos por Categoría**
- **Descripción**: Reporte visual de gastos por tipo
- **Visualización**: Gráfico pie + tabla detallada
- **Períodos**: Día, Semana, Mes, Año
- **Insights**:
  - Categoría más cara
  - Variación vs mes anterior
  - Categorías que crecen
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 24 horas

---

### CATEGORÍA 3: Predicción de Flujo (El Momento Wow)

#### **RF-009: Calcular Velocidad Diaria de Gasto**
- **Descripción**: Sistema aprende cuánto gasta POR DÍA
- **Fórmula**: 
  - Total gastos último mes / 30 = gasto diario promedio
  - Ajusta por patrones (ej. viernes son más caros)
- **Precisión**: Histórico vs predicción real
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 20 horas

#### **RF-010: Proyectar Dinero en 14 Días**
- **Descripción**: Muestra cuánto dinero habrá en 14 días
- **Fórmula**:
  - Dinero hoy
  - + Ingresos esperados (histórico)
  - - Gastos esperados (calculados)
  - = Dinero en 14 días
- **Presentación**: Línea de tiempo visual
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 32 horas

#### **RF-011: Proyectar Dinero en 30 Días**
- **Descripción**: Proyección a largo plazo
- **Mismo algoritmo que RF-010 pero para 30 días**
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 8 horas (reutiliza RF-010)

#### **RF-012: Identificar Punto de Quiebra**
- **Descripción**: Sistema calcula cuándo dinero será $0
- **Lógica**: 
  - Si gasto_diario > ingreso_diario
  - Entonces: días_hasta_0 = dinero_actual / (gasto_diario - ingreso_diario)
- **Output**: "En 12 días sin dinero"
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 16 horas

#### **RF-013: Alerta de Punto de Quiebra**
- **Descripción**: Notificación temprana si quiebra inminente
- **Condiciones**:
  - Si días_hasta_0 <= 14 → Alerta ROJA
  - Si días_hasta_0 <= 7 → Alerta ROJA + Notificación push
  - Si días_hasta_0 <= 3 → Llamada automática
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 12 horas

---

### CATEGORÍA 4: Recomendaciones Inteligentes

#### **RF-014: Sugerir Optimización de Gastos**
- **Descripción**: IA propone cómo ahorrar dinero
- **Ejemplos**:
  - "Gastos de transporte subieron 40%, propongo reducir X"
  - "Categoría X creció anómalo, revisar"
  - "Si reduces Y en 15%, evitas quiebra"
- **Motor**: ML que aprende patrones normales
- **Prioridad**: 🟠 ALTA
- **Estimación**: 40 horas

#### **RF-015: Recomendación de Decisión de Compra**
- **Descripción**: Usuario pregunta "¿Puedo comprar algo?" y sistema responde
- **Flujo**:
  1. Usuario ingresa monto de compra ($X)
  2. Sistema verifica flujo 30 días
  3. Responde: "SÍ, tienes margen" o "NO, riesgo alto"
- **Lógica**: 
  - Si (dinero en 30 días - X) > (emergency fund)
  - Respuesta: "Sí, pero cuidado"
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 24 horas

#### **RF-016: Comparativa de Escenarios**
- **Descripción**: "¿Qué pasa si...?" análisis
- **Escenarios**:
  - "¿Si reduzco gasto en X?"
  - "¿Si no pago deuda?"
  - "¿Si contrato empleado?"
- **Visualización**: Antes vs después
- **Prioridad**: 🟠 ALTA
- **Estimación**: 48 horas

---

### CATEGORÍA 5: Reportes y Análisis

#### **RF-017: Reporte Diario de Movimientos**
- **Descripción**: Email/notificación con lo que pasó
- **Contenido**:
  - Dinero hoy vs ayer
  - Transacciones principales
  - Alertas críticas
- **Frecuencia**: Diariamente a las 8am
- **Prioridad**: 🟠 ALTA
- **Estimación**: 12 horas

#### **RF-018: Reporte Semanal Ejecutivo**
- **Descripción**: Resumen semanal con insights
- **Contenido**:
  - Gastos vs ingresos
  - Tendencias
  - Recomendaciones clave
- **Frecuencia**: Cada lunes
- **Prioridad**: 🟡 MEDIA
- **Estimación**: 16 horas

#### **RF-019: Reporte Mensual Completo**
- **Descripción**: Documento PDF descargable
- **Contenido**:
  - Estado financiero completo
  - Análisis de categorías
  - Comparativa mes anterior
  - Proyecciones mes siguiente
- **Prioridad**: 🟡 MEDIA
- **Estimación**: 20 horas

#### **RF-020: Comparativa Interperiodos**
- **Descripción**: Mes vs mes, año vs año
- **Visualización**: Gráficos comparativos
- **Prioridad**: 🟡 MEDIA
- **Estimación**: 16 horas

---

### CATEGORÍA 6: Gestión de Usuarios y Seguridad

#### **RF-021: Registro de Usuario**
- **Flujo**: Email/teléfono + contraseña + datos básicos
- **Validaciones**: Email válido, pass fuerte
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 8 horas

#### **RF-022: Autenticación Segura**
- **Método**: OAuth (Google, Facebook) + 2FA opcional
- **Sesiones**: 30 días máximo
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 16 horas

#### **RF-023: Múltiples Usuarios por Negocio**
- **Descripción**: Dueño + contador + gerente acceso compartido
- **Roles**:
  - Propietario (acceso total)
  - Contador (solo lectura + análisis)
  - Gerente (solo lectura)
- **Prioridad**: 🟠 ALTA
- **Estimación**: 24 horas

#### **RF-024: Encriptación de Datos Bancarios**
- **Descripción**: Credenciales almacenadas con AES-256
- **Cumplimiento**: PCI-DSS
- **Prioridad**: 🔴 CRÍTICA
- **Estimación**: 20 horas

---

### CATEGORÍA 7: Integraciones y APIs

#### **RF-025: API REST para Consultas**
- **Descripción**: Terceros pueden hacer llamadas seguras
- **Endpoints**:
  - GET /dinero-hoy
  - GET /predicción-30-días
  - GET /gastos-por-categoría
- **Autenticación**: API Key + JWT
- **Prioridad**: 🟠 ALTA
- **Estimación**: 32 horas

#### **RF-026: Webhook para Alertas Críticas**
- **Descripción**: Notifica a terceros cuando quiebra inminente
- **Caso de uso**: Cooperativa se entera cuando cliente tiene riesgo
- **Prioridad**: 🟡 MEDIA
- **Estimación**: 16 horas

---

## 🚫 Requisitos No Funcionales (RNF)

| RNF | Especificación | Métrica |
|-----|---|---|
| **RNF-001** | **Performance** | Carga dashboard < 2s (p95) |
| **RNF-002** | **Disponibilidad** | 99.5% uptime |
| **RNF-003** | **Escalabilidad** | 100K usuarios concurrentes |
| **RNF-004** | **Seguridad** | OWASP top 10 remediado |
| **RNF-005** | **Encriptación** | TLS 1.3 + AES-256 |
| **RNF-006** | **Auditoría** | Todos los accesos logged |
| **RNF-007** | **Localización** | Soporte español/portugués |
| **RNF-008** | **Movilidad** | Responsive, offline mode |
| **RNF-009** | **Datos** | Backup diario, RTO 4 horas |
| **RNF-010** | **Cumplimiento** | GDPR + PCI-DSS ready |

---

## 📖 Casos de Uso Detallados

### **CU-001: Consultar Dinero Total en Tiempo Real**

**Actor Principal**: Comerciante  
**Precondición**: Conectó al menos una fuente (banco, Yape o caja)

**Flujo Básico**:
1. Abre app Comerci
2. Ve dashboard principal
3. **RESULTADO**: Dinero total = $4,350 (Banco $1.8K + Yape $1.2K + Caja $0.8K - Deudas $0.5K)

**Flujo Alternativo A: Dinero fuera de sincronización**
- Si última sincronización fue hace 2 horas
- Sistema muestra: "Dinero total (hace 2 horas)"
- Click "Actualizar ahora" → Re-sincroniza en 5 segundos

**Postcondición**: Usuario sabe exactamente cuánto dinero tiene

---

### **CU-002: Recibir Alerta de Quiebra Inminente**

**Actor Principal**: Comerciante  
**Precondición**: Sistema predictor está funcionando + tiene histórico 30 días

**Flujo Básico**:
1. Sistema calcula gastos diarios promedio: $150
2. Ingresos diarios promedio: $180
3. Dinero actual: $2,100
4. Días hasta quiebra: (2,100 - 500 margen seguridad) / (180 - 150) = 53 días
5. **RESULTADO**: Sin alerta (está seguro)

**Flujo Alternativo B: Riesgo detectado**
1. Gastos suben a $200/día (mercadería grande)
2. Ingresos siguen $180/día
3. Dinero actual: $2,100
4. Días hasta quiebra: (2,100 - 500) / (200 - 180) = 80 días
5. **PERO**: Próximo gasto planificado es $500 en 5 días
6. Cálculo real: días_hasta_0 = (2,100 - 500 - 500) / 20 = 55 días
7. Alerta AMARILLA: "En 55 días, sin dinero. Revisa gastos."

**Flujo Alternativo C: Crítico**
1. Cliente importante no pagó (perdió $1,000 ingresos)
2. Gastos $200/día vs ingresos $80/día
3. Dinero actual: $1,500
4. Días hasta quiebra: (1,500 - 500) / (200 - 80) = 8 días
5. **RESULTADO**: 
   - Alerta ROJA: "⚠️ En 8 DÍAS, SIN DINERO PARA NÓMINA"
   - Push notification
   - SMS opcional
   - Email
   - Dashboard parpadea en rojo
6. Sistema sugiere:
   - "Cobra cliente X que debe $300 ahora"
   - "Postpone compra de mercadería ($400)"
   - "Reduce gastos diarios en $30"

**Postcondición**: Usuario está consciente del riesgo y puede actuar

---

### **CU-003: Tomar Decisión de Compra Inteligente**

**Actor Principal**: Comerciante  
**Trigger**: Usuario quiere comprar algo ($500 de mercadería)

**Flujo Básico**:
1. Click "¿Puedo comprar esto?"
2. Ingresa monto: $500
3. Sistema calcula:
   - Dinero hoy: $3,500
   - Dinero en 30 días (sin esta compra): $2,800
   - Dinero en 30 días (con esta compra): $2,300
   - Margen de seguridad recomendado: $1,000
4. **RESULTADO**: "✅ SÍ puedes comprar, pero quedarás con $2,300. Recomiendo no bajar de $1,000."
5. Usuario decide "Sí, compra"
6. Sistema registra la transacción proyectada

**Flujo Alternativo D: Prohibido por seguridad**
1. Dinero hoy: $1,500
2. Usuario quiere comprar: $500
3. Cálculo: Dinero final = $700 (debajo de $1,000 margen)
4. **RESULTADO**: "❌ NO recomendado. Te quedarías con $700, por debajo de tu margen de seguridad. Alternativas: Cobra deudas pendientes ($400) o postpone."

**Postcondición**: Decisión informada por datos

---

### **CU-004: Ver Desglose de Gastos y Detectar Anomalía**

**Actor Principal**: Comerciante  
**Trigger**: Entra a sección "Mis Gastos"

**Flujo Básico**:
1. Click "Gastos" en menú
2. Ve tabla de últimos 100 transacciones, clasificadas automáticamente:
   ```
   Mercadería:      $1,250 (42%) ↓ vs mes anterior
   Local (alquiler): $500  (17%) → igual
   Nómina:          $600  (20%) → igual
   Transporte:      $180   (6%) ↑ +25%
   Servicios:       $120   (4%) → igual
   Marketing:       $50    (2%) ⬆️ ANÓMALO (+300%)
   ```
3. Sistema detecta: "Marketing subió anómalo"
4. **RESULTADO**: Alerta: "Gastaste $50 en marketing. Histórico: $13. ¿Por qué?"
5. Usuario click "Explicar" → Ve transacciones de marketing
6. Usuario reconoce: "Ah, publicidad en Facebook"
7. Sistema aprende y categoriza similar futuro

**Postcondición**: Usuario entiende sus gastos

---

### **CU-005: Recibir Reporte Diario Automático**

**Actor Principal**: Sistema  
**Precondición**: Usuario habilitó notificaciones

**Flujo Básico**:
1. Cada mañana a 8:00am, sistema genera reporte:
   ```
   📊 RESUMEN DE HOY
   Dinero actual: $3,500 (↑ $200 vs ayer)
   
   Ingresos: +$450 (1 venta)
   Gastos: -$250 (mercadería)
   
   ⚠️ ALERTA: Próxima nómina en 3 días. Asegura $600.
   
   📈 TENDENCIA: Ingresos van bien, gastos estables.
   
   ✨ OPORTUNIDAD: Si aceleras cobros, podrías comprar más.
   ```
2. Envía por:
   - Email
   - Push notification
   - WhatsApp (opcional)

**Postcondición**: Usuario comienza día consciente de su situación

---

### **CU-006: Simular Escenario "¿Qué pasa si...?"**

**Actor Principal**: Comerciante  
**Trigger**: User click en "Simulador de Escenarios"

**Flujo Básico**:
1. Usuario selecciona escenario pre-armado:
   - "¿Si reduzco gastos de transporte 30%?"
   - "¿Si contrato otro empleado ($300/mes)?"
   - "¿Si vendo más 20%?"
2. Sistema calcula impacto:
   ```
   Escenario: Reducir transporte 30%
   
   Ahorro mensual: $54
   Dinero en 30 días HOY: $2,800
   Dinero en 30 días CON CAMBIO: $2,854
   
   Impacto: +$54/mes = +$648/año
   Tipo: Bajo pero positivo
   ```
3. **RESULTADO**: Usuario ve antes/después
4. Puede guardar escenario para futuros análisis

**Postcondición**: Usuario puede evaluar decisiones antes de tomarlas

---

## 📊 Matriz de Trazabilidad (RF ↔ CU)

| RF | CU-001 | CU-002 | CU-003 | CU-004 | CU-005 | CU-006 |
|----|--------|--------|--------|--------|--------|--------|
| RF-001 (Banco) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RF-002 (Yape) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RF-003 (Caja) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RF-004 (Deudas) | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| RF-005 (Vista unificada) | ✅ | ✅ | ✅ |  | ✅ |  |
| RF-006 (Clasificar) |  | ✅ | ✅ | ✅ | ✅ | ✅ |
| RF-009 (Velocidad) |  | ✅ | ✅ |  | ✅ | ✅ |
| RF-010 (14 días) |  | ✅ | ✅ |  | ✅ | ✅ |
| RF-012 (Quiebra) |  | ✅ |  |  |  |  |
| RF-013 (Alerta) |  | ✅ |  |  | ✅ |  |
| RF-014 (Optimización) |  | ✅ | ✅ | ✅ | ✅ | ✅ |
| RF-015 (Decisión compra) |  |  | ✅ |  |  |  |
| RF-017 (Reporte diario) |  |  |  |  | ✅ |  |
| RF-016 (Escenarios) |  |  | ✅ |  |  | ✅ |

---

## 🎯 Resumen de Requisitos

- **Total RF**: 26
- **Total RNF**: 10
- **Total Casos de Uso**: 6 (detallados) + 20+ derivados
- **Horas estimadas**: ~600 horas de desarrollo
- **Criticidad**: 14 CRÍTICA (🔴), 8 ALTA (🟠), 4 MEDIA (🟡)

---

## 📚 Cambios de Versión

**v1.0** (2026-05-18): Plantilla básica
**v2.0** (2026-05-18): **26 RF, 10 RNF, 6 CU detallados con flujos completos**

---

*Fase 3 completada. Listo para FASE 4 — Plan de Negocio.*
