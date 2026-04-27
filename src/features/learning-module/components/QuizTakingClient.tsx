"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ClipboardCheck,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw,
  ArrowRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { submitQuizAttempt } from "../actions/quiz-actions";
import type { QuizConfig, Question, QuizAttemptResult } from "../types/quiz";

interface QuizTakingClientProps {
  module: {
    id: string;
    title: string;
    slug: string;
  };
  quiz: QuizConfig;
  questions: Question[];
}

type QuizStatus = "intro" | "taking" | "finished";

export default function QuizTakingClient({
  module,
  quiz,
  questions,
}: QuizTakingClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<QuizStatus>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.durationMinutes ? quiz.durationMinutes * 60 : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [startedAt, setStartedAt] = useState<string>("");

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Add warning when leaving during quiz (browser close/refresh)
  useEffect(() => {
    if (status === "taking") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [status]);

  // Handle client-side navigation attempts
  useEffect(() => {
    const handleRouteChange = () => {
      if (status === "taking") {
        const confirmed = window.confirm(
          "Quiz sedang berjalan. Jika Anda pergi, jawaban Anda mungkin tidak tersimpan. Apakah Anda yakin?"
        );
        if (!confirmed) {
          // This part is tricky with Next.js router. 
          // Simple approach: block the navigation by re-navigating back
        }
      }
    };
    // Note: Next.js 13+ App Router doesn't provide a robust way to block navigation
    // without custom solutions, but the browser alert is a good first step.
  }, [pathname, searchParams, status]);

      if (isSubmitting) return;

      // Check if all questions answered
      const answeredCount = Object.keys(answers).length;
      if (!isAutoSubmit && answeredCount < questions.length && timeLeft !== 0) {
        setShowConfirmModal(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await submitQuizAttempt(quiz.id, answers, startedAt);
        if (res.success) {
          setResult(res);
          setStatus("finished");
          toast.success(
            res.passed ? "Selamat! Anda lulus quiz!" : "Quiz selesai.",
          );
        } else {
          toast.error(res.error || "Gagal mengumpulkan quiz");
        }
      } catch (err) {
        console.error("Quiz submission error:", err);
        toast.error("Terjadi kesalahan sistem saat mengumpulkan quiz");
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, isSubmitting, questions.length, quiz.id, startedAt, timeLeft],
  );

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    await handleSubmit(true);
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "taking" && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0 && status === "taking") {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, handleSubmit]);

  const handleStart = () => {
    setStartedAt(new Date().toISOString());
    setStatus("taking");
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {status === "intro" && (
        <div className="min-h-screen bg-secondary/30 py-12 px-4 flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <ClipboardCheck className="size-6 text-primary" />
                {quiz.title}
              </CardTitle>
              {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-secondary/30">
                  <div className="size-10 bg-background rounded-lg flex items-center justify-center border">
                    <Clock className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Durasi
                    </p>
                    <p className="text-sm font-semibold">
                      {quiz.durationMinutes
                        ? `${quiz.durationMinutes} Menit`
                        : "Tanpa batas"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-secondary/30">
                  <div className="size-10 bg-background rounded-lg flex items-center justify-center border">
                    <Award className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Nilai Lulus
                    </p>
                    <p className="text-sm font-semibold">
                      {quiz.passingGrade}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-3">
                <Info className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Instruksi:</p>
                  <ul className="list-disc list-inside space-y-1 opacity-90">
                    <li>Total {questions.length} pertanyaan pilihan ganda.</li>
                    <li>Pilih satu jawaban terbaik untuk setiap pertanyaan.</li>
                    <li>Pastikan koneksi internet stabil selama pengerjaan.</li>
                    {quiz.durationMinutes && (
                      <li>Quiz akan otomatis dikumpulkan saat waktu habis.</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full text-base font-bold h-12 gap-2 shadow-lg"
                onClick={handleStart}
              >
                Mulai Kerjakan Quiz
                <ArrowRight className="size-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {status === "taking" && (
        <div className="min-h-screen bg-secondary/30 flex flex-col">
          {/* Header Sticky */}
          <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase">
                  Mengerjakan Quiz
                </span>
                <span className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
                  {quiz.title}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {timeLeft !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-sm font-bold",
                      timeLeft < 60
                        ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                        : "bg-secondary",
                    )}
                  >
                    <Clock className="size-4" />
                    {formatTime(timeLeft)}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  Kumpulkan
                </Button>
              </div>
            </div>
            <div className="w-full h-1.5 bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 py-8 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Pertanyaan{" "}
                  <span className="text-foreground font-bold">
                    {currentIndex + 1}
                  </span>{" "}
                  dari{" "}
                  <span className="text-foreground font-bold">
                    {questions.length}
                  </span>
                </span>
                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "size-2 rounded-full",
                        idx === currentIndex
                          ? "bg-primary"
                          : answers[questions[idx].id]
                            ? "bg-primary/40"
                            : "bg-muted",
                      )}
                    />
                  ))}
                </div>
              </div>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-8 space-y-8">
                  <h2 className="text-lg md:text-xl font-semibold leading-relaxed">
                    {questions[currentIndex].questionText}
                  </h2>

                  <div className="space-y-3">
                    {(["A", "B", "C", "D", "E"] as const).map((letter) => {
                      const optionText = questions[currentIndex].options[letter];
                      if (!optionText) return null;

                      const isSelected = answers[questions[currentIndex].id] === letter;

                      return (
                        <button
                          key={letter}
                          onClick={() =>
                            handleSelectOption(questions[currentIndex].id, letter)
                          }
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50",
                          )}
                        >
                          <div
                            className={cn(
                              "size-8 rounded-lg border-2 flex items-center justify-center font-bold shrink-0 transition-colors",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground",
                            )}
                          >
                            {letter}
                          </div>
                          <span
                            className={cn(
                              "text-sm md:text-base font-medium",
                              isSelected
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/20 border-t flex justify-between p-4">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="size-4" />
                    Sebelumnya
                  </Button>

                  {currentIndex === questions.length - 1 ? (
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Selesai & Kumpulkan
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="gap-2">
                      Selanjutnya
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      )}

      {status === "finished" && result && (
        <div className="min-h-screen bg-secondary/30 py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-none shadow-xl overflow-hidden">
              <div
                className={cn(
                  "h-3 w-full",
                  result.passed ? "bg-emerald-500" : "bg-rose-500",
                )}
              />
              <CardHeader className="text-center pb-2">
                <div className="mx-auto size-20 rounded-full flex items-center justify-center mb-4">
                  {result.passed ? (
                    <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="size-10 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="size-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                      <XCircle className="size-10 text-rose-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl font-bold">
                  {result.passed ? "Selamat, Anda Lulus!" : "Belum Lulus, Coba Lagi!"}
                </CardTitle>
                <CardDescription className="text-lg">
                  Skor Anda:{" "}
                  <span
                    className={cn(
                      "font-bold text-2xl",
                      result.passed ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {result.score}%
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border bg-card text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Benar
                    </p>
                    <p className="text-xl font-bold text-emerald-600">
                      {result.correctCount}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Salah
                    </p>
                    <p className="text-xl font-bold text-rose-600">
                      {(result.totalQuestions || 0) - (result.correctCount || 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Total Soal
                    </p>
                    <p className="text-xl font-bold">{result.totalQuestions}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Nilai Lulus
                    </p>
                    <p className="text-xl font-bold">{quiz.passingGrade}%</p>
                  </div>
                </div>

                {result.passed ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                    <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                      Luar biasa! Anda telah menyelesaikan modul ini dan berhak
                      mendapatkan sertifikat.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800 text-center">
                    <p className="text-amber-800 dark:text-amber-300 font-medium">
                      Jangan menyerah! Tinjau materi pembelajaran lagi dan coba
                      kerjakan quiz ini kembali.
                    </p>
                  </div>
                )}

                {/* Review Section */}
                <div className="pt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Info className="size-5 text-primary" />
                    Review Pertanyaan
                  </h3>
                  <div className="space-y-6">
                    {questions.map((q, idx) => {
                      const userAnswer = answers[q.id];
                      const isCorrect = userAnswer === q.correctAnswer;
                      return (
                        <div key={q.id} className="p-6 rounded-xl border bg-card space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                              <span className="font-bold text-muted-foreground">#{idx + 1}</span>
                              <p className="font-medium">{q.questionText}</p>
                            </div>
                            {isCorrect ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shrink-0 border-emerald-200">Benar</Badge>
                            ) : (
                              <Badge variant="destructive" className="shrink-0">Salah</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                            <div className={cn("p-3 rounded-lg border text-sm", isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100")}>
                              <p className="text-xs font-bold uppercase mb-1 opacity-60">Jawaban Anda</p>
                              <p className="font-medium">
                                <span className="mr-1">{userAnswer || "-"}.</span>
                                {userAnswer ? q.options[userAnswer as keyof typeof q.options] : "Tidak dijawab"}
                              </p>
                            </div>
                            {!isCorrect && (
                              <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50 text-sm">
                                <p className="text-xs font-bold uppercase mb-1 opacity-60 text-emerald-700">Jawaban Benar</p>
                                <p className="font-medium text-emerald-800">
                                  <span className="mr-1">{q.correctAnswer}.</span>
                                  {q.options[q.correctAnswer as keyof typeof q.options]}
                                </p>
                              </div>
                            )}
                          </div>
                          {q.explanation && (
                            <div className="pl-8 pt-2">
                              <div className="bg-secondary/50 p-4 rounded-lg text-sm border-l-4 border-primary">
                                <p className="font-bold text-xs uppercase mb-1 text-primary">Penjelasan</p>
                                <p className="text-muted-foreground leading-relaxed italic">{q.explanation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 pt-8 bg-secondary/10 border-t">
                <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={() => router.push(`/learning/${module.slug}`)}>
                  <ChevronLeft className="size-4" />
                  Kembali ke Modul
                </Button>
                {!result.passed && (
                  <Button size="lg" className="flex-1 gap-2" onClick={() => window.location.reload()}>
                    <RefreshCcw className="size-4" />
                    Coba Lagi
                  </Button>
                )}
                {result.passed && (
                  <Button size="lg" className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push(`/learning/${module.slug}`)}>
                    Lihat Sertifikat
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Konfirmasi Pengumpulan
            </DialogTitle>
            <DialogDescription>
              Anda baru menjawab {Object.keys(answers).length} dari {questions.length} pertanyaan.
              Apakah Anda yakin ingin mengumpulkan quiz sekarang?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Lanjutkan Mengerjakan
            </Button>
            <Button variant="default" onClick={confirmSubmit}>
              Ya, Kumpulkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Sub-component for Badge (since it might not be exported)
function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline";
}) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "text-foreground border border-input bg-background",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
