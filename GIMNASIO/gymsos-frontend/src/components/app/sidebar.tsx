"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { type Rol } from "@/lib/auth"

interface NavItem {
  href: string
  icon: string
  label: string
  badge?: string
}

const NAV_BY_ROL: Record<Rol, NavItem[]> = {
  gerente: [
    { href: "/dashboard/gerente",              icon: "📊", label: "Dashboard" },
    { href: "/dashboard/gerente/miembros",     icon: "👥", label: "Miembros", badge: "1,247" },
    { href: "/dashboard/gerente/reportes",     icon: "📈", label: "Reportes" },
    { href: "/dashboard/gerente/clases",       icon: "📅", label: "Clases" },
    { href: "/dashboard/gerente/promociones",  icon: "🎯", label: "Promociones" },
    { href: "/dashboard/gerente/configuracion",icon: "⚙️", label: "Configuración" },
  ],
  miembro: [
    { href: "/dashboard/miembro",              icon: "🏠", label: "Inicio" },
    { href: "/dashboard/miembro/membresia",    icon: "💳", label: "Mi Membresía" },
    { href: "/dashboard/miembro/clases",       icon: "📅", label: "Clases", badge: "3" },
    { href: "/dashboard/miembro/qr",           icon: "📱", label: "Acceso QR" },
    { href: "/dashboard/miembro/progreso",     icon: "📊", label: "Mi Progreso" },
    { href: "/dashboard/miembro/soporte",      icon: "💬", label: "Soporte" },
  ],
  entrenador: [
    { href: "/dashboard/entrenador",           icon: "🏋️", label: "Dashboard" },
    { href: "/dashboard/entrenador/clases",    icon: "📅", label: "Mis Clases", badge: "4" },
    { href: "/dashboard/entrenador/clientes",  icon: "👥", label: "Mis Clientes" },
    { href: "/dashboard/entrenador/asistencia",icon: "✅", label: "Asistencia" },
    { href: "/dashboard/entrenador/evaluaciones",icon:"📋", label: "Evaluaciones" },
  ],
  recepcionista: [
    { href: "/dashboard/recepcionista",                icon: "🗂️", label: "Dashboard" },
    { href: "/dashboard/recepcionista/registro",       icon: "➕", label: "Registrar Miembro" },
    { href: "/dashboard/recepcionista/pagos",          icon: "💰", label: "Procesar Pago" },
    { href: "/dashboard/recepcionista/acceso",         icon: "🚪", label: "Reg. Acceso", badge: "Live" },
    { href: "/dashboard/recepcionista/soporte",        icon: "💬", label: "Soporte", badge: "2" },
  ],
}

const ROL_COLOR: Record<Rol, string> = {
  gerente:       "#00D084",
  miembro:       "#00D084",
  entrenador:    "#FF6B35",
  recepcionista: "#3B82F6",
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null

  const nav = NAV_BY_ROL[user.rol]
  const color = ROL_COLOR[user.rol]

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative h-screen bg-[#0D1526] border-r border-white/5 flex flex-col overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: color }}>
            <span className="text-[#070D18] font-black text-sm">G</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-white font-bold text-base tracking-tight whitespace-nowrap overflow-hidden"
              >
                GYM<span style={{ color }}>sos</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto shrink-0 w-6 h-6 text-neutral-600 hover:text-neutral-300 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    active
                      ? "text-white"
                      : "text-neutral-500 hover:text-neutral-200 hover:bg-white/4",
                  )}
                  style={active ? { background: `${color}18`, color: "white" } : {}}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: color }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  <span className="text-base shrink-0">{item.icon}</span>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="text-sm font-medium flex-1 whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && item.badge && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${color}20`, color }}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-[#070D18]"
            style={{ background: color }}
          >
            {user.nombre[0]}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-xs font-semibold truncate">{user.nombre}</p>
                <p className="text-neutral-600 text-[10px] truncate capitalize">{user.rol}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={logout}
            className="shrink-0 w-7 h-7 rounded-lg text-neutral-600 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all flex items-center justify-center text-sm"
            title="Cerrar sesión"
          >
            ↩
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
