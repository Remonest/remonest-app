# Profile Photo Upload Implementation (v2.1.0)

> **Date:** April 27, 2026  
> **Status:** ✅ Implemented  
> **Migration:** 027  

## 📋 Overview

The **Profile Photo Upload** system allows users to upload a professional headshot to their profile. To optimize storage and performance, images are compressed and converted to **WebP** format on the client side before being uploaded to Supabase Storage.

---

## 🏗️ Technical Architecture

### 1. Client-Side Optimization (`src/lib/image-optimization.ts`)
Instead of uploading raw images (which can be several megabytes), we use the browser's **Canvas API** to optimize the image:
- **Resizing**: Downscales images to a maximum of 400x400px while maintaining aspect ratio.
- **Conversion**: Converts any input format (JPEG, PNG, HEIC) to `image/webp`.
- **Compression**: Applies a 0.8 quality setting to further reduce file size.
- **Result**: Average file size is reduced from 2-5MB to ~20-50KB.

### 2. Supabase Storage (`avatars` bucket)
- **Bucket**: A public bucket named `avatars` was created via Migration 027.
- **RLS Policies**:
  - `SELECT`: Public access (anyone can view avatars).
  - `INSERT/UPDATE/DELETE`: Restricted to the authenticated owner via folder-level security (`(storage.foldername(name))[1] = auth.uid()::text`).
- **Structure**: `avatars/{user_id}/{timestamp}.webp`

### 3. Database Schema
- **Table**: `user_profiles`
- **Column**: `avatar_url` (TEXT) stores the public URL of the uploaded image.

---

## 🎨 UI Components

### `UserAvatar` (`src/components/user-avatar.tsx`)
A wrapper around the Radix UI Avatar component that provides:
- Automatic initials fallback using the `getInitials` helper.
- Standardized sizes (`sm`, `default`, `lg`).
- Consistent border and shadow styling.

---

## 🔄 User Flows

### Upload Flow (Settings Page)
1. User navigates to **Dashboard > Settings > Profile**.
2. Clicks the camera icon or "Upload New" button.
3. Selects an image file.
4. `optimizeImage` utility compresses the file to WebP.
5. File is uploaded to Supabase Storage using the user's session.
6. The new public URL is previewed instantly.
7. Upon clicking "Save Changes", the URL is persisted to the `user_profiles` table via a Server Action.

### Global Display flow
The avatar is automatically fetched and displayed in:
- **Dashboard Header**: Next to the sign-out button.
- **Mobile Menu**: In a new user info section at the top of the nav.
- **Admin Sidebar**: In the footer user card.
- **Profile Page**: In the main header with an online status indicator.

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/lib/image-optimization.ts` | Image compression & WebP conversion logic |
| `src/components/user-avatar.tsx` | Standardized avatar component |
| `src/app/(main)/dashboard/settings/settings-client.tsx` | Upload UI and client-side logic |
| `src/features/dashboard/actions/settings.ts` | Server Action to save avatar URL |
| `supabase/migrations/027_add_avatars_storage.sql` | Storage bucket and RLS policies |

---

## 🔒 Security Considerations
- **Folder-level RLS**: Users can only upload to and delete from their own subfolder within the `avatars` bucket.
- **Public Read**: Avatars are publicly accessible to allow them to be seen on public portfolio pages and job applications.
- **Size Limits**: Enforced both in the storage bucket (2MB) and during client-side compression.

---

**Last Updated:** April 27, 2026  
**Version:** v2.1.0  
