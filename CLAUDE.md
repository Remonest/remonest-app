# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Architecture Overview

This is a **Next.js 16** application using App Router with a feature-driven architecture. The project is designed for Indonesian professionals to find remote work, build portfolios, and complete learning modules.

**Current Version:** v1.5.0 (April 11, 2026)

### Tech Stack

- **Next.js 16.2.2** with App Router (note: latest version has breaking changes from training data)
- **Supabase** - Authentication, PostgreSQL database, Storage, and Realtime
- **Tailwind CSS 4** with shadcn/ui components
- **TypeScript** with strict mode
- **Zod v4** for schema validation
- **TanStack Table** for admin data tables
- **Sonner** for toast notifications
- **Framer Motion** for animations
- **OpenAI** for AI-powered job reviews
- **React PDF** and **PDF.js** for PDF generation/viewing

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register, forgot-password)
│   ├── (main)/            # Main authenticated routes (dashboard, jobs, learning)
│   ├── admin/             # Admin-only routes (requireAdmin guard at layout)
│   ├── api/               # API route handlers
│   ├── layout.tsx         # Root layout: fonts, metadata, analytics, Sonner
│   ├── globals.css        # Tailwind, oklch tokens, dark mode
│   └── middleware.ts      # Supabase session refresh + route protection
├── features/              # Feature-driven modules (migrated April 2026)
│   ├── auth/              # Authentication (actions, schemas, types, utils)
│   ├── jobs/              # Job posting and application system
│   ├── dashboard/         # User dashboard functionality
│   ├── learning-module/   # Learning content with quizzes and materials
│   └── admin/             # Admin-specific actions (activity logging)
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components (no barrel files)
│   ├── landing/           # Landing page components
│   ├── admin/             # Admin-specific components
│   └── dashboard/         # Dashboard-specific components
└── lib/                  # Shared infrastructure (no feature logic)
    ├── supabase/         # Supabase clients (browser, server, middleware)
    ├── roles.ts           # Role-based access control helpers
    └── translations.tsx  # Bilingual support (en/id) - custom system
```

## Key Conventions

### Import Patterns

- Use `@/*` path alias for all imports
  ```typescript
  import { getJobs } from "@/features/jobs/actions/fetch-jobs"
  import { Button } from "@/components/ui/button"
  ```
- **No barrel files** — import directly from source files
  ```typescript
  // ✅ Good
  import { JobCard } from "@/features/jobs/components/JobCard"
  
  // ❌ Bad
  import { JobCard } from "@/features/jobs"
  ```

### Server vs Client Components

- **Default to Server Components** — only use `"use client"` when needed
- **Client components needed for:** State (`useState`), effects (`useEffect`), event handlers, browser APIs (`window`, `localStorage`), hooks (`useTranslations`, `useRouter`)

### Server/Client Split Pattern

```tsx
// Server Component (page.tsx)
import { getData } from "@/features/feature/actions/data"
import { FeatureClient } from "@/features/feature/components/FeatureClient"

export default async function FeaturePage() {
  const data = await getData()
  return <FeatureClient data={data} />
}

// Client Component (FeatureClient.tsx)
"use client"

export function FeatureClient({ data }: { data: any[] }) {
  const [state, setState] = useState(data)
  // Interactive UI
}
```

### Styling Conventions

- **Tailwind utility classes only** — no inline styles
- Use shadcn/ui components with CVA variants for buttons
- Dark mode via `document.documentElement.classList.add("dark")`
- Color tokens use oklch values (perceptually uniform color space)
- **Colors**: Light mode uses near-black/white, dark mode uses near-white/near-black

### Icon Usage

- Always import from `lucide-react`
  ```typescript
  import { Shield, User, Settings } from "lucide-react"
  ```

### Form Handling

- Native HTML inputs with Tailwind styling
- Zod validation for all mutations
- Server Actions with `useActionState` for form submissions

### Authentication & Authorization

#### Route Protection

- **Admin routes**: Protected at layout level via `requireAdmin()`
- **Auth routes**: Protected via middleware (not in layout)
- **Dashboard routes**: Protected via middleware

#### Role-Based UI Pattern

```tsx
// Server Component - fetch role once
import { getUserRole } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const role = await getUserRole()
  return <DashboardClient role={role} />
}

// Client Component - receive role as prop
"use client"

export function DashboardClient({ role }: { role: string }) {
  return (
    <div>
      {role === "admin" && <AdminPanel />}
      {role === "client" && <ClientDashboard />}
    </div>
  )
}
```

**Never** call `getUserRole()` in client components — always pass as prop from server.

### Supabase Integration

```typescript
// Regular server client - respects RLS
import { getSupabaseServerClient } from "@/lib/supabase/server"
const supabase = getSupabaseServerClient()

// Service role client - bypasses RLS (admin operations only)
import { getSupabaseServiceClient } from "@/lib/supabase/server"
const supabase = getSupabaseServiceClient()

// Browser client - for client components
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
const supabase = getSupabaseBrowserClient()
```

**Use service role carefully** — only for admin cross-user operations.

### Server Actions

#### Authentication Guards

```typescript
"use server"

import { requireAuth } from "@/features/auth/actions/guards"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function securedAction() {
  await requireAuth() // Throws if not authenticated
  
  const supabase = getSupabaseServerClient()
  // Perform action...
}
```

#### Redirects in Server Actions

- **Don't use** `redirect()` inside `useActionState` — it doesn't work
- **Use** `useEffect` + `router.push()` in client components instead

```tsx
// Client Component
"use client"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function MyForm() {
  const [state, action] = useActionState(myServerAction, null)
  const router = useRouter()
  
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state?.success])
  
  return <form action={action}>...</form>
}
```

### Feature Structure

Each feature follows this pattern:
```
features/<name>/
├── types/          # Shared type definitions
├── schemas/        # Zod validation schemas
├── actions/        # Server Actions (mutations + queries)
├── components/     # Feature-specific UI components
├── utils/          # Formatters, helpers, cached queries
└── hooks/          # Client-side hooks (if needed)
```

### Database Conventions

#### Migrations

- Sequential numbering: `001_`, `002_`, `003_`
- Descriptive names: `003_create_jobs_table.sql`
- Naming convention: `{number}_{action}_{subject}.sql`
- Always include rollback comments at bottom
- Test locally before pushing
- Use `React.cache()` for query deduplication within a request

#### RLS Policies

- **Default Deny**: No access unless explicitly permitted
- **Role-Based Access**: Different rules for admin, user, client
- **Ownership Checks**: Users can only access their own data
- **Public Reads**: Published content is world-readable
- **Admin Override**: Service role bypasses RLS for admin operations

### Internationalization

Custom translation system (not next-intl):
- Languages: English (`en`) and Bahasa Indonesia (`id`)
- Default: Bahasa Indonesia
- Storage: `localStorage` key `remonest-language`
- Context: `LanguageContext` in `@/lib/translations.tsx`
- Usage: `useTranslation()` hook in client components

**Note**: Language switcher is currently only implemented on dashboard pages.

### Color System

Uses oklch color space for perceptual uniformity:

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--background` | `oklch(1 0 0)` White | `oklch(0.145 0 0)` Near-black |
| `--foreground` | `oklch(0.145 0 0)` Near-black | `oklch(0.985 0 0)` White |
| `--primary` | `oklch(0.546 0.245 262.881)` Blue | Same blue |
| `--muted` | `oklch(0.97 0 0)` Light gray | `oklch(0.269 0 0)` Dark gray |
| `--border` | `oklch(0.922 0 0)` Light border | `oklch(1 0 0 / 10%)` Semi-transparent |

### Role Colors

| Role | Light Mode Classes | Dark Mode Classes |
|------|-------------------|-------------------|
| **Admin** | `bg-red-100 text-red-800` | `bg-red-900 text-red-200` |
| **User** | `bg-blue-100 text-blue-800` | `bg-blue-900 text-blue-200` |
| **Client** | `bg-green-100 text-green-800` | `bg-green-900 text-green-200` |

### Git Workflow

#### Branch Naming

```bash
# Format: <type>/<short-description>
feature/admin-activity-log
fix/rls-recursion-error
docs/update-rls-guide
```

#### Commit Messages

```bash
# Format: <type>(<scope>): <subject>
feat(admin): add activity log page
fix(jobs): resolve RLS recursion error
docs(rls): add troubleshooting guide
```

Types: feat, fix, docs, style, refactor, perf, test, chore

**Always test before committing** - `pnpm build` must pass

## Key Features

### Role System (RBAC)

Three roles: **admin**, **user**, **client**
- Admin: Full administrative access
- User: Standard access, job seeking, learning modules
- Client: Job posting, approval queue management

### Job Board System

Complete job board with dual posting workflow:
- **Admin Flow**: Admin submits → auto-publishes immediately
- **Client Flow**: Client submits → pending admin approval → approve/reject
- Status workflow: draft → pending → published/rejected → expired
- Apply methods: URL or email
- Job detail modal for draft management

### Admin Panel

Admin-only routes protected at layout level:
- Job management (pending, draft, published, all jobs)
- Approval workflow with reason tracking
- Learning module and quiz builder
- **Activity logging** (audit trail with login/logout tracking)
- Materials and resources management per learning module

### Learning Module System

- Admin CRUD for learning modules
- **Quiz Builder**: Admin assessment system with multiple-choice questions
  - Unlimited questions with 5 options (A-E)
  - Difficulty levels (easy, medium, hard)
  - Duration control, passing grade, publication toggle
  - Transaction-based creation
- **Learning Materials**: Articles, videos, documentation per module
  - Markdown content, summary, source URL, tags
  - Difficulty levels, language (ID/EN), reading time estimate
  - Publish toggle for staged release
- **Learning Resources**: Tools, templates, ebooks, PDFs, external links
  - URL + description, free/paid toggle
- **File Upload System**:
  - Supabase Storage bucket (`learning-files`)
  - Proxy route `/api/learning/file/[path]` for security
  - PDF, images, documents supported
- Auto-enrollment and progress tracking
- Manual "Mark as complete" button for users

### Admin Action Logging

Complete audit trail system:
- **Automatic triggers** on jobs, learning_modules, learning_materials, learning_resources
- **Manual logging** via helper functions
- **Login/logout tracking** with IP address and User Agent
- Immutable audit log (no UPDATE/DELETE policies)
- Activity log UI with statistics and filtering
- Security audit for suspicious activity detection

## Database Schema

Key tables (17 migrations total):
- `user_profiles` - Extended user info and role management
- `jobs` - Job listings with approval workflow
- `job_applications` - Application tracking
- `learning_modules` - Educational content
- `user_learning_progress` - Module completion tracking
- `user_settings` - User preferences
- `activity_log` - User action audit trail
- `admin_actions` - Admin action audit trail with login/logout tracking
- `quiz_configs` - Quiz settings per module
- `questions` - Multiple-choice questions
- `user_quiz_attempts` - Quiz attempt tracking
- `learning_materials` - Articles, videos, documentation
- `learning_resources` - Tools, templates, PDFs, external links

All tables have RLS policies for security.

## Important Notes

1. **Next.js 16 Breaking Changes**: Before writing code, check `node_modules/next/dist/docs/` for latest APIs and conventions
2. **Environment Variables**: Required variables in `.env.local` (see `.env.local.template`)
3. **No Tests**: Project currently has no test files - development is done without test coverage
4. **Testing**: Manual testing via UI, verify Supabase queries, test role-based access, check both light and dark mode
5. **PDF Handling**: Uses both React PDF (generation) and PDF.js (viewing via canvas)
6. **Storage**: Learning materials stored in Supabase Storage bucket
7. **AI Integration**: OpenAI API used for job description reviews in `/api/ai/review`
8. **Security**: File URLs proxied through `/api/learning/file/[path]` to hide Supabase bucket URLs

## Bilingual Content

The platform defaults to Bahasa Indonesia. When adding new UI text:
1. Update `@/lib/translations.tsx` with both `en` and `id` versions
2. Use `useTranslation()` hook in client components
3. Server-side text should support both languages or default to Indonesian
4. Language switcher is currently only on dashboard pages

## Documentation

Comprehensive documentation in `docs/` folder:
- `README.md` - Main documentation index
- `getting-started/project-overview.md` - Tech stack, structure, conventions
- `getting-started/conventions.md` - Key development conventions
- `getting-started/implementation-summary.md` - Feature status & next steps
- `architecture/database.md` - Database schema and RLS
- `architecture/role-system.md` - RBAC implementation
- `features/job-board/overview.md` - Job board v1.6.0
- `features/learning-module/overview.md` - Learning module system v1.3.0
- `features/learning-module/quiz-builder.md` - Quiz builder v1.0.0
- `features/learning-module/materials.md` - Materials & resources v1.0.0
- `guides/design-guidelines.md` - Complete design system
- `guides/rls-policies.md` - Complete RLS policy reference
- `guides/admin-action-logging.md` - Audit trail system
- `guides/new-feature.md` - How to add new features
- `guides/git-workflow.md` - Commit message conventions and branching

## Known Issues

- `@types/react-pdf` type definition warning (pre-existing, harmless)
- `/forgot-password` route linked but backend not fully implemented
- Some dashboard stats are placeholders (profile views, CV downloads)
- Language switcher only implemented on dashboard pages
- Quiz edit functionality pending (currently only create is supported)
- User-facing quiz taking UI not yet implemented
- Quiz list page to view/manage existing quizzes pending

## Migrations Required

Critical migrations that must be applied:
- Migration 011: Complete RLS policies & admin action logging
- Migration 012: Fix RLS infinite recursion error (critical!)
- Migration 013: Quiz builder system
- Migration 014: Learning materials & resources
- Migration 015: File storage for learning materials
- Migration 016: Activity triggers for learning modules
- Migration 017: Login/logout activity tracking

Run `supabase db push` to apply pending migrations.

## Version History (Recent)

- **v1.5.0** (April 11, 2026): Login/logout activity tracking, IP/User Agent logging
- **v1.4.1** (April 12, 2026): PDF file URL protection, bug fixes
- **v1.4.0** (April 12, 2026): File upload for learning materials
- **v1.3.3** (April 12, 2026): Public learning module detail page rewritten
- **v1.3.2** (April 11, 2026): Admin learning CRUD flow bug fixes
- **v1.3.1** (April 11, 2026): Indonesian learning materials seeding
- **v1.3.0** (April 11, 2026): Learning materials & resources
- **v1.2.1** (April 11, 2026): Code quality cleanup (47 unused imports)
- **v1.2.0** (April 10, 2026): Admin activity logging system, complete RLS

See `docs/CHANGELOG.md` for complete version history.
