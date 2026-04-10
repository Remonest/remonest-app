# Database Migrations Guide

Complete guide to all database migrations in the Remonest App.

---

## 📋 Table of Contents

1. [Migration Overview](#migration-overview)
2. [Migration List](#migration-list)
3. [Detailed Migration Descriptions](#detailed-migration-descriptions)
4. [Migration Dependencies](#migration-dependencies)
5. [How to Apply Migrations](#how-to-apply-migrations)
6. [Rollback Instructions](#rollback-instructions)
7. [Troubleshooting](#troubleshooting)

---

## 📊 Migration Overview

**Total Migrations:** 12  
**Database:** PostgreSQL (Supabase)  
**Migration Tool:** Supabase CLI  
**Latest Migration:** 012 (fix_rls_recursion)

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
| Total Migrations | 12 |
| Tables Created | 8 |
| Enum Types | 6 |
| RLS Policies | 35+ |
| Triggers | 6 |
| Functions | 10+ |
| Views | 2 |
| Indexes | 15+ |

---

## 📚 Related Documentation

- **[Database Architecture](../architecture/database.md)** - Complete schema reference
- **[RLS Policies Guide](../guides/rls-policies.md)** - Complete RLS reference
- **[RLS Recursion Fix](../guides/rls-recursion-fix.md)** - Migration 012 details
- **[Migration Guide](../scripts/MIGRATION_GUIDE.md)** - Step-by-step instructions
- **[Admin Action Logging](../guides/admin-action-logging.md)** - Audit trail details

---

## 📝 Migration Template

When creating new migrations, follow this template:

```sql
-- ============================================================
-- Migration: {number}_{descriptive_name}
-- Created: {date}
-- Description: {what this migration does}
-- ============================================================

-- ↑ Migration steps above
-- ↓ Rollback steps below

-- Rollback: {description}
-- Uncomment to rollback:
-- DROP TABLE IF EXISTS public.table_name CASCADE;
-- DROP FUNCTION IF EXISTS public.function_name() CASCADE;
```

---

**Last Updated:** April 10, 2026  
**Migration Version:** 012  
**Status:** ✅ All migrations applied successfully
