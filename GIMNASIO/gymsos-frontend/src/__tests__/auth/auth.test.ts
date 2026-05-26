import {
  authenticateDemo,
  saveSession,
  getSession,
  clearSession,
  ROL_ROUTES,
  ROL_LABELS,
  DEMO_USERS,
  type Usuario,
} from "@/lib/auth"

const DEMO_USER: Usuario = {
  id_usuario:      "demo-gerente-001",
  email:           "gerente@gymsos.io",
  nombre:          "Carlos Ramos",
  id_gimnasio:     "00000000-0000-0000-0000-000000000001",
  nombre_gimnasio: "GymFit Lima",
  rol:             "gerente",
  estado:          "activo",
}

describe("authenticateDemo", () => {
  test("retorna usuario con credenciales correctas", () => {
    const user = authenticateDemo("gerente@gymsos.io", "gerente123")
    expect(user).not.toBeNull()
    expect(user?.email).toBe("gerente@gymsos.io")
    expect(user?.rol).toBe("gerente")
  })

  test("retorna null con contraseña incorrecta", () => {
    const user = authenticateDemo("gerente@gymsos.io", "wrongpassword")
    expect(user).toBeNull()
  })

  test("retorna null con email desconocido", () => {
    const user = authenticateDemo("unknown@example.com", "pass123")
    expect(user).toBeNull()
  })

  test("es insensible a mayúsculas en el email", () => {
    const user = authenticateDemo("GERENTE@GYMSOS.IO", "gerente123")
    expect(user).not.toBeNull()
    expect(user?.rol).toBe("gerente")
  })

  test("ignora espacios al inicio y fin del email", () => {
    const user = authenticateDemo("  miembro@gymsos.io  ", "miembro123")
    expect(user).not.toBeNull()
    expect(user?.rol).toBe("miembro")
  })

  test("no expone el campo password en el usuario retornado", () => {
    const user = authenticateDemo("gerente@gymsos.io", "gerente123") as unknown as Record<string, unknown>
    expect(user?.password).toBeUndefined()
  })

  test("retorna todos los roles demo correctamente", () => {
    expect(authenticateDemo("miembro@gymsos.io",    "miembro123")?.rol).toBe("miembro")
    expect(authenticateDemo("entrenador@gymsos.io", "entrenador123")?.rol).toBe("entrenador")
    expect(authenticateDemo("recepcion@gymsos.io",  "recepcion123")?.rol).toBe("recepcionista")
  })

  test("el miembro demo tiene membresía", () => {
    const user = authenticateDemo("miembro@gymsos.io", "miembro123")
    expect(user?.membresia).toBeDefined()
    expect(user?.membresia?.plan).toBe("Gold Premium")
    expect(user?.membresia?.estado).toBe("activa")
  })
})

describe("session storage", () => {
  beforeEach(() => {
    clearSession()
  })

  test("saveSession + getSession retorna el mismo usuario", () => {
    saveSession(DEMO_USER)
    const retrieved = getSession()
    expect(retrieved).toEqual(DEMO_USER)
  })

  test("getSession retorna null cuando no hay sesión", () => {
    const session = getSession()
    expect(session).toBeNull()
  })

  test("clearSession elimina la sesión guardada", () => {
    saveSession(DEMO_USER)
    clearSession()
    expect(getSession()).toBeNull()
  })

  test("getSession retorna null si sessionStorage contiene JSON inválido", () => {
    sessionStorage.setItem("gymsos_session", "{invalid json}")
    expect(getSession()).toBeNull()
  })

  test("guardar y recuperar usuario con membresía", () => {
    const userConMembresia: Usuario = {
      ...DEMO_USER,
      membresia: {
        id_membresia:      "m1",
        plan:              "Gold Premium",
        fecha_inicio:      "2026-05-01",
        fecha_vencimiento: "2026-06-30",
        estado:            "activa",
      },
    }
    saveSession(userConMembresia)
    const retrieved = getSession()
    expect(retrieved?.membresia?.plan).toBe("Gold Premium")
    expect(retrieved?.membresia?.estado).toBe("activa")
  })
})

describe("ROL_ROUTES", () => {
  test("todos los roles tienen una ruta definida", () => {
    const roles = ["gerente", "miembro", "entrenador", "recepcionista"] as const
    roles.forEach(rol => {
      expect(ROL_ROUTES[rol]).toBeDefined()
      expect(ROL_ROUTES[rol]).toMatch(/^\/dashboard\//)
    })
  })

  test("rutas son únicas por rol", () => {
    const rutas = Object.values(ROL_ROUTES)
    const rutasUnicas = new Set(rutas)
    expect(rutasUnicas.size).toBe(rutas.length)
  })
})

describe("ROL_LABELS", () => {
  test("todos los roles tienen una etiqueta", () => {
    expect(ROL_LABELS.gerente).toBeTruthy()
    expect(ROL_LABELS.miembro).toBeTruthy()
    expect(ROL_LABELS.entrenador).toBeTruthy()
    expect(ROL_LABELS.recepcionista).toBeTruthy()
  })
})

describe("DEMO_USERS", () => {
  test("tiene exactamente 4 usuarios demo", () => {
    expect(Object.keys(DEMO_USERS).length).toBe(4)
  })

  test("cada usuario demo tiene id_gimnasio consistente", () => {
    const gymId = "00000000-0000-0000-0000-000000000001"
    Object.values(DEMO_USERS).forEach(u => {
      expect(u.id_gimnasio).toBe(gymId)
    })
  })

  test("todos los usuarios demo están activos", () => {
    Object.values(DEMO_USERS).forEach(u => {
      expect(u.estado).toBe("activo")
    })
  })
})
