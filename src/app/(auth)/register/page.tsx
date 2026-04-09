"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe2, Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { registerAction, googleSignInAction } from "@/lib/auth/actions";
import type { AuthResult } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTranslations } from "@/lib/translations";

// --- Password strength logic ---

interface StrengthResult {
  score: number; // 0–4
  checks: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
  };
}

function evaluatePassword(pw: string): StrengthResult {
  const checks = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

const STRENGTH_LABELS: Record<number, { text: string; color: string }> = {
  0: { text: "Very weak", color: "bg-destructive" },
  1: { text: "Weak", color: "bg-destructive" },
  2: { text: "Fair", color: "bg-yellow-500" },
  3: { text: "Good", color: "bg-blue-500" },
  4: { text: "Strong", color: "bg-green-500" },
};

function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslations();
  if (!password) return null;

  const { score, checks } = evaluatePassword(password);
  const { text, color } = STRENGTH_LABELS[score] ?? STRENGTH_LABELS[0];

  return (
    <div className="flex flex-col gap-2">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{text}</p>

      {/* Requirement checklist */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {[
          { key: "length" as const, label: t.auth.register.requirements.length },
          { key: "lower" as const, label: t.auth.register.requirements.lower },
          { key: "upper" as const, label: t.auth.register.requirements.upper },
          { key: "number" as const, label: t.auth.register.requirements.number },
        ].map(({ key, label }) => (
          <li
            key={key}
            className={`flex items-center gap-1 ${
              checks[key]
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {checks[key] ? (
              <Check className="size-3" />
            ) : (
              <X className="size-3" />
            )}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Form ---

const initialState: AuthResult = { success: false };

function RegisterForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_state: AuthResult, formData: FormData) => {
      return registerAction(formData);
    },
    initialState,
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [workType, setWorkType] = useState("");

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
    if (state?.success && !state?.redirect) {
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Globe2 className="size-5" />
        </div>
        <CardTitle>{t.auth.register.title}</CardTitle>
        <CardDescription>{t.auth.register.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t.auth.register.fullName}
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t.auth.register.namePlaceholder}
              autoComplete="name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t.auth.register.email}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.auth.register.emailPlaceholder}
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t.auth.register.workTypeLabel}</label>
            <input type="hidden" name="workType" value={workType} />
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger>
                <SelectValue placeholder={t.auth.register.workTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">
                  {t.auth.register.client}
                </SelectItem>
                <SelectItem value="user">
                  {t.auth.register.freelancer}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t.auth.register.password}
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t.auth.register.confirmPassword}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t.auth.register.creatingAccount}
              </>
            ) : (
              t.auth.register.createAccount
            )}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={googleSignInAction}>
          <Button type="submit" variant="outline" className="w-full">
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t.auth.register.continueWithGoogle}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t.auth.register.hasAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.auth.register.signIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}
