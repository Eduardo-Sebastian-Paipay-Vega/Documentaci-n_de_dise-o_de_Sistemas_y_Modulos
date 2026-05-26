// chainBuilder and signUpMock are referenced lazily via arrow functions
// in jest.mock factories to avoid temporal dead zone (jest.mock is hoisted)
const chainBuilder: any = {
  select: function() { return this },
  eq:     function() { return this },
  order:  function() { return this },
  limit:  function() { return this },
  gte:    function() { return this },
  lte:    function() { return this },
  lt:     function() { return this },
  in:     function() { return this },
  or:     function() { return this },
  insert: function() { return this },
  update: function() { return this },
  range:  function() { return this },
  then:   (fn: Function) => Promise.resolve({ data: [], error: null, count: 0 }).then(fn),
  single: jest.fn().mockResolvedValue({
    data:  { id_usuario: "u1", id_membresia: "m1", id_pago: "p1" },
    error: null,
  }),
}

const signUpMock = jest.fn().mockResolvedValue({
  data:  { user: { id: "auth-user-id" } },
  error: null,
})

// Lazy references (arrow functions) avoid temporal dead zone issues
jest.mock("@/lib/supabase", () => ({
  supabase:   { from: (...a: any[]) => chainBuilder, auth: { signUp: (...a: any[]) => signUpMock(...a) } },
  isDemoMode: false,
}))

jest.mock("@/lib/services/base", () => ({
  supabase:            { from: (...a: any[]) => chainBuilder, auth: { signUp: (...a: any[]) => signUpMock(...a) } },
  handleSupabaseError: jest.fn((e: any) => { throw new Error(e?.message ?? "DB Error") }),
  ServiceError:        class ServiceError extends Error {},
}))

import {
  actualizarEstadoUsuario,
  contarMiembrosPorEstado,
  getUsuariosPorGimnasio,
  getUsuarioById,
  buscarUsuarios,
  registrarNuevoMiembro,
  type UsuarioConMembresia,
} from "@/lib/services/usuarios.service"

beforeEach(() => {
  jest.clearAllMocks()
  signUpMock.mockResolvedValue({ data: { user: { id: "auth-user-id" } }, error: null })
  chainBuilder.single.mockResolvedValue({
    data:  { id_usuario: "u1", id_membresia: "m1", id_pago: "p1" },
    error: null,
  })
})

describe("getUsuariosPorGimnasio", () => {
  test("es una función", () => {
    expect(typeof getUsuariosPorGimnasio).toBe("function")
  })

  test("retorna PaginatedResult con data y count", async () => {
    const result = await getUsuariosPorGimnasio("gym-001")
    expect(result).toHaveProperty("data")
    expect(result).toHaveProperty("count")
    expect(Array.isArray(result.data)).toBe(true)
  })

  test("acepta opción rol", async () => {
    await expect(getUsuariosPorGimnasio("gym-001", { rol: "miembro" })).resolves.not.toThrow()
  })

  test("acepta opción estado", async () => {
    await expect(getUsuariosPorGimnasio("gym-001", { estado: "activo" })).resolves.not.toThrow()
  })

  test("acepta opción busqueda", async () => {
    await expect(getUsuariosPorGimnasio("gym-001", { busqueda: "juan" })).resolves.not.toThrow()
  })

  test("acepta opciones de paginación limit y offset", async () => {
    await expect(
      getUsuariosPorGimnasio("gym-001", { limit: 10, offset: 20 })
    ).resolves.not.toThrow()
  })
})

describe("getUsuarioById", () => {
  test("es una función", () => {
    expect(typeof getUsuarioById).toBe("function")
  })

  test("retorna null para error PGRST116 (no encontrado)", async () => {
    chainBuilder.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } })
    const result = await getUsuarioById("user-no-existe")
    expect(result).toBeNull()
  })

  test("retorna usuario cuando single devuelve datos", async () => {
    chainBuilder.single.mockResolvedValueOnce({
      data: {
        id_usuario: "u1", email: "a@b.com", nombre: "Ana", telefono: null,
        fecha_nacimiento: null, documento: null, genero: "F",
        id_gimnasio: "g1", rol: "miembro", estado: "activo",
        created_at: "2026-01-01", updated_at: null,
        gimnasios: { nombre: "GymTest" }, membresias: [],
      },
      error: null,
    })
    const result = await getUsuarioById("u1")
    expect(result).not.toBeNull()
    expect(result?.nombre_gimnasio).toBe("GymTest")
  })
})

describe("actualizarEstadoUsuario", () => {
  test("es una función", () => {
    expect(typeof actualizarEstadoUsuario).toBe("function")
  })

  test("acepta los tres estados válidos", async () => {
    await expect(actualizarEstadoUsuario("u1", "activo")).resolves.not.toThrow()
    await expect(actualizarEstadoUsuario("u1", "inactivo")).resolves.not.toThrow()
    await expect(actualizarEstadoUsuario("u1", "suspendido")).resolves.not.toThrow()
  })
})

describe("buscarUsuarios", () => {
  test("es una función", () => {
    expect(typeof buscarUsuarios).toBe("function")
  })

  test("retorna array vacío cuando termino está vacío", async () => {
    const result = await buscarUsuarios("gym-001", "")
    expect(result).toEqual([])
  })

  test("retorna array vacío cuando termino es solo espacios", async () => {
    const result = await buscarUsuarios("gym-001", "   ")
    expect(result).toEqual([])
  })

  test("llama a supabase cuando termino tiene contenido", async () => {
    const result = await buscarUsuarios("gym-001", "Juan")
    expect(Array.isArray(result)).toBe(true)
  })

  test("acepta parámetro limit personalizado", async () => {
    await expect(buscarUsuarios("gym-001", "Ana", 3)).resolves.not.toThrow()
  })
})

describe("registrarNuevoMiembro", () => {
  test("es una función", () => {
    expect(typeof registrarNuevoMiembro).toBe("function")
  })

  test("llama a auth.signUp con el email del miembro", async () => {
    chainBuilder.single
      .mockResolvedValueOnce({ data: { id_membresia: "mem-001" }, error: null })
      .mockResolvedValueOnce({ data: { id_pago: "pago-001" },    error: null })

    await registrarNuevoMiembro({
      nombre: "Carlos Test", email: "carlos@test.com",
      id_gimnasio: "gym-001", id_plan: "plan-001",
      metodo_pago: "efectivo", monto: 79.90,
    })

    expect(signUpMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "carlos@test.com" })
    )
  })

  test("retorna ids de usuario, membresia y pago", async () => {
    chainBuilder.single
      .mockResolvedValueOnce({ data: { id_membresia: "mem-001" }, error: null })
      .mockResolvedValueOnce({ data: { id_pago: "pago-001" },    error: null })

    const result = await registrarNuevoMiembro({
      nombre: "Maria Test", email: "maria@test.com", telefono: "999888777",
      documento: "12345678", genero: "F",
      id_gimnasio: "gym-001", id_plan: "plan-001", duracion_dias: 30,
      metodo_pago: "yape", monto: 109.90,
    })

    expect(result).toHaveProperty("id_usuario")
    expect(result).toHaveProperty("id_membresia")
    expect(result).toHaveProperty("id_pago")
    expect(result.id_usuario).toBe("auth-user-id")
    expect(result.id_membresia).toBe("mem-001")
    expect(result.id_pago).toBe("pago-001")
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
  test("el tipo tiene los campos esperados", () => {
    const u: UsuarioConMembresia = {
      id_usuario: "u1", email: "test@email.com", nombre: "Test User",
      telefono: null, fecha_nacimiento: null, documento: null,
      genero: "M", id_gimnasio: "g1", rol: "miembro", estado: "activo",
      created_at: "2026-01-01", updated_at: null,
      membresia: {
        id_membresia: "m1", estado: "activa",
        fecha_inicio: "2026-01-01", fecha_vencimiento: "2026-12-31",
        plan_nombre: "Gold Premium", precio_mensual: 149.90,
      },
      score_churn: 25,
    }
    expect(u.id_usuario).toBe("u1")
    expect(u.membresia?.plan_nombre).toBe("Gold Premium")
    expect(u.score_churn).toBe(25)
  })
})
