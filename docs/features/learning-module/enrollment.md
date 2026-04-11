# Learning Module Enrollment

> **Status:** ✅ Implemented (v1.7.0 — April 2026)

Users must enroll in a learning module before accessing its content. Enrollment is tracked via the `user_learning_progress` table and automatically created on first visit.

---

## Overview

### How It Works

1. **Auto-enrollment** — When a logged-in user visits `/learning/[slug]` for the first time, the system automatically creates a progress record (`user_learning_progress`) with `progress = 0` and logs a `module_started` activity entry.

2. **Progress tracking** — The user can mark modules as complete manually via the "Tandai selesai" button. Progress is stored as a 0–100 integer.

3. **Completion** — When the user clicks "Tandai selesai", progress is set to 100, `completed_at` is set, and a `module_completed` activity is logged.

4. **Listing indicators** — The `/learning` catalog page shows status badges on each module card:
   - **Selesai** (green) — module completed
   - **X%** (amber) — in progress
   - **Belum dimulai** (gray) — not yet started

---

## Database

### `user_learning_progress` Table

Already exists from migration `002_create_dashboard_tables.sql`:

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → `auth.users(id)` |
| `module_id` | UUID | FK → `learning_modules(id)` |
| `progress` | INT | 0–100, default 0 |
| `started_at` | TIMESTAMPTZ | Enrollment/start timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp (null = not done) |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- `UNIQUE(user_id, module_id)` — one record per user per module
- `CHECK (progress >= 0 AND progress <= 100)`

**RLS:**
- Users can SELECT their own rows
- Users can INSERT their own rows
- Users can UPDATE their own rows

---

## Server Actions

**File:** `src/features/learning-module/actions/enrollment.ts`

### `getUserModuleProgress(moduleId)`
Returns the current user's progress for a specific module, or `null` if not enrolled.

```typescript
interface ProgressRecord {
  moduleId: string;
  progress: number;       // 0-100
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}
```

### `enrollUserInModule(moduleId)`
Creates a progress record if the user is not yet enrolled. Idempotent — returns existing progress if already enrolled. Logs `module_started` activity.

```typescript
interface EnrollmentResult {
  success: boolean;
  error?: string;
  progress?: ProgressRecord;
}
```

### `completeModule(moduleId)`
Sets `progress = 100` and `completed_at` to now. Logs `module_completed` activity. Returns early if already completed.

### `updateModuleProgress(moduleId, progress)`
Updates progress to any value (0–100). Auto-enrolls if not yet enrolled. If progress ≥ 100, sets `completed_at` and logs `module_completed`.

### `getUserEnrollments()`
Returns all of the current user's enrollments (used by the listing page).

```typescript
interface UserEnrollment {
  moduleId: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
}
```

---

## UI Components

### `EnrollButton` (Client Component)

**File:** `src/features/learning-module/components/EnrollButton.tsx`

Three states:

| State | UI |
|---|---|
| **Not started** (progress = 0) | "Mulai Belajar" button — sets 5% progress and scrolls to materials |
| **In progress** (0 < progress < 100) | Progress bar + "Lanjutkan belajar" + "Tandai selesai" button |
| **Completed** (progress = 100) | Static badge: "Modul selesai — Anda telah menyelesaikan modul ini" |

Uses `useTransition` for pending state and `toast` from Sonner for feedback.

### Detail Page Progress Badge

**File:** `src/app/(main)/learning/[slug]/page.tsx`

Shows next to the metadata row:
- ✅ **Selesai** (green) — completed
- ▶ **Sedang dipelajari (X%)** (amber) — in progress

### Listing Page Progress Indicators

**File:** `src/app/(main)/learning/learning-client.tsx`

Each module card shows:
- **Top-right badge:** "Selesai" (green) or "X%" (amber)
- **Bottom bar:** Progress bar for in-progress modules, "Belum dimulai" for new ones

---

## Activity Logging

Enrollment and completion are logged to the `activity_log` table:

| Action Type | Title Template | Status |
|---|---|---|
| `module_started` | `Memulai modul "{title}"` | in-progress |
| `module_completed` | `Menyelesaikan modul "{title}"` | completed |

These appear in the user's dashboard activity feed.

---

## PDF Viewer

**File:** `src/features/learning-module/components/PDFCanvasViewer.tsx`

### Architecture

The PDF viewer uses **canvas-based rendering** via `pdfjs-dist` instead of `<iframe>` or `<embed>` to prevent easy file extraction.

| Layer | Implementation |
|---|---|
| **PDF library** | `pdfjs-dist@5.6.205` — reads PDF → renders to `<canvas>` |
| **Worker** | `pdf.worker.min.mjs` copied to `/public/` for static serving |
| **Rendering** | Each page → individual `<canvas>` via `page.render({ canvas, viewport })` |
| **Data source** | Fetched via `/api/learning/file/[path]` proxy (not direct Supabase URL) |

### Page Layout

Each PDF page is rendered as a **legal-size styled paper** element:

- **Width:** 612px (legal paper at 72 DPI: 8.5" × 72) at 100% zoom
- **Scale:** Proportional to original page aspect ratio
- **Styling:** White background, box shadow, centered, rounded corners
- **Spacing:** `space-y-6` gap between pages
- **Container:** `max-height: 75vh`, `overflow-y-auto` — scrollable

### Zoom Controls

Zoom is controlled via the **floating toolbar** at the top of the viewer:

| Button | Effect |
|---|---|
| **Zoom Out** (−) | Decrease by 25% |
| **↺ {N}%** | Reset to 100% (only shown when zoom ≠ 100%) |
| **Zoom In** (+) | Increase by 25% |

**Range:** 25% – 300%

**Reset button:** A floating pill-shaped button appears centered at the top of the container **only when zoom ≠ 100%**, showing the current percentage (e.g. "Reset 150%"). Click it to return to 100%.

**Key detail:** Zooming **re-renders the canvas at native resolution** — it does NOT use CSS `transform: scale()`. This means text remains crisp and clear at any zoom level. The `pdfjs-dist` `page.getViewport({ scale })` API recalculates pixel dimensions for the target zoom, producing sharp output.

### Download Protection

| Measure | Detail |
|---|---|
| No iframe | Canvas rendering — no browser toolbar, no URL to inspect |
| No download link | Generic files show "Preview tidak tersedia" with no link |
| Per-page overlay | Transparent `<div>` on each page blocks right-click and drag |
| CSS protection | `pointer-events: none` and `user-select: none` on canvas |
| Proxy headers | `X-Content-Type-Options: nosniff`, `CSP: default-src 'none'` |
| Supabase URL hidden | Files served via `/api/learning/file/` proxy, not bucket URL |

### Worker Setup

```bash
# Copy worker from node_modules to public/
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

In the component:
```typescript
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

This avoids Turbopack/CDN dynamic import issues — the worker is served as a static file.

---

## Flow Diagram

```
User visits /learning
  └─► Not authenticated → redirect to /login
  └─► Authenticated → load catalog with progress indicators

User clicks module → /learning/[slug]
  └─► Not authenticated → redirect to /login?next=/learning/[slug]
  └─► Authenticated
        ├─► Check progress record
        ├─► Not enrolled → auto-enroll (progress=0, log module_started)
        ├─► Show EnrollButton based on progress state
        └─► User can:
              ├─► Click "Mulai Belajar" → progress=5, scroll to materials
              ├─► Click "Lanjutkan belajar" → scroll to materials
              └─► Click "Tandai selesai" → progress=100, log module_completed
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/features/learning-module/actions/enrollment.ts` | All enrollment/progress server actions |
| `src/features/learning-module/components/EnrollButton.tsx` | Client-side enrollment UI |
| `src/app/(main)/learning/[slug]/page.tsx` | Detail page with auto-enroll + progress badge |
| `src/app/(main)/learning/page.tsx` | Server page that builds progress map |
| `src/app/(main)/learning/learning-client.tsx` | Catalog with progress indicators |
