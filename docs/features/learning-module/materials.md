# Learning Materials & Resources — Documentation

## Overview

Learning Materials dan Resources adalah sistem konten yang memungkinkan admin menambahkan materi pembelajaran yang kaya (artikel, video, dokumentasi, tutorial) dan resource tambahan (tools, template, ebook, checklist, cheatsheet, PDF) ke setiap modul pembelajaran.

**Current Version:** v1.1.0 | **Created:** April 11, 2026 | **Updated:** April 12, 2026

### Why Not `lessons` Table?

The original design proposed a `lessons` table as the parent for materials. However, the codebase has **no `lessons` table**. The `learning_modules` table is the smallest unit of content — it contains a single `content` TEXT (Markdown) column. Materials and resources **extend** modules with rich multimedia and external links rather than replacing the module structure.

```
learning_modules (existing)
  ├── content (TEXT, Markdown)          — original module content
  ├── thumbnail_url (TEXT)              — external URL
  │
  ├── learning_materials (NEW)          — articles, videos, docs per module
  ├── learning_resources (NEW)          — tools, templates, PDFs, links
  └── quiz_configs (existing)           — quiz per module
      └── questions (existing)
```

---

## 🔒 File Security

### Proxy Architecture

Uploaded files are **never exposed** as direct Supabase Storage URLs. Instead, they are served through a proxy route:

```
User uploads PDF → /api/upload → Supabase Storage → Returns: /api/learning/file/filename.pdf
                                                             ↓
User views PDF → iframe src="/api/learning/file/filename.pdf" → Proxy fetches from Supabase → Streams to browser
```

**Why this matters:**
- Direct Supabase URLs (`https://xxx.supabase.co/storage/v1/object/public/...`) can be copied from DevTools
- Proxy URLs (`/api/learning/file/filename.pdf`) don't reveal storage infrastructure
- `Content-Disposition: inline` header prevents browser download prompts
- Server-side streaming means the bucket name and credentials stay hidden

### File Size Limits

| Type | Limit | Enforced |
|------|-------|----------|
| PDF | 5MB | Client + Server |
| Images (JPEG/PNG/WebP/GIF) | 10MB | Client + Server |
| Documents (Word/Excel) | 10MB | Server |

### Allowed File Types

- `application/pdf` — PDF documents
- `image/jpeg`, `image/png`, `image/webp`, `image/gif` — Images
- `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` — Word
- `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` — Excel

---

## 🎯 Fitur Utama

### Learning Materials
- **Artikel** — Konten Markdown lengkap dengan summary
- **Video** — Link ke video pembelajaran eksternal
- **Dokumentasi** — Referensi dan dokumentasi teknis
- **Tutorial** — Panduan langkah demi langkah
- **Metadata** — Difficulty level, bahasa (ID/EN), estimasi waktu baca, tags
- **Publish Toggle** — Kontrol publikasi per materi

### Learning Resources
- **Tools** — Tools dan aplikasi pendukung
- **Template** — Template siap pakai (CV, proposal, dll)
- **E-book** — Buku digital dan panduan
- **Checklist** — Daftar periksa interaktif
- **Cheatsheet** — Ringkasan cepat
- **PDF** — Dokumen PDF yang dapat diunduh
- **Free/Paid Toggle** — Resource gratis atau berbayar

---

## 🗄️ Database Schema

### `learning_materials`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique material ID |
| `module_id` | UUID | FK → learning_modules(id), CASCADE | Parent learning module |
| `title` | TEXT | NOT NULL | Material title |
| `content` | TEXT | NULL | HTML or Markdown content |
| `summary` | TEXT | NULL | Brief Indonesian summary |
| `source_url` | TEXT | NULL | External source URL |
| `source_type` | TEXT | CHECK (article/video/documentation/tutorial) | Material type |
| `language` | TEXT | DEFAULT 'id' | 'id' = Indonesian, 'en' = English |
| `reading_time_minutes` | INT | NULL | Estimated reading time |
| `difficulty` | TEXT | DEFAULT 'beginner', CHECK (beginner/intermediate/advanced) | Difficulty level |
| `tags` | TEXT[] | NULL | Array of tags for filtering |
| `is_published` | BOOLEAN | DEFAULT false | Publication status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### `learning_resources`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique resource ID |
| `module_id` | UUID | FK → learning_modules(id), CASCADE | Parent learning module |
| `title` | TEXT | NOT NULL | Resource title |
| `description` | TEXT | NULL | Resource description |
| `url` | TEXT | NOT NULL | Resource URL (external link or file) |
| `resource_type` | TEXT | CHECK (tool/template/ebook/checklist/cheatsheet/pdf) | Resource type |
| `is_free` | BOOLEAN | DEFAULT true | Free or paid access |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

---

## 🔒 RLS Policies

### `learning_materials`

| Policy | Action | Condition |
|--------|--------|-----------|
| Public materials viewable | SELECT | `is_published = true` AND parent module `status = 'published'` |
| Admins manage materials | ALL | `is_admin()` (SECURITY DEFINER helper) |

### `learning_resources`

| Policy | Action | Condition |
|--------|--------|-----------|
| Public resources viewable | SELECT | Parent module `status = 'published'` |
| Admins manage resources | ALL | `is_admin()` (SECURITY DEFINER helper) |

---

## 📁 File Structure

```
src/
├── app/admin/learning/[id]/materials/
│   ├── page.tsx                      # Server component (route entry)
│   ├── material-list-client.tsx       # Client UI: stats, lists, actions
│   ├── material-form.tsx              # Material create/edit form (with file upload)
│   └── resource-form.tsx             # Resource create form
├── app/api/
│   ├── upload/route.ts               # File upload API → Supabase Storage
│   └── learning/file/[path]/route.ts # 🔒 File proxy (hides Supabase URL)
├── features/learning-module/
│   ├── actions/
│   │   └── materials.ts              # Server actions for materials CRUD
│   └── types/
│       └── materials.ts              # TypeScript interfaces
supabase/
└── migrations/
    └── 015_add_learning_files_storage.sql  # Storage bucket + file_url column
```

---

## 🔧 Server Actions

**File:** `src/features/learning-module/actions/materials.ts`

### Learning Materials

| Action | Signature | Description |
|--------|-----------|-------------|
| `getMaterialsByModuleId` | `(moduleId) → LearningMaterial[]` | Fetch all materials for a module |
| `getMaterialById` | `(id) → LearningMaterial \| null` | Fetch single material |
| `createLearningMaterial` | `(moduleId, input) → ActionResult` | Create new material |
| `updateLearningMaterial` | `(id, input) → ActionResult` | Update material fields |
| `deleteLearningMaterial` | `(id) → ActionResult` | Delete material |

### Learning Resources

| Action | Signature | Description |
|--------|-----------|-------------|
| `getResourcesByModuleId` | `(moduleId) → LearningResource[]` | Fetch all resources for a module |
| `getResourceById` | `(id) → LearningResource \| null` | Fetch single resource |
| `createLearningResource` | `(moduleId, input) → ActionResult` | Create new resource |
| `updateLearningResource` | `(id, input) → ActionResult` | Update resource fields |
| `deleteLearningResource` | `(id) → ActionResult` | Delete resource |

### Validation Rules

**Material Schema:**
- `title` — required, min 1 character
- `sourceUrl` — must be valid URL (or empty)
- `sourceType` — one of: article, video, documentation, tutorial
- `difficulty` — one of: beginner, intermediate, advanced
- `language` — any string (default: 'id')
- `tags` — comma-separated string, split into array on save

**Resource Schema:**
- `title` — required, min 1 character
- `url` — required, must be valid URL
- `resourceType` — one of: tool, template, ebook, checklist, cheatsheet, pdf
- `isFree` — boolean (default: true)

---

## 🎨 Admin UI

### Route: `/admin/learning/[id]/materials`

**Page Layout:**
```
┌─────────────────────────────────────────────────┐
│ ← [Module Title]                                │
│ Kelola materi dan resource pembelajaran         │
├─────────────────────────────────────────────────┤
│ [Total Materi] [Terpublikasi] [Total Resource]  │
│ [Gratis]                                        │
├─────────────────────────────────────────────────┤
│ 📄 Materi Pembelajaran            [+ Tambah]    │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Title] [Terbit] [Artikel] [beginner]       │ │
│ │ Summary text...                              │ │
│ │ 10 menit 🇮🇩 id #remote #komunikasi         │ │
│ │                        [👁️] [✏️] [🗑️]        │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Title] [Draft] [Video] [intermediate]      │ │
│ │ ...                                          │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ 🔗 Resource Tambahan            [+ Tambah]      │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Title] [Template] [Gratis]                 │ │
│ │ Description text...                          │ │
│ │ https://example.com/template                 │ │
│ │                                        [🗑️]  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Material Form

**Fields:**
1. **Judul Materi** (required) — text input
2. **Ringkasan** — textarea (2 rows, Bahasa Indonesia summary)
3. **Konten (Markdown)** — textarea (8 rows, monospace font)
4. **Tipe Sumber** — select (Artikel/Video/Dokumentasi/Tutorial)
5. **URL Sumber** — URL input
6. **Tingkat Kesulitan** — select (Beginner/Intermediate/Advanced)
7. **Bahasa** — select (🇮🇩 Indonesia / 🇬🇧 English)
8. **Estimasi Waktu Baca** — number input (minutes)
9. **Tags** — text input (comma-separated)
10. **Publikasikan** — toggle switch

### Resource Form

**Fields:**
1. **Judul Resource** (required) — text input
2. **Deskripsi** — textarea (3 rows)
3. **URL** (required) — URL input
4. **Tipe Resource** — select (Tools/Template/E-book/Checklist/Cheatsheet/PDF)
5. **Gratis** — toggle switch

---

## 🚀 How to Use

### 1. Run Database Migration

```bash
supabase db push
```

Or manually apply `supabase/migrations/014_add_learning_materials_and_resources.sql`.

### 2. Access Materials Manager

1. Navigate to **Admin Panel → Learning Modules**
2. Find a module and click the **⋮ (More)** button
3. Select **"Kelola Materi"** from the dropdown
4. Or navigate directly to `/admin/learning/{module-id}/materials`

### 3. Add Learning Material

1. Click **"Tambah Materi"** button
2. Fill in the form:
   - Title (required)
   - Summary (optional, in Bahasa Indonesia)
   - Content in Markdown format
   - Source type and URL (for external references)
   - Difficulty level and language
   - Reading time estimate and tags
3. Toggle "Publikasikan" to make it visible to users
4. Click **"Simpan Materi"**

### 4. Add Resource

1. Click **"Tambah Resource"** button
2. Fill in:
   - Title (required)
   - Description
   - URL (required, must be valid URL)
   - Resource type
3. Toggle "Gratis" if the resource is free
4. Click **"Simpan Resource"**

### 5. Manage Existing Materials

- **Toggle publish status** — Click the eye icon (👁️) to publish/unpublish
- **Edit** — Click the pencil icon (✏️) to open edit dialog
- **Delete** — Click the trash icon (🗑️) with confirmation

---

## 📝 Type Definitions

```typescript
type SourceType = "article" | "video" | "documentation" | "tutorial";
type ResourceFileType = "tool" | "template" | "ebook" | "checklist" | "cheatsheet" | "pdf";
type MaterialDifficulty = "beginner" | "intermediate" | "advanced";

interface LearningMaterial {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  source_type: SourceType | null;
  language: string;
  reading_time_minutes: number | null;
  difficulty: MaterialDifficulty;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface LearningResource {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  url: string;
  resource_type: ResourceFileType | null;
  is_free: boolean;
  created_at: string;
}
```

---

## 🔗 Related Documentation

- [Learning Module Overview](./overview.md)
- [Quiz Builder Guide](./quiz-builder.md)
- [Database Architecture](../../architecture/database.md)
- [Migration 014 Details](../../guides/database-migrations.md#migration-014-add_learning_materials_and_resources)
- [Admin Access Guide](../../guides/admin-access.md)

---

## 🐛 Known Issues & TODOs

- [ ] User-facing learning module detail page showing materials (currently admin-only)
- [ ] Markdown rendering for material content (stored but not rendered)
- [ ] File upload support for PDFs and resources (currently external URLs only)
- [ ] Resource edit functionality (currently only create + delete)
- [ ] Material reordering (drag & drop)
- [ ] Bulk import materials from CSV/JSON
- [ ] Reading progress tracking per material
- [ ] Video embed support (currently external links only)

---

**Created:** April 11, 2026
**Version:** v1.0.0
**Migration:** 014_add_learning_materials_and_resources
**Status:** ✅ Production Ready (requires migration)
