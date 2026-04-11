# Database Migrations Guide

Complete guide to all database migrations in the Remonest App.

---

## 📋 Table of Contents

1. [Migration Overview](#migration-overview)
2. [Naming Conventions](#naming-conventions) ⭐ **NEW**
3. [Migration List](#migration-list)
4. [Detailed Migration Descriptions](#detailed-migration-descriptions)
5. [Migration Dependencies](#migration-dependencies)
6. [How to Apply Migrations](#how-to-apply-migrations)
7. [Rollback Instructions](#rollback-instructions)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Migration Overview

**Total Migrations:** 13
**Database:** PostgreSQL (Supabase)
**Migration Tool:** Supabase CLI
**Latest Migration:** 013 (add_quiz_system)
**Naming Convention:** `{number}_{action}_{subject}.sql`

---

## 🏷️ Naming Conventions

### Standard Format

```
{number}_{action}_{subject}.sql
```

**Example:** `013_add_quiz_system.sql`

### Components Explained

#### 1. **Number** (3 digits, zero-padded)
- **Format:** `001`, `002`, `003`, ..., `010`, `011`, ..., `999`
- **Purpose:** Ensures correct alphabetical sorting = execution order
- **Rule:** Must be sequential, no gaps, no duplicates

✅ **Good:**
```
001_create_user_profiles.sql
002_create_dashboard_tables.sql
012_fix_rls_recursion.sql
013_add_quiz_system.sql
```

❌ **Bad:**
```
1_create_users.sql          # Not zero-padded
01_create_users.sql         # Not 3 digits
002_create_users.sql        # Duplicate number!
003_create_jobs.sql         # Gap in sequence (skipped 002)
```

#### 2. **Action** (lowercase, descriptive verb)
Describes **what** the migration does. Use these standard actions:

| Action | When to Use | Example |
|--------|-------------|---------|
| `create` | Create new table/enum/type | `001_create_user_profiles.sql` |
| `add` | Add new feature/table/column | `013_add_quiz_system.sql` |
| `alter` | Modify existing structure | `alter_users_add_avatar.sql` |
| `drop` | Remove table/column | `drop_unused_temp_table.sql` |
| `fix` | Fix bug/issue/recursion | `012_fix_rls_recursion.sql` |
| `update` | Update data/policies | `update_admin_permissions.sql` |
| `seed` | Insert sample/initial data | `004_seed_admin_users.sql` |
| `remove` | Remove feature/column | `remove_deprecated_fields.sql` |
| `rename` | Rename table/column | `rename_user_id_to_id.sql` |
| `complete` | Finalize/complete feature | `011_complete_rls_policies.sql` |
| `make` | Make field optional/nullable | `008_make_apply_fields_optional.sql` |
| `disable` | Disable feature | `005_disable_email_verification.sql` |

#### 3. **Subject** (lowercase, snake_case)
Describes **what is being modified**. Be specific but concise.

✅ **Good:**
```
001_create_user_profiles.sql        # Clear: creating user_profiles table
003_create_jobs_table.sql           # Clear: creating jobs table
009_add_client_role.sql             # Clear: adding client role
012_fix_rls_recursion.sql           # Clear: fixing RLS recursion issue
```

❌ **Bad:**
```
001_users.sql                       # Missing action verb
002_dashboard.sql                   # Too vague
003_jobs.sql                        # What about jobs?
012_fix.sql                         # Fix what?
013_add_stuff.sql                   # Too generic
```

### Naming Rules

#### ✅ DO:

1. **Use 3-digit zero-padded numbers**
   ```
   001_, 002_, ..., 010_, 011_, ..., 100_
   ```

2. **Use lowercase with underscores**
   ```
   create_user_profiles.sql
   add_quiz_system.sql
   ```

3. **Be descriptive but concise (max 40 chars)**
   ```
   013_add_quiz_system.sql           # ✅ Good
   013_add_quiz_system_with_questions_and_attempts.sql  # ❌ Too long
   ```

4. **Include the table/feature name**
   ```
   003_create_jobs_table.sql         # ✅ Clear
   003_create_table.sql              # ❌ Vague
   ```

5. **Check for existing numbers before creating**
   ```bash
   # List existing migrations
   ls supabase/migrations/
   
   # Find highest number
   ls supabase/migrations/ | sort | tail -n 1
   ```

6. **Add header comment in file**
   ```sql
   -- ============================================================
   -- Migration: 013_add_quiz_system
   -- Created: April 11, 2026
   -- Description: Add quiz/assessment functionality
   -- Dependencies: 012 (requires previous migrations)
   -- ============================================================
   ```

#### ❌ DON'T:

1. **Never reuse migration numbers**
   ```
   012_fix_rls_recursion.sql     # Already exists!
   012_add_quiz_system.sql       # ❌ CONFLICT! Use 013 instead
   ```

2. **Don't skip numbers**
   ```
   010_something.sql
   012_something.sql             # ❌ Skipped 011!
   ```

3. **Don't use camelCase or spaces**
   ```
   013_createQuizSystem.sql      # ❌ camelCase
   013 create quiz system.sql    # ❌ spaces
   013-create-quiz-system.sql    # ❌ hyphens
   ```

4. **Don't use uppercase**
   ```
   013_Create_Quiz_System.sql    # ❌ uppercase
   ```

5. **Don't use dates in filename** (use in header comment instead)
   ```
   013_20260411_add_quiz.sql    # ❌ date in filename
   ```

6. **Don't rename migration files after applying**
   ```
   # If migration is already applied in Supabase, DON'T rename it!
   # This will break migration tracking
   ```

### Common Mistakes & Solutions

#### Mistake 1: Duplicate Numbers

**Problem:**
```
012_fix_rls_recursion.sql
012_quiz_system.sql           # ❌ Duplicate!
```

**Solution:**
```bash
# Rename to next available number
mv 012_quiz_system.sql 013_add_quiz_system.sql
```

#### Mistake 2: Wrong Order

**Problem:**
```
003_create_jobs.sql
002_create_users.sql        # ❌ Out of order!
```

**Solution:**
```bash
# Rename to correct sequence
mv 002_create_users.sql 001_create_users.sql
mv 003_create_jobs.sql 002_create_jobs.sql
```

#### Mistake 3: Vague Names

**Problem:**
```
013_update.sql              # ❌ Update what?
014_fix.sql                 # ❌ Fix what?
```

**Solution:**
```sql
013_update_user_permissions.sql   # ✅ Specific
014_fix_rls_policy.sql            # ✅ Specific
```

### Migration Header Template

Every migration file should start with this header:

```sql
-- ============================================================
-- Migration: {number}_{action}_{subject}
-- Created: {Month Day, Year}
-- Description: {Brief description of what this migration does}
-- Dependencies: {List any migrations this depends on, or "None"}
-- Rollback: {Brief rollback instructions}
-- ============================================================

-- Migration SQL goes here

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback this migration:
-- DROP TABLE IF EXISTS public.table_name CASCADE;
-- DROP FUNCTION IF EXISTS public.function_name() CASCADE;
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '{number}';
```

### Checklist Before Creating Migration

Before creating a new migration file, verify:

- [ ] **Check highest existing number**
  ```bash
  ls supabase/migrations/ | sort | tail -n 1
  ```

- [ ] **Increment by 1** (no gaps)
  ```
  If highest is 013 → new migration is 014
  ```

- [ ] **Follow naming format**
  ```
  {number}_{action}_{subject}.sql
  ```

- [ ] **Use lowercase only**
  ```
  014_add_user_notifications.sql
  ```

- [ ] **Add header comment**
  ```sql
  -- Migration: 014_add_user_notifications
  -- Created: April 11, 2026
  -- Description: ...
  ```

- [ ] **Include rollback instructions**
  ```sql
  -- Rollback: DROP TABLE IF EXISTS public.user_notifications CASCADE;
  ```

- [ ] **Test locally first**
  ```bash
  supabase start
  supabase db push
  ```

---

---

## 📋 Migration List

| # | Name | Date | Purpose | Status |
|---|------|------|---------|--------|
| 001 | `create_user_profiles` | Apr 7, 2026 | User profile table with RLS | ✅ Applied |
| 002 | `create_dashboard_tables` | Apr 7, 2026 | Dashboard tables (jobs, applications, learning, settings) | ✅ Applied |
| 003 | `create_jobs_table` | Apr 7, 2026 | Complete job board schema with workflow | ✅ Applied |
| 004 | `seed_admin_users` | Apr 7, 2026 | Initial admin user seed data | ✅ Applied |
| 005 | `disable_email_verification` | Apr 7, 2026 | Disable email confirmation for testing | ✅ Applied |
| 006 | `fix_rls_recursion` | Apr 7, 2026 | Fix first RLS recursion issue | ✅ Applied |
| 007 | `fix_remaining_rls_recursion` | Apr 7, 2026 | Fix remaining RLS recursion issues | ✅ Applied |
| 008 | `make_apply_fields_optional` | Apr 7, 2026 | Make job application fields nullable | ✅ Applied |
| 009 | `add_client_role` | Apr 8, 2026 | Add client role for employers | ✅ Applied |
| 010 | `make_is_verified_by_admin_nullable` | Apr 8, 2026 | Make verification field nullable | ✅ Applied |
| 011 | `complete_rls_policies` | Apr 10, 2026 | Complete RLS + admin audit trail | ✅ Applied |
| 012 | `fix_rls_recursion` | Apr 10, 2026 | Fix final RLS recursion with SECURITY DEFINER | ✅ Applied |
| 013 | `add_quiz_system` | Apr 11, 2026 | Quiz/assessment system for learning modules | ⏳ Pending |

---

## 📝 Detailed Migration Descriptions

### Migration 001: create_user_profiles

**Purpose:** Create the user profiles table with role-based access control.

**Tables Created:**
- `user_profiles` - Extended user information with roles

**Key Features:**
- Foreign key to `auth.users`
- Role CHECK constraint: `user`, `admin` (later expanded)
- Auto-create trigger on user signup
- RLS policies for profile access

**Indexes:**
- `idx_user_profiles_role` - For role-based queries

**RLS Policies:**
- Users can view own profile
- Users can update own profile (cannot change role)
- Admins can view all profiles
- Service role can insert profiles

**Trigger:**
- `handle_new_user()` - Auto-create profile on signup

---

### Migration 002: create_dashboard_tables

**Purpose:** Create all tables needed for dashboard functionality.

**Tables Created:**
- `jobs` (initial version) - Job listings
- `job_applications` - User job applications
- `learning_modules` - Educational content
- `user_learning_progress` - Progress tracking
- `user_settings` - User preferences
- `activity_log` - User activity feed

**Key Features:**
- Comprehensive enum types for statuses
- CASCADE deletes for data integrity
- Auto-create trigger for user_settings
- Helper function: `log_user_activity()`

**RLS Policies:**
- Ownership-based access for all tables
- Admin override policies
- Public read for published content

---

### Migration 003: create_jobs_table

**Purpose:** Complete job board schema with dual posting workflow.

**Tables Created:**
- `jobs` (replaces initial version) - Full job schema

**Enum Types:**
- `job_type_enum`: full-time, part-time, project, freelance
- `job_status_enum`: draft, pending, approved, rejected, published, expired
- `apply_method_enum`: url, email

**Key Features:**
- Salary validation constraints
- Deadline validation
- Auto-update timestamp trigger
- 7 indexes for performance
- Sample jobs for testing

**RLS Policies:**
- Public can read published jobs
- Users can manage own jobs
- Admins can manage all jobs

**Function:**
- `expire_old_jobs()` - Auto-expire jobs past deadline

---

### Migration 004: seed_admin_users

**Purpose:** Seed initial admin users for testing.

**Data Inserted:**
- Sample admin user records

**Note:** This migration is idempotent (safe to re-run).

---

### Migration 005: disable_email_verification

**Purpose:** Disable email confirmation for easier testing.

**Changes:**
- Modified auth settings to skip email verification

**Note:** Should be reverted for production.

---

### Migration 006: fix_rls_recursion

**Purpose:** Fix first instance of infinite recursion in RLS policies.

**Problem:**
RLS policies on `user_profiles` were querying `user_profiles` itself, creating infinite loops.

**Solution:**
- Dropped recursive policies
- Created non-recursive alternatives
- Used subqueries with explicit role checks

---

### Migration 007: fix_remaining_rls_recursion

**Purpose:** Fix remaining RLS recursion issues in other tables.

**Tables Updated:**
- All tables with recursive policy patterns

**Solution:**
- Replaced recursive policies with direct checks
- Simplified policy logic
- Maintained security model

---

### Migration 008: make_apply_fields_optional

**Purpose:** Make job application fields nullable for flexibility.

**Columns Modified:**
- `job_applications.cover_letter` → nullable
- `job_applications.resume_url` → nullable
- `job_applications.notes` → nullable

**Reason:**
Not all job applications require cover letters or resumes.

---

### Migration 009: add_client_role

**Purpose:** Add client role for employers/job posters.

**Changes:**
- Updated `user_profiles.role` CHECK constraint
- Added `client` to allowed roles: `user`, `admin`, `client`
- Updated `handle_new_user()` trigger to support client role
- Added RLS policy for clients to view all profiles

**Role Definitions:**
- `user`: Standard job seeker (blue badge)
- `admin`: Full administrative access (red badge)
- `client`: Employer/job poster (green badge)

---

### Migration 010: make_is_verified_by_admin_nullable

**Purpose:** Make verification field support three states.

**Column Modified:**
- `jobs.is_verified_by_admin` → nullable BOOLEAN

**New Semantics:**
- `NULL` = Pending review
- `TRUE` = Verified by admin
- `FALSE` = Rejected

**Reason:**
Supports the job approval workflow with clear pending state.

---

### Migration 011: complete_rls_policies

**Purpose:** Complete RLS implementation with admin audit trail.

**Tables Created:**
- `admin_actions` - Immutable audit trail

**Enum Types:**
- `admin_action_type_enum`: 12 action types

**Functions Created:**
- `log_admin_action()` - Manual logging helper
- `log_admin_job_actions()` - Trigger function for jobs
- `log_admin_learning_module_actions()` - Trigger function for learning modules

**Triggers Created:**
- `log_admin_job_actions_trigger` on `jobs` table
- `log_admin_learning_module_actions_trigger` on `learning_modules` table

**Views Created:**
- `recent_admin_actions` - Last 100 admin actions with user details
- `admin_action_summary` - Action type statistics

**RLS Policies:**
- 35+ policies across all 8 tables
- Complete role-based access (admin/user/client)
- Immutable audit trail (no UPDATE/DELETE on admin_actions)

**Note:** This migration introduced a recursion issue fixed in 012.

---

### Migration 012: fix_rls_recursion

**Purpose:** Fix infinite recursion in user_profiles RLS policies using SECURITY DEFINER functions.

**Functions Created:**
- `is_admin()` - Check if current user is admin (bypasses RLS)
- `is_client()` - Check if current user is client (bypasses RLS)
- `get_user_role()` - Get current user's role (bypasses RLS)

**Why SECURITY DEFINER?**
- Functions run with creator's permissions
- Bypass RLS policies
- Prevent infinite recursion
- Maintain security model

**Policies Updated:**
- All policies on `user_profiles` to use helper functions
- All policies on other tables using `is_admin()`
- Total: 35+ policies updated

**Before:**
```sql
-- ❌ Recursive
USING (EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin'))
```

**After:**
```sql
-- ✅ No recursion
USING (is_admin())
```

---

## 🔗 Migration Dependencies

```
001_create_user_profiles
  ↓
002_create_dashboard_tables
  ↓
003_create_jobs_table (replaces jobs from 002)
  ↓
004_seed_admin_users
  ↓
005_disable_email_verification
  ↓
006_fix_rls_recursion
  ↓
007_fix_remaining_rls_recursion
  ↓
008_make_apply_fields_optional
  ↓
009_add_client_role
  ↓
010_make_is_verified_by_admin_nullable
  ↓
011_complete_rls_policies
  ↓
012_fix_rls_recursion (FINAL - Stable)
```

**Important:** Migrations must be applied in order. Do not skip migrations.

---

## 🚀 How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
# Check current migration status
supabase db remote --list

# Apply all pending migrations
supabase db push

# Verify migrations applied
supabase db remote --list
```

### Option 2: Using Supabase Dashboard

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy contents of migration file (e.g., `012_fix_rls_recursion.sql`)
4. Click **Run** (or press Ctrl+Enter)
5. Verify success (no errors)

### Option 3: Apply All at Once

```bash
# Reset and apply all (WARNING: Deletes all data!)
supabase db reset

# Or push only pending migrations
supabase db push
```

---

## 🔄 Rollback Instructions

### Rollback Single Migration

```sql
-- Each migration file includes rollback instructions at the bottom
-- Example for migration 012:

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_client() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
```

### Rollback Multiple Migrations

```sql
-- Remove from migration tracking
DELETE FROM supabase_migrations.schema_migrations 
WHERE version IN ('011', '012');

-- Then manually drop created objects
-- See individual migration rollback sections
```

### Full Database Reset

```bash
# WARNING: This deletes all data!
supabase db reset
```

---

## 🐛 Troubleshooting

### Issue: Migration Already Exists

**Symptom:** `ERROR: relation "xxx" already exists`

**Solution:**
```sql
-- Check migration tracking
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;

-- If migration was partially applied, drop objects and re-run
DROP POLICY IF EXISTS "xxx" ON table_name;
-- Then re-apply migration
```

### Issue: Foreign Key Constraint Fails

**Symptom:** `ERROR: insert or update on table violates foreign key constraint`

**Cause:** Referenced table/record doesn't exist

**Solution:**
- Ensure migrations are applied in order
- Check that prerequisite migrations completed successfully

### Issue: RLS Blocking Operations

**Symptom:** `ERROR: new row violates row-level security policy`

**Solution:**
```sql
-- Check RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'table_name';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- If using service role, ensure you're using correct client
const supabase = getSupabaseServiceClient(); // Bypasses RLS
```

### Issue: Enum Type Conflicts

**Symptom:** `ERROR: invalid input value for enum "xxx"`

**Solution:**
```sql
-- Check enum values
SELECT enum_range(NULL::your_enum_type);

-- Add new value if needed
ALTER TYPE your_enum_type ADD VALUE 'new_value';
```

---

## 📊 Migration Statistics

| Metric | Value |
|--------|-------|
| Total Migrations | 13 |
| Tables Created | 11 |
| Enum Types | 6 |
| RLS Policies | 50+ |
| Triggers | 10 |
| Functions | 12+ |
| Views | 2 |
| Indexes | 20+ |

---

## 📚 Related Documentation

- **[Database Architecture](../architecture/database.md)** - Complete schema reference
- **[RLS Policies Guide](../guides/rls-policies.md)** - Complete RLS reference
- **[RLS Recursion Fix](../guides/rls-recursion-fix.md)** - Migration 012 details
- **[Quiz Builder Guide](../features/learning-module/quiz-builder.md)** - Migration 013 details
- **[Migration Guide](../scripts/MIGRATION_GUIDE.md)** - Step-by-step instructions
- **[Admin Action Logging](../guides/admin-action-logging.md)** - Audit trail details

---

## 📝 Migration Template

When creating new migrations, follow this template:

```sql
-- ============================================================
-- Migration: {number}_{action}_{subject}
-- Created: {date}
-- Description: {what this migration does}
-- Dependencies: {list dependencies or "None"}
-- ============================================================

-- ↑ Migration steps above
-- ↓ Rollback steps below

-- Rollback: {description}
-- Uncomment to rollback:
-- DROP TABLE IF EXISTS public.table_name CASCADE;
-- DROP FUNCTION IF EXISTS public.function_name() CASCADE;
```

---

**Last Updated:** April 11, 2026  
**Migration Version:** 013  
**Naming Convention:** `{number}_{action}_{subject}.sql`
**Status:** ✅ All migrations applied successfully
