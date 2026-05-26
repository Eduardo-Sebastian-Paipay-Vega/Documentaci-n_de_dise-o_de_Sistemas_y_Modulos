const chainBuilder: any = {
  select:  () => chainBuilder,
  eq:      () => chainBuilder,
  order:   () => chainBuilder,
  limit:   () => chainBuilder,
  gte:     () => chainBuilder,
  lte:     () => chainBuilder,
  lt:      () => chainBuilder,
  in:      () => chainBuilder,
  or:      () => chainBuilder,
  insert:  () => chainBuilder,
  update:  () => chainBuilder,
  single:  () => Promise.resolve({ data: { id_membresia: "mem-nuevo" }, error: null }),
  then:    (fn: Function) => Promise.resolve({ data: [], error: null }).then(fn),
}

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from:  () => chainBuilder,
    auth:  { signUp: jest.fn() },
  },
  isDemoMode: false,
  handleSupabaseError: jest.fn((e) => { throw new Error(e?.message ?? "DB Error") }),
}))

import {
  getMembresiasPorGimnasio,
  getMembresiaActiva,
  crearMembresia,
  cancelarMembresia,
  getMembresiasPorVencer,
  type MembresiaDetalle,
  type NuevaMembresia,
} from "@/lib/services/membresias.service"

describe("getMembresiasPorGimnasio", () => {
  test("es una función", () => {
    expect(typeof getMembresiasPorGimnasio).toBe("function")
  })

  test("retorna un array", async () => {
    const result = await getMembresiasPorGimnasio("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta opción estado", async () => {
    await expect(
      getMembresiasPorGimnasio("gym-001", { estado: "activa" })
    ).resolves.not.toThrow()
  })

  test("acepta opción limit", async () => {
    await expect(
      getMembresiasPorGimnasio("gym-001", { limit: 10 })
    ).resolves.not.toThrow()
  })
})

describe("getMembresiaActiva", () => {
  test("es una función", () => {
    expect(typeof getMembresiaActiva).toBe("function")
  })

  test("retorna null cuando single devuelve null data", async () => {
    const singleSpy = jest.spyOn(chainBuilder, "single")
      .mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } })

    const result = await getMembresiaActiva("user-001")
    expect(result).toBeNull()

    singleSpy.mockRestore()
  })
})

describe("crearMembresia", () => {
  test("es una función", () => {
    expect(typeof crearMembresia).toBe("function")
  })

  test("retorna un string (id_membresia)", async () => {
    const nueva: NuevaMembresia = {
      id_usuario:        "user-001",
      id_plan:           "plan-001",
      fecha_inicio:      "2026-01-01",
      fecha_vencimiento: "2026-01-31",
    }
    const id = await crearMembresia(nueva)
    expect(typeof id).toBe("string")
  })
})

describe("cancelarMembresia", () => {
  test("es una función", () => {
    expect(typeof cancelarMembresia).toBe("function")
  })

  test("no lanza cuando se llama con id y motivo válidos", async () => {
    await expect(
      cancelarMembresia("mem-001", "Solicitud del miembro")
    ).resolves.not.toThrow()
  })
})

describe("getMembresiasPorVencer", () => {
  test("es una función", () => {
    expect(typeof getMembresiasPorVencer).toBe("function")
  })

  test("retorna un array", async () => {
    const result = await getMembresiasPorVencer("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta parámetro diasHastaVencer", async () => {
    await expect(getMembresiasPorVencer("gym-001", 14)).resolves.not.toThrow()
  })
})

describe("MembresiaDetalle type shape", () => {
  test("NuevaMembresia tiene los campos requeridos", () => {
    const nueva: NuevaMembresia = {
      id_usuario:        "u1",
      id_plan:           "p1",
      fecha_inicio:      "2026-01-01",
      fecha_vencimiento: "2026-01-31",
    }
    expect(nueva.id_usuario).toBeDefined()
    expect(nueva.id_plan).toBeDefined()
    expect(nueva.fecha_inicio).toBeDefined()
    expect(nueva.fecha_vencimiento).toBeDefined()
  })
})
