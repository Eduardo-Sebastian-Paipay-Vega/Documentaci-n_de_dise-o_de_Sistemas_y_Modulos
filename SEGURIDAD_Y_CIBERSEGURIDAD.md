# Blueprint de Seguridad, Ciberseguridad y Cumplimiento GYMsos

> **Proyecto**: GYMsos Operating System
> **Fase**: Gobernanza Global — Seguridad y AppSec
> **Versión**: 1.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🛡️ 1. Arquitectura de Seguridad Zero-Trust

El ecosistema **GYMsos** opera bajo un modelo **Zero-Trust** ("Nunca confiar, siempre verificar"). Cada solicitud HTTP, canal de WebSocket o consulta a la base de datos debe ser autenticada, autorizada y auditada independientemente de su origen.

---

## 🔐 2. Autenticación y Gestión de Tokens (JWT & Refresh Cookies)

### 2.1 Flujo de Autenticación de Doble Token

1. **Access Token (JWT)**:
   * **Vida Útil**: 15 minutos.
   * **Almacenamiento**: Memoria volátil del cliente (nunca en `localStorage` ni `sessionStorage` para prevenir exfiltración XSS).
   * **Algoritmo**: RS256 (Firma asimétrica con clave privada/pública).
2. **Refresh Token**:
   * **Vida Útil**: 7 días (con rotación obligatoria en cada uso).
   * **Almacenamiento**: Cookie HTTP-Only, `Secure`, `SameSite=Strict` y `Path=/api/v1/auth/refresh`.

```typescript
// Ejemplo de configuración de Cookie segura de Refresh Token en Express/Fastify
res.cookie('refreshToken', tokenRotado, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
});
```

---

## 👥 3. Matriz de Control de Acceso Basado en Roles (RBAC / ABAC)

| Rol | Permisos de Lectura | Permisos de Escritura | Acceso a Datos Biométricos |
|-----|-------------------|----------------------|---------------------------|
| **SUPER_ADMIN** | Todo el sistema multi-tenant | Configuración global y métricas | Anonimizado |
| **TENANT_ADMIN** | Gimnasio / Sede específica | Gestión de personal y finanzas local | No |
| **COACH / TRAINER** | Asignaciones de miembros | Asignación de rutinas y dietas | Solo miembros asignados |
| **MEMBER / STUDENT** | Perfil propio y cursos | Datos personales e check-ins | Únicamente propios |
| **AUDITOR / COMPLIANCE**| Logs de auditoría | Ninguno | No |

---

## 🛑 4. Prevención contra Vulnerabilidades OWASP Top 10

### 4.1 Prevención de Inyección SQL (SQLi)
* **Regla**: Prohibida la concatenación directa de strings en consultas SQL.
* **Mecanismo**: Uso exclusivo de parametrización mediante Prisma ORM o consultas preparadas (`pg-promise`).

### 4.2 Sanitización y Prevención XSS
* **Regla**: Todo input de usuario se valida con esquemas strictos (Zod/DOMPurify) antes de persistirse o renderizarse.

### 4.3 Protección contra Rate Limiting y Fuerza Bruta
* **Configuración**: Máximo 100 peticiones por minuto por dirección IP / Usuario autenticado vía Redis Rate Limiter (`rate-limiter-flexible`).

---

## ⚖️ 5. Cumplimiento Normativo y Privacidad de Datos

* **Encriptación de Datos en Reposo**: Cifrado AES-256-GCM para biometría sensible y registros de salud.
* **Encriptación en Tránsito**: TLS 1.3 forzado con HSTS habilitado.
* **Derecho al Olvido**: Procedimiento automatizado para anonimizar datos personales tras la solicitud formal del usuario.

---

*Blueprint de Seguridad y AppSec v1.0 — GYMsos Operating System.*
