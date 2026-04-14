# Admin Learning Breadcrumb Standardization (v1.9.1)

> **Date:** April 14, 2026  
> **Purpose:** Standardize breadcrumbs, width, and navigation flow across all admin learning pages

---

## 📊 Problem Statement

Before this update, each admin learning page had:
- ❌ Different breadcrumb styles (4 different implementations)
- ❌ Inconsistent page widths (admin layout vs custom layouts)
- ❌ Various back button styles (text, icon-only, links)
- ❌ No unified navigation pattern

### **Before Standardization**

| Page | Breadcrumb Style | Width | Back Button |
|------|------------------|-------|-------------|
| `/admin/learning/[id]/edit` | "Kembali ke Learning" text button | Admin layout width | Text button |
| `/admin/learning/[id]/builder` | Custom inline breadcrumbs | **Full viewport** | N/A (header bar) |
| `/admin/learning/[id]/lessons` | "Back to Module" link | Admin layout width | Text link |
| `/admin/learning/[id]/materials` | Icon-only back button | `container mx-auto` ❌ | Icon button |
| `/admin/learning/[id]/quiz` | Icon-only back button | Admin layout width | Icon button |

---

## ✅ Solution: Unified Breadcrumb Component

### **Created Component: `LearningBreadcrumb`**

**File:** `src/components/admin/learning-breadcrumb.tsx`

**Features:**
- ✅ Consistent breadcrumb style across all pages
- ✅ Automatic breadcrumb generation based on module ID/title
- ✅ Supports active page highlighting
- ✅ Clickable links for parent pages
- ✅ Uses Tailwind utility classes for styling
- ✅ Accessible with `aria-label="Breadcrumb"`

**Component API:**
```tsx
<LearningBreadcrumb
  moduleId="module-uuid"
  moduleTitle="Remote Working Basics"
  currentPage="Flow Builder"
/>
```

**Renders:**
```
Learning > Remote Working Basics > Flow Builder
  (clickable)      (clickable)      (active/bold)
```

---

## 🔄 Navigation Flow

### **Standard Breadcrumb Pattern**

```
/admin/learning
  ↓
Learning > [Module Title] > [Current Page]
```

### **Example: Flow Builder Page**

```
Learning > Remote Working Basics > Flow Builder
  │              │                      │
  │              │                      └─ Active page (bold)
  │              └─ Clickable (goes to /edit)
  └─ Clickable (goes to /admin/learning)
```

---

## 📝 Updated Pages

### **1. Edit Metadata Page** (`/admin/learning/[id]/edit`)

**Before:**
```tsx
<Button variant="ghost" size="sm" asChild className="gap-1">
  <Link href="/admin/learning">
    <ArrowLeft className="size-4" />
    Kembali ke Learning
  </Link>
</Button>
```

**After:**
```tsx
<LearningBreadcrumb
  moduleId={id}
  moduleTitle={module.title}
  currentPage="Edit Metadata"
/>
```

**Changes:**
- ✅ Removed "Kembali ke Learning" button
- ✅ Added `LearningBreadcrumb` component
- ✅ Updated page title to "Edit Module Metadata"
- ✅ Updated description to be clearer

---

### **2. Flow Builder Page** (`/admin/learning/[id]/builder`)

**Before:**
```tsx
<div className="flex items-center gap-2 text-sm">
  <Link href="/admin/learning" className="...">Modules</Link>
  <ChevronRight className="..." />
  <Link href={`/admin/learning/${moduleId}/edit`} className="...">{moduleTitle}</Link>
  <ChevronRight className="..." />
  <span className="font-semibold text-foreground">Flow Builder</span>
  <Badge>{moduleStatus}</Badge>
</div>
```

**After:**
```tsx
<div className="flex items-center gap-4">
  <LearningBreadcrumb
    moduleId={moduleId}
    moduleTitle={moduleTitle}
    currentPage="Flow Builder"
  />
  <Badge>{moduleStatus}</Badge>
</div>
```

**Changes:**
- ✅ Replaced custom inline breadcrumbs with `LearningBreadcrumb`
- ✅ Kept status badge for quick reference
- ✅ Consistent styling with other pages

---

### **3. Lessons Page** (`/admin/learning/[id]/lessons`)

**Before:**
```tsx
<Link href={`/admin/learning/${moduleId}/edit`} className="...">
  <ChevronLeft className="h-4 w-4" />
  Back to Module
</Link>
<h1>Lessons — {moduleTitle}</h1>
```

**After:**

**Server Component (page.tsx):**
```tsx
<LearningBreadcrumb
  moduleId={id}
  moduleTitle={mod.title}
  currentPage="Lessons (Legacy)"
/>
```

**Client Component (lessons-client.tsx):**
```tsx
// Removed header with back button
// Now only shows content (breadcrumb is in parent)
<div>
  <h2 className="text-xl font-semibold">Lessons Management</h2>
  ...
</div>
```

**Changes:**
- ✅ Moved breadcrumb to server component
- ✅ Removed duplicate header from client component
- ✅ Labeled as "(Legacy)" to indicate Flow Builder replacement

---

### **4. Materials Page** (`/admin/learning/[id]/materials`)

**Before:**
```tsx
<div className="container mx-auto py-8 space-y-6">
  <div className="flex items-center justify-between">
    <Link href="/admin/learning">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </Link>
    <div>
      <h1 className="text-2xl font-bold">{module.title}</h1>
      <p className="text-muted-foreground">Kelola materi...</p>
    </div>
  </div>
  ...
</div>
```

**After:**

**Server Component (page.tsx):**
```tsx
<div className="space-y-6">
  <LearningBreadcrumb
    moduleId={id}
    moduleTitle={module.title}
    currentPage="Materials & Resources"
  />
  <MaterialListClient ... />
</div>
```

**Client Component (material-list-client.tsx):**
```tsx
// Removed header with back button
// Changed from "container mx-auto" to "space-y-6"
<div className="space-y-6">
  {/* Stats Cards */}
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    ...
  </div>
</div>
```

**Changes:**
- ✅ **Fixed width**: Changed from `container mx-auto` to `space-y-6` (matches admin layout)
- ✅ Removed icon-only back button
- ✅ Added `LearningBreadcrumb` to server component
- ✅ Removed duplicate header from client component

---

### **5. Quiz Builder Page** (`/admin/learning/[id]/quiz`)

**Before:**
```tsx
<div className="flex items-center gap-3">
  <Button variant="outline" size="icon" asChild>
    <Link href={`/admin/learning/${id}/edit`}>
      <ArrowLeft className="size-4" />
    </Link>
  </Button>
  <div>
    <h1>Buat Quiz Baru</h1>
    <p className="text-sm text-muted-foreground">Modul: {module.title}</p>
  </div>
</div>
```

**After:**
```tsx
<LearningBreadcrumb
  moduleId={id}
  moduleTitle={module.title}
  currentPage="Quiz Builder"
/>

<div className="space-y-1">
  <h1 className="text-2xl font-semibold tracking-tight">Quiz Builder</h1>
  <p className="text-sm text-muted-foreground">
    Create and manage quizzes for "{module.title}"
  </p>
</div>
```

**Changes:**
- ✅ Removed icon-only back button
- ✅ Added `LearningBreadcrumb` component
- ✅ Updated title to English for consistency
- ✅ Improved description clarity

---

## 🎨 Design Specifications

### **Breadcrumb Styling**

```tsx
// Base container
<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
  
  // Each item
  <div className="flex items-center gap-1.5">
    // Separator (not shown for first item)
    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
    
    // Link (if not active)
    <Link href="..." className="hover:text-foreground transition-colors">
      Page Name
    </Link>
    
    // Active page (bold, different color)
    <span className="font-semibold text-foreground">
      Current Page
    </span>
  </div>
</nav>
```

### **Spacing & Layout**

All pages now use consistent spacing:

```tsx
<div className="space-y-6">
  {/* Breadcrumb */}
  <LearningBreadcrumb ... />
  
  {/* Page Header */}
  <div className="space-y-1">
    <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  
  {/* Content */}
  ...
</div>
```

**Width:** All pages use admin layout width (no custom containers)

---

## 🧪 Testing Checklist

### Visual Testing
- [ ] All pages show consistent breadcrumb style
- [ ] Breadcrumb links are clickable and navigate correctly
- [ ] Active page is bold and different color
- [ ] Chevron separators display correctly
- [ ] No duplicate headers or back buttons
- [ ] All pages have same width (no `container mx-auto`)

### Navigation Testing
- [ ] Click "Learning" → Goes to `/admin/learning`
- [ ] Click module title → Goes to `/admin/learning/[id]/edit`
- [ ] Current page is not clickable (shows as text)
- [ ] Back button works in browser
- [ ] All pages render without errors

### Page-Specific Testing

#### Edit Metadata
- [ ] Breadcrumb shows: `Learning > [Title] > Edit Metadata`
- [ ] "Open Flow Builder" button visible
- [ ] Form loads with module data

#### Flow Builder
- [ ] Breadcrumb shows: `Learning > [Title] > Flow Builder`
- [ ] Status badge visible next to breadcrumb
- [ ] Three-panel layout works
- [ ] Preview/Save/Publish buttons visible

#### Lessons (Legacy)
- [ ] Breadcrumb shows: `Learning > [Title] > Lessons (Legacy)`
- [ ] No duplicate header
- [ ] Lesson list displays correctly

#### Materials & Resources
- [ ] Breadcrumb shows: `Learning > [Title] > Materials & Resources`
- [ ] Stats cards display correctly
- [ ] Width matches other pages (no `container mx-auto`)
- [ ] No duplicate header

#### Quiz Builder
- [ ] Breadcrumb shows: `Learning > [Title] > Quiz Builder`
- [ ] Title and description display correctly
- [ ] Quiz builder component loads

---

## 📚 Benefits

### **Before Standardization**
- ❌ 4 different breadcrumb implementations
- ❌ Inconsistent widths (admin vs custom layouts)
- ❌ Confusing navigation patterns
- ❌ Hard to maintain and update
- ❌ Mixed languages (Indonesian/English)

### **After Standardization**
- ✅ Single `LearningBreadcrumb` component
- ✅ Consistent width across all pages
- ✅ Clear, predictable navigation
- ✅ Easy to maintain (one file to update)
- ✅ Consistent English language
- ✅ Accessible (ARIA labels)
- ✅ Type-safe (TypeScript props)

---

## 🔧 Code Changes Summary

### **New Files Created**
1. `src/components/admin/learning-breadcrumb.tsx` - Reusable breadcrumb component

### **Files Modified**
1. `src/app/admin/learning/[id]/edit/page.tsx`
   - Added `LearningBreadcrumb`
   - Removed "Kembali ke Learning" button

2. `src/app/admin/learning/[id]/builder/builder-client.tsx`
   - Replaced custom inline breadcrumbs with `LearningBreadcrumb`
   - Kept status badge

3. `src/app/admin/learning/[id]/lessons/page.tsx`
   - Added `LearningBreadcrumb` wrapper

4. `src/app/admin/learning/[id]/lessons/lessons-client.tsx`
   - Removed duplicate header with back button

5. `src/app/admin/learning/[id]/materials/page.tsx`
   - Added `LearningBreadcrumb` wrapper

6. `src/app/admin/learning/[id]/materials/material-list-client.tsx`
   - Removed duplicate header with back button
   - Changed `container mx-auto` to `space-y-6`

7. `src/app/admin/learning/[id]/quiz/page.tsx`
   - Added `LearningBreadcrumb`
   - Removed icon-only back button
   - Updated title/description

---

## 🗺️ Navigation Map

```
/admin/learning
  │
  ├─ [Module Row] → Click pencil icon
  │   └─ /admin/learning/[id]/edit
  │       ├─ Breadcrumb: Learning > [Title] > Edit Metadata
  │       └─ Button: "Open Flow Builder"
  │           └─ /admin/learning/[id]/builder
  │               ├─ Breadcrumb: Learning > [Title] > Flow Builder
  │               └─ Status badge visible
  │
  ├─ [Module Row] → Click dropdown
  │   ├─ "Edit Metadata" → /admin/learning/[id]/edit
  │   ├─ "Flow Builder" → /admin/learning/[id]/builder
  │   ├─ "Kelola Materi" → /admin/learning/[id]/materials
  │   │   └─ Breadcrumb: Learning > [Title] > Materials & Resources
  │   └─ "Kelola Kuis" → /admin/learning/[id]/quiz
  │       └─ Breadcrumb: Learning > [Title] > Quiz Builder
  │
  └─ [Module Row] → Click lessons icon (legacy)
      └─ /admin/learning/[id]/lessons
          └─ Breadcrumb: Learning > [Title] > Lessons (Legacy)
```

---

## 📖 Related Documentation

- [Flow Builder Guide](./learning-module-flow-builder.md)
- [Admin Learning List Audit](./admin-learning-list-audit.md)
- [Learning Module Revamp](./learning-module-revamp.md)

---

**Last Updated:** April 14, 2026  
**Version:** v1.9.1  
**Status:** ✅ Implemented & Build Verified
