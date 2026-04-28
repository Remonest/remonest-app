# Learning Player Implementation Guide

**Version:** v1.0.0
**Created:** April 28, 2026
**Status:** ✅ Complete

## Overview

The Learning Player is a step-by-step interface that allows users to progress through learning modules lesson by lesson. It implements manual progress tracking where users mark lessons as completed, and the system automatically calculates overall module progress.

---

## 🗄️ Database Changes

### Migration 028: User Lesson Progress Tracking

**File:** `supabase/migrations/028_add_user_lesson_progress.sql`

#### New Table: `user_lesson_progress`

Tracks individual lesson completion for users:

```sql
CREATE TABLE user_lesson_progress (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id),
  lesson_id     UUID REFERENCES module_lessons(id),
  module_id     UUID REFERENCES learning_modules(id),
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

**Key Features:**
- One row per completed lesson per user
- Unique constraint prevents duplicate completions
- Automatic timestamp tracking
- Cascading deletes when user/lesson/module is deleted

#### New Functions

**`calculate_module_progress(p_user_id, p_module_id)`**
- Calculates module progress as percentage based on completed lessons
- Formula: `(completed_lessons / total_lessons) * 100`
- Returns 0 if module has no lessons

**`update_module_progress_from_lessons()`**
- Trigger function that runs when a lesson is marked complete
- Automatically updates `user_learning_progress` table
- Sets `completed_at` when progress reaches 100%
- Maintains overall module progress in sync with lesson completions

**`get_user_completed_lesson_ids(p_user_id, p_module_id)`**
- Returns array of completed lesson IDs for a user in a module
- Used by frontend to determine lesson states

#### RLS Policies

- **Users:** Can view, insert, and delete their own lesson progress
- **Admins:** Full access to all lesson progress
- **Public:** No access (must be authenticated)

---

## 🎯 User Flow

### 1. Start Learning

```
User visits /learning/[slug]
  ↓
Clicks "Mulai Belajar" button
  ↓
Redirected to /learning/[slug]/player
  ↓
Auto-enrolled in module (if not already)
  ↓
Shows first incomplete lesson
```

### 2. Lesson Player Interface

```
┌─────────────────────────────────────────────────┐
│ Header: Module Title | Progress: 42% | Actions  │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │ Main Content Area                   │
│          │                                      │
│ Lesson 1 │ Lesson Title                         │
│ ✓ Done   │ Description                          │
│          │                                      │
│ Lesson 2 │ [Video Player / PDF Viewer]         │
│ ✓ Done   │                                      │
│          │ [Article Content]                   │
│ Lesson 3 │                                      │
│ ○ Active │ [Mark as Complete Button]            │
│          │                                      │
│ Lesson 4 │                                      │
│ 🔒 Locked│                                      │
│          │                                      │
│ Lesson 5 │                                      │
│ 🔒 Locked│                                      │
└──────────┴──────────────────────────────────────┘
│ Footer: [Previous] [Progress Saved] [Next]     │
└─────────────────────────────────────────────────┘
```

### 3. Complete Lesson

```
User reads/watches lesson content
  ↓
Clicks "Mark as Complete" button
  ↓
Server action: markLessonCompleted()
  ↓
Inserts row into user_lesson_progress
  ↓
Trigger fires: update_module_progress_from_lessons()
  ↓
Calculates new module progress
  ↓
Updates user_learning_progress table
  ↓
UI refreshes: Lesson marked complete, progress updated
  ↓
Next lesson unlocks (if sequential)
```

### 4. Navigate Between Lessons

**Sidebar Navigation:**
- Click any lesson to view it
- Locked lessons (🔒) cannot be accessed
- Completed lessons (✓) show green checkmark
- Active lesson (○) shows blue dot

**Footer Navigation:**
- **Previous:** Go to previous lesson
- **Next:** Go to next lesson (disabled on last lesson)

**Mobile Navigation:**
- Hamburger menu opens sidebar
- Swipe/overlay to close sidebar
- Compact step indicator in header

---

## 🏗️ Architecture

### File Structure

```
src/
├── app/(main)/learning/[slug]/player/
│   ├── page.tsx              # Server component (data fetching)
│   └── player-client.tsx     # Main client component (UI + state)
├── features/learning-module/
│   ├── actions/
│   │   ├── lesson-progress.ts  # Lesson progress server actions
│   │   └── fetch-learning.ts   # Added getMaterialsByModuleId()
│   └── components/
│       └── EnrollButton.tsx    # Updated to link to player
└── supabase/migrations/
    └── 028_add_user_lesson_progress.sql
```

### Component Hierarchy

```
LearningPlayerPage (Server)
  └── LearningPlayerClient (Client)
      ├── Header
      │   ├── Breadcrumbs / Mobile Menu
      │   ├── Progress Pill
      │   └── Actions (Complete Toggle, Back Button)
      ├── Sidebar (Lesson Navigation)
      │   └── Lesson Items
      ├── Main Content
      │   ├── Lesson Header
      │   ├── Video Embed (if video)
      │   ├── PDF Viewer (if PDF)
      │   ├── Image Display (if image)
      │   ├── Article Content (if article)
      │   ├── Quiz Link (if quiz)
      │   └── Completion Indicator
      └── Footer
          ├── Previous Button
          ├── Progress Saved Indicator
          └── Next Button
```

---

## 📊 Data Flow

### Initial Load

```
1. Server Component (page.tsx)
   ↓
2. Fetch module data
   ↓
3. Fetch lessons for module
   ↓
4. Fetch materials for module
   ↓
5. Fetch completed lesson IDs for user
   ↓
6. Fetch current module progress
   ↓
7. Determine first incomplete lesson
   ↓
8. Pass all data to LearningPlayerClient
```

### Lesson Completion

```
1. User clicks "Mark as Complete"
   ↓
2. Client state updates (optimistic)
   ↓
3. Server action: markLessonCompleted(lessonId, moduleId)
   ↓
4. Insert into user_lesson_progress
   ↓
5. Database trigger fires
   ↓
6. Update user_learning_progress.progress
   ↓
7. Server returns success
   ↓
8. Client shows success toast
   ↓
9. router.refresh() re-fetches data
   ↓
10. UI updates with new progress
```

### Lesson Navigation

```
1. User clicks lesson in sidebar
   ↓
2. Check if lesson is locked
   ↓
3. If locked: Show visual feedback, prevent navigation
   ↓
4. If unlocked: Update activeLessonId state
   ↓
5. Scroll to top of content
   ↓
6. Render new lesson content
   ↓
7. Update completion checkbox state
```

---

## 🔌 Server Actions

### `getUserCompletedLessonIds(moduleId: string)`

**Purpose:** Get array of completed lesson IDs for current user

**Returns:** `string[]` - Array of lesson UUIDs

**Usage:**
```typescript
const completedIds = await getUserCompletedLessonIds(moduleId);
const isCompleted = completedIds.includes(lessonId);
```

---

### `markLessonCompleted(lessonId: string, moduleId: string)`

**Purpose:** Mark a lesson as completed for current user

**Parameters:**
- `lessonId`: UUID of the lesson to complete
- `moduleId`: UUID of the parent module

**Returns:** `{ success: boolean; message?: string; error?: string }`

**Behavior:**
- Inserts row into `user_lesson_progress`
- Unique constraint prevents duplicates
- Returns success with message if already completed
- Database trigger updates module progress automatically

---

### `unmarkLessonCompleted(lessonId: string, moduleId: string)`

**Purpose:** Remove lesson completion (undo functionality)

**Parameters:**
- `lessonId`: UUID of the lesson to unmark
- `moduleId`: UUID of the parent module

**Returns:** `{ success: boolean; error?: string }`

**Behavior:**
- Deletes row from `user_lesson_progress`
- Recalculates module progress via trigger
- Updates `user_learning_progress` table

---

### `getUserModuleProgress(moduleId: string)`

**Purpose:** Get current user's progress record for a module

**Returns:** Progress object or `null`

**Usage:**
```typescript
const progress = await getUserModuleProgress(moduleId);
const percentComplete = progress?.progress || 0;
const isCompleted = progress?.completed_at !== null;
```

---

## 🎨 UI Components

### Header

**Desktop:**
- Breadcrumb navigation: Module Title → Step X of Y
- Progress pill with circular progress indicator
- Complete toggle checkbox
- "Back to Module" button

**Mobile:**
- Hamburger menu button (opens sidebar)
- Step indicator: "Step 3/7"
- Close button (X)

### Sidebar

**Features:**
- Sticky navigation panel
- Lesson list with status indicators
- Type badges (Video, Article, Quiz, Resource)
- Duration display
- Active lesson highlighting
- Locked lesson prevention

**Lesson States:**
- ✅ **Completed:** Green checkmark, muted text
- ○ **Active:** Blue dot, bold text, left border
- ⚪ **Incomplete:** Empty circle, normal text
- 🔒 **Locked:** Lock icon, opacity 50%, no click

### Main Content

**Lesson Header:**
- Duration estimate
- Lesson title (H1)
- Description (subtitle)

**Content Types:**

**Video:**
- Responsive 16:9 iframe
- YouTube, Vimeo, Google Drive support
- Full-screen capability

**PDF:**
- `PDFCanvasViewer` component
- Page navigation
- Zoom controls
- Download option

**Image:**
- Max-height 600px display
- Object-contain fit
- Centered in container

**Article:**
- Markdown content rendering
- Custom lightweight parser
- Proper typography with Tailwind prose

**Quiz:**
- Special indicator card
- Link to `/learning/[slug]/quiz`
- "Start Quiz" button

**Completion Section:**
- Appears at end of non-quiz lessons
- Green checkmark icon
- Status message
- "Mark as Complete" button (if not completed)

### Footer

**Features:**
- "Previous" button (disabled on first lesson)
- "Progress Saved" indicator
- "Next" button (disabled on last lesson)

**Responsive:**
- Desktop: Full button text
- Mobile: Compact button text ("Back"/"Next")

---

## 🔐 Security

### Authentication
- All pages require authentication
- Unauthenticated users redirected to `/login`
- `next` parameter preserves intended destination

### Authorization
- Users can only view their own progress
- RLS policies enforce data isolation
- Admin access via `is_admin()` function

### Data Validation
- Server actions validate user authentication
- Database constraints prevent duplicates
- Cascade deletes maintain referential integrity

---

## 📱 Mobile Responsiveness

### Breakpoints

| Component | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| Header | Full breadcrumbs | Compact breadcrumbs | Menu button + step indicator |
| Sidebar | Visible (sticky) | Visible (sticky) | Hidden (toggle with overlay) |
| Footer | Full button text | Full button text | Compact button text |
| Content | 800px max-width | 100% width | 100% width |

### Mobile Features

- **Hamburger menu** to toggle sidebar
- **Overlay** when sidebar is open
- **Swipe-friendly** touch targets
- **Compact** step indicators
- **Full-screen** sidebar navigation

---

## 🧪 Testing Checklist

### Manual Testing

**Basic Flow:**
- [ ] Navigate to module detail page
- [ ] Click "Mulai Belajar"
- [ ] Verify redirect to `/learning/[slug]/player`
- [ ] Verify first lesson is displayed
- [ ] Verify sidebar shows lesson list
- [ ] Verify progress indicator shows 0%

**Lesson Completion:**
- [ ] Read/watch lesson content
- [ ] Click "Mark as Complete"
- [ ] Verify success toast appears
- [ ] Verify lesson shows checkmark
- [ ] Verify progress updates
- [ ] Verify next lesson unlocks

**Navigation:**
- [ ] Click previous lesson in footer
- [ ] Verify lesson content changes
- [ ] Click next lesson in footer
- [ ] Verify lesson content changes
- [ ] Click lesson in sidebar
- [ ] Verify lesson content changes
- [ ] Try to click locked lesson
- [ ] Verify lock prevents navigation

**Mobile:**
- [ ] Test on mobile device (<768px)
- [ ] Verify hamburger menu works
- [ ] Verify sidebar opens/closes correctly
- [ ] Verify overlay appears
- [ ] Verify content is readable
- [ ] Verify navigation buttons work

**Progress Persistence:**
- [ ] Complete a lesson
- [ ] Refresh the page
- [ ] Verify completion persists
- [ ] Verify progress persists
- [ ] Navigate away and back
- [ ] Verify all state persists

**Edge Cases:**
- [ ] Module with no lessons → Redirect to detail page
- [ ] Module with one lesson → Disable Next button
- [ ] Complete all lessons → Verify 100% progress
- [ ] Unmark completed lesson → Verify progress decreases
- [ ] Rapid navigation → Verify no errors

---

## 📝 Known Limitations

### Current Limitations

1. **Sequential Progress Only**
   - Lessons unlock in order (must complete previous)
   - No "free navigation" mode
   - Future: Add setting for linear vs. free navigation

2. **No Quiz Integration in Player**
   - Quiz lessons link to separate `/quiz` page
   - Quiz completion doesn't auto-mark lesson complete
   - Future: Embed quiz player directly in lesson

3. **No Lesson Prerequisites**
   - All lessons unlock sequentially by default
   - No complex prerequisite logic
   - Future: Add prerequisite system

4. **No Progress Recovery**
   - If user leaves mid-lesson, no resume point
   - Always starts at first incomplete lesson
   - Future: Add "Resume" feature

### Future Enhancements

- [ ] Lesson prerequisites (complex unlock logic)
- [ ] Free navigation mode
- [ ] Embedded quiz player
- [ ] Resume from last position
- [ ] Lesson notes/highlighting
- [ ] Download offline content
- [ ] Progress sharing/social features
- [ ] Instructor comments per lesson
- [ ] Lesson discussion forums
- [ ] Achievement badges per lesson

---

## 🔄 Integration with Existing System

### Compatibility

**Works with:**
- ✅ Existing `learning_modules` table
- ✅ Existing `module_lessons` table (Migration 018)
- ✅ Existing `learning_materials` table
- ✅ Existing `user_learning_progress` table
- ✅ Existing quiz system
- ✅ Existing certificate system

**No Breaking Changes:**
- ✅ Old module detail page still works
- ✅ Existing progress tracking still works
- ✅ Certificate generation unchanged
- ✅ Quiz system unchanged

**New Features:**
- ✅ Lesson-level progress tracking
- ✅ Automatic module progress calculation
- ✅ Step-by-step learning interface
- ✅ Mobile-responsive design

---

## 📚 Related Documentation

- [Learning Module Overview](./overview.md) - Main learning module docs
- [Flow Builder](../../guides/learning-module-flow-builder.md) - Admin lesson creation
- [Quiz Builder](./quiz-builder.md) - Quiz system
- [Certificate System](../../guides/certificate-download.md) - Certificate generation
- [Database Schema](../../architecture/database.md) - Complete database reference

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Progress not updating after marking complete

**Solution:**
1. Check if migration 028 is applied: `supabase db push`
2. Check browser console for errors
3. Verify user is authenticated
4. Check RLS policies: Users can insert own progress

**Issue:** Lessons not unlocking in order

**Solution:**
1. Check `completed_lesson_ids` array
2. Verify lesson order_index is correct
3. Check if trigger is firing: Look at `user_learning_progress` table

**Issue:** PDF viewer not showing

**Solution:**
1. Verify `file_url` is correct
2. Check if PDF is uploaded to Supabase Storage
3. Verify bucket RLS policies
4. Check browser console for CORS errors

**Issue:** Mobile sidebar not working

**Solution:**
1. Check if `isSidebarOpen` state is updating
2. Verify z-index values are correct
3. Test on actual mobile device (not just dev tools)

---

## 📊 Performance Considerations

### Database Queries

**Optimizations:**
- Indexed queries on `user_id`, `module_id`, `lesson_id`
- Composite index for user's module progress
- Efficient `get_user_completed_lesson_ids` function
- Parallel data fetching in server component

**Query Count per Page Load:**
- Module fetch: 1 query
- Lessons fetch: 1 query
- Materials fetch: 1 query
- Completed lessons: 1 query (via function)
- Module progress: 1 query
- **Total:** 5 queries

### Client-Side Performance

**Optimizations:**
- Optimistic UI updates (instant feedback)
- Debounced state updates
- Lazy loading of video iframes
- Efficient re-rendering with proper dependencies
- Minimal state management

---

## 🎓 Best Practices

### For Users

1. **Complete lessons in order** - Sequential learning builds knowledge
2. **Mark lessons complete** - Track your progress accurately
3. **Use desktop for complex content** - Better for PDFs and videos
4. **Take notes** - External notes help retention
5. **Review completed lessons** - Revisit difficult topics

### For Admins

1. **Create logical lesson order** - Build knowledge progressively
2. **Set appropriate durations** - Help users plan their time
3. **Use varied content types** - Mix videos, articles, and exercises
4. **Test lesson flow** - Verify sequential unlocking works
5. **Monitor completion rates** - Identify difficult lessons

---

**Last Updated:** April 28, 2026
**Maintained By:** Development Team
