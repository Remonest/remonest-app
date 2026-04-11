# Seeding Learning Materials — Guide

How to populate learning materials in the database with Indonesian educational content.

---

## 📋 Overview

The Remonest learning system stores materials in the `learning_materials` table. Each material is linked to a `learning_modules` record via `module_id`.

**Current Content:**
| # | Title | Module | Language | Chars | Status |
|---|-------|--------|----------|-------|--------|
| 1 | Panduan Lengkap Bekerja dari Rumah untuk Pemula | Remote Working Basics | Bahasa Indonesia | 8,260 | Published |
| 2 | Panduan Memulai Karir Freelance untuk Pemula | Skill Freelance | Bahasa Indonesia | 7,848 | Published |

---

## 🚀 Method 1: JavaScript Seed Script (Recommended)

### Prerequisites

```bash
# Ensure dependencies are installed
pnpm install

# Verify env vars exist in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run the Seed Script

```bash
node scripts/seed-learning-materials-id.js
```

### What It Does

1. **Deletes** old raw English scraped content (Buffer.com articles)
2. **Finds** module IDs for `remote-working-basics` and `skill-freelance`
3. **Inserts** 2 Indonesian educational materials with full Markdown content
4. **Verifies** the insert by querying and printing results

### Expected Output

```
✅ Deleted old Buffer materials
✅ Saved Material 1 (Remote Work) — ID: <uuid> (8260 chars)
✅ Saved Material 2 (Freelance) — ID: <uuid> (7848 chars)

📊 Bahasa Indonesia Materials in DB: 2

1. Panduan Lengkap Bekerja dari Rumah untuk Pemula
   ID: <uuid>
   Content: 8260 chars
   Language: id

2. Panduan Memulai Karir Freelance untuk Pemula
   ID: <uuid>
   Content: 7848 chars
   Language: id
```

---

## 🔧 Method 2: Supabase SQL Editor

### Steps

1. Go to your Supabase dashboard: https://rfmvxdtjeyjfqukgtdyc.supabase.co
2. Navigate to **SQL Editor** → **New Query**
3. Copy the contents of `scripts/seed-learning-materials-id.sql`
4. Paste into the editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify no errors in the output panel

### What the SQL Does

The SQL script uses PostgreSQL `DO` blocks to:
1. Find the `module_id` for each learning module by slug
2. Delete old raw Buffer.com content
3. Insert Indonesian materials with full Markdown content
4. Each material includes: title, content, summary, source_url, tags, difficulty, reading time

### SQL Structure

```sql
DO $$
DECLARE
  v_module_id UUID;
BEGIN
  SELECT id INTO v_module_id FROM learning_modules WHERE slug = 'remote-working-basics';
  
  IF v_module_id IS NULL THEN
    RAISE EXCEPTION 'Module not found!';
  END IF;

  -- Delete old content
  DELETE FROM learning_materials WHERE source_url LIKE 'https://buffer.com%';

  -- Insert new material
  INSERT INTO learning_materials (
    module_id, title, content, summary, source_type,
    language, reading_time_minutes, difficulty, tags, is_published
  ) VALUES (
    v_module_id,
    'Panduan Lengkap Bekerja dari Rumah untuk Pemula',
    '# Markdown content...',
    'Summary in Bahasa Indonesia',
    'article',
    'id',
    15,
    'beginner',
    ARRAY['remote work', 'produktivitas', 'komunikasi'],
    true
  );
END $$;
```

---

## 🌐 Method 3: Web Scraping + AI Generation (Future)

### Requirements

- `OPENAI_API_KEY` in `.env.local`
- Working source URLs (most sites block scraping)

### Run the Scraper

```bash
node scripts/content-collector.js
```

### How It Works

1. **Tries Cheerio** — Lightweight HTML scraping (fast)
2. **Falls back to Puppeteer** — Headless Chromium for JS-rendered sites
3. **Summarizes with OpenAI** — Creates Indonesian summary
4. **Generates full content** — Structured Markdown educational content
5. **Saves to DB** — Inserts into `learning_materials` table

### Current Limitations

- Most mainstream sites (Forbes, Indeed, HubSpot, Atlassian, HBR) block scraping with 403/anti-bot
- Only Buffer.com works reliably with Cheerio
- Without `OPENAI_API_KEY`, content is raw scraped text (not structured educational content)

---

## 📊 Verifying Content

### Check Materials via Script

```bash
node scripts/check-materials.js
```

### Check via Supabase Dashboard

1. Go to **Table Editor** → `learning_materials`
2. Verify rows with `language = 'id'`
3. Check `content` column for proper Markdown formatting

### Check via SQL

```sql
SELECT 
  id, 
  title, 
  source_url, 
  language,
  difficulty,
  is_published,
  length(content) as content_chars
FROM learning_materials
ORDER BY created_at DESC;
```

---

## 🗑️ Cleaning Up

### Delete All Materials

```sql
DELETE FROM learning_materials;
```

### Delete Specific Language

```sql
DELETE FROM learning_materials WHERE language = 'en';
```

### Delete by Source URL Pattern

```sql
DELETE FROM learning_materials WHERE source_url LIKE '%buffer.com%';
```

### Cleanup Script

```bash
node scripts/cleanup-materials.js
```

---

## 📝 Content Structure

Each learning material follows this structure:

```markdown
# Title

## Pendahuluan
Brief introduction in Bahasa Indonesia.

## Section 1
Content with:
- Bullet points
- Tables for comparisons
- Numbered lists for steps

## Section 2
More structured content...

## Kesimpulan
Summary and key takeaways.

## Daftar Istilah Penting
| Term | Definition |
|------|------------|
| ... | ... |

## Rekomendasi Tools & Resources
- **Tool Name** — URL
- ...
```

### Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `module_id` | UUID | FK to `learning_modules.id` |
| `title` | TEXT | Material title (Bahasa Indonesia) |
| `content` | TEXT | Full Markdown content |
| `summary` | TEXT | Brief summary (150-200 words) |
| `source_url` | TEXT | Original source URL |
| `source_type` | TEXT | article/video/documentation/tutorial |
| `language` | TEXT | 'id' or 'en' |
| `reading_time_minutes` | INT | Estimated reading time |
| `difficulty` | TEXT | beginner/intermediate/advanced |
| `tags` | TEXT[] | Array of tags |
| `is_published` | BOOLEAN | Whether visible to users |

---

## 🔗 Related Documentation

- [Learning Module Overview](../features/learning-module/overview.md)
- [Materials & Resources](../features/learning-module/materials.md)
- [Database Migrations](./database-migrations.md)
- [Migration 014](./database-migrations.md#migration-014-add_learning_materials_and_resources)

---

**Last Updated:** April 11, 2026
**Status:** ✅ 2 materials seeded (Bahasa Indonesia)
