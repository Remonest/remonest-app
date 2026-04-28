# Admin File Manager (v1.9.5)

> **Date:** April 28, 2026  
> **Purpose:** Centralized file upload and management for admin users

---

## 📋 Overview

The **Admin File Manager** is a centralized page for uploading and managing files (images, PDFs, documents) that can be used across the platform.

**Route:** `/admin/upload`  
**Access:** Admin only (via sidebar navigation)

---

## 🎯 Features

### **1. Upload Area**
- ✅ **Drag & Drop** - Drag files directly onto the upload zone
- ✅ **File Browser** - Click to select files from computer
- ✅ **Multi-file Upload** - Upload multiple files at once
- ✅ **Real-time Progress** - Shows upload status for each file
- ✅ **Validation** - Checks file type and size before upload

### **2. Supported File Types**

| Type | Extensions | Max Size |
|------|------------|----------|
| **Images** | JPEG, PNG, WebP, GIF | 10MB |
| **Documents** | PDF, DOC, DOCX, XLS, XLSX | 10MB |
| **Videos** | MP4, WebM, OGG, MOV | 50MB |

### **3. File Management**
- ✅ **Image Preview** - Shows thumbnail for uploaded images
- ✅ **Video Preview** - Shows video thumbnails with hover-to-play functionality
- ✅ **File Icons** - Different icons for PDFs, documents, videos, etc.
- ✅ **Copy URL** - One-click copy file URL to clipboard
- ✅ **Delete Files** - Remove files from the list
- ✅ **File Info** - Shows file size and type

### **4. Filters**
- **All** - Show all uploaded files
- **Images** - Filter to show only images
- **Files** - Filter to show only documents
- **Videos** - Filter to show only videos

---

## 🖼️ UI Layout

```
┌─────────────────────────────────────────────────────┐
│ File Manager                                         │
│ Upload and manage images and files                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │          Drag & Drop Upload Area            │    │
│  │           [Choose Files] Button             │    │
│  │   Images: JPEG, PNG, WebP, GIF (max 10MB)   │    │
│  │   Documents: PDF, DOC, XLS (max 10MB)       │    │
│  │   Videos: MP4, WebM, OGG, MOV (max 50MB)   │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Upload Progress (if uploading)                      │
│  ✓ file1.png - Success                               │
│  ⚠ file2.pdf - Failed: File too large                │
│                                                      │
│  Uploaded Files (3)        [All] [Images] [Files]   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ [Image] │ │ [Icon]  │ │ [Image] │               │
│  │ cover   │ │ doc.pdf │ │ logo    │               │
│  │ 2.3 MB  │ │ 1.1 MB  │ │ 500 KB  │               │
│  │ [Copy]  │ │ [Copy]  │ │ [Copy]  │               │
│  └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 How It Works

### **Upload Flow**

```
1. User selects/drops files
   ↓
2. Frontend validates:
   - File type (allowed types)
   - File size (max 10MB)
   ↓
3. Sends POST to /api/upload
   ↓
4. Server uploads to Supabase Storage:
   - Bucket: "learning-files"
   - Filename: {timestamp}-{random}.{ext}
   ↓
5. Returns file URL
   ↓
6. Frontend displays:
   - Image preview (if image)
   - File icon (if document)
   - Copy URL button
```

### **File Storage**

**Bucket:** `learning-files`  
**Filename Format:** `{timestamp}-{random}.{extension}`  
**Example:** `1713097200000-abc123.png`

**Public URL:** `/api/learning/file/{filename}`

---

## 📁 Integration with Other Features

### **1. Module Cover Images**

**Where:** `/admin/learning/[id]/edit` → "Cover Image URL" field

**Workflow:**
1. Upload image in File Manager
2. Click "Copy URL"
3. Paste URL into "Cover Image URL" field
4. Save module

**Result:** Image appears in:
- Admin learning list (thumbnail column)
- Public module catalog
- Module hero section (`/learning/[slug]`)

### **2. Learning Materials**

**Where:** `/admin/learning/[id]/materials` → Create Material

**Workflow:**
1. Upload PDF/document in File Manager
2. Copy URL
3. Create material with source URL
4. Students can download/access file

### **3. Learning Resources**

**Where:** `/admin/learning/[id]/materials` → Add Resource

**Workflow:**
1. Upload file (PDF, template, etc.)
2. Copy URL
3. Create resource with file URL
4. Students can download resource

---

## 🛣️ Navigation

**Admin Sidebar:**
```
Jobs
Learning
File Manager ← NEW!
Activity Log
Settings
```

**Direct URL:** `/admin/upload`

---

## 🔐 Security

### **Access Control**
- ✅ Admin-only access (via `requireAdmin()` in layout)
- ✅ Server validates admin before upload
- ✅ All uploads logged to `admin_actions` table

### **File Validation**

**Server-side checks:**
- File type whitelist
- File size limits (10MB max)
- Unique filename generation (prevents overwrites)

**Client-side checks:**
- Immediate validation before upload
- Clear error messages for invalid files

---

## 📊 API Reference

### **Upload Endpoint**

**URL:** `POST /api/upload`

**Request:**
```
Content-Type: multipart/form-data

FormData:
  file: File (image, document, or video)
```

**Response (Success):**
```json
{
  "success": true,
  "path": "1713097200000-abc123.png",
  "url": "/api/learning/file/1713097200000-abc123.png",
  "size": 245678,
  "type": "image/png"
}
```

**Response (Error):**
```json
{
  "error": "Ukuran file maksimal 10MB untuk gambar"
}
```

### **File Access Endpoint**

**URL:** `GET /api/learning/file/[path]`

**Returns:** File stream with appropriate content-type header

---

## 🧪 Testing Checklist

### **Upload Tests**
- [ ] Drag single image → Uploads successfully
- [ ] Drag single video → Uploads successfully
- [ ] Drag multiple files → All upload successfully
- [ ] Click "Choose Files" → File browser opens
- [ ] Upload invalid type (e.g., .exe) → Shows error
- [ ] Upload large image/file (>10MB) → Shows size error
- [ ] Upload large video (>50MB) → Shows size error
- [ ] Upload 5 files at once → All process correctly

### **File Management Tests**
- [ ] Image shows preview thumbnail
- [ ] Video shows preview with hover-to-play
- [ ] PDF shows document icon
- [ ] Click "Copy URL" → URL copied to clipboard
- [ ] Click delete → Confirmation shows
- [ ] Confirm delete → File removed from list
- [ ] Filter "Images" → Only images shown
- [ ] Filter "Files" → Only documents shown
- [ ] Filter "Videos" → Only videos shown
- [ ] Filter "All" → All files shown

### **Integration Tests**
- [ ] Copy image URL → Paste in "Cover Image URL" → Saves correctly
- [ ] Upload video → Copy URL → Create material → Video plays correctly
- [ ] Upload PDF → Copy URL → Create material → File accessible
- [ ] Upload template → Copy URL → Create resource → Downloads correctly

---

## 🐛 Known Limitations

### **Current Limitations**
- ❌ **No file rename** - Can't rename uploaded files
- ❌ **No bulk delete** - Must delete files one by one
- ❌ **No folder organization** - Flat file structure only
- ❌ **No file search** - Can't search by filename
- ❌ **No image editing** - Can't crop/resize images

### **Future Enhancements**
- [ ] File rename functionality
- [ ] Bulk delete selected files
- [ ] Folder/category organization
- [ ] File search by name
- [ ] Image cropping/resizing tool
- [ ] File usage tracking (where is this file used?)
- [ ] Storage quota display
- [ ] Image optimization (auto-compress on upload)

---

## 📝 Code Structure

### **Files Created**

| File | Purpose |
|------|---------|
| `src/app/admin/upload/page.tsx` | File Manager page UI |
| `src/components/admin/sidebar.tsx` | Updated with File Manager link |

### **Existing Files Used**

| File | Purpose |
|------|---------|
| `src/app/api/upload/route.ts` | Upload API (already exists) |
| `src/app/api/learning/file/[path]/route.ts` | File access API (already exists) |

---

## 🎨 Design Specifications

### **Upload Area**
```tsx
// Drag state styling
className={`border-2 border-dashed ${
  isDragging ? 'border-primary bg-primary/5' : 'border-border'
}`}
```

### **File Card**
```tsx
// Image preview
<div className="aspect-video w-full overflow-hidden">
  <img src={file.url} alt={file.name} className="object-cover" />
</div>

// File icon (for non-images)
<div className="flex items-center justify-center">
  <FileIcon className="h-12 w-12 text-muted-foreground" />
</div>
```

### **Progress Indicators**
```tsx
// Uploading
<Loader2 className="animate-spin" />

// Success
<CheckCircle2 className="text-green-500" />

// Error
<AlertCircle className="text-destructive" />
```

---

## 📚 Related Documentation

- [Admin Learning Architecture](./admin-learning-architecture.md)
- [Flow Builder Guide](./learning-module-flow-builder.md)
- [Learning Module Materials](../features/learning-module/materials.md)
- [Database Schema](../architecture/database.md)

---

**Last Updated:** April 28, 2026  
**Version:** v1.9.5  
**Status:** ✅ Implemented & Working
