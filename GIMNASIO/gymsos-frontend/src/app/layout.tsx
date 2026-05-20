import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LenisProvider } from "@/components/providers/lenis-provider"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GYMsos — El Sistema Operativo del Fitness",
  description:
    "La plataforma inteligente que aprende de cada rep, predice el abandono con 89% de precisión y automatiza la operación de tu gimnasio. Diseñado para 2.5M+ miembros y 500+ gimnasios en Latinoamérica.",
  keywords: ["gym management", "fitness software", "gimnasio", "GYMsos", "fitness OS"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <AuthProvider>
          <LenisProvider>{children}</LenisProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
