# FASE 0 — Metodología DDS: Etapa 5 — Documentación de Stakeholders & Matriz Maestra de Trazabilidad

> **Proyecto**: GYMsos Operating System
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 5 — Stakeholders y Matriz de Trazabilidad
> **Versión**: 1.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 👤 1. Catálogo Completo de Stakeholders

---

### 1.1 Stakeholder: Propietario de Gimnasio / Tenant (`TENANT_OWNER`)

* **Nombre del Actor**: Propietario / Socio Director de la Sede o Cadena Deportiva.
* **Tipo de Actor**: Humano Externo (Cliente Empresarial B2B).
* **Objetivos**: Maximizar la rentabilidad del centro deportivo, reducir la deserción (churn), automatizar cobros y visualizar métricas ejecutivas en tiempo real.
* **Responsabilidades**: Configuración inicial de la empresa, contratación de planes GYMsos, asignación de administradores y toma de decisiones financieras.
* **Procesos donde participa**: Onboarding multi-tenant, auditoría financiera, configuración de sedes, revisión de analítica predictiva de churn.
* **Requerimientos Funcionales Asociados**: `RF-001`, `RF-003`, `RF-005`, `RF-008`.
* **Casos de Uso Asociados**: `CU-001`, `CU-002`, `CU-005`, `CU-009`.
* **Información que puede visualizar**: Dashboard ejecutivo consolidados de ingresos, tasa de churn, aforo multi-sede, reportes de nómina y logs de auditoría.
* **Información que puede modificar**: Configuración comercial del tenant, asignación de roles administrativos, planes de membresía y tarifas.
* **Información que puede eliminar**: Desactivación temporizada de sedes o registros de personal (borrado lógico `deleted_at`).
* **Permisos**: `tenant:manage`, `finance:read_all`, `analytics:view_executive`, `staff:assign_admin`.
* **Restricciones**: No puede acceder a datos técnicos de la infraestructura de otros tenants ni alterar registros de auditoría Append-Only.
* **Riesgos asociados**: Compromiso de credenciales de alta jerarquía; mitigado con MFA obligatorio y alertas por login geográficamente distante.
* **Dependencias con otros actores**: Depende de `SUPER_ADMIN` para cambios en el contrato maestro de GYMsos.
* **Interacciones dentro del sistema**: Interfaz Web Desktop Executive Dashboard.

---

### 1.2 Stakeholder: Socio / Miembro Deportivo (`GYM_MEMBER`)

* **Nombre del Actor**: Socio / Cliente Final del Gimnasio o Estudiante.
* **Tipo de Actor**: Humano Consumidor B2C.
* **Objetivos**: Acceder rápidamente al gimnasio mediante su móvil, entrenar con rutinas adaptativas de IA, seguir su plan de nutrición y consultar su progreso.
* **Responsabilidades**: Mantener su membresía al día, registrar sus entrenamientos y cumplir con las normas del centro deportivo.
* **Procesos donde participa**: Check-in físico por QR dinámico, ejecución de rutinas prescritas, pago de cuotas y consumo de cursos LMS.
* **Requerimientos Funcionales Asociados**: `RF-002`, `RF-003`, `RF-004`, `RF-006`, `RF-007`.
* **Casos de Uso Asociados**: `CU-003`, `CU-007`, `CU-008`, `CU-011`.
* **Información que puede visualizar**: Su perfil biométrico, código QR dinámico de acceso, rutinas asignadas, historial de pagos y cursos matriculados.
* **Información que puede modificar**: Datos personales de contacto, fotos de perfil, pesos levantados y percepción de esfuerzo (RPE).
* **Información que puede eliminar**: Ninguna información transaccional o financiera.
* **Permisos**: `access:checkin`, `workout:log_progress`, `education:learn`, `profile:edit_own`.
* **Restricciones**: No puede ver datos de otros socios ni modificar precios ni fechas de vencimiento de sus planes.
* **Riesgos asociados**: Intento de préstamo de cuenta (mitigado por QR dinámico rotativo).
* **Dependencias con otros actores**: Depende de `TRAINER_USER` para revisiones de rutina y de `FINANCE_USER` para validación de cobros manuales.
* **Interacciones dentro del sistema**: App Móvil iOS / Android.

---

### 1.3 Stakeholder: Entrenador Personal / Staff Técnico (`TRAINER_USER`)

* **Nombre del Actor**: Entrenador Personal / Coach Deportivo.
* **Tipo de Actor**: Humano Operativo B2B.
* **Objetivos**: Prescribir y supervisar entrenamientos, evaluar composición corporal de sus clientes asignados y maximizar su tasa de retención.
* **Responsabilidades**: Diseñar rutinas adaptadas, tomar evaluaciones físicas, guiar la ejecución de ejercicios y dar seguimiento al progreso de los atletas.
* **Procesos donde participa**: Evaluación biométrica, supervisión de rutinas IA, asignación de dietas y atención al cliente en sala.
* **Requerimientos Funcionales Asociados**: `RF-004`, `RF-005`, `RF-008`.
* **Casos de Uso Asociados**: `CU-007`, `CU-008`, `CU-015`.
* **Información que puede visualizar**: Perfiles biométricos, historial de lesiones y rutinas de los socios asignados a su agenda.
* **Información que puede modificar**: Ajuste de volúmenes de entrenamiento, asignación de ejercicios y observaciones técnicas de valoración física.
* **Información que puede eliminar**: Ninguna entidad principal (solo notas en borrador de rutinas).
* **Permisos**: `workouts:create`, `biometrics:read_assigned`, `member:notes_write`.
* **Restricciones**: No puede visualizar datos financieros de la empresa ni información de socios no asignados a su tutela.
* **Riesgos asociados**: Negligencia en prescripción física (mitigado con contraindicaciones automáticas por IA).
* **Dependencias con otros actores**: Depende de `GYM_ADMIN` para asignación de clientes e incentivos de nómina.
* **Interacciones dentro del sistema**: App Móvil Coach / Tablet Web App.

---

## 📊 2. Matriz Maestra de Trazabilidad DDS

```
Stakeholder → RF → Casos de Uso → Permisos → Procesos del Negocio
```

| Stakeholder | RF Asociado | Casos de Uso (CU) | Permisos Requeridos | Proceso de Negocio Integrado |
|-------------|-------------|-------------------|---------------------|------------------------------|
| **`TENANT_OWNER`** | `RF-001`, `RF-003`, `RF-005` | `CU-001`, `CU-002`, `CU-009` | `tenant:configure`, `finance:read_all` | Onboarding, Gestión Multi-Sede y Control Ejecutivo de Retención |
| **`GYM_ADMIN`** | `RF-001`, `RF-005`, `RF-008` | `CU-002`, `CU-010`, `CU-016` | `staff:manage`, `crm:campaigns` | Administración Operativa de Sede y Liquidación de Comisiones |
| **`GYM_MEMBER`** | `RF-002`, `RF-003`, `RF-004` | `CU-003`, `CU-005`, `CU-007` | `access:checkin`, `workout:log` | Acceso Físico a Sede, Pagos y Entrenamiento Inteligente |
| **`TRAINER_USER`**| `RF-004`, `RF-005`, `RF-008` | `CU-007`, `CU-008`, `CU-015` | `workouts:create`, `biometrics:read` | Prescripción Biométrica, Couching y Retención Directa |
| **`POS_USER`** | `RF-003`, `RF-007` | `CU-005`, `CU-013`, `CU-014` | `pos:checkout`, `inventory:read` | Venta Presencial POS, Cobro de Pases e Inventario |
| **`STUDENT_USER`**| `RF-006` | `CU-011`, `CU-012` | `education:learn` | Capacitación Deportiva LMS y Certificación Digital |
| **`IOT_GATEWAY`** | `RF-002` | `CU-003`, `CU-004` | `iot:publish`, `access:verify` | Control Físico de Torniquetes y Telemetría de Aforo |
| **`SUPER_ADMIN`** | Todos los RF | Todos los CU | `*` (Acceso Maestro Global) | Gobernanza Global del Sistema Operativo GYMsos |

---

*Fin de la Etapa 5 — Documentación de Stakeholders & Matriz de Trazabilidad Metodología DDS v1.0.*
