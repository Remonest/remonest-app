# Changelog

All notable changes to the Remonest App project.

**Format:** [Semantic Versioning](https://semver.org/)
**Date Format:** April 27, 2026

---

## [v2.0.0] - April 27, 2026

### 🐛 Bug Fixes

- ✅ **Portfolio Access** — Fixed critical bugs affecting public portfolio viewing and data fetching (especially for custom usernames)
- ✅ **Quiz Submission** — Implemented browser-level warnings to prevent accidental navigation during active quizzes

### 🛠 Improvements

- ✅ **Portfolio View** — Optimized portfolio page rendering and data handling for improved performance
- ✅ **Quiz UX** — Added browser warning dialog when leaving or closing tabs while a quiz is in progress

---

## [v1.9.9] - April 22, 2026

### ✨ Added
- **Persistent Portfolio Builder**
  - Full Supabase persistence for portfolio items (Migration 019 & 024)
  - Support for Projects, Certificates, Achievements, and other items
  - Cover image URL support with real-time preview in builder list
  - Draft/Published status toggle
  - External link and tag management
- **Public Portfolio Enhancements**
  - Support for both UUID and custom `username` slugs
  - Enhanced responsive UI with "Share" functionality
  - Profile header with professional headline, bio, location, and website
  - Graceful empty states for new profiles
- **Public CV Viewing**
  - Dedicated public CV route `/cv/[userId]`
  - "View CV" button on public portfolio pages (conditional on CV existence)
  - Public read access for primary CVs (Migration 025)

### 🏗️ Changed
- Migrated user profile fields (`bio`, `location`, `headline`, `website`) to `user_profiles` for public access
- Updated `getUserProfilePublic` server action to support multi-identifier lookup
- Improved `PortfolioClient` with better mobile layout and image previews

### 🗄️ Database
- **Migration 024**: Added `headline`, `bio`, `location`, `website`, and `username` to `user_profiles`
- **Migration 025**: Added public read policy for primary user CVs

---

## [v1.9.8] - April 21, 2026

### 🐛 Fixed
- **CV Builder Mobile Preview** — Ensured the CV preview is correctly displayed on mobile devices when the "Preview" tab is active.

---

## [v1.9.7] - April 21, 2026

### ✨ Added
- **Professional CV Builder** (v1.0.0)
  - Split-view real-time editor and preview
  - High-fidelity PDF generation using `@react-pdf/renderer` (ATS-friendly)
  - Database persistence via Supabase `user_cvs` table (Migration 023)
  - Debounced auto-saving (3s) for seamless draft management
  - Professional summary, dynamic experience, education, and skills/languages sections
  - Modular component architecture in `src/features/portfolio/`

### 🏗️ Changed
- Refactored `CVBuilderPage` into Server/Client component pair for better performance and SEO
- Migrated CV logic to feature-driven module structure
- Replaced `jspdf` with `@react-pdf/renderer` for superior export quality

---

## [v1.9.6] - April 15, 2026

### 🎉 New Features

#### Flow Builder Enhanced Section Management System

- ✅ **Complete Section CRUD** — Add, edit, and delete sections via dedicated dialogs
- ✅ **Section Assignment** — Assign lessons to specific sections during creation
- ✅ **Default Section Protection** — Cannot edit/delete the default "Getting Started" section
- ✅ **Enhanced Dialog System** — Multiple dedicated dialogs for each action type
- ✅ **Optimistic UI Updates** — Instant feedback with server synchronization
- ✅ **Section-Lesson Sync** — Automatic synchronization between sections and lessons
- ✅ **Loading States** — Proper loading indicators for all async operations
- ✅ **Enhanced Error Handling** — Graceful error handling with detailed toast notifications

#### New Server Actions

- ✅ **`createSection()`** — Create new sections with auto-generated order
- ✅ **`updateSection()`** — Update section titles with validation
- ✅ **`deleteSection()`** — Delete sections with safety checks
- ✅ **Enhanced `createLesson()`** — Support for section assignment during creation
- ✅ **Enhanced `updateLesson()`** — Full metadata update support
- ✅ **Enhanced `deleteLesson()`** — Improved deletion with safety checks

#### UI Improvements

- ✅ **Add Step Dialog** — Complete lesson creation with section selection dropdown
- ✅ **Edit Step Dialog** — Update lesson metadata independently of content
- ✅ **Delete Confirmation Dialog** — Safety dialog with detailed warnings
- ✅ **Add Section Dialog** — Create sections with title validation
- ✅ **Edit Section Dialog** — Rename sections with instant UI updates
- ✅ **Section Dropdown** — Only appears when multiple sections exist
- ✅ **Form Validation** — Client-side validation before server calls
- ✅ **Loading Indicators** — All async operations show loading states
- ✅ **Error Toasts** — Detailed error messages with descriptions

#### Architecture Improvements

- ✅ **State Management Patterns** — Optimistic updates with error recovery
- ✅ **Dialog Architecture** — Multi-dialog system with proper state management
- ✅ **Section Management Architecture** — Section-lesson relationship with auto-sync
- ✅ **Performance Optimizations** — Reduced perceived latency with local state updates

### 📚 Documentation Updates

- ✅ **Flow Builder v1.9.6 Documentation** — Complete rewrite with new features
- ✅ **Quick Reference Guide** — New quick reference for Flow Builder v1.9.6
- ✅ **Enhanced Testing Checklist** — Expanded testing scenarios for new features
- ✅ **Architecture Documentation** — New patterns and best practices guide
- ✅ **Main Documentation Index** — Updated with new Flow Builder features

### 🐛 Bug Fixes

- ✅ **Section deletion validation** — Prevents deleting sections with lessons
- ✅ **Default section protection** — Cannot edit/delete default section
- ✅ **Section dropdown visibility** — Only shows when multiple sections exist
- ✅ **Dialog state management** — Proper cleanup and state reset between operations
- ✅ **Loading state management** — Disabled buttons during operations
- ✅ **Error handling** — Graceful error recovery with user feedback

---

## [v1.8.0] - April 13, 2026

### 🎉 New Features

#### Certificate System Overhaul

- ✅ **Shared CertificateTemplate** (`CertificateTemplate.tsx`)
  - Single source of truth for certificate rendering
  - Fixed 900px width, fixed pixel typography (no `clamp()`, no `vw`)
  - Explicit hex colors only (no Tailwind `oklch()` variables)
  - Inline SVGs with explicit `stroke`/`fill` (no `currentColor`)

- ✅ **Responsive Zoom Overlay**
  - Dynamic scale calculation from viewport (`min(availW/900, availH/636, 2.0)`)
  - Responsive on mobile — fits small screens, scrolls if needed
  - Escape key to close, click-outside to close

- ✅ **PNG Download via html2canvas**
  - Hidden off-screen template ref (`position: absolute; left: -9999px`)
  - `html2canvas` renders at 2x scale → crisp 1800×1272px output
  - `onclone` callback safety net replaces any leaked `oklch` colors with hex

- ✅ **Public Certificate Verification** (`/verify/[id]`)
  - No authentication required
  - Verifies certificate ID against all completed enrollments
  - Shows recipient name, module title, completion date, certificate ID
  - "Not Found" state for invalid/malformed IDs

- ✅ **Print Support**
  - `@media print` hides header, actions, metadata
  - Landscape A4 layout, only certificate canvas renders

### 🔧 Bug Fixes

- **`oklch` color crash** — `html2canvas` cannot parse `oklch()` colors (Tailwind v4). Fixed by using explicit hex colors in `CertificateTemplate` + `onclone` safety net.
- **Mobile download wrong fonts** — `clamp()` with `vw` units resolved differently on mobile vs desktop. Replaced with fixed `px` values.
- **Blank download image** — `sr-only` class set `width:1px;height:1px`. Replaced with explicit off-screen positioning.
- **Zoom overlay overflow on mobile** — hardcoded `scale(1.6)` = 1440px wide. Now calculates scale dynamically from viewport.
- **`Uint8Array` type error in PDF route** — `Buffer.from()` wrapper needed for `NextResponse` body.
- **Unsplash thumbnail not rendering** — `images.unsplash.com` not in `next.config.ts` `images.remotePatterns`. Added to config.

### 📁 New Files

| File | Purpose |
|------|---------|
| `src/features/learning-module/components/CertificateTemplate.tsx` | Shared certificate template |
| `src/app/(main)/verify/[id]/page.tsx` | Public verification page |
| `src/features/learning-module/actions/certificate.ts` → `getPublicCertificateData()` | Public verification action (no auth) |

### 📄 Docs Updated

- `docs/guides/certificate-download.md` — Complete rewrite with new architecture
- `docs/features/learning-module/overview.md` — Updated certificate section with routes table
- `docs/guides/demo-learning-module.md` — **New** — Demo module seed instructions, full flow walkthrough, cleanup guide

---

## [v1.7.0] - April 13, 2026

### 🎉 New Features

#### Learning Module Revamp

- ✅ **Database Enhancements (Migration 018)**
  - `module_lessons` table — ordered steps within modules (video/article/exercise/quiz/resource)
  - `module_reviews` table — user ratings (1-5) with comments
  - `order_index` column on `learning_materials` for manual ordering
  - `difficulty_level`, `enrollment_count`, `average_rating` columns on `learning_modules`
  - Auto-updating triggers for enrollment count and average rating
  - Seed: auto-creates lessons from existing published materials

- ✅ **Public Detail Page Rewrite (`/learning/[slug]`)**
  - Hero section with breadcrumb, category + difficulty badges, meta stats
  - Sticky enrollment card with thumbnail, price, includes list
  - Curriculum timeline stepper with lesson states (active/locked/completed/default)
  - Quiz preview with sample question display
  - Certificate preview mockup
  - Related modules catalog grid with progress bars
  - Files: `src/app/(main)/learning/[slug]/page.tsx` (complete rewrite)

- ✅ **New UI Components**
  - `ModuleHero` — Hero section with enrollment card
  - `CurriculumStepper` — Vertical step timeline with status icons
  - `QuizPreview` — Sample quiz question with radio options
  - `CertificatePreview` — Certificate mockup with user name
  - `ModuleCatalog` — Related modules grid with progress

- ✅ **New Server Actions**
  - `lessons.ts` — CRUD + reorder for lessons
  - `reviews.ts` — Submit/get/delete reviews, module stats
  - Updated `fetch-learning.ts` — `getLessonsForModule()`, `getRelatedModules()`, `getAllLearningModules()`, `getModulesByStatus()`

- ✅ **TypeScript Types**
  - `lesson.ts` — `ModuleLesson`, `ModuleLessonRow`, `ModuleLessonInput`, `LessonType`
  - `review.ts` — `ModuleReview`, `ModuleReviewWithUser`, `ModuleStats`
  - Updated `learning.ts` — Added `ModuleDifficulty`, new fields
  - Updated `materials.ts` — Added `orderIndex`, `LearningMaterialRow`

### 🔧 Bug Fixes

- ✅ **Learning list page not showing modules** — Fixed queries that selected non-existent columns before migration 018 was applied
- ✅ **QuizPreview crash** — `options.map()` on undefined, added default empty array + early return
- ✅ **CurriculumStepper crash** — `lessons.map()` on undefined, added default empty array
- ✅ **ModuleCatalog event handler error** — Server-to-client function prop replaced with `viewAllHref` string + `Link` component
- ✅ **Migration 018 errors** — Fixed FK constraint violation (wrong `module_id` in seed), invalid `IF NOT EXISTS` trigger syntax, missing table checks in cleanup

#### Admin Learning Revamp

- ✅ **New Admin Learning List Page** (`/admin/learning`)
  - Replaced old TanStack table with custom metric cards + search/filter toolbar + data table
  - Metrics grid: Total Modules, Published, In Draft, Active Learners
  - Thumbnail column with image preview or placeholder icon
  - Difficulty badge and lesson count in module cell
  - Status + Learner columns with proper formatting
  - Pagination with Previous/Next buttons
  - Status and category filter dropdowns
  - Search by title/description

- ✅ **New Admin Lessons Manager** (`/admin/learning/[id]/lessons`)
  - Ordered list of lessons with drag indicators and step numbers
  - Type icons (Video, Article, Exercise, Quiz, Resource)
  - Preview toggle per lesson (free preview badge)
  - Create/Edit/Delete lesson dialog with all fields
  - Reorder lessons (up/down) with server sync
  - Link to existing materials and quizzes
  - Back to module link

- ✅ **Updated Action Dropdowns**
  - Added "Kelola Pelajaran" (Manage Lessons) link to existing `LearningActions` component
  - All existing actions preserved (Edit, Materials, Quiz, Publish, Archive, Delete)

---

## [v1.5.0] - April 11, 2026

### 🎉 New Features

#### Login/Logout Activity Tracking (Migration 017)

- ✅ **Database Enhancements**
  - Added `'login'` and `'logout'` to `admin_action_type_enum`
  - Updated `log_admin_action()` function to accept `ip_address` and `user_agent` parameters
  - Created `log_user_login()` helper function — logs user ID, email, role, IP, user agent, login method
  - Created `log_user_logout()` helper function — logs user ID, email, role, IP, user agent

- ✅ **Email/Password Login Logging**
  - Automatic logging after successful authentication
  - Captures IP address from `x-forwarded-for` / `x-real-ip` headers
  - Captures User-Agent (browser info)
  - Fetches and stores user role from `user_profiles`
  - Non-blocking: login succeeds even if logging fails

- ✅ **OAuth Login Logging**
  - Automatic logging after Google OAuth session exchange
  - Same IP and User-Agent capture
  - Login method detection (`email/password` vs `oauth`)

- ✅ **Logout Logging**
  - Automatic logging before `signOut()`
  - Captures IP and User-Agent
  - Non-blocking: logout succeeds even if logging fails

- ✅ **Admin Activity Log UI**
  - Login/logout activities appear in `/admin/activity-log`
  - Blue "Login" badge for login events
  - Gray "Logout" badge for logout events
  - Displays IP address and browser info in monospace font
  - Filterable by action type like all other admin actions

- ✅ **TypeScript Types Updated**
  - `AdminActionType` now includes `'login'` and `'logout'`
  - `AdminActionRecord` interface includes `ip_address` and `user_agent` fields
  - Activity log fetch functions updated to return IP/user agent data

### 🔒 Security & Privacy

- IP addresses and user agents logged for security audit purposes
- Only admins can view login/logout activity
- Helps detect suspicious activity (multiple logins, unusual locations)
- Login method stored in `new_values.login_method` for analytics

---

## [v1.4.1] - April 12, 2026 (Night)

### 🔒 Security

#### PDF File URL Protection

- ✅ **Proxy route** `/api/learning/file/[path]`
  - Streams files server-side from Supabase Storage
  - Never exposes Supabase bucket URL to browser
  - `Content-Disposition: inline` — no download prompt
  - What users see in DevTools: `/api/learning/file/filename.pdf`
  - What was exposed before: `https://xxx.supabase.co/storage/v1/object/public/learning-files/filename.pdf`

- ✅ **Upload API updated**
  - Now returns proxy URL (`/api/learning/file/xxx.pdf`) instead of direct Supabase URL
  - All existing file references automatically use proxy

### 🐛 Bug Fixes

- ✅ **PDF viewer scrolling** — removed blocking overlay, users can now scroll and read normally
- ✅ **YouTube URL validation** — blocks form submission when video is not public
- ✅ **File size limits** — PDF max 5MB, images max 10MB (enforced both client and server)

---

## [v1.4.0] - April 12, 2026 (Afternoon)

### 🎉 New Features

#### File Upload for Learning Materials

- ✅ **Supabase Storage Bucket** (Migration 015)
  - `learning-files` bucket — public, 10MB max
  - Allowed types: PDF, JPEG, PNG, WebP, GIF, Word, Excel
  - `file_url` column added to `learning_materials` table
  - RLS: anyone can view, admins can upload

- ✅ **Upload API** (`/api/upload`)
  - File size validation (max 10MB)
  - File type validation (PDF, images, documents)
  - Uploads to Supabase Storage with unique filename
  - Returns public URL for immediate use

- ✅ **Admin Material Form** — file upload UI
  - Drag-and-drop style upload area
  - Image preview for uploaded images
  - PDF icon with file name display
  - Remove uploaded file button
  - Upload progress indicator

- ✅ **Public Detail Page** — enhanced material rendering
  - **PDF**: Embedded iframe viewer with "Buka PDF" button
  - **Images**: Displayed with max-h-[600px], object-contain
  - **Video**: YouTube/Vimeo/Google Drive embed (16:9 responsive)
  - **Files**: Download link with fallback for unsupported types
  - File type badges (PDF, Gambar) in material header

---

## [v1.3.3] - April 12, 2026

### 🎉 New Features

#### Public Learning Module Detail Page (Rewritten)

- ✅ **Replaced hardcoded data with Supabase**
  - Uses `getLearningModuleBySlug(slug)` to fetch real module content
  - Fetches `content` column from `learning_modules` table
  - Returns null for non-existent/unpublished slugs → 404

- ✅ **Materials Section**
  - Fetches published materials via `getPublishedMaterialsForModule(moduleId)`
  - Shows material cards with title, summary, difficulty, reading time, tags
  - External source links open in new tab
  - Markdown content rendered inline

- ✅ **Markdown Rendering**
  - Custom lightweight Markdown parser (no external dependency)
  - Supports: H2-H4, bold, italic, lists, numbered lists, code blocks, inline code, horizontal rules
  - Proper prose styling with `prose prose-neutral dark:prose-invert`

- ✅ **UI Improvements**
  - Category badges with color coding
  - Duration and material count metadata
  - "Kembali ke Katalog" back link
  - Clean reading layout (800px max width, proper spacing)

### 🐛 Bug Fixes

- ✅ **Detail page showed "Module not found" for all slugs** — was using hardcoded map
- ✅ **Content column not fetched** — added to Supabase select query
- ✅ **No materials shown** — new `getPublishedMaterialsForModule()` action

### 📝 Code Changes

| File | Changes |
|------|---------|
| `src/app/(main)/learning/[slug]/page.tsx` | Complete rewrite — Supabase data, Markdown rendering, materials section |
| `src/features/learning-module/actions/fetch-learning.ts` | Added `getLearningModuleBySlug` (with content), `getPublishedMaterialsForModule`, `LearningMaterial` interface |
| `src/features/learning-module/types/learning.ts` | Added `content` to `LearningModule` and `LearningModuleRow`, added `LearningModuleWithContent` |

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
| v1.7.0 | Apr 13, 2026 | Learning module revamp: lessons, reviews, admin list, public detail page |
| v1.5.0 | Apr 11, 2026 | Login/logout activity tracking |
| v1.2.0 | Apr 10, 2026 (PM) | Admin logging, Complete RLS, Bug fixes, Social icons |
| v1.1.0 | Apr 10, 2026 (AM) | Job detail modal v1.1.0 |
| v1.0.0 | Apr 7-9, 2026 | Initial feature set |

---

**Last Updated:** April 13, 2026
**Maintained By:** Development Team
