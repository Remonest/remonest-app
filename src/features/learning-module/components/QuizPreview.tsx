"use client";

import { CheckCircle2, ClipboardCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuizPreviewProps {
  moduleSlug?: string;
  question?: string;
  options?: { label: string; text: string; isCorrect?: boolean }[];
  selectedOption?: string;
  passingGrade?: number;
  totalQuestions?: number;
  className?: string;
}

export function QuizPreview({
  moduleSlug,
  question,
  options = [],
  selectedOption,
  passingGrade = 70,
  totalQuestions = 10,
  className,
}: QuizPreviewProps) {
  if (!question || options.length === 0) return null;

  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Penilaian Interaktif</h3>
          <p className="text-sm text-muted-foreground">
            Uji pemahaman Anda dengan skenario praktis dan dapatkan skor lulus{" "}
            {passingGrade}% untuk menyelesaikan modul.
          </p>
        </div>
      </div>

      {/* Quiz Preview Card */}
      <div className="rounded-lg border bg-background p-5 mb-4">
        <div className="mb-2 text-xs text-muted-foreground">
          Pertanyaan 2 dari {totalQuestions}
        </div>
        <p className="mb-4 text-sm font-semibold">{question}</p>

        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.label}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                selectedOption === option.label &&
                  "border-primary bg-secondary"
              )}
            >
              <div
                className={cn(
                  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                  selectedOption === option.label
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {selectedOption === option.label && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span>{option.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      {moduleSlug && (
        <Link href={`/learning/${moduleSlug}/quiz`} className="block">
          <Button className="w-full gap-2 font-bold shadow-md">
            Mulai Kerjakan Quiz
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      )}

      {/* Footer info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span>
          Setiap pertanyaan didasarkan pada studi kasus dunia nyata
        </span>
      </div>
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
