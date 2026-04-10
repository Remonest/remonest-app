# Database Migration Guide

Step-by-step guide for applying database migrations smoothly.

---

## 🚀 Quick Start

### Apply All Pending Migrations

```bash
# From project root
supabase db push
```

This will apply both:
- **Migration 011**: Complete RLS policies & admin logging
- **Migration 012**: Fix RLS recursion issue

### Check Migration Status

```bash
# See which migrations are applied
supabase db remote --list
```

---

## 📋 Migration 011: Complete RLS Policies & Admin Logging

### What This Migration Does

1. ✅ Creates `admin_actions` table for audit trail
2. ✅ Adds `admin_action_type_enum` enum type
3. ✅ Creates helper function `log_admin_action()`
4. ✅ Creates automatic triggers for admin actions
5. ✅ Completes RLS policies for all 8 tables
6. ✅ Creates convenience views for reporting

### Prerequisites

Before applying this migration, ensure:

- [ ] Migrations 001-010 are already applied
- [ ] You have admin access to Supabase dashboard
- [ ] You have backed up your database (optional but recommended)
- [ ] No active users are performing writes (apply during maintenance window)

### How to Apply

#### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Navigate to project root
cd D:\Documents\Side\Project\remonest-app

# 2. Check current migration status
supabase db remote --list

# 3. Apply migration
supabase db push

# 4. Verify success
# Should see "Finished supabase db push" without errors
```

#### Option 2: Using Supabase Dashboard (If CLI fails)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/migrations/011_complete_rls_policies.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Check for success message (no errors)

---

## ✅ Verification Steps

After applying the migration, verify it worked:

### 1. Check Tables Exist

```sql
-- Should return 'admin_actions'
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'admin_actions';
```

### 2. Check Enum Type Exists

```sql
-- Should return 'admin_action_type_enum'
SELECT typname 
FROM pg_type 
WHERE typname = 'admin_action_type_enum';
```

### 3. Check RLS is Enabled on All Tables

```sql
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN (
  'user_profiles',
  'jobs',
  'job_applications',
  'learning_modules',
  'user_learning_progress',
  'user_settings',
  'activity_log',
  'admin_actions'
)
ORDER BY relname;
```

**Expected Result**: All tables should show `rls_enabled = true`

### 4. Check Policies Exist

```sql
SELECT 
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected Result**: 
- `user_profiles`: 6 policies
- `jobs`: 8 policies
- `job_applications`: 6 policies
- `learning_modules`: 2 policies
- `user_learning_progress`: 4 policies
- `user_settings`: 4 policies
- `activity_log`: 3 policies
- `admin_actions`: 2 policies

### 5. Check Triggers Exist

```sql
SELECT 
  trigger_name,
  event_object_table AS table_name,
  event_manipulation AS event
FROM information_schema.triggers
WHERE trigger_name LIKE 'log_admin_%'
ORDER BY trigger_name;
```

**Expected Result**: 2 triggers
- `log_admin_job_actions_trigger` on `jobs`
- `log_admin_learning_module_actions_trigger` on `learning_modules`

### 6. Check Helper Functions

```sql
SELECT proname, pronargs
FROM pg_proc
WHERE proname IN (
  'log_admin_action',
  'log_admin_job_actions',
  'log_admin_learning_module_actions'
)
ORDER BY proname;
```

**Expected Result**: 3 functions

### 7. Check Views

```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
  AND viewname LIKE '%admin%'
ORDER BY viewname;
```

**Expected Result**: 2 views
- `admin_action_summary`
- `recent_admin_actions`

### 8. Test Admin Action Logging

```sql
-- Find an admin user ID
SELECT id, role, full_name 
FROM user_profiles 
WHERE role = 'admin' 
LIMIT 1;

-- Temporarily set role to admin for testing (replace with your user ID)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';

-- Simulate approving a job (replace with actual pending job ID)
UPDATE jobs 
SET status = 'published', 
    is_verified_by_admin = true, 
    published_at = NOW() 
WHERE id = 'any-pending-job-id';

-- Check if action was logged
SELECT * 
FROM admin_actions 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result**: 1 row in `admin_actions` with:
- `action_type = 'approve_job'`
- `admin_id = your-user-id`
- `old_values` and `new_values` populated

### 9. Test RLS Policies

```sql
-- Test as anonymous user (should only see published jobs)
SET LOCAL ROLE anon;
SELECT count(*) FROM jobs; -- Should return only published jobs

-- Test as authenticated user
RESET ROLE;
SELECT count(*) FROM jobs; -- Should return published + own jobs

-- Test viewing admin actions (should work for admins)
SELECT count(*) FROM admin_actions; -- Should return count for admins
```

---

## 📋 Migration 012: Fix RLS Recursion

### What This Migration Does

Fixes the infinite recursion error in `user_profiles` RLS policies by:

1. Creating helper functions with `SECURITY DEFINER`:
   - `is_admin()` - Check if user is admin
   - `is_client()` - Check if user is client
   - `get_user_role()` - Get user's role

2. Updating all policies to use these functions instead of direct queries

3. Preventing infinite recursion while maintaining security

### Why This Is Needed

**Problem:**
```sql
-- ❌ WRONG: Queries same table → infinite recursion
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles  -- Triggers same policy!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Solution:**
```sql
-- ✅ CORRECT: Function bypasses RLS
CREATE FUNCTION is_admin() 
RETURNS boolean
SECURITY DEFINER  -- ← Key!
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin());  -- No recursion!
```

### How to Apply

```bash
supabase db push
```

### Verification

```sql
-- Test helper functions
SELECT public.is_admin();      -- Should return true/false
SELECT public.is_client();     -- Should return true/false
SELECT public.get_user_role(); -- Should return role

-- Test queries that previously failed
SELECT * FROM jobs;            -- Should work now
SELECT * FROM user_profiles;   -- Should work now
```

---

## ❌ Troubleshooting

### Issue: Column Does Not Exist

**Symptom**: `ERROR: column up.email does not exist`

**Cause**: `user_profiles` table doesn't have an `email` column - email is in `auth.users`

**Solution**: 
- This issue has been fixed in the latest version of migration 011
- The view now joins with `auth.users` to get email addresses
- If you see this error, drop the view and re-run migration:

```sql
DROP VIEW IF EXISTS public.recent_admin_actions CASCADE;
supabase db push
```

**Symptom**: `ERROR: syntax error at or near ";"`

**Cause**: Usually caused by incorrect PL/pgSQL syntax

**Solution**: 
- Migration 011 had this issue and has been fixed
- If you see this error, ensure you have the latest version of the file
- Common fixes:
  - `END;` → `END IF;` (for IF statements)
  - `END;` → `END LOOP;` (for loops)
  - `END;` → `END CASE;` (for CASE statements)

---

### Issue: Policy Already Exists

**Symptom**: `ERROR: policy "xxx" for table "yyy" already exists`

**Cause**: Migration was partially applied or run before

**Solution**:

```sql
-- Option 1: Drop conflicting policies manually
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
-- ... repeat for all policies

-- Option 2: Reset migration tracking
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '011';

-- Then re-run migration
supabase db push
```

---

### Issue: Enum Already Exists

**Symptom**: `ERROR: type "admin_action_type_enum" already exists`

**Cause**: Enum was created but migration failed mid-way

**Solution**:

```sql
-- Drop the enum (cascade will remove dependent objects)
DROP TYPE IF EXISTS public.admin_action_type_enum CASCADE;

-- Re-run migration
supabase db push
```

**Warning**: This will also drop the `admin_actions` table if it exists. Backup data first!

---

### Issue: Trigger Already Exists

**Symptom**: `ERROR: trigger "log_admin_job_actions_trigger" for table "jobs" already exists`

**Cause**: Trigger created but migration failed

**Solution**:

```sql
-- Drop existing triggers
DROP TRIGGER IF EXISTS log_admin_job_actions_trigger ON public.jobs;
DROP TRIGGER IF EXISTS log_admin_learning_module_actions_trigger ON public.learning_modules;

-- Drop trigger functions
DROP FUNCTION IF EXISTS public.log_admin_job_actions() CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_learning_module_actions() CASCADE;

-- Re-run migration
supabase db push
```

---

### Issue: Relation Does Not Exist

**Symptom**: `ERROR: relation "jobs" does not exist`

**Cause**: Earlier migrations not applied

**Solution**:

```bash
# Check which migrations are applied
supabase db remote --list

# Apply all migrations in order
supabase db push
```

If specific tables are missing, apply their migrations first:
- `jobs` table → Migration 003
- `learning_modules` table → Migration 002
- `user_profiles` table → Migration 001

---

### Issue: Permission Denied

**Symptom**: `ERROR: permission denied for schema public`

**Cause**: Insufficient privileges

**Solution**:
- Use Supabase service role key, not anon key
- Ensure you're connecting as database owner
- Check Supabase dashboard → **Settings** → **Database**

---

## 🔄 Rollback Migration 011

If you need to undo this migration:

```sql
-- Run these in Supabase SQL Editor

-- 1. Drop views
DROP VIEW IF EXISTS public.admin_action_summary CASCADE;
DROP VIEW IF EXISTS public.recent_admin_actions CASCADE;

-- 2. Drop triggers
DROP TRIGGER IF EXISTS log_admin_learning_module_actions_trigger ON public.learning_modules;
DROP TRIGGER IF EXISTS log_admin_job_actions_trigger ON public.jobs;

-- 3. Drop trigger functions
DROP FUNCTION IF EXISTS public.log_admin_learning_module_actions() CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_job_actions() CASCADE;

-- 4. Drop helper function
DROP FUNCTION IF EXISTS public.log_admin_action(UUID, public.admin_action_type_enum, TEXT, UUID, UUID, JSONB, JSONB, TEXT) CASCADE;

-- 5. Drop table
DROP TABLE IF EXISTS public.admin_actions CASCADE;

-- 6. Drop enum
DROP TYPE IF EXISTS public.admin_action_type_enum CASCADE;

-- 7. Remove from migration tracking
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '011';
```

**Note**: This will permanently delete all admin action logs. Export data first if needed!

---

## 📊 Post-Migration Checklist

After successfully applying the migration:

### Database
- [ ] All 8 tables have RLS enabled
- [ ] 35+ RLS policies created
- [ ] 2 triggers active
- [ ] 3 helper functions exist
- [ ] 2 convenience views work
- [ ] `admin_actions` table is empty (no actions yet)

### Application
- [ ] Test job approval workflow (should log action)
- [ ] Test job rejection (should log action)
- [ ] Test learning module creation (should log action)
- [ ] Admin dashboard can view action logs
- [ ] No RLS policy errors in application logs

### Monitoring
- [ ] Set up alerts for suspicious admin activity
- [ ] Monitor `admin_actions` table growth
- [ ] Review action logs weekly
- [ ] Document any custom logging needs

---

## 🎯 Next Steps After Migration

### 1. Test Admin Actions

```sql
-- Approve a pending job through the UI
-- Then check if it was logged:
SELECT 
  action_type,
  table_name,
  notes,
  created_at
FROM admin_actions
ORDER BY created_at DESC
LIMIT 5;
```

### 2. Build Admin Dashboard

Use the convenience views to build an admin UI:

```typescript
// Example Next.js page
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const supabase = getSupabaseServiceClient();
const { data } = await supabase
  .from('recent_admin_actions')
  .select('*');
```

### 3. Set Up Monitoring

```sql
-- Check for unusual activity
SELECT 
  admin_id,
  COUNT(*) AS actions_last_24h
FROM admin_actions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY admin_id
HAVING COUNT(*) > 50; -- Alert threshold
```

### 4. Document Custom Actions

If you log custom admin actions:

```sql
-- Example: Log user role change
SELECT public.log_admin_action(
  p_admin_id := 'admin-uuid',
  p_action_type := 'update_user_role',
  p_table_name := 'user_profiles',
  p_record_id := 'user-uuid',
  p_target_user_id := 'user-uuid',
  p_old_values := '{"role": "user"}',
  p_new_values := '{"role": "client"}',
  p_notes := 'Role upgraded to client'
);
```

---

## 📚 Related Documentation

- **[RLS Policies Guide](../docs/guides/rls-policies.md)** — Complete RLS reference
- **[Admin Action Logging](../docs/guides/admin-action-logging.md)** — Audit trail documentation
- **[Database Architecture](../docs/architecture/database.md)** — Full database schema

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **Verification Steps** above
2. Review error message carefully
3. Check Supabase logs in Dashboard → **Logs** → **Database**
4. Test with smaller queries first
5. Ensure all prerequisites are met

---

**Last Updated:** April 10, 2026  
**Migration Version:** 011  
**Status:** ✅ Tested and Working
