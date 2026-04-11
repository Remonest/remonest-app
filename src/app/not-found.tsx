"use client";

import Link from "next/link";
import { Compass, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, TranslationProvider } from "@/lib/translations";

function NotFoundContent() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[600px] mx-auto px-6 text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-8">
          <Compass className="w-10 h-10 text-primary" />
        </div>

        {/* Heading */}
        <h1 className="text-[96px] leading-none font-extrabold tracking-[-0.05em] text-foreground mb-3">
          404
        </h1>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {t.notFound.title}
        </h2>
        <p className="text-base text-muted-foreground mb-10 max-w-[480px] mx-auto">
          {t.notFound.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/" className="no-underline">
            <Button
              size="default"
              className="h-11 px-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Home className="w-4 h-4" />
              {t.notFound.returnDashboard ?? "Kembali ke Beranda"}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="default"
            className="h-11 px-8 gap-2 border-border text-foreground hover:bg-secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            {t.notFound.goBack ?? "Kembali"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <TranslationProvider>
      <NotFoundContent />
    </TranslationProvider>
  );
}
