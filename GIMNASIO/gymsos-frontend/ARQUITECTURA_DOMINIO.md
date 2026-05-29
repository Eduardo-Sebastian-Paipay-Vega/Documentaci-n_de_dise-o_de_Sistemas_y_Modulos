# GYMsos — Arquitectura de Dominio

> **Versión**: 1.0 | **Fecha**: 2026-05-29 | **Autor**: Auditoría arquitectónica

Este documento es el **mapa semántico real** del sistema GYMsos, derivado por
ingeniería inversa desde: schema SQL, tipos TypeScript, servicios, hooks y páginas.
Es la única fuente de verdad sobre cómo funciona el negocio en código.

---

## 1. BOUNDED CONTEXTS (Dominios separados)

```
┌─────────────────────────────────────────────────────────────────┐
│                         GYMsos System                           │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   DOMINIO IAM    │  │ DOMINIO MEMBRESÍA │                   │
│  │  auth, usuarios  │  │  planes,          │                   │
│  │  roles, sesiones │  │  membresias,      │                   │
│  │  gimnasios       │  │  pagos            │                   │
│  └────────┬─────────┘  └────────┬──────────┘                   │
│           │                     │                               │
│  ┌────────▼─────────┐  ┌────────▼──────────┐                   │
│  │  DOMINIO ACCESO  │  │ DOMINIO OPERACIONES│                  │
│  │  accesos, QR,    │  │  clases, espacios, │                  │
│  │  torniquete      │  │  inscripciones,    │                  │
│  │                  │  │  asistencias,      │                  │
│  └──────────────────┘  │  entrenadores      │                  │
│                        └────────────────────┘                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  DOMINIO ANALYTICS│ │ DOMINIO GAMIF.   │                   │
│  │  churn_predictions│ │  gamification_xp  │                  │
│  │  ai_recommendations│ │ gamif_levels,    │                  │
│  │  dynamic_pricing  │ │  battle_pass,     │                  │
│  │  [HUÉRFANO]       │ │  clanes, torneos  │                  │
│  └──────────────────┘ │  [HUÉRFANO]       │                   │
│                        └──────────────────┘                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ DOMINIO NUTRICIÓN│  │ DOMINIO CORP/MKT │                   │
│  │  nutricionista   │  │  corporate_clients│                  │
│  │  [SIN SCHEMA]    │  │  marketplace_*    │                  │
│  └──────────────────┘  │  [HUÉRFANO]      │                   │
│                        └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. AGGREGATE ROOTS (Raíces de consistencia)

| Aggregate | Entidades controladas | Owner de workflows |
|-----------|----------------------|-------------------|
| **Usuario** | usuarios → membresias, pagos, accesos | AuthProvider |
| **Membresía** | membresias → planes | membresias.service |
| **Pago** | pagos → membresias | pagos.service |
| **Acceso** | accesos, asistencias | accesos.service |
| **Clase** | clases → inscripciones, espacios, entrenadores | clases.service |
| **Gimnasio** | gimnasios → todo lo demás (tenant root) | schema FK |

---

## 3. DEPENDENCY MAP REAL (Grafo de dependencias)

### Flujo de un acceso al gimnasio

```
RecepcionistaUI (acceso/page.tsx)
  ├── useAccesosRecientes(gymId) → accesos.service → SELECT accesos ⊕ usuarios ⊕ membresias ⊕ planes
  ├── useConteoAccesos(gymId)    → accesos.service → SELECT accesos.fecha_hora_salida
  ├── buscarUsuarios(gymId, q)   → usuarios.service → SELECT usuarios WHERE nombre ILIKE
  └── registrarAcceso(uid, gym)  → accesos.service
        ├── SELECT membresias (validar vigencia)
        └── INSERT accesos (permitido|denegado)
```

### Flujo de registro de nuevo miembro (actual — NO atómico)

```
RecepcionistaUI (registro/page.tsx)
  └── registrarNuevoMiembro(datos) → usuarios.service
        ├── [1] supabase.auth.signUp()  ← HTTP API externa
        ├── [2] INSERT usuarios         ← puede fallar → usuario Auth huérfano
        ├── [3] INSERT membresias       ← puede fallar → usuario sin membresía
        └── [4] INSERT pagos            ← puede fallar → membresía sin pago
```

### Flujo de registro de nuevo miembro (PROPUESTO — atómico)

```
RecepcionistaUI (registro/page.tsx)
  ├── [1] supabase.auth.signUp()            ← HTTP (no transaccionable)
  └── [2] supabase.rpc('rpc_registrar_nuevo_miembro', {...})
            └── [PL/pgSQL TRANSACTION]
                  ├── INSERT usuarios
                  ├── INSERT membresias
                  └── INSERT pagos
                  EXCEPTION → ROLLBACK automático
        Si [2] falla → supabase.auth.admin.deleteUser(authUserId)
```

### Flujo del Dashboard Gerente

```
GerenteDashboard (gerente/page.tsx)
  ├── useKPIsGerente(gymId)      → dashboard.service.getKPIsGerente()
  │     ├── COUNT usuarios (miembros)
  │     ├── SUM  pagos (ingresos mes / mes anterior)
  │     ├── COUNT usuarios (mes anterior, para delta)
  │     ├── COUNT accesos (hoy)
  │     ├── COUNT clases (hoy)
  │     └── COUNT churn_predictions (score ≥ 60)
  ├── useChurnAtRisk(gymId)      → dashboard.service.getChurnAtRisk()
  │     └── SELECT churn_predictions ⊕ usuarios ⊕ membresias ⊕ planes
  └── useIngresosMensuales(gymId) → dashboard.service.getIngresosPorMesGrafica()
        └── SELECT pagos (12 meses, agrupados por mes)
```

**Hub crítico detectado**: `dashboard.service.ts` conoce 5 tablas distintas
(usuarios, pagos, accesos, clases, churn_predictions). Es un **God Service** de analítica.
Solución futura: extraer a `analytics.service.ts`.

---

## 4. ROLES — ESTADO REAL

| Rol | Schema SQL | TypeScript | Dashboard | Seeds | Estado |
|-----|-----------|-----------|-----------|-------|--------|
| `gerente` | ✅ | ✅ | ✅ | ✅ | **Completo** |
| `recepcionista` | ✅ | ✅ | ✅ | ✅ | **Completo** |
| `entrenador` | ✅ | ✅ | ✅ | ✅ | **Completo** |
| `miembro` | ✅ | ✅ | ✅ | ✅ | **Completo** |
| `cliente` | ✅ (fix 001) | ✅ | ✅ | ✅ | **Activo post-migración** |
| `nutricionista` | ✅ (fix 001) | ✅ | ✅ | ✅ | **Activo post-migración** |
| `admin` | ✅ | ✅ | ❌ no existe `/dashboard/admin` | ❌ | **Parcial** |

---

## 5. RLS — COBERTURA POR ROL Y TABLA

| Tabla | miembro | cliente | entrenador | recepcionista | gerente | nutricionista |
|-------|---------|---------|-----------|--------------|---------|---------------|
| `usuarios` | solo propio | solo propio | gym (fix 001) | gym | gym | gym (fix 001) |
| `membresias` | propia | propia | — | ✅ | ✅ | — |
| `pagos` | propios | propios | — | ✅ | ✅ | — |
| `clases` | gym | gym | gym | gym | gym | gym |
| `accesos` | propios | propios | — | ✅ | ✅ | — |
| `churn_predictions` | ❌ bloqueado | ❌ | ❌ | ❌ | ✅ | ❌ |
| `gimnasios` | ✅ (fix 001) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 6. TABLAS POR ESTADO DE IMPLEMENTACIÓN

### Activas (consumidas por servicios y UI)

```
gimnasios → usuarios → planes → membresias → pagos
                  ↓                  ↓
              accesos          inscripciones
                  ↓                  ↓
           asistencias            clases ← entrenadores ← espacios
                                      ↓
                               churn_predictions ← (gerente)
```

### Parcialmente activas

| Tabla | Qué falta |
|-------|-----------|
| `promociones` | Página `/gerente/promociones` existe pero sin servicio de CRUD completo |
| `espacios` | Usado en JOIN de clases pero sin gestión directa |
| `entrenadores` | JOIN en clases, no hay CRUD propio |

### Aspiracionales (schema declarado, sin frontend)

| Grupo | Tablas |
|-------|--------|
| Gamificación | `gamification_xp`, `gamification_levels`, `battle_pass_progression` |
| Social | `clanes`, `clan_miembros`, `torneos_semanales` |
| IA/Salud | `digital_twin`, `ai_recommendations`, `health_alerts`, `wearable_sync` |
| Negocio | `marketplace_vendors`, `marketplace_transactions`, `corporate_clients`, `corporate_leaderboards` |
| Pricing | `dynamic_pricing_log` |

---

## 7. RIESGOS ACTIVOS (después de aplicar migración 001)

| # | Riesgo | Severidad | Solución propuesta |
|---|--------|-----------|-------------------|
| R1 | `registrarNuevoMiembro` no atómico | ALTO | Usar `rpc_registrar_nuevo_miembro` (incluido en 001) |
| R2 | NPS Score hardcodeado (72) | MEDIO | Crear tabla `nps_surveys` o consumir real data |
| R3 | Cookie `gymsos_rol` sin HttpOnly (JS-readable) | MEDIO | Mover a Server Action o Supabase JWT claims |
| R4 | QR input acepta cualquier string sin validar UUID | BAJO | Validar formato UUID antes de llamar a la API |
| R5 | `getPlanesConConteo` hace N+1 queries manual | BAJO | Reescribir con JOIN en SQL |
| R6 | `dashboard.service` es God Service (5 tablas) | BAJO | Extraer `analytics.service.ts` |

---

## 8. TRAZABILIDAD RF → IMPLEMENTACIÓN

| RF | Descripción | Tabla | Servicio | UI |
|----|------------|-------|----------|-----|
| RF-001 | Gestión de miembros | `usuarios` | `usuarios.service` | `/gerente/miembros`, `/recepcionista/registro` |
| RF-002 | Planes de membresía | `planes` | `planes.service` | `/gerente/configuracion` |
| RF-003 | Pagos y facturación | `pagos`, `membresias` | `pagos.service` | `/recepcionista/pagos`, `/gerente/reportes` |
| RF-004 | Control de accesos | `accesos` | `accesos.service` | `/recepcionista/acceso` |
| RF-005 | Clases y horarios | `clases`, `inscripciones` | `clases.service` | `/entrenador/clases`, `/miembro/clases` |
| RF-006 | Asistencia | `asistencias` | `accesos.service` | `/entrenador/asistencia` |
| RF-007 | Dashboard gerente | múltiples | `dashboard.service` | `/gerente` |
| RF-008 | Membresías por vencer | `membresias` | `membresias.service` | `/recepcionista/pagos` |
| RF-019 | Predicción churn | `churn_predictions` | `dashboard.service` | `/gerente` (widget) |
| RF-020 | Intervenciones churn | `churn_interventions` | ❌ ninguno | ❌ ninguna |
| RF-021 | Gamificación XP | `gamification_xp/levels` | ❌ ninguno | ❌ ninguna |
| RF-022–038 | Innovaciones | 17 tablas | ❌ ninguno | ❌ ninguna |

---

## 9. ORDEN DE EJECUCIÓN DE SCRIPTS SQL

```
1. supabase-schema.sql          ← Schema base v2.0 (30 tablas + RLS base + índices)
2. migrations/001_fix_roles_rls_atomic.sql  ← ESTE ARCHIVO (roles, RLS, RPCs)
3. seed-datos-demo.sql          ← 10 miembros + staff + clases + pagos + churn
4. seed-mi-cuenta.sql           ← Cuenta personal del desarrollador
5. seed-nuevos-roles.sql        ← nutricionista + cliente (funciona DESPUÉS de 001)
```

---

## 10. STACK TECNOLÓGICO

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend framework | Next.js (App Router) | latest |
| UI components | Custom + Tailwind CSS | — |
| Animaciones | Framer Motion | — |
| Scroll | Lenis | — |
| Iconos | Lucide React | — |
| Backend | Supabase (PostgreSQL 16) | — |
| Auth | Supabase Auth (JWT) | — |
| ORM | Supabase JS Client (PostgREST) | — |
| Deploy | Vercel (presumible) | — |

---

*Documento generado por auditoría arquitectónica el 2026-05-29.*
*Actualizar con `graphify update .` después de cambios en el código.*
