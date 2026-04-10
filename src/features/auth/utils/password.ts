import type { StrengthResult } from "@/features/auth/types/auth";

// ============================================================
// Password Strength Evaluation
// ============================================================

export function evaluatePassword(pw: string): StrengthResult {
  const checks = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

export const STRENGTH_LABELS: Record<number, { text: string; color: string }> = {
  0: { text: "Very weak", color: "bg-destructive" },
  1: { text: "Weak", color: "bg-destructive" },
  2: { text: "Fair", color: "bg-yellow-500" },
  3: { text: "Good", color: "bg-blue-500" },
  4: { text: "Strong", color: "bg-green-500" },
};
