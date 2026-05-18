# SKILL: motion-system
# TIER: SS — Animation Orchestration Layer
# Authority: Motion coordination, animation timing, cross-page continuity

> This skill coordinates ALL animation systems across the page.
> It ensures animations feel connected, hierarchical, and cinematic — not random.
> Think of it as the motion director's system-level decisions.

---

## THE FOUR-RHYTHM SYSTEM

Every complete page must implement all four animation rhythms:

```
┌─────────────────────────────────────────────────────────┐
│  RHYTHM 1: ENTRY          (page load → primary reveals)  │
│  RHYTHM 2: INTERACTION    (hover/click → tactile feedback)│
│  RHYTHM 3: SCROLL         (scroll-driven reveals + effects)│
│  RHYTHM 4: AMBIENT        (continuous low-key motion)    │
└─────────────────────────────────────────────────────────┘
```

---

## RHYTHM 1: ENTRY CHOREOGRAPHY

### Page Load Sequence (timing is everything)
```typescript
// Define the entrance timeline
const ENTRY_TIMELINE = {
  navbar:     { delay: 0,    duration: 0.4 },
  badge:      { delay: 0.1,  duration: 0.5 },
  headline:   { delay: 0.2,  duration: 0.7 },
  subtitle:   { delay: 0.4,  duration: 0.5 },
  cta:        { delay: 0.5,  duration: 0.4 },
  visual:     { delay: 0.3,  duration: 0.8 },
  background: { delay: 0,    duration: 1.2 },  // starts immediately, takes longest
}

// Usage pattern
<motion.nav
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    delay: ENTRY_TIMELINE.navbar.delay,
    duration: ENTRY_TIMELINE.navbar.duration,
    ease: [0.16, 1, 0.3, 1]
  }}
/>

<motion.h1
  initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  transition={{ 
    delay: ENTRY_TIMELINE.headline.delay,
    duration: ENTRY_TIMELINE.headline.duration,
    ease: [0.16, 1, 0.3, 1]
  }}
/>
```

### Entry Stagger Logic
```typescript
// Primary content stagger (0.08s between items)
const primaryStagger = {
  container: { staggerChildren: 0.08, delayChildren: 0.15 },
  item: { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
}

// Secondary content stagger (0.05s — faster, less important)
const secondaryStagger = {
  container: { staggerChildren: 0.05, delayChildren: 0.4 },
  item: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
}

// Large section stagger (0.12s — slower, more dramatic)
const dramaticStagger = {
  container: { staggerChildren: 0.12, delayChildren: 0.1 },
  item: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }
}
```

---

## RHYTHM 2: INTERACTION CHOREOGRAPHY

### Hover State System
```typescript
// Define all interactive hover states in one place
export const interactionVariants = {
  
  // Button: lift + brighten
  button: {
    rest: { scale: 1, y: 0, filter: "brightness(1)" },
    hover: { scale: 1.02, y: -2, filter: "brightness(1.1)" },
    tap: { scale: 0.97, y: 0, filter: "brightness(0.95)" },
  },
  
  // Card: lift + shadow
  card: {
    rest: { scale: 1, y: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
    hover: { scale: 1.01, y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" },
  },
  
  // Nav item: subtle slide
  navItem: {
    rest: { x: 0, opacity: 0.7 },
    hover: { x: 4, opacity: 1 },
  },
  
  // Icon: rotate + scale
  icon: {
    rest: { rotate: 0, scale: 1 },
    hover: { rotate: 15, scale: 1.15 },
  },
  
  // Link: underline expand
  link: {
    rest: { scaleX: 0, originX: 0 },
    hover: { scaleX: 1 },
  }
}
```

### Focus / Active States
```typescript
// Consistent focus ring system
<motion.button
  whileFocus={{ 
    outline: "2px solid #3b82f6",
    outlineOffset: "2px"
  }}
  className="focus-visible:outline-none"  // Remove default, use motion
/>
```

---

## RHYTHM 3: SCROLL CHOREOGRAPHY

### Scroll Reveal Strategy
```typescript
// Assign each section type a reveal style
const scrollRevealStyles = {
  hero:         { y: 0 },                    // Already visible, no reveal
  features:     { initial: { opacity: 0, y: 48 }, viewport: { margin: "-80px" } },
  testimonials: { initial: { opacity: 0, x: -32 }, viewport: { margin: "-40px" } },
  stats:        { initial: { opacity: 0, scale: 0.9 }, viewport: { margin: "-60px" } },
  cta:          { initial: { opacity: 0, y: 32 }, viewport: { margin: "-100px" } },
}

// Scroll-linked transforms for depth
function useScrollParallax(speed: number = 0.5) {
  const { scrollY } = useScroll()
  return useTransform(scrollY, [0, 1000], [0, -1000 * speed])
}
```

### Scroll-Driven Section Reveals
```typescript
// Progressive section entrance — each section announces itself
function ScrollSection({ children, delay = 0 }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ 
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.section>
  )
}
```

---

## RHYTHM 4: AMBIENT CHOREOGRAPHY

### Subtle Always-On Motion
```typescript
// Floating orbs in background (very subtle)
function FloatingOrb({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      animate={{ 
        y: [-20, 20, -20],
        scale: [1, 1.05, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{ 
        duration: 8 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
      className="absolute w-96 h-96 rounded-full bg-blue-500/10 filter blur-3xl"
    />
  )
}

// Cursor tracking glow (premium feel)
function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59,130,246,0.07), transparent 40%)`
      }}
    />
  )
}
```

---

## MOTION TOKEN SYSTEM

Define motion tokens once, use everywhere:

```typescript
// lib/motion.ts — central motion configuration
export const motion_tokens = {
  
  // Easing
  ease: {
    out:       [0.16, 1, 0.3, 1]   as const,  // Premium deceleration
    inOut:     [0.76, 0, 0.24, 1]  as const,  // Smooth transitions
    sharp:     [0.4, 0, 0.2, 1]    as const,  // Precise, Material-like
    overshoot: [0.34, 1.56, 0.64, 1] as const, // Slight overshoot (use rarely)
  },
  
  // Duration
  duration: {
    instant:   0.1,   // Barely perceptible (icon rotations)
    fast:      0.2,   // Quick micro-interactions
    normal:    0.35,  // Standard transitions
    medium:    0.5,   // Component reveals
    slow:      0.7,   // Section entrances
    dramatic:  1.0,   // Hero moments
    cinematic: 1.5,   // Full-page transitions
  },
  
  // Spring
  spring: {
    snappy:  { type: "spring", stiffness: 400, damping: 30 },
    gentle:  { type: "spring", stiffness: 200, damping: 25 },
    stiff:   { type: "spring", stiffness: 600, damping: 40 },
    lazy:    { type: "spring", stiffness: 100, damping: 20 },
  },
  
  // Stagger
  stagger: {
    fast:    0.04,   // Dense lists (50+ items)
    normal:  0.08,   // Standard lists (10-20 items)
    slow:    0.12,   // Dramatic reveals (5-8 items)
    crawl:   0.2,    // Very dramatic (3-4 items)
  }
  
} as const
```

---

## ANIMATION CONFLICT RESOLUTION

When multiple animation systems compete:

```
Priority (highest to lowest):
1. User interaction (hover/tap/drag) — always wins
2. AnimatePresence (mount/unmount) — wins over scroll
3. Scroll-linked animations — wins over ambient
4. Entry animations — fires once, then idle
5. Ambient animations — lowest priority, can be interrupted
```

### Pause Ambient During Interaction
```typescript
const [isHovered, setIsHovered] = useState(false)

// Ambient animation pauses on hover
<motion.div
  animate={isHovered ? { y: 0 } : { y: [-20, 20, -20] }}
  transition={isHovered ? { duration: 0.3 } : { duration: 6, repeat: Infinity }}
  onHoverStart={() => setIsHovered(true)}
  onHoverEnd={() => setIsHovered(false)}
/>
```

---

## MOTION HEALTH CHECKLIST

```
□ Do entry animations have clear sequence/timing? (not all simultaneous)
□ Are hover states on ALL interactive elements?
□ Do scroll reveals use margin offsets? (not triggering too early)
□ Is ambient motion subtle? (opacity < 0.5, movement < 20px)
□ Are spring configs named and consistent?
□ Does reduced-motion preference disable complex animations?
□ Are animations GPU-accelerated? (only transform + opacity)
□ Is AnimatePresence wrapping all conditional renders?
```

---

*TIER SS — Motion System coordinates all animation decisions.
Works in concert with framer-motion (SSS), gsap (SS), and lenis (SS).*
