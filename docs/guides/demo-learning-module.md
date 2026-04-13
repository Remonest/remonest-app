# Demo Learning Module

## Overview

A complete demo learning module for end-to-end testing of the Remonest learning system.

**Module:** "Dasar-Dasar Remote Working"
**Slug:** `dasar-remote-working`
**Category:** Communication
**Difficulty:** Beginner
**Duration:** 30 minutes

## What's Included

| Component | Count | Details |
|-----------|-------|---------|
| Module | 1 | Published, beginner level |
| Lessons | 4 | 3 articles + 1 quiz |
| Materials | 3 | Article, article, tutorial |
| Resources | 1 | Notion template (free) |
| Quiz | 1 | 5 questions, 10 min, 70% passing |
| Auto-completion | 1 | For first admin user (enables certificate) |

## Prerequisites

### Unsplash Thumbnails

The demo module uses an Unsplash thumbnail image. Ensure `images.unsplash.com` is configured in `next.config.ts`:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};
```

**Restart the dev server** after changing `next.config.ts` — it's not hot-reloaded.

If you skip this, you'll see:
```
Invalid src prop on `next/image`, hostname "images.unsplash.com" is not configured
```

## Seed Instructions

### 1. Run the seed script

```bash
# Via Supabase CLI
npx supabase db execute -f scripts/seed-demo-module.sql

# Or via Supabase Dashboard → SQL Editor
# Copy-paste the entire contents of scripts/seed-demo-module.sql
```

### 2. Verify the data

```sql
-- Check module exists
SELECT id, slug, title, status, difficulty_level FROM learning_modules WHERE slug = 'dasar-remote-working';

-- Check lessons
SELECT order_index, title, lesson_type FROM module_lessons
WHERE module_id = (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working')
ORDER BY order_index;

-- Check materials
SELECT id, title, is_published, order_index FROM learning_materials
WHERE module_id = (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

-- Check quiz
SELECT qc.title, COUNT(q.id) as question_count
FROM quiz_configs qc
LEFT JOIN questions q ON q.quiz_config_id = qc.id
WHERE qc.module_id = (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working')
GROUP BY qc.title;

-- Check completion (certificate trigger)
SELECT ulp.user_id, ulp.progress, ulp.completed_at, up.full_name
FROM user_learning_progress ulp
JOIN user_profiles up ON up.id = ulp.user_id
WHERE ulp.module_id = (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working')
AND ulp.progress = 100;
```

## Full Demo Flow

```
Step 1: Browse
────────────────────────────────────
URL: /learning
→ Module appears in grid with:
  - Icon, category badge "Communication"
  - Title: "Dasar-Dasar Remote Working"
  - Description (truncated)
  - Duration: "30 min"

Step 2: Detail Page
────────────────────────────────────
URL: /learning/dasar-remote-working
→ Hero section with thumbnail
→ Curriculum timeline:
  ✓ 1. Apa Itu Remote Working? (preview)
  ✓ 2. Manajemen Waktu & Produktivitas
  ✓ 3. Tool Kolaborasi
  ✓ 4. Kuis Akhir
→ Materials section (3 cards)
→ Resources section (1 link)
→ Quiz preview (5 questions)
→ Enroll button

Step 3: Enroll & Complete
────────────────────────────────────
→ Click "Enroll" → progress saved
→ Click lessons → read content
→ Take quiz → need 70% to pass
→ On completion → progress = 100%, completed_at set

(If admin user exists, auto-completion is done by the seed script)

Step 4: Certificate
────────────────────────────────────
URL: /certificates/[id]
→ Certificate displays with:
  - User name
  - Module title
  - Completion date
  - Certificate ID (RMN-2026-XXXXX)
→ Actions:
  - 📥 Download Image (PNG via html2canvas)
  - 🖨️ Print (browser dialog)
  - 🔍 Zoom (fullscreen overlay)
  - 📋 Copy public link
  - 🔗 View Public Page

Step 5: Public Verification
────────────────────────────────────
URL: /verify/RMN-2026-XXXXX
(no login required)
→ Green shield: "Certificate Verified"
→ Shows: recipient name, module, date, ID
→ Anyone can confirm authenticity
```

## How Certificate ID is Generated

```
Certificate ID = RMN-{YEAR}-{HASH}
  HASH = abs(hashCode(userId + moduleId)) % 100000, zero-padded to 5 digits

Example:
  userId = "abc123"
  moduleId = "def456"
  hash("abc123def456") = -1234567890
  abs(-1234567890) % 100000 = 67890
  → RMN-2026-67890
```

The certificate is **derived** from `user_learning_progress` — there's no separate certificates table. Any row with `progress = 100 AND completed_at IS NOT NULL` generates a certificate.

## Delete (Cleanup)

When you're done with the demo, run this to remove all demo data:

### Quick Delete

```sql
-- Run in Supabase SQL Editor
DELETE FROM user_learning_progress
WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

DELETE FROM questions
WHERE quiz_config_id IN (SELECT id FROM quiz_configs WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working'));

DELETE FROM user_quiz_attempts
WHERE quiz_config_id IN (SELECT id FROM quiz_configs WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working'));

DELETE FROM module_reviews
WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

DELETE FROM module_lessons
WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

DELETE FROM learning_materials
WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

DELETE FROM learning_resources
WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

DELETE FROM quiz_configs
WHERE module_id IN (SELECT id FROM learning_modules WHERE slug = 'dasar-remote-working');

DELETE FROM learning_modules
WHERE slug = 'dasar-remote-working';
```

### Or use the cleanup script

```bash
# Run the cleanup SQL
npx supabase db execute -f scripts/cleanup-demo-module.sql
```

This cascades through all tables — module, lessons, materials, resources, quiz, questions, progress, reviews, attempts.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Module doesn't appear on `/learning` | `status` not `'published'` | Check `SELECT status FROM learning_modules WHERE slug = 'dasar-remote-working'` |
| Certificate not generated | No `user_learning_progress` with `progress=100` | Ensure seed script found an admin user, or manually insert progress row |
| Quiz shows 0 questions | `quiz_config_id` mismatch in `module_lessons` | Check `SELECT quiz_config_id FROM module_lessons WHERE lesson_type = 'quiz'` |
| Verification page shows "Not Found" | Certificate ID doesn't match | The ID is a hash of `userId + moduleId` — check `generateCertificateId()` logic |
| Materials don't render | `is_published = false` | Check `SELECT is_published FROM learning_materials WHERE module_id = ...` |
