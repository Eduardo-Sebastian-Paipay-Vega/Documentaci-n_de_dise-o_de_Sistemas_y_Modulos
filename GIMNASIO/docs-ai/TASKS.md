# TASKS.md: Roadmap de Refactorización DDD+ACID
> **Versión**: 1.0  
> **Propósito**: Migración iterativa sin romper la aplicación  
> **Estrategia**: Módulo por módulo, del menos al más crítico  

---

## 📊 DEPENDENCIAS ENTRE MÓDULOS

```
        Miembros
         (base)
           ↓
        ┌──────────────────────┐
        ↓                       ↓
    Membresías            Acceso
        ↓                   ↓
      Pagos          (validar membresia)
        ↓
    Clases (validar membresia)
        ↓
    Análisis (solo lectura)
```

**Orden de Refactorización**: Respetar esta jerarquía

---

## 🎯 FASE 0: PREPARACIÓN (1-2 días)

### **TAREA 0.1: Crear Backend separado (Node.js + Express)**
```
Estado: 🟡 BLOQUEADOR
Dependencias: Ninguna
Duración: 1-2 días
```

**Checklist**:
- [ ] Crear repositorio `gymsos-backend` (separado de frontend)
- [ ] Setup: Node.js + Express + TypeScript + Supabase client
- [ ] Crear estructura de carpetas (domain, application, infrastructure)
- [ ] Configurar variables de entorno (.env, .env.test)
- [ ] Crear IoC Container básico
- [ ] Setup Jest para tests

**Resultado**: Backend skeleton listo, CI/CD configurado

---

### **TAREA 0.2: Setup de Transacciones Supabase**
```
Estado: 🟡 BLOQUEADOR
Dependencias: TAREA 0.1
Duración: 4-6 horas
```

**Checklist**:
- [ ] Crear `TransactionManager` interface
- [ ] Implementar `SupabaseTransactionManager`
- [ ] Crear helpers para BEGIN/COMMIT/ROLLBACK
- [ ] Escribir tests de transacción atómica
- [ ] Documentar cómo usar en Application Layer

**Código a incluir**:
```typescript
// infrastructure/persistence/transaction-manager.ts
export interface TransactionManager {
  begin(): Promise<Transaction>
}

export class SupabaseTransactionManager implements TransactionManager {
  async begin(): Promise<Transaction> {
    // Implementar usando Supabase RPC o conexión directa
  }
}
```

---

## 🏗️ FASE 1: MIEMBROS (3-4 días)

### **TAREA 1.1: Crear Domain Layer para Miembros**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 0.1
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `Miembro` entity
- [ ] Crear `Rol` value object
- [ ] Crear `MiembroId` value object
- [ ] Crear `MiembrosRepository` interface (puerto)
- [ ] Crear `MiembroErrors` (excepciones de dominio)
- [ ] Crear eventos: `MiembroRegistrado`, `MiembroActualizado`

**Archivo**: `src/domain/miembros/`

---

### **TAREA 1.2: Crear Application Layer para Miembros**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 1.1
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `RegistrarMiembro` use case
- [ ] Crear `ActualizarMiembro` use case
- [ ] Crear `ObtenerMiembro` use case
- [ ] Crear DTOs (RegistroDTO, ActualizacionDTO, etc)
- [ ] Crear validadores cross-context
- [ ] Escribir tests unitarios

**Archivo**: `src/application/miembros/`

---

### **TAREA 1.3: Crear Infrastructure Adapter (Supabase)**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 1.2
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `SupabaseMiembrosRepository` (implementa puerto)
- [ ] Crear `MiembrosMapper` (Domain ↔ DB)
- [ ] Crear HTTP controller
- [ ] Crear routes: GET, POST, PUT
- [ ] Escribir integration tests

**Archivo**: `src/infrastructure/persistence/supabase/miembros.repository.ts`

---

### **TAREA 1.4: Integrar con Auth System**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 1.3
Duración: 1-2 horas
```

**Checklist**:
- [ ] Conectar Supabase Auth con `Miembro` entity
- [ ] Crear middleware de autenticación
- [ ] Crear tests de autorización
- [ ] Documentar flujo de auth

**Resultado**: Módulo Miembros completamente refactorizado

---

## 💳 FASE 2: MEMBRESÍAS (4-5 días)

### **TAREA 2.1: Crear Domain Layer para Membresías**
```
Estado: 🔴 PENDIENTE
Dependencias: FASE 1 completada
Duración: 3-4 horas
```

**Checklist**:
- [ ] Crear `Membresia` entity (aggregate root)
- [ ] Crear `Plan` value object
- [ ] Crear `EstadoMembresia` value object
- [ ] Crear invariantes: `estaVencida()`, `puedeRenovarse()`
- [ ] Crear `MembresiasRepository` interface
- [ ] Crear eventos: `MembresiRenovada`, `MembresiVencida`, `MembresiCancelada`

**Archivo**: `src/domain/membresias/`

---

### **TAREA 2.2: Crear Application Layer para Membresías**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 2.1
Duración: 3-4 horas
```

**Checklist**:
- [ ] Crear `RegistrarMembresia` use case
- [ ] Crear `RenovarMembresia` use case (CRÍTICO)
- [ ] Crear `CancelarMembresia` use case
- [ ] Crear `ValidarMembresia` use case (para otros contextos)
- [ ] Crear `DetectarVencimientos` use case (job)
- [ ] Implementar transacciones explícitas
- [ ] Escribir tests con transacciones

**Código crítico**:
```typescript
// application/membresias/renovar-membresia.case.ts
async execute(comando: RenovarMembresiCommand): Promise<void> {
  const tx = await this.txManager.begin()
  try {
    const membresia = await this.repo.obtener(comando.id)
    membresia.renovar(comando.nuevaFecha)
    await this.repo.actualizar(membresia)
    await this.auditRepo.registrar(...)
    await tx.commit()
    this.eventBus.publish(new MembresiRenovada(...))
  } catch (error) {
    await tx.rollback()
    throw error
  }
}
```

---

### **TAREA 2.3: Crear Infrastructure Adapter**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 2.2
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `SupabaseMembresiasRepository`
- [ ] Crear `MembresiasMapper`
- [ ] Crear HTTP controller
- [ ] Crear routes: GET, POST, PUT, DELETE
- [ ] Crear integration tests (con transacciones reales)

**Resultado**: Membresías con ACID garantizado

---

## 💰 FASE 3: PAGOS (5-6 días)

### **TAREA 3.1: Crear Domain Layer para Pagos**
```
Estado: 🔴 PENDIENTE
Dependencias: FASE 2 completada
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `Pago` entity
- [ ] Crear `Transaccion` value object
- [ ] Crear `MetodoPago` enum
- [ ] Crear `EstadoPago` enum
- [ ] Crear `Money` value object
- [ ] Crear `PagosRepository` interface
- [ ] Crear eventos: `PagoCompletado`, `PagoFallido`

---

### **TAREA 3.2: Stripe Integration (Anti-Corruption Layer)**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 3.1
Duración: 3-4 horas
```

**Checklist**:
- [ ] Crear `StripeAdapter` (externa)
- [ ] Crear webhook handler para `payment_intent.succeeded`
- [ ] Crear webhook handler para `payment_intent.payment_failed`
- [ ] Implementar reintentos automáticos
- [ ] Crear tests con Stripe test client

**Código**:
```typescript
// infrastructure/external/stripe/stripe-webhook.handler.ts
async handlePaymentSucceeded(event: StripeEvent) {
  const confirmPagoCase = this.container.confirmarPago
  await confirmPagoCase.execute(event.data.object.id)
}
```

---

### **TAREA 3.3: Crear Application Layer para Pagos**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 3.2
Duración: 3-4 horas
```

**Checklist**:
- [ ] Crear `ConfirmarPago` use case (webhook)
- [ ] Crear `ReembolsarPago` use case
- [ ] Implementar idempotencia (Stripe puede reintentar)
- [ ] Integración con `RenovarMembresia`
- [ ] Escribir tests e2e (pago → renovación)

---

### **TAREA 3.4: Create Infrastructure**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 3.3
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `SupabasePagosRepository`
- [ ] Crear `PagosMapper`
- [ ] Crear HTTP controller
- [ ] Crear webhook endpoint: POST /webhooks/stripe
- [ ] Crear integration tests

**Resultado**: Pagos con Stripe integrado, renovación atómica

---

## 🚪 FASE 4: ACCESO (4-5 días)

### **TAREA 4.1: Crear Domain Layer para Acceso**
```
Estado: 🔴 PENDIENTE
Dependencias: FASE 2 completada (para validación de membresia)
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `Acceso` entity
- [ ] Crear `AuditoriaAcceso` entity
- [ ] Crear `TipoAcceso` enum (QR, biometría, manual)
- [ ] Crear `EstadoAcceso` enum
- [ ] Crear `AccesosRepository` interface
- [ ] Crear eventos: `AccesoDenegado`, `AccesoPermitido`

---

### **TAREA 4.2: Crear Application Layer para Acceso**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 4.1 + ValidarMembresia de FASE 2
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `ProcesarAccesoQR` use case (CRÍTICO)
- [ ] Crear `RegistrarSalida` use case
- [ ] Integración con `MembresiasService.validar()`
- [ ] Implementar transacciones: Acceso + AuditoriaAcceso
- [ ] Tests de validación (membresia activa, no vencida)

**Código crítico**:
```typescript
// application/acceso/procesar-acceso-qr.case.ts
async execute(cmd: ProcesarAccesoQRCommand): Promise<ResultadoAcceso> {
  const tx = await this.txManager.begin()
  try {
    // Validar membresia (cross-context call)
    const esValida = await this.membresiasService.validar(cmd.miembroId)
    
    if (!esValida) {
      const acceso = Acceso.crear(cmd.miembroId, "qr", "denegado", "Membresia inválida")
      await this.repo.guardar(acceso)
      await this.auditRepo.registrar(...)
      await tx.commit()
      return { permitido: false, razon: "Membresia inválida" }
    }
    
    // Permitir acceso
    const acceso = Acceso.crear(cmd.miembroId, "qr", "permitido")
    await this.repo.guardar(acceso)
    await this.auditRepo.registrar(...)
    await tx.commit()
    return { permitido: true }
    
  } catch (error) {
    await tx.rollback()
    return { permitido: false, razon: "Error de sistema" }
  }
}
```

---

### **TAREA 4.3: Crear Infrastructure + QR Decoder**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 4.2
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `SupabaseAccesosRepository`
- [ ] Crear QR decoder (jsQR o librería similar)
- [ ] Crear HTTP endpoint: POST /api/torniquete/qr
- [ ] Crear mocked hardware para tests
- [ ] Tests de performance (100ms)

**Resultado**: Acceso con validación transaccional garantizada

---

## 📚 FASE 5: CLASES (3-4 días)

### **TAREA 5.1: Crear Domain Layer para Clases**
```
Estado: 🔴 PENDIENTE
Dependencias: FASE 2 completada
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `Clase` entity
- [ ] Crear `Inscripcion` entity
- [ ] Crear `Espacio` value object
- [ ] Crear invariantes: `obtenerCuposDisponibles()`, `puedeAgregarInscripcion()`
- [ ] Crear `ClasesRepository` interface
- [ ] Crear eventos: `ClaseCancelada`, `InscripcionCreada`

---

### **TAREA 5.2: Crear Application Layer**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 5.1 + ValidarMembresia
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `CrearClase` use case
- [ ] Crear `InscribirEnClase` use case (validar capacidad + membresia)
- [ ] Crear `CancelarClase` use case (notificar inscritos)
- [ ] Tests de invariantes

---

### **TAREA 5.3: Crear Infrastructure**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 5.2
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `SupabaseClasesRepository`
- [ ] Crear HTTP endpoints
- [ ] Crear integration tests

**Resultado**: Gestión de clases con capacidad garantizada

---

## 📊 FASE 6: ANÁLISIS (2-3 días)

### **TAREA 6.1: Crear Domain para Análisis**
```
Estado: 🔴 PENDIENTE
Dependencias: TODOS los otros módulos (lectura)
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear `MetricaMiembro` entity (lectura)
- [ ] Crear `PrediccionChurn` entity (lectura)
- [ ] NO requiere transacciones
- [ ] Crear queries analíticas

---

### **TAREA 6.2: Implementar Jobs Offline**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 6.1
Duración: 2-3 horas
```

**Checklist**:
- [ ] Crear job: `CalcularMetricasHorarias` (cada hora)
- [ ] Crear job: `DetectarChurn` (diario)
- [ ] Crear listeners para eventos (PagoCompletado, AccesoPermitido, etc)
- [ ] Cron scheduler (node-cron)

---

## 🔌 FASE 7: FRONTEND MIGRATION (3-4 días)

### **TAREA 7.1: Crear API Client**
```
Estado: 🔴 PENDIENTE
Dependencias: TODAS las fases backend
Duración: 1-2 horas
```

**Checklist**:
- [ ] Crear cliente HTTP reutilizable
- [ ] Crear error handling
- [ ] Crear retry logic

---

### **TAREA 7.2: Integrar con Nuevo Backend**
```
Estado: 🔴 PENDIENTE
Dependencias: TAREA 7.1
Duración: 2-3 horas
```

**Checklist**:
- [ ] Reemplazar calls a Supabase directo → API
- [ ] Mantener UI componentes (no cambiar)
- [ ] Tests de integración frontend

---

## 📋 MATRIZ: RESUMEN DE TAREAS

| Fase | Tarea | Duración | Bloqueador | Estado |
|------|-------|----------|-----------|--------|
| 0.1 | Setup Backend | 1-2d | ✅ | 🔴 |
| 0.2 | Transacciones | 4-6h | ✅ | 🔴 |
| 1.1 | Domain Miembros | 2-3h | — | 🔴 |
| 1.2 | App Miembros | 2-3h | 1.1 | 🔴 |
| 1.3 | Infra Miembros | 2-3h | 1.2 | 🔴 |
| 1.4 | Auth Integration | 1-2h | 1.3 | 🔴 |
| 2.1 | Domain Membresías | 3-4h | 1 | 🔴 |
| 2.2 | App Membresías | 3-4h | 2.1 | 🔴 |
| 2.3 | Infra Membresías | 2-3h | 2.2 | 🔴 |
| 3.1 | Domain Pagos | 2-3h | 2 | 🔴 |
| 3.2 | Stripe Integration | 3-4h | 3.1 | 🔴 |
| 3.3 | App Pagos | 3-4h | 3.2 | 🔴 |
| 3.4 | Infra Pagos | 2-3h | 3.3 | 🔴 |
| 4.1 | Domain Acceso | 2-3h | 2 | 🔴 |
| 4.2 | App Acceso | 2-3h | 4.1, 2 | 🔴 |
| 4.3 | Infra Acceso | 2-3h | 4.2 | 🔴 |
| 5.1 | Domain Clases | 2-3h | 2 | 🔴 |
| 5.2 | App Clases | 2-3h | 5.1 | 🔴 |
| 5.3 | Infra Clases | 2-3h | 5.2 | 🔴 |
| 6.1 | Domain Análisis | 2-3h | All | 🔴 |
| 6.2 | Jobs Análisis | 2-3h | 6.1 | 🔴 |
| 7.1 | API Client | 1-2h | All Backend | 🔴 |
| 7.2 | Frontend Integration | 2-3h | 7.1 | 🔴 |

**DURACIÓN TOTAL ESTIMADA**: 60-75 días (8-11 semanas)

---

## 🎯 MILESTONES CRÍTICOS

```
SEMANA 1-2
└─ ✅ Backend skeleton + Transacciones
└─ ✅ Miembros completamente refactorizado

SEMANA 2-3
└─ ✅ Membresías con ACID
└─ ✅ Pagos integrados con Stripe

SEMANA 3-4
└─ ✅ Acceso QR con validaciones

SEMANA 4-5
└─ ✅ Clases y análisis

SEMANA 5-6
└─ ✅ Frontend conectado a backend
└─ ✅ PRODUCCIÓN LISTA
```

---

## ✅ DEFINICIÓN DE "COMPLETADO"

Cada tarea está completada cuando:

1. ✅ Código escrito en Domain, Application, Infrastructure
2. ✅ Tests unitarios (>80% cobertura)
3. ✅ Tests de integración (con BD real o mock)
4. ✅ Documentación actualizada (DOMAIN.md, etc)
5. ✅ Code review completado
6. ✅ Merged a rama `main`
7. ✅ Sin breaking changes

---

## 🚀 PRÓXIMO PASO

**→ Comenzar TAREA 0.1: Setup Backend separado**

Confirma cuándo iniciar y cuáles son tus disponibilidades para este roadmap.

---

*TASKS.md v1.0 — Roadmap de migración DDD+ACID*
