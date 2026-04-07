"use client"

import { Suspense, useActionState, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Globe2, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { forgotPasswordAction } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function ForgotPasswordForm() {
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
    if (state?.success) toast.success("Password reset link sent! Check your inbox.")
  }, [state])

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Globe2 className="size-5" />
        </div>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success && sentEmail ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Email sent
                  </p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    A password reset link has been sent to{" "}
                    <strong>{sentEmail}</strong>. Check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>
            <Link href="/login" className="block text-center text-sm text-primary underline-offset-4 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                defaultValue={searchParams.get("email") ?? ""}
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
              Back to login
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Globe2 className="size-5 animate-pulse" />
          </div>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}
