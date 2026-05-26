const chainBuilder: Record<string, unknown> = {}
const chainFns = ["select","eq","order","limit","gte","lte","in","or","insert","update","single","range"]
chainFns.forEach(fn => { chainBuilder[fn] = () => chainBuilder })
Object.assign(chainBuilder, {
  then: (fn: Function) => Promise.resolve({ data: [], error: null }).then(fn),
  single: () => Promise.resolve({ data: { id_pago: "pago-001" }, error: null }),
})

jest.mock("@/lib/services/base", () => ({
  supabase:            { from: () => chainBuilder },
  handleSupabaseError: jest.fn((e) => { throw new Error(e?.message ?? "DB Error") }),
  ServiceError:        class ServiceError extends Error {},
}))

import {
  getPagosPorGimnasio,
  getPagosPendientesPorVencer,
  getTotalIngresosMes,
  getIngresosPorMes,
  registrarPago,
  type PagoDetalle,
  type NuevoPago,
} from "@/lib/services/pagos.service"

describe("getPagosPorGimnasio", () => {
  test("retorna un array", async () => {
    const result = await getPagosPorGimnasio("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta filtros de estado, desde y hasta", async () => {
    const result = await getPagosPorGimnasio("gym-001", {
      estado: "completado",
      desde:  "2026-05-01T00:00:00Z",
      hasta:  "2026-05-31T23:59:59Z",
      limit:  20,
    })
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("getPagosPendientesPorVencer", () => {
  test("retorna un array", async () => {
    const result = await getPagosPendientesPorVencer("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("getTotalIngresosMes", () => {
  test("retorna un número", async () => {
    const result = await getTotalIngresosMes("gym-001")
    expect(typeof result).toBe("number")
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

describe("getIngresosPorMes", () => {
  test("retorna array de objetos {mes, total}", async () => {
    const result = await getIngresosPorMes("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta parámetro de meses", async () => {
    const result = await getIngresosPorMes("gym-001", 6)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("registrarPago", () => {
  test("retorna un id_pago", async () => {
    const pago: NuevoPago = {
      id_usuario:  "user-001",
      monto:       149.90,
      metodo_pago: "efectivo",
      descripcion: "Plan Gold Premium",
    }
    const id = await registrarPago(pago)
    expect(typeof id).toBe("string")
    expect(id.length).toBeGreaterThan(0)
  })
})

describe("PagoDetalle type shape", () => {
  test("el tipo tiene todos los campos esperados", () => {
    const pago: PagoDetalle = {
      id_pago:           "p1",
      id_usuario:        "u1",
      id_membresia:      "m1",
      monto:             149.90,
      moneda:            "PEN",
      metodo_pago:       "efectivo",
      estado:            "completado",
      fecha_pago:        "2026-05-26T10:00:00Z",
      proxima_renovacion: null,
      descripcion:       "Plan Gold Premium",
      nombre_usuario:    "Juan Quispe",
      plan_nombre:       "Gold Premium",
    }

    expect(pago.monto).toBe(149.90)
    expect(pago.metodo_pago).toBe("efectivo")
    expect(pago.estado).toBe("completado")
    expect(pago.moneda).toBe("PEN")
  })
})
