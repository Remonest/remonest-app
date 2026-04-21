# CV Builder Implementation Guide

**Version:** v1.0.0
**Date:** April 21, 2026

---

## Overview

The CV Builder is a comprehensive tool for Indonesian professionals to create, manage, and export ATS-friendly resumes. It features a split-view real-time editor and preview, automatic persistence to Supabase, and high-fidelity PDF generation.

---

## 🏗️ Architecture

The CV Builder follows the **Feature-Driven Architecture** conventions:
- **Feature Module**: `src/features/portfolio/`
- **Actions**: `src/features/portfolio/actions/cv.ts`
- **Types**: `src/features/portfolio/types/cv.ts`
- **Components**: `src/features/portfolio/components/cv/`

### Data Flow
1. **Initial Load**: Server Component (`app/cv-builder/page.tsx`) fetches CV data from Supabase.
2. **State Management**: Client Component (`cv-builder-client.tsx`) manages form state.
3. **Auto-Save**: Debounced `saveCVDraftAction` (3s) saves progress silently to Supabase.
4. **Manual Save**: `updateCVAction` performs Zod validation and saves a permanent version.
5. **PDF Generation**: `@react-pdf/renderer` generates a professional PDF client-side.

---

## 🗄️ Database Schema

### `user_cvs` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key to `user_profiles` |
| `cv_name` | TEXT | Name for identifying the CV |
| `data` | JSONB | Structured CV data (Personal info, Experience, Education, Skills) |
| `template_id` | TEXT | Identifier for the selected PDF template |
| `is_primary` | BOOLEAN | Whether this is the user's main CV |

---

## 🎨 Components

### Editor Modules
- `PersonalInfoForm.tsx`: Name, contact, and professional summary.
- `ExperienceForm.tsx`: Dynamic list of work history with location and dates.
- `EducationForm.tsx`: Dynamic list of education with degree and school.
- `SkillsForm.tsx`: Comma-separated list for skills and languages.

### Preview & Export
- `CVPreview.tsx`: High-fidelity HTML preview matching the PDF layout. **This component is part of a responsive split-view, adapting its display based on screen size.**
- `templates/StandardTemplate.tsx`: `@react-pdf/renderer` document for professional export.

---

## 📄 PDF Export

The PDF export uses `@react-pdf/renderer` instead of `jspdf` to ensure:
1. **Professional Typography**: Proper kerning and line spacing.
2. **ATS Compatibility**: Selectable text and structured headers.
3. **Accuracy**: Pixel-perfect alignment matching professional standards.

---

## 🚀 Future Enhancements
- [ ] **AI Review**: Connect to `/api/ai/review` for content feedback.
- [ ] **Templates**: Add modern, creative, and minimal templates.
- [ ] **Direct Upload**: Support for parsing existing PDFs into the builder.

---

**Maintained By:** Development Team
