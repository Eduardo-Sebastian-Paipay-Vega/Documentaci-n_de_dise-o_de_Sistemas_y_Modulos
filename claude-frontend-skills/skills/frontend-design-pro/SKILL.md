# SKILL: frontend-design-pro
# TIER: S — Frontend Architecture & Code Quality
# Authority: Project structure, TypeScript patterns, performance, component architecture

> This skill ensures the generated frontend code is production-grade, maintainable,
> and architecturally sound — not just visually impressive but structurally excellent.
> A beautiful UI on fragile architecture is not premium. Both must be excellent.

---

## PROJECT STRUCTURE

### Next.js App Router Structure
```
src/
├── app/
│   ├── (marketing)/           # Route group — no shared layout
│   │   ├── page.tsx           # Landing page
│   │   ├── about/page.tsx
│   │   └── pricing/page.tsx
│   ├── (app)/                 # Authenticated app route group
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                   # API routes
│   ├── layout.tsx             # Root layout
│   ├── template.tsx           # Page transition wrapper
│   └── globals.css
│
├── components/
│   ├── ui/                    # shadcn/ui + custom base components
│   ├── sections/              # Landing page sections
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── testimonials.tsx
│   │   └── cta.tsx
│   ├── layout/                # Header, Footer, Navigation
│   ├── forms/                 # Form components
│   ├── providers/             # Context providers (Lenis, Theme, etc.)
│   └── [feature]/             # Feature-specific components
│
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities, helpers, config
│   ├── utils.ts               # cn() and general utilities
│   ├── motion.ts              # Animation tokens and variants
│   └── fonts.ts               # next/font configuration
├── types/                     # TypeScript type definitions
├── styles/                    # Additional styles if needed
└── constants/                 # App-wide constants
```

---

## TYPESCRIPT PATTERNS

### Component Props Interface
```typescript
// Always define explicit prop interfaces
interface HeroSectionProps {
  headline: string
  subheadline?: string          // Optional with ?
  ctaLabel: string
  ctaHref: string
  variant?: "default" | "dark" | "gradient"  // Discriminated union
  className?: string            // Always allow className override
  children?: React.ReactNode    // When accepting children
}

export function HeroSection({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  variant = "default",         // Default value in destructure
  className,
}: HeroSectionProps) {
  // ...
}
```

### Type-Safe Motion Variants
```typescript
import { Variants } from "framer-motion"

// Type your variants for IDE autocomplete
const heroVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, y: -20 }
}
```

### Generic Utility Types
```typescript
// Common utility types to have in types/index.ts
export type WithClassName<T = {}> = T & { className?: string }
export type WithChildren<T = {}> = T & { children?: React.ReactNode }
export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// API response wrapper
export type ApiResponse<T> = {
  data: T
  error: null
} | {
  data: null
  error: string
}
```

---

## COMPONENT ARCHITECTURE PATTERNS

### Compound Components
```typescript
// For complex components with multiple parts
interface CardProps { className?: string; children: React.ReactNode }
interface CardHeaderProps { className?: string; children: React.ReactNode }
interface CardBodyProps { className?: string; children: React.ReactNode }

function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5", className)}>
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("p-6 border-b border-white/10", className)}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ className, children }: CardBodyProps) {
  return <div className={cn("p-6", className)}>{children}</div>
}

// Usage:
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### Polymorphic Components
```typescript
// Component that renders as different HTML elements
type PolymorphicProps<E extends React.ElementType> = {
  as?: E
  className?: string
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<E>

function Heading<E extends React.ElementType = "h2">({ 
  as, className, children, ...props 
}: PolymorphicProps<E>) {
  const Component = as ?? "h2"
  return (
    <Component 
      className={cn("font-bold text-white leading-tight", className)} 
      {...props}
    >
      {children}
    </Component>
  )
}

// Usage:
<Heading as="h1" className="text-7xl">Big Headline</Heading>
<Heading as="h3" className="text-2xl">Section Title</Heading>
```

### Data Display Components
```typescript
// Stat display with animation
interface StatProps {
  value: string | number
  label: string
  trend?: "up" | "down"
  trendValue?: string
}

function Stat({ value, label, trend, trendValue }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col gap-1"
    >
      <span className="text-4xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-sm text-neutral-500">{label}</span>
      {trend && (
        <span className={cn("text-xs font-medium",
          trend === "up" ? "text-green-400" : "text-red-400"
        )}>
          {trend === "up" ? "↑" : "↓"} {trendValue}
        </span>
      )}
    </motion.div>
  )
}
```

---

## RESPONSIVE PATTERNS

### Fluid Typography (clamp)
```typescript
// In globals.css — fluid type that scales between viewport sizes
.text-fluid-sm  { font-size: clamp(0.875rem, 1.5vw, 1rem) }
.text-fluid-base { font-size: clamp(1rem, 2vw, 1.125rem) }
.text-fluid-lg  { font-size: clamp(1.25rem, 3vw, 1.75rem) }
.text-fluid-xl  { font-size: clamp(1.75rem, 4vw, 3rem) }
.text-fluid-2xl { font-size: clamp(2.5rem, 6vw, 5rem) }
.text-fluid-3xl { font-size: clamp(3rem, 8vw, 8rem) }

// Or inline with Tailwind:
className="text-[clamp(3rem,8vw,8rem)] font-bold"
```

### Container Pattern
```typescript
// Consistent max-width container
function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}
// Usage: <Container className="py-24">...</Container>
```

---

## PERFORMANCE PATTERNS

### Image Optimization
```typescript
import Image from "next/image"

// Always use next/image — never <img>
<Image
  src="/hero-dashboard.png"
  alt="GYMsos dashboard showing member analytics"
  width={1200}
  height={800}
  priority={true}           // For above-the-fold images
  className="rounded-2xl"
  quality={90}              // 90 for hero images, 75 for smaller
/>

// Dynamic blur placeholder
<Image
  src={imageUrl}
  alt={alt}
  fill                       // For background images
  sizes="(max-width: 768px) 100vw, 50vw"  // Help browser choose size
  className="object-cover"
  placeholder="blur"
  blurDataURL={blurDataUrl}  // Generate with plaiceholder
/>
```

### Code Splitting
```typescript
// Lazy load heavy components
import { lazy, Suspense } from "react"

const HeavyChart = lazy(() => import("@/components/heavy-chart"))
const ThreeScene = lazy(() => import("@/components/three-scene"))

// With loading fallback
<Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
  <HeavyChart data={data} />
</Suspense>
```

### React Server Components (RSC) Strategy
```typescript
// Data fetching in Server Components (no useEffect, no loading states)
// app/page.tsx — Server Component by default
async function HomePage() {
  const stats = await fetchStats()  // Direct async/await
  
  return (
    <main>
      <HeroSection />              {/* Server component — no "use client" */}
      <StatsSection stats={stats} />
      <FeaturesSection />
      <InteractiveSection />       {/* "use client" only where needed */}
    </main>
  )
}

// Only add "use client" where you need:
// - useState, useEffect, useRef
// - Event handlers (onClick, onSubmit, etc.)
// - Browser APIs (window, document, etc.)
// - Framer Motion (animations)
```

---

## TAILWIND CONFIGURATION

```typescript
// tailwind.config.ts — premium configuration
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
        display: ["Cal Sans", "var(--font-display)", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        }
      },
      animation: {
        shimmer:    "shimmer 2s linear infinite",
        float:      "float 6s ease-in-out infinite",
        "fade-up":  "fadeUp 0.5s ease-out",
        pulse:      "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%":    { backgroundPosition: "-200% 0" },
          "100%":  { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-16px)" }
        },
        fadeUp: {
          "from": { opacity: "0", transform: "translateY(16px)" },
          "to":   { opacity: "1", transform: "translateY(0)" }
        }
      },
      boxShadow: {
        "premium": "0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)",
        "glow-blue": "0 0 30px rgba(59,130,246,0.3)",
        "glow-purple": "0 0 30px rgba(168,85,247,0.3)",
        "inner-glow": "inset 0 0 20px rgba(255,255,255,0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),  // for prose content
    require("tailwindcss-animate"),       // for shadcn/ui animations
  ],
}

export default config
```

---

## ERROR HANDLING PATTERN

```typescript
// Error boundary for graceful degradation
// app/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="mt-2 text-neutral-400">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-black"
        >
          Try again
        </button>
      </motion.div>
    </div>
  )
}
```

---

## CODE QUALITY CHECKLIST

```
□ All components have TypeScript interfaces for props
□ No inline styles (Tailwind only)
□ Images use next/image with width/height or fill
□ Animations only on opacity and transform
□ "use client" used minimally (only where state/events needed)
□ Server Components fetch data directly (no useEffect API calls)
□ cn() used for conditional classes
□ Error boundaries for client components
□ Loading states for async operations
□ Responsive classes on all layout elements (mobile-first)
□ Focus states on all interactive elements (accessibility)
□ aria-labels on icon buttons
□ prefers-reduced-motion respected in animations
```

---

*TIER S — Frontend Design Pro ensures architectural quality.
Visual beauty built on clean, maintainable, type-safe code.*
