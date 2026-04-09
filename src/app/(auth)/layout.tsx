"use client";

import { TranslationProvider, useTranslations } from "@/lib/translations";
import { LanguageSwitcher } from "@/components/landing/language-switcher";

function LanguageSwitcherWrapper() {
  const { language, setLanguage } = useTranslations();
  return <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="relative w-full max-w-md">
          {/* Language switcher */}
          <div className="absolute -top-12 right-0">
            <LanguageSwitcherWrapper />
          </div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </TranslationProvider>
  );
}
