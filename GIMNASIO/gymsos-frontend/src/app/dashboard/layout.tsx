"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Sidebar } from "@/components/app/sidebar"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: "var(--accent)" }}
          />
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Verificando sesión...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <Sidebar />
      <motion.main
        className="flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.main>
    </div>
  )
}
