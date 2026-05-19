import { type Variants } from "framer-motion"

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
}

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
      when: "beforeChildren",
    },
  },
}

export const springs = {
  snappy: { type: "spring", stiffness: 400, damping: 30 } as const,
  gentle: { type: "spring", stiffness: 200, damping: 25 } as const,
  bouncy: { type: "spring", stiffness: 300, damping: 12 } as const,
  stiff:  { type: "spring", stiffness: 600, damping: 40 } as const,
  slow:   { type: "spring", stiffness: 100, damping: 20 } as const,
}
