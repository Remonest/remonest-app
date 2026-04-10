# RLS Recursion Fix Guide

Complete guide to understanding and fixing the infinite recursion issue in RLS policies.

---

## 🐛 The Problem

### Error Message
```
infinite recursion detected in policy for relation "user_profiles"
```

### What Causes It

The RLS policies on `user_profiles` were querying `user_profiles` itself:

```sql
-- ❌ WRONG: Creates infinite recursion
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles  -- Queries same table!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Why this fails:**
1. Policy tries to evaluate on `user_profiles` table
2. Policy queries `user_profiles` to check role
3. That query triggers the same policy
4. Infinite loop → PostgreSQL detects and blocks it

---

## ✅ The Solution

### Use SECURITY DEFINER Functions

Create helper functions that bypass RLS:

```sql
-- ✅ CORRECT: Function bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  -- Bypasses RLS!
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- Use the function in policies
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.is_admin());  -- No recursion!
```

**Why this works:**
- `SECURITY DEFINER` makes function run with creator's permissions
- Function bypasses RLS policies
- No recursive query → no infinite loop

---

## 📋 Migration 012

### What It Does

1. **Creates 3 Helper Functions:**
   - `is_admin()` - Check if user is admin
   - `is_client()` - Check if user is client
   - `get_user_role()` - Get user's role

2. **Updates All Policies:**
   - Replaces recursive queries with function calls
   - Updates policies on all 8 tables
   - Maintains same security model

3. **Safe to Run:**
   - Drops old policies first
   - Creates new non-recursive policies
   - No data loss

### How to Apply

```bash
# Apply the fix
supabase db push

# Or run manually in Supabase SQL Editor
# Copy contents of supabase/migrations/012_fix_rls_recursion.sql
```

### Verification

```sql
-- Test the helper functions
SELECT public.is_admin();      -- Should return true/false
SELECT public.is_client();     -- Should return true/false
SELECT public.get_user_role(); -- Should return 'admin', 'user', or 'client'

-- Test queries that previously failed
SELECT * FROM jobs;            -- Should work now
SELECT * FROM user_profiles;   -- Should work now
```

---

## 🔍 How SECURITY DEFINER Works

### Normal Query (Respects RLS)
```sql
-- Regular query respects RLS
SELECT * FROM user_profiles WHERE id = auth.uid();
-- Triggers RLS policies → Can cause recursion
```

### SECURITY DEFINER Function (Bypasses RLS)
```sql
-- Function with SECURITY DEFINER bypasses RLS
CREATE FUNCTION check_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  -- ← This is the key!
AS $$
  SELECT role = 'admin' FROM user_profiles WHERE id = auth.uid();
$$;

-- Calling the function doesn't trigger RLS
SELECT check_role();
-- No recursion!
```

### Security Implications

✅ **Safe Because:**
- Functions only read role, don't modify data
- No SQL injection risk (no user input)
- Role is still validated by `auth.uid()`
- Functions are `STABLE` (no side effects)

❌ **Don't Use For:**
- Functions that modify data
- Functions with user input
- Functions that should respect RLS

---

## 📊 Before vs After

### Before (Broken)

```sql
-- Policy on user_profiles
CREATE POLICY "Admins can view all"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles  -- ❌ Recursion!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Result: ERROR - infinite recursion
```

### After (Fixed)

```sql
-- Helper function (bypasses RLS)
CREATE FUNCTION is_admin()
RETURNS boolean
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- Policy uses function
CREATE POLICY "Admins can view all"
  ON user_profiles FOR SELECT
  USING (is_admin());  -- ✅ No recursion!

-- Result: Works correctly
```

---

## 🧪 Testing

### Test Admin Access

```sql
-- Set yourself as admin
UPDATE user_profiles SET role = 'admin' WHERE id = auth.uid();

-- Test admin functions
SELECT public.is_admin();      -- Should return true
SELECT public.is_client();     -- Should return false
SELECT public.get_user_role(); -- Should return 'admin'

-- Test queries
SELECT * FROM jobs;            -- Should return all jobs
SELECT * FROM user_profiles;   -- Should return all profiles
```

### Test User Access

```sql
-- Set yourself as regular user
UPDATE user_profiles SET role = 'user' WHERE id = auth.uid();

-- Test user functions
SELECT public.is_admin();      -- Should return false
SELECT public.is_client();     -- Should return false
SELECT public.get_user_role(); -- Should return 'user'

-- Test queries
SELECT * FROM jobs WHERE status = 'published';  -- Should work
SELECT * FROM user_profiles WHERE id = auth.uid();  -- Should work
```

### Test Client Access

```sql
-- Set yourself as client
UPDATE user_profiles SET role = 'client' WHERE id = auth.uid();

-- Test client functions
SELECT public.is_admin();      -- Should return false
SELECT public.is_client();     -- Should return true
SELECT public.get_user_role(); -- Should return 'client'

-- Test queries
SELECT * FROM jobs;            -- Should return published + own jobs
SELECT * FROM user_profiles;   -- Should return all profiles (client policy)
```

---

## 📝 Related Documentation

- **[RLS Policies Guide](./rls-policies.md)** — Complete RLS reference
- **[Migration Guide](../scripts/MIGRATION_GUIDE.md)** — How to apply migrations
- **[Database Architecture](../architecture/database.md)** — Full database schema

---

**Last Updated:** April 10, 2026  
**Migration Version:** 012  
**Status:** ✅ Fixed and Tested
