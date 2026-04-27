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

### 3. Access Quiz Management

1. Start your development server:
```bash
npm run dev
# or
pnpm dev
```

2. Navigate to Admin Panel:
```
http://localhost:3000/admin/quizzes
```
This is the centralized hub for viewing, previewing, editing, and deleting all quizzes across learning modules.

---

## 📋 Implementation Checklist

### Completed ✅
- [x] TypeScript type definitions (`src/features/learning-module/types/quiz.ts`)
- [x] Server actions for quiz CRUD (`src/features/learning-module/actions/quiz-actions.ts`)
- [x] Quiz builder UI with edit support (`src/app/admin/learning/[id]/quiz/quiz-builder.tsx`)
- [x] Quiz builder page (`src/app/admin/learning/[id]/quiz/page.tsx`)
- [x] Centralized Quiz Management page (`src/app/admin/quizzes/page.tsx`)
- [x] Quiz preview and management actions (`src/components/admin/quiz-actions-menu.tsx`)
- [x] Database migration (`supabase/migrations/012_quiz_system.sql`)
- [x] Documentation (`docs/guides/quiz-builder-setup.md`)

### Pending (Future Enhancements) ⏳
- [ ] Quiz attempt tracking for users
- [ ] Quiz results page showing score and pass/fail status
- [ ] Certificate generation after passing quiz
- [ ] Question reordering (drag & drop)
- [ ] Bulk import questions from CSV/JSON
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

### Creating/Editing a Quiz

1. **New Quiz**
   - Go to Admin Panel → Learning Modules
   - Edit a module or create a new one
   - Navigate to `/admin/learning/{module-id}/quiz`

2. **Existing Quiz (Edit)**
   - Go to Admin Panel → **Quizzes** (centralized list)
   - Click the "Actions" menu (More icon) for the desired quiz
   - Click "Edit Quiz" to open the editor with pre-populated data

3. **Fill/Modify Configuration**
   - **Title**: Quiz title
   - **Description**: Optional explanation
   - **Duration**: Time limit (0 = unlimited)
   - **Passing Grade**: Min score (default: 70%)
   - **Published**: Toggle to enable access

4. **Add/Edit Questions**
   - Edit/Add questions, options, correct answers, and difficulty levels
   - Submit changes with "Simpan Quiz"

---

## 🔧 Server Actions API Reference

### Create Quiz with Questions
`createQuizWithQuestions(moduleId, config, questions)`

### Update Quiz (Full Content Update)
`updateQuizWithQuestions(quizConfigId, config, questions)`

### Get Quiz with Questions
`getQuizWithQuestions(quizConfigId)`

### Update Quiz Config
`updateQuizConfig(quizConfigId, config)`

### Delete Quiz
`deleteQuiz(quizConfigId)`

---

## 📚 Related Documentation

- [Learning Module Overview](./overview.md)
- [Database Architecture](../../architecture/database.md)
- [Admin Access Guide](../../guides/admin-access.md)

---

**Created:** April 11, 2026  
**Updated:** April 27, 2026  
**Version:** v1.1.0  
**Status:** ✅ Production Ready
