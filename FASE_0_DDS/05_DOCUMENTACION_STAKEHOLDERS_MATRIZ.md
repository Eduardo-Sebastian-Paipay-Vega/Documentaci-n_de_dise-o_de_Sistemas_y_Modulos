# FASE 0 — Metodología DDS: Etapa 5 — Matriz Maestra de Trazabilidad Completa (42 RFs)

> **Proyecto**: Ecosistema Inteligente GYMsos / EDUCACION OS
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 5 — Stakeholders & Matriz de Trazabilidad (42 RFs)
> **Versión**: 2.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 📊 Matriz Maestra de Trazabilidad Total (42 RFs)

```
Stakeholder → RFs Asociados → Casos de Uso (CU) → Permisos → Procesos del Negocio
```

| Stakeholder / Actor | Requerimientos Funcionales (RF) | Casos de Uso (CU) | Permisos Requeridos | Proceso de Negocio Integrado |
|---------------------|--------------------------------|-------------------|---------------------|------------------------------|
| **`STUDENT_USER`** | `RF-002`, `RF-003`, `RF-004`, `RF-005`, `RF-006`, `RF-007`, `RF-011`, `RF-015`, `RF-022`, `RF-024`, `RF-028`, `RF-031`, `RF-032`, `RF-036`, `RF-039`, `RF-041`, `RF-042` | `CU-002`, `CU-003`, `CU-004`, `CU-005`, `CU-006`, `CU-011`, `CU-015`, `CU-022`, `CU-028`, `CU-031`, `CU-036`, `CU-039`, `CU-041`, `CU-042` | `learning:adaptive_access`, `content:view`, `assignment:submit`, `gamification:earn`, `chat:send`, `credentials:verify`, `tokens:earn`, `record:transfer` | Aprendizaje Adaptativo, Gamificación, Entrega de Tareas, Autonomía de Identidad y Aprendizaje Contextual |
| **`TEACHER_USER`** | `RF-001`, `RF-004`, `RF-007`, `RF-011`, `RF-014`, `RF-023`, `RF-029`, `RF-033`, `RF-038` | `CU-001`, `CU-004`, `CU-011`, `CU-014`, `CU-023`, `CU-029`, `CU-033`, `CU-038` | `course:create`, `assignment:grade`, `copilot:access_teacher`, `resources:share`, `digital_twin:simulate` | Creación Curricular, Calificación Asistida por IA, Simulación de Exámenes y Publicación de Contenidos |
| **`PARENT_USER`** | `RF-011`, `RF-015`, `RF-017`, `RF-033` | `CU-011`, `CU-015`, `CU-017`, `CU-033` | `dashboard:view_student_360`, `documents:sign`, `parent:view_feed` | Acompañamiento Familiar, Live Stream de Progreso y Firma de Contrato Educativo |
| **`ACADEMIC_ADMIN`**| `RF-001`, `RF-013`, `RF-014`, `RF-016`, `RF-017`, `RF-019`, `RF-021`, `RF-030`, `RF-034` | `CU-001`, `CU-013`, `CU-014`, `CU-016`, `CU-017`, `CU-019`, `CU-021`, `CU-030`, `CU-034` | `course:publish`, `announcement:broadcast`, `reports:generate`, `ews:view_alerts`, `analytics:view_benchmark`, `store:install_plugin` | Gestión Académica, Alertas EWS, Emisión de Actas, Benchmarking Sectorial y Expansión de Plugins |
| **`FINANCE_ADMIN`** | `RF-008`, `RF-009`, `RF-010`, `RF-018` | `CU-008`, `CU-009`, `CU-010`, `CU-018` | `payments:process`, `invoices:issue`, `notifications:send_financial`, `integration:manage_erp` | Gestión de Cobros, Facturación Electrónica Tributaria y Sincronización ERP |
| **`RECRUITER_USER`**| `RF-031`, `RF-035`, `RF-039` | `CU-031`, `CU-035`, `CU-039` | `recruitment:search_talent`, `proof_of_skill:verify` | Reclutamiento por Habilidades Verificadas y Proof of Skill |
| **`DEVELOPER_USER`**| `RF-034` | `CU-034` | `developers:manage_apps` | Desarrollo de Plugins y Monetización 70/30 |
| **`AI_SWARM` / `AI_ENGINE`** | `RF-002`, `RF-016`, `RF-021`, `RF-022`, `RF-023`, `RF-024`, `RF-025`, `RF-026`, `RF-027`, `RF-037`, `RF-038`, `RF-040` | `CU-002`, `CU-016`, `CU-021`, `CU-022`, `CU-023`, `CU-024`, `CU-025`, `CU-026`, `CU-027`, `CU-037`, `CU-038`, `CU-040` | `ai:prescribe`, `learning:dynamic_path`, `copilot:access_teacher`, `ai_swarm:interact`, `emotion:track_ethics` | Motor Autónomo Educativo, Swarm de Agentes 24/7 y Gemelo Digital |
| **`SUPER_ADMIN`** | `RF-001` a `RF-042` | Todos los CU | `*` (Control Maestro) | Gobernanza Global del Sistema Operativo EDUCACION OS |

---

*Fin de la Etapa 5 — Matriz Maestra de Trazabilidad 42 RFs Metodología DDS v2.0.*
