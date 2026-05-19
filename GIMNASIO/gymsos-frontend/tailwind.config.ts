import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        gymsos: {
          green:   "#00D084",
          navy:    "#1F2937",
          orange:  "#FF6B35",
          success: "#10B981",
          error:   "#EF4444",
          gray:    "#6B7280",
        },
      },
      animation: {
        shimmer:       "shimmer 2s linear infinite",
        float:         "floatY 5s ease-in-out infinite",
        "float-slow":  "floatY 7s ease-in-out 0.5s infinite",
        "float-slower":"floatY 9s ease-in-out 1s infinite",
        ticker:        "ticker 35s linear infinite",
        "glow-pulse":  "glowPulse 4s ease-in-out infinite",
        "bar-grow":    "barGrow 1.2s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%":      { opacity: "1" },
        },
        barGrow: {
          "from": { width: "0%" },
          "to":   { width: "var(--bar-width, 0%)" },
        },
      },
      boxShadow: {
        "glow-green":  "0 0 40px rgba(0,208,132,0.25), 0 0 80px rgba(0,208,132,0.1)",
        "glow-orange": "0 0 40px rgba(255,107,53,0.2)",
        card:          "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        "card-hover":  "0 0 0 1px rgba(0,208,132,0.2), 0 8px 32px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
}

export default config
