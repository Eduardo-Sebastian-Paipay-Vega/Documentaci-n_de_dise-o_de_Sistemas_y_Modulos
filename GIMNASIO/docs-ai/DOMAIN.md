# DOMAIN.md: Lenguaje Ubicuo de GYMsos
> **Versión**: 1.0  
> **Propósito**: Glosario de negocio + Entidades de Dominio (DDD)  
> **Actualizado**: 2026-05-26  

---

## 🌐 LENGUAJE UBICUO (UBIQUITOUS LANGUAGE)

Este documento define el vocabulario compartido entre NEGOCIO y DESARROLLO. **Todo código debe usar estos términos.**

| Término de Negocio | Término Técnico (Domain) | Definición |
|--------------------|--------------------------|-----------|
| Miembro | `Miembro` (Entity) | Persona registrada en el gimnasio con rol específico |
| Plan | `Plan` (Value Object) | Oferta comercial: precio, duración, características |
| Membresía | `Membresia` (Entity) | Suscripción activa de un Miembro a un Plan |
| Vencimiento | `FechaVencimiento` (Value Object) | Momento en que membresia cesa de ser válida |
| Acceso | `Acceso` (Entity) | Entrada/salida del miembro al gimnasio (QR, biometría) |
| Clase | `Clase` (Entity) | Evento puntual o recurrente dirigido por entrenador |
| Inscripción | `Inscripcion` (Entity) | Registro de miembro en una clase |
| Pago | `Pago` (Entity) | Transacción monetaria para renovación de membresía |
| Entrenador | `Entrenador` (Entity) | Miembro con rol `entrenador` autorizado para dictar clases |
| Recepcionista | `Recepcionista` (Entity) | Miembro con rol `recepcionista` para gestión diaria |
| Gerente | `Gerente` (Entity) | Miembro con rol `gerente` para decisiones estratégicas |

---

## 🏛️ BOUNDED CONTEXTS (Dominios de Negocio)

### **1. BOUNDED CONTEXT: Membresías**

#### **Entidades Principales**

```typescript
// Domain Entity — Sin referencias a infraestructura
class Membresia {
  private id: MembresiId
  private miembroId: MiembroId
  private plan: Plan
  private fechaInicio: Date
  private fechaVencimiento: Date
  private estado: EstadoMembresia  // "activa" | "vencida" | "cancelada" | "suspendida"
  private motivoCancelacion?: string
  
  // Invariantes (reglas de negocio)
  estaVencida(): boolean
  puedeRenovarse(): boolean
  renovar(nuevoVencimiento: Date): void
  cancelar(motivo: string): void
  
  // Validación de negocio ANTES de persistir
  validar(): void
}

class Plan {
  private id: PlanId
  private nombre: string
  private precioMensual: Money
  private duracionDias: number
  private clasesIncluidas?: number
  private sucursalesIncluidas: "una" | "todas"
  
  esValido(): boolean
}

type EstadoMembresia = "activa" | "vencida" | "cancelada" | "suspendida"

// Value Object — Identidad inmutable
class MembresiId {
  constructor(readonly valor: string) {}
}

class MiembroId {
  constructor(readonly valor: string) {}
}

class Money {
  constructor(readonly monto: number, readonly moneda: "PEN" | "USD") {}
}
```

#### **Agregado (Aggregate Root)**
```typescript
// Membresia es el raíz del agregado
AggregateRoot: Membresia
├── Plan (Value Object)
├── Estado (Value Object)
└── FechaVencimiento (Value Object)
```

#### **Casos de Uso (Application Layer)**
- `RegistrarMembresia`: Crear membresia para nuevo miembro
- `RenovarMembresia`: Extender vencimiento después de pago
- `CancelarMembresia`: Cambiar estado a cancelada con motivo
- `ValidarMembresia`: Verificar si está activa (pre-requisito para Acceso)
- `DetectarVencimientos`: Búsqueda diaria de membresías proximas a vencer

#### **Reglas de Negocio CRÍTICAS (ACID)**
```
REGLA 1: Renovación atómica
├─ Condición: Pago completado + Sin pagos pendientes
├─ Acción: Cambiar estado membresía + Registrar auditoría
└─ Rollback si: Falla la actualización de cualquiera de los 2

REGLA 2: Vencimiento automático
├─ Condición: Fecha actual > fecha_vencimiento
├─ Acción: Cambiar estado a "vencida" + Bloquear acceso
└─ Garantía: Transacción singular

REGLA 3: Cancelación con auditoría
├─ Condición: Gerente solicita cancelación
├─ Acción: Cambiar estado + Registrar motivo + Crear nota en miembro
└─ Rollback si: Falla cualquier paso
```

#### **Integración Externa**
- **Stripe / PayU**: Pagos en `Pago` context
- **Notificaciones**: Cuando membresia vence (manejado por Anti-Corruption Layer)

---

### **2. BOUNDED CONTEXT: Acceso**

#### **Entidades Principales**

```typescript
class Acceso {
  private id: AccesoId
  private miembroId: MiembroId
  private gimnasioId: GimnasioId
  private fechaHoraEntrada: Date
  private fechaHoraSalida?: Date
  private tipoAcceso: TipoAcceso  // "qr" | "biometria" | "manual"
  private estadoAcceso: EstadoAcceso  // "permitido" | "denegado"
  private razonDenegacion?: string
  
  // Métodos de negocio
  permitir(): void
  denegar(razon: string): void
  registrarSalida(ahora: Date): void
}

type TipoAcceso = "qr" | "biometria" | "manual"
type EstadoAcceso = "permitido" | "denegado"

class AuditoriaAcceso {
  private id: AuditoriaId
  private accesoId: AccesoId
  private intentoFallido: boolean
  private razonFallo?: string
  private timestamp: Date
}
```

#### **Reglas de Negocio CRÍTICAS (ACID)**
```
REGLA 1: Validación de membresia antes de acceso
├─ Condición: QR escaneado
├─ Acciones secuenciales (1 transacción):
│  ├─ Validar membresia: ¿Está activa?
│  ├─ Validar membresia: ¿NO está vencida?
│  ├─ Si ambas OK → Crear Acceso(permitido)
│  └─ Si alguna falla → Crear Acceso(denegado) + AuditoriaAcceso
└─ Garantía: Acceso + Auditoría juntos o ninguno

REGLA 2: Intento fallido = Auditoría inmediata
├─ Condición: Acceso denegado
├─ Acción: Registrar en AuditoriaAcceso con razón específica
└─ Rollback si: Falla la auditoría, RECHAZAR el acceso físico

REGLA 3: Salida registra cierre automático
├─ Condición: Escaneo de salida
├─ Acción: Completar Acceso con fecha_hora_salida
└─ Garantía: Transacción singular
```

---

### **3. BOUNDED CONTEXT: Pagos**

#### **Entidades Principales**

```typescript
class Pago {
  private id: PagoId
  private miembroId: MiembroId
  private membresiId: MembresiId
  private monto: Money
  private metodoPago: MetodoPago  // "tarjeta" | "transferencia" | "efectivo"
  private idTransaccionExterna?: string  // Stripe, PayU
  private estado: EstadoPago  // "pendiente" | "completado" | "fallido" | "reembolsado"
  private fechaPago: Date
  private proximaRenovacion?: Date
  
  // Métodos
  marcarCompletado(idTransaccion: string): void
  marcarFallido(razon: string): void
  reembolsar(): void
}

type EstadoPago = "pendiente" | "completado" | "fallido" | "reembolsado"
type MetodoPago = "tarjeta" | "transferencia" | "efectivo"

class Transaccion {
  private id: string  // ID de Stripe/PayU
  private pagoId: PagoId
  private estadoRemoto: "pending" | "succeeded" | "failed"
  private respuestaWebhook: object
}
```

#### **Reglas de Negocio CRÍTICAS (ACID)**
```
REGLA 1: Pago + Renovación de Membresia (atomicidad)
├─ Trigger: Webhook de Stripe confirma pago
├─ Acciones secuenciales (1 transacción):
│  ├─ Cambiar estado Pago a "completado"
│  ├─ Calcular nueva_fecha_vencimiento
│  └─ Actualizar Membresia
└─ Rollback si: Falla cualquier acción → No renovar

REGLA 2: Pago sin membresia = RECHAZAR
├─ Condición: Intento de crear Pago sin MembresiId válida
├─ Acción: Validar en Domain antes de persistir
└─ Garantía: Integridad referencial por negocio, no solo DB

REGLA 3: Reembolso actualiza Membresia
├─ Condición: Gerente solicita reembolso
├─ Acciones secuenciales (1 transacción):
│  ├─ Cambiar estado Pago a "reembolsado"
│  └─ Revertir cambios en Membresia (volver a estado anterior)
└─ Rollback si: Falla cualquier acción
```

---

### **4. BOUNDED CONTEXT: Clases**

#### **Entidades Principales**

```typescript
class Clase {
  private id: ClaseId
  private gimnasioId: GimnasioId
  private entrenadorId: EntrenadorId
  private espacio: Espacio
  private nombre: string
  private capacidadMaxima: number
  private nivel: NivelClase  // "principiante" | "intermedio" | "avanzado"
  private fechaHoraInicio: Date
  private duracionMinutos: number
  private recurrencia: TipoRecurrencia
  private estado: EstadoClase  // "programada" | "en_curso" | "finalizada" | "cancelada"
  
  // Métodos
  agregarInscripcion(miembroId: MiembroId): void
  cancelarInscripcion(miembroId: MiembroId): void
  obtenerCuposDisponibles(): number
  comenzar(): void
  finalizar(): void
  cancelar(): void
}

type NivelClase = "principiante" | "intermedio" | "avanzado"
type TipoRecurrencia = "unica" | "diaria" | "semanal" | "mensual"
type EstadoClase = "programada" | "en_curso" | "finalizada" | "cancelada"

class Inscripcion {
  private id: InscripcionId
  private miembroId: MiembroId
  private claseId: ClaseId
  private fechaInscripcion: Date
  private asistio: boolean
  
  marcarAsistencia(): void
}

class Espacio {
  private id: EspacioId
  private nombre: string
  private capacidadMaxima: number
}
```

#### **Reglas de Negocio CRÍTICAS**
```
REGLA 1: Inscripción no puede exceder capacidad
├─ Condición: Intento de inscribir miembro
├─ Validación: cuposActuales < capacidadMaxima
└─ Rollback si: Excede capacidad

REGLA 2: Solo miembros activos pueden inscribirse
├─ Condición: Validar membresia antes de Inscripcion
├─ Llamada a: Membresias.ValidarMembresia()
└─ Garantía: Cross-context coordination

REGLA 3: Cancelación de clase notifica inscritos
├─ Condición: Estado cambia a "cancelada"
├─ Acción: Disparar evento "ClaseCancelada"
└─ Consumidor: Notificaciones (otro BC)
```

---

### **5. BOUNDED CONTEXT: Análisis (Solo Lectura)**

#### **Entidades Principales**

```typescript
class MetricaMiembro {
  private miembroId: MiembroId
  private sesionesEsteMes: number
  private racha: number  // días consecutivos
  private puntosAcumulados: number
  private nivelGYMsos: number
  private ultimaActualizacion: Date
}

class PrediccionChurn {
  private miembroId: MiembroId
  private scoreRiesgo: number  // 0-100
  private razonesRiesgo: string[]
  private recomendaciones: string[]
  private fechaProximaRevision: Date
}
```

#### **Característica**
- **Solo lectura** de datos de otros contextos
- **Eventual consistency** — Actualización offline/batch
- No afecta transacciones críticas

---

## 🔗 RELACIONES ENTRE BOUNDED CONTEXTS

```
┌─────────────┐
│ Membresías  │◄─────┐
└─────────────┘      │
      ▲              │
      │              │
      ├──────────────┼────────┬─────────────┐
      │              │        │             │
┌─────┴──────┐  ┌────┴────┐  │        ┌─────┴────────┐
│  Acceso    │  │  Pagos  │  │        │   Clases     │
└────────────┘  └─────────┘  │        └──────────────┘
                              │
                         ┌────┴─────────┐
                         │   Análisis   │
                         │  (solo read) │
                         └──────────────┘
```

### **Flujo de Integración**

1. **Pago → Membresía**
   - `Pago.completado()` dispara evento
   - `Membresia.renovar()` escucha evento
   - Transacción única en DB

2. **Membresía → Acceso**
   - `Acceso.validar()` llama a `MembresiasService.obtener()`
   - Validación síncrona (acceso inmediato)

3. **Membresía → Clases**
   - `Inscripcion.crear()` valida Membresia
   - Anti-corruption layer traduce tipos

4. **Todos → Análisis**
   - Lectura de eventos históricos
   - Cálculos offline (no bloquea)

---

## 📝 PATRONES DE DISEÑO (DDD)

### **Agregados**
```
Membresia (raíz)
├── Plan (Value Object)
├── Estado (Value Object)
└── Auditoría (Entity dentro del agregado)

Clase (raíz)
├── Espacio (Value Object)
├── Inscriciones (Entity dentro del agregado)
└── Estado (Value Object)

Pago (raíz)
├── Transaccion (Entity dentro del agregado)
└── Money (Value Object)
```

### **Value Objects**
- `MembresiId`, `MiembroId`, `Money`, `Plan`
- Inmutables, sin identidad de base de datos
- Comparables por valor

### **Eventos de Dominio**
```typescript
class MembresiRenovada {
  constructor(
    public miembroId: MiembroId,
    public nuevaFechaVencimiento: Date,
    public timestamp: Date
  ) {}
}

class PagoCompletado {
  constructor(
    public pagoId: PagoId,
    public membresiId: MembresiId,
    public timestamp: Date
  ) {}
}

class AccesoDenegado {
  constructor(
    public miembroId: MiembroId,
    public razon: string,
    public timestamp: Date
  ) {}
}
```

---

## ✅ VALIDACIONES EN DOMAIN (No en Frontend/DB)

Cada entidad valida sus propias invariantes:

```typescript
// Ejemplo: Membresia.validar()
class Membresia {
  validar(): void {
    if (this.fechaVencimiento <= this.fechaInicio) {
      throw new DomainError(
        "Vencimiento debe ser posterior a inicio"
      )
    }
    if (!this.plan.esValido()) {
      throw new DomainError("Plan inválido")
    }
  }
}
```

---

## 🚀 PRÓXIMO PASO

**→ ARCHITECTURE.md definirá cómo estas entidades se organizan en capas (Domain, Application, Infrastructure)**

---

*DOMAIN.md v1.0 — Lenguaje ubicuo + Agregados DDD*
