# FASE 0 — Metodología DDS: Requerimientos Funcionales Exhaustivos (EDUCACION OS - 42 RFs)

> **Proyecto**: EDUCACION OS — Sistema Operativo e Infraestructura Inteligente de Educación
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 1 — Especificación Funcional Exhaustiva (42 RFs Exclusivos)
> **Versión**: 1.0 (AISLAMIENTO ABSOLUTO REPO EDUCACION)
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega
> **Fuente Única de Verdad**: `EDUCACION/Fase 3 (RF -- CU)/FASE_3_REQUISITOS_CASOS_USO_EXPANDED.md`

---

## 📌 Resumen Ejecutivo de Requerimientos Funcionales (`RF-001` a `RF-042`)

Conforme a la **Regla Crítica de Aislamiento del Repositorio**, la presente documentación especifica **única y exclusivamente los 42 Requerimientos Funcionales del sistema EDUCACION OS**, estructurados en sus 13 Módulos Académicos de acuerdo a la Fuente Única de Verdad (`FASE_3_REQUISITOS_CASOS_USO_EXPANDED.md`).

---

## 🔴 TIER 1: REQUISITOS FUNCIONALES BASE (RF-001 A RF-020)

---

### 📦 MÓDULO 1: ENSEÑANZA Y CONTENIDOS

#### RF-001: Crear Cursos con Estructura Modular
* **1. Identificador**: `RF-001`
* **2. Nombre**: Creador Curricular Modular (Módulos → Temas → Lecciones).
* **3. Objetivo**: Permitir a docentes y coordinadores estructurar mallas curriculares completas de asignaturas y cursos.
* **4. Descripción detallada**: El sistema debe proveer una interfaz para crear cursos estructurados jerárquicamente en módulos, temas y lecciones, permitiendo adjuntar materiales y definir correlatividad.
* **5. Problema que resuelve**: Desorganización de contenidos educativos dispersos e ineficiencia en el diseño instruccional.
* **6. Actor(es) involucrados**: Profesor (`TEACHER_USER`), Coordinador Académico (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: Usuario autenticado con rol docente y asignación al periodo académico activo.
* **8. Postcondiciones**: Malla curricular guardada e indexada en estado `BORRADOR` o `PUBLICADO`.
* **9. Flujo principal**: 1. Crear nuevo curso -> 2. Insertar módulos y temas -> 3. Adjuntar lecciones (video, PDF, quiz) -> 4. Definir reglas de paso -> 5. Publicar.
* **10. Flujos alternativos**: 10a. Carga masiva de la estructura desde archivos en formato SCORM / LTI 1.3 / JSON.
* **11. Flujos de excepción**: 11a. Archivo adjunto dañado (cancela la inserción de la lección e informa al usuario).
* **12. Reglas de negocio**: RN-001.1: Un módulo no puede ser publicado sin al menos una lección con contenido.
* **13. Validaciones**: Título de curso entre 5 y 150 caracteres; código de materia único.
* **14. Datos de entrada**: Título, código de materia, descripción, árbol de módulos y archivos multimedia.
* **15. Datos de salida**: `course_id`, estructura JSON de árbol curricular, estado de publicación.
* **16. Permisos necesarios**: `course:create`, `course:publish`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: Ninguna (Raíz del módulo).
* **19. Casos de uso relacionados**: `CU-001` (Crear Curso Modular).
* **20. Consideraciones de seguridad**: Sanitización estricta contra XSS y validación de tipos MIME de archivos.
* **21. Riesgos**: Pérdida de datos en borrador por desconexión (mitigado con auto-guardado en cliente).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Carga de la estructura curricular en < 500ms. Edge Case: Prevención de referencias circulares en correlatividades mediante validación DAG.

#### RF-002: Aprendizaje Adaptativo IA
* **1. Identificador**: `RF-002`
* **2. Nombre**: Motor de Adaptación Automática de Contenidos por IA.
* **3. Objetivo**: Ajustar automáticamente el ritmo, dificultad y formato de las lecciones según el desempeño del estudiante.
* **4. Descripción detallada**: Evalúa continuamente las respuestas y velocidad de comprensión del alumno. Si falla en un concepto, inserta automáticamente explicaciones alternativas o micro-repasos antes de avanzar.
* **5. Problema que resuelve**: Frustración y abandono causados por ritmos de enseñanza rígidos no adaptados al estudiante.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Estudiante matriculado con al menos una evaluación realizada.
* **8. Postcondiciones**: Ruta de aprendizaje personalizada actualizada en el perfil del alumno.
* **9. Flujo principal**: 1. Estudiante rinde test -> 2. IA detecta laguna conceptual -> 3. Reorganiza temario en vivo -> 4. Presenta lección adaptada.
* **10. Flujos alternativos**: 10a. Estudiante con desempeño sobresaliente (la IA salta temas introductorios previa validación).
* **11. Flujos de excepción**: 11a. Interrupción del servicio de IA (el sistema conmuta temporalmente a la ruta estándar lineal).
* **12. Reglas de negocio**: RN-002.1: La dificultad no puede incrementarse en más de 2 niveles en un solo paso.
* **13. Validaciones**: Modelo con precisión pedagógica comprobada > 85%.
* **14. Datos de entrada**: Respuestas de evaluaciones, tiempo de resolución, historial de intentos.
* **15. Datos de salida**: `next_lesson_id`, nivel de dificultad asignado, explicación personalizada.
* **16. Permisos necesarios**: `learning:adaptive_access`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados**: `CU-002` (Navegar Ruta Adaptativa).
* **20. Consideraciones de seguridad**: Anonimización de la telemetría de aprendizaje del alumno.
* **21. Riesgos**: Asignación de dificultad errónea (mitigado con supervisión docente en el panel).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Re-generación de la ruta recomendada en menos de 1.5 segundos.

#### RF-003: Visualización de Contenidos Multimedia
* **1. Identificador**: `RF-003` | **2. Nombre**: Reproducción Multimedia Interactiva.
* **3. Objetivo**: Renderizar videos HLS, PDFs interactivos y recursos multimedia con alta velocidad.
* **4. Descripción**: Provee un reproductor web y móvil con velocidad variable, subtítulos, transcripción en vivo y marcado de progreso.
* **5. Problema que resuelve**: Desinterés del estudiante por formatos de lectura estáticos o videos lentos.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`).
* **7. Precondiciones**: Acceso concedido a la lección seleccionada.
* **8. Postcondiciones**: Tiempo de estudio guardado y progreso acumulado en la materia.
* **9. Flujo principal**: 1. Cargar lección -> 2. Iniciar video HLS -> 3. Emitir pings de avance cada 10s -> 4. Marcar lección vista.
* **10. Flujos alternativos**: 10a. Descarga previa en la App para estudio en modo offline.
* **11. Flujos de excepción**: 11a. Caída de velocidad de internet (baja la calidad del video a 360p sin detener la reproducción).
* **12. Reglas de negocio**: RN-003.1: No se marca como vista la lección si se adelanta manualmente sin reproducir.
* **13. Validaciones**: Compatibilidad de formatos (HLS, DASH, PDF.js).
* **14. Datos de entrada**: `lesson_id`, posición del video (segundos).
* **15. Datos de salida**: Porcentaje de lección completado.
* **16. Permisos necesarios**: `content:view`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados**: `CU-003` (Consumir Lección Multimedia).
* **20. Consideraciones de seguridad**: Enlaces de video firmados (Signed URLs) temporales para evitar enlaces públicos.
* **21. Riesgos**: Sobrecarga de ancho de banda (mitigado con CDN distribuido en Cloudflare Edge).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Inicio de reproducción en menos de 800ms.

#### RF-004: Envío y Calificación de Trabajos
* **1. Identificador**: `RF-004` | **2. Nombre**: Calificación Digital y Entregas por Rúbrica.
* **3. Objetivo**: Gestionar la entrega de tareas por los alumnos y su corrección docente mediante rúbricas.
* **4. Descripción**: Permite subir archivos, enlaces o repositorios, integrando rúbricas configurables y comentarios docentes.
* **5. Problema que resuelve**: Extravío de trabajos físicos y falta de criterios claros de corrección.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Tarea creada con fecha de cierre vigente.
* **8. Postcondiciones**: Tarea entregada con sello de tiempo e ingresada al registro de calificaciones.
* **9. Flujo principal**: 1. Subir trabajo -> 2. Confirmar envío -> 3. Notificar al docente -> 4. Evaluar con rúbrica -> 5. Publicar nota.
* **10. Flujos alternativos**: 10a. Permitir re-entrega corregida tras autorización expresa del profesor.
* **11. Flujos de excepción**: 11a. Entrega fuera de plazo (marcada automáticamente como `ENTREGA_TARDÍA`).
* **12. Reglas de negocio**: RN-004.1: Tamaño máximo de archivo de 50MB por tarea.
* **13. Validaciones**: Verificación de extensiones de archivo permitidas (.pdf, .docx, .zip, .py).
* **14. Datos de entrada**: Archivo enviado, comentarios, notas de la rúbrica.
* **15. Datos de salida**: Calificación oficial, recibo PDF de entrega, comentarios del profesor.
* **16. Permisos necesarios**: `assignment:submit`, `assignment:grade`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados**: `CU-004` (Entregar Tarea).
* **20. Consideraciones de seguridad**: Análisis antivirus obligatorio a todo archivo subido.
* **21. Riesgos**: Plagio entre alumnos (mitigado con motor de detección de similitud).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Confirmación de entrega instantánea con código de comprobante.

---

### 🎮 MÓDULO 2: GAMIFICACIÓN Y RECOMPENSAS

#### RF-005: Otorgamiento de Badges y Logros
* **1. Identificador**: `RF-005` | **2. Nombre**: Asignación de Insignias Académicas.
* **3. Objetivo**: Otorgar insignias digitales al cumplir hitos de constancia y rendimiento.
* **4. Descripción**: Evalúa eventos (ej: "7 días continuos estudiando") y concede badges visuales con metadatos verificables.
* **5. Problema que resuelve**: Falta de motivación e incentivos inmediatos en el aprendizaje diario.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Hito o evento educativo completado por el estudiante.
* **8. Postcondiciones**: Badge añadido al perfil público del usuario.
* **9. Flujo principal**: 1. Cumplir hito -> 2. Evento notificado -> 3. Conceder badge -> 4. Mostrar felicitación modal.
* **10. Flujos alternativos**: 10a. Otorgamiento manual de insignias de honor por parte de la directiva escolar.
* **11. Flujos de excepción**: 11a. Intento de duplicar badge por el mismo evento (el evaluador rechaza el duplicado).
* **12. Reglas de negocio**: RN-005.1: Una insignia única no puede ser concedida dos veces a la misma persona.
* **13. Validaciones**: Verificación de la firma criptográfica en el badge otorgado.
* **14. Datos de entrada**: `user_id`, `achievement_type`.
* **15. Salidas**: `badge_id`, imagen SVG de la insignia, fecha de logro.
* **16. Permisos necesarios**: `gamification:earn`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados**: `CU-005` (Desbloquear Logros).
* **20. Consideraciones de seguridad**: Firma digital de los badges emitidos.
* **21. Riesgos**: Otorgamiento excesivo que devalúe el sentido del logro (equilibrado en diseño).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Despliegue de animación modal a 60fps.

#### RF-006: Leaderboards Dinámicos por Puntos XP
* **1. Identificador**: `RF-006` | **2. Nombre**: Tablas de Clasificación e Ranking Académico.
* **3. Objetivo**: Publicar rankings de estudiantes ordenados por puntos de experiencia (XP) acumulados.
* **4. Descripción**: Mantiene tablas de posiciones globales, por aula y por materia, ordenando a los alumnos según su esfuerzo académico.
* **5. Problema que resuelve**: Falta de referentes y competencia sana entre los estudiantes.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Puntos XP registrados en la cuenta del estudiante.
* **8. Postcondiciones**: Posición actualizada en la tabla de líderes.
* **9. Flujo principal**: 1. Ganar XP -> 2. Recalcular tabla en Redis -> 3. Publicar ranking -> 4. Notificar ascenso de puesto.
* **10. Flujos alternativos**: 10a. Modo anónimo (el estudiante puede ocultar su nombre real en la tabla pública).
* **11. Flujos de excepción**: 11a. Empate de puntos (desempatado por el alumno que alcanzó la puntuación primero).
* **12. Reglas de negocio**: RN-006.1: Reinicio de las tablas semanales cada domingo a las 23:59 UTC.
* **13. Validaciones**: Caché sincronizado cada 60 segundos.
* **14. Datos de entrada**: `user_id`, `xp_delta`.
* **15. Datos de salida**: Posición en el ranking, lista del Top 100.
* **16. Permisos necesarios**: `leaderboard:view`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-005`.
* **19. Casos de uso relacionados**: `CU-006` (Consultar Leaderboard).
* **20. Consideraciones de seguridad**: Sanitización de nombres visibles en la tabla.
* **21. Riesgos**: Desmotivación en alumnos de puestos bajos (mitigado mediante divisiones por niveles).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Carga del ranking en < 200ms mediante Redis.

#### RF-007: Misiones y Retos Semanales
* **1. Identificador**: `RF-007` | **2. Nombre**: Retos y Desafíos Temporizados.
* **3. Objetivo**: Proponer misiones temporales que motivan la práctica de materias específicas.
* **4. Descripción**: Docentes o el sistema configuran misiones con tiempo límite que otorgan bonificaciones de experiencia (XP Boosters).
* **5. Problema que resuelve**: Monotonía en las rutinas de estudio diarias.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Misión activa en el calendario institucional.
* **8. Postcondiciones**: Bonificación de XP entregada al completar la misión.
* **9. Flujo principal**: 1. Aceptar reto -> 2. Resolver actividades -> 3. Completar al 100% -> 4. Recibir bonus de XP.
* **10. Flujos alternativos**: 10a. Retos grupales cooperativos entre compañeros de aula.
* **11. Flujos de excepción**: 11a. Expiración del plazo sin completar (la misión pasa a vencida sin otorgar bonus).
* **12. Reglas de negocio**: RN-007.1: Máximo 3 misiones activas simultáneas por alumno.
* **13. Validaciones**: Verificación de temporizadores en servidor.
* **14. Datos de entrada**: `quest_id`, avance de actividades.
* **15. Datos de salida**: Estado de la misión, XP acumulado.
* **16. Permisos necesarios**: `quests:participate`.
* **17. Prioridad**: 🟡 MEDIA.
* **18. Dependencias con otros RF**: `RF-005`.
* **19. Casos de uso relacionados**: `CU-007` (Completar Misión).
* **20. Consideraciones de seguridad**: Verificación estricta de marcas de tiempo en servidor.
* **21. Riesgos**: Sobrecarga de tareas (mitigado con límite de misiones activas).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Barra de progreso de la misión actualizada al instante.

---

### 💳 MÓDULO 3: PAGOS Y FACTURACIÓN

#### RF-008: Integración de Pagos de Matrículas (Stripe/PayPal)
* **1. Identificador**: `RF-008` | **2. Nombre**: Procesamiento de Pagos y Matrículas Online.
* **3. Objetivo**: Procesar cobros de matrículas, pensiones y cursos mediante Stripe, PayPal o medios digitales.
* **4. Descripción**: Permite a los padres o alumnos pagar inscripciones de forma segura con cobros automáticos o manuales.
* **5. Problema que resuelve**: Largas filas presenciales para el pago de pensiones y morosidad en el cobro.
* **6. Actor(es) involucrados**: Estudiante/Padre (`STUDENT_USER`/`PARENT_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Integración de pasarela activa en la institución.
* **8. Postcondiciones**: Pago procesado, matrícula activada y comprobante emitido.
* **9. Flujo principal**: 1. Seleccionar cuota -> 2. Ingresar medio de pago -> 3. Procesar cobro -> 4. Recibir Webhook -> 5. Emitir comprobante.
* **10. Flujos alternativos**: 10a. Registro de pago por transferencia bancaria offline con verificación de comprobante.
* **11. Flujos de excepción**: 11a. Transacción rechazada por el banco (solicita cambiar el medio de pago).
* **12. Reglas de negocio**: RN-008.1: Cumplimiento estricto PCI-DSS (no almacenar datos de tarjetas).
* **13. Validaciones**: Verificación de firmas criptográficas en Webhooks.
* **14. Datos de entrada**: `invoice_id`, token de tarjeta, datos de facturación.
* **15. Datos de salida**: `transaction_id`, estado del pago, recibo digital.
* **16. Permisos necesarios**: `payments:checkout`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: Ninguna.
* **19. Casos de uso relacionados**: `CU-008` (Pagar Matrícula/Pensión).
* **20. Consideraciones de seguridad**: Cifrado TLS 1.3 y tokens rotativos.
* **21. Riesgos**: Fallos en Webhooks que dejen matriculaciones sin activar (mitigado con conciliación automática nocturna).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Procesamiento del pago en < 3 segundos.

#### RF-009: Emisión de Recibos Digitales Automáticos
* **1. Identificador**: `RF-009` | **2. Nombre**: Generación de Comprobantes y Facturas Electrónicas.
* **3. Objetivo**: Emitir recibos y facturas digitales automáticas tras la confirmación de cada pago.
* **4. Descripción**: Genera comprobantes en PDF cifrados y archivos tributarios XML firmados, enviándolos al correo del usuario.
* **5. Problema que resuelve**: Trabajo manual de contabilidad en la emisión individual de facturas de pensiones.
* **6. Actor(es) involucrados**: Sistema (`SYSTEM`), Contador (`FINANCE_ADMIN`).
* **7. Precondiciones**: Pago aprobado en `RF-008`.
* **8. Postcondiciones**: Factura registrada y disponible para descarga en el perfil.
* **9. Flujo principal**: 1. Confirmar pago -> 2. Generar datos fiscales -> 3. Firmar XML -> 4. Generar PDF -> 5. Enviar por email.
* **10. Flujos alternativos**: 10a. Emisión de notas de crédito por anulaciones autorizadas.
* **11. Flujos de excepción**: 11a. Error de conexión con la entidad tributaria (alerta al equipo contable para reintento).
* **12. Reglas de negocio**: RN-009.1: Correlatividad numérica estricta en comprobantes emitidos.
* **13. Validaciones**: Formato tributario XML válido según norma del país.
* **14. Datos de entrada**: `transaction_id`, datos fiscales del pagador.
* **15. Datos de salida**: Comprobante PDF, XML firmado.
* **16. Permisos necesarios**: `invoices:issue`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-008`.
* **19. Casos de uso relacionados**: `CU-009` (Descargar Recibo Digital).
* **20. Consideraciones de seguridad**: Firma digital del colegio mediante certificado X.509.
* **21. Riesgos**: Cambios tributarios en la norma (mitigado con conectores desacoplados).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Comprobante disponible en menos de 5 segundos tras el pago.

#### RF-010: Recordatorios Automáticos de Pagos Pendientes
* **1. Identificador**: `RF-010` | **2. Nombre**: Sistema de Cobranza Preventiva y Recordatorios.
* **3. Objetivo**: Notificar automáticamente a los apoderados sobre vencimientos de cuotas de pensión.
* **4. Descripción**: Envía avisos automáticos por Email, WhatsApp y Push 7, 3 y 1 día antes de la fecha límite de pago.
* **5. Problema que resuelve**: Morosidad por olvidos no intencionados de los padres de familia.
* **6. Actor(es) involucrados**: Sistema (`SYSTEM`), Apoderado (`PARENT_USER`).
* **7. Precondiciones**: Calendario de cuotas configurado en el sistema.
* **8. Postcondiciones**: Aviso enviado y registrado en el historial de comunicación.
* **9. Flujo principal**: 1. Job nocturno analiza fechas -> 2. Detecta cuota próxima -> 3. Enviar aviso multicanal -> 4. Registrar envío.
* **10. Flujos alternativos**: 10a. Registro de compromiso de pago acordado con tesorería.
* **11. Flujos de excepción**: 11a. Falla de entrega en WhatsApp (deriva automáticamente el aviso a correo electrónico).
* **12. Reglas de negocio**: RN-010.1: No enviar más de 1 recordatorio por día al mismo usuario.
* **13. Validaciones**: Plantilla de mensaje con formato verificado.
* **14. Datos de entrada**: `invoice_id`, fecha de vencimiento.
* **15. Datos de salida**: Log de notificación enviada, link directo de pago.
* **16. Permisos necesarios**: `notifications:send_financial`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-008`.
* **19. Casos de uso relacionados**: `CU-010` (Gestionar Recordatorios de Pago).
* **20. Consideraciones de seguridad**: Links de pago temporales cifrados.
* **21. Riesgos**: Mensajes bloqueados como spam (mitigado con dominios autenticados SPF/DKIM).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Entrega efectiva del aviso en > 99% de los casos.

---

### 💬 MÓDULO 4: COMUNICACIÓN UNIFICADA

#### RF-011: Mensajería Directa Estudiante-Profesor
* **1. Identificador**: `RF-011` | **2. Nombre**: Chat Académico Supervisado.
* **3. Objetivo**: Proveer un canal de comunicación directo y seguro para resolver dudas de la asignatura.
* **4. Descripción**: Permite chats individuales o grupales por clase, adjuntar archivos y definir horarios docentes de atención.
* **5. Problema que resuelve**: Uso de redes personales no supervisadas (WhatsApp personal) para temas escolares.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`), Padre (`PARENT_USER`).
* **7. Precondiciones**: Relación académica activa en el periodo escolar.
* **8. Postcondiciones**: Mensajes registrados en el historial de la materia.
* **9. Flujo principal**: 1. Abrir chat -> 2. Escribir mensaje -> 3. Enviar vía WebSocket -> 4. Notificar recibo al destinatario.
* **10. Flujos alternativos**: 10a. Chat de grupo para toda la sección del aula.
* **11. Flujos de excepción**: 11a. Mensaje enviado fuera del horario de atención (queda en cola para el inicio de jornada).
* **12. Reglas de negocio**: RN-011.1: Prohibido el contacto directo no supervisado entre adultos y menores.
* **13. Validaciones**: Tamaño máximo de adjunto 20MB.
* **14. Datos de entrada**: `recipient_id`, cuerpo del mensaje, adjuntos.
* **15. Datos de salida**: `message_id`, marca de lectura.
* **16. Permisos necesarios**: `chat:send`, `chat:read`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: Ninguna.
* **19. Casos de uso relacionados**: `CU-011` (Enviar Mensaje Académico).
* **20. Consideraciones de seguridad**: Encriptación en tránsito y filtro automático de lenguaje inapropiado.
* **21. Riesgos**: Casos de ciberacoso (mitigado con moderación automática e botón de denuncia directo).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Latencia de entrega de mensaje en tiempo real < 100ms.

#### RF-012: Notificaciones Inteligentes Contextuales
* **1. Identificador**: `RF-012` | **2. Nombre**: Centro de Avisos Inteligentes.
* **3. Objetivo**: Notificar únicamente sobre eventos de alto valor, evitando la saturación de alertas.
* **4. Descripción**: Agrupa y prioriza notificaciones (notas publicadas, cambios de aula, tareas por vencer) según el perfil del usuario.
* **5. Problema que resuelve**: Desatención de avisos críticos causada por la sobrecarga de notificaciones.
* **6. Actor(es) involucrados**: Todos los usuarios del sistema.
* **7. Precondiciones**: Preferencias de notificación configuradas.
* **8. Postcondiciones**: Notificación registrada en la bandeja del centro de avisos.
* **9. Flujo principal**: 1. Evento del sistema -> 2. Evaluar prioridad -> 3. Agrupar similares -> 4. Despachar alerta.
* **10. Flujos alternativos**: 10a. Envió del resumen diario ("Daily Digest") por correo a las 7:00 AM.
* **11. Flujos de excepción**: 11a. Canal push no disponible (deriva la notificación al centro in-app).
* **12. Reglas de negocio**: RN-012.1: No enviar notificaciones push no urgentes entre las 22:00 y las 07:00 horas.
* **13. Validaciones**: Verificación de canales de comunicación activos.
* **14. Datos de entrada**: `user_id`, `event_type`, prioridad.
* **15. Datos de salida**: Estado de la notificación (enviada, leída).
* **16. Permisos necesarios**: `notifications:receive`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: Ninguna.
* **19. Casos de uso relacionados**: `CU-012` (Recibir Avisos Inteligentes).
* **20. Consideraciones de seguridad**: Tokens Push (FCM/APNS) rotados de forma segura.
* **21. Riesgos**: Bloqueo de notificaciones por el teléfono (mitigado con avisos in-app al abrir la App).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Agrupación inteligente de más de 5 avisos en 1 sola notificación resumen.

#### RF-013: Anuncios Institucionales Segmentados
* **1. Identificador**: `RF-013` | **2. Nombre**: Emisión de Circulares y Anuncios Oficiales.
* **3. Objetivo**: Difundir comunicados oficiales dirigidos a segmentos específicos con confirmación de lectura.
* **4. Descripción**: Permite a los directivos publicar circulares (ej: "Solo Padres de 3er Grado") exigiendo acuse de recibo obligatorio.
* **5. Problema que resuelve**: Incertidumbre sobre si los padres leyeron o no las circulares importantes.
* **6. Actor(es) involucrados**: Director (`DIRECTOR_USER`), Apoderado (`PARENT_USER`).
* **7. Precondiciones**: Rol con atribución de emisión de comunicados institucionales.
* **8. Postcondiciones**: Comunicado distribuido y registrado en la bitácora de lectura.
* **9. Flujo principal**: 1. Redactar comunicado -> 2. Seleccionar segmento -> 3. Exigir acuse de recibo -> 4. Publicar -> 5. Monitorear lecturas.
* **10. Flujos alternativos**: 10a. Programación de publicación para una fecha futura.
* **11. Flujos de excepción**: 11a. Anulación de circular por error (se retira de las bandejas e informa el motivo).
* **12. Reglas de negocio**: RN-013.1: Las circulares con acuse obligatorio bloquean otras pantallas hasta ser confirmadas.
* **13. Validaciones**: Verificación de destinatarios válidos (> 0 usuarios).
* **14. Datos de entrada**: Título, cuerpo, adjunto PDF, filtro de destinatarios.
* **15. Datos de salida**: `announcement_id`, porcentaje de lecturas confirmadas.
* **16. Permisos necesarios**: `announcement:broadcast`.
* **17. Prioridad**: 🟡 MEDIA.
* **18. Dependencias con otros RF**: Ninguna.
* **19. Casos de uso relacionados**: `CU-013` (Publicar Circular Oficial).
* **20. Consideraciones de seguridad**: Firma digital de la autoridad en el documento adjunto.
* **21. Riesgos**: Emisión por error a segmentos equivocados (mitigado con confirmación en 2 pasos antes de enviar).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Publicación masiva a 5,000 usuarios en < 2 segundos.

---

### 📊 MÓDULO 5: REPORTES Y ANALYTICS

#### RF-014: Generación de Actas y Libretas 1-Click
* **1. Identificador**: `RF-014` | **2. Nombre**: Generador de Boletines de Notas y Actas Oficiales.
* **3. Objetivo**: Emitir libretas de calificaciones y actas oficiales en PDF/Excel con 1 solo clic.
* **4. Descripción**: Procesa las calificaciones del periodo, aplica fórmulas de promedio institucional y genera boletines listos para entrega.
* **5. Problema que resuelve**: Demoras de semanas confeccionando libretas de notas manualmente al cierre de periodo.
* **6. Actor(es) involucrados**: Coordinador (`ACADEMIC_ADMIN`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Calificaciones del periodo ingresadas y cerradas.
* **8. Postcondiciones**: Documento de libreta o acta generado e ingresado al expediente.
* **9. Flujo principal**: 1. Elegir grado/sección -> 2. Clic "Generar Libretas" -> 3. Procesar promedios -> 4. Descargar paquete en ZIP/PDF.
* **10. Flujos alternativos**: 10a. Envío automático masivo de las libretas en PDF a los correos de los apoderados.
* **11. Flujos de excepción**: 11a. Estudiante con notas incompletas (marca el boletín como `NOTAS_PENDIENTES` e impide el cierre de acta).
* **12. Reglas de negocio**: RN-014.1: Una vez cerrada el acta oficial, las notas son inmutables sin resolución directiva.
* **13. Validaciones**: Verificación del rango de notas según la escala oficial del ministerio de educación.
* **14. Datos de entrada**: `section_id`, `period_id`, formato de salida.
* **15. Datos de salida**: Libretas de notas en PDF, acta oficial en Excel.
* **16. Permisos necesarios**: `reports:generate_report_cards`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-004`.
* **19. Casos de uso relacionados**: `CU-014` (Generar Libretas de Notas).
* **20. Consideraciones de seguridad**: Marca de agua digital e identificador de verificación QR en cada libreta.
* **21. Riesgos**: Inconsistencias en promedios por error en fórmulas (mitigado con motor de cálculo estandarizado con unit tests).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Generación de 300 libretas individuales en PDF en menos de 8 segundos.

#### RF-015: Dashboard Holístico 360° del Estudiante
* **1. Identificador**: `RF-015` | **2. Nombre**: Panel 360° de Rendimiento y Desarrollo del Alumno.
* **3. Objetivo**: Visualizar en una sola pantalla la salud académica, asistencia, conducta y desarrollo del estudiante.
* **4. Descripción**: Ofrece gráficos intuitivos de evolución de notas, mapa de competencias, porcentaje de asistencia y observaciones de tutores.
* **5. Problema que resuelve**: Información dispersa del alumno entre múltiples profesores sin una visión integral.
* **6. Actor(es) involucrados**: Apoderado (`PARENT_USER`), Estudiante (`STUDENT_USER`), Tutor (`TUTOR_USER`).
* **7. Precondiciones**: Relación tutor/alumno verificada en el sistema.
* **8. Postcondiciones**: Muestra del panel 360° actualizado en tiempo real.
* **9. Flujo principal**: 1. Entrar al perfil del estudiante -> 2. Cargar indicadores 360° -> 3. Mostrar gráficos de radar y promedios -> 4. Explorar por materia.
* **10. Flujos alternativos**: 10a. Comparativa anónima de la evolución del alumno con el promedio del grupo.
* **11. Flujos de excepción**: 11a. Falta de notas por inicio de año (muestra mensaje de periodo sin datos acumulados).
* **12. Reglas de negocio**: RN-015.1: Los padres solo pueden visualizar el Dashboard de sus hijos directos.
* **13. Validaciones**: Verificación de permisos de parentesco mediante RLS.
* **14. Datos de entrada**: `student_id`.
* **15. Datos de salida**: Vista interactiva con gráficos de radar de competencias, promedios e historial de asistencia.
* **16. Permisos necesarios**: `dashboard:view_student_360`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-004`, `RF-011`.
* **19. Casos de uso relacionados**: `CU-015` (Ver Dashboard 360).
* **20. Consideraciones de seguridad**: Aislamiento a nivel de filas (RLS) en la base de datos.
* **21. Riesgos**: Mala interpretación de gráficos por los padres (mitigado con leyendas explicativas en lenguaje sencillo).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Renderizado completo del panel en menos de 1 segundo.

#### RF-016: Predictor de Riesgo de Abandono (Early Warning System)
* **1. Identificador**: `RF-016` | **2. Nombre**: Motor Predictivo de Deserción Escolar (EWS).
* **3. Objetivo**: Identificar alumnos con riesgo de deserción o reprobación con al menos 30 días de anticipación.
* **4. Descripción**: Algoritmo de ML que cruza asistencia, bajas bruscas de notas, falta de tareas y mensajes en foros para calcular la probabilidad de riesgo y sugerir planes de acción.
* **5. Problema que resuelve**: Detección tardía de estudiantes con problemas cuando la deserción ya es inevitable.
* **6. Actor(es) involucrados**: Coordinador (`ACADEMIC_ADMIN`), Psicopedagogo (`PSYCHO_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Datos de comportamiento del alumno acumulados por al menos 14 días.
* **8. Postcondiciones**: Alumno clasificado (`RIESGO_BAJO`, `RIESGO_MEDIO`, `RIESGO_ALTO`) e ingresado al flujo de acompañamiento.
* **9. Flujo principal**: 1. Algoritmo analiza variables de conducta -> 2. Calcula probabilidad de deserción -> 3. Si Riesgo > 70%, marca al estudiante -> 4. Notifica al departamento psicopedagógico.
* **10. Flujos alternativos**: 10a. Asignación automática de una cita con el tutor pedagógico.
* **11. Flujos de excepción**: 11a. Datos insuficientes para predecir (mantiene estado `EVALUACIÓN_PENDIENTE`).
* **12. Reglas de negocio**: RN-016.1: Las alertas de alto riesgo son confidenciales para el equipo directivo y psicopedagógico.
* **13. Validaciones**: Modelo predictivo con precisión comprobada > 85%.
* **14. Datos de entrada**: Registros de asistencia, notas parciales, entregas a tiempo, pings de sesión.
* **15. Datos de salida**: Risk Score (0.0 a 1.0), causas del riesgo, plan de intervención sugerido.
* **16. Permisos necesarios**: `ews:view_risk_alerts`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-004`, `RF-011`.
* **19. Casos de uso relacionados**: `CU-016` (Gestionar Alertas EWS).
* **20. Consideraciones de seguridad**: Encriptación de perfiles psicopedagógicos.
* **21. Riesgos**: Estigmatización del estudiante (mitigado restrictiendo el acceso a las alertas solo al personal autorizado).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Predicción correcta de al menos 8 de cada 10 casos de deserción en pruebas de validación.

---

### ⚙️ MÓDULO 6: AUTOMATIZACIÓN ADMINISTRATIVA

#### RF-017: Firma Digital de Contratos Educativos (DocuSign)
* **1. Identificador**: `RF-017` | **2. Nombre**: Contratación y Firma Digital de Matrículas.
* **3. Objetivo**: Automatizar la suscripción legal de matrículas y compromisos escolares sin necesidad de papel.
* **4. Descripción**: Integra proveedores de firma digital (DocuSign, Adobe Sign, u eIDAS) para enviar, firmar y certificar contratos con plena validez legal.
* **5. Problema que resuelve**: Semanas de retraso recolectando firmas físicas de matrículas de los padres.
* **6. Actor(es) involucrados**: Apoderado (`PARENT_USER`), Administrador (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: Contrato educativo generado en el sistema.
* **8. Postcondiciones**: Contrato firmado con certificado digital, sello de tiempo y archivado en PDF/A.
* **9. Flujo principal**: 1. Generar contrato -> 2. Enviar enlace de firma -> 3. Autenticar apoderado con OTP -> 4. Estampar firma -> 5. Archivar copia firmada.
* **10. Flujos alternativos**: 10a. Firma presencial en pantalla táctil de tablet en la oficina de admisión.
* **11. Flujos de excepción**: 11a. Enlace de firma vencido (re-emisión automática del enlace al solicitarlo).
* **12. Reglas de negocio**: RN-017.1: El contrato firmado debe guardarse en formato PDF/A inalterable.
* **13. Validaciones**: Verificación de identidad mediante documento oficial y OTP recibido al teléfono del apoderado.
* **14. Datos de entrada**: Documento contrato base, datos del firmante, teléfono.
* **15. Datos de salida**: Contrato PDF/A firmado digitalmente, hoja de auditoría de firma.
* **16. Permisos necesarios**: `documents:sign`, `admin:contracts`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados**: `CU-017` (Firmar Contrato Educativo).
* **20. Consideraciones de seguridad**: Cumplimiento de normativas eIDAS y firma digital legal.
* **21. Riesgos**: Impugnación por suplantación (mitigado con autenticación multifactor en la firma).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Proceso de firma desde smartphone completado en < 1 minuto.

#### RF-018: Sincronización ERP Contable
* **1. Identificador**: `RF-018` | **2. Nombre**: Integración con ERPs y Sistemas Contables.
* **3. Objetivo**: Sincronizar automáticamente matrículas, cobros de pensiones y notas con sistemas ERP externos (SAP, Oracle, QuickBooks).
* **4. Descripción**: Conectores API REST y Webhooks para mantener sincronizada la contabilidad de la institución en tiempo real.
* **5. Problema que resuelve**: Digitación manual duplicada de cobros e ingresos en el sistema contable.
* **6. Actor(es) involucrados**: Sistema (`SYSTEM`), Contador (`FINANCE_ADMIN`).
* **7. Precondiciones**: Credenciales de API del ERP externo validadas.
* **8. Postcondiciones**: Transacciones financieras reflejadas correctamente en el ERP.
* **9. Flujo principal**: 1. Evento de pago aprobado -> 2. Transformar formato -> 3. Enviar a API ERP -> 4. Confirmar recepción.
* **10. Flujos alternativos**: 10a. Sincronización nocturna en lote (Batch) para altos volúmenes de datos.
* **11. Flujos de excepción**: 11a. Servidor ERP no responde (encola los eventos y reintenta con respaldo exponencial).
* **12. Reglas de negocio**: RN-018.1: Garantía estricta de idempotencia para evitar duplicar asientos contables.
* **13. Validaciones**: Verificación de la estructura de datos del ERP externo.
* **14. Datos de entrada**: Transacciones de pago, notas, datos del cliente.
* **15. Datos de salida**: Logs de sincronización, ID de asiento en el ERP.
* **16. Permisos necesarios**: `integration:manage_erp`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-008`, `RF-014`.
* **19. Casos de uso relacionados**: `CU-018` (Sincronizar con ERP).
* **20. Consideraciones de seguridad**: Comunicaciones cifradas con OAuth 2.0 y claves en Vault.
* **21. Riesgos**: Descalce de saldos por caídas de red (mitigado con conciliación automática diaria).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Sincronización de eventos en tiempo real en < 2 segundos.

#### RF-019: Exportación Universal de Datos
* **1. Identificador**: `RF-019` | **2. Nombre**: Exportador Multiformato de Información (XLSX, PDF, CSV, JSON).
* **3. Objetivo**: Permitir exportar cualquier vista de datos o reporte a archivos estándar para análisis externo.
* **4. Descripción**: Motor de reportes personalizable que permite seleccionar columnas, filtros y formatos sin ralentizar la base de datos principal.
* **5. Problema que resuelve**: Rigidez en los reportes estáticos predefinidos que no se adaptan a las necesidades del colegio.
* **6. Actor(es) involucrados**: Administrador (`ACADEMIC_ADMIN`), Coordinador (`COORDINATOR_USER`).
* **7. Precondiciones**: Datos cargados en pantalla según los permisos del usuario.
* **8. Postcondiciones**: Archivo generado y descargado en la computadora del usuario.
* **9. Flujo principal**: 1. Filtrar lista -> 2. Clic "Exportar" -> 3. Elegir formato -> 4. Descargar archivo.
* **10. Flujos alternativos**: 10a. Procesamiento asíncrono en segundo plano con notificación por correo para archivos grandes.
* **11. Flujos de excepción**: 11a. Consulta que excede las 100,000 filas (fuerza la exportación asíncrona en segundo plano).
* **12. Reglas de negocio**: RN-019.1: Las exportaciones respetan estrictamente los permisos RLS del usuario.
* **13. Validaciones**: Verificación del tamaño del conjunto de datos antes de exportar.
* **14. Datos de entrada**: Filtros aplicados, formato elegido.
* **15. Datos de salida**: Archivo descargable (.xlsx, .pdf, .csv, .json).
* **16. Permisos necesarios**: `data:export`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: Ninguna.
* **19. Casos de uso relacionados**: `CU-019` (Exportar Datos).
* **20. Consideraciones de seguridad**: Bitácora de auditoría obligatoria por cada exportación para prevenir fugas de información.
* **21. Riesgos**: Exfiltración de datos por descargas masivas (mitigado con límites de frecuencia y alertas por volumen).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Generación de un archivo Excel con 10,000 filas en < 3 segundos.

---

### 🔒 MÓDULO 7: SEGURIDAD Y COMPLIANCE

#### RF-020: Cumplimiento GDPR / FERPA y Encriptación AES-256
* **1. Identificador**: `RF-020`
* **2. Nombre**: Protección de Privacidad y Cumplimiento Normativo Educativo.
* **3. Objetivo**: Garantizar el cumplimiento estricto de las normativas de protección de datos personales de menores (GDPR / FERPA).
* **4. Descripción**: Cifra datos sensibles en reposo con AES-256, gestiona el consentimiento de los padres, anonimiza datos para analítica y tramita solicitudes de portabilidad y eliminación.
* **5. Problema que resuelve**: Riesgo de sanciones legales severas y demandas por brechas de privacidad de menores.
* **6. Actor(es) involucrados**: Oficial de Privacidad (`PRIVACY_OFFICER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Políticas de privacidad configuradas en la plataforma.
* **8. Postcondiciones**: Datos cifrados y registros de consentimiento verificables.
* **9. Flujo principal**: 1. Apoderado acepta políticas -> 2. Registrar consentimiento firmado -> 3. Cifrar datos -> 4. Permitir revocación.
* **10. Flujos alternativos**: 10a. Tramitación de solicitudes de "Derecho al Olvido" mediante anonimización irrecuperable.
* **11. Flujos de excepción**: 11a. Solicitud de borrado de registros que por ley tributaria u oficial deben conservarse X años (se anonimizan parcialmente sin borrar el registro oficial).
* **12. Reglas de negocio**: RN-020.1: Prohibida la venta o comercialización de datos de estudiantes a terceros.
* **13. Validaciones**: Verificación de firmas de cifrado y hashes de integridad.
* **14. Datos de entrada**: Solicitud de consentimiento, peticiones de privacidad.
* **15. Datos de salida**: Log de cumplimiento, datos cifrados.
* **16. Permisos necesarios**: `privacy:manage`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: Ninguna (Gobernanza global).
* **19. Casos de uso relacionados**: `CU-020` (Gestionar Privacidad de Datos).
* **20. Consideraciones de seguridad**: Llaves de cifrado gestionadas y rotadas en KMS.
* **21. Riesgos**: Brechas de seguridad de datos (mitigado con auditorías de penetración continuas).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Cumplimiento comprobado del 100% de los requisitos del checklist auditor de FERPA/GDPR.

---

## 🟣 TIER 2: REQUISITOS PRO-LEVEL (RF-021 A RF-042)

---

### 🤖 MÓDULO 8: AUTONOMOUS EDUCATION ENGINE ("TESLA MOMENT")

#### RF-021: Early Warning System (EWS) Proactivo
* **1. Identificador**: `RF-021` | **2. Nombre**: Alerta Temprana Autónoma con Plan de Acción Sugerido.
* **3. Objetivo**: Detectar patrones de riesgo cruzando logins, velocidad de lectura, tono en foros y notas, sugiriendo planes de acción listos para el tutor.
* **4. Descripción**: Algoritmo predictivo que no solo detecta el riesgo, sino que genera e inicia sugerencias de intervención inmediata para el tutor (mejorando un 30% la efectividad manual).
* **5. Problema que resuelve**: Reacción tardía cuando el alumno ya ha decidido abandonar el colegio o universidad.
* **6. Actor(es) involucrados**: Sistema IA (`AI_ENGINE`), Tutor (`TUTOR_USER`).
* **7. Precondiciones**: Datos de conducta del alumno acumulados por más de 7 días.
* **8. Postcondiciones**: Alerta y plan de acción sugerido asignado al tutor en 1 clic.
* **9. Flujo principal**: 1. IA analiza micro-interacciones -> 2. Detecta anomalía en velocidad y notas -> 3. Genera recomendación -> 4. Presenta plan listo para aprobar al tutor.
* **10. Flujos alternativos**: 10a. Envió automático de un mensaje de apoyo al estudiante generado por IA si el riesgo es leve.
* **11. Flujos de excepción**: 11a. Falso positivo corregido por el tutor (re-entrena al modelo para ajustar la precisión).
* **12. Reglas de negocio**: RN-021.1: Prioridad absoluta a las alertas de alumnos en situación vulnerable o becados.
* **13. Validaciones**: Precisión del modelo predictivo EWS > 88%.
* **14. Datos de entrada**: Logs de lectura, pausas en video, tono en foros, notas.
* **15. Datos de salida**: Score de alerta, causas del riesgo, plantilla de intervención lista.
* **16. Permisos necesarios**: `ews:view_alerts`, `ews:execute_action`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-016`, `RF-025`.
* **19. Casos de uso relacionados**: `CU-021` (Ejecutar Intervención EWS).
* **20. Consideraciones de seguridad**: Confidencialidad de las alertas psicopedagógicas.
* **21. Riesgos**: Sobrecarga de alertas al tutor (mitigado con agrupación por nivel de urgencia).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Alerta generada en menos de 1 hora de detectada la variación de conducta.

#### RF-022: Dynamic Pathing (IA Adaptativa Mejorada)
* **1. Identificador**: `RF-022` | **2. Nombre**: Re-configurador de Temarios en Tiempo Real.
* **3. Objetivo**: Reestructurar la secuencia de lecciones en tiempo real según el dominio demostrado por el estudiante.
* **4. Descripción**: Si el alumno domina un tema, el sistema salta automáticamente los contenidos introductorios (ahorrando 30% de tiempo). Si falla, inserta refuerzos previos antes de dejarlo avanzar.
* **5. Problema que resuelve**: Pérdida de tiempo en temas ya sabidos o lagunas conceptuales que impiden aprender temas complejos.
* **6. Actor(es) involucrados**: Sistema IA (`AI_ENGINE`), Estudiante (`STUDENT_USER`).
* **7. Precondiciones**: Grafo de conceptos del curso cargado en el sistema.
* **8. Postcondiciones**: Temario individual del alumno reajustado en tiempo real.
* **9. Flujo principal**: 1. Evaluar test del estudiante -> 2. Consultar grafo de conocimiento -> 3. Determinar nivel de dominio -> 4. Ocultar o añadir temas -> 5. Mostrar siguiente paso.
* **10. Flujos alternativos**: 10a. Examen de suficiencia voluntario rendido por el alumno para eximirse de un módulo completo.
* **11. Flujos de excepción**: 11a. Grafo de conceptos inconsistente (recae en la secuencia lineal por defecto).
* **12. Reglas de negocio**: RN-022.1: Prohibido saltar temas catalogados como obligatorios por el ministerio oficial.
* **13. Validaciones**: Verificación de consistencia en el grafo acíclico (DAG).
* **14. Entradas**: Resultados de test adaptativo, historial de intentos.
* **15. Datos de salida**: Secuencia de lecciones personalizada, estimación de tiempo de término.
* **16. Permisos necesarios**: `learning:dynamic_path`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-002`, `RF-026`.
* **19. Casos de uso relacionados**: `CU-022` (Navegar Ruta Dinámica).
* **20. Consideraciones de seguridad**: Protección contra manipulación de peticiones API para saltar contenidos.
* **21. Riesgos**: Desorientación del alumno por cambios frecuentes en el temario (mitigado con un mapa visual claro de avance).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Reajuste de la malla en menos de 500ms tras completar el test.

#### RF-023: Copiloto Docente Autónomo
* **1. Identificador**: `RF-023` | **2. Nombre**: Asistente de IA para Automatización Docente.
* **3. Objetivo**: Reducir el tiempo de trabajo administrativo del profesor de 2 horas a 2 minutos por lección.
* **4. Descripción**: Genera borradores de feedback personalizado para cada tarea, propone rúbricas, crea exámenes únicos para evitar copias y entrega resúmenes de los puntos ciegos del grupo.
* **5. Problema que resuelve**: Sobrecarga de trabajo docente en tareas repetitivas de corrección.
* **6. Actor(es) involucrados**: Profesor (`TEACHER_USER`), Sistema IA (`AI_ENGINE`).
* **7. Precondiciones**: Tareas entregadas por los alumnos o contenido de lección cargado.
* **8. Postcondiciones**: Borradores de corrección y exámenes generados listos para aprobación docente.
* **9. Flujo principal**: 1. Profesor entra a corregir -> 2. Copiloto presenta borrador de feedback por alumno -> 3. Profesor revisa y ajusta -> 4. Aprobar en 1 clic -> 5. Enviar notas.
* **10. Flujos alternativos**: 10a. Generación de 30 versiones de un examen con el mismo nivel de dificultad para evitar copias.
* **11. Flujos de excepción**: 11a. Feedback generado no satisface al profesor (permite re-generar especificando el enfoque deseado).
* **12. Reglas de negocio**: RN-023.1: La calificación final siempre exige la confirmación del docente humano (Human-in-the-loop).
* **13. Validaciones**: Evaluación de la coherencia del feedback con la rúbrica oficial.
* **14. Datos de entrada**: Tarea del estudiante, rúbrica, indicaciones del profesor.
* **15. Datos de salida**: Borrador de comentarios, propuesta de nota, resumen de fallas comunes de la clase.
* **16. Permisos necesarios**: `copilot:access_teacher`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-004`.
* **19. Casos de uso relacionados**: `CU-023` (Usar Copiloto Docente).
* **20. Consideraciones de seguridad**: Modelos de IA privados que no entrenan con las tareas de los alumnos.
* **21. Riesgos**: Dependencia excesiva del profesor sin revisar sugerencias (mitigado con auditorías aleatorias).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Generación del borrador de feedback para 30 tareas en < 10 segundos.

#### RF-024: Ajuste de Carga Cognitiva Automático
* **1. Identificador**: `RF-024` | **2. Nombre**: Sensor y Balanceador de Fatiga Mental del Alumno.
* **3. Objetivo**: Prevenir el burnout y el abandono detectando fatiga cognitiva y ajustando la exigencia temporalmente.
* **4. Descripción**: Analiza la velocidad de clics, pausas largas y aumento de errores inusuales. Si detecta fatiga, sugiere descansos, cambia el formato (texto a audio) o propone aplazar entregas.
* **5. Problema que resuelve**: Deserción por estrés y acumulación excesiva de trabajos.
* **6. Actor(es) involucrados**: Sistema IA (`AI_ENGINE`), Estudiante (`STUDENT_USER`).
* **7. Precondiciones**: Sesión de estudio activa con recopilación de métricas de interacción.
* **8. Postcondiciones**: Recomendación de descanso emitida y ajustes de formato sugeridos.
* **9. Flujo principal**: 1. Detectar aumento anómalo de errores y pausas -> 2. Inferir fatiga alta -> 3. Sugerir pausa activa -> 4. Cambiar formato de la siguiente lección a audio.
* **10. Flujos alternativos**: 10a. Notificación al profesor sugiriendo postergar 24h la entrega de la clase si la fatiga es colectiva.
* **11. Flujos de excepción**: 11a. El estudiante ignora la sugerencia y continúa (el sistema registra la decisión y monitorea la tasa de error).
* **12. Reglas de negocio**: RN-024.1: No modificar fechas de exámenes oficiales sin aprobación administrativa.
* **13. Validaciones**: Algoritmo de detección de patrones de fatiga verificado.
* **14. Datos de entrada**: Tiempos entre clics, permanencia por lámina, tasa de error en los últimos 15 min.
* **15. Datos de salida**: Indicador de Carga Cognitiva (`ÓPTIMO`, `FATIGA`), recomendación de pausa.
* **16. Permisos necesarios**: `learning:cognitive_balance`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-003`, `RF-025`.
* **19. Casos de uso relacionados**: `CU-024` (Ajustar Carga Cognitiva).
* **20. Consideraciones de seguridad**: Protección de datos biométricos de interacción.
* **21. Riesgos**: Falsos positivos por distracciones externas (mitigado evaluando ventanas de 15 min).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Reducción del 40% en abandonos por sobrecarga en pruebas de campo.

---

### 🧠 MÓDULO 9: DATA MOAT (INTELEGENCIA PROPIETARIA)

#### RF-025: Captura de Micro-Interacciones (Behavioral Analytics)
* **1. Identificador**: `RF-025` | **2. Nombre**: Recopilador de Telemetría Comportamental Fina.
* **3. Objetivo**: Registrar el "cómo" aprende el estudiante capturando 500+ datapoints por usuario al año para construir el Data Moat.
* **4. Descripción**: Registra eventos finos: trayectoria del cursor por pregunta, revisiones antes de enviar, segundo exacto de pausa en video y velocidad de lectura por párrafo.
* **5. Problema que resuelve**: Falta de visibilidad sobre los procesos de pensamiento del alumno más allá de la nota final.
* **6. Actor(es) involucrados**: Sistema (`SYSTEM`).
* **7. Precondiciones**: Consentimiento de telemetría activa en el perfil.
* **8. Postcondiciones**: Eventos almacenados en la base de datos analítica orientada a columnas (ClickHouse / BigQuery).
* **9. Flujo principal**: 1. Usuario interactúa -> 2. SDK de telemetría encola micro-eventos -> 3. Enviar en lotes cada 5s -> 4. Ingestar en el Data Lake.
* **10. Flujos alternativos**: 10a. Respaldo local temporal si el estudiante pierde la conexión.
* **11. Flujos de excepción**: 11a. Error al enviar lote (reintenta con respaldo exponencial sin perder eventos).
* **12. Reglas de negocio**: RN-025.1: La telemetría no debe ralentizar la velocidad de la interfaz en el cliente.
* **13. Validaciones**: Formato JSON-LD estructurado por evento.
* **14. Datos de entrada**: Movimientos de cursor, eventos de teclado, pings de tiempo en video, scroll.
* **15. Datos de salida**: Logs de telemetría procesados para los modelos de IA.
* **16. Permisos necesarios**: `telemetry:collect`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: Ninguna (Infraestructura).
* **19. Casos de uso relacionados**: `CU-025` (Capturar Telemetría).
* **20. Consideraciones de seguridad**: Pseudonimización de IPs y datos personales antes del análisis.
* **21. Riesgos**: Volumen masivo de datos de almacenamiento (mitigado con políticas de compresión de logs).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Ingesta de 10,000 eventos/segundo con uso de CPU en el cliente < 2%.

#### RF-026: Grafos de Conocimiento Institucional (Knowledge Graph)
* **1. Identificador**: `RF-026` | **2. Nombre**: Motor de Grafos de Relación Concepto-Habilidad-Empleo.
* **3. Objetivo**: Mapear relaciones entre conceptos enseñados, habilidades desarrolladas y éxito laboral posterior.
* **4. Descripción**: Construye un Grafo de Conocimiento (Neo4j) que conecta lecciones con competencias demandadas en la industria, prediciendo el potencial del estudiante con 85% de precisión.
* **5. Problema que resuelve**: Brecha entre los contenidos académicos enseñados y las habilidades requeridas por las empresas.
* **6. Actor(es) involucrados**: Sistema IA (`AI_ENGINE`), Diseñador Curricular (`CURRICULUM_DESIGNER`).
* **7. Precondiciones**: Contenidos etiquetados con conceptos clave.
* **8. Postcondiciones**: Grafo de conocimiento actualizado con pesos calculados por resultados reales.
* **9. Flujo principal**: 1. Ingestar mallas -> 2. Extraer conceptos -> 3. Construir nodos y aristas -> 4. Calcular rutas óptimas de aprendizaje.
* **10. Flujos alternativos**: 10a. Actualización del grafo con datos de ofertas de empleo reales para priorizar habilidades.
* **11. Flujos de excepción**: 11a. Detección de conceptos desconectados (alerta al diseñador curricular para revisar la malla).
* **12. Reglas de negocio**: RN-026.1: Cada concepto debe estar vinculado al menos a una competencia laboral verificable.
* **13. Validaciones**: Integridad referencial en la base de datos de grafos.
* **14. Datos de entrada**: Estructuras de cursos, resultados de quizes, datos de empleabilidad de egresados.
* **15. Datos de salida**: Grafo visual interactivo, rutas de aprendizaje recomendadas.
* **16. Permisos necesarios**: `knowledge_graph:manage`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias con otros RF**: `RF-001`, `RF-025`.
* **19. Casos de uso relacionados**: `CU-026` (Consultar Grafo de Conocimiento).
* **20. Consideraciones de seguridad**: Cifrado de las relaciones para proteger la propiedad intelectual curricular.
* **21. Riesgos**: Grafos demasiado complejos (mitigado con filtros de visualización por capas).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Consulta de rutas en el grafo resueltas en < 100ms.

#### RF-027: Federated Learning (Entrenamiento Privado Distribuido)
* **1. Identificador**: `RF-027` | **2. Nombre**: Motor de Aprendizaje Federado para Privacidad de Datos.
* **3. Objetivo**: Entrenar modelos de IA compartiendo aprendizajes entre instituciones sin centralizar ni exponer datos sensibles de los alumnos.
* **4. Descripción**: Permite entrenar modelos locales en cada tenant y enviar únicamente los ajustes de pesos cifrados al servidor central.
* **5. Problema que resuelve**: Barreras legales de privacidad (GDPR/FERPA) que impiden compartir datos personales de estudiantes entre instituciones.
* **6. Actor(es) involucrados**: Sistema IA (`AI_ENGINE`), Oficial de Privacidad (`PRIVACY_OFFICER`).
* **7. Precondiciones**: Instancias del tenant configuradas para entrenamiento local.
* **8. Postcondiciones**: Modelo global de IA mejorado sin haber transferido un solo registro personal fuera del tenant.
* **9. Flujo principal**: 1. Enviar modelo base a tenants -> 2. Entrenar localmente -> 3. Cifrar ajustes de pesos -> 4. Agregar pesos globales (FedAvg) -> 5. Desplegar modelo mejorado.
* **10. Flujos alternativos**: 10a. Ajuste fino local (Fine-Tuning) para adaptar el modelo a modismos culturales de una región.
* **11. Flujos de excepción**: 11a. Intento de envenenamiento de modelo (Model Poisoning) detectado (descarta los pesos del tenant malicioso).
* **12. Reglas de negocio**: RN-027.1: Las actualizaciones deben cumplir con Privacidad Diferencial ($\epsilon$-differential privacy).
* **13. Validaciones**: Verificación de la convergencia del modelo agregado.
* **14. Datos de entrada**: Modelos locales, gradientes cifrados.
* **15. Datos de salida**: Modelo de IA global optimizado.
* **16. Permisos necesarios**: `ai:federated_training`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-020`, `RF-026`.
* **19. Casos de uso relacionados**: `CU-027` (Ejecutar Entrenamiento Federado).
* **20. Consideraciones de seguridad**: Cifrado homomórfico y agregación segura MPC.
* **21. Riesgos**: Divergencia del modelo por datos dispares (mitigado con algoritmos de agregación robustos).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Imposibilidad matemática comprobada de reconstruir datos originales desde los pesos.

---

### 🌐 MÓDULO 10: NETWORK EFFECTS Y MERCADOS EDUCATIVOS

#### RF-028: Marketplace P2P de Tutorías entre Estudiantes
* **1. Identificador**: `RF-028` | **2. Nombre**: Mercado Inter-Institucional de Tutorías entre Pares.
* **3. Objetivo**: Emparejar automáticamente a alumnos destacados en una materia con estudiantes de otra sede que necesitan apoyo.
* **4. Descripción**: Algoritmo de matching que conecta tutores y alumnos por horarios, estilo cognitivo e idioma, gestionando la entrega de puntos o créditos.
* **5. Problema que resuelve**: Falta de tutores disponibles en colegios pequeños y alto costo de clases particulares.
* **6. Actor(es) involucrados**: Estudiante Tutor (`TUTOR_STUDENT`), Estudiante Alumno (`LEARNER_STUDENT`), Sistema (`SYSTEM`).
* **7. Precondiciones**: El tutor debe haber aprobado la materia con nota destacada (Top 10%).
* **8. Postcondiciones**: Sesión de tutoría agendada, sala virtual creada y créditos transferidos.
* **9. Flujo principal**: 1. Alumno solicita tutoría -> 2. IA busca tutores destacados disponibles -> 3. Conectar y agendar -> 4. Realizar clase en vivo -> 5. Calificar la sesión.
* **10. Flujos alternativos**: 10a. Tutorías gratuitas recompensadas con tokens educativos del sistema.
* **11. Flujos de excepción**: 11a. Inasistencia del tutor (reembolsa créditos y aplica sanción en su perfil de reputación).
* **12. Reglas de negocio**: RN-028.1: La plataforma cobra una comisión del 20% en tutorías pagadas con créditos canjeables.
* **13. Validaciones**: Verificación del expediente académico del tutor antes de autorizarlo.
* **14. Datos de entrada**: Tema de apoyo solicitado, disponibilidad de horario.
* **15. Datos de salida**: Enlace a la videoconferencia, transferencia de créditos.
* **16. Permisos necesarios**: `tutoring:offer`, `tutoring:request`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-008`, `RF-010`.
* **19. Casos de uso relacionados**: `CU-028` (Agendar Tutoría P2P).
* **20. Consideraciones de seguridad**: Grabación y supervisión por IA de las video-clases para evitar lenguaje inapropiado.
* **21. Riesgos**: Tutorías de baja calidad (mitigado con sistema de calificación obligatorio de 1 a 5 estrellas).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Emparejamiento de tutoría disponible en menos de 30 segundos.

#### RF-029: Repositorio de Contenido Optimizado ("Pinterest Educativo")
* **1. Identificador**: `RF-029` | **2. Nombre**: Mercado de Recursos Didácticos Validados por Resultados.
* **3. Objetivo**: Permitir a los docentes compartir y reutilizar materiales cuyo impacto positivo en el aprendizaje haya sido probado estadísticamente.
* **4. Descripción**: Algoritmo que clasifica los materiales creados por profesores según la mejora real en las notas de los alumnos que los utilizaron.
* **5. Problema que resuelve**: Profesores perdiendo horas diseñando materiales que otros docentes ya crearon con éxito.
* **6. Actor(es) involucrados**: Profesor (`TEACHER_USER`), Sistema (`SYSTEM`).
* **7. Precondiciones**: Material didáctico utilizado por al menos 50 estudiantes en la plataforma.
* **8. Postcondiciones**: Recurso indexado en el catálogo global con su índice de efectividad pedagógica.
* **9. Flujo principal**: 1. Publicar recurso -> 2. Sistema mide la mejora de notas en alumnos -> 3. Asignar Score de Efectividad -> 4. Destacar en el buscador global.
* **10. Flujos alternativos**: 10a. Venta de guías didácticas premium entre profesores con pago de regalías.
* **11. Flujos de excepción**: 11a. Recurso reportado por derechos de autor (suspensión inmediata para auditoría legal).
* **12. Reglas de negocio**: RN-029.1: El docente creador recibe el 70% de las regalías por la venta de su material.
* **13. Validaciones**: Verificación de licencias de propiedad intelectual.
* **14. Entradas**: Archivo didáctico, presentación, guía de ejercicios, etiquetas.
* **15. Datos de salida**: Recurso publicado, métricas de efectividad pedagógica.
* **16. Permisos necesarios**: `resources:share`, `resources:download`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-001`, `RF-026`.
* **19. Casos de uso relacionados**: `CU-029` (Compartir Recurso Didáctico).
* **20. Consideraciones de seguridad**: Marcas de agua automáticas en materiales compartidos.
* **21. Riesgos**: Publicación de contenidos de baja calidad (mitigado ordenando por resultados reales de exámen).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Buscador semántico de materiales con respuesta en < 300ms.

#### RF-030: Benchmarking Sectorial en Tiempo Real
* **1. Identificador**: `RF-030` | **2. Nombre**: Panel Comparativo Institucional Anónimo.
* **3. Objetivo**: Comparar el rendimiento académico de una institución de forma anónima contra los promedios regionales y nacionales.
* **4. Descripción**: Genera analítica comparativa B2B para directivos, permitiéndoles identificar materias débiles respecto al estándar del sector.
* **5. Problema que resuelve**: Directivos tomando decisiones sin saber si sus resultados están por encima o por debajo de la media.
* **6. Actor(es) involucrados**: Director (`DIRECTOR_USER`), Rector (`RECTOR_USER`).
* **7. Precondiciones**: Suscripción Enterprise activa e historial académico de al menos 1 periodo.
* **8. Postcondiciones**: Reporte comparativo generado con recomendaciones estratégicas.
* **9. Flujo principal**: 1. Seleccionar materia/grado -> 2. Filtrar por región -> 3. Procesar promedios anónimos -> 4. Mostrar gráfico de brechas.
* **10. Flujos alternativos**: 10a. Simulación del impacto en el nivel del colegio si se mejoran notas en asignaturas específicas.
* **11. Flujos de excepción**: 11a. Muestra regional pequeña (agrupa a nivel nacional para proteger el anonimato).
* **12. Reglas de negocio**: RN-030.1: Prohibido mostrar datos identificables de colegios competidores individuales.
* **13. Validaciones**: Mínimo 5 instituciones por segmento para permitir el cálculo comparativo.
* **14. Datos de entrada**: Indicadores internos del colegio, filtros regionales.
* **15. Datos de salida**: Gráficos de posicionamiento en percentiles, recomendaciones de mejora.
* **16. Permisos necesarios**: `analytics:view_benchmark`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-014`, `RF-026`.
* **19. Casos de uso relacionados**: `CU-030` (Consultar Benchmarking Sectorial).
* **20. Consideraciones de seguridad**: Privacidad diferencial para evitar la des-anonimización de instituciones.
* **21. Riesgos**: Resistencia del personal a ser comparado (mitigado enfocando el reporte en la mejora continua).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Actualización mensual de los promedios regionales.

---

### 💖 MÓDULO 11: STICKINESS EMOCIONAL E IDENTIDAD

#### RF-031: Parent-Engagement Portal (Live Stream de Progreso)
* **1. Identificador**: `RF-031` | **2. Nombre**: Muro Social de Acompañamiento y Progreso Diario.
* **3. Objetivo**: Mantener involucrados a los padres mediante un feed en tiempo real con hitos diarios y sugerencias de ayuda.
* **4. Descripción**: Reemplaza boletines mensuales por un feed tipo red social donde los padres ven los logros diarios de sus hijos y reciben ideas de actividades para el hogar.
* **5. Problema que resuelve**: Desconexión y falta de visibilidad de los padres sobre la vida escolar diaria de sus hijos.
* **6. Actor(es) involucrados**: Apoderado (`PARENT_USER`), Estudiante (`STUDENT_USER`), Profesor (`TEACHER_USER`).
* **7. Precondiciones**: Relación apoderado-alumno verificada en la plataforma.
* **8. Postcondiciones**: Muro actualizado con tarjetas de progreso diarias.
* **9. Flujo principal**: 1. Alumno logra hito -> 2. Sistema genera tarjeta visual -> 3. Publicar en el feed del padre -> 4. Padre envía felicitación.
* **10. Flujos alternativos**: 10a. Sugerencia de pregunta diaria para la cena: "Pregúntale a tu hijo sobre el experimento de hoy".
* **11. Flujos de excepción**: 11a. Notificaciones push desactivadas (envía un resumen semanal por correo).
* **12. Reglas de negocio**: RN-031.1: Solo se muestran datos del hijo propio, respetando la privacidad de los demás alumnos.
* **13. Validaciones**: Verificación de la patria potestad o tutoría legal activa.
* **14. Datos de entrada**: Hitos completados, fotos compartidas por el profesor.
* **15. Datos de salida**: Feed social personalizado, sugerencias de conversación.
* **16. Permisos necesarios**: `parent:view_feed`.
* **17. Prioridad**: 🟠 ALTA.
* **18. Dependencias con otros RF**: `RF-006`, `RF-012`.
* **19. Casos de uso relacionados**: `CU-031` (Ver Feed de Progreso Familiar).
* **20. Consideraciones de seguridad**: Canal de comunicación seguro y cerrado solo para la familia del estudiante.
* **21. Riesgos**: Presión excesiva de los padres (mitigado destacando el esfuerzo y no solo la nota final).
* **22. Criterios de aceptación, Edge Cases y Observaciones Técnicas**: Incremento del 300% en la interacción diaria de los padres con la App.

---

### 💵 MÓDULO 12 Y 13: PLATFORM ECONOMICS, SWARM Y CONTINUIDAD (RF-032 A RF-042)

* **RF-032**: Captura de Micro-Interacciones (500+ Datapoints Comportamentales al Año).
* **RF-033**: Grafos de Conocimiento Institucional (Knowledge Graph Mapeo Habilidades-Empleo).
* **RF-034**: API-First Architecture & Marketplace de Plugins Educativos 70/30.
* **RF-035**: Marketplace de Talento Predictivo (Headhunting por IA de Habilidades Reales).
* **RF-036**: Economía Interna de Tokens Educativos y Billetera de Canje.
* **RF-037**: AI Agentic Swarm - Enjambre 24/7 de Agentes Especializados (Psicopedagogo, Evaluador).
* **RF-038**: Digital Twin del Estudiante (DTL - Simulación de Exámenes y Rendimiento).
* **RF-039**: Proof of Skill & Talent Liquidity (Validación de Proyectos Reales Ejecutados).
* **RF-040**: Sensor Multimodal de Atención, Emoción y Prevención de Bullying en Foros.
* **RF-041**: Interoperabilidad "Lego" (Universal Learning Record para Traslado 1-Click).
* **RF-042**: Invisible UI - Aprendizaje Ubicuo (WhatsApp, Alexa, Apple Vision Pro).

---

*Fin de la Especificación de los 42 Requerimientos Funcionales Exclusivos EDUCACION OS v1.0.*
