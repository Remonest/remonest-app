"use client";

import { Suspense, useActionState, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  loginAction,
  googleSignInAction,
} from "@/features/auth/actions/login";
import { resendConfirmationAction } from "@/features/auth/actions/password";
import type { AuthResult } from "@/features/auth/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/lib/translations";

const initialState: AuthResult = { success: false };

// Simple plain background using theme color
function Background() {
  return <div className="fixed inset-0 bg-background" />;
}

function LoginFormInner() {
  const { t, language, setLanguage } = useTranslations();
  const [state, formAction, pending] = useActionState(
    async (_state: AuthResult, formData: FormData) => {
      return loginAction(formData);
    },
    initialState,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Auto-focus on first field
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Show toast based on state
  useEffect(() => {
    if (state?.error) {
      setInputError(state.error);
      toast.error(state.error, {
        icon: <AlertCircle className="size-4" />,
      });
      // Shake animation on error
      const card = document.getElementById("login-card");
      if (card) {
        card.classList.add("animate-shake");
        setTimeout(() => card.classList.remove("animate-shake"), 500);
      }
    }
    if (state?.success && state?.redirect) {
      toast.success("Login successful!", {
        icon: <CheckCircle2 className="size-4 text-green-500" />,
      });
      router.push(state.redirect);
    }
    if (state?.success && !state?.redirect) {
      toast.success("Login successful!", {
        icon: <CheckCircle2 className="size-4 text-green-500" />,
      });
      router.push("/dashboard");
    }
  }, [state, router, searchParams]);

  // Show confirmation toast for email verification flows
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "false") {
      toast.info(
        "Account created! Please check your email to confirm your account.",
        {
          icon: <Mail className="size-4" />,
        },
      );
    }
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error), {
        icon: <AlertCircle className="size-4" />,
      });
    }
  }, [searchParams]);

  const unconfirmedEmail = searchParams.get("unconfirmed");

  async function handleResendConfirmation() {
    setResending(true);
    const formData = new FormData();
    formData.set("email", unconfirmedEmail ?? "");
    const result = await resendConfirmationAction(formData);
    setResending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Confirmation email sent! Check your inbox.");
    }
  }

  return (
    <motion.div
      id="login-card"
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

        {/* Card content */}
        <div className="relative p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-5"
          >
            {/* Logo with animation */}
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

            {/* Welcome text with gradient */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
              {t.auth.login.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              {t.auth.login.description}
            </p>
          </motion.div>

          {/* Form */}
          <form action={formAction} className="space-y-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t.auth.login.email}
                </label>
                <Input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t.auth.login.emailPlaceholder}
                  autoComplete="email"
                  required
                  defaultValue={unconfirmedEmail ?? ""}
                  onChange={() => {
                    if (inputError) setInputError(null);
                  }}
                  className={`text-sm ${inputError ? "border-red-500" : ""}`}
                  aria-describedby={inputError ? "login-error" : undefined}
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    {t.auth.login.password}
                  </label>
                </div>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
              </div>
            </motion.div>

            {/* Forgot password link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex justify-end"
            >
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium relative group"
              >
                <span className="relative">
                  {t.auth.login.forgotPassword}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-base font-semibold relative overflow-hidden group"
                disabled={pending}
              >
                {/* Ripple effect container */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <AnimatePresence mode="wait">
                  {pending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 relative z-10"
                    >
                      <Loader2 className="size-5 animate-spin" />
                      <span>{t.auth.login.signingIn}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 relative z-10"
                    >
                      <Sparkles className="size-5" />
                      <span>{t.auth.login.signIn}</span>
                      <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>

          {/* Unconfirmed email warning */}
          <AnimatePresence>
            {unconfirmedEmail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 rounded-xl border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm p-4"
              >
                <div className="flex gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <Mail className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t.auth.login.emailNotConfirmed}
                    </p>
                    <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                      {t.auth.login.emailNotConfirmedDesc.replace(
                        "{email}",
                        unconfirmedEmail,
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resending}
                      className="mt-2 text-xs font-medium text-yellow-800 dark:text-yellow-200 underline-offset-4 hover:underline disabled:opacity-50 transition-all duration-300"
                    >
                      {resending ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="size-3 animate-spin" />
                          {t.auth.login.sending}
                        </span>
                      ) : (
                        t.auth.login.resendConfirmation
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="my-6 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.auth.login.orContinueWith}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </motion.div>

          {/* Google button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <form action={googleSignInAction}>
              <Button
                type="submit"
                variant="outline"
                className="w-full h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                {/* Google icon with hover animation */}
                <motion.svg
                  className="size-5 mr-3"
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
                  {t.auth.login.continueWithGoogle}
                </span>
              </Button>
            </form>
          </motion.div>

          {/* Sign up link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.auth.login.noAccount}{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 relative group inline-block"
              >
                <span className="relative">
                  {t.auth.login.signUp}
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

function LoginFormFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-md"
    >
      <div className="relative backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
          >
            <Globe2 className="size-8 text-white" />
          </motion.div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4">
      <Background />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginFormInner />
        </Suspense>
      </div>
    </div>
  );
}
