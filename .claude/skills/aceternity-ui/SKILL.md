# SKILL: aceternity-ui
# TIER: SSS — Premium Component & Effect System
# Authority: Visual effects, premium hero sections, cinematic UI components

> Aceternity UI provides copy-paste premium components built on Framer Motion + Tailwind.
> Use these as the starting point for ALL visually impressive sections.
> Reference: https://ui.aceternity.com | https://github.com/aceternity/ui

---

## PHILOSOPHY

Aceternity UI components are **effect-first** — each exists to create a specific
visual impression. Never use them generically. Always:
1. Choose the component based on the emotional effect you want
2. Customize colors, spacing, and content to fit the brand
3. Compose multiple effects for cinematic sections

---

## INSTALLATION

```bash
# Install shadcn/ui first (Aceternity is built on it)
npx shadcn@latest init

# Install Aceternity UI via CLI
npx aceternity-ui@latest add [component-name]

# Required dependencies
npm install framer-motion clsx tailwind-merge
```

---

## CORE COMPONENT CATALOG

### 1. Spotlight / Beam Effect (Hero Backgrounds)
```typescript
// Creates a moving spotlight that follows cursor — perfect for hero sections
import { Spotlight } from "@/components/ui/spotlight"

<div className="relative min-h-screen overflow-hidden bg-black/[0.96]">
  <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
  <div className="relative z-10 flex flex-col items-center justify-center h-screen">
    <h1 className="text-6xl font-bold text-white">Your Hero Text</h1>
  </div>
</div>
```

### 2. Background Beams (Atmospheric Dark Backgrounds)
```typescript
import { BackgroundBeams } from "@/components/ui/background-beams"

// Full-page atmospheric background with animated beam lines
<div className="relative min-h-screen bg-neutral-950">
  <BackgroundBeams />
  <div className="relative z-10">
    {/* content */}
  </div>
</div>
```

### 3. Aurora Background (Gradient Mesh Animation)
```typescript
import { AuroraBackground } from "@/components/ui/aurora-background"

// Animated gradient aurora — for light and dark themes
<AuroraBackground>
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col items-center justify-center gap-4 px-4"
  >
    <h1 className="text-3xl md:text-7xl font-bold text-white text-center">
      The road to freedom
    </h1>
    <button className="bg-black text-white px-8 py-3 rounded-full font-medium">
      Get Started
    </button>
  </motion.div>
</AuroraBackground>
```

### 4. Animated Gradient Text (Hero Typography)
```typescript
// Gradient text with shimmer animation
<span className="bg-gradient-to-r from-neutral-400 via-white to-neutral-400 
                 bg-[length:200%_100%] bg-clip-text text-transparent
                 animate-[shimmer_3s_linear_infinite]">
  Build faster interfaces
</span>

// keyframes in tailwind.config.ts:
// shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } }
```

### 5. 3D Card Effect (Premium Cards with Tilt)
```typescript
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"

<CardContainer className="inter-var">
  <CardBody className="relative group/card bg-black border border-white/20 
                        w-[350px] h-auto rounded-xl p-6">
    <CardItem
      translateZ="50"
      className="text-xl font-bold text-white"
    >
      Make things float in air
    </CardItem>
    <CardItem translateZ="60" className="text-neutral-300 text-sm mt-2">
      Hover over this card to unleash the power of CSS perspective
    </CardItem>
    <CardItem translateZ="100" className="w-full mt-4">
      <Image src="/hero.jpg" alt="thumbnail" className="rounded-xl" />
    </CardItem>
  </CardBody>
</CardContainer>
```

### 6. Hover Border Gradient (Card Borders That Animate)
```typescript
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

// Animated gradient border on hover — premium CTA buttons
<HoverBorderGradient
  containerClassName="rounded-full"
  as="button"
  className="bg-black text-white flex items-center space-x-2 px-6 py-2"
>
  <span>Get Started Free</span>
  <ArrowRight className="w-4 h-4" />
</HoverBorderGradient>
```

### 7. Bento Grid (Non-generic Feature Display)
```typescript
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

// Asymmetric grid layout for features — never use symmetric 3-col cards instead
<BentoGrid className="max-w-4xl mx-auto">
  {items.map((item, i) => (
    <BentoGridItem
      key={i}
      title={item.title}
      description={item.description}
      header={item.header}
      icon={item.icon}
      className={i === 3 || i === 6 ? "md:col-span-2" : ""}
    />
  ))}
</BentoGrid>
```

### 8. Wavy Background (Section Separator / Hero)
```typescript
import { WavyBackground } from "@/components/ui/wavy-background"

<WavyBackground className="max-w-4xl mx-auto pb-40">
  <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
    Hero waves
  </p>
  <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
    Stunning wavy background for your landing page
  </p>
</WavyBackground>
```

### 9. Sparkles (Accent Effects)
```typescript
import { SparklesCore } from "@/components/ui/sparkles"

// Particle sparkle effect — for hero text highlights
<div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
  <h1 className="md:text-7xl text-3xl font-bold text-center text-white relative z-20">
    Build great products
  </h1>
  <div className="w-[40rem] h-40 relative">
    <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px" />
    <SparklesCore
      background="transparent"
      minSize={0.4}
      maxSize={1}
      particleDensity={1200}
      className="w-full h-full"
      particleColor="#FFFFFF"
    />
  </div>
</div>
```

### 10. Animated Testimonials (Social Proof)
```typescript
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"

const testimonials = [
  {
    quote: "This has completely transformed our workflow.",
    name: "Sarah Chen",
    designation: "Product Manager at TechCorp",
    src: "https://images.unsplash.com/...",
  },
  // ...
]

<AnimatedTestimonials testimonials={testimonials} />
```

### 11. Text Generate Effect (Typewriter Premium)
```typescript
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

// Animated word-by-word text generation — for hero subtitles
<TextGenerateEffect
  words="Words are flowing one by one to create a cinematic effect"
  className="text-2xl text-neutral-300"
/>
```

### 12. Tracing Beam (Scroll Progress Indicator)
```typescript
import { TracingBeam } from "@/components/ui/tracing-beam"

// SVG beam that traces scroll position — for long-form content
<TracingBeam className="px-6">
  <div className="max-w-2xl mx-auto antialiased pt-4 relative">
    {dummyContent.map((item, index) => (
      <div key={`content-${index}`} className="mb-10">
        <h2>{item.title}</h2>
        <div>{item.description}</div>
      </div>
    ))}
  </div>
</TracingBeam>
```

### 13. Infinite Moving Cards (Marquee)
```typescript
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

// Horizontal auto-scrolling card strip — for logos, testimonials
<InfiniteMovingCards
  items={testimonials}
  direction="right"
  speed="slow"
/>
```

### 14. Flip Words (Hero Text Variety)
```typescript
import { FlipWords } from "@/components/ui/flip-words"

// Cycling words in a headline — for value proposition variety
<h2 className="text-4xl font-normal text-neutral-600 dark:text-neutral-400">
  Build{" "}
  <FlipWords words={["beautiful", "modern", "stunning", "cinematic"]} />
  <br />
  websites with Aceternity UI
</h2>
```

### 15. Glowing Stars Background
```typescript
import { StarsBackground } from "@/components/ui/stars-background"
import { ShootingStars } from "@/components/ui/shooting-stars"

// Full-screen starfield with shooting stars — for dark hero sections
<div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center relative w-full">
  <h2 className="relative z-10 text-3xl md:text-5xl font-bold text-white text-center">
    The Universe Awaits
  </h2>
  <ShootingStars />
  <StarsBackground />
</div>
```

---

## COMPOSITION STRATEGIES

### Premium Hero Section
```typescript
// Combine: AuroraBackground + Spotlight + AnimatedHeadline
export function PremiumHero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <Spotlight className="-top-40 left-40" fill="white" />
      <BackgroundBeams className="opacity-30" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm uppercase tracking-widest text-blue-400 font-medium mb-4">
            Introducing GYMsos
          </p>
          <h1 className="text-5xl md:text-8xl font-bold text-white text-center leading-none">
            The OS for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              human performance
            </span>
          </h1>
        </motion.div>
      </div>
    </div>
  )
}
```

### Premium Feature Section
```typescript
// Bento grid instead of boring feature cards
export function FeaturesSection() {
  return (
    <section className="py-20 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white">Everything you need</h2>
      </motion.div>
      <BentoGrid className="max-w-5xl mx-auto px-4">
        {features.map((feature, i) => (
          <BentoGridItem
            key={i}
            title={feature.title}
            description={feature.description}
            header={<feature.HeaderComponent />}
            className={feature.wide ? "md:col-span-2" : ""}
          />
        ))}
      </BentoGrid>
    </section>
  )
}
```

---

## CUSTOMIZATION RULES

When using Aceternity components, always customize:

1. **Colors**: Replace default colors with brand palette
2. **Typography**: Match the font system of the project
3. **Spacing**: Adjust padding/margin to fit the layout rhythm
4. **Animation speed**: Adjust to fit page's overall motion personality
5. **Content**: Never leave placeholder text — fill with real/realistic content

---

*TIER SSS — Aceternity UI defines the visual effect vocabulary.
All hero sections and visually impressive moments should use these components.*
