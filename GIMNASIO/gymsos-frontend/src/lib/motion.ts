import { type Variants, type Transition } from "framer-motion"

// ─── Easing Library ─────────────────────────────────────────────────────────
// Precision over decoration. Each easing has a purpose.
export const easings = {
  heroOut:    [0.16, 1, 0.3, 1]    as [number, number, number, number], // Apple-style reveal
  sharp:      [0.4, 0, 0.2, 1]     as [number, number, number, number], // Material precision
  cinematic:  [0.76, 0, 0.24, 1]   as [number, number, number, number], // Modal/page transitions
  settle:     [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
} as const

// ─── Spring Catalog ──────────────────────────────────────────────────────────
// Springs over duration — physical, not mechanical.
export const springs = {
  snappy:  { type: "spring", stiffness: 420, damping: 32, mass: 1 } as const,
  gentle:  { type: "spring", stiffness: 200, damping: 26, mass: 1 } as const,
  stiff:   { type: "spring", stiffness: 600, damping: 42, mass: 1 } as const,
  heavy:   { type: "spring", stiffness: 110, damping: 22, mass: 1.4 } as const,
  magnetic:{ type: "spring", stiffness: 350, damping: 28, mass: 0.8 } as const,
} as const

// ─── Duration Tokens ─────────────────────────────────────────────────────────
export const durations = {
  micro:    0.12, // icon swap, color change
  fast:     0.2,  // dropdown, tooltip
  default:  0.32, // component reveal
  slow:     0.5,  // section entrance
  cinematic:0.72, // page-level
} as const

// ─── Animation Variants ──────────────────────────────────────────────────────

// Primary reveal — fast acceleration, long deceleration
// Use for: cards, content blocks, stat items
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easings.heroOut },
  },
}

// Compact reveal — tighter movement, faster
// Use for: table rows, list items, sidebar items
export const fadeIn: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.default, ease: easings.heroOut },
  },
}

// Scale reveal — for modals, popovers, dialogs
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durations.default, ease: easings.cinematic },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: durations.fast, ease: easings.sharp },
  },
}

// Slide from left — sidebar, drawer
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.default, ease: easings.heroOut },
  },
}

// Slide from right — notification panel, detail drawer
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.default, ease: easings.heroOut },
  },
}

// Container for staggered children — standard
// Stagger 60ms: good for 4-8 items under 0.9s budget
export const staggerContainer: Variants = {
  hidden:  { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren:   0.05,
    },
  },
}

// Tighter stagger — for dense lists, table rows
export const staggerFast: Variants = {
  hidden:  { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren:   0.02,
    },
  },
}

// Page-level entrance (entire page wrapper)
export const pageEnter: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.default, ease: easings.sharp },
  },
}

// ─── Micro-interaction transitions ───────────────────────────────────────────

// For buttons, toggles, interactive elements
export const tapTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
}

// For the active nav indicator sliding between items
export const navIndicator: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 36,
}

// For chart bars animating in
export const chartBar: Transition = {
  duration: 0.7,
  ease: easings.heroOut,
}
