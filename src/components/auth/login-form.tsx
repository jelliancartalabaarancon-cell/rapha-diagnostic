"use client";

import { FormEvent, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      /*
       * Login failed.
       */
      if (!result || result.error) {
        setIsSubmitting(false);

        /*
         * NextAuth may return "CredentialsSignin"
         * when authorize() rejects the credentials.
         *
         * We check the actual account status separately
         * so we can show the correct message to the patient.
         */
        try {
          const response = await fetch("/api/auth/account-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
            }),
          });

          const data = await response.json();

          if (data?.isActive === false) {
            setError(
              "Your account has been deactivated. Please contact an administrator to reactivate your account.",
            );
            return;
          }
        } catch {
          // Ignore account-status lookup errors.
        }

        setError("Incorrect email or password. Please try again.");
        return;
      }

      /*
       * Get the newly created session so we know
       * the user's role.
       */
      const session = await getSession();

      if (!session?.user) {
        setIsSubmitting(false);
        setError("Unable to load your account. Please try again.");
        return;
      }

      let destination = "/dashboard";

      /*
       * If the login was triggered by a protected page,
       * allow the callback URL to be used.
       */
      if (callbackUrl) {
        destination = callbackUrl;
      } else {
        /*
         * Otherwise send the user to the correct area
         * based on their account role.
         */
        switch (session.user.role) {
          case "ADMIN":
            destination = "/admin";
            break;

          case "STAFF":
            destination = "/staff";
            break;

          case "PATIENT":
          default:
            destination = "/dashboard";
            break;
        }
      }

      setIsSubmitting(false);

      router.push(destination);
      router.refresh();
    } catch {
      setIsSubmitting(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </div>
      )}

      <Field label="Email Address" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pr-11"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Signing in…"
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Log In
          </>
        )}
      </Button>

      <p className="rounded-xl bg-clinical-50/60 px-4 py-3 text-center text-xs text-clinical-700">
        Demo account —{" "}
        <span className="font-mono">demo@rapha.health</span> /{" "}
        <span className="font-mono">Patient123!</span>
      </p>
    </form>
  );
}