# How to Add a New Feature

This guide walks through adding a new feature to the Remonest App.

---

## 1. Plan the Feature

Before writing code, define:

- **Routes**: What URLs will this feature use?
- **Components**: What UI components are needed?
- **Server Actions**: What data queries/mutations are required?
- **Translations**: Identify all user-facing text for EN/ID support
- **Server vs Client split**: Which parts need interactivity?

---

## 2. Create Feature Module

Create a new directory under `src/features/<name>/`:

```
features/<name>/
├── types/
│   └── index.ts          # Feature-specific types
├── schemas/
│   └── validation.ts     # Zod validation schemas
├── actions/
│   ├── queries.ts        # Data fetching functions
│   └── mutations.ts      # Data modification actions
├── components/
│   ├── FeatureCard.tsx   # Feature components
│   └── FeatureList.tsx
├── utils/
│   └── formatters.ts     # Helper functions
└── hooks/
    └── useFeature.ts     # Custom hooks (if needed)
```

---

## 3. Define Types & Schemas

### Types (`types/index.ts`)

```typescript
export interface Feature {
  id: string
  title: string
  description: string
  createdAt: Date
  // ... other fields
}

export type FeatureStatus = 'draft' | 'published' | 'archived'
```

### Zod Schemas (`schemas/validation.ts`)

```typescript
import { z } from "zod"

export const featureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  // ... other fields
})

export type FeatureInput = z.infer<typeof featureSchema>
```

---

## 4. Create Server Actions

### Queries (`actions/queries.ts`)

```typescript
"use server"

import { requireAuth } from "@/features/auth/actions/guards"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Feature } from "@/features/<name>/types"
import { React } from "react"

// Cache within request
const getFeaturesQuery = React.cache(async () => {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase
    .from('features')
    .select('*')
    .eq('status', 'published')
  
  return (data || []) as Feature[]
})

export async function getFeatures(): Promise<Feature[]> {
  return getFeaturesQuery()
}

export async function getFeatureById(id: string): Promise<Feature | null> {
  await requireAuth()
  
  const supabase = getSupabaseServerClient()
  const { data } = await supabase
    .from('features')
    .select('*')
    .eq('id', id)
    .single()
  
  return data as Feature | null
}
```

### Mutations (`actions/mutations.ts`)

```typescript
"use server"

import { requireAuth } from "@/features/auth/actions/guards"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { featureSchema, FeatureInput } from "@/features/<name>/schemas/validation"
import { revalidatePath } from "next/cache"

export async function createFeature(input: FeatureInput) {
  // Authenticate user
  const user = await requireAuth()
  
  // Validate input
  const validated = featureSchema.parse(input)
  
  // Perform action
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('features')
    .insert({
      ...validated,
      posted_by_user_id: user.id
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // Revalidate cache
  revalidatePath('/features')
  
  return { success: true, data }
}
```

---

## 5. Create Components

### Server Component (data fetching)

```tsx
// src/app/(main)/features/page.tsx
import { getFeatures } from "@/features/<name>/actions/queries"
import { FeaturesClient } from "@/features/<name>/components/FeaturesClient"

export default async function FeaturesPage() {
  const features = await getFeatures()
  
  return <FeaturesClient features={features} />
}
```

### Client Component (interactive UI)

```tsx
// src/features/<name>/components/FeaturesClient.tsx
"use client"

import { useTranslations } from "@/lib/translations"
import { Feature } from "@/features/<name>/types"

interface FeaturesClientProps {
  features: Feature[]
}

export function FeaturesClient({ features }: FeaturesClientProps) {
  const { t } = useTranslations()
  
  return (
    <div>
      <h1>{t.features.title}</h1>
      
      {features.length === 0 ? (
        <p>{t.features.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.id} className="border rounded-lg p-4">
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 6. Create Route

Create a thin wrapper in `app/`:

```tsx
// src/app/(main)/features/page.tsx
import { getFeatures } from "@/features/<name>/actions/queries"
import { FeaturesClient } from "@/features/<name>/components/FeaturesClient"

export default async function FeaturesPage() {
  const features = await getFeatures()
  return <FeaturesClient features={features} />
}
```

---

## 7. Add Translations

Add to both `en` and `id` objects in `src/lib/translations.tsx`:

```typescript
export const en = {
  // ... existing translations
  features: {
    title: "Features",
    empty: "No features yet",
    create: "Create Feature",
    edit: "Edit Feature",
    delete: "Delete Feature",
  }
}

export const id = {
  // ... existing translations
  features: {
    title: "Fitur",
    empty: "Belum ada fitur",
    create: "Buat Fitur",
    edit: "Edit Fitur",
    delete: "Hapus Fitur",
  }
}
```

---

## 8. Update Documentation

Create documentation in `docs/features/<name>/`:

```markdown
# Feature Name

## Overview
Brief description of what this feature does and why.

## Architecture
- **Server actions**: `src/features/<name>/actions/`
- **Components**: `src/features/<name>/components/`
- **Types**: `src/features/<name>/types/`
- **Routes**: `src/app/(main)/<name>/`

## Implementation Details

### Database Schema
```sql
-- Table definition
```

### API Contract
```typescript
// Function signatures
```

### Key Components
- `ComponentName`: What it does
- `AnotherComponent`: What it does

## Testing

How to test manually:
1. Navigate to `/features`
2. Click "Create"
3. Fill form and submit
4. Verify success message
5. Check data in Supabase

## Known Issues
Current limitations or bugs.
```

Update main README.md with link to new documentation.

---

## 9. Test the Feature

### Manual Testing Checklist

- [ ] Can access the route
- [ ] Data loads correctly from Supabase
- [ ] Forms validate input
- [ ] Success/error messages display
- [ ] Role-based access works (if applicable)
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Translations work in both EN and ID

---

## 10. Common Patterns

### Protected Route (Authenticated Only)

```tsx
// Server Component
import { requireAuth } from "@/features/auth/actions/guards"

export default async function ProtectedPage() {
  const user = await requireAuth()
  
  // User is authenticated, proceed
  return <div>Protected content</div>
}
```

### Admin-Only Route

```tsx
// Layout or Page
import { requireAdmin } from "@/lib/admin/require-admin"

export default async function AdminPage() {
  const admin = await requireAdmin()
  
  // Admin is authenticated
  return <div>Admin panel</div>
}
```

### Form with Server Action

```tsx
"use client"

import { useActionState } from "react"
import { createFeature } from "@/features/<name>/actions/mutations"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function CreateForm() {
  const [state, action] = useActionState(createFeature, null)
  const router = useRouter()
  
  useEffect(() => {
    if (state?.success) {
      router.push("/features")
    }
  }, [state?.success])
  
  return (
    <form action={action}>
      {/* Form fields */}
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## Best Practices

1. **Keep app/ thin** — delegate to feature modules
2. **Co-locate related code** — types, schemas, actions, components together
3. **Use direct imports** — no barrel files
4. **Validate all mutations** — Zod schemas in `schemas/`
5. **Cache queries** — `React.cache()` for deduplication
6. **Server-first** — Server Components by default
7. **Role-aware UI** — pass role from server to client
8. **Translate everything** — use `useTranslations()` hook
9. **Test manually** — verify in both light/dark mode
10. **Document as you go** — update relevant docs
