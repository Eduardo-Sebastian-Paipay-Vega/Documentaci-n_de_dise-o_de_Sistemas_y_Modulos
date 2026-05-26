# docs-ai/: Sistema de Control de Arquitectura
> **GYMsos Refactorización DDD+ACID**  
> **Versión**: 1.0  
> **Fecha**: 2026-05-26  

---

## 📚 CONTENIDO

Este directorio contiene la **documentación de control** para refactorizar GYMsos hacia una arquitectura seria basada en Domain-Driven Design (DDD) y ACID.

### **Archivos Principales**

| Archivo | Propósito | Lectura |
|---------|-----------|---------|
| **DIAGNOSTICO.md** | Análisis del estado actual + problemas detectados | 👈 Empezar aquí |
| **DOMAIN.md** | Lenguaje ubicuo + Bounded Contexts + Agregados DDD | Referencia |
| **ARCHITECTURE.md** | Estructura de capas (Domain, Application, Infrastructure) | Referencia |
| **ACID_RULES.md** | Reglas de transaccionalidad crítica | Referencia |
| **TASKS.md** | Roadmap de migración iterativa | Plan de trabajo |
| **INDEX.md** | Este archivo — mapa de navegación | Referencia |

---

## 🎯 ¿DÓNDE EMPEZAR?

### **Si eres Arquitecto/Tech Lead**:
1. Lee **DIAGNOSTICO.md** (20 min) — entiende qué está mal
2. Lee **DOMAIN.md** (30 min) — aprende los conceptos de negocio
3. Lee **ARCHITECTURE.md** (40 min) — visualiza la solución
4. Lee **TASKS.md** (20 min) — planifica el trabajo

**Tiempo total**: ~2 horas

### **Si eres Developer (Frontend)**:
1. Lee **DIAGNOSTICO.md** (secciones: "Problemas detectados")
2. Lee **ARCHITECTURE.md** (sección: "Flujo de una solicitud")
3. Espera a PHASE 7 (Frontend Migration)

### **Si eres Developer (Backend)**:
1. Lee **DIAGNOSTICO.md** (completo)
2. Lee **DOMAIN.md** (completo) — **CRÍTICO**
3. Lee **ARCHITECTURE.md** (completo)
4. Lee **ACID_RULES.md** (completo) — **CRÍTICO**
5. Sigue **TASKS.md** para tu módulo asignado

### **Si eres DevOps/SRE**:
1. Lee **ARCHITECTURE.md** (secciones: "Transacciones", "IoC Container")
2. Lee **ACID_RULES.md** (secciones: "Alertas y Monitoreo")
3. Configura base de datos para transacciones

---

## 🔄 FLUJO DE TRABAJO

```
┌─────────────────────────────────────────┐
│ 1. DIAGNOSTICO.md                       │
│    ↓ Entiendo qué está mal              │
├─────────────────────────────────────────┤
│ 2. DOMAIN.md                            │
│    ↓ Aprendo el lenguaje de negocio     │
├─────────────────────────────────────────┤
│ 3. ARCHITECTURE.md                      │
│    ↓ Entiendo cómo se organiza el código│
├─────────────────────────────────────────┤
│ 4. ACID_RULES.md                        │
│    ↓ Sé dónde necesito transacciones    │
├─────────────────────────────────────────┤
│ 5. TASKS.md                             │
│    ↓ Inicio la refactorización          │
├─────────────────────────────────────────┤
│ 6. Cada tarea lee docs relevantes       │
│    en el orden especificado en TASKS    │
└─────────────────────────────────────────┘
```

---

## 📌 REGLAS DE ORO (Leer primero)

### **Regla 1: Domain nunca sale**
```typescript
// ✅ PERMITIDO en Domain
import { Membresia } from "./membresia"
import { MembresiId } from "./membresia-id"

// ❌ PROHIBIDO en Domain
import { SupabaseClient } from "@supabase/supabase-js"
import { MembresiasService } from "@/application/..."
```

### **Regla 2: Todas las operaciones críticas requieren transacción**
Ver **ACID_RULES.md** para lista completa.

```typescript
const tx = await this.txManager.begin()
try {
  // Paso 1
  // Paso 2
  // Paso 3
  await tx.commit()  // TODO O NADA
} catch (error) {
  await tx.rollback()  // REVERSIÓN AUTOMÁTICA
}
```

### **Regla 3: Cambios de código = Cambios en documentación**
Si cambias Domain, actualiza **DOMAIN.md**.  
Si cambias Arquitectura, actualiza **ARCHITECTURE.md**.  
Si agruegas un nuevo proceso crítico, actualiza **ACID_RULES.md**.

### **Regla 4: DOMAIN es la fuente de verdad**
Si hay conflicto entre código y docs, **DOMAIN.md siempre gana**.  
Actualiza el código para match con los docs.

---

## 🔐 GARANTÍAS

Con esta arquitectura, **se garantiza**:

✅ **Atomicidad**: Si algo falla, revierta TODO (no estado intermedio)  
✅ **Consistencia**: Invariantes de negocio SIEMPRE válidas  
✅ **Aislamiento**: Concurrencia segura (transacciones DB)  
✅ **Durabilidad**: Una vez committed, persiste aunque se caiga el server  

✅ **Independencia de Framework**: Cambiar Supabase por PostgreSQL = Cambiar solo Infrastructure  
✅ **Testeable**: Domain Layer sin dependencias externas = Tests rápidos  
✅ **Escalable**: Multi-sucursal desde el inicio  

---

## 📊 CHECKLIST: ESTADO ACTUAL

- [x] **DIAGNOSTICO.md**: Problemas identificados
- [x] **DOMAIN.md**: Agregados DDD definidos
- [x] **ARCHITECTURE.md**: Capas especificadas
- [x] **ACID_RULES.md**: Transacciones documentadas
- [x] **TASKS.md**: Roadmap completo
- [ ] **Backend**: Comenzar TAREA 0.1
- [ ] **Tests**: Escribir en paralelo con código
- [ ] **Documentación**: Mantener sincronizada
- [ ] **Producción**: Migración gradual

---

## 🚀 PRÓXIMOS PASOS

### **Inmediato (Hoy)**
1. Lee **DIAGNOSTICO.md** completamente
2. Comparte feedback sobre los problemas detectados
3. Confirma si está de acuerdo con los Bounded Contexts

### **Esta semana**
1. Lee **DOMAIN.md**, **ARCHITECTURE.md**, **ACID_RULES.md**
2. Confirma que el modelo de datos está correcto
3. Identifica cualquier regla de negocio faltante

### **Próxima semana**
1. Comienza **TAREA 0.1** (Setup Backend)
2. Comienza **TAREA 0.2** (Transacciones)
3. Comienza **TAREA 1.1** (Domain Miembros)

---

## 💬 CÓMO USAR ESTA DOCUMENTACIÓN

### **Durante Daily Standup**
"Estoy en TAREA 2.2 (App Membresías). Según ACID_RULES.md, necesito implementar transacción atómica para RenovarMembresia. DOMAIN.md define que..."

### **Durante Code Review**
"Este código viola ARCHITECTURE.md Regla 2: Infrastructure importa desde Application. Debe usar MembresiasRepository (puerto de Domain)."

### **Durante Problem Solving**
"ACID_RULES.md Operación #2 especifica que Confirmar Pago debe ser idempotente. Mi implementación no verifica si ya fue procesado."

---

## 🔄 ACTUALIZACIÓN DE DOCUMENTOS

Cuando cambies código:

```
┌─ ¿Cambió Domain?
│  ├─ SÍ → Actualiza DOMAIN.md
│  └─ NO → Continúa
│
├─ ¿Cambió Architecture?
│  ├─ SÍ → Actualiza ARCHITECTURE.md
│  └─ NO → Continúa
│
├─ ¿Cambió crítica transaction?
│  ├─ SÍ → Actualiza ACID_RULES.md
│  └─ NO → Continúa
│
└─ ✅ Commit código + docs juntos
```

---

## 📞 CONTACTO / ESCALADAS

Si encuentras un problema que no está en la documentación:

1. **Documéntalo** en el archivo relevante
2. **Crea un issue** con referencia al problema
3. **Actualiza TASKS.md** si afecta el roadmap

---

## 📈 MÉTRICAS DE ÉXITO

Sabremos que la refactorización fue exitosa cuando:

- ✅ 0 datos inconsistentes en PROD (ACID garantizado)
- ✅ 0 fallos de acceso por membresia vencida (validaciones en Domain)
- ✅ 100% idempotencia en webhooks (sin duplicados)
- ✅ <100ms latencia en acceso QR (transacciones rápidas)
- ✅ Tests cubren 80%+ del Domain Layer
- ✅ Cualquier dev puede explicar por qué funciona

---

## 🎓 APRENDIZAJES CLAVE

### **DDD (Domain-Driven Design)**
- Mapea problemas de negocio → código
- Entidades, Value Objects, Agregados
- Bounded Contexts = Módulos independientes

### **ACID (Transaccionalidad)**
- Atomicidad = Todo o nada
- Consistencia = Invariantes siempre válidas
- Aislamiento = Concurrencia segura
- Durabilidad = Persisten forever

### **Arquitectura Hexagonal**
- Domain (corazón, sin dependencias)
- Application (casos de uso)
- Infrastructure (adaptadores)
- Ports (interfaces de contrato)

---

## 🔗 REFERENCIAS EXTERNAS

- **DDD**: Eric Evans — "Domain-Driven Design" (libro)
- **Clean Architecture**: Robert Martin — "Clean Architecture"
- **ACID**: PostgreSQL documentation
- **TypeScript**: Handbook oficial

---

**→ Siguiente lectura recomendada: [DIAGNOSTICO.md](./DIAGNOSTICO.md)**

---

*INDEX.md v1.0 — Mapa de navegación del control arquitectónico*
