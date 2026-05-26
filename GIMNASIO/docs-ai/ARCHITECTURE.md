# ARCHITECTURE.md: Estructura de Capas DDD + Hexagonal
> **Versión**: 1.0  
> **Patrón**: Domain-Driven Design + Arquitectura Hexagonal + Clean Architecture  
> **Propósito**: Definir la estructura de carpetas y responsabilidades por capa  

---

## 🏗️ ARQUITECTURA HEXAGONAL (PORTS & ADAPTERS)

```
┌─────────────────────────────────────────────────────────┐
│                   APP DELIVERY LAYER                     │
│  (Next.js Components, HTTP API, CLI, WebSockets, etc)  │
└──────────────────────┬──────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
 ┌─────────┐   ┌──────────────┐   ┌──────────┐
 │ API     │   │   HTTP       │   │  PORTS   │
 │Adapter  │   │  Contadores  │   │Interface │
 └────┬────┘   └──────┬───────┘   └────┬─────┘
      │               │                 │
      └───────────────┼─────────────────┘
                      │
                      ▼
      ┌───────────────────────────────────┐
      │    APPLICATION LAYER (Use Cases)  │
      │  • Services (Orquestación)        │
      │  • DTOs                           │
      │  • Errores de aplicación          │
      └───────┬─────────────┬─────────────┘
              │             │
              ▼             ▼
      ┌──────────────┐  ┌──────────────┐
      │   Domain     │  │ Repositories │
      │   Layer      │  │   (Ports)    │
      └──────────────┘  └──────┬───────┘
                                │
                    ┌───────────┘
                    ▼
      ┌───────────────────────────────────┐
      │  INFRASTRUCTURE LAYER (Adapters)  │
      │  • Database (Supabase)            │
      │  • External APIs (Stripe)         │
      │  • Mappers (Domain ↔ DB)          │
      └───────────────────────────────────┘
```

---

## 📁 ESTRUCTURA DE CARPETAS PROPUESTA

```
gymsos-backend/                         # Backend puro (Node.js)
├── src/
│   ├── domain/                         # CAPA DE DOMINIO (SIN dependencias externas)
│   │   ├── membresias/
│   │   │   ├── membresia.ts            # Entity
│   │   │   ├── plan.ts                 # Value Object
│   │   │   ├── estado-membresia.ts     # Value Object/Enum
│   │   │   ├── membresia.errors.ts     # DomainErrors específicos
│   │   │   ├── membresia.repository.ts # Interface (Puerto)
│   │   │   └── eventos/
│   │   │       ├── membresia-renovada.ts
│   │   │       └── membresia-vencida.ts
│   │   │
│   │   ├── acceso/
│   │   │   ├── acceso.ts
│   │   │   ├── tipo-acceso.ts
│   │   │   ├── estado-acceso.ts
│   │   │   ├── auditoria-acceso.ts
│   │   │   ├── acceso.repository.ts
│   │   │   └── eventos/
│   │   │       └── acceso-denegado.ts
│   │   │
│   │   ├── pagos/
│   │   │   ├── pago.ts
│   │   │   ├── transaccion.ts
│   │   │   ├── metodo-pago.ts
│   │   │   ├── pago.repository.ts
│   │   │   └── eventos/
│   │   │       └── pago-completado.ts
│   │   │
│   │   ├── clases/
│   │   │   ├── clase.ts
│   │   │   ├── inscripcion.ts
│   │   │   ├── espacio.ts
│   │   │   ├── clase.repository.ts
│   │   │   └── eventos/
│   │   │       └── clase-cancelada.ts
│   │   │
│   │   ├── miembros/
│   │   │   ├── miembro.ts
│   │   │   ├── rol.ts
│   │   │   └── miembro.repository.ts
│   │   │
│   │   └── shared/
│   │       ├── domain-error.ts         # Clase base para errores
│   │       ├── aggregate-root.ts       # Base para entidades
│   │       ├── value-object.ts         # Base para VOs
│   │       ├── entity.ts               # Base para entidades no-root
│   │       ├── event.ts                # Base para domain events
│   │       └── id.ts                   # Base para IDs
│   │
│   ├── application/                    # CAPA DE APLICACIÓN (Orquestación)
│   │   ├── membresias/
│   │   │   ├── registrar-membresia.case.ts      # Caso de uso
│   │   │   ├── renovar-membresia.case.ts
│   │   │   ├── cancelar-membresia.case.ts
│   │   │   ├── validar-membresia.case.ts
│   │   │   ├── membresia.dto.ts                 # DTOs
│   │   │   ├── membresia-validada.response.ts
│   │   │   └── membresia.service.ts             # Servicio orquestador
│   │   │
│   │   ├── acceso/
│   │   │   ├── procesar-acceso-qr.case.ts
│   │   │   ├── registrar-acceso.case.ts
│   │   │   ├── acceso.service.ts
│   │   │   └── acceso.dto.ts
│   │   │
│   │   ├── pagos/
│   │   │   ├── procesar-pago.case.ts
│   │   │   ├── confirmar-pago.case.ts
│   │   │   ├── reembolsar-pago.case.ts
│   │   │   ├── pago.service.ts
│   │   │   └── pago.dto.ts
│   │   │
│   │   ├── clases/
│   │   │   ├── crear-clase.case.ts
│   │   │   ├── inscribir-en-clase.case.ts
│   │   │   ├── clase.service.ts
│   │   │   └── clase.dto.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── use-case.interface.ts
│   │   │   ├── event-bus.interface.ts
│   │   │   └── exception.ts
│   │   │
│   │   └── validators/
│   │       └── membresia.validator.ts  # Lógica de validación cross-contexto
│   │
│   ├── infrastructure/                 # CAPA DE INFRAESTRUCTURA (Adaptadores)
│   │   ├── persistence/
│   │   │   ├── supabase/
│   │   │   │   ├── membresia.repository.ts     # Implementación de puerto
│   │   │   │   ├── acceso.repository.ts
│   │   │   │   ├── pago.repository.ts
│   │   │   │   ├── clase.repository.ts
│   │   │   │   ├── miembro.repository.ts
│   │   │   │   └── mappers/
│   │   │   │       ├── membresia.mapper.ts     # Domain ↔ DB
│   │   │   │       ├── acceso.mapper.ts
│   │   │   │       └── pago.mapper.ts
│   │   │   └── transaction-manager.ts         # Gestor de transacciones
│   │   │
│   │   ├── external/
│   │   │   ├── stripe/
│   │   │   │   ├── stripe.adapter.ts
│   │   │   │   └── stripe-webhook.handler.ts
│   │   │   └── whatsapp/
│   │   │       └── whatsapp.adapter.ts
│   │   │
│   │   ├── event-bus/
│   │   │   ├── event-bus.impl.ts        # Implementación del bus
│   │   │   └── handlers/
│   │   │       ├── pago-completado.handler.ts
│   │   │       ├── acceso-denegado.handler.ts
│   │   │       └── membresia-vencida.handler.ts
│   │   │
│   │   └── http/
│   │       ├── controllers/
│   │       │   ├── membresia.controller.ts
│   │       │   ├── acceso.controller.ts
│   │       │   ├── pago.controller.ts
│   │       │   └── clase.controller.ts
│   │       ├── middlewares/
│   │       │   ├── auth.middleware.ts
│   │       │   ├── error-handler.ts
│   │       │   └── transaction.middleware.ts
│   │       └── routes/
│   │           ├── membresias.routes.ts
│   │           ├── acceso.routes.ts
│   │           └── pagos.routes.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── ioc.container.ts            # Inyección de dependencias
│   │
│   └── main.ts                         # Entrada principal
│
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   │   ├── membresia.spec.ts
│   │   │   ├── acceso.spec.ts
│   │   │   └── pago.spec.ts
│   │   └── application/
│   │       ├── renovar-membresia.spec.ts
│   │       └── procesar-acceso.spec.ts
│   │
│   ├── integration/
│   │   ├── membresia.integration.spec.ts
│   │   ├── pago.integration.spec.ts
│   │   └── transaccion.integration.spec.ts
│   │
│   └── e2e/
│       └── flujos-criticos.e2e.spec.ts
│
├── package.json
├── tsconfig.json
└── README.md

gymsos-frontend/                        # Frontend (Next.js) — Solo presentación
├── src/
│   ├── app/
│   │   ├── dashboard/[rol]/            # UI por rol
│   │   ├── login/
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── shared/                     # Componentes reutilizables
│   │   └── pages/                      # Componentes de página
│   │
│   ├── lib/
│   │   ├── api-client.ts               # Cliente HTTP (sin lógica de negocio)
│   │   ├── auth.ts                     # Solo context de autenticación
│   │   └── utils.ts
│   │
│   └── hooks/                          # React hooks para UI
│
└── package.json
```

---

## 🔐 REGLAS DE DEPENDENCIA (THE DEPENDENCY RULE)

### **FLECHA DE DEPENDENCIA** (Solo hacia adentro)
```
Infrastructure → Application → Domain
              ↘    ↓
                   Domain (nunca sale)
```

### **Regla 1: Domain nunca importa desde Application o Infrastructure**
```typescript
// ✅ PERMITIDO
import { EstadoMembresia } from "./estado-membresia"
import { MembresiId } from "./membresia-id"

// ❌ PROHIBIDO
import { MembresiasRepository } from "@/application/..."
import { SupabaseClient } from "@supabase/supabase-js"
```

### **Regla 2: Application puede importar Domain, nunca Infrastructure**
```typescript
// ✅ PERMITIDO
import { Membresia } from "@/domain/membresias/membresia"
import { MembresiasRepository } from "@/domain/membresias/membresia.repository"

// ❌ PROHIBIDO
import { SupabaseMembresiasRepository } from "@/infrastructure/..."
```

### **Regla 3: Infrastructure implementa Puertos de Domain/Application**
```typescript
// ✅ CORRECTO
export class SupabaseMembresiasRepository implements MembresiasRepository {
  async obtener(id: MembresiId): Promise<Membresia | null> { ... }
}

// ❌ INCORRECTO
export class MembresiasRepository {
  async queryFromSupabase() { ... }  // NO usar BD directamente
}
```

---

## 🔄 FLUJO DE UNA SOLICITUD (REQUEST FLOW)

### **Ejemplo: Renovar Membresía**

```
┌─────────────────────────────────────┐
│ 1. HTTP REQUEST                     │
│    POST /api/membresias/:id/renovar │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. CONTROLLER (Infrastructure)      │
│    • Parsear request                │
│    • Validar autorización           │
│    • Crear DTO                      │
│    • Llamar USE CASE                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. USE CASE (Application)           │
│    • Obtener Membresia del repo     │
│    • Llamar métodos de Domain       │
│    • Abrir TRANSACCIÓN              │
│    • Actualizar estado              │
│    • Disparar eventos               │
│    • Cerrar transacción (commit)    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. DOMAIN (Membresia)               │
│    • renovar(nuevaFecha)            │
│    • Validar invariantes            │
│    • Cambiar estado                 │
│    • Retornar entity actualizada    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. REPOSITORY (Infrastructure)      │
│    • Mapear Membresia → DbRecord    │
│    • Ejecutar SQL INSERT/UPDATE     │
│    • Registrar auditoría            │
│    • Retornar resultado             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 6. EVENT BUS (Infrastructure)       │
│    • PagoCompletado → Escuchadores  │
│    • Enviar notificación WhatsApp   │
│    • Registrar métrica              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 7. HTTP RESPONSE                    │
│    { status: 200, data: { ... } }   │
└─────────────────────────────────────┘
```

---

## 🔌 PUERTOS (INTERFACES DE CONTRATO)

### **Puerto: MembresiasRepository**
```typescript
// domain/membresias/membresia.repository.ts
export interface MembresiasRepository {
  obtener(id: MembresiId): Promise<Membresia | null>
  obtenerPorMiembro(miembroId: MiembroId): Promise<Membresia | null>
  guardar(membresia: Membresia): Promise<void>
  actualizar(id: MembresiId, cambios: Membresia): Promise<void>
  eliminar(id: MembresiId): Promise<void>
}
```

### **Adaptador: SupabaseMembresiasRepository**
```typescript
// infrastructure/persistence/supabase/membresia.repository.ts
export class SupabaseMembresiasRepository implements MembresiasRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async obtener(id: MembresiId): Promise<Membresia | null> {
    const { data } = await this.supabase
      .from("membresias")
      .select("*")
      .eq("id_membresia", id.valor)
      .single()
    
    if (!data) return null
    return MembresiasMapper.toDomain(data)
  }
  
  async guardar(membresia: Membresia): Promise<void> {
    const record = MembresiasMapper.toPersistence(membresia)
    await this.supabase
      .from("membresias")
      .insert(record)
  }
}
```

---

## 💾 TRANSACCIONES (ACID en Supabase)

### **Transaction Manager**
```typescript
// infrastructure/persistence/transaction-manager.ts
export interface TransactionManager {
  begin(): Promise<Transaction>
}

export interface Transaction {
  commit(): Promise<void>
  rollback(): Promise<void>
  execute<T>(fn: () => Promise<T>): Promise<T>
}

// Implementación Supabase
export class SupabaseTransactionManager implements TransactionManager {
  async begin(): Promise<Transaction> {
    const client = this.supabase.rpc("begin_transaction")
    return new SupabaseTransaction(client)
  }
}
```

### **Uso en Application Layer**
```typescript
// application/membresias/renovar-membresia.case.ts
async execute(comando: RenovarMembresiCommand): Promise<void> {
  const tx = await this.txManager.begin()
  
  try {
    // Paso 1: Obtener membresia
    const membresia = await this.repo.obtener(comando.id)
    
    // Paso 2: Validar y cambiar estado
    membresia.renovar(comando.nuevaFecha)
    
    // Paso 3: Persistir (dentro de transacción)
    await this.repo.actualizar(membresia)
    
    // Paso 4: Registrar auditoría
    await this.auditRepo.registrar({
      accion: "renovacion",
      membresiId: membresia.id,
      timestamp: new Date()
    })
    
    // Paso 5: Commit atómico
    await tx.commit()
    
    // Paso 6: Disparar evento (DESPUÉS del commit)
    this.eventBus.publish(new MembresiRenovada(...))
    
  } catch (error) {
    await tx.rollback()
    throw error
  }
}
```

---

## 🎯 INYECCIÓN DE DEPENDENCIAS

### **IoC Container**
```typescript
// config/ioc.container.ts
export class Container {
  // Singletons
  static supabase = createClient(...)
  
  // Repositorios (implementaciones)
  static membresiasRepository = 
    new SupabaseMembresiasRepository(this.supabase)
  
  static accesoRepository = 
    new SupabaseAccesoRepository(this.supabase)
  
  // Services (casos de uso)
  static renovarMembresia = 
    new RenovarMembresia(
      this.membresiasRepository,
      this.transactionManager,
      this.eventBus
    )
  
  static procesarAcceso = 
    new ProcesarAcceso(
      this.accesoRepository,
      this.membresiasRepository,
      this.transactionManager
    )
}
```

---

## ✅ VALIDACIÓN EN CAPAS

```
┌──────────────────────────────────────────────┐
│ Frontend (Next.js)                           │
│ • Validación de formato (email, fecha)       │
│ • Feedback visual al usuario                 │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│ Application (Casos de Uso)                   │
│ • Validación de autorización (quién pregunta)│
│ • Validación de pre-requisitos               │
│ • Orquestación transaccional                 │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│ Domain (Entidades)                           │
│ • Validación de invariantes de negocio       │
│ • Reglas que NUNCA pueden romperse          │
│ • Métodos que garantizan consistencia       │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│ Infrastructure (Base de Datos)               │
│ • Constraints SQL (last-line-of-defense)     │
│ • Índices para integridad referencial        │
└──────────────────────────────────────────────┘
```

---

## 🚀 PRÓXIMO PASO

**→ ACID_RULES.md especificará exactamente qué flujos requieren transacciones y qué puede fallar**

---

*ARCHITECTURE.md v1.0 — Estructura de capas + Puertos & Adaptadores*
