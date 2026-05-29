"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { type Rol } from "@/lib/auth"
import { navIndicator, slideInLeft } from "@/lib/motion"
import {
  LayoutDashboard, Users, BarChart3, CalendarDays, Tag, Settings,
  Home, CreditCard, QrCode, TrendingUp, MessageCircle,
  Dumbbell, ClipboardCheck, ClipboardList,
  UserPlus, Banknote, DoorOpen, Headphones,
  Apple, UtensilsCrossed, Microscope,
  LogOut, PanelLeft, ChevronRight,
  type LucideIcon
} from "lucide-react"

interface NavItem {
  href:   string
  icon:   LucideIcon
  label:  string
  badge?: string
}

const NAV_BY_ROL: Record<Rol, NavItem[]> = {
  gerente: [
    { href: "/dashboard/gerente",               icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/gerente/miembros",      icon: Users,           label: "Miembros" },
    { href: "/dashboard/gerente/reportes",      icon: BarChart3,       label: "Reportes" },
    { href: "/dashboard/gerente/clases",        icon: CalendarDays,    label: "Clases" },
    { href: "/dashboard/gerente/promociones",   icon: Tag,             label: "Promociones" },
    { href: "/dashboard/gerente/configuracion", icon: Settings,        label: "Configuración" },
  ],
  miembro: [
    { href: "/dashboard/miembro",               icon: Home,            label: "Inicio" },
    { href: "/dashboard/miembro/membresia",     icon: CreditCard,      label: "Mi Membresía" },
    { href: "/dashboard/miembro/clases",        icon: CalendarDays,    label: "Clases" },
    { href: "/dashboard/miembro/qr",            icon: QrCode,          label: "Acceso QR" },
    { href: "/dashboard/miembro/progreso",      icon: TrendingUp,      label: "Mi Progreso" },
    { href: "/dashboard/miembro/soporte",       icon: MessageCircle,   label: "Soporte" },
  ],
  cliente: [
    { href: "/dashboard/cliente",               icon: Home,            label: "Inicio" },
    { href: "/dashboard/cliente/membresia",     icon: CreditCard,      label: "Mi Membresía" },
    { href: "/dashboard/cliente/clases",        icon: CalendarDays,    label: "Clases" },
    { href: "/dashboard/cliente/qr",            icon: QrCode,          label: "Acceso QR" },
    { href: "/dashboard/cliente/progreso",      icon: TrendingUp,      label: "Mi Progreso" },
    { href: "/dashboard/cliente/soporte",       icon: MessageCircle,   label: "Soporte" },
  ],
  entrenador: [
    { href: "/dashboard/entrenador",            icon: Dumbbell,        label: "Dashboard" },
    { href: "/dashboard/entrenador/clases",     icon: CalendarDays,    label: "Mis Clases" },
    { href: "/dashboard/entrenador/clientes",   icon: Users,           label: "Mis Clientes" },
    { href: "/dashboard/entrenador/asistencia", icon: ClipboardCheck,  label: "Asistencia" },
    { href: "/dashboard/entrenador/evaluaciones",icon: ClipboardList,  label: "Evaluaciones" },
  ],
  recepcionista: [
    { href: "/dashboard/recepcionista",              icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/recepcionista/registro",     icon: UserPlus,        label: "Registrar" },
    { href: "/dashboard/recepcionista/pagos",        icon: Banknote,        label: "Pagos" },
    { href: "/dashboard/recepcionista/acceso",       icon: DoorOpen,        label: "Control Acceso", badge: "Live" },
    { href: "/dashboard/recepcionista/soporte",      icon: Headphones,      label: "Soporte" },
  ],
  nutricionista: [
    { href: "/dashboard/nutricionista",                      icon: LayoutDashboard,  label: "Dashboard" },
    { href: "/dashboard/nutricionista/miembros",             icon: Users,            label: "Mis Pacientes" },
    { href: "/dashboard/nutricionista/planes-nutricion",     icon: UtensilsCrossed,  label: "Planes Nutric." },
    { href: "/dashboard/nutricionista/evaluaciones",         icon: Microscope,       label: "Evaluaciones" },
    { href: "/dashboard/nutricionista/recetas",              icon: Apple,            label: "Recetas" },
  ],
}

const ROL_ACCENT: Record<Rol, string> = {
  gerente:        "var(--accent)",
  miembro:        "var(--accent)",
  cliente:        "#22C55E",
  entrenador:     "#F97316",
  recepcionista:  "#3B82F6",
  nutricionista:  "#10B981",
}

const ROL_LABEL: Record<Rol, string> = {
  gerente:        "Gerente",
  miembro:        "Miembro",
  cliente:        "Cliente",
  entrenador:     "Entrenador",
  recepcionista:  "Recepcionista",
  nutricionista:  "Nutricionista",
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null

  const nav    = NAV_BY_ROL[user.rol]
  const accent = ROL_ACCENT[user.rol]

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.9 }}
      className="relative h-screen flex flex-col shrink-0 overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-faint)",
      }}
    >
      {/* Header */}
      <div
        className="h-14 flex items-center px-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border-faint)" }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center"
            style={{ background: accent }}
          >
            <span className="text-[#09090B] font-black text-xs leading-none">G</span>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <span
                  className="text-sm font-semibold tracking-tight whitespace-nowrap"
                  style={{ color: "var(--text-primary)" }}
                >
                  GYM<span style={{ color: accent }}>sos</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={14} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {nav.map((item) => {
            const Icon   = item.icon
            const active = pathname === item.href

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-150 group",
                    active
                      ? "text-white"
                      : "hover:bg-white/4"
                  )}
                  style={active ? {
                    background: `${accent}12`,
                    color: "var(--text-primary)",
                  } : {
                    color: "var(--text-tertiary)",
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.color = "var(--text-secondary)"
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.color = "var(--text-tertiary)"
                  }}
                >
                  {/* Active pill indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                      style={{ background: accent }}
                      transition={navIndicator}
                    />
                  )}

                  <Icon
                    size={15}
                    className="shrink-0"
                    strokeWidth={active ? 2 : 1.75}
                    style={{ color: active ? accent : "inherit" }}
                  />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                        className="text-xs font-medium flex-1 whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && item.badge && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 tabular-nums"
                      style={{
                        background: item.badge === "Live"
                          ? `${accent}18`
                          : "rgba(255,255,255,0.07)",
                        color: item.badge === "Live"
                          ? accent
                          : "var(--text-tertiary)",
                      }}
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

      {/* User footer */}
      <div
        className="px-2 py-3 shrink-0"
        style={{ borderTop: "1px solid var(--border-faint)" }}
      >
        <div className="flex items-center gap-2.5 px-1.5">
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{
              background: `${accent}20`,
              color: accent,
              border: `1px solid ${accent}30`,
            }}
          >
            {user.nombre[0].toUpperCase()}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {user.nombre}
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                  {ROL_LABEL[user.rol]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button
              onClick={logout}
              className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--red)"
                e.currentTarget.style.background = "rgba(239,68,68,0.08)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--text-tertiary)"
                e.currentTarget.style.background = "transparent"
              }}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
