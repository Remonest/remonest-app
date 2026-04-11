# Learning Module — Documentation

## Overview

Learning Module adalah fitur edukasi Remonest yang memungkinkan freelancer untuk:

1. **Pilih Modul** — Browse katalog modul berdasarkan kategori & level
2. **Pelajari Materi** — Baca artikel, tonton video, kerjakan latihan interaktif
3. **Ikut Tes / Kuis** — Tes pemahaman di akhir setiap modul (min. passing 70%)
4. **Dapat Sertifikat** — Sertifikat digital Remonest bisa diunduh & di-share

**Quiz System (v1.0.0):** Admin dapat membuat quiz dengan multiple-choice questions (A-E), mengatur durasi, nilai kelulusan, dan tingkat kesulitan. [Lihat Quiz Builder Docs](./quiz-builder.md)

---

## Kategori & Topik

| Kategori | DB Value | Contoh Topik |
|----------|----------|--------------|
| 🌍 Remote Working Basics | `communication` | Apa itu remote working?, Etika & komunikasi remote, Tools kolaborasi (Slack, Notion, dll), Manajemen waktu & produktivitas |
| 💼 Skill Freelance | `career` | Cara memulai karier freelance, Menentukan niche & target klien, Membuat profil & portofolio menarik, Negosiasi rate & kontrak kerja |
| 💰 Keuangan Freelancer | `productivity` | Mengelola penghasilan tidak tetap, Invoice & pembayaran internasional, Pajak untuk freelancer Indonesia, Menabung & investasi sebagai freelancer |
| 📈 Growth & Branding | `design` | Personal branding di LinkedIn, Cara mendapat klien dari luar negeri, Membangun reputasi & ulasan positif, Scaling: dari solo ke tim kecil |
| 🛠️ Tools & Produktivitas | `productivity` | Figma untuk desainer freelance, Notion sebagai second brain, GitHub untuk developer remote, Asana / Trello untuk project management |
| 📄 CV & Personal Branding | `career` | Menulis CV ATS-friendly, Membuat portofolio yang convert, Cover letter untuk job remote, Optimasi profil Upwork / Toptal |

---

## Database Schema

### `learning_modules`

```sql
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'career'
                CHECK (category IN ('communication', 'mindset', 'career', 'design', 'productivity')),
  content       TEXT,                    -- Markdown content
  thumbnail_url TEXT,
  duration_min  INT DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `user_learning_progress`

```sql
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id     UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  progress      INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at  TIMESTAMPTZ,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);
```

### `quiz_configs` (v1.2.1 - Quiz System)

```sql
CREATE TABLE IF NOT EXISTS public.quiz_configs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id        UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  duration_minutes INT CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  passing_grade    INT NOT NULL DEFAULT 70 CHECK (passing_grade >= 0 AND passing_grade <= 100),
  is_published     BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `questions` (v1.2.1 - Quiz System)

```sql
CREATE TABLE IF NOT EXISTS public.questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_config_id   UUID NOT NULL REFERENCES quiz_configs(id) ON DELETE CASCADE,
  question_text    TEXT NOT NULL,
  options          JSONB NOT NULL,  -- {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}
  correct_answer   TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  explanation      TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index      INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Detailed Quiz Documentation:** [Quiz Builder Guide](./quiz-builder.md)

### RLS Policies

- **Anyone can view published modules** — `status = 'published'`
- **Admins can manage modules** — Full CRUD for users with `role = 'admin'`
- **Users can view/manage own progress** — Scoped to `auth.uid() = user_id`
- **Admins can view all progress** — Read access for admins

---

## Admin Routes

### `/admin/learning` — Module Management Dashboard

**File:** `src/app/admin/learning/page.tsx`

Features:
- **Stats Cards** — Total Modul, Terbit, Draft, Diarsipkan
- **Tab Filtering** — Semua Modul / Terbit / Draft / Diarsipkan
- **Search** — Real-time filtering across module titles
- **Data Table** — Columns: Modul, Kategori, Durasi, Status, Dibuat, Actions
- **Pagination** — Auto-paginated at 10 items per page

### `/admin/learning/new` — Create New Module

**File:** `src/app/admin/learning/new/page.tsx`

Form fields:
- Title
- Category (select)
- Level (select: beginner, intermediate, advanced)
- Description (textarea)
- Passing Score (number, default: 70%)

### `/admin/learning/[id]/edit` — Edit Existing Module

**Files:**
- `src/app/admin/learning/[id]/edit/page.tsx` — Server component (fetches module data)
- `src/app/admin/learning/[id]/edit/form.tsx` — Client form component

Form fields:
- Judul (title)
- Kategori (select: Komunikasi, Mindset, Karir, Desain, Produktivitas)
- Status (select: Draft, Terbit, Diarsipkan)
- Deskripsi (textarea)
- Konten / Markdown (textarea, monospace)
- Durasi / menit (number)

---

## Server Actions

**File:** `src/lib/learning/actions.ts`

| Action | Signature | Description |
|--------|-----------|-------------|
| `getAllLearningModules` | `() → LearningModuleRow[]` | Fetch all modules (admin, bypasses RLS) |
| `getLearningModuleById` | `(id) → LearningModuleRow \| null` | Fetch single module by ID |
| `getLearningModuleStats` | `() → LearningModuleStats` | Aggregate counts by status |
| `saveLearningModule` | `(prevState, formData) → Result` | Create new module + auto-generate slug |
| `updateLearningModule` | `(prevState, formData) → Result` | Update existing module fields |
| `updateLearningModuleStatus` | `(id, status) → Result` | Quick status change (publish/draft/archive) |
| `deleteLearningModule` | `(id) → Result` | Permanently delete a module |

All write actions use `getSupabaseServiceClient()` (service role key) to bypass RLS.

---

## Components

### Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| `LearningDataTable` | `src/components/admin/learning-data-table.tsx` | Data table with search, pagination, empty state |
| `learningColumns` | `src/components/admin/learning-columns.tsx` | Column definitions (module info, category badge, status, actions) |
| `LearningActions` | `src/components/admin/learning-actions.tsx` | Row action dropdown (Edit, Publish, Archive, Delete with confirmation) |

### Schemas

**File:** `src/lib/learning/schemas.ts`

```typescript
// Categories used by the create form
const LEARNING_CATEGORIES = [
  "Remote Working Basics",
  "Skill Freelance",
  "Keuangan Freelancer",
  "Growth & Branding",
  "Tools & Produktivitas",
  "CV & Personal Branding",
];

// Levels
const LEARNING_LEVELS = ["beginner", "intermediate", "advanced"];

// Content types
const CONTENT_TYPES = ["article", "video", "exercise", "quiz"];
```

---

## Sistem Sertifikat (Planned)

### Syarat Kelulusan
- Tes akhir modul minimum skor **70%**
- Boleh diulang maksimal **3 kali**

### Fitur Sertifikat Digital
- **ID Unik & Verifikasi** — Setiap sertifikat punya ID unik, bisa dicek keasliannya via link publik
- **Download & Share** — Unduh sebagai PDF siap cetak, bagikan ke LinkedIn & portofolio
- **Masa Berlaku** — Berlaku seumur hidup, tanggal terbit tercantum jelas

### Format ID Sertifikat
```
RMN-{YEAR}-{SEQUENTIAL_NUMBER}
Contoh: RMN-2026-00142
```

---

## File Structure

```
src/
├── app/admin/learning/
│   ├── page.tsx                    # Module management dashboard
│   ├── new/
│   │   └── page.tsx                # Create new module form
│   └── [id]/edit/
│       ├── page.tsx                # Edit module (server component)
│       └── form.tsx                # Edit module form (client component)
├── components/admin/
│   ├── learning-data-table.tsx     # Data table with search & pagination
│   ├── learning-columns.tsx        # Column definitions
│   └── learning-actions.tsx        # Row action dropdown
└── lib/learning/
    ├── actions.ts                  # Server actions (CRUD)
    └── schemas.ts                  # Zod schemas & constants
```

---

## Security

| Route | Access Level | Protection |
|-------|-------------|------------|
| `/admin/learning` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/new` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/[id]/edit` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/[id]/quiz` | Admin only | `requireAdmin()` via layout |
| `/learning` | Authenticated | Middleware |

All admin routes are protected by the `AdminShell` component in `src/app/admin/layout.tsx` which calls `requireAdmin()`. Non-admin users are redirected to `/dashboard`.

---

## Quick Reference

```bash
# Access admin panel
http://localhost:3000/admin/learning

# Create new module
http://localhost:3000/admin/learning/new

# Edit module
http://localhost:3000/admin/learning/{module-id}/edit

# Create quiz for module
http://localhost:3000/admin/learning/{module-id}/quiz

# Grant admin role (SQL)
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';
```
