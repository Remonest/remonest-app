# Quiz Configuration Guide for Admins

**Version:** v1.0.0  
**Date:** April 28, 2026

---

## 🎯 Overview: How Admins Configure Quizzes for Learning Modules

Admins can create and link quizzes to learning modules through a **two-step process**:

1. **Create Quiz** → Use Quiz Builder to create quiz with questions
2. **Link Quiz to Lesson** → Use Flow Builder to create a quiz-type lesson and select the quiz

---

## 📋 Complete Admin Workflow

### Step 1: Create a Quiz

**Route:** `/admin/learning/[id]/quiz`

1. Navigate to Admin → Learning
2. Find your module and click "⋮" (action menu)
3. Select "Kelola Kuis" (Manage Quiz)
4. You'll see the Quiz Builder interface

#### Quiz Builder Configuration

**Basic Settings:**
- **Judul Quiz** - Title of the assessment
- **Deskripsi** - Optional description for students
- **Durasi (menit)** - Time limit (0 = unlimited)
- **Nilai Kelulusan (%)** - Passing score (default: 70%)
- **Publikasikan Quiz** - Toggle to make available to students

**Adding Questions:**
1. Click "Tambah Pertanyaan" (Add Question)
2. Fill in question details:
   - **Teks Pertanyaan** - The question text
   - **Pilihan Jawaban** - 5 options (A, B, C, D, E)
   - **Jawaban Benar** - Select radio button for correct answer
   - **Penjelasan** - Optional explanation (shown after quiz)
   - **Tingkat Kesulitan** - Easy/Medium/Hard
3. Click "Simpan Quiz" to save

**Example Quiz Setup:**
```
Judul: Remote Working Basics Assessment
Durasi: 30 menit
Nilai Kelulusan: 70%
Publikasikan: ✓

Questions:
1. Apa itu async communication?
   A. Komunikasi sinkron
   B. Komunikasi tanpa respon langsung ✓
   C. Komunikasi video
   D. Komunikasi audio
   E. Komunikasi teks

   Penjelasan: Async communication adalah metode...
   Tingkat: Easy
```

---

### Step 2: Link Quiz to Module Lesson

**Route:** `/admin/learning/[id]/builder`

1. Navigate to Admin → Learning → Flow Builder for your module
2. Click "+ Add Step" in the appropriate section
3. **Fill in step details:**
   - **Step Title:** e.g., "Final Assessment" or "Module Quiz"
   - **Description:** Optional description
   - **Section:** Select which section this lesson belongs to
   - **Lesson Type:** Select **"Quiz"** ❓
   - **Duration:** Estimated time (e.g., 30 minutes)
4. Click "Add Step"

#### Configure Quiz Link

After creating the quiz-type lesson:

1. The lesson will appear in the curriculum panel
2. Click on the new quiz lesson to select it
3. In the **Editor Panel** (center), you'll see:

```
┌─────────────────────────────────────────┐
│ Select Quiz                           │
│ [Choose an existing quiz... ▼]         │
│   - Remote Working Basics Assessment   │
│   - Communication Skills Quiz         │
│   - Time Management Quiz              │
└─────────────────────────────────────────┘
```

4. **Choose from existing quizzes:**
   - Click the dropdown
   - Select the quiz you created in Step 1
   - The quiz is now linked to this lesson!

#### If No Quiz Exists

If the dropdown shows "No quizzes available yet":

1. Click "Open Quiz Builder" button
2. This opens the Quiz Builder in a new tab
3. Create your quiz there
4. Save and publish the quiz
5. Go back to the Flow Builder tab
6. Refresh the page (or re-open the quiz lesson)
7. The new quiz will now appear in the dropdown!

#### Optional: Add Quiz Notes

In the Quiz Editor panel, you can add:

```
Notes (Optional)
Instructions or tips for students before they take the quiz...

Example:
"This quiz covers all material from the module. 
You have 30 minutes to complete 10 questions. 
Passing score is 70%. Good luck!"
```

---

## 🔗 How the Quiz System Works

### Database Relationships

```
learning_modules (1)
    ↓
module_lessons (many)
    ↓
├── material_id → learning_materials
├── resource_id → learning_resources
└── quiz_config_id → quiz_configs (1)
                      ↓
                  questions (many)
```

**Key Points:**
- Each lesson can link to **ONE** quiz (via `quiz_config_id`)
- Each quiz belongs to **ONE** module (via `module_id`)
- A module can have **multiple** quizzes (for different lessons)
- Users access quizzes via the **lesson** they're linked to

### How Users Access the Quiz

There are **TWO ways** users can take the final quiz:

#### Method 1: Via Learning Player

**Route:** `/learning/[slug]/player`

1. User goes through lessons step-by-step
2. When they reach the quiz lesson, they see:
   ```
   ┌─────────────────────────────────────────┐
   │  Knowledge Check                       │
   │  Test your understanding of the material │
   │  with this quiz.                        │
   │                                         │
   │  [Start Quiz →]                        │
   └─────────────────────────────────────────┘
   ```
3. Click "Start Quiz" → Redirects to `/learning/[slug]/quiz`
4. Takes the quiz
5. Returns to player after completion

#### Method 2: Direct Module Access

**Route:** `/learning/[slug]/quiz`

1. User visits module detail page
2. Sees quiz preview in sidebar:
   ```
   Quiz Preview
   10 questions | 70% to pass
   [Take Quiz]
   ```
3. Click "Take Quiz" → Goes directly to quiz page
4. Takes the quiz

**Note:** Both methods access the **same** quiz - the published quiz for that module.

---

## 🎛️ Admin Quiz Management Options

### Option A: One Final Quiz Per Module (Recommended)

**Setup:**
- Create ONE comprehensive quiz covering all module content
- Create ONE quiz-type lesson at the end of the module
- Link the quiz to that lesson

**Benefits:**
- Simple for users
- Clear assessment of overall module mastery
- Single passing score to track

**Example Structure:**
```
Module: Remote Working Basics
├── Lesson 1: Introduction (Article)
├── Lesson 2: Setting Up Workspace (Video)
├── Lesson 3: Async Communication (Article)
├── Lesson 4: Tools Overview (PDF)
└── Lesson 5: Final Assessment (Quiz) ← Links to comprehensive quiz
```

---

### Option B: Multiple Quizzes Per Module

**Setup:**
- Create multiple smaller quizzes (e.g., one per section)
- Create quiz-type lessons throughout the module
- Link different quizzes to different lessons

**Benefits:**
- Bite-sized assessments
- Progress tracking at each stage
- Better for longer modules

**Example Structure:**
```
Module: Remote Working Basics
├── Section 1: Getting Started
│   ├── Lesson 1: Introduction (Article)
│   └── Lesson 2: Basics Quiz (Quiz) ← Links to basics quiz
├── Section 2: Communication
│   ├── Lesson 3: Async Communication (Article)
│   └── Lesson 4: Communication Quiz (Quiz) ← Links to comm quiz
└── Section 3: Tools
    ├── Lesson 5: Tools Overview (PDF)
    └── Lesson 6: Tools Quiz (Quiz) ← Links to tools quiz
```

**Note:** In this setup, users would take multiple smaller quizzes instead of one big final quiz.

---

### Option C: Quiz + Other Content in Same Lesson

**Setup:**
- Create a quiz-type lesson
- Link the quiz
- Add quiz notes/instructions
- The lesson shows quiz link + notes before quiz

**Benefits:**
- Can add pre-quiz instructions
- Can provide quiz context
- Good for complex assessments

**Example:**
```
Lesson 5: Final Assessment
- Type: Quiz
- Linked Quiz: Remote Working Basics Assessment
- Notes: "This quiz covers all material. You have 30 minutes for 10 questions. 
           Review all lessons before starting. Passing score is 70%."
- User sees: Instructions + [Start Quiz] button
```

---

## 📊 Quiz Status States

### From Admin Perspective

| Quiz State | `is_published` | Visibility | Actions |
|------------|----------------|------------|---------|
| **Draft** | `false` | Hidden from users | Edit, Delete, Publish |
| **Published** | `true` | Visible to users | Edit, Unpublish, Delete |

### From User Perspective

| State | User Sees | Can Take Quiz? |
|-------|-----------|----------------|
| Quiz not published | No quiz preview | ❌ No |
| Quiz published | Quiz preview + "Take Quiz" | ✅ Yes |
| Quiz completed | Score + "Retake Quiz" | ✅ Yes (retry) |

---

## 🎯 Best Practices for Admins

### 1. Quiz Naming Conventions

**Good Examples:**
- "Remote Working Basics - Final Assessment"
- "Module 1 Quiz: Introduction"
- "Communication Skills Check"

**Bad Examples:**
- "Quiz" (too vague)
- "Test" (confusing with other tests)
- "Final" (doesn't indicate which module)

### 2. Quiz Placement in Curriculum

**Recommended:**
- Place quiz lesson at the **END** of the module
- This ensures users have learned all content first
- Allows for comprehensive assessment

**Alternative:**
- Place quiz after each **SECTION** for longer modules
- Provides progress checkpoints
- Reduces cognitive load

### 3. Quiz Settings Guidelines

**Duration:**
- **Short modules (< 1 hour content):** 15-30 minutes
- **Medium modules (1-3 hours content):** 30-45 minutes
- **Long modules (> 3 hours content):** 45-60 minutes

**Passing Score:**
- **Beginner modules:** 60-70%
- **Intermediate modules:** 70-80%
- **Advanced modules:** 80-90%

**Question Count:**
- **Short quizzes:** 5-10 questions
- **Standard quizzes:** 10-15 questions
- **Comprehensive quizzes:** 15-25 questions

### 4. Question Distribution

**Difficulty Mix:**
- 40% Easy questions (build confidence)
- 40% Medium questions (test understanding)
- 20% Hard questions (challenge advanced learners)

**Content Coverage:**
- Ensure questions cover all module sections
- Don't focus on just one topic
- Test both theory and application

---

## 🔧 Troubleshooting

### Issue: Quiz not appearing in dropdown

**Solution:**
1. Check if quiz is **published** (is_published = true)
2. Verify quiz belongs to the **same module** (module_id matches)
3. Refresh the Flow Builder page
4. Check if quiz was created correctly (no errors in Quiz Builder)

### Issue: Users can't see quiz

**Solution:**
1. Verify `is_published = true` in quiz_configs table
2. Check if module is **published** (status = 'published')
3. Ensure lesson with quiz is **not locked** (sequential progress)
4. Check user enrollment status (must be enrolled)

### Issue: Quiz shows "No quizzes available"

**Solution:**
1. Create a quiz first via Quiz Builder
2. Publish the quiz
3. Go back to Flow Builder
4. Create quiz-type lesson
5. Refresh the page
6. Quiz should now appear in dropdown

### Issue: Quiz questions not showing

**Solution:**
1. Verify questions were saved (check questions table)
2. Ensure quiz has at least 1 question
3. Check if questions are linked to correct quiz_config_id
4. Verify RLS policies allow viewing

---

## 📝 Admin Checklist for Quiz Setup

### Before Creating Quiz

- [ ] Decide if this will be a **final quiz** or **section quiz**
- [ ] Determine passing score based on difficulty
- [ ] Set appropriate time limit
- [ ] Prepare question content covering all module topics

### Creating Quiz

- [ ] Give quiz a **descriptive title**
- [ ] Add helpful **description** for students
- [ ] Set **duration** (0 for unlimited)
- [ ] Set **passing grade** (recommended: 70%)
- [ ] Create **minimum 5 questions**
- [ ] Mix **difficulty levels** (easy/medium/hard)
- [ ] Add **explanations** for each question
- [ ] **Publish** the quiz when ready

### Linking Quiz to Module

- [ ] Go to Flow Builder for the module
- [ ] Create new lesson with type **"Quiz"**
- [ ] Give lesson a clear title (e.g., "Final Assessment")
- [ ] Place lesson at **end of curriculum** (or after section)
- [ ] Select quiz from dropdown
- [ ] Add **instructions/notes** for students
- [ ] Save lesson

### Testing Quiz

- [ ] View module as **regular user** (or test account)
- [ ] Navigate to quiz lesson in player
- [ ] Click "Start Quiz"
- [ ] Complete quiz with various answers
- [ ] Verify score calculation
- [ ] Check if passing/failing logic works
- [ ] Test retake functionality
- [ ] Verify quiz completion updates module progress

---

## 🎓 User Experience Flow

### From User's Perspective

1. **Enroll in Module**
   - Visit `/learning/[slug]`
   - Click "Mulai Belajar"

2. **Go Through Lessons**
   - Complete articles, videos, exercises
   - Mark each as complete
   - Progress updates automatically

3. **Reach Quiz Lesson**
   - See "Knowledge Check" card
   - Read quiz instructions
   - Click "Start Quiz"

4. **Take Quiz**
   - Answer all multiple-choice questions
   - Submit answers
   - See score immediately

5. **View Results**
   - If passed → Quiz marked complete → Module progress updates
   - If failed → Can retry quiz → Must pass to complete module

6. **Complete Module**
   - All lessons + quiz complete
   - Module progress = 100%
   - Certificate becomes available

---

## 📚 Related Documentation

- **Quiz Builder Guide:** `docs/features/learning-module/quiz-builder.md`
- **Flow Builder Guide:** `docs/guides/learning-module-flow-builder.md`
- **Learning Player:** `docs/features/learning-module/learning-player.md`
- **Module Overview:** `docs/features/learning-module/overview.md`

---

## 🎯 Quick Reference

### Admin Routes

| Purpose | Route |
|---------|-------|
| Create/Edit Quiz | `/admin/learning/[id]/quiz` |
| Link Quiz to Lesson | `/admin/learning/[id]/builder` |
| View All Modules | `/admin/learning` |

### User Routes

| Purpose | Route |
|---------|-------|
| Start Learning | `/learning/[slug]/player` |
| Take Quiz | `/learning/[slug]/quiz` |
| View Certificate | `/certificates/[id]` |
| Verify Certificate | `/verify/[id]` |

### Key Database Tables

| Table | Purpose |
|-------|---------|
| `quiz_configs` | Quiz settings and metadata |
| `questions` | Quiz questions with options |
| `module_lessons` | Lesson-quiz links via `quiz_config_id` |
| `user_quiz_attempts` | Quiz attempt history |

---

**Last Updated:** April 28, 2026  
**Maintained By:** Development Team
