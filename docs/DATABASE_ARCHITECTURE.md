# Database Architecture Guide

**Version:** 1.0.0
**Date:** April 10, 2026

---

## Overview

This document provides comprehensive guidance on the Remonest App database architecture, design decisions, and best practices for PostgreSQL/Supabase implementation.

---

## Database Engine

- **Provider**: Supabase (Managed PostgreSQL)
- **Version**: PostgreSQL 15+ (managed by Supabase)
- **Features**: Row Level Security (RLS), Real-time subscriptions, Edge functions

---

## Table Architecture

### Core Tables

#### 1. `user_profiles`
**Purpose**: Extended user information and role management

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' 
          CHECK (role IN ('user', 'admin', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Design Decisions:**
- **FK to auth.users**: Ensures profile exists only for valid users
- **CASCADE DELETE**: Cleans up profiles when user is deleted
- **CHECK constraint**: Enforces valid roles at database level
- **Default role**: New users default to 'user' (job seeker)
- **Separate from auth.users**: Allows flexible profile schema without touching Supabase auth

**Indexes:**
- `idx_user_profiles_role` on `role` column for role-based queries

#### 2. `jobs`
**Purpose**: Job listings with approval workflow

```sql
CREATE TYPE job_type_enum AS ENUM ('full-time', 'part-time', 'project', 'freelance');
CREATE TYPE job_status_enum AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published', 'expired');
CREATE TYPE apply_method_enum AS ENUM ('url', 'email');

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description_html TEXT NOT NULL,
  job_type job_type_enum NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'IDR',
  location TEXT NOT NULL DEFAULT 'Remote',
  apply_method apply_method_enum NOT NULL DEFAULT 'url',
  apply_url TEXT,
  apply_email TEXT,
  deadline DATE,
  duration_estimate TEXT,
  status job_status_enum NOT NULL DEFAULT 'draft',
  is_verified_by_admin BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  posted_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  CONSTRAINT salary_min_positive CHECK (salary_min >= 0),
  CONSTRAINT salary_max_positive CHECK (salary_max >= 0),
  CONSTRAINT salary_range_valid CHECK (salary_max >= salary_min),
  CONSTRAINT apply_url_present CHECK (apply_method = 'url' AND apply_url IS NOT NULL),
  CONSTRAINT apply_email_present CHECK (apply_method = 'email' AND apply_email IS NOT NULL),
  CONSTRAINT deadline_future CHECK (deadline >= CURRENT_DATE)
);
```

**Design Decisions:**
- **ENUM types**: Enforces valid values at database level
- **Three-state verification**: `is_verified_by_admin` (true, false, null) tracks admin review status
- **Status workflow**: Draft → Pending → Published/Rejected → Expired
- **Apply method flexibility**: Supports both URL and email applications
- **Salary validation**: Database-level constraints ensure valid ranges
- **Time tracking**: `created_at`, `updated_at`, `published_at` for auditing

**Indexes:**
- `idx_jobs_status` on `status` column
- `idx_jobs_job_type` on `job_type` column
- `idx_jobs_deadline` on `deadline` column
- `idx_jobs_posted_by` on `posted_by_user_id` column
- `idx_jobs_published_at` on `published_at` column
- `idx_jobs_company` on `company` column
- `idx_jobs_status_type` on `(status, job_type)` - composite index

#### 3. `job_applications`
**Purpose**: Track job applications and status

```sql
CREATE TYPE application_status_enum AS ENUM (
  'applied', 'pending', 'viewed', 'interview', 'offered', 'rejected', 'withdrawn'
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status application_status_enum DEFAULT 'applied',
  cover_letter TEXT,
  resume_url TEXT,
  notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);
```

**Design Decisions:**
- **UNIQUE constraint**: Prevents duplicate applications to same job
- **Status enum**: Complete application lifecycle tracking
- **CASCADE deletes**: Cleanups when user or job is deleted
- **Flexible content**: Optional cover letter, resume URL, and notes

#### 4. `learning_modules`
**Purpose**: Educational content management

```sql
CREATE TYPE learning_category_enum AS ENUM (
  'communication', 'mindset', 'career', 'design', 'productivity'
);

CREATE TABLE learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category learning_category_enum NOT NULL DEFAULT 'career',
  content TEXT,
  thumbnail_url TEXT,
  duration_min INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' 
          CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Design Decisions:**
- **Slug-based routing**: URL-friendly unique identifiers
- **Category enum**: Consistent categorization
- **Content storage**: Markdown/HTML stored directly for simplicity
- **Status workflow**: Draft → Published → Archived

#### 5. `user_learning_progress`
**Purpose**: Track user module completion

```sql
CREATE TABLE user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);
```

**Design Decisions:**
- **Progress tracking**: 0-100% completion tracking
- **UNIQUE constraint**: One progress record per user-module pair
- **Completion timestamp**: `completed_at` for certificates

#### 6. `user_settings`
**Purpose**: Extended user preferences and settings

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT,
  role TEXT,
  bio TEXT,
  email_notifications BOOLEAN DEFAULT true,
  job_alerts BOOLEAN DEFAULT true,
  learning_reminders BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Design Decisions:**
- **UNIQUE constraint**: One settings record per user
- **Flexible preferences**: Various notification toggles and profile info
- **Separate from profiles**: Keeps auth/profile separate from preferences

#### 7. `activity_log`
**Purpose**: Audit trail of user actions

```sql
CREATE TYPE activity_type_enum AS ENUM (
  'job_applied', 'module_started', 'module_completed', 
  'profile_updated', 'cv_updated', 'portfolio_updated'
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type activity_type_enum NOT NULL,
  title TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Design Decisions:**
- **JSONB metadata**: Flexible storage for action-specific data
- **Type enum**: Standardizes action categories
- **Timestamp ordering**: `created_at` for chronology

---

## Row Level Security (RLS) Policies

### Architecture Principles

1. **Default Deny**: No access unless explicitly permitted
2. **Role-Based Access**: Different rules for admin, user, client
3. **Ownership Checks**: Users can only access their own data
4. **Public Reads**: Published content is world-readable
5. **Admin Override**: Service role bypasses RLS for admin operations

### RLS Policy Examples

#### Example 1: Jobs Table - Public Read

```sql
-- Public can read published jobs
CREATE POLICY "Public can read published jobs"
  ON jobs FOR SELECT
  USING (status = 'published');
```

**Why**: Published jobs should be visible to all visitors without authentication.

#### Example 2: Jobs Table - User Write

```sql
-- Users can create jobs
CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = posted_by_user_id);

-- Users can update own jobs (draft or pending only)
CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'))
  WITH CHECK (auth.uid() = posted_by_user_id);
```

**Why**: 
- Users can only create jobs as themselves
- Limited editing to drafts and pending jobs (published jobs are immutable)
- Prevents users from modifying published jobs of others

#### Example 3: Jobs Table - Admin Override

```sql
-- Admins can read all jobs
CREATE POLICY "Admins can read all jobs"
  ON jobs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admins can update any job
CREATE POLICY "Admins can update any job"
  ON jobs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
```

**Why**: Admins need full access for approval workflow and management.

### RLS vs Service Role

**RLS Policies**:
- Applied to regular client connections
- Enforce data access rules
- Used for normal user operations

**Service Role Client**:
- Uses `SUPABASE_SERVICE_ROLE_KEY`
- Bypasses all RLS policies
- Used for admin operations and triggers
- Required for cross-user updates (admin approving client jobs)

---

## Triggers and Functions

### Auto-Create User Profile

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Why**: Automatically creates profile when user signs up, ensuring data consistency.

### Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
```

**Why**: Automatically tracks when records were modified without application logic.

---

## Indexing Strategy

### Index Types Used

1. **Single Column Indexes**: Fast lookups by single field
2. **Composite Indexes**: Optimize multi-column queries
3. **Foreign Key Indexes**: Speed up JOIN operations
4. **Unique Indexes**: Enforce data integrity

### Index Examples

```sql
-- Single column for filtering
CREATE INDEX idx_jobs_status ON jobs(status);

-- Composite for complex queries
CREATE INDEX idx_jobs_status_type ON jobs(status, job_type);

-- Foreign key for joins
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by_user_id);
```

### Performance Considerations

- **Write overhead**: Indexes slow down INSERT/UPDATE operations
- **Query optimization**: Choose indexes based on common query patterns
- **Monitoring**: Use `EXPLAIN ANALYZE` to verify index usage
- **Composite tradeoff**: Can speed up queries but increase index size

---

## Data Types and Constraints

### ENUM Types

**When to Use**: Fixed set of values that rarely change

```sql
CREATE TYPE job_status_enum AS ENUM (
  'draft', 'pending', 'published', 'rejected', 'expired'
);
```

**Benefits**:
- Database-level validation
- Type safety in queries
- Storage efficiency
- Self-documenting schema

**Drawbacks**:
- Hard to modify (requires ALTER TYPE)
- Can cause migration complexity

### CHECK Constraints

**When to Use**: Business rules that can be expressed as boolean expressions

```sql
ALTER TABLE jobs ADD CONSTRAINT salary_range_valid 
CHECK (salary_max >= salary_min);
```

**Benefits**:
- Enforce business logic at database level
- Prevent invalid data entry
- Can be added/removed easily
- Descriptive error messages

### JSONB Columns

**When to Use**: Flexible, semi-structured data

```sql
CREATE TABLE activity_log (
  metadata JSONB DEFAULT '{}'
);
```

**Benefits**:
- Schema flexibility
- Can store nested objects
- Queryable with JSON operators
- Efficient storage and indexing

**Usage Examples**:
```sql
-- Query JSONB field
SELECT * FROM activity_log 
WHERE metadata->>'job_id' = '12345-67890-...';

-- Index JSONB
CREATE INDEX idx_activity_metadata ON activity_log USING GIN (metadata);
```

---

## Migration Strategy

### Migration Naming Convention

```
{number}_{descriptive_name}.sql
001_create_user_profiles.sql
002_create_dashboard_tables.sql
003_create_jobs_table.sql
```

### Migration Best Practices

1. **Sequential Numbering**: Never skip numbers
2. **Descriptive Names**: Clear purpose in filename
3. **Rollback Comments**: Include rollback SQL at bottom
4. **Backwards Compatible**: Design migrations to work with existing data
5. **Test Locally**: Verify before pushing to production

### Migration Template

```sql
-- Migration: {description}
-- Date: {date}
-- Description: {detailed description}

-- ↑ Migration steps above
-- ↓ Rollback steps below

-- Rollback: {description of rollback}
-- Uncomment to rollback:
-- ALTER TABLE jobs DROP COLUMN new_column;
-- DROP INDEX IF EXISTS idx_jobs_new_column;
```

### Handling Breaking Changes

```sql
-- 1. Add new column with default
ALTER TABLE jobs ADD COLUMN new_field TEXT DEFAULT 'legacy_value';

-- 2. Deploy code that uses new_field
-- 3. Backfill data from old_field to new_field
UPDATE jobs SET new_field = old_field WHERE new_field = 'legacy_value';

-- 4. Remove old column
ALTER TABLE jobs DROP COLUMN old_field;
```

---

## Performance Optimization

### Query Optimization

1. **Use indexes**: Ensure WHERE clause columns are indexed
2. **Limit results**: Use pagination for large result sets
3. **Select specific columns**: Avoid `SELECT *` when possible
4. **Use JOIN wisely**: Only JOIN when necessary
5. **Cache common queries**: Consider materialized views for aggregations

### Connection Management

```typescript
// Good: Use server client for most operations
const supabase = getSupabaseServerClient();

// Exception: Use service role for admin cross-user operations
const supabase = getSupabaseServiceClient();
```

### Monitoring Queries

```sql
-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM jobs WHERE status = 'published';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security Considerations

### Authentication vs Authorization

**Authentication** (Supabase Auth):
- Who is the user?
- Handled by `auth.users` table
- JWT tokens identify users
- Never store passwords in application tables

**Authorization** (RLS Policies):
- What can the user do?
- Handled by RLS policies
- Role-based access control
- Database-level enforcement

### Security Best Practices

1. **Never trust client data**: Always validate server-side
2. **Use RLS policies**: Enforce rules at database level
3. **Service role carefully**: Only use when necessary
4. **Audit logs**: Track important operations
5. **Principle of least privilege**: Users only access what they need

### Admin Operations

```typescript
// ❌ Bad: Regular client with admin check
const supabase = getSupabaseServerClient();
await supabase.from('jobs').update({...}).eq('id', jobId);
// RLS may block even admin users

// ✅ Good: Service role client
const supabase = getSupabaseServiceClient();
await supabase.from('jobs').update({...}).eq('id', jobId);
// Bypasses RLS, role check still needed
```

---

## Backup and Recovery

### Backup Strategy

1. **Supabase Automated Backups**: Daily automated backups included
2. **Point-in-time Recovery**: Can restore to specific timestamp
3. **Export Backups**: Regular SQL dumps for portability

### Backup Commands

```bash
# Export database schema
supabase db dump -f schema_dump.sql --schema public

# Export data with inserts
supabase db dump -f data_dump.sql --data-only --schema public
```

### Recovery Process

1. Access Supabase dashboard
2. Navigate to Database → Backups
3. Select backup timestamp
4. Click "Restore to point in time"
5. Confirm restoration

---

## Troubleshooting

### Common Issues

#### Issue 1: RLS blocking admin operations

**Symptom**: Admin can't update jobs posted by others
**Solution**: Use service role client for admin operations

#### Issue 2: Slow query performance

**Symptom**: Page loading times increased after new table
**Solution**: Add indexes on WHERE clause columns

#### Issue 3: Migration conflicts

**Symptom**: Migration fails with "relation already exists"
**Solution**: Check if migration was already applied:
```sql
SELECT * FROM supabase_migrations.schema_migrations WHERE version = '003';
```

#### Issue 4: ENUM modification errors

**Symptom**: Can't add new ENUM value without recreating table
**Solution**: Use ALTER TYPE:
```sql
ALTER TYPE job_status_enum ADD VALUE 'new_status' AFTER 'existing_status';
```

---

## Related Documentation

- **Job Board Implementation**: See `docs/JOB_BOARD_IMPLEMENTATION.md`
- **Job Posting Workflow**: See `docs/JOB_POSTING_WORKFLOW.md`
- **Role System**: See `docs/ROLE_SYSTEM.md`
- **Client Role Implementation**: See `docs/CLIENT_ROLE_IMPLEMENTATION.md`

---

## Glossary

| Term | Definition |
|-------|------------|
| **RLS** | Row Level Security - database-level access control |
| **ENUM** | Enumeration type with fixed set of values |
| **CASCADE** | Automatic deletion of related records |
| **JSONB** | Binary JSON type with querying capabilities |
| **Service Role** | Admin database connection that bypasses RLS |
| **Foreign Key** | Reference to primary key in another table |
| **Index** | Data structure that speeds up queries |
| **Trigger** | Automatic function execution on table events |
| **Migration** | Structured database schema changes |

---

**Last Updated:** April 10, 2026
**Maintained By:** Development Team

---

## Quick Reference

### Key Client Types

```typescript
// Regular server client - respects RLS
import { getSupabaseServerClient } from '@/lib/supabase/server';
const supabase = getSupabaseServerClient();

// Service role client - bypasses RLS (admin operations)
import { getSupabaseServiceClient } from '@/lib/supabase/server';
const supabase = getSupabaseServiceClient();
```

### Common RLS Patterns

```sql
-- User owns data
auth.uid() = user_id

-- Published content
status = 'published'

-- Admin check
EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
```

### Status Workflows

**Jobs**: draft → pending → published/rejected → expired
**Applications**: applied → pending → viewed → interview → offered → rejected/withdrawn
**Learning**: draft → published → archived
**Progress**: 0% → 100% → completed_at set