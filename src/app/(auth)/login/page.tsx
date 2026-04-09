"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Globe2, Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginAction, googleSignInAction, resendConfirmationAction } from "@/lib/auth/actions";
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
import { useTranslations } from "@/lib/translations";

const initialState: AuthResult = { success: false };

function LoginFormInner() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState(
    async (_state: AuthResult, formData: FormData) => {
      return loginAction(formData);
    },
    initialState
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show toast based on state
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
  }, [state, router, searchParams]);

  // Show confirmation toast for email verification flows
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "false") {
      toast.info("Account created! Please check your email to confirm your account.");
    }
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
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
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Globe2 className="size-5" />
        </div>
        <CardTitle>{t.auth.login.title}</CardTitle>
        <CardDescription>{t.auth.login.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t.auth.login.email}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.auth.login.emailPlaceholder}
              autoComplete="email"
              required
              defaultValue={unconfirmedEmail ?? ""}
              aria-describedby={state?.error ? "login-error" : undefined}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                {t.auth.login.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {t.auth.login.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full p-5 cursor-pointer" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t.auth.login.signingIn}
              </>
            ) : (
              t.auth.login.signIn
            )}
          </Button>
        </form>

        {unconfirmedEmail && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/50 dark:bg-yellow-900/20">
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t.auth.login.emailNotConfirmed}
                </p>
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                  {t.auth.login.emailNotConfirmedDesc.replace("{email}", unconfirmedEmail)}
                </p>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="mt-2 text-xs font-medium text-yellow-800 underline-offset-4 hover:underline disabled:opacity-50 dark:text-yellow-200"
                >
                  {resending ? t.auth.login.sending : t.auth.login.resendConfirmation}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={googleSignInAction}>
          <Button type="submit" variant="outline" className="w-full p-5 cursor-pointer">
            {/* Google icon */}
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
            {t.auth.login.continueWithGoogle}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground cursor-pointer">
          {t.auth.login.noAccount}{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.auth.login.signUp}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function LoginFormFallback() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Globe2 className="size-5 animate-pulse" />
        </div>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Loading…</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormInner />
    </Suspense>
  );
}
