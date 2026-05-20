"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Sidebar } from "@/components/app/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00D084]/30 border-t-[#00D084] rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#070D18] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
