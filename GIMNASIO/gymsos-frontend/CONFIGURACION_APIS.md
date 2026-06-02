# GYMsos — Guía de Configuración de APIs

> Todas las variables van en `.env.local` (nunca en `.env` público).
> Fecha: 2026-05-30

---

## Estado actual

| API | Variable | Estado | Impacto si falta |
|-----|---------|--------|-----------------|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurada | App no inicia |
| Supabase Anon Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | App no inicia |
| Gemini AI | `GEMINI_API_KEY` | ❌ Pendiente | `/api/ai` retorna 503 |
| Stripe Secret | `STRIPE_SECRET_KEY` | ❌ Pendiente | Pagos con tarjeta no funcionan |
| Stripe Public | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ Pendiente | Formulario de tarjeta no carga |
| Web Push VAPID | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ❌ Pendiente | Notificaciones push no funcionan |

---

## 1. Supabase ✅ (ya configurado)

Proyecto activo: `qafvnjoqvdtnrdvlnwco.supabase.co`

```env
NEXT_PUBLIC_SUPABASE_URL=https://qafvnjoqvdtnrdvlnwco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Orden de migraciones a ejecutar:**
```
1. supabase-schema.sql         ← schema base (30 tablas)
2. migrations/001_fix_roles_rls_atomic.sql
3. migrations/002_rls_full_matrix_audit.sql
4. migrations/003_orphan_tables_decision.sql ← DROP 9 tablas + RLS restantes
```

---

## 2. Gemini AI ❌ (PRÓXIMA PRIORIDAD)

**Plan gratuito de Google AI Studio:**
- 15 RPM (requests per minute)
- 1M tokens/minuto
- 1500 requests/día
- Modelo: `gemini-1.5-flash`
- **Costo: $0.00** para el volumen de un gimnasio mediano

**Cómo obtener la clave:**
1. Ve a https://aistudio.google.com/app/apikey
2. Clic en "Create API key"
3. Copia la clave (formato: `AIza...`)
4. Agrégala en `.env.local`:

```env
GEMINI_API_KEY=AIzaSy...TuClaveAqui
```

**Qué desbloquea:**
- `POST /api/ai` → recomendaciones de workout personalizadas
- `POST /api/ai` tipo `nutricion` → planes nutricionales AI
- `POST /api/ai` tipo `churn_intervencion` → textos de intervención para churn
- Tabla `ai_recommendations` poblada con datos reales

**Endpoint creado:** `src/app/api/ai/route.ts`
**Servicio:** `src/lib/services/ai.service.ts`

---

## 3. Stripe ❌ (opcional — para tarjetas)

GYMsos ya soporta: efectivo, Yape, Plin, transferencia.
Stripe solo es necesario si quieres cobrar con tarjeta de crédito/débito online.

**Cómo obtener:**
1. https://dashboard.stripe.com/register
2. Settings > API Keys
3. Copiar "Secret key" y "Publishable key"

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Nota:** `id_transaccion_stripe` ya existe en la tabla `pagos`. La integración frontend requiere instalar `@stripe/stripe-js` y `stripe`.

---

## 4. Web Push Notifications ❌ (opcional)

Para enviar alertas de renovación y churn en tiempo real al navegador del gerente/miembro.

**Cómo configurar (gratis, usando Web Push API):**
```bash
npx web-push generate-vapid-keys
```
Salida:
```
Public Key: BEl62i...
Private Key: tBgKv...
```

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62i...
VAPID_PRIVATE_KEY=tBgKv...
```

Requiere instalar: `npm install web-push`

---

## 5. Wearable OAuth (roadmap Sprint 2)

Para `wearable_sync` tabla — integración con Garmin/Fitbit/Apple Health.

| Plataforma | Variable necesaria | Obtener en |
|-----------|-------------------|-----------|
| Garmin | `GARMIN_CONSUMER_KEY` + `GARMIN_CONSUMER_SECRET` | developer.garmin.com |
| Fitbit | `FITBIT_CLIENT_ID` + `FITBIT_CLIENT_SECRET` | dev.fitbit.com |

---

## Checklist para producción

```
✅ Supabase configurado
□  Gemini API key → obtener en aistudio.google.com (5 minutos, gratis)
□  Supabase RLS migración 003 ejecutada
□  Stripe (solo si se necesitan pagos con tarjeta)
□  Web Push VAPID (opcional, para notificaciones)
□  Dominio custom en Vercel/hosting
□  Variables de entorno en el hosting (no solo local)
```

---

## Cómo probar Gemini después de configurar

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "workout",
    "contexto": {
      "nombre": "Carlos Mamani",
      "nivel": 12,
      "sesiones_mes": 8,
      "plan": "Gold Premium"
    }
  }'
```

Respuesta esperada:
```json
{
  "recomendacion": "¡Carlos, tu nivel 12 demuestra dedicación! Hoy te propongo un circuito HIIT de 45min para quemar calorías y ganar XP.",
  "accion_sugerida": "Reservar clase funcional 18:00",
  "urgencia": "baja",
  "tags": ["hiit", "cardio", "nivel-12"]
}
```
