# Remonest App - Documentation

Comprehensive documentation for the Remonest platform — a remote work hub for Indonesian professionals with learning modules, job board, CV/portfolio builder, and admin management.

## 📚 Documentation Index

### Core Documentation

- **[Project Overview](./PROJECT.md)** — Tech stack, directory structure, conventions, known issues
- **[Implementation Guide](./IMPLEMENTATION.md)** — Exhaustive feature implementation details
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** — Feature status & next steps
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
| **Animations** | framer-motion |
| **Validation** | Zod v4 |
| **Package Manager** | pnpm |

### Directory Structure

```
remonest-app/
├── docs/                           # Project documentation
├── public/                         # Static assets
├── src/
│   ├── middleware.ts               # Supabase session management + route protection
│   │
│   ├── app/                        # Next.js App Router (thin route layer)
│   │   ├── layout.tsx              # Root layout (fonts, metadata, analytics, toaster)
│   │   ├── page.tsx                # Re-exports (main)/page
│   │   ├── globals.css             # Tailwind, oklch tokens, dark mode
│   │   ├── sitemap.ts              # Static XML sitemap
│   │   │
│   │   ├── (auth)/                 # Route group: centered auth layout
│   │   │   ├── layout.tsx          # Centered layout with language switcher
│   │   │   ├── login/page.tsx      # Delegates to features/auth/
│   │   │   ├── register/page.tsx   # Delegates to features/auth/
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (main)/                 # Route group: app pages with Header + Footer
│   │   │   ├── layout.tsx          # Auth-aware layout
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── dashboard/          # Protected dashboard → delegates to features/dashboard/
│   │   │   ├── jobs/               # Public job board → delegates to features/jobs/
│   │   │   ├── learning/           # Learning modules
│   │   │   ├── cv-builder/         # CV editor (placeholder)
│   │   │   ├── portfolio/          # Portfolio builder
│   │   │   └── profile/            # User profile → delegates to features/dashboard/
│   │   │
│   │   ├── admin/                  # Admin-only routes
│   │   │   ├── layout.tsx          # Admin sidebar + requireAdmin()
│   │   │   ├── jobs/               # Job management → delegates to features/jobs/
│   │   │   └── learning/           # Learning module creation
│   │   │
│   │   ├── auth/callback/route.ts  # Supabase OAuth code exchange
│   │   └── api/                    # API routes (placeholders)
│   │
│   ├── features/                   # ✨ Feature-driven architecture
│   │   ├── jobs/                   # ✨ Jobs module (21 files)
│   │   │   ├── types/job.ts        # JobType, JobStatus, ApplyMethod, Job interface
│   │   │   ├── schemas/
│   │   │   │   ├── job-submission.ts  # Zod: submission, draft, approval
│   │   │   │   └── job-params.ts      # Search params validation
│   │   │   ├── actions/
│   │   │   │   ├── fetch-jobs.ts      # getJobs, getJobById, getUserJobs, getPendingJobs, getAllJobs
│   │   │   │   ├── submit-job.ts      # submitJobAction, saveJobDraftAction
│   │   │   │   ├── manage-job.ts      # updateJobAction, deleteJobAction, republishJobAction
│   │   │   │   └── approve-job.ts     # approveJobAction, rejectJobAction, publishDraftJobAction
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts      # formatSalary, formatDeadline, label helpers
│   │   │   │   └── queries.ts         # Cached Supabase query builders (React cache)
│   │   │   └── components/ (12 files) # JobCard, DashboardJobCard, PostJobForm,
│   │   │                              # EditJobForm, AdminApprovalTable, JobsHero,
│   │   │                              # JobsEmptyState, RichTextToolbar, TagInput,
│   │   │                              # JobTypeBadge, VerificationBadge, StatusBadge
│   │   │
│   │   ├── auth/                   # ✨ Auth module (10 files)
│   │   │   ├── types/auth.ts       # AuthResult, StrengthResult
│   │   │   ├── schemas/
│   │   │   │   ├── login.ts           # loginSchema
│   │   │   │   ├── register.ts        # registerSchema
│   │   │   │   └── password.ts        # forgotPasswordSchema, updatePasswordSchema, resendConfirmationSchema
│   │   │   ├── actions/
│   │   │   │   ├── login.ts           # loginAction, googleSignInAction
│   │   │   │   ├── register.ts        # registerAction
│   │   │   │   ├── session.ts         # logoutAction
│   │   │   │   ├── password.ts        # resendConfirmationAction, forgotPasswordAction, updatePasswordAction
│   │   │   │   └── guards.ts          # requireAuth, getCurrentUser
│   │   │   └── utils/
│   │   │       └── password.ts        # evaluatePassword, STRENGTH_LABELS
│   │   │
│   │   └── dashboard/              # ✨ Dashboard module (9 files)
│   │       ├── types/dashboard.ts  # DashboardStats, ActivityEntry, ApplicationEntry, UserSettings, UserProfile
│   │       ├── schemas/
│   │       │   ├── profile.ts         # profileSchema
│   │       │   ├── password.ts        # passwordSchema
│   │       │   └── notifications.ts   # notificationPrefsSchema
│   │       └── actions/
│   │           ├── stats.ts           # getDashboardStats
│   │           ├── activity.ts        # getRecentActivity, timeAgo, mapActionToStatus
│   │           ├── applications.ts    # getApplications, applyToJob
│   │           ├── settings.ts        # getUserSettings, getUserProfile, saveProfileSettings, saveNotificationPreferences
│   │           └── security.ts        # updatePassword
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (17 components)
│   │   ├── admin/                  # Admin-specific components (data tables, sidebar, modals)
│   │   ├── dashboard/              # Dashboard header + role badge
│   │   ├── landing/                # Landing page sections
│   │   ├── mobile-menu.tsx         # Mobile hamburger menu
│   │   └── role-badge.tsx          # Reusable role badge
│   │
│   └── lib/
│       ├── utils.ts                # cn() utility
│       ├── roles.ts                # Role labels and helpers
│       ├── translations.tsx        # EN/ID TranslationProvider, useTranslations
│       ├── admin/
│       │   └── require-admin.ts    # Admin authorization guard
│       └── supabase/               # Supabase clients (browser, server, middleware)
│
├── supabase/                       # Supabase migrations and config
├── components.json                 # shadcn/ui configuration
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

### Organization Pattern

**Feature-driven architecture** (migrated April 2026):
- **Route-based** at the `app/` level — thin pages that delegate to features
- **Feature-based** at `features/` level — each feature owns its types, schemas, actions, components
- **Shared infrastructure** in `lib/` — Supabase clients, i18n, role helpers, utils
- **UI primitives** in `components/ui/` — shadcn components used across all features

**Key patterns:**
1. Server Components in `app/` fetch data from `features/<name>/actions/*`
2. Interactive pages split Server (data) + Client (UI state)
3. Mutations use Server Actions with Zod validation
4. Role-based rendering: Server fetches role → passes to Client as prop
5. Supabase queries cached with `React.cache()` for deduplication within a request
6. All imports use `@/*` path aliases — no barrel files

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

2. **Create feature module** under `src/features/<name>/`
   ```
   features/<name>/
   ├── types/          # Shared type definitions
   ├── schemas/        # Zod validation schemas
   ├── actions/        # Server Actions (mutations + queries)
   ├── components/     # Feature-specific UI components
   ├── utils/          # Formatters, helpers, cached queries
   └── hooks/          # Client-side hooks (if needed)
   ```

3. **Create server actions**
   ```typescript
   // src/features/your-feature/actions/data.ts
   "use server"
   import { requireAuth } from "@/features/auth/actions/guards"
   import { getSupabaseServerClient } from "@/lib/supabase/server"

   export async function getData() {
     await requireAuth()
     const supabase = getSupabaseServerClient()
     const { data } = await supabase.from('your-table').select('*')
     return data || []
   }
   ```

4. **Create components**
   ```tsx
   // src/features/your-feature/components/YourComponent.tsx
   "use client"
   import { useTranslations } from "@/lib/translations"

   export function YourComponent() {
     const { t } = useTranslations()
     return <div>{t.yourFeature.title}</div>
   }
   ```

5. **Create route** (thin wrapper in `app/`)
   ```tsx
   // src/app/(main)/your-feature/page.tsx
   import { getData } from "@/features/your-feature/actions/data"
   import { YourFeatureClient } from "@/features/your-feature/components/YourFeatureClient"

   export default async function YourFeaturePage() {
     const data = await getData()
     return <YourFeatureClient data={data} />
   }
   ```

6. **Add translations**
   ```typescript
   // src/lib/translations.tsx — add to both en and id objects
   yourFeature: {
     title: "Your Feature / Fitur Anda",
     description: "Description / Deskripsi",
   }
   ```

7. **Update documentation**
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
- Server actions: `src/features/<name>/actions/`
- Components: `src/features/<name>/components/`
- Types: `src/features/<name>/types/`
- Routes: `src/app/(main)/<name>/`

## Implementation Details
Code examples, API contracts, database schema.

## Testing
How to test the feature manually and expected behavior.

## Known Issues
Current limitations or bugs.
```

---

## 🔑 Key Conventions

1. **Imports**: Use `@/*` path alias (e.g., `@/features/jobs/actions/fetch-jobs`)
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
13. **No barrel files**: Direct imports only (`@/features/jobs/components/JobCard`, not `@/features/jobs`)
14. **Zod validation**: All mutations validated with Zod schemas in `features/<name>/schemas/`
15. **Supabase caching**: Use `React.cache()` for query deduplication within a request

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
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Complete feature status & next steps | ~450 |
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
├── IMPLEMENTATION_SUMMARY.md          # Feature status & next steps
├── ROLE_SYSTEM.md                     # User role system (RBAC)
├── DATABASE_ARCHITECTURE.md           # Database schema & design
├── CLIENT_ROLE_IMPLEMENTATION.md      # Client role feature (v0.3.0)
├── JOB_BOARD_IMPLEMENTATION.md        # Job board feature (v1.0.0)
├── JOB_POSTING_WORKFLOW.md            # Job posting workflow (v0.3.2)
├── AUTO_VERIFIED_JOB_POSTING.md       # Reverted auto-verify (v0.3.1)
├── JOB_DETAIL_MODAL.md                # Draft job modal (v1.1.0)
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
