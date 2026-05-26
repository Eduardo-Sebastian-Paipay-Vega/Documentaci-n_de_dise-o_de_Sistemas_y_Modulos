const chainBuilder: Record<string, unknown> = {}
const chainFns = ["select","eq","order","limit","gte","lte","in","or","insert","update","single","range"]
chainFns.forEach(fn => { chainBuilder[fn] = () => chainBuilder })
Object.assign(chainBuilder, {
  then: (fn: Function) => Promise.resolve({ data: [], error: null }).then(fn),
  single: () => Promise.resolve({ data: { id_clase: "c1", id_inscripcion: "i1" }, error: null }),
})

jest.mock("@/lib/services/base", () => ({
  supabase:            { from: () => chainBuilder },
  handleSupabaseError: jest.fn((e) => { throw new Error(e?.message ?? "DB Error") }),
  ServiceError:        class ServiceError extends Error {},
}))

import {
  getClasesHoy,
  getClasesPorGimnasio,
  actualizarEstadoClase,
  getInscripcionesDelMiembro,
  cancelarInscripcion,
  type ClaseDetalle,
} from "@/lib/services/clases.service"

describe("getClasesHoy", () => {
  test("es una función", () => {
    expect(typeof getClasesHoy).toBe("function")
  })

  test("retorna un array", async () => {
    const result = await getClasesHoy("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("getClasesPorGimnasio", () => {
  test("acepta opciones vacías", async () => {
    const result = await getClasesPorGimnasio("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta opciones con filtros", async () => {
    const result = await getClasesPorGimnasio("gym-001", {
      estado: "programada",
      fecha:  "2026-05-26",
      limit:  10,
    })
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("actualizarEstadoClase", () => {
  test("acepta todos los estados válidos", async () => {
    const estados: ClaseDetalle["estado"][] = ["programada", "en_curso", "finalizada", "cancelada"]
    for (const estado of estados) {
      await expect(actualizarEstadoClase("c1", estado)).resolves.not.toThrow()
    }
  })
})

describe("getInscripcionesDelMiembro", () => {
  test("retorna un array", async () => {
    const result = await getInscripcionesDelMiembro("user-001")
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("cancelarInscripcion", () => {
  test("es una función", () => {
    expect(typeof cancelarInscripcion).toBe("function")
  })

  test("no lanza sin error de DB", async () => {
    await expect(cancelarInscripcion("u1", "c1")).resolves.not.toThrow()
  })
})

describe("ClaseDetalle type shape", () => {
  test("tipo ClaseDetalle tiene los campos requeridos", () => {
    const clase: ClaseDetalle = {
      id_clase:          "c1",
      id_gimnasio:       "g1",
      id_entrenador:     "e1",
      id_espacio:        "s1",
      nombre:            "CrossFit",
      descripcion:       null,
      capacidad_maxima:  20,
      nivel:             "avanzado",
      fecha_hora_inicio: "2026-05-26T07:30:00",
      duracion_minutos:  60,
      recurrencia:       "semanal",
      dias_semana:       "lun,mie,vie",
      estado:            "programada",
      nombre_entrenador: "Coach Ana",
      nombre_espacio:    "Sala A",
      inscritos:         15,
    }

    expect(clase.capacidad_maxima).toBe(20)
    expect(clase.nivel).toBe("avanzado")
    expect(clase.inscritos).toBe(15)
  })
})
