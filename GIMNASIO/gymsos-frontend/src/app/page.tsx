import { Navbar }           from "@/components/layout/navbar"
import { Footer }           from "@/components/layout/footer"
import { Hero }             from "@/components/sections/hero"
import { Ticker }           from "@/components/sections/ticker"
import { Stats }            from "@/components/sections/stats"
import { Features }         from "@/components/sections/features"
import { PhoneShowcase }    from "@/components/sections/phone-showcase"
import { DashboardPreview } from "@/components/sections/dashboard-preview"
import { CTA }              from "@/components/sections/cta"

export default function HomePage() {
  return (
    <main className="bg-[#070D18] overflow-hidden">
      <Navbar />
      <Hero />
      <Ticker />
      <Stats />
      <Features />
      <PhoneShowcase />
      <DashboardPreview />
      <CTA />
      <Footer />
    </main>
  )
}
