# SKILL: animation-designer
# TIER: SS — Animation Craft & Personality Layer
# Authority: Easing design, timing craft, animation personality, choreography artistry

> This skill focuses on the CRAFT of animation — not just making things move,
> but making them move with intention, personality, and emotional impact.
> The difference between amateur and professional animation is entirely in the details here.

---

## THE PHYSICS OF FEELING

### Why Easing Defines Quality
```
Linear timing:     Robotic, artificial, cheap
Ease-out (too fast): Abrupt, harsh
Ease-out (too slow): Dragging, sluggish
Spring (overdamped): Lifeless, dull
Spring (underdamped): Jittery, toyish
Spring (tuned):    Natural, physical, premium
```

The goal is **physical plausibility** — animations that feel like they obey physics.

---

## EASING CURVE LIBRARY

### Premium Easing Values
```typescript
export const easings = {
  
  // THE HERO EASE — most versatile, most premium
  // Fast acceleration, long graceful deceleration
  // Used by: Apple, Linear, Vercel, Stripe
  heroOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  
  // SHARP PRECISION — quick and confident
  // Used for: navigation, indicators, menus
  sharp: [0.4, 0, 0.2, 1] as [number, number, number, number],
  
  // CINEMATIC IN-OUT — full acceleration and deceleration
  // Used for: modal transitions, page changes
  cinematic: [0.76, 0, 0.24, 1] as [number, number, number, number],
  
  // GENTLE SETTLE — slow in, very slow out
  // Used for: large elements settling into place
  settle: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  
  // ELASTIC ENTRANCE — tiny overshoot, premium playful
  // Used for: badges, tags, notification dots
  elastic: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  
  // BOUNCE SETTLE — subtle, for floating elements
  // Use VERY rarely — for specific playful moments only
  bounceSettle: [0.64, 0.57, 0.67, 1.53] as [number, number, number, number],
}
```

### When to Use Which Easing
```
heroOut:       Default for reveals, entrances, exits — 80% of animations
sharp:         UI controls, tabs, navigation — precise, confident
cinematic:     Page transitions, modal open/close
settle:        Large images loading, maps appearing, heavy elements
elastic:       Badge count updates, notification appearance, success states
bounceSettle:  Playful micro-interactions (emoji reactions, like button)
```

---

## SPRING PHYSICS DESIGN

### Spring Anatomy
```
stiffness:  How hard the spring pulls back toward rest position
damping:    How quickly energy is absorbed (low = bouncy, high = snappy)
mass:       Weight of the object (higher = slower, more inertia)

Rules:
- Higher stiffness + higher damping = snappy (UI controls)
- Lower stiffness + lower damping = springy (playful elements)  
- Lower stiffness + higher damping = slow, gentle (large panels)
```

### Spring Reference Catalog
```typescript
export const springs = {
  
  // SNAPPY — UI controls, buttons, precise
  // Feels: confident, immediate, responsive
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 1 },
  
  // GENTLE — cards, panels, soft reveals
  // Feels: comfortable, considered, calm
  gentle: { type: "spring", stiffness: 200, damping: 25, mass: 1 },
  
  // STIFF — navigation, indicators, precise tracking
  // Feels: tight, accurate, mechanical
  stiff: { type: "spring", stiffness: 600, damping: 40, mass: 1 },
  
  // HEAVY — large hero elements, page sections
  // Feels: weighty, deliberate, substantial  
  heavy: { type: "spring", stiffness: 100, damping: 20, mass: 1.5 },
  
  // PLAYFUL — reactions, notifications, delight moments
  // Feels: alive, energetic, fun (use sparingly)
  playful: { type: "spring", stiffness: 300, damping: 12, mass: 1 },
  
  // MAGNETIC — cursor-following elements
  // Feels: connected, responsive, organic
  magnetic: { type: "spring", stiffness: 350, damping: 25, mass: 0.8 },
}
```

---

## DURATION DESIGN

### Duration Hierarchy
```
< 100ms:   Instantaneous (no animation needed, just state change)
100-200ms: Micro-interaction (icon swap, color change, checkmark)
200-400ms: Standard UI response (dropdown, tooltip, badge)
400-600ms: Component reveal (card entrance, section headline)
600-800ms: Major reveal (hero entrance, full section)
800-1200ms: Cinematic moment (page transition, dramatic reveal)
> 1200ms:  Very deliberate (loading state, progress, cinematic storytelling)
```

### Stagger Duration Influence
```typescript
// For 5 items with 0.08s stagger:
// Last item starts at 5 * 0.08 = 0.4s
// Total animation time = 0.4 + 0.5 (item duration) = 0.9s
// This is the "animation budget" — don't exceed 1.5s total for any sequence

function calculateStagger(itemCount: number, budget: number = 1.0): number {
  const itemDuration = 0.5
  return Math.min((budget - itemDuration) / itemCount, 0.15)
}
```

---

## MICRO-INTERACTION PATTERNS

### Toggle Animation
```typescript
// Smooth toggle between two states
function Toggle({ isOn, onToggle }: ToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6 rounded-full",
        isOn ? "bg-blue-500" : "bg-neutral-700"
      )}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ x: isOn ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    </motion.button>
  )
}
```

### Like / React Button
```typescript
function LikeButton() {
  const [liked, setLiked] = useState(false)
  
  return (
    <motion.button
      onClick={() => setLiked(!liked)}
      whileTap={{ scale: 0.85 }}
      className="relative"
    >
      <motion.div
        animate={liked ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.5, 0.7, 1] }}
      >
        <Heart 
          className={cn("w-5 h-5 transition-colors", 
            liked ? "fill-red-500 text-red-500" : "text-neutral-400"
          )} 
        />
      </motion.div>
      
      {/* Burst particles on like */}
      <AnimatePresence>
        {liked && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-red-400"
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(i * 60 * Math.PI / 180) * 20,
              y: Math.sin(i * 60 * Math.PI / 180) * 20,
            }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  )
}
```

### Checkbox Animation
```typescript
function AnimatedCheckbox({ checked, onChange }: CheckboxProps) {
  return (
    <motion.button
      onClick={onChange}
      className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center",
        checked ? "border-blue-500 bg-blue-500" : "border-neutral-600 bg-transparent"
      )}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            viewBox="0 0 12 10"
            className="w-3 h-2.5"
          >
            <motion.path
              d="M1 5L4.5 8.5L11 1"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

---

## LOADING STATE ANIMATIONS

### Skeleton Shimmer
```typescript
// Animated skeleton loading state
function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("rounded-md bg-neutral-800/60 overflow-hidden", className)}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  )
}
```

### Button Loading State
```typescript
function LoadingButton({ loading, children }: LoadingButtonProps) {
  return (
    <motion.button
      disabled={loading}
      className="relative px-6 py-2.5 rounded-xl bg-white text-black font-medium overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
            />
            Loading
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

---

## ANIMATION PERSONALITY PROFILES

Different products have different motion personalities. Choose and commit:

```
PRECISE (Linear, Raycast):
  Easing: sharp, snappy
  Duration: fast-normal
  Style: confident, immediate, no overshoot
  Keywords: efficient, technical, focused

ELEGANT (Apple, Stripe):
  Easing: heroOut, settle
  Duration: normal-slow
  Style: graceful, smooth, deliberate
  Keywords: refined, premium, controlled

PLAYFUL (Notion early, Loom):
  Easing: elastic, bounceSettle occasionally
  Duration: normal
  Style: alive, bouncy, expressive
  Keywords: friendly, energetic, human

CINEMATIC (Vercel, Framer):
  Easing: cinematic, heroOut
  Duration: slow-dramatic
  Style: high-impact, theatrical, deliberate
  Keywords: impressive, memorable, bold
```

---

*TIER SS — Animation Designer defines the motion personality and micro-interaction quality.
Works under framer-motion (SSS) direction, coordinates with gsap (SS) for complex timelines.*
