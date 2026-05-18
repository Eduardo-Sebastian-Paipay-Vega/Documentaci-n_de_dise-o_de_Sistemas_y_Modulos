# SKILL: lenis
# TIER: SS — Smooth Scroll Infrastructure
# Authority: Scroll behavior, scroll velocity, inertia, scroll-driven animation foundation

> Lenis provides buttery smooth scrolling with momentum and easing.
> It transforms browser scrolling from mechanical to cinematic.
> Without Lenis, scroll animations feel cheap regardless of Framer Motion quality.
> Reference: https://github.com/darkroomengineering/lenis | https://lenis.darkroom.engineering/

---

## WHAT LENIS DOES

Native browser scroll:    Instant, mechanical, no inertia
Lenis smooth scroll:      Momentum-based, eased, cinematic

The difference is immediately perceptible — Lenis makes the entire page feel premium
even before a single animation plays.

---

## INSTALLATION

```bash
npm install lenis
# or
pnpm add lenis
```

---

## NEXT.JS INTEGRATION (App Router)

### Create the Lenis Provider
```typescript
// components/lenis-provider.tsx
"use client"

import Lenis from "lenis"
import { useEffect, useRef, createContext, useContext } from "react"

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,              // Duration of the scroll animation (seconds)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // Premium expo ease
      orientation: "vertical",    // vertical or horizontal
      gestureOrientation: "vertical",
      smoothWheel: true,          // Enable smooth wheel scrolling
      wheelMultiplier: 1,         // Mouse wheel sensitivity
      touchMultiplier: 2,         // Touch sensitivity
      infinite: false,            // Infinite scroll
    })
    
    lenisRef.current = lenis
    
    // Sync with requestAnimationFrame
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    
    return () => lenis.destroy()
  }, [])
  
  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
```

### Wire into Root Layout
```typescript
// app/layout.tsx
import { LenisProvider } from "@/components/lenis-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
```

---

## LENIS + GSAP SCROLLTRIGGER SYNC

Lenis and GSAP ScrollTrigger must be synced or scroll positions will conflict:

```typescript
// The definitive integration
"use client"

import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect } from "react"

gsap.registerPlugin(ScrollTrigger)

export function LenisGSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    
    // Sync Lenis scroll position to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)
    
    // Add Lenis to GSAP ticker so they share the same RAF loop
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)  // GSAP uses seconds, Lenis uses ms
    })
    
    // Disable GSAP's default lag smoothing (Lenis handles it)
    gsap.ticker.lagSmoothing(0)
    
    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
    }
  }, [])
  
  return <>{children}</>
}
```

---

## LENIS + FRAMER MOTION SYNC

For Framer Motion's `useScroll` to work correctly with Lenis:

```typescript
// hooks/use-lenis-scroll.ts
import { useScroll } from "framer-motion"
import { useEffect, useState } from "react"
import { useLenis } from "@/components/lenis-provider"

// Framer Motion's useScroll reads from the browser scroll position
// Lenis updates that position smoothly, so they work together automatically
// Just make sure to use window as the container (default)

export function useParallax(speed: number = 0.5) {
  const { scrollY } = useScroll()  // Works with Lenis automatically
  const lenis = useLenis()
  
  return { scrollY, lenis }
}
```

---

## SCROLL TO / PROGRAMMATIC CONTROL

```typescript
// Smooth scroll to element
function ScrollButton({ target }: { target: string }) {
  const lenis = useLenis()
  
  const handleClick = () => {
    lenis?.scrollTo(target, {
      offset: -80,      // Offset from top (for fixed headers)
      duration: 1.5,    // Override default duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  }
  
  return <button onClick={handleClick}>Scroll to section</button>
}

// Scroll to top
const scrollToTop = () => {
  lenis?.scrollTo(0, { duration: 1.2 })
}

// Scroll to element ref
const sectionRef = useRef<HTMLElement>(null)
const scrollToSection = () => {
  if (sectionRef.current) {
    lenis?.scrollTo(sectionRef.current, { offset: -100 })
  }
}
```

---

## SCROLL VELOCITY FOR EFFECTS

```typescript
// Use Lenis scroll velocity to drive visual effects
// Tilt/skew elements based on scroll speed

function VelocitySkewElement({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  
  useEffect(() => {
    if (!lenis || !ref.current) return
    
    lenis.on("scroll", ({ velocity }: { velocity: number }) => {
      if (ref.current) {
        ref.current.style.transform = `skewY(${velocity * -0.03}deg)`
      }
    })
  }, [lenis])
  
  return (
    <div ref={ref} style={{ transition: "transform 0.3s ease-out" }}>
      {children}
    </div>
  )
}
```

---

## HORIZONTAL SCROLL

```typescript
// Horizontal scrolling container with Lenis
const horizontalRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const container = horizontalRef.current
  if (!container) return
  
  const lenis = new Lenis({
    wrapper: container,
    content: container.firstElementChild as HTMLElement,
    orientation: "horizontal",
    gestureOrientation: "both",  // Accept both wheel and touch
    smoothWheel: true,
    duration: 1.0,
  })
  
  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  
  return () => lenis.destroy()
}, [])
```

---

## SCROLL STOP/START (for modals, menus)

```typescript
// Prevent scroll when modal is open
function Modal({ isOpen, onClose, children }: ModalProps) {
  const lenis = useLenis()
  
  useEffect(() => {
    if (isOpen) {
      lenis?.stop()     // Freeze scroll
    } else {
      lenis?.start()    // Resume scroll
    }
    
    return () => lenis?.start()
  }, [isOpen, lenis])
  
  // ... render modal
}
```

---

## CONFIGURATION REFERENCE

```typescript
new Lenis({
  // Duration of the smoothing (seconds). Higher = more inertia
  duration: 1.2,           // Default: 1.2 | Range: 0.5 (snappy) → 2.0 (very floaty)
  
  // Easing function — controls the deceleration curve
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // Expo ease (premium)
  // Or: easing: (t) => 1 - Math.pow(1 - t, 3)   // Cubic ease
  
  // Direction
  orientation: "vertical",        // "vertical" | "horizontal"
  gestureOrientation: "vertical",  // Same options
  
  // Multipliers (sensitivity)
  wheelMultiplier: 1,    // 0.5 = half speed, 2.0 = double speed
  touchMultiplier: 2,    // Typically higher than wheel
  
  // Features
  smoothWheel: true,     // Smooth mouse wheel
  infinite: false,       // Infinite scroll loop
  syncTouch: false,      // Also smooth touch (experimental)
})
```

---

## PERFORMANCE NOTES

```
✅ Lenis replaces the browser's native scroll — it reads wheel events and applies
   its own transform/scrollTop, so there's no double-processing
✅ One RAF loop per page (don't create multiple Lenis instances for the same scroll area)
✅ useEffect cleanup: always call lenis.destroy() on unmount
✅ Works alongside GSAP, Framer Motion, and CSS transitions
❌ Don't use with overflow: scroll on body (use overflow: hidden + Lenis handles scroll)
❌ Don't mix with another scroll library (locomotive-scroll, smooth-scrollbar, etc.)
```

---

## LENIS DURATIONS FOR DIFFERENT CONTEXTS

```
Landing pages:          duration: 1.2  (cinematic, impressive)
Web apps / dashboards:  duration: 0.8  (responsive, efficient)
Portfolio sites:        duration: 1.5  (luxurious, slow)
Mobile:                 syncTouch: false (let native handle touch)
```

---

*TIER SS — Lenis is the scroll infrastructure that makes all scroll-driven
animations feel cinematic. Install it before building any scroll effects.*
