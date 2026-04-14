# Learning Module Flow Builder (v1.9.0)

> **New Feature** — April 14, 2026

The Flow Builder is a modern, three-panel interface for creating and editing learning module content. It replaces the old separate lessons page with an integrated, Notion-style editing experience.

---

## 📋 Overview

The Flow Builder provides a unified interface for:
- **Curriculum Management** — Organize lessons into sections, reorder via drag-and-drop
- **Content Editing** — WYSIWYG Markdown editor with formatting toolbar
- **Properties Configuration** — Per-lesson settings (duration, access, toggles)

### Key Features
- ✅ Three-panel layout (curriculum | editor | properties)
- ✅ Auto-save content changes (2-second debounce)
- ✅ Drag-and-drop lesson reordering
- ✅ Content type tabs (Article, Video Embed, File/PDF, Quiz)
- ✅ Markdown toolbar with common formatting
- ✅ Step settings panel with toggles
- ✅ Draft/Publish workflow
- ✅ Real-time save status indicator

---

## 🏗️ Architecture

### File Structure

```
src/app/admin/learning/[id]/builder/
├── page.tsx                      # Server component (data fetching)
├── builder-client.tsx            # Main client component (state management)
├── curriculum-panel.tsx          # Left sidebar (lesson list)
├── editor-panel.tsx              # Center panel (content editor)
├── properties-panel.tsx          # Right sidebar (step settings)
└── flow-builder-actions.ts       # Server actions (save content, publish)

src/app/api/learning/materials/[materialId]/
└── route.ts                      # API route (fetch material content)
```

### Database Tables Used

| Table | Purpose |
|-------|---------|
| `learning_modules` | Module metadata (title, status, category) |
| `module_lessons` | Lesson steps (order, type, duration, preview flag) |
| `learning_materials` | Article content (HTML/Markdown content) |
| `quiz_configs` | Quiz configurations (linked to lessons) |
| `learning_resources` | Downloadable resources (PDFs, templates) |
| `admin_actions` | Audit trail (all admin actions logged) |

### Data Flow

```
1. Admin opens /admin/learning/[id]/builder
   ↓
2. Server component fetches:
   - Module metadata
   - All lessons (ordered by order_index)
   - Materials/quizzes/resources for linking
   - First lesson's content (if exists)
   ↓
3. Builder-client.tsx initializes state:
   - lessons[] → grouped into sections
   - selectedLessonId → first lesson by default
   - editorContent → fetched material content
   ↓
4. User edits content → auto-save triggers (2s debounce)
   ↓
5. saveStepContent() server action:
   - If lesson has material_id → updates existing material
   - If no material_id → creates new material + links lesson
   ↓
6. Admin clicks "Publish" → publishModule() updates module status
```

---

## 🎨 UI Components

### 1. Top Header Bar

```
┌─────────────────────────────────────────────────────────────┐
│ Modules > Remote Working Basics > Flow Builder  [Draft]     │
│                                    [Preview] [Save] [Publish]│
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Breadcrumbs** — Navigation path with clickable links
- **Status Badge** — Current module status (Draft/Published/Archived)
- **Action Buttons:**
  - `Preview` — Opens public module detail page
  - `Save Draft` — Manual save (also auto-saves)
  - `Publish` — Changes status to "published"

### 2. Curriculum Panel (Left Sidebar, 320px)

```
┌──────────────────────────────┐
│ 📄 Curriculum           [+]  │
├──────────────────────────────┤
│ ▼ 1. Getting Started    ⋮    │
│  ⠿ Welcome & Expectations  ⋮│
│  ⠇ Setting up workspace  ⋮  │
│  ⠇ Checkpoint: Environment ⋮│
│  [+ Add Step]                │
│                              │
│ ▼ 2. Communication      ⋮    │
│  ⠇ Async principles      ⋮  │
│  ⠇ Tools of the trade    ⋮  │
│  ⠇ Exercise: Async update ⋮ │
│  [+ Add Step]                │
│                              │
│ [+ Add Section]              │
└──────────────────────────────┘
```

**Features:**
- **Section Headers** — Clickable to collapse/expand
- **Step Items** — Clickable to select, draggable to reorder
- **Step Icons** — Color-coded by type:
  - 📄 Article (violet)
  - 🎥 Video (blue)
  - 💻 Exercise (amber)
  - ❓ Quiz (rose)
  - 📁 Resource (teal)
- **Hover Actions** — Drag handle appears on hover, context menu (⋮) for edit/duplicate/delete
- **Preview Badge** — Shows "Preview" badge if `is_preview = true`

**Interactions:**
- Click step → Selects and loads content in editor
- Drag step → Reorders within section (triggers `reorderLessons` action)
- Click `[+ Add Step]` → Creates new step (defaults to Article type)
- Click `[+ Add Section]` → Creates new section (future feature)

### 3. Editor Panel (Center, Flexible Width)

```
┌──────────────────────────────────────────────────────┐
│ Welcome & Expectations                    ✓ Saved 14:30│
│ Edit the content for this step. Changes auto-save.    │
│                                                      │
│ [📄 Article] [🎥 Video] [📁 File/PDF] [❓ Quiz]      │
├──────────────────────────────────────────────────────┤
│ [B] [I] [U] | [H1] [H2] ["] | [•] [1.] | [🔗] [🖼] [</>]│
│ ┌────────────────────────────────────────────────┐   │
│ │ Welcome to Remote Working Basics! 👋            │   │
│ │                                                 │   │
│ │ Embarking on a remote career is an exciting... │   │
│ │                                                 │   │
│ │ ## What you will learn:                         │   │
│ │ - Difference between flexible/set-schedule      │   │
│ │ - Core communication standards                  │   │
│ │                                                 │   │
│ │ > Pro Tip: Always assume positive intent...     │   │
│ └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Content Type Tabs:**
- **Article** — Markdown editor (current implementation)
- **Video Embed** — URL input for YouTube/Vimeo (future)
- **File/PDF** — File upload interface (future)
- **Quiz** — Links to quiz builder (future integration)

**Toolbar Commands:**
| Button | Markdown Output |
|--------|----------------|
| **Bold** | `**bold text**` |
| *Italic* | `*italic text*` |
| Underline | `<u>underlined text</u>` |
| H1 | `# Heading 1` |
| H2 | `## Heading 2` |
| Quote | `> Quote` |
| Bulleted List | `- List item` |
| Numbered List | `1. List item` |
| Link | `[text](url)` |
| Image | `![alt](url)` |
| Code Block | ` ``` code ``` ` |

**Auto-Save Behavior:**
- Debounced at 2 seconds after content change
- Calls `saveStepContent()` server action
- Updates `lastSaved` timestamp on success
- Shows "✓ Saved just now" indicator

### 4. Properties Panel (Right Sidebar, 280px)

```
┌──────────────────────────┐
│ Step Settings       [⚙]  │
├──────────────────────────┤
│ Step Title               │
│ [Welcome & Expectations] │
│                          │
│ Estimated Time           │
│ How long should this     │
│ take to complete?        │
│ [  5] minutes            │
│                          │
│ Content Access           │
│ Who can view this step?  │
│ [Enrolled Students Only▼]│
│                          │
│ ───────────────────────  │
│                          │
│ Required Step       [✓]  │
│ Must complete to progress│
│                          │
│ Allow Comments      [ ]  │
│ Enable discussion board  │
│                          │
│ ───────────────────────  │
│                          │
│ [🗑 Delete Step]          │
└──────────────────────────┘
```

**Settings:**
| Field | Type | Description |
|-------|------|-------------|
| **Step Title** | Text input | Lesson title (updates `module_lessons.title`) |
| **Estimated Time** | Number input | Duration in minutes (updates `duration_minutes`) |
| **Content Access** | Select dropdown | Visibility level (enrolled/preview/locked) |
| **Required Step** | Toggle | Must complete to progress (future feature) |
| **Allow Comments** | Toggle | Enable discussion board (future feature) |
| **Delete Step** | Button | Removes lesson + associated content |

---

## 🔧 Server Actions

### 1. `saveStepContent(admin, lessonId, content)`

**Purpose:** Save lesson content (creates/updates `learning_materials` record)

**Logic:**
```typescript
1. Check if lesson exists
2. If lesson.material_id exists:
   → UPDATE learning_materials SET content = ...
3. If lesson.material_id is null:
   → INSERT INTO learning_materials (...)
   → UPDATE module_lessons SET material_id = new_id
4. Log admin action
5. Revalidate builder path
```

**Returns:** `{ success: boolean; error?: string }`

**Usage:**
```typescript
const result = await saveStepContent(admin, lessonId, markdownContent);
if (result.success) {
  setLastSaved(new Date().toLocaleTimeString());
}
```

### 2. `updateLessonSettings(admin, lessonId, settings)`

**Purpose:** Update lesson metadata (title, duration, preview flag)

**Parameters:**
```typescript
{
  title?: string;
  durationMinutes?: number;
  isPreview?: boolean;
}
```

**Returns:** `{ success: boolean; error?: string }`

### 3. `publishModule(admin, moduleId)`

**Purpose:** Change module status to "published"

**Logic:**
```typescript
1. UPDATE learning_modules SET status = 'published'
2. Log admin action
3. Revalidate paths
```

**Returns:** `{ success: boolean; error?: string }`

---

## 🛣️ Routes

| Route | Purpose | Access | Status |
|-------|---------|--------|--------|
| `/admin/learning/[id]/builder` | Flow Builder main page | Admin only | ✅ **Active** |
| `/admin/learning/[id]/edit` | Module metadata form | Admin only | ✅ **Active** |
| `/admin/learning/[id]/lessons` | Old lessons page | Admin only | ⚠️ **Legacy** (replaced by Flow Builder) |
| `/admin/learning/[id]/materials` | Materials/resources management | Admin only | ✅ **Active** |
| `/admin/learning/[id]/quiz` | Quiz builder | Admin only | ✅ **Active** |
| `/api/learning/materials/[materialId]` | Fetch material content (API) | Admin only | ✅ **Active** |

### Navigation Flow

```
/admin/learning
  ↓ (action buttons per module)
  ├─ [✏️ Pencil] → /admin/learning/[id]/edit (metadata form)
  ├─ [📖 BookOpen] → /admin/learning/[id]/builder (Flow Builder)
  └─ [⋮ Dropdown]
      ├─ Edit Metadata → /admin/learning/[id]/edit
      ├─ Flow Builder → /admin/learning/[id]/builder
      ├─ Kelola Materi → /admin/learning/[id]/materials
      └─ Kelola Kuis → /admin/learning/[id]/quiz
```

### Removed Buttons (v1.9.0)

The following buttons were **removed** after Flow Builder implementation:

| Removed Button | Previous Route | Reason |
|----------------|----------------|--------|
| ✏️ **Edit Lessons** (main actions) | `/admin/learning/[id]/lessons` | Replaced by Flow Builder |
| 📄 **Kelola Pelajaran** (dropdown) | `/admin/learning/[id]/lessons` | Replaced by Flow Builder |

**Why removed?** Flow Builder now handles all lesson management (create, edit, reorder, content editing) in a single unified interface. The old `/lessons` page is still accessible but no longer linked from the UI.

---

## 📝 How-To Guides

### How to Create a New Lesson

1. Open Flow Builder for a module
2. In Curriculum Panel, click `[+ Add Step]`
3. New step appears with default name "New Step"
4. Click step to select it
5. In Editor Panel, write content (auto-saves)
6. In Properties Panel, adjust title, duration, settings
7. Drag to reorder if needed

### How to Reorder Lessons

**Method 1: Drag-and-Drop**
1. Hover over step in Curriculum Panel
2. Drag handle (⠿) appears on left
3. Click and drag to new position
4. Release to drop (triggers `reorderLessons` action)

**Method 2: Context Menu** (future)
1. Click ⋮ on step
2. Select "Move Up" or "Move Down"

### How to Edit Lesson Content

1. Select lesson from Curriculum Panel
2. Editor loads content (if linked to material)
3. Use toolbar to format text
4. Content auto-saves after 2 seconds
5. Check "✓ Saved just now" indicator

### How to Publish a Module

1. Ensure all lessons have content
2. Click `Publish` button in top header
3. Confirm action (future: add confirmation dialog)
4. Module status changes to "published"
5. Module appears on public learning catalog

---

## 🔐 Security

### Admin-Only Access

All routes and actions require admin authentication via `requireAdmin()`:

```typescript
const admin = await requireAdmin(); // Throws if not admin
```

### RLS Policies

All database operations use service role client (bypasses RLS), but admin authentication is verified server-side before any DB operation.

### Audit Trail

All admin actions are logged to `admin_actions` table:
- `create_learning_material`
- `update_learning_module`
- `delete_learning_module`

Logged data includes:
- `admin_id` — Who performed action
- `action_type` — What action was performed
- `table_name` — Which table was affected
- `record_id` — Which record was changed
- `old_values` / `new_values` — What changed (when applicable)

---

## 🐛 Known Issues & TODOs

### Current Limitations
- [ ] Video Embed tab — UI placeholder, needs file upload logic
- [ ] File/PDF tab — UI placeholder, needs Supabase Storage integration
- [ ] Quiz tab — Needs integration with existing quiz builder
- [ ] Section management — "Add Section" button non-functional
- [ ] Drag-and-drop — Visual feedback during drag needs improvement
- [ ] Required Step toggle — Not yet enforced on public pages
- [ ] Allow Comments toggle — Discussion board not implemented

### Future Enhancements
- [ ] Bulk lesson operations (duplicate, delete multiple)
- [ ] Lesson templates (pre-built content structures)
- [ ] Content versioning (track content history)
- [ ] Collaborative editing (real-time sync)
- [ ] Image upload to Supabase Storage
- [ ] Embed support (YouTube, Loom, Figma)
- [ ] Lesson prerequisites (lock lessons until previous completed)
- [ ] Import/Export module content (JSON/Markdown)

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Create new module → Open Flow Builder → Add 3 lessons → Reorder → Verify order persists
- [ ] Edit lesson content → Wait 2s → Check "Saved" indicator → Refresh page → Verify content persists
- [ ] Change lesson title in Properties → Blur input → Verify title updates in Curriculum Panel
- [ ] Delete lesson → Confirm deletion → Verify lesson removed from list
- [ ] Click Publish → Verify module status changes to "published"
- [ ] Check admin_actions table → Verify all actions logged

### Edge Cases
- [ ] Open builder for module with no lessons → Verify empty state shows
- [ ] Select lesson with no material → Verify empty editor shows
- [ ] Rapid typing → Verify auto-save debounces correctly
- [ ] Network error during save → Verify error handling (future: show error toast)

---

## 📚 Related Documentation

- [Learning Module Overview](../features/learning-module/overview.md)
- [Learning Module Revamp v1.7.0](./learning-module-revamp.md)
- [Database Schema](../architecture/database.md)
- [RLS Policies](./rls-policies.md)
- [Admin Action Logging](./admin-action-logging.md)

---

**Last Updated:** April 14, 2026  
**Version:** v1.9.0  
**Maintained By:** Development Team
