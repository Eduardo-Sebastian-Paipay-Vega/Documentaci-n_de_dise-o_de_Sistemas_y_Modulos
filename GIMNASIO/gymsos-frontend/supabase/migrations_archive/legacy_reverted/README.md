# Migraciones Archivadas — GYMsos Standalone (Supersedidas)

Estas migraciones configuraban GYMsos como un sistema **standalone** (independiente),
con `gym.gimnasios` como tenant y `gym.usuarios` como perfiles propios.

## Por qué fueron archivadas

La arquitectura evolucionó: GYMsos ahora vive como un **módulo lego** sobre la
**BD Maestra** (el mismo proyecto Supabase que ya tiene ONG operando).

En la BD Maestra:
- `public.tenants` → el tenant (el gym ES un tenant con `industry_type_id = 'gym'`)
- `public.profiles` → los usuarios (extienden `auth.users`)
- `public.sedes` → las sucursales del gym

Estas migraciones standalone crearon conflictos con esa arquitectura.

## Para revertir sus efectos

Ejecutar en Supabase SQL Editor:
```
migrations/000_ROLLBACK_001_to_008.sql
```

## Registro de errores encontrados

| Bug | Migración | Descripción |
|-----|-----------|-------------|
| BUG-1 | 008 línea 92 | `2>/dev/null` — sintaxis shell dentro de SQL, abortó la ejecución |
| BUG-2 | 009 original | `CREATE POLICY IF NOT EXISTS` — sintaxis inválida en PostgreSQL |
| BUG-3 | 001 | `rpc_registrar_nuevo_miembro` sin `SET search_path` post-006 |
| BUG-4 | 001 | `rpc_verificar_y_registrar_acceso` ídem |
| BUG-5 | 002 | `log_audit_event` usaba `usuarios` sin schema qualifier |
| BUG-6 | 002 | Políticas RLS de `clases` con subquery `FROM usuarios` (no resolvía post-006) |
| BUG-7 | 002 | `accesos_insert_staff` mismo problema |
| BUG-8 | 009 original | `ALTER POLICY` sobre `access_codes` destruía tenant isolation |
| BUG-9 | 009 original | `gym.current_tenant_id()` definida dos veces (muerta la primera) |
| BUG-10 | 008b | Intentaba mover `public.audit_logs` (BD Maestra) a schema gym |

## Migración activa

La única migración que debe ejecutarse es `009_gym_as_bd_maestra_module.sql`
(después de correr el rollback si es necesario).
