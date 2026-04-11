# Remonest App - Documentation

Comprehensive documentation for the Remonest platform — a remote work hub for Indonesian professionals with learning modules, job board, CV/portfolio builder, and admin management.

**Current Version:** v1.3.0 | [View Changelog](./CHANGELOG.md)

---

## 🚀 Quick Navigation

### For New Developers
- **[Project Overview](./getting-started/project-overview.md)** — Tech stack, directory structure, conventions
- **[Quick Start](./getting-started/project-overview.md#-quick-start)** — Development commands and setup
- **[Implementation Guide](./getting-started/implementation-guide.md)** — Exhaustive feature implementation details
- **[Implementation Summary](./getting-started/implementation-summary.md)** — Feature status & next steps

### Design & UI
- **[Design Guidelines](./guides/design-guidelines.md)** — 🎨 Complete design system: colors, components, patterns
- **[Component Library](./guides/design-guidelines.md#-component-library)** — Available shadcn/ui components
- **[Color System](./guides/design-guidelines.md#-color-system)** — oklch palette, semantic tokens, role colors
- **[Typography](./guides/design-guidelines.md#-typography)** — Font families, type scale, best practices

### System Architecture
- **[Database Architecture](./architecture/database.md)** — Complete database schema, RLS, indexes, migrations
- **[Role System (RBAC)](./architecture/role-system.md)** — Admin/user/client roles, colors, guards, usage
- **[RLS Policies Guide](./guides/rls-policies.md)** — 🆕 Complete RLS policy reference and security
- **[Admin Action Logging](./guides/admin-action-logging.md)** — 🆕 Audit trail system for admin actions

### Feature Documentation
- **[Job Board](./features/job-board/overview.md)** — Job board v1.0.0: schema, actions, UI, posting workflow
  - [Posting Workflow](./features/job-board/posting-workflow.md) — Role-based posting with admin approval queue
  - [Detail Modal](./features/job-board/detail-modal.md) — Dialog component for viewing/managing job drafts
- **[Client Role](./features/client-role/implementation.md)** — Client role (employer/job poster) system
- **[Learning Module](./features/learning-module/overview.md)** — Learning module system: admin CRUD, progress tracking, quiz builder, materials
  - [Quiz Builder](./features/learning-module/quiz-builder.md) — Quiz creation with multiple-choice questions
  - [Materials & Resources](./features/learning-module/materials.md) — Articles, videos, tools, templates, PDFs
- **[Public Module Detail](./features/learning-module/overview.md#admin-routes)** — `/learning/[slug]` with Markdown rendering and materials
- **[Language Switcher](./features/language-switcher/implementation.md)** — EN/ID language system
- **[Admin Activity Logging](./features/admin/activity-logging.md)** — 🆕 Admin action tracking with UI flows

### Guides & How-Tos
- **[Design Guidelines](./guides/design-guidelines.md)** — Complete design system, colors, components, patterns
- **[Social Media Icons](./guides/social-media-icons.md)** — Custom SVG icons for footer (Twitter, LinkedIn, Instagram)
- **[Git Workflow](./guides/git-workflow.md)** — 🆕 Commit messages, branching, PR guidelines
- **[Database Migrations](./guides/database-migrations.md)** — 🆕 Complete guide to all 12 migrations
- **[Admin Access Guide](./guides/admin-access.md)** — Step-by-step admin panel access instructions
- **[Quick Admin Reference](./guides/quick-admin-access.md)** — Quick admin access steps
- **[Adding New Features](./guides/new-feature.md)** — How to add features step-by-step

---

## 📁 Documentation Structure

```
docs/
├── README.md                          # This file - Main documentation index
├── getting-started/                   # 🚀 Onboarding & overview
│   ├── project-overview.md           # Tech stack, structure, conventions
│   ├── implementation-guide.md       # Comprehensive implementation details
│   ├── implementation-summary.md     # Feature status & next steps
│   └── conventions.md                # Key development conventions
├── architecture/                      # 🏗️ System design
│   ├── database.md                   # Database schema & design
│   └── role-system.md                # RBAC implementation
├── features/                          # ✨ Feature documentation
│   ├── job-board/
│   │   ├── overview.md               # Job board v1.0.0
│   │   ├── posting-workflow.md       # Job posting workflow v0.3.2
│   │   └── detail-modal.md           # Job detail modal v1.1.0
│   ├── client-role/
│   │   └── implementation.md         # Client role system v0.3.0
│   ├── learning-module/
│   │   ├── overview.md               # Learning module system v1.3.0
│   │   ├── quiz-builder.md           # Quiz creation system v1.0.0
│   │   └── materials.md              # 🆕 Materials & resources v1.0.0
│   ├── language-switcher/
│   │   └── implementation.md         # i18n system (EN/ID)
│   └── admin/
│       └── activity-logging.md       # Admin action tracking UI
└── guides/                            # 📖 How-to guides
    ├── design-guidelines.md          # 🎨 Design system & component patterns
    ├── social-media-icons.md         # 🐦 Custom SVG icons (Twitter, LinkedIn, Instagram)
    ├── git-workflow.md               # 🔄 Commit messages, branching, PR guidelines
    ├── database-migrations.md        # 🗄️ Complete guide to all 14 migrations
    ├── rls-policies.md               # 🔒 Complete RLS policy reference
    ├── rls-recursion-fix.md          # 🛠️ Fix for infinite recursion error
    ├── admin-action-logging.md       # 📊 Admin audit trail system
    ├── migration-naming-quick-reference.md  # 🏷️ Migration naming conventions
    ├── seed-learning-materials.md          # 🌱 How to populate learning content
    ├── admin-access.md               # Admin panel access guide
    ├── quick-admin-access.md         # Quick admin reference
    └── new-feature.md                # How to add new features
```

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

### Organization Pattern

**Feature-driven architecture** (migrated April 2026):
- **Route-based** at the `app/` level — thin pages that delegate to features
- **Feature-based** at `features/` level — each feature owns its types, schemas, actions, components
- **Shared infrastructure** in `lib/` — Supabase clients, i18n, role helpers, utils
- **UI primitives** in `components/ui/` — shadcn components used across all features

---

## 📊 Implementation Status

### ✅ Complete (Production Ready)

#### Core Features
- **Authentication System** (login, register, OAuth, email confirmation, password reset)
- **Dashboard** (stats, activity, settings, applications)
- **Dashboard Language Switcher** (EN/ID support for all dashboard pages)
- **Profile Page** (role-aware UI for user, client, admin)

#### Job Board System
- **Job Board** (public listing, job posting, admin approval, client job management)
- **Job Detail Modal** (v1.1.0 - view/publish/delete draft jobs with auto-refresh)
- **Client Role System** (employer job posting, management dashboard)
- **Job Edit Form** (with rich text editor, tag input, draft/publish workflow)

#### Admin Panel
- **Admin Job Management** (tabs for pending, draft, published, all jobs)
- **Approval Workflow** (approve/reject jobs with reason tracking)
- **Admin Activity Logging** (🆕 automatic audit trail with UI)
  - Complete admin action tracking system
  - Immutable audit log
  - Activity log page with stats and filtering
  - Automatic triggers on jobs and learning modules

#### Database & Security
- **Database Architecture** (8 tables with complete RLS)
- **RLS Policies** (🆕 35+ policies for all tables)
  - Complete row-level security for all 8 tables
  - Role-based access (admin/user/client)
  - Automatic admin action logging via triggers
  - Immutable audit trail (admin_actions table)
- **Admin Action Logging System** (🆕)
  - Automatic triggers on admin actions
  - Helper functions for manual logging
  - Convenience views for reporting
  - Activity log UI with statistics

#### Learning & Content
- **Learning Module System** (admin CRUD, progress tracking, quiz builder, materials)
- **Language Switcher** (EN/ID translation system)
- **Quiz Builder** (🆕 admin assessment system with multiple-choice questions)
- **Learning Materials** (🆕 articles, videos, documentation per module)
- **Learning Resources** (🆕 tools, templates, ebooks, PDFs, external links)

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

## 🚀 Development Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # Run ESLint
```

---

## 🐛 Known Issues

### ✅ Recently Fixed
- ~~TypeScript type errors in job components~~ - ✅ Fixed (April 10, 2026)
- ~~Build errors from type mismatches~~ - ✅ Fixed (April 10, 2026)
- ~~Missing RLS policies~~ - ✅ Fixed (Migration 011)
- ~~No admin action logging~~ - ✅ Fixed (Activity logging system)
- ~~RLS infinite recursion error~~ - ✅ Fixed (Migration 012)
- ~~Social icons in footer (X, Link, Camera)~~ - ✅ Fixed (Custom SVG icons)

### Remaining Issues
- `@types/react-pdf` type definition warning (pre-existing, harmless)
- `/forgot-password` route linked from login page but backend not fully implemented
- `/admin/learning` and `/admin/settings` sidebar links exist but pages need enhancement
- Profile views and CV downloads on dashboard are placeholder metrics (not yet tracked in DB)
- `/learning` pages still use hardcoded data despite DB tables existing
- Client profile stats use some placeholder values

### ⚠️ Migration Required

You must apply these migrations for the app to work correctly:

```bash
supabase db push
```

**Migrations to Apply:**
- **Migration 011**: Complete RLS policies & admin action logging
- **Migration 012**: Fix RLS infinite recursion error (critical!)

See [Migration Guide](../scripts/MIGRATION_GUIDE.md) for detailed instructions.

---

## 📚 Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
