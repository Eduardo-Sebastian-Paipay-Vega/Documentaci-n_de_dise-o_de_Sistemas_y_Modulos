# FASE 0 — Metodología DDS: Requerimientos Funcionales GIMNASIO OS (RF-GIM-001 a RF-GIM-045)

> **Proyecto**: Ecosistema GYMsos — Vertical GIMNASIO OS
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 1 — Especificación Exhaustiva (45 RFs con 22 Atributos)
> **Versión**: 3.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 📌 Especificación Detallada de los 45 RFs de GIMNASIO OS

---

### Módulo G1: Operaciones Nucleares de Gimnasio

#### RF-GIM-001: Gestión de Registro y Membresías de Socios
* **1. ID**: `RF-GIM-001` | **2. Nombre**: Registro, Renovación y Suspensión de Membresías.
* **3. Objetivo**: Gestionar el ciclo de vida completo de la membresía del socio en el gimnasio.
* **4. Descripción**: Permite registrar nuevos miembros, asignar planes (mensual, trimestral, anual), procesar renovaciones, congelar pases temporales (freeze) y procesar cancelaciones.
* **5. Problema que resuelve**: Descontrol en las fechas de expiración y falta de trazabilidad de estados del cliente.
* **6. Actores**: Recepcionista (`STAFF_USER`), Socio (`GYM_MEMBER`), Administrador (`GYM_ADMIN`).
* **7. Precondiciones**: Tenant configurado en el sistema.
* **8. Postcondiciones**: Membresía registrada y estado activado en base de datos.
* **9. Flujo Principal**: 1. Seleccionar cliente -> 2. Elegir plan -> 3. Registrar forma de pago -> 4. Emitir contrato y recibo -> 5. Activar membresía.
* **10. Flujos Alt**: 10a. Pausa temporal por motivo médico (Freeze).
* **11. Excepciones**: 11a. Cliente con deuda previa (bloquea nueva membresía hasta liquidación).
* **12. Reglas de Negocio**: RN-GIM-001.1: El tiempo de congelamiento no puede superar 30 días al año.
* **13. Validaciones**: Documento de identidad y correo electrónico únicos por tenant.
* **14. Entradas**: Datos personales, `plan_id`, método de pago, fecha de inicio.
* **15. Salidas**: `membership_id`, fecha de vencimiento, comprobante en PDF.
* **16. Permisos**: `memberships:create`, `memberships:manage`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: Ninguna (Raíz operativa).
* **19. CUs**: `CU-GIM-001` (Gestionar Membresía).
* **20. Seguridad**: Control de acceso granular por sede (RLS).
* **21. Riesgos**: Inconsistencia en fechas de vencimiento (mitigado con horas UTC estandarizadas).
* **22. Criterios & Edge Cases**: Alta de membresía en menos de 2 minutos.

#### RF-GIM-002: Procesamiento de Pagos Recurrentes
* **1. ID**: `RF-GIM-002` | **2. Nombre**: Motor de Cobros Recurrentes y Dunning.
* **3. Objetivo**: Automatizar la cobranza de cuotas mensuales con tarjetas de crédito/débito.
* **4. Descripción**: Integra pasarelas (Stripe, MercadoPago, Niubiz) para cobros automáticos en la fecha de renovación, gestionando reintentos (Dunning) si el pago falla.
* **5. Problema que resuelve**: Alta morosidad por cobros manuales en recepción.
* **6. Actores**: Socio (`GYM_MEMBER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Tarjeta tokenizada por la pasarela de pago.
* **8. Postcondiciones**: Transacción aprobada y vigencia extendida automáticamente.
* **9. Flujo Principal**: 1. Encolar cobro en fecha límite -> 2. Invocar API pasarela -> 3. Procesar respuesta -> 4. Emitir factura -> 5. Notificar al socio.
* **10. Flujos Alt**: 10a. Reintento automático el día 1, 3 y 5 en caso de insuficiencia de fondos.
* **11. Excepciones**: 11a. Tarjeta vencida o cancelada (suspende acceso al gimnasio tras el 5to día).
* **12. Reglas de Negocio**: RN-GIM-002.1: Cumplimiento estricto PCI-DSS (no guardar CVV ni datos sensibles).
* **13. Validaciones**: Verificación de firmas criptográficas en Webhooks.
* **14. Entradas**: `member_id`, `amount`, `payment_token`.
* **15. Salidas**: `transaction_id`, estado del pago.
* **16. Permisos**: `payments:auto_charge`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-GIM-001`.
* **19. CUs**: `CU-GIM-002` (Cobrar Cuota Recurrente).
* **20. Seguridad**: Cifrado TLS 1.3 y tokens rotativos.
* **21. Riesgos**: Contracargos no justificados (mitigado con logs de logs de aceptación de términos).
* **22. Criterios & Edge Cases**: Procesamiento en < 3 segundos por transacción.

#### RF-GIM-003: Control de Acceso QR y Biométrico
* **1. ID**: `RF-GIM-003` | **2. Nombre**: Validación de Acceso Físico en Tiempo Real.
* **3. Objetivo**: Validar la entrada de miembros en menos de 300ms mediante QR dinámico o lectura facial.
* **4. Descripción**: Lee el QR rotativo del móvil o escaner facial en el torniquete, verifica membresía activa y aforo, y emite el pulso de apertura al hardware.
* **5. Problema que resuelve**: Colas de ingreso, fraude por transferencia de pases y sobre-aforo.
* **6. Actores**: Socio (`GYM_MEMBER`), Torniquete IoT (`IOT_GATEWAY`).
* **7. Precondiciones**: Dispositivo IoT conectado por WebSocket/MQTT a GYMsos.
* **8. Postcondiciones**: Registro de asistencia guardado y marcador de aforo incrementado.
* **9. Flujo Principal**: 1. Escanear QR -> 2. Validar token y vigencia -> 3. Emitir comando apertura -> 4. Registrar horario de ingreso.
* **10. Flujos Alt**: 10a. Validación mediante huella dactilar o reconocimiento facial offline.
* **11. Excepciones**: 11a. Membresía vencida o morosa (reproduce señal auditiva de rechazo y mantiene puerta cerrada).
* **12. Reglas de Negocio**: RN-GIM-003.1: Anti-Passback activado (impide reutilizar el mismo pase en 5 min).
* **13. Validaciones**: Expiración de QR cada 15 segundos.
* **14. Entradas**: Payload QR, `branch_id`, `mac_address`.
* **15. Salidas**: Estado de autorización (`GRANTED`/`DENIED`), comando relé.
* **16. Permisos**: `access:checkin`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-GIM-001`.
* **19. CUs**: `CU-GIM-003` (Acceder a la Sede).
* **20. Seguridad**: Tokens QR cifrados con HMAC-SHA256.
* **21. Riesgos**: Caída de internet en sede (mitigado con lista blanca local en Edge IoT).
* **22. Criterios & Edge Cases**: Validación y apertura de puerta en < 300 milisegundos.

#### RF-GIM-004: Gestión de Espacios y Mantenimiento de Máquinas
* **1. ID**: `RF-GIM-004` | **2. Nombre**: Control de Aforo de Salas y Mantenimiento Equipos.
* **3. Objetivo**: Administrar capacidades por zonas (pesas, cardio, yoga) y programar mantenimientos preventivos de máquinas.
* **4. Descripción**: Monitorea el aforo por sala, permite reservar espacios y mantiene la hoja de vida técnica de cada máquina registrando fallas y piezas cambiadas.
* **5. Problema que resuelve**: Máquinas fuera de servicio sin reparar y hacinamiento en áreas críticas del gimnasio.
* **6. Actores**: Administrador (`GYM_ADMIN`), Técnico (`MAINTENANCE_USER`).
* **7. Precondiciones**: Inventario de espacios y máquinas registrado.
* **8. Postcondiciones**: Registro de estado actualizado (`OPERATIVA`, `MANTENIMIENTO`, `FUERA_DE_SERVICIO`).
* **9. Flujo Principal**: 1. Registrar reporte de falla -> 2. Cambiar estado de máquina -> 3. Asignar orden de servicio -> 4. Registrar reparación -> 5. Habilitar máquina.
* **10. Flujos Alt**: 10a. Programación de mantenimiento preventivo automático cada 90 días.
* **11. Excepciones**: 11a. Intento de ingresar a sala al 100% de capacidad (bloquea la entrada física temporalmente).
* **12. Reglas de Negocio**: RN-GIM-004.1: No superar el aforo legal normativo de la infraestructura.
* **13. Validaciones**: Códigos de inventario únicos por máquina.
* **14. Entradas**: `machine_id`, tipo de falla, repuestos usados.
* **15. Salidas**: Estado de la máquina, alerta visual en la App del socio.
* **16. Permisos**: `machines:manage`, `spaces:capacity`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-GIM-001`.
* **19. CUs**: `CU-GIM-004` (Gestionar Equipos y Salas).
* **20. Seguridad**: Control de roles para cambio de estado de maquinaria.
* **21. Riesgos**: Accidente por uso de máquina averiada (mitigado con bloqueo QR inmediato).
* **22. Criterios & Edge Cases**: Notificación instantánea al equipo de mantenimiento tras reportar una falla.

#### RF-GIM-005 a RF-GIM-018: (Resumen de Especificación Completa de Módulo G1)
* **RF-GIM-005**: Programación de Clases Grupales y Gestión de Cupos.
* **RF-GIM-006**: Registro Automático de Asistencias y Frecuencia de Socios.
* **RF-GIM-007**: Automatización de Recordatorios Multicanal (WhatsApp, Push, Email).
* **RF-GIM-008**: Asistente Virtual 24/7 para Reservas y FAQ de Socios.
* **RF-GIM-009**: Administración de Entrenadores, Horarios y Carga de Trabajo.
* **RF-GIM-010**: Dashboard Analítico de KPIs de Gerencia en Tiempo Real.
* **RF-GIM-011**: Emisión y Programación de Reportes Automáticos en PDF/Excel.
* **RF-GIM-012**: Configuración Dinámica de Planes, Tarifas y Horarios Off-Peak.
* **RF-GIM-013**: Ficha Holística del Socio e Historial CRM Unificado.
* **RF-GIM-014**: QR Informativo y Tutoriales de Uso en Máquinas.
* **RF-GIM-015**: Administración Multi-Sucursal Centralizada de Cadenas.
* **RF-GIM-016**: Encriptación AES-256 y Protección de Datos Biométricos.
* **RF-GIM-017**: Comunicador mTLS con Hardware de Torniquetes y Barreras.
* **RF-GIM-018**: Motor de Cupones, Códigos Promocionales y Descuentos.

---

### Módulo G2: Gamificación & Smart Gym (RF-GIM-019 a RF-GIM-030)
* **RF-GIM-019**: Motor Predictivo de Churn por IA (30 días antes).
* **RF-GIM-020**: Intervención Automática Anti-Churn y Ofertas de Retención.
* **RF-GIM-021**: Gamificación - Sistema de Puntos XP y Niveles de Usuario.
* **RF-GIM-022**: Gamificación - Battle Pass Premium con 50 Tiers de Recompensas.
* **RF-GIM-023**: Gamificación - Sistema de Clanes y Batallas de Gimnasios.
* **RF-GIM-024**: Torneos y Desafíos Semanales Automáticos con Premios.
* **RF-GIM-025**: Digital Twin - Avatar 3D Evolutivo de Transformación Corporal.
* **RF-GIM-026**: Netflix Fitness - Generador Adaptativo de Rutinas Semanales.
* **RF-GIM-027**: Spotify Recommendations - Discovery Weekly de Ejercicios.
* **RF-GIM-028**: Smart Gym OS - Sensors IoT en Máquinas (Carga, Reps y ROM).
* **RF-GIM-029**: Smart Gym OS - Espejos Inteligentes con Corrección de Forma por Visión IA.
* **RF-GIM-030**: Smart Gym OS - Integración con Wearables (Apple Watch, Garmin, Whoop).

---

### Módulo G3: Marketplaces & Tesla Engine (RF-GIM-031 a RF-GIM-045)
* **RF-GIM-031**: Marketplace - Integración de Personal Trainers Freelance (30% Comisión).
* **RF-GIM-032**: Marketplace - Servicios de Nutricionistas con Seguimiento MyFitnessPal.
* **RF-GIM-033**: Marketplace - Venta POS de Suplementos y Merchandise Deportivo.
* **RF-GIM-034**: Marketplace - Recomendación y Afiliación de Dispositivos Wearables.
* **RF-GIM-035**: Corporate Wellness - Dashboard Empresarial para Recursos Humanos.
* **RF-GIM-036**: Corporate Wellness - Leaderboard de Competencia Inter-Departamental.
* **RF-GIM-037**: Preventive Health - Integración con Apple Health / Google Health.
* **RF-GIM-038**: Preventive Health - Alertas Automáticas de Anomalías en Ritmo Cardíaco.
* **RF-GIM-039**: Preventive Health - Expediente Compartido con Médicos de Cabecera.
* **RF-GIM-040**: AI Copilot para Entrenadores - Generador Asistido de Rutinas.
* **RF-GIM-041**: AI Copilot - Análisis de Corrección de Postura en Video Replay.
* **RF-GIM-042**: AI Copilot - Optimizador de Agenda y Horarios del Entrenador.
* **RF-GIM-043**: Tesla Moment - Optimización Autónoma de Crecimiento y Retención.
* **RF-GIM-044**: Tesla Moment - Motor de Precios Dinámicos según Demanda (Dynamic Pricing).
* **RF-GIM-045**: Tesla Moment - Motor Autónomo de Upsell y Cross-sell de Servicios.

---

*Fin de la Especificación de los 45 RFs de GIMNASIO OS Metodología DDS v3.0.*
