export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  gym: {
    Tables: {
      accesos: {
        Row: {
          created_at: string
          estado_acceso: string
          fecha_hora_entrada: string
          fecha_hora_salida: string | null
          id_acceso: string
          id_gimnasio: string
          id_usuario: string
          razon_denegacion: string | null
          tipo_acceso: string
        }
        Insert: {
          created_at?: string
          estado_acceso?: string
          fecha_hora_entrada?: string
          fecha_hora_salida?: string | null
          id_acceso?: string
          id_gimnasio: string
          id_usuario: string
          razon_denegacion?: string | null
          tipo_acceso?: string
        }
        Update: {
          created_at?: string
          estado_acceso?: string
          fecha_hora_entrada?: string
          fecha_hora_salida?: string | null
          id_acceso?: string
          id_gimnasio?: string
          id_usuario?: string
          razon_denegacion?: string | null
          tipo_acceso?: string
        }
        Relationships: [
          {
            foreignKeyName: "accesos_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
          {
            foreignKeyName: "accesos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          aceptada: boolean | null
          contenido_json: Json
          fecha_generacion: string
          id_recomendacion: string
          id_usuario: string
          mostrada: boolean | null
          score_relevancia: number | null
          tipo: string
        }
        Insert: {
          aceptada?: boolean | null
          contenido_json?: Json
          fecha_generacion?: string
          id_recomendacion?: string
          id_usuario: string
          mostrada?: boolean | null
          score_relevancia?: number | null
          tipo: string
        }
        Update: {
          aceptada?: boolean | null
          contenido_json?: Json
          fecha_generacion?: string
          id_recomendacion?: string
          id_usuario?: string
          mostrada?: boolean | null
          score_relevancia?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      asistencias: {
        Row: {
          created_at: string
          estado_asistencia: string
          fecha_asistencia: string
          id_asistencia: string
          id_clase: string | null
          id_usuario: string
          minutos_asistidos: number | null
        }
        Insert: {
          created_at?: string
          estado_asistencia?: string
          fecha_asistencia?: string
          id_asistencia?: string
          id_clase?: string | null
          id_usuario: string
          minutos_asistidos?: number | null
        }
        Update: {
          created_at?: string
          estado_asistencia?: string
          fecha_asistencia?: string
          id_asistencia?: string
          id_clase?: string | null
          id_usuario?: string
          minutos_asistidos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_id_clase_fkey"
            columns: ["id_clase"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id_clase"]
          },
          {
            foreignKeyName: "asistencias_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      churn_interventions: {
        Row: {
          fecha_oferta: string
          fecha_respuesta: string | null
          id_intervencion: string
          id_prediction: string | null
          id_usuario: string
          oferta_valor: string | null
          resultado: string | null
          tipo_intervencion: string
        }
        Insert: {
          fecha_oferta?: string
          fecha_respuesta?: string | null
          id_intervencion?: string
          id_prediction?: string | null
          id_usuario: string
          oferta_valor?: string | null
          resultado?: string | null
          tipo_intervencion: string
        }
        Update: {
          fecha_oferta?: string
          fecha_respuesta?: string | null
          id_intervencion?: string
          id_prediction?: string | null
          id_usuario?: string
          oferta_valor?: string | null
          resultado?: string | null
          tipo_intervencion?: string
        }
        Relationships: [
          {
            foreignKeyName: "churn_interventions_id_prediction_fkey"
            columns: ["id_prediction"]
            isOneToOne: false
            referencedRelation: "churn_predictions"
            referencedColumns: ["id_prediction"]
          },
          {
            foreignKeyName: "churn_interventions_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      churn_predictions: {
        Row: {
          accion_ejecutada: string | null
          dias_para_abandono: number | null
          fecha_prediccion: string
          id_prediction: string
          id_usuario: string
          probability_churn: number
          razon_principal: string | null
          resultado: string | null
          score_riesgo: number
          ultima_sesion: string | null
        }
        Insert: {
          accion_ejecutada?: string | null
          dias_para_abandono?: number | null
          fecha_prediccion?: string
          id_prediction?: string
          id_usuario: string
          probability_churn: number
          razon_principal?: string | null
          resultado?: string | null
          score_riesgo: number
          ultima_sesion?: string | null
        }
        Update: {
          accion_ejecutada?: string | null
          dias_para_abandono?: number | null
          fecha_prediccion?: string
          id_prediction?: string
          id_usuario?: string
          probability_churn?: number
          razon_principal?: string | null
          resultado?: string | null
          score_riesgo?: number
          ultima_sesion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "churn_predictions_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      clases: {
        Row: {
          capacidad_maxima: number
          created_at: string
          descripcion: string | null
          dias_semana: string | null
          duracion_minutos: number
          estado: string
          fecha_hora_inicio: string
          id_clase: string
          id_entrenador: string | null
          id_espacio: string | null
          id_gimnasio: string
          nivel: string | null
          nombre: string
          recurrencia: string | null
        }
        Insert: {
          capacidad_maxima?: number
          created_at?: string
          descripcion?: string | null
          dias_semana?: string | null
          duracion_minutos?: number
          estado?: string
          fecha_hora_inicio: string
          id_clase?: string
          id_entrenador?: string | null
          id_espacio?: string | null
          id_gimnasio: string
          nivel?: string | null
          nombre: string
          recurrencia?: string | null
        }
        Update: {
          capacidad_maxima?: number
          created_at?: string
          descripcion?: string | null
          dias_semana?: string | null
          duracion_minutos?: number
          estado?: string
          fecha_hora_inicio?: string
          id_clase?: string
          id_entrenador?: string | null
          id_espacio?: string | null
          id_gimnasio?: string
          nivel?: string | null
          nombre?: string
          recurrencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clases_id_entrenador_fkey"
            columns: ["id_entrenador"]
            isOneToOne: false
            referencedRelation: "entrenadores"
            referencedColumns: ["id_entrenador"]
          },
          {
            foreignKeyName: "clases_id_espacio_fkey"
            columns: ["id_espacio"]
            isOneToOne: false
            referencedRelation: "espacios"
            referencedColumns: ["id_espacio"]
          },
          {
            foreignKeyName: "clases_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
        ]
      }
      codigos_acceso: {
        Row: {
          activo: boolean
          codigo: string
          creado_por: string | null
          created_at: string
          descripcion: string | null
          fecha_expiracion: string | null
          id_codigo: string
          id_gimnasio: string
          tipo: string
          usos_actuales: number
          usos_max: number | null
        }
        Insert: {
          activo?: boolean
          codigo: string
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          fecha_expiracion?: string | null
          id_codigo?: string
          id_gimnasio: string
          tipo?: string
          usos_actuales?: number
          usos_max?: number | null
        }
        Update: {
          activo?: boolean
          codigo?: string
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          fecha_expiracion?: string | null
          id_codigo?: string
          id_gimnasio?: string
          tipo?: string
          usos_actuales?: number
          usos_max?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "codigos_acceso_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
          {
            foreignKeyName: "codigos_acceso_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
        ]
      }
      digital_twin: {
        Row: {
          altura_cm: number | null
          configuracion_avatar: Json | null
          fecha_actualizacion: string
          id_usuario: string
          peso_kg: number | null
          peso_kg_inicial: number | null
          porcentaje_grasa: number | null
          prediccion_12w: string | null
        }
        Insert: {
          altura_cm?: number | null
          configuracion_avatar?: Json | null
          fecha_actualizacion?: string
          id_usuario: string
          peso_kg?: number | null
          peso_kg_inicial?: number | null
          porcentaje_grasa?: number | null
          prediccion_12w?: string | null
        }
        Update: {
          altura_cm?: number | null
          configuracion_avatar?: Json | null
          fecha_actualizacion?: string
          id_usuario?: string
          peso_kg?: number | null
          peso_kg_inicial?: number | null
          porcentaje_grasa?: number | null
          prediccion_12w?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_twin_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      entrenadores: {
        Row: {
          biografia: string | null
          certificaciones: string | null
          especialidades: string | null
          id_entrenador: string
          id_usuario: string | null
          rating_promedio: number | null
          total_clases_dictadas: number | null
          total_clientes_activos: number | null
        }
        Insert: {
          biografia?: string | null
          certificaciones?: string | null
          especialidades?: string | null
          id_entrenador?: string
          id_usuario?: string | null
          rating_promedio?: number | null
          total_clases_dictadas?: number | null
          total_clientes_activos?: number | null
        }
        Update: {
          biografia?: string | null
          certificaciones?: string | null
          especialidades?: string | null
          id_entrenador?: string
          id_usuario?: string | null
          rating_promedio?: number | null
          total_clases_dictadas?: number | null
          total_clientes_activos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entrenadores_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      espacios: {
        Row: {
          capacidad_maxima: number
          estado: string
          horario_disponibilidad: string | null
          id_espacio: string
          id_gimnasio: string
          nombre: string
          tiene_aire_acondicionado: boolean | null
          tipo: string
        }
        Insert: {
          capacidad_maxima?: number
          estado?: string
          horario_disponibilidad?: string | null
          id_espacio?: string
          id_gimnasio: string
          nombre: string
          tiene_aire_acondicionado?: boolean | null
          tipo?: string
        }
        Update: {
          capacidad_maxima?: number
          estado?: string
          horario_disponibilidad?: string | null
          id_espacio?: string
          id_gimnasio?: string
          nombre?: string
          tiene_aire_acondicionado?: boolean | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "espacios_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
        ]
      }
      gamification_levels: {
        Row: {
          fecha_actualizacion: string
          fecha_ultimo_nivel: string | null
          id_usuario: string
          nivel_actual: number
          xp_proximo_nivel: number
          xp_total: number
        }
        Insert: {
          fecha_actualizacion?: string
          fecha_ultimo_nivel?: string | null
          id_usuario: string
          nivel_actual?: number
          xp_proximo_nivel?: number
          xp_total?: number
        }
        Update: {
          fecha_actualizacion?: string
          fecha_ultimo_nivel?: string | null
          id_usuario?: string
          nivel_actual?: number
          xp_proximo_nivel?: number
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "gamification_levels_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      gamification_xp: {
        Row: {
          cantidad_xp: number
          descripcion: string | null
          fecha_evento: string
          id_referencia: string | null
          id_usuario: string
          id_xp: string
          tipo_evento: string
        }
        Insert: {
          cantidad_xp: number
          descripcion?: string | null
          fecha_evento?: string
          id_referencia?: string | null
          id_usuario: string
          id_xp?: string
          tipo_evento: string
        }
        Update: {
          cantidad_xp?: number
          descripcion?: string | null
          fecha_evento?: string
          id_referencia?: string | null
          id_usuario?: string
          id_xp?: string
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_xp_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      gimnasios: {
        Row: {
          ciudad: string | null
          codigo_acceso: string | null
          created_at: string
          direccion: string | null
          email: string | null
          estado: string
          fecha_inicio_suscripcion: string
          fecha_renovacion: string | null
          id_gimnasio: string
          logo_url: string | null
          nombre: string
          pais: string | null
          plan_suscripcion: string
          ruc: string | null
          telefono: string | null
          tenant_id: string | null
        }
        Insert: {
          ciudad?: string | null
          codigo_acceso?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          estado?: string
          fecha_inicio_suscripcion?: string
          fecha_renovacion?: string | null
          id_gimnasio?: string
          logo_url?: string | null
          nombre: string
          pais?: string | null
          plan_suscripcion?: string
          ruc?: string | null
          telefono?: string | null
          tenant_id?: string | null
        }
        Update: {
          ciudad?: string | null
          codigo_acceso?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          estado?: string
          fecha_inicio_suscripcion?: string
          fecha_renovacion?: string | null
          id_gimnasio?: string
          logo_url?: string | null
          nombre?: string
          pais?: string | null
          plan_suscripcion?: string
          ruc?: string | null
          telefono?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      health_alerts: {
        Row: {
          accion_recomendada: string | null
          descripcion: string
          fecha_alerta: string
          id_alerta: string
          id_usuario: string
          leida: boolean | null
          severidad: string
          tipo_alerta: string
        }
        Insert: {
          accion_recomendada?: string | null
          descripcion: string
          fecha_alerta?: string
          id_alerta?: string
          id_usuario: string
          leida?: boolean | null
          severidad: string
          tipo_alerta: string
        }
        Update: {
          accion_recomendada?: string | null
          descripcion?: string
          fecha_alerta?: string
          id_alerta?: string
          id_usuario?: string
          leida?: boolean | null
          severidad?: string
          tipo_alerta?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_alerts_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      inscripciones: {
        Row: {
          created_at: string
          estado: string
          fecha_inscripcion: string
          id_clase: string
          id_inscripcion: string
          id_usuario: string
          notificacion_enviada: boolean | null
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha_inscripcion?: string
          id_clase: string
          id_inscripcion?: string
          id_usuario: string
          notificacion_enviada?: boolean | null
        }
        Update: {
          created_at?: string
          estado?: string
          fecha_inscripcion?: string
          id_clase?: string
          id_inscripcion?: string
          id_usuario?: string
          notificacion_enviada?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_id_clase_fkey"
            columns: ["id_clase"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id_clase"]
          },
          {
            foreignKeyName: "inscripciones_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      maquinas: {
        Row: {
          codigo_qr: string | null
          estado: string
          fecha_compra: string | null
          fecha_mantenimiento_proximo: string | null
          fecha_mantenimiento_ultimo: string | null
          id_espacio: string
          id_maquina: string
          marca: string | null
          modelo: string | null
          nombre: string
          notas_seguridad: string | null
          url_video_tutorial: string | null
        }
        Insert: {
          codigo_qr?: string | null
          estado?: string
          fecha_compra?: string | null
          fecha_mantenimiento_proximo?: string | null
          fecha_mantenimiento_ultimo?: string | null
          id_espacio: string
          id_maquina?: string
          marca?: string | null
          modelo?: string | null
          nombre: string
          notas_seguridad?: string | null
          url_video_tutorial?: string | null
        }
        Update: {
          codigo_qr?: string | null
          estado?: string
          fecha_compra?: string | null
          fecha_mantenimiento_proximo?: string | null
          fecha_mantenimiento_ultimo?: string | null
          id_espacio?: string
          id_maquina?: string
          marca?: string | null
          modelo?: string | null
          nombre?: string
          notas_seguridad?: string | null
          url_video_tutorial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maquinas_id_espacio_fkey"
            columns: ["id_espacio"]
            isOneToOne: false
            referencedRelation: "espacios"
            referencedColumns: ["id_espacio"]
          },
        ]
      }
      membresias: {
        Row: {
          created_at: string
          estado: string
          fecha_inicio: string
          fecha_vencimiento: string
          id_membresia: string
          id_plan: string
          id_usuario: string
          motivo_cancelacion: string | null
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha_inicio?: string
          fecha_vencimiento: string
          id_membresia?: string
          id_plan: string
          id_usuario: string
          motivo_cancelacion?: string | null
        }
        Update: {
          created_at?: string
          estado?: string
          fecha_inicio?: string
          fecha_vencimiento?: string
          id_membresia?: string
          id_plan?: string
          id_usuario?: string
          motivo_cancelacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membresias_id_plan_fkey"
            columns: ["id_plan"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id_plan"]
          },
          {
            foreignKeyName: "membresias_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      pagos: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: string
          fecha_pago: string
          id_membresia: string | null
          id_pago: string
          id_transaccion_stripe: string | null
          id_usuario: string
          metodo_pago: string
          moneda: string
          monto: number
          proxima_renovacion: string | null
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_pago?: string
          id_membresia?: string | null
          id_pago?: string
          id_transaccion_stripe?: string | null
          id_usuario: string
          metodo_pago?: string
          moneda?: string
          monto: number
          proxima_renovacion?: string | null
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_pago?: string
          id_membresia?: string | null
          id_pago?: string
          id_transaccion_stripe?: string | null
          id_usuario?: string
          metodo_pago?: string
          moneda?: string
          monto?: number
          proxima_renovacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_id_membresia_fkey"
            columns: ["id_membresia"]
            isOneToOne: false
            referencedRelation: "membresias"
            referencedColumns: ["id_membresia"]
          },
          {
            foreignKeyName: "pagos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      planes: {
        Row: {
          activo: boolean
          clases_incluidas: number | null
          created_at: string
          descripcion: string | null
          duracion_dias: number
          horarios_acceso: string | null
          id_gimnasio: string | null
          id_plan: string
          nombre: string
          precio_anual: number | null
          precio_mensual: number
          precio_trimestral: number | null
          sucursales_incluidas: string
        }
        Insert: {
          activo?: boolean
          clases_incluidas?: number | null
          created_at?: string
          descripcion?: string | null
          duracion_dias?: number
          horarios_acceso?: string | null
          id_gimnasio?: string | null
          id_plan?: string
          nombre: string
          precio_anual?: number | null
          precio_mensual: number
          precio_trimestral?: number | null
          sucursales_incluidas?: string
        }
        Update: {
          activo?: boolean
          clases_incluidas?: number | null
          created_at?: string
          descripcion?: string | null
          duracion_dias?: number
          horarios_acceso?: string | null
          id_gimnasio?: string | null
          id_plan?: string
          nombre?: string
          precio_anual?: number | null
          precio_mensual?: number
          precio_trimestral?: number | null
          sucursales_incluidas?: string
        }
        Relationships: [
          {
            foreignKeyName: "planes_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
        ]
      }
      promociones: {
        Row: {
          codigo: string
          descripcion: string | null
          estado: string
          fecha_fin: string
          fecha_inicio: string
          id_gimnasio: string
          id_promocion: string
          limite_uso: number | null
          tipo_descuento: string
          usos_realizados: number | null
          valor_descuento: number
        }
        Insert: {
          codigo: string
          descripcion?: string | null
          estado?: string
          fecha_fin: string
          fecha_inicio: string
          id_gimnasio: string
          id_promocion?: string
          limite_uso?: number | null
          tipo_descuento: string
          usos_realizados?: number | null
          valor_descuento: number
        }
        Update: {
          codigo?: string
          descripcion?: string | null
          estado?: string
          fecha_fin?: string
          fecha_inicio?: string
          id_gimnasio?: string
          id_promocion?: string
          limite_uso?: number | null
          tipo_descuento?: string
          usos_realizados?: number | null
          valor_descuento?: number
        }
        Relationships: [
          {
            foreignKeyName: "promociones_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
        ]
      }
      usuarios: {
        Row: {
          cargo: string | null
          created_at: string
          documento: string | null
          email: string
          estado: string
          fecha_nacimiento: string | null
          foto_url: string | null
          genero: string | null
          id_gimnasio: string
          id_usuario: string
          nombre: string
          rol: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          documento?: string | null
          email: string
          estado?: string
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          id_gimnasio: string
          id_usuario: string
          nombre: string
          rol?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string
          documento?: string | null
          email?: string
          estado?: string
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          id_gimnasio?: string
          id_usuario?: string
          nombre?: string
          rol?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_id_gimnasio_fkey"
            columns: ["id_gimnasio"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id_gimnasio"]
          },
        ]
      }
      wearable_sync: {
        Row: {
          datos_salud_json: Json | null
          fecha_actualizacion: string
          id_sync: string
          id_usuario: string
          tipo_wearable: string
          token_autenticacion: string | null
          ultima_sincronizacion: string | null
        }
        Insert: {
          datos_salud_json?: Json | null
          fecha_actualizacion?: string
          id_sync?: string
          id_usuario: string
          tipo_wearable: string
          token_autenticacion?: string | null
          ultima_sincronizacion?: string | null
        }
        Update: {
          datos_salud_json?: Json | null
          fecha_actualizacion?: string
          id_sync?: string
          id_usuario?: string
          tipo_wearable?: string
          token_autenticacion?: string | null
          ultima_sincronizacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_sync_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _log_sync_warning: {
        Args: {
          p_detail: string
          p_rol: string
          p_tenant_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      bootstrap_gym_tenant: {
        Args: {
          p_cargo?: string
          p_ciudad?: string
          p_direccion?: string
          p_email?: string
          p_nombre: string
          p_pais?: string
          p_plan?: string
          p_ruc?: string
          p_telefono?: string
        }
        Returns: Json
      }
      current_gym_id: { Args: never; Returns: string }
      join_gym_with_code: {
        Args: { p_cargo?: string; p_codigo: string; p_nombre?: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  ong: {
    Tables: {
      actividades: {
        Row: {
          codigo_estado: string
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          horas_estimadas: number | null
          id: string
          id_proyecto: string | null
          id_ubicacion: string | null
          tenant_id: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          codigo_estado?: string
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          horas_estimadas?: number | null
          id?: string
          id_proyecto?: string | null
          id_ubicacion?: string | null
          tenant_id?: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          codigo_estado?: string
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          horas_estimadas?: number | null
          id?: string
          id_proyecto?: string | null
          id_ubicacion?: string | null
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actividades_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_requirements: {
        Row: {
          created_at: string | null
          created_by: string | null
          descripcion_requisito: string
          es_obligatorio: boolean | null
          id: string
          id_actividad: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descripcion_requisito: string
          es_obligatorio?: boolean | null
          id?: string
          id_actividad: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descripcion_requisito?: string
          es_obligatorio?: boolean | null
          id?: string
          id_actividad?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_requirements_id_actividad_fkey"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
        ]
      }
      aprobaciones: {
        Row: {
          comentario: string | null
          created_at: string
          created_by: string | null
          entidad_id: string
          entidad_schema: string
          entidad_tabla: string
          estado: string
          id: string
          modulo: string
          requested_at: string
          resolved_at: string | null
          resuelto_por: string | null
          solicitado_por: string | null
          tenant_id: string
          tipo_aprobacion: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          created_by?: string | null
          entidad_id: string
          entidad_schema: string
          entidad_tabla: string
          estado?: string
          id?: string
          modulo: string
          requested_at?: string
          resolved_at?: string | null
          resuelto_por?: string | null
          solicitado_por?: string | null
          tenant_id?: string
          tipo_aprobacion: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          comentario?: string | null
          created_at?: string
          created_by?: string | null
          entidad_id?: string
          entidad_schema?: string
          entidad_tabla?: string
          estado?: string
          id?: string
          modulo?: string
          requested_at?: string
          resolved_at?: string | null
          resuelto_por?: string | null
          solicitado_por?: string | null
          tenant_id?: string
          tipo_aprobacion?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      areas: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          id: string
          nombre_area: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre_area: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre_area?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      asignaciones_actividad: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          id_actividad: string
          id_voluntario: string
          is_deleted: boolean
          rol_en_actividad: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          id_actividad: string
          id_voluntario: string
          is_deleted?: boolean
          rol_en_actividad?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          id_actividad?: string
          id_voluntario?: string
          is_deleted?: boolean
          rol_en_actividad?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_actividad_id_actividad_fkey"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ong_asig_act_id_actividad"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ong_asig_act_id_voluntario"
            columns: ["id_voluntario"]
            isOneToOne: false
            referencedRelation: "voluntarios"
            referencedColumns: ["id"]
          },
        ]
      }
      asignaciones_proyecto: {
        Row: {
          activo: boolean | null
          created_at: string | null
          created_by: string | null
          fecha_ingreso: string | null
          id: string
          id_proyecto: string
          id_voluntario: string
          rol_en_proyecto: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          fecha_ingreso?: string | null
          id?: string
          id_proyecto: string
          id_voluntario: string
          rol_en_proyecto?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          fecha_ingreso?: string | null
          id?: string
          id_proyecto?: string
          id_voluntario?: string
          rol_en_proyecto?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_proyecto_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      asistencias: {
        Row: {
          check_in_at: string | null
          check_out_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          estado: string
          fecha_operacion: string
          id: string
          id_actividad: string
          id_card_id: string | null
          id_voluntario: string
          is_deleted: boolean
          observacion: string | null
          origen_registro: string
          qr_payload: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          estado?: string
          fecha_operacion?: string
          id?: string
          id_actividad: string
          id_card_id?: string | null
          id_voluntario: string
          is_deleted?: boolean
          observacion?: string | null
          origen_registro?: string
          qr_payload?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          estado?: string
          fecha_operacion?: string
          id?: string
          id_actividad?: string
          id_card_id?: string | null
          id_voluntario?: string
          is_deleted?: boolean
          observacion?: string | null
          origen_registro?: string
          qr_payload?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_id_actividad_fkey"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencias_id_voluntario_fkey"
            columns: ["id_voluntario"]
            isOneToOne: false
            referencedRelation: "voluntarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ong_asistencias_id_card"
            columns: ["id_card_id"]
            isOneToOne: false
            referencedRelation: "id_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiarios: {
        Row: {
          apellido: string
          codigo_pais: string | null
          created_at: string
          created_by: string | null
          direccion: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          genero: string | null
          id: string
          nombre: string
          numero_documento: string | null
          observaciones: string | null
          telefono: string | null
          tenant_id: string
          tipo_documento: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          apellido: string
          codigo_pais?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          nombre: string
          numero_documento?: string | null
          observaciones?: string | null
          telefono?: string | null
          tenant_id?: string
          tipo_documento?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          apellido?: string
          codigo_pais?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          nombre?: string
          numero_documento?: string | null
          observaciones?: string | null
          telefono?: string | null
          tenant_id?: string
          tipo_documento?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      estados_objeto: {
        Row: {
          codigo: string
          descripcion: string | null
          nombre: string
        }
        Insert: {
          codigo: string
          descripcion?: string | null
          nombre: string
        }
        Update: {
          codigo?: string
          descripcion?: string | null
          nombre?: string
        }
        Relationships: []
      }
      estados_proyecto: {
        Row: {
          codigo: string
          nombre_estado: string
          orden_visual: number
        }
        Insert: {
          codigo: string
          nombre_estado: string
          orden_visual?: number
        }
        Update: {
          codigo?: string
          nombre_estado?: string
          orden_visual?: number
        }
        Relationships: []
      }
      estados_voluntario: {
        Row: {
          codigo: string
          descripcion: string | null
          nombre_estado: string
          orden_visual: number
        }
        Insert: {
          codigo: string
          descripcion?: string | null
          nombre_estado: string
          orden_visual?: number
        }
        Update: {
          codigo?: string
          descripcion?: string | null
          nombre_estado?: string
          orden_visual?: number
        }
        Relationships: []
      }
      evidencias_actividad: {
        Row: {
          comentario: string | null
          created_at: string | null
          created_by: string | null
          id: string
          id_actividad: string
          id_voluntario: string
          tenant_id: string
          tipo_evidencia: string | null
          updated_at: string | null
          updated_by: string | null
          url_archivo: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          id_actividad: string
          id_voluntario: string
          tenant_id?: string
          tipo_evidencia?: string | null
          updated_at?: string | null
          updated_by?: string | null
          url_archivo: string
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          id_actividad?: string
          id_voluntario?: string
          tenant_id?: string
          tipo_evidencia?: string | null
          updated_at?: string | null
          updated_by?: string | null
          url_archivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_actividad_id_actividad_fkey"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ong_evid_act_id_actividad"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
        ]
      }
      horas_actividad: {
        Row: {
          aprobado_por: string | null
          comentario_resolucion: string | null
          created_at: string | null
          created_by: string | null
          estado_aprobacion: string | null
          fecha: string
          horas_registradas: number
          id: string
          id_actividad: string
          id_aprobacion: string | null
          id_voluntario: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          aprobado_por?: string | null
          comentario_resolucion?: string | null
          created_at?: string | null
          created_by?: string | null
          estado_aprobacion?: string | null
          fecha: string
          horas_registradas: number
          id?: string
          id_actividad: string
          id_aprobacion?: string | null
          id_voluntario: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          aprobado_por?: string | null
          comentario_resolucion?: string | null
          created_at?: string | null
          created_by?: string | null
          estado_aprobacion?: string | null
          fecha?: string
          horas_registradas?: number
          id?: string
          id_actividad?: string
          id_aprobacion?: string | null
          id_voluntario?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_horas_actividad_id_voluntario"
            columns: ["id_voluntario"]
            isOneToOne: false
            referencedRelation: "voluntarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horas_actividad_id_actividad_fkey"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horas_actividad_id_aprobacion_fkey"
            columns: ["id_aprobacion"]
            isOneToOne: false
            referencedRelation: "aprobaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      id_card_template_fields: {
        Row: {
          color_hex: string | null
          created_at: string
          field_key: string
          font_family: string | null
          font_size: number | null
          font_weight: string | null
          height: number | null
          id: string
          id_template: string
          pos_x: number
          pos_y: number
          tenant_id: string
          updated_at: string
          width: number | null
          z_index: number
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          field_key: string
          font_family?: string | null
          font_size?: number | null
          font_weight?: string | null
          height?: number | null
          id?: string
          id_template: string
          pos_x: number
          pos_y: number
          tenant_id?: string
          updated_at?: string
          width?: number | null
          z_index?: number
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          field_key?: string
          font_family?: string | null
          font_size?: number | null
          font_weight?: string | null
          height?: number | null
          id?: string
          id_template?: string
          pos_x?: number
          pos_y?: number
          tenant_id?: string
          updated_at?: string
          width?: number | null
          z_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "id_card_template_fields_id_template_fkey"
            columns: ["id_template"]
            isOneToOne: false
            referencedRelation: "id_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      id_card_templates: {
        Row: {
          activa: boolean
          base_image_url: string
          created_at: string
          created_by: string | null
          id: string
          nombre: string
          template_config: Json | null
          template_height: number
          template_width: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activa?: boolean
          base_image_url: string
          created_at?: string
          created_by?: string | null
          id?: string
          nombre: string
          template_config?: Json | null
          template_height: number
          template_width: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activa?: boolean
          base_image_url?: string
          created_at?: string
          created_by?: string | null
          id?: string
          nombre?: string
          template_config?: Json | null
          template_height?: number
          template_width?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      id_cards: {
        Row: {
          card_code: string
          created_at: string
          created_by: string | null
          estado: string
          expires_at: string | null
          id: string
          id_template: string
          id_voluntario: string
          image_render_url: string | null
          issued_at: string
          qr_payload: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          card_code: string
          created_at?: string
          created_by?: string | null
          estado?: string
          expires_at?: string | null
          id?: string
          id_template: string
          id_voluntario: string
          image_render_url?: string | null
          issued_at?: string
          qr_payload: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          card_code?: string
          created_at?: string
          created_by?: string | null
          estado?: string
          expires_at?: string | null
          id?: string
          id_template?: string
          id_voluntario?: string
          image_render_url?: string | null
          issued_at?: string
          qr_payload?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "id_cards_id_template_fkey"
            columns: ["id_template"]
            isOneToOne: false
            referencedRelation: "id_card_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "id_cards_id_voluntario_fkey"
            columns: ["id_voluntario"]
            isOneToOne: false
            referencedRelation: "voluntarios"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          activo: boolean
          codigo: string
          codigo_estado_objeto: string
          codigo_unidad_medida: string
          created_at: string
          created_by: string | null
          descripcion: string
          id: string
          imagen_url: string | null
          nombre_item: string
          sku: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activo?: boolean
          codigo: string
          codigo_estado_objeto: string
          codigo_unidad_medida: string
          created_at?: string
          created_by?: string | null
          descripcion: string
          id?: string
          imagen_url?: string | null
          nombre_item: string
          sku?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activo?: boolean
          codigo?: string
          codigo_estado_objeto?: string
          codigo_unidad_medida?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string
          id?: string
          imagen_url?: string | null
          nombre_item?: string
          sku?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_codigo_estado_objeto_fkey"
            columns: ["codigo_estado_objeto"]
            isOneToOne: false
            referencedRelation: "estados_objeto"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "items_codigo_unidad_medida_fkey"
            columns: ["codigo_unidad_medida"]
            isOneToOne: false
            referencedRelation: "unidades_medida"
            referencedColumns: ["codigo"]
          },
        ]
      }
      logros_beneficiario: {
        Row: {
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          fecha_logro: string
          id: string
          id_beneficiario: string
          tenant_id: string
          titulo_logro: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          fecha_logro: string
          id?: string
          id_beneficiario: string
          tenant_id?: string
          titulo_logro: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          fecha_logro?: string
          id?: string
          id_beneficiario?: string
          tenant_id?: string
          titulo_logro?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_logros_benef_id_beneficiario"
            columns: ["id_beneficiario"]
            isOneToOne: false
            referencedRelation: "beneficiarios"
            referencedColumns: ["id"]
          },
        ]
      }
      participaciones_proyecto: {
        Row: {
          created_at: string | null
          created_by: string | null
          fecha_vinculacion: string | null
          id: string
          id_beneficiario: string
          id_proyecto: string
          observaciones: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          fecha_vinculacion?: string | null
          id?: string
          id_beneficiario: string
          id_proyecto: string
          observaciones?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          fecha_vinculacion?: string | null
          id?: string
          id_beneficiario?: string
          id_proyecto?: string
          observaciones?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_part_proj_id_beneficiario"
            columns: ["id_beneficiario"]
            isOneToOne: false
            referencedRelation: "beneficiarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ong_part_proj_id_proyecto"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participaciones_proyecto_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          codigo: string
          codigo_estado: string
          created_at: string
          created_by: string | null
          descripcion: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          id_area: string
          imagen_url: string | null
          nombre_proyecto: string
          presupuesto: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          codigo: string
          codigo_estado: string
          created_at?: string
          created_by?: string | null
          descripcion: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          id_area: string
          imagen_url?: string | null
          nombre_proyecto: string
          presupuesto?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          codigo?: string
          codigo_estado?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          id_area?: string
          imagen_url?: string | null
          nombre_proyecto?: string
          presupuesto?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_proyectos_id_area"
            columns: ["id_area"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyectos_codigo_estado_fkey"
            columns: ["codigo_estado"]
            isOneToOne: false
            referencedRelation: "estados_proyecto"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "proyectos_id_area_fkey"
            columns: ["id_area"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_proyecto: {
        Row: {
          cantidad_asignada: number | null
          cantidad_requerida: number
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          id_item: string
          id_proyecto: string
          is_deleted: boolean
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cantidad_asignada?: number | null
          cantidad_requerida: number
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          id_item: string
          id_proyecto: string
          is_deleted?: boolean
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cantidad_asignada?: number | null
          cantidad_requerida?: number
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          id_item?: string
          id_proyecto?: string
          is_deleted?: boolean
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_recursos_proyecto_id_proyecto"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_proyecto_id_item_fkey"
            columns: ["id_item"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_proyecto_id_proyecto_fkey"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisiones: {
        Row: {
          created_at: string | null
          created_by: string | null
          fecha_asignacion: string
          id: string
          id_proyecto: string
          supervisor_id: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          fecha_asignacion: string
          id?: string
          id_proyecto: string
          supervisor_id: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          fecha_asignacion?: string
          id?: string
          id_proyecto?: string
          supervisor_id?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_supervisiones_id_proyecto"
            columns: ["id_proyecto"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas: {
        Row: {
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          estado: string | null
          fecha_limite: string | null
          id: string
          id_actividad: string | null
          tenant_id: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          id_actividad?: string | null
          tenant_id?: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          id_actividad?: string | null
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_id_actividad_fkey"
            columns: ["id_actividad"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
        ]
      }
      tipo_transaccion_inventario: {
        Row: {
          codigo: string
          nombre: string
          signo: number
        }
        Insert: {
          codigo: string
          nombre: string
          signo: number
        }
        Update: {
          codigo?: string
          nombre?: string
          signo?: number
        }
        Relationships: []
      }
      transacciones_inventario: {
        Row: {
          cantidad: number
          codigo_tipo_transaccion: string
          created_at: string | null
          created_by: string | null
          fecha_transaccion: string | null
          id: string
          id_item: string
          id_ubicacion_destino: string | null
          id_ubicacion_origen: string | null
          registrado_por: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cantidad: number
          codigo_tipo_transaccion: string
          created_at?: string | null
          created_by?: string | null
          fecha_transaccion?: string | null
          id?: string
          id_item: string
          id_ubicacion_destino?: string | null
          id_ubicacion_origen?: string | null
          registrado_por: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cantidad?: number
          codigo_tipo_transaccion?: string
          created_at?: string | null
          created_by?: string | null
          fecha_transaccion?: string | null
          id?: string
          id_item?: string
          id_ubicacion_destino?: string | null
          id_ubicacion_origen?: string | null
          registrado_por?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ong_trans_inv_id_item"
            columns: ["id_item"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_inventario_codigo_tipo_transaccion_fkey"
            columns: ["codigo_tipo_transaccion"]
            isOneToOne: false
            referencedRelation: "tipo_transaccion_inventario"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "transacciones_inventario_id_item_fkey"
            columns: ["id_item"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_inventario_id_ubicacion_destino_fkey"
            columns: ["id_ubicacion_destino"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_inventario_id_ubicacion_origen_fkey"
            columns: ["id_ubicacion_origen"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      ubicaciones: {
        Row: {
          activa: boolean
          codigo: string
          codigo_pais: string | null
          created_at: string
          created_by: string | null
          direccion: string
          id: string
          imagen_url: string | null
          latitud: number | null
          longitud: number | null
          nombre_ubicacion: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          activa?: boolean
          codigo: string
          codigo_pais?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string
          id?: string
          imagen_url?: string | null
          latitud?: number | null
          longitud?: number | null
          nombre_ubicacion: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          activa?: boolean
          codigo?: string
          codigo_pais?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string
          id?: string
          imagen_url?: string | null
          latitud?: number | null
          longitud?: number | null
          nombre_ubicacion?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      unidades_medida: {
        Row: {
          abreviatura: string
          codigo: string
          nombre: string
        }
        Insert: {
          abreviatura: string
          codigo: string
          nombre: string
        }
        Update: {
          abreviatura?: string
          codigo?: string
          nombre?: string
        }
        Relationships: []
      }
      voluntarios: {
        Row: {
          apellido: string
          codigo_estado: string
          codigo_pais: string | null
          created_at: string
          created_by: string | null
          email: string | null
          fecha_nacimiento: string | null
          genero: string | null
          iam_user_id: string | null
          id: string
          nombre: string
          numero_documento: string
          observaciones: string | null
          ruta_foto: string | null
          telefono: string | null
          tenant_id: string
          tipo_documento: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          apellido: string
          codigo_estado: string
          codigo_pais?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          iam_user_id?: string | null
          id?: string
          nombre: string
          numero_documento: string
          observaciones?: string | null
          ruta_foto?: string | null
          telefono?: string | null
          tenant_id?: string
          tipo_documento?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          apellido?: string
          codigo_estado?: string
          codigo_pais?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          iam_user_id?: string | null
          id?: string
          nombre?: string
          numero_documento?: string
          observaciones?: string | null
          ruta_foto?: string | null
          telefono?: string | null
          tenant_id?: string
          tipo_documento?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voluntarios_codigo_estado_fkey"
            columns: ["codigo_estado"]
            isOneToOne: false
            referencedRelation: "estados_voluntario"
            referencedColumns: ["codigo"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_register_attendance_scan: {
        Args: {
          p_id_actividad: string
          p_qr_payload: string
          p_scan_time?: string
        }
        Returns: {
          check_in_at: string | null
          check_out_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          estado: string
          fecha_operacion: string
          id: string
          id_actividad: string
          id_card_id: string | null
          id_voluntario: string
          is_deleted: boolean
          observacion: string | null
          origen_registro: string
          qr_payload: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "asistencias"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_links: {
        Row: {
          assigned_role_id: string | null
          assigned_sede_id: string | null
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          metadata: Json
          onboarding_flow: string | null
          slug: string | null
          target_id: string | null
          target_type: string
          tenant_id: string
          type: string
          updated_at: string
          updated_by: string | null
          used_count: number
        }
        Insert: {
          assigned_role_id?: string | null
          assigned_sede_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          metadata?: Json
          onboarding_flow?: string | null
          slug?: string | null
          target_id?: string | null
          target_type: string
          tenant_id: string
          type: string
          updated_at?: string
          updated_by?: string | null
          used_count?: number
        }
        Update: {
          assigned_role_id?: string | null
          assigned_sede_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          metadata?: Json
          onboarding_flow?: string | null
          slug?: string | null
          target_id?: string | null
          target_type?: string
          tenant_id?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "access_links_assigned_role_id_fkey"
            columns: ["assigned_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_links_assigned_sede_id_fkey"
            columns: ["assigned_sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      aprobaciones: {
        Row: {
          aprobador_id: string | null
          comentarios: string | null
          created_at: string | null
          created_by: string | null
          entidad_id: string
          entidad_tipo: string
          estado: string | null
          fecha_resolucion: string | null
          id: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          aprobador_id?: string | null
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          entidad_id: string
          entidad_tipo: string
          estado?: string | null
          fecha_resolucion?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          aprobador_id?: string | null
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          entidad_id?: string
          entidad_tipo?: string
          estado?: string | null
          fecha_resolucion?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          ip: unknown
          payload_after: Json | null
          payload_before: Json | null
          resource_name: string
          retention_until: string | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip?: unknown
          payload_after?: Json | null
          payload_before?: Json | null
          resource_name: string
          retention_until?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip?: unknown
          payload_after?: Json | null
          payload_before?: Json | null
          resource_name?: string
          retention_until?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_events: {
        Row: {
          created_at: string
          created_by: string | null
          device_id: string | null
          error_code: string | null
          event_type: string
          id: string
          ip: unknown
          result: string
          session_id: string | null
          tenant_id: string
          terminal_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          error_code?: string | null
          event_type: string
          id?: string
          ip?: unknown
          result: string
          session_id?: string | null
          tenant_id?: string
          terminal_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          error_code?: string | null
          event_type?: string
          id?: string
          ip?: unknown
          result?: string
          session_id?: string | null
          tenant_id?: string
          terminal_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_events_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "terminals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
        ]
      }
      battle_pass_progression: {
        Row: {
          fecha_fin: string
          fecha_inicio: string
          id_progression: string
          id_usuario: string
          progreso_porcentaje: number
          recompensas_desbloqueadas: number
          temporada: string
          tier_actual: number
          tipo: string
        }
        Insert: {
          fecha_fin: string
          fecha_inicio: string
          id_progression?: string
          id_usuario: string
          progreso_porcentaje?: number
          recompensas_desbloqueadas?: number
          temporada?: string
          tier_actual?: number
          tipo?: string
        }
        Update: {
          fecha_fin?: string
          fecha_inicio?: string
          id_progression?: string
          id_usuario?: string
          progreso_porcentaje?: number
          recompensas_desbloqueadas?: number
          temporada?: string
          tier_actual?: number
          tipo?: string
        }
        Relationships: []
      }
      cat_code_types: {
        Row: {
          created_at: string
          description: string
          id: string
          module: string
          public_lookup: boolean
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          module?: string
          public_lookup?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          module?: string
          public_lookup?: boolean
        }
        Relationships: []
      }
      cat_generos: {
        Row: {
          activo: boolean | null
          codigo: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          nombre?: string
        }
        Relationships: []
      }
      cat_industry_types: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_invoice_statuses: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_module_statuses: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          nombre: string
          orden: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          nombre: string
          orden?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          nombre?: string
          orden?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cat_monedas: {
        Row: {
          activo: boolean | null
          codigo: string
          nombre: string
          simbolo: string
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          nombre: string
          simbolo: string
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          nombre?: string
          simbolo?: string
        }
        Relationships: []
      }
      cat_paises: {
        Row: {
          activo: boolean | null
          codigo: string
          codigo_telefonico: string | null
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          codigo_telefonico?: string | null
          nombre: string
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          codigo_telefonico?: string | null
          nombre?: string
        }
        Relationships: []
      }
      cat_payment_statuses: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_permissions: {
        Row: {
          created_at: string
          description: string
          id: string
          module: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          module?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          module?: string
        }
        Relationships: []
      }
      cat_plan_types: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_subscription_change_statuses: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_subscription_statuses: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_tenant_statuses: {
        Row: {
          created_at: string
          description: string
          id: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      cat_tipos_documento: {
        Row: {
          activo: boolean | null
          codigo: string
          nombre: string
          requiere_caducidad: boolean | null
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          nombre: string
          requiere_caducidad?: boolean | null
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          nombre?: string
          requiere_caducidad?: boolean | null
        }
        Relationships: []
      }
      clan_miembros: {
        Row: {
          contribucion_xp: number | null
          fecha_union: string
          id_clan: string
          id_usuario: string
          rol_clan: string | null
        }
        Insert: {
          contribucion_xp?: number | null
          fecha_union?: string
          id_clan: string
          id_usuario: string
          rol_clan?: string | null
        }
        Update: {
          contribucion_xp?: number | null
          fecha_union?: string
          id_clan?: string
          id_usuario?: string
          rol_clan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_miembros_id_clan_fkey"
            columns: ["id_clan"]
            isOneToOne: false
            referencedRelation: "clanes"
            referencedColumns: ["id_clan"]
          },
        ]
      }
      clanes: {
        Row: {
          capacidad_maxima: number
          descripcion: string | null
          fecha_creacion: string
          id_clan: string
          id_gimnasio: string | null
          id_lider: string | null
          nombre: string
          ranking: number | null
          xp_clan: number
        }
        Insert: {
          capacidad_maxima?: number
          descripcion?: string | null
          fecha_creacion?: string
          id_clan?: string
          id_gimnasio?: string | null
          id_lider?: string | null
          nombre: string
          ranking?: number | null
          xp_clan?: number
        }
        Update: {
          capacidad_maxima?: number
          descripcion?: string | null
          fecha_creacion?: string
          id_clan?: string
          id_gimnasio?: string | null
          id_lider?: string | null
          nombre?: string
          ranking?: number | null
          xp_clan?: number
        }
        Relationships: []
      }
      code_grants: {
        Row: {
          code_id: string
          role_id: string
        }
        Insert: {
          code_id: string
          role_id: string
        }
        Update: {
          code_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_grants_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_grants_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      code_usages: {
        Row: {
          code_id: string
          id: string
          ip_address: unknown
          metadata: Json
          module_name: string
          observations: string | null
          tenant_id: string
          used_at: string
          used_by: string | null
        }
        Insert: {
          code_id: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          module_name: string
          observations?: string | null
          tenant_id: string
          used_at?: string
          used_by?: string | null
        }
        Update: {
          code_id?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          module_name?: string
          observations?: string | null
          tenant_id?: string
          used_at?: string
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_usages_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_usages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      codes: {
        Row: {
          code: string
          code_type: string | null
          context_payload: Json
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          expires_at: string | null
          id: string
          max_uses: number | null
          metadata: Json
          status: string
          tenant_id: string
          type_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          code_type?: string | null
          context_payload?: Json
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          metadata?: Json
          status?: string
          tenant_id: string
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          code_type?: string | null
          context_payload?: Json
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          metadata?: Json
          status?: string
          tenant_id?: string
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codes_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "cat_code_types"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_clients: {
        Row: {
          cantidad_empleados: number
          cantidad_membresias: number
          contacto_hr: string
          email_hr: string | null
          estado: string
          fecha_inicio_contrato: string
          fecha_renovacion: string | null
          id_corporativo: string
          nombre_empresa: string
          precio_por_empleado: number
        }
        Insert: {
          cantidad_empleados?: number
          cantidad_membresias?: number
          contacto_hr: string
          email_hr?: string | null
          estado?: string
          fecha_inicio_contrato?: string
          fecha_renovacion?: string | null
          id_corporativo?: string
          nombre_empresa: string
          precio_por_empleado?: number
        }
        Update: {
          cantidad_empleados?: number
          cantidad_membresias?: number
          contacto_hr?: string
          email_hr?: string | null
          estado?: string
          fecha_inicio_contrato?: string
          fecha_renovacion?: string | null
          id_corporativo?: string
          nombre_empresa?: string
          precio_por_empleado?: number
        }
        Relationships: []
      }
      corporate_leaderboards: {
        Row: {
          departamento: string
          fecha_actualizacion: string
          id_corporativo: string | null
          id_leaderboard: string
          ranking: number | null
          xp_acumulado: number
        }
        Insert: {
          departamento: string
          fecha_actualizacion?: string
          id_corporativo?: string | null
          id_leaderboard?: string
          ranking?: number | null
          xp_acumulado?: number
        }
        Update: {
          departamento?: string
          fecha_actualizacion?: string
          id_corporativo?: string | null
          id_leaderboard?: string
          ranking?: number | null
          xp_acumulado?: number
        }
        Relationships: [
          {
            foreignKeyName: "corporate_leaderboards_id_corporativo_fkey"
            columns: ["id_corporativo"]
            isOneToOne: false
            referencedRelation: "corporate_clients"
            referencedColumns: ["id_corporativo"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          created_by: string | null
          device_fingerprint: string
          device_type: string | null
          id: string
          is_trusted: boolean
          last_ip: unknown
          last_seen_at: string | null
          last_user_agent: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_fingerprint: string
          device_type?: string | null
          id?: string
          is_trusted?: boolean
          last_ip?: unknown
          last_seen_at?: string | null
          last_user_agent?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_fingerprint?: string
          device_type?: string | null
          id?: string
          is_trusted?: boolean
          last_ip?: unknown
          last_seen_at?: string | null
          last_user_agent?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dynamic_forms: {
        Row: {
          context_type: string | null
          created_at: string
          created_by: string | null
          form_schema: Json
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          context_type?: string | null
          created_at?: string
          created_by?: string | null
          form_schema?: Json
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          context_type?: string | null
          created_at?: string
          created_by?: string | null
          form_schema?: Json
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_forms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing_log: {
        Row: {
          actividad: string | null
          fecha_cambio: string
          id_gimnasio: string | null
          id_pricing: string
          precio_anterior: number | null
          precio_nuevo: number | null
          razon: string | null
          zona_geografica: string | null
        }
        Insert: {
          actividad?: string | null
          fecha_cambio?: string
          id_gimnasio?: string | null
          id_pricing?: string
          precio_anterior?: number | null
          precio_nuevo?: number | null
          razon?: string | null
          zona_geografica?: string | null
        }
        Update: {
          actividad?: string | null
          fecha_cambio?: string
          id_gimnasio?: string | null
          id_pricing?: string
          precio_anterior?: number | null
          precio_nuevo?: number | null
          razon?: string | null
          zona_geografica?: string | null
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          can_use_terminals: boolean
          created_at: string | null
          created_by: string | null
          effective_from: string
          max_licenses: number
          max_sedes: number
          plan_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          can_use_terminals: boolean
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          max_licenses: number
          max_sedes: number
          plan_id: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          can_use_terminals?: boolean
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          max_licenses?: number
          max_sedes?: number
          plan_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cat_plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          qty: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total?: number
          qty?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          due_at: string | null
          id: string
          invoice_number: string | null
          issued_at: string | null
          period_end: string | null
          period_start: string | null
          status_id: string
          subtotal: number
          tax: number
          tenant_id: string
          total: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          due_at?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status_id?: string
          subtotal?: number
          tax?: number
          tenant_id?: string
          total?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          due_at?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status_id?: string
          subtotal?: number
          tax?: number
          tenant_id?: string
          total?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "cat_invoice_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          comision_gymsos: number
          estado: string
          fecha_transaccion: string
          id_transaccion: string
          id_usuario: string | null
          id_vendor: string | null
          monto: number
          tipo: string
        }
        Insert: {
          comision_gymsos: number
          estado?: string
          fecha_transaccion?: string
          id_transaccion?: string
          id_usuario?: string | null
          id_vendor?: string | null
          monto: number
          tipo: string
        }
        Update: {
          comision_gymsos?: number
          estado?: string
          fecha_transaccion?: string
          id_transaccion?: string
          id_usuario?: string | null
          id_vendor?: string | null
          monto?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_id_vendor_fkey"
            columns: ["id_vendor"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id_vendor"]
          },
        ]
      }
      marketplace_vendors: {
        Row: {
          certificaciones: string | null
          created_at: string
          descripcion: string | null
          email: string | null
          estado: string
          id_vendor: string
          nombre: string
          rating_promedio: number | null
          tarifa: number | null
          tipo: string
          total_clientes: number | null
        }
        Insert: {
          certificaciones?: string | null
          created_at?: string
          descripcion?: string | null
          email?: string | null
          estado?: string
          id_vendor?: string
          nombre: string
          rating_promedio?: number | null
          tarifa?: number | null
          tipo: string
          total_clientes?: number | null
        }
        Update: {
          certificaciones?: string | null
          created_at?: string
          descripcion?: string | null
          email?: string | null
          estado?: string
          id_vendor?: string
          nombre?: string
          rating_promedio?: number | null
          tarifa?: number | null
          tipo?: string
          total_clientes?: number | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          context_id: string
          context_type: string
          created_at: string
          created_by: string | null
          id: string
          joined_at: string
          role_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_id: string
          context_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          joined_at?: string
          role_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_id?: string
          context_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          joined_at?: string
          role_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          channel: string
          code_hash: string
          context: Json
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          risk_level: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          channel: string
          code_hash: string
          context?: Json
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          risk_level: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          channel?: string
          code_hash?: string
          context?: Json
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          risk_level?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mfa_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mfa_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
        ]
      }
      module_dependencies: {
        Row: {
          created_at: string
          depends_on_module_code: string
          parent_module_code: string
        }
        Insert: {
          created_at?: string
          depends_on_module_code: string
          parent_module_code: string
        }
        Update: {
          created_at?: string
          depends_on_module_code?: string
          parent_module_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_dependencies_depends_on_module_code_fkey"
            columns: ["depends_on_module_code"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "module_dependencies_parent_module_code_fkey"
            columns: ["parent_module_code"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["codigo"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          created_by: string | null
          holder_name: string | null
          id: string
          is_default: boolean
          last4: string | null
          method_type: string
          provider: string | null
          tenant_id: string
          token_ref: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          holder_name?: string | null
          id?: string
          is_default?: boolean
          last4?: string | null
          method_type: string
          provider?: string | null
          tenant_id?: string
          token_ref?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          holder_name?: string | null
          id?: string
          is_default?: boolean
          last4?: string | null
          method_type?: string
          provider?: string | null
          tenant_id?: string
          token_ref?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          external_payment_id: string | null
          external_reference: string | null
          id: string
          idempotency_key: string | null
          invoice_id: string | null
          payment_method_id: string | null
          provider: string | null
          raw_payload: Json | null
          status_id: string
          subscription_change_id: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          external_payment_id?: string | null
          external_reference?: string | null
          id?: string
          idempotency_key?: string | null
          invoice_id?: string | null
          payment_method_id?: string | null
          provider?: string | null
          raw_payload?: Json | null
          status_id?: string
          subscription_change_id?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          external_payment_id?: string | null
          external_reference?: string | null
          id?: string
          idempotency_key?: string | null
          invoice_id?: string | null
          payment_method_id?: string | null
          provider?: string | null
          raw_payload?: Json | null
          status_id?: string
          subscription_change_id?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_currency"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "cat_monedas"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "payment_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "cat_payment_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_change_id_fkey"
            columns: ["subscription_change_id"]
            isOneToOne: false
            referencedRelation: "subscription_changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_id: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          received_at: string
          signature_valid: boolean
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_id: string
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
          received_at?: string
          signature_valid?: boolean
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          received_at?: string
          signature_valid?: boolean
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_policies: {
        Row: {
          can_use_terminals: boolean
          created_at: string
          max_licenses: number
          max_sedes: number
          plan_id: string
          retention_days: number
        }
        Insert: {
          can_use_terminals?: boolean
          created_at?: string
          max_licenses?: number
          max_sedes?: number
          plan_id: string
          retention_days?: number
        }
        Update: {
          can_use_terminals?: boolean
          created_at?: string
          max_licenses?: number
          max_sedes?: number
          plan_id?: string
          retention_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_policies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: true
            referencedRelation: "cat_plan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked_reason: string | null
          created_at: string
          created_by: string | null
          full_name: string | null
          genero: string | null
          id: string
          is_blocked: boolean
          numero_documento: string | null
          pin_blocked_until: string | null
          pin_failed_attempts: number
          pin_hash: string | null
          pin_last_failed_at: string | null
          risk_blocked_until: string | null
          tenant_id: string | null
          tipo_documento: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          blocked_reason?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          genero?: string | null
          id: string
          is_blocked?: boolean
          numero_documento?: string | null
          pin_blocked_until?: string | null
          pin_failed_attempts?: number
          pin_hash?: string | null
          pin_last_failed_at?: string | null
          risk_blocked_until?: string | null
          tenant_id?: string | null
          tipo_documento?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          blocked_reason?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          genero?: string | null
          id?: string
          is_blocked?: boolean
          numero_documento?: string | null
          pin_blocked_until?: string | null
          pin_failed_attempts?: number
          pin_hash?: string | null
          pin_last_failed_at?: string | null
          risk_blocked_until?: string | null
          tenant_id?: string | null
          tipo_documento?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_genero_fkey"
            columns: ["genero"]
            isOneToOne: false
            referencedRelation: "cat_generos"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tipo_documento_fkey"
            columns: ["tipo_documento"]
            isOneToOne: false
            referencedRelation: "cat_tipos_documento"
            referencedColumns: ["codigo"]
          },
        ]
      }
      role_access_constraints: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          ip_cidr: unknown
          require_trusted_device: boolean
          role_id: string
          sede_id: string | null
          tenant_id: string
          time_end: string | null
          time_start: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_cidr?: unknown
          require_trusted_device?: boolean
          role_id: string
          sede_id?: string | null
          tenant_id?: string
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_cidr?: unknown
          require_trusted_device?: boolean
          role_id?: string
          sede_id?: string | null
          tenant_id?: string
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_access_constraints_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_access_constraints_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_access_constraints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_field_permissions: {
        Row: {
          can_edit: boolean
          can_view: boolean
          entity_name: string
          field_name: string
          id: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          can_edit?: boolean
          can_view?: boolean
          entity_name: string
          field_name: string
          id?: string
          role_id: string
          tenant_id: string
        }
        Update: {
          can_edit?: boolean
          can_view?: boolean
          entity_name?: string
          field_name?: string
          id?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_field_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_field_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_module_access: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          module_code: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          module_code: string
          role_id: string
          tenant_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          module_code?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_module_access_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_module_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          created_by: string | null
          hierarchy_level: number
          id: string
          is_system_role: boolean
          name: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hierarchy_level?: number
          id?: string
          is_system_role?: boolean
          name: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hierarchy_level?: number
          id?: string
          is_system_role?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sedes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sedes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          created_by: string | null
          device_id: string | null
          expires_at: string
          id: string
          ip: unknown
          revoke_reason: string | null
          revoked_at: string | null
          session_type: string
          tenant_id: string
          terminal_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          expires_at: string
          id?: string
          ip?: unknown
          revoke_reason?: string | null
          revoked_at?: string | null
          session_type: string
          tenant_id?: string
          terminal_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          expires_at?: string
          id?: string
          ip?: unknown
          revoke_reason?: string | null
          revoked_at?: string | null
          session_type?: string
          tenant_id?: string
          terminal_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "terminals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_changes: {
        Row: {
          created_at: string | null
          created_by: string | null
          from_plan_id: string
          id: string
          idempotency_key: string | null
          notes: string | null
          requested_at: string
          requested_by: string | null
          status_id: string
          tenant_id: string
          to_plan_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          from_plan_id: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          status_id?: string
          tenant_id?: string
          to_plan_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          from_plan_id?: string
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          status_id?: string
          tenant_id?: string
          to_plan_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_changes_from_plan_id_fkey"
            columns: ["from_plan_id"]
            isOneToOne: false
            referencedRelation: "cat_plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_changes_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_changes_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscription_changes_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "cat_subscription_change_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_changes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_changes_to_plan_id_fkey"
            columns: ["to_plan_id"]
            isOneToOne: false
            referencedRelation: "cat_plan_types"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_contracts: {
        Row: {
          billing_day: number
          created_at: string
          created_by: string | null
          current_plan_id: string
          cycle_end: string | null
          cycle_start: string | null
          grace_days: number
          id: string
          read_only_at: string | null
          status_id: string
          suspended_at: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          billing_day?: number
          created_at?: string
          created_by?: string | null
          current_plan_id: string
          cycle_end?: string | null
          cycle_start?: string | null
          grace_days?: number
          id?: string
          read_only_at?: string | null
          status_id?: string
          suspended_at?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          billing_day?: number
          created_at?: string
          created_by?: string | null
          current_plan_id?: string
          cycle_end?: string | null
          cycle_start?: string | null
          grace_days?: number
          id?: string
          read_only_at?: string | null
          status_id?: string
          suspended_at?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_contracts_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "cat_plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_contracts_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "cat_subscription_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_modules: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          current_version: string | null
          descripcion: string | null
          is_core: boolean
          is_transversal: boolean
          nombre: string
          requires_tenant: boolean
          schema_name: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          current_version?: string | null
          descripcion?: string | null
          is_core?: boolean
          is_transversal?: boolean
          nombre: string
          requires_tenant?: boolean
          schema_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          current_version?: string | null
          descripcion?: string | null
          is_core?: boolean
          is_transversal?: boolean
          nombre?: string
          requires_tenant?: boolean
          schema_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tenant_modules: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          disabled_at: string | null
          enabled_at: string | null
          id: string
          installed_at: string
          module_code: string
          status_code: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          installed_at?: string
          module_code: string
          status_code?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          installed_at?: string
          module_code?: string
          status_code?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_module_code_fkey"
            columns: ["module_code"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "tenant_modules_status_code_fkey"
            columns: ["status_code"]
            isOneToOne: false
            referencedRelation: "cat_module_statuses"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          billing_day: number
          created_at: string
          id: string
          industry_type_id: string
          max_licenses: number
          name: string
          plan_id: string
          status_financial_id: string
          tax_id: string
          updated_at: string
        }
        Insert: {
          billing_day?: number
          created_at?: string
          id?: string
          industry_type_id: string
          max_licenses?: number
          name: string
          plan_id: string
          status_financial_id?: string
          tax_id: string
          updated_at?: string
        }
        Update: {
          billing_day?: number
          created_at?: string
          id?: string
          industry_type_id?: string
          max_licenses?: number
          name?: string
          plan_id?: string
          status_financial_id?: string
          tax_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_industry_type_id_fkey"
            columns: ["industry_type_id"]
            isOneToOne: false
            referencedRelation: "cat_industry_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cat_plan_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_status_financial_id_fkey"
            columns: ["status_financial_id"]
            isOneToOne: false
            referencedRelation: "cat_tenant_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      terminals: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_seen_at: string | null
          name: string
          sede_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          name: string
          sede_id: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          name?: string
          sede_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terminals_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      torneos_semanales: {
        Row: {
          descripcion: string | null
          fecha_fin: string
          fecha_inicio: string
          id_gimnasio: string | null
          id_torneo: string
          nombre: string
          premios_texto: string | null
          tipo_metrica: string
        }
        Insert: {
          descripcion?: string | null
          fecha_fin: string
          fecha_inicio: string
          id_gimnasio?: string | null
          id_torneo?: string
          nombre: string
          premios_texto?: string | null
          tipo_metrica: string
        }
        Update: {
          descripcion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id_gimnasio?: string | null
          id_torneo?: string
          nombre?: string
          premios_texto?: string | null
          tipo_metrica?: string
        }
        Relationships: []
      }
      user_permission_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          effect: string
          expires_at: string | null
          id: string
          permission: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effect: string
          expires_at?: string | null
          id?: string
          permission: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effect?: string
          expires_at?: string | null
          id?: string
          permission?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_permission_fkey"
            columns: ["permission"]
            isOneToOne: false
            referencedRelation: "cat_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permission_overrides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          role_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles_sedes: {
        Row: {
          created_at: string
          created_by: string | null
          role_id: string
          sede_id: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          role_id: string
          sede_id: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          role_id?: string
          sede_id?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_sedes_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sedes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sedes_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sedes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sedes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sedes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_session_context"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_user_session_context: {
        Row: {
          active_memberships: Json | null
          full_name: string | null
          genero: string | null
          numero_documento: string | null
          tenant_id: string | null
          tipo_documento: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_genero_fkey"
            columns: ["genero"]
            isOneToOne: false
            referencedRelation: "cat_generos"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tipo_documento_fkey"
            columns: ["tipo_documento"]
            isOneToOne: false
            referencedRelation: "cat_tipos_documento"
            referencedColumns: ["codigo"]
          },
        ]
      }
    }
    Functions: {
      _gym_plan_to_bd: { Args: { p_plan: string }; Returns: string }
      _gym_plan_to_licenses: { Args: { p_plan: string }; Returns: number }
      fn_bootstrap_tenant: {
        Args: {
          p_billing_day?: number
          p_industry_type_id: string
          p_plan_id?: string
          p_tax_id: string
          p_tenant_name: string
        }
        Returns: string
      }
      fn_check_permission: { Args: { p_permission: string }; Returns: boolean }
      fn_complete_access_onboarding: {
        Args: { p_access_code: string; p_metadata?: Json }
        Returns: Json
      }
      fn_create_code: {
        Args: {
          p_code?: string
          p_description?: string
          p_expires_at?: string
          p_max_uses?: number
          p_metadata?: Json
          p_tenant_id: string
          p_type_id: string
        }
        Returns: Json
      }
      fn_create_staff_code: {
        Args: {
          p_custom_code?: string
          p_description?: string
          p_expires_at?: string
          p_max_uses?: number
          p_role_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      fn_current_tenant_id: { Args: never; Returns: string }
      fn_get_my_profile: { Args: never; Returns: Json }
      fn_has_context_access: {
        Args: { p_context_id: string; p_user_id: string }
        Returns: boolean
      }
      fn_has_permission:
        | { Args: { p_permission: string }; Returns: boolean }
        | {
            Args: { p_permission: string; p_sede_id?: string }
            Returns: boolean
          }
      fn_is_module_enabled: {
        Args: { p_module_code: string; p_tenant_id?: string }
        Returns: boolean
      }
      fn_is_tenant_admin: { Args: never; Returns: boolean }
      fn_lookup_gym_access: { Args: { p_codigo: string }; Returns: Json }
      fn_my_permissions: {
        Args: never
        Returns: {
          permission: string
          role_name: string
        }[]
      }
      fn_remote_revoke_app_session: {
        Args: { p_reason: string; p_session_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          device_id: string | null
          expires_at: string
          id: string
          ip: unknown
          revoke_reason: string | null
          revoked_at: string | null
          session_type: string
          tenant_id: string
          terminal_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_agent: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_revoke_code: {
        Args: { p_code_id: string; p_reason?: string }
        Returns: Json
      }
      fn_update_my_avatar: { Args: { p_url: string }; Returns: Json }
      fn_use_code: {
        Args: {
          p_code: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_module_name: string
          p_observations?: string
          p_tenant_id?: string
          p_type_id?: string
        }
        Returns: Json
      }
      fn_validate_access_code: { Args: { p_code: string }; Returns: Json }
      fn_validate_code: {
        Args: { p_code: string; p_tenant_id?: string; p_type_id?: string }
        Returns: Json
      }
      generate_gym_code: { Args: { p_nombre: string }; Returns: string }
      get_user_gym: { Args: never; Returns: string }
      get_user_rol: { Args: never; Returns: string }
      seed_gym_roles: {
        Args: { p_target_tenant: string; p_template_tenant?: string }
        Returns: number
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  gym: {
    Enums: {},
  },
  ong: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
