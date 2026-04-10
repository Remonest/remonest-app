# Remonest App - Documentation

Comprehensive documentation for the Remonest platform — a remote work hub for Indonesian professionals with learning modules, job board, CV/portfolio builder, and admin management.

## 📚 Documentation Index

### Core Documentation

- **[Project Overview](./PROJECT.md)** — Tech stack, directory structure, conventions, known issues
- **[Implementation Guide](./IMPLEMENTATION.md)** — Exhaustive feature implementation details (1755 lines)
- **[Role System](./ROLE_SYSTEM.md)** — RBAC system: admin/user/client roles, colors, guards, usage examples

### Feature Documentation

- **[Client Role Implementation](./CLIENT_ROLE_IMPLEMENTATION.md)** — Client role (employer/job poster) system
- **[Job Board Implementation](./JOB_BOARD_IMPLEMENTATION.md)** — Job board v1.0.0: schema, actions, UI, posting workflow
- **[Job Posting Workflow](./JOB_POSTING_WORKFLOW.md)** — v0.3.2: Role-based posting with admin approval queue
- **[Auto Verified Job Posting](./AUTO_VERIFIED_JOB_POSTING.md)** — v0.3.1 (reverted): Documents short-lived auto-verify approach
- **[Language Switcher](./LANGUAGE_SWITCHER.md)** — EN/ID language system: TranslationProvider, useTranslations hook

### Admin Documentation

- **[Admin Access](./ADMIN_ACCESS.md)** — Detailed guide for accessing admin panel
- **[Quick Admin Access](./QUICK_ADMIN_ACCESS.md)** — Step-by-step admin access instructions
- **[Job Detail Modal](./JOB_DETAIL_MODAL.md)** — Dialog component for viewing/managing job drafts (v1.1.0 with auto-refresh)

---

## 🏗️ Architecture Overview

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2.2 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 (CSS-first config) |
| **UI Library** | shadcn/ui (radix-nova style) |
| **Icons** | lucide-react |
| **Fonts** | Inter (body/headings), Geist Mono (code) |
| **Backend** | Supabase (SSR-ready) |
| **Tables** | TanStack Table (admin data tables) |
| **Toasts** | Sonner |
| **Package Manager** | pnpm |

### Directory Structure

```
remonest-app/
├── docs/                           # Project documentation
├── public/                         # Static assets
├── src/
│   ├── middleware.ts               # Supabase session management + route protection
│   │
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (fonts, metadata, analytics, toaster)
│   │   ├── page.tsx                # Re-exports (main)/page
│   │   ├── globals.css             # Tailwind, oklch tokens, dark mode
│   │   ├── sitemap.ts              # Static XML sitemap
│   │   │
│   │   ├── (auth)/                 # Route group: centered auth layout
│   │   │   ├── layout.tsx          # Centered layout with language switcher
│   │   │   ├── login/page.tsx      # Email/password + Google OAuth
│   │   │   ├── register/page.tsx   # Registration with password strength meter
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (main)/                 # Route group: app pages with Header + Footer
│   │   │   ├── layout.tsx          # Auth-aware layout
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── dashboard/          # Protected dashboard
│   │   │   ├── jobs/               # Public job board
│   │   │   ├── learning/           # Learning modules
│   │   │   ├── cv-builder/         # CV editor (placeholder)
│   │   │   ├── portfolio/          # Portfolio builder
│   │   │   └── profile/            # User profile
│   │   │
│   │   ├── admin/                  # Admin-only routes
│   │   │   ├── layout.tsx          # Admin sidebar + requireAdmin()
│   │   │   ├── jobs/               # Job management
│   │   │   └── learning/           # Learning module creation
│   │   │
│   │   ├── auth/callback/route.ts  # Supabase OAuth code exchange
│   │   └── api/                    # API routes (placeholders)
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (15 components)
│   │   ├── admin/                  # Admin-specific components
│   │   ├── jobs/                   # Job-related components
│   │   ├── landing/                # Landing page sections
│   │   ├── layout/                 # Shared layout components
│   │   ├── mobile-menu.tsx         # Mobile hamburger menu
│   │   └── role-badge.tsx          # Reusable role badge
│   │
│   └── lib/
│       ├── utils.ts                # cn() utility
│       ├── roles.ts                # Role labels and helpers
│       ├── translations.tsx        # EN/ID translation context
│       ├── auth/                   # Auth server actions
│       ├── admin/                  # Admin guards
│       ├── dashboard/              # Dashboard server actions
│       ├── jobs/                   # Job server actions + utils
│       ├── learning/               # Learning server actions
│       └── supabase/               # Supabase clients
│
├── supabase/                       # Supabase migrations and config
├── components.json                 # shadcn/ui configuration
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

### Organization Pattern

**Hybrid approach:**
- **Route-based** at the `app/` level (Next.js conventions)
- **Domain/feature-based** at `lib/` and `components/` level
- **Type-based** for UI primitives (`components/ui/`)

**Key patterns:**
1. Server Components fetch data from `lib/*/actions.ts`
2. Interactive pages split Server (data) + Client (UI state)
3. Mutations use `useActionState` with server actions
4. Role-based rendering: Server fetches role → passes to Client as prop
5. Barrel exports in `components/landing/index.ts` and `components/jobs/index.ts`

---

## 🚀 Quick Start

### Development

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # Run ESLint
```

### Adding a New Feature

1. **Plan the feature**
   - Define routes, components, and server actions
   - Identify all user-facing text for translations
   - Plan Server vs Client component split

2. **Create server actions** (if needed)
   ```typescript
   // src/lib/your-feature/actions.ts
   export async function getData(): Promise<Data[]> {
     const { data } = await supabase.from('your-table').select('*')
     return data || []
   }
   ```

3. **Create components** (feature-based folder)
   ```tsx
   // src/components/your-feature/your-component.tsx
   "use client"
   import { useTranslations } from "@/lib/translations"
   
   export function YourComponent() {
     const { t } = useTranslations()
     return <div>{t.yourFeature.title}</div>
   }
   ```

4. **Create route** (App Router convention)
   ```tsx
   // src/app/(main)/your-feature/page.tsx
   import { getData } from "@/lib/your-feature/actions"
   import { YourFeatureClient } from "./your-feature-client"
   
   export default async function YourFeaturePage() {
     const data = await getData()
     return <YourFeatureClient data={data} />
   }
   ```

5. **Add translations**
   ```typescript
   // src/lib/translations.tsx — add to both en and id objects
   yourFeature: {
     title: "Your Feature / Fitur Anda",
     description: "Description / Deskripsi",
   }
   ```

6. **Update documentation**
   - Create feature documentation in `docs/`
   - Update this README with new doc links

---

## 📋 Documentation Guidelines

### Structure
- Use clear, descriptive titles
- Include code examples for all major concepts
- Provide both desktop and mobile considerations
- Add troubleshooting sections

### Code Examples
- Show import statements
- Include type definitions
- Provide both simple and advanced usage
- Use TypeScript examples

### Feature Documentation Template
```markdown
# Feature Name

## Overview
Brief description of what this feature does.

## Architecture
- Server actions: `src/lib/feature/actions.ts`
- Components: `src/components/feature/`
- Routes: `src/app/(main)/feature/`

## Implementation Details
Code examples, API contracts, database schema.

## Testing
How to test the feature manually and expected behavior.

## Known Issues
Current limitations or bugs.
```

---

## 🔑 Key Conventions

1. **Imports**: Use `@/*` path alias (e.g., `@/components/ui/button`)
2. **Styling**: Tailwind utility classes only, no inline styles
3. **Components**: Server components by default, `"use client"` only when needed
4. **Icons**: Always from `lucide-react`
5. **Buttons**: Use shadcn `<Button>` with CVA variants
6. **Forms**: Native HTML inputs with Tailwind styling
7. **Dark mode**: Toggle via `document.documentElement.classList`
8. **Redirects**: Use `useEffect` + `router.push()` in client components (not `redirect()` in server actions inside `useActionState`)
9. **Admin routes**: Protected at layout level via `requireAdmin()`, not in middleware
10. **Role-based UI**: Server fetches role → passes to Client as prop (never call `getUserRole()` in client components)
11. **Dashboard**: Async Server Components for read-only pages; Server + Client split for interactive forms
12. **Database migrations**: Sequential numbered files (`001_`, `002_`) with rollback comments

---

## 📊 Implementation Status

### ✅ Complete (Connected to Supabase)
- **Authentication System** (login, register, OAuth, email confirmation, password reset)
- **Dashboard** (stats, activity, settings, applications)
- **Dashboard Language Switcher** (EN/ID support for all dashboard pages)
- **Job Board** (public listing, job posting, admin approval, client job management)
- **Admin Panel** (job management with tabs, approval workflow, draft management)
- **Job Detail Modal** (v1.1.0 - view/publish/delete draft jobs with auto-refresh)
- **Profile Page** (role-aware UI for user, client, admin)
- **Client Role System** (employer job posting, management dashboard)
- **Database Architecture** (7 tables with RLS, enums, triggers, indexes)

### ⚠️ In Progress (Hardcoded/Mock Data)
- Public job detail page `/jobs/[id]` (1 hardcoded job)
- Learning modules (6 hardcoded modules, DB tables exist)
- Public portfolio (1 hardcoded portfolio)
- CV builder (static UI, no persistence)
- Portfolio builder (static UI, no persistence)
- Feature pages language switcher (only dashboard pages translated)

### 🔧 API Route Placeholders (Not Connected)
- AI review (`/api/ai/review`) — returns mock data
- Job sync (`/api/jobs/sync`) — returns hardcoded 1 job
- File upload (`/api/upload`) — validates but doesn't store
- Stripe webhooks (`/api/webhooks/stripe`) — receives but doesn't process

---

## 📁 Documentation Files

### Core Documentation

| File | Description | Lines |
|------|-------------|-------|
| **[PROJECT.md](./PROJECT.md)** | Tech stack, directory structure, conventions, known issues | 514 |
| **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** | Exhaustive feature implementation details | 1843 |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | ✨ NEW — Complete feature status & next steps | ~450 |
| **[ROLE_SYSTEM.md](./ROLE_SYSTEM.md)** | RBAC system: admin/user/client roles, colors, guards | ~300 |
| **[DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** | Complete database schema, RLS, indexes, migrations | ~600 |

### Feature Documentation

| File | Description | Version |
|------|-------------|---------|
| **[CLIENT_ROLE_IMPLEMENTATION.md](./CLIENT_ROLE_IMPLEMENTATION.md)** | Client role (employer/job poster) system | v0.3.0 |
| **[JOB_BOARD_IMPLEMENTATION.md](./JOB_BOARD_IMPLEMENTATION.md)** | Job board v1.0.0: schema, actions, UI, posting workflow | v1.0.0 |
| **[JOB_POSTING_WORKFLOW.md](./JOB_POSTING_WORKFLOW.md)** | Role-based posting with admin approval queue | v0.3.2 |
| **[AUTO_VERIFIED_JOB_POSTING.md](./AUTO_VERIFIED_JOB_POSTING.md)** | Reverted auto-verify approach (historical) | v0.3.1 |
| **[JOB_DETAIL_MODAL.md](./JOB_DETAIL_MODAL.md)** | Dialog for viewing/managing job drafts with auto-refresh | v1.1.0 |
| **[LANGUAGE_SWITCHER.md](./LANGUAGE_SWITCHER.md)** | EN/ID language system: TranslationProvider, useTranslations | v1.0.0 |
| **[LEARNING_MODULE.md](./LEARNING_MODULE.md)** | Learning module system: admin CRUD, progress tracking | v1.0.0 |

### Admin Documentation

| File | Description | Purpose |
|------|-------------|---------|
| **[ADMIN_ACCESS.md](./ADMIN_ACCESS.md)** | Detailed guide for accessing admin panel | Setup guide |
| **[QUICK_ADMIN_ACCESS.md](./QUICK_ADMIN_ACCESS.md)** | Step-by-step admin access instructions | Quick reference |

---

## 🗂️ Complete File List

```
docs/
├── README.md                          # This file - Documentation index
├── PROJECT.md                         # Project overview & tech stack
├── IMPLEMENTATION.md                  # Comprehensive implementation guide
├── IMPLEMENTATION_SUMMARY.md          # ✨ NEW - Feature status & next steps
├── ROLE_SYSTEM.md                     # User role system (RBAC)
├── DATABASE_ARCHITECTURE.md           # Database schema & design
├── CLIENT_ROLE_IMPLEMENTATION.md      # Client role feature (v0.3.0)
├── JOB_BOARD_IMPLEMENTATION.md        # Job board feature (v1.0.0)
├── JOB_POSTING_WORKFLOW.md            # Job posting workflow (v0.3.2)
├── AUTO_VERIFIED_JOB_POSTING.md       # Reverted auto-verify (v0.3.1)
├── JOB_DETAIL_MODAL.md                # Draft job modal (v1.1.0) ✨ NEW
├── LANGUAGE_SWITCHER.md               # i18n system (EN/ID)
├── LEARNING_MODULE.md                 # Learning module system
├── ADMIN_ACCESS.md                    # Admin panel access guide
└── QUICK_ADMIN_ACCESS.md              # Quick admin reference
```

---

## 🐛 Known Issues

- `@types/react-pdf` type definition warning (pre-existing, harmless)
- `/forgot-password` route linked from login page but not implemented yet
- `/admin/learning` and `/admin/settings` sidebar links exist but pages not created
- Social icons in footer use `X`, `Link`, `Camera` instead of Twitter/LinkedIn/Instagram
- Profile views and CV downloads on dashboard are placeholder metrics
- `/learning` pages still use hardcoded data despite DB tables existing
- Client profile stats use placeholder values

---

## 📚 Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)