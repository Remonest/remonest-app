"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Loader2,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { registerAction } from "@/features/auth/actions/register";
import { googleSignInAction } from "@/features/auth/actions/login";
import type { AuthResult } from "@/features/auth/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/lib/translations";

// Simple plain background using theme color
function Background() {
  return <div className="fixed inset-0 bg-background" />;
}

// --- Password strength logic ---

interface StrengthResult {
  score: number;
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
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {[
          {
            key: "length" as const,
            label: t.auth.register.requirements.length,
          },
          { key: "lower" as const, label: t.auth.register.requirements.lower },
          { key: "upper" as const, label: t.auth.register.requirements.upper },
          {
            key: "number" as const,
            label: t.auth.register.requirements.number,
          },
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

const initialState: AuthResult = { success: false };

function RegisterFormInner() {
  const { t, language, setLanguage } = useTranslations();
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
      toast.error(state.error, { icon: <AlertCircle className="size-4" /> });
      const card = document.getElementById("register-card");
      if (card) {
        card.classList.add("animate-shake");
        setTimeout(() => card.classList.remove("animate-shake"), 500);
      }
    }
    if (state?.success && state?.redirect) {
      toast.success("Account created!", {
        icon: <CheckCircle2 className="size-4 text-green-500" />,
      });
      router.push(state.redirect);
    }
    if (state?.success && !state?.redirect) {
      toast.success("Account created!", {
        icon: <CheckCircle2 className="size-4 text-green-500" />,
      });
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <motion.div
      id="register-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full max-w-md"
    >
      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Language switcher - inside card, top-right */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
          {(["en", "id"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-300 ${
                language === lang
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label={`Switch to ${lang === "en" ? "English" : "Bahasa Indonesia"}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-5"
          >
            <motion.div
              className="mb-3 flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Globe2 className="size-6 text-white" />
                </div>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
              {t.auth.register.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              {t.auth.register.description}
            </p>
          </motion.div>

          {/* Form */}
          <form action={formAction} className="space-y-3.5">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  {t.auth.register.fullName}
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t.auth.register.namePlaceholder}
                  autoComplete="name"
                  required
                  className="text-sm"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t.auth.register.email}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t.auth.register.emailPlaceholder}
                  autoComplete="email"
                  required
                  className="text-sm"
                />
              </div>
            </motion.div>

            {/* Work Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  {t.auth.register.workTypeLabel}
                </label>
                <input type="hidden" name="workType" value={workType} />
                <Select value={workType} onValueChange={setWorkType}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t.auth.register.workTypePlaceholder}
                    />
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
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
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
                    className="text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showPassword ? "eye-off" : "eye"}
                        initial={{ opacity: 0, rotate: -90, scale: 0 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  {t.auth.register.confirmPassword}
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showConfirmPassword ? "eye-off" : "eye"}
                        initial={{ opacity: 0, rotate: -90, scale: 0 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full h-10 rounded-md text-sm font-medium relative overflow-hidden group"
                disabled={pending}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <AnimatePresence mode="wait">
                  {pending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 relative z-10"
                    >
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t.auth.register.creatingAccount}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 relative z-10"
                    >
                      <Sparkles className="size-4" />
                      <span>{t.auth.register.createAccount}</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="my-4 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              or continue with
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </motion.div>

          {/* Google */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <form action={googleSignInAction}>
              <Button
                type="submit"
                variant="outline"
                className="w-full h-10 rounded-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <motion.svg
                  className="size-4 mr-2"
                  viewBox="0 0 24 24"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
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
                </motion.svg>
                <span className="font-medium">
                  {t.auth.register.continueWithGoogle}
                </span>
              </Button>
            </form>
          </motion.div>

          {/* Sign in link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.auth.register.hasAccount}{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 relative group inline-block"
              >
                <span className="relative">
                  {t.auth.register.signIn}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4">
      <Background />
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <RegisterFormInner />
        </motion.div>
      </div>
    </div>
  );
}
