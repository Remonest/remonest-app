# Learning Module — Documentation

## Overview

Learning Module adalah fitur edukasi Remonest yang memungkinkan freelancer untuk:

1. **Pilih Modul** — Browse katalog modul berdasarkan kategori & level
2. **Pelajari Materi** — Baca artikel, tonton video, kerjakan latihan interaktif
3. **Ikut Tes / Kuis** — Tes pemahaman di akhir setiap modul (min. passing 70%)
4. **Dapat Sertifikat** — Sertifikat digital Remonest bisa diunduh & di-share

**Quiz System (v1.0.0):** Admin dapat membuat quiz dengan multiple-choice questions (A-E), mengatur durasi, nilai kelulusan, dan tingkat kesulitan. [Lihat Quiz Builder Docs](./quiz-builder.md)

**Learning Materials & Resources (v1.0.0):** Admin dapat menambahkan materi pembelajaran (artikel, video, dokumentasi, tutorial) dan resource tambahan (tools, template, ebook, PDF) ke setiap modul. [Lihat Materials Guide](./materials.md)

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

## User Experience (v2.0.0)

### 1. Interactive Quiz Flow
- **Review Mode** — Setelah mengerjakan kuis, peserta dapat melihat detail jawaban benar/salah langsung di halaman hasil kuis.
- **Lihat Hasil Detail** — Peserta yang sudah pernah mengerjakan kuis dapat mengakses kembali hasil percobaan terakhir mereka via tombol "Lihat Hasil Detail" di halaman modul.
- **Retry Cooldown** — Jeda 1 menit diterapkan antar percobaan untuk mendorong peserta meninjau kembali materi sebelum mencoba lagi.
- **Auto-Scroll** — Halaman otomatis scroll ke atas setelah kuis selesai untuk menunjukkan skor & status kelulusan.

### 2. Certificate Integration
- **Real-time Preview** — Preview sertifikat di sidebar halaman modul berubah secara dinamis sesuai status penyelesaian.
- **Achievement Theme** — Modul yang sudah selesai akan menampilkan preview sertifikat dengan tema emerald dan status "Lulus".
- **Direct Access** — Tombol "Unduh Sertifikat" dan "Lihat Versi Publik" muncul langsung di halaman modul setelah kuis lulus, memudahkan akses tanpa harus navigasi ke halaman lain.
- **Dynamic Certificate ID** — Menampilkan ID sertifikat asli (e.g., `RMN-2026-12345`) dan tanggal penyelesaian pada preview sertifikat.

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

### `learning_materials` (v1.3.0 - Materials System)

```sql
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id             UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  content               TEXT,                    -- HTML or Markdown content
  summary               TEXT,                    -- Brief Indonesian summary
  source_url            TEXT,                    -- External source URL
  source_type           TEXT CHECK (source_type IN ('article', 'video', 'documentation', 'tutorial')),
  language              TEXT DEFAULT 'id',       -- 'id' = Indonesian, 'en' = English
  reading_time_minutes  INT,                     -- Estimated reading time
  difficulty            TEXT DEFAULT 'beginner'
                        CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags                  TEXT[],                  -- Array of tags
  is_published          BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `learning_resources` (v1.3.0 - Materials System)

```sql
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  url           TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('tool', 'template', 'ebook', 'checklist', 'cheatsheet', 'pdf')),
  is_free       BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Detailed Materials Documentation:** [Materials Guide](./materials.md)

### RLS Policies

- **Anyone can view published modules** — `status = 'published'`
- **Admins can manage modules** — Full CRUD for users with `role = 'admin'`
- **Users can view/manage own progress** — Scoped to `auth.uid() = user_id`
- **Admins can view all progress** — Read access for admins
- **Anyone can view published materials** — `is_published = true` AND parent module `status = 'published'`
- **Anyone can view resources from published modules** — Parent module `status = 'published'`
- **Admins can manage materials & resources** — Full CRUD via `is_admin()` helper

---

## Public Routes

### `/learning` — Public Module Catalog

**File:** `src/app/(main)/learning/page.tsx`

Features:
- Grid of published modules (3 columns responsive)
- Category filter buttons (All, Communication, Mindset, Career, Design, Productivity)
- Card layout: icon, category badge, title, description, duration
- Links to `/learning/[slug]` for detail view

### `/learning/[slug]` — Public Module Detail

**File:** `src/app/(main)/learning/[slug]/page.tsx`

Features:
- Back link to catalog
- Module header: category badge, title, description, duration, material count
- Markdown content rendering (H2-H4, lists, code blocks, tables, bold/italic)
- Materials section showing published learning materials
  - Material cards: title, summary, source type, difficulty, reading time, tags, language
  - External source links
  - Inline Markdown content per material
- 404 for non-existent or unpublished modules

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

### `/admin/learning/[id]/quiz` — Create Quiz for Module

**File:** `src/app/admin/learning/[id]/quiz/page.tsx`

Features:
- Quiz configuration (title, duration, passing grade, publish toggle)
- Dynamic question builder with unlimited questions
- 5-option multiple choice (A-E) with radio button selection
- Difficulty levels (easy/medium/hard) with color-coded badges

### `/admin/learning/[id]/materials` — Manage Materials & Resources

**File:** `src/app/admin/learning/[id]/materials/page.tsx`

Features:
- Stats cards (total materials, published, resources, free)
- Materials list with publish toggle, edit, delete
- Resources list with delete and external links
- Material form: title, Markdown content, summary, source, tags
- Resource form: title, description, URL, type, free toggle

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

## Sistem Sertifikat (Implemented)

### Syarat Kelulusan
- Modul selesai 100% (`progress = 100` AND `completed_at IS NOT NULL`)
- Sertifikat dihasilkan otomatis saat modul selesai

### Fitur Sertifikat Digital
- **ID Unik & Verifikasi** — Setiap sertifikat punya ID unik, bisa dicek keasliannya via `/verify/[id]` (publik, tanpa login)
- **Download PNG** — Unduh sebagai gambar via `html2canvas` (bukan Puppeteer)
- **Print** — Browser native print dialog, `@media print` hides UI
- **Zoom** — Klik sertifikat untuk zoom fullscreen, responsive scale

### Format ID Sertifikat
```
RMN-{YEAR}-{HASH}
Contoh: RMN-2026-12345
```
Hash = 5-digit zero-padded hash dari `(userId + moduleId)`.

### Routes
| Route | Auth Required | Purpose |
|-------|--------------|---------|
| `/certificates/[id]` | Yes (user) | View, download, print own certificate |
| `/verify/[id]` | No (public) | Verify certificate authenticity |

### Implementation Details
See [Certificate System Guide](../../guides/certificate-download.md)

---

## File Structure

```
src/
├── app/admin/learning/
│   ├── page.tsx                    # Module management dashboard
│   ├── new/
│   │   └── page.tsx                # Create new module form
│   └── [id]/
│       ├── edit/
│       │   ├── page.tsx            # Edit module (server component)
│       │   └── form.tsx            # Edit module form (client component)
│       ├── quiz/
│       │   ├── page.tsx            # Quiz builder (server component)
│       │   └── quiz-builder.tsx    # Quiz form (client component)
│       └── materials/
│           ├── page.tsx            # Materials manager (server component)
│           ├── material-list-client.tsx  # Client UI
│           ├── material-form.tsx   # Material create/edit form
│           └── resource-form.tsx   # Resource create form
├── components/admin/
│   ├── learning-data-table.tsx     # Data table with search & pagination
│   ├── learning-columns.tsx        # Column definitions
│   └── learning-actions.tsx        # Row action dropdown (Edit, Kelola Materi, Kelola Kuis)
├── features/learning-module/
│   ├── actions/
│   │   ├── quiz-actions.ts         # Quiz CRUD server actions
│   │   └── materials.ts            # Materials & resources CRUD
│   └── types/
│       ├── quiz.ts                 # Quiz TypeScript interfaces
│       └── materials.ts            # Materials TypeScript interfaces
├── lib/learning/
│   ├── actions.ts                  # Module CRUD server actions
│   └── schemas.ts                  # Zod schemas & constants
```

---

## Security

| Route | Access Level | Protection |
|-------|-------------|------------|
| `/admin/learning` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/new` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/[id]/edit` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/[id]/quiz` | Admin only | `requireAdmin()` via layout |
| `/admin/learning/[id]/materials` | Admin only | `requireAdmin()` via layout |
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

# Manage materials & resources
http://localhost:3000/admin/learning/{module-id}/materials

# Grant admin role (SQL)
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';
```
