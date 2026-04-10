"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe2,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { updatePasswordAction } from "@/features/auth/actions/password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/lib/translations"

// Simple plain background using theme color
function Background() {
  return (
    <div className="fixed inset-0 bg-background" />
  );
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const { language, setLanguage } = useTranslations()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return updatePasswordAction(formData)
    },
    null
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error, { icon: <AlertCircle className="size-4" /> })
    if (state?.success) {
      toast.success("Password updated successfully!", { icon: <CheckCircle2 className="size-4 text-green-500" /> })
      router.push("/login")
    }
  }, [state, router])

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4">
      <Background />
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          id="reset-card"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full"
        >
          {/* Card */}
          <div className="relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
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

            {/* Card content */}
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
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-50"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <KeyRound className="size-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
                  Set new password
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                  Create a strong password for your account.
                </p>
              </motion.div>

              {/* Form */}
              <form action={formAction} className="space-y-4">
                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      New password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        className="text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={showPassword ? "eye-off" : "eye"}
                            initial={{ opacity: 0, rotate: -90, scale: 0 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Confirm password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        className="text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={showConfirm ? "eye-off" : "eye"}
                            initial={{ opacity: 0, rotate: -90, scale: 0 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                  transition={{ delay: 0.5, duration: 0.5 }}
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
                          <span>Updating…</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="submit"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 relative z-10"
                        >
                          <KeyRound className="size-4" />
                          <span>Reset password</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>

                {/* Back to login */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    <ArrowLeft className="size-4" />
                    Back to login
                  </Link>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
