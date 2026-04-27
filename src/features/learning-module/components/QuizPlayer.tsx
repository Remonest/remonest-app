"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { submitQuizAttempt } from "@/features/learning-module/actions/quiz-actions";
import { QuizWithQuestions } from "@/features/learning-module/types/quiz";
import { Loader2, Timer, Target, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function QuizPlayer({ 
  quizData, 
  moduleSlug 
}: { 
  quizData: QuizWithQuestions,
  moduleSlug: string 
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [startedAt] = useState(new Date().toISOString());

  const progress = useMemo(() => {
    return Math.round((Object.keys(answers).length / quizData.questions.length) * 100);
  }, [answers, quizData.questions.length]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quizData.questions.length) {
      toast.error("Harap jawab semua pertanyaan");
      return;
    }

    setLoading(true);
    const result = await submitQuizAttempt(quizData.config.id, answers, startedAt);
    setLoading(false);

    if (result.success) {
      setResult(result);
    } else {
      toast.error(result.error || "Gagal mengirim jawaban");
    }
  };

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-center">Hasil Quiz</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className={`text-4xl font-bold ${result.passed ? "text-green-600" : "text-red-600"}`}>
            {result.score}%
          </div>
          <p>{result.passed ? "Selamat! Anda lulus." : "Maaf, Anda belum lulus."}</p>
          <Button onClick={() => router.push(`/learning/${moduleSlug}`)}>
            Kembali ke Modul
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-8">
      {/* Quiz Info Header */}
      <Card className="sticky top-4 z-10">
        <CardContent className="pt-6">
          <h1 className="text-xl font-bold mb-4">{quizData.config.title}</h1>
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" /> Target: {quizData.config.passingGrade}%
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" /> {quizData.config.durationMinutes || "—"} min
            </div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> {quizData.questions.length} soal
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>Progres</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {quizData.questions.map((q, index) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base">{index + 1}. {q.questionText}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
              className="space-y-2"
            >
              {Object.entries(q.options).map(([key, val]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`${q.id}-${key}`} />
                  <Label htmlFor={`${q.id}-${key}`}>{key}: {val}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      <Button 
        className="w-full" 
        onClick={handleSubmit} 
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : "Kumpulkan Jawaban"}
      </Button>
    </div>
  );
}
