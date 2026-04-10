# Job Detail Modal Guide

Complete guide to the Job Detail Modal feature in the Remonest admin panel.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [User Flow](#user-flow)
4. [Component Architecture](#component-architecture)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)
7. [Modal Dialog](#modal-dialog)
8. [Author Column](#author-column)
9. [Testing Guide](#testing-guide)

---

## Overview

The Job Detail Modal is a comprehensive dialog component that allows admins to view complete details of any job posting in the admin panel. It includes author information, job details, salary information, and actions like publish/delete for draft jobs.

**Location:** `/admin/jobs` page  
**File:** `src/components/admin/job-detail-modal.tsx`

---

## ✨ Features

### 1. **Author Column**
- Shows who posted each job
- Displays full name from `user_profiles`
- Shows "Unknown" if author not found

### 2. **View Detail Button**
- Available for all jobs (draft, pending, published, rejected, expired)
- Opens modal with complete job information
- Different button styles for draft vs non-draft jobs

### 3. **Comprehensive Job Details**
The modal displays:
- ✅ Job title and status badge
- ✅ Company name
- ✅ Location
- ✅ Job type (Full-time, Part-time, Project, Freelance)
- ✅ Salary range (if provided)
- ✅ Duration estimate (if provided)
- ✅ Application method (URL or Email)
- ✅ Application deadline
- ✅ Full job description (HTML)
- ✅ Rejection reason (for rejected jobs)
- ✅ Created timestamp (relative time)

### 4. **Actions for Draft Jobs**
- ✅ Publish draft button
- ✅ Delete draft button (with confirmation)
- ✅ Loading states during actions
- ✅ Toast notifications for success/error

---

## 🔄 User Flow

### Viewing Job Details

```
Admin navigates to /admin/jobs
    ↓
Sees job list with Author column
    ↓
Clicks "Lihat Detail" or "Lihat" button
    ↓
Modal opens with complete job information
    ↓
Reviews all job details
    ↓
Closes modal by:
  - Clicking "Tutup" button
  - Clicking X in top-right
  - Clicking outside modal
  - Pressing Escape key
```

### Publishing Draft Job

```
Admin views draft job details
    ↓
Clicks "Terbitkan Draft" button
    ↓
Server action runs:
  - Validates job ID
  - Updates status: draft → published
  - Sets is_verified_by_admin = true
  - Sets published_at = NOW()
  ↓
Success toast appears
    ↓
Modal closes
    ↓
Table refreshes (draft removed from list)
```

### Deleting Draft Job

```
Admin views draft job details
    ↓
Clicks "Hapus Draft" button
    ↓
Confirmation dialog appears
    ↓
Admin confirms deletion
    ↓
Server action runs:
  - Validates job ID
  - Checks permissions
  - Deletes job from database
  ↓
Success toast appears
    ↓
Modal closes
    ↓
Table refreshes (draft removed from list)
```

---

## 🏗️ Component Architecture

### Component Tree

```
/admin/jobs/page.tsx (Server Component)
    ↓
DraftJobsContentClient (Client Component)
    ├── DraftJobsTable
    │   └── DataTable
    │       └── Columns (with Author + View button)
    │
    └── JobDetailModal
        ├── Dialog
        │   ├── DialogContent
        │   │   ├── DialogHeader
        │   │   │   ├── DialogTitle
        │   │   │   └── DialogDescription
        │   │   │
        │   │   ├── Job Details
        │   │   │   ├── Company Info
        │   │   │   ├── Salary & Duration
        │   │   │   ├── Apply Method
        │   │   │   ├── Deadline
        │   │   │   └── Description
        │   │   │
        │   │   └── DialogFooter
        │   │       ├── Publish Button (draft only)
        │   │       ├── Delete Button (draft only)
        │   │       └── Close Button (non-draft)
        │   │
        │   └── Loading Overlay
        │
        └── Toast Notifications
```

### Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `src/components/admin/job-detail-modal.tsx` | ✅ Exists | Modal component |
| `src/components/admin/job-columns.tsx` | ✅ Updated | Added Author column + View button |
| `src/components/admin/draft-jobs-content.tsx` | ✅ Updated | Integrated modal |
| `src/features/jobs/utils/queries.ts` | ✅ Updated | Fetch author name with jobs |

---

## 📝 Implementation Details

### 1. Author Column Implementation

**File:** `src/components/admin/job-columns.tsx`

```tsx
{
  id: "author",
  header: "Author",
  cell: ({ row }) => {
    const authorName = (row.original as any).author_name || "Unknown";
    return (
      <span className="text-sm text-muted-foreground">{authorName}</span>
    );
  },
}
```

**How it Works:**
- Added as a new column in the job table
- Reads `author_name` from job data
- Shows "Unknown" if author not found
- Displays in muted text for visual hierarchy

### 2. Fetching Author Name

**File:** `src/features/jobs/utils/queries.ts`

```typescript
export const getAllJobsQuery = cache(async (): Promise<Job[]> => {
  const supabase = getSupabaseServerClient();
  
  // Fetch jobs with author info using join
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      author:user_profiles!jobs_posted_by_user_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  // Add author_name to each job
  const jobsWithAuthor = (data || []).map((job: any) => ({
    ...job,
    author_name: job.author?.full_name || "Unknown",
  }));

  return jobsWithAuthor as Job[];
});
```

**How it Works:**
- Uses Supabase join syntax to fetch author from `user_profiles`
- Foreign key: `jobs_posted_by_user_id_fkey`
- Selects only `full_name` from user_profiles
- Maps result to add `author_name` field to each job

### 3. Dynamic Column Creation

**File:** `src/components/admin/job-columns.tsx`

```tsx
interface JobColumnsOptions {
  onViewDetails?: (job: Job & { author_name?: string }) => void;
}

export const createColumns = (options?: JobColumnsOptions) => {
  // ... columns array
  
  // Actions column with View button
  {
    id: "actions",
    cell: ({ row }) => {
      const job = row.original;
      
      // For draft jobs: View + JobActions
      if (job.status === "draft") {
        return (
          <div className="flex items-center gap-2">
            <Button onClick={() => options?.onViewDetails?.(job)}>
              <Eye className="h-3.5 w-3.5" />
              Lihat
            </Button>
            <JobActions jobId={job.id} ... />
          </div>
        );
      }
      
      // For non-draft jobs: View only
      return (
        <Button onClick={() => options?.onViewDetails?.(job)}>
          <Eye className="h-3.5 w-3.5" />
          Lihat Detail
        </Button>
      );
    },
  }
  
  return columns;
};
```

**How it Works:**
- Factory function creates columns with custom callbacks
- `onViewDetails` callback opens modal
- Draft jobs get both View and JobActions buttons
- Non-draft jobs only get View button

### 4. Modal Integration

**File:** `src/components/admin/draft-jobs-content.tsx`

```tsx
export function DraftJobsContentClient({ initialData }) {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };
  
  const dynamicColumns = createColumns({ onViewDetails: handleViewDetails });
  
  return (
    <div>
      <DraftJobsTable data={jobs} columns={dynamicColumns} />
      
      <JobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
```

**How it Works:**
- Client component manages modal state
- `handleViewDetails` callback sets selected job and opens modal
- Modal receives full job data for display
- `onRefresh` callback refreshes table after actions

---

## 💻 Usage Examples

### Adding View Button to Custom Table

```tsx
import { createColumns } from "@/components/admin/job-columns";
import { JobDetailModal } from "@/components/admin/job-detail-modal";

function MyCustomTable({ jobs }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const columns = createColumns({
    onViewDetails: (job) => {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  });
  
  return (
    <div>
      <DataTable data={jobs} columns={columns} />
      <JobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={() => {
          // Refresh logic
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
```

### Using Modal Directly

```tsx
import { JobDetailModal } from "@/components/admin/job-detail-modal";

function MyComponent() {
  const [job, setJob] = useState(null);
  const [open, setOpen] = useState(false);
  
  const handleViewJob = async (jobId: string) => {
    // Fetch job data
    const jobData = await fetchJob(jobId);
    setJob(jobData);
    setOpen(true);
  };
  
  return (
    <JobDetailModal
      job={job}
      open={open}
      onClose={() => setOpen(false)}
      onRefresh={() => {
        // Refresh parent data
        router.refresh();
        setOpen(false);
      }}
    />
  );
}
```

---

## 📋 Modal Dialog Structure

### Header Section
```
┌─────────────────────────────────────────┐
│ Job Title                    [Status]   │
│ Created 2 hours ago                     │
└─────────────────────────────────────────┘
```

### Company Info
```
📄 Company Name
📍 Location    💼 Job Type
```

### Salary & Duration
```
💰 Salary: Rp 10 – 15jt / bulan
📅 Duration: 3 bulan
```

### Application Method
```
🔗 Apply URL: https://example.com/apply
   or
📧 Apply Email: hr@company.com
```

### Deadline
```
📅 Deadline: 30 April 2026
```

### Description
```
📝 Description
[Rich HTML content from job posting]
```

### Rejection Reason (if rejected)
```
❌ Alasan Penolakan
[Reason provided by admin]
```

### Footer Actions (for drafts)
```
┌─────────────────────────────────────────┐
│  [❌ Hapus Draft]  [✓ Terbitkan Draft]  │
└─────────────────────────────────────────┘
```

### Footer Actions (for non-drafts)
```
┌─────────────────────────────────────────┐
│              [Tutup]                     │
└─────────────────────────────────────────┘
```

---

## 🔍 Testing Guide

### Manual Testing Checklist

#### 1. Author Column
- [ ] Navigate to `/admin/jobs`
- [ ] Check "Semua Lowongan" tab
- [ ] Verify "Author" column appears
- [ ] Verify author names display correctly
- [ ] Check "Unknown" shows for missing authors

#### 2. View Button
- [ ] Check all tabs have View buttons
- [ ] Draft jobs show "Lihat" + JobActions
- [ ] Non-draft jobs show "Lihat Detail"
- [ ] Buttons are properly aligned

#### 3. Modal Display
- [ ] Click View button on any job
- [ ] Modal opens with job details
- [ ] All fields display correctly
- [ ] Status badge shows correct color
- [ ] Timestamp shows relative time

#### 4. Draft Job Actions
- [ ] Open draft job modal
- [ ] Click "Terbitkan Draft"
- [ ] Verify success toast
- [ ] Verify modal closes
- [ ] Verify job removed from draft list
- [ ] Verify job appears in published list

#### 5. Delete Draft
- [ ] Open draft job modal
- [ ] Click "Hapus Draft"
- [ ] Confirm deletion
- [ ] Verify success toast
- [ ] Verify job removed from list

#### 6. Modal Close
- [ ] Click "Tutup" button → modal closes
- [ ] Click X in top-right → modal closes
- [ ] Click outside modal → modal closes
- [ ] Press Escape key → modal closes

#### 7. Error Handling
- [ ] Try to publish job without ID → should fail gracefully
- [ ] Try to delete job without ID → should fail gracefully
- [ ] Network error during action → error toast appears

---

## 🎨 Styling & Design

### Color Scheme

| Element | Color |
|---------|-------|
| Status Badge (draft) | Gray |
| Status Badge (pending) | Amber |
| Status Badge (published) | Emerald |
| Status Badge (rejected) | Red |
| Author Text | `muted-foreground` |
| Primary Button | `primary` / `primary-foreground` |
| Destructive Button | `destructive` / `destructive-foreground` |
| Outline Button | `border` / `hover:bg-muted` |

### Responsive Behavior

- Modal is scrollable on small screens (`max-h-[90vh] overflow-y-auto`)
- Grid layout for salary/duration (2 columns on desktop, 1 on mobile)
- Buttons stack vertically on very small screens

---

## 📚 Related Documentation

- **[Admin Activity Logging](./activity-logging.md)** — Admin action tracking
- **[Database Architecture](../../architecture/database.md)** — Job table schema
- **[Job Board Implementation](../job-board/overview.md)** — Job board feature
- **[RLS Policies](../../guides/rls-policies.md)** — Row-level security

---

**Last Updated:** April 10, 2026  
**Status:** ✅ Complete and Tested
