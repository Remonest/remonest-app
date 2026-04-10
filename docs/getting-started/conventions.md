# Project Conventions

This document outlines the key development conventions for the Remonest App.

---

## Import Patterns

- Use `@/*` path alias for all imports
  ```typescript
  import { getJobs } from "@/features/jobs/actions/fetch-jobs"
  import { Button } from "@/components/ui/button"
  ```
- **No barrel files** — import directly from source files
  ```typescript
  // ✅ Good
  import { JobCard } from "@/features/jobs/components/JobCard"
  
  // ❌ Bad
  import { JobCard } from "@/features/jobs"
  ```

---

## Component Architecture

### Server vs Client Components

- **Default to Server Components** — only use `"use client"` when needed
- **Client components needed for:**
  - State (`useState`, `useReducer`)
  - Effects (`useEffect`)
  - Event handlers (`onClick`, `onChange`)
  - Browser APIs (`window`, `localStorage`)
  - Hooks (`useTranslations`, `useRouter`)

### Server/Client Split Pattern

```tsx
// Server Component (page.tsx)
import { getData } from "@/features/feature/actions/data"
import { FeatureClient } from "@/features/feature/components/FeatureClient"

export default async function FeaturePage() {
  const data = await getData()
  return <FeatureClient data={data} />
}

// Client Component (FeatureClient.tsx)
"use client"

export function FeatureClient({ data }: { data: any[] }) {
  const [state, setState] = useState(data)
  // Interactive UI
}
```

---

## Styling Conventions

- **Tailwind utility classes only** — no inline styles
- Use shadcn/ui components with CVA variants for buttons
- Dark mode via `document.documentElement.classList`
- Color tokens use oklch values (see PROJECT.md for palette)

---

## Icon Usage

- Always import from `lucide-react`
  ```typescript
  import { Shield, User, Settings } from "lucide-react"
  ```

---

## Form Handling

- Native HTML inputs with Tailwind styling
- No form library (yet)
- Zod validation for all mutations
- Server Actions with `useActionState` for form submissions

---

## Authentication & Authorization

### Route Protection

- **Admin routes**: Protected at layout level via `requireAdmin()`
- **Auth routes**: Protected via middleware, not in layout
- **Dashboard routes**: Protected via middleware

### Role-Based UI Pattern

```tsx
// Server Component - fetch role once
import { getUserRole } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const role = await getUserRole()
  return <DashboardClient role={role} />
}

// Client Component - receive role as prop
"use client"

export function DashboardClient({ role }: { role: string }) {
  return (
    <div>
      {role === "admin" && <AdminPanel />}
      {role === "client" && <ClientDashboard />}
    </div>
  )
}
```

**Never** call `getUserRole()` in client components — always pass as prop from server.

---

## Server Actions

### Authentication Guards

```typescript
"use server"

import { requireAuth } from "@/features/auth/actions/guards"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function securedAction() {
  await requireAuth() // Throws if not authenticated
  
  const supabase = getSupabaseServerClient()
  // Perform action...
}
```

### Redirects in Server Actions

- **Don't use** `redirect()` inside `useActionState` — it doesn't work
- **Use** `useEffect` + `router.push()` in client components instead

```tsx
// Client Component
"use client"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function MyForm() {
  const [state, action] = useActionState(myServerAction, null)
  const router = useRouter()
  
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state?.success])
  
  return <form action={action}>...</form>
}
```

---

## Database Conventions

### Migrations

- Sequential numbering: `001_`, `002_`, `003_`
- Descriptive names: `003_create_jobs_table.sql`
- Always include rollback comments at bottom
- Test locally before pushing

### Supabase Clients

```typescript
// Regular server client - respects RLS
import { getSupabaseServerClient } from "@/lib/supabase/server"
const supabase = getSupabaseServerClient()

// Service role client - bypasses RLS (admin operations only)
import { getSupabaseServiceClient } from "@/lib/supabase/server"
const supabase = getSupabaseServiceClient()
```

**Use service role carefully** — only for admin cross-user operations.

---

## Code Organization

### Feature Module Structure

```
features/<name>/
├── types/          # Shared type definitions
├── schemas/        # Zod validation schemas
├── actions/        # Server Actions (mutations + queries)
├── components/     # Feature-specific UI components
├── utils/          # Formatters, helpers, cached queries
└── hooks/          # Client-side hooks (if needed)
```

### Import Order

1. External libraries
2. Feature modules (`@/features/...`)
3. Shared components (`@/components/...`)
4. Utils/lib (`@/lib/...`)
5. Relative imports

---

## Testing

- Manual testing via UI
- Verify Supabase queries execute correctly
- Test role-based access with different user roles
- Check both light and dark mode

---

## Documentation

- Update relevant docs when adding features
- Follow existing patterns in `docs/` folder
- Include code examples for major concepts
- Add troubleshooting sections for known issues
