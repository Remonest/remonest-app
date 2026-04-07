"use client";

import { useEffect } from "react";
import { useTranslations } from "@/lib/translations";

export function LanguageHandler() {
  const { language } = useTranslations();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
