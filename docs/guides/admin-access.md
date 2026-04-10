# Admin Access Guide

## How to Access Admin Pages

### Current Protection

The admin routes are **already protected** by the `requireAdmin()` function:

```
/admin/jobs
/admin/learning/new
```

### How Protection Works

1. **Authentication Check**: Verifies user is logged in
2. **Role Check**: Queries `user_profiles` table for role
3. **Redirect**: If not admin, redirects to `/dashboard`
4. **Access Granted**: If admin, renders the page

## Setting Up Admin Access

### Step 1: Ensure User is Registered and Logged In

1. Register at `/register` or login at `/login`
2. Verify your email (if email confirmation is enabled)

### Step 2: Update User Role to Admin in Database

Connect to your Supabase database and run:

```sql
-- Update user role to admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'your-user-uuid-here';
```

**Find your user ID:**
```sql
-- Get your user ID from auth.users
SELECT id, email FROM auth.users;

-- Or get from user_profiles
SELECT id, role, email FROM user_profiles;
```

### Step 3: Access Admin Panel

Once your role is set to `admin`:

1. Navigate to `/admin/jobs`
2. The `requireAdmin()` function will:
   - Verify you're authenticated
   - Check your role is `'admin'`
   - Allow access to the admin panel

### Step 4: Verify Access

You should see:
- Admin sidebar with navigation
- Job management interface
- "Administrator" badge in the sidebar

## Admin Features

### /admin/jobs
- View all jobs (approved and pending)
- Approve/reject job submissions
- Manage job listings
- Delete jobs

### /admin/learning/new
- Create new learning modules
- Manage educational content

## How the Code Works

### Admin Layout Protection

**File:** `src/app/admin/layout.tsx`

```tsx
async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin(); // ← Throws if not admin
  
  // Only admins reach this point
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
```

### requireAdmin() Function

**File:** `src/lib/admin/require-admin.ts`

```tsx
export async function requireAdmin(): Promise<AdminUser> {
  const user = await requireAuth(); // Check authentication

  const supabase = getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Redirect if not admin
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    full_name: profile.full_name,
  };
}
```

## Troubleshooting

### "I'm being redirected to /dashboard"

**Cause:** Your role is not set to `admin`

**Solution:**
```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';
```

### "I'm being redirected to /login"

**Cause:** You're not authenticated

**Solution:** Log in at `/login`

### "I don't see the admin menu in dashboard"

The admin menu only appears when you navigate to `/admin/*` directly. To add admin link to dashboard:

```tsx
// In dashboard navigation
import { getUserRole } from "@/lib/supabase/server";

const role = await getUserRole();

{role === "admin" && (
  <Link href="/admin/jobs">Admin Panel</Link>
)}
```

## Adding Admin Link to Dashboard

### Option 1: Add to Dashboard Header

Edit `src/app/(main)/dashboard/layout.tsx`:

```tsx
import { getUserRole } from "@/lib/supabase/server";

// Inside DashboardShell, after getting user:
const role = await getUserRole();

// In the navigation:
<nav className="hidden md:flex items-center gap-4">
  <Link href="/dashboard">Overview</Link>
  
  {role === "admin" && (
    <Link href="/admin/jobs" className="text-red-600">
      Admin
    </Link>
  )}
  
  {/* ... other links ... */}
</nav>
```

### Option 2: Create Dashboard Admin Card

Create `src/components/admin-dashboard-link.tsx`:

```tsx
import Link from "next/link";
import { getUserRole } from "@/lib/supabase/server";
import { Shield } from "lucide-react";

export async function AdminDashboardLink() {
  const role = await getUserRole();
  
  if (role !== "admin") {
    return null;
  }
  
  return (
    <Link
      href="/admin/jobs"
      className="flex items-center gap-3 p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900"
    >
      <Shield className="size-5 text-red-600" />
      <div>
        <p className="font-semibold">Admin Panel</p>
        <p className="text-sm text-muted-foreground">Manage jobs and content</p>
      </div>
    </Link>
  );
}
```

Then add it to your dashboard page:

```tsx
import { AdminDashboardLink } from "@/components/admin-dashboard-link";

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <AdminDashboardLink />
      {/* ... rest of dashboard ... */}
    </div>
  );
}
```

## Security Notes

✅ **What's Protected:**
- All `/admin/*` routes require admin role
- Server-side validation (not bypassable)
- Automatic redirects for unauthorized users

⚠️ **What You Should Add:**
- Row Level Security (RLS) policies in Supabase
- Admin action logging
- Rate limiting for admin endpoints
- Audit trails for admin actions

## Database Schema Reference

```sql
-- user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'user' 
    CHECK (role IN ('admin', 'user', 'client')),
  full_name TEXT,
  avatar_url TEXT,
  -- ... other fields
);

-- Example: Grant admin role
UPDATE user_profiles SET role = 'admin' WHERE id = 'uuid';

-- Check all admins
SELECT id, email, role, full_name 
FROM user_profiles 
WHERE role = 'admin';
```

## Quick Reference

| Route | Access Level | Protection |
|-------|-------------|------------|
| `/admin/jobs` | Admin only | `requireAdmin()` |
| `/admin/learning/new` | Admin only | `requireAdmin()` |
| `/dashboard/*` | Authenticated users | `requireAuth()` |
| `/jobs` | Public | None |
| `/learning` | Authenticated | Middleware |

## Testing Admin Access

1. **Check current role:**
```sql
SELECT role FROM user_profiles WHERE id = 'your-uuid';
```

2. **Set admin role:**
```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';
```

3. **Visit `/admin/jobs`** - should load successfully

4. **Verify in UI:** 
   - See admin sidebar
   - See "Administrator" badge
   - Access job management features

## Revoking Admin Access

```sql
UPDATE user_profiles SET role = 'user' WHERE id = 'uuid';
```

User will be redirected to `/dashboard` on next admin page visit.
