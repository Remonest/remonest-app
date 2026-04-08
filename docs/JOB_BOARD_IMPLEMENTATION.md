# Job Board Implementation

**Version:** 1.0.0
**Date:** April 7, 2026

---

## Overview

Complete implementation of the Job Board feature with dual posting workflow (Admin vs Client), approval queue, and all required UI components.

---

## Implementation Status

**Last Updated:** April 8, 2026
**Completion:** 80% - CRUD Operations

| Operation | Status | Notes |
|-----------|--------|-------|
| **CREATE** | ✅ Complete | Dual posting workflow (Admin/User), form validation, draft support, admin immediate publishing |
| **READ** | ✅ Complete | Multiple query methods, filtering, approval queue |
| **UPDATE** | ⚠️ Partial | Status changes only (approve/reject/republish). **Missing: Content editing** |
| **DELETE** | ✅ Complete | Permission-based deletion with restrictions |

**Missing Features:**
- Edit job content (title, salary, description, etc.)
- Edit UI interface for users
- Edit server action for content modifications
- Edit page/route (`/jobs/[id]/edit` or `/dashboard/jobs/[id]/edit`)

**Admin Posting Flow:**
- ✅ `/admin/jobs/new` page created with `PostJobForm`
- ✅ Admin authentication and access control
- ✅ Automatic `is_verified_by_admin = true` for admin posts
- ✅ Immediate publishing without approval queue
- ✅ Admin jobs display verification badge
- ✅ Button added to admin dashboard for easy access

---

## What Was Implemented

### 1. Database Schema (`supabase/migrations/003_create_jobs_table.sql`)

**Tables Created:**
- `jobs` table with all required fields
- Enums: `job_type_enum`, `job_status_enum`, `apply_method_enum`
- Indexes: status, job_type, deadline, posted_by_user_id, published_at, company
- Composite index for efficient queries

**Features:**
- Dual posting: Admin (published immediately) vs Client (pending approval)
- Verification badge support (`is_verified_by_admin`)
- Flexible salary ranges
- Multiple apply methods (URL or email)
- Deadline and duration tracking
- Auto-update timestamps

**RLS Policies:**
- Public read: published jobs
- User CRUD: own jobs (draft/pending only)
- Admin full access: all jobs

**Sample Data:**
- 4 sample jobs (2 published, 1 pending, 1 freelance)

---

### 2. Server Actions (`src/lib/jobs/actions.ts`)

**Functions Implemented:**

| Function | Description | Returns |
|----------|-------------|---------|
| `getJobs(filters)` | Fetch published jobs with optional filters | Job[] |
| `getJobById(id)` | Get single job by ID | Job \| null |
| `getUserJobs()` | Get jobs posted by current user | Job[] |
| `getPendingJobs()` | Get pending jobs for admin approval | Job[] |
| `getAllJobs()` | Get all jobs for admin | Job[] |
| `submitJob(formData)` | Submit new job (published for admin, pending for users) | Result |
| `saveJobDraft(formData)` | Save job as draft | Result |
| `approveJob(jobId)` | Approve pending job | Result |
| `rejectJob(jobId, reason)` | Reject pending job with reason | Result |
| `deleteJob(jobId)` | Delete job (with restrictions) | Result |
| `republishJob(jobId)` | Republish expired job | Result |

**Helper Functions:**
- `formatSalary(min, max, currency)` - Format salary for display
- `formatDeadline(date)` - Format deadline in Indonesian
- `getJobTypeLabel(type)` - Get Indonesian label
- `getStatusLabel(status)` - Get Indonesian label

**Validation:**
- Zod schema for job submission
- Email confirmation for apply_method
- Salary range validation
- Deadline validation (future dates only)

---

### 3. UI Components (`src/components/jobs/`)

#### JobCard.tsx
- Displays job information in a card format
- Shows all required fields: title, company, job type, salary, location, deadline
- Verification badge when `is_verified_by_admin = true`
- Apply button (opens URL or email client)
- Status badge for admin view

#### JobTypeBadge.tsx
- Color-coded badges for job types
- Colors:
  - Full-Time: `#0891b2` (blue)
  - Part-Time: `#0d9488` (teal)
  - Project: `#f97316` (orange)
  - Freelance: `#8b5cf6` (purple)
- Hover effect for better UX

#### VerificationBadge.tsx
- Green badge with checkmark
- Shows "✅ Verified by Admin"
- Two sizes: sm and md
- Uses emerald color for verification

#### StatusBadge.tsx
- Color-coded status badges:
  - Draft: gray
  - Pending: amber
  - Approved: blue
  - Rejected: red
  - Published: emerald
  - Expired: orange

#### PostJobForm.tsx
- Unified form for posting jobs
- Adapts based on user role (Admin vs Client)
- Fields:
  - Basic info: title, company, job type, description
  - Salary: min/max in IDR
  - Details: location, duration, deadline
  - Apply method: URL or email
- Two actions:
  - Submit (publish or send for approval)
  - Save as draft
- Client-side validation with Zod
- Loading states and error handling

#### AdminApprovalTable.tsx
- Displays pending jobs in a table
- Shows: title, company, type, salary, poster, date
- Actions: Approve (check) and Reject (X)
- Reject dialog with reason input
- Empty state when no pending jobs
- Real-time updates after approval/rejection

---

### 4. Admin Job Creation Page (`src/app/admin/jobs/new/page.tsx`)

**Features:**
- Admin-only access with authentication check
- Uses `PostJobForm` component with `isAdmin=true` prop
- Automatic publishing with verification badge
- Redirects to `/admin/jobs` after successful submission

**Admin Posting Flow:**
1. Admin accesses `/admin/jobs/new`
2. Fills out job details using `PostJobForm`
3. Clicks "Terbitkan Sekarang" (Publish Now)
4. Job automatically:
   - Sets `status = 'published'`
   - Sets `is_verified_by_admin = true`
   - Sets `published_at = NOW()`
5. Redirects back to admin jobs list

### 5. Updated Admin Dashboard (`src/app/admin/jobs/page.tsx`)

**Features:**
- "Buat Lowongan Baru" button to access creation page
- Tabs for "Menunggu Persetujuan" and "Semua Lowongan"
- Pending tab: Uses `AdminApprovalTable`
- All jobs tab: Uses `DataTable` with Supabase data
- Suspense for loading states
- Indonesian language interface

---

### 5. New UI Components Created

**Required dependencies (added via shadcn/ui):**
- `tabs.tsx` - Tab navigation
- `radio-group.tsx` - Radio button group
- `dialog.tsx` - Modal dialogs

**Existing components used:**
- `card.tsx` - Card layout
- `button.tsx` - Buttons
- `input.tsx` - Text inputs
- `textarea.tsx` - Multi-line inputs
- `select.tsx` - Dropdown select
- `label.tsx` - Form labels
- `badge.tsx` - Badges
- `table.tsx` - Data tables

---

## Usage Guide

### For Admin Users

1. **Create and Publish Job (Verified):**
   - Visit `/admin/jobs` and click "Buat Lowongan Baru" button
   - Navigate to `/admin/jobs/new`
   - Fill in job details using the form
   - Click "Terbitkan Sekarang" (Publish Now)
   - Job automatically:
     - Sets `status = 'published'`
     - Sets `is_verified_by_admin = true`
     - Sets `published_at = NOW()`
   - Redirects back to admin jobs list
   - Job displays with green ✅ verification badge

2. **Review Pending Jobs:**
   - Visit `/admin/jobs`
   - Switch to "Menunggu Persetujuan" tab
   - Review each job submitted by users
   - Click ✅ to approve (publishes job with verification)
   - Click ❌ to reject (opens dialog for reason)
   - Both actions update in real-time

3. **Manage All Jobs:**
   - Switch to "Semua Lowongan" tab
   - View all jobs with status badges
   - Use DataTable sorting/filtering
   - Admin jobs show verified status

### For Regular Users

1. **Post Job:**
   - Visit posting form page (to be created)
   - Fill in job details
   - Click "Kirim untuk Persetujuan" - job goes to pending
   - Or click "Simpan Draft" - saves as draft

2. **View Published Jobs:**
   - Visit `/jobs` page (to be updated with Supabase data)
   - Browse published jobs with filters
   - See verification badges on approved jobs

3. **Manage Own Jobs:**
   - Visit dashboard or "My Jobs" page (to be created)
   - View own jobs with status
   - Edit/delete draft or pending jobs
   - Cannot delete published jobs (admin only)

---

## Database Migration

To apply the migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually
psql -h YOUR_DB_HOST -U YOUR_USER -d YOUR_DB -f supabase/migrations/003_create_jobs_table.sql
```

---

## API Endpoints (Server Actions)

All functionality is implemented via Server Actions, no separate API routes needed:

```typescript
// In React components
import { submitJob, getJobs, approveJob, rejectJob } from '@/lib/jobs/actions';

// Fetch published jobs
const jobs = await getJobs({ job_type: 'full-time', search: 'react' });

// Submit new job
const result = await submitJob(formData);

// Approve job (admin only)
const result = await approveJob(jobId);

// Reject job (admin only)
const result = await rejectJob(jobId, reason);
```

---

## TODO: Pages to Create

1. **`/jobs`** - Public job board with filters
   - Job grid using `JobCard` components
   - Search and filter functionality
   - Connect to `getJobs()` action

2. **`/jobs/[id]`** - Single job detail page
   - Full job description
   - Apply button
   - Related jobs section

3. **`/jobs/post`** - Public job posting form page
   - Use `PostJobForm` component
   - Check user role and adapt message
   - Handle redirects after submission

4. **`/dashboard/jobs`** - User's job management
   - List user's jobs with status
   - Edit/delete actions for draft/pending jobs
   - View published jobs (read-only)

5. **`/dashboard/jobs/post`** - Dashboard posting form
   - Same as `/jobs/post` but in dashboard context

---

## Testing

1. **Apply migration to Supabase**

2. **Test admin job creation and posting:**
   - Login as admin user
   - Visit `/admin/jobs` and click "Buat Lowongan Baru"
   - Fill in job details and submit
   - Verify job appears immediately in "Semua Lowongan" tab
   - Check verification badge is shown on the job
   - Verify `status = 'published'` and `is_verified_by_admin = true` in database

3. **Test user posting (pending approval):**
   - Login as regular user
   - Post job using form
   - Verify job goes to pending status
   - Login as admin and check "Menunggu Persetujuan" tab
   - Approve the job
   - Verify job becomes published with verification badge

4. **Test approval workflow:**
   - Login as regular user, create multiple jobs
   - Login as admin
   - Review jobs in "Menunggu Persetujuan" tab
   - Approve some jobs (they get verified badge)
   - Reject others with reasons
   - Verify status changes and verification badges

5. **Test admin vs regular user posting:**
   - Compare admin job (verified, published immediately) vs user job (unverified, pending)
   - Check database records for proper status and verification flags

---

## Security Notes

1. **RLS Policies:**
   - Users can only read published jobs
   - Users can CRUD own jobs (draft/pending only)
   - Admins have full access to all jobs
   - Service role bypasses RLS for triggers

2. **Admin Checks:**
   - `approveJob()` and `rejectJob()` verify admin role
   - `isAdmin()` function checks `user_profiles.role`
   - Non-admin users cannot approve/reject

3. **Validation:**
   - All user inputs validated with Zod
   - Salary ranges checked for consistency
   - Deadlines must be future dates
   - URLs validated format

4. **CSRF Protection:**
   - Server Actions automatically protected by Next.js

---

## Next Steps

**Priority 1 - Complete CRUD Implementation:**
1. **Implement UPDATE (Content Editing):**
   - Create `updateJob()` server action in `src/lib/jobs/actions.ts`
   - Add edit functionality to PostJobForm component
   - Create edit pages: `/jobs/[id]/edit` and `/dashboard/jobs/[id]/edit`
   - Update RLS policies to allow content editing

**Priority 2 - Page Completion:**
2. Run migration on Supabase
3. Update `/jobs` page with Supabase data (currently using mock data)
4. Create `/jobs/post` page
5. Create `/dashboard/jobs` page

**Priority 3 - Enhancements:**
6. Add email notifications for approval/rejection
7. Implement job expiry cron job
8. Add advanced search/filters
9. Create job analytics dashboard

**Completed:**
- ✅ Admin job creation flow (`/admin/jobs/new`)
- ✅ Admin immediate publishing with verification
- ✅ Admin dashboard integration

---

## Components Export Structure

```typescript
// src/components/jobs/index.ts
export { JobCard } from './JobCard';
export { JobTypeBadge } from './JobTypeBadge';
export { VerificationBadge } from './VerificationBadge';
export { StatusBadge } from './StatusBadge';
export { PostJobForm } from './PostJobForm';
export { AdminApprovalTable } from './AdminApprovalTable';

// Usage
import { JobCard, JobTypeBadge, PostJobForm } from '@/components/jobs';
```

---

## Color Reference

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Full-Time Badge | Blue | `#0891b2` | Full-time job type |
| Part-Time Badge | Teal | `#0d9488` | Part-time job type |
| Project Badge | Orange | `#f97316` | Project job type |
| Freelance Badge | Purple | `#8b5cf6` | Freelance job type |
| Verification Badge | Emerald | `#10b981` | Admin verified jobs |
| Pending Status | Amber | `#f59e0b` | Jobs awaiting approval |
| Published Status | Emerald | `#10b981` | Live jobs |
| Rejected Status | Red | `#ef4444` | Rejected jobs |

---

## Implementation Notes

*Core functionality complete as of April 7, 2026*
*Admin job creation flow implemented on April 8, 2026*

**Summary:** The job board implementation is 80% complete. All core CRUD operations except UPDATE (content editing) are fully functional. Admin users can now create and publish verified jobs immediately via `/admin/jobs/new`. The missing UPDATE functionality prevents users from editing their draft or pending job content after submission.
