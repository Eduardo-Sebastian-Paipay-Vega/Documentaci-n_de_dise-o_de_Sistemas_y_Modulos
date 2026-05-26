// Mock supabase antes de importar servicios
const chainBuilder: Record<string, unknown> = {}
const chainFns = ["select","eq","order","limit","gte","lte","in","or","insert","update","single","range"]
chainFns.forEach(fn => { chainBuilder[fn] = () => chainBuilder })
Object.assign(chainBuilder, {
  then: (fn: Function) => Promise.resolve({ data: [], error: null, count: 0 }).then(fn),
  single: () => Promise.resolve({ data: { id_usuario: "u1" }, error: null }),
})

jest.mock("@/lib/supabase", () => ({
  supabase: { from: () => chainBuilder, auth: { signUp: jest.fn() } },
  isDemoMode: false,
}))

jest.mock("@/lib/services/base", () => ({
  supabase:            { from: () => chainBuilder, auth: { signUp: jest.fn() } },
  handleSupabaseError: jest.fn((e) => { throw new Error(e?.message ?? "DB Error") }),
  ServiceError:        class ServiceError extends Error {},
}))

import {
  actualizarEstadoUsuario,
  contarMiembrosPorEstado,
  type UsuarioConMembresia,
} from "@/lib/services/usuarios.service"

describe("actualizarEstadoUsuario", () => {
  test("es una función", () => {
    expect(typeof actualizarEstadoUsuario).toBe("function")
  })

  test("acepta los tres estados válidos", async () => {
    // En modo mock el chainBuilder no lanza error
    await expect(actualizarEstadoUsuario("u1", "activo")).resolves.not.toThrow()
    await expect(actualizarEstadoUsuario("u1", "inactivo")).resolves.not.toThrow()
    await expect(actualizarEstadoUsuario("u1", "suspendido")).resolves.not.toThrow()
  })
})

describe("contarMiembrosPorEstado", () => {
  test("retorna objeto con conteos", async () => {
    const result = await contarMiembrosPorEstado("gym-001")
    expect(result).toHaveProperty("total")
    expect(result).toHaveProperty("activos")
    expect(result).toHaveProperty("inactivos")
    expect(result).toHaveProperty("suspendidos")
  })

  test("todos los conteos son números no negativos", async () => {
    const result = await contarMiembrosPorEstado("gym-001")
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.activos).toBeGreaterThanOrEqual(0)
    expect(result.inactivos).toBeGreaterThanOrEqual(0)
    expect(result.suspendidos).toBeGreaterThanOrEqual(0)
  })
})

describe("UsuarioConMembresia type shape", () => {
  test("el tipo tiene los campos esperados en demo data", () => {
    const u: UsuarioConMembresia = {
      id_usuario:  "u1",
      email:       "test@email.com",
      nombre:      "Test User",
      telefono:    null,
      fecha_nacimiento: null,
      documento:   null,
      genero:      "M",
      id_gimnasio: "g1",
      rol:         "miembro",
      estado:      "activo",
      created_at:  "2026-01-01",
      updated_at:  null,
      membresia: {
        id_membresia:      "m1",
        estado:            "activa",
        fecha_inicio:      "2026-01-01",
        fecha_vencimiento: "2026-12-31",
        plan_nombre:       "Gold Premium",
        precio_mensual:    149.90,
      },
      score_churn: 25,
    }

    expect(u.id_usuario).toBe("u1")
    expect(u.membresia?.plan_nombre).toBe("Gold Premium")
    expect(u.score_churn).toBe(25)
  })
})
