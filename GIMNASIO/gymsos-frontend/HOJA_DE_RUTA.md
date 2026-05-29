# GYMsos — Hoja de Ruta de Producto

> **Versión**: 1.0 | **Fecha**: 2026-05-29
> Documento vivo — actualizar con cada sprint completado.

---

## Estado actual del producto

```
Etapa:     MVP+ Estabilizado
Backend:   ✅ Supabase — 21 tablas activas, RLS completa (001+002+003)
Frontend:  ✅ 6 roles, 30+ pantallas, datos reales en core
IA/Analytics: 🟡 Parcial — churn_predictions + gamificación conectadas
Engagement:   🟡 En progreso — XP real, logros, alertas de salud
```

---

## SPRINT ACTUAL — Mayo/Junio 2026

### Completado ✅

| Feature | Impacto | Archivos |
|---------|---------|---------|
| RLS completa (001+002) | Seguridad real | migrations/ |
| Roles cliente + nutricionista | 2 nuevos flujos | schema + seeds |
| Middleware SSR | Sin bypass de rutas | middleware.ts |
| Gamification service real | XP desde BD | gamification.service.ts |
| Progreso conectado a BD | No más mocks | miembro/progreso/page.tsx |
| Alerts service | Alertas reales | alerts.service.ts |
| KPIs ejecutivos gerente | LTV, retención, horas pico | dashboard.service.ts |
| Auto-insights gerente | Texto generado automático | dashboard.service.ts |
| Tablas huérfanas cerradas | Arquitectura = Producto | migration 003 |

### En progreso 🟡

- [ ] Conectar nutricionista dashboard a datos reales (hoy usa mocks)
- [ ] Página QR — generar QR dinámico con UUID del miembro
- [ ] Mostrar nuevos KPIs (LTV, retención, horas pico) en la UI del gerente

---

## SPRINT 2 — Junio 2026

### Hacer el sistema "sentirse vivo"

| Feature | Descripción | Prioridad |
|---------|------------|-----------|
| Realtime accesos | `supabase.channel()` en recepcionista/acceso | 🔴 Alta |
| Alertas push | Renovación vencida → notificación in-app | 🔴 Alta |
| QR dinámico | Canvas con UUID + expiración cada 60s | 🔴 Alta |
| Live ocupación clases | Counter en tiempo real | 🟡 Media |
| Toast XP automático | "+100 XP 💪" al registrar acceso | 🟡 Media |

### Ciclo completo del miembro

| Feature | Descripción | Prioridad |
|---------|------------|-----------|
| Onboarding flow | Objetivos + evaluación física inicial | 🔴 Alta |
| Recomendaciones IA | `ai_recommendations` → pantalla miembro | 🟡 Media |
| Wearable sync básico | Botón conectar Garmin/Fitbit OAuth | 🟡 Media |
| Digital twin básico | Gráfico evolución peso/IMC | 🟡 Media |

---

## SPRINT 3 — Julio 2026

### Dashboard gerente "Wow"

| Feature | Descripción |
|---------|------------|
| Gráfico retención rolling | Curva de retención por cohorte de mes |
| Predictor ingresos | Proyección próximos 3 meses con tendencia |
| Mapa de calor horarios | Qué horas tienen más tráfico por día |
| Churn interventions UI | Enviar ofertas desde el panel con 1 clic |
| Export PDF automático | Reporte ejecutivo mensual generado |

### AI real

| Feature | Descripción |
|---------|------------|
| Scoring churn dinámico | Recalcular score al registrar acceso/pago |
| Recomendaciones ejercicio | Template-based + historial de clases |
| Alerta IMC automática | Trigger cuando nutricionista registra evaluación |
| Predicción renovación | X días antes de vencimiento → score propensidad |

---

## SPRINT 4 — Agosto 2026

### Mobile-first

- [ ] Responsive breakpoints para pantallas 375px (iPhone SE)
- [ ] Touch targets mínimo 44px (WCAG)
- [ ] Gestos swipe en listas de acceso y clases
- [ ] PWA: instalar como app en home screen
- [ ] Modo offline básico: QR funciona sin conexión

### Experiencia visual premium

- [ ] Skeleton loaders en todas las secciones async
- [ ] Microinteracciones: botón inscribirse, confirmar pago
- [ ] Animación de XP ganado (confetti / número flotante)
- [ ] Modo oscuro adaptativo (ya es dark-first)

---

## SPRINT 5 — Septiembre 2026

### Multi-gym real

- [ ] Panel super-admin para crear nuevos gimnasios
- [ ] Branding por gym (logo, colores primarios)
- [ ] Métricas separadas por gym en super-dashboard
- [ ] Plan de suscripción por gym (básico/pro/enterprise)

### Producción hardening

- [ ] Rate limiting en endpoints críticos
- [ ] CSP headers + CORS restrictivo
- [ ] Backup automático diario Supabase
- [ ] Staging environment separado
- [ ] Monitoring: uptime + error rate

---

## Tabla de decisión — tablas aspiracionales

| Tabla | Decisión | Cuándo |
|-------|----------|--------|
| `gamification_xp/levels` | ✅ Activa | Ya en Sprint 1 |
| `health_alerts` | ✅ Activa | Ya en Sprint 1 |
| `churn_predictions` | ✅ Activa | Ya activa |
| `ai_recommendations` | 🟡 Roadmap | Sprint 3 |
| `wearable_sync` | 🟡 Roadmap | Sprint 2 |
| `churn_interventions` | 🟡 Roadmap | Sprint 3 |
| `digital_twin` | 🟡 Roadmap | Sprint 2 |
| `battle_pass_progression` | ❌ Eliminada | — |
| `clanes / clan_miembros` | ❌ Eliminada | Post-v2 |
| `torneos_semanales` | ❌ Eliminada | Post-v2 |
| `marketplace_*` | ❌ Eliminada | Producto independiente |
| `corporate_*` | ❌ Eliminada | Enterprise v3 |
| `dynamic_pricing_log` | ❌ Eliminada | Post-v2 |

---

## Métricas de producto objetivo

| Métrica | Hoy | Meta Sprint 2 | Meta Sprint 4 |
|---------|-----|--------------|--------------|
| Tablas con servicio | 13/30 (43%) | 17/21 (81%) | 21/21 (100%) |
| Páginas con datos reales | 18/30 | 25/30 | 30/30 |
| Retención mensual | — | >80% | >87% |
| NPS score | 72 (mock) | Real desde BD | >75 real |
| Tiempo registro nuevo miembro | ~5 pasos | ~3 pasos | ~2 pasos |

---

## Features "Demo-Killer" (para presentaciones)

Estos 5 features hacen que la audiencia diga **"wtf esto sí está fuerte"**:

1. **Churn AI live** — mostrar predicción 82% de riesgo en tiempo real mientras se navega el perfil del miembro
2. **QR + acceso en 2 segundos** — demostrar el flujo físico completo
3. **Gamification XP** — registrar una sesión y ver `+100 XP 💪` animado
4. **Dashboard gerente** — mostrar LTV, retención y el auto-insight `"Las clases AM aumentan retención 23%"`
5. **Alertas inteligentes** — nutricionista ve `"Roberto: IMC > 30 sin plan activo"` automáticamente

---

*Actualizar esta hoja después de cada sprint. El producto vive en el código — la ruta vive aquí.*
