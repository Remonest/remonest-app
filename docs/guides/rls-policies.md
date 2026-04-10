# Row Level Security (RLS) Policies

Complete guide to RLS policies in the Remonest App.

---

## 📋 Table of Contents

1. [What is RLS?](#what-is-rls)
2. [Why RLS Matters](#why-rls-matters)
3. [RLS Architecture in Remonest](#rls-architecture-in-remonest)
4. [Complete Policy Reference](#complete-policy-reference)
   - [user_profiles](#user_profiles-policies)
   - [jobs](#jobs-policies)
   - [job_applications](#job_applications-policies)
   - [learning_modules](#learning_modules-policies)
   - [user_learning_progress](#user_learning_progress-policies)
   - [user_settings](#user_settings-policies)
   - [activity_log](#activity_log-policies)
   - [admin_actions](#admin_actions-policies)
5. [Policy Patterns](#policy-patterns)
6. [How RLS Works with Roles](#how-rls-works-with-roles)
7. [Testing RLS Policies](#testing-rls-policies)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)

---

## What is RLS?

**Row Level Security (RLS)** is a PostgreSQL feature that restricts which rows users can access based on policies. Instead of table-level permissions (all or nothing), RLS provides **row-level** control.

### Without RLS
```sql
-- Any authenticated user can see ALL jobs
SELECT * FROM jobs;
```

### With RLS
```sql
-- Users only see their own jobs
SELECT * FROM jobs WHERE posted_by_user_id = auth.uid();

-- Admins see all jobs
SELECT * FROM jobs WHERE is_admin(auth.uid());
```

---

## Why RLS Matters

### 🔒 Security Benefits

1. **Defense in Depth** - Even if application code has bugs, database enforces security
2. **Least Privilege** - Users only access what they need
3. **Multi-Tenant Safety** - Users can't access other users' data
4. **Audit Trail** - All access controlled at database level

### ⚠️ What Happens Without RLS?

- Any authenticated user could access any data
- Admin-only features accessible to regular users
- Users could modify other users' data
- No guarantee of data isolation

---

## RLS Architecture in Remonest

### Core Principles

1. **Default Deny** - No access unless explicitly permitted
2. **Role-Based Access** - Different rules for admin, user, client
3. **Ownership Checks** - Users can only access their own data
4. **Public Reads** - Published content is world-readable
5. **Admin Override** - Admins can access everything
6. **Immutable Audit Trail** - Admin actions cannot be modified or deleted

### Policy Categories

| Category | Purpose | Example |
|----------|---------|---------|
| **Ownership** | Users access own data | "Users can view own profile" |
| **Public Read** | Anyone can read published content | "Public can read published jobs" |
| **Admin Override** | Admins bypass restrictions | "Admins can update any job" |
| **Service Role** | System operations (triggers) | "Service role can insert profiles" |

### How Policies Are Evaluated

```sql
-- RLS checks happen in this order:
1. Is RLS enabled on the table? (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
2. Does any policy apply to this user and operation?
3. Does the policy's USING clause evaluate to true?
4. If no policies match, access is DENIED
```

---

## Complete Policy Reference

### user_profiles Policies

**Purpose**: Extended user information and role management

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Users can view own profile | SELECT | Any user | `auth.uid() = id` |
| Users can update own profile | UPDATE | Any user | Own profile, cannot change role |
| Admins can view all profiles | SELECT | Admin only | `role = 'admin'` |
| Admins can update all profiles | UPDATE | Admin only | `role = 'admin'` |
| Service role can insert profiles | INSERT | Service role | Always allowed (for auto-create) |
| Clients can view all profiles | SELECT | Client only | `role = 'client'` |

**Key Points**:
- Users cannot change their own role (admin-only)
- Admins have full access to all profiles
- Clients can view all profiles (for networking context)
- Auto-create trigger uses service role

**Example Queries**:
```sql
-- User sees only their own profile
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Admin sees all profiles (bypasses normal restriction)
SELECT * FROM user_profiles;

-- Client sees all profiles
SELECT * FROM user_profiles;
```

---

### jobs Policies

**Purpose**: Job listings with approval workflow

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Public can read published jobs | SELECT | Anyone | `status = 'published'` |
| Users can read own jobs | SELECT | Job poster | `auth.uid() = posted_by_user_id` |
| Users can create jobs | INSERT | Job poster | `auth.uid() = posted_by_user_id` |
| Users can update own jobs | UPDATE | Job poster | Own jobs, draft/pending only |
| Users can delete own jobs | DELETE | Job poster | Own jobs, draft/pending only |
| Admins can read all jobs | SELECT | Admin only | `role = 'admin'` |
| Admins can update any job | UPDATE | Admin only | `role = 'admin'` |
| Admins can delete any job | DELETE | Admin only | `role = 'admin'` |

**Key Points**:
- Published jobs are public (no auth required)
- Users can only modify their own draft/pending jobs
- Published jobs are immutable for non-admins
- Admins have full control over all jobs
- All admin actions are automatically logged

**Example Queries**:
```sql
-- Public sees only published jobs
SELECT * FROM jobs; -- Returns only published

-- Job poster sees their own jobs (any status)
SELECT * FROM jobs WHERE posted_by_user_id = auth.uid();

-- Admin sees all jobs
SELECT * FROM jobs; -- No restrictions for admins

-- Client creates a new job (status = 'pending')
INSERT INTO jobs (title, company, ..., posted_by_user_id)
VALUES ('Developer', 'TechCorp', ..., auth.uid());
```

**Status Workflow**:
```
draft → pending → published (admin approval required)
  ↓       ↓
  └── rejected (by admin)
  
published → expired (auto after deadline)
```

---

### job_applications Policies

**Purpose**: Track job applications and status

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Users can view own applications | SELECT | Applicant | `auth.uid() = user_id` |
| Users can create own applications | INSERT | Applicant | `auth.uid() = user_id` |
| Users can update own applications | UPDATE | Applicant | `auth.uid() = user_id` |
| Users can delete own applications | DELETE | Applicant | `auth.uid() = user_id` |
| Admins can view all applications | SELECT | Admin only | `role = 'admin'` |
| Admins can update all applications | UPDATE | Admin only | `role = 'admin'` |

**Key Points**:
- Users can only see their own applications
- Users manage their own application lifecycle
- Admins can view and update all applications

**Example Queries**:
```sql
-- User sees their applications
SELECT * FROM job_applications WHERE user_id = auth.uid();

-- Admin sees all applications
SELECT * FROM job_applications;

-- User applies to a job
INSERT INTO job_applications (user_id, job_id, status)
VALUES (auth.uid(), 'job-uuid', 'applied');
```

---

### learning_modules Policies

**Purpose**: Educational content management

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Anyone can view published modules | SELECT | Anyone | `status = 'published'` |
| Admins can manage modules | ALL | Admin only | `role = 'admin'` |

**Key Points**:
- Published modules are public (no auth required)
- Only admins can create, update, or delete modules
- All admin actions are automatically logged

**Example Queries**:
```sql
-- Public sees only published modules
SELECT * FROM learning_modules WHERE status = 'published';

-- Admin manages modules
INSERT INTO learning_modules (slug, title, ..., status)
VALUES ('my-module', 'My Module', ..., 'draft');

UPDATE learning_modules SET status = 'published' WHERE id = 'module-uuid';
```

---

### user_learning_progress Policies

**Purpose**: Track user module completion

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Users can view own progress | SELECT | User | `auth.uid() = user_id` |
| Users can upsert own progress | INSERT | User | `auth.uid() = user_id` |
| Users can update own progress | UPDATE | User | `auth.uid() = user_id` |
| Admins can view all progress | SELECT | Admin only | `role = 'admin'` |

**Key Points**:
- Users manage their own learning progress
- Admins can view all progress (for analytics)
- UNIQUE constraint prevents duplicate progress records

**Example Queries**:
```sql
-- User sees their progress
SELECT * FROM user_learning_progress WHERE user_id = auth.uid();

-- User starts a module
INSERT INTO user_learning_progress (user_id, module_id, progress)
VALUES (auth.uid(), 'module-uuid', 0);

-- User updates progress
UPDATE user_learning_progress 
SET progress = 50, updated_at = NOW()
WHERE user_id = auth.uid() AND module_id = 'module-uuid';
```

---

### user_settings Policies

**Purpose**: Extended user preferences and settings

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Users can view own settings | SELECT | User | `auth.uid() = user_id` |
| Users can update own settings | UPDATE | User | `auth.uid() = user_id` |
| Service role can create settings | INSERT | Service role | Always allowed (for auto-create) |
| Admins can view all settings | SELECT | Admin only | `role = 'admin'` |

**Key Points**:
- Users manage their own settings
- Auto-create trigger on user signup
- Admins can view all settings (for support)

**Example Queries**:
```sql
-- User sees their settings
SELECT * FROM user_settings WHERE user_id = auth.uid();

-- User updates notification preferences
UPDATE user_settings 
SET email_notifications = false, job_alerts = true
WHERE user_id = auth.uid();
```

---

### activity_log Policies

**Purpose**: Audit trail of user actions

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Users can view own activity | SELECT | User | `auth.uid() = user_id` |
| Service role can create activity | INSERT | Service role | Always allowed (for logging) |
| Admins can view all activity | SELECT | Admin only | `role = 'admin'` |

**Key Points**:
- Users see only their own activity
- Activity is logged by service role (triggers, server actions)
- Admins can view all activity (for monitoring)
- Users cannot modify or delete activity logs

**Example Queries**:
```sql
-- User sees their activity
SELECT * FROM activity_log WHERE user_id = auth.uid()
ORDER BY created_at DESC LIMIT 50;

-- Admin sees all activity
SELECT * FROM activity_log
ORDER BY created_at DESC LIMIT 100;
```

---

### admin_actions Policies

**Purpose**: Audit trail of admin actions (IMMUTABLE)

| Policy | Operation | Who Can Access | Condition |
|--------|-----------|----------------|-----------|
| Admins can view all admin actions | SELECT | Admin only | `role = 'admin'` |
| Service role can insert admin actions | INSERT | Service role | Always allowed (for logging) |
| ~~No UPDATE policy~~ | UPDATE | ❌ Nobody | Intentionally restricted |
| ~~No DELETE policy~~ | DELETE | ❌ Nobody | Intentionally restricted |

**Key Points**:
- **IMMUTABLE**: Cannot be updated or deleted (security feature)
- Automatically logged via triggers on jobs and learning_modules
- Admins can view all actions (for auditing)
- No one can modify or delete action logs

**Example Queries**:
```sql
-- Admin views recent actions
SELECT * FROM admin_actions
ORDER BY created_at DESC LIMIT 100;

-- Admin views actions by type
SELECT action_type, COUNT(*) 
FROM admin_actions
GROUP BY action_type
ORDER BY COUNT(*) DESC;

-- Admin views actions for specific job
SELECT * FROM admin_actions
WHERE table_name = 'jobs' AND record_id = 'job-uuid'
ORDER BY created_at DESC;
```

**Using Convenience Views**:
```sql
-- Recent admin actions (last 100) with user details
SELECT * FROM recent_admin_actions;

-- Action summary by type
SELECT * FROM admin_action_summary;
```

---

## Policy Patterns

### Pattern 1: Ownership Check

Users can only access their own data:

```sql
-- SELECT
USING (auth.uid() = user_id)

-- INSERT
WITH CHECK (auth.uid() = user_id)

-- UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)

-- DELETE
USING (auth.uid() = user_id)
```

**Used in**: `job_applications`, `user_learning_progress`, `user_settings`

---

### Pattern 2: Public Read

Anyone can read published content:

```sql
CREATE POLICY "Anyone can view published content"
  ON table_name FOR SELECT
  USING (status = 'published');
```

**Used in**: `jobs`, `learning_modules`

---

### Pattern 3: Admin Override

Admins bypass normal restrictions:

```sql
CREATE POLICY "Admins can do X"
  ON table_name FOR operation
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Used in**: All tables

---

### Pattern 4: Service Role

System operations (triggers, auto-create):

```sql
CREATE POLICY "Service role can do X"
  ON table_name FOR INSERT
  WITH CHECK (true);
```

**Used in**: `user_profiles`, `user_settings`, `activity_log`, `admin_actions`

---

### Pattern 5: Restricted Operations

Immutable audit trail (no UPDATE/DELETE):

```sql
-- Only SELECT and INSERT policies created
-- No UPDATE or DELETE policies = operations denied
```

**Used in**: `admin_actions`

---

## How RLS Works with Roles

### Three-Role System

Remonest uses three roles with different access levels:

| Role | Can Access | Can Modify | Special Permissions |
|------|-----------|------------|---------------------|
| **user** | Own data only | Own data (restricted) | Apply to jobs, track learning |
| **client** | Own data + all profiles | Own jobs (draft/pending) | Post jobs, manage applications |
| **admin** | All data | All data | Approve/reject jobs, manage content |

### Role Check Implementation

```sql
-- Check if user is admin
EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid() AND role = 'admin'
)

-- Check if user is client
EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid() AND role = 'client'
)

-- Check ownership
auth.uid() = user_id
```

### Role-Based Access Flow

```
User Request
    ↓
Is user authenticated? (middleware check)
    ↓ Yes
What is user's role? (user_profiles.role)
    ↓
Apply RLS policies based on role
    ↓
Return only permitted rows
```

---

## Testing RLS Policies

### Test with Different Roles

```sql
-- 1. Test as anonymous user (not authenticated)
SET LOCAL ROLE anon;

-- Should only see published jobs
SELECT * FROM jobs;

-- Should see no user profiles
SELECT * FROM user_profiles;

-- 2. Test as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid"}';

-- Should see own profile
SELECT * FROM user_profiles WHERE id = current_setting('request.jwt.claims')::json->>'sub';

-- 3. Test as admin
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "admin-uuid"}';

-- Temporarily set role to admin for testing
UPDATE user_profiles SET role = 'admin' WHERE id = current_setting('request.jwt.claims')::json->>'sub';

-- Should see all jobs
SELECT * FROM jobs;

-- Should see all profiles
SELECT * FROM user_profiles;
```

### Test Specific Policies

```sql
-- Test ownership restriction
INSERT INTO job_applications (user_id, job_id)
VALUES ('different-user-uuid', 'job-uuid');
-- Should fail with RLS violation

-- Test public read
SELECT count(*) FROM jobs WHERE status = 'published';
-- Should return all published jobs (even as anon)

-- Test admin override
UPDATE jobs SET status = 'rejected', rejection_reason = 'Test'
WHERE id = 'job-uuid' AND posted_by_user_id != auth.uid();
-- Should fail for non-admins, succeed for admins
```

### Using Supabase Dashboard

1. Go to **SQL Editor** in Supabase dashboard
2. Run queries as different roles
3. Check **Row Level Security** section in table settings
4. View policy evaluation in **Logs** → **Database**

---

## Troubleshooting

### Common Issues

#### Issue 1: "new row violates row-level security policy"

**Symptom**: INSERT fails with RLS error

**Cause**: No INSERT policy matches the user

**Solution**:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Add missing policy
CREATE POLICY "Users can create X"
  ON your_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

#### Issue 2: "query returns no rows" (expected rows missing)

**Symptom**: SELECT returns empty when expecting data

**Cause**: SELECT policy doesn't match user's role

**Solution**:
```sql
-- Check what policies exist
SELECT polname, polcmd, polqual
FROM pg_policy
WHERE polrelid = 'your_table'::regclass;

-- Test as different role
SET ROLE postgres;
SELECT * FROM your_table; -- Should bypass RLS
```

---

#### Issue 3: "permission denied" for admin operations

**Symptom**: Admin can't update other users' data

**Cause**: Using regular client instead of service role

**Solution**:
```typescript
// ❌ Bad: Regular client (respects RLS)
const supabase = getSupabaseServerClient();
await supabase.from('jobs').update({...});

// ✅ Good: Service role (bypasses RLS)
const supabase = getSupabaseServiceClient();
await supabase.from('jobs').update({...});
```

---

#### Issue 4: Infinite recursion in policy

**Symptom**: "stack depth limit exceeded" or infinite loop

**Cause**: Policy references table that has RLS enabled

**Solution**:
```sql
-- ❌ Bad: Recursive reference
CREATE POLICY "Admins can access"
  ON user_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles  -- References same table!
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ✅ Good: Use alias
CREATE POLICY "Admins can access"
  ON user_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles up  -- Use alias
    WHERE up.id = auth.uid() AND up.role = 'admin'
  ));
```

---

#### Issue 5: Trigger bypasses RLS unexpectedly

**Symptom**: Trigger doesn't log admin actions

**Cause**: Trigger runs as service role, which bypasses RLS

**Solution**:
```sql
-- Check function security
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'your_trigger_function';

-- Function should use SECURITY DEFINER
CREATE OR REPLACE FUNCTION your_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with creator's permissions
SET search_path = public
AS $$
  -- Check role explicitly
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Log action
  ...
$$;
```

---

### Debugging Queries

```sql
-- 1. Check if RLS is enabled on table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'your_table';

-- 2. List all policies for a table
SELECT * FROM pg_policies
WHERE tablename = 'your_table';

-- 3. Check current user role
SELECT role FROM user_profiles WHERE id = auth.uid();

-- 4. Test policy evaluation
EXPLAIN (ANALYZE, COSTS OFF)
SELECT * FROM jobs WHERE id = 'job-uuid';

-- 5. View RLS violations in logs
SELECT * FROM pg_stat_statements
WHERE query LIKE '%your_table%';
```

---

## Security Checklist

### ✅ RLS Setup

- [ ] RLS enabled on all tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policies exist for all operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] Policies cover all roles (admin, user, client)
- [ ] Service role policies exist for triggers
- [ ] No overly permissive policies (`WITH CHECK (true)` except for service role)

### ✅ Ownership Policies

- [ ] Users can only view own data
- [ ] Users can only modify own data
- [ ] Foreign keys reference correct ownership columns
- [ ] No missing ownership checks

### ✅ Admin Policies

- [ ] Admins can access all data (override policies)
- [ ] Admin-only operations restricted properly
- [ ] Role check uses EXISTS (not direct comparison)
- [ ] Admin actions are logged automatically

### ✅ Public Access

- [ ] Published content readable by anyone
- [ ] Draft/pending content restricted to owners
- [ ] No sensitive data in public policies
- [ ] Public policies use correct status checks

### ✅ Audit Trail

- [ ] Admin actions table has no UPDATE/DELETE policies
- [ ] Triggers log all admin operations
- [ ] Old/new values captured in JSONB
- [ ] Timestamps are accurate

### ✅ Testing

- [ ] Tested as anonymous user
- [ ] Tested as regular user
- [ ] Tested as client
- [ ] Tested as admin
- [ ] Tested cross-user data access (should fail)
- [ ] Tested admin override (should succeed)

---

## Related Documentation

- **[Database Architecture](../architecture/database.md)** — Complete database schema
- **[Admin Action Logging](./admin-action-logging.md)** — How admin actions are logged
- **[Role System](../architecture/role-system.md)** — User role system (RBAC)

---

**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
