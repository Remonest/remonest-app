## [1.9.9] - 2026-04-22

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

## [1.9.8] - 2026-04-21

### 🐛 Fixed
- CV Preview on mobile view in CV Builder: Ensured the CV preview is correctly displayed on mobile devices when the "Preview" tab is active by adjusting responsive classNames in `src/app/(main)/cv-builder/cv-builder-client.tsx`.

## [1.9.7] - 2026-04-21

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

### 📚 Documentation
- Created `docs/guides/cv-builder-guide.md`
- Updated database migration guide (Migration 023)

## [1.7.1] - 2026-04-13

### Certificate PDF Download Fix

#### Problem
- `html2canvas` cannot parse Tailwind CSS v4 `oklch()`/`lab()` colors
- Previous attempts with style overrides, cloning, and `onclone` all failed
- `window.print()` opened dialog but hid the certificate canvas
- Puppeteer route returned 204 No Content (empty response)

#### Solution: Server-side screenshot → PNG download

**API Route:** `src/app/api/certificate/pdf/route.ts`

Flow:
1. Client POSTs certificate data to `/api/certificate/pdf`
2. Server builds standalone HTML with hex-only colors (no `oklch()`)
3. Puppeteer renders HTML at `2700×1909px` (A4 landscape ~3×)
4. `page.screenshot()` captures PNG (canvas rendering, NOT print engine)
5. PNG buffer returned directly with `Content-Type: image/png`

**Client:** `src/app/(main)/certificates/[id]/certificate-client.tsx`

Flow:
1. User clicks "Download PDF" button
2. `handleDownload()` POSTs certificate data to API route
3. Receives PNG binary → creates Blob → triggers `<a>` download
4. File saved as `certificate-{id}.png`

**Why PNG not PDF:**
- `jsPDF` was removed — wrapping in PDF added no value, just complexity
- The screenshot is a pixel-perfect image matching the browser render
- Users can "Save as PDF" from their image viewer if needed
- PNG works universally without download manager issues

#### Font Size Mapping
Browser `clamp()` values resolve to max at ~900px viewport.
PDF canvas is 2700px (3×), so all sizes scale accordingly:

| Element | Browser (900px) | PNG (2700px) |
|---------|----------------|-------------|
| Logo text | 24px | 72px |
| Title | 34px | 102px |
| Subtitle | 13px | 39px |
| Name | 46px | 138px |
| Module | 20px | 60px |
| Detail label | 11px | 33px |
| Detail value | 15px | 45px |
| Signature name | 18px | 54px |
| Signature role | 9px | 27px |
| Cert ID | 11px | 33px |

#### Print Button Fix
- Removed `print:hidden` from `#certificate-canvas`
- Now `window.print()` correctly shows only the certificate
- Header, actions bar, metadata grid all hidden via `print-hide` class

### Files Changed
- `src/app/api/certificate/pdf/route.ts` — Rewritten: HTML → Puppeteer screenshot → PNG response
- `src/app/(main)/certificates/[id]/certificate-client.tsx` — Fixed download handler + print visibility
- `CHANGELOG.md` — This file

### Dependencies
- `puppeteer` (dev) — Server-side rendering
- `html2canvas` — REMOVED (incompatible with oklch colors)
- `jspdf` — REMOVED (no longer wrapping in PDF)
