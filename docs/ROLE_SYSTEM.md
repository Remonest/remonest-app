# User Role System

## Overview

The user role system provides role-based access control (RBAC) with three roles:
- **Admin** - Full administrative access
- **User** - Standard user access
- **Client** - Client-specific access

## Files

### Core Role System
- `src/lib/roles.ts` - Role utilities (labels, colors, info getter)
- `src/lib/supabase/server.ts` - Contains `getUserRole()` and `requireAdmin()`
- `src/components/role-badge.tsx` - Reusable server component for displaying roles

### Guard Functions
- `src/lib/admin/require-admin.ts` - Admin access guard
- `src/lib/auth/server.ts` - Authentication guard

## Usage

### 1. Display User Role Badge

#### In Server Components (Dashboard Header)
```tsx
import { getUserRoleInfo } from "@/lib/roles";

async function MyComponent() {
  const roleInfo = await getUserRoleInfo();
  
  return (
    <div>
      {roleInfo && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleInfo.color}`}>
          {roleInfo.label}
        </span>
      )}
    </div>
  );
}
```

#### Using the RoleBadge Component
```tsx
import { RoleBadge } from "@/components/role-badge";

async function MyComponent() {
  return (
    <div>
      <RoleBadge />
      <RoleBadge className="ml-2" />
    </div>
  );
}
```

### 2. Protect Routes (Server Components)

#### Require Authentication
```tsx
import { requireAuth } from "@/lib/auth/server";

async function ProtectedPage() {
  const userId = await requireAuth(); // Throws if not authenticated
  
  return <div>Protected content for user: {userId}</div>;
}
```

#### Require Admin Access
```tsx
import { requireAdmin } from "@/lib/admin/require-admin";

async function AdminPage() {
  const admin = await requireAdmin(); // Throws if not admin
  
  return <div>Admin panel - Welcome {admin.email}</div>;
}
```

### 3. Protect Server Actions

#### With Role Check
```tsx
"use server";

import { getUserRole } from "@/lib/supabase/server";

export async function adminOnlyAction() {
  const role = await getUserRole();
  
  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  
  // Admin-only logic here
}
```

#### Using Guard Functions
```tsx
"use server";

import { requireAuth } from "@/lib/auth/server";

export async function authenticatedAction() {
  const userId = await requireAuth(); // Auto-throws if not authenticated
  
  // Authenticated logic here
  return { success: true, userId };
}
```

### 4. Conditional Rendering Based on Role

```tsx
import { getUserRole } from "@/lib/supabase/server";

async function DashboardPage() {
  const role = await getUserRole();
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {role === "admin" && (
        <div className="admin-panel">
          <h2>Admin Controls</h2>
          {/* Admin-specific features */}
        </div>
      )}
      
      {(role === "admin" || role === "user") && (
        <div className="user-content">
          <h2>User Features</h2>
        </div>
      )}
      
      {role === "client" && (
        <div className="client-view">
          <h2>Client Portal</h2>
        </div>
      )}
    </div>
  );
}
```

### 5. Client Components (Pass Role from Server)

Since `getUserRole()` is a server function, you need to pass the role to client components:

```tsx
// Server Component
import { getUserRole } from "@/lib/supabase/server";
import { ClientComponent } from "./client-component";

async function ServerComponent() {
  const role = await getUserRole();
  
  return <ClientComponent userRole={role} />;
}
```

```tsx
// Client Component
"use client";

type UserRole = "admin" | "user" | "client" | null;

interface ClientComponentProps {
  userRole: UserRole;
}

export function ClientComponent({ userRole }: ClientComponentProps) {
  return (
    <div>
      {userRole === "admin" && <AdminPanel />}
      {userRole === "user" && <UserDashboard />}
      {userRole === "client" && <ClientView />}
    </div>
  );
}
```

## Role Colors

Roles are styled with distinct colors:

- **Admin**: Red (`bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`)
- **User**: Blue (`bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`)
- **Client**: Green (`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`)

## Customization

### Add New Role
1. Update the type in `src/lib/supabase/server.ts`:
```typescript
export async function getUserRole(): Promise<"admin" | "user" | "client" | "new_role" | null>
```

2. Update `src/lib/roles.ts`:
```typescript
export const roleLabels: Record<NonNullable<UserRole>, string> = {
  admin: "Admin",
  user: "User",
  client: "Client",
  new_role: "New Role",
};

export const roleColors: Record<NonNullable<UserRole>, string> = {
  // ... add color for new_role
};
```

### Change Role Colors
Edit `src/lib/roles.ts` and modify the `roleColors` object with your preferred Tailwind classes.

## Database Schema

The role is stored in the `user_profiles` table:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'client')),
  -- ... other fields
);
```

## Examples

### Show Admin-Only Content
```tsx
import { getUserRole } from "@/lib/supabase/server";

async function AdminPanel() {
  const role = await getUserRole();
  
  if (role !== "admin") {
    return <p>Access denied</p>;
  }
  
  return (
    <div>
      <h2>Admin Panel</h2>
      {/* Admin controls */}
    </div>
  );
}
```

### Role-Based Navigation
```tsx
import { getUserRole } from "@/lib/supabase/server";
import Link from "next/link";

async function Navigation() {
  const role = await getUserRole();
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {role === "admin" && (
        <Link href="/admin">Admin Panel</Link>
      )}
      
      {role === "user" && (
        <Link href="/learning">Learning</Link>
      )}
    </nav>
  );
}
```

## Security Notes

1. **Always validate on the server**: Client-side checks are for UX only
2. **Use guard functions**: `requireAuth()` and `requireAdmin()` in server actions
3. **Never trust client data**: Always fetch role from database server-side
4. **Row Level Security**: Implement RLS policies in Supabase for data protection

## Testing

To test different roles:

1. Update the user's role in the database:
```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'user-uuid';
```

2. Refresh the page to see the role badge update

3. Verify that protected routes/actions enforce the role correctly
