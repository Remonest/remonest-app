# Remonest App - Project Documentation

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2.2 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 (CSS-first config) |
| **UI Library** | shadcn/ui (radix-nova style) |
| **Icons** | lucide-react |
| **Font** | Inter (body/headings), Geist Mono (code) |
| **Backend** | Supabase (SSR-ready) |
| **PDF** | @react-pdf/renderer |
| **Package Manager** | pnpm |

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (Inter font, metadata)
│   ├── globals.css                    # Theme vars, dark mode, Tailwind
│   ├── page.tsx                       # Re-exports (main)/page
│   │
│   ├── (auth)/                        # Route group: /login, /register
│   │   ├── layout.tsx                 # Centered auth layout
│   │   ├── login/page.tsx             # Email/password + Google OAuth
│   │   └── register/page.tsx          # Registration with validation
│   │
│   ├── (main)/                        # Route group: app pages
│   │   ├── layout.tsx                 # Header + Footer wrapper
│   │   ├── page.tsx                   # Landing page (marketing)
│   │   │
│   │   ├── learning/
│   │   │   ├── page.tsx               # Module grid + category filters
│   │   │   └── [slug]/page.tsx        # Article content (MDX-ready)
│   │   │
│   │   ├── jobs/
│   │   │   ├── page.tsx               # Job list + search/filters
│   │   │   └── [id]/page.tsx          # Job detail + apply CTA
│   │   │
│   │   ├── cv-builder/
│   │   │   └── page.tsx               # Split-view form + preview
│   │   │
│   │   ├── portfolio/
│   │   │   ├── page.tsx               # Portfolio editor
│   │   │   └── [username]/page.tsx    # Public portfolio (SSG)
│   │   │
│   │   └── dashboard/
│   │       ├── page.tsx               # Stats + quick actions
│   │       ├── settings/page.tsx      # Profile, notifications, security
│   │       └── applications/page.tsx  # Job application history
│   │
│   └── api/                           # API Routes
│       ├── ai/review/route.ts         # POST: CV text → AI feedback
│       ├── jobs/sync/route.ts         # GET: Cron job to fetch jobs
│       ├── upload/route.ts            # POST: File upload to Supabase
│       └── webhooks/stripe/route.ts   # POST: Payment events
│
├── components/
│   ├── ui/
│   │   └── button.tsx                 # shadcn Button (CVA variants)
│   │
│   └── landing/
│       ├── index.ts                   # Barrel exports
│       ├── header.tsx                 # Responsive header + mobile menu
│       ├── hero-section.tsx           # Hero + CSS carousel
│       ├── features-section.tsx       # 3-col feature cards
│       ├── steps-section.tsx          # How it works steps
│       ├── testimonials-section.tsx   # Testimonial cards
│       ├── cta-section.tsx            # Call-to-action banner
│       ├── footer.tsx                 # Footer with links
│       └── theme-toggle.tsx           # Dark/light mode toggle
│
└── lib/
    └── utils.ts                       # cn() utility (clsx + twMerge)
```

---

## Theme System

### Color Palette (oklch)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `oklch(1 0 0)` (white) | `oklch(0.145 0 0)` (near-black) |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` (white) |
| `--primary` | `oklch(0.546 0.245 262.881)` (blue #2563eb) | Same blue |
| `--primary-foreground` | `oklch(1 0 0)` (white) | Same |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--accent` | `oklch(0.962 0.018 237.314)` | `oklch(0.278 0.137 260.031)` |

### Dark Mode
- Class-based: `document.documentElement.classList.add("dark")`
- Persists via `localStorage.setItem("remonest-theme", "dark")`
- Uses `.dark` CSS selector in globals.css

### Font
- **Inter** for all body text and headings (screen-optimized readability)
- **Geist Mono** for code/monospace contexts
- Configured via `next/font/google` with CSS variables

---

## Landing Page Components

### Hero Section
- Two-column layout (content left, carousel right) on desktop
- Stacked on mobile
- CSS-only carousel: `translateX` + `transition-transform duration-500`
- Auto-advances every 3.5s via `setInterval`
- Dot indicators + prev/next buttons
- Stats chips: 500+ roles, 30+ modules, ATS-ready

### Features Section
- 3-column grid on desktop, single column on mobile
- Cards with icon, title, description, preview image
- `bg-muted` background with border

### Steps Section
- Bordered shell container
- 3-column grid (number, copy, visual) on desktop
- Stacked cards on mobile with inline number+title

### Testimonials Section
- Asymmetric 2-column grid (1.2fr / 0.8fr) on desktop
- Single column on mobile
- Large quote card + 2 smaller cards

### CTA Section
- Inverted colors (`bg-foreground text-background`)
- Full-width button on mobile, auto-width on desktop

### Footer
- 4-column grid on desktop, 2-column on mobile
- Brand spans full width on mobile
- Social icons: X, LinkedIn, Instagram

---

## Carousel Implementation

**Pure React + CSS** (no external library):

```tsx
// State
const [current, setCurrent] = useState(0);

// Auto-play
useEffect(() => {
  const timer = setInterval(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, 3500);
  return () => clearInterval(timer);
}, []);

// Navigation
const goTo = (index: number) => {
  const next = (index + slides.length) % slides.length;
  setCurrent(next);
  // reset timer here
};

// Render
<div className="overflow-hidden">
  <div
    className="flex transition-transform duration-500 ease-out"
    style={{ transform: `translateX(-${current * 100}%)` }}
  >
    {slides.map((slide, i) => (
      <div key={i} className="w-full flex-shrink-0">
        {/* slide content */}
      </div>
    ))}
  </div>
</div>
```

**Why not Embla/shadcn carousel?**
- `setApi` callback didn't fire reliably in dev (React strict mode)
- Plugin attachment race conditions
- Negative margin layout breaks easily
- Overkill for simple auto-advancing carousel

---

## Responsive Breakpoints

| Component | Mobile (<768px) | Desktop (768px+) |
|-----------|-----------------|-------------------|
| Header | Brand + hamburger | Full nav + auth buttons |
| Hero | Stacked, full-width buttons | Side-by-side grid |
| Features | 1 column | 3 columns |
| Steps | Stacked cards | 3-column grid |
| Testimonials | 1 column | 2 columns (1.2fr/0.8fr) |
| CTA | Full-width button | Auto-width |
| Footer | 2-col, brand spans full | 4-col grid |

---

## API Routes (TODO)

### `POST /api/ai/review`
- Input: `{ cvText, jobDescription? }`
- Output: `{ score, strengths[], improvements[], suggestions }`
- TODO: Connect to OpenAI/Anthropic

### `GET /api/jobs/sync`
- Cron-triggered job fetching
- TODO: Fetch from RemoteOK, WeWorkRemotely, etc.
- TODO: Save to Supabase

### `POST /api/upload`
- File upload to Supabase Storage
- Validates size (5MB max) and type (image/PDF)
- TODO: Initialize Supabase client with service role key

### `POST /api/webhooks/stripe`
- Stripe webhook handler
- TODO: Verify signature, handle events

---

## Key Conventions

1. **Imports**: Use `@/*` path alias (e.g., `@/components/ui/button`)
2. **Styling**: Tailwind utility classes only, no inline styles
3. **Components**: Server components by default, `"use client"` only when needed
4. **Icons**: Always from `lucide-react`
5. **Buttons**: Use shadcn `<Button>` with CVA variants
6. **Forms**: Native HTML inputs with Tailwind styling (no form library yet)
7. **Dark mode**: Toggle via `document.documentElement.classList`
8. **Fonts**: Inter for everything, Geist Mono for code

---

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

---

## Known Issues

- `@types/react-pdf` type definition warning (pre-existing, harmless)
- Social icons in footer use `X`, `Link`, `Camera` instead of Twitter/LinkedIn/Instagram (not in lucide-react v1.7.0)
