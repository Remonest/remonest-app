# Quiz Builder — Documentation

## Overview

Quiz Builder adalah fitur admin untuk membuat kuis/asesmen dalam modul pembelajaran. Admin dapat membuat konfigurasi quiz dengan multiple-choice questions (A-E), mengatur durasi, nilai kelulusan, dan tingkat kesulitan setiap pertanyaan.

**Current Version:** v1.0.0 | **Created:** April 11, 2026

---

## 🎯 Fitur Utama

### 1. Quiz Configuration
- **Judul Quiz** - Nama quiz yang akan ditampilkan ke peserta
- **Deskripsi** - Penjelasan singkat tentang quiz (opsional)
- **Durasi (menit)** - Timer untuk peserta (0 = tanpa batas waktu)
- **Nilai Kelulusan** - Persentase minimum untuk lulus (default: 70%)
- **Status Publikasi** - Toggle untuk mempublikasikan quiz

### 2. Dynamic Question Builder
- **Unlimited Questions** - Tambahkan pertanyaan tanpa batas
- **5 Pilihan Jawaban** - Opsi A, B, C, D, E dengan radio button untuk jawaban benar
- **Penjelasan** - Penjelasan mengapa jawaban tersebut benar (opsional)
- **Tingkat Kesulitan** - Easy, Medium, Hard dengan color-coded badges
- **Collapsible Cards** - UI rapi dengan accordion per pertanyaan
- **Delete Protection** - Minimal 1 pertanyaan harus ada

### 3. Form Validation
- Client-side validation sebelum submission
- Server-side validation di Server Action
- Error messages dalam Bahasa Indonesia
- Toast notifications untuk feedback

---

## 🗄️ Database Schema

### `quiz_configs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique quiz config ID |
| `module_id` | UUID | FK → learning_modules(id), CASCADE | Parent learning module |
| `title` | TEXT | NOT NULL | Quiz title |
| `description` | TEXT | NULL | Quiz description (optional) |
| `duration_minutes` | INT | NULL, CHECK > 0 | Time limit in minutes (NULL = unlimited) |
| `passing_grade` | INT | NOT NULL, DEFAULT 70, CHECK 0-100 | Minimum passing score (%) |
| `is_published` | BOOLEAN | NOT NULL, DEFAULT false | Publication status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### `questions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique question ID |
| `quiz_config_id` | UUID | FK → quiz_configs(id), CASCADE | Parent quiz config |
| `question_text` | TEXT | NOT NULL | The question text |
| `options` | JSONB | NOT NULL | `{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}` |
| `correct_answer` | TEXT | NOT NULL, CHECK (A-E) | Correct answer letter |
| `explanation` | TEXT | NULL | Explanation of correct answer (optional) |
| `difficulty` | TEXT | NOT NULL, DEFAULT 'easy', CHECK (easy/medium/hard) | Question difficulty |
| `order_index` | INT | NOT NULL, DEFAULT 0 | Display order |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### `user_quiz_attempts` (Future Use)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique attempt ID |
| `user_id` | UUID | FK → auth.users(id), CASCADE | User who took quiz |
| `quiz_config_id` | UUID | FK → quiz_configs(id), CASCADE | Quiz taken |
| `score` | INT | NOT NULL, CHECK 0-100 | User's score |
| `passed` | BOOLEAN | NOT NULL | Whether user passed |
| `answers` | JSONB | NOT NULL, DEFAULT '{}' | User's answers |
| `started_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Quiz start time |
| `completed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Quiz completion time |

**Unique Constraint:** `UNIQUE(user_id, quiz_config_id)` - One attempt per user per quiz

---

## 📁 File Structure

```
src/
├── app/
│   └── admin/
│       └── learning/
│           └── [id]/
│               └── quiz/
│                   ├── page.tsx              # Server component (route entry)
│                   └── quiz-builder.tsx       # Client component (form UI)
├── features/
│   └── learning-module/
│       ├── actions/
│       │   └── quiz-actions.ts               # Server actions for quiz CRUD
│       └── types/
│           └── quiz.ts                       # TypeScript interfaces
supabase/
└── migrations/
    └── 012_quiz_system.sql                   # Database migration
```

---

## 🔧 Server Actions

### `createQuizWithQuestions(moduleId, config, questions)`

Creates a new quiz configuration with all questions in a single transaction.

**Parameters:**
- `moduleId: string` - Parent learning module ID
- `config: QuizConfigInput` - Quiz configuration data
- `questions: QuestionInput[]` - Array of questions (minimum 1)

**Returns:** `Promise<QuizResult>`
```typescript
interface QuizResult {
  success: boolean;
  error?: string;
  redirect?: string;
  quizConfigId?: string;
}
```

**Validation:**
- Minimum 1 question required
- All question fields must be filled
- All 5 options (A-E) must be filled
- Correct answer must be selected

**Transaction Flow:**
1. Validate all inputs
2. Insert into `quiz_configs` → returns new `quiz_config_id`
3. Map questions with `quiz_config_id`
4. Bulk insert into `questions` table
5. If questions insert fails → rollback quiz_config (delete)
6. `revalidatePath()` to refresh admin pages

**Example Usage:**
```typescript
const result = await createQuizWithQuestions(
  "module-uuid",
  {
    title: "Final Quiz",
    description: "Test your knowledge",
    durationMinutes: 30,
    passingGrade: 70,
    isPublished: false,
  },
  [
    {
      questionText: "What is remote work?",
      options: {
        A: "Working from office",
        B: "Working from anywhere",
        C: "Working on weekends",
        D: "Working overtime",
        E: "Working part-time",
      },
      correctAnswer: "B",
      explanation: "Remote work means working from outside the traditional office.",
      difficulty: "easy",
    },
  ]
);
```

---

### `getQuizWithQuestions(quizConfigId)`

Fetches a complete quiz with all its questions.

**Returns:** `Promise<QuizWithQuestions | null>`
```typescript
interface QuizWithQuestions {
  config: QuizConfig;
  questions: Question[];
}
```

---

### `getModuleQuizzes(moduleId)`

Gets all quizzes for a specific learning module.

**Returns:** `Promise<QuizConfig[]>`

---

### `updateQuizConfig(quizConfigId, config)`

Updates quiz configuration settings.

**Parameters:**
- `quizConfigId: string`
- `config: Partial<QuizConfigInput>`

---

### `deleteQuiz(quizConfigId)`

Deletes a quiz config and all its questions (via CASCADE).

---

### `addQuestionToQuiz(quizConfigId, question)`

Adds a new question to an existing quiz.

---

### `updateQuestion(questionId, question)`

Updates a single question.

---

### `deleteQuestion(questionId)`

Deletes a single question.

---

## 🎨 UI Components

### Quiz Configuration Card

**Location:** Top of quiz builder page

**Features:**
- Title input (text)
- Description textarea (optional)
- Duration input with visual indicator
- Passing grade input (0-100%)
- Published toggle switch
- Helper text explaining each field

### Question Cards

**Features:**
- Collapsible accordion per question
- Question number badge
- Difficulty color-coded badge
- 5 option inputs with radio buttons
- Explanation textarea
- Difficulty select (Easy/Medium/Hard)
- Delete button (with minimum 1 question protection)

### Sticky Submit Bar

**Location:** Bottom of page (sticky)

**Features:**
- Cancel button (navigates back)
- Submit button with loading state
- Backdrop blur effect
- Error display section

---

## 🔒 RLS Policies

### `quiz_configs`

| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view published quizzes | SELECT | `is_published = true` AND module status = 'published' |
| Admins can manage quiz configs | ALL | User role = 'admin' |

### `questions`

| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view questions from published quizzes | SELECT | Quiz is published AND module is published |
| Admins can manage questions | ALL | User role = 'admin' |

### `user_quiz_attempts`

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own quiz attempts | SELECT | `auth.uid() = user_id` |
| Users can create quiz attempts | INSERT | `auth.uid() = user_id` |
| Admins can view all quiz attempts | ALL | User role = 'admin' |

---

## 🚀 How to Use

### 1. Run Database Migration

```bash
# In Supabase Dashboard → SQL Editor
# Or using Supabase CLI
supabase db push

# Or run the migration file manually
# File: supabase/migrations/012_quiz_system.sql
```

### 2. Access Quiz Builder

1. Navigate to Admin Panel → Learning Modules
2. Create or edit a learning module
3. Click "Buat Quiz" button (or navigate to `/admin/learning/[id]/quiz`)

### 3. Create Quiz

1. Fill in quiz configuration:
   - Title (auto-filled with module title)
   - Description (optional)
   - Duration in minutes (0 = no time limit)
   - Passing grade (default: 70%)
   - Published toggle

2. Add questions:
   - Click "Tambah Pertanyaan" button
   - Fill question text
   - Fill all 5 options (A-E)
   - Select correct answer using radio button
   - Add explanation (optional)
   - Select difficulty level

3. Submit:
   - Click "Simpan Quiz" button
   - Wait for success toast
   - Auto-redirect to learning modules list

### 4. Edit Quiz (Future Enhancement)

To be implemented: Quiz list page with edit/delete actions

---

## 📝 Type Definitions

### Enums
```typescript
type QuestionDifficulty = "easy" | "medium" | "hard";
```

### Interfaces
```typescript
interface QuizConfigInput {
  title: string;
  description: string;
  durationMinutes: number | "";
  passingGrade: number;
  isPublished: boolean;
}

interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
}

interface QuestionInput {
  questionText: string;
  options: QuestionOptions;
  correctAnswer: "A" | "B" | "C" | "D" | "E" | "";
  explanation: string;
  difficulty: QuestionDifficulty;
}
```

---

## 🐛 Known Issues & TODOs

- [ ] Quiz list page (`/admin/learning/[id]/quizzes`) to view/edit/delete existing quizzes
- [ ] Quiz edit functionality (currently only create is supported)
- [ ] Question reordering (drag & drop)
- [ ] Question preview mode
- [ ] Bulk import questions from CSV/JSON
- [ ] Quiz attempt tracking for users
- [ ] Quiz results page for users
- [ ] Certificate generation after passing quiz

---

## 🔗 Related Documentation

- [Learning Module Overview](./overview.md)
- [Database Architecture](../../architecture/database.md)
- [Admin Access Guide](../../guides/admin-access.md)
