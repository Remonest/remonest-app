# Migration Naming Quick Reference

## 📝 Format

```
{number}_{action}_{subject}.sql
```

**Example:** `013_add_quiz_system.sql`

---

## ✅ Quick Checklist

Before creating a migration, verify:

- [ ] Check highest existing number: `ls supabase/migrations/ | sort | tail -n 1`
- [ ] Increment by 1 (no gaps, no duplicates)
- [ ] Use 3-digit zero-padded number (001, 002, ..., 013, ...)
- [ ] Use lowercase with underscores only
- [ ] Be descriptive but concise (max 40 chars)
- [ ] Add header comment with description and dependencies
- [ ] Include rollback instructions

---

## 🎯 Standard Actions

| Action | Use For | Example |
|--------|---------|---------|
| `create` | New tables/enums | `001_create_user_profiles.sql` |
| `add` | New features/tables | `013_add_quiz_system.sql` |
| `alter` | Modify structure | `alter_users_add_avatar.sql` |
| `fix` | Bug fixes | `012_fix_rls_recursion.sql` |
| `seed` | Sample data | `004_seed_admin_users.sql` |
| `update` | Data/policy updates | `update_admin_permissions.sql` |
| `drop` | Remove objects | `drop_temp_table.sql` |
| `complete` | Finalize features | `011_complete_rls_policies.sql` |
| `make` | Make fields optional | `008_make_apply_fields_optional.sql` |

---

## ✅ DO

```bash
# ✅ Zero-padded, sequential numbers
001_create_user_profiles.sql
002_create_dashboard_tables.sql
012_fix_rls_recursion.sql
013_add_quiz_system.sql

# ✅ Descriptive, specific names
003_create_jobs_table.sql
009_add_client_role.sql
011_complete_rls_policies.sql
```

## ❌ DON'T

```bash
# ❌ Not zero-padded
1_create_users.sql

# ❌ Wrong digit count
01_create_users.sql
002_create_users.sql

# ❌ Duplicate numbers!
012_fix_rls_recursion.sql
012_add_quiz_system.sql        # CONFLICT!

# ❌ Gaps in sequence
010_something.sql
012_something.sql              # Skipped 011!

# ❌ Wrong format
013_createQuizSystem.sql       # camelCase
013 create quiz system.sql     # spaces
013-Create-Quiz-System.sql     # hyphens & uppercase
013_20260411_add_quiz.sql      # date in filename
```

---

## 📋 File Header Template

```sql
-- ============================================================
-- Migration: 013_add_quiz_system
-- Created: April 11, 2026
-- Description: Add quiz/assessment functionality to learning modules
-- Dependencies: 012 (requires previous migrations)
-- ============================================================

-- Your migration SQL here

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- DROP TABLE IF EXISTS public.quiz_configs CASCADE;
-- DROP TABLE IF EXISTS public.questions CASCADE;
-- DROP TABLE IF EXISTS public.user_quiz_attempts CASCADE;
```

---

## 🔍 Common Mistakes

### Mistake 1: Duplicate Number
```bash
# Problem
012_fix_rls_recursion.sql
012_quiz_system.sql          # ❌ DUPLICATE!

# Solution
mv 012_quiz_system.sql 013_add_quiz_system.sql
```

### Mistake 2: Vague Name
```sql
-- Problem
013_update.sql               # ❌ Update what?
014_fix.sql                  # ❌ Fix what?

-- Solution
013_update_user_permissions.sql
014_fix_rls_policy.sql
```

### Mistake 3: Wrong Order
```bash
# Problem
003_create_jobs.sql
002_create_users.sql         # ❌ Out of order!

# Solution
mv 002_create_users.sql 001_create_users.sql
mv 003_create_jobs.sql 002_create_jobs.sql
```

---

## 🚀 Workflow

```bash
# 1. Check existing migrations
ls supabase/migrations/ | sort

# 2. Find next number
# If highest is 013 → use 014

# 3. Create migration file
touch supabase/migrations/014_add_user_notifications.sql

# 4. Add header comment
# Use template above

# 5. Write migration SQL

# 6. Test locally
supabase db push

# 7. Commit to git
git add supabase/migrations/014_add_user_notifications.sql
git commit -m "feat: add user notifications table"
```

---

## 📚 Full Guide

See [Database Migrations Guide](./database-migrations.md) for complete documentation.

---

**Last Updated:** April 11, 2026
**Current Version:** 014
**Status:** ✅ Active
