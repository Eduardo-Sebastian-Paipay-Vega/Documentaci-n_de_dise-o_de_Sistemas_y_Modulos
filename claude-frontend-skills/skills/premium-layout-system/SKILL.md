# SKILL: premium-layout-system
# TIER: SSS — Layout Composition Authority
# Authority: Enforces anti-generic layouts, asymmetric composition, visual storytelling

> This skill governs ALL layout decisions. When active, no symmetric, generic,
> or template-like layouts are acceptable. Every page must tell a visual story.
> Think: Linear, Vercel, Stripe, Raycast, Arc Browser — not a SaaS template.

---

## THE ANTI-GENERIC MANIFESTO

The single biggest failure in AI-generated UI is the **SaaS Clone Pattern**:

```
❌ BANNED SEQUENCE:
Navbar
→ Hero: centered text + subtitle + 2 buttons
→ Logos row: "trusted by..."
→ 3-column features with icons
→ Screenshot mockup section
→ Pricing: 3 cards in a row
→ FAQ accordion
→ Footer
```

This is not design. This is template filling. **Never generate this.**

---

## LAYOUT ARCHETYPES TO USE INSTEAD

### 1. Editorial Layout (Linear, Framer style)
```
Structure:
- Oversized typography dominates 70% of the hero
- Single large stat or claim with minimal surrounding space
- Feature sections alternate: text-left/visual-right, then text-right/visual-left
- Screenshots float off-screen deliberately
- Dense technical copy alternates with generous breathing space
```

### 2. Asymmetric Startup Layout (Vercel, Raycast style)
```
Structure:
- Hero splits: 55% text content / 45% visual element
- Text is NOT centered — left-aligned with strong hierarchy
- Navigation items are minimal, sparse
- Sections have no uniform padding — vary rhythmically
- Feature "cards" are actually asymmetric tiles in a broken grid
```

### 3. Immersive Product Layout (Apple style)
```
Structure:
- Full-viewport sections with single focal point
- Product renders fill the entire background
- Text floats over visual at precise positions
- Scroll drives the narrative forward
- Minimal UI chrome — the product IS the UI
```

### 4. Dashboard Preview Layout (Supabase, Notion style)
```
Structure:
- Hero shows the actual product above the fold
- Dashboard preview is slightly clipped at the bottom edge
- Technical features illustrated with real UI screenshots
- Dark theme with code/terminal aesthetic
- Monospace typography for technical credibility
```

### 5. Manifesto Layout (Notion, Loom early pages)
```
Structure:
- Single full-viewport statement, nothing else
- Word-by-word or line-by-line reveal
- Below: sparse supporting details
- Extreme whitespace discipline
- Typography IS the design
```

---

## GRID SYSTEMS

### Broken Grid (primary recommendation)
```css
/* CSS Grid that breaks expectations */
.broken-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 0;
}

/* Elements intentionally span across columns */
.hero-text {
  grid-column: 1 / 8;          /* Takes 7 of 12 columns */
  grid-row: 1 / 3;
}
.hero-visual {
  grid-column: 7 / 13;         /* Overlaps with text column */
  grid-row: 1 / 2;
}
.hero-stat {
  grid-column: 2 / 5;          /* Indented, not at edge */
  grid-row: 3 / 4;
}
```

### Tailwind Broken Grid
```typescript
// Asymmetric two-column with visual tension
<div className="grid grid-cols-12 gap-0 min-h-screen">
  <div className="col-span-7 flex flex-col justify-center px-16 py-24">
    {/* Primary content */}
  </div>
  <div className="col-span-6 -ml-12 relative">
    {/* Visual bleeds left into text column */}
  </div>
</div>

// Offset card grid (not symmetric)
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2 row-span-2">{/* Large card */}</div>
  <div>{/* Small card */}</div>
  <div>{/* Small card */}</div>
  <div className="col-span-1">{/* Medium card */}</div>
  <div className="col-span-2">{/* Wide card */}</div>
</div>
```

---

## VISUAL DEPTH SYSTEM

Every page needs at minimum 3 depth layers:

```
Layer 1 (Deepest): Background atmosphere
  → Mesh gradient, noise texture, or dark solid
  → opacity: 100%, z-index: 0

Layer 2 (Mid): Structural shapes
  → Large circles, blurred orbs, geometric forms
  → opacity: 20-40%, z-index: 1, filter: blur(80px)

Layer 3 (Surface): Content plane
  → Cards, panels, readable content
  → Full opacity, z-index: 10

Layer 4 (Floating): Accent elements
  → Floating labels, badges, decorative marks
  → z-index: 20, transform: translateZ(1px)
```

```typescript
// Visual depth implementation
<section className="relative overflow-hidden bg-neutral-950">
  
  {/* Layer 1: Background */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                  from-slate-900 via-neutral-950 to-neutral-950" />
  
  {/* Layer 2: Atmospheric shapes */}
  <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full 
                  filter blur-[120px] pointer-events-none" />
  <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-600/15 rounded-full 
                  filter blur-[100px] pointer-events-none" />
  
  {/* Layer 3: Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
    {/* actual content */}
  </div>
  
  {/* Layer 4: Floating accents */}
  <div className="absolute top-8 right-8 z-20">
    <span className="text-xs text-neutral-500 font-mono">v2.4.1</span>
  </div>
  
</section>
```

---

## HERO SECTION PATTERNS

### Pattern A: The Editorial Statement
```typescript
// Big number + description, left-aligned, asymmetric
<section className="relative min-h-screen flex items-center">
  <div className="max-w-7xl mx-auto px-8 grid grid-cols-12 gap-4 items-center">
    
    {/* Left: Big statement */}
    <div className="col-span-7">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">
        Introducing · GYMsos
      </p>
      <h1 className="text-[clamp(3rem,8vw,8rem)] font-black leading-[0.9] tracking-tight text-white">
        Fitness OS
        <br />
        <span className="text-neutral-600">for the world</span>
      </h1>
      <p className="mt-8 text-lg text-neutral-400 max-w-md leading-relaxed">
        The intelligent platform that learns from every rep, every session,
        every decision. Built for 2026.
      </p>
    </div>
    
    {/* Right: Floating stats */}
    <div className="col-span-5 relative">
      <div className="absolute -top-8 -right-4 bg-white/5 border border-white/10 
                      rounded-2xl p-6 backdrop-blur-sm">
        <span className="text-5xl font-bold text-white tabular-nums">2.5M</span>
        <p className="text-sm text-neutral-500 mt-1">members connected</p>
      </div>
      {/* More floating stats */}
    </div>
    
  </div>
</section>
```

### Pattern B: The Product Preview
```typescript
// Text top + product dashboard visible below fold
<section className="relative min-h-screen">
  <div className="pt-32 pb-0 px-8 max-w-5xl mx-auto text-center">
    <h1 className="text-6xl font-bold text-white leading-tight">
      Your gym.<br />Automated.
    </h1>
    <p className="mt-4 text-xl text-neutral-400">
      The platform that runs itself so you can focus on what matters.
    </p>
    <div className="mt-10 flex items-center justify-center gap-4">
      <button className="bg-white text-black px-8 py-3 rounded-full font-semibold">
        Start Free
      </button>
    </div>
  </div>
  
  {/* Dashboard preview — clipped, beckons scroll */}
  <div className="mt-16 mx-auto max-w-6xl px-4">
    <div className="relative rounded-t-2xl border border-white/10 overflow-hidden
                    shadow-[0_0_80px_rgba(0,0,0,0.8)]">
      <div className="h-6 bg-neutral-900 border-b border-white/5 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
      </div>
      <Image src="/dashboard.png" alt="Dashboard" className="w-full" />
      {/* Gradient fade at bottom to invite scroll */}
      <div className="absolute bottom-0 inset-x-0 h-32 
                      bg-gradient-to-t from-neutral-950 to-transparent" />
    </div>
  </div>
</section>
```

---

## SECTION PACING RULES

### The Density Rhythm
```
Section 1 (Hero):       Dense — maximum impact, lots happening
Section 2 (Features):   Sparse — breathing room, single focus per item
Section 3 (Social):     Dense — many logos/testimonials, energy
Section 4 (Deep-dive):  Sparse — one feature in depth, editorial
Section 5 (CTA):        Dense — urgency, concentration of intent
```

### Section Transitions (never abrupt cuts)
```typescript
// Sections bleed into each other
<section className="relative bg-neutral-950 pt-32 pb-0">
  {/* content */}
  
  {/* Visual transition to next section */}
  <div className="absolute bottom-0 inset-x-0 h-32 
                  bg-gradient-to-b from-transparent to-black" />
</section>

<section className="relative bg-black pt-0 pb-32">
  {/* content continues */}
</section>

// Or: overlapping elements
<div className="relative z-10 -mb-24">
  {/* element from section A floats over section B */}
</div>
```

---

## SPACING PHILOSOPHY

### Variable Padding (not uniform)
```
Hero sections:        pt-32 pb-0 (or pt-40 if full-viewport)
Feature sections:     py-24 (standard)
Proof sections:       py-16 (tighter — higher density)
Editorial sections:   py-32 md:py-48 (generous — single focus)
Footer:               pt-24 pb-16
```

### Intentional Whitespace
```
✅ Large whitespace = importance, luxury, confidence
✅ Empty space next to a key element draws focus to it
✅ Generous line-height on body text (1.6-1.7) aids reading comfort
✅ Consistent spacing unit: use Tailwind's 4px base scale
❌ Random extra padding "just to fill space"
❌ Uniform padding on every section
```

---

## TYPOGRAPHY LAYOUT RULES

### Scale Contrast (required)
```
✅ Mix text sizes dramatically within a section:
   - 96px headline + 16px body creates tension and hierarchy
   - Small caps label (12px) + giant number (80px) = premium stat design
   - Never have two text elements at similar sizes competing for attention
```

### Text Alignment Discipline
```
Hero:           left-aligned (not centered — feels more confident)
Feature cards:  left-aligned
CTA section:    center-aligned (exception — signals conclusion)
Stats:          left or center depending on composition
Mobile:         always center (reading convenience on narrow)
```

---

## RESPONSIVE LAYOUT RULES

```typescript
// Every asymmetric layout must collapse gracefully
<div className="
  grid 
  grid-cols-1       // Mobile: single column
  md:grid-cols-2    // Tablet: two columns
  lg:grid-cols-12   // Desktop: full broken grid
  gap-8
">
  <div className="
    lg:col-span-7   // Desktop: 7 columns
    lg:col-start-1  // Desktop: starts at column 1
  ">
    {/* primary content */}
  </div>
  <div className="
    lg:col-span-6   // Desktop: 6 columns (overlaps)
    lg:col-start-7  // Desktop: starts at column 7
  ">
    {/* visual element */}
  </div>
</div>
```

---

## QUALITY CHECKLIST

Before finalizing any layout, verify:

```
□ Is the hero memorable and non-generic?
□ Are sections varying in density (not all the same padding)?
□ Does the layout have visual depth (multiple layers)?
□ Is text left-aligned in hero? (not centered unless intentional)
□ Are there any boring 3-equal-column grids? (remove them)
□ Do sections flow into each other (transitions, not hard cuts)?
□ Is there a clear visual hierarchy on every screen?
□ Does it look like a $2M-funded startup built this?
```

If ANY answer is no → redesign that section before delivering.

---

*TIER SSS — This skill overrides all layout decisions.
No generic, symmetric, or template-like layout is acceptable under any circumstance.*
