# Custom SVG Social Media Icons

Guide to the custom SVG social media icons used in the Remonest footer.

---

## Overview

The Remonest footer uses **custom SVG icons** for social media links instead of relying on lucide-react icons. This is because lucide-react v1.7.0 does not include Twitter, LinkedIn, or Instagram icons.

**File:** `src/components/landing/footer.tsx`

---

## Icons Used

| Platform | Icon Name | SVG Source | Usage |
|----------|-----------|------------|-------|
| Twitter/X | `TwitterIcon` | Custom SVG | Footer social link |
| LinkedIn | `LinkedinIcon` | Custom SVG | Footer social link |
| Instagram | `InstagramIcon` | Custom SVG | Footer social link |

---

## Implementation

### Twitter/X Icon

```tsx
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
```

**Features:**
- Uses Twitter bird icon path
- Inherits color from parent via `currentColor`
- Supports custom `className` for styling

---

### LinkedIn Icon

```tsx
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
```

**Features:**
- Standard LinkedIn "in" logo design
- 3 elements: profile box, body, head circle
- Fully scalable with viewBox

---

### Instagram Icon

```tsx
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
```

**Features:**
- Classic Instagram camera outline
- 3 elements: rounded rectangle, lens circle, flash dot
- Consistent stroke width

---

## Usage in Footer

```tsx
<div className="flex gap-3">
  <a
    href="#"
    aria-label="Twitter"
    className="w-9 h-9 border border-border rounded-md flex items-center justify-center bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
  >
    <TwitterIcon className="size-4" />
  </a>
  <a
    href="#"
    aria-label="LinkedIn"
    className="w-9 h-9 border border-border rounded-md flex items-center justify-center bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
  >
    <LinkedinIcon className="size-4" />
  </a>
  <a
    href="#"
    aria-label="Instagram"
    className="w-9 h-9 border border-border rounded-md flex items-center justify-center bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
  >
    <InstagramIcon className="size-4" />
  </a>
</div>
```

**Styling:**
- Icon container: `w-9 h-9` (36x36px)
- Border: `border border-border rounded-md`
- Hover state: `hover:border-primary hover:text-primary`
- Icon size: `size-4` (16x16px)

---

## Why Custom SVG Instead of Lucide?

### The Problem

Lucide-react v1.7.0 does not include these social media icons:
- ❌ Twitter/X
- ❌ LinkedIn
- ❌ Instagram

Using wrong icons looks unprofessional:
- `X` icon → looks like a close button
- `Link` icon → generic, not recognizable
- `Camera` icon → wrong brand association

### The Solution

Custom SVG icons provide:
- ✅ Correct brand recognition
- ✅ Consistent style with lucide icons
- ✅ Same API (className, stroke, fill)
- ✅ No external dependencies
- ✅ Easy to maintain

---

## Adding More Social Icons

If you need to add more social media icons, follow this pattern:

```tsx
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* GitHub Octocat path */}
      <path d="M15 22v-5.393a3 3 0 0 0-3-3c-1.657 0-3 1.343-3 3V22" />
      <path d="M9 19H6a4 4 0 0 1-4-4V8a8 8 0 0 1 16 0v7a4 4 0 0 1-4 4h-3" />
    </svg>
  );
}
```

**Usage:**
```tsx
<a href="https://github.com" aria-label="GitHub">
  <GitHubIcon className="size-4" />
</a>
```

---

## SVG Best Practices

### ✅ Do

```tsx
// Use currentColor for stroke/fill
<svg stroke="currentColor" fill="currentColor">

// Include viewBox for scalability
<svg viewBox="0 0 24 24">

// Use className for styling
function Icon({ className }: { className?: string }) {
  return <svg className={className}>...</svg>
}

// Use semantic linecaps/joins
<svg strokeLinecap="round" strokeLinejoin="round">
```

### ❌ Don't

```tsx
// Don't hardcode colors
<svg fill="#000000"> // ❌

// Don't use fixed dimensions
<svg width="24" height="24"> // ❌ Use viewBox instead

// Don't omit accessibility attributes
<svg>...</svg> // ❌ Always use aria-label on parent

// Don't use inconsistent stroke widths
<svg strokeWidth="1.5"> // ❌ Should be 2 for consistency
```

---

## Icon Sources

All SVG paths are based on standard icon designs:

- **Twitter**: Official Twitter bird logo (simplified outline)
- **LinkedIn**: Standard LinkedIn "in" logo
- **Instagram**: Classic Instagram camera outline

**License**: These are standard icon designs commonly available and used for brand representation.

---

## Related Files

| File | Purpose |
|------|---------|
| `src/components/landing/footer.tsx` | Footer component with social icons |
| `src/lib/translations.tsx` | Translation keys for aria-labels |
| `docs/guides/design-guidelines.md` | General design guidelines |

---

**Last Updated:** April 10, 2026  
**Status:** ✅ Implemented with Custom SVG Icons
