# SKILL: gsap
# TIER: SS — Complex Timeline Animation Engine
# Authority: Multi-step timelines, ScrollTrigger, SVG animation, performance-critical sequences

> GSAP is used for animations that Framer Motion cannot handle elegantly:
> complex multi-step sequences, SVG path animations, ScrollTrigger orchestration,
> and high-performance animations on non-React elements.
> Reference: https://github.com/greensock/GSAP | https://gsap.com/docs/

---

## WHEN TO USE GSAP vs FRAMER MOTION

```
Use Framer Motion for:      Use GSAP for:
─────────────────────────   ──────────────────────────────
React component animations  Complex multi-step timelines
Simple scroll reveals        SVG path drawing/morphing
Gesture/drag interactions    Canvas animations
Layout animations            Scroll-driven parallax (complex)
Presence animations          Text scramble effects
Spring physics               3D CSS transforms orchestration
                             Performance-critical (100+ elements)
                             Non-React DOM elements
```

---

## INSTALLATION

```bash
npm install gsap
# Club GreenSock plugins (requires license for commercial)
npm install gsap@npm:@gsap/shockingly-green  # if Club member
```

```typescript
// Basic import
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"  // Club

// Register plugins (once, in app entry or layout)
gsap.registerPlugin(ScrollTrigger, TextPlugin)
```

---

## REACT + GSAP INTEGRATION

### useGSAP Hook (official)
```bash
npm install @gsap/react
```

```typescript
import { useGSAP } from "@gsap/react"
import { useRef } from "react"

function AnimatedComponent() {
  const container = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    // All GSAP code here is automatically cleaned up on unmount
    gsap.from(".card", {
      opacity: 0,
      y: 60,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    })
  }, { scope: container })  // Scoped to container — avoids selector collisions
  
  return (
    <div ref={container}>
      <div className="card">Card 1</div>
      <div className="card">Card 2</div>
      <div className="card">Card 3</div>
    </div>
  )
}
```

---

## TIMELINE PATTERNS

### Basic Timeline
```typescript
useGSAP(() => {
  const tl = gsap.timeline()
  
  tl.from(".hero-badge", { opacity: 0, y: -20, duration: 0.4, ease: "power2.out" })
    .from(".hero-headline", { opacity: 0, y: 40, duration: 0.7, ease: "power3.out" }, "-=0.2")
    .from(".hero-subtitle", { opacity: 0, y: 24, duration: 0.5, ease: "power2.out" }, "-=0.4")
    .from(".hero-cta", { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" }, "-=0.3")
    .from(".hero-visual", { opacity: 0, scale: 0.92, duration: 0.8, ease: "power3.out" }, "-=0.6")
}, { scope: containerRef })
```

### Timeline with Labels
```typescript
const tl = gsap.timeline()

tl.addLabel("start")
  .from(".nav", { opacity: 0, y: -20 })
  .addLabel("heroStart", "+=0.1")
  .from(".headline", { opacity: 0, y: 60 }, "heroStart")
  .from(".subline", { opacity: 0, y: 40 }, "heroStart+=0.15")
  .addLabel("ctaStart", "heroStart+=0.3")
  .from(".cta-primary", { opacity: 0, x: -20 }, "ctaStart")
  .from(".cta-secondary", { opacity: 0, x: 20 }, "ctaStart")
```

### Timeline Controls
```typescript
// Pause/play timeline on visibility
const tl = useRef<gsap.core.Timeline>()

useGSAP(() => {
  tl.current = gsap.timeline({ paused: true })
  tl.current
    .from(".element", { opacity: 0, y: 30 })
    .from(".other", { opacity: 0 }, "<0.1")
})

// Trigger on user action
const handleClick = () => {
  tl.current?.play()
}
```

---

## SCROLL TRIGGER

### Basic Scroll Reveal
```typescript
useGSAP(() => {
  gsap.utils.toArray<HTMLElement>(".section").forEach((section) => {
    gsap.from(section.querySelectorAll(".reveal"), {
      opacity: 0,
      y: 48,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",         // When section top hits 80% from viewport top
        end: "bottom 20%",
        toggleActions: "play none none reverse"
        // play on enter, nothing on enter-back, nothing on leave, reverse on leave-back
      }
    })
  })
})
```

### Pinned Section (Storytelling Scroll)
```typescript
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".pin-section",
      start: "top top",
      end: "+=300%",
      pin: true,          // Pin this element while scrolling
      scrub: 1,           // Smooth scrub (1 = 1 second lag)
      anticipatePin: 1
    }
  })
  
  tl.from(".step-1", { opacity: 0, y: 40 })
    .to(".step-1", { opacity: 0, y: -40 }, "+=0.5")
    .from(".step-2", { opacity: 0, y: 40 })
    .to(".step-2", { opacity: 0, y: -40 }, "+=0.5")
    .from(".step-3", { opacity: 0, y: 40 })
})
```

### Horizontal Scroll Section
```typescript
useGSAP(() => {
  const panels = gsap.utils.toArray<HTMLElement>(".panel")
  
  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-container",
      pin: true,
      scrub: 1,
      snap: 1 / (panels.length - 1),  // Snap to each panel
      end: () => "+=" + document.querySelector(".horizontal-container")!.scrollWidth
    }
  })
})
```

### Parallax Elements
```typescript
useGSAP(() => {
  // Multiple elements at different parallax speeds
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || "0.5")
    
    gsap.to(el, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    })
  })
})
```

---

## TEXT ANIMATIONS

### Text Scramble Effect
```typescript
function TextScramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  
  useGSAP(() => {
    if (!ref.current) return
    
    const chars = "!<>-_\\/[]{}—=+*^?#________"
    let frame = 0
    let frameReq: number
    let queue: Array<{ from: string; to: string; start: number; end: number; char: string }> = []
    
    const update = () => {
      let output = ''
      let complete = 0
      queue.forEach((item, i) => {
        if (frame >= item.end) {
          complete++
          output += item.to
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = chars[Math.floor(Math.random() * chars.length)]
          }
          output += `<span style="opacity:0.4">${item.char}</span>`
        } else {
          output += item.from
        }
      })
      if (ref.current) ref.current.innerHTML = output
      if (complete !== queue.length) {
        frameReq = requestAnimationFrame(update)
        frame++
      }
    }
    
    queue = text.split('').map((to, i) => ({
      from: ' ', to,
      start: Math.floor(Math.random() * 40),
      end: Math.floor(Math.random() * 40) + 40,
      char: ''
    }))
    
    cancelAnimationFrame(frameReq)
    frameReq = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameReq)
  })
  
  return <span ref={ref}>{text}</span>
}
```

### Word-by-Word Timeline
```typescript
useGSAP(() => {
  const words = document.querySelectorAll(".animate-word")
  
  gsap.from(words, {
    opacity: 0,
    y: 20,
    rotateX: -45,
    transformOrigin: "0% 50% -50px",
    duration: 0.6,
    stagger: 0.06,
    ease: "back.out(2)"
  })
})
```

---

## GSAP EASING REFERENCE

```typescript
// Power easings (most used)
"power1.out"    // Gentle deceleration
"power2.out"    // Standard — default choice  
"power3.out"    // Strong deceleration — premium feel
"power4.out"    // Very strong — for large elements

// Back (slight overshoot)
"back.out(1.2)" // Subtle overshoot — buttons, badges
"back.out(2)"   // Larger overshoot — playful
"back.inOut"    // In and out overshoot

// Circ / Expo
"circ.out"      // Circular — smooth and round
"expo.out"      // Exponential — very fast start, smooth end

// Elastic (use rarely, only for delight)
"elastic.out(1, 0.3)"  // Large elastic
"elastic.out(1, 0.5)"  // Tighter elastic

// Custom cubic-bezier (match your design system)
gsap.parseEase("M0,0,C0.16,1,0.3,1,1,1")  // heroOut equivalent
```

---

## PERFORMANCE BEST PRACTICES

```typescript
// ✅ Force GPU acceleration
gsap.set(".element", { force3D: true, willChange: "transform" })

// ✅ Use GSAP's ticker for JS-driven animations
gsap.ticker.add((time) => {
  // Runs in sync with requestAnimationFrame
})

// ✅ Kill ScrollTrigger on component unmount (useGSAP handles this automatically)
return () => ScrollTrigger.getAll().forEach(t => t.kill())

// ✅ Batch DOM reads/writes
ScrollTrigger.batch(".card", {
  onEnter: (elements) => gsap.from(elements, { opacity: 0, y: 60, stagger: 0.08 }),
  start: "top 85%"
})

// ❌ Never animate layout properties
gsap.to(".el", { width: 100 })    // BAD — causes reflow
gsap.to(".el", { height: 100 })   // BAD
gsap.to(".el", { scaleX: 0.5 })   // GOOD — GPU only
```

---

*TIER SS — GSAP handles complex timelines and ScrollTrigger orchestration.
Complements Framer Motion (SSS) — they coexist without conflict.*
