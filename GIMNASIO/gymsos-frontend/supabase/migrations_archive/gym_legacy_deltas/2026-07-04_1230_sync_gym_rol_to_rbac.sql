-- gymsos-frontend/migrations/2026-07-04_1230_sync_gym_rol_to_rbac.sql
/*
  DESCRIPCIÓN: Resuelve la doble fuente de verdad de roles (Hallazgo J / P9 de la auditoría):
               la columna de texto plano gym.usuarios.rol coexiste con el RBAC de la BD Maestra
               (public.user_roles). Se instala un trigger mediador que, ante cada INSERT/UPDATE
               de gym.usuarios.rol, sincroniza el rol equivalente en public.user_roles.
               El frontend Next.js sigue leyendo gym.usuarios.rol SIN CAMBIOS (gym.usuarios es
               la fuente que escribe; el RBAC se deriva de ella).

  IMPACTO:     + gym.fn_sync_usuario_rol_to_rbac()  (SECURITY DEFINER)
               + trigger tr_sync_gym_rol_to_rbac AFTER INSERT OR UPDATE OF rol ON gym.usuarios
               No altera columnas ni el frontend. Escribe filas en public.user_roles.

  ROLLBACK:    DROP TRIGGER IF EXISTS tr_sync_gym_rol_to_rbac ON gym.usuarios;
               DROP FUNCTION IF EXISTS gym.fn_sync_usuario_rol_to_rbac();
               -- (Las filas ya sincronizadas en public.user_roles permanecen; borrarlas es opcional.)

  DEPENDENCIAS:
               - gym.usuarios(id_usuario, id_gimnasio, rol)   [este repo]
               - gym.gimnasios(id_gimnasio, tenant_id)        [este repo; tenant_id desde 015b]
               - public.roles(id, tenant_id, name)            [BD MAESTRA / EXTERNA]
               - public.user_roles(tenant_id, user_id, role_id) UNIQUE(tenant_id,user_id,role_id) [016]
               - public.audit_logs(tenant_id,event_type,resource_name,payload_after,...) [015b]

  CORRECCIONES DE DISEÑO (vs. enunciado):
               1) gym.usuarios NO tiene columna tenant_id: se DERIVA de gym.gimnasios vía id_gimnasio.
               2) public.roles usa nombres capitalizados; se mapea el enum de texto rol → name.
               3) El identificador de usuario en public.user_roles es user_id (= auth.users.id
                  = gym.usuarios.id_usuario). No existe 'profile_id' en user_roles.

  VALIDACIÓN:  Ver bloque de verificación (comentado) al final.

  RESILIENCIA: toda la lógica va envuelta en EXCEPTION WHEN OTHERS → registra advertencia y
               RETURN NEW. Una falla de sincronización NUNCA bloquea el alta/edición del usuario
               del gimnasio (alta disponibilidad del flujo principal).
*/

-- =====================================================================================
-- 1. FUNCIÓN SINCRONIZADORA
-- =====================================================================================
CREATE OR REPLACE FUNCTION gym.fn_sync_usuario_rol_to_rbac()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gym, public, auth
AS $$
DECLARE
  v_tenant_id  UUID;
  v_role_name  TEXT;
  v_role_id    UUID;
  -- Conjunto de nombres de rol de sistema "mapeables" desde el gimnasio.
  -- Se usa para acotar el borrado del rol anterior SIN tocar roles de otros
  -- módulos (p.ej. ONG) ni asignaciones manuales.
  v_gym_role_names TEXT[] := ARRAY[
    'Administrador General','Supervisor','Cajero',
    'Recepcionista','Entrenador','Nutricionista','Miembro'
  ];
BEGIN
  -- Lógica protegida: cualquier error se captura abajo y NO propaga al INSERT/UPDATE.
  BEGIN

    -- 1.a Derivar el tenant_id del gimnasio del usuario (gym.usuarios no lo almacena).
    SELECT g.tenant_id
      INTO v_tenant_id
      FROM gym.gimnasios g
     WHERE g.id_gimnasio = NEW.id_gimnasio;

    -- 1.b Mapear el enum de texto rol → nombre canónico en public.roles.
    v_role_name := CASE lower(COALESCE(NEW.rol, ''))
      WHEN 'admin'         THEN 'Administrador General'
      WHEN 'gerente'       THEN 'Administrador General'  -- dueño/gerente = admin del tenant gym
      WHEN 'recepcionista' THEN 'Recepcionista'
      WHEN 'entrenador'    THEN 'Entrenador'
      WHEN 'nutricionista' THEN 'Nutricionista'
      WHEN 'miembro'       THEN 'Miembro'
      WHEN 'cliente'       THEN 'Miembro'                -- cliente se trata como miembro
      ELSE NULL                                          -- sin equivalente RBAC (p.ej. rol nuevo)
    END;

    -- 1.c Guardas de resiliencia: sin tenant o sin mapeo → advertir y salir sin bloquear.
    IF v_tenant_id IS NULL THEN
      PERFORM gym._log_sync_warning(
        NULL, NEW.id_usuario, NEW.rol,
        'tenant_id NULL: gimnasio ' || COALESCE(NEW.id_gimnasio::text,'(null)') ||
        ' sin tenant vinculado; no se sincroniza RBAC.'
      );
      RETURN NEW;
    END IF;

    IF v_role_name IS NULL THEN
      PERFORM gym._log_sync_warning(
        v_tenant_id, NEW.id_usuario, NEW.rol,
        'rol sin equivalente en catálogo maestro; no se sincroniza RBAC.'
      );
      RETURN NEW;
    END IF;

    -- 1.d Resolver el role_id en el catálogo maestro para ese tenant.
    SELECT r.id
      INTO v_role_id
      FROM public.roles r
     WHERE r.tenant_id = v_tenant_id
       AND r.name      = v_role_name
     LIMIT 1;

    IF v_role_id IS NULL THEN
      PERFORM gym._log_sync_warning(
        v_tenant_id, NEW.id_usuario, NEW.rol,
        'rol "' || v_role_name || '" no existe en public.roles para el tenant; ' ||
        'ejecutar seed de roles (migración 016) antes de sincronizar.'
      );
      RETURN NEW;
    END IF;

    -- 1.e Si el rol cambió: retirar asignaciones previas de roles-gimnasio distintas
    --     a la nueva (acotado a v_gym_role_names para no borrar roles de otros módulos).
    DELETE FROM public.user_roles ur
     WHERE ur.tenant_id = v_tenant_id
       AND ur.user_id   = NEW.id_usuario
       AND ur.role_id  <> v_role_id
       AND ur.role_id IN (
             SELECT r.id FROM public.roles r
              WHERE r.tenant_id = v_tenant_id
                AND r.name = ANY(v_gym_role_names)
           );

    -- 1.f Garantizar la asignación equivalente (idempotente).
    INSERT INTO public.user_roles (tenant_id, user_id, role_id, assigned_by, assigned_at)
    VALUES (v_tenant_id, NEW.id_usuario, v_role_id, NULL, now())
    ON CONFLICT (tenant_id, user_id, role_id) DO NOTHING;

    RETURN NEW;

  EXCEPTION
    WHEN OTHERS THEN
      -- Resiliencia total: registrar y continuar. El write del gimnasio no se revierte.
      PERFORM gym._log_sync_warning(
        v_tenant_id, NEW.id_usuario, NEW.rol,
        'Excepción en sync RBAC: ' || SQLERRM
      );
      RETURN NEW;
  END;
END;
$$;

COMMENT ON FUNCTION gym.fn_sync_usuario_rol_to_rbac() IS
  'Mediador gym.usuarios.rol → public.user_roles. SECURITY DEFINER, no bloqueante (Hallazgo J / P9).';


-- =====================================================================================
-- 2. HELPER DE LOG DE ADVERTENCIA (no bloqueante)
--    Escribe en public.audit_logs y además emite RAISE WARNING (visible en logs de Postgres).
--    Aislado en su propia función para no anidar EXCEPTION dentro del trigger.
-- =====================================================================================
CREATE OR REPLACE FUNCTION gym._log_sync_warning(
  p_tenant_id UUID,
  p_user_id   UUID,
  p_rol       TEXT,
  p_detail    TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, gym
AS $$
BEGIN
  RAISE WARNING '[sync_gym_rol_to_rbac] user=% rol=% tenant=% :: %',
    p_user_id, p_rol, p_tenant_id, p_detail;

  -- Persistir el aviso; si audit_logs no acepta la fila, no se propaga el error.
  BEGIN
    INSERT INTO public.audit_logs (tenant_id, actor_id, event_type, resource_name, payload_after)
    VALUES (
      p_tenant_id,
      p_user_id,
      'SYNC_WARNING',
      'gym.usuarios.rol->public.user_roles',
      jsonb_build_object('rol', p_rol, 'detail', p_detail, 'at', now())
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;  -- el RAISE WARNING ya dejó traza; nunca bloquear.
  END;
END;
$$;

COMMENT ON FUNCTION gym._log_sync_warning(UUID, UUID, TEXT, TEXT) IS
  'Registra advertencias de sincronización de roles en public.audit_logs sin bloquear la operación.';


-- =====================================================================================
-- 3. TRIGGER
--    AFTER INSERT OR UPDATE OF rol: en INSERT dispara siempre; en UPDATE solo si cambia 'rol'.
-- =====================================================================================
DROP TRIGGER IF EXISTS tr_sync_gym_rol_to_rbac ON gym.usuarios;

CREATE TRIGGER tr_sync_gym_rol_to_rbac
  AFTER INSERT OR UPDATE OF rol
  ON gym.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION gym.fn_sync_usuario_rol_to_rbac();


-- =====================================================================================
-- 4. VALIDACIÓN (ejecutar tras aplicar; solo lectura)
-- =====================================================================================
-- -- Verificar que el trigger existe:
-- SELECT tgname FROM pg_trigger
--  WHERE tgrelid = 'gym.usuarios'::regclass AND tgname = 'tr_sync_gym_rol_to_rbac';
--
-- -- Prueba manual (en tenant con roles sembrados):
-- --   UPDATE gym.usuarios SET rol = 'entrenador' WHERE id_usuario = '<uuid>';
-- --   SELECT ur.role_id, r.name
-- --     FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
-- --    WHERE ur.user_id = '<uuid>';
