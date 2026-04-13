# Changelog

All notable changes to this project will be documented in this file.

## [1.7.1] - 2026-04-13

### Certificate PDF Download Fix

#### Problem
- `html2canvas` cannot parse Tailwind CSS v4 `oklch()`/`lab()` colors
- Previous attempts with style overrides, cloning, and `onclone` all failed
- `window.print()` opened dialog but hid the certificate canvas
- Puppeteer route returned 204 No Content (empty response)

#### Solution: Server-side screenshot → PNG download

**API Route:** `src/app/api/certificate/pdf/route.ts`

Flow:
1. Client POSTs certificate data to `/api/certificate/pdf`
2. Server builds standalone HTML with hex-only colors (no `oklch()`)
3. Puppeteer renders HTML at `2700×1909px` (A4 landscape ~3×)
4. `page.screenshot()` captures PNG (canvas rendering, NOT print engine)
5. PNG buffer returned directly with `Content-Type: image/png`

**Client:** `src/app/(main)/certificates/[id]/certificate-client.tsx`

Flow:
1. User clicks "Download PDF" button
2. `handleDownload()` POSTs certificate data to API route
3. Receives PNG binary → creates Blob → triggers `<a>` download
4. File saved as `certificate-{id}.png`

**Why PNG not PDF:**
- `jsPDF` was removed — wrapping in PDF added no value, just complexity
- The screenshot is a pixel-perfect image matching the browser render
- Users can "Save as PDF" from their image viewer if needed
- PNG works universally without download manager issues

#### Font Size Mapping
Browser `clamp()` values resolve to max at ~900px viewport.
PDF canvas is 2700px (3×), so all sizes scale accordingly:

| Element | Browser (900px) | PNG (2700px) |
|---------|----------------|-------------|
| Logo text | 24px | 72px |
| Title | 34px | 102px |
| Subtitle | 13px | 39px |
| Name | 46px | 138px |
| Module | 20px | 60px |
| Detail label | 11px | 33px |
| Detail value | 15px | 45px |
| Signature name | 18px | 54px |
| Signature role | 9px | 27px |
| Cert ID | 11px | 33px |

#### Print Button Fix
- Removed `print:hidden` from `#certificate-canvas`
- Now `window.print()` correctly shows only the certificate
- Header, actions bar, metadata grid all hidden via `print-hide` class

### Files Changed
- `src/app/api/certificate/pdf/route.ts` — Rewritten: HTML → Puppeteer screenshot → PNG response
- `src/app/(main)/certificates/[id]/certificate-client.tsx` — Fixed download handler + print visibility
- `CHANGELOG.md` — This file

### Dependencies
- `puppeteer` (dev) — Server-side rendering
- `html2canvas` — REMOVED (incompatible with oklch colors)
- `jspdf` — REMOVED (no longer wrapping in PDF)
