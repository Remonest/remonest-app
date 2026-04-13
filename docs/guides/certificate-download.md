# Certificate System

## Overview

Users who complete a learning module receive a digital certificate. It can be:
1. **Viewed** on the certificate detail page with zoom
2. **Downloaded** as a PNG image via `html2canvas`
3. **Printed** via the browser's native print dialog
4. **Verified publicly** at `/verify/[certificateId]` — no login required

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CertificateTemplate                       │
│              src/features/learning-module/components/        │
│                                                              │
│  - Fixed 900px width, aspect-ratio 297/210                  │
│  - Fixed pixel typography (no clamp(), no vw)               │
│  - Explicit hex colors (no CSS variables, no oklch)         │
│  - Single source of truth — used in 3 places                │
└──────────────────────┬──────────────────────────────────────┘
                       │ rendered by
          ┌────────────┼────────────┬──────────────────┐
          ▼            ▼            ▼                  ▼
   Main Canvas   Zoom Overlay   Hidden Ref      Print
   (page view)   (fullscreen)   (html2canvas)   (CSS)
          │            │              │              │
          ▼            ▼              ▼              ▼
     Scaled to     Fits to       Download as    Landscape
     container     viewport      PNG image      only cert
```

## CertificateTemplate Component

**File:** `src/features/learning-module/components/CertificateTemplate.tsx`

The single source of truth for certificate rendering.

### Design Rules
- **Width**: always `900px` — never changes
- **Height**: `aspectRatio: "297 / 210"` (A4 landscape ratio → 636px)
- **Typography**: fixed `px` values only — no `clamp()`, no `vw` units
- **Colors**: explicit hex constants (`#2563eb`, `#252525`, etc.) — no Tailwind CSS variables
- **Icons**: inline SVGs with explicit `stroke`/`fill` — no `currentColor`

### Why No `clamp()` or `vw`?

The hidden download template renders at 900px wide. If it used `clamp(16px, 2vw, 24px)`:
- On mobile (375px viewport): `2vw = 7.5px` → font resolves to `16px` (min)
- On desktop (1920px viewport): `2vw = 38px` → font resolves to `24px` (max)
- **Result**: mobile download produces tiny text, desktop produces large text

Fixed pixel values ensure the certificate looks identical on every device.

### Why No `oklch()` or Tailwind Colors?

`html2canvas` cannot parse `oklch()` color syntax (Tailwind CSS v4 default). It throws:
```
Attempting to parse an unsupported color function "oklch"
```

All colors in `CertificateTemplate` are explicit hex:
```tsx
const C = {
  primary: "#2563eb",
  foreground: "#252525",
  muted: "#8e8e8e",
  border: "#eaeaea",
  white: "#ffffff",
} as const;
```

### Used In 3 Places

| Context | Location | How |
|---------|----------|-----|
| **Main canvas** | `certificate-client.tsx` | Scaled via `transform: scale(mainScale)` to fit container |
| **Zoom overlay** | `certificate-client.tsx` | Scaled via `transform: scale(zoomScale)` — dynamic based on viewport |
| **Download ref** | `certificate-client.tsx` | Off-screen (`position: absolute; left: -9999px`), passed to `html2canvas` |

## Download Flow (PNG via html2canvas)

### Step-by-Step

```
1. User clicks "Download Image" button
2. handleDownload() called
3. html2canvas renders the hidden downloadRef
4. Canvas output → PNG Blob
5. Blob → object URL → auto-click <a download>
6. User downloads certificate-{id}.png
```

### Code

```tsx
const handleDownload = async () => {
  const canvas = await html2canvas(downloadRef.current, {
    scale: 2,              // 2x resolution for crisp output
    useCORS: true,         // Allow cross-origin images
    backgroundColor: "#ffffff",
    logging: false,
    width: 900,            // Fixed template width
    onclone: (clonedDoc) => {
      // Walk every element and replace oklch/lab colors with hex
      // (safety net in case any leaked CSS variable reaches the clone)
      const all = clonedDoc.querySelectorAll("*");
      all.forEach((el) => {
        const cs = clonedDoc.defaultView!.getComputedStyle(el);
        if (cs.color?.includes("oklch") || cs.color?.includes("lab(")) {
          (el as HTMLElement).style.color = "#252525";
        }
      });
    },
  });

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${certificateId}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
};
```

### Output
- **Resolution**: `1800×1272px` (900×636 at 2x scale)
- **Format**: PNG with white background
- **Filename**: `certificate-RMN-2026-XXXXX.png`

## Print Flow

When the "Print" button is clicked:

1. `window.print()` opens browser's native print dialog
2. `@media print` styles applied via injected `<style>` tag
3. Elements with `.print-hide` class are hidden:
   - Header navigation
   - Action buttons
   - Metadata grid
4. Only `#certificate-canvas` renders
5. User selects "Save as PDF" → landscape A4

### Print CSS

```css
@media print {
  @page { size: landscape; margin: 10mm; }
  body { background: white !important; print-color-adjust: exact; }
  header { display: none !important; }
  .print-hide { display: none !important; }
  main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
  #certificate-canvas { margin: 0 !important; }
  #certificate-canvas > div {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
  }
}
```

## Public Verification Page

**Route:** `/verify/[certificateId]`
**File:** `src/app/(main)/verify/[id]/page.tsx`

Anyone with a certificate ID can verify its authenticity without logging in.

### How It Works

```
/verify/RMN-2026-12345
        │
        ▼
getPublicCertificateData("RMN-2026-12345")
        │
        ├──► Fetch ALL completed enrollments
        │    (user_learning_progress WHERE progress=100)
        │
        ├──► For each enrollment, generate certificate ID
        │    generateCertificateId(user_id, module_id)
        │
        ├──► Find matching enrollment
        │
        ├──► Fetch module details (title, difficulty)
        │
        └──► Fetch user profile (name, avatar — public only)
```

### Verified View
- Green shield badge with "Certificate Verified"
- Recipient name
- Module title
- Completion date (formatted)
- Certificate ID (monospace)

### Not Found View
- Red X badge with "Certificate Not Found"
- Shows the searched ID
- Link to go home

### Server Action

**File:** `src/features/learning-module/actions/certificate.ts`

```tsx
export async function getPublicCertificateData(
  certificateId: string
): Promise<{
  userName: string;
  moduleTitle: string;
  difficulty: string;
  completedAt: string;
  certificateId: string;
  userAvatar: string | null;
} | null>
```

This function does **not** require authentication. It only returns public fields — no email or user ID exposed.

## Certificate ID Format

```
RMN-YYYY-XXXXX

RMN    = Remonest prefix
YYYY   = Current year
XXXXX  = 5-digit hash of (userId + moduleId), zero-padded

Example: RMN-2026-12345
```

Generated by `generateCertificateId(userId, moduleId)` in `certificate.ts`.

## Responsive Behavior

### Main Canvas (page view)
- Container uses `ResizeObserver` to track width
- `mainScale = min(containerWidth / 900, 1)`
- On mobile (<900px): scales down via `transform: scale(mainScale)`
- On desktop (≥900px): full size (`scale = 1`)

### Zoom Overlay
- Calculates `zoomScale` from viewport on open:
  ```
  scaleW = window.innerWidth * 0.95 / 900
  scaleH = window.innerHeight * 0.85 / 636
  zoomScale = min(scaleW, scaleH, 2.0)  // cap at 2x
  ```
- Listens to `window.resize` for orientation changes
- Wrapper has exact pixel dimensions with `overflow: auto` for scrolling

### Download Template
- Always renders at fixed 900×636px — never responsive
- Positioned off-screen with `left: -9999px`
- Output is always identical regardless of device

## File Structure

```
src/
├── app/(main)/
│   ├── certificates/[id]/
│   │   ├── page.tsx                    # Server component (fetches data)
│   │   └── certificate-client.tsx      # Client component (UI, download, zoom)
│   └── verify/[id]/
│       └── page.tsx                    # Public verification page (no auth)
├── features/learning-module/
│   ├── actions/
│   │   └── certificate.ts              # getCertificateData + getPublicCertificateData
│   ├── components/
│   │   └── CertificateTemplate.tsx     # Shared template (single source of truth)
│   └── types/
│       └── certificate.ts              # CertificateData interface
└── app/api/certificate/pdf/
    └── route.ts                        # Legacy Puppeteer PDF API (if still used)
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Attempting to parse an unsupported color function "oklch"` | html2canvas encounters `oklch()` color | Ensure `CertificateTemplate` uses only hex colors; `onclone` safety net |
| Downloaded image is blank | Hidden ref used `sr-only` (1×1px) | Use `position: absolute; left: -9999px` with explicit sizing |
| Font sizes differ between devices | `clamp()` with `vw` units | Replace with fixed `px` values |
| SVG icons crash html2canvas | `currentColor` resolves to `oklch()` | Use inline SVGs with explicit `stroke`/`fill` hex values |
| Zoom overlay cuts off on mobile | Hardcoded `scale(1.6)` = 1440px wide | Calculate `zoomScale` dynamically from viewport |
| Certificate not found on verify page | No matching enrollment or module unpublished | Check `user_learning_progress` has `progress=100` and `completed_at IS NOT NULL` |
