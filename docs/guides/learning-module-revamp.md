# Learning Module Revamp — v1.7.0 Guide

**Date:** April 13, 2026  
**Version:** v1.7.0

---

## Overview

The learning module system was revamped from a flat content structure to an ordered, step-based learning experience. Modules now contain ordered lessons, each linking to materials, quizzes, or resources.

---

## Architecture

### Module vs Lesson

| Concept | Description | Analogy |
|---------|-------------|---------|
| **Module** | Top-level course container with metadata (title, category, difficulty, thumbnail) | A book |
| **Lesson** | Ordered step within a module, linking to existing content | A chapter |

```
Module: "Mastering Async Communication"
  ├── Lesson 1: "The Async Mindset"         → video (links to material)
  ├── Lesson 2: "Writing Context Messages"  → article (links to material)
  ├── Lesson 3: "Draft an Update"           → exercise
  ├── Lesson 4: "Final Assessment"          → quiz (links to quiz config)
  └── Lesson 5: "Templates & Resources"     → resource (links to resource)
```

### Key Design Principle

**Lessons don't hold content.** They are an index layer that points to existing content:

- `lesson_type = "article"` → `material_id`
- `lesson_type = "quiz"` → `quiz_config_id`
- `lesson_type = "resource"` → `resource_id`
- `lesson_type = "video/exercise"` → standalone (metadata only)

---

## Database Schema

### Migration 018 — `supabase/migrations/018_learning_revamp.sql`

#### New Tables

**`module_lessons`** — Ordered steps within a module

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `module_id` | UUID (FK → learning_modules) | Parent module |
| `title` | TEXT | Lesson title |
| `description` | TEXT | Optional description |
| `order_index` | INT | Display order (0-based) |
| `lesson_type` | ENUM | `video`, `article`, `exercise`, `quiz`, `resource` |
| `material_id` | UUID (FK → learning_materials) | Linked material |
| `resource_id` | UUID (FK → learning_resources) | Linked resource |
| `quiz_config_id` | UUID (FK → quiz_configs) | Linked quiz |
| `duration_minutes` | INT | Estimated duration |
| `is_preview` | BOOLEAN | Free preview toggle |

**Constraint:** A lesson can link to only ONE content type (material OR resource OR quiz OR none).

**`module_reviews`** — User ratings and comments

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `module_id` | UUID (FK → learning_modules) | Rated module |
| `user_id` | UUID (FK → auth.users) | Reviewing user |
| `rating` | INT | 1-5 rating |
| `comment` | TEXT | Optional review text |

**Constraint:** One review per user per module (`UNIQUE(user_id, module_id)`).

#### Schema Updates

**`learning_modules`** — New columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `difficulty_level` | TEXT | `'beginner'` | `beginner`, `intermediate`, `advanced` |
| `enrollment_count` | INT | `0` | Total enrollments (auto-updated by trigger) |
| `average_rating` | DECIMAL(3,2) | `0.00` | Average rating (auto-updated by trigger) |

**`learning_materials`** — New column

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `order_index` | INT | `0` | Manual ordering position |

#### Auto-Updating Triggers

- **`trg_update_enrollment_count`** — On INSERT/DELETE to `user_learning_progress`, increments/decrements `enrollment_count`
- **`trg_update_average_rating`** — On INSERT/UPDATE/DELETE to `module_reviews`, recalculates `average_rating`

#### RLS Policies

| Table | Policy | Access |
|-------|--------|--------|
| `module_lessons` | "Anyone can view lessons from published modules" | Public read (if parent published) |
| `module_lessons` | "Admins can manage module lessons" | Admin ALL |
| `module_reviews` | "Anyone can view reviews for published modules" | Public read (if parent published) |
| `module_reviews` | "Users can create own review" | Users (must be enrolled) |
| `module_reviews` | "Users can update/delete own review" | Own review only |
| `module_reviews` | "Admins can manage all reviews" | Admin ALL |

---

## Admin Flow

### 1. Admin Learning List — `/admin/learning`

**What you see:**
- **Metrics Grid** — Total Modules, Published, In Draft, Active Learners
- **Toolbar** — Search box + Status filter + Category filter
- **Data Table** — Thumbnail, module title, difficulty badge, step count, category, status, learner count
- **Actions** — Edit, Kelola Materi, Kelola Kuis, **Kelola Pelajaran**, Publish/Archive/Draft, Delete

**File:** `src/components/admin/admin-learning-list.tsx`

**How it works:**
1. Server fetches all modules with lesson counts
2. Client filters by search text, status, and category
3. Pagination (10 per page) with Previous/Next buttons
4. Status changes via toast + `router.refresh()`
5. Delete confirmation dialog

### 2. Admin Lessons Manager — `/admin/learning/[id]/lessons`

**What you see:**
- Back link to module edit page
- Ordered list with step numbers and type icons
- Each row: title, type badge, preview badge, duration, actions
- "Add Lesson" button → opens create dialog

**File:** `src/app/admin/learning/[id]/lessons/` (page.tsx + lessons-client.tsx)

**Lesson Actions:**
| Action | Behavior |
|--------|----------|
| **Add Lesson** | Opens dialog to create new lesson |
| **Edit (pencil)** | Opens dialog with pre-filled fields |
| **Preview toggle (eye)** | Toggles `is_preview` boolean |
| **Delete (trash)** | Deletes lesson immediately |
| **Reorder** | Swaps positions, syncs order_index to server |

**Create/Edit Dialog Fields:**
- Title (required)
- Description (optional)
- Type selector (video/article/exercise/quiz/resource)
- Duration in minutes
- "Link to Material" dropdown (shown for article type)
- "Link to Quiz" dropdown (shown for quiz type)
- "Free preview" switch

**Server Actions Used:**
- `createLesson(admin, input)` → creates lesson
- `updateLesson(admin, id, input)` → updates fields
- `deleteLesson(admin, id)` → deletes lesson
- `reorderLessons(admin, moduleId, lessonIds)` → updates all order_index values

### 3. Existing Admin Routes (Unchanged)

| Route | Purpose |
|-------|---------|
| `/admin/learning` | List all modules |
| `/admin/learning/new` | Create new module |
| `/admin/learning/[id]/edit` | Edit module metadata |
| `/admin/learning/[id]/materials` | Manage materials & resources |
| `/admin/learning/[id]/quiz` | Manage quiz configs & questions |
| `/admin/learning/[id]/lessons` | ✨ **New:** Manage ordered lessons |

### 4. Action Dropdown (Updated)

All existing action dropdowns now include:
- **Edit** → Edit builder
- **Kelola Materi** → Materials manager
- **Kelola Kuis** → Quiz builder
- **Kelola Pelajaran** → ✨ **New:** Lessons manager
- Publish / Revert to Draft / Archive (status changes)
- Delete (with confirmation)

---

## Public Flow

### 1. Module Catalog — `/learning`

- Grid of module cards with category filter buttons
- Each card: BookOpen icon, category badge, title, description (2-line clamp), duration, progress status
- Progress states: Not started / In progress (% bar) / Completed (checkmark)

### 2. Module Detail — `/learning/[slug]`

**Sections (top to bottom):**

1. **Hero Section**
   - Breadcrumb: Learning → Category → Module title
   - Badges: Category + Difficulty
   - Title, meta stats (duration, lesson count, rating, enrollments)
   - Description paragraph
   - Learning outcomes grid (4 checkmark items)
   - **Sticky Enrollment Card** (right side on desktop):
     - Thumbnail image
     - "Free untuk member Remonest"
     - Enroll/Start/Continue button
     - "Modul ini mencakup" list

2. **Curriculum & Features**
   - **Left col:** Curriculum stepper with ordered lessons, type badges, duration, lesson states (active/locked/completed/default)
   - **Right col:** Quiz preview (sample question) + Certificate preview

3. **Related Modules Catalog** — Grid of modules in same category with progress bars

### 3. Components

| Component | File | Purpose |
|-----------|------|---------|
| `ModuleHero` | `src/features/learning-module/components/ModuleHero.tsx` | Hero section + sticky enrollment card |
| `CurriculumStepper` | `src/features/learning-module/components/CurriculumStepper.tsx` | Ordered lesson timeline with status icons |
| `QuizPreview` | `src/features/learning-module/components/QuizPreview.tsx` | Sample quiz question display |
| `CertificatePreview` | `src/features/learning-module/components/CertificatePreview.tsx` | Certificate mockup |
| `ModuleCatalog` | `src/features/learning-module/components/ModuleCatalog.tsx` | Related modules grid with progress |

---

## Server Actions Reference

### Fetch Actions (`src/features/learning-module/actions/fetch-learning.ts`)

| Function | Returns | Description |
|----------|---------|-------------|
| `getPublishedLearningModules()` | `LearningModule[]` | All published modules with new fields |
| `getLearningModuleBySlug(slug)` | `LearningModuleWithContent \| null` | Single module by slug |
| `getPublishedMaterialsForModule(moduleId)` | `LearningMaterial[]` | Published materials, ordered by `order_index` |
| `getLessonsForModule(moduleId)` | `ModuleLesson[]` | All lessons, ordered by `order_index` |
| `getRelatedModules(moduleId, category, limit)` | `LearningModule[]` | Modules in same category |
| `getAllLearningModules()` | `LearningModule[]` | All modules (admin) |
| `getModulesByStatus(status)` | `LearningModule[]` | Filter by status (admin) |

### Lesson Actions (`src/features/learning-module/actions/lessons.ts`)

| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| `getLessonsByModuleId(moduleId)` | `string` | `ModuleLesson[]` | Fetch all lessons for module |
| `getLessonById(lessonId)` | `string` | `ModuleLesson \| null` | Fetch single lesson |
| `getLessonWithContent(lessonId)` | `string` | `{ lesson, material, resource, quizConfig } \| null` | Fetch lesson with linked content |
| `createLesson(admin, input)` | `AdminUser, ModuleLessonInput` | `ActionResult` | Create new lesson |
| `updateLesson(admin, id, input)` | `AdminUser, string, Partial<ModuleLessonInput>` | `ActionResult` | Update lesson fields |
| `deleteLesson(admin, id)` | `AdminUser, string` | `ActionResult` | Delete lesson |
| `reorderLessons(admin, moduleId, lessonIds)` | `AdminUser, string, string[]` | `ActionResult` | Reorder all lessons by ID array |

### Review Actions (`src/features/learning-module/actions/reviews.ts`)

| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| `getModuleReviews(moduleId)` | `string` | `ModuleReviewWithUser[]` | All reviews with user info |
| `getUserReview(moduleId)` | `string` | `ModuleReview \| null` | Current user's review |
| `getModuleStats(moduleId)` | `string` | `ModuleStats \| null` | Enrollment count, average rating, lesson/material counts |
| `submitReview(input)` | `ModuleReviewInput` | `{ success, error }` | Create/update review |
| `deleteReview(moduleId)` | `string` | `{ success, error }` | Delete own review |

---

## TypeScript Types

### `src/features/learning-module/types/lesson.ts`

```typescript
type LessonType = "video" | "article" | "exercise" | "quiz" | "resource";

interface ModuleLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  lessonType: LessonType;
  materialId: string | null;
  resourceId: string | null;
  quizConfigId: string | null;
  durationMinutes: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModuleLessonInput {
  moduleId: string;
  title: string;
  description?: string;
  orderIndex?: number;
  lessonType: LessonType;
  materialId?: string | null;
  resourceId?: string | null;
  quizConfigId?: string | null;
  durationMinutes?: number;
  isPreview?: boolean;
}
```

### `src/features/learning-module/types/review.ts`

```typescript
interface ModuleReview {
  id: string;
  moduleId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ModuleReviewWithUser extends ModuleReview {
  userFullName: string | null;
  userAvatar: string | null;
}

interface ModuleStats {
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  lessonCount: number;
  materialCount: number;
}
```

### Updated `src/features/learning-module/types/learning.ts`

```typescript
type ModuleDifficulty = "beginner" | "intermediate" | "advanced";

interface LearningModule {
  // ... existing fields
  difficultyLevel: ModuleDifficulty;
  enrollmentCount: number;
  averageRating: number;
}
```

---

## How-To Guides

### How to Add a New Module

1. Go to `/admin/learning` → "Create Module"
2. Fill title, category, description
3. Click save → redirects to edit page
4. On edit page, add thumbnail and difficulty level
5. Go to "Kelola Materi" to add materials (articles, videos, resources)
6. Go to "Kelola Kuis" to add quiz
7. Go to "Kelola Pelajaran" to create ordered lessons
8. Publish when ready

### How to Add Lessons to a Module

1. Go to `/admin/learning/[id]/lessons`
2. Click "Add Lesson"
3. Fill title, select type (video/article/exercise/quiz/resource)
4. For article type: link to existing material
5. For quiz type: link to existing quiz
6. Set duration and toggle free preview if needed
7. Repeat for all steps
8. Reorder by drag indicators (up/down arrows)

### How to Reorder Lessons

1. Open `/admin/learning/[id]/lessons`
2. Use the up/down arrows to swap positions
3. Order is saved automatically to the server
4. Reordering updates `order_index` for all lessons

### How to Enable Free Preview for a Lesson

1. Open `/admin/learning/[id]/lessons`
2. Click the eye icon next to any lesson
3. Lesson shows a "Preview" badge when enabled
4. Visitors can view this lesson without enrolling

### How to Link a Material to a Lesson

1. Create materials first in "Kelola Materi"
2. Go to "Kelola Pelajaran"
3. Create lesson with type "Article"
4. Select existing material from dropdown
5. Lesson now points to that material's content

---

## Migration Guide

### Applying Migration 018

```bash
supabase db push
```

**What it does:**
1. Creates `module_lessons` table with RLS
2. Creates `module_reviews` table with RLS
3. Adds `difficulty_level`, `enrollment_count`, `average_rating` to `learning_modules`
4. Adds `order_index` to `learning_materials`
5. Creates auto-updating triggers for enrollment count and average rating
6. Seeds lessons from existing published materials (auto-migrates flat → structured)
7. Cleans up orphaned rows from failed previous attempts

**Idempotent:** Can be run multiple times without error. All operations check for existing state before executing.

---

## Known Issues & TODOs

- [ ] Admin create/edit module forms need thumbnail upload UI
- [ ] Admin create/edit module forms need difficulty level selector
- [ ] Admin materials page needs `order_index` field in form
- [ ] User-facing quiz taking page (quiz config exists but no UI to take quizzes)
- [ ] Per-lesson progress tracking (currently only module-level progress)
- [ ] Certificate generation on module completion
- [ ] Module prerequisites system

---

**Last Updated:** April 13, 2026  
**Maintained By:** Development Team
