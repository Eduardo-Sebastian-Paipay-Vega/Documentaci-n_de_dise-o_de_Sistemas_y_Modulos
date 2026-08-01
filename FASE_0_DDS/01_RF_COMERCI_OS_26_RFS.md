# FASE 0 — Metodología DDS: Requerimientos Funcionales COMERCI OS (RF-COM-001 a RF-COM-026)

> **Proyecto**: Ecosistema GYMsos — Vertical COMERCI OS
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 1 — Especificación Exhaustiva (26 RFs con 22 Atributos)
> **Versión**: 3.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 📌 Especificación Detallada de los 26 RFs de COMERCI OS

---

### Módulo C1: Unificación de Fuentes de Dinero (RF-COM-001 a RF-COM-005)

#### RF-COM-001: Conectar Banco Principal vía API
* **1. ID**: `RF-COM-001` | **2. Nombre**: Integración Bancaria Automática (BCP, BBVA, Interbank).
* **3. Objetivo**: Conectar las cuentas bancarias del comerciante vía API segura u Open Banking para sincronizar ingresos y egresos.
* **4. Descripción**: Permite seleccionar el banco, autenticar mediante OAuth 2.0 seguro y sincronizar el historial de transacciones de los últimos 6 meses.
* **5. Problema que resuelve**: Pérdida de tiempo consolidando extractos bancarios manualmente.
* **6. Actores**: Comerciante (`COMERCIANTE_USER`), Banco (`BANK_API`).
* **7. Precondiciones**: Cuenta registrada en Comerci OS y credenciales bancarias activas.
* **8. Postcondiciones**: Saldo bancario e historial visible en el dashboard consolidado.
* **9. Flujo Principal**: 1. Seleccionar banco -> 2. Autenticar OAuth -> 3. Autorizar lectura de movimientos -> 4. Ingesta de datos -> 5. Mostrar saldo.
* **10. Flujos Alt**: 10a. Sincronización mediante subida de extracto bancario en PDF/Excel.
* **11. Excepciones**: 11a. Fallo en token OAuth (solicita re-autenticación del usuario).
* **12. Reglas de Negocio**: RN-COM-001.1: El sistema nunca almacena contraseñas bancarias en texto plano (solo tokens OAuth).
* **13. Validaciones**: Verificación de firmas criptográficas en las respuestas bancarias.
* **14. Entradas**: `bank_code`, token de autorización OAuth.
* **15. Salidas**: Lista de transacciones, saldo disponible en banco.
* **16. Permisos**: `finance:bank_sync`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: Ninguna (Raíz financiera).
* **19. CUs**: `CU-COM-001` (Conectar Banco).
* **20. Seguridad**: Encriptación AES-256 de los tokens de conexión.
* **21. Riesgos**: Cambios en la API del banco (mitigado con adaptadores multicapa).
* **22. Criterios & Edge Cases**: Sincronización inicial de 6 meses completada en < 10 segundos.

#### RF-COM-002: Vinculación de Billeteras Digitales (Yape / Plin)
* **1. ID**: `RF-COM-002` | **2. Nombre**: Integración de Yape y Plin para Flujo de Dinero.
* **3. Objetivo**: Capturar automáticamente las transacciones recibidas mediante billeteras digitales.
* **4. Descripción**: Conecta la cuenta de Yape/Plin mediante token seguro o lectura de notificaciones para reflejar las ventas en efectivo digital en tiempo real.
* **5. Problema que resuelve**: El 90% de los pequeños comerciantes usa Yape y pierde el control del acumulado diario.
* **6. Actores**: Comerciante (`COMERCIANTE_USER`), Pasarela Yape/Plin (`WALLET_API`).
* **7. Precondiciones**: Cuenta Yape/Plin vinculada al número telefónico registrado.
* **8. Postcondiciones**: Saldo de billeteras sumado al dinero total disponible.
* **9. Flujo Principal**: 1. Vincular número Yape -> 2. Autorizar API/Push -> 3. Capturar transacciones en vivo -> 4. Actualizar balance.
* **10. Flujos Alt**: 10a. Escaneo del QR de confirmación de Yape enviado al cliente.
* **11. Excepciones**: 11a. Desconexión de la billetera (alerta al usuario para reconectar).
* **12. Reglas de Negocio**: RN-COM-002.1: Las transacciones de Yape se concatenan con el identificador de operación.
* **13. Validaciones**: Evitar duplicidad de transacciones por mismo ID de operación.
* **14. Entradas**: `phone_number`, `wallet_type`, token.
* **15. Salidas**: Saldo Yape acumulado, historial de recibos.
* **16. Permisos**: `finance:wallet_sync`.
* **17. Prioridad**: 🔴 CRÍTICA.
* **18. Dependencias**: `RF-COM-001`.
* **19. CUs**: `CU-COM-002` (Conectar Yape/Plin).
* **20. Seguridad**: Autenticación multifactor para autorizar la lectura de movimientos.
* **21. Riesgos**: Fallos en la red de Yape/Plin (mitigado con encolamiento asíncrono).
* **22. Criterios & Edge Cases**: Registro de la transacción de Yape en el dashboard en menos de 2 segundos.

#### RF-COM-003 a RF-COM-026: (Resumen de Especificación Completa de Comerci OS)
* **RF-COM-003**: Registro Manual de Efectivo en Caja Chica.
* **RF-COM-004**: Registro de Deudas, Pasivos y Fechas de Vencimiento a Proveedores.
* **RF-COM-005**: Vista Consolidada de Dinero Total Neto en Tiempo Real.
* **RF-COM-006**: Clasificación Automática de Gastos con Motor NLP / Machine Learning.
* **RF-COM-007**: Reclasificación Manual de Gastos con Feedback Loop de Aprendizaje.
* **RF-COM-008**: Desglose Visual e Insights de Gastos por Categoría (Gráfico Pie + Tendencias).
* **RF-COM-009**: Cálculo de la Velocidad Diaria Promedio de Gasto por Negocio.
* **RF-COM-010**: Proyección de Flujo de Caja y Saldo a 14 Días Vista.
* **RF-COM-011**: Proyección de Flujo de Caja y Saldo a 30 Días Vista.
* **RF-COM-012**: Identificador del Punto de Quiebra (Cálculo de Días Restantes hasta $0).
* **RF-COM-013**: Alertas Tempranas Multicanal de Quiebra Inminente (Push, SMS, Email).
* **RF-COM-014**: Motor de Recomendaciones e Sugerencias de Optimización de Gastos.
* **RF-COM-015**: Asistente de Decisión de Compra ("¿Puedo comprar esto hoy sin quebrar?").
* **RF-COM-016**: Simulador Comparativo de Escenarios ("¿Qué pasa si reduzco X gasto?").
* **RF-COM-017**: Reporte Diario de Movimientos e Ingresos al Inicio de Jornada.
* **RF-COM-018**: Reporte Semanal Ejecutivo con Tendencias y Recomendaciones.
* **RF-COM-019**: Generación de Reporte Mensual Completo en PDF Descargable.
* **RF-COM-020**: Comparativa Financiera Inter-Periodos (Mes vs Mes, Año vs Año).
* **RF-COM-021**: Registro y Alta de Comerciantes y Empresas.
* **RF-COM-022**: Autenticación Segura con 2FA y Sesiones de Expiración.
* **RF-COM-023**: Acceso Compartido Multi-Usuario (Dueño, Contador, Gerente).
* **RF-COM-024**: Cifrado Bancario AES-256 y Cumplimiento de Normativa PCI-DSS.
* **RF-COM-025**: API REST para Consultas Externas de Saldos y Proyecciones.
* **RF-COM-026**: Webhooks de Notificación para Entidades Financieras y Cooperativas.

---

*Fin de la Especificación de los 26 RFs de COMERCI OS Metodología DDS v3.0.*
