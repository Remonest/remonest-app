# Flow Builder v1.9.6 Quick Reference

> **Last Updated:** April 15, 2026

## 🎯 What's New in v1.9.6

### Complete Section Management
- **Add Sections** — Create new sections to organize lessons
- **Edit Sections** — Rename existing sections via dialog
- **Delete Sections** — Remove empty sections with validation
- **Default Protection** — Cannot edit/delete default section
- **Section Assignment** — Assign lessons to specific sections during creation

### Enhanced Dialog System
- **Multiple Dedicated Dialogs** — Separate dialogs for each action type
- **Add Step Dialog** — Full lesson creation with section selection
- **Edit Step Dialog** — Update lesson metadata independently
- **Delete Confirmation** — Safety dialog before destructive actions
- **Section Dialogs** — Add and edit sections with validation

### Improved State Management
- **Optimistic Updates** — Instant UI feedback with server sync
- **Enhanced Error Handling** — Graceful error handling with toast notifications
- **Loading States** — Proper loading indicators for all operations
- **State Synchronization** — Automatic sync between sections and lessons

## 🚀 Quick Commands

### Adding Lessons
```bash
# Click "+ Add Step" in desired section
# Fill dialog fields:
# - Title (required)
# - Description (optional)
# - Section (dropdown if multiple sections)
# - Lesson Type (Article/Video/Exercise/Quiz/Resource)
# - Duration (minutes)
# Click "Add Step"
```

### Editing Lessons
```bash
# Click context menu (⋮) on lesson
# Select "Edit"
# Modify fields in dialog
# Click "Update Step"
```

### Managing Sections
```bash
# Add Section:
# Click "+ Add Section" at bottom
# Enter title and click "Add Section"

# Edit Section:
# Click section menu (⋮)
# Select "Rename Section"
# Edit title and click "Save Changes"

# Delete Section:
# Click section menu (⋮)
# Select "Delete Section"
# (Only works if section has no lessons)
```

### Deleting Lessons
```bash
# Click context menu (⋮) on lesson
# Select "Delete"
# Confirm in dialog
# Click "Delete Step"
```

## 📊 State Management Quick Reference

### Lesson State
```typescript
const [lessons, setLessons] = useState<ModuleLesson[]>([]);
const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
const [editorContent, setEditorContent] = useState("");
const [isSaving, setIsSaving] = useState(false);
const [lastSaved, setLastSaved] = useState<string | null>(null);
```

### Section State
```typescript
const [sections, setSections] = useState<Section[]>([]);
```

### Dialog States
```typescript
const [addStepOpen, setAddStepOpen] = useState(false);
const [editStepOpen, setEditStepOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [addSectionOpen, setAddSectionOpen] = useState(false);
const [editSectionOpen, setEditSectionOpen] = useState(false);
```

### Loading States
```typescript
const [isCreating, setIsCreating] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

## 🎨 UI Patterns

### Optimistic Update Pattern
```typescript
// 1. Update local state immediately
setLessons((prev) => [...prev, newLesson]);

// 2. Call server action
const result = await createLesson(admin, input);

// 3. Handle result
if (result.success) {
  toast.success("Lesson created");
  router.refresh(); // Ensure consistency
} else {
  toast.error("Failed to create lesson", { description: result.error });
}
```

### Dialog Pattern
```typescript
const [dialogOpen, setDialogOpen] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);

const handleSubmit = async () => {
  setIsProcessing(true);
  try {
    const result = await serverAction(formData);
    if (result.success) {
      toast.success("Success");
      setDialogOpen(false);
    }
  } finally {
    setIsProcessing(false);
  }
};
```

## 🔧 Server Actions

### Lesson Management
- `createLesson(admin, input)` — Create new lesson
- `updateLesson(admin, lessonId, input)` — Update lesson metadata
- `deleteLesson(admin, lessonId)` — Delete lesson
- `reorderLessons(admin, moduleId, lessonIds)` — Reorder lessons

### Section Management
- `createSection(admin, moduleId, title)` — Create new section
- `updateSection(admin, sectionId, { title })` — Rename section
- `deleteSection(admin, sectionId)` — Delete empty section

### Content Management
- `saveStepContent(admin, lessonId, content)` — Save lesson content
- `publishModule(admin, moduleId)` — Publish module

## 🎯 Quick Tips

### Section Management
- Create sections first, then add lessons to organize content
- Use descriptive section titles (e.g., "Getting Started", "Advanced Topics")
- Cannot delete sections with lessons (move lessons first)
- Default section is protected from editing/deletion

### Lesson Creation
- Use section dropdown to assign lessons to specific sections
- All lesson types support (Article, Video, Exercise, Quiz, Resource)
- Duration helps students plan their learning time
- Section dropdown only shows when multiple sections exist

### Performance Tips
- Changes save automatically after 2 seconds (auto-save)
- Use "Save Draft" button for manual save
- UI updates immediately with optimistic updates
- Router refresh ensures data consistency

### Error Handling
- All operations show toast notifications for success/error
- Form validation happens before server calls
- Loading states prevent duplicate operations
- Graceful error recovery with detailed error messages

## 🐛 Troubleshooting

### Common Issues

**Issue:** Section not showing in dropdown
**Solution:** Create more than one section first

**Issue:** Cannot delete section
**Solution:** Move all lessons to another section first

**Issue:** Cannot edit default section
**Solution:** This is expected behavior. Default section is protected.

**Issue:** Changes not persisting
**Solution:** Check for error toasts. Network issues may prevent saving.

**Issue:** Lesson content not saving
**Solution:** Wait for "Saved just now" indicator. Auto-save has 2-second debounce.

## 📚 Related Documentation

- [Flow Builder Complete Guide](./learning-module-flow-builder.md) — Complete v1.9.6 documentation
- [Learning Module Overview](../features/learning-module/overview.md) — System overview
- [Admin Learning Architecture](./admin-learning-architecture.md) — Why pages are separate

---

**Version:** v1.9.6  
**Last Updated:** April 15, 2026  
**Maintained By:** Development Team