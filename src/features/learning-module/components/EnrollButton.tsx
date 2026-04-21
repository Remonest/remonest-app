"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, PlayCircle, Loader2, ClipboardCheck } from "lucide-react";
import { completeModule, updateModuleProgress } from "@/features/learning-module/actions/enrollment";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EnrollButtonProps {
  moduleId: string;
  moduleTitle: string;
  moduleSlug?: string;
  progress: number;
  isCompleted: boolean;
  materialsCount: number;
  hasQuiz?: boolean;
}

export default function EnrollButton({
  moduleId,
  moduleTitle,
  moduleSlug,
  progress,
  isCompleted,
  materialsCount,
  hasQuiz,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [completed, setCompleted] = useState(isCompleted);

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeModule(moduleId);
      if (result.success) {
        setCompleted(true);
        setCurrentProgress(100);
        toast.success(`Modul "${moduleTitle}" berhasil diselesaikan! 🎉`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal menyelesaikan modul");
      }
    });
  };

  const handleStartReading = () => {
    // Mark as started (5% progress) if not yet in progress
    if (currentProgress === 0) {
      startTransition(async () => {
        const result = await updateModuleProgress(moduleId, 5);
        if (result.success) {
          setCurrentProgress(5);
          toast.success(`Mulai mempelajari "${moduleTitle}"`);
          router.refresh();
        }
      });
    }

    // Scroll to materials
    const materialsSection = document.querySelector('[data-materials]');
    if (materialsSection) {
      materialsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="size-4" />
          Modul selesai — Anda telah menyelesaikan modul ini
        </div>
        {moduleSlug && (
          <Link href={`/learning/${moduleSlug}/quiz`} className="w-full">
            <Button variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <ClipboardCheck className="size-4" />
              Lihat Hasil Quiz
            </Button>
          </Link>
        )}
      </div>
    );
  }

  if (currentProgress > 0) {
    return (
      <div className="flex flex-col gap-3">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentProgress}%
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartReading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <PlayCircle className="size-3.5" />
              Lanjutkan belajar
            </button>

            {hasQuiz && moduleSlug && (
              <Link href={`/learning/${moduleSlug}/quiz`} className="flex-1">
                <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  <ClipboardCheck className="size-3.5" />
                  Ambil Quiz
                </button>
              </Link>
            )}
          </div>

          {!hasQuiz && materialsCount > 0 && (
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Tandai selesai
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartReading}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Memuat...
        </>
      ) : (
        <>
          <PlayCircle className="size-4" />
          Mulai Belajar
        </>
      )}
    </button>
  );
}
