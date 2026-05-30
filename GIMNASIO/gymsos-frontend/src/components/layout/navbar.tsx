"use client"

import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLenis } from "@/components/providers/lenis-provider"

const navLinks = [
  { label: "Características", href: "#features" },
  { label: "Innovaciones",    href: "#innovations" },
  { label: "Precios",         href: "#pricing" },
  { label: "Enterprise",      href: "#enterprise" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const lenis = useLenis()
  const router = useRouter()

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 40)
  })

  const scrollTo = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) lenis?.scrollTo(el as HTMLElement, { offset: -80 })
  }

  return (
    <motion.header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#070D18]/90 backdrop-blur-md border-b border-white/5 py-3"
          : "bg-transparent py-5",
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => lenis?.scrollTo(0)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-lg bg-[#00D084] flex items-center justify-center">
            <span className="text-[#070D18] font-black text-sm">G</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            GYM<span className="text-[#00D084]">sos</span>
          </span>
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-neutral-400 hover:text-white transition-colors font-medium px-4 py-2"
          >
            Iniciar Sesión
          </button>
          <motion.button
            onClick={() => router.push("/onboarding")}
            className="px-5 py-2.5 bg-[#00D084] text-[#070D18] font-bold rounded-xl text-sm hover:bg-[#00E891] transition-colors shadow-[0_0_20px_rgba(0,208,132,0.25)]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Registra tu Gimnasio
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-5 h-0.5 bg-white origin-center transition-colors"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-0.5 bg-white"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-5 h-0.5 bg-white origin-center"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={menuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-[#0D1526] border-t border-white/5"
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-neutral-300 hover:text-white text-left transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); router.push("/login") }}
            className="text-sm text-neutral-300 hover:text-white text-left transition-colors"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMenuOpen(false); router.push("/onboarding") }}
            className="mt-2 px-5 py-3 bg-[#00D084] text-[#070D18] font-bold rounded-xl text-sm w-full"
          >
            Registra tu Gimnasio
          </button>
        </div>
      </motion.div>
    </motion.header>
  )
}
