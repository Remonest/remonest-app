"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "en" | "id";

interface LanguageSwitcherProps {
  currentLanguage?: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitcher({
  currentLanguage = "en",
  onLanguageChange,
}: LanguageSwitcherProps) {
  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "id", label: "ID" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLanguage === lang.code ? "default" : "ghost"}
          size="sm"
          className="h-8 px-2.5 text-xs font-medium rounded-md"
          onClick={() => onLanguageChange(lang.code)}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}