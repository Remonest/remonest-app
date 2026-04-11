# Quiz Builder - Setup & Implementation Guide

## 🚀 Quick Start

### 1. Run Database Migration

You need to add the quiz tables to your Supabase database:

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/012_quiz_system.sql`
4. Paste and run the migration
5. Verify tables are created: `quiz_configs`, `questions`, `user_quiz_attempts`

#### Option B: Using Supabase CLI
```bash
# Make sure you're logged in to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option C: Manual SQL Execution
```bash
# Connect to your database and run:
psql -h your-db.supabase.co -p 5432 -U postgres -d postgres -f supabase/migrations/012_quiz_system.sql
```

### 2. Verify Environment Variables

Ensure your `.env.local` file has these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# These are required for server-side Supabase client
```

### 3. Access Quiz Builder

1. Start your development server:
```bash
npm run dev
# or
pnpm dev
```

2. Navigate to a learning module:
```
http://localhost:3000/admin/learning
```

3. Create or edit a module, then navigate to:
```
http://localhost:3000/admin/learning/{module-id}/quiz
```

**Note:** You may need to manually add a "Buat Quiz" button to the learning module edit page or access the URL directly.

---

## 📋 Implementation Checklist

### Completed ✅
- [x] TypeScript type definitions (`src/features/learning-module/types/quiz.ts`)
- [x] Server actions for quiz CRUD (`src/features/learning-module/actions/quiz-actions.ts`)
- [x] Quiz builder UI (`src/app/admin/learning/[id]/quiz/quiz-builder.tsx`)
- [x] Quiz builder page (`src/app/admin/learning/[id]/quiz/page.tsx`)
- [x] Database migration (`supabase/migrations/012_quiz_system.sql`)
- [x] Documentation (`docs/features/learning-module/quiz-builder.md`)

### Pending (Future Enhancements) ⏳
- [ ] Add "Buat Quiz" button to learning module edit page
- [ ] Quiz list page to view/edit/delete existing quizzes
- [ ] Quiz attempt tracking for users
- [ ] Quiz results page showing score and pass/fail status
- [ ] Certificate generation after passing quiz
- [ ] Question reordering (drag & drop)
- [ ] Bulk import questions from CSV/JSON
- [ ] Question preview mode
- [ ] Quiz analytics for admins

---

## 🗃️ Database Schema Overview

### Tables Created

1. **`quiz_configs`** - Quiz settings per learning module
   - Foreign key to `learning_modules`
   - Duration, passing grade, published status
   
2. **`questions`** - Multiple-choice questions
   - Foreign key to `quiz_configs`
   - JSONB options field for A-E choices
   - Difficulty levels (easy/medium/hard)
   
3. **`user_quiz_attempts`** - Track user quiz attempts (for future use)
   - Foreign keys to `auth.users` and `quiz_configs`
   - Score, pass/fail status, answers JSON

### RLS Policies

All tables have Row Level Security enabled:
- **Public access** to published quizzes
- **Admin-only** access to create/edit/delete
- **User access** to their own quiz attempts

---

## 🎯 How to Use Quiz Builder

### Creating a Quiz

1. **Navigate to Quiz Builder**
   - Go to Admin Panel → Learning Modules
   - Edit a module or create a new one
   - Navigate to `/admin/learning/{module-id}/quiz`

2. **Fill Quiz Configuration**
   - **Title**: Auto-filled with module title (editable)
   - **Description**: Optional explanation about the quiz
   - **Duration**: Time limit in minutes (0 = unlimited)
   - **Passing Grade**: Minimum score to pass (default: 70%)
   - **Published**: Toggle to make quiz available to users

3. **Add Questions**
   - Click "Tambah Pertanyaan" button
   - Fill in question text
   - Fill all 5 options (A, B, C, D, E)
   - Select correct answer using radio button
   - Add explanation (optional, shown to users after answering)
   - Select difficulty level

4. **Submit Quiz**
   - Click "Simpan Quiz" button
   - Wait for success toast notification
   - Auto-redirect to learning modules list

### Example Quiz

```
Title: Remote Work Basics Quiz
Duration: 30 minutes
Passing Grade: 70%

Question #1:
What is remote work?
A. Working from office  ❌
B. Working from anywhere  ✅
C. Working on weekends  ❌
D. Working overtime  ❌
E. Working part-time  ❌

Explanation: Remote work means working from outside the traditional office, often from home or co-working spaces.
Difficulty: Easy
```

---

## 🔧 Server Actions API Reference

### Create Quiz with Questions

```typescript
import { createQuizWithQuestions } from "@/features/learning-module/actions/quiz-actions";

const result = await createQuizWithQuestions(
  moduleId,      // Parent learning module ID
  config,        // Quiz configuration
  questions      // Array of questions
);

// Returns:
{
  success: true,
  redirect: "/admin/learning",
  quizConfigId: "uuid"
}
```

### Get Quiz with Questions

```typescript
import { getQuizWithQuestions } from "@/features/learning-module/actions/quiz-actions";

const quiz = await getQuizWithQuestions(quizConfigId);

// Returns:
{
  config: { id, title, durationMinutes, ... },
  questions: [
    { id, questionText, options, correctAnswer, ... }
  ]
}
```

### Update Quiz Config

```typescript
import { updateQuizConfig } from "@/features/learning-module/actions/quiz-actions";

await updateQuizConfig(quizConfigId, {
  title: "Updated Title",
  passingGrade: 80
});
```

### Delete Quiz

```typescript
import { deleteQuiz } from "@/features/learning-module/actions/quiz-actions";

await deleteQuiz(quizConfigId);
// Cascades to delete all questions
```

---

## 🎨 UI Components

### Quiz Configuration Card
- Clean form layout with shadcn/ui components
- Real-time helper text for duration field
- Published toggle switch
- Input validation

### Question Cards
- Collapsible accordion per question
- Numbered question badges
- Color-coded difficulty badges:
  - 🟢 Easy (green)
  - 🟡 Medium (yellow)
  - 🔴 Hard (red)
- Radio buttons for correct answer selection
- Delete button with minimum question protection

### Sticky Submit Bar
- Fixed at bottom of page
- Backdrop blur effect
- Loading spinner during submission
- Error display section

---

## 🔐 Security

### Admin Protection
- All quiz builder routes protected by `requireAdmin()` via AdminShell layout
- Non-admin users cannot access quiz builder

### RLS Policies
```sql
-- Only admins can create/edit quizzes
CREATE POLICY "Admins can manage quiz configs"
  ON quiz_configs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  ));

-- Public can view published quizzes
CREATE POLICY "Anyone can view published quizzes"
  ON quiz_configs FOR SELECT
  USING (is_published = true);
```

### Data Validation
- Client-side validation before submission
- Server-side validation in Server Actions
- Database constraints (CHECK, NOT NULL, UNIQUE)
- JSONB validation for options field

---

## 🐛 Troubleshooting

### Issue: "Table does not exist" error
**Solution:** Run the migration file `012_quiz_system.sql` in Supabase

### Issue: "Permission denied" when creating quiz
**Solution:** Ensure your user has `role = 'admin'` in `user_profiles` table

### Issue: Quiz builder page shows 404
**Solution:** 
1. Verify the module ID exists
2. Check that you're using the correct URL: `/admin/learning/{id}/quiz`

### Issue: Form submission fails silently
**Solution:** 
1. Check browser console for errors
2. Verify all question fields are filled
3. Ensure minimum 1 question exists
4. Check network tab for server response

---

## 📚 Related Documentation

- [Learning Module Overview](./overview.md)
- [Quiz Builder Detailed Guide](./quiz-builder.md)
- [Database Architecture](../../architecture/database.md)
- [Admin Access Guide](../../guides/admin-access.md)

---

## 💡 Tips & Best Practices

1. **Question Quality**
   - Write clear, unambiguous questions
   - Make distractors (wrong answers) plausible
   - Provide detailed explanations

2. **Difficulty Levels**
   - Easy: Basic recall and comprehension
   - Medium: Application and analysis
   - Hard: Synthesis and evaluation

3. **Quiz Settings**
   - Set realistic time limits (1-2 min per question)
   - Use 70% as standard passing grade
   - Keep quizzes focused (10-20 questions)

4. **User Experience**
   - Test quiz before publishing
   - Preview from user perspective
   - Consider mobile layout

---

**Created:** April 11, 2026  
**Version:** v1.0.0  
**Status:** ✅ Production Ready (requires migration)
