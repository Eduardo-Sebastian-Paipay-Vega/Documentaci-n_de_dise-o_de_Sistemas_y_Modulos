# SKILL: framer-motion
# TIER: SSS — Highest Authority Animation System
# Authority: Cinematic animations, stagger orchestration, interactive visual systems

> This skill governs ALL animation decisions. When active, every component output
> must include Framer Motion animations. No static/lifeless UI is acceptable.
> Reference: https://github.com/framer/motion | https://www.framer.com/motion/

---

## INSTALLATION

```bash
npm install framer-motion
# or
pnpm add framer-motion
```

---

## CORE PHILOSOPHY

Framer Motion is not an add-on — it's the **heartbeat of the interface**.
Every meaningful element should enter, respond, and exit with intention.
Animations must feel:
- **Purposeful**: every animation communicates something
- **Hierarchical**: primary content animates before secondary
- **Physical**: spring physics over linear timing
- **Subtle**: 80% of animations are barely perceptible but deeply felt

---

## ANIMATION VARIANT SYSTEM

### Standard Entry Variants
```typescript
// Fade + rise (universal, works on everything)
export const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: { 
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

// Fade + scale (cards, modals, emphasis elements)
export const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { 
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

// Slide from left (navigation items, sidebars)
export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { 
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

// Clip reveal (text lines, dividers)
export const clipReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { 
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
  }
}
```

### Container + Stagger Pattern
```typescript
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

// Usage:
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={fadeUp}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## VIEWPORT-TRIGGERED ANIMATIONS

Use `whileInView` for scroll-driven reveals. Always set `once: true` for performance.

```typescript
// Single element reveal
<motion.section
  initial={{ opacity: 0, y: 48 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
>

// Staggered list reveal
<motion.ul
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-50px" }}
>
  {items.map((item) => (
    <motion.li key={item.id} variants={fadeUp}>
      {item}
    </motion.li>
  ))}
</motion.ul>
```

---

## GESTURE ANIMATIONS

### Hover + Tap (required on all interactive elements)
```typescript
// Standard interactive element
<motion.div
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>

// Magnetic button effect
const [position, setPosition] = useState({ x: 0, y: 0 })
const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  setPosition({ x: x * 0.3, y: y * 0.3 })
}

<motion.button
  animate={{ x: position.x, y: position.y }}
  transition={{ type: "spring", stiffness: 350, damping: 25 }}
  onMouseMove={handleMouseMove}
  onMouseLeave={() => setPosition({ x: 0, y: 0 })}
/>

// Card 3D tilt on hover
const [rotateX, setRotateX] = useState(0)
const [rotateY, setRotateY] = useState(0)

<motion.div
  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / rect.height * -10
    const y = (e.clientX - rect.left - rect.width / 2) / rect.width * 10
    setRotateX(x); setRotateY(y)
  }}
  onMouseLeave={() => { setRotateX(0); setRotateY(0) }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

---

## LAYOUT ANIMATIONS

```typescript
// Animated layout changes (list reorder, expand/collapse)
<motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
  {/* content */}
</motion.div>

// Shared layout animations (tab indicator, selected state)
<AnimatePresence>
  {isSelected && (
    <motion.div
      layoutId="activeTab"
      className="absolute inset-0 bg-white rounded-lg"
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
    />
  )}
</AnimatePresence>

// Tab bar with animated indicator
{tabs.map((tab) => (
  <button key={tab.id} onClick={() => setActive(tab.id)} className="relative px-4 py-2">
    {active === tab.id && (
      <motion.div
        layoutId="tabIndicator"
        className="absolute inset-0 bg-white/10 rounded-lg"
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      />
    )}
    <span className="relative z-10">{tab.label}</span>
  </button>
))}
```

---

## PAGE TRANSITIONS

```typescript
// app/template.tsx — wrap every page in this
"use client"
import { motion } from "framer-motion"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

---

## SCROLL-LINKED ANIMATIONS

```typescript
import { useScroll, useTransform, motion } from "framer-motion"

// Parallax hero element
function ParallaxHero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, -200])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  
  return (
    <motion.div style={{ y, opacity }} className="relative">
      {/* hero content */}
    </motion.div>
  )
}

// Sticky section progress
function StickySection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])
  
  return (
    <div ref={ref} className="h-[300vh]">
      <motion.div style={{ scale, opacity }} className="sticky top-0 h-screen flex items-center">
        {children}
      </motion.div>
    </div>
  )
}
```

---

## TEXT REVEAL PATTERNS

```typescript
// Word-by-word reveal
function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(" ")
  return (
    <motion.h1
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 24, rotateX: -30 },
            visible: { opacity: 1, y: 0, rotateX: 0,
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}

// Character-by-character (use sparingly — for short hero text only)
function LetterReveal({ text }: { text: string }) {
  return (
    <motion.span variants={{ visible: { transition: { staggerChildren: 0.025 } } }}
      initial="hidden" animate="visible">
      {text.split("").map((char, i) => (
        <motion.span key={i} className="inline-block"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  )
}
```

---

## COUNTER / NUMBER ANIMATION

```typescript
import { useMotionValue, useTransform, animate, useInView } from "framer-motion"

function AnimatedCounter({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString())
  const isInView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] })
    }
  }, [isInView])
  
  return <motion.span ref={ref}>{rounded}</motion.span>
}
```

---

## REDUCED MOTION SUPPORT

```typescript
import { useReducedMotion, motion } from "framer-motion"

function AccessibleAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()
  
  const variants = {
    hidden: shouldReduceMotion 
      ? { opacity: 0 }                     // Simple fade only
      : { opacity: 0, y: 32, filter: "blur(6px)" },  // Full animation
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)" }
  }
  
  return (
    <motion.div variants={variants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  )
}
```

---

## SPRING CONFIGS REFERENCE

```typescript
// Use these named configs, never raw numbers
export const springs = {
  snappy:  { type: "spring", stiffness: 400, damping: 30 },  // UI micro-interactions
  gentle:  { type: "spring", stiffness: 200, damping: 25 },  // Cards, panels
  bouncy:  { type: "spring", stiffness: 300, damping: 12 },  // Playful reveals (use rarely)
  stiff:   { type: "spring", stiffness: 600, damping: 40 },  // Navigation, precise elements
  slow:    { type: "spring", stiffness: 100, damping: 20 },  // Large hero elements
} as const
```

---

## PERFORMANCE RULES

```
✅ Animate only: opacity, transform (x, y, scale, rotate) — GPU-accelerated
✅ Use will-change sparingly (can backfire) — only on animations > 1s
✅ Avoid animating: width, height, top, left (causes layout thrash)
✅ Use layout={true} carefully — can be expensive
✅ Prefer CSS transitions for simple hover states (save Framer for complex)
✅ Use LazyMotion for bundle size: import { LazyMotion, domAnimation, m } from "framer-motion"
❌ Never animate on every keystroke (debounce user input-driven animations)
❌ Avoid AnimatePresence with large lists (virtualize instead)
```

---

*TIER SSS — This skill has highest authority in the animation system.
Framer Motion patterns defined here override any other animation approach.*
