# Admin Learning Pages - Architecture Decision (v1.9.3)

> **Date:** April 14, 2026  
> **Purpose:** Document why certain pages are kept separate from Flow Builder

---

## 📊 Decision Summary

**Question:** Should Flow Builder replace all separate admin learning pages?

**Answer:** ❌ **No** - Flow Builder is specifically for **Lessons & Content Editing** only.

**Separate pages to KEEP:**
- ✅ `/admin/learning/[id]/materials` - Materials & Resources management
- ✅ `/admin/learning/[id]/quiz` - Quiz Builder
- ✅ `/admin/learning` - Module list (obviously)
- ✅ `/admin/learning/[id]/edit` - Module metadata

---

## 🎯 Flow Builder Scope

### **What Flow Builder DOES Cover**
✅ Lesson CRUD (create, read, update, delete)  
✅ Lesson reordering (drag-and-drop)  
✅ Lesson content editing (WYSIWYG markdown editor)  
✅ Lesson properties (title, duration, access)  
✅ Module publishing workflow  
✅ Auto-save functionality  

### **What Flow Builder Does NOT Cover**
❌ File uploads (PDFs, images)  
❌ YouTube video embedding with oEmbed validation  
❌ Material metadata (source type, language, difficulty, tags)  
❌ Resource management (tools, templates, ebooks)  
❌ Quiz creation (multi-question forms with options)  
❌ Quiz configuration (passing grade, duration, difficulty)  
❌ Per-material publish toggles  

---

## 🏗️ Architecture Decision

### **Why Keep Separate Pages?**

#### **1. Different Workflows**

| Page | Primary Workflow | User Goal |
|------|------------------|-----------|
| **Flow Builder** | "I want to structure my course and write lesson content" | Create curriculum flow |
| **Materials** | "I want to upload files, embed videos, and manage resources" | Add rich media content |
| **Quiz Builder** | "I want to create assessments with multiple questions" | Test student knowledge |

These are **fundamentally different tasks** that shouldn't be crammed into one interface.

#### **2. Complexity Management**

**Flow Builder with everything would need:**
- 4-panel layout (curriculum + editor + properties + media library)
- File upload dialogs
- Video URL validators
- Quiz question builders
- Resource type selectors
- Tag management interfaces
- Per-material publish toggles

This would create an **overwhelming UI** that's hard to navigate.

#### **3. Best Practice: Single Responsibility**

Each page has a **clear, focused purpose**:

| Page | Responsibility |
|------|----------------|
| **Flow Builder** | Lesson structure + content writing |
| **Materials** | Rich media + file management |
| **Quiz Builder** | Assessment creation |
| **Edit Metadata** | Module-level settings |

---

## 📋 Current Button Layout (CORRECT)

```
Main Actions (visible icons):
┌─────────────────────────────────────────┐
│ [✏️] [📖] [⋮]                           │
│  │    │    │                             │
│  │    │    └─ Dropdown Menu             │
│  │    └─ Flow Builder (lessons/content) │
│  └─ Edit Metadata                       │
└─────────────────────────────────────────┘

Dropdown Menu:
┌──────────────────────────────────────┐
│ ✏️  Edit Metadata                    │
│ 📖  Flow Builder                     │
│ 📄  Kelola Materi                    │ ← KEEP (separate workflow)
│ ❓  Kelola Kuis                      │ ← KEEP (separate workflow)
│ ─────────────────────────────────    │
│ 👁️  Publish (if draft)              │
│ 📄  Revert to Draft (if published)  │
│ 📦  Archive (if not archived)       │
│ ─────────────────────────────────    │
│ 🗑️  Delete                          │
└──────────────────────────────────────┘
```

---

## 🔄 Navigation Flow

```
/admin/learning
  ↓ (click module)
  │
  ├─ ✏️ Edit Metadata
  │   └─ Title, category, status, description
  │
  ├─ 📖 Flow Builder
  │   ├─ Lesson list (curriculum panel)
  │   ├─ Content editor (WYSIWYG)
  │   ├─ Lesson properties
  │   └─ Module publish
  │
  ├─ 📄 Kelola Materi
  │   ├─ Create materials (articles, videos)
  │   ├─ File uploads (PDFs, images)
  │   ├─ YouTube embedding
  │   ├─ Metadata (tags, language, difficulty)
  │   └─ Resources (tools, templates, ebooks)
  │
  └─ ❓ Kelola Kuis
      ├─ Quiz configuration
      ├─ Multiple-choice questions
      ├─ Options (A-E)
      ├─ Correct answers
      └─ Passing grade
```

---

## 🚫 What We Removed (And Why)

### **Removed: Content Type Tabs from Editor Panel**

**Before:**
```
[📄 Article] [🎥 Video Embed] [📁 File/PDF] [❓ Quiz]
```

**Problem:** These tabs were **misleading** - they only changed visual state, didn't actually switch content types. Video/File/Quiz functionality belongs in separate pages.

**After:** Removed tabs. Editor is now **Article-only** (markdown content). For videos/files/quizzes, use separate "Kelola Materi" or "Kelola Kuis" pages.

---

## ✅ Final Architecture

### **Page Responsibilities**

| Page | What It Does | What It Doesn't Do |
|------|--------------|-------------------|
| **Flow Builder** | Lessons, content editing, module publish | File uploads, quiz creation |
| **Materials** | File uploads, videos, resources, metadata | Lesson structure, quiz creation |
| **Quiz Builder** | Multi-question assessments | Lesson content, file uploads |
| **Edit Metadata** | Module title, category, status | Lessons, materials, quizzes |

### **Data Relationships**

```
learning_modules (module metadata)
  │
  ├─ module_lessons (lesson structure)
  │   ├─ material_id → learning_materials (article content)
  │   ├─ quiz_config_id → quiz_configs (quiz questions)
  │   └─ resource_id → learning_resources (downloads)
  │
  ├─ learning_materials (standalone materials)
  │   └─ Can exist without lessons (supplementary content)
  │
  └─ quiz_configs (standalone quizzes)
      └─ Can exist without lessons (bonus assessments)
```

**Key Insight:** Lessons **link to** materials/quizzes, they don't **contain** them. This is why they need separate management pages.

---

## 🧪 When to Integrate Later

### **Flow Builder could integrate Materials/Quizzes IF:**

1. **UI/UX research shows** admins constantly switch between pages
2. **Common workflows emerge** (e.g., "create lesson → immediately add video")
3. **Design solution found** that doesn't overwhelm the interface

### **Integration approach (future):**

Instead of cramming everything into Flow Builder, consider:
- **Modal dialogs** for quick material creation
- **Side panels** that slide in when needed
- **Quick actions** in curriculum panel (e.g., "Add Video" → opens material form)
- **Deep linking** (click lesson → see linked materials)

---

## 📝 Summary

| Decision | Rationale |
|----------|-----------|
| **Keep Materials page** | Handles file uploads, videos, resources - different workflow |
| **Keep Quiz Builder page** | Complex multi-question forms - different workflow |
| **Remove content type tabs** | Misleading UI, functionality belongs in separate pages |
| **Flow Builder = Lessons only** | Clear, focused purpose without overwhelming UI |

---

**Last Updated:** April 14, 2026  
**Version:** v1.9.3  
**Status:** ✅ Architecture Decision Documented
