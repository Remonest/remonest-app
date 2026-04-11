# Admin Action Logging

Complete guide to the admin action logging system in Remonest App.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why Admin Logging Matters](#why-admin-logging-matters)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
   - [admin_actions Table](#admin_actions-table)
   - [Action Types](#action-types)
   - [Convenience Views](#convenience-views)
5. [How It Works](#how-it-works)
   - [Automatic Triggers](#automatic-triggers)
   - [Manual Logging](#manual-logging)
6. [Viewing Action Logs](#viewing-action-logs)
7. [Query Examples](#query-examples)
8. [Building Admin Dashboard](#building-admin-dashboard)
9. [Integration with activity_log](#integration-with-activity_log)
10. [Retention & Cleanup](#retention--cleanup)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The admin action logging system provides a **complete, immutable audit trail** of all administrative actions in the Remonest platform. Every job approval, content change, and user management action is automatically recorded.

### Key Features

✅ **Automatic Logging** - Triggers capture all admin operations  
✅ **Immutable Records** - Logs cannot be modified or deleted  
✅ **Complete Context** - Old and new values stored as JSONB  
✅ **User Attribution** - Links actions to specific admins  
✅ **Target Tracking** - Records which users were affected  
✅ **Convenience Views** - Easy querying for common reports  

---

## Why Admin Logging Matters

### 🔒 Accountability
- Every admin action is traceable to a specific user
- No way to delete or modify audit trail
- Complete transparency for compliance

### 🐛 Debugging
- See exactly what changed and when
- Compare old vs new values
- Track down unintended modifications

### 📊 Analytics
- Monitor admin activity patterns
- Identify bottlenecks (e.g., job approval queue)
- Track system changes over time

### ⚖️ Compliance
- Meet audit requirements
- Provide evidence for disputes
- Support incident investigations

---

## Architecture

### How It Works

```
Admin Action
    ↓
Database Operation (INSERT/UPDATE/DELETE)
    ↓
Trigger Fires (log_admin_*_actions)
    ↓
Check: Is user an admin?
    ↓ Yes
Extract old/new values
    ↓
Call log_admin_action() helper
    ↓
Insert into admin_actions table
    ↓
Immutable record created
```

### Components

1. **admin_actions Table** - Stores all audit records
2. **Triggers** - Automatically log changes on jobs & learning_modules
3. **Helper Function** - `log_admin_action()` for manual logging
4. **Convenience Views** - `recent_admin_actions`, `admin_action_summary`
5. **RLS Policies** - Protect logs from tampering

---

## Database Schema

### admin_actions Table

```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),          -- Who did it
  target_user_id UUID REFERENCES auth.users(id),    -- Who was affected
  action_type admin_action_type_enum NOT NULL,      -- What happened
  table_name TEXT NOT NULL,                         -- Which table
  record_id UUID,                                   -- Which record
  old_values JSONB DEFAULT '{}',                    -- State before
  new_values JSONB DEFAULT '{}',                    -- State after
  ip_address TEXT,                                  -- Request IP
  user_agent TEXT,                                  -- Browser/client
  notes TEXT,                                       —- Human-readable context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()     -- When it happened
);
```

### Column Descriptions

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `id` | UUID | Unique identifier for this action | `a1b2c3d4-...` |
| `admin_id` | UUID | The admin who performed the action | Admin user ID |
| `target_user_id` | UUID | User affected by the action (if any) | Job poster's ID |
| `action_type` | ENUM | Type of action performed | `approve_job` |
| `table_name` | TEXT | Table that was modified | `jobs` |
| `record_id` | UUID | Specific record that changed | Job ID |
| `old_values` | JSONB | Complete state before change | `{status: "pending"}` |
| `new_values` | JSONB | Complete state after change | `{status: "published"}` |
| `ip_address` | TEXT | IP address of request (✅ **active for login/logout**) | `192.168.1.1` |
| `user_agent` | TEXT | User agent string (✅ **active for login/logout**) | `Mozilla/5.0...` |
| `notes` | TEXT | Human-readable description | `"Status changed from pending to published"` |
| `created_at` | TIMESTAMPTZ | When the action occurred | `2026-04-10 14:30:00` |

---

### Action Types

Complete list of tracked admin actions:

| Action Type | When Logged | Table | Description |
|-------------|-------------|-------|-------------|
| `approve_job` | Admin approves pending job | jobs | Status: `pending` → `published` |
| `reject_job` | Admin rejects job | jobs | Status: `pending` → `rejected` |
| `delete_job` | Admin deletes job | jobs | Job removed from system |
| `publish_job` | Admin publishes draft job | jobs | Status: `draft` → `published` |
| `republish_job` | Admin republishes expired job | jobs | Status: `expired` → `published` |
| `update_job` | Admin edits job content | jobs | Title, description, salary, etc |
| `create_learning_module` | Admin creates module | learning_modules | New module added |
| `update_learning_module` | Admin updates module | learning_modules | Module content changed |
| `delete_learning_module` | Admin deletes module | learning_modules | Module removed |
| `create_learning_material` | Admin creates material | learning_materials | New material added |
| `update_learning_material` | Admin updates material | learning_materials | Material content changed |
| `delete_learning_material` | Admin deletes material | learning_materials | Material removed |
| `create_learning_resource` | Admin creates resource | learning_resources | New resource added |
| `delete_learning_resource` | Admin deletes resource | learning_resources | Resource removed |
| `update_user_role` | Admin changes user role | user_profiles | Role change (e.g., user → client) |
| `update_user_settings` | Admin updates user settings | user_settings | Settings changed |
| `update_user_profile` | Admin updates user profile | user_profiles | Profile data changed |
| `create_user` | Admin creates user | auth.users | New user account |
| `delete_user` | Admin deletes user | auth.users | User account removed |
| `update_site_settings` | Admin updates site settings | site_settings | Global settings changed |
| `login` | User logs in (any method) | auth_users | **Logs IP, user agent, login method** |
| `logout` | User logs out | auth_users | **Logs IP, user agent** |
| `other` | Any other admin action | Various | Fallback for untyped actions |

---

### Convenience Views

#### recent_admin_actions

Shows the 100 most recent admin actions with user details:

```sql
CREATE VIEW recent_admin_actions AS
SELECT 
  aa.id,
  aa.admin_id,
  up.full_name AS admin_name,
  up.email AS admin_email,
  aa.action_type,
  aa.table_name,
  aa.record_id,
  aa.target_user_id,
  tp.full_name AS target_user_name,
  aa.old_values,
  aa.new_values,
  aa.notes,
  aa.created_at
FROM admin_actions aa
LEFT JOIN user_profiles up ON aa.admin_id = up.id
LEFT JOIN user_profiles tp ON aa.target_user_id = tp.id
ORDER BY aa.created_at DESC
LIMIT 100;
```

**Usage**:
```sql
-- See recent admin activity
SELECT * FROM recent_admin_actions;

-- Filter by admin
SELECT * FROM recent_admin_actions
WHERE admin_id = 'admin-uuid'
ORDER BY created_at DESC;

-- Filter by action type
SELECT * FROM recent_admin_actions
WHERE action_type = 'approve_job'
ORDER BY created_at DESC;
```

---

#### admin_action_summary

Summary of actions by type:

```sql
CREATE VIEW admin_action_summary AS
SELECT 
  action_type,
  COUNT(*) AS action_count,
  MIN(created_at) AS first_action,
  MAX(created_at) AS last_action
FROM admin_actions
GROUP BY action_type
ORDER BY action_count DESC;
```

**Usage**:
```sql
-- See activity breakdown
SELECT * FROM admin_action_summary;

-- Most active admins
SELECT 
  admin_id,
  up.full_name,
  COUNT(*) AS action_count
FROM admin_actions aa
LEFT JOIN user_profiles up ON aa.admin_id = up.id
GROUP BY admin_id, up.full_name
ORDER BY action_count DESC;
```

---

## How It Works

### Automatic Triggers

Two triggers automatically log admin actions:

#### 1. Job Actions Trigger

```sql
TRIGGER: log_admin_job_actions_trigger
TABLE: jobs
EVENTS: INSERT, UPDATE, DELETE

-- Automatically determines action type:
- pending → published = approve_job
- pending → rejected = reject_job
- draft → published = publish_job
- expired → published = republish_job
- Other updates = update_job
- Deletion = delete_job
```

**Example**:
```sql
-- Admin approves a pending job
UPDATE jobs 
SET status = 'published', is_verified_by_admin = true, published_at = NOW()
WHERE id = 'job-uuid';

-- Trigger automatically logs:
{
  "action_type": "approve_job",
  "admin_id": "admin-uuid",
  "target_user_id": "poster-uuid",
  "old_values": {"status": "pending", ...},
  "new_values": {"status": "published", ...},
  "notes": "Status changed from pending to published"
}
```

---

#### 2. Learning Module Actions Trigger

```sql
TRIGGER: log_admin_learning_module_actions_trigger
TABLE: learning_modules
EVENTS: INSERT, UPDATE, DELETE

-- Automatically determines action type:
- draft → published = create_learning_module
- Other updates = update_learning_module
- Deletion = delete_learning_module
```

**Example**:
```sql
-- Admin publishes a module
UPDATE learning_modules 
SET status = 'published', updated_at = NOW()
WHERE id = 'module-uuid';

-- Trigger automatically logs:
{
  "action_type": "create_learning_module",
  "admin_id": "admin-uuid",
  "old_values": {"status": "draft", ...},
  "new_values": {"status": "published", ...},
  "notes": "Status changed from draft to published"
}
```

---

### Manual Logging

Use the helper function to log custom admin actions:

```sql
-- Helper function signature
SELECT public.log_admin_action(
  p_admin_id UUID,                           -- Admin who performed action
  p_action_type admin_action_type_enum,      -- Type of action
  p_table_name TEXT,                         -- Table modified
  p_record_id UUID DEFAULT NULL,             -- Record ID (if applicable)
  p_target_user_id UUID DEFAULT NULL,        -- Affected user (if applicable)
  p_old_values JSONB DEFAULT '{}',           -- State before change
  p_new_values JSONB DEFAULT '{}',           -- State after change
  p_notes TEXT DEFAULT NULL                  -- Human-readable context
) RETURNS UUID;
```

**Example Usage**:

```sql
-- Log admin changing user role
SELECT public.log_admin_action(
  p_admin_id := 'admin-uuid',
  p_action_type := 'update_user_role',
  p_table_name := 'user_profiles',
  p_record_id := 'user-uuid',
  p_target_user_id := 'user-uuid',
  p_old_values := '{"role": "user"}',
  p_new_values := '{"role": "client"}',
  p_notes := 'Role changed from user to client'
);

-- Log admin deleting a user
SELECT public.log_admin_action(
  p_admin_id := 'admin-uuid',
  p_action_type := 'delete_user',
  p_table_name := 'auth.users',
  p_record_id := 'user-uuid',
  p_target_user_id := 'user-uuid',
  p_old_values := '{"email": "user@example.com", "role": "user"}',
  p_notes := 'User account deleted for policy violation'
);
```

---

## Viewing Action Logs

### Via Supabase Dashboard

1. Go to **Table Editor** → `admin_actions`
2. Browse all logged actions
3. Filter by `action_type`, `admin_id`, or date range
4. Expand JSONB columns to see old/new values

### Via SQL Queries

```sql
-- Most recent actions (with admin details)
SELECT * FROM recent_admin_actions;

-- Actions by specific admin
SELECT * FROM admin_actions
WHERE admin_id = 'admin-uuid'
ORDER BY created_at DESC;

-- Actions on specific job
SELECT * FROM admin_actions
WHERE table_name = 'jobs' AND record_id = 'job-uuid'
ORDER BY created_at DESC;

-- Job approval statistics
SELECT 
  COUNT(*) AS total_approvals,
  MIN(created_at) AS first_approval,
  MAX(created_at) AS last_approval
FROM admin_actions
WHERE action_type = 'approve_job';
```

---

## Query Examples

### Common Queries

```sql
-- 1. All actions in last 24 hours
SELECT * FROM admin_actions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. Actions by admin user
SELECT 
  aa.action_type,
  aa.table_name,
  aa.notes,
  aa.created_at
FROM admin_actions aa
JOIN user_profiles up ON aa.admin_id = up.id
WHERE up.full_name = 'John Doe'
ORDER BY aa.created_at DESC;

-- 3. Jobs approved today
SELECT COUNT(*) 
FROM admin_actions
WHERE action_type = 'approve_job'
  AND created_at::date = CURRENT_DATE;

-- 4. Average approval time
SELECT 
  AVG(
    EXTRACT(EPOCH FROM (aa.created_at - j.created_at)) / 3600
  ) AS avg_hours_to_approve
FROM admin_actions aa
JOIN jobs j ON aa.record_id = j.id
WHERE aa.action_type = 'approve_job';

-- 5. Most modified records
SELECT 
  table_name,
  record_id,
  COUNT(*) AS change_count
FROM admin_actions
GROUP BY table_name, record_id
ORDER BY change_count DESC
LIMIT 10;
```

### Advanced Analytics

```sql
-- Admin activity leaderboard
SELECT 
  up.full_name,
  up.email,
  COUNT(*) AS actions_count,
  COUNT(DISTINCT aa.action_type) AS action_types_used,
  MIN(aa.created_at) AS first_action,
  MAX(aa.created_at) AS last_action
FROM admin_actions aa
JOIN user_profiles up ON aa.admin_id = up.id
GROUP BY up.full_name, up.email
ORDER BY actions_count DESC;

-- Action type distribution (pie chart data)
SELECT 
  action_type,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM admin_actions
GROUP BY action_type
ORDER BY count DESC;

-- Daily action trend
SELECT 
  created_at::date AS action_date,
  COUNT(*) AS action_count
FROM admin_actions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY created_at::date
ORDER BY action_date;

-- Target users most affected
SELECT 
  up.full_name,
  up.email,
  COUNT(*) AS times_affected
FROM admin_actions aa
JOIN user_profiles up ON aa.target_user_id = up.id
GROUP BY up.full_name, up.email
ORDER BY times_affected DESC
LIMIT 20;
```

---

## Building Admin Dashboard

### Next.js Page Example

```tsx
// src/app/admin/activity-log/page.tsx
import { requireAdmin } from "@/lib/admin/require-admin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

export default async function AdminActivityLogPage() {
  await requireAdmin(); // Ensure admin access
  
  const supabase = getSupabaseServiceClient();
  
  // Fetch recent actions
  const { data: actions } = await supabase
    .from('recent_admin_actions')
    .select('*')
    .limit(50)
    .order('created_at', { ascending: false });
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Admin Activity Log</h1>
      
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Admin</th>
              <th className="p-4 text-left">Target</th>
              <th className="p-4 text-left">Notes</th>
              <th className="p-4 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {actions?.map((action) => (
              <tr key={action.id} className="border-t">
                <td className="p-4">
                  <Badge variant="outline">{action.action_type}</Badge>
                </td>
                <td className="p-4">
                  {action.admin_name || action.admin_id}
                </td>
                <td className="p-4">
                  {action.target_user_name || 'N/A'}
                </td>
                <td className="p-4 max-w-md truncate">
                  {action.notes}
                </td>
                <td className="p-4 text-muted-foreground">
                  {formatDistanceToNow(new Date(action.created_at))} ago
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### React Component for Action Details

```tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

export function ActionDetails({ action }: { action: any }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="border rounded-lg p-4">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown /> : <ChevronRight />}
        <span className="font-medium">{action.action_type}</span>
        <span className="text-muted-foreground text-sm">
          {new Date(action.created_at).toLocaleString()}
        </span>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Old Values</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(action.old_values, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">New Values</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(action.new_values, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Integration with activity_log

### Differences

| Feature | activity_log | admin_actions |
|---------|-------------|---------------|
| **Purpose** | User activity feed | Admin audit trail |
| **Who Logs** | Service role, triggers | Admin triggers only |
| **Who Views** | Users (own), Admins (all) | Admins only |
| **Mutability** | Read-only for users | Completely immutable |
| **Scope** | All user actions | Admin actions only |
| **Detail Level** | High-level summary | Complete old/new values |

### When to Use Which

**Use `activity_log` for**:
- User dashboard activity feed
- "You applied to a job" notifications
- "You started a module" tracking
- User-facing activity timelines

**Use `admin_actions` for**:
- Audit trails for compliance
- Debugging admin operations
- Monitoring admin activity
- Comparing before/after states
- Incident investigations

### Complementary Usage

```sql
-- User applies to job (logged in activity_log)
INSERT INTO job_applications (user_id, job_id, status)
VALUES ('user-uuid', 'job-uuid', 'applied');

-- Admin approves job (logged in admin_actions)
UPDATE jobs SET status = 'published' WHERE id = 'job-uuid';

-- Both logs exist for complete picture:
SELECT * FROM activity_log WHERE user_id = 'user-uuid'; -- User's application
SELECT * FROM admin_actions WHERE record_id = 'job-uuid'; -- Admin's approval
```

---

## Retention & Cleanup

### Data Retention Policy

Recommended retention periods:

| Action Type | Retention Period | Reason |
|-------------|-----------------|--------|
| All actions | 1 year minimum | Compliance requirement |
| Job approvals | 2 years | Audit trail |
| User deletions | Permanent | Legal hold |
| Content changes | 1 year | Debugging reference |

### Cleanup Function (Optional)

```sql
-- Function to archive old actions (run quarterly)
CREATE OR REPLACE FUNCTION public.archive_old_admin_actions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff_date TIMESTAMPTZ := NOW() - INTERVAL '1 year';
  v_archived_count INT;
BEGIN
  -- Count actions to archive
  SELECT COUNT(*) INTO v_archived_count
  FROM admin_actions
  WHERE created_at < v_cutoff_date
    AND action_type NOT IN ('delete_user', 'update_user_role');
  
  -- Note: In production, you would:
  -- 1. Create admin_actions_archive table
  -- 2. INSERT old records into archive
  -- 3. DELETE from admin_actions
  
  RAISE NOTICE 'Would archive % actions older than %', v_archived_count, v_cutoff_date;
END;
$$;

-- Schedule quarterly cleanup (requires pg_cron)
-- SELECT cron.schedule(
--   'archive-old-admin-actions',
--   '0 0 1 */3 *',  -- First day of quarter
--   'SELECT public.archive_old_admin_actions()'
-- );
```

**Important**: Always consult legal/compliance before deleting audit logs.

---

## Security

### RLS Protection

```sql
-- Admins can only VIEW logs
CREATE POLICY "Admins can view all admin actions"
  ON admin_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Service role can INSERT (for triggers)
CREATE POLICY "Service role can insert admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (true);

-- NO UPDATE or DELETE policies (intentional!)
-- This makes the audit trail immutable
```

### Security Best Practices

✅ **Do**:
- Keep logs immutable (no UPDATE/DELETE policies)
- Restrict viewing to admins only
- Log all admin operations
- Include IP addresses (future enhancement)
- Regular monitoring for suspicious activity

❌ **Don't**:
- Allow admins to delete their own logs
- Skip logging any admin action
- Store sensitive data in notes field
- Rely solely on application-level logging
- Delete logs without legal approval

### Monitoring Suspicious Activity

```sql
-- Unusual activity patterns
SELECT 
  admin_id,
  COUNT(*) AS action_count,
  COUNT(DISTINCT action_type) AS action_diversity,
  MIN(created_at) AS first_action,
  MAX(created_at) AS last_action
FROM admin_actions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY admin_id
HAVING COUNT(*) > 100  -- Threshold for alert
ORDER BY action_count DESC;

-- Actions outside business hours
SELECT * FROM admin_actions
WHERE EXTRACT(HOUR FROM created_at) < 6 
   OR EXTRACT(HOUR FROM created_at) > 22
ORDER BY created_at DESC;

-- Mass deletions
SELECT * FROM admin_actions
WHERE action_type LIKE '%delete%'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Issue 1: Actions Not Being Logged

**Symptom**: Admin actions don't appear in `admin_actions` table

**Diagnosis**:
```sql
-- Check if triggers exist
SELECT * FROM pg_trigger 
WHERE tgname LIKE 'log_admin_%';

-- Check trigger function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE 'log_admin_%';

-- Test trigger manually
SELECT public.log_admin_action(
  p_admin_id := 'admin-uuid',
  p_action_type := 'other',
  p_table_name := 'test',
  p_notes := 'Test action'
);
```

**Solution**:
- Ensure migration 011 has been applied
- Verify triggers are attached to tables
- Check that user has admin role in `user_profiles`

---

### Issue 2: Duplicate Logs

**Symptom**: Same action logged multiple times

**Cause**: Multiple triggers firing or manual logging + trigger

**Solution**:
```sql
-- Find duplicates
SELECT 
  table_name,
  record_id,
  action_type,
  created_at,
  COUNT(*) AS occurrence_count
FROM admin_actions
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY table_name, record_id, action_type, created_at
HAVING COUNT(*) > 1;

-- Remove duplicates (carefully!)
-- Note: This requires UPDATE/DELETE privileges
DELETE FROM admin_actions a
WHERE a.ctid > (
  SELECT MIN(b.ctid)
  FROM admin_actions b
  WHERE a.table_name = b.table_name
    AND a.record_id = b.record_id
    AND a.action_type = b.action_type
    AND ABS(EXTRACT(EPOCH FROM (a.created_at - b.created_at))) < 5
);
```

---

### Issue 3: Missing old_values or new_values

**Symptom**: JSONB columns are empty `{}`

**Cause**: Trigger not capturing state properly

**Solution**:
```sql
-- Check trigger function code
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'log_admin_job_actions';

-- Ensure to_jsonb() is being used
-- Should see: v_old_values := to_jsonb(OLD);
```

---

### Issue 4: Admin Can't View Logs

**Symptom**: Query returns empty for admin user

**Diagnosis**:
```sql
-- Check user's role
SELECT role FROM user_profiles WHERE id = auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'admin_actions';

-- Test as service role (bypasses RLS)
SET ROLE service_role;
SELECT * FROM admin_actions;
```

**Solution**:
- Ensure user has `role = 'admin'` in `user_profiles`
- Verify RLS policy exists: "Admins can view all admin actions"
- Use service role client in server actions

---

## Related Documentation

- **[RLS Policies](./rls-policies.md)** — Complete RLS policy reference
- **[Database Architecture](../architecture/database.md)** — Full database schema
- **[Admin Access Guide](./admin-access.md)** — How to access admin panel

---

**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
