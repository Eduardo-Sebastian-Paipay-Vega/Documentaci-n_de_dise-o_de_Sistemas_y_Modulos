# Design System & UI/UX Tokens — GYMsos Operating System

> **Proyecto**: GYMsos Operating System
> **Fase**: Fase 6 — Sistema Central de Diseño
> **Versión**: 1.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🌌 Visión General del Sistema de Diseño

El **Sistema de Diseño GYMsos** establece la infraestructura visual y táctil unificada para todas las verticales del ecosistema (**GIMNASIO**, **EDUCACION**, **Comerci**). Diseñado bajo principios de estética de alto impacto (*Unicorn Grade*), combina modos oscuros profundos, efectos de glassmorphism, micro-animaciones dinámicas y paletas cromáticas armónicas basadas en HSL.

---

## 🎨 1. Paleta Cromática y Tokens HSL

### 1.1 Colores Primarios y Neutros (Dark & Light Mode)

```css
:root {
  /* Brand Primary & Accents */
  --color-brand-primary-hue: 250;
  --color-brand-primary-sat: 84%;
  --color-brand-primary-light: 60%;
  --color-brand-primary: hsl(var(--color-brand-primary-hue), var(--color-brand-primary-sat), var(--color-brand-primary-light));
  --color-brand-primary-hover: hsl(var(--color-brand-primary-hue), var(--color-brand-primary-sat), 50%);
  --color-brand-glow: hsla(var(--color-brand-primary-hue), 90%, 65%, 0.35);

  /* Energy Accent (Fitness & Gamification) */
  --color-energy-cyan: hsl(186, 100%, 50%);
  --color-energy-neon: hsl(138, 100%, 52%);
  --color-energy-amber: hsl(38, 100%, 54%);
  --color-energy-rose: hsl(342, 100%, 62%);

  /* Backgrounds & Surface Tokens (Dark Theme Master) */
  --bg-app-master: hsl(240, 15%, 8%);
  --bg-surface-card: hsla(240, 12%, 12%, 0.75);
  --bg-surface-card-hover: hsla(240, 12%, 16%, 0.85);
  --bg-glass-overlay: hsla(240, 20%, 10%, 0.65);

  /* Text & Contrast Tokens */
  --text-primary: hsl(0, 0%, 98%);
  --text-secondary: hsl(240, 5%, 75%);
  --text-muted: hsl(240, 4%, 55%);
  --text-inverse: hsl(240, 15%, 8%);

  /* Border & Glassmorphism Spec */
  --border-glass: 1px solid hsla(0, 0%, 100%, 0.12);
  --border-glass-glow: 1px solid hsla(var(--color-brand-primary-hue), 80%, 65%, 0.4);
  --backdrop-blur-std: blur(16px);
}
```

---

## 🔤 2. Tipografía y Escala Modular

El sistema utiliza **Inter** o **Outfit** de Google Fonts para ofrecer legibilidad superior en interfaces densas en datos y paneles analíticos.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;900&display=swap');

:root {
  --font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-display: 'Outfit', var(--font-family-sans);

  /* Typography Sizes (1.25 Modular Scale) */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-md: 1.00rem;    /* 16px */
  --font-size-lg: 1.25rem;    /* 20px */
  --font-size-xl: 1.563rem;   /* 25px */
  --font-size-2xl: 1.953rem;  /* 31px */
  --font-size-3xl: 2.441rem;  /* 39px */
  --font-size-4xl: 3.052rem;  /* 49px */

  /* Line Heights */
  --line-height-tight: 1.15;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

## 📐 3. Espaciado, Layout Grid y Sombras

```css
:root {
  /* Spacing Scale (8pt Grid System) */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.50rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1.00rem; /* 16px */
  --space-6: 1.50rem; /* 24px */
  --space-8: 2.00rem; /* 32px */
  --space-12: 3.00rem; /* 48px */
  --space-16: 4.00rem; /* 64px */

  /* Border Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Elevated Shadows & Glows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.45);
  --shadow-glow-primary: 0 0 20px var(--color-brand-glow);
  --shadow-glow-cyan: 0 0 20px hsla(186, 100%, 50%, 0.3);
}
```

---

## ✨ 4. Micro-animaciones y Transiciones

```css
:root {
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Keyframe Micro-animations */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 15px var(--color-brand-glow);
  }
  50% {
    box-shadow: 0 0 30px var(--color-brand-glow);
  }
}

@keyframes slide-up-fade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## ♿ 5. Estándares de Accesibilidad (WCAG 2.1 AA)

1. **Ratio de Contraste**: Mínimo 4.5:1 para texto normal y 3:1 para texto grande o elementos interactivos de la interfaz.
2. **Focus Indicators**: Borde de enfoque de 2px de alto contraste (`--color-energy-cyan`) en navegación mediante teclado (`:focus-visible`).
3. **Soporte `prefers-reduced-motion`**:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Diseño de Tokens de Sistema GYMsos v1.0 — Documento Maestro.*
