# Learning Module Flow Builder (v2.0.0)

> **Updated** — April 27, 2026

## Recent Enhancements (v2.0.0)

### Quiz UX & Submission Safety
- ✅ **Navigation Warnings** — Implemented browser-level warnings (`beforeunload`) to prevent accidental data loss when leaving an active quiz
- ✅ **Route Change Protection** — Added custom handling for client-side navigation attempts during assessments
- ✅ **Enhanced State Persistence** — Improved reliability of quiz progress tracking

### Complete Section Management System (v1.9.6)
- ✅ **Section Creation** — Add new sections to organize lessons into logical chapters
- ✅ **Section Editing** — Rename existing sections with dialog-based interface
- ✅ **Section Deletion** — Remove sections (lessons must be moved first)
- ✅ **Default Section Protection** — Cannot edit/delete the default "Getting Started" section
- ✅ **Section Assignment** — Assign lessons to specific sections during creation
- ✅ **Section Integration** — Full integration with lesson management and drag-and-drop

### Enhanced Dialog System
- ✅ **Multiple Dedicated Dialogs** — Separate dialogs for each action type
- ✅ **Add Step Dialog** — Create lessons with section selection
- ✅ **Edit Step Dialog** — Update lesson metadata independently of content
- ✅ **Delete Confirmation Dialog** — Safety dialog before destructive actions
- ✅ **Add Section Dialog** — Create new sections with title validation
- ✅ **Edit Section Dialog** — Rename sections with instant UI updates

### Improved State Management
- ✅ **Optimistic Updates** — UI updates immediately with server sync fallback
- ✅ **Local State Management** — Lessons and sections managed locally for instant feedback
- ✅ **Router Refresh Integration** — Server data refreshed after mutations
- ✅ **Error Handling** — Graceful error handling with toast notifications
- ✅ **Loading States** — Proper loading indicators for async operations

### Enhanced Lesson Type Support
- ✅ **All Lesson Types Supported** — Article, Video, Exercise, Quiz, Resource
- ✅ **Type Changes** — Update lesson type through edit dialog
- ✅ **Duration Management** — Set and update lesson duration
- ✅ **Description Support** — Add optional descriptions to lessons
- ✅ **Preview Toggle** — Control lesson visibility through properties panel

The Flow Builder is a modern, three-panel interface for creating and editing learning module content. It replaces the old separate lessons page with an integrated, Notion-style editing experience.

---

## 📋 Overview

The Flow Builder provides a unified interface for:
- **Curriculum Management** — Organize lessons into sections, reorder via drag-and-drop
- **Content Editing** — Different editor UIs based on lesson type (Article, Video, Exercise, Quiz, Resource)
- **Properties Configuration** — Per-lesson settings (duration, access, toggles)
- **Section Management** — Group lessons into logical chapters/modules

### Key Features
- ✅ Three-panel layout (curriculum | editor | properties)
- ✅ Auto-save content changes (2-second debounce)
- ✅ Drag-and-drop lesson reordering
- ✅ **Different editors per lesson type** (Article, Video, Exercise, Quiz, Resource)
- ✅ **Section support** — Group lessons, add/edit/delete sections
- ✅ **Quiz integration** — Link existing quiz to lesson step
- ✅ Markdown toolbar with common formatting
- ✅ Step settings panel with toggles
- ✅ Draft/Publish workflow
- ✅ Real-time save status indicator
- ✅ Add/Edit/Delete steps with proper dialogs
- ✅ Confirmation dialogs for destructive actions

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
- Click `[+ Add Step]` → Opens dialog with section selector, type selection, etc.
- Click `[+ Add Section]` → Creates new section with title dialog
- Click section menu (⋮) → Rename or delete section

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

**Content Type-Specific Editors:**

The Editor Panel shows different UI based on the lesson type:

| Type | Editor UI | Purpose |
|------|-----------|---------|
| **📄 Article** | Full WYSIWYG Markdown editor | Text-based lessons with formatting |
| **🎥 Video** | URL input + preview + notes | Embed YouTube/Vimeo videos |
| **💻 Exercise** | Instructions + starter code block | Hands-on coding tasks |
| **❓ Quiz** | Quiz selector + "Open Quiz Builder" button | Link to existing quiz |
| **📁 Resource** | File upload + resource selector | Downloadable files |

**Article Editor - Toolbar Commands:**
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

**Quiz Editor - Integration:**
- Dropdown shows all published quizzes for the module
- Selecting a quiz saves `quizConfigId` to the lesson
- "Open Quiz Builder" button opens quiz builder in new tab
- Students see the linked quiz when they reach this step

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

## 🔧 Server Actions (Enhanced v1.9.6)

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

### 4. `createLesson(admin, input)` (Enhanced v1.9.6)

**Purpose:** Create new lesson with full metadata support

**Parameters:**
```typescript
{
  moduleId: string;
  title: string;
  description?: string;
  lessonType: "video" | "article" | "exercise" | "quiz" | "resource";
  orderIndex?: number;
  sectionId?: string | null;
  materialId?: string | null;
  resourceId?: string | null;
  quizConfigId?: string | null;
  durationMinutes: number;
  isPreview?: boolean;
}
```

**Features:**
- Auto-generates `orderIndex` if not provided (gets max + 1)
- Validates all fields with Zod schema
- Supports optional `sectionId` for section assignment
- Handles null values for optional relationships
- Logs admin action with lesson details
- Returns lesson ID for immediate UI update

**Returns:** `{ success: boolean; id?: string; error?: string; redirect?: string }`

### 5. `updateLesson(admin, lessonId, input)` (Enhanced v1.9.6)

**Purpose:** Update lesson metadata independently of content

**Parameters:**
```typescript
{
  title?: string;
  description?: string;
  lessonType?: "video" | "article" | "exercise" | "quiz" | "resource";
  orderIndex?: number;
  sectionId?: string | null;
  materialId?: string | null;
  resourceId?: string | null;
  quizConfigId?: string | null;
  durationMinutes?: number;
  isPreview?: boolean;
}
```

**Features:**
- Updates only provided fields (partial update)
- Validates with Zod schema
- Logs admin action with old/new values
- Revalidates learning module paths
- Does not modify lesson content (use `saveStepContent` instead)

**Returns:** `{ success: boolean; error?: string }`

### 6. `deleteLesson(admin, lessonId)` (Enhanced v1.9.6)

**Purpose:** Delete lesson with safety checks

**Features:**
- Validates lesson exists before deletion
- Logs admin action with deleted lesson details
- Revalidates learning module paths
- Cascades to dependent data via database constraints

**Returns:** `{ success: boolean; error?: string }`

### 7. `reorderLessons(admin, moduleId, lessonIds)` (Enhanced v1.9.6)

**Purpose:** Reorder lessons within a module

**Parameters:**
```typescript
[
  "lesson-id-1",
  "lesson-id-2",
  "lesson-id-3",
  // ... ordered lesson IDs
]
```

**Features:**
- Updates `order_index` for each lesson in array
- Parallel updates for performance
- Validates all updates succeeded
- Logs admin action with reorder details
- Revalidates learning module paths

**Returns:** `{ success: boolean; error?: string }`

### 8. Section Management Actions (New v1.9.6)

**`createSection(admin, moduleId, title)`**
- Creates new section with auto-generated order
- Returns section ID for immediate UI update
- Logs admin action

**`updateSection(admin, sectionId, { title })`**
- Updates section title only
- Prevents editing default section
- Logs admin action

**`deleteSection(admin, sectionId)`**
- Validates section has no lessons
- Deletes section with safety checks
- Logs admin action

## 🎨 Enhanced State Management (v1.9.6)

### Optimistic UI Updates

The Flow Builder uses optimistic updates to provide instant feedback while ensuring data consistency with the server.

**Pattern:**
```typescript
// 1. Perform optimistic local update
setLessons((prev) => [...prev, newLesson]);

// 2. Call server action
const result = await createLesson(admin, lessonInput);

// 3. Handle success/error
if (result.success) {
  toast.success("Step created successfully");
} else {
  toast.error("Failed to create step", { description: result.error });
  // Error handling or router.refresh() to sync state
}

// 4. Ensure consistency with router.refresh()
router.refresh();
```

**Benefits:**
- Instant UI feedback (no loading delays)
- Better user experience
- Graceful error handling
- Automatic data synchronization

### State Management for Lessons

**Lesson State:**
```typescript
const [lessons, setLessons] = useState<ModuleLesson[]>(initialLessons);
const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
const [editorContent, setEditorContent] = useState(initialLessonContent ?? "");
const [isSaving, setIsSaving] = useState(false);
const [lastSaved, setLastSaved] = useState<string | null>(null);
```

**Lesson Update Pattern:**
```typescript
// Direct update (optimistic)
setLessons((prev) =>
  prev.map((lesson) =>
    lesson.id === lessonId
      ? { ...lesson, ...newData }
      : lesson
  )
);

// Or append new lesson
setLessons((prev) => [...prev, newLesson]);

// Or remove lesson
setLessons((prev) => prev.filter((l) => l.id !== lessonId));
```

### State Management for Sections

**Section State:**
```typescript
const [sections, setSections] = useState<Section[]>(initialSections);
```

**Section Update Pattern:**
```typescript
// Add section
setSections((prev) => [
  ...prev,
  {
    id: newSectionId,
    moduleId,
    title: newSectionTitle.trim(),
    lessons: [],
  },
]);

// Update section
setSections((prev) =>
  prev.map((s) =>
    s.id === sectionId
      ? { ...s, title: editSectionTitle.trim() }
      : s
  )
);

// Delete section with validation
setSections((prev) => {
  const section = prev.find((s) => s.id === sectionId);
  if (section && section.lessons.length > 0) {
    toast.error("Cannot delete section with lessons");
    return prev;
  }
  return prev.filter((s) => s.id !== sectionId);
});
```

### Section-Lesson Sync

**Automatic Sync:**
```typescript
// Sync sections when lessons change (from router.refresh)
useEffect(() => {
  setSections((prev) => {
    if (prev.length === 0) return prev;
    
    return prev.map((section, index) => {
      // For first section OR default section, also show lessons with null sectionId
      const isFirstSection = index === 0 || section.id === "default";
      const matchingLessons = isFirstSection
        ? lessons.filter((l) => l.sectionId === null || l.sectionId === section.id)
        : lessons.filter((l) => l.sectionId === section.id);
      
      return {
        ...section,
        lessons: matchingLessons,
      };
    });
  });
}, [lessons]);
```

This ensures sections always display the correct lessons even when lessons are added, removed, or reordered.

### Dialog State Management

**Multiple Independent Dialog States:**
```typescript
// Add Step Dialog
const [addStepOpen, setAddStepOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);

// Edit Step Dialog
const [editStepOpen, setEditStepOpen] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);

// Delete Confirmation Dialog
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Section Dialogs
const [addSectionOpen, setAddSectionOpen] = useState(false);
const [editSectionOpen, setEditSectionOpen] = useState(false);
```

**Dialog Open/Close Pattern:**
```typescript
// Open with form reset
const openAddStep = useCallback((sectionId: string) => {
  resetAddStepForm(sectionId);
  setAddStepOpen(true);
}, [resetAddStepForm]);

// Close with cleanup
const closeAddStep = useCallback(() => {
  setAddStepOpen(false);
  resetAddStepForm();
}, [resetAddStepForm]);
```

### Error Handling & Loading States

**Loading State Pattern:**
```typescript
const [isCreating, setIsCreating] = useState(false);

const handleAddStep = useCallback(async () => {
  setIsCreating(true); // Start loading
  try {
    const result = await createLesson(admin, lessonInput);
    if (result.success) {
      toast.success("Step created successfully");
      setAddStepOpen(false);
    } else {
      toast.error("Failed to create step", { description: result.error });
    }
  } finally {
    setIsCreating(false); // Always end loading
  }
}, [admin, lessonInput]);
```

**Error Toast Pattern:**
```typescript
toast.error("Failed to create step", {
  description: result.error, // Shows detailed error message
});

toast.error("Section title is required", {
  description: "Please enter a title for your section",
});
```

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

## 📂 Sections Support

### What Are Sections?

Sections allow you to group lessons into logical chapters/modules within a learning module. For example:

```
📘 1. Getting Started
   ├─ Welcome & Expectations
   ├─ Setting up workspace
   └─ Checkpoint: Environment

📘 2. Communication Basics
   ├─ Async principles
   ├─ Tools of the trade
   └─ Exercise: Async update

📘 3. Advanced Topics
   └─ (empty - add lessons here)
```

### Database Schema

**Migration:** `022_add_module_sections.sql`

```sql
CREATE TABLE module_sections (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES learning_modules(id),
  title TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

ALTER TABLE module_lessons ADD COLUMN section_id UUID REFERENCES module_sections(id);
```

### How to Use Sections

**Add Section:**
1. Click `[+ Add Section]` at bottom of Curriculum Panel
2. Enter section title in dialog
3. Click "Add Section" → Saves to database
4. New empty section appears

**Edit/Rename Section:**
1. Click section menu (⋮) on section header
2. Click "Rename Section"
3. Dialog opens with current title pre-filled
4. Edit the title as needed
5. Click "Save Changes" → Updates immediately
6. Toast confirms: "Section updated"
7. Curriculum Panel reflects new title instantly

**Delete Section:**
1. Click section menu (⋮) on section header
2. Click "Delete Section"
3. Confirm deletion
4. **Note:** Cannot delete sections with lessons (move lessons first)

**Default Section ("Getting Started"):**
- Created automatically when no sections exist
- Cannot be edited or deleted (protected)
- Attempting to edit shows error toast
- Once you add custom sections, the default is replaced

**Add Lesson to Specific Section:**
1. Click `[+ Add Step]` in desired section
2. Dialog opens with section pre-selected
3. Fill in lesson details
4. Lesson added to that section

### Section Management Server Actions (v1.9.6)

**`createSection(admin, moduleId, title)`**
- Creates new section with auto-generated order_index
- Validates section title is not empty
- Returns section ID for immediate UI update
- Logs admin action to audit trail

**`updateSection(admin, sectionId, { title })`**
- Updates section title only
- Prevents editing default section via validation
- Returns success/error status
- Revalidates learning module paths

**`deleteSection(admin, sectionId)`**
- Validates section has no lessons before deletion
- Removes section and associated data
- Returns success/error status
- Revalidates learning module paths

### Section State Management (v1.9.6)

```typescript
// Local state for immediate UI updates
const [sections, setSections] = useState<Section[]>(initialSections);

// Add section - optimistic update
setSections((prev) => [
  ...prev,
  {
    id: newSectionId,
    moduleId,
    title: newSectionTitle.trim(),
    lessons: [],
  },
]);

// Update section - immediate reflection
setSections((prev) =>
  prev.map((s) =>
    s.id === sectionId
      ? { ...s, title: editSectionTitle.trim() }
      : s
  )
);

// Delete section - validation + removal
setSections((prev) => {
  const section = prev.find((s) => s.id === sectionId);
  if (section && section.lessons.length > 0) {
    toast.error("Cannot delete section with lessons");
    return prev;
  }
  toast.success("Section deleted");
  return prev.filter((s) => s.id !== sectionId);
});
```

### Enhanced Dialog System (v1.9.6)

**Multiple Dedicated Dialogs:**
- **Add Step Dialog** (`addStepOpen`) — Create lessons with section selection
- **Edit Step Dialog** (`editStepOpen`) — Update lesson metadata independently of content
- **Delete Confirmation Dialog** (`deleteDialogOpen`) — Safety dialog before destructive actions
- **Add Section Dialog** (`addSectionOpen`) — Create new sections with title validation
- **Edit Section Dialog** (`editSectionOpen`) — Rename sections with instant UI updates

**Dialog Features:**
- Auto-focus on primary input field
- Loading states during async operations
- Disabled buttons during operations
- Proper form validation
- Section dropdown only shows when multiple sections exist
- Local state updates for instant feedback
- Toast notifications for success/error states

**State Management:**
```typescript
// Add Step Dialog
const [addStepOpen, setAddStepOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);
const [newStepTitle, setNewStepTitle] = useState("");
const [newStepType, setNewStepType] = useState<LessonType>("article");

// Edit Step Dialog  
const [editStepOpen, setEditStepOpen] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);
const [editingLesson, setEditingLesson] = useState<ModuleLesson | null>(null);

// Delete Confirmation Dialog
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// Section Dialogs
const [addSectionOpen, setAddSectionOpen] = useState(false);
const [editSectionOpen, setEditSectionOpen] = useState(false);
const [isCreatingSection, setIsCreatingSection] = useState(false);
const [isUpdatingSection, setIsUpdatingSection] = useState(false);
```

---

## 📝 How-To Guides

### How to Create a New Lesson (Enhanced v1.9.6)

1. Open Flow Builder for a module
2. In Curriculum Panel, click `[+ Add Step]` in desired section
3. "Add New Step" dialog opens with section pre-selected
4. Fill in step details:
   - **Step Title** (required): Enter lesson title
   - **Description** (optional): Brief description of the lesson
   - **Section**: Target section for the lesson (dropdown shows if multiple sections exist)
   - **Lesson Type**: Choose from Article, Video, Exercise, Quiz, Resource
   - **Duration** (min): Estimated completion time
5. Click "Add Step" button
6. **Backend**: Creates lesson via `createLesson()` server action
7. **UI**: Lesson appears immediately in curriculum panel under selected section
8. Toast confirms: "Step created successfully"
9. Router refresh ensures data consistency

**Section Selection Behavior:**
- If only one section exists: No dropdown shown, lesson automatically assigned
- If multiple sections exist: Dropdown appears, user can select target section
- First section is pre-selected by default

**Lesson Type Selection:**
- Each type has distinct icon and color coding
- **Article** (FileText, violet): Text-based content with Markdown support
- **Video** (Video, blue): Video content with URL input and preview
- **Exercise** (Code, amber): Coding exercises with starter code blocks
- **Quiz** (HelpCircle, rose): Quiz integration with existing quiz selection
- **Resource** (FileBox, teal): Downloadable resources and files

### How to Edit Lesson Details (New v1.9.6)

1. Click context menu (⋮) on lesson in Curriculum Panel
2. Select "Edit" from dropdown
3. "Edit Step" dialog opens with current lesson data pre-filled
4. Update lesson details:
   - **Step Title**: Modify lesson title
   - **Description**: Update or add description
   - **Lesson Type**: Change lesson type (if needed)
   - **Duration**: Update estimated completion time
5. Click "Update Step" button
6. **Backend**: Updates lesson via `updateLesson()` server action
7. **UI**: Lesson updates immediately in curriculum panel
8. Toast confirms: "Step updated successfully"
9. Router refresh ensures server data consistency

**What Can Be Edited:**
- Lesson title and description
- Lesson type (changes icon and editor panel behavior)
- Duration in minutes
- Section assignment (via delete and re-add to different section)

**What Cannot Be Edited:**
- Lesson order (use drag-and-drop instead)
- Lesson content (use Editor Panel instead)
- Preview flag (use Properties Panel instead)
- Quiz/resource assignment (use Properties Panel instead)

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

### How to Link a Quiz to a Lesson

**Prerequisite:** Create quiz in Quiz Builder first (`/admin/learning/[id]/quiz`)

1. In Flow Builder, add step with type "Quiz"
2. In Editor Panel, see "Select Quiz" dropdown
3. Choose existing quiz from list
4. Quiz automatically linked to lesson (saves `quizConfigId`)
5. Toast: "Quiz linked to lesson"

**Alternative:** Click "Open Quiz Builder" button to create new quiz in new tab, then return and select it

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

### ✅ Implemented Features (Updated v1.9.6)
- ✅ Three-panel layout with auto-save
- ✅ Drag-and-drop lesson reordering
- ✅ **Section support (complete CRUD)** — add/edit/delete sections, assign lessons
- ✅ **Section assignment in step dialog** — Choose target section during creation
- ✅ **Multiple dedicated dialogs** — Separate dialogs for each action type
- ✅ **Enhanced dialog system** — Add/Edit step, section management, delete confirmation
- ✅ **Optimistic UI updates** — Instant feedback with server sync
- ✅ **Enhanced state management** — Better handling of lessons and sections
- ✅ **Default section protection** — Cannot edit/delete default section
- ✅ **Section-lessons sync** — Automatic synchronization between sections and lessons
- ✅ **Loading states** — Proper loading indicators for all async operations
- ✅ **Error handling** — Graceful error handling with toast notifications
- ✅ Different editors per lesson type (Article, Video, Exercise, Quiz, Resource)
- ✅ Quiz integration (link existing quiz to lesson)
- ✅ Confirmation dialogs for destructive actions
- ✅ Preview button opens public page in new tab
- ✅ Publish workflow with confirmation
- ✅ **Enhanced lesson editing** — Edit step metadata via dedicated dialog
- ✅ **Section selection dropdown** — Shows only when multiple sections exist

### Current Limitations
- [ ] Video URL validation — Doesn't validate YouTube/Vimeo URLs
- [ ] Resource file upload — UI placeholder, needs File Manager integration
- [ ] Cross-section drag-and-drop — Shows toast, full move requires backend update
- [ ] Required Step toggle — Not yet enforced on public pages
- [ ] Allow Comments toggle — Discussion board not implemented
- [ ] Content type changes — Changing lesson type after creation doesn't update editor

### Future Enhancements
- [ ] Drag lessons between sections (full cross-section move)
- [ ] Bulk lesson operations (duplicate, delete multiple)
- [ ] Lesson templates (pre-built content structures)
- [ ] Content versioning (track content history)
- [ ] Image upload to Supabase Storage
- [ ] Embed support (YouTube, Loom, Figma)
- [ ] Lesson prerequisites (lock lessons until previous completed)
- [ ] Import/Export module content (JSON/Markdown)

---

## 🧪 Testing Checklist (Enhanced v1.9.6)

### Manual Testing
- [ ] Create new module → Open Flow Builder → Add 3 lessons → Reorder → Verify order persists
- [ ] Edit lesson content → Wait 2s → Check "Saved" indicator → Refresh page → Verify content persists
- [ ] Change lesson title in Properties → Blur input → Verify title updates in Curriculum Panel
- [ ] Delete lesson → Confirm deletion → Verify lesson removed from list
- [ ] Click Publish → Verify module status changes to "published"
- [ ] Check admin_actions table → Verify all actions logged

### Section Management Testing (New)
- [ ] Add new section → Verify section appears in curriculum panel
- [ ] Edit section title → Verify title updates instantly
- [ ] Try to edit default section → Verify error toast shows
- [ ] Try to delete default section → Verify error toast shows
- [ ] Delete empty section → Verify section removed successfully
- [ ] Try to delete section with lessons → Verify error toast shows
- [ ] Create lesson in specific section → Verify lesson appears under correct section
- [ ] Verify section dropdown only shows when multiple sections exist
- [ ] Create section with empty title → Verify validation error shows

### Dialog System Testing (New)
- [ ] Open add step dialog → Verify form fields are empty/reset
- [ ] Try to create lesson without title → Verify validation error shows
- [ ] Create lesson → Verify lesson appears immediately with optimistic update
- [ ] Open edit step dialog → Verify current data is pre-filled
- [ ] Edit lesson type → Verify icon and content update appropriately
- [ ] Delete lesson → Verify confirmation dialog shows proper warnings
- [ ] Cancel operations → Verify dialogs close without changes
- [ ] Verify loading states show during async operations
- [ ] Verify buttons are disabled during operations

### Edge Cases
- [ ] Open builder for module with no lessons → Verify empty state shows
- [ ] Select lesson with no material → Verify empty editor shows
- [ ] Rapid typing → Verify auto-save debounces correctly
- [ ] Network error during save → Verify error handling (future: show error toast)
- [ ] Multiple rapid operations → Verify optimistic updates handle correctly
- [ ] Edit lesson while saving content → Verify no conflicts occur

---

## 🏗️ Enhanced Architecture & Patterns (v1.9.6)

### Optimistic Update Pattern

The Flow Builder uses optimistic updates to provide instant user feedback while ensuring data consistency.

**Key Principles:**
1. **Immediate UI Response** — Update state first, then call server
2. **Error Recovery** — If server fails, show error toast and optionally revert
3. **Data Consistency** — Always call `router.refresh()` after operations
4. **User Experience** — Show loading states during async operations

**Example:**
```typescript
const handleAddStep = useCallback(async () => {
  if (!newStepTitle.trim()) {
    toast.error("Step title is required");
    return;
  }

  setIsCreating(true); // Show loading
  try {
    const result = await createLesson(admin, lessonInput);
    if (result.success) {
      // Optimistic: Update local state immediately
      setLessons((prev) => [...prev, newLesson]);
      toast.success("Step created successfully");
      setAddStepOpen(false);
      resetAddStepForm();
      
      // Ensure server consistency
      router.refresh();
    } else {
      toast.error("Failed to create step", { description: result.error });
    }
  } finally {
    setIsCreating(false); // Always end loading
  }
}, [admin, lessonInput, router, resetAddStepForm]);
```

### Dialog System Architecture

The Flow Builder uses a multi-dialog system for different operations.

**Dialog Types:**
1. **Add Step Dialog** — Create new lessons with full metadata
2. **Edit Step Dialog** — Update existing lesson metadata
3. **Delete Confirmation Dialog** — Safety check before destructive actions
4. **Add Section Dialog** — Create new sections
5. **Edit Section Dialog** — Rename existing sections

**Dialog Pattern:**
```typescript
// State management
const [dialogOpen, setDialogOpen] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);
const [formData, setFormData] = useState(initialFormData);

// Open dialog with reset
const openDialog = useCallback(() => {
  setFormData(initialFormData);
  setDialogOpen(true);
}, []);

// Handle submit
const handleSubmit = useCallback(async () => {
  setIsProcessing(true);
  try {
    const result = await serverAction(formData);
    if (result.success) {
      toast.success("Operation completed");
      setDialogOpen(false);
    } else {
      toast.error("Operation failed", { description: result.error });
    }
  } finally {
    setIsProcessing(false);
  }
}, [formData]);

// Dialog UI
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    
    {/* Form fields */}
    <div className="grid gap-4 py-4">
      <Label>Field</Label>
      <Input value={formData.field} onChange={(e) => setFormData({...formData, field: e.target.value})} />
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isProcessing}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={isProcessing || !isValid}>
        {isProcessing ? <Loader2 className="animate-spin" /> : "Submit"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Section Management Architecture

**Section-Lesson Relationship:**
- Lessons belong to sections via `section_id` foreign key
- First section or "default" section shows lessons with `section_id = null`
- Sections maintain their own lesson lists for UI display
- Automatic sync when lessons change

**Data Flow:**
```typescript
// 1. Server provides initial data
const initialLessons = await getLessonsByModuleId(moduleId);
const initialSections = await getSectionsByModuleId(moduleId);

// 2. Group lessons into sections locally
const [sections, setSections] = useState<Section[]>(initialSections);
const [lessons, setLessons] = useState<ModuleLesson[]>(initialLessons);

// 3. Sync sections when lessons change
useEffect(() => {
  setSections((prev) => {
    return prev.map((section, index) => {
      const isFirstSection = index === 0 || section.id === "default";
      const matchingLessons = isFirstSection
        ? lessons.filter((l) => l.sectionId === null || l.sectionId === section.id)
        : lessons.filter((l) => l.sectionId === section.id);
      
      return { ...section, lessons: matchingLessons };
    });
  });
}, [lessons]);

// 4. Update lesson (affects section membership)
await updateLesson(admin, lessonId, { sectionId: newSectionId });
setLessons((prev) => 
  prev.map((l) => l.id === lessonId ? { ...l, sectionId: newSectionId } : l)
);
```

### Error Handling Strategy

**Multi-Level Error Handling:**

1. **Client-Side Validation** — Immediate feedback before server calls
   ```typescript
   if (!newStepTitle.trim()) {
     toast.error("Step title is required");
     return;
   }
   ```

2. **Server-Side Validation** — Zod schema validation in server actions
   ```typescript
   const validated = lessonSchema.parse(input);
   ```

3. **Database Errors** — Handle database constraint violations
   ```typescript
   if (error) {
     console.error("[createLesson] Database error:", error);
     return { success: false, error: error.message };
   }
   ```

4. **User Feedback** — Toast notifications for all error states
   ```typescript
   toast.error("Failed to create step", {
     description: result.error,
   });
   ```

### Performance Optimizations

**1. Local State Management:**
- Immediate UI updates without waiting for server
- Reduced perceived latency
- Better user experience

**2. Debounced Auto-Save:**
- 2-second debounce for content changes
- Prevents excessive server calls during rapid typing
- Visual feedback with "Saved just now" indicator

**3. Optimistic Updates:**
- UI updates immediately on user actions
- Server requests happen in background
- Error recovery with toast notifications

**4. Router Refresh:**
- Ensures data consistency after mutations
- Only called when needed (after successful operations)
- Maintains local state for instant feedback

---

## 📚 Related Documentation

- [Learning Module Overview](../features/learning-module/overview.md)
- [Learning Module Revamp v1.7.0](./learning-module-revamp.md)
- [Database Schema](../architecture/database.md)
- [RLS Policies](./rls-policies.md)
- [Admin Action Logging](./admin-action-logging.md)

---

**Last Updated:** April 15, 2026  
**Version:** v1.9.6  
**Maintained By:** Development Team
