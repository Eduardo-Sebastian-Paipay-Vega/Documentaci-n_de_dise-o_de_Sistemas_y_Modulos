// Mock de supabase antes de importar el servicio
const mockSelect  = jest.fn()
const mockEq      = jest.fn()
const mockFrom    = jest.fn()
const mockOrder   = jest.fn()
const mockLimit   = jest.fn()
const mockGte     = jest.fn()
const mockLte     = jest.fn()
const mockSingle  = jest.fn()
const mockIn      = jest.fn()
const mockOr      = jest.fn()
const mockInsert  = jest.fn()
const mockUpdate  = jest.fn()

// Builder chain que retorna el mismo objeto encadenado
const chainBuilder = {
  select:  () => chainBuilder,
  eq:      () => chainBuilder,
  order:   () => chainBuilder,
  limit:   () => chainBuilder,
  gte:     () => chainBuilder,
  lte:     () => chainBuilder,
  single:  () => Promise.resolve({ data: null, error: null }),
  in:      () => chainBuilder,
  or:      () => chainBuilder,
  insert:  () => chainBuilder,
  update:  () => chainBuilder,
  then:    (fn: Function) => Promise.resolve({ data: [], error: null }).then(fn),
}

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => chainBuilder,
    auth:  { signUp: jest.fn() },
  },
  isDemoMode: false,
  handleSupabaseError: jest.fn((e) => { throw new Error(e?.message ?? "DB Error") }),
}))

import {
  getKPIsGerente,
  getChurnAtRisk,
  getIngresosPorMesGrafica,
  type KPIsGerente,
  type ChurnAtRisk,
  type IngresoMensual,
} from "@/lib/services/dashboard.service"

describe("getKPIsGerente", () => {
  test("retorna estructura KPIsGerente con todos los campos requeridos", async () => {
    const kpis = await getKPIsGerente("gym-001")
    expect(kpis).toHaveProperty("totalMiembros")
    expect(kpis).toHaveProperty("miembrosActivos")
    expect(kpis).toHaveProperty("ingresosMes")
    expect(kpis).toHaveProperty("tasaChurn")
    expect(kpis).toHaveProperty("npsScore")
    expect(kpis).toHaveProperty("accesoHoy")
    expect(kpis).toHaveProperty("clasesHoy")
    expect(kpis).toHaveProperty("churnDelta")
    expect(kpis).toHaveProperty("ingresosDelta")
    expect(kpis).toHaveProperty("miembrosDelta")
  })

  test("los valores numéricos son números válidos", async () => {
    const kpis = await getKPIsGerente("gym-001")
    expect(typeof kpis.totalMiembros).toBe("number")
    expect(typeof kpis.ingresosMes).toBe("number")
    expect(typeof kpis.tasaChurn).toBe("number")
    expect(typeof kpis.npsScore).toBe("number")
    expect(Number.isFinite(kpis.tasaChurn)).toBe(true)
  })

  test("ingresosMes nunca es negativo", async () => {
    const kpis = await getKPIsGerente("gym-001")
    expect(kpis.ingresosMes).toBeGreaterThanOrEqual(0)
  })

  test("tasaChurn está entre 0 y 100", async () => {
    const kpis = await getKPIsGerente("gym-001")
    expect(kpis.tasaChurn).toBeGreaterThanOrEqual(0)
    expect(kpis.tasaChurn).toBeLessThanOrEqual(100)
  })
})

describe("getChurnAtRisk", () => {
  test("retorna un array", async () => {
    const result = await getChurnAtRisk("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta parámetro limit", async () => {
    const result = await getChurnAtRisk("gym-001", 5)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("getIngresosPorMesGrafica", () => {
  test("retorna un array", async () => {
    const result = await getIngresosPorMesGrafica("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("cada elemento tiene campos mes e indice", async () => {
    const result = await getIngresosPorMesGrafica("gym-001")
    result.forEach((item: IngresoMensual) => {
      expect(item).toHaveProperty("mes")
      expect(item).toHaveProperty("indice")
    })
  })

  test("índice está entre 0 y 100", async () => {
    const result = await getIngresosPorMesGrafica("gym-001")
    result.forEach((item: IngresoMensual) => {
      expect(item.indice).toBeGreaterThanOrEqual(0)
      expect(item.indice).toBeLessThanOrEqual(100)
    })
  })
})
