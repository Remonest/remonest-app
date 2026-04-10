# Design Guidelines

This document outlines the design system, patterns, and conventions for the Remonest App.

---

## 🎨 Design System Overview

Remonest uses a modern, accessible design system built on:

- **shadcn/ui** (radix-nova style) - UI component primitives
- **Tailwind CSS v4** - Utility-first CSS framework
- **oklch color space** - Perceptually uniform color model
- **Inter font** - Screen-optimized typography
- **Dark mode support** - Class-based theme switching

---

## 🎨 Color System

### Color Tokens

All colors use **oklch** (perceptually uniform color space) defined as CSS customizers in `globals.css`.

### Core Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `oklch(1 0 0)` White | `oklch(0.145 0 0)` Near-black | Page background |
| `--foreground` | `oklch(0.145 0 0)` Near-black | `oklch(0.985 0 0)` White | Text color |
| `--primary` | `oklch(0.546 0.245 262.881)` Blue #2563eb | Same | Primary actions, links |
| `--primary-foreground` | White | White | Text on primary |
| `--muted` | `oklch(0.97 0 0)` Light gray | `oklch(0.269 0 0)` Dark gray | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` Medium gray | `oklch(0.708 0 0)` Light gray | Subtle text |
| `--border` | `oklch(0.922 0 0)` Light border | `oklch(1 0 0 / 10%)` Semi-transparent | Borders, dividers |
| `--card` | White | `oklch(0.205 0 0)` Dark gray | Card backgrounds |
| `--accent` | `oklch(0.962 0.018 237.314)` Blue tint | `oklch(0.278 0.137 260.031)` Purple tint | Highlights, hover states |
| `--destructive` | `oklch(0.577 0.245 27.325)` Red | `oklch(0.704 0.191 22.216)` Lighter red | Errors, delete actions |

### Role Colors (Badges)

| Role | Light Mode Classes | Dark Mode Classes |
|------|-------------------|-------------------|
| **Admin** | `bg-red-100 text-red-800` | `bg-red-900 text-red-200` |
| **User** | `bg-blue-100 text-blue-800` | `bg-blue-900 text-blue-200` |
| **Client** | `bg-green-100 text-green-800` | `bg-green-900 text-green-200` |

### Semantic Colors

Use Tailwind's semantic color tokens:

- `bg-background` / `text-foreground` - Main content
- `bg-muted` - Subtle backgrounds
- `text-muted-foreground` - Secondary text
- `bg-primary` / `text-primary` - Primary actions
- `bg-destructive` / `text-destructive` - Errors, warnings
- `bg-accent` / `text-accent` - Highlights

---

## 🎯 Typography

### Font Families

```css
--font-sans: Inter (body text, headings)
--font-mono: Geist Mono (code, technical content)
```

### Type Scale

Use Tailwind's type scale (relative to base):

| Size | Class | Use Case |
|------|-------|----------|
| 12px | `text-xs` | Labels, captions, badges |
| 13px | `text-sm` | Small text, form hints |
| 14px | `text-base` | Body text (default) |
| 16px | `text-lg` | Section titles |
| 18px | `text-xl` | Page titles |
| 20px | `text-2xl` | Hero subtitles |
| 24px | `text-3xl` | Section headings |
| 30px | `text-4xl` | Hero headings (mobile) |
| 36px | `text-5xl` | Hero headings (tablet) |
| 56px | `text-[56px]` | Hero heading (desktop) |

### Font Weights

- `font-normal` (400) - Body text
- `font-medium` (500) - Emphasis, buttons
- `font-semibold` (600) - Headings, navigation
- `font-bold` (700) - Hero headings

### Typography Best Practices

```tsx
// ✅ Good: Consistent heading hierarchy
<h1 className="text-4xl md:text-5xl font-semibold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-semibold">Subsection</h3>

// ✅ Good: Muted text for descriptions
<p className="text-muted-foreground">Secondary description</p>

// ✅ Good: Leading and tracking for readability
<h1 className="leading-tight tracking-[-0.04em]">Hero Title</h1>
<p className="leading-relaxed">Body text with comfortable reading</p>
```

---

## 🧩 Component Library

### UI Components (shadcn/ui)

Available components in `src/components/ui/`:

- `Button` - Primary interaction element
- `Badge` - Status indicators, labels
- `Card` - Content containers
- `Input` - Form inputs
- `Label` - Form labels
- `Textarea` - Multi-line inputs
- `Select` - Dropdown selectors
- `Radio Group` - Single choice selection
- `Switch` - Toggle controls
- `Tabs` - Tabbed navigation
- `Dialog` - Modal dialogs
- `Dropdown Menu` - Context menus
- `Avatar` - User images/initials
- `Separator` - Visual dividers
- `Skeleton` - Loading placeholders
- `Table` - Data tables
- `Pagination` - Page navigation

---

## 🔘 Button System

### Button Variants

Uses CVA (Class Variance Authority) with these variants:

| Variant | Class | Use Case |
|---------|-------|----------|
| `default` | Primary actions | Submit, Save, Create |
| `outline` | Secondary actions with visible border | Cancel, Back, Filters |
| `secondary` | Less prominent actions | View More, Learn More |
| `ghost` | Minimal actions, hover only | Navigation links |
| `destructive` | Dangerous actions | Delete, Remove, Revoke |
| `link` | Text-only with underline | Learn more, Read more |

### Button Sizes

| Size | Height | Use Case |
|------|--------|----------|
| `xs` | 24px | Tiny actions, inline badges |
| `sm` | 28px | Compact tables, cards |
| `default` | 32px | Standard buttons |
| `lg` | 36px | Prominent CTAs |
| `icon` | 32px | Icon-only buttons |

### Button Usage Examples

```tsx
import { Button } from "@/components/ui/button"

// Primary action (default)
<Button>Submit</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Small button
<Button size="sm">Save</Button>

// Icon button
<Button size="icon" variant="ghost">
  <Trash2 className="size-4" />
</Button>

// With icon (Lucide icons)
<Button>
  <Plus className="size-4" />
  Add Item
</Button>
```

### Button Best Practices

```tsx
// ✅ Good: Use appropriate variant for context
<Button>Submit Application</Button>  // Primary
<Button variant="outline">Save Draft</Button>  // Secondary
<Button variant="destructive">Delete</Button>  // Destructive

// ✅ Good: Use size for hierarchy
<Button size="lg">Get Started</Button>  // Hero CTA
<Button>Apply Now</Button>  // Card action
<Button size="sm">Edit</Button>  // Table action

// ❌ Bad: Don't use inline styles
<Button style={{ backgroundColor: '#2563eb' }}>Submit</Button>

// ❌ Bad: Don't mix button variants
<Button className="bg-green-500 text-white">Submit</Button>
```

---

## 🏷️ Badge System

### Badge Variants

| Variant | Use Case |
|---------|----------|
| `default` | Primary status, active state |
| `secondary` | Neutral information |
| `destructive` | Error, warning, expired |
| `outline` | Status with border emphasis |
| `ghost` | Minimal status indicator |

### Badge Usage

```tsx
import { Badge } from "@/components/ui/badge"

// Status badges
<Badge>Published</Badge>
<Badge variant="destructive">Expired</Badge>
<Badge variant="outline">Pending</Badge>

// With icons
<Badge>
  <CheckCircle className="size-3" />
  Verified
</Badge>

// Custom colors (use Tailwind classes)
<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
  Active
</Badge>
```

---

## 📦 Card System

### Card Anatomy

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content
  </CardContent>
  <CardFooter>
    Actions
  </CardFooter>
</Card>
```

### Card Usage Examples

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

// Simple card
<Card>
  <CardHeader>
    <CardTitle>Job Title</CardTitle>
    <CardDescription>Company Name • Remote</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Job description...</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Save</Button>
    <Button>Apply Now</Button>
  </CardFooter>
</Card>

// Minimal card (no header/footer)
<Card>
  <CardContent className="p-6">
    Simple content block
  </CardContent>
</Card>
```

---

## 📐 Spacing & Layout

### Spacing Scale

Use Tailwind's spacing scale (in rem):

| Class | Pixels | Use Case |
|-------|--------|----------|
| `gap-1` | 4px | Tight spacing (icons + text) |
| `gap-2` | 8px | Form elements |
| `gap-3` | 12px | Card internal spacing |
| `gap-4` | 16px | Component spacing |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Layout spacing |
| `gap-12` | 48px | Page section spacing |

### Layout Patterns

#### Card Grid Layout

```tsx
// Responsive grid (1 col mobile → 3 cols desktop)
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id}>
      <CardContent className="p-6">
        {item.title}
      </CardContent>
    </Card>
  ))}
</div>
```

#### Stack Layout

```tsx
// Vertical stack with spacing
<div className="flex flex-col gap-4">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

#### Hero Layout

```tsx
// Two-column hero layout (stacks on mobile)
<section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
  <div>
    <h1>Hero Title</h1>
    <p>Description</p>
    <Button>CTA</Button>
  </div>
  <div>
    {/* Image/Carousel */}
  </div>
</section>
```

---

## 🎭 Component Patterns

### Form Pattern

```tsx
<form className="flex flex-col gap-4">
  <div className="space-y-2">
    <Label htmlFor="title">Title</Label>
    <Input id="title" placeholder="Enter title" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea id="description" placeholder="Enter description" />
  </div>
  
  <div className="flex gap-2">
    <Button type="submit">Submit</Button>
    <Button type="button" variant="outline">Cancel</Button>
  </div>
</form>
```

### Status Badge Pattern

```tsx
import { Badge } from "@/components/ui/badge"

// Job status badge
function JobStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }
  
  return (
    <Badge className={variants[status]}>
      {status}
    </Badge>
  )
}
```

### Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
    <Briefcase className="size-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No Jobs Yet</h3>
  <p className="text-muted-foreground mb-4">
    There are no jobs available yet. Check back later!
  </p>
  <Button>Post a Job</Button>
</div>
```

### Loading State Pattern

```tsx
import { Skeleton } from "@/components/ui/skeleton"

function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  )
}
```

---

## 🌓 Dark Mode

### Theme System

- **Class-based**: Toggle via `document.documentElement.classList`
- **Persistence**: `localStorage.setItem("remonest-theme", "dark")`
- **Selector**: `.dark` CSS class on `<html>` or `<body>`

### Dark Mode Toggle

```tsx
"use client"

import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setIsDark(isDark)
  }, [])
  
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("remonest-theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("remonest-theme", "dark")
      setIsDark(true)
    }
  }
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  )
}
```

### Dark Mode Best Practices

```tsx
// ✅ Good: Use semantic color tokens
<Card className="bg-card text-card-foreground">
  <p className="text-muted-foreground">Description</p>
</Card>

// ✅ Good: Use dark mode variants
<div className="bg-white dark:bg-gray-900">Content</div>

// ❌ Bad: Don't hardcode colors
<div style={{ backgroundColor: '#ffffff' }}>Content</div>

// ❌ Bad: Don't assume light mode only
<div className="bg-white text-black">Content</div>
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Class Prefix | Device |
|-----------|--------------|--------|
| 0px | (none) | Mobile first |
| 640px | `sm:` | Small tablets |
| 768px | `md:` | Tablets, landscape |
| 1024px | `lg:` | Laptops, desktops |
| 1280px | `xl:` | Large desktops |

### Responsive Patterns

#### Responsive Grid

```tsx
// 1 column → 2 columns → 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.title}</Card>)}
</div>
```

#### Responsive Text

```tsx
// Smaller on mobile, larger on desktop
<h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
  Page Title
</h1>
```

#### Responsive Spacing

```tsx
// Less padding on mobile
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>
```

#### Responsive Visibility

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop Only</div>

// Show on mobile, hide on desktop
<div className="md:hidden">Mobile Only</div>
```

---

## 🎨 Icon System

### Icon Library

All icons from **lucide-react** (v1.7.0):

```tsx
import { 
  Home, 
  Settings, 
  User, 
  Briefcase, 
  BookOpen,
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react"
```

### Icon Usage

```tsx
// Icon-only button
<Button size="icon" variant="ghost">
  <Settings className="size-4" />
</Button>

// Icon with text
<Button>
  <Plus className="size-4" />
  Add Job
</Button>

// Icon in badge
<Badge>
  <CheckCircle className="size-3" />
  Verified
</Badge>
```

### Icon Sizes

Use Tailwind size classes:

- `size-3` (12px) - Badges, small indicators
- `size-4` (16px) - Default, inline icons
- `size-5` (20px) - Medium icons
- `size-6` (24px) - Large icons, empty states

---

## 🏗️ Layout Architecture

### Page Structure

```tsx
// Main page layout
<main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
  <div className="flex flex-col gap-8">
    <header>
      <h1 className="text-3xl font-semibold">Page Title</h1>
      <p className="text-muted-foreground">Page description</p>
    </header>
    
    <section>
      {/* Main content */}
    </section>
  </div>
</main>
```

### Container Widths

- `max-w-[1200px]` - Main content container
- `max-w-3xl` (768px) - Forms, narrow content
- `max-w-4xl` (896px) - Medium content
- `max-w-5xl` (1024px) - Wide content

---

## ✨ Animation & Transitions

### Available Animations

- **Shake**: Error states (`animate-shake`)
- **Transitions**: Use Tailwind `transition-all duration-*`
- **Framer Motion**: For complex animations (installed)

### Transition Best Practices

```tsx
// ✅ Good: Smooth hover transitions
<Button className="transition-colors hover:bg-primary/80">
  Hover Me
</Button>

// ✅ Good: Transform on hover
<Card className="transition-transform hover:scale-105">
  Hover Card
</Card>

// ❌ Bad: Avoid jarring transitions
<div className="transition-all duration-1000">Too Slow</div>
```

---

## 🎯 Accessibility

### Focus States

All interactive elements have focus-visible rings:

```css
focus-visible:ring-3 focus-visible:ring-ring/50
```

### ARIA Attributes

```tsx
// Use semantic HTML
<button aria-label="Delete item">
  <Trash2 className="size-4" />
</button>

// Use aria-describedby for complex elements
<Input 
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use `Tab` order for logical flow
- Use `Enter` and `Space` for button activation

---

## 📝 Design Best Practices

### ✅ Do

```tsx
// Use semantic color tokens
<Card className="bg-card text-card-foreground">

// Use consistent spacing
<div className="flex flex-col gap-4">

// Use CVA variants
<Button variant="outline" size="sm">

// Use responsive design
<div className="grid grid-cols-1 md:grid-cols-3">

// Use dark mode support
<div className="bg-white dark:bg-gray-900">
```

### ❌ Don't

```tsx
// Don't hardcode colors
<div style={{ backgroundColor: '#ffffff' }}>

// Don't use inline styles
<Button style={{ margin: '8px' }}>

// Don't ignore dark mode
<div className="bg-black text-white">  // Will break in dark mode

// Don't use arbitrary values
<div className="w-[350px]">  // Use predefined sizes

// Don't mix spacing scales
<div className="p-4 md:p-5 lg:p-7">  // Inconsistent
```

---

## 🔍 Design Review Checklist

Before submitting UI changes:

- [ ] Uses semantic color tokens (not hardcoded)
- [ ] Supports dark mode
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible focus states
- [ ] Consistent spacing (Tailwind scale)
- [ ] Appropriate button variants
- [ ] Proper heading hierarchy
- [ ] Loading skeleton states
- [ ] Empty state designs
- [ ] Error state handling

---

## 📚 Resources

- **[shadcn/ui Documentation](https://ui.shadcn.com)**
- **[Tailwind CSS v4](https://tailwindcss.com/docs)**
- **[Lucide Icons](https://lucide.dev/icons)**
- **[oklch Color Picker](https://oklch.com/)**
- **[Inter Font](https://rsms.me/inter/)**

---

**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
