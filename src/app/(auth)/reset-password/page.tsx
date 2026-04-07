"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Globe2, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { updatePasswordAction } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return updatePasswordAction(formData)
    },
    null
  )

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Globe2 className="size-5" />
        </div>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>
          Create a strong password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Reset password"
            )}
          </Button>

          <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
            Back to login
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
