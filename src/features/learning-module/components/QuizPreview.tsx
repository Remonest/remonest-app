"use client";

import React from "react";
import { CheckCircle2, ClipboardCheck, ArrowRight, RefreshCcw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuizPreviewProps {
  moduleSlug?: string;
  questions?: any[]; 
  passingGrade?: number;
  totalQuestions?: number;
  lastAttempt?: {
    score: number;
    passed: boolean;
    completedAt: string;
  } | null;
  className?: string;
}

export function QuizPreview({
  moduleSlug,
  questions = [],
  passingGrade = 70,
  totalQuestions = 10,
  lastAttempt,
  className,
}: QuizPreviewProps) {
  const hasAttempted = !!lastAttempt;
  const sampleQuestion = questions[0];

  const canRetry = () => {
    if (!lastAttempt) return true;
    const lastAttemptTime = new Date(lastAttempt.completedAt).getTime();
    return Date.now() - lastAttemptTime >= 60 * 1000;
  };

  const getRetryRemainingSeconds = () => {
    if (!lastAttempt) return 0;
    const lastAttemptTime = new Date(lastAttempt.completedAt).getTime();
    const diff = Date.now() - lastAttemptTime;
    return Math.max(0, Math.ceil((60 * 1000 - diff) / 1000));
  };

  const [cooldown, setCooldown] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    setCooldown(getRetryRemainingSeconds());
  }, []);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      {/* ... (Header and Status) ... */}

      {/* Quiz Status / Last Attempt */}
      {hasAttempted ? (
        <div className="rounded-lg border bg-background p-5 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Percobaan Terakhir</span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full border",
              lastAttempt.passed 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}>
              {lastAttempt.passed ? "Lulus" : "Belum Lulus"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center p-3 bg-secondary/30 rounded-lg border">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Skor</p>
              <p className={cn(
                "text-2xl font-bold",
                lastAttempt.passed ? "text-emerald-600" : "text-rose-600"
              )}>{lastAttempt.score}%</p>
            </div>
            <div className="flex-1 text-center p-3 bg-secondary/30 rounded-lg border">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Target</p>
              <p className="text-2xl font-bold">{passingGrade}%</p>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-muted-foreground italic">
            Selesai pada {new Date(lastAttempt.completedAt).toLocaleString('id-ID', { 
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
      ) : (
        /* Quiz Preview Card (Static Preview) */
        sampleQuestion && (
          <div className="rounded-lg border bg-background p-5 mb-4">
            <div className="mb-2 text-xs text-muted-foreground">
              Pertanyaan 1 dari {totalQuestions}
            </div>
            <p className="mb-4 text-sm font-semibold">{sampleQuestion.questionText}</p>

            <div className="space-y-2">
              {Object.entries(sampleQuestion.options).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                >
                  <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-muted-foreground text-[10px] font-bold">
                    {key}
                  </div>
                  <span>{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* CTA Buttons */}
      {moduleSlug && (
        <div className="flex flex-col gap-2">
          {hasAttempted ? (
            <Button 
              className={cn(
                "w-full gap-2 font-bold shadow-md h-11",
                isMounted && cooldown > 0 ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
              )}
              onClick={() => (isMounted && cooldown <= 0) ? window.location.href = `/learning/${moduleSlug}/quiz` : null}
              disabled={isMounted && cooldown > 0}
            >
              {isMounted && cooldown > 0 ? (
                <>
                  <RefreshCcw className="size-4 animate-spin" />
                  Coba Lagi dalam {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCcw className="size-4" />
                  Coba Lagi
                </>
              )}
            </Button>
          ) : (
            <Link href={`/learning/${moduleSlug}/quiz`} className="block">
              <Button className="w-full gap-2 font-bold shadow-md h-11">
                Mulai Kerjakan Quiz
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Default sample quiz data for preview
export const SAMPLE_QUIZ_DATA = {
  question:
    "Manakah yang dianggap sebagai praktik terbaik untuk komunikasi async?",
  options: [
    { label: "A", text: "Mengharapkan balasan segera" },
    {
      label: "B",
      text: "Memberikan semua konteks yang diperlukan di awal",
      isCorrect: true,
    },
    { label: "C", text: "Mengirim pesan singkat tanpa detail" },
    { label: "D", text: "Menggunakan panggilan telepon untuk semuanya" },
  ],
};
