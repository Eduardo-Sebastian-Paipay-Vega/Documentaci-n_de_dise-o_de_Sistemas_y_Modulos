# FASE 0 — Metodología DDS: Etapa 1 — Documentación Exhaustiva de los 42 Requerimientos Funcionales (RF)

> **Proyecto**: Ecosistema Inteligente GYMsos / EDUCACION OS
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 1 — Requerimientos Funcionales Exhaustivos (42 RFs por Módulos)
> **Versión**: 2.0 (COBERURA TOTAL 42 RF)
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 📌 Introducción y Estructura por Módulos

Conforme a las reglas estrictas de la **Fase 0 de la metodología DDS**, la especificación funcional debe ser completa y no ambigua antes de continuar con la base de datos o arquitectura.

Este documento contiene la **especificación exhaustiva de los 42 Requerimientos Funcionales (RF-001 a RF-042)** divididos en **13 Módulos Funcionales**, detallando para cada uno los **22 atributos obligatorios**:
1. Identificador | 2. Nombre | 3. Objetivo | 4. Descripción detallada | 5. Problema que resuelve | 6. Actores | 7. Precondiciones | 8. Postcondiciones | 9. Flujo principal | 10. Flujos alternativos | 11. Flujos de excepción | 12. Reglas de negocio | 13. Validaciones | 14. Datos entrada | 15. Datos salida | 16. Permisos | 17. Prioridad | 18. Dependencias | 19. Casos de Uso (CU) | 20. Seguridad | 21. Riesgos | 22. Criterios de Aceptación, Edge Cases y Observaciones Técnicas.

---

## 🔴 TIER 1: REQUISITOS FUNCIONALES BASE (RF-001 A RF-020)

---

### 📦 MÓDULO 1: ENSEÑANZA Y CONTENIDOS

#### RF-001: Estructura Modular de Cursos
* **1. ID**: `RF-001` | **2. Nombre**: Creador y Organizador Modular de Cursos.
* **3. Objetivo**: Estructurar la malla curricular en jerarquías de Módulos → Temas → Lecciones → Evaluaciones.
* **4. Descripción**: El sistema permite a profesores y coordinadores crear mallas dinámicas, adjuntar materiales multimedia, definir requisitos de correlatividad entre lecciones y publicar contenidos temporizados o basados en el avance.
* **5. Problema que resuelve**: Desorganización de contenidos educativos dispersos en repositorios no estructurados.
* **6. Actores**: Profesor (`TEACHER_USER`), Coordinador (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: Usuario autenticado con permisos de creación de contenidos bajo el tenant correspondiente.
* **8. Postcondiciones**: Malla curricular registrada en la base de datos con versión `DRAFT` o `PUBLISHED`.
* **9. Flujo Principal**: 1. Crear nuevo curso -> 2. Agregar módulos -> 3. Insertar temas y lecciones -> 4. Definir reglas de paso -> 5. Publicar.
* **10. Flujos Alt**: 10a. Importar estructura modular desde plantilla estándar SCORM / LTI / JSON.
* **11. Excepciones**: 11a. Error de archivo adjunto corrupto (cancela inserción de lección y alerta).
* **12. Reglas de Negocio**: RN-001.1: Un módulo no puede publicarse si contiene lecciones vacías sin contenido.
* **13. Validaciones**: Título de curso entre 5 y 150 caracteres, slug único por tenant.
* **14. Entradas**: Título, descripción, módulos, lecciones, archivos PDF/MP4, orden de correlatividad.
* **15. Salidas**: `course_id`, estructura JSON de árbol curricular, estado de publicación.
* **16. Permisos**: `course:create`, `course:publish`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: NINGUNA (Raíz curricular).
* **19. CUs**: `CU-001` (Gestionar Curso).
* **20. Seguridad**: Sanitización XSS de descripciones e inspección antivirus de archivos subidos.
* **21. Riesgos**: Pérdida de cambios en borrador (mitigado con auto-guardado en cliente).
* **22. Criterios & Edge Cases**: Carga instantánea de la estructura curricular en < 500ms. Edge Case: Intento de crear bucles infinitos de correlatividad (se bloquea con validación de grafos acíclicos DAG).

#### RF-002: Motor de Aprendizaje Adaptativo IA
* **1. ID**: `RF-002` | **2. Nombre**: Adaptación Automática de Contenidos por IA.
* **3. Objetivo**: Ajustar dinámicamente el ritmo, dificultad y formato de las lecciones según el desempeño del estudiante.
* **4. Descripción**: Evalúa continuamente las respuestas y velocidad de aprendizaje. Si el estudiante falla un concepto clave, recalibra la ruta insertando explicaciones alternativas o micro-lecciones de refuerzo.
* **5. Problema que resuelve**: Frustración y abandono por aprendizaje rígido no adaptado a la velocidad individual.
* **6. Actores**: Estudiante (`STUDENT_USER`), Motor IA (`AI_ENGINE`).
* **7. Precondiciones**: Estudiante matriculado con al menos 1 evaluación realizada.
* **8. Postcondiciones**: Ruta de lecciones reconfigurada en la agenda del estudiante.
* **9. Flujo Principal**: 1. Estudiante rinde test -> 2. IA detecta laguna conceptual -> 3. Reorganiza temario en vivo -> 4. Presenta lección adaptada.
* **10. Flujos Alt**: 10a. Estudiante con desempeño sobresaliente (IA salta módulos introductorios automáticamente).
* **11. Excepciones**: 11a. Fallo en servicio LLM/IA (el sistema conmuta temporalmente a ruta determinista por defecto).
* **12. Reglas de Negocio**: RN-002.1: La dificultad no puede incrementarse en más de 2 niveles en un solo paso.
* **13. Validaciones**: Rango de precisión del modelo > 85%.
* **14. Entradas**: Respuestas a test, tiempo de resolución, interacciones previas.
* **15. Salidas**: `learning_path_next_item`, nivel de dificultad asignado, recomendación personalizada.
* **16. Permisos**: `learning:adaptive_access`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-001`.
* **19. CUs**: `CU-002` (Aprender con Ruta Adaptativa).
* **20. Seguridad**: Telemetría anonimizada de datos de aprendizaje.
* **21. Riesgos**: Sesgos de IA en la evaluación (mitigado con supervisión docente).
* **22. Criterios & Edge Cases**: Re-generación de ruta en menos de 1.5 segundos. Edge Case: Estudiante responde al azar (detectado por velocidad anormal y re-evaluado).

#### RF-003: Visualizador Multimedia Interactivo
* **1. ID**: `RF-003` | **2. Nombre**: Reproducción y Renderizado de Contenidos Multimedia.
* **3. Objetivo**: Renderizar videos HLS, documentos PDF interactivos, quizes embebidos y modelos 3D.
* **4. Descripción**: Proveer un reproductor web/móvil con control de velocidad, transcripción automática en vivo, subtítulos multilingües y marcadores de progreso en tiempo real.
* **5. Problema que resuelve**: Falta de engagement por formatos estáticos o video streaming pesado.
* **6. Actores**: Estudiante (`STUDENT_USER`).
* **7. Precondiciones**: Acceso a la lección correspondiente.
* **8. Postcondiciones**: Actualización del tiempo de visualización y progreso acumulado.
* **9. Flujo Principal**: 1. Cargar reproductor -> 2. Iniciar streaming HLS adaptativo -> 3. Emitir ping de progreso cada 10s -> 4. Marcar lección como vista.
* **10. Flujos Alt**: 10a. Modo offline en App móvil (descarga previa cifrada).
* **11. Excepciones**: 11a. Ancho de banda insuficiente (baja automáticamente la resolución a 360p sin detener reproducción).
* **12. Reglas de Negocio**: RN-003.1: No se otorga el hito si la lección se adelanta manualmente sin reproducir.
* **13. Validaciones**: Compatibilidad de formatos (HLS, DASH, PDF.js).
* **14. Entradas**: `lesson_id`, posición del reproductor (segundos).
* **15. Salidas**: % de avance consumido, estado de completitud.
* **16. Permisos**: `content:view`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-001`.
* **19. CUs**: `CU-003` (Consumir Lección Multimedia).
* **20. Seguridad**: URLs firmadas (Signed URLs) con expiración corta para prevenir enlaces públicos.
* **21. Riesgos**: Carga excesiva de ancho de banda (mitigado con CDN Edge Cloudflare).
* **22. Criterios & Edge Cases**: Latencia de inicio de video < 800ms. Edge Case: Pérdida de conexión en segundo 59 de un video (progreso guardado localmente).

#### RF-004: Envío y Calificación de Tareas
* **1. ID**: `RF-004` | **2. Nombre**: Módulo de Entregas y Calificación Docente.
* **3. Objetivo**: Gestionar la entrega digital de asignaciones por los estudiantes y el procesamiento de retroalimentación por los docentes.
* **4. Descripción**: Permite adjuntar archivos, enlaces o repositorios de código (GitHub), soporta rúbricas configurables y calificación manual o asistida por IA.
* **5. Problema que resuelve**: Extravío de tareas, falta de trazabilidad en fechas de entrega y lentitud en el feedback.
* **6. Actores**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Tarea publicada con fecha límite activa.
* **8. Postcondiciones**: Entrega registrada con marca de tiempo e inmutable tras la fecha de cierre.
* **9. Flujo Principal**: 1. Subir trabajo -> 2. Confirmar envío -> 3. Notificar docente -> 4. Docente califica con rúbrica -> 5. Publicar nota.
* **10. Flujos Alt**: 10a. Re-entrega autorizada por el profesor tras solicitud del alumno.
* **11. Excepciones**: 11a. Entrega fuera de plazo (marcada como `LATE` y sujeta a penalización según regla del docente).
* **12. Reglas de Negocio**: RN-004.1: No se permiten entregas mayores a 50MB por archivo directamente en servidor.
* **13. Validaciones**: Verificación de extensión de archivo permitida (.pdf, .docx, .zip).
* **14. Entradas**: Archivo enviado, comentarios, ID de tarea, notas de rúbrica.
* **15. Salidas**: Calificación numérica/cualitativa, feedback en texto/audio, estado de entrega.
* **16. Permisos**: `assignment:submit`, `assignment:grade`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-001`.
* **19. CUs**: `CU-004` (Entregar Tarea y Calificar).
* **20. Seguridad**: Escaneo antivirus obligatorio de todo archivo subido.
* **21. Riesgos**: Plagio de tareas entre estudiantes (mitigado con motor de detección de similitud).
* **22. Criterios & Edge Cases**: Confirmación de envío inmediata con recibo PDF. Edge Case: Envío a las 23:59:59 con latencia de red (timestamp registrado en cliente con servidor NTP).

---

### 🎮 MÓDULO 2: GAMIFICACIÓN Y RECOMPENSAS

#### RF-005: Sistema de Badges y Logros
* **1. ID**: `RF-005` | **2. Nombre**: Otorgamiento Automatizado de Badges e Hitos.
* **3. Objetivo**: Incentivar la constancia mediante insignias digitales emitidas automáticamente al cumplir logros.
* **4. Descripción**: Define reglas de emisión (ej. "7 días seguidos aprendiendo", "Nota perfecta en Examen Módulo 1") y otorga badges visuales con metadatos verificables.
* **5. Problema que resuelve**: Falta de motivación y desconexión en el aprendizaje remoto.
* **6. Actores**: Estudiante (`STUDENT_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Evento educativo completado (ej. lección finalizada).
* **8. Postcondiciones**: Badge añadido al perfil del usuario e incremento de reputación.
* **9. Flujo Principal**: 1. Evento disparado -> 2. Evaluador de reglas comprueba criterios -> 3. Emitir badge -> 4. Notificar con animación modal.
* **10. Flujos Alt**: 10a. Otorgamiento manual de badge especial por parte del docente.
* **11. Excepciones**: 11a. Regla de badge inconsistente (se ignora evento y registra log de advertencia).
* **12. Reglas de Negocio**: RN-005.1: Un badge único no puede otorgarse dos veces al mismo usuario.
* **13. Validaciones**: Comprobación de integridad del evento.
* **14. Entradas**: `user_id`, `event_type`, `metrics`.
* **15. Salidas**: `badge_id`, fecha de obtención, imagen SVG de insignia.
* **16. Permisos**: `gamification:earn`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-001`.
* **19. CUs**: `CU-005` (Desbloquear Logros).
* **20. Seguridad**: Firma criptográfica para evitar inyección de badges vía API manipulada.
* **21. Riesgos**: Inflación de puntos y badges sin valor real (equilibrado en diseño de economía).
* **22. Criterios & Edge Cases**: Animación visual fluida a 60fps al recibir badge. Edge Case: Obtención simultánea de 3 badges por un solo examen (notificaciones encoladas ordenadamente).

#### RF-006: Leaderboards Dinámicos
* **1. ID**: `RF-006` | **2. Nombre**: Tablas de Clasificación e Ranking Competitivo.
* **3. Objetivo**: Publicar rankings semanales y mensuales de estudiantes ordenados por puntos de experiencia (XP).
* **4. Descripción**: Mantiene tablas de clasificación globales, por sección, por curso y entre pares, filtrando la competencia por niveles para evitar la desmotivación de principiantes.
* **5. Problema que resuelve**: Aislamiento y falta de referentes de progreso en la comunidad.
* **6. Actores**: Estudiante (`STUDENT_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Puntos XP registrados en la cuenta del usuario.
* **8. Postcondiciones**: Posición actualizada en la tabla de líderes.
* **9. Flujo Principal**: 1. Actualización de XP -> 2. Recálculo en caché Redis -> 3. Publicación de tabla -> 4. Notificar ascenso de posición.
* **10. Flujos Alt**: 10a. Modo anónimo (el estudiante puede ocultar su nombre real en el ranking).
* **11. Excepciones**: 11a. Empate de puntos (se desempata por el usuario que alcanzó la puntuación primero).
* **12. Reglas de Negocio**: RN-006.1: Reinicio de leaderboard semanal cada domingo a las 23:59 UTC.
* **13. Validaciones**: Caché sincronizado cada 60 segundos.
* **14. Entradas**: `user_id`, `xp_delta`, `timeframe`.
* **15. Salidas**: Posición en ranking, lista top 100, diferencia de puntos con el siguiente puesto.
* **16. Permisos**: `leaderboard:view`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-005`.
* **19. CUs**: `CU-006` (Consultar Leaderboard).
* **20. Seguridad**: Sanitización de nombres mostrados en la tabla para evitar texto inapropiado.
* **21. Riesgos**: Desmotivación de alumnos en puestos bajos (mitigado con ligas por niveles/divisiones).
* **22. Criterios & Edge Cases**: Carga de tabla de líderes en < 200ms mediante Redis Sorted Sets.

#### RF-007: Misiones y Retos Semanales
* **1. ID**: `RF-007` | **2. Nombre**: Motor de Retos Temporizados y Quests.
* **3. Objetivo**: Desplegar misiones temporales que motivan la práctica de habilidades específicas.
* **4. Descripción**: Docentes o el sistema configuran misiones con tiempo límite (ej: "Completa 3 quizes de matemáticas esta semana"). El cumplimiento otorga multiplicadores de experiencia (XP Boosters).
* **5. Problema que resuelve**: Rutina monótona y falta de variedad en el aprendizaje diario.
* **6. Actores**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Misión activa en el calendario institucional.
* **8. Postcondiciones**: Recompensa entregada al completar el 100% de la misión.
* **9. Flujo Principal**: 1. Ver lista de misiones -> 2. Aceptar reto -> 3. Ejecutar actividades -> 4. Cobrar recompensa.
* **10. Flujos Alt**: 10a. Retos grupales en equipo donde todos colaboran para completar la barra de progreso.
* **11. Excepciones**: 11a. Expiración de tiempo sin completar (la misión pasa a expirada sin entregar bonus).
* **12. Reglas de Negocio**: RN-007.1: Máximo 3 misiones activas simultáneamente por estudiante.
* **13. Validaciones**: Verificación del temporizador en servidor.
* **14. Entradas**: `quest_id`, avance de actividad.
* **15. Salidas**: Estado de la misión, XP acumulado, multiplicador de recompensa.
* **16. Permisos**: `quests:participate`.
* **17. Prioridad**: 🟡 MEDIA.
* **18. Dependencias**: `RF-005`.
* **19. CUs**: `CU-007` (Completar Misiones).
* **20. Seguridad**: Verificación de marcas de tiempo en servidor para evitar manipulación de reloj local.
* **21. Riesgos**: Sobrecarga de tareas al estudiante (limitado por tope de misiones).
* **22. Criterios & Edge Cases**: Actualización en vivo de barra de progreso de misión.

---

### 💳 MÓDULO 3: PAGOS, FACTURACIÓN Y FINANZAS

#### RF-008: Pasarela de Pagos Recurrentes
* **1. ID**: `RF-008` | **2. Nombre**: Motor de Cobros y Suscripciones Educativas.
* **3. Objetivo**: Procesar transacciones financieras de matrículas, cuotas y compras de cursos vía Stripe, PayPal y medios locales.
* **4. Descripción**: Gestionar cobros únicos o suscripciones mensuales/anuales automáticas con reintentos inteligentes y tokenización de tarjetas.
* **5. Problema que resuelve**: Morosidad en cobros manuales y alta tasa de abandono en el checkout.
* **6. Actores**: Estudiante (`STUDENT_USER`), Administrador Financiero (`FINANCE_ADMIN`).
* **7. Precondiciones**: Integración activa con pasarela de pagos y plan comercial configurado.
* **8. Postcondiciones**: Pago aprobado, comprobante generado y matrícula activada.
* **9. Flujo Principal**: 1. Seleccionar plan -> 2. Ingresar medio de pago -> 3. Procesar cobro -> 4. Recibir Webhook -> 5. Dar acceso.
* **10. Flujos Alt**: 10a. Pago por transferencia bancaria offline con subida de comprobante para aprobación manual.
* **11. Excepciones**: 11a. Transacción rechazada por el banco (muestra motivo claro y solicita cambiar tarjeta).
* **12. Reglas de Negocio**: RN-008.1: Cumplimiento estricto PCI-DSS (no guardar datos de tarjeta en servidores propios).
* **13. Validaciones**: Verificación de firma en Webhooks de pasarelas.
* **14. Entradas**: `plan_id`, token de tarjeta, datos de facturación.
* **15. Salidas**: `transaction_id`, estado del pago (`PAID`, `FAILED`), comprobante digital.
* **16. Permisos**: `payments:checkout`, `finance:manage`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: NINGUNA (Módulo Financiero).
* **19. CUs**: `CU-008` (Pagar Matrícula/Curso).
* **20. Seguridad**: Comunicaciones cifradas TLS 1.3 y Webhooks idempotentes.
* **21. Riesgos**: Controversias/cargobacks de tarjetas (mitigado con captura de IPs y logs de aceptación de términos).
* **22. Criterios & Edge Cases**: Procesamiento en < 3 segundos. Edge Case: Desconexión del cliente durante la redirección del banco (resuelto por Webhook asíncrono).

#### RF-009: Emisión de Comprobantes Digitales Automáticos
* **1. ID**: `RF-009` | **2. Nombre**: Generación de Facturas y Recibos Tributarios.
* **3. Objetivo**: Generar e-facturas y recibos electrónicos conformes a la normativa tributaria local (SUNAT, SAT, SRI) tras cada pago.
* **4. Descripción**: Crea PDFs cifrados y archivos XML tributarios firmados digitalmente, enviándolos al correo del usuario y almacenándolos en su historial financiero.
* **5. Problema que resuelve**: Multas tributarias y trabajo manual en la confección de facturas.
* **6. Actores**: Sistema (`SYSTEM`), Administrador Financiero (`FINANCE_ADMIN`).
* **7. Precondiciones**: Transacción aprobada en `RF-008`.
* **8. Postcondiciones**: Factura registrada ante la entidad tributaria y disponible para descarga.
* **9. Flujo Principal**: 1. Evento de pago aprobado -> 2. Construir XML tributario -> 3. Firmar digitalmente -> 4. Enviar a entidad fiscal -> 5. Emitir PDF y notificar.
* **10. Flujos Alt**: 10a. Emisión de nota de crédito por devolución autorizada.
* **11. Excepciones**: 11a. Rechazo del XML por la entidad fiscal (alerta a contabilidad para corrección en 24h).
* **12. Reglas de Negocio**: RN-009.1: La numeración de facturas debe ser estrictamente correlativa e inmutable.
* **13. Validaciones**: Verificación de RUC/RFC y estructura XML válida.
* **14. Entradas**: `transaction_id`, datos fiscales del cliente.
* **15. Salidas**: PDF de factura, XML firmado, estado fiscal.
* **16. Permisos**: `invoices:read`, `invoices:issue`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-008`.
* **19. CUs**: `CU-009` (Descargar Factura).
* **20. Seguridad**: Firma digital con certificado X.509 de la institución.
* **21. Riesgos**: Cambios en la normativa tributaria del país (mitigado con motor de facturación desacoplado por país).
* **22. Criterios & Edge Cases**: Emisión del comprobante en menos de 5 segundos tras el pago.

#### RF-010: Notificaciones y Recordatorios de Cobro
* **1. ID**: `RF-010` | **2. Nombre**: Motor de Recordatorios de Morosidad y Vencimiento.
* **3. Objetivo**: Notificar automáticamente al estudiante/tutor sobre próximos vencimientos de cuotas y gestionar el proceso de cobranza preventiva.
* **4. Descripción**: Envía recordatorios multicanal (Email, WhatsApp, Push) 7, 3 y 1 día antes del vencimiento. Permite aplicar recargos por mora o suspender el acceso según la configuración.
* **5. Problema que resuelve**: Olvidos de pago no intencionados que perjudican el flujo de caja.
* **6. Actores**: Sistema (`SYSTEM`), Administrador Financiero (`FINANCE_ADMIN`).
* **7. Precondiciones**: Cuota programada en el calendario de pagos.
* **8. Postcondiciones**: Notificación registrada en la bitácora y estado de cuenta actualizado.
* **9. Flujo Principal**: 1. Job nocturno detecta vencimientos próximos -> 2. Genera mensaje personalizado -> 3. Despacha por el canal preferido -> 4. Registra entrega.
* **10. Flujos Alt**: 10a. El usuario programa una promesa de pago acordada con administración.
* **11. Excepciones**: 11a. Número de WhatsApp/Email inválido (registra fallo y escala a notificación por la App).
* **12. Reglas de Negocio**: RN-010.1: No enviar más de 1 recordatorio por día al mismo usuario.
* **13. Validaciones**: Formato de plantilla de comunicación verificado.
* **14. Entradas**: `subscription_id`, días para vencimiento.
* **15. Salidas**: Log de notificación enviada, link de pago directo.
* **16. Permisos**: `notifications:send_financial`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-008`.
* **19. CUs**: `CU-010` (Gestionar Cobranza).
* **20. Seguridad**: Links de pago temporales con firma criptográfica para evitar alteración de montos.
* **21. Riesgos**: Consideración de mensajes como Spam (mitigado con dominios autenticados SPF/DKIM/DMARC).
* **22. Criterios & Edge Cases**: Tasa de entrega de recordatorios > 99%.

---

### 💬 MÓDULO 4: COMUNICACIÓN UNIFICADA

#### RF-011: Mensajería Directa y Chat Educativo
* **1. ID**: `RF-011` | **2. Nombre**: Sistema de Mensajería Estudiante-Docente-Padre.
* **3. Objetivo**: Proveer un canal de chat en tiempo real seguro e integrado para resolver dudas académicas y coordinar actividades.
* **4. Descripción**: Chat con soporte de texto, notas de voz, adjuntos y formato Markdown. Incluye horarios de atención docente configurables (modo "No Molestar").
* **5. Problema que resuelve**: Uso de canales informales no supervisados (WhatsApp personal) que violan la privacidad institucional.
* **6. Actores**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`), Padre (`PARENT_USER`).
* **7. Precondiciones**: Relación académica activa (profesor-alumno o padre-tutor).
* **8. Postcondiciones**: Mensajes entregados y guardados en el historial de la asignatura.
* **9. Flujo Principal**: 1. Abrir chat -> 2. Escribir mensaje/adjunto -> 3. Enviar vía WebSocket -> 4. Entregar al destinatario.
* **10. Flujos Alt**: 10a. Chat de grupo para la sección o curso completo.
* **11. Excepciones**: 11a. Envío de mensaje fuera del horario docente (se encola para entrega al iniciar la jornada).
* **12. Reglas de Negocio**: RN-011.1: Prohibido el contacto directo fuera de la plataforma entre adultos y menores de edad.
* **13. Validaciones**: Tamaño máximo de adjuntos 20MB.
* **14. Entradas**: `recipient_id`, texto del mensaje, archivos adjuntos.
* **15. Salidas**: `message_id`, confirmación de lectura (doble check).
* **16. Permisos**: `chat:send`, `chat:read`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: NINGUNA (Módulo Comunicación).
* **19. CUs**: `CU-011` (Enviar Mensaje Directo).
* **20. Seguridad**: Encriptación en tránsito TLS 1.3 y filtro automático de lenguaje ofensivo/inapropiado.
* **21. Riesgos**: Situaciones de acoso o Bullying (mitigado con auditoría de palabras clave y botón de reporte).
* **22. Criterios & Edge Cases**: Latencia de entrega de mensajes en tiempo real < 100ms.

#### RF-012: Notificaciones Inteligentes Segmentadas
* **1. ID**: `RF-012` | **2. Nombre**: Centro de Notificaciones Contextuales.
* **3. Objetivo**: Alertar a los usuarios únicamente sobre eventos de alto valor académico, evitando la fatiga de notificaciones.
* **4. Descripción**: Motor que prioriza y agrupa avisos (calificaciones publicadas, tareas por vencer, cambios de aula) y los entrega por el canal más relevante según el perfil.
* **5. Problema que resuelve**: Ignorancia de avisos importantes debido a la saturación de notificaciones irrelevantes.
* **6. Actores**: Todos los usuarios.
* **7. Precondiciones**: Preferencias de notificación configuradas en el perfil de usuario.
* **8. Postcondiciones**: Aviso registrado en la bandeja de entrada del sistema.
* **9. Flujo Principal**: 1. Evento del sistema -> 2. Motor evalúa relevancia -> 3. Agrupa avisos similares -> 4. Envía notificación.
* **10. Flujos Alt**: 10a. Resumen diario ("Daily Digest") enviado por correo a las 7:00 AM.
* **11. Excepciones**: 11a. Canal push no disponible (recae automáticamente en notificación in-app).
* **12. Reglas de Negocio**: RN-012.1: No enviar notificaciones push no críticas entre las 22:00 y las 07:00 horas local.
* **13. Validaciones**: Verificación de estado de suscripción a canales.
* **14. Entradas**: `user_id`, `event_payload`, prioridad (`LOW`, `MEDIUM`, `HIGH`).
* **15. Salidas**: Estado de notificación (enviada, leída, descartada).
* **16. Permisos**: `notifications:receive`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: NINGUNA.
* **19. CUs**: `CU-012` (Recibir Notificaciones).
* **20. Seguridad**: Tokens de notificaciones Push (FCM/APNS) rotados de forma segura.
* **21. Riesgos**: Bloqueo de notificaciones por el sistema operativo del smartphone.
* **22. Criterios & Edge Cases**: Agrupamiento inteligente de más de 5 avisos similares en 1 sola alerta.

#### RF-013: Anuncios Institucionales Segmentados
* **1. ID**: `RF-013` | **2. Nombre**: Módulo de Comunicados e Informativos Institucionales.
* **3. Objetivo**: Difundir comunicados oficiales dirigidos a segmentos específicos (ej. "Solo Padres de 5to de Primaria").
* **4. Descripción**: Permite a las autoridades redactar comunicados con acuse de recibo obligatorio, adjuntar circulares oficiales y dar seguimiento al % de lectura.
* **5. Problema que resuelve**: Desafío de comunicación masiva y falta de evidencia en la recepción de circulares oficiales.
* **6. Actores**: Administrador (`ACADEMIC_ADMIN`), Director (`DIRECTOR_USER`).
* **7. Precondiciones**: Rol con atribución de emisión de comunicados oficiales.
* **8. Postcondiciones**: Anuncio publicado y distribuido a los segmentos objetivo.
* **9. Flujo Principal**: 1. Redactar anuncio -> 2. Seleccionar segmento objetivo -> 3. Solicitar acuse de recibo (Sí/No) -> 4. Publicar -> 5. Monitorear lecturas.
* **10. Flujos Alt**: 10a. Programación de publicación para una fecha y hora futura.
* **11. Excepciones**: 11a. Cancelación de un anuncio publicado por error (se retira de las bandejas y registra motivo).
* **12. Reglas de Negocio**: RN-013.1: Los anuncios con acuse de recibo bloquean pantallas secundarias hasta ser confirmados por el padre/tutor.
* **13. Validaciones**: Verificación de destinatarios válidos (> 0 usuarios).
* **14. Entradas**: Título, cuerpo del mensaje, archivo PDF adjunto, filtro de segmento.
* **15. Salidas**: `announcement_id`, porcentaje de confirmación de lectura.
* **16. Permisos**: `announcement:create`, `announcement:broadcast`.
* **17. Prioridad**: 🟡 MEDIA.
* **18. Dependencias**: NINGUNA.
* **19. CUs**: `CU-013` (Publicar Anuncio Oficial).
* **20. Seguridad**: Firma digital de la autoridad emisora en comunicados oficiales.
* **21. Riesgos**: Difusión de información falsa por robo de cuenta directiva (mitigado con MFA obligatorio).
* **22. Criterios & Edge Cases**: Publicación masiva a 10,000+ usuarios en menos de 2 segundos.

---

### 📊 MÓDULO 5: REPORTES, ANALYTICS Y PREDICCIÓN

#### RF-014: Generación de Reportes 1-Click
* **1. ID**: `RF-014` | **2. Nombre**: Generador Automatizado de Actas y Libretas de Notas.
* **3. Objetivo**: Emitir consolidados de calificaciones, actas oficiales de evaluación y boletines en formatos Excel, PDF y CSV con 1 solo clic.
* **4. Descripción**: Compila las notas del periodo, aplica las fórmulas de ponderación institucional, genera el promedio final y produce documentos listos para impresión o firma legal.
* **5. Problema que resuelve**: Semanas de trabajo administrativo manual al final de cada periodo escolar.
* **6. Actores**: Coordinador (`ACADEMIC_ADMIN`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Calificaciones del periodo ingresadas y cerradas.
* **8. Postcondiciones**: Documento oficial de reporte generado e ingresado en el archivo digital.
* **9. Flujo Principal**: 1. Seleccionar periodo y grupo -> 2. Presionar "Generar Libreta" -> 3. Procesar fórmulas -> 4. Descargar archivo consolidado.
* **10. Flujos Alt**: 10a. Envió automático masivo de libretas de notas a los correos de los apoderados.
* **11. Excepciones**: 11a. Estudiante con notas incompletas (marca el reporte como `PENDING_GRADES` e impide el cierre de acta).
* **12. Reglas de Negocio**: RN-014.1: Una vez cerrada el acta oficial, las notas son inmutables sin una resolución administrativa.
* **13. Validaciones**: Verificación de rango de notas según la escala oficial (0-20, 0-100, A-F).
* **14. Entradas**: `section_id`, `period_id`, formato de salida (`PDF`/`XLSX`).
* **15. Salidas**: Archivo comprimido con boletines individuales o acta consolidada en Excel.
* **16. Permisos**: `reports:generate`, `grades:close_period`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-004`.
* **19. CUs**: `CU-014` (Generar Libreta de Notas).
* **20. Seguridad**: Marcas de agua digitales con el logo institucional e ID de verificación en cada hoja PDF.
* **21. Riesgos**: Inconsistencias en las fórmulas de promedio (mitigado con motor de cálculo estandarizado con pruebas unitarias).
* **22. Criterios & Edge Cases**: Generación de 500 libretas individuales en PDF en menos de 10 segundos.

#### RF-015: Dashboard 360° del Estudiante
* **1. ID**: `RF-015` | **2. Nombre**: Panel Holístico de Rendimiento del Alumno.
* **3. Objetivo**: Visualizar en un solo lugar la salud académica, asistencia, conducta, progreso adaptativo y bienestar del estudiante.
* **4. Descripción**: Ofrece gráficos intuitivos de evolución histórica de notas, mapa de competencias dominadas, índice de asistencia y recomendaciones de refuerzo.
* **5. Problema que resuelve**: Fragmentación de información sobre el estado real de un estudiante entre diferentes profesores y sistemas.
* **6. Actores**: Padre (`PARENT_USER`), Estudiante (`STUDENT_USER`), Tutor (`TUTOR_USER`).
* **7. Precondiciones**: Identidad vinculada al estudiante correspondiente.
* **8. Postcondiciones**: Muestra del panel actualizado en tiempo real.
* **9. Flujo Principal**: 1. Ingresar al perfil del alumno -> 2. Cargar métricas 360° -> 3. Visualizar gráficos de radar e indicadores -> 4. Explorar detalle por materia.
* **10. Flujos Alt**: 10a. Comparativa anónima de la evolución del alumno respecto al promedio de la clase.
* **11. Excepciones**: 11a. Falta de datos recientes (muestra mensaje indicando que el periodo está iniciando).
* **12. Reglas de Negocio**: RN-015.1: Los padres solo pueden acceder al Dashboard de sus hijos directos o tutorados legalmente.
* **13. Validaciones**: Verificación de la relación de parentesco en la base de datos.
* **14. Entradas**: `student_id`.
* **15. Salidas**: Vista interactiva con promedios, gráfico radar de habilidades y métricas de conducta.
* **16. Permisos**: `dashboard:view_student_360`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-004`, `RF-005`.
* **19. CUs**: `CU-015` (Consultar Dashboard 360).
* **20. Seguridad**: Control de acceso granular a nivel de fila (RLS) para evitar la visualización de otros estudiantes.
* **21. Riesgos**: Interpretación errónea de los gráficos por parte de los padres (mitigado con explicaciones claras en lenguaje sencillo).
* **22. Criterios & Edge Cases**: Renderizado completo del dashboard en < 1 segundo.

#### RF-016: Predictor de Riesgo de Abandono (Early Warning)
* **1. ID**: `RF-016` | **2. Nombre**: Motor Predictivo de Deserción y Churn Educativo.
* **3. Objetivo**: Identificar estudiantes con alto riesgo de reprobar o abandonar sus estudios con al menos 30 días de anticipación.
* **4. Descripción**: Algoritmo de ML que analiza asistencia, bajas repentinas de notas, falta de entregas y actividad en la plataforma para calcular una probabilidad de abandono y sugerir intervenciones.
* **5. Problema que resuelve**: Detección tardía de estudiantes con problemas cuando ya no es posible evitar la deserción.
* **6. Actores**: Coordinador (`ACADEMIC_ADMIN`), Psicopedagogo (`PSYCHO_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Datos de comportamiento acumulados durante al menos 2 semanas.
* **8. Postcondiciones**: Clasificación del nivel de riesgo (`BAJO`, `MEDIO`, `ALTO`) e inserción en el flujo de intervención.
* **9. Flujo Principal**: 1. Algoritmo analiza variables de conducta -> 2. Calcula probabilidad de riesgo -> 3. Si Riesgo > 70%, marca al estudiante -> 4. Alerta al departamento psicopedagógico.
* **10. Flujos Alt**: 10a. Creación automática de un plan de acompañamiento personalizado para el estudiante en riesgo.
* **11. Excepciones**: 11a. Datos insuficientes para predecir (mantiene estado `PENDING_EVALUATION`).
* **12. Reglas de Negocio**: RN-016.1: Las alertas de alto riesgo son estrictamente confidenciales para el equipo directivo y tutores.
* **13. Validaciones**: Modelo con precisión comprobada mayor al 85%.
* **14. Entradas**: Historial de asistencia, entregas a tiempo, tiempo de sesión, notas parciales.
* **15. Salidas**: Risk Index (0.0 a 1.0), factores desencadenantes del riesgo, plan de acción recomendado.
* **16. Permisos**: `analytics:view_churn_risk`, `psycho:intervene`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-004`, `RF-011`.
* **19. CUs**: `CU-016` (Predecir y Prevenir Deserción).
* **20. Seguridad**: Privacidad reforzada de los indicadores psicopedagógicos.
* **21. Riesgos**: Estigmatización del alumno por etiquetas de riesgo (mitigado con acceso exclusivo al personal autorizado).
* **22. Criterios & Edge Cases**: Predicción acertada de al menos 8 de cada 10 casos de deserción potencial en pruebas históricas.

---

### ⚙️ MÓDULO 6: AUTOMATIZACIÓN ADMINISTRATIVA

#### RF-017: Firma Digital de Documentos
* **1. ID**: `RF-017` | **2. Nombre**: Integración de Firma Digital y Contratos Educativos.
* **3. Objetivo**: Automatizar la suscripción legal de matrículas, compromisos de honor y contratos con validez jurídica.
* **4. Descripción**: Integrar proveedores de firma digital (DocuSign, Adobe Sign, u Firma Digital Nacional) para enviar, firmar y certificar documentos sin necesidad de impresión física.
* **5. Problema que resuelve**: Demoras de semanas en la recolección de firmas físicas de padres o apoderados.
* **6. Actores**: Padre/Apoderado (`PARENT_USER`), Administrador (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: Documento borrador generado y datos del firmante validados.
* **8. Postcondiciones**: Documento firmado con certificado digital, sellado de tiempo y valor legal inmutable.
* **9. Flujo Principal**: 1. Generar contrato -> 2. Enviar enlace de firma -> 3. Autenticar firmante con SMS/OTP -> 4. Estampar firma -> 5. Archivar copia firmada.
* **10. Flujos Alt**: 10a. Firma manuscrita capturada en pantalla táctil de tablet en recepción.
* **11. Excepciones**: 11a. Expiración del enlace de firma (re-emisión automática tras solicitud).
* **12. Reglas de Negocio**: RN-017.1: El documento firmado debe guardarse en formato PDF/A inalterable.
* **13. Validaciones**: Verificación de identidad mediante documento oficial y OTP enviado al teléfono registrado.
* **14. Entradas**: Documento base, `user_id` del firmante, teléfono/email.
* **15. Salidas**: Documento PDF/A firmado digitalmente, auditoría de la firma (IP, hora, método de autenticación).
* **16. Permisos**: `documents:sign`, `admin:manage_contracts`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-001`.
* **19. CUs**: `CU-017` (Firmar Contrato Educativo).
* **20. Seguridad**: Cumplimiento de estándares eIDAS y leyes locales de firma digital.
* **21. Riesgos**: Impugnación de firma por suplantación (mitigado con autenticación multifactor en el momento de firmar).
* **22. Criterios & Edge Cases**: Proceso de firma completado desde un smartphone en menos de 1 minuto.

#### RF-018: Sincronización ERP y Contabilidad
* **1. ID**: `RF-018` | **2. Nombre**: Integración con Sistemas ERP y Software Contable.
* **3. Objetivo**: Sincronizar automáticamente matriculaciones, cobros y notas con sistemas externos (SAP, Oracle, QuickBooks, Concar).
* **4. Descripción**: Exponer conectores bidireccionales vía API REST/Webhooks para mantener actualizados los libros de contabilidad y registros administrativos del colegio o universidad.
* **5. Problema que resuelve**: Doble digitación manual de pagos e información académica en múltiples plataformas.
* **6. Actores**: Sistema (`SYSTEM`), Contador (`FINANCE_ADMIN`).
* **7. Precondiciones**: Credenciales de API del ERP externo configuradas en la plataforma.
* **8. Postcondiciones**: Registros contables reflejados en ambos sistemas sin discrepancias.
* **9. Flujo Principal**: 1. Evento financiero/académico en la plataforma -> 2. Transformar formato a la estructura del ERP -> 3. Enviar vía API -> 4. Confirmar recepción.
* **10. Flujos Alt**: 10a. Sincronización nocturna por lotes (Batch processing) para grandes volúmenes de datos.
* **11. Excepciones**: 11a. Caída del servidor ERP (la plataforma encola las transacciones y reintenta cuando el servicio vuelve a estar en línea).
* **12. Reglas de Negocio**: RN-018.1: Ninguna transacción contable se duplica en el ERP (garantía de idempotencia).
* **13. Validaciones**: Comprobación de formato de datos del ERP externo.
* **14. Entradas**: Transacciones financieras, cierres de notas, movimientos de cuentas.
* **15. Salidas**: Logs de sincronización, ID de transacción en el ERP externo.
* **16. Permisos**: `integration:manage_erp`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-008`, `RF-014`.
* **19. CUs**: `CU-018` (Sincronizar Datos con ERP).
* **20. Seguridad**: Comunicaciones autenticadas con OAuth 2.0 y claves API cifradas en Vault.
* **21. Riesgos**: Descalce de saldos entre sistemas por fallos de red (mitigado con procesos de reconciliación diaria).
* **22. Criterios & Edge Cases**: Sincronización en tiempo real con latencia menor a 2 segundos por evento.

#### RF-019: Exportación Multiformato de Datos
* **1. ID**: `RF-019` | **2. Nombre**: Exportador Universal de Información (XLSX, PDF, CSV, JSON).
* **3. Objetivo**: Permitir a los administradores exportar cualquier vista de datos o reporte a múltiples formatos estándar para análisis externo.
* **4. Descripción**: Motor de generación de reportes personalizable que permite seleccionar columnas, filtros y formatos de salida sin afectar el rendimiento de la base de datos principal.
* **5. Problema que resuelve**: Rigidez en los reportes predefinidos que no se adaptan a las necesidades específicas de la institución.
* **6. Actores**: Administrador (`ACADEMIC_ADMIN`), Coordinador (`COORDINATOR_USER`).
* **7. Precondiciones**: Datos visibles en la pantalla según los permisos del usuario.
* **8. Postcondiciones**: Archivo generado y descargado en el dispositivo del usuario.
* **9. Flujo Principal**: 1. Aplicar filtros en la pantalla -> 2. Hacer clic en "Exportar" -> 3. Elegir formato (XLSX/PDF/CSV) -> 4. Descargar archivo.
* **10. Flujos Alt**: 10a. Exportación masiva en segundo plano con notificación por correo al terminar la generación.
* **11. Excepciones**: 11a. Solicitud de exportación que supera las 100,000 filas (obliga a procesar asincrónicamente en segundo plano).
* **12. Reglas de Negocio**: RN-019.1: Las exportaciones están sujetas a las mismas restricciones de seguridad y RLS que la visualización en pantalla.
* **13. Validaciones**: Verificación del tamaño del conjunto de datos antes de generar el archivo.
* **14. Entradas**: Parámetros de consulta, formato seleccionado, campos incluidos.
* **15. Salidas**: Archivo binario (.xlsx, .pdf, .csv).
* **16. Permisos**: `data:export`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: NINGUNA.
* **19. CUs**: `CU-019` (Exportar Reporte de Datos).
* **20. Seguridad**: Registro de auditoría de cada exportación realizada para evitar fugas de información masivas.
* **21. Riesgos**: Exfiltración de datos sensibles de estudiantes mediante exportaciones no autorizadas (mitigado con alertas por descargas masivas).
* **22. Criterios & Edge Cases**: Exportación de 10,000 registros a Excel en menos de 3 segundos.

---

### 🔒 MÓDULO 7: SEGURIDAD Y COMPLIANCE

#### RF-020: Encriptación y Cumplimiento Normativo (GDPR / FERPA)
* **1. ID**: `RF-020` | **2. Nombre**: Motor de Privacidad y Cumplimiento de Datos Educativos.
* **3. Objetivo**: Garantizar el cumplimiento estricto de GDPR, FERPA y leyes locales de protección de datos personales y de menores.
* **4. Descripción**: Aplica encriptación AES-256 en reposo, anonimización de datos para estudios estadísticos, gestión del consentimiento informado de los padres y derecho al olvido.
* **5. Problema que resuelve**: Riesgo de sanciones legales severas y demandas por vulneración de la privacidad de menores de edad.
* **6. Actores**: Oficial de Privacidad (`PRIVACY_OFFICER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Políticas de privacidad configuradas en el tenant.
* **8. Postcondiciones**: Datos protegidos y bitácora de consentimiento al día.
* **9. Flujo Principal**: 1. Usuario o tutor acepta términos de privacidad -> 2. Registrar consentimiento con marca de tiempo -> 3. Cifrar datos sensibles -> 4. Permitir revocación.
* **10. Flujos Alt**: 10a. Solicitud de portabilidad o eliminación de datos (Derecho al Olvido) tramitada en el panel de privacidad.
* **11. Excepciones**: 11a. Intento de eliminar registros que por ley deben conservarse por X años (se anonimizan en lugar de borrarse físicamente).
* **12. Reglas de Negocio**: RN-020.1: Queda prohibida la venta o comercialización de datos de estudiantes a terceros bajo cualquier circunstancia.
* **13. Validaciones**: Verificación de firmas de cifrado y hashes de integridad.
* **14. Entradas**: Solicitudes de consentimiento, peticiones de revocación de datos.
* **15. Salidas**: Logs de cumplimiento, estado de cifrado de la información.
* **16. Permisos**: `privacy:manage_compliance`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: NINGUNA (Gobernanza Base).
* **19. CUs**: `CU-020` (Gestionar Privacidad y Cumplimiento).
* **20. Seguridad**: Llaves de cifrado rotadas periódicamente a través de KMS.
* **21. Riesgos**: Brechas de seguridad que expongan información de menores (mitigado con pruebas de penetración continuas).
* **22. Criterios & Edge Cases**: Cumplimiento del 100% de los requisitos del checklist auditado de GDPR/FERPA.

---

## 🟣 TIER 2: REQUISITOS PRO-LEVEL (RF-021 A RF-042)

---

### 🤖 MÓDULO 8: AUTONOMOUS EDUCATION ENGINE ("TESLA MOMENT")

#### RF-021: Early Warning System (EWS) Proactivo
* **1. ID**: `RF-021` | **2. Nombre**: Sistema de Alerta Temprana Autónoma.
* **3. Objetivo**: Detectar patrones sutiles de riesgo cruzando frecuencia de login, velocidad de lectura, sentimiento en foros y calificaciones parciales.
* **4. Descripción**: Algoritmo avanzado que no solo alerta, sino que sugiere e inicia acciones de intervención previas para el tutor, aumentando en un 30% el éxito de la retención manual.
* **5. Problema que resuelve**: Reacción tardía cuando el estudiante ya ha decidido abandonar el curso.
* **6. Actores**: Sistema IA (`AI_ENGINE`), Tutor (`TUTOR_USER`).
* **7. Precondiciones**: Datos de comportamiento acumulados por más de 7 días.
* **8. Postcondiciones**: Plan de intervención sugerido y asignado al tutor en 1 clic.
* **9. Flujo Principal**: 1. IA analiza micro-interacciones -> 2. Detecta anomalía en la velocidad de lectura y bajas notas -> 3. Genera recomendación -> 4. Notifica al tutor con la acción lista para aprobar.
* **10. Flujos Alt**: 10a. Envío de un mensaje de ánimo automático al estudiante generado por IA si el riesgo es leve.
* **11. Excepciones**: 11a. Falso positivo detectado por el tutor (permite retroalimentar al modelo para ajustar la precisión).
* **12. Reglas de Negocio**: RN-021.1: El sistema debe dar prioridad a las alertas de estudiantes con becas o en condición vulnerable.
* **13. Validaciones**: Precisión del modelo predictivo EWS > 88%.
* **14. Entradas**: Micro-logs de lectura, pausas en videos, tono en mensajes de foros.
* **15. Salidas**: Score de alerta, causas principales del riesgo, plantilla de intervención lista para enviar.
* **16. Permisos**: `ews:view_alerts`, `ews:execute_action`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-016`, `RF-025`.
* **19. CUs**: `CU-021` (Ejecutar Intervención EWS).
* **20. Seguridad**: Tratamiento confidencial de los perfiles de riesgo psicológico.
* **21. Riesgos**: Alertas excesivas que generen cansancio en los tutores (mitigado con agrupación por prioridad).
* **22. Criterios & Edge Cases**: Generación de la alerta en menos de 1 hora tras detectarse el cambio de comportamiento.

#### RF-022: Dynamic Pathing (IA Adaptativa Avanzada)
* **1. ID**: `RF-022` | **2. Nombre**: Reconfigurador Dinámico de Rutas de Aprendizaje.
* **3. Objetivo**: Reestructurar el temario en tiempo real según el dominio demostrado por el estudiante.
* **4. Descripción**: Si el alumno demuestra dominio de un concepto, el sistema salta automáticamente los temas introductorios (ahorrando un 30% de tiempo). Si falla, inserta micro-módulos de nivelación antes de permitir el avance.
* **5. Problema que resuelve**: Pérdida de tiempo en temas ya dominados o vacíos conceptuales que impiden avanzar en temas complejos.
* **6. Actores**: Sistema IA (`AI_ENGINE`), Estudiante (`STUDENT_USER`).
* **7. Precondiciones**: Grafo de conceptos de la materia configurado en el sistema.
* **8. Postcondiciones**: Malla curricular individual reajustada instantáneamente.
* **9. Flujo Principal**: 1. Evaluar respuesta del alumno -> 2. Consultar grafo de conocimiento -> 3. Determinar si domina o falta concepto -> 4. Ocultar o agregar temas -> 5. Mostrar siguiente paso.
* **10. Flujos Alt**: 10a. El estudiante solicita voluntariamente un examen de suficiencia para saltar un módulo completo.
* **11. Excepciones**: 11a. Inconsistencia en el mapa de prerrequisitos (el sistema recurre a la secuencia lineal por defecto).
* **12. Reglas de Negocio**: RN-022.1: No se puede saltar un tema considerado obligatorio por la regulación oficial del país.
* **13. Validaciones**: Verificación de consistencia del grafo acíclico dirigido (DAG).
* **14. Entradas**: Resultados de quizes adaptativos, historial de intentos.
* **15. Salidas**: Nueva secuencia de lecciones personalizada, estimación de tiempo de graduación actualizado.
* **16. Permisos**: `learning:dynamic_path`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-002`, `RF-026`.
* **19. CUs**: `CU-022` (Navegar Ruta Dinámica).
* **20. Seguridad**: Prevención de trucos para saltar temas mediante alteración de peticiones API.
* **21. Riesgos**: Sensación de desorientación en el estudiante por cambios frecuentes en el temario (mitigado con un mapa visual claro de su avance).
* **22. Criterios & Edge Cases**: Reconfiguración del temario en menos de 500ms tras completar una evaluación.

#### RF-023: Copiloto Docente Autónomo
* **1. ID**: `RF-023` | **2. Nombre**: Asistente de IA para Automatización Docente.
* **3. Objetivo**: Reducir el tiempo de trabajo administrativo del docente de 2 horas a 2 minutos por lección.
* **4. Descripción**: Genera automáticamente sugerencias de feedback personalizado para cada tarea, crea rúbricas, redacta exámenes únicos para evitar copias y entrega resúmenes de los puntos ciegos del grupo.
* **5. Problema que resuelve**: Sobrecarga de trabajo docente en tareas repetitivas de corrección y preparación.
* **6. Actores**: Profesor (`TEACHER_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Tareas de estudiantes entregadas o contenido de lección cargado.
* **8. Postcondiciones**: Borradores de corrección y exámenes generados listos para aprobación docente.
* **9. Flujo Principal**: 1. Docente ingresa a corregir -> 2. Copiloto presenta borrador de feedback por alumno -> 3. Docente revisa y ajusta -> 4. Aprobar en 1 clic -> 5. Enviar notas.
* **10. Flujos Alt**: 10a. Generación automática de 30 versiones diferentes de un examen impreso o digital con el mismo nivel de dificultad.
* **11. Excepciones**: 11a. Feedback generado no satisface al docente (permite re-generar especificando el tono o enfoque deseado).
* **12. Reglas de Negocio**: RN-023.1: La calificación final siempre requiere la confirmación o supervisión de un docente humano (Human-in-the-loop).
* **13. Validaciones**: Evaluación de la coherencia del feedback generado con la rúbrica oficial.
* **14. Entradas**: Tarea entregada por el estudiante, rúbrica del curso, instrucciones del docente.
* **15. Salidas**: Borrador de comentarios, propuesta de nota, resumen de errores comunes del aula.
* **16. Permisos**: `copilot:access_teacher`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-004`.
* **19. CUs**: `CU-023` (Usar Copiloto Docente).
* **20. Seguridad**: Modelos de IA privados que no utilizan las tareas de los estudiantes para entrenar modelos públicos.
* **21. Riesgos**: Dependencia excesiva del docente sin revisión de las sugerencias (mitigado con auditorías aleatorias de calidad).
* **22. Criterios & Edge Cases**: Generación del borrador de feedback para 30 tareas en menos de 10 segundos.

#### RF-024: Ajuste de Carga Cognitiva Automático
* **1. ID**: `RF-024` | **2. Nombre**: Sensor y Balanceador de Fatiga y Carga Mental.
* **3. Objetivo**: Prevenir el burnout y el abandono detectando señales de fatiga cognitiva y ajustando la exigencia temporalmente.
* **4. Descripción**: Analiza la velocidad de clics, pausas prolongadas y el incremento de errores no habituales. Si detecta sobrecarga, sugiere pausas activas, cambia el formato (ej. texto a audio) o propone mover fechas de entrega.
* **5. Problema que resuelve**: Deserción causada por el estrés y la sobrecarga de tareas acumuladas.
* **6. Actores**: Sistema IA (`AI_ENGINE`), Estudiante (`STUDENT_USER`).
* **7. Precondiciones**: Sesión de estudio activa con recopilación de métricas de interacción.
* **8. Postcondiciones**: Recomendación de descanso emitida y ajustes temporales sugeridos.
* **9. Flujo Principal**: 1. Monitor detecta aumento anómalo de errores y pausas -> 2. Infiere fatiga alta -> 3. Despliega sugerencia de pausa -> 4. Adapta formato de la siguiente lección a un formato más ligero.
* **10. Flujos Alt**: 10a. Notificación al docente sugiriendo aplazar 24h la entrega del grupo si la fatiga es generalizada.
* **11. Excepciones**: 11a. El estudiante rechaza la sugerencia de descanso y continúa (el sistema registra la decisión y monitorea la tasa de error).
* **12. Reglas de Negocio**: RN-024.1: No se pueden modificar fechas de exámenes finales oficiales sin aprobación administrativa.
* **13. Validaciones**: Algoritmo de detección de patrones de fatiga verificado.
* **14. Entradas**: Intervalos entre clics, tiempo de permanencia por lámina, tasa de error en los últimos 15 min.
* **15. Salidas**: Indicador de Carga Cognitiva (`BAJA`, `ÓPTIMA`, `FATIGA`), recomendación de pausa activa.
* **16. Permisos**: `learning:cognitive_balance`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-003`, `RF-025`.
* **19. CUs**: `CU-024` (Ajustar Carga Cognitiva).
* **20. Seguridad**: Protección de datos biométricos de interacción bajo estándares de privacidad médica/conductual.
* **21. Riesgos**: Falsos positivos por distracciones externas del usuario (mitigado con ventanas de evaluación de 15 minutos).
* **22. Criterios & Edge Cases**: Reducción comprobada del 40% en abandonos por sobrecarga en pruebas piloto.

---

### 🧠 MÓDULO 9: INTELLIGENCE MOAT (DATA PROPIETARIA)

#### RF-025: Captura de Micro-Interacciones (Behavioral Analytics)
* **1. ID**: `RF-025` | **2. Nombre**: Recopilador de Telemetría Comportamental Fina.
* **3. Objetivo**: Registrar el "cómo" aprende el estudiante acumulando más de 500 datapoints por usuario al año para construir la ventaja de datos de la plataforma (Data Moat).
* **4. Descripción**: Captura eventos detallados: posición y movimiento del cursor por pregunta, revisiones de respuestas antes de enviar, segundo exacto de pausa en videos y velocidad de lectura por párrafo.
* **5. Problema que resuelve**: Falta de visibilidad sobre los procesos de pensamiento del estudiante más allá de la nota final.
* **6. Actores**: Sistema (`SYSTEM`).
* **7. Precondiciones**: Consentimiento de telemetría educativa activo.
* **8. Postcondiciones**: Eventos almacenados en la base de datos analítica orientada a columnas (ClickHouse / BigQuery).
* **9. Flujo Principal**: 1. Usuario interactúa con la interfaz -> 2. Tracker JS/SDK encola micro-eventos -> 3. Envío en lotes cada 5s -> 4. Ingesta en el Data Lake.
* **10. Flujos Alt**: 10a. Almacenamiento local temporal si el usuario pierde la conexión a internet.
* **11. Excepciones**: 11a. Fallo en el envío de lotes (reintenta con respaldo exponencial para evitar pérdida de eventos).
* **12. Reglas de Negocio**: RN-025.1: La telemetría comportamental no debe impactar la velocidad de carga de la interfaz del usuario.
* **13. Validaciones**: Formato JSON-LD estructurado para cada evento comportamental.
* **14. Entradas**: Coordenadas del cursor, eventos de teclado, marcadores de tiempo de video, scroll events.
* **15. Salidas**: Logs de telemetría procesados e indexados para los modelos de IA.
* **16. Permisos**: `telemetry:collect`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: NINGUNA (Infraestructura de Datos).
* **19. CUs**: `CU-025` (Capturar Telemetría Comportamental).
* **20. Seguridad**: Anonymization y Pseudonymization de IPs y datos identificables antes de ser procesados por los algoritmos analíticos.
* **21. Riesgos**: Sobrecarga de almacenamiento por volumen masivo de datos (mitigado con políticas de compresión de logs).
* **22. Criterios & Edge Cases**: Procesamiento de más de 10,000 eventos por segundo con un consumo de CPU en el cliente menor al 2%.

#### RF-026: Grafos de Conocimiento Institucional (Knowledge Graph)
* **1. ID**: `RF-026` | **2. Nombre**: Motor de Grafos de Relación Concepto-Habilidad-Empleo.
* **3. Objetivo**: Mapear las relaciones entre conceptos aprendidos, habilidades desarrolladas y el éxito profesional posterior.
* **4. Descripción**: Modela la estructura del conocimiento de la institución como un Grafo (Neo4j / Memgraph), conectando lecciones con competencias reales del mercado laboral e identificando prerrequisitos invisibles.
* **5. Problema que resuelve**: Desconexión entre los contenidos enseñados en las aulas y las competencias demandadas por la industria.
* **6. Actores**: Sistema IA (`AI_ENGINE`), Diseñador Curricular (`CURRICULUM_DESIGNER`).
* **7. Precondiciones**: Contenidos educativos etiquetados con conceptos clave.
* **8. Postcondiciones**: Grafo de conocimiento actualizado con pesos de relación calculados por los resultados de los estudiantes.
* **9. Flujo Principal**: 1. Ingesta de temarios -> 2. Extracción de entidades y conceptos -> 3. Construir nodos y aristas -> 4. Calcular rutas óptimas de aprendizaje.
* **10. Flujos Alt**: 10a. Actualización del grafo con ofertas laborales reales para ajustar los pesos de las habilidades más demandadas.
* **11. Excepciones**: 11a. Detección de nodos huérfanos sin conexiones (alerta al diseñador curricular para revisar el plan de estudios).
* **12. Reglas de Negocio**: RN-026.1: Cada concepto debe estar vinculado al menos a una competencia verificable.
* **13. Validaciones**: Verificación de la integridad referencial en la base de datos de grafos.
* **14. Entradas**: Estructuras de cursos, resultados de exámenes, encuestas de egresados.
* **15. Salidas**: Visualización interactiva del grafo de conocimiento, rutas de aprendizaje recomendadas.
* **16. Permisos**: `knowledge_graph:read`, `knowledge_graph:manage`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-001`, `RF-025`.
* **19. CUs**: `CU-026` (Consultar Grafo de Conocimiento).
* **20. Seguridad**: Cifrado de las relaciones del grafo para proteger la propiedad intelectual curricular.
* **21. Riesgos**: Grafos demasiado complejos que dificulten la interpretación (mitigado con filtros de abstracción por capas).
* **22. Criterios & Edge Cases**: Consultas de rutas en el grafo resueltas en menos de 100ms.

#### RF-027: Federated Learning (Entrenamiento Privado Distribuido)
* **1. ID**: `RF-027` | **2. Nombre**: Motor de Aprendizaje Federado para Preservación de Privacidad.
* **3. Objetivo**: Entrenar los modelos globales de IA compartiendo los aprendizajes entre instituciones sin exponer ni centralizar datos sensibles de los estudiantes.
* **4. Descripción**: Despliega algoritmos de Aprendizaje Federado donde cada institución entrena un modelo localmente y solo envía las actualizaciones de pesos cifradas a un servidor central.
* **5. Problema que resuelve**: Barreras legales de privacidad (GDPR/FERPA) que impiden consolidar datos de múltiples instituciones en un solo lugar.
* **6. Actores**: Sistema IA (`AI_ENGINE`), Oficial de Seguridad (`SECURITY_OFFICER`).
* **7. Precondiciones**: Servidores locales o instancias del tenant preparadas para entrenamiento.
* **8. Postcondiciones**: Modelo global de IA mejorado sin haber transferido un solo registro personal fuera del tenant.
* **9. Flujo Principal**: 1. Servidor central distribuye modelo base -> 2. Tenants entrenan localmente -> 3. Cifrar gradientes de peso -> 4. Agregar pesos centrales (FedAvg) -> 5. Actualizar modelo global.
* **10. Flujos Alt**: 10a. Ajuste fino local (Fine-Tuning) para adaptar el modelo a las particularidades culturales de una institución.
* **11. Excepciones**: 11a. Intento de ataque de envenenamiento de modelo (Model Poisoning) detectado (descarta las actualizaciones del tenant malicioso).
* **12. Reglas de Negocio**: RN-027.1: Las actualizaciones de pesos deben cumplir con Privacidad Diferencial ($\epsilon$-differential privacy).
* **13. Validaciones**: Verificación de la convergencia del modelo agregado.
* **14. Entradas**: Modelos locales, gradientes cifrados.
* **15. Salidas**: Modelo IA global optimizado.
* **16. Permisos**: `ai:federated_training`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-020`, `RF-026`.
* **19. CUs**: `CU-027` (Ejecutar Entrenamiento Federado).
* **20. Seguridad**: Agregación segura mediante esquemas de cifrado homomórfico o MPC (Multi-Party Computation).
* **21. Riesgos**: Divergencia del modelo por datos heterogéneos entre instituciones (mitigado con algoritmos de agregación robustos).
* **22. Criterios & Edge Cases**: Garantía matemática comprobada de imposibilidad de reconstruir datos originales a partir de los pesos.

---

### 🌐 MÓDULO 10: NETWORK EFFECTS & RED OPERATIVA

#### RF-028: Global Peer-to-Peer Tutoring (Marketplace de Tutorías)
* **1. ID**: `RF-028` | **2. Nombre**: Mercado Inter-Institucional de Tutorías entre Pares.
* **3. Objetivo**: Emparejar automáticamente a estudiantes que dominan una materia en una institución con alumnos que necesitan refuerzo en otra.
* **4. Descripción**: Algoritmo de matching que conecta tutores y alumnos según compatibilidad de horarios, estilo cognitivo e idioma, procesando pagos o canje de créditos internos.
* **5. Problema que resuelve**: Falta de tutores disponibles en instituciones pequeñas y alto costo de clases particulares externas.
* **6. Actores**: Estudiante Tutor (`TUTOR_STUDENT`), Estudiante Alumno (`LEARNER_STUDENT`), Sistema (`SYSTEM`).
* **7. Precondiciones**: El tutor debe haber aprobado la materia con una calificación destacada (Top 10%).
* **8. Postcondiciones**: Sesión de tutoría agendada, sala virtual creada y transacción registrada.
* **9. Flujo Principal**: 1. Alumno solicita ayuda en un tema -> 2. IA busca tutores destacados disponibles -> 3. Conectar y agendar -> 4. Realizar sesión en la plataforma -> 5. Calificar la tutoría.
* **10. Flujos Alt**: 10a. Tutoría gratuita a cambio de créditos/tokens de la plataforma educativos.
* **11. Excepciones**: 11a. Inasistencia del tutor a la sesión (reembolso automático de créditos/dinero y sanción en su reputación).
* **12. Reglas de Negocio**: RN-028.1: La plataforma retiene una comisión de servicio del 20% en tutorías pagadas con dinero real.
* **13. Validaciones**: Verificación de antecedentes académicos del tutor antes de habilitarlo en el mercado.
* **14. Entradas**: Tema de ayuda solicitado, disponibilidad horaria, presupuesto o tokens ofertados.
* **15. Salidas**: Enlace a la sala de videoconferencia interactiva, transferencia de créditos/fondos.
* **16. Permisos**: `tutoring:offer`, `tutoring:request`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-008`, `RF-036`.
* **19. CUs**: `CU-028` (Agendar Tutoría P2P).
* **20. Seguridad**: Grabación de sesiones virtuales y supervisión con IA para evitar conductas inapropiadas entre menores.
* **21. Riesgos**: Baja calidad de los tutores (mitigado con un sistema de calificación por estrellas y comentarios obligatorios).
* **22. Criterios & Edge Cases**: Emparejamiento de tutoría disponible en menos de 30 segundos.

#### RF-029: Repositorio de Contenido Optimizado ("Pinterest Educativo")
* **1. ID**: `RF-029` | **2. Nombre**: Mercado de Recursos Didácticos Validados por Desempeño.
* **3. Objetivo**: Permitir a los docentes compartir, puntuar y reutilizar materiales educativos cuyos resultados hayan sido probados estadísticamente.
* **4. Descripción**: Algoritmo que clasifica los materiales creados por docentes no solo por "me gusta", sino por la efectividad real en el aprendizaje de los alumnos que los usaron.
* **5. Problema que resuelve**: Profesores reinventando la rueda constantemente preparando materiales que otros ya crearon con éxito.
* **6. Actores**: Profesor (`TEACHER_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Material educativo utilizado al menos por 100 estudiantes en la plataforma.
* **8. Postcondiciones**: Recurso publicado en el catálogo global con su índice de efectividad pedagógica.
* **9. Flujo Principal**: 1. Docente publica recurso -> 2. Sistema mide la mejora de notas de los alumnos que lo usaron -> 3. Asigna Score de Efectividad -> 4. Destaca en el buscador global.
* **10. Flujos Alt**: 10a. Venta de recursos didácticos premium entre profesores con regalías para el autor.
* **11. Excepciones**: 11a. Contenido reportado por violación de derechos de autor (suspensión inmediata del recurso para auditoría).
* **12. Reglas de Negocio**: RN-029.1: El creador del recurso recibe el 70% de las regalías por las ventas de su material.
* **13. Validaciones**: Verificación de licencias Creative Commons o derechos de propiedad intelectual.
* **14. Entradas**: Archivo didáctico, presentación, guía de ejercicios, etiquetas de materias.
* **15. Salidas**: Recurso indexado en la red, métricas de efectividad de aprendizaje asociadas.
* **16. Permisos**: `resources:share`, `resources:download`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-001`, `RF-026`.
* **19. CUs**: `CU-029` (Compartir y Descargar Recurso).
* **20. Seguridad**: Control de plagiadores y marcas de agua en materiales compartidos.
* **21. Riesgos**: Publicación de materiales de baja calidad (mitigado con filtros basados en los resultados reales de los exámenes).
* **22. Criterios & Edge Cases**: Buscador semántico de recursos con respuesta en menos de 300ms.

#### RF-030: Benchmarking Sectorial en Tiempo Real
* **1. ID**: `RF-030` | **2. Nombre**: Cuadro de Mando Comparativo de Desempeño Institucional.
* **3. Objetivo**: Comparar el rendimiento de una institución de forma anónima contra los promedios regionales y nacionales.
* **4. Descripción**: Genera analítica comparativa B2B para directivos y rectores, permitiéndoles identificar áreas curriculares débiles en comparación con estándares de la industria.
* **5. Problema que resuelve**: Directivos tomando decisiones a ciegas sin saber si sus resultados están por encima o por debajo del mercado.
* **6. Actores**: Director (`DIRECTOR_USER`), Rector (`RECTOR_USER`).
* **7. Precondiciones**: Suscripción Enterprise activa e historial académico cargado.
* **8. Postcondiciones**: Reporte comparativo generado con recomendaciones estratégicas.
* **9. Flujo Principal**: 1. Seleccionar materia o nivel -> 2. Filtrar por región o tipo de institución -> 3. Procesar promedios anónimos -> 4. Mostrar gráfico de brechas.
* **10. Flujos Alt**: 10a. Simulación del impacto en el ranking si se aplican mejoras en materias específicas.
* **11. Excepciones**: 11a. Muestra demasiado pequeña en la región (agrupa a nivel nacional para proteger el anonimato).
* **12. Reglas de Negocio**: RN-030.1: Ninguna institución puede ver datos identificables de otra de forma individual (estricto anonimato).
* **13. Validaciones**: Mínimo 5 instituciones por segmento para permitir el cálculo comparativo.
* **14. Entradas**: Indicadores internos de la institución, filtros de comparación.
* **15. Salidas**: Gráficos de posicionamiento relativo, percentiles por materia, recomendaciones de mejora.
* **16. Permisos**: `analytics:view_benchmark`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-014`, `RF-026`.
* **19. CUs**: `CU-030` (Consultar Benchmarking Sectorial).
* **20. Seguridad**: Privacidad diferencial para evitar la des-anonimización de instituciones competidoras.
* **21. Riesgos**: Resistencia del personal por comparativas desfavorables (mitigado enfocado el reporte en la mejora continua).
* **22. Criterios & Edge Cases**: Actualización mensual de las bases de datos de comparación nacional.

---

### 💖 MÓDULO 11: STICKINESS EMOCIONAL E IDENTIDAD

#### RF-031: Sovereign Learning Identity (Blockchain-backed)
* **1. ID**: `RF-031` | **2. Nombre**: Identidad de Aprendizaje Soberana sobre Blockchain.
* **3. Objetivo**: Emitir certificados e insignias inmutables en una red blockchain para que el alumno sea dueño permanente de su historial educativo.
* **4. Descripción**: Graba cada logro y título en un registro descentralizado (W3C Verifiable Credentials). El alumno conserva su pasaporte educativo toda la vida mediante un código QR único.
* **5. Problema que resuelve**: Pérdida de historiales académicos por cierre de instituciones o trámites costosos de homologación.
* **6. Actores**: Estudiante (`STUDENT_USER`), Empleador (`EMPLOYER_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Grado, diploma o habilidad completada y validada por la institución.
* **8. Postcondiciones**: Credencial verificable emitida y firmada digitalmente en la blockchain.
* **9. Flujo Principal**: 1. Alumno aprueba programa -> 2. Generar Hash de credencial -> 3. Emitir transacción en Blockchain -> 4. Entregar QR de verificación al alumno.
* **10. Flujos Alt**: 10a. Verificación instantánea por un reclutador escaneando el código QR sin necesidad de llamar a la universidad.
* **11. Excepciones**: 11a. Revocación de un título por fraude (emisión de una transacción de revocación en la cadena).
* **12. Reglas de Negocio**: RN-031.1: El estudiante controla qué empresas pueden ver los detalles de su pasaporte educativo.
* **13. Validaciones**: Verificación de firmas criptográficas Ed25519 / Secp256k1.
* **14. Entradas**: `student_id`, `achievement_id`, firmas de las autoridades académicas.
* **15. Salidas**: Credencial Verificable JSON-LD, Hash de transacción blockchain, código QR.
* **16. Permisos**: `credentials:issue`, `credentials:verify`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-006`, `RF-020`.
* **19. CUs**: `CU-031` (Verificar Credencial Soberana).
* **20. Seguridad**: Credenciales inmutables e imposibles de falsificar.
* **21. Riesgos**: Costos de gas en redes públicas (mitigado usando redes de Capa 2 / Sidechains de cero costo de gas).
* **22. Criterios & Edge Cases**: Verificación de autenticidad de un título en menos de 2 segundos desde cualquier parte del mundo.

#### RF-032: Perfil de Estilos Cognitivos Único
* **1. ID**: `RF-032` | **2. Nombre**: Reporte y Manual Cognitivo del Estudiante.
* **3. Objetivo**: Diagnosticar y entregar al estudiante su perfil único de aprendizaje (visual/auditivo, velocidad de procesamiento, tolerancia a la frustración).
* **4. Descripción**: Genera una guía gráfica personalizada que explica al alumno cómo aprende mejor su cerebro y cuáles son sus mejores estrategias de estudio.
* **5. Problema que resuelve**: Alumnos estudiando con métodos ineficientes que no se ajustan a su perfil neurológico.
* **6. Actores**: Estudiante (`STUDENT_USER`), Psicopedagogo (`PSYCHO_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Al menos 30 días de interacciones y evaluaciones registradas.
* **8. Postcondiciones**: Manual de Estilo Cognitivo disponible en el perfil del alumno.
* **9. Flujo Principal**: 1. IA analiza patrones de estudio -> 2. Identifica fortalezas cognitivas -> 3. Redacta el manual de uso del cerebro -> 4. Presenta al alumno con recomendaciones.
* **10. Flujos Alt**: 10a. Actualización anual del perfil a medida que el estudiante madura cognitivamente.
* **11. Excepciones**: 11a. Inconclusiones por falta de variedad de datos (solicita realizar una prueba lúdica para complementar el perfil).
* **12. Reglas de Negocio**: RN-032.1: El perfil debe ser presentado de manera positiva e inclusiva sin generar etiquetas limitantes.
* **13. Validaciones**: Validación psicométrica del modelo de aprendizaje por expertos.
* **14. Entradas**: Tiempos de respuesta, elección de formatos preferidos, patrones de error.
* **15. Salidas**: Reporte PDF/Interactivos de estilo cognitivo, consejos de estudio personalizados.
* **16. Permisos**: `profile:view_cognitive`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-025`.
* **19. CUs**: `CU-032` (Consultar Perfil Cognitivo).
* **20. Seguridad**: Alta confidencialidad de la información neuro-divergente o estilos de aprendizaje.
* **21. Riesgos**: Que los estudiantes usen el perfil como excusa para no esforzarse en áreas débiles (mitigado con un enfoque de mentalidad de crecimiento).
* **22. Criterios & Edge Cases**: Precisión percibida del reporte mayor al 90% en encuestas a estudiantes.

#### RF-033: Parent-Engagement Portal (Live Stream de Progreso)
* **1. ID**: `RF-033` | **2. Nombre**: Muro Social de Progreso y Acompañamiento Familiar.
* **3. Objetivo**: Mantener a los padres involucrados mediante un feed en tiempo real con hitos diarios y actividades recomendadas para el hogar.
* **4. Descripción**: En lugar de boletines mensuales, muestra un muro similar a una red social donde los padres ven los logros diarios de sus hijos y reciben sugerencias prácticas para apoyarlos hoy.
* **5. Problema que resuelve**: Desconexión y falta de visibilidad de los padres sobre el día a día escolar de sus hijos.
* **6. Actores**: Padre (`PARENT_USER`), Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Vínculo padre-hijo verificado en la plataforma.
* **8. Postcondiciones**: Publicación de actualizaciones diarias en la App del padre.
* **9. Flujo Principal**: 1. Alumno completa un logro -> 2. Sistema genera tarjeta visual -> 3. Publicar en el muro del padre -> 4. Padre envía una felicitación/recompensa.
* **10. Flujos Alt**: 10a. Sugerencia de una pregunta para la cena: "Pregúntale hoy a tu hijo sobre el experimento de física que hizo".
* **11. Excepciones**: 11a. Notificaciones bloqueadas por el teléfono del padre (envía resumen SMS/WhatsApp semanal).
* **12. Reglas de Negocio**: RN-033.1: Solo se muestran datos del hijo propio, respetando la privacidad de los demás compañeros de clase.
* **13. Validaciones**: Verificación de la patria potestad o tutoría legal activa.
* **14. Entradas**: Hitos completados, fotos de proyectos compartidas por el profesor.
* **15. Salidas**: Feed de noticias personalizado, sugerencias de conversación diaria.
* **16. Permisos**: `parent:view_feed`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-005`, `RF-012`.
* **19. CUs**: `CU-033` (Ver Feed de Progreso Familiar).
* **20. Seguridad**: Canal de comunicación cerrado y seguro sin acceso a usuarios externos a la familia.
* **21. Riesgos**: Presión excesiva de los padres sobre los alumnos por el monitoreo continuo (mitigado destacando el esfuerzo y no solo la nota).
* **22. Criterios & Edge Cases**: Incremento del 300% en la interacción diaria de los padres con la plataforma.

---

### 💵 MÓDULO 12: PLATFORM ECONOMICS & EXPANSION

#### RF-034: API-First Architecture & Plugin Ecosystem
* **1. ID**: `RF-034` | **2. Nombre**: Ecosistema Abierto de Plugins y API para Desarrolladores.
* **3. Objetivo**: Permitir a terceros (apps de idiomas, laboratorios virtuales) crear aplicaciones integradas en la plataforma compartiendo ingresos.
* **4. Descripción**: Infraestructura API-First y SDK para desarrolladores externos que permite integrar nuevas herramientas pedagógicas dentro de la interfaz de la plataforma (Marketplace de Apps).
* **5. Problema que resuelve**: Imposibilidad de que un solo software desarrolle todas las herramientas educativas especializadas del mercado.
* **6. Actores**: Desarrollador Tercero (`DEVELOPER_USER`), Administrador (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: Registro en el portal de desarrolladores y API Keys emitidas.
* **8. Postcondiciones**: Plugin publicado en la tienda institucional para su instalación.
* **9. Flujo Principal**: 1. Desarrollador crea app con SDK -> 2. Enviar a revisión -> 3. Aprobar e indexar en la tienda -> 4. Colegios instalan app -> 5. Liquidar 70/30 de ingresos.
* **10. Flujos Alt**: 10a. Integración rápida mediante estándar LTI 1.3 / IMS Global.
* **11. Excepciones**: 11a. Plugin externo genera errores o vulnerabilidades (desactivación remota e inmediata del plugin).
* **12. Reglas de Negocio**: RN-034.1: Los plugins externos deben solicitar permisos granulares de datos y ser aprobados por el administrador.
* **13. Validaciones**: Pruebas de seguridad automáticas antes de publicar el plugin.
* **14. Entradas**: Código del plugin, manifiesto de permisos, enlaces Webhook.
* **15. Salidas**: App disponible en la tienda, reporte de ingresos compartidos.
* **16. Permisos**: `developers:manage_apps`, `store:install_plugin`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: NINGUNA (Arquitectura de Plataforma).
* **19. CUs**: `CU-034` (Instalar y Usar Plugin de Terceros).
* **20. Seguridad**: Ejecución de plugins dentro de iFrames aislados (Sandboxed) con política CSP estricta.
* **21. Riesgos**: Inestabilidad causada por código de terceros (mitigado con cuotas de recursos e insolación estricta).
* **22. Criterios & Edge Cases**: Instalación de una app en 1 clic disponible inmediatamente para toda la institución.

#### RF-035: Marketplace de Talento Predictivo (B2B)
* **1. ID**: `RF-035` | **2. Nombre**: Reclutamiento Algorítmico Basado en Habilidades Reales.
* **3. Objetivo**: Conectar a las empresas contratantes con estudiantes destacados basándose en sus competencias demostradas en la plataforma y no en un CV redactado.
* **4. Descripción**: Las empresas buscan candidatos filtrando por grafos de habilidades verificadas. El sistema sugiere candidatos ideales preservando la privacidad hasta la aceptación del alumno.
* **5. Problema que resuelve**: Contrataciones fallidas por CVs inflados y falta de oportunidades para talentos de instituciones no prestigiosas.
* **6. Actores**: Reclutador (`RECRUITER_USER`), Estudiante (`STUDENT_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Perfil del estudiante con habilidades verificadas y autorización explícita para recibir ofertas de empleo.
* **8. Postcondiciones**: Solicitud de entrevista enviada y comisión de reclutamiento generada.
* **9. Flujo Principal**: 1. Empresa define perfil técnico requerido -> 2. IA busca coincidencias en los grafos de aprendizaje -> 3. Muestra candidatos anónimos -> 4. Empresa solicita contacto -> 5. Alumno acepta revelar su identidad.
* **10. Flujos Alt**: 10a. Retos técnicos patrocinados por empresas que sirven como evaluaciones de contratación directas.
* **11. Excepciones**: 11a. El alumno rechaza la oferta de contacto de la empresa (mantiene el anonimato del candidato).
* **12. Reglas de Negocio**: RN-035.1: Las empresas pagan una tarifa por cada contratación exitosa concretada a través de la plataforma.
* **13. Validaciones**: Verificación de la identidad corporativa de las empresas reclutadoras.
* **14. Entradas**: Perfil de puesto de trabajo, competencias clave requeridas.
* **15. Salidas**: Lista de candidatos altamente compatibles, solicitudes de contacto enviadas.
* **16. Permisos**: `recruitment:search_talent`, `student:accept_offer`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-026`, `RF-031`.
* **19. CUs**: `CU-035` (Buscar Talento y Postular).
* **20. Seguridad**: Anonimato total del candidato hasta la autorización expresa para prevenir cualquier tipo de discriminación.
* **21. Riesgos**: Intentos de eludir la plataforma para contactar candidatos directamente (mitigado protegiendo la identidad real).
* **22. Criterios & Edge Cases**: Precisión de coincidencia entre las necesidades del puesto y las habilidades del estudiante mayor al 85%.

#### RF-036: Economías de Tokens e Incentivos Internos
* **1. ID**: `RF-036` | **2. Nombre**: Sistema de Recompensas y Créditos Educativos.
* **3. Objetivo**: Crear una economía interna donde estudiantes y profesores ganan créditos por ayudar, destacar y crear contenido de calidad.
* **4. Descripción**: Otorga tokens internos por logros y contribuciones, los cuales pueden ser canjeados por descuentos en matrículas, cursos avanzadas, libros o artículos de la tienda.
* **5. Problema que resuelve**: Falta de incentivos tangibles para la colaboración académica y el esfuerzo sostenido.
* **6. Actores**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Economía de créditos habilitada en el tenant.
* **8. Postcondiciones**: Balance de tokens actualizado e historial de transacciones registrado.
* **9. Flujo Principal**: 1. Realizar acción meritoria -> 2. Sistema calcula recompensa -> 3. Transferir tokens a la billetera virtual -> 4. Canjear en el catálogo de beneficios.
* **10. Flujos Alt**: 10a. Donación de tokens entre compañeros como agradecimiento por una explicación o ayuda recibida.
* **11. Excepciones**: 11a. Intento de fraude o colusión para generar tokens de forma artificial (bloqueo de la billetera y sanción).
* **12. Reglas de Negocio**: RN-036.1: Los tokens no pueden ser convertidos directamente a dinero en efectivo (evita regulaciones financieras complejas).
* **13. Validaciones**: Verificación del saldo disponible en la billetera antes de permitir el canje.
* **14. Entradas**: `user_id`, evento de recompensa, solicitudes de canje.
* **15. Salidas**: Balance de tokens actual, recibo de canje, beneficio entregado.
* **16. Permisos**: `tokens:earn`, `tokens:redeem`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-005`, `RF-007`.
* **19. CUs**: `CU-036` (Ganar y Canjear Tokens).
* **20. Seguridad**: Registro de transacciones contables de doble entrada para prevenir la creación no autorizada de tokens.
* **21. Riesgos**: Devaluación o hiperinflación de la economía de fichas (mitigado con un control dinámico de la emisión).
* **22. Criterios & Edge Cases**: Incremento del 200% en las acciones de apoyo entre compañeros mediante la economía de incentivos.

---

### 🤖 MÓDULO 13: AGENTIC SWARM & DIGITAL TWIN (PRO-LEVEL)

#### RF-037: AI Agentic Swarm (Enjambre de Agentes Especializados)
* **1. ID**: `RF-037` | **2. Nombre**: Jerarquía Autónoma de Agentes de IA Especializados.
* **3. Objetivo**: Desplegar un equipo de agentes virtuales autónomos funcionando 24/7 para apoyar al estudiante y la institución.
* **4. Descripción**: Múltiples agentes especializados interactúan entre sí: (1) Agente Psicopedagogo (adapta el estilo de enseñanza), (2) Agente Evaluador (corrige en tiempo real), (3) Agente Concierge de Carrera (conecta con oportunidades laborales).
* **5. Problema que resuelve**: Imposibilidad de brindar atención personalizada e individualizada 24/7 a miles de estudiantes simultáneamente.
* **6. Actores**: Estudiante (`STUDENT_USER`), Agentes IA (`AI_SWARM`).
* **7. Precondiciones**: Asignación del enjambre de agentes al grupo o estudiante.
* **8. Postcondiciones**: Resoluciones, tutorías y correcciones ejecutadas de manera autónoma.
* **9. Flujo Principal**: 1. Estudiante realiza consulta -> 2. Agente Orquestador delega al agente especialista -> 3. Especialista resuelve -> 4. Agente Revisor verifica la calidad -> 5. Entregar respuesta al estudiante.
* **10. Flujos Alt**: 10a. Colaboración entre múltiples agentes para resolver un caso complejo antes de responder al alumno.
* **11. Excepciones**: 11a. El enjambre de IA no alcanza un nivel de confianza suficiente (deriva la consulta a un tutor humano).
* **12. Reglas de Negocio**: RN-037.1: Toda intervención del enjambre de agentes queda registrada para auditoría de calidad pedagógica.
* **13. Validaciones**: Verificación del cumplimiento de los guardrails éticos del sistema.
* **14. Entradas**: Preguntas del estudiante, tareas entregadas, dudas de carrera.
* **15. Salidas**: Explicaciones personalizadas, correcciones, planes de acción orientados por especialistas.
* **16. Permisos**: `ai_swarm:interact`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-002`, `RF-023`.
* **19. CUs**: `CU-037` (Interactuar con Enjambre de Agentes).
* **20. Seguridad**: Control estricto de accesos a datos para que los agentes no compartan información privada entre estudiantes.
* **21. Riesgos**: Respuestas contradictorias entre diferentes agentes (mitigado por el Agente Orquestador Central).
* **22. Criterios & Edge Cases**: Respuesta experta del enjambre de agentes generada en menos de 2 segundos.

#### RF-038: Digital Twin del Estudiante (Gemelo Digital Educativo - DTL)
* **1. ID**: `RF-038` | **2. Nombre**: Simulación Virtual del Modelo Cognitivo del Alumno.
* **3. Objetivo**: Crear una réplica o gemelo digital del perfil de aprendizaje de cada estudiante para realizar simulaciones predictivas y asistencia en sombra.
* **4. Descripción**: El Gemelo Digital simula cómo reaccionaría el estudiante ante un determinado examen o metodología. Permite a los profesores probar evaluaciones antes de aplicarlas y al estudiante contar con un asistente que resume clases según su perfil de aprendizaje.
* **5. Problema que resuelve**: Diseñar evaluaciones con niveles de dificultad inadecuados que reprueban masivamente sin medir el aprendizaje real.
* **6. Actores**: Profesor (`TEACHER_USER`), Estudiante (`STUDENT_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Gemelo Digital entrenado con al menos 60 días de datos de interacción del alumno.
* **8. Postcondiciones**: Simulación completada con predicciones de resultados e identificación de posibles obstáculos.
* **9. Flujo Principal**: 1. Docente carga borrador de examen -> 2. Ejecutar prueba contra los Gemelos Digitales del aula -> 3. IA predice tasa de aprobación -> 4. Sugiere ajustes en preguntas ambiguas -> 5. Docente optimiza el examen.
* **10. Flujos Alt**: 10a. "Modo Sombra": El gemelo digital asiste a la clase virtual y genera un resumen adaptado a los puntos flacos del estudiante real.
* **11. Excepciones**: 11a. Gemelo digital desactualizado por falta de datos recientes (solicita una sesión de recalibración).
* **12. Reglas de Negocio**: RN-038.1: La nota de la simulación del Gemelo Digital NUNCA sustituye la evaluación real del estudiante humano.
* **13. Validaciones**: Modelo de simulación con precisión comprobada mayor al 85%.
* **14. Entradas**: Borrador de examen, temarios, parámetros de la clase.
* **15. Salidas**: Simulación de resultados del aula, porcentaje estimado de aprobados, preguntas problemáticas detectadas.
* **16. Permisos**: `digital_twin:simulate`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-025`, `RF-032`.
* **19. CUs**: `CU-038` (Simular Evaluación con Gemelo Digital).
* **20. Seguridad**: Privacidad absoluta del Gemelo Digital; el estudiante es dueño de la configuración de su réplica.
* **21. Riesgos**: Que los profesores confíen a ciegas en la simulación sin considerar la variabilidad humana (mitigado con advertencias de margen de error).
* **22. Criterios & Edge Cases**: Simulación de un examen para 100 gemelos digitales en menos de 5 segundos.

#### RF-039: Proof of Skill & Talent Liquidity (Fin del CV)
* **1. ID**: `RF-039` | **2. Nombre**: Protocolo de Validación Inmutable de Competencias Reales.
* **3. Objetivo**: Sustituir el currículum tradicional por una prueba técnica verificable y líquida de las capacidades reales del estudiante.
* **4. Descripción**: Convierte el desempeño práctico del alumno en proyectos reales dentro de la plataforma en un sello de garantía indiscutible para los reclutadores globales.
* **5. Problema que resuelve**: Fraude en currículums y discriminación por el prestigio de la universidad de origen.
* **6. Actores**: Estudiante (`STUDENT_USER`), Empresa (`EMPLOYER_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Proyectos prácticos y exámenes evaluados y aprobados con supervisión de código/ejecución.
* **8. Postcondiciones**: Sello de "Proof of Skill" emitido en el portafolio del usuario.
* **9. Flujo Principal**: 1. Alumno ejecuta proyecto complejo -> 2. Sistema audita la ejecución del código o trabajo -> 3. Verifica autenticidad -> 4. Emite sello "Proof of Skill" en el perfil público.
* **10. Flujos Alt**: 10a. Desafíos en vivo patrocinados por empresas donde el sello califica directamente para la contratación.
* **11. Excepciones**: 11a. Detección de uso no autorizado de herramientas externas sin atribuir (suspende la verificación del sello).
* **12. Reglas de Negocio**: RN-039.1: Los sellos de Proof of Skill se re-validan o caducan cada 2 años si la tecnología evoluciona.
* **13. Validaciones**: Verificación de autenticidad mediante firmas de código e inspección de ejecución.
* **14. Entradas**: Repositorios de proyectos, ejecuciones de código, evidencias en video.
* **15. Salidas**: Certificado de Proof of Skill verificable con enlace al código/trabajo real ejecutado.
* **16. Permisos**: `proof_of_skill:issue`, `proof_of_skill:verify`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-031`, `RF-035`.
* **19. CUs**: `CU-039` (Validar Proof of Skill).
* **20. Seguridad**: Pruebas criptográficas de autoría del trabajo presentado.
* **21. Riesgos**: Venta de proyectos entre estudiantes para obtener el sello (mitigado con exámenes defensivos orales o en video con IA).
* **22. Criterios & Edge Cases**: Validación de un sello de habilidad en menos de 1 segundo mediante el nodo de verificación.

#### RF-040: Multimodal Emotion & Attention Tracking (Ético)
* **1. ID**: `RF-040` | **2. Nombre**: Sensor Multimodal de Atención, Emoción y Prevención de Bullying.
* **3. Objetivo**: Detectar caídas de atención en clases virtuales y prevenir situaciones de acoso en los foros analizando patrones multimodales.
* **4. Descripción**: Procesa micro-expresiones (si la cámara está encendida voluntariamente) o patrones del tono de texto para: (1) Sugerir descansos al docente si la atención cae, (2) Alertar tempranamente sobre ciberacoso en los canales de la plataforma.
* **5. Problema que resuelve**: Falta de conexión empática en entornos virtuales y detección tardía del ciberacoso escolar.
* **6. Actores**: Profesor (`TEACHER_USER`), Psicopedagogo (`PSYCHO_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Consentimiento explícito de procesamiento multimodal activado por el usuario o apoderado.
* **8. Postcondiciones**: Métrica de atención agregada del grupo en tiempo real y alertas de ciberacoso emitidas.
* **9. Flujo Principal**: 1. IA analiza tono de texto o micro-interacciones -> 2. Detecta nivel de atención o agresión en foro -> 3. Si hay agresión, notifica al moderador -> 4. Si hay desatención general, sugiere cambiar la dinámica.
* **10. Flujos Alt**: 10a. Interrupción de una sesión virtual para sugerir un ejercicio de estiramiento de 2 minutos cuando la fatiga es generalizada.
* **11. Excepciones**: 11a. El usuario desactiva la cámara o el micrófono (el sistema conmuta exclusivamente al análisis de patrones de texto e interacción).
* **12. Reglas de Negocio**: RN-040.1: Prohibido almacenar imágenes de rostros de video; el análisis emocional se procesa en el dispositivo del usuario (Edge AI) y solo se envía el indicador numérico.
* **13. Validaciones**: Evaluación de modelos de clasificación emocional con precisión > 90%.
* **14. Entradas**: Flujo de video/audio local, mensajes en foros de discusión.
* **15. Salidas**: Nivel de atención grupal (0-100%), alertas de ciberacoso confidenciales.
* **16. Permisos**: `emotion:track_ethics`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-011`, `RF-020`.
* **19. CUs**: `CU-040` (Monitorear Atención y Bienestar).
* **20. Seguridad**: Cumplimiento de las directivas más estrictas de IA Ética (EU AI Act - categoría de alto riesgo con máxima transparencia).
* **21. Riesgos**: Sensación de vigilancia invasiva (mitigado con transparencia total y opción de desactivación voluntaria sin penalidad).
* **22. Criterios & Edge Cases**: Procesamiento local en el navegador del usuario a 15fps sin ralentizar el equipo.

#### RF-041: Interoperabilidad "Lego" (Universal Learning Record)
* **1. ID**: `RF-041` | **2. Nombre**: Protocolo de Transferencia Unificada de Historial Educativo.
* **3. Objetivo**: Permitir que un estudiante transfiera todo su historial, modelo de IA personalizado y logros a otra institución con 1 solo clic.
* **4. Descripción**: Estándar de datos abiertos que permite empaquetar el perfil del estudiante, su Gemelo Digital y sus contenidos para trasladarlos a cualquier otra institución que utilice la plataforma, garantizando que el usuario sea el dueño absoluto de su información.
* **5. Problema que resuelve**: El "Lock-in" o secuestro de datos por parte de las plataformas educativas tradicionales que dificulta el traslado de expedientes.
* **6. Actores**: Estudiante (`STUDENT_USER`), Administrador (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: Solicitud de traslado de expediente iniciada por el estudiante o tutor legal.
* **8. Postcondiciones**: Paquete de datos estructurado (Universal Learning Record) exportado e importado en la nueva institución.
* **9. Flujo Principal**: 1. Solicitar traslado de colegio/universidad -> 2. Autenticar identidad -> 3. Empaquetar datos e IA personalizada -> 4. Transferir seguro -> 5. Importar en la nueva institución en 1 clic.
* **10. Flujos Alt**: 10a. Exportación de una copia de respaldo personal de todo el expediente educativo para almacenamiento propio.
* **11. Excepciones**: 11a. Retención administrativa por deudas pendientes (bloquea la transferencia hasta regularizar la situación según contrato).
* **12. Reglas de Negocio**: RN-041.1: El formato de exportación debe seguir el estándar internacional IEEE 1484.11.1 / OneRoster.
* **13. Validaciones**: Verificación de la firma de integridad del paquete enviado.
* **14. Entradas**: `student_id`, ID de la institución de destino.
* **15. Salidas**: Paquete de expediente educativo cifrado e importado.
* **16. Permisos**: `record:transfer`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-020`, `RF-031`.
* **19. CUs**: `CU-041` (Transferir Expediente Universal).
* **20. Seguridad**: Encriptación de extremo a extremo durante el proceso de migración de datos.
* **21. Riesgos**: Pérdida de formato al importar en versiones distintas del sistema (mitigado con transformadores de esquemas compatibles hacia atrás).
* **22. Criterios & Edge Cases**: Migración completa del expediente de un estudiante de 12 años escolares en menos de 10 segundos.

#### RF-042: Invisible UI (Learning in the Flow)
* **1. ID**: `RF-042` | **2. Nombre**: Interfaz Ubicua y Aprendizaje Contextual Fuera de Pantalla.
* **3. Objetivo**: Llevar la experiencia de aprendizaje fuera de la aplicación tradicional e integrarla en los canales diarios del usuario (WhatsApp, Alexa, Apple Vision Pro, notificaciones en movimiento).
* **4. Descripción**: El sistema envía micro-desafíos, podcasts resumidos en audio de 3 minutos o experiencias en Realidad Aumentada adaptados al momento y ubicación del estudiante (ej. "Estás en el transporte público, ¿escuchamos el resumen de 3 minutos de la clase de hoy?").
* **5. Problema que resuelve**: Falta de tiempo para sentarse frente a una computadora a estudiar dentro de una plataforma tradicional.
* **6. Actores**: Estudiante (`STUDENT_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Dispositivos y canales preferidos vinculados en el perfil del usuario.
* **8. Postcondiciones**: Interacción pedagógica completada sin haber abierto la aplicación web tradicional.
* **9. Flujo Principal**: 1. IA detecta contexto oportuno (ej. hora habitual de trayecto) -> 2. Genera micro-contenido en audio/texto corto -> 3. Envía por WhatsApp/Alexa -> 4. Registra la respuesta del alumno -> 5. Actualiza el avance.
* **10. Flujos Alt**: 10a. Experiencia inmersiva en gafas de Realidad Aumentada (Spatial Computing) para laboratorios tridimensionales.
* **11. Excepciones**: 11a. El usuario activa el modo "No Molestar" (el sistema suspende los envíos contextuales).
* **12. Reglas de Negocio**: RN-042.1: El consumo mediante Invisible UI debe ser equivalente en peso académico a la lección tradicional.
* **13. Validaciones**: Verificación de la autenticidad del canal de entrega.
* **14. Entradas**: Ubicación contextual aproximada, horario, dispositivo en uso.
* **15. Salidas**: Audio corto de 3 min, quiz interactivo por WhatsApp, sincronización de progreso.
* **16. Permisos**: `learning:invisible_ui`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias**: `RF-012`, `RF-037`.
* **19. CUs**: `CU-042` (Aprender en el Flujo Diario).
* **20. Seguridad**: Mensajería cifrada de extremo a extremo en canales externos.
* **21. Riesgos**: Interrupciones en momentos inoportunos para el usuario (mitigado aprendiendo de las horas de respuesta efectivas del estudiante).
* **22. Criterios & Edge Cases**: Aumento del 200% en el tiempo de compromiso (engagement) mediante micro-interacciones diarias.

---

*Fin de la Etapa 1 (V2 PRO-LEVEL) — Cobertura Total de los 42 Requerimientos Funcionales Metodología DDS v2.0.*
