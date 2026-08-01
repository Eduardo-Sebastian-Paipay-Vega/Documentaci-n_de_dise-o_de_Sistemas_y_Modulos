# SUMMARY — Fase 3: Endurecimiento RLS (migración 021)

## Qué se hizo
Se generó `021_security_hardening_rls.sql`: revoca los privilegios masivos de la migración 009,
activa RLS multi-tenant unificado en el esquema `gym`, blinda las 9 tablas huérfanas de `public`
(6 por tenant, 3 en deny-all) y cierra el acceso anónimo a los códigos.

## Por qué se hizo
La migración 009 dejó `authenticated` con escritura sobre todo `gym.*` y varias tablas sin RLS,
además de lectura `anon` sobre códigos. Era la mayor deuda de seguridad de la auditoría (P5/P6/P7/P15).

## Qué beneficio aporta
- Aislamiento por tenant real e infranqueable (RLS + privilegios por tabla).
- Principio de mínimo privilegio: solo SELECT en módulos de innovación sin UI.
- Sin enumeración de códigos: validación anónima solo por RPC `fn_validate_code`.
- Código muerto (3 tablas) invisible para la API pública.
- Rendimiento del RLS asegurado con índices de cruce.

## Qué funcionalidades quedaron afectadas
- Acceso a datos de `gym.*`: ahora filtrado estrictamente por tenant activo.
- Lectura anónima de `public.codes` y `gym.codigos_acceso`: eliminada (sin impacto en ONG, que usa Service Role).
- Escritura directa en tablas de innovación `gym`: bloqueada a nivel de privilegio (solo lectura).
- Frontend del Gimnasio: sin cambios (usa RPCs, no columnas directas de códigos).
