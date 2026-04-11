"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Trash2,
  Clock,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { createQuizWithQuestions } from "@/features/learning-module/actions/quiz-actions";
import type {
  QuestionInput,
  QuizConfigInput,
  QuestionOptions,
  QuestionDifficulty,
} from "@/features/learning-module/types/quiz";

interface QuizBuilderProps {
  moduleId: string;
  moduleTitle: string;
}

const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;

const initialState = {
  success: false,
  error: undefined as string | undefined,
};

export default function QuizBuilder({ moduleId, moduleTitle }: QuizBuilderProps) {
  const router = useRouter();
  
  // Quiz configuration state
  const [config, setConfig] = useState<QuizConfigInput>({
    title: `Kuis: ${moduleTitle}`,
    description: "",
    durationMinutes: 30,
    passingGrade: 70,
    isPublished: false,
  });

  // Questions state
  const [questions, setQuestions] = useState<QuestionInput[]>([
    createEmptyQuestion(),
  ]);

  // Collapsed state for each question
  const [collapsedQuestions, setCollapsedQuestions] = useState<Record<number, boolean>>({
    0: false,
  });

  // Form submission
  const [state, formAction, pending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      // Validate before submission
      if (questions.length === 0) {
        return { success: false, error: "Quiz harus memiliki minimal 1 pertanyaan" };
      }

      return createQuizWithQuestions(moduleId, config, questions);
    },
    initialState
  );

  // Show toast based on result
  useEffect(() => {
    if (state?.success) {
      toast.success("Quiz berhasil dibuat!", {
        icon: <CheckCircle2 className="size-4 text-green-500" />,
      });
      if (state.redirect) {
        setTimeout(() => router.push(state.redirect!), 1000);
      }
    } else if (state?.error) {
      toast.error(state.error, {
        icon: <AlertCircle className="size-4" />,
      });
    }
  }, [state, router]);

  // Add new question
  const addQuestion = () => {
    const newIndex = questions.length;
    setQuestions([...questions, createEmptyQuestion()]);
    setCollapsedQuestions({
      ...collapsedQuestions,
      [newIndex]: false,
    });
  };

  // Remove question
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error("Quiz harus memiliki minimal 1 pertanyaan");
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    
    // Rebuild collapsed state
    const newCollapsed: Record<number, boolean> = {};
    Object.keys(collapsedQuestions).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey < index) {
        newCollapsed[numKey] = collapsedQuestions[numKey];
      } else if (numKey > index) {
        newCollapsed[numKey - 1] = collapsedQuestions[numKey];
      }
    });
    setCollapsedQuestions(newCollapsed);
  };

  // Update question field
  const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  // Update question option
  const updateOption = (index: number, letter: string, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      options: { ...newQuestions[index].options, [letter]: value },
    };
    setQuestions(newQuestions);
  };

  // Toggle question collapse
  const toggleCollapse = (index: number) => {
    setCollapsedQuestions({
      ...collapsedQuestions,
      [index]: !collapsedQuestions[index],
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Quiz Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Konfigurasi Quiz
          </CardTitle>
          <CardDescription>
            Atur pengaturan dasar untuk quiz modul "{moduleTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Judul Quiz</Label>
            <Input
              id="quiz-title"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Masukkan judul quiz"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="quiz-description">Deskripsi (Opsional)</Label>
            <Textarea
              id="quiz-description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Deskripsi singkat tentang quiz"
              rows={2}
            />
          </div>

          {/* Duration & Passing Grade */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiz-duration" className="flex items-center gap-2">
                <Clock className="size-4" />
                Durasi (menit)
              </Label>
              <Input
                id="quiz-duration"
                type="number"
                min="0"
                value={config.durationMinutes}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    durationMinutes: e.target.value ? parseInt(e.target.value) : "",
                  })
                }
                placeholder="0 = tanpa batas waktu"
              />
              <p className="text-xs text-muted-foreground">
                {config.durationMinutes
                  ? `Peserta memiliki ${config.durationMinutes} menit untuk menyelesaikan quiz`
                  : "Tidak ada batasan waktu"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passing-grade" className="flex items-center gap-2">
                <Award className="size-4" />
                Nilai Kelulusan (%)
              </Label>
              <Input
                id="passing-grade"
                type="number"
                min="0"
                max="100"
                value={config.passingGrade}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    passingGrade: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="70"
              />
              <p className="text-xs text-muted-foreground">
                Minimal skor yang dibutuhkan untuk lulus quiz
              </p>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="quiz-published">Publikasikan Quiz</Label>
              <p className="text-sm text-muted-foreground">
                Quiz akan tersedia untuk peserta segera setelah disimpan
              </p>
            </div>
            <Switch
              id="quiz-published"
              checked={config.isPublished}
              onCheckedChange={(checked) =>
                setConfig({ ...config, isPublished: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pertanyaan Quiz</h2>
            <p className="text-sm text-muted-foreground">
              {questions.length} pertanyaan{questions.length !== 1 ? "" : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="gap-2"
          >
            <PlusCircle className="size-4" />
            Tambah Pertanyaan
          </Button>
        </div>

        {/* Question Cards */}
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            index={index}
            question={question}
            isCollapsed={collapsedQuestions[index] ?? false}
            onUpdateField={(field, value) => updateQuestion(index, field, value)}
            onUpdateOption={(letter, value) => updateOption(index, letter, value)}
            onRemove={() => removeQuestion(index)}
            onToggleCollapse={() => toggleCollapse(index)}
          />
        ))}
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4 mr-2" />
              Simpan Quiz
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-200">
                Gagal menyimpan quiz
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {state.error}
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// ============================================================
// Question Card Component
// ============================================================

interface QuestionCardProps {
  index: number;
  question: QuestionInput;
  isCollapsed: boolean;
  onUpdateField: (field: keyof QuestionInput, value: any) => void;
  onUpdateOption: (letter: string, value: string) => void;
  onRemove: () => void;
  onToggleCollapse: () => void;
}

function QuestionCard({
  index,
  question,
  isCollapsed,
  onUpdateField,
  onUpdateOption,
  onRemove,
  onToggleCollapse,
}: QuestionCardProps) {
  return (
    <Card className="relative">
      {/* Question Header */}
      <CardHeader
        className="cursor-pointer select-none"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <CardTitle className="text-base">
                Pertanyaan #{index + 1}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {question.questionText || "Belum ada teks pertanyaan"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={DIFFICULTY_COLORS[question.difficulty]}
            >
              {question.difficulty}
            </Badge>
            {isCollapsed ? (
              <ChevronDown className="size-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="size-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Question Body */}
      {!isCollapsed && (
        <>
          <Separator />
          <CardContent className="space-y-4 pt-4">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor={`question-${index}-text`}>
                Teks Pertanyaan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`question-${index}-text`}
                value={question.questionText}
                onChange={(e) => onUpdateField("questionText", e.target.value)}
                placeholder="Masukkan pertanyaan"
                rows={3}
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label>Pilihan Jawaban</Label>
              <div className="space-y-2">
                {OPTION_LETTERS.map((letter) => (
                  <div key={letter} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="radio"
                        name={`question-${index}-correct`}
                        id={`question-${index}-option-${letter}`}
                        checked={question.correctAnswer === letter}
                        onChange={() => onUpdateField("correctAnswer", letter)}
                        className="size-4"
                      />
                      <Label
                        htmlFor={`question-${index}-option-${letter}`}
                        className="font-semibold"
                      >
                        {letter}.
                      </Label>
                    </div>
                    <Input
                      value={question.options[letter]}
                      onChange={(e) => onUpdateOption(letter, e.target.value)}
                      placeholder={`Opsi ${letter}`}
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Pilih radio button di sebelah kiri untuk menentukan jawaban yang benar
              </p>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label htmlFor={`question-${index}-explanation`}>
                Penjelasan (Opsional)
              </Label>
              <Textarea
                id={`question-${index}-explanation`}
                value={question.explanation}
                onChange={(e) => onUpdateField("explanation", e.target.value)}
                placeholder="Penjelasan mengapa jawaban tersebut benar"
                rows={2}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor={`question-${index}-difficulty`}>
                Tingkat Kesulitan
              </Label>
              <Select
                value={question.difficulty}
                onValueChange={(value) =>
                  onUpdateField("difficulty", value as QuestionDifficulty)
                }
              >
                <SelectTrigger id={`question-${index}-difficulty`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Mudah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="hard">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delete Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
              >
                <Trash2 className="size-4" />
                Hapus Pertanyaan
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

// ============================================================
// Helper Functions
// ============================================================

function createEmptyQuestion(): QuestionInput {
  return {
    questionText: "",
    options: {
      A: "",
      B: "",
      C: "",
      D: "",
      E: "",
    },
    correctAnswer: "",
    explanation: "",
    difficulty: "easy",
  };
}
