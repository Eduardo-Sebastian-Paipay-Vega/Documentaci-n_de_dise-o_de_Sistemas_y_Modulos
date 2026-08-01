# FASE 0 — Metodología DDS: Etapa 5 — Matriz Maestra de Trazabilidad Unificada (113 RFs)

> **Proyecto**: GYMsos Ecosystem (Gimnasios, Educación OS, Comerci OS)
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 5 — Stakeholders & Matriz de Trazabilidad Unificada (113 RFs)
> **Versión**: 3.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 📊 Matriz Maestra de Trazabilidad Unificada (113 RFs)

```
Stakeholder → RFs Asociados por Vertical → Casos de Uso (CU) → Permisos → Procesos del Negocio
```

| Stakeholder / Actor | Vertical / Módulo | RFs Asociados | Casos de Uso (CU) | Permisos Requeridos | Proceso de Negocio Integrado |
|---------------------|-------------------|---------------|-------------------|---------------------|------------------------------|
| **`GYM_MEMBER`** | GIMNASIO OS | `RF-GIM-001` a `RF-GIM-007`, `RF-GIM-019` a `RF-GIM-030` | `CU-GIM-001` a `CU-GIM-007` | `access:checkin`, `workout:log`, `gamification:xp` | Membresía, Control Acceso QR, Batallas de Clanes, Dynamic Workouts y Wearables |
| **`GYM_ADMIN` / Owner**| GIMNASIO OS | `RF-GIM-008` a `RF-GIM-018`, `RF-GIM-035`, `RF-GIM-043` a `RF-GIM-045` | `CU-GIM-008` a `CU-GIM-015` | `tenant:manage`, `finance:admin`, `ai:upsell` | Gestión de Sede, Churn Predictivo, Precios Dinámicos y Corporate Wellness |
| **`STUDENT_USER`** | EDUCACION OS | `RF-EDU-002` a `RF-EDU-007`, `RF-EDU-022`, `RF-EDU-031`, `RF-EDU-036`, `RF-EDU-041`, `RF-EDU-042` | `CU-EDU-002` a `CU-EDU-006`, `CU-EDU-031`, `CU-EDU-042` | `learning:adaptive`, `credentials:verify`, `tokens:earn` | Aprendizaje Adaptativo, Blockchain Identidad Soberana, Tokens y Invisible UI |
| **`TEACHER_USER`** | EDUCACION OS | `RF-EDU-001`, `RF-EDU-004`, `RF-EDU-014`, `RF-EDU-023`, `RF-EDU-029`, `RF-EDU-038` | `CU-EDU-001`, `CU-EDU-004`, `CU-EDU-023`, `CU-EDU-038` | `course:create`, `copilot:teacher`, `digital_twin:simulate` | Creación Curricular, Copiloto Docente IA y Simulación con Gemelos Digitales |
| **`ACADEMIC_ADMIN`**| EDUCACION OS | `RF-EDU-013`, `RF-EDU-016`, `RF-EDU-021`, `RF-EDU-030`, `RF-EDU-034`, `RF-EDU-035` | `CU-EDU-013`, `CU-EDU-016`, `CU-EDU-021`, `CU-EDU-030` | `ews:view_alerts`, `analytics:benchmark`, `store:install` | Gestión Académica, Alertas EWS, Benchmarking B2B e Integración de Plugins |
| **`COMERCIANTE_USER`**| COMERCI OS | `RF-COM-001` a `RF-COM-020`, `RF-COM-021` a `RF-COM-023` | `CU-COM-001` a `CU-COM-003` | `finance:bank_sync`, `cashflow:predict`, `pos:manage` | Unificación Bancaria/Yape, Predicción de Punto de Quiebra (Días a $0) y Asistente de Compras |
| **`ACCOUNTANT_USER`** | COMERCI OS | `RF-COM-006`, `RF-COM-008`, `RF-COM-018` a `RF-COM-020`, `RF-COM-025` | `CU-COM-006`, `CU-COM-019` | `finance:read_only`, `reports:export` | Clasificación NLP de Gastos, Reconciliación y Reportes Ejecutivos |
| **`RECRUITER_USER`**| ECOSISTEMA | `RF-EDU-031`, `RF-EDU-035`, `RF-EDU-039` | `CU-EDU-035`, `CU-EDU-039` | `recruitment:search`, `proof_of_skill:verify` | Headhunting Algorítmico y Reclutamiento por Proof of Skill |
| **`AI_SWARM` / Engine**| ECOSISTEMA | `RF-GIM-019`, `RF-GIM-043`, `RF-EDU-021`, `RF-EDU-037`, `RF-COM-010` a `RF-COM-015` | Todos los CU de IA | `ai:prescribe`, `ai_swarm:interact`, `risk:predict` | Motor Autónomo del Ecosistema ("Tesla Moment") y Alertas Predictivas |
| **`SUPER_ADMIN`** | ECOSISTEMA | `RF-GIM-001` a `RF-GIM-045`, `RF-EDU-001` a `RF-EDU-042`, `RF-COM-001` a `RF-COM-026` | Todos los CU (113 RFs) | `*` (Control Maestro) | Gobernanza Global Multi-Tenant del Ecosistema GYMsos |

---

*Fin de la Matriz Maestra de Trazabilidad 113 RFs — Metodología DDS v3.0.*
