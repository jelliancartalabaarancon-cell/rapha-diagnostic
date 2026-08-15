"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface FormState {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
}

const INITIAL_STATE: FormState = {
  fullName: "",
  age: "",
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
};

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          age: form.age,
          gender: form.gender,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          contactNumber: form.contactNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setIsSubmitting(false);

      if (signInResult?.error) {
        // Account created, but auto sign-in failed — send them to log in.
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </div>
      )}

      <Field label="Full Name" htmlFor="fullName">
        <Input
          id="fullName"
          required
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          placeholder="Juan Dela Cruz"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Age" htmlFor="age">
          <Input
            id="age"
            type="number"
            min={1}
            max={120}
            required
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            placeholder="29"
          />
        </Field>

        <Field label="Gender" htmlFor="gender">
          <Select
            id="gender"
            required
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </Select>
        </Field>
      </div>

      <Field label="Email Address" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Contact Number" htmlFor="contactNumber" optional>
        <Input
          id="contactNumber"
          type="tel"
          autoComplete="tel"
          value={form.contactNumber}
          onChange={(e) => update("contactNumber", e.target.value)}
          placeholder="0917 123 4567"
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          At least 8 characters, with an uppercase letter, lowercase letter, and number.
        </p>
      </Field>

      <Field label="Confirm Password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          "Creating account…"
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}
