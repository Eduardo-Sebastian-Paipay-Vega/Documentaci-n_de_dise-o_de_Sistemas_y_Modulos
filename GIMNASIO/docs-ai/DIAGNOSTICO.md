# DIAGNÓSTICO ARQUITECTÓNICO: GYMsos
> **Fecha**: 2026-05-26  
> **Versión**: 1.0  
> **Propósito**: Análisis inicial pre-refactorización DDD+ACID  

---

## 🔍 ESTADO ACTUAL DEL CÓDIGO

### **Stack Tecnológico**
- **Frontend**: Next.js 16.2.6 + React 18.3 + TypeScript
- **Backend**: Supabase (BaaS — PostgreSQL)
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Lucide Icons
- **State Management**: React Context (auth-provider)

### **Estructura de Carpetas Actual**
```
gymsos-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Rutas por rol (miembro, entrenador, recepcionista, gerente)
│   │   ├── login/              # Autenticación
│   │   └── layout.tsx          # Layout global
│   ├── components/
│   │   ├── app/                # Componentes específicos (sidebar, etc.)
│   │   ├── layout/             # Navbar, footer
│   │   ├── providers/          # Auth provider, Lenis provider
│   │   └── sections/           # Landing page sections
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase + tipos DB
│   │   ├── auth.ts             # Lógica de autenticación
│   │   ├── motion.ts           # Animaciones
│   │   └── utils.ts            # Utilidades
│   └── proxy.ts                # Proxy para llamadas backend
├── package.json
└── .env.local
```

**Total**: 43 archivos TS/TSX

---

## 🚨 PROBLEMAS DETECTADOS

### **1. ACOPLAMIENTO Frontend-BACKEND FUERTE**
**Ubicación**: `src/lib/supabase.ts`, páginas del dashboard  
**Problema**: 
- Las páginas hacen queries directas a Supabase
- No hay capa de servicio (Application layer)
- Lógica de negocio dispersa en componentes React

```typescript
// ❌ ANTI-PATRÓN: Lógica en componentes
export default function MiembroDashboard() {
  const { user } = useAuth()  // Aquí se trae el usuario
  // Aquí habría queries directas a Supabase
}
```

### **2. SIN CAPA DE DOMINIO (Domain Layer)**
**Problema**:
- Tipos DB (`DbUsuario`, `DbMembresia`, etc.) existen pero SIN lógica de negocio
- Las reglas de negocio están esparcidas o ausentes
- No hay validaciones de entidades antes de persistir
- No hay Value Objects — solo interfaces de DB

**Ejemplo de lo que FALTA**:
```typescript
// ❌ Actualmente:
interface DbMembresia {
  id_membresia: string
  fecha_vencimiento: string  // Solo string
  // Sin métodos para validar: ¿está vencida? ¿puede renovarse?
}

// ✅ Lo que necesitamos:
class Membresia {
  private id: MembresiId
  private fechaVencimiento: Date
  
  estaVencida(): boolean { /* lógica */ }
  puedeRenovarse(): boolean { /* lógica */ }
}
```

### **3. SIN TRANSACCIONALIDAD EXPLÍCITA (ACID)**
**Problema**:
- No hay control de transacciones en operaciones críticas
- Si falla un paso en un flujo multi-tabla, no hay rollback automático

**Procesos críticos SIN transacciones**:
- Registro de usuario + creación de membresia
- Cobro de pago + cambio de estado de membresia
- Acceso QR + validación de membresia + auditoría

### **4. RUTAS ANIDADAS SIN MODELOS CLAROS**
**Ubicación**: `src/app/dashboard/`  
```
dashboard/
├── miembro/         # 5 rutas
├── entrenador/      # 5 rutas
├── recepcionista/   # 5 rutas
└── gerente/         # 6 rutas
```

**Problema**: No hay separación de **Bounded Contexts**. Todo es "dashboard" sin diferenciar la lógica de negocio por dominio:
- Contexto: **Membresías** (crear, renovar, cancelar, validar vencimiento)
- Contexto: **Acceso** (QR, biometría, auditoría)
- Contexto: **Pagos** (integración Stripe/PayU, confirmaciones, reembolsos)
- Contexto: **Clases** (reservas, capacidad, entrenadores)
- Contexto: **Análisis** (churn prediction, reportes)

### **5. TIPOS DB SIN VALIDACIÓN DE NEGOCIO**
**Ubicación**: `src/lib/supabase.ts`

```typescript
// ❌ Problema: Un usuario puede tener estado contradictorio
export interface DbUsuario {
  rol: DbRol  // "entrenador"
  estado: DbEstado  // "suspendido"
  // ¿Puede un entrenador suspendido dictar clases?
  // ¿Quién valida esto?
}
```

---

## 🎯 ANÁLISIS POR BOUNDED CONTEXT

### **1. BOUNDED CONTEXT: Membresías**
**Entidades principales**:
- `Miembro` (Usuario con membresia activa)
- `Membresia` (Plan + fechas + estado)
- `Plan` (Precio, duracion, características)

**Reglas de negocio CRÍTICAS** (ACID):
- ✅ Una membresia no puede renovarse si hay pagos pendientes
- ✅ Al vencer, el estado debe cambiar ATOMICAMENTE (Membresia + Auditoria)
- ✅ Si falla el pago, debe ROLLBACK la renovación y la membresia vuelve a "vencida"

**Integración externa**: Stripe/PayU

---

### **2. BOUNDED CONTEXT: Acceso**
**Entidades principales**:
- `Acceso` (QR, biometría, timestamp, estado)
- `AuditoriaAcceso` (log de intentos fallidos)

**Reglas de negocio CRÍTICAS** (ACID):
- ✅ Un acceso solo se permite si membresia está activa y NO vencida
- ✅ Cada acceso denegado DEBE registrarse en auditoría (transacción atómica)
- ✅ Si el QR es válido pero la membresia expiró entre lectura y procesamiento, DEBE denegarse

---

### **3. BOUNDED CONTEXT: Pagos**
**Entidades principales**:
- `Pago` (Monto, metodo, estado)
- `Transaccion` (ID externo Stripe)

**Reglas de negocio CRÍTICAS** (ACID):
- ✅ Un pago debe crearse SOLO si hay una membresia asociada
- ✅ Confirmación de pago = cambio de estado de membresia (1 transacción DB)
- ✅ Si Stripe confirma pero DB falla, hay deadlock → webhook de reintento

---

### **4. BOUNDED CONTEXT: Clases**
**Entidades principales**:
- `Clase` (Horario, entrenador, capacidad, recurrencia)
- `Inscripcion` (Usuario + Clase + fecha)

**Reglas de negocio CRÍTICAS**:
- ✅ No pueden haber más inscripciones que capacidad_maxima
- ✅ Un usuario solo puede inscribirse si membresia está activa
- ✅ Cancelación de clase = notificación a todos los inscritos

---

### **5. BOUNDED CONTEXT: Análisis**
**Entidades principales**:
- `MetricaMiembro` (Sesiones, racha, puntos, nivel)
- `PrediccionChurn` (Score de riesgo)

**Reglas de negocio**:
- Solo lectura de datos de otros contextos
- Cálculos offline (no bloquean transacciones críticas)

---

## 📊 MATRIZ: PROBLEMA → CAUSA ARQUITECTÓNICA

| Problema Técnico | Ubicación | Causa Raíz | Impacto |
|------------------|-----------|-----------|--------|
| Sin validación de membresia vencida | Dashboard miembro | No hay lógica en Domain | Miembro accede con membresia vencida |
| Acceso denegado sin auditoría | Endpoint acceso | No hay transacción explícita | Intento fallido no se registra |
| Pago procesado, membresia no actualiza | Flujo pago | Sin transacción multi-tabla | Dinero cobrado, acceso no renovado |
| Clase con 50 inscritos (cap=30) | Dashboard gerente | Sin constraint de negocio | Overbooking |
| Código duplicado en roles | Dashboard | Sin servicios centralizados | Mantenimiento imposible |

---

## 🔐 ACOPLAMIENTOS PELIGROSOS DETECTADOS

### **Acoplamiento 1: React ↔ Supabase directo**
```typescript
// ❌ Anti-patrón actual
const LoginPage = () => {
  const handleLogin = async (email, password) => {
    // Aquí se hace query directo a Supabase
    const { data } = await supabase.auth.signInWithPassword({...})
    // Sin capa intermedia
  }
}
```

**Riesgo**: Cambiar BD = refactorizar N componentes

### **Acoplamiento 2: Tipos DB = Tipos de Negocio**
```typescript
// ❌ Anti-patrón actual
export interface DbUsuario { ... }  // <-- Usado en toda la app

// ✅ Debería separar:
// Domain: class Usuario { ... }
// Infrastructure: interface DbUsuario { ... }  // Solo para mapeo
```

### **Acoplamiento 3: Rutas App Router = Bounded Contexts**
```typescript
// ❌ Anti-patrón: La URL estructura el código, no el negocio
// src/app/dashboard/miembro  — ¿Es un contexto o solo una ruta?
```

---

## ✅ FORTALEZAS ACTUALES

1. **Tipos TypeScript** — Base para Domain Layer
2. **Supabase** — PostgreSQL real, soporta transacciones
3. **Next.js App Router** — Estructura modular
4. **Componentes React bien organizados** — UI/Presentación separada de lógica
5. **Auth Provider** — Centralización de autenticación

---

## 📋 CHECKLIST: INPUTS PARA REFACTORIZACIÓN

- [x] Stack actual identificado (Next.js + Supabase)
- [x] Acoplamientos clave localizados (Frontend-DB, sin Domain Layer)
- [x] Procesos ACID críticos identificados (membresía, acceso, pago)
- [x] Bounded Contexts implícitos extraídos (5 contextos)
- [x] Lógica de negocio esparcida confirmada

---

## 🚀 PRÓXIMO PASO

**→ Generaremos DOMAIN.md con el Lenguaje Ubicuo y Bounded Contexts formalizados**

---

*DIAGNOSTICO.md v1.0 — Pre-refactorización DDD+ACID*
