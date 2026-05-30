import { NextRequest, NextResponse } from "next/server"

// Gemini 1.5 Flash — gratis en Google AI Studio (15 RPM, 1M TPM)
// https://aistudio.google.com/app/apikey
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export type AIRecomendacionRequest = {
  tipo: "workout" | "nutricion" | "retencion" | "churn_intervencion"
  contexto: {
    nombre: string
    nivel?: number
    sesiones_mes?: number
    plan?: string
    dias_sin_visita?: number
    score_churn?: number
    objetivo?: string
    imc?: number
  }
}

export type AIRecomendacionResponse = {
  recomendacion: string
  accion_sugerida: string
  urgencia: "baja" | "media" | "alta"
  tags: string[]
}

function buildPrompt(req: AIRecomendacionRequest): string {
  const { tipo, contexto } = req

  const prompts: Record<AIRecomendacionRequest["tipo"], string> = {
    workout: `Eres un entrenador personal experto.
Genera una recomendación de entrenamiento personalizada y motivadora en español para:
- Nombre: ${contexto.nombre}
- Nivel gamificación: ${contexto.nivel ?? 1}
- Sesiones este mes: ${contexto.sesiones_mes ?? 0}
- Plan de membresía: ${contexto.plan ?? "básico"}

Responde en JSON con: { "recomendacion": "...(max 120 chars)", "accion_sugerida": "...(max 60 chars)", "urgencia": "baja|media|alta", "tags": ["tag1","tag2","tag3"] }`,

    nutricion: `Eres un nutricionista deportivo experto.
Genera una recomendación nutricional personalizada en español para:
- Nombre: ${contexto.nombre}
- Objetivo: ${contexto.objetivo ?? "salud general"}
- IMC: ${contexto.imc ?? "no disponible"}

Responde en JSON con: { "recomendacion": "...(max 120 chars)", "accion_sugerida": "...(max 60 chars)", "urgencia": "baja|media|alta", "tags": ["tag1","tag2"] }`,

    retencion: `Eres un experto en retención de clientes de gimnasios.
Genera una recomendación para retener a este miembro en español:
- Nombre: ${contexto.nombre}
- Días sin visita: ${contexto.dias_sin_visita ?? 0}
- Plan: ${contexto.plan ?? "básico"}
- Score de riesgo: ${contexto.score_churn ?? 0}%

Responde en JSON con: { "recomendacion": "...(max 120 chars)", "accion_sugerida": "...(max 60 chars)", "urgencia": "baja|media|alta", "tags": ["tag1","tag2"] }`,

    churn_intervencion: `Eres un experto en gestión de gimnasios y retención de clientes.
Diseña una intervención personalizada para evitar el abandono en español:
- Miembro: ${contexto.nombre}
- Riesgo de abandono: ${contexto.score_churn ?? 0}%
- Días inactivo: ${contexto.dias_sin_visita ?? 0}
- Plan actual: ${contexto.plan ?? "básico"}

La intervención debe ser específica, accionable y empática.
Responde en JSON con: { "recomendacion": "...(max 150 chars)", "accion_sugerida": "...(max 80 chars)", "urgencia": "baja|media|alta", "tags": ["tag1","tag2","tag3"] }`,
  }

  return prompts[tipo]
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no configurada. Obtén una en https://aistudio.google.com/app/apikey" },
      { status: 503 },
    )
  }

  let body: AIRecomendacionRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const prompt = buildPrompt(body)

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 256,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: geminiRes.status })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}"

    let parsed: AIRecomendacionResponse
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = {
        recomendacion:   rawText.slice(0, 120),
        accion_sugerida: "Contactar al miembro",
        urgencia:        "media",
        tags:            ["general"],
      }
    }

    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    )
  }
}
