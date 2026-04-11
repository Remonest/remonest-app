# Changelog

All notable changes to the Remonest App project.

**Format:** [Semantic Versioning](https://semver.org/)
**Date Format:** April 10, 2026

---

## [v1.3.2] - April 11, 2026 (Night)

### 🐛 Bug Fixes

#### Admin Learning CRUD Flow (5 Bugs Fixed)

- ✅ **Fix #1: Create form used wrong category values**
  - Was using display names (`"Remote Working Basics"`) instead of DB enum values (`communication`)
  - DB CHECK constraint rejected the insert — create always failed
  - Fixed: `schemas.ts` now uses DB enum values with `CATEGORY_LABELS` mapping for UI

- ✅ **Fix #2: Create form inserted non-existent DB columns**
  - Was inserting `level` and `passing_score` — columns don't exist in `learning_modules`
  - DB returned error: "column does not exist"
  - Fixed: `saveLearningModule()` now only inserts existing columns (`title`, `slug`, `category`, `description`)

- ✅ **Fix #3: Create vs Edit form category mismatch**
  - Create form used display names, Edit form used DB enum values — inconsistent
  - Fixed: Both forms now use DB enum values (`communication`, `mindset`, `career`, `design`, `productivity`)

- ✅ **Fix #4: Update redirect killed success toast**
  - `redirect('/admin/learning?success=updated')` unmounted component before toast could render
  - Fixed: `updateLearningModule()` now returns `{ success: true }` instead of redirect

- ✅ **Fix #5: Create form had no success feedback**
  - `useEffect` only handled error state, never showed success toast
  - Fixed: Added success toast + `router.push('/admin/learning')` navigation

### 📝 Code Changes

| File | Changes |
|------|---------|
| `src/lib/learning/schemas.ts` | Changed `LEARNING_CATEGORIES` to DB enum values, added `CATEGORY_LABELS`, removed `passingScore` |
| `src/lib/learning/actions.ts` | Fixed `saveLearningModule` (removed non-existent columns), fixed `updateLearningModule` (return instead of redirect) |
| `src/app/admin/learning/new/page.tsx` | Full rewrite — localized to Indonesian, fixed categories, added success toast |

---

## [v1.3.1] - April 11, 2026 (Evening)

### 🌱 Content Seeding

#### Indonesian Learning Materials
- ✅ **Replaced raw English scraped content with Indonesian educational materials**
  - Material 1: "Panduan Lengkap Bekerja dari Rumah untuk Pemula" (8,260 chars)
  - Material 2: "Panduan Memulai Karir Freelance untuk Pemula" (7,848 chars)
  - Both published, beginner level, Bahasa Indonesia
- ✅ **Seed scripts** — `scripts/seed-learning-materials-id.js` and `.sql`
- ✅ **Cleanup** — Deleted old raw Buffer.com English articles

#### Content Collector Improvements
- ✅ **Dual-mode scraping** — Cheerio first, Puppeteer fallback for JS-rendered sites
- ✅ **Puppeteer + Chromium** installed and configured
- ✅ **Utility scripts** — `check-materials.js`, `cleanup-materials.js`, `run-seed.js`

### 📚 Documentation

#### New Documentation
- ✅ **Seeding Guide** (`docs/guides/seed-learning-materials.md`)
  - 3 methods: JS script, SQL Editor, web scraping
  - Step-by-step instructions for each method
  - Content structure and database field reference
  - Verification and cleanup instructions

#### Updated Documentation
- ✅ **Main README** (`docs/README.md`) — Added seed-learning-materials link

---

## [v1.3.0] - April 11, 2026 (Afternoon)

### 🎉 New Features

#### Learning Materials & Resources

- ✅ **Database: Migration 014** (`014_add_learning_materials_and_resources.sql`)
  - `learning_materials` table — articles, videos, documentation, tutorials
    - Markdown content, summary, source URL, source type
    - Difficulty levels (beginner/intermediate/advanced)
    - Language support (ID/EN), reading time estimate
    - Tags (TEXT[] with GIN index for fast search)
    - Publish toggle for staged release
  - `learning_resources` table — tools, templates, ebooks, PDFs
    - Title, description, external URL
    - Resource type (tool/template/ebook/checklist/cheatsheet/pdf)
    - Free/paid toggle
  - 7 indexes for performance (including GIN for tags)
  - RLS policies: public read for published, admin manage all
  - Auto-update trigger for `updated_at`

- ✅ **Admin UI: `/admin/learning/[id]/materials`**
  - Stats dashboard (Total Materials, Published, Total Resources, Free)
  - Materials list with publish toggle, edit, delete actions
  - Resources list with delete and external link display
  - Material form: title, Markdown content, summary, source type/URL, difficulty, language, tags
  - Resource form: title, description, URL, type, free toggle
  - Empty states with helpful messaging
  - Files: `src/app/admin/learning/[id]/materials/page.tsx` (server)
  - Files: `material-list-client.tsx`, `material-form.tsx`, `resource-form.tsx` (client)

- ✅ **Server Actions**
  - `getMaterialsByModuleId()`, `getMaterialById()` — fetch materials
  - `createLearningMaterial()`, `updateLearningMaterial()`, `deleteLearningMaterial()` — material CRUD
  - `getResourcesByModuleId()`, `getResourceById()` — fetch resources
  - `createLearningResource()`, `updateLearningResource()`, `deleteLearningResource()` — resource CRUD
  - Zod validation with Indonesian error messages
  - Path revalidation after mutations
  - Files: `src/features/learning-module/actions/materials.ts`

- ✅ **TypeScript Types**
  - `LearningMaterial`, `LearningResource` interfaces
  - `LearningMaterialInput`, `LearningResourceInput` input types
  - `SourceType`, `ResourceFileType`, `MaterialDifficulty` enums
  - Files: `src/features/learning-module/types/materials.ts`

- ✅ **Navigation Update**
  - Added "Kelola Materi" link to learning module action dropdown
  - Added "Kelola Kuis" link to learning module action dropdown
  - Files: `src/components/admin/learning-actions.tsx`

### 📚 Documentation

#### New Documentation
- ✅ **Materials & Resources Guide** (`docs/features/learning-module/materials.md`)
  - Complete feature overview with database schema
  - RLS policies documentation
  - File structure and server actions reference
  - Admin UI walkthrough with form fields
  - How-to guide for adding materials and resources
  - Type definitions and known issues/TODOs

#### Updated Documentation
- ✅ **Learning Module Overview** (`docs/features/learning-module/overview.md`)
  - Added learning materials & resources section
  - Added `learning_materials` and `learning_resources` table schemas
  - Added `/admin/learning/[id]/materials` route documentation
  - Updated file structure with new directories
  - Updated RLS policies section

- ✅ **Main README** (`docs/README.md`) — Updated version to v1.3.0, added materials links
- ✅ **Implementation Summary** — Updated migration/table counts, added materials feature
- ✅ **Migration Guide** (`docs/guides/database-migrations.md`) — Added migration 014 details
- ✅ **Migration Naming** (`docs/guides/migration-naming-quick-reference.md`) — Version 013 → 014

### 🏗️ Architecture

#### Key Design Decision
- **FK to `learning_modules` (not `lessons`)** — The codebase has no `lessons` table. `learning_modules` is the smallest unit of content with a single `content` TEXT column. Materials and resources extend modules rather than replacing the structure.

### 📊 Build Status

```
✓ Compiled successfully
✓ Finished TypeScript in 10.9s
✓ Generating static pages (32/32)
✓ Build completed successfully
```

**New routes:**
- `/admin/learning/[id]/materials` — Materials & resources manager

---

## [v1.2.1] - April 11, 2026

### 🔧 Code Quality

#### Unused Imports & Variables Cleanup
- ✅ **Removed 47 unused imports/variables across 30 files**
  - Auth pages: Removed unused `FloatingInput` component, `inputError` state, `Globe2` icon
  - Learning page: Removed unused `BookOpen`, `Clock`, category labels/colors, `LearningModule` type
  - Profile page: Removed unused `User`, `CheckCircle2`, `Circle` icons
  - Admin pages: Removed 12 unused imports (icons, components, variables)
  - API routes: Removed unused `createClient`, `body`, `jobDescription`
  - Job features: Removed 8 unused imports/variables across components and actions
  - Components: Removed unused `Badge`, `DialogTrigger`, `Languages`, `VariantProps`, etc.
  - Utils: Removed unused `CookieOptions`, `getSupabaseServerClient`, `revalidatePath`
- ✅ **ESLint: 0 unused import warnings** (down from 47)
- ✅ **Build: Compiled successfully** with no type errors
- 📝 **Impact:** Cleaner codebase, reduced bundle size, improved developer experience

### 🐛 Bug Fixes

#### Learning Module Page
- ✅ **Fixed module resolution error** - "Module not found: Can't resolve './learning-client'"
  - Cleared stale `.next` cache
  - Verified `learning-client.tsx` exists and is properly imported
- ✅ **Updated documentation** to reflect current implementation status:
  - Module list page: ✅ Complete with Supabase integration
  - Individual module pages: ⚠️ Partial (uses hardcoded content, needs Supabase)

---

## [v1.2.0] - April 10, 2026 (Afternoon)

### 🎉 New Features

#### Admin Activity Logging System
- ✅ **Admin Activity Log Page** (`/admin/activity-log`)
  - Statistics dashboard (Total Actions, Approvals, Rejections, Content Changes)
  - Activity feed with color-coded badges
  - Relative timestamps with Indonesian locale
  - Loading skeleton states
  - Empty state design with helpful messaging
  - Files: `src/app/admin/activity-log/page.tsx`

- ✅ **Server Actions for Admin Logging**
  - 7 functions for fetching and filtering admin actions
  - `getRecentAdminActions()` - Fetch recent actions with pagination
  - `getAdminActionStats()` - Get action statistics
  - `getAdminActionsByType()` - Filter by action type
  - `getAdminActionsByAdminId()` - Filter by admin user
  - `getAdminActionsByTargetUser()` - Filter by target user
  - `getAdminActionById()` - Get single action
  - `getRecentActionCount()` - Count recent actions
  - Files: `src/features/admin/actions/activity-log.ts`

- ✅ **Admin Sidebar Update**
  - Added "Activity Log" navigation item
  - Activity icon from lucide-react
  - Positioned between Learning and Settings
  - Files: `src/components/admin/sidebar.tsx`

#### Complete RLS Policies
- ✅ **Migration 011** - Complete RLS Policies & Admin Logging
  - 35+ RLS policies for all 8 tables
  - Complete row-level security implementation
  - Role-based access control (admin/user/client)
  - Automatic admin action logging via triggers
  - Immutable audit trail (admin_actions table)
  - Files: `supabase/migrations/011_complete_rls_policies.sql`

- ✅ **Admin Actions Table**
  - `admin_actions` table with complete context tracking
  - 12 action types (approve_job, reject_job, delete_job, etc.)
  - Old/new values stored as JSONB
  - Admin attribution and target user tracking
  - Indexes for efficient queries
  - Automatic triggers on jobs and learning_modules tables

- ✅ **Helper Functions & Views**
  - `log_admin_action()` helper function for manual logging
  - `recent_admin_actions` view for easy querying
  - `admin_action_summary` view for statistics
  - Trigger functions for automatic logging

### 📚 Documentation

#### New Documentation Files
- ✅ **RLS Policies Guide** (`docs/guides/rls-policies.md`)
  - Complete RLS policy reference (35+ policies documented)
  - Policy patterns and examples
  - How RLS works with 3 roles
  - Testing RLS policies
  - Troubleshooting 5 common issues
  - Security checklist

- ✅ **Admin Action Logging Guide** (`docs/guides/admin-action-logging.md`)
  - Architecture overview
  - Database schema documentation
  - How automatic triggers work
  - Manual logging with helper function
  - 20+ query examples
  - Building admin dashboard UI
  - Retention & cleanup strategies
  - Security best practices

- ✅ **Admin Activity Logging Feature Doc** (`docs/features/admin/activity-logging.md`)
  - 4 complete user flows documented
  - UI architecture and component tree
  - Implementation details
  - Testing guide with 7 checklists
  - SQL testing queries
  - Integration testing examples

- ✅ **Migration Guide** (`scripts/MIGRATION_GUIDE.md`)
  - Step-by-step migration instructions
  - 9 verification steps
  - 7 troubleshooting scenarios
  - Rollback instructions
  - Post-migration checklist

#### Updated Documentation
- ✅ **Main README** (`docs/README.md`)
  - Updated implementation status section
  - Added new documentation links
  - Updated known issues section
  - Added migration requirements

- ✅ **Implementation Summary** (`docs/getting-started/implementation-summary.md`)
  - Added v1.2.0 release notes
  - Updated version to v1.2.0
  - Added new features section at top
  - Updated support section with new doc links

- ✅ **Database Architecture** (`docs/architecture/database.md`)
  - Added admin_actions table documentation
  - Added links to RLS and admin logging guides
  - Updated related documentation section

### 🐛 Bug Fixes

#### TypeScript Errors (15+ Fixed)
- ✅ **JSX Tag Mismatch** (`activity-log/page.tsx`)
  - Fixed: `<h3>` closed with `</CardTitle>` → `</h3>`

- ✅ **JobStatus Type Incompatibility** (`DashboardJobCard.tsx`)
  - Added "approved" and "expired" statuses
  - Updated style maps for all statuses

- ✅ **Null/Undefined Type Mismatches** (Multiple files)
  - Fixed in `dashboard/jobs/page.tsx`
  - Fixed in `jobs/page.tsx`
  - Fixed in `jobs/[id]/edit/page.tsx`
  - Fixed in `JobCard.tsx`
  - Fixed in `EditJobForm.tsx`
  - Fixed in `JobTypeBadge.tsx`

- ✅ **Property Type Errors**
  - `salary_period` → `salary_currency` in dashboard jobs page
  - Made JobData interfaces consistent across components

- ✅ **FormData Type Issues** (`EditJobForm.tsx`)
  - Added null coalescing for all form fields
  - Fixed Select component value handling

- ✅ **Function Parameter Types** (`JobCard.tsx`)
  - Fixed formatSalary and formatDeadline calls
  - Added null coalescing operators

#### Database Migration Errors
- ✅ **Syntax Error in PL/pgSQL** (`011_complete_rls_policies.sql`)
  - Fixed: `END;` → `END IF;` (2 occurrences)
  - Build now completes successfully

- ✅ **Column Does Not Exist** (`recent_admin_actions` view)
  - Fixed: `up.email` → join with `auth.users` for email
  - Added target_user_email column

### 🏗️ Architecture Changes

#### Type System Improvements
- ✅ Made all job-related interfaces consistent
- ✅ Updated JobData interface to allow null/undefined
- ✅ Made JobTypeBadge handle null/undefined gracefully
- ✅ Updated JobCardProps to accept nullable fields
- ✅ Fixed EditJobForm interface to match Job type

#### Security Enhancements
- ✅ Complete RLS implementation on all 8 tables
- ✅ Immutable audit trail (no UPDATE/DELETE on admin_actions)
- ✅ Automatic trigger-based logging
- ✅ Role-based access control fully implemented

### 🐛 Bug Fixes

#### Social Media Icons
- ✅ **Fixed Footer Social Icons**
  - Replaced generic `X`, `Link`, `Camera` icons with proper social media SVGs
  - Added custom `TwitterIcon` component (Twitter bird outline)
  - Added custom `LinkedinIcon` component (LinkedIn "in" logo)
  - Added custom `InstagramIcon` component (Instagram camera outline)
  - All icons use `currentColor` for consistent theming
  - Files: `src/components/landing/footer.tsx`

### 📊 Build Status

**Before:**
```
✗ Build failed with 15+ TypeScript errors
✗ Multiple type mismatches
✗ JSX parsing errors
```

**After:**
```
✓ Compiled successfully
✓ Finished TypeScript in 6.5s
✓ Generating static pages (30/30) in 3.0s
✓ Build completed successfully
```

---

## [v1.1.0] - April 10, 2026 (Morning)

### 🎉 New Features

#### Job Detail Modal
- ✅ **DraftJobsContentClient Component**
  - Client-side wrapper with refresh functionality
  - Uses `useRouter().refresh()` for server data refetching
  - Loading overlay during refresh operations

### 🐛 Bug Fixes

- ✅ Fixed JSX parsing error (missing closing `</div>` tag)
- ✅ Fixed HTML validation error (`<p>` cannot contain `<div>`)
- ✅ Fixed runtime TypeError (null `created_at` access)
- ✅ Fixed TypeScript error (`colors` used before declaration)
- ✅ Fixed type mismatch (`ColumnDef<any>` → `ColumnDef<Job>`)
- ✅ Empty refresh handler (action not running)

### 🏗️ Architecture Improvements

- ✅ Server/Client component separation
- ✅ Proper type safety with Job imports
- ✅ Router-based data refresh pattern
- ✅ Loading state management

---

## [v1.0.0] - April 7-9, 2026

### 🎉 Initial Feature Set

#### Authentication System
- ✅ Email/password login
- ✅ Google OAuth
- ✅ Registration with password strength meter
- ✅ Email confirmation flow
- ✅ Password reset (UI complete)

#### Dashboard
- ✅ Stats cards with real data
- ✅ Activity feed
- ✅ Settings page (4 tabs)
- ✅ Applications tracker
- ✅ Language switcher (EN/ID)

#### Job Board
- ✅ Public job listing with filters
- ✅ Job posting form (admin/client)
- ✅ Admin approval workflow
- ✅ Job management dashboard
- ✅ Rich text editor for job descriptions

#### Admin Panel
- ✅ Job management with tabs
- ✅ Approval workflow
- ✅ Draft management
- ✅ Admin sidebar navigation

#### Database
- ✅ 7 core tables
- ✅ Enums for job types, statuses, apply methods
- ✅ Indexes for performance
- ✅ RLS policies (partial)

---

## Migration Guide

### Applying Migrations

```bash
# Apply all pending migrations
supabase db push

# Check migration status
supabase db remote --list
```

### Migration 011 (Latest)

**Required For:**
- Complete RLS policies
- Admin action logging
- Audit trail system

**What It Creates:**
- admin_actions table
- 35+ RLS policies
- Automatic triggers
- Helper functions
- Convenience views

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| v1.2.0 | Apr 10, 2026 (PM) | Admin logging, Complete RLS, Bug fixes, Social icons |
| v1.1.0 | Apr 10, 2026 (AM) | Job detail modal v1.1.0 |
| v1.0.0 | Apr 7-9, 2026 | Initial feature set |

---

**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
