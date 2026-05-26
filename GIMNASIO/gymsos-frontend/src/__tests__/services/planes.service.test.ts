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
  single:  () => Promise.resolve({ data: { id_plan: "plan-nuevo" }, error: null }),
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
  getPlanesPorGimnasio,
  getPlanesConConteo,
  crearPlan,
  actualizarPlan,
  desactivarPlan,
  type Plan,
} from "@/lib/services/planes.service"

describe("getPlanesPorGimnasio", () => {
  test("es una función", () => {
    expect(typeof getPlanesPorGimnasio).toBe("function")
  })

  test("retorna un array", async () => {
    const result = await getPlanesPorGimnasio("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta gymId como string", async () => {
    await expect(getPlanesPorGimnasio("gym-001")).resolves.not.toThrow()
  })
})

describe("getPlanesConConteo", () => {
  test("es una función", () => {
    expect(typeof getPlanesConConteo).toBe("function")
  })

  test("retorna un array", async () => {
    const result = await getPlanesConConteo("gym-001")
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("crearPlan", () => {
  test("es una función", () => {
    expect(typeof crearPlan).toBe("function")
  })

  test("retorna un string (id del plan)", async () => {
    const nuevoPlan = {
      id_gimnasio:         "gym-001",
      nombre:              "Test Plan",
      precio_mensual:      99.90,
      precio_trimestral:   null,
      precio_anual:        null,
      duracion_dias:       30,
      clases_incluidas:    null,
      horarios_acceso:     null,
      sucursales_incluidas: "una" as Plan["sucursales_incluidas"],
      descripcion:         null,
      activo:              true,
    }
    const id = await crearPlan(nuevoPlan)
    expect(typeof id).toBe("string")
  })
})

describe("actualizarPlan", () => {
  test("es una función", () => {
    expect(typeof actualizarPlan).toBe("function")
  })

  test("no lanza cuando se llama con cambios válidos", async () => {
    await expect(actualizarPlan("plan-001", { activo: false })).resolves.not.toThrow()
  })
})

describe("desactivarPlan", () => {
  test("es una función", () => {
    expect(typeof desactivarPlan).toBe("function")
  })

  test("no lanza cuando se llama con un id válido", async () => {
    await expect(desactivarPlan("plan-001")).resolves.not.toThrow()
  })
})

describe("Plan type shape", () => {
  test("Plan tiene los campos requeridos", () => {
    const plan: Plan = {
      id_plan:              "p1",
      id_gimnasio:          "g1",
      nombre:               "Basic",
      precio_mensual:       79.90,
      precio_trimestral:    null,
      precio_anual:         null,
      duracion_dias:        30,
      clases_incluidas:     null,
      horarios_acceso:      null,
      sucursales_incluidas: "una",
      descripcion:          null,
      activo:               true,
    }
    expect(plan.id_plan).toBeDefined()
    expect(plan.nombre).toBeDefined()
    expect(plan.precio_mensual).toBeGreaterThan(0)
    expect(plan.duracion_dias).toBeGreaterThanOrEqual(1)
    expect(typeof plan.activo).toBe("boolean")
  })
})
