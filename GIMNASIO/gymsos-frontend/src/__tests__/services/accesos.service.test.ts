const singleMock = jest.fn()

const chainBuilder: Record<string, unknown> = {}
const chainFns = ["select","eq","order","limit","gte","lte","in","or","insert","update","range"]
chainFns.forEach(fn => { chainBuilder[fn] = () => chainBuilder })
Object.assign(chainBuilder, {
  then:   (fn: Function) => Promise.resolve({ data: [], error: null }).then(fn),
  single: singleMock,
})

jest.mock("@/lib/services/base", () => ({
  supabase:            { from: () => chainBuilder },
  handleSupabaseError: jest.fn((e) => { throw new Error(e?.message ?? "DB Error") }),
  ServiceError:        class ServiceError extends Error {},
}))

import {
  getAccesosRecientes,
  contarAccesosHoy,
  registrarSalida,
  getHistorialAccesoMiembro,
  type AccesoDetalle,
} from "@/lib/services/accesos.service"

beforeEach(() => {
  singleMock.mockResolvedValue({ data: null, error: null })
})

describe("getAccesosRecientes", () => {
  test("retorna un array", async () => {
    const result = await getAccesosRecientes("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta opción limit", async () => {
    const result = await getAccesosRecientes("gym-001", { limit: 10 })
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("contarAccesosHoy", () => {
  test("retorna objeto con total y actualmente_dentro", async () => {
    const result = await contarAccesosHoy("gym-001")
    expect(result).toHaveProperty("total")
    expect(result).toHaveProperty("actualmente_dentro")
  })

  test("los conteos son números no negativos", async () => {
    const result = await contarAccesosHoy("gym-001")
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.actualmente_dentro).toBeGreaterThanOrEqual(0)
  })

  test("actualmente_dentro nunca supera a total", async () => {
    const result = await contarAccesosHoy("gym-001")
    expect(result.actualmente_dentro).toBeLessThanOrEqual(result.total)
  })
})

describe("registrarSalida", () => {
  test("no lanza sin error de DB", async () => {
    await expect(registrarSalida("acceso-001")).resolves.not.toThrow()
  })
})

describe("getHistorialAccesoMiembro", () => {
  test("retorna un array", async () => {
    const result = await getHistorialAccesoMiembro("user-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta parámetro limit", async () => {
    const result = await getHistorialAccesoMiembro("user-001", 10)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("AccesoDetalle type shape", () => {
  test("el tipo tiene los campos correctos", () => {
    const acceso: AccesoDetalle = {
      id_acceso:          "a1",
      id_usuario:         "u1",
      id_gimnasio:        "g1",
      fecha_hora_entrada: "2026-05-26T09:00:00Z",
      fecha_hora_salida:  null,
      tipo_acceso:        "qr",
      estado_acceso:      "permitido",
      razon_denegacion:   null,
      nombre_usuario:     "Juan Quispe",
      plan_usuario:       "Gold Premium",
    }

    expect(acceso.estado_acceso).toBe("permitido")
    expect(acceso.tipo_acceso).toBe("qr")
    expect(acceso.fecha_hora_salida).toBeNull()
  })
})
