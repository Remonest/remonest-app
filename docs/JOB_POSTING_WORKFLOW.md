# Job Posting Workflow Update

**Version:** v0.3.2
**Date:** April 8, 2026

---

## Overview

Updated the job posting workflow to differentiate between admin and client roles:
- **Admin posts job**: Immediately published with verified status (`is_verified_by_admin = true`)
- **Client posts job**: Submitted for review (`status = 'pending'`, `is_verified_by_admin = null`)
- Admin must approve client-posted jobs before they go live

This restores the approval queue for client submissions while allowing admins to bypass it.

---

## Changes Made

### 1. Database Migration (`010_make_is_verified_by_admin_nullable.sql`)

**Changes:**
- Dropped `DEFAULT false` constraint on `is_verified_by_admin` column
- Changed column to allow `NULL` values
- Set existing pending jobs to `NULL` (not yet reviewed)
- Added column comment explaining the three-state logic

**Column States:**
| Value | Meaning |
|-------|---------|
| `true` | Admin verified (admin-posted or approved) |
| `null` | Not yet reviewed (client-posted, pending) |
| `false` | Rejected or explicitly unverified |

---

### 2. Job Submission Logic (`src/lib/jobs/actions.ts`)

**Before:**
```typescript
// All jobs auto-verified
const initialStatus: JobStatus = "published";
const isVerified = true;
```

**After:**
```typescript
// Role-based status and verification
const userIsAdmin = await isAdmin(user.id);
const initialStatus: JobStatus = userIsAdmin ? "published" : "pending";
const isVerified: boolean | null = userIsAdmin ? true : null;
```

**What Changed:**
- Admin jobs → `published` + `is_verified_by_admin = true`
- Client jobs → `pending` + `is_verified_by_admin = null`
- Different success messages per role:
  - Admin: "Lowongan berhasil diterbitkan dan terverifikasi"
  - Client: "Lowongan berhasil dikirim untuk persetujuan admin"

---

### 3. Job Posting Page (`src/app/(main)/jobs/post/page.tsx`)

**Before:**
- Same green "Auto-Verified Publishing" banner for everyone
- Passed `isAdmin={true}` to form for all users

**After:**
- **Admin**: Green banner "Admin Posting" (immediate publish)
- **Client**: Amber banner "Pending Admin Review" (24-48 hour review)
- Passes `isAdmin={isAdmin}` to form for role-specific behavior

---

## Workflow Comparison

### Admin Workflow

```
Admin Posts Job
    ↓
Status: 'published' ✓
is_verified_by_admin: true ✓
published_at: NOW() ✓
    ↓
Job Goes Live Immediately ✓
```

### Client Workflow

```
Client Posts Job
    ↓
Status: 'pending'
is_verified_by_admin: null (empty)
published_at: null
    ↓
Job Awaits Admin Review
    ↓
Admin Reviews at /admin/jobs
    ↓
Approve → status: 'published', is_verified: true ✓
  OR
Reject → status: 'rejected', reason stored
```

---

## Database Schema

### jobs Table - `is_verified_by_admin` Column

| Property | Value |
|----------|-------|
| Type | `BOOLEAN` |
| Nullable | `YES` |
| Default | `NULL` |
| Purpose | Track admin verification status |

**Migration File:**
```sql
-- 010_make_is_verified_by_admin_nullable.sql
ALTER TABLE public.jobs
  ALTER COLUMN is_verified_by_admin DROP DEFAULT;

ALTER TABLE public.jobs
  ALTER COLUMN is_verified_by_admin DROP NOT NULL;
```

---

## Impact Analysis

### User Experience

| User Type | Behavior | Verification |
|-----------|----------|--------------|
| **Admin** | Immediate publish | Auto-verified ✓ |
| **Client** | Pending review | Null until approved |

### Database Impact

**Job Record Fields:**
| Field | Admin Post | Client Post |
|-------|------------|-------------|
| `status` | `'published'` | `'pending'` |
| `is_verified_by_admin` | `true` | `null` |
| `published_at` | Timestamp | `null` |
| `rejection_reason` | N/A | Set if rejected |

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/migrations/010_make_is_verified_by_admin_nullable.sql` | New migration |
| `src/lib/jobs/actions.ts` | Updated `submitJob()` function |
| `src/app/(main)/jobs/post/page.tsx` | Role-based banners and form props |

---

## Testing Guide

### 1. Test Admin Job Posting

```sql
-- Ensure user has admin role
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';
```

1. Login as admin user
2. Navigate to `/jobs/post` or `/admin/jobs/new`
3. Verify green "Admin Posting" banner appears
4. Fill out job form and submit
5. Verify success message: "Lowongan berhasil diterbitkan dan terverifikasi"

**Database Verification:**
```sql
SELECT id, title, status, is_verified_by_admin, published_at
FROM jobs
WHERE title = 'Your Test Job';

-- Expected:
-- status: 'published'
-- is_verified_by_admin: true
-- published_at: <timestamp>
```

### 2. Test Client Job Posting

```sql
-- Ensure user has client role
UPDATE user_profiles SET role = 'client' WHERE id = 'your-uuid';
```

1. Login as client user
2. Navigate to `/jobs/post`
3. Verify amber "Pending Admin Review" banner appears
4. Fill out job form and submit
5. Verify success message: "Lowongan berhasil dikirim untuk persetujuan admin"

**Database Verification:**
```sql
SELECT id, title, status, is_verified_by_admin, published_at
FROM jobs
WHERE title = 'Your Test Job';

-- Expected:
-- status: 'pending'
-- is_verified_by_admin: null
-- published_at: null
```

### 3. Test Admin Approval

1. Login as admin
2. Navigate to `/admin/jobs`
3. Switch to "Menunggu Persetujuan" tab
4. Find the pending job
5. Click approve button

**Database Verification:**
```sql
SELECT id, title, status, is_verified_by_admin, published_at
FROM jobs
WHERE title = 'Your Test Job';

-- Expected after approval:
-- status: 'published'
-- is_verified_by_admin: true
-- published_at: <timestamp>
```

---

## Security Notes

### RLS Policies
- ✅ Clients can only CRUD their own jobs
- ✅ Clients cannot approve/reject jobs (admin-only)
- ✅ Admins have full access to all jobs
- ✅ Service role bypasses RLS for triggers

### Server-Side Validation
- ✅ All role checks happen server-side (`isAdmin()`)
- ✅ `isAdmin()` uses service role client to bypass RLS recursion
- ✅ Server actions verify role before mutations
- ✅ `requireAuth()` throws if unauthenticated

---

## Related Documentation

- **Client Role Implementation**: See `docs/CLIENT_ROLE_IMPLEMENTATION.md`
- **Job Board Implementation**: See `docs/JOB_BOARD_IMPLEMENTATION.md`
- **Admin Access**: See `docs/ADMIN_ACCESS.md`
- **Role System**: See `docs/ROLE_SYSTEM.md`

---

## Changelog

### v0.3.2 (April 8, 2026)
- ✅ Reverted to role-based job posting workflow
- ✅ Admin posts → published + verified
- ✅ Client posts → pending + null verification
- ✅ Added migration 010 for nullable `is_verified_by_admin`
- ✅ Updated job posting page with role-based banners
- ✅ Restored admin approval queue for client submissions

---

**Implementation complete as of April 8, 2026**

**Summary:** The job posting workflow now differentiates between admin and client roles. Admins can publish jobs immediately with verified status, while client submissions go through an approval queue pending admin review.
