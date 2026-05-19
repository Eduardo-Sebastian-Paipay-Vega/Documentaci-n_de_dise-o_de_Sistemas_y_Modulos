import { cn } from "@/lib/utils"

const footerLinks = {
  Producto: ["Características", "Innovaciones", "Precios", "Roadmap"],
  Empresa:  ["Sobre nosotros", "Blog", "Careers", "Prensa"],
  Recursos: ["Documentación", "API", "Status", "Soporte"],
  Legal:    ["Privacidad", "Términos", "Cookies", "RGPD"],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#070D18]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00D084] flex items-center justify-center">
                <span className="text-[#070D18] font-black text-sm">G</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                GYM<span className="text-[#00D084]">sos</span>
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-[220px]">
              El Sistema Operativo Inteligente del Fitness para Latinoamérica y el mundo.
            </p>
            <div className="mt-6 flex gap-3">
              {["tw", "ig", "li", "gh"].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-xs text-neutral-500 hover:text-white hover:border-white/20 cursor-pointer transition-colors"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-white tracking-[0.12em] uppercase mb-4">
                {category}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            © 2026 GYMsos · Eduardo Sebastian Paipay Vega · UNSCH, Perú
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
            <span className="text-xs text-neutral-600">Todos los sistemas operativos</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
