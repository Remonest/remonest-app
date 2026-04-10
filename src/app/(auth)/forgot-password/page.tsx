"use client"

import { Suspense, useActionState, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe2,
  Loader2,
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { forgotPasswordAction } from "@/features/auth/actions/password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/lib/translations"

// Simple plain background using theme color
function Background() {
  return (
    <div className="fixed inset-0 bg-background" />
  );
}

function ForgotPasswordForm() {
  const { t, language, setLanguage } = useTranslations()
  const searchParams = useSearchParams()
  const [sentEmail, setSentEmail] = useState("")

  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      const email = formData.get("email") as string
      const result = await forgotPasswordAction(formData)
      if (result.success) setSentEmail(email)
      return result
    },
    null
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success("Password reset link sent! Check your inbox.", {
      icon: <CheckCircle2 className="size-4 text-green-500" />,
    })
  }, [state])

  return (
    <motion.div
      id="forgot-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full max-w-md"
    >
      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Card content */}
        <div className="relative p-6">
          {/* Language switcher */}
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
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  {state?.success ? (
                    <CheckCircle2 className="size-6 text-white" />
                  ) : (
                    <Mail className="size-6 text-white" />
                  )}
                </div>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
              {state?.success ? t.auth.forgot.successTitle : t.auth.forgot.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              {state?.success
                ? `${t.auth.forgot.successDesc} ${sentEmail}`
                : t.auth.forgot.description}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {state?.success && sentEmail ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                        {t.auth.forgot.emailSent}
                      </p>
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                        {t.auth.forgot.emailSentDesc}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/login" className="no-underline">
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-xl gap-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                  >
                    <ArrowLeft className="size-4" />
                    {t.auth.forgot.backToLogin}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                action={formAction}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t.auth.forgot.emailLabel}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t.auth.forgot.emailPlaceholder}
                      autoComplete="email"
                      required
                      defaultValue={searchParams.get("email") ?? ""}
                      className="text-sm"
                    />
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-10 rounded-md text-sm font-semibold relative overflow-hidden group"
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
                          className="flex items-center gap-2 relative z-10"
                        >
                          <Loader2 className="size-4 animate-spin" />
                          <span>{t.auth.forgot.sending}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="submit"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 relative z-10"
                        >
                          <Send className="size-4" />
                          <span>{t.auth.forgot.sendResetLink}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>

                {/* Back to login */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    <ArrowLeft className="size-4" />
                    {t.auth.forgot.backToLogin}
                  </Link>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function ForgotPasswordFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-md"
    >
      <div className="relative bg-card rounded-3xl shadow-xl border border-border p-8">
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

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4">
      <Background />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<ForgotPasswordFallback />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
