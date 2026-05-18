# FASE 7 — Arquitectura Técnica e Implementación

> **Proyecto**: Comerci — Sistema Inteligente de Gestión Financiera para MYPEs LATAM
> **Fase**: 7 — Arquitectura y Aplicación
> **Versión**: 2.0
> **Fecha**: 2026-05-18
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🎯 Propósito de Esta Fase

Definir la arquitectura técnica completa de Comerci: stack tecnológico justificado, diagrama de componentes, contratos de API, pipeline de ML para predicciones, plan de pruebas, estrategia de despliegue y estructura de carpetas del proyecto. Este documento permite a un equipo de ingeniería comenzar a construir desde el Día 1 sin ambigüedad.

---

## 1. DECISIONES DE ARQUITECTURA

### 1.1 Patrón de arquitectura

**Elegido: Monolito Modular (Modular Monolith) → Microservicios gradual**

| Opción | Ventajas | Desventajas | Decisión |
|--------|----------|-------------|---------|
| Monolito puro | Simplicidad, rapidez inicial | No escala bien después de 50K usuarios | ❌ |
| Microservicios desde día 1 | Escala bien | Complejidad operacional brutal para equipo pequeño | ❌ |
| **Monolito Modular** | Simple ahora, fácil de partir después | Requiere disciplina de módulos | ✅ Elegido |

**Justificación**: Con un equipo de 6–8 ingenieros en Year 1, los microservicios agregan overhead de orquestación (Kubernetes, service mesh, tracing distribuido) que consume tiempo de desarrollo sin valor para el usuario. Un monolito modular bien estructurado permite extraer módulos a servicios independientes cuando el tráfico lo justifique (>100K usuarios).

**Módulos principales del monolito:**

```
comerci-api/
  modules/
    auth/           ← Autenticación y sesiones
    businesses/     ← Gestión de negocios y usuarios
    accounts/       ← Cuentas bancarias y fuentes de dinero
    transactions/   ← Ingesta, clasificación y consulta
    predictions/    ← Motor de predicción de flujo
    alerts/         ← Generación y entrega de alertas
    reports/        ← Reportes PDF y exportaciones
    subscriptions/  ← Gestión de planes y pagos
    integrations/   ← Conectores externos (Belvo, pagos)
```

Cada módulo tiene su propia carpeta, sus propias rutas, servicios y tests. La comunicación entre módulos es siempre a través de interfaces definidas, nunca acceso directo a la base de datos de otro módulo.

---

### 1.2 Diagrama de arquitectura del sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                         USUARIOS FINALES                               │
│              📱 App Android    📱 App iOS    🌐 Web (PWA)              │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │ HTTPS / WebSocket
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         CDN / Edge Layer                               │
│                   Cloudflare (DDoS + Cache + WAF)                      │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                                     │
│            AWS API Gateway + Rate Limiting + Auth JWT                  │
│                                                                        │
│   /api/v1/*  →  Load Balancer  →  Instancias del Monolito             │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌─────────────────┐ ┌────────────┐ ┌─────────────────┐
│  COMERCI API    │ │  COMERCI   │ │  COMERCI API    │
│  Instance 1     │ │    API     │ │  Instance 3     │
│  (Node.js)      │ │ Instance 2 │ │  (Node.js)      │
└────────┬────────┘ └─────┬──────┘ └────────┬────────┘
         │                │                  │
         └────────────────┼──────────────────┘
                          │
         ┌────────────────┼───────────────────┐
         ▼                ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │   Redis 7    │  │   S3 / R2        │
│  (Primary)   │  │   (Cache +   │  │   (PDFs, logs,   │
│              │  │   Sessions)  │  │    backups)       │
│  + Replica   │  └──────────────┘  └──────────────────┘
│  de lectura  │
└──────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│                 WORKERS ASÍNCRONOS                   │
│              (BullMQ + Redis como broker)            │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  sync-worker│  │  ml-worker   │  │alert-worker│  │
│  │  (bancos /  │  │  (predicciones│  │(generar y  │  │
│  │  Yape cada  │  │  diarias)    │  │ enviar)    │  │
│  │  5 min)     │  │              │  │            │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│              SERVICIOS EXTERNOS                      │
│                                                      │
│  Belvo API       → Integración bancaria (BCP, BBVA)  │
│  Firebase FCM    → Push notifications (Android/iOS)  │
│  SendGrid        → Emails transaccionales            │
│  Twilio          → SMS de alertas críticas           │
│  Culqi / Stripe  → Procesamiento de pagos            │
│  Sentry          → Error tracking                    │
│  Datadog         → APM, logs, métricas               │
└──────────────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICO

### 2.1 Backend

**Runtime: Node.js 20 LTS + TypeScript 5**

| Decisión | Tecnología | Justificación |
|----------|-----------|---------------|
| Runtime | Node.js 20 LTS | Ecosistema enorme, excelente para I/O intensivo (llamadas a APIs externas), el mismo lenguaje que el frontend (TypeScript) |
| Framework | Fastify 4 | 2x más rápido que Express, plugin-based, TypeScript nativo, validación con JSON Schema integrada |
| ORM | Drizzle ORM | TypeScript-first, genera tipos directamente del esquema SQL, sin overhead de ORM pesado |
| Queue / Workers | BullMQ + Redis | El estándar de facto para jobs asíncronos en Node.js, monitoreo con BullBoard |
| Validación | Zod | Validación runtime con tipos TypeScript automáticos |
| Auth | JWT (jose) + bcrypt | JWT sin estado para escalar, bcrypt para passwords |
| Logs | Pino | El logger más rápido para Node.js, compatible con Datadog y Elasticsearch |
| Tests | Vitest + Supertest | Vitest es 5x más rápido que Jest, Supertest para integración HTTP |

**Por qué NO Python (FastAPI) para el backend principal**: el equipo necesita un solo lenguaje para backend y frontend. Node.js + TypeScript permite compartir tipos entre ambos lados (monorepo). Python se usa exclusivamente en el módulo ML (ver sección 5).

### 2.2 Frontend Mobile

**Framework: React Native 0.74 + Expo SDK 51**

| Decisión | Tecnología | Justificación |
|----------|-----------|---------------|
| Framework | React Native + Expo | Una sola codebase para Android e iOS. Expo Go para testeo rápido sin build nativo |
| Navegación | Expo Router v3 | File-based routing, deep linking nativo, mejor que React Navigation para nuevos proyectos |
| Estado global | Zustand | Minimalista, sin boilerplate, TypeScript nativo. Alternativa ligera a Redux |
| Caché + fetching | TanStack Query v5 | Cache inteligente, sincronización en background, estados de loading/error automáticos |
| UI Components | React Native Paper + custom | Material Design 3 adaptado, componentes accesibles desde el inicio |
| Gráficos | Victory Native XL | Gráficos de alto rendimiento con Skia, mejor opción para React Native en 2026 |
| Formularios | React Hook Form + Zod | Mismo esquema Zod del backend para validaciones consistentes |
| Animaciones | React Native Reanimated 3 | Animaciones en el hilo nativo (60 FPS garantizado) |

### 2.3 Frontend Web (PWA / Dashboard contadores)

**Framework: Next.js 14 (App Router)**

Para el dashboard web de contadores y la PWA de fallback se usa Next.js con las mismas librerías de estado y fetching que el mobile (Zustand + TanStack Query), garantizando coherencia en el equipo.

### 2.4 Infraestructura Cloud

**Proveedor: AWS (región us-east-1 principal + sa-east-1 São Paulo para LATAM latency)**

| Componente | Servicio | Justificación |
|-----------|---------|---------------|
| Cómputo API | AWS ECS Fargate | Containers serverless, sin gestión de servidores, auto-scaling |
| Base de datos | AWS RDS PostgreSQL 16 | Managed, backups automáticos, Multi-AZ para HA |
| Cache | AWS ElastiCache (Redis 7) | Managed Redis, replica automática |
| Storage | AWS S3 + Cloudflare R2 | S3 para backups, R2 para assets estáticos (sin egress fees) |
| CDN | Cloudflare | DDoS, WAF, cache de assets, SSL automático |
| CI/CD | GitHub Actions | Pipelines de build/test/deploy |
| Secretos | AWS Secrets Manager | Rotación automática de claves |
| Monitoreo | Datadog | APM, logs, alertas de infraestructura |
| Error tracking | Sentry | Errores en producción con stack traces |

**Costo estimado (Year 1, 25K usuarios):**

| Servicio | Costo/mes estimado |
|---------|-------------------|
| RDS PostgreSQL (db.t3.medium Multi-AZ) | $120 |
| ElastiCache Redis (cache.t3.micro) | $25 |
| ECS Fargate (3 instancias 0.5vCPU/1GB) | $80 |
| S3 + R2 (500GB) | $15 |
| Cloudflare Pro | $25 |
| Datadog (Team plan) | $90 |
| Sentry (Team plan) | $26 |
| Misc (DNS, emails, SMS) | $40 |
| **TOTAL** | **~$421/mes** |

---

## 3. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
comerci/                          ← Raíz del monorepo
│
├── apps/
│   ├── api/                      ← Backend Fastify + Node.js
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.schema.ts    ← Zod schemas
│   │   │   │   │   └── auth.test.ts
│   │   │   │   ├── businesses/
│   │   │   │   ├── accounts/
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── transactions.routes.ts
│   │   │   │   │   ├── transactions.service.ts
│   │   │   │   │   ├── transactions.classifier.ts  ← Clasificador NLP
│   │   │   │   │   ├── transactions.schema.ts
│   │   │   │   │   └── transactions.test.ts
│   │   │   │   ├── predictions/
│   │   │   │   │   ├── predictions.routes.ts
│   │   │   │   │   ├── predictions.service.ts
│   │   │   │   │   ├── predictions.engine.ts  ← Lógica del predictor
│   │   │   │   │   └── predictions.test.ts
│   │   │   │   ├── alerts/
│   │   │   │   ├── reports/
│   │   │   │   ├── subscriptions/
│   │   │   │   └── integrations/
│   │   │   │       ├── belvo/            ← Conector Open Banking
│   │   │   │       ├── firebase/         ← Push notifications
│   │   │   │       ├── sendgrid/
│   │   │   │       └── culqi/            ← Pagos Perú
│   │   │   ├── db/
│   │   │   │   ├── schema.ts             ← Drizzle schema (fuente de tipos)
│   │   │   │   ├── migrations/           ← SQL migrations versionadas
│   │   │   │   └── seed.ts
│   │   │   ├── workers/
│   │   │   │   ├── sync.worker.ts        ← Sincronización bancaria
│   │   │   │   ├── ml.worker.ts          ← Invocar modelo ML
│   │   │   │   ├── alert.worker.ts       ← Generar y enviar alertas
│   │   │   │   └── report.worker.ts      ← Generar PDFs
│   │   │   ├── lib/
│   │   │   │   ├── crypto.ts             ← AES-256-GCM encrypt/decrypt
│   │   │   │   ├── logger.ts             ← Pino configurado
│   │   │   │   └── errors.ts             ← Error types centralizados
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts    ← Verificar JWT
│   │   │   │   ├── rls.middleware.ts     ← Set app.current_user_id
│   │   │   │   └── rate-limit.ts
│   │   │   └── app.ts                   ← Bootstrap de Fastify
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── mobile/                   ← React Native + Expo
│   │   ├── app/                  ← Expo Router (file-based)
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   └── register.tsx
│   │   │   ├── (onboarding)/
│   │   │   │   ├── welcome.tsx
│   │   │   │   ├── business.tsx
│   │   │   │   └── connect-accounts.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx             ← Dashboard (tab 1)
│   │   │   │   ├── transactions.tsx      ← Movimientos (tab 2)
│   │   │   │   ├── analysis.tsx          ← Análisis (tab 3)
│   │   │   │   ├── alerts.tsx            ← Alertas (tab 4)
│   │   │   │   └── settings.tsx          ← Configuración (tab 5)
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                       ← Componentes base (Button, Card, Badge)
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   └── charts/
│   │   ├── stores/                       ← Zustand stores
│   │   │   ├── auth.store.ts
│   │   │   ├── business.store.ts
│   │   │   └── alerts.store.ts
│   │   ├── hooks/                        ← Custom hooks (useBalance, usePredictions)
│   │   ├── api/                          ← TanStack Query + fetch client
│   │   └── package.json
│   │
│   └── web/                      ← Next.js 14 (dashboard contadores)
│
├── packages/
│   ├── types/                    ← Tipos compartidos API ↔ Mobile ↔ Web
│   │   └── src/
│   │       ├── api.types.ts      ← Request/Response types
│   │       ├── db.types.ts       ← Tipos de entidades DB
│   │       └── index.ts
│   └── utils/                   ← Utilidades compartidas (formatCurrency, etc.)
│
├── ml/                           ← Servicio Python de ML (separado del monolito)
│   ├── src/
│   │   ├── classifier/           ← Clasificador de transacciones NLP
│   │   ├── predictor/            ← Modelo de predicción de flujo
│   │   └── api.py                ← FastAPI endpoint interno
│   ├── models/                   ← Modelos entrenados (.pkl, .onnx)
│   ├── training/                 ← Scripts de entrenamiento
│   ├── Dockerfile
│   └── requirements.txt
│
├── infra/                        ← Infrastructure as Code
│   ├── terraform/                ← Definición de AWS resources
│   └── docker-compose.yml        ← Ambiente local de desarrollo
│
├── .github/
│   └── workflows/
│       ├── ci.yml                ← Tests en cada PR
│       ├── deploy-staging.yml    ← Deploy automático a staging
│       └── deploy-prod.yml       ← Deploy a producción (manual approval)
│
├── package.json                  ← Root workspace (pnpm workspaces)
├── pnpm-workspace.yaml
└── turbo.json                    ← Turborepo para builds incrementales
```

---

## 4. DISEÑO DE API REST

### 4.1 Convenciones generales

```
Base URL:        https://api.comerci.pe/api/v1
Autenticación:   Bearer <JWT> en header Authorization
Content-Type:    application/json
Versioning:      Path-based (/v1/, /v2/)
Formato fechas:  ISO 8601 (2026-05-18T10:30:00Z)
Montos:          Siempre en centavos (INTEGER), nunca decimales
Paginación:      cursor-based (cursor + limit)
Errores:         RFC 7807 Problem Details
```

**Formato de error estándar (RFC 7807):**
```json
{
  "type": "https://comerci.pe/errors/insufficient-funds",
  "title": "Saldo insuficiente",
  "status": 400,
  "detail": "El saldo disponible (S/ 700) es menor al mínimo recomendado (S/ 1,000)",
  "instance": "/api/v1/simulator/purchase-check"
}
```

---

### 4.2 Contratos de API — Módulo Auth

#### `POST /auth/register`
```typescript
// Request
{
  email: string;          // "jose@bodega.pe"
  password: string;       // mínimo 8 caracteres
  full_name: string;      // "José García"
  phone?: string;         // "+51987654321"
}

// Response 201
{
  user: {
    id: string;           // UUID
    email: string;
    full_name: string;
    email_verified: boolean;  // false hasta verificar email
  };
  access_token: string;   // JWT, expira en 24h
  refresh_token: string;  // JWT, expira en 30 días
}
```

#### `POST /auth/login`
```typescript
// Request
{ email: string; password: string; }

// Response 200
{
  access_token: string;
  refresh_token: string;
  user: { id, email, full_name, preferred_lang };
}

// Response 401 (credenciales inválidas)
{ type, title: "Credenciales incorrectas", status: 401, detail }
```

#### `POST /auth/refresh`
```typescript
// Request
{ refresh_token: string; }

// Response 200
{ access_token: string; refresh_token: string; }
```

---

### 4.3 Contratos de API — Módulo Dashboard

#### `GET /dashboard`
El endpoint más llamado. Devuelve todo lo necesario para renderizar el dashboard en una sola llamada. Cacheado en Redis por 5 minutos.

```typescript
// Response 200
{
  balance: {
    total_cents: number;           // Saldo neto total
    total_formatted: string;       // "S/ 4,350" (pre-formateado)
    liabilities_cents: number;     // Total deudas
    last_updated_at: string;       // ISO 8601
    accounts: [
      {
        id: string;
        name: string;
        type: "bank" | "yape" | "plin" | "cash";
        balance_cents: number;
        sync_status: "ok" | "error" | "pending";
        last_synced_at: string | null;
      }
    ];
  };
  prediction_14d: {
    predicted_balance_cents: number;
    breakeven_day: string | null;  // null = sin riesgo
    confidence_score: number;      // 0-1
  };
  weekly_summary: {
    income_cents: number;
    expense_cents: number;
    net_cents: number;
    days: [                        // Últimos 7 días para el mini-gráfico
      { date: string; income_cents: number; expense_cents: number; }
    ];
  };
  active_alerts: [
    {
      id: string;
      type: string;
      severity: "info" | "warning" | "critical";
      title: string;
      body: string;
      data: Record<string, unknown>;
      created_at: string;
    }
  ];
  unread_alerts_count: number;
}
```

---

### 4.4 Contratos de API — Módulo Transacciones

#### `GET /transactions`
```typescript
// Query params
{
  cursor?: string;          // Para paginación cursor-based
  limit?: number;           // Default 50, máx 200
  from_date?: string;       // "2026-05-01"
  to_date?: string;         // "2026-05-31"
  category_id?: string;     // Filtrar por categoría
  account_id?: string;      // Filtrar por cuenta
  type?: "income" | "expense";
  search?: string;          // Búsqueda en description_clean
}

// Response 200
{
  items: [
    {
      id: string;
      amount_cents: number;
      description_clean: string;
      category: { id, code, name_es, icon, color_hex } | null;
      category_source: "auto" | "manual" | "corrected";
      category_confidence: number;
      account: { id, name, type };
      transaction_date: string;
      is_excluded: boolean;
    }
  ];
  next_cursor: string | null;
  total_count: number;
}
```

#### `PATCH /transactions/:id`
```typescript
// Request (actualización parcial)
{
  category_id?: string;     // Reclasificación manual
  is_excluded?: boolean;    // Excluir de cálculos
  description_clean?: string; // Editar descripción
}

// Response 200: transacción actualizada
```

---

### 4.5 Contratos de API — Módulo Predicciones

#### `GET /predictions`
```typescript
// Query params
{ horizon_days: 7 | 14 | 30; }

// Response 200
{
  horizon_days: number;
  prediction_date: string;
  predicted_balance_cents: number;
  predicted_income_cents: number;
  predicted_expense_cents: number;
  breakeven_day: string | null;
  confidence_score: number;
  model_version: string;
  daily_burn_rate_cents: number;
  timeline: [                     // Puntos para el gráfico de línea
    { date: string; predicted_balance_cents: number; is_projection: boolean; }
  ];
  recommendations: [
    {
      type: "reduce_expense" | "accelerate_income" | "postpone_purchase";
      title: string;
      description: string;
      estimated_impact_cents: number;
    }
  ];
}
```

---

### 4.6 Contratos de API — Simulador de compra

#### `POST /simulator/purchase-check`
```typescript
// Request
{
  amount_cents: number;       // Monto de la compra
  category_id?: string;       // Opcional: categoría de la compra
}

// Response 200
{
  can_purchase: boolean;
  recommendation: "yes" | "yes_with_caution" | "no";
  current_balance_cents: number;
  balance_after_purchase_cents: number;
  balance_in_30d_cents: number;        // Con esta compra incluida
  safety_margin_cents: number;         // Mínimo recomendado (1 mes de gastos fijos)
  reasons: string[];
  alternatives?: [                      // Si can_purchase = false
    { action: string; description: string; estimated_gain_cents: number; }
  ];
}
```

---

### 4.7 Contratos de API — Alertas

#### `GET /alerts`
```typescript
// Query params
{ unread_only?: boolean; severity?: "info" | "warning" | "critical"; limit?: number; }

// Response 200
{
  items: Alert[];
  unread_count: number;
}
```

#### `PATCH /alerts/:id`
```typescript
// Request
{ is_read?: boolean; is_dismissed?: boolean; action_taken?: boolean; }
```

---

### 4.8 Contratos de API — Cuentas

#### `GET /accounts`
```typescript
// Response 200
{
  items: [
    {
      id, type, name, balance_cents, currency,
      sync_status, last_synced_at, provider_code, is_active
    }
  ];
  total_balance_cents: number;
}
```

#### `POST /accounts/connect/bank`
```typescript
// Request (inicia flujo Belvo)
{ provider_code: string; } // "belvo_bcp", "belvo_bbva", "belvo_interbank"

// Response 200
{
  belvo_link_id: string;   // ID del link Belvo para el widget
  widget_url: string;      // URL para redirigir al usuario al widget de Belvo
}
```

#### `POST /accounts/connect/bank/callback`
```typescript
// Request (callback después de que Belvo completa la auth)
{ belvo_link_id: string; }

// Response 201: cuenta creada con sync inicial
```

#### `POST /accounts/cash`
```typescript
// Request (caja manual)
{ name: string; initial_balance_cents: number; currency: string; }

// Response 201: cuenta creada
```

#### `POST /accounts/:id/sync`
```typescript
// Forzar sincronización manual
// Response 202 Accepted (la sync ocurre asíncronamente)
{ job_id: string; estimated_seconds: number; }
```

---

### 4.9 Contratos de API — Pasivos (Deudas)

#### `GET /liabilities`
```typescript
// Response 200
{
  items: [{ id, creditor_name, amount_cents, currency, due_date, status, description }];
  total_active_cents: number;
}
```

#### `POST /liabilities`
```typescript
// Request
{ creditor_name: string; amount_cents: number; currency?: string; due_date?: string; description?: string; }
```

#### `PATCH /liabilities/:id`
```typescript
// Request
{ status?: "active" | "partial" | "paid"; amount_cents?: number; }
```

---

### 4.10 Contratos de API — Reportes

#### `POST /reports/monthly`
```typescript
// Request
{ year: number; month: number; } // { year: 2026, month: 5 }

// Response 202 Accepted (PDF generado asíncronamente)
{ job_id: string; }

// GET /reports/:job_id — verificar estado
{ status: "pending" | "ready" | "error"; download_url?: string; expires_at?: string; }
```

---

## 5. PIPELINE DE MACHINE LEARNING

### 5.1 Arquitectura del servicio ML

El módulo ML es un microservicio Python separado del monolito Node.js. La comunicación es interna vía HTTP (nunca expuesto al público).

```
┌─────────────────────────────────────────────────────────┐
│                  MONOLITO NODE.JS                       │
│                                                         │
│  ml.worker.ts ──── HTTP interno ───→  ML Service        │
│                                       (FastAPI Python)  │
│                                                         │
│  Llama cuando:                        Responde con:     │
│  - Nueva transacción importada        - Categoría +     │
│  - Snapshot diario generado             confianza       │
│  - Usuario solicita predicción        - Predicción      │
│                                         de flujo        │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Módulo 1 — Clasificador de transacciones

**Problema**: Dada la descripción en texto de una transacción bancaria, asignar la categoría correcta.

**Estrategia de dos etapas para resolver el cold start:**

**Etapa 1 (Días 0–30 del negocio): Clasificador por reglas determinísticas**

Cuando un negocio es nuevo y no tiene historial, se usa un clasificador basado en reglas:

```python
# classifier/rules.py
RULES = {
    "MERCH": [
        r"distribuidora", r"proveedor", r"mercadería", r"stock",
        r"mayorista", r"almacén", r"bodega"
    ],
    "PAYROLL": [
        r"sueldo", r"salario", r"nómina", r"jornal", r"remuneración"
    ],
    "TRANSPORT": [
        r"gasolina", r"combustible", r"taxi", r"uber", r"rappi",
        r"moto", r"flete", r"transporte"
    ],
    "UTILITIES": [
        r"luz", r"electricidad", r"agua", r"teléfono", r"internet",
        r"claro", r"movistar", r"entel", r"sedapal", r"enel"
    ],
    "RENT": [
        r"alquiler", r"arriendo", r"local", r"tienda"
    ],
    "MARKETING": [
        r"facebook", r"google ads", r"publicidad", r"marketing",
        r"meta ads", r"tiktok ads"
    ],
    "TAXES": [
        r"sunat", r"igv", r"renta", r"essalud", r"afp"
    ],
}

def classify_by_rules(description: str) -> tuple[str, float]:
    desc = description.lower()
    for category, patterns in RULES.items():
        for pattern in patterns:
            if re.search(pattern, desc):
                return category, 0.85  # confianza fija de reglas
    return "OTHER_EXP", 0.50
```

**Etapa 2 (30+ días de historial): Modelo ML ligero**

Con suficiente historial (>200 transacciones), se entrena un clasificador por negocio:

```python
# classifier/model.py
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import joblib

def train_classifier(transactions: list[dict]) -> Pipeline:
    """
    Entrena un clasificador personalizado por negocio.
    Input: lista de transacciones con description_clean y category_code
    Output: pipeline sklearn serializable
    """
    texts = [t["description_clean"] for t in transactions]
    labels = [t["category_code"] for t in transactions]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            analyzer="word",
            lowercase=True,
            strip_accents="unicode"
        )),
        ("clf", LogisticRegression(
            max_iter=500,
            C=1.0,
            multi_class="multinomial",
            solver="lbfgs"
        ))
    ])
    pipeline.fit(texts, labels)
    return pipeline

def predict(pipeline: Pipeline, description: str) -> tuple[str, float]:
    probs = pipeline.predict_proba([description])[0]
    idx = probs.argmax()
    return pipeline.classes_[idx], float(probs[idx])
```

**Reentrenamiento**: Cada vez que un usuario corrige una categoría (`category_source = "corrected"`), se encola un job para reentrenar el modelo del negocio si tiene >50 correcciones nuevas desde el último entrenamiento.

---

### 5.3 Módulo 2 — Predictor de flujo de caja

**Problema**: Dado el historial de snapshots diarios, proyectar el balance para los próximos 7, 14 y 30 días e identificar si hay riesgo de quiebra.

**Estrategia progresiva según cantidad de datos:**

```python
# predictor/engine.py

def predict_cashflow(snapshots: list[DailySnapshot], horizon_days: int) -> PredictionResult:
    """
    Selecciona el mejor algoritmo según los datos disponibles.
    """
    n_days = len(snapshots)

    if n_days < 7:
        return _predict_linear_simple(snapshots, horizon_days)
    elif n_days < 30:
        return _predict_weighted_average(snapshots, horizon_days)
    else:
        return _predict_with_seasonality(snapshots, horizon_days)


def _predict_linear_simple(snapshots, horizon_days):
    """
    Para negocios con 1–6 días de datos.
    Estrategia: proyectar el burn rate de los últimos días.
    Confianza: 0.40 (baja — se muestra al usuario)
    """
    if not snapshots:
        return PredictionResult(confidence=0.0, ...)

    recent = snapshots[-min(3, len(snapshots)):]
    avg_daily_expense = mean(s.total_expense_cents for s in recent)
    avg_daily_income = mean(s.total_income_cents for s in recent)
    current_balance = snapshots[-1].total_balance_cents

    net_daily = avg_daily_income - avg_daily_expense
    projected = current_balance + (net_daily * horizon_days)

    breakeven = None
    if net_daily < 0:
        days_until = current_balance / abs(net_daily)
        if days_until <= horizon_days:
            breakeven = date.today() + timedelta(days=int(days_until))

    return PredictionResult(
        predicted_balance_cents=int(projected),
        predicted_income_cents=int(avg_daily_income * horizon_days),
        predicted_expense_cents=int(avg_daily_expense * horizon_days),
        breakeven_day=breakeven,
        confidence_score=0.40,
        model_version="v1.0.0-linear"
    )


def _predict_weighted_average(snapshots, horizon_days):
    """
    Para negocios con 7–29 días de datos.
    Estrategia: promedio ponderado (más peso a días recientes).
    Confianza: 0.65
    """
    # Los últimos 7 días tienen peso 2x vs días anteriores
    weights = [2 if i >= len(snapshots)-7 else 1 for i in range(len(snapshots))]
    weighted_expense = sum(
        s.total_expense_cents * w for s, w in zip(snapshots, weights)
    ) / sum(weights)
    weighted_income = sum(
        s.total_income_cents * w for s, w in zip(snapshots, weights)
    ) / sum(weights)

    # ... resto del cálculo igual que linear
    return PredictionResult(confidence_score=0.65, ...)


def _predict_with_seasonality(snapshots, horizon_days):
    """
    Para negocios con 30+ días de datos.
    Estrategia: descomposición estacional (día de semana + tendencia).
    Confianza: 0.85
    """
    import numpy as np
    from statsmodels.tsa.holtwinters import ExponentialSmoothing

    # Construir serie temporal de ingresos y gastos
    expense_series = np.array([s.total_expense_cents for s in snapshots])
    income_series = np.array([s.total_income_cents for s in snapshots])

    # Holt-Winters para capturar estacionalidad semanal
    expense_model = ExponentialSmoothing(
        expense_series,
        trend="add",
        seasonal="add",
        seasonal_periods=7  # ciclo semanal
    ).fit()

    income_model = ExponentialSmoothing(
        income_series,
        trend="add",
        seasonal="add",
        seasonal_periods=7
    ).fit()

    future_expenses = expense_model.forecast(horizon_days)
    future_incomes = income_model.forecast(horizon_days)

    # ... calcular balance proyectado día a día
    return PredictionResult(confidence_score=0.85, ...)
```

### 5.4 API interna del servicio ML

```python
# ml/src/api.py (FastAPI)
from fastapi import FastAPI
app = FastAPI()

@app.post("/classify")
async def classify_transaction(req: ClassifyRequest) -> ClassifyResponse:
    """
    Input:  { business_id, description, amount_cents, account_type }
    Output: { category_code, confidence, source: "rules" | "model" }
    """

@app.post("/predict")
async def predict_cashflow(req: PredictRequest) -> PredictResponse:
    """
    Input:  { business_id, horizon_days }
    Output: PredictionResult completo
    """

@app.post("/train")
async def trigger_training(req: TrainRequest):
    """
    Input:  { business_id }
    Encola reentrenamiento del modelo de ese negocio.
    """
```

---

## 6. WORKERS ASÍNCRONOS

Los workers usan **BullMQ** con Redis como broker. Cada tipo de trabajo tiene su propia cola con configuración de reintentos y prioridades.

### 6.1 sync-worker — Sincronización bancaria

```typescript
// workers/sync.worker.ts
const syncQueue = new Queue("bank-sync", { connection: redis });

// Programar sync periódico para todas las cuentas activas
// Cada 5 minutos para cuentas activas, cada 30 min para las demás
syncQueue.add("sync-all-accounts", {}, {
  repeat: { every: 5 * 60 * 1000 },
  jobId: "periodic-sync"
});

syncQueue.process(async (job) => {
  const accounts = await getAccountsToSync();
  for (const account of accounts) {
    const transactions = await belvoClient.getTransactions(account.belvo_link_id);
    await upsertTransactions(transactions, account.id);
    await classifyNewTransactions(account.business_id);
    await updateDailySnapshot(account.business_id);
    await runPredictions(account.business_id);
    await checkAndGenerateAlerts(account.business_id);
  }
});
```

### 6.2 alert-worker — Generación de alertas

```typescript
// workers/alert.worker.ts
async function checkAndGenerateAlerts(businessId: string) {
  const prediction = await getPrediction(businessId, 14);

  // Alerta de quiebra
  if (prediction.breakeven_day) {
    const daysUntil = daysBetween(new Date(), prediction.breakeven_day);
    const severity = daysUntil <= 3 ? "critical" : daysUntil <= 7 ? "warning" : "info";

    await createAlert({
      businessId,
      type: "breakeven",
      severity,
      title: `En ${daysUntil} días sin dinero para operar`,
      body: `Tu saldo proyectado llega a cero el ${formatDate(prediction.breakeven_day)}.`,
      data: { days_until: daysUntil, breakeven_day: prediction.breakeven_day }
    });

    if (severity === "critical") {
      await sendPushNotification(businessId, { title: "⚠️ Acción urgente", body: `En ${daysUntil} días sin dinero.` });
    }
  }

  // Alerta de anomalía en categoría
  const anomalies = await detectCategoryAnomalies(businessId);
  for (const anomaly of anomalies) {
    await createAlert({ type: "anomaly", severity: "warning", ...anomaly });
  }
}
```

---

## 7. ESTRATEGIA DE INTEGRACIÓN CON BANCOS

### 7.1 Proveedor elegido: Belvo

**Belvo** es el proveedor de Open Banking elegido para Latinoamérica. Soporta BCP, BBVA, Interbank, Scotiabank, Yape (vía BCP), y otros bancos peruanos sin necesidad de acuerdo directo con cada banco.

| Característica | Detalle |
|---------------|---------|
| Bancos soportados en Perú | BCP, BBVA, Interbank, Scotiabank, BanBif |
| Yape (via BCP) | Soportado desde 2025 |
| Tipo de acceso | Screen scraping + Open Banking API |
| Historial máximo | 90 días en plan Startup, 12 meses en planes superiores |
| Frecuencia de sync | Cada 4–6 horas (plan Startup) |
| Costo | $0.30–$0.50 por link/mes |
| SLA | 99.5% uptime |

**Flujo de conexión de banco:**

```
1. Usuario toca "Conectar banco"
2. API Comerci crea un Belvo Link (POST /api/links)
3. Frontend abre Belvo Widget con el link_id
4. Usuario ingresa credenciales en el widget de Belvo (Comerci NUNCA ve las credenciales)
5. Belvo retorna éxito con link_id confirmado
6. Frontend envía link_id confirmado a la API de Comerci
7. API Comerci guarda el link_id cifrado y dispara sync inicial
8. sync-worker descarga los últimos 90 días de transacciones
9. Dashboard actualizado en <30 segundos
```

### 7.2 Manejo de errores de sincronización

```typescript
const SYNC_ERROR_MESSAGES: Record<string, string> = {
  "session_expired":   "Tu sesión bancaria venció. Reconecta tu banco.",
  "invalid_credentials": "Credenciales incorrectas. Reconecta tu banco.",
  "bank_unavailable":  "Tu banco está en mantenimiento. Reintentando en 30 min.",
  "mfa_required":      "Tu banco requiere verificación. Ábrelo desde la app.",
  "rate_limit":        "Demasiadas consultas. Reintentando en 1 hora.",
};
```

---

## 8. SEGURIDAD

### 8.1 Autenticación y autorización

```
Flujo de autenticación:
1. Usuario hace login → API genera access_token (JWT, 24h) + refresh_token (JWT, 30 días)
2. Cada request lleva: Authorization: Bearer <access_token>
3. Middleware verifica JWT (firma + expiración)
4. Middleware establece: SET LOCAL app.current_user_id = '<uuid>'
5. Row-Level Security de PostgreSQL aplica automáticamente
6. Cuando access_token expira → cliente usa refresh_token para obtener uno nuevo
7. Cuando refresh_token expira → usuario debe hacer login nuevamente

Reglas adicionales:
- Rate limiting: 100 req/min por IP, 500 req/min por usuario autenticado
- Blacklist de tokens: Redis guarda tokens revocados (logout) por su TTL restante
- 2FA: TOTP (Google Authenticator) opcional desde v1.1
```

### 8.2 OWASP Top 10 — mitigaciones

| Vulnerabilidad | Mitigación |
|---------------|-----------|
| A01 — Broken Access Control | Row-Level Security PostgreSQL + validación de business_id en cada route |
| A02 — Cryptographic Failures | AES-256-GCM para tokens bancarios, bcrypt para passwords, TLS 1.3 obligatorio |
| A03 — Injection | Drizzle ORM con queries parametrizadas, nunca string concatenation en SQL |
| A04 — Insecure Design | Threat model documentado, revisión de seguridad en cada sprint |
| A05 — Security Misconfiguration | Infrastructure as Code (Terraform), no configuración manual |
| A06 — Vulnerable Components | Dependabot en GitHub + Snyk scanning automático |
| A07 — Auth Failures | Rate limiting en /auth/login (5 intentos/min), lockout temporal |
| A09 — Logging Failures | Audit log completo en PostgreSQL, logs en Datadog con alertas |
| A10 — SSRF | Whitelist de URLs externas en el servidor, no requests arbitrarios |

---

## 9. PLAN DE PRUEBAS

### 9.1 Pirámide de testing

```
           E2E Tests (5%)
          Críticos solo: flujo de registro,
         dashboard, alerta de quiebra
        ───────────────────────────────
         Integration Tests (25%)
        Módulos con DB real (test DB)
        API endpoints con Supertest
       ─────────────────────────────────
        Unit Tests (70%)
       Servicios, utilidades, ML models,
      funciones puras, clasificador de reglas
     ────────────────────────────────────────
```

### 9.2 Unit Tests — ejemplos críticos

```typescript
// predictions.engine.test.ts
describe("Predictor de flujo", () => {
  it("calcula breakeven correctamente con burn rate > income", () => {
    const snapshots = buildSnapshots({
      expense: 15000,  // S/ 150/día
      income:  8000,   // S/ 80/día
      balance: 100000  // S/ 1,000 actual
    });
    const result = predictCashflow(snapshots, 30);
    // Net burn: S/70/día. Días hasta 0: 1000/70 ≈ 14 días
    expect(result.breakeven_day).toEqual(addDays(new Date(), 14));
    expect(result.confidence_score).toBeGreaterThan(0);
  });

  it("retorna breakeven_day=null cuando flujo es positivo", () => {
    const snapshots = buildSnapshots({ expense: 8000, income: 15000, balance: 100000 });
    const result = predictCashflow(snapshots, 30);
    expect(result.breakeven_day).toBeNull();
  });
});

// transactions.classifier.test.ts
describe("Clasificador de transacciones", () => {
  it("clasifica mercadería correctamente por reglas", () => {
    const [category, confidence] = classifyByRules("PAGO A DISTRIBUIDORA LIMA SAC");
    expect(category).toBe("MERCH");
    expect(confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("clasifica servicios de telecomunicaciones", () => {
    const [category] = classifyByRules("CLARO PERU SAC - RECARGA TELEFONO");
    expect(category).toBe("UTILITIES");
  });
});
```

### 9.3 Integration Tests — endpoints críticos

```typescript
// dashboard.test.ts
describe("GET /api/v1/dashboard", () => {
  it("devuelve balance consolidado de todas las cuentas", async () => {
    const { accessToken, businessId } = await createTestBusiness();
    await seedAccounts(businessId, [
      { type: "bank", balance_cents: 180000 },
      { type: "yape", balance_cents: 120000 },
      { type: "cash", balance_cents: 85000 },
    ]);

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/dashboard",
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.balance.total_cents).toBe(385000);
    expect(body.balance.accounts).toHaveLength(3);
  });

  it("incluye alerta crítica cuando breakeven < 7 días", async () => {
    const { accessToken, businessId } = await createTestBusiness();
    await seedCriticalPrediction(businessId, { breakeven_in_days: 5 });

    const res = await app.inject({ method: "GET", url: "/api/v1/dashboard",
      headers: { Authorization: `Bearer ${accessToken}` } });

    const body = res.json();
    const criticalAlert = body.active_alerts.find((a: Alert) => a.severity === "critical");
    expect(criticalAlert).toBeDefined();
  });
});
```

### 9.4 Cobertura mínima requerida

| Capa | Cobertura mínima | Herramienta |
|------|-----------------|------------|
| Servicios de negocio (modules/*) | 80% | Vitest |
| Rutas HTTP (routes/*.ts) | 70% | Supertest |
| Motor de predicciones | 90% | Vitest |
| Clasificador ML | 85% | pytest |
| Funciones de cifrado | 100% | Vitest |

---

## 10. PIPELINE DE CI/CD

### 10.1 GitHub Actions — CI (cada Pull Request)

```yaml
# .github/workflows/ci.yml
name: CI

on: [pull_request]

jobs:
  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: comerci_test, POSTGRES_PASSWORD: test }
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install
      - run: pnpm --filter api run db:migrate:test
      - run: pnpm --filter api run test:coverage
      - run: pnpm --filter api run lint
      - run: pnpm --filter api run typecheck

  test-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm --filter mobile run typecheck
      - run: pnpm --filter mobile run lint

  test-ml:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r ml/requirements.txt
      - run: pytest ml/tests/ --cov=ml/src --cov-report=xml
```

### 10.2 GitHub Actions — Deploy

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    environment: production   # Requiere aprobación manual en GitHub
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t comerci-api:${{ github.sha }} ./apps/api
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URL
          docker push $ECR_URL/comerci-api:${{ github.sha }}
      - name: Run DB migrations
        run: pnpm --filter api run db:migrate:prod
      - name: Update ECS service
        run: aws ecs update-service --cluster comerci-prod --service api --force-new-deployment
      - name: Run smoke tests
        run: curl -f https://api.comerci.pe/health
```

---

## 11. GUÍA DE DESPLIEGUE LOCAL (Desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/comerci/comerci.git
cd comerci

# 2. Instalar dependencias (requiere pnpm)
pnpm install

# 3. Levantar servicios de infraestructura
docker-compose up -d postgres redis

# 4. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar .env con valores de desarrollo local

# 5. Ejecutar migraciones
pnpm --filter api run db:migrate

# 6. Poblar datos de seed
pnpm --filter api run db:seed

# 7. Iniciar el API en modo desarrollo (hot reload)
pnpm --filter api run dev

# 8. Iniciar la app mobile (en otra terminal)
pnpm --filter mobile run start
# Escanear QR con Expo Go en el teléfono

# 9. (Opcional) Iniciar el servicio ML
cd ml && pip install -r requirements.txt
uvicorn src.api:app --reload --port 8001
```

**docker-compose.yml para desarrollo local:**
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: comerci_dev
      POSTGRES_USER: comerci
      POSTGRES_PASSWORD: localpass
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  bullboard:
    image: deadly0/bull-board
    ports: ["3001:3001"]
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on: [redis]

volumes:
  postgres_data:
```

---

## 12. VARIABLES DE ENTORNO REQUERIDAS

```bash
# apps/api/.env.example

# Base de datos
DATABASE_URL=postgresql://comerci:localpass@localhost:5432/comerci_dev
DATABASE_URL_REPLICA=postgresql://comerci:localpass@localhost:5432/comerci_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=cambiar_en_produccion_min_32_chars
JWT_REFRESH_SECRET=cambiar_en_produccion_diferente_secreto
JWT_ACCESS_TTL=86400        # 24 horas en segundos
JWT_REFRESH_TTL=2592000     # 30 días en segundos

# Cifrado
ENCRYPTION_KEY=hex_de_64_caracteres_aleatorios_para_aes256

# Belvo (Open Banking)
BELVO_SECRET_ID=tu_secret_id_de_belvo
BELVO_SECRET_PASSWORD=tu_secret_password_de_belvo
BELVO_ENV=sandbox           # sandbox | production

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=comerci-prod
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...

# SendGrid (Emails)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=hola@comerci.pe

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM_NUMBER=+51xxxxxxx

# Culqi (Pagos Perú)
CULQI_PUBLIC_KEY=pk_test_xxxxx
CULQI_SECRET_KEY=sk_test_xxxxx

# ML Service
ML_SERVICE_URL=http://localhost:8001

# Monitoreo
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
DATADOG_API_KEY=xxxxx

# App
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
```

---

## 13. DOCUMENTACIÓN DE LA API (OpenAPI)

La documentación interactiva se genera automáticamente con Fastify Swagger:

```typescript
// apps/api/src/app.ts
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

await app.register(swagger, {
  openapi: {
    info: { title: "Comerci API", version: "1.0.0", description: "API de Comerci" },
    servers: [
      { url: "https://api.comerci.pe", description: "Producción" },
      { url: "http://localhost:3000", description: "Desarrollo" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    }
  }
});

await app.register(swaggerUI, { routePrefix: "/docs" });
```

Documentación disponible en: `http://localhost:3000/docs` (desarrollo) / `https://api.comerci.pe/docs` (producción, acceso restringido).

---

## 14. CHECKLIST DE IMPLEMENTACIÓN

```
Arquitectura general
[✅] Patrón elegido y justificado: Monolito Modular
[✅] Diagrama de componentes completo
[✅] Diagrama de flujo de datos (bancos → API → ML → DB → App)

Stack tecnológico
[✅] Backend: Node.js 20 + TypeScript + Fastify 4
[✅] ORM: Drizzle + PostgreSQL 16
[✅] Queue: BullMQ + Redis 7
[✅] Mobile: React Native + Expo SDK 51
[✅] Web: Next.js 14
[✅] Infraestructura: AWS ECS Fargate + RDS + ElastiCache
[✅] Costo estimado Year 1: ~$421/mes

Estructura de carpetas
[✅] Monorepo con pnpm workspaces + Turborepo
[✅] 9 módulos del API bien separados
[✅] Servicio ML separado (Python + FastAPI)

API Design
[✅] Convenciones generales (URL, auth, errores RFC 7807)
[✅] 15 endpoints con contratos TypeScript completos
[✅] Paginación cursor-based
[✅] Endpoint /dashboard optimizado (1 request = todo el estado)

Machine Learning
[✅] Cold start resuelto con clasificador por reglas (Día 0)
[✅] Transición automática a modelo ML con 30+ días de datos
[✅] Predictor progresivo: linear → weighted → Holt-Winters
[✅] API interna ML con FastAPI
[✅] Estrategia de reentrenamiento con correcciones del usuario

Workers asíncronos
[✅] sync-worker: sincronización bancaria cada 5 min
[✅] alert-worker: generación y envío de alertas
[✅] ml-worker: invocación del servicio de predicciones

Seguridad
[✅] JWT + refresh tokens
[✅] Row-Level Security PostgreSQL
[✅] Rate limiting por IP y por usuario
[✅] OWASP Top 10 mitigaciones documentadas

Integración bancaria
[✅] Proveedor elegido: Belvo
[✅] Flujo de conexión de banco paso a paso
[✅] Manejo de errores de sincronización

Plan de pruebas
[✅] Pirámide de testing (70% unit / 25% integration / 5% E2E)
[✅] Ejemplos de tests para predicciones y clasificador
[✅] Cobertura mínima por capa

CI/CD
[✅] GitHub Actions CI para cada PR
[✅] GitHub Actions Deploy con aprobación manual para producción

Despliegue local
[✅] Guía de setup en 9 pasos
[✅] docker-compose.yml para desarrollo
[✅] Variables de entorno documentadas con .env.example

Documentación API
[✅] OpenAPI con Fastify Swagger
[✅] Swagger UI disponible en /docs
```

---

## 📚 Cambios de Versión

**v1.0** (2026-05-18): Plantilla vacía
**v2.0** (2026-05-18): Documento completo — arquitectura monolito modular, stack justificado, 15 contratos de API, pipeline ML con cold start resuelto, workers BullMQ, integración Belvo, seguridad OWASP, plan de pruebas, CI/CD, guía de despliegue

---

*FASE 7 completada. El proyecto Comerci tiene documentación completa en las 7 fases. Listo para iniciar desarrollo.*
