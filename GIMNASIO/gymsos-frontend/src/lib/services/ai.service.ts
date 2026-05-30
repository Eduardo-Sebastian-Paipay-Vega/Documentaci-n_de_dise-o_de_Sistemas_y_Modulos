import { supabase, handleSupabaseError } from "./base"
import type { AIRecomendacionRequest, AIRecomendacionResponse } from "@/app/api/ai/route"

export type { AIRecomendacionRequest, AIRecomendacionResponse }

export type RecomendacionDB = {
  id_recomendacion: string
  id_usuario: string
  tipo: string
  contenido_json: AIRecomendacionResponse
  score_relevancia: number
  mostrada: boolean
  aceptada: boolean | null
  fecha_generacion: string
}

// Llama al API route Next.js que usa Gemini internamente
export async function generarRecomendacion(
  req: AIRecomendacionRequest,
): Promise<AIRecomendacionResponse> {
  const res = await fetch("/api/ai", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(req),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? "Error generando recomendación")
  }

  return res.json()
}

// Guarda la recomendación en ai_recommendations y la devuelve
export async function generarYGuardarRecomendacion(
  userId: string,
  req: AIRecomendacionRequest,
): Promise<RecomendacionDB> {
  const resultado = await generarRecomendacion(req)

  const { data, error } = await supabase
    .from("ai_recommendations")
    .insert({
      id_usuario:       userId,
      tipo:             req.tipo,
      contenido_json:   resultado,
      score_relevancia: req.tipo === "churn_intervencion" ? 0.95 : 0.80,
      mostrada:         false,
      aceptada:         null,
    })
    .select("id_recomendacion, id_usuario, tipo, contenido_json, score_relevancia, mostrada, aceptada, fecha_generacion")
    .single()

  if (error) handleSupabaseError(error)

  return {
    ...data,
    contenido_json: data.contenido_json as AIRecomendacionResponse,
  }
}

export async function getRecomendacionesActivas(
  userId: string,
  limit = 3,
): Promise<RecomendacionDB[]> {
  const { data, error } = await supabase
    .from("ai_recommendations")
    .select("id_recomendacion, id_usuario, tipo, contenido_json, score_relevancia, mostrada, aceptada, fecha_generacion")
    .eq("id_usuario", userId)
    .eq("mostrada", false)
    .order("score_relevancia", { ascending: false })
    .limit(limit)

  if (error) handleSupabaseError(error)

  return (data ?? []).map((r) => ({
    ...r,
    contenido_json: r.contenido_json as AIRecomendacionResponse,
  }))
}

export async function marcarRecomendacionMostrada(id: string): Promise<void> {
  const { error } = await supabase
    .from("ai_recommendations")
    .update({ mostrada: true })
    .eq("id_recomendacion", id)
  if (error) handleSupabaseError(error)
}

export async function responderRecomendacion(id: string, aceptada: boolean): Promise<void> {
  const { error } = await supabase
    .from("ai_recommendations")
    .update({ aceptada, mostrada: true })
    .eq("id_recomendacion", id)
  if (error) handleSupabaseError(error)
}

// Demo sin API key — genera texto de relleno
export function getRecomendacionDemo(tipo: AIRecomendacionRequest["tipo"]): AIRecomendacionResponse {
  const demos: Record<AIRecomendacionRequest["tipo"], AIRecomendacionResponse> = {
    workout: {
      recomendacion:   "¡Hoy es día perfecto para trabajar piernas! Tu racha de 5 días merece un entrenamiento fuerte.",
      accion_sugerida: "Ir a clase de funcional 18:00",
      urgencia:        "baja",
      tags:            ["piernas", "fuerza", "racha"],
    },
    nutricion: {
      recomendacion:   "Tu IMC indica que puedes beneficiarte de aumentar proteínas. Te recomendamos 1.8g/kg/día.",
      accion_sugerida: "Ver plan nutricional personalizado",
      urgencia:        "media",
      tags:            ["proteinas", "imc", "nutricion"],
    },
    retencion: {
      recomendacion:   "Llevas 12 días sin visita. Tu membresía vence pronto — ¡te extrañamos!",
      accion_sugerida: "Enviar mensaje de reactivación",
      urgencia:        "alta",
      tags:            ["inactividad", "retencion", "urgente"],
    },
    churn_intervencion: {
      recomendacion:   "Alto riesgo de abandono. Ofrecer 1 mes adicional gratis puede recuperar a este miembro valioso.",
      accion_sugerida: "Enviar oferta personalizada ahora",
      urgencia:        "alta",
      tags:            ["churn", "oferta", "critico"],
    },
  }
  return demos[tipo]
}
