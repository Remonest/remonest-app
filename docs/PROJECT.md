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
remonest-app/
├── docs/                           # Project documentation
│   ├── README.md                   # Documentation index and guidelines
│   ├── PROJECT.md                  # This file — project overview
│   ├── IMPLEMENTATION.md           # Exhaustive implementation guide (1755 lines)
│   ├── ROLE_SYSTEM.md              # RBAC: admin/user/client roles
│   ├── CLIENT_ROLE_IMPLEMENTATION.md   # Client role system
│   ├── JOB_BOARD_IMPLEMENTATION.md     # Job board v1.0.0
│   ├── JOB_POSTING_WORKFLOW.md         # Role-based posting workflow v0.3.2
│   ├── AUTO_VERIFIED_JOB_POSTING.md    # Reverted auto-verify approach
│   ├── ADMIN_ACCESS.md             # Admin panel access guide
│   ├── QUICK_ADMIN_ACCESS.md       # Quick admin access steps
│   ├── JOB_DETAIL_MODAL.md         # Dialog component for job drafts
│   └── LANGUAGE_SWITCHER.md        # EN/ID language system
│
├── public/                         # Static assets (images, icons, etc.)
├── supabase/                       # Supabase migrations and config
│
├── src/
│   ├── middleware.ts               # Supabase session + route protection
│   │
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout: fonts, metadata, analytics, Sonner
│   │   ├── page.tsx                # Re-exports (main)/page
│   │   ├── globals.css             # Tailwind, oklch tokens, dark mode
│   │   ├── sitemap.ts              # Static XML sitemap (6 routes)
│   │   ├── favicon.ico
│   │   │
│   │   ├── (auth)/                 # Route group: centered auth layout
│   │   │   ├── layout.tsx          # Centered layout with language switcher
│   │   │   ├── login/page.tsx      # Email/password + Google OAuth, resend
│   │   │   ├── register/page.tsx   # Registration with password strength meter
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (main)/                 # Route group: Header + Footer layout
│   │   │   ├── layout.tsx          # Auth-aware: bare for auth, full for unauth
│   │   │   ├── page.tsx            # Landing page: hero, features, steps, testimonials, CTA
│   │   │   │
│   │   │   ├── dashboard/          # Protected by middleware
│   │   │   │   ├── layout.tsx      # Dashboard shell: nav, mobile menu, TranslationProvider
│   │   │   │   ├── page.tsx        # Stats cards, activity feed, quick actions
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx          # Server: fetches profile + settings
│   │   │   │   │   └── settings-client.tsx # Client: tabs for profile, notifications, password
│   │   │   │   ├── applications/page.tsx # Job application tracker with status summary
│   │   │   │   └── jobs/           # Client job management
│   │   │   │       ├── page.tsx          # User's job postings list with stats
│   │   │   │       └── [id]/page.tsx     # Job detail with applicant stats
│   │   │   │
│   │   │   ├── jobs/               # Public job board
│   │   │   │   ├── page.tsx        # Job listing: search, type filter, JobCard grid
│   │   │   │   ├── post/page.tsx   # Job posting form (role-aware banners)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # ⚠️ HARDCODED mock data
│   │   │   │       └── edit/page.tsx     # Job editing (draft/pending only)
│   │   │   │
│   │   │   ├── learning/           # Learning modules
│   │   │   │   ├── page.tsx        # ⚠️ HARDCODED: 6 modules in array
│   │   │   │   └── [slug]/page.tsx # ⚠️ HARDCODED: 1 module in Record
│   │   │   │
│   │   │   ├── cv-builder/page.tsx # ⚠️ PLACEHOLDER: split-view, no persistence
│   │   │   ├── portfolio/
│   │   │   │   ├── page.tsx        # ⚠️ PLACEHOLDER: project list management
│   │   │   │   └── [username]/page.tsx # ⚠️ HARDCODED: SSG with generateStaticParams
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── page.tsx        # Server: fetches user data + role
│   │   │       └── profile-client.tsx # Client: role-aware profile UI
│   │   │
│   │   ├── admin/                  # Admin-only (requireAdmin() guard)
│   │   │   ├── layout.tsx          # Admin sidebar + Suspense + requireAdmin()
│   │   │   ├── logout-action.ts    # Re-exports logoutAction
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx        # Jobs management: DataTable + approval tabs
│   │   │   │   └── new/page.tsx    # Admin job creation form
│   │   │   └── learning/
│   │   │       └── new/page.tsx    # Create learning module form
│   │   │
│   │   ├── auth/callback/route.ts  # Supabase OAuth code exchange
│   │   │
│   │   └── api/                    # API routes (all placeholders)
│   │       ├── ai/review/route.ts        # POST: CV text → AI feedback (mock)
│   │       ├── jobs/sync/route.ts        # GET: Cron sync (mock)
│   │       ├── jobs/[id]/publish/route.ts # POST: Publish job endpoint
│   │       ├── upload/route.ts           # POST: File upload validation (mock)
│   │       └── webhooks/stripe/route.ts  # POST: Stripe webhook (mock)
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (15 components)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── admin/                  # Admin-specific components
│   │   │   ├── data-table.tsx      # Generic sortable table (tanstack/react-table)
│   │   │   ├── job-actions.tsx     # Approve/Reject buttons
│   │   │   ├── job-columns.tsx     # Job column definitions
│   │   │   ├── sidebar.tsx         # AdminSidebar + MobileAdminHeader
│   │   │   ├── sidebar-old.tsx     # Deprecated sidebar
│   │   │   └── sign-out-button.tsx
│   │   │
│   │   ├── jobs/                   # Job-related components
│   │   │   ├── index.ts            # Barrel exports
│   │   │   ├── JobCard.tsx         # Full job card with verification badge
│   │   │   ├── DashboardJobCard.tsx # Dashboard job card
│   │   │   ├── JobTypeBadge.tsx    # Color-coded job type badges
│   │   │   ├── VerificationBadge.tsx
│   │   │   ├── StatusBadge.tsx     # Status badges with icons
│   │   │   ├── PostJobForm.tsx     # Unified job posting form (role-aware)
│   │   │   ├── AdminApprovalTable.tsx
│   │   │   ├── edit-job-form.tsx
│   │   │   ├── rich-text-toolbar.tsx
│   │   │   ├── tag-input.tsx
│   │   │   ├── jobs-hero.tsx
│   │   │   └── jobs-empty-state.tsx
│   │   │
│   │   ├── landing/                # Landing page sections
│   │   │   ├── index.ts            # Barrel exports
│   │   │   ├── header.tsx          # Responsive header + mobile menu
│   │   │   ├── hero-section.tsx    # Hero with CSS carousel
│   │   │   ├── features-section.tsx
│   │   │   ├── steps-section.tsx
│   │   │   ├── testimonials-section.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   ├── theme-init.tsx
│   │   │   ├── language-handler.tsx
│   │   │   └── language-switcher.tsx
│   │   │
│   │   ├── layout/
│   │   │   └── dashboard-footer.tsx
│   │   │
│   │   ├── mobile-menu.tsx         # Mobile hamburger menu (role-aware)
│   │   └── role-badge.tsx          # Reusable server component for roles
│   │
│   └── lib/
│       ├── utils.ts                # cn() utility (clsx + twMerge)
│       ├── roles.ts                # Role labels, colors, getUserRoleInfo()
│       ├── translations.tsx        # EN/ID TranslationProvider, useTranslations
│       │
│       ├── auth/
│       │   ├── actions.ts          # Server actions: login, register, logout, OAuth, etc.
│       │   ├── schemas.ts          # Zod schemas: loginSchema, registerSchema
│       │   └── server.ts           # getCurrentUser(), requireAuth()
│       │
│       ├── admin/
│       │   ├── require-admin.ts    # Admin authorization guard
│       │   └── mock-data.ts        # Legacy mock job data
│       │
│       ├── dashboard/
│       │   └── actions.ts          # Dashboard stats, activity, applications, settings
│       │
│       ├── jobs/
│       │   ├── actions.ts          # Job CRUD: getJobs, submitJob, approveJob, etc.
│       │   └── utils.ts            # Types, Zod schemas, formatters, label helpers
│       │
│       ├── learning/
│       │   ├── actions.ts          # saveLearningModule, deleteLearningModule
│       │   └── schemas.ts          # Learning module Zod schemas, constants
│       │
│       └── supabase/
│           ├── client.ts           # Browser Supabase client (singleton)
│           ├── server.ts           # Server client + service role + getUserRole()
│           └── middleware.ts       # updateSession() for middleware
│
├── .gitignore
├── AGENTS.md                       # AI agent instructions
├── CLAUDE.md                       # Claude-specific instructions
├── components.json                 # shadcn/ui configuration
├── eslint.config.mjs               # ESLint v9 config
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies and scripts
├── pnpm-lock.yaml
├── postcss.config.mjs              # PostCSS with @tailwindcss/postcss
├── README.md                       # Project README
└── tsconfig.json                   # TypeScript configuration
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

## Job Board Implementation (v1.0.0)

**Date:** April 7, 2026

### Overview

Complete Job Board feature with dual posting workflow (Admin vs Client), approval queue, and all required UI components.

### Server Actions (`src/lib/jobs/actions.ts`)

| Action | Description | Returns |
|--------|-------------|---------|
| `getJobs(filters)` | Fetch published jobs with optional filters | Job[] |
| `getJobById(id)` | Get single job by ID | Job \| null |
| `getUserJobs()` | Get jobs posted by current user | Job[] |
| `getPendingJobs()` | Get pending jobs for admin approval | Job[] |
| `getAllJobs()` | Get all jobs for admin | Job[] |
| `submitJob(formData)` | Submit new job (admin=publish, user=pending) | Result |
| `saveJobDraft(formData)` | Save job as draft | Result |
| `approveJob(jobId)` | Admin approve pending job | Result |
| `rejectJob(jobId, reason)` | Admin reject with reason | Result |
| `deleteJob(jobId)` | Delete job with restrictions | Result |
| `republishJob(jobId)` | Republish expired job | Result |

### UI Components (`src/components/jobs/`)

- **JobCard.tsx** — Full job card with verification badge
- **JobTypeBadge.tsx** — Color-coded badges (Full-Time=#0891b2, Part-Time=#0d9488, Project=#f97316, Freelance=#8b5cf6)
- **VerificationBadge.tsx** — Green checkmark for admin-verified jobs
- **StatusBadge.tsx** — Status badges with icons
- **PostJobForm.tsx** — Unified form adapts to user role
- **AdminApprovalTable.tsx** — Pending jobs with approve/reject actions

### Posting Workflow

**Admin Flow:**
- Admin submits → `status='published'` immediately
- `is_verified_by_admin=true`
- `published_at` set to NOW()

**Client Flow:**
- Client submits → `status='pending'`
- `is_verified_by_admin=false`
- Admin reviews → approves or rejects

### Database Schema (Migration 003)

**Tables:**
- `jobs` table with dual posting workflow
- Enums: `job_type_enum`, `job_status_enum`, `apply_method_enum`
- 7 indexes for performance
- RLS policies for security
- 4 sample jobs included

### Status

✅ **Complete:**
- Database schema with RLS
- Server actions with Zod validation
- UI components (JobCard, badges, forms)
- Admin approval workflow
- Admin page integration

⚠️ **In Progress:**
- `/jobs` public job board page (UI exists, needs Supabase integration)
- `/jobs/[id]` single job detail page
- `/jobs/[id]/edit` job editing page

✅ **Recently Completed:**
- `/jobs/post` job posting form (client/admin) - April 8, 2026
- `/dashboard/jobs` client job management - April 8, 2026
- `/profile` dedicated profile page with role-aware UI - April 8, 2026
- Client role database migration (009) - April 8, 2026

### Documentation

Full details in `docs/JOB_BOARD_IMPLEMENTATION.md`

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
9. **Auth server actions**: Use `useActionState` + client-side `useEffect` with `router.push()` for redirects (Next.js `redirect()` doesn't work inside `useActionState`)
10. **Admin routes**: Protected at layout level via `requireAdmin()`, not in middleware
11. **Layout auth awareness**: `(main)/layout.tsx` checks auth status — bare layout for authenticated users, landing layout for unauthenticated
12. **Dashboard architecture**: Async Server Components for read-only pages (`/dashboard`, `/dashboard/applications`); Server + Client Component split for interactive forms (`/dashboard/settings`)
13. **Database migrations**: Sequential numbered files (`001_`, `002_`) with rollback comments at bottom
14. **Role-based UI**: Client components receive role as prop from server (never call `getUserRole()` in client components)
15. **Client role features**: Employers see job posting stats and actions, job seekers see application stats

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
- `/forgot-password` route linked from login page but not implemented yet
- `/admin/learning` and `/admin/settings` sidebar links exist but pages not created
- Social icons in footer use `X`, `Link`, `Camera` instead of Twitter/LinkedIn/Instagram (not in lucide-react v1.7.0)
- Profile views and CV downloads on dashboard are placeholder metrics (not yet tracked in DB)
- Client profile stats use placeholder values (not yet connected to real database queries)
- Some dashboard pages still have minor hardcoded English text (quick actions descriptions, mobile tab labels)
- Language switcher only implemented on dashboard pages, not on feature pages (/jobs, /learning, /cv-builder, /portfolio)

## Recent Updates (April 8-9, 2026)

✅ **Language Switcher Implementation (Dashboard):**
- `/dashboard` - Now fully supports EN/ID language switching
- `/dashboard/applications` - Now fully supports EN/ID language switching
- `/dashboard/settings` - Now fully supports EN/ID language switching (all 4 tabs)
- Added comprehensive translation keys for dashboard UI elements
- Split server/client components to enable translation hook usage
- Created `dashboard-client.tsx` for translated dashboard content
- Created `applications-client.tsx` for translated applications content
- All settings tabs (Profile, Notifications, Appearance, Security) fully translated

✅ **Client Role Implementation (v0.3.0):**
- Added 'client' role to database schema (migration 009)
- Created `/profile` page with role-aware UI (different stats/actions per role)
- Created `/dashboard/jobs` for client job posting management
- Created `/jobs/post` for submitting new jobs (with approval workflow)
- Updated navigation to show client-specific links (desktop + mobile)
- Full documentation: `docs/CLIENT_ROLE_IMPLEMENTATION.md`

✅ **Job Posting Workflow (v0.3.2):**
- Reverted to role-based job posting (admin auto-publish, client pending review)
- Changed `is_verified_by_admin` to nullable (null = pending, true = verified)
- Added migration 010 for schema update
- Updated job posting page with role-based banners
- Restored admin approval queue for client submissions
- Full documentation: `docs/JOB_POSTING_WORKFLOW.md`
