# FASE 0 — Metodología DDS: Etapa 1 — Documentación Exhaustiva de Requerimientos Funcionales (RF)

> **Proyecto**: GYMsos Operating System
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 1 — Requerimientos Funcionales (RF)
> **Versión**: 1.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 📌 Introducción y Metodología

La presente documentación representa la **Etapa 1 de la Fase 0 de la metodología DDS (Desarrollo Dirigido por Sistemas)** para la suite empresarial **GYMsos**. Cada Requerimiento Funcional (RF) ha sido especificado exhaustivamente sin ambigüedades, desglosando los 22 atributos requeridos para servir como cimiento indestructible antes del diseño de la base de datos, ciberseguridad, roles y arquitectura de software.

---

## 📝 Catálogo de Requerimientos Funcionales (RF)

---

### RF-001: Gestión Multi-Tenant y Onboarding de Centros Deportivos (Gimnasios)

* **1. Identificador del RF**: `RF-001`
* **2. Nombre**: Registro, Onboarding y Configuración Multi-Tenant de Gimnasios y Sedes.
* **3. Objetivo**: Permitir a propietarios de centros deportivos registrar sus sedes en la plataforma, configurar parámetros operativos, personalización visual y reglas de negocio aisladas lógicamente.
* **4. Descripción detallada**: El sistema debe proveer un flujo asistido donde el propietario crea su cuenta empresarial (Tenant), registra sedes físicas/virtuales, define planes de membresía, horarios de atención, aforo máximo, zona horaria y branding personalizado (logotipo, colores corporativos). Cada tenant cuenta con aislamiento estricto de datos en la capa de persistencia mediante identificador `tenant_id`.
* **5. Problema que resuelve**: Elimina la fragmentación operativa y el uso de hojas de cálculo o sistemas legacy monolíticos, garantizando aislamiento seguro multitenant en una arquitectura SaaS $2B+.
* **6. Actor(es) involucrados**: Propietario de Gimnasio (`TENANT_OWNER`), Administrador de Sede (`GYM_ADMIN`), Super Administrador GYMsos (`SUPER_ADMIN`).
* **7. Precondiciones**: El usuario debe contar con correo corporativo verificado e identidad validada mediante contraseña segura o OAuth2.
* **8. Postcondiciones**: Se genera una instancia de Tenant activa en estado `PENDING_CONFIG` o `ACTIVE`, asignando esquemas de datos aislados, roles por defecto y credenciales de acceso iniciales.
* **9. Flujo principal**:
  1. El propietario accede al portal de Onboarding e ingresa datos fiscales y comerciales.
  2. El sistema valida la no duplicidad del RUC/RFC/NIF y nombre comercial.
  3. El propietario selecciona la industria (Fitness Center, Box de Crossfit, Academia de Artes Marciales).
  4. El sistema aprovisiona la configuración inicial y asigna una URL/Subdominio único.
  5. Se emite correo de bienvenida y confirmación de alta.
* **10. Flujos alternativos**:
  * *10a. Registro Multi-Sede*: Si el propietario administra una cadena, el sistema habilita el panel de carga masiva de sedes vía plantilla CSV/JSON.
* **11. Flujos de excepción**:
  * *11a. Documentación Fiscal Rechazada*: El sistema marca el tenant como `ACTION_REQUIRED` y notifica al usuario los campos a corregir.
  * *11b. Fallo en Aprovisionamiento*: Si el servicio de base de datos falla al crear la estructura inicial, la transacción realiza *rollback* completo y envía alerta al equipo de soporte SRE.
* **12. Reglas de negocio**:
  * RN-001.1: Un `tenant_id` es inmutable y debe asociarse a todas las tablas transaccionales.
  * RN-001.2: El subdominio asignado debe ser único a nivel global.
* **13. Validaciones**:
  * Formato válido de RUC/RFC y correo corporativo.
  * Longitud de nombre comercial entre 3 y 100 caracteres.
* **14. Datos de entrada**: Nombre de empresa, RUC/tax_id, dirección física, coordenadas GPS, teléfono, correo de contacto, plan de suscripción seleccionado.
* **15. Datos de salida**: `tenant_id`, `subdomain_url`, estado del tenant, token JWT inicial de administración.
* **16. Permisos necesarios**: `tenant:create`, `tenant:configure`.
* **17. Prioridad**: CRÍTICA.
* **18. Dependencias con otros RF**: Ninguna (Es el RF raíz).
* **19. Casos de uso relacionados (CU)**: `CU-001` (Registrar nuevo Tenant), `CU-002` (Configurar Sede).
* **20. Consideraciones de seguridad**:
  * Validación estricta de aislamiento RLS (Row Level Security) en base de datos.
  * Sanitización contra XSS en campos de nombre y descripción comercial.
* **21. Riesgos**: Colisión de subdominios o filtración de datos entre tenants por falta de filtro RLS.
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: El tenant puede iniciar sesión y configurar sus instalaciones en menos de 3 minutos.
  * *Edge Cases*: Intento de registro simultáneo del mismo RUC por dos administradores distintos (debe manejarse con bloqueo optimista en BD).
  * *Observaciones Técnicas*: Implementado mediante backend NestJS + Prisma/PostgreSQL con políticas RLS activadas.

---

### RF-002: Control de Accesos Biométrico, QR Dinámico e Integración IoT

* **1. Identificador del RF**: `RF-002`
* **2. Nombre**: Control de Acceso Físico Automatizado mediante QR Dinámico y Biometría.
* **3. Objetivo**: Validar la identidad y el estado de membresía de los usuarios en tiempo real (< 300 ms) para autorizar la apertura de torniquetes, molinetes y cerraduras inteligentes.
* **4. Descripción detallada**: El sistema genera códigos QR encriptados de rotación dinámica (cada 15 segundos) en la aplicación móvil del socio. Al aproximar el dispositivo al lector IoT o escanear el rostro en cámara biométrica, la puerta valida la membresía activa, pagos al día y aforo permitido.
* **5. Problema que resuelve**: Suplanta el uso de tarjetas plásticas o huellas que generan colas, fraudes por transferencia de pases y sobre-aforo no controlado.
* **6. Actor(es) involucrados**: Socio / Miembro (`GYM_MEMBER`), Dispositivo Lector IoT (`IOT_GATEWAY`), Recepcionista (`STAFF_USER`).
* **7. Precondiciones**: El socio debe contar con una membresía activa y saldo al día. El dispositivo IoT debe estar conectado al broker MQTT/WebSocket de GYMsos.
* **8. Postcondiciones**: Registro inmediato de asistencia en la base de datos, actualización del aforo actual de la sede en tiempo real y emisión de señal de pulso de apertura al rele del torniquete.
* **9. Flujo principal**:
  1. El socio abre la App GYMsos y visualiza su QR dinámico con Hash temporal HMAC-SHA256.
  2. El escaner IoT lee el código y envía el payload encriptado vía WebSocket seguro.
  3. El servidor descifra el token, valida la fecha/hora y verifica la membresía.
  4. El servidor responde con `ACCESS_GRANTED` (HTTP 200) y pulso de apertura.
  5. El marcador de aforo en vivo se incrementa en +1.
* **10. Flujos alternativos**:
  * *10a. Validación Facial Offline*: Si la sede pierde conectividad a internet, el lector de reconocimiento facial valida contra la lista blanca local sincronizada previamente.
* **11. Flujos de excepción**:
  * *11a. Membresía Vencida / Mora*: El lector emite sonido de rechazo, muestra pantalla roja con motivo `MEMBERSHIP_EXPIRED` y no abre la puerta.
  * *11b. Intento de Re-ingreso Inmediato (Anti-Passback)*: Si el socio intenta pasar el mismo QR dos veces en menos de 5 minutos, se rechaza con error `ANTI_PASSBACK_VIOLATION`.
* **12. Reglas de negocio**:
  * RN-002.1: El código QR vence estrictamente a los 15 segundos.
  * RN-002.2: No se permite acceso si la sede ha alcanzado el 100% del aforo máximo permitido por ley.
* **13. Validaciones**:
  * Firma criptográfica del token QR.
  * Verificación de estado de cuenta e inhabilitación por deuda.
* **14. Datos de entrada**: Payload QR (member_id + timestamp + hmac), Mac Address del dispositivo IoT.
* **15. Datos de salida**: Estado de autorización (`GRANTED` / `DENIED`), mensaje en pantalla IoT, comando de relé (`OPEN_RELAY`).
* **16. Permisos necesarios**: `access:checkin`, `iot:publish`.
* **17. Prioridad**: CRÍTICA.
* **18. Dependencias con otros RF**: `RF-001` (Configuración de Sede), `RF-003` (Membresías).
* **19. Casos de uso relacionados (CU)**: `CU-003` (Registrar Entrada Socio), `CU-004` (Sincronizar Dispositivo IoT).
* **20. Consideraciones de seguridad**:
  * Los códigos QR no pueden capturarse en captura de pantalla (App bloquea captura).
  * Comunicación IoT cifrada mediante TLS 1.3 y tokens mTLS.
* **21. Riesgos**: Caída de red local en el gimnasio (mitigado con lista caché offline en Edge IoT).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Latencia total de verificación menor a 300 milisegundos.
  * *Edge Cases*: Socio intenta ingresar en horario fuera de su plan (ej. Plan Mañanero intentando ingresar a las 8 PM).

---

### RF-003: Gestión de Membresías, Suscripciones y Cobros Recurrentes

* **1. Identificador del RF**: `RF-003`
* **2. Nombre**: Motor de Cobros, Suscripciones Recurrentes y Gestión de Membresías.
* **3. Objetivo**: Automatizar la venta, renovación, congelamiento (freeze) y cobro recurrente con tarjeta de crédito/débito o billeteras digitales de los planes deportivos.
* **4. Descripción detallada**: El motor gestiona el ciclo de vida completo de las membresías (Mensual, Trimestral, Anual, Pases Libres). Integra pasarelas de pago (Stripe, MercadoPago, Niubiz) para ejecutar cobros automáticos antes del vencimiento, emitiendo comprobantes de pago electrónicos y gestionando reintentos de cobro en caso de tarjeta rechazada (Dunning Management).
* **5. Problema que resuelve**: Suprime la morosidad no cobrada, reduce la carga administrativa en recepción y automatiza el flujo de caja.
* **6. Actor(es) involucrados**: Socio (`GYM_MEMBER`), Contador / Cajero (`FINANCE_USER`), Pasarela de Pagos (`PAYMENT_GATEWAY`).
* **7. Precondiciones**: Existencia de planes de membresía configurados por el Tenant y token de pago válido del usuario.
* **8. Postcondiciones**: Emisión del contrato digital, registro de factura en base de datos, extensión de vigencia del usuario y envío de recibo por e-mail/WhatsApp.
* **9. Flujo principal**:
  1. El socio o recepcionista selecciona el plan deseado en la App o POS.
  2. El sistema calcula impuestos, descuentos promocionales y prorrata si aplica.
  3. Se procesa el pago con la pasarela integrada.
  4. Tras confirmación (WebHook HTTP 200), se activa la membresía.
  5. Se programa el próximo cobro recurrente automático (Cron Job / Event Queue).
* **10. Flujos alternativos**:
  * *10a. Solicitud de Congelamiento (Freeze)*: El socio solicita congelar su plan por enfermedad. El sistema pausa el cobro por los días autorizados.
* **11. Flujos de excepción**:
  * *11a. Pago Rechazado (Fondos Insuficientes)*: El sistema ejecuta reintento el día 1, 3 y 5. Al día 5 pasa a estado `PAST_DUE` y suspende el acceso físico.
* **12. Reglas de negocio**:
  * RN-003.1: El congelamiento no puede exceder los 30 días acumulados por año contrato.
  * RN-003.2: Los comprobantes de pago deben cumplir la normativa tributaria local (SUNAT, SAT, SRI).
* **13. Validaciones**:
  * Algoritmo de Luhn para validación de tarjeta.
  * Verificación de vigencia del cupón de descuento.
* **14. Datos de entrada**: `member_id`, `plan_id`, token de tarjeta/medio de pago, código promocional.
* **15. Datos de salida**: `transaction_id`, estado del pago, fecha límite de membresía, comprobante PDF.
* **16. Permisos necesarios**: `payments:process`, `memberships:manage`.
* **17. Prioridad**: CRÍTICA.
* **18. Dependencias con otros RF**: `RF-001` (Tenant).
* **19. Casos de uso relacionados (CU)**: `CU-005` (Procesar Pago Suscripción), `CU-006` (Aplicar Freeze Membresía).
* **20. Consideraciones de seguridad**:
  * Cumplimiento estricto PCI-DSS (No se almacenan CVV ni PAN completo en BD; solo tokens).
* **21. Riesgos**: Fallos en WebHooks de pasarela que dejen inscripciones pagadas sin activar (mitigado con reconciliación nocturna).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Tasa de éxito de cobros automáticos > 98%. Reconciliación idempotente de Webhooks.

---

### RF-004: Prescripción Inteligente de Rutinas y Nutrición con Motor IA

* **1. Identificador del RF**: `RF-004`
* **2. Nombre**: Generación y Adaptación Dinámica de Entrenamientos y Nutrición basada en IA.
* **3. Objetivo**: Generar rutinas de entrenamiento hiper-personalizadas y planes nutricionales ajustados a los objetivos biológicos, restricciones médicas y progreso en tiempo real del socio.
* **4. Descripción detallada**: Utilizando algoritmos de aprendizaje supervisado y reglas fisiológicas, el sistema toma la evaluación de composición corporal (InBody/Dexa), historial de lesiones y nivel de experiencia para construir planes de ejercicio y nutrición. Durante el entrenamiento, la App sugiere ajustar pesos/repeticiones basándose en la percepción de esfuerzo (RPE) reportada.
* **5. Problema que resuelve**: Elimina la asignación de rutinas genéricas en papel que provocan estancamiento físico y abandono por falta de resultados.
* **6. Actor(es) involucrados**: Socio (`GYM_MEMBER`), Entrenador (`TRAINER_USER`), Motor IA (`AI_ENGINE`).
* **7. Precondiciones**: El socio debe contar con perfil antropométrico básico completado.
* **8. Postcondiciones**: Plan de entrenamiento y macro-nutrientes disponible en la App del socio con notificaciones push diarias.
* **9. Flujo principal**:
  1. El socio o entrenador completa el cuestionario PAR-Q y evaluación de fuerza.
  2. El motor IA procesa las variables y genera la estructura de microciclo (4 semanas).
  3. El entrenador revisa, ajusta opcionalmente y aprueba el plan.
  4. El socio ejecuta la rutina registrando reps/peso en la App.
  5. La IA re-calcula la sobrecarga progresiva para la siguiente semana.
* **10. Flujos alternativos**:
  * *10a. Auto-generación Directa Socio*: Si el gimnasio no cuenta con entrenadores personales asignados, el socio puede autogenerar su plan bajo supervisión algorítmica.
* **11. Flujos de excepción**:
  * *11a. Detección de Contraindicación Médica*: Si el socio registra lesión lumbar grave, el sistema inhabilita ejercicios de carga axial (sentadilla trasera, peso muerto) y alerta al equipo.
* **12. Reglas de negocio**:
  * RN-004.1: Ninguna rutina generada por IA puede superar el volumen máximo recuperable (MRV) establecido por la ciencia del deporte.
* **13. Validaciones**:
  * Rangos válidos de IMC, porcentaje de grasa y cargas máximas (1RM).
* **14. Datos de entrada**: Peso, talla, % grasa, edad, objetivo (hipertrofia, pérdida de grasa), días disponibles, equipamiento del gimnasio.
* **15. Datos de salida**: Matriz de ejercicios (series, reps, RPE, descanso), distribución de macronutrientes (proteínas, carbohidratos, grasas).
* **16. Permisos necesarios**: `workouts:create`, `ai:prescribe`.
* **17. Prioridad**: ALTA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados (CU)**: `CU-007` (Generar Rutina IA), `CU-008` (Registrar Sesión Entrenamiento).
* **20. Consideraciones de seguridad**:
  * Protección de datos de salud y biometría (HIPAA / Privacidad de Salud).
* **21. Riesgos**: Lesión por prescripción inadecuada (mitigado con filtros de seguridad biomédica obligatorios).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Tiempo de generación de rutina < 2 segundos. 95% de satisfacción del usuario en la adaptabilidad del plan.

---

### RF-005: Algoritmo Predictivo de Churn (Abandono) y Retención Automatizada

* **1. Identificador del RF**: `RF-005`
* **2. Nombre**: Sistema de Predicción de Deserción y Protocolos de Fidelización Automática.
* **3. Objetivo**: Predecir el riesgo de abandono de un socio con al menos 30 días de anticipación y desencadenar acciones de retención automatizadas.
* **4. Descripción detallada**: El motor analiza patrones de comportamiento como frecuencia de asistencia, disminución de días de entrenamiento, falta de registro de rutinas, interacciones en la App y estado de pagos. Si la probabilidad de deserción supera el 70%, el sistema clasifica al socio en `HIGH_RISK` y activa tareas automáticas (pases de regalo para amigos, mensajes motivacionales, cita gratuita con entrenador o descuentos).
* **5. Problema que resuelve**: Reduce drásticamente la tasa de churn industrial en gimnasios (que oscila entre 5% y 10% mensual), protegiendo el LTV (Life Time Value).
* **6. Actor(es) involucrados**: Gerente de Sede (`GYM_ADMIN`), Entrenador (`TRAINER_USER`), Sistema Predictivo (`AI_ENGINE`).
* **7. Precondiciones**: Existencia de al menos 14 días de historial comportamental del usuario.
* **8. Postcondiciones**: Actualización del indicador de riesgo en la ficha del usuario y ejecución del flujo de retención (CRM).
* **9. Flujo principal**:
  1. El job nocturno ejecuta el modelo XGBoost / Random Forest sobre la base de usuarios.
  2. El modelo calcula el *Churn Risk Score* (0.00 a 1.00) para cada socio.
  3. Los socios con Score > 0.70 se ingresan al embudo de retención.
  4. Se envía una notificación push hiper-personalizada ofreciendo un beneficio.
  5. Se asigna una llamada/tarea al Staff de recepción para contactar al socio.
* **10. Flujos alternativos**:
  * *10a. Retención Exitosa*: El socio vuelve a asistir dentro de los 7 días posteriores. El sistema recalcula el score y lo baja a `LOW_RISK`.
* **11. Flujos de excepción**:
  * *11a. Usuario Opt-Out*: Si el socio ha desactivado notificaciones promocionales, la acción se redirige exclusivamente a tarea manual en recepción.
* **12. Reglas de negocio**:
  * RN-005.1: El sistema no enviará más de 2 comunicaciones de retención por semana para evitar spam.
* **13. Validaciones**:
  * Umbrales de precisión del modelo ML (> 85% de precisión validada).
* **14. Datos de entrada**: Días sin asistir, tendencia de peso levantado, antigüedad, canal de pago.
* **15. Datos de salida**: Churn Risk Index (%), nivel de riesgo (`LOW`, `MEDIUM`, `HIGH`), campaña de retención asignada.
* **16. Permisos necesarios**: `analytics:churn`, `crm:campaigns`.
* **17. Prioridad**: ALTA.
* **18. Dependencias con otros RF**: `RF-002` (Accesos), `RF-003` (Membresías).
* **19. Casos de uso relacionados (CU)**: `CU-009` (Consultar Dashboard Churn), `CU-010` (Ejecutar Campaña Retención).
* **20. Consideraciones de seguridad**:
  * Los algoritmos no deben utilizar datos sensibles discriminatorios (raza, género) en la predicción.
* **21. Riesgos**: Falsos positivos que otorguen descuentos innecesarios a socios leales (mitigado con tuning continuo del modelo).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Reducción comprobada del churn del tenant en al menos 25% tras 3 meses de operación.

---

### RF-006: Gestión de Cursos, Programas de Formación y Certificaciones (Módulo Educación)

* **1. Identificador del RF**: `RF-006`
* **2. Nombre**: LMS Inteligente de Cursos, Evaluaciones y Certificaciones Deportivas.
* **3. Objetivo**: Gestionar la plataforma educativa para entrenadores, staff y usuarios, administrando contenidos en video, evaluaciones interactivas y emisión de certificados blockchain.
* **4. Descripción detallada**: El módulo permite a instructores y administradores crear cursos estructurados por módulos y lecciones. Los estudiantes avanzan consumiendo video streaming adaptativo, realizan quizes interactivos y reciben un certificado digital con código de verificación QR al aprobar el curso.
* **5. Problema que resuelve**: Capacita de forma continua al personal de los gimnasios y monetiza el conocimiento mediante cursos abiertos a la comunidad deportiva.
* **6. Actor(es) involucrados**: Estudiante (`STUDENT_USER`), Instructor (`INSTRUCTOR_USER`), Administrador Académico (`ACADEMIC_ADMIN`).
* **7. Precondiciones**: El usuario debe estar registrado e inscrito en el curso correspondiente.
* **8. Postcondiciones**: Registro de avance del curso (%), emisión de nota final y generación de certificado en PDF cifrado.
* **9. Flujo principal**:
  1. El estudiante ingresa al aula virtual y reproduce la lección en video.
  2. El sistema guarda el marcador de reproducción cada 10 segundos.
  3. Al finalizar el módulo, se habilita la evaluación escrita/práctica.
  4. El estudiante obtiene una nota mayor o igual al mínimo aprobatorio (80%).
  5. El sistema emite el certificado digital con ID único e inmutable.
* **10. Flujos alternativos**:
  * *10a. Reprobación de Examen*: Si obtiene menos de 80%, se habilita un periodo de gracia de 24 horas antes del reintento.
* **11. Flujos de excepción**:
  * *11a. Interrupción de Red*: El progreso parcial del examen se guarda localmente en el navegador y se sincroniza al reconectar.
* **12. Reglas de negocio**:
  * RN-006.1: No se puede obtener el certificado si el tiempo de visualización de videos es menor al 90% de la duración total.
* **13. Validaciones**:
  * Formato y tamaño de archivos de video subidos por el instructor (MP4 / HLS).
* **14. Datos de entrada**: `course_id`, `lesson_id`, respuestas del quiz, tiempo de reproducción.
* **15. Datos de salida**: Porcentaje de progreso, nota del examen, certificado PDF con hash de verificación.
* **16. Permisos necesarios**: `education:learn`, `education:publish`.
* **17. Prioridad**: MEDIA-ALTA.
* **18. Dependencias con otros RF**: `RF-001`.
* **19. Casos de uso relacionados (CU)**: `CU-011` (Completar Lección), `CU-012` (Emitir Certificado).
* **20. Consideraciones de seguridad**:
  * Videos con URLs firmadas (Signed URLs) temporales para evitar descarga ilegal.
* **21. Riesgos**: Compartición de cuentas de estudiantes para rendir exámenes por terceros (mitigado con validación facial aleatoria en quizes).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Streaming fluido HLS a 1080p con latencia de carga < 1s.

---

### RF-007: Marketplace Deportivo, Ventas POS y Comercio Multi-Vendedor

* **1. Identificador del RF**: `RF-007`
* **2. Nombre**: Sistema de Comercio Electrónico, Punto de Venta (POS) e Inventario Deportivo.
* **3. Objetivo**: Permitir la venta de suplementos, indumentaria, accesorios y pases en la recepción del gimnasio (POS) o a través de la tienda virtual unificada.
* **4. Descripción detallada**: Administra el catálogo de productos con variantes (tallas, sabores, colores), control de stock multi-almacén, lectura de código de barras, integración con cajón de dinero e impresora térmica, y liquidación de comisiones para vendedores multi-tenant.
* **5. Problema que resuelve**: Evita fugas de dinero en recepción por ventas no registradas y amplía los ingresos del gimnasio mediante e-commerce.
* **6. Actor(es) involucrados**: Cliente / Socio (`BUYER_USER`), Cajero (`POS_USER`), Administrador de Tienda (`STORE_ADMIN`).
* **7. Precondiciones**: Existencia de inventario cargado con stock mayor a cero.
* **8. Postcondiciones**: Descuento automático del stock, emisión de comprobante de venta e ingreso de dinero en caja.
* **9. Flujo principal**:
  1. El cajero en la recepción escanea el código de barras del producto.
  2. El sistema lo agrega al carrito del POS registrando precio e impuestos.
  3. Se selecciona el método de pago (Efectivo, Tarjeta, QR Plin/Yape).
  4. Se confirma la transacción y se imprime la boleta/factura electrónica.
  5. El inventario se actualiza en tiempo real.
* **10. Flujos alternativos**:
  * *10a. Venta Online con Recojo en Gimnasio (Click & Collect)*: El socio compra en la App y retira el producto en la recepción mostrando el código de orden.
* **11. Flujos de excepción**:
  * *11a. Stock Insuficiente*: El sistema impide cerrar la venta e indica la falta de existencias, ofreciendo la transferencia desde otra sede.
* **12. Reglas de negocio**:
  * RN-007.1: Toda salida de inventario debe estar respaldada por una orden de venta o nota de ajuste justificada.
* **13. Validaciones**:
  * Verificación de código EAN-13 / UPC.
* **14. Datos de entrada**: SKU de producto, cantidad, método de pago, cliente asignado.
* **15. Datos de salida**: Ticket de venta, actualización de inventario, reporte de arqueo de caja.
* **16. Permisos necesarios**: `pos:checkout`, `inventory:manage`.
* **17. Prioridad**: MEDIA.
* **18. Dependencias con otros RF**: `RF-001`, `RF-003`.
* **19. Casos de uso relacionados (CU)**: `CU-013` (Realizar Venta POS), `CU-014` (Ajustar Inventario).
* **20. Consideraciones de seguridad**:
  * Control estricto de cierres y arqueos de caja para prevenir fraude interno.
* **21. Riesgos**: Descalce entre inventario físico y digital (mitigado con auditorías periódicas de inventario).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Procesamiento de venta en POS en menos de 5 segundos.

---

### RF-008: Gestión de Staff, Entrenadores y Asignación Dinámica de Clientes

* **1. Identificador del RF**: `RF-008`
* **2. Nombre**: Administración de Personal, Comisiones y Carga de Clientes.
* **3. Objetivo**: Gestionar los turnos, horarios, roles, cálculo de comisiones por metas cumplidas y asignación de clientes a entrenadores personales.
* **4. Descripción detallada**: Módulo de recursos humanos especializado en fitness. Permite registrar contratos de personal, definir esquemas de comisiones (por clase dictada, por cliente de personal training contratado, por venta de productos en POS) y balancear la carga de usuarios asignados a cada entrenador para garantizar atención de alta calidad.
* **5. Problema que resuelve**: Automatiza el cálculo complejo de nóminas y comisiones que usualmente consume decenas de horas administrativas al mes.
* **6. Actor(es) involucrados**: Administrador de Gimnasio (`GYM_ADMIN`), Entrenador (`TRAINER_USER`), Recepcionista (`STAFF_USER`).
* **7. Precondiciones**: El usuario de staff debe estar registrado bajo el tenant correspondiente.
* **8. Postcondiciones**: Emisión del reporte mensual de nómina y comisiones, y actualización de la lista de clientes a cargo del entrenador.
* **9. Flujo principal**:
  1. El administrador crea el perfil de entrenador y define su tarifa/comisión.
  2. Al venderse una membresía de Personal Training (`RF-003`), el sistema asigna el cliente al entrenador con menor carga.
  3. El entrenador marca las sesiones dictadas en la App.
  4. Al cierre de mes, el sistema liquida automáticamente el sueldo base + comisiones acumuladas.
* **10. Flujos alternativos**:
  * *10a. Reasignación Manual*: El administrador transfiere un cliente a otro entrenador por cambio de turno o solicitud expresa del socio.
* **11. Flujos de excepción**:
  * *11a. Inasistencia del Entrenador*: Si el entrenador no registra la clase, el sistema notifica al administrador tras 15 minutos de retraso.
* **12. Reglas de negocio**:
  * RN-008.1: Un entrenador no puede tener más de 25 clientes activos en modalidad Personal Training intensivo simultáneamente.
* **13. Validaciones**:
  * Cruzamiento de horarios para evitar traslapes de clases grupales o personales.
* **14. Datos de entrada**: `staff_id`, tipo de comisión, tarifa por hora, cliente asignado.
* **15. Datos de salida**: Reporte de liquidación de comisiones, agenda consolidada de entrenamientos.
* **16. Permisos necesarios**: `staff:manage`, `payroll:calculate`.
* **17. Prioridad**: MEDIA.
* **18. Dependencias con otros RF**: `RF-001`, `RF-004`.
* **19. Casos de uso relacionados (CU)**: `CU-015` (Asignar Entrenador), `CU-016` (Calcular Comisiones).
* **20. Consideraciones de seguridad**:
  * Los entrenadores solo pueden visualizar los datos biométricos de los clientes explícitamente asignados a su agenda.
* **21. Riesgos**: Inconformidad en el cálculo de comisiones (mitigado con trazabilidad detallada de cada evento generador de comisión).
* **22. Criterios de aceptación, Casos Límite y Observaciones Técnicas**:
  * *Criterios de Aceptación*: Cálculo automático de nómina mensual en menos de 10 segundos para sedes con más de 100 colaboradores.

---

*Fin de la Etapa 1 — Requerimientos Funcionales Exhaustivos Metodología DDS v1.0.*
