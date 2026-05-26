# ACID_RULES.md: Reglas de Integridad Transaccional
> **Versión**: 1.0  
> **Propósito**: Definir exactamente qué operaciones requieren transacciones ACID  
> **Garantía**: Ninguna operación crítica falla a mitad de camino

---

## ⚡ OPERACIONES CRÍTICAS (Requieren Transacción)

### **1. REGISTRAR NUEVO USUARIO + CREAR MEMBRESIA INICIAL**

**Flujo**:
```
Usuario hace POST /api/registro
  ↓
1. Crear Usuario (tabla usuarios)
2. Crear Membresia (tabla membresias)
3. Crear record de auditoría (tabla auditoria)
  ↓
¿RESULTADO? Ambos creados O ninguno (no estado intermedio)
```

**Tipo de Transacción**: SERIAL (una después de otra dentro de misma transacción)

**Implementación Requerida**:
```typescript
// application/usuarios/registrar-usuario.case.ts
async execute(cmd: RegistroCommand): Promise<UsuarioDTO> {
  const tx = await this.txManager.begin()
  
  try {
    // 1. Crear usuario (Domain)
    const usuario = Usuario.crear(
      cmd.email, cmd.nombre, cmd.telefono, "miembro"
    )
    usuario.validar()
    
    // 2. Persistir usuario
    const usuarioGuardado = await this.usuariosRepo.guardar(usuario)
    
    // 3. Crear membresia inicial
    const plan = await this.planesRepo.obtenerDefault()
    const membresia = Membresia.crear(usuarioGuardado.id, plan, new Date())
    membresia.validar()
    
    // 4. Persistir membresia
    await this.membresiasRepo.guardar(membresia)
    
    // 5. Registrar auditoría
    await this.auditoriaRepo.registrar({
      accion: "usuario_registrado",
      usuarioId: usuarioGuardado.id,
      timestamp: new Date()
    })
    
    // 6. COMMIT ATÓMICO (todo o nada)
    await tx.commit()
    
    // 7. Disparar eventos DESPUÉS del commit
    this.eventBus.publish(new UsuarioRegistrado(usuarioGuardado.id))
    
    return UsuarioMapper.toDTO(usuarioGuardado)
    
  } catch (error) {
    // ROLLBACK: Deshace TODOS los cambios
    await tx.rollback()
    throw new RegistroFallido(error.message)
  }
}
```

**Garantía ACID**:
- **Atomicidad**: O se crea usuario+membresia, o ninguno
- **Consistencia**: Membresia siempre apunta a usuario existente
- **Aislamiento**: Otra transacción no ve estado intermedio
- **Durabilidad**: Si commit, datos persisten aunque falle el servidor

**Escenarios de Fallo**:
| Fallo en | Resultado | Rollback |
|----------|-----------|----------|
| Crear usuario | No se crea nada | ✅ Automático |
| Crear membresia | Usuario existe, membresia no | ✅ Deshace usuario |
| Registrar auditoría | Usuario+membresia, auditoría no | ✅ Deshace ambos |

**Timeout**: 5 segundos (evitar deadlocks)

---

### **2. CONFIRMAR PAGO + RENOVAR MEMBRESIA**

**Flujo**:
```
Stripe webhook: Payment_Intent.succeeded
  ↓
1. Buscar Pago en DB
2. Cambiar estado Pago a "completado"
3. Actualizar Membresia: fecha_vencimiento = +30 días
4. Registrar auditoría de pago
5. Desbloquear acceso (marcar como renovada)
  ↓
¿RESULTADO? Todo exitoso O revierte pago (webhook reintenta)
```

**Tipo de Transacción**: CRITICAL (Money involved)

**Implementación Requerida**:
```typescript
// application/pagos/confirmar-pago.case.ts
async execute(webhookData: StripeEvent): Promise<void> {
  const tx = await this.txManager.begin()
  
  try {
    // 1. Obtener pago pendiente
    const pago = await this.pagosRepo.obtenerPorTransaccion(
      webhookData.id
    )
    if (!pago) {
      throw new PagoNoEncontrado()
    }
    
    // 2. Marcar pago como completado
    pago.marcarCompletado(webhookData.id)
    await this.pagosRepo.actualizar(pago)
    
    // 3. Renovar membresia
    const membresia = await this.membresiasRepo.obtener(
      pago.membresiId
    )
    if (!membresia) {
      throw new MembresiNoEncontrada()
    }
    
    const nuevaFecha = this.calcularFechaVencimiento(
      membresia.plan.duracionDias
    )
    membresia.renovar(nuevaFecha)
    await this.membresiasRepo.actualizar(membresia)
    
    // 4. Registrar auditoría de pago
    await this.auditoriaRepo.registrar({
      accion: "pago_completado",
      pagoId: pago.id,
      membresiId: membresia.id,
      monto: pago.monto,
      timestamp: new Date()
    })
    
    // 5. COMMIT ATÓMICO
    await tx.commit()
    
    // 6. Eventos DESPUÉS de commit
    this.eventBus.publish(new PagoCompletado(pago.id))
    this.eventBus.publish(new MembresiRenovada(membresia.id))
    
    // 7. Enviar confirmación (fuera de transacción)
    await this.notificacionService.enviarConfirmacion(pago.miembroId)
    
  } catch (error) {
    await tx.rollback()
    
    // CRITICAL: Stripe debe reintentar
    logger.error(`Confirmación de pago fallió: ${webhookData.id}`, error)
    throw new ConfirmacionPagoFallida(error.message)
  }
}
```

**Garantía ACID**:
- **Atomicidad**: Pago + Membresia juntos, o webhook reintenta
- **Consistencia**: Miembro tiene acceso activo si y solo si pago completado
- **Durabilidad**: Registro de pago permanente para auditoría

**Escenarios de Fallo**:
| Fallo en | Dinero Cobrado | Membresia Renovada | Acción |
|----------|----------------|--------------------|--------|
| Stripe ya cobró, DB falla | ✅ SÍ | ❌ NO | Webhook reintenta (idempotente) |
| Membresia no existe | ✅ SÍ | ❌ NO | Genera alerta, manual review |
| Auditoría falla | ✅ SÍ | ✅ SÍ | Rollback TODO (pago + membresia) |

**Idempotencia CRÍTICA**: 
```typescript
// Stripe puede enviar mismo evento múltiples veces
// Solución: Usar ID externo de Stripe como clave única
async execute(webhookData: StripeEvent) {
  const pagoExistente = await this.pagosRepo
    .obtenerPorTransaccion(webhookData.id)
  
  if (pagoExistente?.estado === "completado") {
    // Ya procesado, retornar sin hacer nada
    return
  }
  
  // Procesar normalmente
}
```

**Timeout**: 30 segundos (puede ser lento con Stripe)

---

### **3. PROCESAR ACCESO QR (Validar Membresia + Registrar Acceso)**

**Flujo**:
```
Escaneo QR en torniquete
  ↓
1. Decodificar QR → obtener miembroId
2. Obtener membresia del miembro
3. Validar: ¿membresia activa?
4. Validar: ¿membresia NO vencida?
5. Si ambas OK:
   a. Crear Acceso(permitido)
   b. Abrir torniquete
6. Si falla:
   a. Crear Acceso(denegado, razón)
   b. Registrar intento fallido en AuditoriaAcceso
   c. Bloquear torniquete
  ↓
¿RESULTADO? Acceso + Auditoría siempre registrados juntos
```

**Tipo de Transacción**: HIGH-FREQUENCY (Miles al día)

**Implementación Requerida**:
```typescript
// application/acceso/procesar-acceso-qr.case.ts
async execute(cmd: ProcesarAccesoQRCommand): Promise<ResultadoAcceso> {
  const tx = await this.txManager.begin()
  
  try {
    // 1. Obtener membresia
    const membresia = await this.membresiasRepo
      .obtenerPorMiembro(cmd.miembroId)
    
    if (!membresia) {
      return this.denegarAcceso(
        tx, cmd.miembroId, "Membresia no encontrada"
      )
    }
    
    // 2. Validar estado
    if (membresia.estado !== "activa") {
      return this.denegarAcceso(
        tx, cmd.miembroId, `Membresia ${membresia.estado}`
      )
    }
    
    // 3. Validar vencimiento
    if (membresia.estaVencida()) {
      return this.denegarAcceso(
        tx, cmd.miembroId, "Membresia vencida"
      )
    }
    
    // ✅ TODO OK: Permitir acceso
    const acceso = Acceso.crear(
      cmd.miembroId,
      "qr",
      "permitido"
    )
    
    await this.accesoRepo.guardar(acceso)
    await this.auditRepo.registrar({
      accesoId: acceso.id,
      resultado: "permitido",
      timestamp: new Date()
    })
    
    await tx.commit()
    
    return { permitido: true, razon: null }
    
  } catch (error) {
    await tx.rollback()
    
    // SEGURIDAD: No permitir acceso si hay error
    logger.error(`Error en acceso QR: ${error.message}`)
    return { permitido: false, razon: "Error de sistema" }
  }
}

private async denegarAcceso(
  tx: Transaction,
  miembroId: MiembroId,
  razon: string
): Promise<ResultadoAcceso> {
  try {
    const acceso = Acceso.crear(miembroId, "qr", "denegado", razon)
    await this.accesoRepo.guardar(acceso)
    
    await this.auditRepo.registrar({
      accesoId: acceso.id,
      resultado: "denegado",
      razon: razon,
      timestamp: new Date()
    })
    
    await tx.commit()
    return { permitido: false, razon: razon }
    
  } catch (error) {
    await tx.rollback()
    logger.error(`Error negando acceso: ${error.message}`)
    return { permitido: false, razon: "Error de sistema" }
  }
}
```

**Garantía ACID**:
- **Atomicidad**: Acceso + Auditoría siempre juntos
- **Consistencia**: Si denegado, hay motivo en auditoría
- **Durabilidad**: Log completo para análisis de seguridad

**Escenarios de Fallo**:
| Fallo en | Acceso Permitido | Auditoría Registrada | Resultado |
|----------|------------------|-----------------------|-----------|
| Obtener membresia | ❌ NO | ✅ SÍ (intento) | Seguro |
| Validar vencimiento | ❌ NO | ✅ SÍ (denegado) | Seguro |
| Guardar Acceso | ? | ❌ NO | Rollback, denegar acceso |

**Timeout**: 100ms (torniquete esperando)

**Volumen**: 5000 accesos/día = 0.06 accesos/segundo en promedio, picos de 1-2/segundo

---

### **4. CANCELAR CLASE + NOTIFICAR INSCRITOS**

**Flujo**:
```
Gerente solicita: DELETE /api/clases/:id
  ↓
1. Cambiar estado Clase a "cancelada"
2. Obtener todos los Inscritos
3. Crear notificaciones para cada inscrito
4. Registrar auditoría
  ↓
¿RESULTADO? Clase cancelada + N notificaciones creadas (no pierden inscritos)
```

**Tipo de Transacción**: EVENTUAL (no dinero involved)

**Implementación**:
```typescript
// application/clases/cancelar-clase.case.ts
async execute(cmd: CancelarClaseCommand): Promise<void> {
  const tx = await this.txManager.begin()
  
  try {
    // 1. Obtener clase
    const clase = await this.clasesRepo.obtener(cmd.claseId)
    if (!clase) throw new ClaseNoEncontrada()
    
    // 2. Cambiar estado
    clase.cancelar()
    await this.clasesRepo.actualizar(clase)
    
    // 3. Obtener inscritos
    const inscritos = await this.inscripcionesRepo
      .obtenerPorClase(clase.id)
    
    // 4. Crear notificaciones (batch)
    const notificaciones = inscritos.map(i => ({
      miembroId: i.miembroId,
      tipo: "clase_cancelada",
      claseId: clase.id,
      mensaje: `La clase "${clase.nombre}" ha sido cancelada`,
      timestamp: new Date()
    }))
    
    await this.notificacionesRepo.insertarMultiples(notificaciones)
    
    // 5. Registrar auditoría
    await this.auditRepo.registrar({
      accion: "clase_cancelada",
      claseId: clase.id,
      cantidadInscritos: inscritos.length,
      timestamp: new Date()
    })
    
    // 6. COMMIT
    await tx.commit()
    
    // 7. Disparar eventos (para enviar WhatsApp, email, etc)
    this.eventBus.publish(
      new ClassCancelledEvent(clase.id, inscritos.length)
    )
    
  } catch (error) {
    await tx.rollback()
    throw new CancelacionClaseFallida(error.message)
  }
}
```

**Garantía ACID**:
- **Atomicidad**: Si alguna notificación falla, reversible
- **Consistencia**: Clase y sus notificaciones siempre en sync

**Escenarios**:
| Fallo en | Clase Cancelada | Notificaciones | Inscritos Pierden Clase |
|----------|-----------------|-----------------|------------------------|
| Cambiar estado | ❌ NO | ❌ NO | ❌ NO (seguro) |
| Crear notifs | ✅ SÍ | ✅ Parcial | ✅ SÍ (notificados) |

**Timeout**: 10 segundos (operación de background)

---

## ⚠️ OPERACIONES NO-CRÍTICAS (SIN Transacción Explícita)

Estas operaciones NO requieren transacción porque:
1. Son lecturas (SELECT)
2. No afectan dinero/acceso
3. Son idempotentes

```typescript
// ✅ Lectura (NO requiere transacción)
async obtenerMembro(id: MiembroId): Promise<Miembro> {
  const { data } = await this.supabase
    .from("miembros")
    .select("*")
    .eq("id", id)
    .single()
  
  return MiembroMapper.toDomain(data)
}

// ✅ Estadísticas (NO requiere transacción)
async obtenerMetricas(mes: string): Promise<Metricas> {
  const { data } = await this.supabase
    .from("metricas")
    .select("*")
    .eq("mes", mes)
  
  return data.map(MetricasMapper.toDomain)
}

// ✅ Actualización sin dependencias
async cambiarEmail(miembroId: MiembroId, nuevoEmail: string): Promise<void> {
  await this.supabase
    .from("miembros")
    .update({ email: nuevoEmail })
    .eq("id", miembroId)
}
```

---

## 🔄 IDEMPOTENCIA (Procesar múltiples veces = mismo resultado)

**CRÍTICO para webhooks**:

```typescript
// Pago completado por Stripe (puede reintentar)
// Evento puede llegar 1, 2, o 3 veces
async confirmarPago(stripeEventId: string): Promise<void> {
  const pagoExistente = await this.pagosRepo
    .obtenerPorIdExterno(stripeEventId)
  
  // Si ya procesado, no hacer nada
  if (pagoExistente && pagoExistente.estado === "completado") {
    logger.info(`Pago ${stripeEventId} ya procesado, ignorando`)
    return
  }
  
  // Procesar normalmente
  // ...
}
```

---

## 📋 MATRIZ: OPERACIÓN → TRANSACCIÓN REQUERIDA

| Operación | Crítica | Transacción | Timeout | Idempotencia |
|-----------|---------|------------|---------|--------------|
| Registrar usuario | ⚠️ Alta | SERIAL | 5s | URL debe tener ID único |
| Confirmar pago | 🔴 MÁXIMA | CRITICAL | 30s | Stripe ID externo |
| Procesar acceso QR | 🔴 MÁXIMA | ACID | 100ms | Timestamp + QR |
| Renovar membresía | ⚠️ Alta | ACID | 5s | ID membresia |
| Cancelar clase | ⚠️ Media | EVENTUAL | 10s | ID clase |
| Obtener membresía | ✅ Baja | NO | 2s | N/A (lectura) |
| Cambiar email | ⚠️ Media | NO | 3s | Email único |
| Crear métrica | ✅ Baja | NO | 1s | N/A |

---

## 🚨 ALERTAS Y MONITOREO

### **Transacciones que fallan**:
```typescript
// Registrar intentos fallidos
if (error instanceof TransactionRollback) {
  logger.error(`TRANSACCIÓN FALLIDA: ${error.operacion}`, {
    timestamp: new Date(),
    usuarioId: comando.usuarioId,
    operacion: "renovar_membresia",
    error: error.message,
    intento: 1
  })
  
  // Enviar alerta
  this.alertasService.notificar({
    nivel: "CRÍTICO",
    mensaje: "Falló renovación de membresía",
    contexto: { membresiId: comando.id }
  })
}
```

### **Transacciones lentas** (> timeout):
```typescript
if (elapsed > TIMEOUT) {
  logger.warn(`Transacción lenta: ${elapsed}ms`, {
    operacion: "procesar_acceso",
    membresiId: cmd.membresiId
  })
}
```

---

## ✅ CHECKLIST: REGLAS ACID IMPLEMENTADAS

- [ ] Registrar usuario: Transacción SERIAL ✅
- [ ] Confirmar pago: Transacción CRITICAL + Idempotencia ✅
- [ ] Procesar acceso: Transacción ACID + Auditoría ✅
- [ ] Cancelar clase: Transacción EVENTUAL ✅
- [ ] Renovar membresía: Transacción ACID ✅
- [ ] Rollback automático en errores ✅
- [ ] Eventos disparados DESPUÉS de commit ✅
- [ ] Timeouts configurados ✅

---

## 🚀 PRÓXIMO PASO

**→ TASKS.md definirá el roadmap de migración por módulos**

---

*ACID_RULES.md v1.0 — Transaccionalidad crítica garantizada*
