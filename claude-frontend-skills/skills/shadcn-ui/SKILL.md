# SKILL: shadcn-ui
# TIER: S — Component Consistency & Accessibility Layer
# Authority: Base components, theming, accessibility, design token system

> shadcn/ui provides composable, accessible, unstyled base components.
> It is NOT a component library — it's a collection of component primitives
> you own and customize. Think of it as the skeleton that Aceternity/Magic UI dress up.
> Reference: https://github.com/shadcn-ui/ui | https://ui.shadcn.com

---

## PHILOSOPHY

shadcn/ui components are:
- **Owned by your project** (copied into your codebase, not imported from npm)
- **Unstyled by default** (Tailwind classes control appearance)
- **Radix UI-based** (accessible primitives underneath)
- **TypeScript-first** (full type safety)

Never use shadcn/ui components as-is for hero sections or premium moments.
They are the accessible, consistent foundation — Aceternity UI (SSS) creates the spectacle.

---

## INSTALLATION

```bash
npx shadcn@latest init
```

```typescript
// components.json — configuration
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",           // "default" or "new-york" (more polished)
  "rsc": true,                  // React Server Components support
  "tsx": true,                  // TypeScript
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",     // neutral | slate | zinc | gray | stone
    "cssVariables": true,       // Use CSS variables for theming
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## COMPONENT INSTALLATION

```bash
# Install individual components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add sheet
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add separator
npx shadcn@latest add command
npx shadcn@latest add popover
npx shadcn@latest add scroll-area
npx shadcn@latest add table
```

---

## THE PREMIUM CSS VARIABLE SYSTEM

### Dark Theme Configuration
```css
/* globals.css — premium dark theme */
@layer base {
  :root {
    --background:    0 0% 4%;          /* #0a0a0a */
    --foreground:    0 0% 98%;         /* #fafafa */
    --card:          0 0% 6%;          /* #0f0f0f */
    --card-foreground: 0 0% 98%;
    --popover:       0 0% 6%;
    --popover-foreground: 0 0% 98%;
    --primary:       217 91% 60%;      /* Brand blue */
    --primary-foreground: 0 0% 100%;
    --secondary:     0 0% 9%;
    --secondary-foreground: 0 0% 98%;
    --muted:         0 0% 9%;
    --muted-foreground: 0 0% 40%;
    --accent:        0 0% 9%;
    --accent-foreground: 0 0% 98%;
    --destructive:   0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border:        0 0% 14%;         /* rgba(255,255,255,0.08) equivalent */
    --input:         0 0% 14%;
    --ring:          217 91% 60%;
    --radius:        0.75rem;          /* 12px — modern, not sharp */
  }
}
```

### Custom Component Variants
```typescript
// Extend Button with premium variants
// components/ui/button.tsx — add to buttonVariants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.4)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium additions:
        glass: "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-[0_4px_20px_rgba(100,50,255,0.3)]",
        glow: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

---

## FORM SYSTEM

### Premium Form with react-hook-form
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export function WaitlistForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", name: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-300 text-sm">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="you@company.com" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500
                             focus:border-blue-500 focus:ring-blue-500/20"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" variant="gradient">
          Join Waitlist
        </Button>
      </form>
    </Form>
  )
}
```

---

## DIALOG / MODAL PATTERN

```typescript
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog"

// Premium modal with dark styling
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent className="bg-neutral-950 border border-white/10 text-white max-w-md">
    <DialogHeader>
      <DialogTitle className="text-white text-xl font-semibold">
        Confirm Action
      </DialogTitle>
      <DialogDescription className="text-neutral-400">
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-3 mt-6">
      <Button variant="ghost" className="text-neutral-400">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## COMMAND PALETTE (Raycast-style)

```typescript
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." 
                    className="border-0 focus:ring-0" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

---

## TOAST NOTIFICATION SYSTEM

```typescript
// Using sonner (preferred over shadcn toast)
import { Toaster, toast } from "sonner"

// In layout
<Toaster 
  position="bottom-right"
  toastOptions={{
    style: {
      background: "#1a1a1a",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "white",
    }
  }}
/>

// Trigger toasts
toast.success("Profile updated!")
toast.error("Something went wrong")
toast.loading("Saving changes...")
toast.promise(saveUser(), {
  loading: "Saving...",
  success: "Saved successfully!",
  error: "Error saving"
})
```

---

## THE cn() UTILITY (essential)

```typescript
// lib/utils.ts — always have this
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage — merges conditional classes without conflicts
<div className={cn(
  "base-class other-class",
  isActive && "active-class",
  variant === "large" && "large-class",
  className  // Allow external className prop to override
)} />
```

---

*TIER S — shadcn/ui provides the accessible, consistent component foundation.
It is the skeleton; SSS and SS skills provide the spectacle.*
