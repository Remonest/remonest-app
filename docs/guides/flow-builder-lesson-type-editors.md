# Flow Builder - Lesson Type Editors (v1.9.5)

> **Date:** April 14, 2026  
> **Purpose:** Different editor UIs for each lesson type in Flow Builder

---

## 📋 Overview

The Flow Builder now shows **different editor interfaces** based on the lesson type selected. This makes it easier for admins to create the right type of content for each step.

---

## 🎨 Lesson Type Editors

### **1. Article (📄 FileText)**

**Purpose:** Text-based lessons with markdown formatting

**Editor UI:**
- ✅ WYSIWYG Markdown toolbar (Bold, Italic, Headings, Lists, Links, Images, Code)
- ✅ Large textarea for content
- ✅ Auto-save support
- ✅ Undo/Redo buttons

**Use Case:**
- Reading materials
- Concept explanations
- Step-by-step guides
- Theoretical content

---

### **2. Video (🎥 Video)**

**Purpose:** Embed YouTube or Vimeo videos

**Editor UI:**
- ✅ URL input for video link
- ✅ Video preview placeholder (shows platform icon)
- ✅ URL validation (checks for youtube/vimeo)
- ✅ Optional notes textarea for additional instructions

**Use Case:**
- Tutorial videos
- Lecture recordings
- Demo walkthroughs
- Webinar replays

**Supported Platforms:**
- YouTube (`https://youtube.com/watch?v=...`)
- Vimeo (`https://vimeo.com/...`)

---

### **3. Exercise (💻 Code)**

**Purpose:** Hands-on coding or practice tasks

**Editor UI:**
- ✅ Instructions textarea (markdown supported)
- ✅ Starter code block (optional, with monospace font)
- ✅ Expected outcome field (optional)

**Use Case:**
- Coding challenges
- Practice exercises
- Hands-on tasks
- Skill-building activities

**Example:**
```
Instructions: "Create a function that calculates the factorial of a number"
Starter Code: "function factorial(n) {\n  // Your code here\n}"
Expected Outcome: "Student should be able to call factorial(5) and get 120"
```

---

### **4. Quiz (❓ HelpCircle)**

**Purpose:** Link to existing quiz assessments

**Editor UI:**
- ✅ Dropdown to select existing quiz
- ✅ Empty state if no quizzes exist
- ✅ "Open Quiz Builder" button to create new quiz
- ✅ Optional notes textarea for quiz instructions

**Use Case:**
- Knowledge checks
- Final assessments
- Progress evaluations
- Multiple-choice tests

**Workflow:**
1. Create quiz in "Kelola Kuis" page
2. Return to Flow Builder
3. Select quiz from dropdown
4. Add optional instructions for students

---

### **5. Resource (📁 FileBox)**

**Purpose:** Upload or link downloadable files

**Editor UI:**
- ✅ "Upload File" button (opens file upload dialog)
- ✅ Dropdown to select existing resource
- ✅ Empty state if no resources exist
- ✅ Optional description textarea

**Use Case:**
- PDF guides
- Templates
- Checklists
- Cheat sheets
- External tools

**Supported File Types:**
- PDFs
- Word documents
- Excel spreadsheets
- Images
- Any downloadable file

---

## 🔧 Implementation Details

### **File Modified**

`src/app/admin/learning/[id]/builder/editor-panel.tsx`

### **How It Works**

```tsx
// Editor Panel receives lesson type as prop
interface EditorPanelProps {
  lesson: ModuleLesson | null;
  // ... other props
}

// Renders different UI based on lesson type
const renderEditor = () => {
  switch (lesson.lessonType) {
    case "article":
      return renderArticleEditor();
    case "video":
      return renderVideoEditor();
    case "exercise":
      return renderExerciseEditor();
    case "quiz":
      return renderQuizEditor();
    case "resource":
      return renderResourceEditor();
    default:
      return renderArticleEditor();
  }
};
```

### **Content Loading**

When a lesson is selected, the builder loads appropriate content based on type:

```tsx
// Article/Exercise: Load markdown content
if (lesson.lessonType === "article" || lesson.lessonType === "exercise") {
  if (lesson.materialId) {
    const data = await fetch(`/api/learning/materials/${lesson.materialId}`);
    setEditorContent(data.content);
  }
}

// Video: Load source URL
else if (lesson.lessonType === "video") {
  if (lesson.materialId) {
    const data = await fetch(`/api/learning/materials/${lesson.materialId}`);
    setVideoUrl(data.source_url);
  }
}

// Quiz/Resource: Empty by default
else {
  setEditorContent("");
}
```

---

## 🧪 Testing Checklist

### Article Type
- [ ] Markdown toolbar works (Bold, Italic, Headings, Lists)
- [ ] Content auto-saves after 2 seconds
- [ ] Undo/Redo buttons function
- [ ] Placeholder text shows when empty

### Video Type
- [ ] URL input accepts YouTube/Vimeo links
- [ ] Shows appropriate platform icon (YouTube vs Vimeo)
- [ ] Shows error for invalid URLs
- [ ] Notes field accepts markdown

### Exercise Type
- [ ] Instructions textarea works
- [ ] Starter code block shows monospace font
- [ ] Expected outcome field saves
- [ ] All fields save to material content

### Quiz Type
- [ ] Dropdown shows existing quizzes
- [ ] Empty state shows when no quizzes
- [ ] "Open Quiz Builder" button visible
- [ ] Notes field for instructions

### Resource Type
- [ ] Upload button visible
- [ ] Dropdown shows existing resources
- [ ] Empty state shows when no resources
- [ ] Description field accepts text

---

## 🎯 User Flow by Type

### Creating an Article Lesson
1. Click "Add Step"
2. Set type to "Article"
3. Write markdown content in editor
4. Auto-saves after 2 seconds
5. Click next lesson or wait

### Creating a Video Lesson
1. Click "Add Step"
2. Set type to "Video"
3. Paste YouTube/Vimeo URL
4. Add optional notes
5. Auto-saves

### Creating an Exercise Lesson
1. Click "Add Step"
2. Set type to "Exercise"
3. Write instructions
4. Add starter code (optional)
5. Describe expected outcome
6. Auto-saves

### Creating a Quiz Lesson
1. Create quiz in "Kelola Kuis" first
2. Click "Add Step"
3. Set type to "Quiz"
4. Select quiz from dropdown
5. Add instructions (optional)
6. Auto-saves

### Creating a Resource Lesson
1. Upload file in File Manager
2. Click "Add Step"
3. Set type to "Resource"
4. Select resource from dropdown
5. Add description (optional)
6. Auto-saves

---

## 📊 Comparison Table

| Type | Editor Type | Auto-Save | Requires Material | Requires External |
|------|-------------|-----------|-------------------|-------------------|
| Article | Markdown editor | ✅ Yes | ✅ Yes | ❌ No |
| Video | URL input + notes | ✅ Yes | ✅ Yes | ✅ YouTube/Vimeo |
| Exercise | Instructions + code | ✅ Yes | ✅ Yes | ❌ No |
| Quiz | Quiz selector | ⚠️ Manual | ❌ No | ✅ Quiz config |
| Resource | File selector | ⚠️ Manual | ❌ No | ✅ File upload |

---

## 🚀 Future Enhancements

### Video
- [ ] Actual embedded preview (not just placeholder)
- [ ] Auto-extract video title from URL
- [ ] Support for Loom, Wistia, other platforms
- [ ] Video duration input

### Quiz
- [ ] Inline quiz creation (no need to go to separate page)
- [ ] Quiz preview in editor
- [ ] Passing score configuration

### Resource
- [ ] Direct file upload in editor
- [ ] File preview (PDF viewer, etc.)
- [ ] Download count tracking
- [ ] File size limit display

### Exercise
- [ ] Code syntax highlighting
- [ ] Test case runner
- [ ] Solution toggle (show/hide answer)
- [ ] Code execution (future)

---

**Last Updated:** April 14, 2026  
**Version:** v1.9.5  
**Status:** ✅ Implemented & Working
