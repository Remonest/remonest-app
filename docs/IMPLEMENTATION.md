# Remonest - Implementation Documentation

**Version:** v0.4.0
**Last Updated:** April 9, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [URL Paths & Routes](#url-paths--routes)
   - [Public Pages](#public-pages)
   - [Authentication Routes](#authentication-routes)
   - [Dashboard Routes](#dashboard-routes)
   - [Feature Pages](#feature-pages)
   - [Dynamic Routes](#dynamic-routes)
   - [API Routes](#api-routes-1)
   - [Route Protection Matrix](#route-protection-matrix)
6. [Implemented Features](#implemented-features)
   - [Landing/Marketing Site](#landingmarketing-site)
   - [Authentication System](#authentication-system)
   - [Learning Modules](#learning-modules)
   - [Job Board](#job-board)
   - [CV Builder](#cv-builder)
   - [Portfolio Builder](#portfolio-builder)
   - [Public Portfolio Pages](#public-portfolio-pages)
   - [Dashboard](#dashboard)
   - [Settings Page](#settings-page)
   - [Applications Tracker](#applications-tracker)
   - [Dashboard Integration](#dashboard-integration)
   - [Admin Panel](#admin-panel)
   - [Client Role System](#client-role-system)
   - [Profile Page](#profile-page)
   - [Language Switcher (Dashboard)](#language-switcher-dashboard)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [Authentication Flow](#authentication-flow)
10. [Middleware & Route Protection](#middleware--route-protection)
11. [UI Components](#ui-components)
12. [Styling & Theming](#styling--theming)
13. [SEO & Analytics](#seo--analytics)
14. [TODOs & Pending Features](#todos--pending-features)

---

## Overview

**Remonest** is a remote career platform built specifically for Indonesian professionals. It helps users:

- Find global remote job opportunities
- Develop remote-ready skills through learning modules
- Create ATS-optimized CVs and portfolios
- Present professional profiles to international employers

The application is currently in **v0.2.0** with dashboard pages fully integrated with Supabase (real data, save functionality), admin panel partially implemented, and authentication complete with email confirmation flow. Core UI pages (CV builder, portfolio builder, job board, learning modules) still use mock data.

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.2 |
| **Language** | TypeScript (strict mode) | - |
| **Styling** | Tailwind CSS (CSS-first config) | v4 |
| **UI Library** | shadcn/ui (radix-nova style) | - |
| **Icons** | lucide-react | 1.7.0 |
| **Fonts** | Inter (body/headings), Geist Mono (code) | - |
| **Backend/Database** | Supabase (PostgreSQL) | - |
| **Authentication** | Supabase Auth (email/password + Google OAuth) | - |
| **Validation** | Zod | 4.3.6 |
| **PDF Generation** | @react-pdf/renderer | Installed, not yet used |
| **Toast Notifications** | sonner | - |
| **Analytics** | @vercel/analytics, @vercel/speed-insights | - |
| **Package Manager** | pnpm | - |
| **Linting** | ESLint v9 with eslint-config-next | - |

---

## Architecture

### Next.js App Router Structure

The application uses Next.js App Router with the following route groups:

- **`(auth)`** - Authentication routes (`/login`, `/register`)
- **`(main)`** - App pages with Header + Footer layout
- **`api`** - API routes for backend functionality
- **`auth/callback`** - OAuth callback handler

### Component Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group (centered layout)
│   ├── (main)/            # Main app route group (header + footer)
│   ├── api/               # API routes
│   └── auth/callback/     # OAuth handler
├── components/
│   ├── ui/                # shadcn/ui primitive components
│   └── landing/           # Landing page sections
├── lib/
│   ├── auth/              # Authentication logic & server actions
│   └── supabase/          # Supabase client configurations
└── middleware.ts          # Route protection middleware
```

### Data Flow

1. **Client-side**: React components fetch data (currently hardcoded)
2. **Server Actions**: Auth operations via `useActionState` pattern
3. **API Routes**: RESTful endpoints for external integrations (mostly TODO)
4. **Supabase**: Database and authentication (connected, minimal data usage)

---

## URL Paths & Routes

### Public Pages

| Route | Path | File | Status | Layout | Description |
|-------|------|------|--------|--------|-------------|
| Home | `/` | `src/app/(main)/page.tsx` | ✅ Complete | Header + Footer | Landing page with hero, features, steps, testimonials, CTA, JSON-LD |
| Sitemap | `/sitemap.xml` | `src/app/sitemap.ts` | ✅ Complete | None | Auto-generated XML sitemap for SEO |
| Favicon | `/favicon.ico` | `src/app/favicon.ico` | ✅ Complete | None | Site icon |

---

### Authentication Routes

| Route | Path | File | Status | Layout | Auth Required | Description |
|-------|------|------|--------|--------|---------------|-------------|
| Login | `/login` | `src/app/(auth)/login/page.tsx` | ✅ Complete | Centered | ❌ No (redirects to `/dashboard` if authenticated) | Email/password + Google OAuth sign-in |
| Register | `/register` | `src/app/(auth)/register/page.tsx` | ✅ Complete | Centered | ❌ No (redirects to `/dashboard` if authenticated) | User registration with validation |
| OAuth Callback | `/auth/callback` | `src/app/auth/callback/route.ts` | ✅ Complete | None | ❌ No | Supabase OAuth code exchange handler |

**Query Parameters:**
- `/login?redirect=/dashboard` - Target URL after successful login
- `/auth/callback?next=/settings` - Target URL after OAuth completion

---

### Dashboard Routes

| Route | Path | File | Status | Auth Required | Description |
|-------|------|------|--------|---------------|-------------|
| Dashboard Home | `/dashboard` | `src/app/(main)/dashboard/page.tsx` | ⚠️ UI Only | ✅ Yes | Stats cards, activity feed, quick action links |
| Settings | `/dashboard/settings` | `src/app/(main)/dashboard/settings/page.tsx` | ⚠️ UI Only | ✅ Yes | Tabbed settings (Profile, Notifications, Appearance, Security) |
| Applications | `/dashboard/applications` | `src/app/(main)/dashboard/applications/page.tsx` | ⚠️ UI Only | ✅ Yes | Job application tracker with status summary |

**Future Dashboard Routes (Planned):**
- `/dashboard/profile` - Profile management page
- `/dashboard/certificates` - Learning module certificates
- `/dashboard/saved-jobs` - Bookmarked job listings

---

### Admin Routes

| Route | Path | File | Status | Auth Required | Description |
|-------|------|------|--------|---------------|-------------|
| Admin Jobs | `/admin/jobs` | `src/app/admin/jobs/page.tsx` | ✅ Complete | ✅ Yes (admin role) | Jobs management with sortable data table, approve/reject actions |
| Admin Learning | `/admin/learning` | — | ❌ Missing | ✅ Yes (admin role) | Sidebar link exists, no index page |
| Create Learning | `/admin/learning/new` | `src/app/admin/learning/new/page.tsx` | ✅ Complete | ✅ Yes (admin role) | Form to create new learning module |
| Admin Settings | `/admin/settings` | — | ❌ Missing | ✅ Yes (admin role) | Sidebar link exists, no page |

**Admin Auth:** Protected at layout level via `requireAdmin()` (not in middleware `PROTECTED_PATHS`)

---

### Feature Pages

| Route | Path | File | Status | Auth Required | Description |
|-------|------|------|--------|---------------|-------------|
| Learning Modules | `/learning` | `src/app/(main)/learning/page.tsx` | ⚠️ UI Only | ❌ No | Module grid with category filters |
| Job Board | `/jobs` | `src/app/(main)/jobs/page.tsx` | ⚠️ UI Only | ❌ No | Job listings with search and filters |
| CV Builder | `/cv-builder` | `src/app/(main)/cv-builder/page.tsx` | ⚠️ Skeleton | ❌ No | Split-view CV editor (form + preview) |
| Portfolio Builder | `/portfolio` | `src/app/(main)/portfolio/page.tsx` | ⚠️ Skeleton | ❌ No | Portfolio project editor |

---

### Dynamic Routes

| Route Pattern | Example Path | File | Status | SSG | Auth Required | Description |
|---------------|--------------|------|--------|-----|---------------|-------------|
| `/learning/[slug]` | `/learning/communication-basics` | `src/app/(main)/learning/[slug]/page.tsx` | ⚠️ UI Only | ❌ No | ❌ No | Individual learning module content |
| `/jobs/[id]` | `/jobs/123` | `src/app/(main)/jobs/[id]/page.tsx` | ⚠️ UI Only | ❌ No | ❌ No | Individual job posting details |
| `/portfolio/[username]` | `/portfolio/johndoe` | `src/app/(main)/portfolio/[username]/page.tsx` | ⚠️ UI Only | ✅ Yes (`generateStaticParams`) | ❌ No | Public portfolio page |

**Dynamic Route Parameters:**

```typescript
// /learning/[slug]
params: { slug: string }  // Module slug identifier

// /jobs/[id]
params: { id: string }    // Job ID identifier

// /portfolio/[username]
params: { username: string }  // User's public username
```

---

### API Routes

| Route | Method | File | Status | Auth Required | Description |
|-------|--------|------|--------|---------------|-------------|
| `/api/ai/review` | POST | `src/app/api/ai/review/route.ts` | ⚠️ Placeholder | ❌ No | AI-powered CV text review (returns mock data) |
| `/api/jobs/sync` | GET | `src/app/api/jobs/sync/route.ts` | ⚠️ Placeholder | ✅ Header (`x-cron-secret`) | Cron-triggered job sync from external APIs |
| `/api/upload` | POST | `src/app/api/upload/route.ts` | ⚠️ Partial | ❌ No | File upload validation (Supabase Storage TODO) |
| `/api/webhooks/stripe` | POST | `src/app/api/webhooks/stripe/route.ts` | ⚠️ Placeholder | ✅ Header (`stripe-signature`) | Stripe webhook event handler |
| `/auth/callback` | GET | `src/app/auth/callback/route.ts` | ✅ Complete | ❌ No | OAuth callback session exchange |

**API Route Request/Response Specs:**

```typescript
// POST /api/ai/review
// Request Body:
{
  cvText: string;           // CV content to review
  jobDescription?: string;  // Optional target job description
}
// Response (200):
{
  score: number;            // 0-100 review score
  strengths: string[];      // Identified strengths
  improvements: string[];   // Suggested improvements
}

// GET /api/jobs/sync
// Headers:
{
  "x-cron-secret": string;  // Cron trigger secret
}
// Response (200):
{
  synced: number;           // Number of jobs synced
  jobs: Array<{...}>;       // Synced job records
}

// POST /api/upload
// Request Body: FormData with file field
// Validation:
//   - Max size: 5MB
//   - Allowed types: JPEG, PNG, WebP, PDF
// Response (200):
{
  url: string;              // Uploaded file URL
}
```

---

### Route Protection Matrix

```
Route                          | Public | Auth Required | Redirect Behavior
-------------------------------|--------|---------------|-------------------------------------------
/                              |   ✅   |       ❌      | None (landing layout for unauth, bare for auth)
/login                         |   ✅   |       ❌      | Redirects to /dashboard if authenticated
/register                      |   ✅   |       ❌      | Redirects to /dashboard if authenticated
/auth/callback                 |   ✅   |       ❌      | OAuth handler
/learning                      |   ✅   |       ❌      | None
/learning/[slug]               |   ✅   |       ❌      | None
/jobs                          |   ✅   |       ❌      | None
/jobs/[id]                     |   ✅   |       ❌      | None
/cv-builder                    |   ✅   |       ❌      | None (should require auth - TODO)
/portfolio                     |   ✅   |       ❌      | None (should require auth - TODO)
/portfolio/[username]          |   ✅   |       ❌      | None (public by design)
/dashboard                     |   ❌   |       ✅      | Redirects to /login if not authenticated
/dashboard/settings            |   ❌   |       ✅      | Redirects to /login if not authenticated
/dashboard/applications        |   ❌   |       ✅      | Redirects to /login if not authenticated
/admin/*                       |   ❌   | ✅ (admin)    | Layout-level guard: redirects non-admins to /dashboard
/api/ai/review                 |   ✅   |       ❌      | None (should require auth - TODO)
/api/jobs/sync                 |   ❌   | ✅ (Header)   | Returns 401 without valid cron secret
/api/upload                    |   ✅   |       ❌      | None (should require auth - TODO)
/api/webhooks/stripe           |   ❌   | ✅ (Header)   | Returns 401 without valid stripe signature
```

**Protected Routes (via `src/middleware.ts`):**
- `/dashboard/*` - All dashboard sub-routes
- `/settings/*` - Settings routes (not yet created as separate route group)
- `/profile/*` - Profile routes (not yet implemented)

**Admin Protection (via layout-level `requireAdmin()`):**
- `/admin/*` - All admin sub-routes (role check against `user_profiles.role`)

**Layout Auth Awareness (via `(main)/layout.tsx`):**
- Checks `supabase.auth.getUser()` server-side
- Authenticated users → bare layout (dashboard/admin provides own header)
- Unauthenticated users → landing layout with `<Header>` + `<Footer>`

**Middleware Behavior:**
1. Refreshes Supabase session on every request via `updateSession()`
2. Checks for valid session on protected routes
3. Unauthenticated users → `/login?redirect=<original-path>`
4. Stores redirect target in `redirect_after_login` cookie
5. After successful login, redirects to stored target

---

## Directory Structure

```
remonest-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout with fonts, analytics, theme
│   │   ├── globals.css                     # Tailwind imports, oklch color tokens
│   │   ├── page.tsx                        # Re-exports from (main)/page
│   │   ├── sitemap.ts                      # Static sitemap for SEO
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                  # Centered auth layout
│   │   │   ├── login/page.tsx              # Email/password + Google OAuth
│   │   │   └── register/page.tsx           # Registration with password strength meter
│   │   │
│   │   ├── (main)/
│   │   │   ├── layout.tsx                  # Header + Footer wrapper
│   │   │   ├── page.tsx                    # Landing page with JSON-LD structured data
│   │   │   │
│   │   │   ├── learning/
│   │   │   │   ├── page.tsx                # Module grid with category filters
│   │   │   │   └── [slug]/page.tsx         # Module content rendering
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx                # Job list with search/filters
│   │   │   │   └── [id]/page.tsx           # Job detail with apply CTA
│   │   │   │
│   │   │   ├── cv-builder/page.tsx         # Split-view CV form + preview
│   │   │   │
│   │   │   ├── portfolio/
│   │   │   │   ├── page.tsx                # Portfolio editor
│   │   │   │   └── [username]/page.tsx     # Public portfolio (SSG)
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                # Stats + activity + quick actions
│   │   │       ├── settings/page.tsx       # Tabbed settings interface
│   │   │       └── applications/page.tsx   # Application history tracker
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx                  # Admin layout with sidebar + Suspense
│   │   │   ├── logout-action.ts            # Re-exports logoutAction
│   │   │   ├── jobs/page.tsx               # Jobs management with DataTable
│   │   │   └── learning/new/page.tsx       # Create learning module form
│   │   │
│   │   ├── auth/callback/route.ts          # OAuth callback session exchange
│   │   │
│   │   └── api/
│   │       ├── ai/review/route.ts          # AI CV review (placeholder)
│   │       ├── jobs/sync/route.ts          # Job sync cron (placeholder)
│   │       ├── upload/route.ts             # File upload (partial)
│   │       └── webhooks/stripe/route.ts    # Stripe webhook (placeholder)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx                  # CVA variants
│   │   │   ├── card.tsx                    # Card components
│   │   │   └── input.tsx                   # Styled input
│   │   │
│   │   ├── admin/
│   │   │   ├── sidebar.tsx                 # AdminSidebar + MobileAdminHeader
│   │   │   ├── sign-out-button.tsx         # Admin logout button
│   │   │   ├── data-table.tsx              # Generic sortable table
│   │   │   ├── job-columns.tsx             # Job column definitions
│   │   │   ├── job-actions.tsx             # Approve/Reject buttons
│   │   │   └── status-badge.tsx            # Status badge component
│   │   │
│   │   └── landing/
│   │       ├── header.tsx                  # Responsive sticky header
│   │       ├── hero-section.tsx            # Hero with CSS carousel
│   │       ├── features-section.tsx        # Feature cards
│   │       ├── steps-section.tsx           # How it works steps
│   │       ├── testimonials-section.tsx    # Testimonial grid
│   │       ├── cta-section.tsx             # CTA banner
│   │       ├── footer.tsx                  # Footer with links
│   │       ├── theme-toggle.tsx            # Dark mode toggle
│   │       └── theme-init.tsx              # Theme initialization
│   │
│   └── lib/
│       ├── utils.ts                        # cn() utility
│       ├── auth/
│       │   ├── schemas.ts                  # Zod validation schemas
│       │   ├── actions.ts                  # Server actions (login, register, logout, google, resend)
│       │   └── server.ts                   # Auth helpers (getCurrentUser, requireAuth)
│       ├── admin/
│       │   ├── require-admin.ts            # Admin authorization guard
│       │   └── mock-data.ts                # Mock job data + types
│       ├── learning/
│       │   └── actions.ts                  # Learning module CRUD server actions
│       └── supabase/
│           ├── client.ts                   # Browser client
│           ├── server.ts                   # Server client
│           └── middleware.ts               # Middleware helper
│
├── supabase/
│   ├── config.toml                         # Local dev config
│   └── migrations/
│       └── 001_create_user_profiles.sql    # Database schema
│
└── docs/
    ├── PROJECT.md                          # Project documentation
    └── IMPLEMENTATION.md                   # This file
```

---

## Implemented Features

### Landing/Marketing Site

**Location:** `src/app/(main)/page.tsx` and `src/components/landing/`

**Implemented:**
- Full marketing page with responsive layout
- **Hero Section** with auto-advancing CSS carousel (4 slides, 3.5s interval)
  - CSS-only animation (no JavaScript required for carousel)
  - Dot indicators and prev/next navigation buttons
  - Stats chips showing platform metrics
- **Features Section** - 3-column feature cards with preview images
- **Steps Section** - "How it works" 3-step guide in bordered container
- **Testimonials Section** - Asymmetric grid (1.2fr / 0.8fr) with 3 testimonials
- **CTA Section** - Inverted-color call-to-action banner
- **Footer** - 4-column layout with brand, platform, company, legal links + social icons
- **JSON-LD structured data** for SEO (Organization, WebSite, SiteNavigationElement)
- **Responsive header** with:
  - Sticky behavior after 100px scroll
  - Mobile hamburger menu with overlay
  - Outside-click dismissal for mobile menu
  - Theme toggle integration

**Status:** ✅ Complete (hardcoded content)

---

### Authentication System

**Location:** `src/lib/auth/` and `src/app/(auth)/`

**Implemented:**
- **Email/Password Login** with Supabase `signInWithPassword`
- **Registration** with Supabase `signUp` (stores `full_name` in metadata)
- **Google OAuth** sign-in via redirect
- **Zod Validation**:
  - Email format validation
  - Password requirements (min 8 chars, uppercase, lowercase, number)
  - Confirm password match
  - Name length limits
- **Password Strength Meter** on registration page (4-segment bar + checklist)
- **Show/Hide Password Toggle** on both password fields in registration page (Eye/EyeOff icons)
- **Email Confirmation Handling**:
  - Detects unconfirmed email on login (checks `email_confirmed_at` + error messages)
  - Redirects to `/login?unconfirmed=<email>` with warning banner
  - **Resend Confirmation Email** button in warning banner
  - Toast notification on registration page when email confirmation is required
- **Server Actions** using `useActionState` pattern:
  - `loginAction` - handles login with error states + email confirmation check
  - `registerAction` - handles registration with error states
  - `logoutAction` - signs out user
  - `googleSignInAction` - redirects to Google OAuth
  - `resendConfirmationAction` - resends signup confirmation email
- **Client-Side Redirect Handling** — `useEffect` listens to `state.success` and `state.redirect` then calls `router.push()` (fixes issue where `redirect()` from server actions inside `useActionState` doesn't trigger client navigation)
- **Session Management** via Supabase Auth
- **Redirect Logic**:
  - `redirect_after_login` cookie stores target URL
  - Authenticated users redirected away from `/login` and `/register`
  - Unauthenticated users redirected to `/login` with target preservation

**Components:**
- Login form with email/password + "Continue with Google" button
- Login page: yellow warning banner for unconfirmed emails with resend button
- Registration form with name, email, password (with show/hide toggle + strength meter), confirm password + strength meter
- Suspense wrappers for client-side rendering

**Status:** ✅ Complete (fully functional auth with email confirmation flow)

---

### Learning Modules

**Location:** `src/app/(main)/learning/`

**Implemented:**
- **Module Grid** with category filters (Communication, Mindset, Career, Design, Productivity)
- **Individual Module Pages** at `/learning/[slug]`
- Basic markdown-like content rendering
- Category badge display
- Module metadata (title, description, category, content)

**Current Data:** 1 hardcoded module

**Status:** ⚠️ UI complete, data hardcoded, no Supabase integration

---

### Job Board

**Location:** `src/app/(main)/jobs/`, `src/lib/jobs/`, `src/components/jobs/`

**Implemented:**
- **Database Schema** (Migration 003):
  - `jobs` table with dual posting workflow
  - Enums: `job_type_enum` (full-time, part-time, project, freelance), `job_status_enum` (draft, pending, approved, rejected, published, expired), `apply_method_enum` (url, email)
  - 7 indexes for performance
  - RLS policies for security
  - Auto-update triggers
  - 4 sample jobs included
- **Server Actions** (`src/lib/jobs/actions.ts`):
  - `getJobs(filters)` — Fetch published jobs with optional filters (job_type, search, location)
  - `getJobById(id)` — Get single job by ID
  - `getUserJobs()` — Get jobs posted by current user
  - `getPendingJobs()` — Get pending jobs for admin approval
  - `getAllJobs()` — Get all jobs for admin
  - `submitJob(formData)` — Submit new job (admin=immediate publish, user=pending approval)
  - `saveJobDraft(formData)` — Save job as draft
  - `approveJob(jobId)` — Admin approve pending job
  - `rejectJob(jobId, reason)` — Admin reject with reason
  - `deleteJob(jobId)` — Delete job with restrictions
  - `republishJob(jobId)` — Republish expired jobs
  - Helper functions: `formatSalary()`, `formatDeadline()`, `getJobTypeLabel()`, `getStatusLabel()`
  - Zod validation for job submission
- **UI Components** (`src/components/jobs/`):
  - `JobCard.tsx` — Full job card with all fields (title, company, job type, salary, location, deadline, verification badge, apply button)
  - `JobTypeBadge.tsx` — Color-coded badges (Full-Time=#0891b2, Part-Time=#0d9488, Project=#f97316, Freelance=#8b5cf6)
  - `VerificationBadge.tsx` — Green checkmark badge for admin-verified jobs
  - `StatusBadge.tsx` — Status badges (draft=gray, pending=amber, approved=blue, rejected=red, published=emerald, expired=orange)
  - `PostJobForm.tsx` — Unified job posting form that adapts based on user role (Admin vs Client)
  - `AdminApprovalTable.tsx` — Pending jobs table with approve/reject actions and reason dialog
- **Posting Flows:**
  - **Admin Flow:** Admin submits → status='published' immediately, is_verified_by_admin=true
  - **Client Flow:** Client submits → status='pending', is_verified_by_admin=false → Admin approves/rejects
- **Job Card Display:**
  - Title, Company, Job Type badge (color-coded)
  - Salary range (formatted: "Rp 5jt – 10jt / bulan")
  - Location ("Remote / WFH")
  - Deadline ("30 Mei 2026")
  - Verification badge ("✅ Terverifikasi Admin")
  - Apply button (external link or email)
- **Admin Approval Workflow:**
  - Pending jobs shown in table
  - Approve → status='published', is_verified_by_admin=true
  - Reject → status='rejected', optional rejection_reason stored
  - Real-time updates after actions

**Current Data:** 4 sample jobs in migration (2 published, 1 pending, 1 freelance)

**Status:** ✅ Complete (database schema, server actions, UI components, approval workflow implemented)

**Missing Pages:**
- `/jobs` - Public job board page (UI exists but needs Supabase integration)
- `/jobs/[id]` - Single job detail page
- `/jobs/post` - Job posting form page (PostJobForm component ready)
- `/dashboard/jobs` - User's job management page

---

### CV Builder

**Location:** `src/app/(main)/cv-builder/page.tsx`

**Implemented:**
- **Split-View Editor**:
  - Left side: Form inputs
  - Right side: Live CV preview
- **Sections**:
  - Personal Info (name, email, phone, address)
  - Work Experience (multiple entries)
  - Skills (tag-style input)
- **Mobile Tab Toggle** - switches between form and preview on small screens
- **ATS-Optimized Preview** - clean, professional formatting

**Current State:** UI-only, no form state management, no data persistence

**Status:** ⚠️ UI skeleton complete, no functionality or persistence

---

### Portfolio Builder

**Location:** `src/app/(main)/portfolio/page.tsx`

**Implemented:**
- **Project-Based Editor**:
  - Add/remove projects
  - Project fields: title, description, image URL, link
- **Profile Section**:
  - Avatar upload placeholder
  - Bio text area
  - Social links
- **Live Preview** of portfolio

**Current State:** UI-only, no image upload functionality, no data persistence

**Status:** ⚠️ UI skeleton complete, no functionality or persistence

---

### Public Portfolio Pages

**Location:** `src/app/(main)/portfolio/[username]/page.tsx`

**Implemented:**
- **SSG-Enabled** public pages (`generateStaticParams`)
- **Hero Section** with avatar, name, bio, social links
- **Project Grid** displaying portfolio projects
- **Responsive Layout** for mobile/desktop

**Current Data:** 1 hardcoded user/portfolio

**Status:** ⚠️ UI complete, data hardcoded, SSG configured

---

### Dashboard

**Location:** `src/app/(main)/dashboard/page.tsx`

**Implemented:**
- **Async Server Component** — fetches real data from Supabase on each request
- **Stats Cards** (fetched via `getDashboardStats()`):
  - Applications Sent — count from `job_applications` table
  - Modules Completed — count from `user_learning_progress` where `completed_at IS NOT NULL`
  - Profile Views — placeholder (TODO: track in separate table)
  - CV Downloads — placeholder (TODO: track when CV builder is implemented)
- **Recent Activity Feed** (fetched via `getRecentActivity()`) — reads from `activity_log` table, displays with status icons and relative timestamps
- **Quick Action Links** — static links to /jobs, /learning, /cv-builder, /portfolio
- **Empty state** — shows message when no activity exists
- **Skeleton loading fallback** — renders while data is being fetched

**Data Source:** Supabase (`job_applications`, `user_learning_progress`, `activity_log`)

**Status:** ✅ Complete (real data integration, seed data in migration)

---

### Settings Page

**Location:** `src/app/(main)/dashboard/settings/page.tsx` (Server Component) + `settings-client.tsx` (Client Component)

**Implemented:**
- **Server Component** fetches user profile + settings from Supabase, passes as props to Client Component
- **Tabbed Interface** with 4 sections:
  1. **Profile** — full_name, email (read-only), location, role, bio → saves to `user_profiles` + `user_settings` via `saveProfileSettings()` server action with Zod validation
  2. **Notifications** — 4 toggle switches (email_notifications, job_alerts, learning_reminders, marketing_emails) → saves to `user_settings` via `saveNotificationPreferences()`
  3. **Appearance** — Light/Dark/System theme selector with selection indicator → client-side only (localStorage + `document.documentElement.classList`)
  4. **Security** — password change form (current + new + confirm) → validates with Zod, re-authenticates via Supabase, then calls `updateUser()`
- **Loading states** — buttons show spinner during save
- **Toast feedback** — success/error notifications via sonner
- **Form defaults** — populated from `user_profiles` and `user_settings` tables

**Data Source:** Supabase (`user_profiles`, `user_settings`, Supabase Auth)

**Status:** ✅ Complete (real data + save functionality)

---

### Applications Tracker

**Location:** `src/app/(main)/dashboard/applications/page.tsx`

**Implemented:**
- **Async Server Component** — fetches real applications from Supabase via `getApplications()`
- **Summary Cards** computed from real data — counts by status (applied, pending, viewed, interview, offered, rejected, withdrawn)
- **Tabular List** of job applications with:
  - Job title and company (joined from `jobs` table)
  - Applied date (relative time via `timeAgo()` helper)
  - Status indicator (color-coded badges with icons)
  - View Details button (placeholder for future detail view)
- **Empty state** — shows "No applications yet" message with "Browse Jobs" CTA button
- **Status Config** — supports 7 statuses: applied, pending, viewed, interview, offered, rejected, withdrawn

**Data Source:** Supabase (`job_applications` joined with `jobs`)

**Status:** ✅ Complete (real data integration)

---

### Admin Panel

**Location:** `src/app/admin/`, `src/lib/admin/`, `src/components/admin/`

**Implemented:**
- **Admin Routes**:
  - `/admin/jobs` — Jobs management page with dual tabs:
    - "Menunggu Persetujuan" — Pending jobs with AdminApprovalTable
    - "Semua Lowongan" — All jobs with DataTable (Supabase-integrated)
  - `/admin/learning/new` — Create new learning module form with server action
  - `/admin/layout.tsx` — Admin layout with sidebar navigation
- **Admin Authentication & Authorization**:
  - `requireAdmin()` server-side guard in `src/lib/admin/require-admin.ts`
  - Checks authenticated user → queries `user_profiles.role` → redirects to `/dashboard` if not admin
  - Admin layout calls `requireAdmin()` in `AdminShell` (async Server Component wrapped in `Suspense`)
  - `AdminUser` interface: `id`, `email`, `role`, `full_name`, `avatar_url`
- **Admin Layout**:
  - Desktop sidebar with nav items (Jobs, Learning, Settings)
  - Mobile-responsive sheet-based sidebar (`MobileAdminHeader`)
  - Admin user info display (name/email + "Administrator" label)
  - `SignOutButton` component
  - Loading skeleton fallback
- **Admin Components**:
  - `AdminSidebar` — Desktop sidebar navigation with icon links
  - `MobileAdminHeader` — Mobile header with sheet menu
  - `SignOutButton` — Client component calling `logoutAction`
  - `DataTable` — Generic paginated/sortable table using `@tanstack/react-table`
  - `JobActions` — Approve/Reject buttons for pending job listings (client-side toast)
  - `StatusBadge` — Visual badge for job status (pending/approved/rejected) with icons
  - `job-columns.tsx` — Column definitions for jobs data table
  - `AdminApprovalTable` (from `src/components/jobs/`) — Pending jobs with approve/reject actions and reason dialog
- **Admin Data Layer**:
  - `mock-data.ts` — Mock job entries (8 entries) with TypeScript types (`Job`, `JobStatus`, `JobType`)
  - `getSupabaseServiceClient()` — Service-role Supabase client for admin-only operations (bypasses RLS)
  - `saveLearningModule()` — Server action validating form data with zod, inserts into `learning_modules` table
  - `deleteLearningModule(id)` — Server action for deleting learning modules
  - Job Board Actions (`src/lib/jobs/actions.ts`):
    - `getPendingJobs()` — Fetch pending jobs for admin approval
    - `getAllJobs()` — Fetch all jobs for admin
    - `approveJob(jobId)` — Approve pending job
    - `rejectJob(jobId, reason)` — Reject pending job with reason
    - `deleteJob(jobId)` — Delete any job
    - `republishJob(jobId)` — Republish expired job

**Notable Gaps:**
- `/admin/learning` — sidebar link exists but no index page
- `/admin/settings` — sidebar link exists but no page
- `/admin` not in middleware `PROTECTED_PATHS` (protection enforced at layout level via `requireAdmin()`)
- No admin-specific API routes yet

**Status:** ⚠️ Partially implemented (jobs page with Supabase integration + approval workflow complete, learning form done, index pages missing)

---

### Client Role System

**Location:** `src/app/(main)/profile/`, `src/app/(main)/dashboard/jobs/`, `src/app/(main)/jobs/post/`

**Implemented:**
- **Database Migration** (009_add_client_role.sql):
  - Added `'client'` role to `user_profiles` CHECK constraint: `CHECK (role IN ('user', 'admin', 'client'))`
  - Added RLS policy: "Clients can view all profiles" for networking context
  - Updated `handle_new_user()` trigger to support role from user metadata
  - Column comment explaining role purposes

- **Role Definitions:**
  - **`user`** — Standard job seeker (blue badge)
  - **`admin`** — Full administrative access (red badge)
  - **`client`** — Employer/job poster (green badge)

- **Profile Page** (`/profile`):
  - Dedicated profile page with role-aware UI
  - Different stats display based on role:
    - Job seekers: Applications Sent, Modules Completed, Profile Views, CV Downloads
    - Clients: Jobs Posted, Active Listings, Total Applicants, Jobs Filled
  - Different quick actions based on role:
    - Job seekers: Applications, Portfolio, CV Builder
    - Clients: Post New Job, Manage Jobs, Applicants
  - Edit Profile modal with form validation
  - Activity feed showing recent actions
  - Bio section display

- **Dashboard Jobs** (`/dashboard/jobs`):
  - Job management page for clients and admins
  - Stats summary: Total, Pending, Published, Drafts
  - Job list with status badges (draft, pending, published, rejected, expired)
  - Indonesian labels: "Menunggu Persetujuan", "Diterbitkan", etc.
  - Action buttons: View, Edit (drafts only)
  - Empty state with CTA
  - Rejected jobs notice banner

- **Job Posting Form** (`/jobs/post`):
  - Uses existing `PostJobForm` component
  - Approval workflow: Client submits → pending → admin approves
  - Admin posts → published immediately
  - Info banner explaining approval process (clients only)
  - Tips section for creating quality postings
  - Back navigation adapts to role

- **Navigation Updates:**
  - Desktop: Added "Job Postings" link for clients in dashboard header
  - Mobile: Added "Job Postings" link in mobile menu
  - Navigation order: Overview → Job Postings (clients) → Applications → Settings → Admin (admins)

**Workflow:**
1. Client logs in → sees green "Client" badge
2. Access `/profile` → sees employer stats and actions
3. Click "Post New Job" → fills out form → job goes to "Pending" status
4. Admin reviews at `/admin/jobs` → approves/rejects
5. Client views all postings at `/dashboard/jobs`

**Access Control:**
- `/dashboard/jobs` — Requires auth, only `client` and `admin` roles
- `/jobs/post` — Requires auth, only `client` and `admin` roles
- `/profile` — Requires auth (all authenticated users)

**Status:** ✅ Complete (core client functionality implemented)

---

### Profile Page

**Location:** `src/app/(main)/profile/`

**Files:**
- `page.tsx` — Server component fetching user data, settings, stats, activity, and role
- `profile-client.tsx` — Client component with role-aware UI (601 lines)

**Features:**

#### Common Elements (All Roles)
- Cover photo with gradient (`from-primary/20 via-primary/10 to-background`)
- Large avatar (size-28/32) with online status indicator (green dot)
- Profile header showing name, role, location, email with icons
- Edit Profile modal with form validation (Zod schemas)
- Activity feed showing recent actions (clock icons, status indicators)
- Bio section display (whitespace-pre-wrap)
- Two tabs: Overview and Activity

#### Role-Specific Stats

**Job Seekers (User Role):**
| Metric | Icon | Color | Source |
|--------|------|-------|--------|
| Applications Sent | Send | Blue (#2563eb) | job_applications table |
| Modules Completed | BookOpen | Green (#10b981) | user_learning_progress table |
| Profile Views | Eye | Purple (#8b5cf6) | TODO: Track in DB |
| CV Downloads | Download | Orange (#f97316) | TODO: Track in DB |

**Clients (Client Role):**
| Metric | Icon | Color | Source |
|--------|------|-------|--------|
| Jobs Posted | FileText | Blue (#2563eb) | TODO: Connect to DB |
| Active Listings | TrendingUp | Green (#10b981) | TODO: Connect to DB |
| Total Applicants | Users | Purple (#8b5cf6) | TODO: Connect to DB |
| Jobs Filled | CheckSquare | Orange (#f97316) | TODO: Connect to DB |

#### Quick Actions

**For Job Seekers:**
- Applications → `/dashboard/applications`
- Portfolio → `/portfolio`
- CV Builder → `/cv-builder`

**For Clients:**
- Post New Job → `/jobs/post`
- Manage Jobs → `/dashboard/jobs`
- Applicants → `/dashboard/applications`

#### Edit Profile Modal
- Full Name (required, min 2 chars, max 100)
- Location (optional, max 200 chars)
- Role/Job Title (optional, max 100 chars)
- Bio (optional, max 1000 chars, textarea 3 rows)
- Save button with loading state (Loader2 spinner)
- Toast notifications for success/error (sonner)
- Form validation with Zod schemas

**Data Sources:**
- `getUserProfile()` — Fetches from `user_profiles` table
- `getUserSettings()` — Fetches from `user_settings` table
- `getDashboardStats()` — Fetches dashboard metrics
- `getRecentActivity(5)` — Fetches last 5 activities
- `getUserRole()` — Fetches user role from database
- `saveProfileSettings()` — Updates both `user_profiles` and `user_settings`

**Status:** ✅ Complete (role-aware UI with edit functionality)

---

### Language Switcher (Dashboard)

**Version:** v0.4.0
**Date:** April 9, 2026

**Overview:**
Implemented full EN/ID language switching across all dashboard pages. Users can now toggle between English and Bahasa Indonesia, and all UI text updates immediately.

**Location:** `src/lib/translations.tsx`, `src/app/(main)/dashboard/`

**Files Modified:**
- `src/lib/translations.tsx` — Added comprehensive dashboard translation keys (889 lines total)
- `src/app/(main)/dashboard/page.tsx` — Split into server + client components
- `src/app/(main)/dashboard/dashboard-client.tsx` — **NEW** Client component with translations
- `src/app/(main)/dashboard/layout.tsx` — Added `TranslationProvider` wrapper
- `src/app/(main)/dashboard/applications/page.tsx` — Simplified to server component
- `src/app/(main)/dashboard/applications/applications-client.tsx` — **NEW** Client component with translations
- `src/app/(main)/dashboard/settings/settings-client.tsx` — Updated all tabs to use translations
- `src/components/dashboard/header.tsx` — Already using translations (no changes needed)

**Translation Coverage:**

#### Dashboard Overview (`/dashboard`)
- ✅ Page title: "Dashboard" → "Dasbor"
- ✅ Stat labels: Applications, Modules Completed, Profile Views, CV Downloads
- ✅ Section headers: Recent Activity, Quick Actions
- ⚠️ Partial: Quick action descriptions (8 strings still hardcoded)
- ⚠️ Partial: "Track your progress..." subtitle
- ⚠️ Partial: "No activity yet..." empty state message

#### Dashboard Applications (`/dashboard/applications`)
- ✅ Page title: "Applications" → "Lamaran"
- ✅ Status badges: Pending → Menunggu, Rejected → Ditolak
- ⚠️ Partial: Other statuses (Viewed, Interview, Offered, Withdrawn) still hardcoded
- ⚠️ Partial: Table headers (Position, Status, Applied, Action)
- ⚠️ Partial: Empty state and "View Details" buttons

#### Dashboard Settings (`/dashboard/settings`)
- ✅ **FULLY TRANSLATED** — All 4 tabs complete
- ✅ Tab labels: Profile → Profil, Notifications → Notifikasi, Appearance → Tampilan, Security → Keamanan
- ✅ Profile tab: All form labels, placeholders, buttons
- ✅ Notifications tab: All preference labels and descriptions
- ✅ Appearance tab: Light → Terang, Dark → Gelap, System → Sistem
- ✅ Security tab: Password form labels and buttons
- ✅ Toast notifications: "Profile saved" → "Profil berhasil disimpan"
- ⚠️ Minor: Mobile tab abbreviation fallback still hardcoded

**Translation System Architecture:**

```typescript
// Translation Provider (React Context)
<TranslationProvider>
  {children}
</TranslationProvider>

// Usage in Client Components
const { t, language, setLanguage } = useTranslations();
t.dashboard.settings.title  // "Settings" or "Pengaturan"
language  // "en" or "id"
setLanguage("id")  // Switch language
```

**Key Design Decisions:**
1. **Server + Client Split**: Dashboard pages use Server Components for data fetching, pass data to Client Components that use `useTranslations()` hook
2. **localStorage Persistence**: Language preference saved to `remonest-language` key
3. **Default Language**: Indonesian (id)
4. **Context-based**: No page reloads needed, instant language switching
5. **Type-safe**: Full TypeScript type definitions for all translation keys

**Files Structure:**
```
dashboard/
├── page.tsx                          # Server: fetches stats + activity
├── dashboard-client.tsx              # Client: renders with translations
├── layout.tsx                        # TranslationProvider wrapper
├── applications/
│   ├── page.tsx                      # Server: fetches applications
│   └── applications-client.tsx       # Client: renders with translations
└── settings/
    ├── page.tsx                      # Server: fetches profile + settings
    └── settings-client.tsx           # Client: all 4 tabs translated
```

**Status:** ✅ Complete (core functionality), ⚠️ Minor hardcoded strings remain

---

### Dashboard Integration

**Location:** `src/lib/dashboard/actions.ts`, `src/app/(main)/dashboard/`

**Server Actions** (`src/lib/dashboard/actions.ts`):

| Action | Description | Returns |
|--------|-------------|---------|
| `getDashboardStats()` | Counts applications, completed modules, placeholder metrics | `DashboardStats` |
| `getRecentActivity(limit?)` | Fetches from `activity_log` ordered by `created_at DESC` | `ActivityEntry[]` |
| `getApplications()` | Joins `job_applications` with `jobs` for title/company | `ApplicationEntry[]` |
| `getUserSettings()` | Fetches from `user_settings` | `UserSettings \| null` |
| `getUserProfile()` | Fetches from `user_profiles` | `{ fullName, avatarUrl, email } \| null` |
| `saveProfileSettings(formData)` | Updates `user_profiles` + upserts `user_settings` with Zod validation | `{ success, error? }` |
| `saveNotificationPreferences(formData)` | Upserts notification toggles to `user_settings` | `{ success, error? }` |
| `updatePassword(formData)` | Re-authenticates, then updates via Supabase Auth | `{ success, error? }` |
| `applyToJob(jobId, coverLetter?)` | Inserts into `job_applications` + logs activity | `{ success, error? }` |

**Database Tables Used:**
- `jobs` — job listings (6 seed entries in migration)
- `job_applications` — user's applications with status tracking
- `learning_modules` — learning content (3 seed entries in migration)
- `user_learning_progress` — module completion tracking
- `user_settings` — extended profile + notification preferences
- `activity_log` — chronological activity feed

**Architecture Pattern:**
- Dashboard/Applications pages → **Async Server Components** that call server actions directly
- Settings page → **Server Component** fetches data → passes to **Client Component** for interactive forms
- All server actions use `requireAuth()` guard to ensure authenticated user
- RLS policies ensure users can only read/write their own data

**Status:** ✅ Complete (real Supabase integration with seed data)

---

## Database Schema

### Migration 001: `user_profiles`

**Location:** `supabase/migrations/001_create_user_profiles.sql`

### Table: `user_profiles`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key, references `auth.users(id)` ON DELETE CASCADE |
| `full_name` | TEXT | Nullable |
| `avatar_url` | TEXT | Nullable |
| `role` | TEXT | NOT NULL, DEFAULT 'user', CHECK IN ('user', 'admin', 'client')¹ |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### Indexes
- `idx_user_profiles_role` on `role` column

### Row Level Security (RLS) Policies

1. **Users can SELECT their own profile**
   ```sql
   CREATE POLICY "Users can view own profile"
     ON user_profiles FOR SELECT
     USING (auth.uid() = id);
   ```

2. **Users can UPDATE their own profile** (but cannot change their own role)
   ```sql
   CREATE POLICY "Users can update own profile"
     ON user_profiles FOR UPDATE
     USING (auth.uid() = id)
     WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));
   ```

3. **Admins can SELECT all profiles**
   ```sql
   CREATE POLICY "Admins can view all profiles"
     ON user_profiles FOR SELECT
     USING (EXISTS (
       SELECT 1 FROM user_profiles
       WHERE id = auth.uid() AND role = 'admin'
     ));
   ```

4. **Service role can INSERT** (for auto-create trigger)
   ```sql
   CREATE POLICY "Service role can insert"
     ON user_profiles FOR INSERT
     WITH CHECK (true);
   ```

### Trigger: `on_auth_user_created`

Automatically creates a `user_profiles` row when a new user signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Note:** TypeScript types for Supabase are currently `any` everywhere (no generated Database types from schema).

---

### Migration 002: Dashboard Tables

**Location:** `supabase/migrations/002_create_dashboard_tables.sql`

#### Table: `jobs`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key, `gen_random_uuid()` |
| `title` | TEXT | NOT NULL |
| `company` | TEXT | NOT NULL |
| `location` | TEXT | DEFAULT 'Remote' |
| `type` | TEXT | CHECK IN ('full-time', 'part-time', 'contract', 'freelance', 'internship') |
| `salary_range` | TEXT | Nullable |
| `description` | TEXT | Nullable |
| `requirements` | TEXT | Nullable |
| `benefits` | TEXT | Nullable |
| `status` | TEXT | DEFAULT 'active', CHECK IN ('active', 'closed', 'draft') |
| `apply_url` | TEXT | Nullable |
| `posted_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**RLS:** Anyone can SELECT active jobs; admins can manage all jobs.

#### Table: `job_applications`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE |
| `job_id` | UUID | FK → `jobs(id)` ON DELETE CASCADE |
| `status` | TEXT | DEFAULT 'applied', CHECK IN ('applied', 'pending', 'viewed', 'interview', 'offered', 'rejected', 'withdrawn') |
| `cover_letter` | TEXT | Nullable |
| `resume_url` | TEXT | Nullable |
| `notes` | TEXT | Nullable |
| `applied_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**RLS:** Users SELECT/INSERT/UPDATE own; admins SELECT all.

#### Table: `learning_modules`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `slug` | TEXT | UNIQUE, NOT NULL |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | Nullable |
| `category` | TEXT | CHECK IN ('communication', 'mindset', 'career', 'design', 'productivity') |
| `content` | TEXT | Nullable |
| `thumbnail_url` | TEXT | Nullable |
| `duration_min` | INT | DEFAULT 0 |
| `status` | TEXT | DEFAULT 'draft', CHECK IN ('draft', 'published', 'archived') |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**RLS:** Anyone can SELECT published; admins can manage all.

#### Table: `user_learning_progress`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE |
| `module_id` | UUID | FK → `learning_modules(id)` ON DELETE CASCADE |
| `progress` | INT | DEFAULT 0, CHECK 0–100 |
| `completed_at` | TIMESTAMPTZ | Nullable |
| `started_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | (user_id, module_id) | |

**RLS:** Users SELECT/INSERT/UPDATE own; admins SELECT all.

#### Table: `user_settings`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | UNIQUE, FK → `auth.users(id)` ON DELETE CASCADE |
| `location` | TEXT | Nullable |
| `role` | TEXT | Nullable |
| `bio` | TEXT | Nullable |
| `email_notifications` | BOOLEAN | DEFAULT true |
| `job_alerts` | BOOLEAN | DEFAULT true |
| `learning_reminders` | BOOLEAN | DEFAULT false |
| `marketing_emails` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**RLS:** Users SELECT/UPDATE own; service role INSERT; admins SELECT all.

#### Table: `activity_log`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE |
| `action_type` | TEXT | CHECK IN ('job_applied', 'module_started', 'module_completed', 'profile_updated', 'cv_updated', 'portfolio_updated') |
| `title` | TEXT | NOT NULL |
| `metadata` | JSONB | DEFAULT '{}' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**RLS:** Users SELECT own; service role INSERT; admins SELECT all.

#### Triggers

- **`on_auth_user_settings_created`** — auto-creates `user_settings` row on signup
- **`handle_new_user_settings()`** — inserts into `user_settings` with `ON CONFLICT DO NOTHING`

#### Helper Function

- **`log_user_activity(user_id, action_type, title, metadata)`** — inserts into `activity_log` and returns activity ID

#### Seed Data

- 6 sample jobs (RemoteFirst Inc., DesignLab, CloudNative Co., GrowthHQ, InfraStack, DocuTech)
- 3 learning modules (Async Communication Basics, Remote Work Mindset, Career Growth in Remote Teams)

---

### Migration 003: `jobs` table with dual posting workflow

**Location:** `supabase/migrations/003_create_jobs_table.sql`

#### Enums

```sql
CREATE TYPE job_type_enum AS ENUM ('full-time', 'part-time', 'project', 'freelance');
CREATE TYPE job_status_enum AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published', 'expired');
CREATE TYPE apply_method_enum AS ENUM ('url', 'email');
```

#### Table: `jobs`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | Primary Key, `gen_random_uuid()` |
| `title` | TEXT | NOT NULL |
| `company` | TEXT | NOT NULL |
| `description_html` | TEXT | NOT NULL |
| `job_type` | job_type_enum | NOT NULL |
| `salary_min` | INTEGER | Nullable |
| `salary_max` | INTEGER | Nullable |
| `salary_currency` | TEXT | DEFAULT 'IDR' |
| `location` | TEXT | NOT NULL, DEFAULT 'Remote' |
| `apply_method` | apply_method_enum | NOT NULL, DEFAULT 'url' |
| `apply_url` | TEXT | Nullable |
| `apply_email` | TEXT | Nullable |
| `deadline` | DATE | Nullable |
| `duration_estimate` | TEXT | Nullable |
| `status` | job_status_enum | NOT NULL, DEFAULT 'draft' |
| `is_verified_by_admin` | BOOLEAN | DEFAULT false |
| `rejection_reason` | TEXT | Nullable |
| `posted_by_user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `published_at` | TIMESTAMPTZ | Nullable |

**Constraints:**
- `salary_min_positive` — salary_min >= 0
- `salary_max_positive` — salary_max >= 0
- `salary_range_valid` — salary_max >= salary_min
- `apply_url_present` — apply_url required when apply_method='url'
- `apply_email_present` — apply_email required when apply_method='email'
- `deadline_future` — deadline >= CURRENT_DATE

#### Indexes

- `idx_jobs_status` on `status` column
- `idx_jobs_job_type` on `job_type` column
- `idx_jobs_deadline` on `deadline` column
- `idx_jobs_posted_by` on `posted_by_user_id` column
- `idx_jobs_published_at` on `published_at` column
- `idx_jobs_company` on `company` column
- `idx_jobs_status_type` on `(status, job_type)` — composite index for queries

#### Triggers

- **`update_jobs_updated_at()`** — auto-updates `updated_at` on row updates
- **`expire_old_jobs()`** — function to mark expired jobs as status='expired' (to be called via cron)

#### RLS Policies

1. **Public can read published jobs**
   ```sql
   CREATE POLICY "Public can read published jobs"
     ON jobs FOR SELECT
     USING (status = 'published');
   ```

2. **Users can read own jobs**
   ```sql
   CREATE POLICY "Users can read own jobs"
     ON jobs FOR SELECT
     USING (auth.uid() = posted_by_user_id);
   ```

3. **Users can create jobs**
   ```sql
   CREATE POLICY "Users can create jobs"
     ON jobs FOR INSERT
     WITH CHECK (auth.uid() = posted_by_user_id);
   ```

4. **Users can update own jobs** (draft or pending only)
   ```sql
   CREATE POLICY "Users can update own jobs"
     ON jobs FOR UPDATE
     USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'))
     WITH CHECK (auth.uid() = posted_by_user_id);
   ```

5. **Users can delete own jobs** (draft or pending only)
   ```sql
   CREATE POLICY "Users can delete own jobs"
     ON jobs FOR DELETE
     USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'));
   ```

6. **Admins can read all jobs**
   ```sql
   CREATE POLICY "Admins can read all jobs"
     ON jobs FOR SELECT
     USING (EXISTS (
       SELECT 1 FROM user_profiles
       WHERE id = auth.uid() AND role = 'admin'
     ));
   ```

7. **Admins can update any job**
   ```sql
   CREATE POLICY "Admins can update any job"
     ON jobs FOR UPDATE
     USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
     WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
   ```

8. **Admins can delete any job**
   ```sql
   CREATE POLICY "Admins can delete any job"
     ON jobs FOR DELETE
     USING (EXISTS (
       SELECT 1 FROM user_profiles
       WHERE id = auth.uid() AND role = 'admin'
     ));
   ```

#### Seed Data

- 4 sample jobs (1 published full-time, 1 pending part-time, 1 published freelance, 1 published project)

#### Posting Workflow

**Admin Flow:**
- Admin submits → status='published' immediately
- is_verified_by_admin=true
- published_at set to NOW()

**Client Flow:**
- Client submits → status='pending'
- is_verified_by_admin=false
- Admin reviews → approves (status='published', is_verified_by_admin=true) or rejects (status='rejected', rejection_reason set)

---

### Migration 009: `add_client_role`

**Location:** `supabase/migrations/009_add_client_role.sql`

**Changes:**
1. Dropped existing CHECK constraint: `user_profiles_role_check`
2. Added new CHECK constraint with three roles: `CHECK (role IN ('user', 'admin', 'client'))`
3. Added RLS policy: "Clients can view all profiles"
4. Updated `handle_new_user()` trigger to support role from user metadata
5. Added column comment explaining role purposes

**Purpose:**
Resolves code/schema mismatch where TypeScript defined three roles but database only allowed two. Enables employer/job poster functionality with dedicated profile UI and job posting workflow.

**Rollback:**
```sql
ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('user', 'admin'));
DROP POLICY IF EXISTS "Clients can view all profiles" ON public.user_profiles;
```

---

### Migration 010: `make_is_verified_by_admin_nullable`

**Location:** `supabase/migrations/010_make_is_verified_by_admin_nullable.sql`

**Changes:**
1. Dropped `DEFAULT false` constraint on `is_verified_by_admin` column
2. Changed column to allow `NULL` values
3. Set existing pending jobs to `NULL` (not yet reviewed)
4. Added column comment explaining three-state logic

**Column States:**
| Value | Meaning |
|-------|---------|
| `true` | Admin verified (admin-posted or approved) |
| `null` | Not yet reviewed (client-posted, pending) |
| `false` | Rejected or explicitly unverified |

**Purpose:**
Enables role-based job posting workflow where admin posts are auto-verified but client posts require approval.

**Rollback:**
```sql
UPDATE public.jobs SET is_verified_by_admin = false WHERE is_verified_by_admin IS NULL;
ALTER TABLE public.jobs ALTER COLUMN is_verified_by_admin SET DEFAULT false;
ALTER TABLE public.jobs ALTER COLUMN is_verified_by_admin SET NOT NULL;
```

---

## API Routes

### 1. `/api/ai/review` (POST)

**Status:** ⚠️ Placeholder

**Accepts:**
```json
{
  "cvText": "string",
  "jobDescription": "string (optional)"
}
```

**Returns:** Mock review with score, strengths, and improvements

**TODO:** Integrate OpenAI/Anthropic API for actual AI review

---

### 2. `/api/jobs/sync` (GET)

**Status:** ⚠️ Placeholder

**Trigger:** Cron job (expects `x-cron-secret` header)

**Returns:** Mock response with 1 job

**TODO:** Fetch from external job board APIs and persist to Supabase

---

### 3. `/api/upload` (POST)

**Status:** ⚠️ Partial Implementation

**Validation:**
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, PDF

**TODO:** Supabase Storage upload code is commented out

---

### 4. `/api/webhooks/stripe` (POST)

**Status:** ⚠️ Placeholder

**Implemented:**
- Receives Stripe signature header
- Validates header is present

**TODO:** Webhook event handling code is commented out

---

### 5. `/auth/callback` (GET)

**Status:** ✅ Complete

**Functionality:**
- Exchanges OAuth code for session
- Redirects to `/dashboard` or `next` query param

---

## Authentication Flow

### Login Flow

1. User visits `/login`
2. Enters email/password or clicks "Continue with Google"
3. **Email/Password:**
   - Form validates with Zod schema
   - `loginAction` server action calls Supabase `signInWithPassword`
   - **Email confirmation check:** If `email_confirmed_at` is null or error contains "Email not confirmed":
     - Returns `{ success: false, error: "...", redirect: "/login?unconfirmed=<email>" }`
     - Login page shows yellow warning banner with resend confirmation button
   - On success: Supabase sets session cookie
   - Reads `redirect_after_login` cookie, deletes it, redirects to target
4. **Google OAuth:**
   - `googleSignInAction` redirects to Google via Supabase
   - User authorizes in Google popup/window
   - Supabase redirects to `/auth/callback`
   - Callback exchanges code for session
   - Redirects to `redirect_after_login` cookie value or `/dashboard`
5. **Client-side redirect handling:** `useEffect` in login page listens to `state.success` + `state.redirect` and calls `router.push()` (fixes `redirect()` not working inside `useActionState`)

### Registration Flow

1. User visits `/register`
2. Fills name, email, password, confirm password
3. Password strength meter validates in real-time (4-segment bar + checklist)
4. Show/hide password toggle on both password fields
5. On submit, Zod validates:
   - Email format
   - Password: min 8 chars, uppercase, lowercase, number
   - Confirm password matches
   - Name: 2-100 characters
6. `registerAction` calls Supabase `signUp` with:
   - Email, password
   - `full_name` in user metadata
7. Supabase sends confirmation email
8. If no session returned (email confirmation required):
   - Returns `{ success: true, redirect: "/login?confirmed=false" }`
   - Login page shows info toast about email confirmation
9. If session returned immediately:
   - Client-side redirect to `/dashboard`
10. `on_auth_user_created` trigger creates `user_profiles` row

### Resend Confirmation Flow

1. User attempts login with unconfirmed email
2. Login page redirects to `/login?unconfirmed=<email>` with yellow warning banner
3. User clicks "Resend confirmation email" button
4. `resendConfirmationAction` calls `supabase.auth.resend({ type: "signup", email })`
5. Toast notification confirms email sent

### Protected Route Access

1. User attempts to access `/dashboard` (or other protected route)
2. **Middleware** runs on every request:
   - Calls `updateSession()` to refresh Supabase session
   - Checks if user has valid session
   - If no session: redirects to `/login?redirect=/dashboard`
   - Stores original target in `redirect_after_login` cookie
3. After login, client-side redirect to stored target

### Logout Flow

1. User clicks logout button
2. `logoutAction` calls Supabase `signOut`
3. Session cleared
4. User redirected to `/login`

---

## Middleware & Route Protection

**Location:** `src/middleware.ts`

### Functionality

1. **Session Refresh:** Calls `updateSession()` on every request to refresh Supabase JWT
2. **Route Protection:** Guards the following paths:
   - `/dashboard` and all sub-routes
   - `/settings` and all sub-routes
   - `/profile` and all sub-routes
3. **Redirect Logic:**
   - Unauthenticated → `/login` with `redirect` query param
   - Sets `redirect_after_login` cookie for post-login redirect
   - Authenticated users on `/login` or `/register` → `/dashboard`
4. **Skipped Routes:**
   - Static assets (`/_next/static`, `/favicon.ico`, etc.)
   - API webhook endpoints (`/api/webhooks/*`)
   - Auth callback (`/auth/callback`)

### Implementation

```typescript
// Protected route check
const isProtectedRoute = pathname.match(/^\/dashboard/) ||
                         pathname.match(/^\/settings/) ||
                         pathname.match(/^\/profile/);

// Redirect authenticated users away from auth pages
const isAuthPage = pathname === '/login' || pathname === '/register';
```

---

## UI Components

### shadcn/ui Primitives (`src/components/ui/`)

#### Button
- **Variants:** default, outline, secondary, ghost, destructive, link
- **Sizes:** xs, sm, default, lg, icon
- **Built with:** CVA (Class Variance Authority)
- **Features:** Slot composition, disabled state, loading spinner support

#### Card
- **Sub-components:** Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Features:** composable layout, consistent spacing

#### Input
- **Features:** Styled border, focus ring, CVA variant support

---

### Landing Components (`src/components/landing/`)

#### Header
- Sticky on scroll (after 100px)
- Responsive with hamburger menu
- Mobile overlay menu with outside-click dismissal
- Logo, navigation links, theme toggle, auth buttons

#### HeroSection
- Two-column layout (text + carousel)
- Stats chips (users, jobs, completion rate)
- Auto-advancing CSS carousel (4 slides, 3.5s interval)
- Dot indicators and prev/next buttons

#### FeaturesSection
- 3-column responsive grid
- Feature cards with icons, titles, descriptions, preview images

#### StepsSection
- 3-step "how it works" guide
- Numbered steps in bordered container
- Icons and descriptions

#### TestimonialsSection
- Asymmetric grid (1.2fr / 0.8fr)
- 1 main testimonial + 2 secondary
- User avatars, names, roles, quotes

#### CTASection
- Inverted colors (foreground background, background text)
- Headline, description, primary/secondary buttons

#### Footer
- 4-column grid: brand, platform, company, legal
- Social icons (X, LinkedIn, Instagram)
- Copyright notice

#### ThemeToggle
- Animated toggle switch (light/dark)
- Sun/moon icons with transition animations

#### ThemeInit
- Client-side theme initialization (prevents flash)
- Reads `remonest-theme` from localStorage
- Applies class to `document.documentElement` before hydration

---

## Styling & Theming

### Tailwind CSS v4

- **CSS-first configuration** (no `tailwind.config.js`)
- **oklch color tokens** for modern color space
- **Custom design tokens** defined in `globals.css`

### Dark Mode

- **Class-based:** `document.documentElement.classList.add('dark')`
- **Persisted to localStorage** as `remonest-theme`
- **Theme values:** `light`, `dark`, `system`
- **ThemeInit component** runs before hydration to prevent flash

### Color Tokens

Defined in `globals.css` using CSS custom properties:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

---

## SEO & Analytics

### Sitemap

**Location:** `src/app/sitemap.ts`

Generates static sitemap with:
- Landing page
- Learning modules
- Job board
- Dashboard pages

### JSON-LD Structured Data

Embedded in landing page:
- **Organization** schema
- **WebSite** schema with SearchAction
- **SiteNavigationElement** schema

### Analytics

- **@vercel/analytics** - Page views and user tracking
- **@vercel/speed-insights** - Core Web Vitals monitoring

---

## TODOs & Pending Features

### High Priority

1. **CV Builder**
   - Implement form state management
   - Add data persistence to Supabase
   - Implement PDF export with @react-pdf/renderer
   - Connect AI review API

2. **Portfolio Builder**
   - Implement image upload (Supabase Storage)
   - Add data persistence to Supabase
   - Enable live preview updates

3. **API Routes**
   - **AI Review:** Integrate OpenAI/Anthropic API
   - **Job Sync:** Connect to external job APIs
   - **File Upload:** Uncomment Supabase Storage code
   - **Stripe Webhook:** Implement event handling

4. **Dynamic Routes**
   - Populate `/learning/[slug]` with multiple modules from DB
   - Populate `/jobs/[id]` with multiple jobs from DB
   - Populate `/portfolio/[username]` with multiple users

5. **Profile Views & CV Downloads Tracking**
   - Create tracking table for profile views
   - Track CV downloads when CV builder is implemented

### Medium Priority

6. **Admin Panel**
    - Create `/admin/learning` index page
    - Create `/admin/settings` page
    - Add `/admin` to middleware `PROTECTED_PATHS`

7. **Applications Tracker**
   - Add application detail view
   - Enable status updates from admin
   - Add application notes/reminders

8. **Learning Modules**
   - Add progress tracking via `user_learning_progress` table
   - Implement module completion status
   - Connect `/learning/[slug]` to DB

9. **Job Board**
   - ✅ Connect `/jobs` to DB queries — server actions created in `src/lib/jobs/actions.ts`
   - ✅ Implement search/filter functionality — `getJobs(filters)` supports job_type, search, location
   - Create `/jobs` public job board page with Supabase integration
   - Create `/jobs/[id]` single job detail page
   - Create `/jobs/post` job posting form page (use `PostJobForm` component)
   - Create `/dashboard/jobs` user's job management page
   - Wire up "Apply" button functionality (currently opens URL/email)
   - Implement `applyToJob()` server action integration

### Lower Priority

13. **Error Boundaries**
    - Add React error boundaries for graceful error handling

14. **Loading States**
    - Add skeleton loaders for async data
    - Implement optimistic UI updates

15. **Testing**
    - Add unit tests for utilities
    - Add integration tests for API routes
    - Add E2E tests for critical user flows

---

## Current State Summary

| Feature | UI | Data | API | Status |
|---------|----|----|-----|--------|
| Landing Page | ✅ | ✅ (static) | N/A | ✅ Complete |
| Authentication | ✅ | ✅ (Supabase) | ✅ | ✅ Complete (with email confirmation flow) |
| Dashboard | ✅ | ✅ (Supabase) | ✅ Server actions | ✅ Complete (real data + activity feed) |
| Settings | ✅ | ✅ (Supabase) | ✅ Server actions | ✅ Complete (profile, notifications, password) |
| Applications | ✅ | ✅ (Supabase) | ✅ Server actions | ✅ Complete (real applications with join) |
| Admin Panel | ⚠️ | ✅ Supabase | ✅ Server actions | ⚠️ Partially complete (jobs + approval workflow + learning form done, index pages missing) |
| Learning Modules | ✅ | ⚠️ Hardcoded + DB seed | ❌ | ⚠️ UI complete, DB tables exist, not wired to pages |
| Job Board | ✅ | ✅ Supabase + seed | ✅ Server actions | ⚠️ UI components + server actions + admin workflow complete, public pages need Supabase integration |
| CV Builder | ✅ | ❌ None | ❌ | ⚠️ Skeleton |
| Portfolio Builder | ✅ | ❌ None | ❌ | ⚠️ Skeleton |
| Public Portfolio | ✅ | ⚠️ Hardcoded | ❌ | ⚠️ UI Only |
| AI Review | N/A | N/A | ⚠️ Stub | ❌ TODO |
| Job Sync | N/A | N/A | ⚠️ Stub | ❌ TODO |
| File Upload | N/A | N/A | ⚠️ Partial | ❌ TODO |
| Stripe | N/A | N/A | ⚠️ Stub | ❌ TODO |

**Legend:** ✅ Complete | ⚠️ Partial/Incomplete | ❌ Not Implemented

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

---

## Environment Variables

Required environment variables (not yet configured in `.env.local`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (for webhook handler)
STRIPE_WEBHOOK_SECRET=

# OAuth (if using Google Sign-In)
# Configured in Supabase dashboard
```

---

## Next Steps

1. **Run migrations on Supabase** — apply `002_create_dashboard_tables.sql` and `003_create_jobs_table.sql`
2. **Create Job Board Pages** — `/jobs`, `/jobs/[id]`, `/jobs/post`, `/dashboard/jobs` using `getJobs()` and `JobCard` components
3. **Wire up Learning Modules** — connect `/learning` and `/learning/[slug]` to DB
4. **Implement CV Builder** — form state, Supabase persistence, PDF export
5. **Implement Portfolio Builder** — image upload, persistence
6. **Generate TypeScript types** from Supabase schema (`supabase gen types`)
7. **Implement API integrations** (AI review, job sync, Stripe)
8. **Add `/admin/learning` and `/admin/settings` pages**
9. **Write tests** for critical paths
10. **Deploy to production** (Vercel recommended for Next.js)

---

*This documentation reflects the state of the codebase as of April 7, 2026. For architecture decisions and roadmap, see [PROJECT.md](./PROJECT.md).*
