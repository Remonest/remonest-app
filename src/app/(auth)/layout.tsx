"use client";

import { TranslationProvider } from "@/lib/translations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      {children}
    </TranslationProvider>
  );
}
